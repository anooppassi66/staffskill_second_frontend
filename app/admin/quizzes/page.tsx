"use client"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { Plus, Pencil, Trash2, Clock } from "lucide-react"
import Link from "next/link"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"

type QuizItem = {
  _id: string
  title: string
  course?: { title?: string } | string
  questions?: Array<any>
  totalMarks?: number
  passMarks?: number
  durationMinutes?: number
  isPublic?: boolean
  isActive?: boolean
}

export default function QuizzesPage() {
  const { token } = useAuth()
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.QUIZZES.LIST, { token })
        const list = Array.isArray(data.quizzes) ? data.quizzes : Array.isArray(data) ? data : []
        setQuizzes(list)
      } catch (e: any) {
        setError(e.message || "Failed to load quizzes")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const toggleQuizStatus = async (quizId: string, current: boolean) => {
    if (!token) return
    try {
      if (current) {
        await apiFetch(ENDPOINTS.ADMIN.DEACTIVATE_QUIZ(quizId), { method: "POST", token })
        setQuizzes(quizzes.map((q) => (q._id === quizId ? { ...q, isActive: false } : q)))
      } else {
        await apiFetch(ENDPOINTS.QUIZZES.UPDATE(quizId), { method: "PUT", token, body: { isActive: true } })
        setQuizzes(quizzes.map((q) => (q._id === quizId ? { ...q, isActive: true } : q)))
      }
    } catch (e: any) {
      setError(e.message || "Failed to update quiz")
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        await apiFetch(ENDPOINTS.QUIZZES.DELETE(id), { method: "DELETE", token })
        setQuizzes(quizzes.filter((q) => q._id !== id))
      } catch (e: any) {
        setError(e.message || "Failed to delete quiz")
      }
    }
  }

  const getCourseName = (course?: { title?: string } | string) => {
    if (!course) return "General Quiz"
    return typeof course === "string" ? course : course.title || "Unknown Course"
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Quiz Management" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quiz Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage quizzes</p>
          </div>
          <Link href="/admin/quizzes/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} className="bg-white border-border/40 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription className="mt-1">{getCourseName(quiz.course)}</CardDescription>
                  </div>
                  <Switch checked={!!quiz.isActive} onCheckedChange={() => toggleQuizStatus(quiz._id, !!quiz.isActive)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{quiz.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Marks:</span>
                    <span className="font-medium">{quiz.totalMarks || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pass Marks:</span>
                    <span className="font-medium">{quiz.passMarks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">{quiz.durationMinutes || 0} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant={quiz.isPublic ? "default" : "secondary"}>
                    {quiz.isPublic ? "Public" : "Private"}
                  </Badge>
                  <Badge variant={quiz.isActive ? "default" : "destructive"}>
                    {quiz.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/quizzes/${quiz._id}/edit`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(quiz._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
