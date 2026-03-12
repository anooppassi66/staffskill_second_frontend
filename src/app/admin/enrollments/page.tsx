'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/app/components/DashboardLayout'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ENDPOINTS } from '@/Api'
import { toast } from 'react-toastify'
import MainLoader from '@/app/components/MainLoader'
import PageHeader from '@/app/components/PageHeader'

type PendingEnrollment = {
  _id: string
  status: string
  requestedAt?: string
  user?: {
    _id: string
    email?: string
    first_name?: string
    last_name?: string
  }
  course?: {
    _id: string
    title?: string
  }
}

export default function AdminEnrollmentRequestsPage() {
  const user = useSelector((s: RootState) => s.user)
  const [pending, setPending] = useState<PendingEnrollment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unauthorized, setUnauthorized] = useState(false)

  const [employees, setEmployees] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [enrollLoading, setEnrollLoading] = useState(false)

  const router = useRouter()

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null
    const raw = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.split('=')[1] ?? null
    if (!raw) return null
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const setCookie = (name: string, value: string, maxAgeSeconds = 60) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`
  }

  const token = user.token || getCookie('auth_token') || ''
  const role = (user.role || getCookie('auth_role') || '').toString().toLowerCase()
  const isAdmin = role.includes('admin')

  const loadPending = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(ENDPOINTS.ENROLLMENTS.PENDING, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setCookie('auth_redirect', '/admin/enrollments')
          router.push('/admin?redirect=/admin/enrollments')
          return
        }
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to load pending enrollments')
      }
      const data = await res.json().catch(() => ({}))
      const list = Array.isArray(data.enrollments) ? data.enrollments : []
      setPending(list)
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const loadLookupData = async () => {
    try {
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
      const [empRes, courseRes] = await Promise.all([
        fetch(ENDPOINTS.ADMIN.LIST_EMPLOYEES, { headers }),
        fetch(ENDPOINTS.COURSES.ADMIN_LIST, { headers }),
      ])

      if (empRes.ok) {
        const empData = await empRes.json().catch(() => ({}))
        setEmployees(Array.isArray(empData.employees) ? empData.employees : [])
      }
      if (courseRes.ok) {
        const courseData = await courseRes.json().catch(() => ({}))
        setCourses(Array.isArray(courseData.courses) ? courseData.courses : [])
      }
    } catch (e) {
      // ignore lookup failures - the main pending list is the priority
      // console.warn('Failed to load lookups', e)
    }
  }

  useEffect(() => {
    const role = (user.role || '').toString().toLowerCase()
    if (!token) {
      const redirectTo = '/admin/enrollments'
      setCookie('auth_redirect', redirectTo)
      router.push(`/admin?redirect=${encodeURIComponent(redirectTo)}`)
      return
    }
    if (!isAdmin) {
      setUnauthorized(true)
      return
    }

    loadPending()
    loadLookupData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.token, user.role])

  const approve = async (enrollmentId: string) => {
    let tId: any
    try {
      tId = toast.loading('Approving request...')
      const res = await fetch(ENDPOINTS.ENROLLMENTS.APPROVE(enrollmentId), {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to approve')
      }
      toast.update(tId, { render: 'Enrollment approved', type: 'success', isLoading: false, autoClose: 1500 })
      loadPending()
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
    }
  }

  const enrollEmployee = async () => {
    if (!selectedCourse || !selectedEmployee) {
      toast.error('Please select a course and an employee to enroll')
      return
    }

    let tId: any
    try {
      setEnrollLoading(true)
      tId = toast.loading('Enrolling employee...')
      const res = await fetch(ENDPOINTS.ENROLLMENTS.ENROLL_EMPLOYEE(selectedCourse, selectedEmployee), {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to enroll')
      }
      toast.update(tId, { render: 'Employee enrolled successfully', type: 'success', isLoading: false, autoClose: 1500 })
      setSelectedCourse('')
      setSelectedEmployee('')
      loadPending()
    } catch (e: any) {
      if (tId) toast.update(tId, { render: e.message || 'Enrollment failed', type: 'error', isLoading: false, autoClose: 3000 })
    } finally {
      setEnrollLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container-fluid px-4 py-3">
        <PageHeader title="Pending Enrollment Requests" subtitle="Approve employee course access requests" />

        {!unauthorized && (
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body">
              <h5 className="card-title">Enroll Employee</h5>
              <div className="row g-2 align-items-end">
                <div className="col-md-5">
                  <label className="form-label">Employee</label>
                  <select className="form-select" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                    <option value="">Select an employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {`${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || emp.user_name || emp._id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label">Course</label>
                  <select className="form-select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title || course._id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-grid">
                  <button className="custom-btn" disabled={enrollLoading} onClick={enrollEmployee}>
                    {enrollLoading ? 'Enrolling...' : 'Enroll'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && <MainLoader />}
        {unauthorized && <div className="alert alert-warning">You are not authorized to view this page.</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              {pending.length === 0 ? (
                <div className="text-muted">No pending enrollment requests.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Course</th>
                        <th>Requested</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map((item) => {
                        const userName = item.user ? `${item.user.first_name || ''} ${item.user.last_name || ''}`.trim() : ''
                        const email = item.user?.email || ''
                        const courseTitle = item.course?.title || ''
                        const requested = item.requestedAt ? new Date(item.requestedAt).toLocaleString() : ''
                        return (
                          <tr key={item._id}>
                            <td>
                              <div className="fw-semibold">{userName || email || 'Unknown'}</div>
                              {email && <div className="text-muted small">{email}</div>}
                            </td>
                            <td>
                              <div className="fw-semibold">{courseTitle || 'Unknown course'}</div>
                              <div className="text-muted small">ID: {item.course?._id || '-'}</div>
                            </td>
                            <td>{requested || '-'}</td>
                            <td className="text-end">
                              <button className="custom-btn" onClick={() => approve(item._id)}>
                                Approve
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
