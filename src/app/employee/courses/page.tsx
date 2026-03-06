"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/employee/course-card"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { useAuth } from "@/lib/hooks/use-auth"
import { ENDPOINTS, apiFetch, MEDIA } from "@/lib/api"

type EnrollmentItem = {
  id?: string
  isCompleted?: boolean
  progress?: number
  readyForQuiz?: boolean
  course?: any
  completedLessons?: Array<any>
}

type CourseForCard = {
  id: string
  title: string
  description: string
  image: string
  chapters: Array<any>
  duration: number
  level: string
}

export default function EmployeeCoursesPage() {
  const { token } = useAuth()
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.ENROLLMENTS.ME, { token })
        const list = Array.isArray(data.enrollments) ? data.enrollments : Array.isArray(data.courses) ? data.courses : Array.isArray(data) ? data : []
        setEnrollments(list)
      } catch (e: any) {
        setError(e.message || "Failed to load enrollments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const enrolledCourses = useMemo(() => {
    return enrollments.map((en) => {
      const c = en.course || {}
      const chapters = c.chapters || []
      const totalLessons = chapters.reduce((sum: number, ch: any) => sum + ((ch.lessons || []).length), 0)
      const completedCount = (en.completedLessons || []).length
      const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      const course: CourseForCard = {
        id: c._id || c.id || "",
        title: c.title || "",
        description: c.short_description || c.description || "",
        image: c.thumbnail_url ? MEDIA.url(c.thumbnail_url) : (c.course_image ? MEDIA.url(c.course_image) : "/placeholder.svg?height=160&width=400"),
        chapters,
        duration: c.videoDurationMinutes || c.duration || 0,
        level: c.level || "Beginner",
      }
      const enrollment = {
        progress: progressPct,
        isCompleted: !!en.isCompleted,
        readyForQuiz: totalLessons > 0 && completedCount >= totalLessons,
        userId: "",
        courseId: course.id,
        completedLessons: en.completedLessons || [],
        enrolledAt: "",
      }
      return { course, enrollment }
    })
  }, [enrollments])

  const activeCourses = enrolledCourses.filter((item) => !item.enrollment.isCompleted)
  const completedCourses = enrolledCourses.filter((item) => item.enrollment.isCompleted)

  return (
    <DashboardLayout requiredRole="employee">
      <div className="p-8 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/employee/dashboard" }, { label: "My Courses" }]} />

        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">Track your learning progress</p>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Courses ({enrolledCourses.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          </TabsList>

        <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map(({ course, enrollment }) => (
                <CourseCard key={course.id} course={course as any} enrollment={enrollment as any} />
              ))}
            </div>
            {enrolledCourses.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeCourses.map(({ course, enrollment }) => (
                <CourseCard key={course.id} course={course as any} enrollment={enrollment as any} />
              ))}
            </div>
            {activeCourses.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active courses. Start learning today!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map(({ course, enrollment }) => (
                <CourseCard key={course.id} course={course as any} enrollment={enrollment as any} />
              ))}
            </div>
            {completedCourses.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No completed courses yet. Keep learning!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
