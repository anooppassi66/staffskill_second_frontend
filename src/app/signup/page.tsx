'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import '../styles/auth.css';

export default function SignUpPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!agreedToTerms) {
            setError('You must agree to the Terms of Service and Privacy Policy.');
            return;
        }
        // Dummy signup logic
        console.log({ fullName, email, password });
        router.push('/login'); // Redirect to login after dummy signup
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                            <li></li>
                            <li className="active"></li>
                            <li></li>
                        </ul> */}
                    </div>
                </div>

                {/* Right Panel - Sign Up Form */}
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

                        <h5 className="form-title">Sign up</h5>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Full Name Input */}
                            <div className="mb-3">
                                <label htmlFor="fullNameInput" className="form-label">Full Name <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="fullNameInput"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                    <div className="input-group-append">
                                        <User size={20} color='#6c757d' />
                                    </div>
                                </div>
                            </div>

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
                                    <div className="input-group-append">
                                        <Mail size={20} color='#6c757d' />
                                    </div>
                                </div>
                            </div>

                            {/* New Password Input */}
                            <div className="mb-3">
                                <label htmlFor="newPasswordInput" className="form-label">New Password <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        id="newPasswordInput"
                                        placeholder="************"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="input-group-append" onClick={togglePasswordVisibility}>
                                        {showPassword ? <EyeOff size={20} color='#6c757d' /> : <Eye size={20} color='#6c757d' />}
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="mb-4">
                                <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="form-control"
                                        id="confirmPasswordInput"
                                        placeholder="************"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <div className="input-group-append" onClick={toggleConfirmPasswordVisibility}>
                                        {showConfirmPassword ? <EyeOff size={20} color='#6c757d' /> : <Eye size={20} color='#6c757d' />}
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Conditions Checkbox */}
                            <div className="form-check mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="agreeToTerms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    required
                                />
                                <label className={`form-check-label terms-text`} htmlFor="agreeToTerms">
                                    I agree with <Link href="#" className="terms-text">Terms of Service</Link> and <Link href="#" className="terms-text">Privacy Policy</Link>
                                </label>
                            </div>

                            {/* Sign Up Button */}
                            <div className="d-grid mb-3">
                                <button type="submit" className="custom-button">Sign Up</button>
                            </div>

                            {/* Already have an account? Link */}
                            <p className="text-center mt-4">
                                Already have an account? <Link href="/login" className="signin-link">Sign In</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
