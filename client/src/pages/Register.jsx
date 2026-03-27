import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { getPasswordValidationFeedback, getPasswordStrengthLevel } from '../utils/passwordValidator';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification
    const [loading, setLoading] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        
        // Update password feedback when password changes
        if (name === 'password') {
            setPasswordFeedback(getPasswordValidationFeedback(value));
        }
    };

    const isPasswordValid = passwordFeedback?.isValid || false;
    const passwordStrength = getPasswordStrengthLevel(form.password);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        
        if (!form.name.trim()) return toast.error('Name is required');
        if (!form.email.trim()) return toast.error('Email is required');
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        
        // Check password strength
        if (!isPasswordValid) {
            const errors = passwordFeedback?.requirements
                .filter(r => !r.satisfied)
                .map(r => r.rule)
                .join(', ');
            return toast.error(`Password requirements not met: ${errors}`);
        }

        setLoading(true);
        try {
            const res = await authAPI.registerOtp({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role
            });

            if (res.data?.emailSent === true) {
                toast.success('OTP sent to your email!');
            } else {
                toast.error('Failed to send OTP. Please try again.');
                return;
            }

            setStep(2);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to send OTP. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Please enter a valid 6-digit OTP');

        setLoading(true);
        try {
            const res = await authAPI.registerVerify({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                otp: otp
            });

            if (!res.data.token) {
                const adminEmail = res.data.adminEmail || import.meta.env.VITE_EMAIL_USER || import.meta.env.VITE_ADMIN_EMAIL || 'admin@university.edu';
                toast.success(
                    `Your recruiter account request is under review. Please email your documents to ${adminEmail}: Aadhaar/ID proof, resume, company details, contact details, and the job roles you plan to offer.`,
                    { duration: 12000 }
                );
                navigate('/login');
                return;
            }

            // Log user in directly using the response from verify
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success('Account verified and created!');
            window.location.href = res.data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard';
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Verification failed. Invalid OTP?';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <h1>{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
                <p className="subtitle">
                    {step === 1 ? 'Join the placement portal' : `Enter the 6-digit code sent to ${form.email}`}
                </p>

                {step === 1 ? (
                    <>
                        <div className="role-tabs">
                            <div className={`role-tab ${form.role === 'student' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'student' })}>🎓 Student</div>
                            <div className={`role-tab ${form.role === 'recruiter' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'recruiter' })}>🏢 Recruiter</div>
                        </div>
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    name="password" 
                                    type="password" 
                                    value={form.password} 
                                    onChange={handleChange} 
                                    placeholder="Create a strong password" 
                                    required 
                                />
                                {form.password && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            Strength: <strong style={{
                                                color: passwordStrength === 'Strong' ? '#10b981' :
                                                       passwordStrength === 'Good' ? '#f59e0b' :
                                                       passwordStrength === 'Fair' ? '#f97316' :
                                                       '#ef4444'
                                            }}>
                                                {passwordStrength}
                                            </strong>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            {passwordFeedback?.requirements.map((req, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    <span style={{
                                                        color: req.satisfied ? '#10b981' : '#ccc'
                                                    }}>
                                                        {req.satisfied ? '✓' : '✗'}
                                                    </span>
                                                    <span style={{
                                                        color: req.satisfied ? '#10b981' : '#999'
                                                    }}>
                                                        {req.rule}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input 
                                    name="confirmPassword" 
                                    type="password" 
                                    value={form.confirmPassword} 
                                    onChange={handleChange} 
                                    placeholder="Re-enter your password" 
                                    required 
                                />
                                {form.confirmPassword && form.password !== form.confirmPassword && (
                                    <div style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                        ✗ Passwords do not match
                                    </div>
                                )}
                                {form.confirmPassword && form.password === form.confirmPassword && (
                                    <div style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.25rem' }}>
                                        ✓ Passwords match
                                    </div>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={loading || !isPasswordValid || form.password !== form.confirmPassword}
                            >
                                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                            </button>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label>One-Time Password (OTP)</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </button>
                        <button type="button" className="btn btn-text" onClick={() => setStep(1)} disabled={loading}>
                            Back to Signup
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
