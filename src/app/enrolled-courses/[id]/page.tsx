"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Users, BookOpen, Clock, BarChart } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import EmptyState from "@/app/components/ui/EmptyState";
import MainLoader from "@/app/components/MainLoader";
import HtmlContent from "@/app/components/ui/HtmlContent";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ENDPOINTS, MEDIA } from "@/Api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";

// Assuming you have a layout component for wrapping the main content area
// import Layout from "./components/Layout";

// Data structures to fill the components
const defaultFeatures = [
  "Enrolled: -",
  "Duration: -",
  "Chapters: -",
  "Video: -",
  "Level: -",
];

const CoursePage: React.FC = () => {
    const params = useParams();
    const id = (params?.id as string) || '';
    const router = useRouter();
    const user = useSelector((s: RootState) => s.user);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
      const run = async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
          const res = await fetch(ENDPOINTS.COURSES.PUBLIC_GET(id), {
            headers: {
              ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
            },
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to load course');
          }
          const d = await res.json().catch(() => ({}));
          setData(d);
        } catch (e: any) {
          setError(e.message || 'Unexpected error');
        } finally {
          setLoading(false);
        }
      };
      run();
    }, [id, user.token]);

    const features = (() => {
      const course = data?.course || null;
      if (!course) return defaultFeatures;
      const chaptersCount = (course.chapters || []).length;
      const lessons = (course.chapters || []).flatMap((c: any) => c.lessons || []);
      const videosCount = lessons.filter((l: any) => !!l?.video_url).length;
      const level = course.level || '-';
      const enrolledCount = typeof course.enrolledCount === 'number' ? course.enrolledCount : 0;
      const durationMin = typeof course.videoDurationMinutes === 'number' ? course.videoDurationMinutes : 0;
      return [
        `Enrolled: ${enrolledCount}`,
        `Duration: ${durationMin} Minutes`,
        `Chapters: ${chaptersCount}`,
        `Videos: ${videosCount}`,
        `Level: ${level}`,
      ];
    })();

    const chapters = (data?.course?.chapters || []).map((c: any) => ({
      title: c?.name || c?.title || '',
      lessons: (c?.lessons || []).map((l: any) => ({
        title: l?.name || l?.title || '',
        duration: l?.duration || '',
        id: l?._id || l?.id || undefined,
      })),
    }));
    const lecturesCount = chapters.reduce((acc: number, ch: any) => acc + (ch.lessons?.length || 0), 0);

    const heroThumb = (() => {
      const course = data?.course || null;
      if (!course) return '';
      if (course.course_image) return MEDIA.url(course.course_image);
      if (course.thumbnail_url) return MEDIA.url(course.thumbnail_url);
      for (const ch of (course.chapters || [])) {
        for (const ls of (ch.lessons || [])) {
          if (ls.thumbnail_url) return MEDIA.url(ls.thumbnail_url);
        }
      }
      return '';
    })();

    const enroll = async () => {
      if (!id) return;
      let tId: any;
      try {
        tId = toast.loading('Enrolling...');
        const res = await fetch(ENDPOINTS.ENROLLMENTS.ENROLL(id), {
          method: 'POST',
          headers: {
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to enroll');
        }
        toast.update(tId, { render: 'Enrolled', type: 'success', isLoading: false, autoClose: 1500 });
        router.push(`/enrolled-courses/${id}/lesson`);
      } catch (e: any) {
        if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 });
      }
    };

    const resume = async () => {
      if (!id) return;
      let tId: any;
      try {
        tId = toast.loading('Loading next lesson...');
        const res = await fetch(ENDPOINTS.ENROLLMENTS.RESUME(id), {
          headers: {
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to resume');
        }
        const d = await res.json().catch(() => ({}));
        const nextTitle = d?.next?.lesson?.name || d?.next?.lesson?.title || null;
        toast.update(tId, { render: nextTitle ? `Next: ${nextTitle}` : (d?.message || 'All lessons completed'), type: 'success', isLoading: false, autoClose: 1200 });
        router.push(`/enrolled-courses/${id}/lesson`);
      } catch (e: any) {
        if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 });
      }
    };

    return (
        <DashboardLayout>
            <div className="container my-5 course-page">
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {loading && <MainLoader />}
                {!loading && !error && !data?.course && (
                  <EmptyState title="Course not found" subtitle="This course is unavailable or has been removed." />
                )}
                <div className="row">
                    {/* --- LEFT COLUMN: Main Content (8/12) --- */}
                    <div className="col-lg-8">
                        {/* Title */}
                        <div className="mb-2">
                          <h3 className="fw-normal mb-1">{data?.course?.title || 'Course'}</h3>
                        </div>
                        {/* Header Image */}
                        <div className="mb-4 position-relative course-header-image-wrapper">
                            <Image
                                src={heroThumb || "/assets/default.png"}
                                alt="Course Hero Image"
                                width={800}
                                height={450}
                                className="img-fluid rounded-lg course-header-image"
                                style={{ objectFit: "cover", width: "100%", maxHeight: "300px" }}
                                unoptimized
                            />
                        </div>

                        {/* Overview Section */}
                        <div className="course-section mb-5">
                            <h4 className="fw-normal mb-3 section-title">Overview</h4>
                            <h6 className="fw-normal">Course Description</h6>
                            <HtmlContent className="text-muted course-description-text" html={data?.course?.description || 'Course description unavailable.'} />
                        </div>

                        <hr className="my-4" />

                        {/* Course Content Section */}
                        <div className="course-section mb-5">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-normal section-title">Course Content</h4>
                                <p className="text-muted mb-0 small">{lecturesCount} Lectures</p>
                            </div>

                            {/* Accordion Items */}
                            <div className="accordion" id="courseContentAccordion">
                                {chapters.length === 0 ? (
                                  <p className="text-muted small">No chapters available.</p>
                                ) : (
                                  chapters.map((ch: any, index: number) => (
                                    <div key={index} className="accordion-item course-accordion-item">
                                        <h2 className="accordion-header" id={`heading${index}`}>
                                            <button
                                                className={`accordion-button collapsed fw-normal`}
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#collapse${index}`}
                                                aria-expanded="false"
                                                aria-controls={`collapse${index}`}
                                            >
                                                {ch.title || `Chapter ${index + 1}`}
                                            </button>
                                        </h2>
                                        <div
                                            id={`collapse${index}`}
                                            className="accordion-collapse collapse"
                                            aria-labelledby={`heading${index}`}
                                            data-bs-parent="#courseContentAccordion"
                                        >
                                            <div className="accordion-body text-muted small">
                                                {ch.lessons && ch.lessons.length > 0 ? (
                                                  ch.lessons.map((ls: any, i: number) => (
                                                    <div key={ls.id || i} className="d-flex flex-column gap-1 py-1">
                                                      <div className="d-flex align-items-center justify-content-between">
                                                        <div>Lesson {i + 1}: {ls.title} {ls.duration ? `(${ls.duration})` : ''}</div>
                                                        <div className="d-flex gap-2">
                                                          {ls.thumbnail_url ? <a className="btn btn-sm btn-outline-secondary" href={MEDIA.url(ls.thumbnail_url)} target="_blank" rel="noreferrer">Image</a> : null}
                                                          {ls.video_url ? <a className="btn btn-sm btn-outline-secondary" href={MEDIA.url(ls.video_url)} target="_blank" rel="noreferrer">Video</a> : null}
                                                        </div>
                                                      </div>
                                                      {ls.thumbnail_url && (
                                                        <div>
                                                          <img
                                                            src={MEDIA.url(ls.thumbnail_url)}
                                                            alt="lesson thumbnail"
                                                            style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 4 }}
                                                          />
                                                        </div>
                                                      )}
                                                      {ls.video_url && (
                                                        <div>
                                                          <video
                                                            src={MEDIA.url(ls.video_url)}
                                                            style={{ width: 160, maxHeight: 90 }}
                                                            muted
                                                            controls={false}
                                                          />
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))
                                                ) : (
                                                  <p className="text-muted">No lessons in this chapter.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                  ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: Sidebar (4/12) --- */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 sticky-sidebar">
                            <div className="card-body">
                                <h6 className="fw-normal mb-3 section-title">Course Features</h6>

                                <ul className="list-unstyled includes-list small text-muted">
                                    {/* Icons are not present in the new screenshot for these items, so removed */}
                                    <li className="mb-2"><Users size={16} className="text-muted me-2" />{features[0]}</li>
                                    <li className="mb-2"><Clock size={16} className="text-muted me-2" /> {features[1]}</li>
                                    <li className="mb-2"><BookOpen size={16} className="text-muted me-2" /> {features[2]}</li>
                                    <li className="mb-2"><Clock size={16} className="text-muted me-2" /> {features[3]}</li>
                                    <li className="mb-2"><BarChart size={16} className="text-muted me-2" /> {features[4]}</li>
                                </ul>

                                <div className="d-grid gap-2 mt-4">
                                    <button className="custom-btn enroll-now-btn" onClick={data?.enrollment ? resume : enroll}>
                                        {data?.enrollment ? 'Resume' : 'Enroll Now'}
                                    </button>
                                    {data?.enrollment?.readyForQuiz && (
                                      <button
                                        className="custom-btn enroll-now-btn"
                                        onClick={async () => {
                                          try {
                                            const qs = new URLSearchParams()
                                            qs.set('limit', '1')
                                            qs.set('course', id || '')
                                            const res = await fetch(ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`, {
                                              headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) }
                                            })
                                            const d = await res.json().catch(() => ({}))
                                            const list = Array.isArray(d.quizzes) ? d.quizzes : Array.isArray(d.items) ? d.items : []
                                            const target = list[0]
                                            const quizId = target?._id || target?.id
                                            if (quizId) {
                                              router.push(`/quiz/${quizId}`)
                                            } else {
                                              toast.error('Quiz not available for this course')
                                            }
                                          } catch {
                                            toast.error('Failed to load quiz')
                                          }
                                        }}
                                      >
                                        Take Quiz
                                      </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CoursePage;
