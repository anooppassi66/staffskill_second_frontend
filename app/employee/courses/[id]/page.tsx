"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { VideoPlayer } from "@/components/video-player"
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle2, Lock } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ENDPOINTS, apiFetch, MEDIA } from "@/lib/api"

type Chapter = { title: string; _id: string; lessons: Array<any> }
type Lesson = { _id: string; name: string; video_url?: string; thumbnail_url?: string; description?: string; duration?: number; completed?: boolean }

export default function CourseDetailPage() {
  const params = useParams()
  const { token } = useAuth()
  const courseId = params.id as string

  const [course, setCourse] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [currentLesson, setCurrentLesson] = useState<{ chapter: Chapter; lesson: Lesson } | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.COURSES.PUBLIC_GET(courseId), { token })
        const c = data.course || data
        setCourse(c)
        if (token) {
          const p = await apiFetch(ENDPOINTS.ENROLLMENTS.PROGRESS(courseId), { token })
          setProgress(p.enrollment || p)
        }
      } catch (e: any) {
        setError(e.message || "Failed to load course")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, token])

  const totalLessons = useMemo(() => {
    return (course?.chapters || []).reduce((sum: number, ch: any) => sum + (ch.lessons || []).length, 0)
  }, [course])
  const completedLessons = useMemo(() => {
    const list = progress?.completedLessons || []
    return list.length || 0
  }, [progress])
  const percentComplete = useMemo(() => {
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  }, [completedLessons, totalLessons])

  const handleLessonComplete = async () => {
    if (!currentLesson || !token) return
    try {
      await apiFetch(ENDPOINTS.ENROLLMENTS.COMPLETE_LESSON(courseId), {
        method: "POST",
        token,
        body: { chapterId: currentLesson.chapter._id, lessonId: currentLesson.lesson._id },
      })
      const p = await apiFetch(ENDPOINTS.ENROLLMENTS.PROGRESS(courseId), { token })
      setProgress(p.enrollment || p)
    } catch (e: any) {
      setError(e.message || "Failed to mark lesson complete")
    }
  }

  const startLesson = (chapter: Chapter, lesson: Lesson) => {
    setCurrentLesson({ chapter, lesson })
  }

  if (!course) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className="p-8">
          <p>Course not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="employee">
      <div className="p-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/employee/dashboard" },
            { label: "Courses", href: "/employee/courses" },
            { label: course.title },
          ]}
        />

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="flex items-center gap-4">
          <Link href="/employee/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {currentLesson ? (
              <Card className="overflow-hidden bg-white border-border/40 shadow-sm">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-xl font-semibold">{currentLesson.lesson.name}</CardTitle>
                  <CardDescription className="text-sm">{currentLesson.chapter.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoPlayer
                    videoUrl={currentLesson.lesson.video_url ? MEDIA.url(currentLesson.lesson.video_url) : ""}
                    thumbnail={currentLesson.lesson.thumbnail_url ? MEDIA.url(currentLesson.lesson.thumbnail_url) : ""}
                    title={currentLesson.lesson.name}
                    onComplete={handleLessonComplete}
                  />
                  <div className="mt-4 flex gap-2">
                    <Button onClick={handleLessonComplete} className="flex-1">
                      Mark as Complete
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentLesson(null)}>
                      Close Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden bg-white border-border/40 shadow-sm">
                <div className="relative h-64 w-full bg-gradient-to-br from-primary to-secondary">
                  <Image
                    src={course.course_image ? MEDIA.url(course.course_image) : "/placeholder.svg?height=256&width=800"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-semibold">{course.title}</CardTitle>
                      <CardDescription className="mt-2 text-base">{course.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {course.level || "Beginner"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{(course.chapters || []).length} chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration || 0} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>{totalLessons} lessons</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Course Content</CardTitle>
                <CardDescription className="text-base">
                  {completedLessons} of {totalLessons} lessons completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(course.chapters || []).map((chapter: Chapter, chapterIndex: number) => (
                  <div key={chapter._id} className="border border-border/40 rounded-lg p-4 space-y-3 bg-muted/30">
                    <h3 className="font-semibold text-base">
                      Chapter {chapterIndex + 1}: {chapter.title}
                    </h3>
                    <div className="space-y-2">
                      {(chapter.lessons || []).map((lesson: Lesson, lessonIndex: number) => {
                        const isCompleted = !!lesson.completed
                        const isLocked = false
                        return (
                          <div
                            key={lesson._id}
                            className={`flex items-center justify-between p-3 bg-white rounded border border-border/30 hover:border-border transition-colors ${
                              isLocked ? "opacity-60" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-secondary" />
                              ) : isLocked ? (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Play className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  Lesson {lessonIndex + 1}: {lesson.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{lesson.duration || 0} min</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isCompleted ? "outline" : "default"}
                              onClick={() => startLesson(chapter, lesson)}
                              disabled={isLocked}
                            >
                              {isCompleted ? "Review" : "Start"}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-semibold text-lg">{percentComplete}%</span>
                  </div>
                  <Progress value={percentComplete} />
                </div>

                <div className="pt-4 space-y-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed Lessons</span>
                    <span className="font-medium">
                      {completedLessons}/{totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quiz Available</span>
                    <span className="font-medium">{progress?.readyForQuiz ? "Yes" : "No"}</span>
                  </div>
                </div>

                {progress?.readyForQuiz && <Button className="w-full mt-4">Take Quiz</Button>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
