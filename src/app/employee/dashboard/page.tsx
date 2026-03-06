"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CourseCard } from "@/components/employee/course-card"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { BookOpen, CheckCircle2, Clock, Trophy } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { apiFetch, ENDPOINTS } from "@/lib/api"

export default function EmployeeDashboard() {
  const { user, token } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const data = await apiFetch(ENDPOINTS.EMPLOYEE.DASHBOARD, { token })
        const dashboard = data.dashboard || []
        setItems(dashboard)
        const top = dashboard.slice(0, 3)
        const details = await Promise.all(
          top.map(async (it: any) => {
            try {
              const res = await apiFetch(ENDPOINTS.COURSES.PUBLIC_GET(it.course.id), { token })
              const c = res.course || {}
              const mapped = {
                id: c._id || it.course.id,
                title: c.title,
                description: c.short_description || c.description || "",
                chapters: c.chapters || [],
                duration: c.videoDurationMinutes || 0,
                level: c.level || "Beginner",
                image: c.thumbnail_url || c.course_image || "/placeholder.svg",
              }
              return { course: mapped, enrollment: { progress: it.progress, isCompleted: it.isCompleted } }
            } catch {
              return { course: { id: it.course.id, title: it.course.title, description: "", chapters: [], duration: 0, level: "Beginner", image: "/placeholder.svg" }, enrollment: { progress: it.progress, isCompleted: it.isCompleted } }
            }
          }),
        )
        setRecent(details)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const activeCourses = useMemo(() => items.filter((e) => !e.isCompleted), [items])
  const completedCourses = useMemo(() => items.filter((e) => e.isCompleted), [items])
  const certificatesCount = useMemo(() => items.filter((e) => !!e.certificate).length, [items])
  const totalProgress = useMemo(() => {
    return items.length > 0 ? Math.round(items.reduce((sum, e) => sum + (e.progress || 0), 0) / items.length) : 0
  }, [items])

  return (
    <DashboardLayout requiredRole="employee">
      <div className="p-8 space-y-8">
        <Breadcrumb items={[{ label: "Dashboard" }]} />

        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.first_name}!</h1>
          <p className="text-muted-foreground mt-1">Continue your learning journey</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{activeCourses.length} in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Courses finished</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificatesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Awarded</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Progress</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProgress}%</div>
              <Progress value={totalProgress} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recent.map(({ course, enrollment }) => (
                <CourseCard key={course.id} course={course as any} enrollment={enrollment as any} />
              ))}
              {recent.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Learning Path Progress</CardTitle>
              <CardDescription>Your journey overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.slice(0, 5).map((en) => (
                <div key={en.enrollmentId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium line-clamp-1">{en.course?.title}</span>
                    <span className="text-muted-foreground">{en.progress}%</span>
                  </div>
                  <Progress value={en.progress} />
                </div>
              ))}
              {items.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">No enrollments found.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Quiz Eligibility</CardTitle>
              <CardDescription>Courses ready for assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items
                  .filter((e) => e.nextLesson === null && !e.isCompleted)
                  .map((en) => (
                    <div
                      key={en.enrollmentId}
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border/30"
                    >
                      <div>
                        <p className="font-medium">{en.course?.title}</p>
                        <p className="text-xs text-muted-foreground">Ready for quiz</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    </div>
                  ))}
                {items.filter((e) => e.nextLesson === null && !e.isCompleted).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No quizzes available yet. Complete your lessons to unlock quizzes.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
