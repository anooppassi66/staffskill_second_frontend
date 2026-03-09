'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ENDPOINTS, MEDIA } from '@/Api'
import { toast } from 'react-toastify'
import { GraduationCap, BookOpen, CheckCircle2, Users, Library, Gauge } from 'lucide-react'
import Image from 'next/image'
import MainLoader from '@/app/components/MainLoader'
import PageHeader from '../components/PageHeader'

type Metrics = {
  enrolledCourses: number
  activeCourses: number
  avgCoursesCompleted: number
  totalEmployees: number
  totalCourses: number
  employeeCompletionPercentage: number
}

type RecentCourse = {
  id: string
  title: string
  status: string
  enrolled: number
  thumbnail?: string | null
}

export default function AdminDashboardPage() {
  const user = useSelector((s: RootState) => s.user)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [recent, setRecent] = useState<RecentCourse[]>([])
  const [recentDetails, setRecentDetails] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inProgress, setInProgress] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    let tId: any
    try {
      const res = await fetch(ENDPOINTS.ADMIN.DASHBOARD, {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      })
      if (!res.ok) {
        if (res.status === 404 || res.status === 501 || res.status === 503) {
          setInProgress(true)
        }
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to load dashboard')
      }
      const data = await res.json().catch(() => ({}))
      setMetrics(data.metrics)
      const base = Array.isArray(data.recentCourses) ? data.recentCourses : []
      setRecent(base)
      const details = await Promise.all(base.map(async (rc: any) => {
        try {
          const r = await fetch(ENDPOINTS.COURSES.ADMIN_GET(rc.id), { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } })
          const d = await r.json().catch(() => ({}))
          const c = d?.course || d || {}
          return {
            id: rc.id,
            title: c.title || rc.title,
            org: (c.category?.name || c.author || ''),
            desc: c.description || '',
            thumb: MEDIA.url(c.course_image || ''),
            due: c.applicationDueDate || '',
            pub: c.createdAt || c.created_at || rc.createdAt || rc.created_at || '',
          }
        } catch {
          return { id: rc.id, title: rc.title, org: '', desc: '', thumb: MEDIA.url(''), due: '', pub: rc.createdAt || rc.created_at || '' }
        }
      }))
      setRecentDetails(details)
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Card = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) => (
    <div className="card border-0 shadow-sm" style={{ background : 'rgba(1, 138, 120, .56)'}}>
      <div className="card-body d-flex align-items-center">
        <div className="rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, background: color }}>
          {icon}
        </div>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fs-5 fw-normal">{typeof value === 'number' ? String(value).padStart(2, '0') : value}</div>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="container-fluid px-4 py-3">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Monitor all courses and employee across plateform"
          rightContent={<></>
          }
        />
        {inProgress && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="fw-semibold">Currently in progress</div>
              <div className="text-muted small">This module API is not available yet.</div>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {loading && <MainLoader />}

        {metrics && (
          <div className="row g-3 mb-4">
            <div className="col-md-4 col-sm-6"><Card icon={<GraduationCap size={20} />} label="Enrolled Courses" value={metrics.enrolledCourses} color="none" /></div>
            <div className="col-md-4 col-sm-6"><Card icon={<BookOpen size={20} />} label="Active Courses" value={metrics.activeCourses} color="none" /></div>
            <div className="col-md-4 col-sm-6"><Card icon={<CheckCircle2 size={20} />} label="Avg Courses Completed" value={metrics.avgCoursesCompleted} color="none" /></div>
            <div className="col-md-4 col-sm-6"><Card icon={<Users size={20} />} label="Total Employees" value={metrics.totalEmployees} color="none" /></div>
            <div className="col-md-4 col-sm-6"><Card icon={<Library size={20} />} label="Total Courses" value={metrics.totalCourses} color="none" /></div>
            <div className="col-md-4 col-sm-6"><Card icon={<Gauge size={20} />} label="Course Completion Percentage" value={`${metrics.employeeCompletionPercentage}%`} color="none" /></div>
          </div>
        )}

        <div className="card border-0">
          <PageHeader
            title="Recently Created Courses"
            subtitle="All recently created courses with enrolled count"
            rightContent={<></>
            }
          />

          <div className="">
            <div className="row">
              {recentDetails.map((c) => {
                const dueText = c.due ? new Date(c.due).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''
                const pubText = c.pub ? new Date(c.pub).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''
                return (
                  <div className="col-lg-4 col-md-6 mb-3" key={c.id}>
                    <div className="card info-card shadow-sm border-0 h-100">
                      {c.thumb ? (
                        <img src={c.thumb} alt={c.title} className="info-card-logo" />
                      ) :
                        <img src="/assets/default.png" alt={c.title} className="info-card-logo" />
                      }
                      <div>
                        <div className="info-card-org">{c.org || '-'}</div>
                        <h6 className="info-card-title mb-1">{c.title}</h6>
                        {c.desc && <p className="info-card-desc mb-2">{c.desc}</p>}
                        {dueText && <div className="info-card-footer">Application due {dueText}</div>}
                        {pubText && <div className="info-card-footer mt-3">Publish at {pubText}</div>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {!loading && recentDetails.length === 0 && (
                <div className="col-12"><div className="text-muted">No recent courses</div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
