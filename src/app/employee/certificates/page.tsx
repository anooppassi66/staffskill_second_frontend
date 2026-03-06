"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { Download, Award, Calendar, FileCheck } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { ENDPOINTS, apiFetch, MEDIA } from "@/lib/api"

export default function CertificatesPage() {
  const { token } = useAuth()
  const [certificates, setCertificates] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.CERTIFICATES.LIST, { token })
        const list = Array.isArray(data.certificates) ? data.certificates : Array.isArray(data) ? data : []
        setCertificates(list)
      } catch (e: any) {
        setError(e.message || "Failed to load certificates")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const userCertificates = certificates
  const certificatesWithDetails = useMemo(() => {
    return userCertificates.map((cert) => {
      return {
        cert,
        course: cert.course || {},
        quiz: cert.quiz || {},
      }
    })
  }, [userCertificates])

  return (
    <DashboardLayout requiredRole="employee">
      <div className="p-8 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/employee/dashboard" }, { label: "My Certificates" }]} />

        <div>
          <h1 className="text-3xl font-bold text-foreground">My Certificates</h1>
          <p className="text-muted-foreground mt-1">View and download your earned certificates</p>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
              <Award className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCertificates.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Earned certificates</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              <FileCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userCertificates.length > 0
                  ? (
                      userCertificates.reduce((sum, cert) => sum + (cert.marks / cert.outOf) * 100, 0) /
                      userCertificates.length
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all quizzes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Latest Achievement</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userCertificates.length > 0
                  ? new Date(
                      userCertificates.sort(
                        (a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime(),
                      )[0].awardedAt,
                    ).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Most recent</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificatesWithDetails.map(({ cert, course, quiz }) => (
            <Card key={cert._id || cert.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-border/40">
              <div className="bg-gradient-to-br from-primary via-secondary to-accent p-6 text-white">
                <div className="flex items-center justify-center mb-4">
                  <Award className="h-16 w-16" />
                </div>
                <h3 className="text-center font-bold text-lg mb-2">Certificate of Completion</h3>
                <p className="text-center text-sm opacity-90">LMS Portal</p>
              </div>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{course?.title}</CardTitle>
                <CardDescription>{quiz?.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-medium">
                      {cert.marks} / {cert.outOf}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Percentage:</span>
                    <span className="font-medium">{((cert.marks / cert.outOf) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Awarded:</span>
                    <span className="font-medium">{new Date(cert.awardedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant={cert.marks / cert.outOf >= 0.8 ? "default" : "secondary"}>
                    {cert.marks / cert.outOf >= 0.8 ? "Excellent" : "Passed"}
                  </Badge>
                  <Button size="sm" asChild>
                    <a href={cert.file ? MEDIA.url(cert.file) : "#"} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {userCertificates.length === 0 && !loading && (
          <Card className="bg-white border-border/40 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Complete courses and pass quizzes to earn certificates. Your achievements will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
