'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import '../styles/auth.css';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/userSlice';
import { ENDPOINTS } from '@/Api';
import { toast } from 'react-toastify';


export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        let tId: any;
        try {
            tId = toast.loading('Logging in...');
            const res = await fetch(ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Login failed');
            }

            const data = await res.json().catch(() => ({}));
            const token: string | undefined = data.token || data.accessToken || data.jwt;
            const user = data.user || { id: data.id || 'unknown', email: email, role: data.role || 'user', first_name: data.first_name || data.name };

            if (!token) {
                throw new Error('Missing token in response');
            }

            const attrs = ['path=/']
            if (rememberMe) {
                const maxAgeDays = 7
                attrs.push(`max-age=${maxAgeDays * 24 * 60 * 60}`)
            }
            document.cookie = `auth_token=${token}; ${attrs.join('; ')}`
            document.cookie = `auth_role=${user.role ?? 'user'}; ${attrs.join('; ')}`

            dispatch(
                setUser({
                    id: user.id ?? 'unknown',
                    name: (user as any).name ?? email,
                    email: user.email ?? email,
                    token: token,
                    role: user.role ?? 'user',
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
            );

            const redirectTo = searchParams.get('redirect');
            toast.update(tId, { render: 'Logged in', type: 'success', isLoading: false, autoClose: 1500 });
            router.push(redirectTo || (user.role === 'admin' ? '/admin-dashboard' : '/'))
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            if (tId) {
                toast.update(tId, { render: err.message || 'Login failed', type: 'error', isLoading: false, autoClose: 3000 });
            } else {
                toast.error(err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Left Panel - Illustration and Welcome Message */}
                <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center">
                    <div className="left-panel">
                        {/* Illustration Image Placeholder */}
                        <Image
                            src="/assets/learning.png"
                            alt="Welcome to DreamsLMS"
                            width={450}
                            height={450}
                            className="illustration"
                        />
                        <h2 className="welcome-title">
                            Unlock Your Potential
                        </h2>
                        <p className="welcome-text">
                            Begin your personalized learning journey today. Access world-class courses, track your progress, and achieve your professional goals seamlessly.
                        </p>
                        {/* Carousel Indicators */}
                        {/* <ul className="carousel-indicators">
                            <li className="active"></li>
                            <li></li>
                            <li></li>
                        </ul> */}
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center">
                    <div className="right-panel">
                        {/* Top Navigation (Logo and Back to Home) */}
                        {/* <div className="top-nav">
                            <div className="logo-wrapper">
                                <Image src="/assets/logo.svg" alt="DreamsLMS Logo" width={30} height={30} className="logo-img" />
                                <span className="logo-text">Dreams<span style={{ color: '#e63946' }}>LMS</span></span>
                            </div>
                            <Link href="/" className="back-home-link">
                                Back to Home
                            </Link>
                        </div> */}

                         <div className="d-flex align-items-center">
                  <Image
                    src="/assets/astra.png"
                    alt="Astra Consulting Corp"
                    width={500}
                    height={100}
                    className="object-fit-contain"
                  />
                </div>

                        {/* <h5 className="form-title">Sign into Your Account</h5> */}
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <div className="mb-3">
                                <label htmlFor="emailInput" className="form-label">Email <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="emailInput"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    {/* <div className="input-group-append">
                                        <Mail size={20} color='#6c757d' />
                                    </div> */}
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="mb-3">
                                <label htmlFor="passwordInput" className="form-label">Password <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        id="passwordInput"
                                        placeholder="************"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    {/* <div className="input-group-append" onClick={togglePasswordVisibility}>
                                        {showPassword ? <EyeOff size={20} color='#6c757d' /> : <Eye size={20} color='#6c757d' />}
                                    </div> */}
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        Remember Me
                                    </label>
                                </div>
                                {/* <Link
                                    href="#"
                                    className="forgot-password-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toast.info('Password reset link will be sent to your email');
                                    }}
                                >
                                    Forgot Password?
                                </Link> */}
                            </div>

                            {/* Login Button */}
                            <div className="d-grid mb-3">
                                <button type="submit" className="custom-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                            </div>

                            {/* Divider */}
                            {/* <div className="divider">Or</div> */}

                            {/* Social Login Buttons */}
                            {/* <div className="social-buttons">
                                <a href="#" className="social-button">
                                    <Image src="/assets/google-icon.svg" alt="Google" width={20} height={20} />
                                    Google
                                </a>
                                <a href="#" className="social-button">
                                    <Image src="/assets/facebook-icon.svg" alt="Facebook" width={20} height={20} />
                                    Facebook
                                </a>
                            </div> */}

                            {/* Sign Up Link */}
                            {/* <p className="text-center mt-4">
                                Don't have an account? <Link href="/signup" className="signup-link">Sign Up</Link>
                            </p> */}
                        </form>
                        {/* <p>Made with ❤ By <a href="http://www.kkeydos.com" target="_blank">KKEYDOS</a> </p> */}
                        {/* Copyright Logos */}
              <div className="mt-5 d-flex align-items-center justify-content-between opacity-75 pb-2">
               
                <div className="d-flex gap-2 small text-secondary fw-medium pt-2">
                  <a href="https://www.kkeydos.com/" target="_blank" rel="noopener noreferrer"><Image
                    src="/assets/kkeydos.png"
                    alt="Keydos"
                    width={250}
                    height={90}
                    className="object-fit-contain"
                  /></a>
                </div>
              </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
