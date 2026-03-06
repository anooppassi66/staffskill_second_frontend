"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"
import Swal from "sweetalert2"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"

export default function SettingsPage() {
  const { token } = useAuth()
  const [current, setCurrent] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    if (!token) {
      Swal.fire("Unauthorized", "Please log in again", "error")
      return
    }
    if (!current || !newPassword || !confirm) {
      Swal.fire("Error", "Please fill in all fields", "error")
      return
    }
    if (newPassword !== confirm) {
      Swal.fire("Error", "New password and confirmation do not match", "error")
      return
    }
    setLoading(true)
    try {
      await apiFetch(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: "PUT",
        token,
        body: { current, newPassword },
      })
      setCurrent("")
      setNewPassword("")
      setConfirm("")
    } finally {
      setLoading(false)
    }
  }
  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account security</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <Button className="w-fit" onClick={handleChangePassword} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
