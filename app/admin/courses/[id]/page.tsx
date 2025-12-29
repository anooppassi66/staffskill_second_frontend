"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Clock, Users, TrendingUp, Play } from "lucide-react"
import { useEffect, useState, use } from "react"
import { mockCourses, mockEnrollments, mockEmployees } from "@/lib/data/mock-data"
import Link from "next/link"
import Image from "next/image"
import { ENDPOINTS, apiFetch, MEDIA } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { token } = useAuth()
  const [course, setCourse] = useState<any | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        const local = mockCourses.find((c) => c.id === resolvedParams.id) || null
        setCourse(local)
        setLoaded(true)
        return
      }
      try {
        const data = await apiFetch(ENDPOINTS.COURSES.ADMIN_GET(resolvedParams.id), { token })
        const c = data.course || data
        setCourse(c || null)
        setLoaded(true)
      } catch {
        const local = mockCourses.find((c) => c.id === resolvedParams.id) || null
        setCourse(local)
        setLoaded(true)
      }
    }
    load()
  }, [token, resolvedParams.id])

  if (!loaded) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="p-8">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="p-8">
          <p>Course not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const courseEnrollments = mockEnrollments.filter((e) => e.courseId === (course.id || course._id))
  const chapters = Array.isArray(course.chapters) ? course.chapters : []
  const totalLessons = chapters.reduce((sum: number, chapter: any) => sum + ((chapter.lessons || []).length), 0)

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative h-64 w-full bg-gradient-to-br from-primary to-secondary">
                <Image
                  src={
                    course.image
                      || (course.course_image ? MEDIA.url(course.course_image) : "/placeholder.svg?height=256&width=800")
                  }
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <CardDescription className="mt-2">{course.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={(course.status || "published") === "published" ? "default" : "secondary"}>
                      {course.status || "published"}
                    </Badge>
                    <Badge variant={course.isActive ? "default" : "destructive"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{chapters.length} chapters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.videoDurationMinutes || course.duration || 0} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {totalLessons} lessons across {chapters.length} chapters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chapters.map((chapter, chapterIndex) => (
                  <div key={chapter.id} className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold">
                      Chapter {chapterIndex + 1}: {chapter.title}
                    </h3>
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div className="flex items-center gap-3">
                            <Play className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                Lesson {lessonIndex + 1}: {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Students currently taking this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseEnrollments.map((enrollment) => {
                    const employee = mockEmployees.find((e) => e.id === enrollment.userId)
                    return (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">
                            {employee?.first_name} {employee?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{employee?.email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{enrollment.progress}%</p>
                            <p className="text-xs text-muted-foreground">Progress</p>
                          </div>
                          <Badge variant={enrollment.isCompleted ? "default" : "secondary"}>
                            {enrollment.isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Enrolled</span>
                  </div>
                  <span className="font-semibold">{courseEnrollments.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                  </div>
                  <span className="font-semibold">{course.completionRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Category</span>
                  </div>
                  <span className="font-semibold">
                    {typeof course.category === "object"
                      ? (course.category?.name || course.category?.category_name || "")
                      : (course.category || "")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Duration</span>
                  </div>
                  <span className="font-semibold">{course.videoDurationMinutes || course.duration || 0} min</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Progress</span>
                      <span className="font-medium">
                        {courseEnrollments.length > 0
                          ? Math.round(
                              courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        courseEnrollments.length > 0
                          ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length
                          : 0
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                    {(course.instructor || "").slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-medium">{course.instructor || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">Course Instructor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/admin/courses/${(course.id || course._id)}/edit`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    Edit Course
                  </Button>
                </Link>
                <Button variant="outline" className="w-full bg-transparent">
                  View Analytics
                </Button>
                <Button variant={course.isActive ? "destructive" : "default"} className="w-full">
                  {course.isActive ? "Deactivate" : "Activate"} Course
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
