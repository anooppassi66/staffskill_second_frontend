"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import CustomVideoPlayer from '@/app/components/CustomVideoPlayer';
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ENDPOINTS, MEDIA } from "@/Api";
import HtmlContent from "@/app/components/ui/HtmlContent";
import { toast } from "react-toastify";

type LessonItem = {
  id: string;
  title: string;
  url: string;
  isComplete: boolean;
  chapterId: string;
  duration?: string;
  description?: string;
  thumb?: string;
};

type Section = {
  title: string;
  chapterId: string;
  lessons: LessonItem[];
};

const LessonPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = (params?.id as string) || '';
  const user = useSelector((s: RootState) => s.user);

  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const progressPercent = useMemo(() => {
    const total = sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const done = sections.reduce((acc, s) => acc + s.lessons.filter(l => l.isComplete).length, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [sections]);

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      setError('');
      try {
        // Fetch course with per-lesson completed flags
        const res = await fetch(ENDPOINTS.COURSES.PUBLIC_GET(courseId), {
          headers: {
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to load course');
        }
        const data = await res.json().catch(() => ({}));
        const course = data?.course || {};
        const mappedSections: Section[] = (course?.chapters || []).map((ch: any) => ({
          title: ch?.title || '',
          chapterId: ch?._id || '',
          lessons: (ch?.lessons || []).map((ls: any) => ({
            id: ls?._id || '',
            title: ls?.name || '',
            url: ls?.video_url ? MEDIA.url(ls.video_url) : '',
            isComplete: !!ls?.completed,
            chapterId: ch?._id || '',
            description: ls?.description || '',
            thumb: ls?.thumbnail_url ? MEDIA.url(ls.thumbnail_url) : '',
          })),
        }));
        setSections(mappedSections);
        setExpandedSections(mappedSections.map((_, idx) => idx)); // expand all

        // Determine next lesson via resume endpoint
        const r = await fetch(ENDPOINTS.ENROLLMENTS.RESUME(courseId), {
          headers: {
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });
        const d = await r.json().catch(() => ({}));
        const next = d?.next || null;
        if (next && next.lesson) {
          const lessonId = next.lesson._id || next.lessonId;
          const chapterId = next.chapterId || (next.lesson?.chapterId);
          // set active to that lesson
          const found = mappedSections.flatMap((s) => s.lessons).find((l) => l.id === lessonId);
          if (found) setActiveLesson(found);
          else setActiveLesson(mappedSections[0]?.lessons?.[0] || null);
        } else {
          // fallback to first incomplete or first lesson
          const firstIncomplete = mappedSections.flatMap(s => s.lessons).find(l => !l.isComplete);
          setActiveLesson(firstIncomplete || (mappedSections[0]?.lessons?.[0] || null));
        }
      } catch (e: any) {
        setError(e.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, user.token]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleLessonChange = (newLesson: LessonItem) => {
    setActiveLesson(newLesson);
    setPlayerReady(false);
    setIsPlaying(true);
  };

  const markLessonComplete = async (lesson: LessonItem) => {
    let tId: any;
    try {
      tId = toast.loading('Marking complete...');
      const res = await fetch(ENDPOINTS.ENROLLMENTS.COMPLETE_LESSON(courseId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ chapterId: lesson.chapterId, lessonId: lesson.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to mark complete');
      }
      toast.update(tId, { render: 'Marked complete', type: 'success', isLoading: false, autoClose: 1200 });
      // update local state
      setSections(prev => prev.map(s => ({
        ...s,
        lessons: s.lessons.map(l => l.id === lesson.id ? { ...l, isComplete: true } : l),
      })));
      // load next lesson
      const r = await fetch(ENDPOINTS.ENROLLMENTS.RESUME(courseId), {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      const d = await r.json().catch(() => ({}));
      const next = d?.next || null;
      if (next && next.lesson) {
        const nextId = next.lesson._id || next.lessonId;
        const found = sections.flatMap(s => s.lessons).find(l => l.id === nextId);
        if (found) setActiveLesson(found);
      } else {
        toast.success(d?.message || 'All lessons completed');
        try {
          const qs = new URLSearchParams();
          qs.set('limit', '1');
          qs.set('course', courseId);
          const resQuiz = await fetch(ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`, {
            headers: {
              ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
            },
          });
          const qData = await resQuiz.json().catch(() => ({}));
          const list = Array.isArray(qData.quizzes) ? qData.quizzes : Array.isArray(qData.items) ? qData.items : [];
          const target = list[0];
          const quizId = target?._id || target?.id;
          if (quizId) {
            router.push(`/quiz/${quizId}`);
          } else {
            toast.error('Quiz not available for this course')
          }
        } catch {}
      }
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const handleVideoEnd = () => {
    if (!activeLesson) return;
    setIsPlaying(false);
    markLessonComplete(activeLesson);
  };

  const handleReady = () => {
    setPlayerReady(true);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const backHref = `/enrolled-courses/${courseId}`;

  return (
    <DashboardLayout>
      <div className="container-fluid lesson-page p-0">
        <div className="row g-0">
          <div className="col-lg-3 sidebar-column">
            <div className="sidebar-header p-3 border-bottom">
              <Link href={backHref} className="text-decoration-none back-link fw-normal">
                <ArrowLeft size={16} className="me-2" /> Back to Course
              </Link>
            </div>
            <div className="p-3">
              <h5 className="sidebar-title fw-normal">{activeLesson?.title || 'Lesson'}</h5>
              <p className="small text-muted mb-2">{progressPercent}% Complete</p>
              <div className="progress mb-4 course-progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progressPercent}%`, backgroundColor: "#4CAF50" }}
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>

              <div className="curriculum-accordion">
                {sections.map((section, sectionIndex) => (
                  <div key={section.chapterId || sectionIndex} className="section-item mb-2">
                    <div
                      className="section-header p-3 d-flex justify-content-between align-items-center cursor-pointer fw-normal"
                      onClick={() => toggleSection(sectionIndex)}
                    >
                      {section.title}
                      {expandedSections.includes(sectionIndex) ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </div>
                    {expandedSections.includes(sectionIndex) && (
                      <ul className="list-unstyled lessons-list">
                        {section.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className={`lesson-item d-flex justify-content-between align-items-center p-3 ${lesson.id === activeLesson?.id ? 'active-lesson' : ''}`}
                            onClick={() => handleLessonChange(lesson)}
                          >
                            <div className="d-flex align-items-center">
                              {lesson.isComplete ? (
                                <Check size={18} className="text-success me-2" />
                              ) : (
                                <div className="bullet-point me-2"></div>
                              )}
                              <span className="lesson-title small">{lesson.title}</span>
                            </div>
                            <span className="text-muted small lesson-duration">{lesson.duration || ''}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-9 content-column p-4">
            <div className="video-player-wrapper mb-4 rounded overflow-hidden shadow-lg">
              <CustomVideoPlayer
                url={activeLesson?.url || ''}
                playing={isPlaying}
                onReady={handleReady}
                onEnded={handleVideoEnd}
                onPlay={handlePlay}
                controls={true}
                hideDownload={true}
                poster={activeLesson?.thumb || ''}
                resume={progressPercent > 0}
              />

              {playerReady ? (
                <p className="mt-2 text-success small">Player is ready. Enjoy the lesson!</p>
              ) : (
                <p className="mt-2 text-muted small">Loading Player...</p>
              )}
              {error && <p className="mt-2 text-danger small">{error}</p>}
            </div>

            <div className="lesson-details">
              <h1 className="fw-normal mb-3">{activeLesson?.title || 'Lesson'}</h1>
              <p className="text-muted small mb-4">Progress {progressPercent}%</p>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <HtmlContent className="text-muted" html={activeLesson?.description || ''} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPage;
