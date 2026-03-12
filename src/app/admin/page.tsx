'use client'

import React, { useState } from 'react'
import '../styles/auth.css'
import { Mail, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/slices/userSlice'
import { useRouter, useSearchParams } from 'next/navigation'
import { ENDPOINTS } from '@/Api'
import { toast } from 'react-toastify'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null
    const raw = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.split('=')[1] ?? null
    if (!raw) return null
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const clearCookie = (name: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; path=/; max-age=0`
  }

  const resolveRedirect = () => {
    const queryValue = searchParams.get('redirect')
    if (queryValue) return queryValue

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const redirectFromUrl = params.get('redirect')
      if (redirectFromUrl) return redirectFromUrl
    }

    const cookieValue = getCookie('auth_redirect')
    if (cookieValue) {
      clearCookie('auth_redirect')
      return cookieValue
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    let tId: any
    try {
      tId = toast.loading('Logging in...')
      const res = await fetch(ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Login failed')
      }
      const data = await res.json().catch(() => ({}))
      const token: string | undefined = data.token || data.accessToken || data.jwt
      const user = data.user || { id: data.id || 'unknown', email: email, role: data.role || 'admin', first_name: data.first_name || data.name }
      if (!token) throw new Error('Missing token in response')

      const attrs = ['path=/']
      if (rememberMe) {
        const maxAgeDays = 7
        attrs.push(`max-age=${maxAgeDays * 24 * 60 * 60}`)
      }
      document.cookie = `auth_token=${token}; ${attrs.join('; ')}`
      document.cookie = `auth_role=${user.role ?? 'admin'}; ${attrs.join('; ')}`

      dispatch(
        setUser({
          id: user.id ?? 'unknown',
          name: (user as any).name ?? email,
          email: user.email ?? email,
          token: token,
          role: user.role ?? 'admin',
          first_name: (user as any).first_name ?? null,
          last_name: (user as any).last_name ?? null,
          avatar_url: (user as any).avatar_url ?? null,
          address: (user as any).address ?? null,
          phone_number: (user as any).phone_number ?? null,
          location: (user as any).location ?? null,
          phone: (user as any).phone ?? null,
          dob: (user as any).dob ?? null,
          gender: (user as any).gender ?? null,
          nationality: (user as any).nationality ?? null,
        })
      )

      const redirectTo = resolveRedirect()
      toast.update(tId, { render: 'Logged in', type: 'success', isLoading: false, autoClose: 1500 })
      router.push(redirectTo || '/admin-dashboard')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      if (tId) {
        toast.update(tId, { render: err.message || 'Login failed', type: 'error', isLoading: false, autoClose: 3000 })
      } else {
        toast.error(err.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center">
          <div className="left-panel">
            <Image src="/assets/learning.png" alt="Welcome to DreamsLMS" width={450} height={450} className="illustration" />
            <h2 className="welcome-title">Unlock Your Potential</h2>
            <p className="welcome-text">Begin your personalized learning journey today. Access world-class courses, track your progress, and achieve your professional goals seamlessly.</p>
            <p>    Made With ❤️ by KKEYDOS</p>
          </div>
        </div>
        <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center">
          <div className="right-panel">
            <h5 className="form-title">Sign into Admin</h5>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input type="email" className="form-control" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <div className="input-group-append"><Mail size={20} color="#6c757d" /></div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Password <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="************" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <div className="input-group-append" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="#6c757d" /> : <Eye size={20} color="#6c757d" />}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberAdmin" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <label className="form-check-label" htmlFor="rememberAdmin">Remember Me</label>
                </div>
                <a
                  href="#"
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Password reset link will be sent to your email');
                  }}
                >
                  Forgot Password?
                </a>
                
              </div>
              <div className="d-grid mb-3">
                <button type="submit" className="custom-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
