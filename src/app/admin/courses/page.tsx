"use client"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { Plus, Pencil, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ENDPOINTS, apiFetch, MEDIA } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"

type AdminCourse = {
  _id: string
  title: string
  description?: string
  category?: { name?: string } | string
  course_image?: string
  isActive?: boolean
  status?: string
  enrolledCount?: number
}

export default function CoursesPage() {
  const { token } = useAuth()
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.COURSES.ADMIN_LIST, { token })
        const list = Array.isArray(data.courses) ? data.courses : Array.isArray(data) ? data : []
        setCourses(list)
      } catch (e: any) {
        setError(e.message || "Failed to load courses")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Courses" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1">Manage all courses</p>
          </div>
          <Link href="/admin/courses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </Link>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id} className="overflow-hidden bg-white border-border/40 shadow-sm">
              <div className="relative h-48 w-full bg-gradient-to-br from-primary to-secondary">
                <Image
                  src={course.course_image ? MEDIA.url(course.course_image) : "/placeholder.svg?height=200&width=400"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={course.status === "published" ? "default" : "secondary"}>{course.status || "draft"}</Badge>
                  <Badge variant={course.isActive ? "default" : "destructive"}>
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">
                      {typeof course.category === "string" ? course.category : course.category?.name || ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="font-medium">{course.enrolledCount || 0} students</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/courses/${course._id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/courses/${course._id}/edit`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
