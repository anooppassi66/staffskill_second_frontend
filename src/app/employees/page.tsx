"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ENDPOINTS } from "@/Api";
import { toast } from "react-toastify";
import { Pencil, Trash2, CheckCircle, Key } from "lucide-react";
import MainLoader from '@/app/components/MainLoader';
import ReactSelect from '../components/ui/ReactSelect';
import PageHeader from "../components/PageHeader";

const EmployeePage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [employees, setEmployees] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBio, setEditBio] = useState('');
  const [newPasswordData, setNewPasswordData] = useState<{employeeName: string, password: string} | null>(null);

  const loadEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (query) qs.set('q', query);
      if (activeFilter) qs.set('active', activeFilter);
      qs.set('skip', String(skip));
      qs.set('limit', String(limit));
      const res = await fetch(ENDPOINTS.ADMIN.LIST_EMPLOYEES + (qs.toString() ? `?${qs.toString()}` : ""), {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) {
        if (res.status === 404 || res.status === 501 || res.status === 503) {
          setInProgress(true);
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load employees");
      }
      const data = await res.json().catch(() => ({}));
      const list = data.employees || data.items || data.results || [];
      setEmployees(Array.isArray(list) ? list : []);
      const meta = data.meta || {};
      setTotal(meta.total || Array.isArray(list) ? list.length : 0);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, limit]);

  const deactivateEmployee = async (employeeId: string) => {
    let tId: any;
    try {
      tId = toast.loading("Deactivating...");
      const res = await fetch(ENDPOINTS.ADMIN.DEACTIVATE_EMPLOYEE(employeeId), {
        method: "POST",
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to deactivate");
      }
      toast.update(tId, { render: "Employee deactivated", type: "success", isLoading: false, autoClose: 1500 });
      setEmployees((prev) => prev.map((e) => (e._id === employeeId ? { ...e, isActive: false } : e)));
    } catch (err: any) {
      if (tId) {
        toast.update(tId, { render: err.message || "Failed", type: "error", isLoading: false, autoClose: 3000 });
      } else {
        toast.error(err.message || "Failed");
      }
    }
  };

  const activateEmployee = async (employeeId: string) => {
    let tId: any;
    try {
      tId = toast.loading("Activating...");
      const res = await fetch(ENDPOINTS.ADMIN.ACTIVATE_EMPLOYEE(employeeId), {
        method: "POST",
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to activate");
      }
      toast.update(tId, { render: "Employee activated", type: "success", isLoading: false, autoClose: 1500 });
      setEmployees((prev) => prev.map((e) => (e._id === employeeId ? { ...e, isActive: true } : e)));
    } catch (err: any) {
      if (tId) {
        toast.update(tId, { render: err.message || "Failed", type: "error", isLoading: false, autoClose: 3000 });
      } else {
        toast.error(err.message || "Failed");
      }
    }
  };

  const openEdit = (emp: any) => {
    setEditTarget(emp);
    setEditFirst(emp.first_name || '');
    setEditLast(emp.last_name || '');
    setEditUserName(emp.user_name || '');
    setEditEmail(emp.email || '');
    setEditPhone(emp.phone_number || '');
    setEditGender(emp.gender || '');
    setEditBio(emp.bio || '');
    setShowEdit(true);
  };

  const updateEmployee = async () => {
    if (!editTarget?._id) return;
    const payload: any = {
      first_name: editFirst,
      last_name: editLast,
      user_name: editUserName,
      email: editEmail,
      phone_number: editPhone,
      gender: editGender,
      bio: editBio,
    };
    let tId: any;
    try {
      tId = toast.loading("Updating...");
      const res = await fetch(ENDPOINTS.ADMIN.UPDATE_EMPLOYEE(editTarget._id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update");
      }
      const d = await res.json().catch(() => ({}));
      const updated = d.user || {};
      toast.update(tId, { render: "Employee updated", type: "success", isLoading: false, autoClose: 1500 });
      setEmployees((prev) => prev.map((e) => (e._id === editTarget._id ? { ...e, ...updated, _id: e._id } : e)));
      setShowEdit(false);
      setEditTarget(null);
    } catch (err: any) {
      if (tId) {
        toast.update(tId, { render: err.message || "Failed", type: "error", isLoading: false, autoClose: 3000 });
      } else {
        toast.error(err.message || "Failed");
      }
    }
  };

  const regeneratePassword = async (emp: any) => {
    if (!window.confirm(`Are you sure you want to regenerate the password for ${emp.first_name || emp.user_name || 'this employee'}?`)) return;
    let tId: any;
    try {
      tId = toast.loading("Regenerating password...");
      const res = await fetch(ENDPOINTS.ADMIN.REGENERATE_PASSWORD(emp._id), {
        method: "POST",
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to regenerate password");
      }
      const data = await res.json();
      toast.update(tId, { render: "Password regenerated", type: "success", isLoading: false, autoClose: 1500 });
      setNewPasswordData({
        employeeName: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.user_name || emp.email,
        password: data.tempPassword
      });
    } catch (err: any) {
      if (tId) {
        toast.update(tId, { render: err.message || "Failed", type: "error", isLoading: false, autoClose: 3000 });
      } else {
        toast.error(err.message || "Failed");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-4">
        <PageHeader
          title="Employee management"
          subtitle="Manage employees and their status"
          rightContent={
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search employee..."
                style={{ width: 240 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setSkip(0); loadEmployees(); } }}
              />
              <div style={{ minWidth: 160 }}>
                <ReactSelect
                  value={activeFilter}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                  onChange={(v) => { setSkip(0); setActiveFilter(v); }}
                  placeholder="Status"
                />
              </div>
            </div>
          }
        />

        {inProgress && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="fw-semibold">Currently in progress</div>
              <div className="text-muted small">This module API is not available yet.</div>
            </div>
          </div>
        )}

        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th className="text-start">S.No</th>
                <th className="text-start">Name</th>
                <th className="text-start">Email</th>
                <th className="text-start">Phone Number</th>
                <th className="text-start">Role</th>
                <th className="text-start">Created On</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={5} className="text-danger">{error}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5}><MainLoader /></td>
                </tr>
              )}
              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan={5}>No employees found</td>
                </tr>
              )}
              {employees.filter(emp => emp.isActive !== false).map((emp, idx) => (
                <tr key={emp._id || idx}>
                  <td className="fw-normal" data-label="#">{String(idx + 1).padStart(2, '0')}</td>
                  <td data-label="Name"><span className="fw-medium">{`${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.user_name || emp.email}</span></td>
                  <td>{emp.email}</td>
                   <td>{emp.phone_number}</td>
                    <td>{emp.role}</td>
                    <td>{new Date(emp.createdAt).toLocaleString()}</td>
                  <td className="text-center">
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </td>
                  <td data-label="Actions">
                    <div className="action-icons justify-content-center gap-3">
                      <Pencil size={18} onClick={() => openEdit(emp)} style={{cursor: 'pointer'}} />
                      <Key size={18} onClick={() => regeneratePassword(emp)} style={{cursor: 'pointer'}} title="Regenerate Password" />
                      {emp.isActive ? (
                        <Trash2 size={18} onClick={() => deactivateEmployee(emp._id)} style={{cursor: 'pointer'}} />
                      ) : (
                        <CheckCircle size={18} onClick={() => activateEmployee(emp._id)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">Showing {Math.min(limit, Math.max(0, total - skip))} of {total}</small>
          <div className="d-flex gap-2 align-items-center">
            <button className="custom-btn" disabled={skip <= 0} onClick={() => setSkip(Math.max(0, skip - limit))}>Prev</button>
            <button className="custom-btn" disabled={skip + limit >= total} onClick={() => setSkip(skip + limit)}>Next</button>
            <ReactSelect
              className="w-auto"
              value={String(limit)}
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
              ]}
              onChange={(v) => { setSkip(0); setLimit(parseInt(v || '10')); }}
              placeholder="Items per page"
            />
          </div>
        </div>
      </div>
      {showEdit && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header d-flex justify-content-between">
                  <h5 className="modal-title fw-semibold">Edit Employee</h5>
                  <button className="custom-btn" onClick={() => { setShowEdit(false); setEditTarget(null); }}>X</button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input className="form-control" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input className="form-control" value={editLast} onChange={(e) => setEditLast(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">User Name</label>
                      <input className="form-control" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input className="form-control" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Gender</label>
                      <ReactSelect
                        value={editGender}
                        options={[
                          { value: '', label: 'Select' },
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                        ]}
                        onChange={setEditGender}
                        placeholder="Gender"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Bio</label>
                      <textarea className="form-control" rows={3} value={editBio} onChange={(e) => setEditBio(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="custom-btn" onClick={() => { setShowEdit(false); setEditTarget(null); }}>Cancel</button>
                  <button className="custom-btn" onClick={updateEmployee}>Update</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {newPasswordData && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show" style={{ display: 'block', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">Password Regenerated</h5>
                  <button className="custom-btn" onClick={() => setNewPasswordData(null)}>X</button>
                </div>
                <div className="modal-body text-center">
                  <p className="mb-2">New password for <strong>{newPasswordData.employeeName}</strong>:</p>
                  <h3 className="fw-bold user-select-all mb-3 text-primary">{newPasswordData.password}</h3>
                  <p className="text-muted small mb-0">Please copy this password and share it with the employee.</p>
                </div>
                <div className="modal-footer justify-content-center">
                  <button className="custom-btn" onClick={() => {
                    navigator.clipboard.writeText(newPasswordData.password);
                    toast.success("Password copied to clipboard");
                  }}>Copy Password</button>
                  <button className="custom-btn" onClick={() => setNewPasswordData(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default EmployeePage;
