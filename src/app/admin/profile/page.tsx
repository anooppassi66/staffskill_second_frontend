"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import { useAuth } from "@/lib/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Calendar, Save } from "lucide-react"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import Swal from "sweetalert2"
import { Spinner } from "@/components/ui/spinner"

export default function AdminProfile() {
  const { user, token, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    bio: user?.bio || "",
    dob: user?.dob || "",
  })

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const data = await apiFetch(ENDPOINTS.AUTH.PROFILE, { token })
        const u = data.user || user
        if (u) {
          setFormData({
            first_name: u.first_name || "",
            last_name: u.last_name || "",
            email: u.email || "",
            phone_number: u.phone_number || "",
            bio: u.bio || "",
            dob: u.dob ? String(u.dob).slice(0, 10) : "",
          })
        }
      } catch (err: any) {
        Swal.fire({ icon: "warning", title: "Error", text: err.message })
      }
    }
    load()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    try {
      setIsSaving(true)
      const payload = Object.fromEntries(Object.entries(formData).filter(([_, v]) => v !== ""))
      const data = await apiFetch(ENDPOINTS.AUTH.PROFILE, { method: "PUT", token, body: payload })
      const u = data.user || { ...user, ...formData }
      updateProfile(u)
      setIsEditing(false)
    } catch (err: any) {
      Swal.fire({ icon: "warning", title: "Error", text: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "My Profile" }]} />

        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 bg-white border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {(user?.first_name || "U")[0]}
                  {(user?.last_name || "N")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-lg">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing && (
                <div className="flex justify-end mb-4">
                  <Button type="button" onClick={() => setIsEditing(true)} disabled={isSaving}>
                    Edit Profile
                  </Button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      disabled={!isEditing || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      disabled={!isEditing || isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing || isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      disabled={!isEditing || isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dob"
                      type="date"
                      className="pl-10"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      disabled={!isEditing || isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing || isSaving}
                  />
                </div>

                <div className="flex gap-2">
                  {isEditing && (
                    <>
                      <Button type="submit" disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? <Spinner className="mr-2" /> : null}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            first_name: user?.first_name || "",
                            last_name: user?.last_name || "",
                            email: user?.email || "",
                            phone_number: user?.phone_number || "",
                            bio: user?.bio || "",
                            dob: user?.dob || "",
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
