"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type RecentItem = {
  enrollment: { id?: string; enrolledAt?: string }
  employee?: { first_name?: string; last_name?: string }
  course?: { title?: string }
}

export function RecentEnrollments({ items = [] }: { items?: RecentItem[] }) {
  const recentEnrollments = items

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Enrollments</CardTitle>
        <CardDescription>Latest course enrollments by employees</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEnrollments.map(({ enrollment, employee, course }, idx) => (
            <div key={enrollment.id || idx} className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {(employee?.first_name || "U")[0]}
                  {(employee?.last_name || "N")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {employee?.first_name} {employee?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{course?.title}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : ""}
              </div>
            </div>
          ))}
          {recentEnrollments.length === 0 && <div className="text-sm text-muted-foreground">No recent enrollments</div>}
        </div>
      </CardContent>
    </Card>
  )
}
