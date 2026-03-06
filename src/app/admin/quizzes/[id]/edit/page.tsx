"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { mockCourses, type Quiz, type Question } from "@/lib/data/mock-data"
import Link from "next/link"

export default function EditQuizPage() {
  const params = useParams()
  const quizId = Array.isArray(params.id) ? params.id[0] : (params.id as string) || ""
  const router = useRouter()
  const { token } = useAuth()

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [formData, setFormData] = useState<any>({
    title: "",
    courseId: "",
    durationMinutes: 30,
    passMarks: 50,
    isPublic: true,
    isActive: true,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [courses, setCourses] = useState<Array<any>>([])

  // fetch quiz details from backend
  useEffect(() => {
    if (!quizId || !token) return
    const loadQuiz = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.QUIZZES.GET(quizId), { token })
        // depending on backend shape, may be data.quiz or data directly
        const q = data.quiz || data
        setFormData({
          title: q.title || "",
          courseId: q.courseId || "general",
          durationMinutes: q.durationMinutes || 30,
          passMarks: q.passMarks || 50,
          isPublic: q.isPublic !== undefined ? q.isPublic : true,
          isActive: q.isActive !== undefined ? q.isActive : true,
        })
        // convert questions if needed (backend names may differ)
        const qs: Question[] = (q.questions || []).map((qq: any) => ({
          id: qq._id || qq.id || Date.now().toString(),
          question: qq.text || qq.question || "",
          options: qq.options || [],
          correctAnswer: qq.correctIndex ?? qq.correctAnswer ?? 0,
          marks: qq.marks || 0,
        }))
        setQuestions(qs)
      } catch (e: any) {
        setError(e.message || "Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [quizId, token])

  // load available courses for dropdown
  useEffect(() => {
    if (!token) return
    const loadCourses = async () => {
      try {
        const data = await apiFetch(ENDPOINTS.COURSES.ADMIN_LIST, { token })
        const list = Array.isArray(data.courses) ? data.courses : Array.isArray(data) ? data : []
        setCourses(list)
      } catch {
        setCourses([])
      }
    }
    loadCourses()
  }, [token])

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="p-8">Loading...</div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="p-8">
          <p className="text-destructive">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 2,
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
    setLoading(true)
    setError("")
    try {
      const payload = {
        title: formData.title,
        courseId: formData.courseId === "general" ? undefined : formData.courseId || undefined,
        questions: questions.map((q) => ({
          text: q.question,
          options: q.options,
          correctIndex: q.correctAnswer,
          marks: q.marks,
        })),
        totalMarks,
        passMarks: formData.passMarks,
        durationMinutes: formData.durationMinutes,
        isPublic: formData.isPublic,
        isActive: formData.isActive,
      }
      await apiFetch(ENDPOINTS.QUIZZES.UPDATE(quizId), {
        method: "PUT",
        token,
        body: payload,
      })
      router.push("/admin/quizzes")
    } catch (e: any) {
      setError(e.message || "Failed to update quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/quizzes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Quiz</h1>
            <p className="text-muted-foreground mt-1">Update quiz information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Update quiz information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Quiz</SelectItem> {/* Updated value prop */}
                    {courses.map((course) => (
                      <SelectItem key={course._id || course.id} value={course._id || course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passMarks">Pass Marks (%)</Label>
                  <Input
                    id="passMarks"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Quiz</Label>
                  <p className="text-sm text-muted-foreground">Make this quiz available to all</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: Boolean(checked) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Enable this quiz</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: Boolean(checked) })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Update questions and answers</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">Question {index + 1}</h3>
                    {questions.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      placeholder="Enter question"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => updateQuestion(question.id, "correctAnswer", optionIndex)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min="1"
                      value={question.marks}
                      onChange={(e) => updateQuestion(question.id, "marks", Number.parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Link href="/admin/quizzes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
