'use client'

import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Pencil, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ENDPOINTS, MEDIA } from '@/Api'
import MainLoader from '@/app/components/MainLoader'
import ReactSelect from '@/app/components/ui/ReactSelect'
import PageHeader from "../components/PageHeader"
import PaginationComp from '../components/ui/Pagination'

type CourseItem = any

const Page = () => {
    const user = useSelector((s: RootState) => s.user)
    const [items, setItems] = useState<CourseItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [status, setStatus] = useState<string>('')
    const [query, setQuery] = useState<string>('')
    const [inProgress, setInProgress] = useState(false)
    const [skip, setSkip] = useState(0)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)

    const loadCourses = async () => {
        setError('')
        try {
            const qs = new URLSearchParams()
            if (status) qs.set('status', status)
            if (query) qs.set('q', query)
            qs.set('skip', String(skip))
            qs.set('limit', String(limit))
            const url = ENDPOINTS.COURSES.ADMIN_LIST + (qs.toString() ? `?${qs.toString()}` : '')
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
                throw new Error(err.message || 'Failed to load courses')
            }
            const data = await res.json().catch(() => ({}))
            const list = data.courses || []
            setItems(Array.isArray(list) ? list : [])
            const meta = data.meta || {}
            setTotal(meta.total || (Array.isArray(list) ? list.length : 0))
        } catch (e: any) {
            setError(e.message || 'Unexpected error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCourses()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, limit, status])

    const deactivate = async (id: string) => {
        try {
            const res = await fetch(ENDPOINTS.COURSES.DEACTIVATE(id), {
                method: 'DELETE',
                headers: {
                    ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
                },
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Failed to deactivate')
            }
            setItems((prev) => prev.map((c: any) => (c._id === id ? { ...c, isActive: false, status: 'deleted' } : c)))
        } catch (e) {
        }
    }

    const metaCount = useMemo(() => items.length, [items])

    return (
        <DashboardLayout>
            <div className="container-fluid px-4 py-3">
                <PageHeader
                    title="Courses"
                    subtitle="Manage your courses and track their progress"
                    rightContent={
                        <div className="d-flex gap-2 align-items-center">
                            <div style={{ minWidth: 200 }}>
                                <ReactSelect
                                    options={[
                                        { value: '', label: 'Status' },
                                        { value: 'published', label: 'Published' },
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'draft', label: 'Draft' },
                                    ]}
                                    value={status}
                                    onChange={setStatus}
                                />
                            </div>
                            <div className="input-group input-group-md" style={{ width: '260px' }}>
                                <span className="input-group-text bg-light border-end-0">
                                    <Search size={16} className="text-secondary" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search course..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') loadCourses() }}
                                />
                            </div>
                            <Link href="/courses/add" className="btn rounded-pill btn-primary btn-md">+ Add Course</Link>
                        </div>
                    }
                />

                {inProgress && (
                    <div className="card border-0 shadow-sm mx-4 mt-3">
                        <div className="card-body">
                            <div className="fw-semibold">Currently in progress</div>
                            <div className="text-muted small">This module API is not available yet.</div>
                        </div>
                    </div>
                )}
                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th className="text-start">Course</th>
                                <th className="text-start">Category</th>
                                <th className="text-start">Duration</th>
                                <th className="text-start">Level</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error && (
                                <tr>
                                    <td colSpan={4} className="text-danger">{error}</td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={4}><MainLoader /></td>
                                </tr>
                            )}
                            {!loading && items.length === 0 && (
                                <tr>
                                    <td colSpan={6}>No courses found</td>
                                </tr>
                            )}
                            {items.map((course: any, index: number) => (
                                <tr key={course._id || index}>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            {course.thumbnail_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={MEDIA.url(course.thumbnail_url)} alt={course.title} style={{ width: 160, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                                            ) : (
                                                <div style={{ width: 160, height: 80, borderRadius: 8, background: '#f1f3f5' }}></div>
                                            )}
                                            <div>
                                                <span className="fw-medium">{course.title}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="fw-normal">
                                        {course?.category?.name || course?.category?.title || course?.category?.category_name || (typeof course?.category === 'string' ? course.category : '-')}
                                    </td>
                                    <td className="fw-normal">
                                        {course.duration || '-'}
                                    </td>

                                    <td className="fw-normal">
                                        {course.level || '-'}
                                    </td>
                                    <td className="text-center">
                                        <span className={`${course.isActive !== false && course.status !== 'deleted' ? 'badge bg-success-subtle text-success border border-success-subtle' : 'badge bg-secondary-subtle text-secondary border border-secondary-subtle'}`}>{course.isActive !== false && course.status !== 'deleted' ? (course.status || 'published') : 'inactive'}</span>
                                    </td>
                                    <td>
                                        <div className="action-icons justify-content-center gap-3">
                                            <Link href={`/courses/${course._id || ''}`} title="Edit">
                                                <Pencil size={18}/>
                                            </Link>
                                            <Trash2 size={18} onClick={() => deactivate(course._id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <small className="text-muted">Showing {Math.min(limit, Math.max(0, total - skip))} of {total}</small>
                    <div className="d-flex gap-3 align-items-center">
                        {(() => {
                          const current = Math.floor(skip / limit) + 1
                          const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 10)))
                          return (
                            <PaginationComp
                              page={current}
                              totalPages={totalPages}
                              onChange={(p) => setSkip((p - 1) * limit)}
                            />
                          )
                        })()}
                        <div style={{ minWidth: 120 }}>
                          <ReactSelect
                            options={[{ value: '10', label: '10' }, { value: '20', label: '20' }, { value: '50', label: '50' }]}
                            value={String(limit)}
                            onChange={(v) => { setSkip(0); setLimit(parseInt(v)); }}
                          />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Page
