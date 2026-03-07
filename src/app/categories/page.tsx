'use client'
import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import CenteredModal from '../components/ui/CenteredModal'
import CourseraButton from '../components/ui/CourseraButton'
import EmptyState from '../components/ui/EmptyState'
import { ENDPOINTS } from '@/Api'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { toast } from 'react-toastify'
import { Pencil, Trash2 } from 'lucide-react'
import MainLoader from '@/app/components/MainLoader'
import ReactSelect from '@/app/components/ui/ReactSelect'
import PageHeader from "../components/PageHeader"
import PaginationComp from '../components/ui/Pagination'

type CategoryItem = { _id?: string; category_name?: string; createdAt?: string }

export default function CategoriesPage() {
  const user = useSelector((s: RootState) => s.user)
  const [items, setItems] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEditId, setShowEditId] = useState<string>('')
  const [formName, setFormName] = useState('')
  const [inProgress, setInProgress] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string>('')
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const filtered = items

  const loadCategories = async () => {
    setError('')
    try {
      const qs = new URLSearchParams()
      if (query) qs.set('q', query)
      qs.set('skip', String(skip))
      qs.set('limit', String(limit))
      const res = await fetch(ENDPOINTS.CATEGORIES.LIST + (qs.toString() ? `?${qs.toString()}` : ''))
      if (!res.ok) {
        if (res.status === 404 || res.status === 501 || res.status === 503) {
          setInProgress(true)
        }
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to load categories')
      }
      const data = await res.json().catch(() => ({}))
      const list = data.categories || data || []
      setItems(Array.isArray(list) ? list : [])
      const meta = data.meta || {}
      setTotal(meta.total || Array.isArray(list) ? list.length : 0)
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [skip, limit])

  const openAdd = () => {
    setFormName('')
    setShowAdd(true)
  }

  const openEdit = (item: CategoryItem) => {
    setShowEditId(item._id || '')
    setFormName(item.category_name || '')
  }

  const closeModals = () => {
    setShowAdd(false)
    setShowEditId('')
    setFormName('')
  }

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    let tId: any
    try {
      tId = toast.loading('Creating category...')
      const res = await fetch(ENDPOINTS.CATEGORIES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ category_name: formName.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create category')
      }
      toast.update(tId, { render: 'Category created', type: 'success', isLoading: false, autoClose: 1500 })
      closeModals()
      loadCategories()
    } catch (e: any) {
      if (tId) {
        toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    }
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditId) return
    let tId: any
    try {
      tId = toast.loading('Updating category...')
      const res = await fetch(ENDPOINTS.CATEGORIES.UPDATE(showEditId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ category_name: formName.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update category')
      }
      toast.update(tId, { render: 'Category updated', type: 'success', isLoading: false, autoClose: 1500 })
      closeModals()
      loadCategories()
    } catch (e: any) {
      if (tId) {
        toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    }
  }

  const remove = async (id?: string) => {
    if (!id) return
    let tId: any
    try {
      tId = toast.loading('Deleting...')
      const res = await fetch(ENDPOINTS.CATEGORIES.DELETE(id), {
        method: 'DELETE',
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to delete')
      }
      toast.update(tId, { render: 'Category deleted', type: 'success', isLoading: false, autoClose: 1500 })
      setItems((prev) => prev.filter((c) => c._id !== id))
    } catch (e: any) {
      if (tId) {
        toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="container-fluid px-4 py-3">
        <PageHeader
          title="Categories"
          subtitle="Manage categories"
          rightContent={
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search category..."
                style={{ width: 240 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setSkip(0); loadCategories(); } }}
              />
              <CourseraButton onClick={openAdd}>+ Add Category</CourseraButton>
            </div>
          }
        />

        {inProgress && (
          <>
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="fw-semibold">Currently in progress</div>
                <div className="text-muted small">This module API is not available yet.</div>
              </div>
            </div>
          </>
        )}

        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th className="text-start">ID</th>
                <th className="text-start">Name</th>
                <th className="text-start">Created</th>
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
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No categories" subtitle="Add your first category" />
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td data-label="ID">{c._id}</td>
                  <td className="fw-medium" data-label="Name">{c.category_name}</td>
                  <td data-label="Created">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td>
                  <td data-label="Actions">
                    <div className="action-icons gap-3 justify-content-center">
                      <Pencil size={18} onClick={() => openEdit(c)} />
                      <Trash2 size={18} onClick={() => setConfirmDeleteId(c._id || '')} />
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

        <CenteredModal
          isOpen={showAdd}
          title="Add Category"
          onClose={closeModals}
          footer={(
            <>
              <CourseraButton variant="outline" onClick={closeModals}>Cancel</CourseraButton>
              <CourseraButton onClick={(e) => { e.preventDefault(); const form = document.getElementById('add-cat-form') as HTMLFormElement; form?.requestSubmit(); }}>Create</CourseraButton>
            </>
          )}
        >
          <form id="add-cat-form" onSubmit={submitAdd}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
          </form>
        </CenteredModal>

        <CenteredModal
          isOpen={!!showEditId}
          title="Edit Category"
          onClose={closeModals}
          footer={(
            <>
              <CourseraButton variant="outline" onClick={closeModals}>Cancel</CourseraButton>
              <CourseraButton onClick={(e) => { e.preventDefault(); const form = document.getElementById('edit-cat-form') as HTMLFormElement; form?.requestSubmit(); }}>Save</CourseraButton>
            </>
          )}
        >
          <form id="edit-cat-form" onSubmit={submitEdit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
          </form>
        </CenteredModal>

        <CenteredModal
          isOpen={!!confirmDeleteId}
          title="Confirm Delete"
          onClose={() => setConfirmDeleteId('')}
          footer={(
            <>
              <CourseraButton variant="outline" onClick={() => setConfirmDeleteId('')}>Cancel</CourseraButton>
              <CourseraButton variant="danger" onClick={() => { const id = confirmDeleteId; setConfirmDeleteId(''); remove(id) }}>Delete</CourseraButton>
            </>
          )}
        >
          <p className="text-sm text-gray-700">Are you sure you want to delete this?</p>
        </CenteredModal>
      </div>
    </DashboardLayout>
  )
}

