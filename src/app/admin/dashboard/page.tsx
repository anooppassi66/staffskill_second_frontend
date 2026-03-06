 "use client"
 
 import { useEffect, useState } from "react"
 import { DashboardLayout } from "@/components/layout/dashboard-layout"
 import { StatsCard } from "@/components/admin/stats-card"
 import { AnalyticsChart } from "@/components/admin/analytics-chart"
 import { RecentEnrollments } from "@/components/admin/recent-enrollments"
 import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
 import { BookOpen, Users, ClipboardCheck, Award, TrendingUp, UserCheck } from "lucide-react"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"
 
 export default function AdminDashboard() {
   const { token } = useAuth()
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState("")
   const [metrics, setMetrics] = useState<any>({
     totalCourses: 0,
     totalEmployees: 0,
     enrolledCourses: 0,
     avgCoursesCompleted: 0,
     employeeCompletionPercentage: 0,
     totalCertificates: 0,
     totalQuizAttempts: 0,
     passedQuizzes: 0,
   })
   const [enrollmentData, setEnrollmentData] = useState<Array<{ name: string; value: number }>>([])
   const [quizData, setQuizData] = useState<Array<{ name: string; value: number }>>([])
   const [recentEnrollments, setRecentEnrollments] = useState<Array<{ enrollment: any; employee?: any; course?: any }>>([])
 
   useEffect(() => {
     const load = async () => {
       if (!token) return
       setLoading(true)
       setError("")
       try {
         const data = await apiFetch(ENDPOINTS.ADMIN.DASHBOARD, { token })
         const m = data.metrics || {}
         setMetrics({
           totalCourses: m.totalCourses || 0,
           totalEmployees: m.totalEmployees || 0,
           enrolledCourses: m.enrolledCourses || 0,
           avgCoursesCompleted: m.avgCoursesCompleted || 0,
           employeeCompletionPercentage: m.employeeCompletionPercentage || 0,
           totalCertificates: m.totalCertificates || 0,
           totalQuizAttempts: m.totalQuizAttempts || 0,
           passedQuizzes: m.passedQuizzes || 0,
         })
         setEnrollmentData((data.enrollmentTrend || []).map((x: any) => ({ name: x.name, value: x.value })))
         setQuizData([
           { name: "Passed", value: m.passedQuizzes || 0 },
           { name: "Failed", value: Math.max(0, (m.totalQuizAttempts || 0) - (m.passedQuizzes || 0)) },
         ])
         const re = (data.recentEnrollments || []).map((en: any) => ({
           enrollment: { id: en.id, enrolledAt: en.enrolledAt },
           employee: en.user,
           course: en.course,
         }))
         setRecentEnrollments(re)
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
     }
     load()
   }, [token])
 
   return (
     <DashboardLayout requiredRole="admin">
       <div className="p-8 space-y-8">
         <Breadcrumb items={[{ label: "Dashboard" }]} />
 
         <div>
           <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
           <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your LMS.</p>
         </div>
 
         {error && <div className="text-sm text-destructive">{error}</div>}
 
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatsCard
             title="Total Courses"
             value={metrics.totalCourses}
             icon={BookOpen}
             description="Published courses"
             trend={{ value: 0, isPositive: true }}
           />
           <StatsCard
             title="Total Enrollments"
             value={metrics.enrolledCourses}
             icon={Users}
             description="Active enrollments"
             trend={{ value: 0, isPositive: true }}
           />
           <StatsCard
             title="Quiz Attempts"
             value={metrics.totalQuizAttempts}
             icon={ClipboardCheck}
             description={`${metrics.passedQuizzes} passed`}
           />
           <StatsCard
             title="Certificates Issued"
             value={metrics.totalCertificates}
             icon={Award}
             description="Successfully completed"
             trend={{ value: 0, isPositive: true }}
           />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatsCard
             title="Avg. Completion Rate"
             value={`${(metrics.employeeCompletionPercentage || 0).toFixed ? (metrics.employeeCompletionPercentage as any).toFixed(0) : metrics.employeeCompletionPercentage}%`}
             icon={TrendingUp}
             description="Across all courses"
           />
           <StatsCard
             title="Total Employees"
             value={metrics.totalEmployees}
             icon={UserCheck}
             description="Registered employees"
           />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AnalyticsChart data={enrollmentData} title="Enrollment Trends" description="Monthly enrollment statistics" />
          <AnalyticsChart data={quizData} title="Quiz Performance" description="Pass/Fail ratio" />
        </div>

        <RecentEnrollments items={recentEnrollments} />
      </div>
    </DashboardLayout>
  )
}
