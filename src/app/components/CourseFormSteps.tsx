'use client'
import React, { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, CircleX } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ENDPOINTS } from '@/Api'
import ReactSelect from '../components/ui/ReactSelect'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { uploadToS3 } from '@/lib/s3Upload'
import RichTextEditor from '../components/ui/RichTextEditor'

const CourseFormSteps: React.FC = () => {
  const user = useSelector((s: RootState) => s.user)
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [language, setLanguage] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [description, setDescription] = useState('')
  const [courseImage, setCourseImage] = useState<File | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [courseId, setCourseId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const router = useRouter()
  const nextStep = () => {}
  const prevStep = () => {}

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(ENDPOINTS.CATEGORIES.LIST)
        const data = await res.json().catch(() => ({}))
        const list = data.categories || data || []
        setCategories(Array.isArray(list) ? list : [])
      } catch {}
    }
    loadCategories()
  }, [])

  const createCourse = async () => {
    setError('')
    setSuccess('')
    if (!title || !category) {
      setError('Title and category required')
      return
    }
    let tId: any
    try {
      tId = toast.loading('Creating course...')

      // Upload course image to S3 if provided
      let courseImageKey = ''
      if (courseImage) {
        toast.update(tId, { render: 'Uploading course image...' })
        const uploadResult = await uploadToS3(courseImage, undefined, `courses/images/${Date.now()}-${courseImage.name}`)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload course image')
        }
        courseImageKey = uploadResult.key || ''
      }
      const payload: any = {
        title,
        category,
        status: 'published',
      }
      if (level) payload.level = level
      if (language) payload.language = language
      if (shortDesc) payload.short_description = shortDesc
      if (description) payload.description = description
      if (courseImageKey) payload.course_image = courseImageKey

      const res = await fetch(ENDPOINTS.COURSES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create course')
      }
      const data = await res.json().catch(() => ({}))
      const c = data.course || data
      setCourseId(c._id || '')
      toast.update(tId, { render: 'Course created', type: 'success', isLoading: false, autoClose: 1500 })
      router.push('/courses')
      setSuccess('Course created successfully')
    } catch (e: any) {
      if (tId) {
        toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
      setError(e.message || 'Unexpected error')
    }
  }

  const addDefaultChapters = async () => {
    if (!courseId) {
      setStep(1)
      return
    }
    const defaults = [
      'Introduction of Digital Marketing',
      'Installing Development Software',
      'Describe SEO Engine',
      'Hello World Project from GitHub',
    ]
    try {
      for (const t of defaults) {
        await fetch(ENDPOINTS.COURSES.ADD_CHAPTER(courseId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
          body: JSON.stringify({ title: t }),
        })
      }
    } catch {}
    setStep(3)
  }

  return (
    <div className=" ">
      <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="card-header bg-white border-0 pt-4 pb-3 px-4">
          <h5 className="fw-normal mb-0 text-dark">Add New Course</h5>
        </div>

        <div className="card-body px-4 pb-4">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}&nbsp;
              <CircleX onClick={() => setError('')}/>
            </div>
          )}
          

          {/* Step 1: Basic Info */}
          {
            <>
              <h6 className="fw-normal mb-3 text-dark">Basic Information</h6>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  createCourse()
                }}
              >
              <div className="row g-3 mb-3">
                <div className="col-md-12">
                  <label className="form-label">Course Title <span className="text-danger">*</span></label>
                  <input className="form-control" placeholder="Enter course title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Course Category <span className="text-danger">*</span></label>
                  <ReactSelect
                    options={[{ value: '', label: 'Select' }, ...categories.map((c) => ({ value: c._id, label: c.category_name || c.name }))]}
                    value={category}
                    onChange={setCategory}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Course Level <span className="text-danger">*</span></label>
                  <ReactSelect
                    options={[
                      { value: '', label: 'Select' },
                      { value: 'Easy', label: 'Easy' },
                      { value: 'Intermediate', label: 'Intermediate' },
                      { value: 'Hard', label: 'Hard' },
                    ]}
                    value={level}
                    onChange={setLevel}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Language <span className="text-danger">*</span></label>
                  <ReactSelect
                    options={[
                      { value: '', label: 'Select' },
                      { value: 'English', label: 'English' },
                      { value: 'Hindi', label: 'Hindi' },
                    ]}
                    value={language}
                    onChange={setLanguage}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Short Description <span className="text-danger">*</span></label>
                <textarea className="form-control" rows={2} placeholder="Enter short description" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label">Course Description <span className="text-danger">*</span></label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter detailed course description"
                  height={0}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Course Image</label>
                <DottedFileBox text={courseImage ? courseImage.name : 'Click to select image'} onClick={() => document.getElementById('courseImageInput')?.click()} />
                <input id="courseImageInput" type="file" style={{ display: 'none' }} onChange={(e) => setCourseImage(e.target.files?.[0] || null)} />
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="custom-btn px-4" disabled={loading}>
                  Create
                </button>
              </div>
              </form>
            </>
          }

          
        </div>
      </div>
    </div>
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
export default CourseFormSteps
