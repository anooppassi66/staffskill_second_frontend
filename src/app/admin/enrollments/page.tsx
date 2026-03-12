'use client'

import React, { useEffect, useState } from 'react'
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

  const loadPending = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(ENDPOINTS.ENROLLMENTS.PENDING, {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      })
      if (!res.ok) {
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

  useEffect(() => {
    loadPending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const approve = async (enrollmentId: string) => {
    let tId: any
    try {
      tId = toast.loading('Approving request...')
      const res = await fetch(ENDPOINTS.ENROLLMENTS.APPROVE(enrollmentId), {
        method: 'POST',
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
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

  return (
    <DashboardLayout>
      <div className="container-fluid px-4 py-3">
        <PageHeader title="Pending Enrollment Requests" subtitle="Approve employee course access requests" />

        {loading && <MainLoader />}
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
