'use client'
import React, { useEffect, useRef, useState } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { useParams } from 'next/navigation'
import { ENDPOINTS, MEDIA, APIS } from '@/Api'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { Check, Image, SquarePen, Video } from 'lucide-react'
import ReactSelect from '@/app/components/ui/ReactSelect'
import MainLoader from '@/app/components/MainLoader'
import RichTextEditor from '@/app/components/ui/RichTextEditor'
import CenteredModal from '@/app/components/ui/CenteredModal'
import { uploadToS3 } from '@/lib/s3Upload'
import HtmlContent from '@/app/components/ui/HtmlContent'

type CourseDoc = {
  _id?: string
  title?: string
  category?: any
  status?: string
  isActive?: boolean
  chapters?: Array<{ _id?: string; title?: string; lessons?: Array<{ _id?: string; name?: string; description?: string; video_url?: string; thumbnail_url?: string }> }>
}

export default function ManageCoursePage() {
  const params = useParams()
  const id = (params?.id as string) || ''
  const user = useSelector((s: RootState) => s.user)
  const [course, setCourse] = useState<CourseDoc | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [lessonName, setLessonName] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [lessonFile, setLessonFile] = useState<File | null>(null)
  const [lessonThumb, setLessonThumb] = useState<File | null>(null)
  const [targetChapter, setTargetChapter] = useState<string>('')
  const [categories, setCategories] = useState<any[]>([])
  const [selCategory, setSelCategory] = useState<string>('')
  const [status, setStatus] = useState<string>('published')
  const [isActive, setIsActive] = useState<boolean>(true)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)
  const [showEditLesson, setShowEditLesson] = useState(false)
  const [editLesson, setEditLesson] = useState<any>(null)
  const [editLessonName, setEditLessonName] = useState('')
  const [editLessonDesc, setEditLessonDesc] = useState('')
  const [editLessonFile, setEditLessonFile] = useState<File | null>(null)
  const [editLessonThumb, setEditLessonThumb] = useState<File | null>(null)
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState<string>('')
  const [editLessonThumbUrl, setEditLessonThumbUrl] = useState<string>('')
  const editVideoInputRef = useRef<HTMLInputElement>(null)
  const editThumbInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(ENDPOINTS.COURSES.ADMIN_GET(id), {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to load course')
      }
      const data = await res.json().catch(() => ({}))
      const c = data.course || data
      setCourse(c)
      const currentCat = c?.category?._id || (typeof c?.category === 'string' ? c.category : '')
      setSelCategory(currentCat)
      setStatus(c?.status || 'published')
      setIsActive(Boolean(c?.isActive))
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(ENDPOINTS.CATEGORIES.LIST)
        const d = await res.json().catch(() => ({}))
        const list = Array.isArray(d.categories) ? d.categories : Array.isArray(d) ? d : []
        setCategories(list)
      } catch { }
    }
    run()
  }, [])

  const updateCourse = async () => {
    if (!id) return
    let tId: any
    try {
      tId = toast.loading('Updating course...')
      const payload: any = {
        category: selCategory,
        status,
        isActive,
      }
      const res = await fetch(ENDPOINTS.COURSES.UPDATE(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update course')
      }
      toast.update(tId, { render: 'Course updated', type: 'success', isLoading: false, autoClose: 1200 })
      load()
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
    }
  }

  const addChapter = async () => {
    if (!newChapterTitle) return
    let tId: any
    try {
      tId = toast.loading('Adding chapter...')
      const res = await fetch(ENDPOINTS.COURSES.ADD_CHAPTER(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ title: newChapterTitle }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to add chapter')
      }
      toast.update(tId, { render: 'Chapter added', type: 'success', isLoading: false, autoClose: 1500 })
      setNewChapterTitle('')
      load()
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
    }
  }

  const addLesson = async () => {
    if (!targetChapter) return
    let tId: any
    try {
      tId = toast.loading('Adding lesson...')

      // Upload video and thumbnail to S3 if provided
      let videoKey = ''
      let thumbnailKey = ''

      if (lessonFile) {
        toast.update(tId, { render: 'Uploading video...' })
        const uploadResult = await uploadToS3(lessonFile, undefined, `courses/${id}/lessons/videos/${Date.now()}-${lessonFile.name}`)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload video')
        }
        videoKey = uploadResult.key || ''
      }

      if (lessonThumb) {
        toast.update(tId, { render: 'Uploading thumbnail...' })
        const uploadResult = await uploadToS3(lessonThumb, undefined, `courses/${id}/lessons/thumbnails/${Date.now()}-${lessonThumb.name}`)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload thumbnail')
        }
        thumbnailKey = uploadResult.key || ''
      }

      const payload: any = {}
      if (lessonName) payload.name = lessonName
      if (lessonDesc) payload.description = lessonDesc
      if (videoKey) payload.video_url = videoKey
      if (thumbnailKey) payload.thumbnail_url = thumbnailKey

      const res = await fetch(ENDPOINTS.COURSES.ADD_LESSON(id, targetChapter), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to add lesson')
      }
      toast.update(tId, { render: 'Lesson added', type: 'success', isLoading: false, autoClose: 1500 })
      setLessonName('')
      setLessonDesc('')
      setLessonFile(null)
      setLessonThumb(null)
      setTargetChapter('')
      load()
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
    }
  }

  const openEditLesson = (ch: any, ls: any) => {
    setEditLesson({ chapterId: ch._id, lessonId: ls._id })
    setEditLessonName(ls.name || '')
    setEditLessonDesc(ls.description || '')
    setEditLessonVideoUrl(ls.video_url ? MEDIA.url(ls.video_url) : '')
    setEditLessonThumbUrl(ls.thumbnail_url ? MEDIA.url(ls.thumbnail_url) : '')
    setShowEditLesson(true)
    setEditLessonFile(null)
    setEditLessonThumb(null)
  }

  const updateLesson = async () => {
    if (!editLesson?.chapterId || !editLesson?.lessonId) return
    let tId: any
    try {
      tId = toast.loading('Updating lesson...')

      // Upload new video and thumbnail to S3 if provided
      let videoKey = ''
      let thumbnailKey = ''

      if (editLessonFile) {
        toast.update(tId, { render: 'Uploading video...' })
        const uploadResult = await uploadToS3(editLessonFile, undefined, `courses/${id}/lessons/videos/${Date.now()}-${editLessonFile.name}`)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload video')
        }
        videoKey = uploadResult.key || ''
      }

      if (editLessonThumb) {
        toast.update(tId, { render: 'Uploading thumbnail...' })
        const uploadResult = await uploadToS3(editLessonThumb, undefined, `courses/${id}/lessons/thumbnails/${Date.now()}-${editLessonThumb.name}`)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload thumbnail')
        }
        thumbnailKey = uploadResult.key || ''
      }

      const payload: any = {}
      if (editLessonName) payload.name = editLessonName
      if (editLessonDesc) payload.description = editLessonDesc
      if (videoKey) payload.video_url = videoKey
      if (thumbnailKey) payload.thumbnail_url = thumbnailKey

      const url = `${APIS.COURSES}/${id}/chapters/${editLesson.chapterId}/lessons/${editLesson.lessonId}`
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update lesson')
      }
      toast.update(tId, { render: 'Lesson updated', type: 'success', isLoading: false, autoClose: 1200 })
      setShowEditLesson(false)
      setEditLesson(null)
      setEditLessonName('')
      setEditLessonDesc('')
      setEditLessonFile(null)
      setEditLessonThumb(null)
      load()
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
    }
  }

  return (
    <DashboardLayout>
      <div className="container-fluid px-4 py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-normal mb-1">Manage Course</h4>
            <small className="text-muted">Add chapters and lessons</small>
          </div>
          <Link href="/courses" className="custom-btn">Back to Courses</Link>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {loading && <MainLoader />}

        {course && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-2">{course.title}</h5>
              <div className="row g-3 align-items-end mb-2">
                <div className="col-md-4">
                  <label className="form-label">Category</label>
                  <ReactSelect
                    options={[
                      { value: '', label: 'Select' },
                      ...categories.map((c: any) => ({ value: c._id, label: c.category_name || c.name || c.title || '' })),
                    ]}
                    value={selCategory}
                    onChange={setSelCategory}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <ReactSelect
                    options={[
                      { value: 'published', label: 'Published' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                    value={status}
                    onChange={setStatus}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Active</label>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="activeToggle" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    <label className="form-check-label" htmlFor="activeToggle">{isActive ? 'Active' : 'Inactive'}</label>
                  </div>
                </div>
              </div>
              <div>
                <button className="custom-btn" onClick={updateCourse} disabled={!selCategory}>Save Changes</button>
              </div>

              <div className="row g-3 align-items-end mt-3">
                <div className="col-md-6">
                  <label className="form-label">Chapter Title</label>
                  <input className="form-control" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <button className="custom-btn" onClick={addChapter} disabled={!newChapterTitle}>Add Chapter</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {course && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h6 className="fw-normal mb-0">Chapters & Lessons</h6>
            </div>
            <div className="card-body">
              {(course.chapters || []).length === 0 && <div className="text-muted">No chapters yet</div>}
              {(course.chapters || []).length > 0 && (
                <div className="table-wrapper">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th className="text-start">Chapter</th>
                        <th className="text-start">Lesson</th>
                        <th className="text-start">Description</th>
                        <th className="text-center">Media</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(course.chapters || []).map((ch: any) => {
                        const lessons = ch.lessons || []
                        if (lessons.length === 0) {
                          return (
                            <tr key={ch._id}>
                              <td className="fw-medium" data-label="Chapter">{ch.title}</td>
                              <td data-label="Lesson">-</td>
                              <td data-label="Description">-</td>
                              <td className="text-center" data-label="Media">-</td>
                            </tr>
                          )
                        }
                        return lessons.map((ls: any) => (
                          <tr key={ls._id}>
                            <td className="fw-medium" data-label="Chapter">{ch.title}</td>
                            <td className="fw-normal" data-label="Lesson">{ls.name}</td>
                            <td className="text-muted small" data-label="Description"><HtmlContent html={ls.description || '-'} className="text-muted small" truncate={150} /></td>
                            <td className="text-center" data-label="Media">
                              <div className="action-icons justify-content-center gap-2">
                                {ls.thumbnail_url ? <Image href={MEDIA.url(ls.thumbnail_url)} size={22} target="_blank">Thumbnail</Image> : null}
                                {ls.video_url ? <Video href={MEDIA.url(ls.video_url)} size={22} target="_blank">Video</Video> : null}
                                <SquarePen onClick={() => openEditLesson(ch, ls)} size={22}/>
                              </div>
                            </td>
                          </tr>
                        ))
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <hr />

              <div className="row g-3 align-items-end">
                <div className="col-md-6">
                  <label className="form-label">Target Chapter</label>
                  <ReactSelect
                    options={[
                      { value: '', label: 'Select' },
                      ...(course?.chapters || []).map((c: any) => ({ value: c._id, label: c.title })),
                    ]}
                    value={targetChapter}
                    onChange={setTargetChapter}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Lesson Name</label>
                  <input className="form-control" value={lessonName} onChange={(e) => setLessonName(e.target.value)} />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  <RichTextEditor value={lessonDesc} onChange={setLessonDesc} placeholder="Lesson description" height={0} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Video File</label>
                  <DottedFileBox
                    text={lessonFile ? lessonFile.name : 'Click to select video'}
                    onClick={() => videoInputRef.current?.click()}
                  />
                  <input ref={videoInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setLessonFile(e.target.files?.[0] || null)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Thumbnail Image</label>
                  <DottedFileBox
                    text={lessonThumb ? lessonThumb.name : 'Click to select image'}
                    onClick={() => thumbInputRef.current?.click()}
                  />
                  <input ref={thumbInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setLessonThumb(e.target.files?.[0] || null)} />
                </div>
                <div className="col-md-3">
                  <button className="custom-btn" onClick={addLesson} disabled={!targetChapter}>Add Lesson</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <CenteredModal
          isOpen={showEditLesson}
          title="Edit Lesson"
          onClose={() => { setShowEditLesson(false); setEditLesson(null) }}
          footer={
            <div className="d-flex justify-content-end gap-2">
              <button className="custom-btn" onClick={() => { setShowEditLesson(false); setEditLesson(null) }}>Cancel</button>
              <button className="custom-btn" onClick={updateLesson}>Update</button>
            </div>
          }
        >
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Lesson Name</label>
              <input className="form-control" value={editLessonName} onChange={(e) => setEditLessonName(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <RichTextEditor key={`edit-${editLesson?.lessonId || ''}`} value={editLessonDesc} onChange={setEditLessonDesc} placeholder="Enter description" height={0} />
            </div>
            <div className="col-md-12">
              {editLessonThumbUrl && (
                <div className="mb-2">
                  <img src={editLessonThumbUrl} alt="Thumbnail" className="img-fluid rounded" style={{ maxHeight: 140, objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <div className="col-md-12">
              <label className="form-label">Replace Thumbnail</label>
              <DottedFileBox
                text={editLessonThumb ? editLessonThumb.name : 'Click to select image'}
                onClick={() => editThumbInputRef.current?.click()}
              />
              <input ref={editThumbInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setEditLessonThumb(e.target.files?.[0] || null)} />
            </div>
            <div className="col-md-6">
              {editLessonVideoUrl && (
                <div className="mb-2">
                  <video src={editLessonVideoUrl} style={{ width: '100%' }} />
                </div>
              )}
            </div>
            <div className="col-md-12">
              <label className="form-label">Replace Video</label>
              <DottedFileBox
                text={editLessonFile ? editLessonFile.name : 'Click to select video'}
                onClick={() => editVideoInputRef.current?.click()}
              />
              <input ref={editVideoInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setEditLessonFile(e.target.files?.[0] || null)} />
            </div>

          </div>
        </CenteredModal>
      </div>
    </DashboardLayout>
  )
}

function DottedFileBox({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <div
      className="bg-light"
      style={{
        border: '2px dashed #adb5bd',
        borderRadius: 12,
        padding: '14px',
        cursor: 'pointer',
        textAlign: 'center',
      }}
      onClick={onClick}
    >
      {text}
    </div>
  )
}
