"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { mockCategories, mockCourses, type Course, type Chapter } from "@/lib/data/mock-data"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import Link from "next/link"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"
import { uploadToS3 } from "@/lib/s3Upload"

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { token } = useAuth()
  const [courses, setCourses] = useLocalStorage<Course[]>("lms_courses", mockCourses)
  const course = courses.find((c) => c.id === resolvedParams.id)
  const [loaded, setLoaded] = useState(false)

  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || "",
    level: (course?.level || "Beginner") as "Beginner" | "Intermediate" | "Advanced",
    language: course?.language || "English",
    image: course?.image || "",
    instructor: course?.instructor || "",
    duration: course?.duration || 0,
  })

  const [chapters, setChapters] = useState<Chapter[]>(course?.chapters || [])
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null)
  const [lessonFiles, setLessonFiles] = useState<Record<string, File | null>>({})
  const setLessonFile = (lessonId: string, file: File | null) => {
    setLessonFiles((prev) => ({ ...prev, [lessonId]: file }))
  }

  useEffect(() => {
    const loadCourse = async () => {
      if (!token) {
        setLoaded(true)
        return
      }
      try {
        const data = await apiFetch(ENDPOINTS.COURSES.ADMIN_GET(resolvedParams.id), { token })
        const c = data.course || data
        if (c) {
          const normalizedLevel = ["Beginner", "Intermediate", "Advanced"].includes(String(c.level))
            ? (c.level as "Beginner" | "Intermediate" | "Advanced")
            : "Beginner"
          setFormData({
            title: c.title || "",
            description: c.description || "",
            category: (typeof c.category === "object" ? c.category?.name : c.category) || "",
            level: normalizedLevel,
            language: c.language || "English",
            image: c.image || c.course_image || "",
            instructor: c.instructor || "",
            duration: c.duration || c.videoDurationMinutes || 0,
          })
          setChapters(Array.isArray(c.chapters) ? c.chapters : [])
        }
      } catch {}
      setLoaded(true)
    }
    loadCourse()
  }, [token, resolvedParams.id])

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: "",
      lessons: [],
    }
    setChapters([...chapters, newChapter])
  }

  const updateChapter = (chapterId: string, title: string) => {
    setChapters(chapters.map((ch) => (ch.id === chapterId ? { ...ch, title } : ch)))
  }

  const removeChapter = (chapterId: string) => {
    setChapters(chapters.filter((ch) => ch.id !== chapterId))
  }

  const addLesson = (chapterId: string) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: [
                ...ch.lessons,
                {
                  id: Date.now().toString(),
                  title: "",
                  videoUrl: "",
                  thumbnail: "",
                  duration: 0,
                  isCompleted: false,
                },
              ],
            }
          : ch,
      ),
    )
  }

  const updateLesson = (
    chapterId: string,
    lessonId: string,
    field: "title" | "videoUrl" | "duration",
    value: string | number,
  ) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, [field]: value } : lesson)),
            }
          : ch,
      ),
    )
  }

  const removeLesson = (chapterId: string, lessonId: string) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.filter((lesson) => lesson.id !== lessonId),
            }
          : ch,
      ),
    )
  }

  if (!loaded) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="p-8">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (token) {
      try {
        const payload: any = { ...formData, chapters }
        if (courseImageFile) {
          const r = await uploadToS3(courseImageFile, undefined, `courses/images/${Date.now()}-${courseImageFile.name}`)
          if (r.success && r.key) payload.course_image_url = r.key
        }
        for (const ch of payload.chapters || []) {
          for (const ls of ch.lessons || []) {
            const f = lessonFiles[ls.id]
            if (f) {
              const r = await uploadToS3(f, undefined, `courses/${resolvedParams.id}/lessons/videos/${Date.now()}-${f.name}`)
              if (r.success && r.key) ls.videoUrl = r.key
            }
          }
        }
        await apiFetch(ENDPOINTS.COURSES.UPDATE(resolvedParams.id), { method: "PUT", token, body: payload })
        router.push(`/admin/courses/${resolvedParams.id}`)
        return
      } catch {}
    }
    setCourses(
      courses.map((c) =>
        c.id === resolvedParams.id ? { ...c, ...formData, chapters } : c,
      ),
    )
    router.push(`/admin/courses/${resolvedParams.id}`)
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/admin/dashboard" },
              { label: "Courses", href: "/admin/courses" },
              { label: formData.title || "Course", href: `/admin/courses/${resolvedParams.id}` },
              { label: "Edit" },
            ]}
          />

        <div className="flex items-center gap-4">
          <Link href={`/admin/courses/${resolvedParams.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Course</h1>
            <p className="text-muted-foreground mt-1">Update course information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Update the course information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.category_name}>
                          {cat.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Course Image</Label>
                <Input id="image" type="file" onChange={(e) => setCourseImageFile(e.target.files?.[0] || null)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor Name</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chapters & Lessons</CardTitle>
                  <CardDescription>Manage chapters and lessons for your course</CardDescription>
                </div>
                <Button type="button" onClick={addChapter} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {chapters.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No chapters yet. Click "Add Chapter" to get started.
                </p>
              ) : (
                chapters.map((chapter, chapterIndex) => (
                  <div key={chapter.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label>Chapter {chapterIndex + 1} Title</Label>
                        <Input
                          value={chapter.title}
                          onChange={(e) => updateChapter(chapter.id, e.target.value)}
                          placeholder="Enter chapter title"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChapter(chapter.id)}
                        className="text-destructive mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="ml-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Lessons</Label>
                        <Button type="button" onClick={() => addLesson(chapter.id)} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </Button>
                      </div>

                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="border rounded p-3 space-y-3 bg-muted/20">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Lesson {lessonIndex + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLesson(chapter.id, lesson.id)}
                              className="text-destructive ml-auto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Lesson Title</Label>
                              <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(chapter.id, lesson.id, "title", e.target.value)}
                                placeholder="Lesson title"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                            <Label className="text-xs">Video File</Label>
                            <Input type="file" onChange={(e) => setLessonFile(lesson.id, e.target.files?.[0] || null)} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Duration (minutes)</Label>
                              <Input
                                type="number"
                                value={lesson.duration}
                                onChange={(e) =>
                                  updateLesson(chapter.id, lesson.id, "duration", Number.parseInt(e.target.value) || 0)
                                }
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Link href={`/admin/courses/${resolvedParams.id}`}>
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
