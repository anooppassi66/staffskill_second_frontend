"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  GraduationCap, // Enrolled Courses
  BookOpen, // Active Courses
  CheckSquare, // Completed Courses
  FileText, // Invoice Icon
  LucideIcon,
} from "lucide-react";
import DashboardLayout from "./components/DashboardLayout";
import CourseraButton from "./components/ui/CourseraButton";
import AdminDashboardPage from "./admin-dashboard/page";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ENDPOINTS, MEDIA } from "@/Api";
import MainLoader from "@/app/components/MainLoader";
import ReactSelect from "./components/ui/ReactSelect";
import PaginationComp from "./components/ui/Pagination";
import HtmlContent from "./components/ui/HtmlContent";

// ---------- TYPES ----------
interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  colorClass: string;
}

interface CourseCardProps {
  id: string;
  imageSrc: string;
  category: string;
  title: string;
  author: string;
  reviews: {
    rating: number;
    count: number;
  };
  price: string | number;
  discount?: string | null;
}

// ---------- COMPONENTS ----------
const SummaryCard: React.FC<SummaryCardProps> = ({
  icon: Icon,
  title,
  value,
  colorClass,
}) => (
  <div className="col-md-4 col-sm-6 mb-4">
    <div
      className={`card summary-card ${colorClass} main-border h-100 shadow-sm`}
    >
      <div className="card-body d-flex align-items-center">
        <div className="summary-icon me-3">
          <Icon size={24} />
        </div>
        <div>
          <h5 className="mb-0 fw-500">{value}</h5>
          <p className="text-muted small mb-0">{title}</p>
        </div>
      </div>
    </div>
  </div>
);

