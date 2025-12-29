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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { ENDPOINTS, apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/hooks/use-auth"

export default function CategoriesPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Array<{ _id: string; category_name: string; createdAt?: string }>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{ _id: string; category_name: string } | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(ENDPOINTS.CATEGORIES.LIST, { token })
        const list = Array.isArray(data.categories) ? data.categories : Array.isArray(data) ? data : []
        setCategories(list)
      } catch (e: any) {
        setError(e.message || "Failed to load categories")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleSubmit = async () => {
    if (!categoryName.trim() || !token) return
    if (editingCategory) {
      try {
        await apiFetch(ENDPOINTS.CATEGORIES.UPDATE(editingCategory._id), {
          method: "PUT",
          token,
          body: { category_name: categoryName },
        })
        setCategories(categories.map((cat) => (cat._id === editingCategory._id ? { ...cat, category_name: categoryName } : cat)))
      } catch (e: any) {
        setError(e.message || "Failed to update category")
      }
    } else {
      try {
        const data = await apiFetch(ENDPOINTS.CATEGORIES.CREATE, { method: "POST", token, body: { category_name: categoryName } })
        const created = data.category || data
        setCategories([created, ...categories])
      } catch (e: any) {
        setError(e.message || "Failed to create category")
      }
    }
    setCategoryName("")
    setEditingCategory(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (category: { _id: string; category_name: string }) => {
    setEditingCategory(category)
    setCategoryName(category.category_name)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await apiFetch(ENDPOINTS.CATEGORIES.DELETE(id), { method: "DELETE", token })
        setCategories(categories.filter((cat) => cat._id !== id))
      } catch (e: any) {
        setError(e.message || "Failed to delete category")
      }
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setCategoryName("")
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-8 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Categories" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground mt-1">Manage course categories</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update the category name" : "Create a new course category"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category_name">Category Name</Label>
                  <Input
                    id="category_name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{editingCategory ? "Update" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <Card className="bg-white border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>Total {categories.length} categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.category_name}</TableCell>
                    <TableCell>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(category._id)}>
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
