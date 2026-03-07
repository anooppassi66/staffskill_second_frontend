"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { PlusCircle, Clock, HelpCircle, SquarePen, Trash, CircleX } from "lucide-react";
import { ENDPOINTS } from "@/Api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import MainLoader from '@/app/components/MainLoader';
import ReactSelect from '../components/ui/ReactSelect';
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/PageHeader";
import RichTextEditor from "../components/ui/RichTextEditor";
import HtmlContent from "../components/ui/HtmlContent";
import PaginationComp from "../components/ui/Pagination";

const QuizPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inProgress, setInProgress] = useState(false)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(9)
  const [total, setTotal] = useState(0)

  const user = useSelector((state: RootState) => state.user);

  const [course, setCourse] = useState<string>("");
  const [courseOptions, setCourseOptions] = useState<Array<{ value: string; label: string }>>([])
  const [title, setTitle] = useState("");
  const [passMarks, setPassMarks] = useState<number | "">("");
  const [durationText, setDurationText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [marks, setMarks] = useState<number>(1);
  const [questionsList, setQuestionsList] = useState<Array<{ text: string; options: string[]; correctIndex: number; marks: number }>>([]);
  const [showAttempt, setShowAttempt] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState<any>(null)
  const [attemptQuestions, setAttemptQuestions] = useState<Array<{ id: string; text: string; options: string[] }>>([])
  const [answers, setAnswers] = useState<number[]>([])
  const [showEdit, setShowEdit] = useState(false)
  const [editQuiz, setEditQuiz] = useState<any>(null)
  const [editCourse, setEditCourse] = useState<string>("")
  const [editTitle, setEditTitle] = useState("")
  const [editPassMarks, setEditPassMarks] = useState<number | "">("")
  const [editDurationText, setEditDurationText] = useState("")
  const [editIsPublic, setEditIsPublic] = useState(false)
  const [editQuestionsList, setEditQuestionsList] = useState<Array<{ text: string; options: string[]; correctIndex: number; marks: number }>>([])
  const [showDelete, setShowDelete] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [editQuestionText, setEditQuestionText] = useState("")
  const [editOptions, setEditOptions] = useState<string[]>(["", "", "", ""])
  const [editCorrectIndex, setEditCorrectIndex] = useState<number>(0)
  const [editMarks, setEditMarks] = useState<number>(1)

  const addQuestion = () => {
    const q = {
      text: questionText.trim(),
      options: options.map((o) => o.trim()).filter((o) => o.length > 0),
      correctIndex,
      marks,
    };
    if (!q.text || q.options.length < 2) return;
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return;
    setQuestionsList((prev) => [...prev, q]);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setMarks(1);
  };

  const addEditQuestion = () => {
    const q = {
      text: editQuestionText.trim(),
      options: editOptions.map((o) => o.trim()).filter((o) => o.length > 0),
      correctIndex: editCorrectIndex,
      marks: editMarks,
    };
    if (!q.text || q.options.length < 2) return;
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return;
    setEditQuestionsList((prev) => [...prev, q]);
    setEditQuestionText("");
    setEditOptions(["", "", "", ""]);
    setEditCorrectIndex(0);
    setEditMarks(1);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const qs = new URLSearchParams()
        const page = Math.floor(skip / limit) + 1
        qs.set('page', String(page))
        qs.set('limit', String(limit))
        const filterCourse = searchParams?.get('course') || ''
        if (filterCourse) qs.set('course', filterCourse)
        const url = ENDPOINTS.QUIZ.CREATE_QUIZ + (qs.toString() ? `?${qs.toString()}` : '')
        const res = await fetch(url, {
          headers: {
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        })
        if (!res.ok) {
          if (res.status === 404 || res.status === 501 || res.status === 503) {
            setInProgress(true)
          }
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Failed to load quizzes')
        }
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data.quizzes) ? data.quizzes : Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
        setQuizzes(list)
        const meta = (data.meta || {}) as any
        const inferredTotal = meta.total ?? data.total ?? data.count ?? (Array.isArray(list) ? list.length : 0)
        setTotal(typeof inferredTotal === 'number' ? inferredTotal : 0)
      } catch (e: any) {
        setError(e.message || 'Unexpected error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.token, skip, limit])

  useEffect(() => {
    const run = async () => {
      try {
        const qs = new URLSearchParams()
        qs.set('limit', '50')
        const res = await fetch(ENDPOINTS.COURSES.ADMIN_LIST + `?${qs.toString()}`, {
          headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) }
        })
        const d = await res.json().catch(() => ({}))
        const list = Array.isArray(d.courses) ? d.courses : []
        const opts = list.map((c: any) => ({ value: c._id, label: c.title || '' }))
        setCourseOptions([{ value: '', label: 'Select' }, ...opts])
      } catch { }
    }
    run()
  }, [user.token])

  const openAttempt = async (quiz: any) => {
    setActiveQuiz(quiz)
    setShowAttempt(true)
    try {
      const id = quiz?._id || quiz?.id
      if (!id) return
      const res = await fetch(`${ENDPOINTS.QUIZ.CREATE_QUIZ}/${id}`, {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      })
      const d = await res.json().catch(() => ({}))
      const qList = Array.isArray(d.questions) ? d.questions : Array.isArray(quiz.questions) ? quiz.questions : []
      const normalized = qList.map((q: any) => ({
        id: q?._id || '',
        text: q?.text || q?.question || '',
        options: (q?.options || q?.choices || []).map((o: any) => (typeof o === 'string' ? o : (o?.text || ''))).filter((v: string) => v),
      }))
      setAttemptQuestions(normalized)
      setAnswers(Array(normalized.length).fill(-1))
    } catch { }
  }

  const openEdit = (quiz: any) => {
    setEditQuiz(quiz)
    setShowEdit(true)
    const courseId = typeof quiz?.course === 'object' ? (quiz?.course?._id || '') : (quiz?.course || '')
    setEditCourse(courseId || '')
    setEditTitle(quiz?.title || quiz?.name || '')
    const pm = quiz?.passMarks
    setEditPassMarks(typeof pm === 'number' ? pm : '')
    setEditDurationText(String(quiz?.durationMinutes || quiz?.duration || ''))
    setEditIsPublic(!!quiz?.isPublic)
    const qList = Array.isArray(quiz?.questions) ? quiz?.questions : []
    const normalized = qList.map((q: any) => ({
      text: q?.text || q?.question || '',
      options: (q?.options || q?.choices || []).map((o: any) => (typeof o === 'string' ? o : (o?.text || ''))).filter((v: string) => v),
      correctIndex: typeof q?.correctIndex === 'number' ? q?.correctIndex : 0,
      marks: typeof q?.marks === 'number' ? q?.marks : 1,
    }))
    setEditQuestionsList(normalized)
  }

  const openDelete = (quiz: any) => {
    setDeleteTarget(quiz)
    setShowDelete(true)
  }

  const performDelete = async () => {
    const quiz = deleteTarget
    const id = quiz?._id || quiz?.id
    if (!id) return
    let tId: any
    try {
      tId = toast.loading('Deleting...')
      const res = await fetch(ENDPOINTS.QUIZ.DELETE(String(id)), {
        method: 'DELETE',
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to delete quiz')
      }
      toast.update(tId, { render: 'Quiz deleted', type: 'success', isLoading: false, autoClose: 1500 })
      setShowDelete(false)
      setDeleteTarget(null)
      const page = Math.floor(skip / limit) + 1
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(limit))
      const url = ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`
      const refresh = await fetch(url, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } })
      const data = await refresh.json().catch(() => ({}))
      const list = Array.isArray(data.quizzes) ? data.quizzes : []
      setQuizzes(list)
    } catch (e: any) {
      if (tId) {
        toast.update(tId, { render: e.message || 'Failed to delete', type: 'error', isLoading: false, autoClose: 3000 })
      } else {
        toast.error(e.message || 'Failed to delete')
      }
    }
  }

  const handleUpdateQuiz = async () => {
    const durationMinutes = parseInt(editDurationText)
    if (!editTitle.trim()) {
      toast.error('Title is required')
      return
    }
    if (!editPassMarks && editPassMarks !== 0) {
      toast.error('Pass mark is required')
      return
    }
    if (!Array.isArray(editQuestionsList) || editQuestionsList.length === 0) {
      toast.error('Add at least one question')
      return
    }
    const payload = {
      course: editCourse || undefined,
      title: editTitle,
      questions: editQuestionsList,
      passMarks: typeof editPassMarks === 'number' ? editPassMarks : parseInt(String(editPassMarks || 0)),
      durationMinutes: isNaN(durationMinutes) ? 0 : durationMinutes,
      isPublic: editIsPublic,
    }
    const id = editQuiz?._id || editQuiz?.id
    let tId: any
    try {
      tId = toast.loading('Updating quiz...')
      const res = await fetch(ENDPOINTS.QUIZ.UPDATE(String(id)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update quiz')
      }
      toast.update(tId, { render: 'Quiz updated', type: 'success', isLoading: false, autoClose: 1500 })
      setShowEdit(false)
      setEditQuiz(null)
      const page = Math.floor(skip / limit) + 1
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(limit))
      const url = ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`
      const refresh = await fetch(url, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } })
      const data = await refresh.json().catch(() => ({}))
      const list = Array.isArray(data.quizzes) ? data.quizzes : []
      setQuizzes(list)
    } catch (e: any) {
      if (tId) {
        toast.update(tId, { render: e.message || 'Failed to update quiz', type: 'error', isLoading: false, autoClose: 3000 })
      } else {
        toast.error(e.message || 'Failed to update quiz')
      }
    }
  }

  const submitAttempt = async () => {
    if (!activeQuiz) return
    const id = activeQuiz?._id || activeQuiz?.id
    let tId: any
    try {
      tId = toast.loading('Submitting attempt...')
      const res = await fetch(ENDPOINTS.QUIZ.ATTEMPT(String(id)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ answers: attemptQuestions.map((q, idx) => ({ questionId: q.id, answerIndex: answers[idx] })) }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to submit attempt')
      }
      const d = await res.json().catch(() => ({}))
      toast.update(tId, { render: d.message || 'Attempt submitted', type: 'success', isLoading: false, autoClose: 1500 })
      if (d?.passed) {
        router.push('/certificates')
      }
      setShowAttempt(false)
      setActiveQuiz(null)
      setAttemptQuestions([])
      setAnswers([])
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
    }
  }

  const handleSaveQuiz = async () => {
    const durationMinutes = parseInt(durationText);
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!passMarks && passMarks !== 0) {
      toast.error('Pass mark is required')
      return
    }
    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      toast.error('Add at least one question')
      return
    }
    const totalMarks = questionsList.reduce((sum, q) => sum + (typeof q.marks === 'number' ? q.marks : 0), 0)
    const pm = typeof passMarks === 'number' ? passMarks : parseInt(String(passMarks || 0))
    if (isNaN(pm) || pm <= 0) {
      toast.error('Pass mark must be a positive number')
      return
    }
    if (pm > totalMarks) {
      toast.error('Pass mark cannot exceed total marks')
      return
    }
    if (!isNaN(durationMinutes) && durationMinutes < 0) {
      toast.error('Duration cannot be negative')
      return
    }
    if (!isPublic && !course) {
      toast.error('Select a course or mark quiz as public')
      return
    }
    for (const q of questionsList) {
      if (!q.text.trim() || (q.options || []).length < 2) {
        toast.error('Each question must have text and at least two options')
        return
      }
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        toast.error('Each question must have a valid correct option index')
        return
      }
      if (typeof q.marks !== 'number' || q.marks <= 0) {
        toast.error('Question marks must be a positive number')
        return
      }
    }
    const payload = {
      course: course || undefined,
      title,
      questions: questionsList,
      passMarks: pm,
      durationMinutes: isNaN(durationMinutes) ? 0 : durationMinutes,
      isPublic,
    };

    let tId: any;
    try {
      tId = toast.loading("Creating quiz...");
      const res = await fetch(ENDPOINTS.QUIZ.CREATE_QUIZ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create quiz");
      }

      toast.update(tId, { render: "Quiz created", type: "success", isLoading: false, autoClose: 1500 });
      setCourse('')
      setTitle('')
      setPassMarks('')
      setDurationText('')
      setIsPublic(false)
      setQuestionsList([])
      const page = Math.floor(skip / limit) + 1
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(limit))
      const url = ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`
      const refresh = await fetch(url, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } })
      const data = await refresh.json().catch(() => ({}))
      const list = Array.isArray(data.quizzes) ? data.quizzes : []
      setQuizzes(list)
    } catch (err: any) {
      if (tId) {
        toast.update(tId, { render: err.message || "Failed to create quiz", type: "error", isLoading: false, autoClose: 3000 });
      } else {
        toast.error(err.message || "Failed to create quiz");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-4">
        {inProgress && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="fw-semibold">Currently in progress</div>
              <div className="text-muted small">This module API is not available yet.</div>
            </div>
          </div>
        )}
        {/* Header Section */}
        <PageHeader
          title="Quiz List"
          subtitle="Manage quiz"
          rightContent={
            <button
              className="custom-btn d-flex align-items-center gap-2"
              data-bs-toggle="modal"
              data-bs-target="#addQuizModal"
            >
              <PlusCircle size={18} />
              Add New Quiz
            </button>
          }
        />

        {/* Quiz Table */}
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th className="text-start">Title</th>
                <th className="text-start">Course</th>
                <th className="text-center">Questions</th>
                <th className="text-center">Duration</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={5} className="text-danger">{error}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5}><MainLoader /></td>
                </tr>
              )}
              {!loading && quizzes.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="No Quiz" subtitle="No quiz found add new quiz" />
                  </td>
                </tr>
              )}
              {quizzes.map((quiz: any, index: number) => (
                <tr key={quiz._id || quiz.id || index}>
                  <td className="fw-medium">{quiz.title || quiz.name}</td>
                  <td className="fw-normal">
                    {quiz?.course?.title || quiz?.course?.name || (typeof quiz?.course === 'string' ? quiz.course : '-')}
                  </td>
                  <td className="text-center">{(Array.isArray(quiz.questions) ? quiz.questions.length : quiz.questions) || 0}</td>
                  <td className="text-center">{quiz.durationMinutes || quiz.duration || 0} Minutes</td>
                  <td>
                    <div className="action-icons justify-content-center">
                      {user.role === 'admin' ? (
                        <>
                          <SquarePen onClick={() => openEdit(quiz)} size={19} />
                          <Trash onClick={() => openDelete(quiz)} size={19} />
                        </>
                      ) : (
                        <button className="custom-btn ms-2" >Attempt</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {quizzes.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">Showing {Math.min(limit, Math.max(0, total - skip))} of {total}</small>
            <div className="d-flex gap-2 align-items-center">
              {(() => {
                const current = Math.floor(skip / limit) + 1
                const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)))
                return (
                  <PaginationComp
                    page={current}
                    totalPages={totalPages}
                    onChange={(p) => setSkip((p - 1) * limit)}
                  />
                )
              })()}
              <ReactSelect
                className="w-auto"
                value={String(limit)}
                options={[
                  { value: '9', label: '9' },
                  { value: '12', label: '12' },
                  { value: '24', label: '24' },
                ]}
                onChange={(v) => { setSkip(0); setLimit(parseInt(v || '9')); }}
                placeholder="Items per page"
              />
            </div>
          </div>
        )}

        {/* Add Quiz Modal */}
        <div
          className="modal fade"
          id="addQuizModal"
          tabIndex={-1}
          aria-labelledby="addQuizModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title fw-semibold" id="addQuizModalLabel">
                  Add New Quiz
                </h5>
                <CircleX data-bs-dismiss="modal"
                  aria-label="Close" />
              </div>

              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Course *</label>
                    <ReactSelect
                      options={courseOptions}
                      value={course}
                      onChange={setCourse}
                      placeholder="Select course"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quiz Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter quiz title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <span className="text-muted small">Questions added: {questionsList.length}</span>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pass Mark *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter pass mark"
                      value={passMarks as any}
                      onChange={(e) => setPassMarks(e.target.value ? parseInt(e.target.value) : "")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 30"
                      value={durationText as any}
                      onChange={(e) => setDurationText(e.target.value)}
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                    <label className="form-check-label" htmlFor="isPublic">Public</label>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label">Add Question</label>
                      <span className="badge text-bg-light">{questionsList.length} added</span>
                    </div>
                    <RichTextEditor value={questionText} onChange={setQuestionText} placeholder="Question text" height={0} />
                    <div className="row g-2 mb- mt-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div className="col-6" key={i}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Option ${i + 1}`}
                            value={options[i]}
                            onChange={(e) => {
                              const next = [...options];
                              next[i] = e.target.value;
                              setOptions(next);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="row g-2 mt-3">
                      <div className="col-8">
                        <ReactSelect
                          value={String(correctIndex)}
                          options={[0, 1, 2, 3].map((i) => ({ value: String(i), label: `Correct Option ${i + 1}` }))}
                          onChange={(v) => setCorrectIndex(parseInt(v || '0'))}
                          placeholder="Select correct option"
                        />
                      </div>
                      <div className="col-4">
                        <input type="number" className="form-control" placeholder="Marks" value={marks as any} onChange={(e) => setMarks(parseInt(e.target.value || '1'))} />
                      </div>
                    </div>
                    <div className="mt-2 d-flex justify-content-end">
                      <button type="button" className="custom-btn" onClick={addQuestion}>Add</button>
                    </div>
                    {questionsList.length > 0 && (
                      <div className="mt-3">
                        {questionsList.map((q, idx) => (
                          <div className="d-flex justify-content-between align-items-center mb-2" key={idx}>
                            <div>
                              <div className="fw-semibold">Q{idx + 1}.</div>
                              <HtmlContent className="mb-1" html={q.text} />
                              <div className="text-muted small">Options: {(q.options || []).join(', ')}</div>
                            </div>
                            <button type="button" className="custom-btn" onClick={() => setQuestionsList(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="custom-btn"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="button" data-bs-dismiss="modal"
                  aria-label="Close" className="custom-btn" onClick={handleSaveQuiz}>
                  Save Quiz
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAttempt && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Attempt: {activeQuiz?.title || activeQuiz?.name}</h5>
                  <button className="custom-btn" onClick={() => { setShowAttempt(false); setActiveQuiz(null); }}></button>
                </div>
                <div className="modal-body">
                  {attemptQuestions.length === 0 ? (
                    <p className="text-muted">No questions available.</p>
                  ) : (
                    attemptQuestions.map((q, qi) => (
                      <div key={qi} className="mb-3">
                        <p className="fw-semibold mb-2">Q{qi + 1}.</p>
                        <HtmlContent className="mb-2" html={q.text} />
                        {(q.options || []).map((opt, oi) => (
                          <div className="form-check" key={oi}>
                            <input className="form-check-input" type="radio" name={`q-${qi}`} id={`q-${qi}-o-${oi}`} checked={answers[qi] === oi} onChange={() => {
                              const next = [...answers];
                              next[qi] = oi;
                              setAnswers(next);
                            }} />
                            <label className="form-check-label" htmlFor={`q-${qi}-o-${oi}`}>{opt}</label>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                <div className="modal-footer">
                  <button className="custom-btn" onClick={() => { setShowAttempt(false); setActiveQuiz(null); }}>Cancel</button>
                  <button className="custom-btn" onClick={submitAttempt}>Submit Answers</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showEdit && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow">
                <div className="modal-header d-flex justify-content-between">
                  <h5 className="modal-title fw-semibold">Edit Quiz</h5>
                   <CircleX onClick={() => { setShowEdit(false); setEditQuiz(null); }} />
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Course *</label>
                      <ReactSelect
                        options={courseOptions}
                        value={editCourse}
                        onChange={setEditCourse}
                        placeholder="Select course"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quiz Title *</label>
                      <input type="text" className="form-control" placeholder="Enter quiz title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small">Questions: {editQuestionsList.length}</span>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Pass Mark *</label>
                      <input type="number" className="form-control" placeholder="Enter pass mark" value={editPassMarks as any} onChange={(e) => setEditPassMarks(e.target.value ? parseInt(e.target.value) : "")} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Duration (minutes) *</label>
                      <input type="number" className="form-control" placeholder="e.g. 30" value={editDurationText as any} onChange={(e) => setEditDurationText(e.target.value)} />
                    </div>
                    <div className="mb-3 form-check">
                      <input type="checkbox" className="form-check-input" id="editIsPublic" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} />
                      <label className="form-check-label" htmlFor="editIsPublic">Public</label>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="form-label">Add Question</label>
                        <span className="badge text-bg-light">{editQuestionsList.length} added</span>
                      </div>
                      <RichTextEditor value={editQuestionText} onChange={setEditQuestionText} placeholder="Question text" height={0} />
                      <div className="row g-2 mb-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div className="col-6" key={i}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Option ${i + 1}`}
                              value={editOptions[i]}
                              onChange={(e) => {
                                const next = [...editOptions];
                                next[i] = e.target.value;
                                setEditOptions(next);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="row g-2">
                        <div className="col-8">
                          <ReactSelect
                            value={String(editCorrectIndex)}
                            options={[0, 1, 2, 3].map((i) => ({ value: String(i), label: `Correct Option ${i + 1}` }))}
                            onChange={(v) => setEditCorrectIndex(parseInt(v || '0'))}
                            placeholder="Select correct option"
                          />
                        </div>
                        <div className="col-4">
                          <input type="number" className="form-control" placeholder="Marks" value={editMarks as any} onChange={(e) => setEditMarks(parseInt(e.target.value || '1'))} />
                        </div>
                      </div>
                      <div className="mt-2 d-flex justify-content-end">
                        <button type="button" className="custom-btn" onClick={addEditQuestion}>Add</button>
                      </div>
                      {editQuestionsList.length > 0 && (
                        <div className="mt-3">
                          {editQuestionsList.map((q, idx) => (
                            <div className="d-flex justify-content-between align-items-center mb-2" key={idx}>
                              <div>
                                <div className="fw-semibold">Q{idx + 1}.</div>
                                <HtmlContent className="mb-1" html={q.text} />
                                <div className="text-muted small">Options: {(q.options || []).join(', ')}</div>
                              </div>
                              <button type="button" className="custom-btn" onClick={() => setEditQuestionsList(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="custom-btn" onClick={() => { setShowEdit(false); setEditQuiz(null); }}>Cancel</button>
                  <button className="custom-btn" onClick={handleUpdateQuiz}>Update Quiz</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showDelete && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show" style={{ display: 'block' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                  <div className="modal-header d-flex justify-content-between">
                    <h5 className="modal-title fw-semibold">Confirm Delete</h5>
                    <button className="custom-btn" onClick={() => { setShowDelete(false); setDeleteTarget(null); }}>X</button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2">Delete quiz: {deleteTarget?.title || deleteTarget?.name || ''}?</div>
                    <div className="text-muted small">This will deactivate the quiz.</div>
                  </div>
                  <div className="modal-footer">
                    <button className="custom-btn" onClick={() => { setShowDelete(false); setDeleteTarget(null); }}>Cancel</button>
                    <button className="custom-btn" onClick={performDelete}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizPage;
