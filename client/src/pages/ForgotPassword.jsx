import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { getPasswordValidationFeedback, getPasswordStrengthLevel } from '../utils/passwordValidator';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState(null);
    const navigate = useNavigate();

    const isPasswordValid = passwordFeedback?.isValid || false;
    const passwordStrength = getPasswordStrengthLevel(newPassword);

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await authAPI.forgotPasswordOtp({ email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and set new password (combined)
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        if (!newPassword) {
            toast.error('Please enter a new password');
            return;
        }

        if (!isPasswordValid) {
            const errors = passwordFeedback?.requirements
                .filter(r => !r.satisfied)
                .map(r => r.rule)
                .join(', ');
            return toast.error(`Password requirements not met: ${errors}`);
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword({
                email,
                otp,
                newPassword
            });
            toast.success('Password reset successfully!');
            setStep(4);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Password reset failed';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        if (step === 1) {
            navigate('/login');
        } else if (step === 2) {
            setStep(1);
            setOtp('');
        } else {
            setStep(1);
            setEmail('');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="auth-page">
            {/* Floating back button */}
            <button
                onClick={handleGoBack}
                style={{
                    position: 'fixed',
                    top: '1.25rem',
                    left: '1.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    zIndex: 100,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
            >
                ← Back
            </button>

            <div className="auth-card fade-in">
                {/* Step 1: Email Input */}
                {step === 1 && (
                    <>
                        <h1>Forgot Password?</h1>
                        <p className="subtitle">Enter your email to reset your password</p>
                        <form onSubmit={handleRequestOtp}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 2: OTP Verification and New Password */}
                {step === 2 && (
                    <>
                        <h1>Reset Your Password</h1>
                        <p className="subtitle">Enter the OTP and your new password</p>
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>Verification Code (OTP)</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    required
                                />
                                <small style={{ color: 'var(--text-muted)' }}>Check your email for the verification code</small>
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setPasswordFeedback(getPasswordValidationFeedback(e.target.value));
                                    }}
                                    placeholder="Create a strong password"
                                    required
                                />
                                {newPassword && (
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
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your new password"
                                    required
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <div style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                        ✗ Passwords do not match
                                    </div>
                                )}
                                {confirmPassword && newPassword === confirmPassword && (
                                    <div style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.25rem' }}>
                                        ✓ Passwords match
                                    </div>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={loading || !isPasswordValid || newPassword !== confirmPassword}
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 4: Success Message */}
                {step === 4 && (
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '3rem',
                                marginBottom: '1rem',
                                animation: 'fadeIn 0.5s ease'
                            }}>
                                ✓
                            </div>
                            <h1>Password Reset Successfully!</h1>
                            <p className="subtitle">Your password has been updated. You can now sign in with your new password.</p>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Redirecting to login in a moment...</p>
                        </div>
                    </>
                )}

                {/* Footer Links */}
                {step !== 4 && (
                    <div className="auth-footer">
                        Remember your password? <Link to="/login">Sign In</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
