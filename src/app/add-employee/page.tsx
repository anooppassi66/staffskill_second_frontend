'use client'

import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ENDPOINTS } from "@/Api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from 'react-toastify';
import { Copy } from "lucide-react";
import ReactSelect from '../components/ui/ReactSelect';

const AddEmployee = () => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState<any>(null);
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [generatedPwd, setGeneratedPwd] = useState('')
  const [department, setDepartment] = useState('')

  const handlePhoto = () => {

  };

  const user = useSelector((state: RootState) => state.user)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const form = e.target;

    const first_name = form.firstName.value?.trim();
    const last_name = form.lastName.value?.trim();
    const employeeId = form.employeeId.value?.trim();
    const email = form.email.value?.trim().toLowerCase();
    const phone_number = form.phone.value?.trim();
    const bio = form.bio.value?.trim();

    const user_name = employeeId || `${(first_name || '').toLowerCase()}.${(last_name || '').toLowerCase()}`.replace(/\s+/g, '');
    const role = 'employee';
    const gender = 'other';
    const isActive = true;
    const createdAt = new Date().toISOString();
    const password = `${Math.random().toString(36).slice(2, 8)}`;

    const payload: any = {
      first_name,
      last_name,
      user_name,
      email,
      phone_number,
      gender,
      bio,
      role,
      password,
      isActive,
      createdAt,
    };

    let tId: any;
    try {
      tId = toast.loading('Registering employee...');
      const res = await fetch(ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Registration failed');
      }
      const data = await res.json().catch(() => ({}))
      const pwd = data?.tempPassword || data?.tempPassword || ''
      setGeneratedPwd(pwd || password)
      toast.update(tId, { render: 'Employee registered successfully', type: 'success', isLoading: false, autoClose: 1200 });
      setShowPwdModal(true)
    } catch (err: any) {
      if (tId) {
        toast.update(tId, { render: err.message || 'Registration failed', type: 'error', isLoading: false, autoClose: 3000 });
      } else {
        toast.error(err.message || 'Registration failed');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="container mt-4 mb-5">
        <h5 className="fw-normal mb-4">Add Employee</h5>

        {/* Form */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h6 className="fw-normal mb-3">Personal Details</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">First Name *</label>
                  <input name="firstName" className="form-control" placeholder="First name" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" className="form-control" placeholder="Last name" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Employee ID *</label>
                  <input name="employeeId" className="form-control" placeholder="EMP-0001" required />
                </div>
              </div>

              <h6 className="fw-normal mb-3">Job Details</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">Department *</label>
                  <ReactSelect
                    className=""
                    value={department}
                    options={[
                      { value: '', label: 'Select' },
                      { value: 'Engineering', label: 'Engineering' },
                      { value: 'Product', label: 'Product' },
                      { value: 'Design', label: 'Design' },
                      { value: 'HR', label: 'HR' },
                      { value: 'Finance', label: 'Finance' },
                    ]}
                    onChange={(v) => setDepartment(v)}
                    placeholder="Select department"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Role / Title *</label>
                  <input name="role" className="form-control" placeholder="Senior Developer" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Start Date *</label>
                  <input name="startDate" type="date" className="form-control" required />
                </div>
              </div>

              <h6 className="fw-normal mb-3">Contact</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="form-control" placeholder="name@company.com" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone *</label>
                  <input name="phone" className="form-control" placeholder="+91 90000 00000" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Location</label>
                  <input name="location" className="form-control" placeholder="City, Country" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <input name="address" className="form-control" placeholder="Street address, city, zip" />
              </div>

              <div className="mb-3">
                <label className="form-label">Short Bio</label>
                <textarea name="bio" className="form-control" rows={3} placeholder="Short notes about the employee"></textarea>
              </div>

                <div className="d-flex gap-2">
                <button type="submit" className="custom-btn">Save Employee</button>
                <button type="button" className="custom-btn" onClick={() => { window.history.back(); }}>Cancel</button>
                </div>
            </form>
          </div>
        </div>

        {showPwdModal && (
          <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Employee Registered</h5>
                  <button className="btn-close" onClick={() => { setShowPwdModal(false); window.location.href = '/employees'; }}></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">Generated Password:</p>
                  <div className="input-group">
                    <input className="form-control" readOnly value={generatedPwd} />
                  <button className="custom-btn" type="button" onClick={async () => { try { await navigator.clipboard.writeText(generatedPwd); toast.success('Password copied'); } catch {} }}>
                    <Copy size={16} className="me-1"/> Copy Password
                  </button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="custom-btn" onClick={() => { setShowPwdModal(false); window.location.href = '/employees'; }}>Continue</button>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AddEmployee;