const CourseCard: React.FC<CourseCardProps & { desc?: string; due?: string; progress?: number }> = ({
  imageSrc,
  category,
  title,
  author,
  id,
  reviews,
  price,
  discount,
  desc,
  due,
  progress,
}) => {
  const router = useRouter();
  const user = useSelector((s: RootState) => s.user)
  const cookieRole = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )auth_role=([^;]+)/)?.[1] || null) : null
  const role = user.role ?? cookieRole
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card info-card shadow-sm border-0 h-100">
        <Image src={imageSrc} alt={title} width={96} height={96} className="info-card-logo" unoptimized />
        <div>
          <div className="info-card-org d-flex justify-content-end">{category}</div>
          <h6 className="info-card-title mb-1">
            <Link href={`/enrolled-courses/${id}`} className="text-decoration-none text-dark">
              {title}
            </Link>
          </h6>
          {desc && <HtmlContent className="info-card-desc mb-2" html={desc} truncate={150} />}
          {due && <div className="info-card-footer">Application due {due}</div>}
          {typeof progress === 'number' && (
            <div className="mb-3">
              <div className="progress" style={{ height: 6 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="d-flex justify-content-between">
                <small className="text-muted">Progress</small>
                <small className="text-muted">{Math.max(0, Math.min(100, progress))}%</small>
              </div>
            </div>
          )}
          {role === 'employee' && (
            <div className="mt-4 mb-3 d-flex justify-content-end">
              <button className="custom-btn" onClick={() => router.push(`/enrolled-courses/${id}`)}>View Course</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- MAIN DASHBOARD ----------
const DashboardContent: React.FC = () => {
  const user = useSelector((s: RootState) => s.user)
  const router = useRouter()
  const [enrolled, setEnrolled] = useState<any[]>([])
  const [newCourses, setNewCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inProgress, setInProgress] = useState(false)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [enrolledCount, setEnrolledCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [quizReady, setQuizReady] = useState<Array<{ id: string; title: string }>>([])
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
  const [newSearch, setNewSearch] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newPage, setNewPage] = useState(1)
  const newPerPage = 6
  const [newTotal, setNewTotal] = useState(0)
  const categoryOptions = [{ value: '', label: 'All' }, ...Object.entries(categoryMap).map(([id, name]) => ({ value: id, label: name }))]
  const enrolledIds = new Set((enrolled || []).map((it: any) => it?._id || it?.id || it))
  const newFiltered = newCourses.filter((c: any) => {
    const t = (c?.title || '').toLowerCase()
    const d = (c?.description || '').toLowerCase()
    const s = newSearch.toLowerCase()
    const matchesSearch = !s || t.includes(s) || d.includes(s)
    if (!newCategory) return matchesSearch
    const catId = c?.category?._id || (typeof c?.category === 'string' ? c.category : '')
    const id = c?._id || c?.id || ''
    const notTaken = id ? !enrolledIds.has(id) : true
    return matchesSearch && String(catId) === String(newCategory) && notTaken
  })
  const newTotalPages = Math.max(1, Math.ceil((newFiltered.length || 0) / newPerPage))
  const newStartIndex = (newPage - 1) * newPerPage
  const newItemsToDisplay = newFiltered.slice(newStartIndex, newStartIndex + newPerPage)

  useEffect(() => {
    const load = async () => {
      if (!user.token) return
      setLoading(true)
      setError('')
      try {
        const [enRes, pubRes, empRes] = await Promise.all([
          fetch(ENDPOINTS.ENROLLMENTS.ME, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } }),
          fetch(ENDPOINTS.COURSES.PUBLIC_LIST, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } }),
          fetch(ENDPOINTS.EMPLOYEE.DASHBOARD, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } }),
        ])
        if (!enRes.ok || !pubRes.ok || !empRes.ok) {
          const codes = [enRes.status, pubRes.status, empRes.status]
          if (codes.includes(404) || codes.includes(501) || codes.includes(503)) {
            setInProgress(true)
          }
        }
        let eList: any[] = []
        if (enRes.ok) {
          const enData = await enRes.json().catch(() => ({}))
          const raw = Array.isArray(enData.enrollments) ? enData.enrollments : Array.isArray(enData.courses) ? enData.courses : Array.isArray(enData) ? enData : []
          eList = raw.map((it: any) => it.course || it)
          setEnrolledCount(raw.length || 0)
          const completed = raw.filter((en: any) => !!en?.isCompleted).length || 0
          setCompletedCount(completed)
          setActiveCount(Math.max(0, (raw.length || 0) - completed))
          const ready = raw.filter((en: any) => !!en?.readyForQuiz && !en?.isCompleted).map((en: any) => ({
            id: en?.course?._id || en?.course?.id || en?.course || '',
            title: en?.course?.title || ''
          })).filter((x: any) => x.id)
          setQuizReady(ready)
        }
        let pList: any[] = []
        if (pubRes.ok) {
          const pubData = await pubRes.json().catch(() => ({}))
          pList = Array.isArray(pubData.courses) ? pubData.courses : Array.isArray(pubData) ? pubData : []
        }
        if (empRes.ok) {
          const empData = await empRes.json().catch(() => ({}))
          const items = Array.isArray(empData.dashboard) ? empData.dashboard : []
          const map: Record<string, number> = {}
          items.forEach((it: any) => {
            const cid = it?.course?.id || it?.course?._id || it?.course || ''
            if (cid) map[cid] = typeof it?.progress === 'number' ? it.progress : 0
          })
          setProgressMap(map)
        }
        setEnrolled(eList)
        setNewCourses(pList)
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
        const list = Array.isArray(data.categories) ? data.categories : Array.isArray(data) ? data : []
        const map: Record<string, string> = {}
        list.forEach((c: any) => {
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
    const loadNew = async () => {
      if (!user.token) return
      try {
        const qs = new URLSearchParams()
        if (newSearch) qs.set('q', newSearch)
        if (newCategory) qs.set('category', newCategory)
        qs.set('skip', String((newPage - 1) * newPerPage))
        qs.set('limit', String(newPerPage))
        const res = await fetch(ENDPOINTS.COURSES.PUBLIC_LIST + `?${qs.toString()}`, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } })
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data.courses) ? data.courses : Array.isArray(data) ? data : []
        setNewCourses(list)
        const meta = data.meta || {}
        setNewTotal(meta.total || (Array.isArray(list) ? list.length : 0))
      } catch {}
    }
    loadNew()
  }, [user.token, newSearch, newCategory, newPage])

  return (
    <DashboardLayout>
      <div className="">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 className="fw-normal mb-1">Dashboard</h4>
              <p className="text-muted small mb-0">Overview of your courses and progress</p>
            </div>
          </div>

          {inProgress && (
            <div className="alert alert-info mb-3">
              <div className="fw-semibold">Currently in progress</div>
              <div className="text-muted small">This module API is not available yet.</div>
            </div>
          )}

          {quizReady.length > 0 && (
            <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
              <div>
                <div className="fw-semibold">Quizzes ready</div>
                <div className="text-muted small">You can take quizzes for completed lessons</div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {quizReady.slice(0, 3).map((q) => (
                  <button
                    key={q.id}
                    className="custom-btn"
                    onClick={async () => {
                      const qs = new URLSearchParams()
                      qs.set('limit', '1')
                      qs.set('course', q.id)
                      const res = await fetch(ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`, {
                        headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) }
                      })
                      const d = await res.json().catch(() => ({}))
                      const list = Array.isArray(d.quizzes) ? d.quizzes : Array.isArray(d.items) ? d.items : []
                      const target = list[0]
                      const quizId = target?._id || target?.id
                      if (quizId) {
                        router.push(`/quiz/${quizId}`)
                      } else {
                        // no quiz found for course
                      }
                    }}
                  >
                    Take Quiz: {q.title || 'Course'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="row">
            <SummaryCard
              icon={GraduationCap}
              title="Enrolled Courses"
              value={enrolledCount}
              colorClass="card-enrolled"
            />
            <SummaryCard
              icon={BookOpen}
              title="Active Courses"
              value={activeCount}
              colorClass="card-active"
            />
            <SummaryCard
              icon={CheckSquare}
              title="Completed Courses"
              value={completedCount}
              colorClass="card-completed"
            />
          </div>

          <h5 className="mt-2 mb-4 fw-500">Recently Enrolled Courses</h5>
          <div className="row">
            {loading ? (
              <div className="col-12"><MainLoader /></div>
            ) : error ? (
              <div className="col-12"><p className="text-danger">{error}</p></div>
            ) : enrolled?.filter((c: any) => c?.status === 'active' || c?.isActive === true).length > 0 ? (
              enrolled?.filter((c: any) => c?.status === 'active' || c?.isActive === true).slice(0, 3).map((c: any, idx: number) => (
                <CourseCard
                  id={c._id || c.id || ''}
                  key={(c._id || c.id || idx) + '-enrolled'}
                  imageSrc={MEDIA.url(c.course_image || '') || "/assets/default.png"}
                  category={
                    c?.category?.name || c?.category?.title || c?.category?.category_name ||
                    (typeof c?.category === 'string' ? (categoryMap[c.category] || '-') : '-')
                  }
                  title={c.title || 'Untitled'}
                  author={c.author || ''}
                  reviews={{ rating: 0, count: 0 }}
                  price={''}
                  desc={c.description || ''}
                  due={c.applicationDueDate ? new Date(c.applicationDueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  progress={progressMap[c._id || c.id || ''] ?? undefined}
                />
              ))
            ) : (
              <div className="col-12"><p className="text-muted">Not enrolled any courses yet</p></div>
            )}
          </div>

          <h5 className="mt-4 mb-4 fw-500">New Courses</h5>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Search</label>
              <input className="form-control" placeholder="Search courses" value={newSearch} onChange={(e) => { setNewSearch(e.target.value); setNewPage(1) }} />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Category</label>
              <ReactSelect options={categoryOptions} value={newCategory} onChange={(v) => { setNewCategory(v); setNewPage(1) }} />
            </div>
            <div className="col-12 col-md-2 d-flex justify-content-md-end">
              <button className="custom-btn w-100" onClick={() => { setNewSearch(''); setNewCategory(''); setNewPage(1) }}>Clear Filters</button>
            </div>
          </div>
          <div className="row">
            {newCourses.length > 0 ? (
              newItemsToDisplay.map((c: any, idx: number) => (
                <CourseCard
                  id={c._id || c.id || ''}
                  key={(c._id || c.id || idx) + '-new'}
                  imageSrc={MEDIA.url(c.course_image || '') || "/assets/default.png"}
                  category={
                    c?.category?.name || c?.category?.title || c?.category?.category_name ||
                    (typeof c?.category === 'string' ? (categoryMap[c.category] || '-') : '-')
                  }
                  title={c.title || 'Untitled'}
                  author={c.author || ''}
                  reviews={{ rating: 0, count: 0 }}
                  price={''}
                  desc={c.description || ''}
                  due={c.applicationDueDate ? new Date(c.applicationDueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                />
              ))
            ) : (
              <div className="col-12"><p className="text-muted">No new courses available</p></div>
            )}
          </div>
          {newTotalPages > 1 && (
            <div className="mt-2">
              <PaginationComp page={newPage} totalPages={newTotalPages} onChange={(p) => setNewPage(p)} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const Page: React.FC = () => {
  const user = useSelector((s: RootState) => s.user)
  const cookieRole = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )auth_role=([^;]+)/)?.[1] || null) : null
  const role = user.role ?? cookieRole

  if (role === 'admin') {
    return <AdminDashboardPage />
  }
  return <DashboardContent />
}

export default Page;
