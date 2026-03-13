import { Link } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiBook, FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp } from 'react-icons/fi';

const Landing = () => {
    return (
        <div className="landing-page">
            {/* Glassmorphic Navbar */}
            <nav className="landing-nav glass-heavy">
                <div className="logo text-gradient mb-0" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/logo.png" alt="UniPlacements Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                    <span>UniPlacements</span>
                </div>
                <div className="nav-links flex gap-2 items-center">
                    <Link to="/login" className="btn btn-secondary btn-sm hover-lift">Login</Link>
                    <Link to="/register" className="btn btn-primary btn-sm hover-lift">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content animate-fade-in-up">
                    <div className="badge badge-primary mb-3" style={{ margin: '0 auto', display: 'inline-flex' }}>
                        🎓 Professional Placement Management System
                    </div>
                    <h1>Your Gateway to <br /> <span className="text-gradient">Campus Placements</span></h1>
                    <p className="hero-subtitle">
                        A powerful, centralized platform to manage campus recruitment drives, student academic records, and job applications seamlessly.
                    </p>
                    <div className="hero-actions mt-3">
                        <Link to="/register" className="btn btn-primary btn-lg hover-lift">Start Your Journey <FiArrowRight /></Link>
                        <Link to="/login" className="btn btn-secondary btn-lg hover-lift">Sign In</Link>
                    </div>

                    <div className="trust-signals mt-3 flex flex-col-mobile justify-center items-center gap-3" style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                        <span className="flex items-center gap-1"><FiCheckCircle /> 10k+ Placements</span>
                        <span className="flex items-center gap-1"><FiShield /> Verified Recruiters</span>
                        <span className="flex items-center gap-1"><FiTrendingUp /> 95% Success Rate</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="text-center mb-3">
                    <h2 className="text-gradient section-title">End-to-End Placement Management</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>A unified system designed specifically for universities to streamline their entire campus recruitment process.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card glass hover-lift">
                        <div className="icon animate-float" style={{ animationDelay: '0s' }}>📊</div>
                        <h3>For Placement Cells</h3>
                        <p>Manage campus placement drives, verify student academic records in bulk, coordinate with recruiters, and track placement statistics in real-time.</p>
                    </div>
                    <div className="feature-card glass hover-lift">
                        <div className="icon animate-float" style={{ animationDelay: '1s' }}>🏢</div>
                        <h3>For Recruiters</h3>
                        <p>Partner with universities, post jobs with strict academic eligibility criteria, screen verified applicants, and streamline campus hiring.</p>
                    </div>
                    <div className="feature-card glass hover-lift">
                        <div className="icon animate-float" style={{ animationDelay: '2s' }}>🎓</div>
                        <h3>For Students</h3>
                        <p>Create verified academic profiles, track upcoming campus drives, apply seamlessly, and access supplementary AI preparation resources.</p>
                    </div>
                </div>
            </section>

            <footer className="glass" style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <p>© 2026 UniPlacements - University Placement & Preparation Portal.</p>
            </footer>
        </div>
    );
};

export default Landing;
