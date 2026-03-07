'use client'
import React, { useEffect, useState } from "react";
import "../styles/settings.css"
import CourseraButton from "../components/ui/CourseraButton"
import DashboardLayout from "../components/DashboardLayout";
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ENDPOINTS } from '@/Api'
import { toast } from 'react-toastify'
import ReactSelect from '../components/ui/ReactSelect'

const SettingsPage = () => {
    const user = useSelector((s: RootState) => s.user)
    const [tab, setTab] = useState<'profile' | 'security'>('profile')

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [userName, setUserName] = useState('')
    const [phone, setPhone] = useState('')
    const [gender, setGender] = useState('')
    const [dob, setDob] = useState('')
    const [bio, setBio] = useState('')

    const [currentPwd, setCurrentPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [loading, setLoading] = useState(false)
    const [joinedAt, setJoinedAt] = useState<string>('')

    const loadProfile = async () => {
        if (!user.token) return;
        try {
            const res = await fetch(ENDPOINTS.AUTH.PROFILE, {
                headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) }
            })
            if (!res.ok) return;
            const d = await res.json().catch(() => ({}))
            const u = d.user || d
            setFirstName(u.first_name || '')
            setLastName(u.last_name || '')
            setUserName(u.user_name || '')
            setPhone(u.phone_number || '')
            setGender(u.gender || '')
            setDob(u.dob ? String(u.dob).slice(0,10) : '')
            setBio(u.bio || '')
            setJoinedAt(u.createdAt ? new Date(u.createdAt).toLocaleString() : '')
        } catch {}
    }

    useEffect(() => { loadProfile() }, [user.token])

    const submitProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        let tId: any
        try {
            tId = toast.loading('Updating profile...')
            const payload: any = {}
            if (firstName) payload.first_name = firstName
            if (lastName) payload.last_name = lastName
            if (userName) payload.user_name = userName
            if (phone) payload.phone_number = phone
            if (gender) payload.gender = gender
            if (dob) payload.dob = dob
            if (bio) payload.bio = bio
            setLoading(true)
            const res = await fetch(ENDPOINTS.AUTH.PROFILE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) },
                body: JSON.stringify(payload)
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Update failed')
            }
            await res.json().catch(() => ({}))
            toast.update(tId, { render: 'Profile updated', type: 'success', isLoading: false, autoClose: 1500 })
            await loadProfile()
        } catch (e: any) {
            if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
        } finally {
            setLoading(false)
        }
    }

    const submitPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPwd !== confirmPwd) {
            toast.error('New password and confirm do not match')
            return
        }
        let tId: any
        try {
            tId = toast.loading('Updating password...')
            const res = await fetch(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) },
                body: JSON.stringify({ current: currentPwd, newPassword: newPwd })
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Update failed')
            }
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
            toast.update(tId, { render: 'Password updated', type: 'success', isLoading: false, autoClose: 1500 })
        } catch (e: any) {
            if (tId) toast.update(tId, { render: e.message || 'Failed', type: 'error', isLoading: false, autoClose: 3000 })
        }
    }

    return (
        <DashboardLayout>
            <div className="container mt-4 mb-5">
                <h5 className="fw-normal mb-4">Settings</h5>

                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <a className={`nav-link ${tab === 'profile' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setTab('profile') }}>Edit Profile</a>
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${tab === 'security' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setTab('security') }}>Security</a>
                    </li>
                    {/* <li className="nav-item">
                        <a className="nav-link" href="#">Social Profiles</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Linked Accounts</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Notifications</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Billing Address</a>
                    </li> */}
                </ul>

                {/* Profile Tab */}
                {tab === 'profile' && (
                    <>
                        {/* <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body d-flex align-items-center">
                                <img
                                    src="https://i.pravatar.cc/100"
                                    alt="Profile"
                                    className="rounded-circle me-3"
                                    width="80"
                                    height="80"
                                />
                                <div>
                                    <h6 className="mb-1 fw-normal">Profile Photo</h6>
                                    <small className="text-muted d-block mb-2">
                                        PNG or JPG no bigger than 800px width and height
                                    </small>
                                    <CourseraButton variant="outline" size="sm" className="mr-2">Upload</CourseraButton>
                                    <CourseraButton variant="danger" size="sm">Delete</CourseraButton>
                                </div>
                            </div>
                        </div> */}

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body">
                                <h6 className="fw-normal mb-2">Your Info</h6>
                                <div className="row">
                                    <div className="col-md-4"><div className="text-muted small">Name</div><div className="fw-semibold">{[(firstName || ''), (lastName || '')].filter(Boolean).join(' ') || '-'}</div></div>
                                    <div className="col-md-4"><div className="text-muted small">Username</div><div className="fw-semibold">{userName || '-'}</div></div>
                                    <div className="col-md-4"><div className="text-muted small">Phone</div><div className="fw-semibold">{phone || '-'}</div></div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-md-4"><div className="text-muted small">Gender</div><div className="fw-semibold">{gender || '-'}</div></div>
                                    <div className="col-md-4"><div className="text-muted small">DOB</div><div className="fw-semibold">{dob || '-'}</div></div>
                                    <div className="col-md-4"><div className="text-muted small">Email</div><div className="fw-semibold">{user.email || '-'}</div></div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-md-4"><div className="text-muted small">Joined</div><div className="fw-semibold">{joinedAt || '-'}</div></div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body">
                                <h6 className="fw-normal mb-3">Personal Details</h6>
                                <p className="text-muted mb-4">Edit your personal information</p>

                                <form onSubmit={submitProfile}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">First Name *</label>
                                            <input type="text" className="form-control" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Last Name *</label>
                                            <input type="text" className="form-control" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">User Name *</label>
                                            <input type="text" className="form-control" placeholder="johndoe" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Phone Number *</label>
                                            <input type="text" className="form-control" placeholder="90154-91036" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Gender *</label>
                                            <ReactSelect
                                                value={gender}
                                                options={[
                                                    { value: '', label: 'Select' },
                                                    { value: 'Male', label: 'Male' },
                                                    { value: 'Female', label: 'Female' },
                                                    { value: 'Other', label: 'Other' },
                                                ]}
                                                onChange={(v) => setGender(v)}
                                                placeholder="Select gender"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">DOB *</label>
                                            <input type="date" className="form-control" value={dob} onChange={(e) => setDob(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Bio *</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            placeholder="Tell us about yourself"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <CourseraButton type="submit" variant="danger">Update Profile</CourseraButton>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* Security Tab */}
                {tab === 'security' && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <h6 className="fw-normal mb-3">Security</h6>
                            <p className="text-muted mb-4">Change your password</p>
                            <form onSubmit={submitPassword}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Current Password *</label>
                                    <input type="password" className="form-control" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">New Password *</label>
                                    <input type="password" className="form-control" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Confirm Password *</label>
                                    <input type="password" className="form-control" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
                                </div>
                                <CourseraButton type="submit" variant="danger">Update Password</CourseraButton>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
