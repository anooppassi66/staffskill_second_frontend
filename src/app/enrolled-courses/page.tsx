"use client"
import React, { useEffect, useMemo, useState } from 'react';
import { Course } from '../types/course';
import PaginationComp from '../components/ui/Pagination';
import MainLoader from '@/app/components/MainLoader';
import EnrolledCourseCard from '../components/EnrolledCourseCard';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ENDPOINTS, MEDIA } from '@/Api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

  const EnrolledCoursesDashboard: React.FC = () => {
    const user = useSelector((s: RootState) => s.user)
    const router = useRouter()
    const [items, setItems] = useState<Course[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [inProgress, setInProgress] = useState(false)
    const [activeTab, setActiveTab] = useState<'Pending' | 'Active' | 'Completed'>('Active')
    const [currentPage, setCurrentPage] = useState(1)
    const [enrolledCount, setEnrolledCount] = useState(0)
    const [activeCount, setActiveCount] = useState(0)
    const [completedCount, setCompletedCount] = useState(0)
    const [quizReadyCourses, setQuizReadyCourses] = useState<Array<{ id: string; title: string }>>([])
    const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
    const [rawList, setRawList] = useState<any[]>([])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(ENDPOINTS.ENROLLMENTS.ME, {
                    headers: {
                        ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
                    },
                })
                if (!res.ok) {
                    if (res.status === 404 || res.status === 501 || res.status === 503) {
                        setInProgress(true)
                    }
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err.message || 'Failed to load enrollments')
                }
                const data = await res.json().catch(() => ({}))
                const list = Array.isArray(data.enrollments) ? data.enrollments : Array.isArray(data.courses) ? data.courses : Array.isArray(data) ? data : []
                setRawList(list)
                setEnrolledCount(list.length || 0)
                setCompletedCount(list.filter((en: any) => !!en?.isCompleted).length || 0)
                setActiveCount(Math.max(0, (list.length || 0) - (list.filter((en: any) => !!en?.isCompleted).length || 0)))
                const ready = list.filter((en: any) => !!en?.readyForQuiz && !en?.isCompleted).map((en: any) => ({
                    id: en?.course?._id || en?.course?.id || en?.course || '',
                    title: en?.course?.title || ''
                })).filter((x: any) => x.id)
                setQuizReadyCourses(ready)
            } catch (e: any) {
                setError(e.message || 'Unexpected error')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user.token])

    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await fetch(ENDPOINTS.CATEGORIES.LIST)
                const data = await res.json().catch(() => ({}))
                const arr = Array.isArray(data.categories) ? data.categories : Array.isArray(data) ? data : []
                const map: Record<string, string> = {}
                arr.forEach((c: any) => {
                    const id = c?._id || c?.id
                    const name = c?.category_name || c?.name || c?.title
                    if (id && name) map[id] = name
                })
                setCategoryMap(map)
            } catch {}
        }
        loadCats()
    }, [])

    useEffect(() => {
        const mapped: Course[] = rawList.map((it: any) => {
            const c = it.course || it
            const rawStatus = String(it?.status || '').toLowerCase()
            const status: 'Pending' | 'Active' | 'Completed' =
                it?.isCompleted
                ? 'Completed'
                : rawStatus === 'pending'
                  ? 'Pending'
                  : 'Active'
            const catName =
                c?.category?.name || c?.category?.title || c?.category?.category_name ||
                (typeof c?.category === 'string' ? (categoryMap[c.category] || '-') : '-')
            return {
                id: c?._id || c?.id || '',
                image: MEDIA.url(c?.course_image || c?.thumbnail_url) || '/assets/default.png',
                category: catName,
                author: c?.author || '',
                title: c?.title || 'Untitled',
                rating: 0,
                reviews: 0,
                price: 0,
                status,
            }
        })
        setItems(mapped)
    }, [rawList, categoryMap])

    const tabs = useMemo(() => ([
        { key: 'Pending', label: 'Pending', count: items.filter(c => c.status === 'Pending').length },
        { key: 'Active', label: 'Active', count: items.filter(c => c.status === 'Active').length },
        { key: 'Completed', label: 'Completed', count: items.filter(c => c.status === 'Completed').length },
    ]), [items])

    const coursesPerPage = 9
    const filteredCourses = items.filter(course => course.status === activeTab)
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage) || 1
    const startIndex = (currentPage - 1) * coursesPerPage
    const endIndex = startIndex + coursesPerPage
    const coursesToDisplay = filteredCourses.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleTabChange = (tab: 'Pending' | 'Active' | 'Completed') => {
        setActiveTab(tab)
        setCurrentPage(1)
    }

    const Pagination = () => (
        <PaginationComp page={currentPage} totalPages={totalPages} onChange={handlePageChange} />
    )

    return (
        <DashboardLayout>
            <h5 className="mb-4">Enrolled Courses</h5>
            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="card summary-card card-enrolled main-border h-100 shadow-sm">
                        <div className="card-body d-flex align-items-center">
                            <div>
                                <h5 className="mb-0 fw-500">{enrolledCount}</h5>
                                <p className="text-muted small mb-0">Enrolled</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card summary-card card-active main-border h-100 shadow-sm">
                        <div className="card-body d-flex align-items-center">
                            <div>
                                <h5 className="mb-0 fw-500">{activeCount}</h5>
                                <p className="text-muted small mb-0">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card summary-card card-completed main-border h-100 shadow-sm">
                        <div className="card-body d-flex align-items-center">
                            <div>
                                <h5 className="mb-0 fw-500">{completedCount}</h5>
                                <p className="text-muted small mb-0">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {inProgress && (
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                        <div className="fw-semibold">Currently in progress</div>
                        <div className="text-muted small">This module API is not available yet.</div>
                    </div>
                </div>
            )}

            {quizReadyCourses.length > 0 && (
                <div className="alert alert-info d-flex justify-content-between align-items-center">
                    <div>
                        <div className="fw-semibold">Quizzes ready</div>
                        <div className="text-muted small">You can take quizzes for completed lessons</div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        {quizReadyCourses.slice(0, 3).map((q) => (
                            <button
                                key={q.id}
                                className="custom-btn"
                                onClick={async () => {
                                    try {
                                        const qs = new URLSearchParams()
                                        qs.set('limit', '1')
                                        qs.set('course', q.id || '')
                                        const res = await fetch(ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`, {
                                            headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) }
                                        })
                                        const d = await res.json().catch(() => ({}))
                                        const list = Array.isArray(d.quizzes) ? d.quizzes : Array.isArray(d.items) ? d.items : []
                                        const target = list[0]
                                        const quizId = target?._id || target?.id
                                        router.push(quizId ? `/quiz/${quizId}` : `/quiz?course=${q.id}`)
                                    } catch {
                                        router.push(`/quiz?course=${q.id}`)
                                    }
                                }}
                            >
                                Take Quiz: {q.title || 'Course'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ul className="nav nav-pills course-tabs">
                {tabs.map(tab => (
                    <li className="nav-item" key={tab.key}>
                        <a className={`nav-link ${activeTab === (tab.key as any) ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); handleTabChange(tab.key as 'Pending' | 'Active' | 'Completed'); }}>
                            {tab.label} ({String(tab.count).padStart(2, '')})
                        </a>
                    </li>
                ))}
            </ul>
            <hr className='main-border'/>
            <br/>
            <div className="row g-4">
                {loading && (
                    <div className="col-12"><MainLoader /></div>
                )}
                {error && !loading && (
                    <div className="col-12"><p className="text-center text-danger">{error}</p></div>
                )}
                {!loading && !error && coursesToDisplay.length > 0 && (
                    coursesToDisplay.map((course: any) => (
                        <div key={course.id} className="col-12 col-md-6 col-lg-4">
                            <EnrolledCourseCard course={course} />
                        </div>
                    ))
                )}
                {!loading && !error && coursesToDisplay.length === 0 && (
                    <div className="col-12">
                        <EmptyState title="No courses found" subtitle={`You don't have ${activeTab.toLowerCase()} courses yet.`} />
                    </div>
                )}
            </div>

            {totalPages > 1 && <Pagination />}

            <p className="mt-4 text-end text-muted small">Page {currentPage} of {totalPages}</p>

        </DashboardLayout>
    )
}

export default EnrolledCoursesDashboard
