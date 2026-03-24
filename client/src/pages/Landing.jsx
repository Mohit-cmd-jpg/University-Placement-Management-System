import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiUsers, FiBriefcase, FiBookOpen, FiAward, FiEye, FiEyeOff, FiMail, FiLock, FiMenu, FiX } from 'react-icons/fi';
import '../styles/Landing.css';

const Landing = () => {
    const [stats, setStats] = useState(null);
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [activeDrives, setActiveDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [authTab, setAuthTab] = useState('signin');
    const [activeNav, setActiveNav] = useState('home');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, jobsRes, drivesRes] = await Promise.all([
                    fetch('/api/public/landing-stats'),
                    fetch('/api/public/featured-jobs'),
                    fetch('/api/public/active-drives')
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (jobsRes.ok) setFeaturedJobs(await jobsRes.json());
                if (drivesRes.ok) setActiveDrives(await drivesRes.json());
            } catch (error) {
                console.error('Error fetching landing data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleNav = (id) => {
        setActiveNav(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-page">
            {/* Floating Background Elements */}
            <div className="floating-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Navbar */}
            <nav className={`navbar glass-nav ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-container">
                    <button className="logo-btn">
                        <div className="logo-icon">
                            <FiAward size={20} />
                        </div>
                        <span className="logo-text">UniPlacements</span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="nav-links-desktop">
                        {['Home', 'Features', 'How It Works', 'Testimonials'].map((link) => (
                            <button
                                key={link}
                                onClick={() => toggleNav(link.toLowerCase().replace(/\s/g, '-'))}
                                className={`nav-link ${activeNav === link.toLowerCase().replace(/\s/g, '-') ? 'active' : ''}`}
                            >
                                {link}
                            </button>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="nav-actions">
                        <button className="nav-login-btn">Login</button>
                        <button className="nav-cta-btn">Get Started</button>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="mobile-menu">
                        {['Home', 'Features', 'How It Works', 'Testimonials'].map((link) => (
                            <button
                                key={link}
                                onClick={() => {
                                    toggleNav(link.toLowerCase().replace(/\s/g, '-'));
                                    setMobileOpen(false);
                                }}
                                className="mobile-nav-link"
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-section" id="home">
                <div className="hero-container">
                    {/* Left Content */}
                    <div className="hero-content">
                        <div className="hero-badge">
                        <FiAward size={16} />
                        </div>

                        <h1 className="hero-title">
                            Your Gateway to <br />
                            <span className="text-gradient">Campus Placements</span>
                        </h1>

                        <p className="hero-subtitle">
                            A comprehensive, production-grade platform bridging students, recruiters & placement officers with AI-driven preparation tools and streamlined recruitment workflows.
                        </p>

                        <div className="hero-stats">
                            {!loading && stats && [
                                { value: stats.totalStudents || '10k', label: 'Placements' },
                                { value: stats.totalRecruiters || '500', label: 'Companies' },
                                { value: '95%', label: 'Success Rate' },
                                { value: '9.5/10', label: 'Security' },
                            ].map((stat, i) => (
                                <div key={i} className="stat-box">
                                    <p className="stat-value">{stat.value}+</p>
                                    <p className="stat-label">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-primary">
                                Start Your Journey <FiArrowRight />
                            </Link>
                            <button className="btn btn-secondary">
                                Explore Features
                            </button>
                        </div>
                    </div>

                    {/* Right Auth Form */}
                    <div className="hero-form-wrapper">
                        <div className="auth-card">
                            {/* Tab Switcher */}
                            <div className="auth-tabs">
                                <button
                                    onClick={() => setAuthTab('signin')}
                                    className={`auth-tab ${authTab === 'signin' ? 'active' : ''}`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setAuthTab('register')}
                                    className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                                >
                                    Register
                                </button>
                            </div>

                            <h2 className="auth-title">
                                {authTab === 'signin' ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p className="auth-subtitle">
                                {authTab === 'signin'
                                    ? 'Sign in to access your placement portal'
                                    : 'Join our placement network today'}
                            </p>

                            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                                {authTab === 'register' && (
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        className="form-input"
                                    />
                                )}

                                {authTab === 'register' && (
                                    <select className="form-input">
                                        <option value="">Select Role</option>
                                        <option value="student">Student</option>
                                        <option value="recruiter">Recruiter</option>
                                    </select>
                                )}

                                <div className="form-group">
                                    <FiMail size={16} className="form-icon" />
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <FiLock size={16} className="form-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        className="form-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="form-toggle"
                                    >
                                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>

                                {authTab === 'signin' && (
                                    <div className="form-link">
                                        <button type="button" className="forgot-pwd">
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-submit">
                                    {authTab === 'signin' ? 'Sign In' : 'Create Account'}
                                </button>

                                <div className="form-divider">
                                    <span>or continue with</span>
                                </div>

                                <div className="social-buttons">
                                    <button type="button" className="social-btn">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.39-2.37 1.025-3.195-.105-.3-.45-1.53.105-3.18 0 0 .84-.27 2.75 1.025.8-.225 1.65-.33 2.5-.33.85 0 1.7.105 2.5.33 1.91-1.29 2.75-1.025 2.75-1.025.555 1.65.21 2.88.105 3.18.64.825 1.025 1.89 1.025 3.195 0 4.605-2.805 5.625-5.475 5.92.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.33 24 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                        GitHub
                                    </button>
                                    <button type="button" className="social-btn">
                                        <svg viewBox="0 0 24 24" width="16" height="16">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        </svg>
                                        Google
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="scroll-indicator">
                    <div className="scroll-dot"></div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="section-header">
                    <h2>Tailored for Every Role</h2>
                    <p>UniPlacements serves all stakeholders in the placement ecosystem</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon student">
                            <FiBookOpen size={24} />
                        </div>
                        <h3>For Students</h3>
                        <p>Build your verified academic profile, track placement drives, apply seamlessly, and access AI-powered preparation resources</p>
                        <ul className="feature-list">
                            <li><FiCheckCircle size={14} /> Academic Profile Verification</li>
                            <li><FiCheckCircle size={14} /> Job Application Tracking</li>
                            <li><FiCheckCircle size={14} /> Interview Preparation</li>
                            <li><FiCheckCircle size={14} /> Mock Tests & Analysis</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon recruiter">
                            <FiBriefcase size={24} />
                        </div>
                        <h3>For Recruiters</h3>
                        <p>Access verified candidates, post campus drives with academic criteria, and streamline your hiring process</p>
                        <ul className="feature-list">
                            <li><FiCheckCircle size={14} /> Verified Candidate Pool</li>
                            <li><FiCheckCircle size={14} /> Advanced Filtering</li>
                            <li><FiCheckCircle size={14} /> Drive Management</li>
                            <li><FiCheckCircle size={14} /> Analytics Dashboard</li>
                        </ul>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon admin">
                            <FiUsers size={24} />
                        </div>
                        <h3>For Placement Cells</h3>
                        <p>Manage drives, verify student records in bulk, coordinate with recruiters, and track statistics in real-time</p>
                        <ul className="feature-list">
                            <li><FiCheckCircle size={14} /> Drive Management</li>
                            <li><FiCheckCircle size={14} /> Bulk Verification</li>
                            <li><FiCheckCircle size={14} /> Recruiter Coordination</li>
                            <li><FiCheckCircle size={14} /> Real-time Analytics</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Featured Jobs Section */}
            {!loading && featuredJobs.length > 0 && (
                <section className="jobs-section" id="featured-jobs">
                    <div className="section-header">
                        <h2>Featured Opportunities</h2>
                        <p>Latest job openings from verified partners</p>
                    </div>

                    <div className="jobs-grid">
                        {featuredJobs.slice(0, 6).map((job) => (
                            <div key={job._id} className="job-card">
                                <div className="job-header">
                                    <span className="job-company">{job.company}</span>
                                </div>
                                <h3 className="job-title">{job.title}</h3>
                                <p className="job-desc">{job.description?.substring(0, 80)}...</p>

                                <div className="job-meta">
                                    {job.package && <span>💰 ₹{job.package}+ LPA</span>}
                                    {job.minCGPA && <span>📊 CGPA: {job.minCGPA}+</span>}
                                </div>

                                <Link to="/register" className="job-link">
                                    Apply Now <FiArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Active Drives Section */}
            {!loading && activeDrives.length > 0 && (
                <section className="drives-section">
                    <div className="section-header">
                        <h2>Active Placement Drives</h2>
                        <p>Explore ongoing campus recruitment opportunities</p>
                    </div>

                    <div className="drives-grid">
                        {activeDrives.slice(0, 6).map((drive) => (
                            <div key={drive._id} className="drive-card">
                                <span className="drive-company">{drive.company}</span>
                                <h3>{drive.title}</h3>
                                <p>{drive.description?.substring(0, 100)}...</p>
                                <p className="drive-dates">
                                    📅 {new Date(drive.startDate).toLocaleDateString()} - {new Date(drive.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="cta-section">
                <h2>Ready to Start Your Journey?</h2>
                <p>Join thousands of students and recruiters on UniPlacements</p>
                <div className="cta-buttons">
                    <Link to="/register" className="btn btn-primary">
                        Register Now <FiArrowRight />
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                        Already a Member? Sign In
                    </Link>
                </div>
            </section>

            {/* Trust Section */}
            <section className="trust-section">
                <div className="section-header">
                    <h2>Trusted Platform</h2>
                    <p>Trusted by leading universities and companies</p>
                </div>

                <div className="trust-grid">
                    <div className="trust-card">
                        <FiAward size={28} />
                        <h4>95%+ Success Rate</h4>
                        <p>Consistent placement success across all programs</p>
                    </div>
                    <div className="trust-card">
                        <FiUsers size={28} />
                        <h4>10k+ Placements</h4>
                        <p>Successful student placements annually</p>
                    </div>
                    <div className="trust-card">
                        <FiBriefcase size={28} />
                        <h4>500+ Companies</h4>
                        <p>Top organizations partnering with us</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <FiAward size={20} />
                        <span>UniPlacements</span>
                    </div>
                    <p>&copy; 2026 UniPlacements - University Placement & Preparation Portal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

