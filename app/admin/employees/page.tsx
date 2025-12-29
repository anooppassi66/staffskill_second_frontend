"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Breadcrumb } from "@/components/ui/breadcrumb-wrapper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"
import Swal from "sweetalert2"

export default function EmployeesPage() {
  const { token } = useAuth()
  const [employees, setEmployees] = useState<Array<any>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    email: "",
    phone_number: "",
    gender: "male",
    dob: "",
    bio: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.ADMIN.LIST_EMPLOYEES, { token })
        const list = Array.isArray(data.employees) ? data.employees : []
        setEmployees(list)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleSubmit = async () => {
    if (!token) return
    try {
      if (editingEmployee) {
        const id = editingEmployee._id
        await apiFetch(ENDPOINTS.ADMIN.UPDATE_EMPLOYEE(id), { method: "PUT", token, body: formData })
        setEmployees(employees.map((emp) => (emp._id === id ? { ...emp, ...formData } : emp)))
      } else {
        const data = await apiFetch(ENDPOINTS.AUTH.REGISTER, { method: "POST", token, body: { ...formData, role: "employee" } })
        const created = data.user ? { _id: data.user.id, ...formData, email: data.user.email, role: "employee", isActive: true } : null
        setEmployees(created ? [created, ...employees] : employees)
      }
      resetForm()
    } catch (err: any) {
      Swal.fire({ icon: "warning", title: "Error", text: err.message })
    }
  }

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee)
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      user_name: employee.user_name || "",
      email: employee.email,
      phone_number: employee.phone_number || "",
      gender: employee.gender || "male",
      dob: employee.dob ? String(employee.dob).slice(0, 10) : "",
      bio: employee.bio || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    Swal.fire({ icon: "info", title: "Note", text: "Deletion is not supported; deactivate instead" })
  }

  const toggleActive = async (id: string, current: boolean) => {
    if (!token) return
    try {
      if (current) {
        await apiFetch(ENDPOINTS.ADMIN.DEACTIVATE_EMPLOYEE(id), { method: "POST", token })
        setEmployees(employees.map((emp) => (emp._id === id ? { ...emp, isActive: false } : emp)))
      } else {
        await apiFetch(ENDPOINTS.ADMIN.ACTIVATE_EMPLOYEE(id), { method: "POST", token })
        setEmployees(employees.map((emp) => (emp._id === id ? { ...emp, isActive: true } : emp)))
      }
    } catch (err: any) {
      Swal.fire({ icon: "warning", title: "Error", text: err.message })
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      user_name: "",
      email: "",
      phone_number: "",
      gender: "male",
      dob: "",
      bio: "",
    })
    setEditingEmployee(null)
    setIsDialogOpen(false)
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Employees" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage employee accounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? "Update employee information" : "Create a new employee account"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_name">Username</Label>
                    <Input
                      id="user_name"
                      value={formData.user_name}
                      onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{editingEmployee ? "Update" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>Total {employees.length} employees</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {(employee.first_name || "U")[0]}
                            {(employee.last_name || "N")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">@{employee.user_name || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone_number}</TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? "default" : "destructive"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={employee.isActive} onCheckedChange={() => toggleActive(employee._id, !!employee.isActive)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(employee)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(employee._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
