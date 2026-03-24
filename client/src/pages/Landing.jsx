import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiUsers, FiBriefcase, FiBookOpen, FiAward } from 'react-icons/fi';
import '../styles/Landing.css';

const Landing = () => {
    const [stats, setStats] = useState(null);
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [activeDrives, setActiveDrives] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-navbar glass-morphism">
                <div className="navbar-container">
                    <div className="navbar-logo">
                        <img src="/logo.png" alt="UniPlacements" className="logo-img" />
                        <span className="logo-text">UniPlacements</span>
                    </div>
                    <div className="navbar-links">
                        <Link to="/login" className="nav-link">Sign In</Link>
                        <Link to="/register" className="nav-btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="gradient-blob blob-1"></div>
                    <div className="gradient-blob blob-2"></div>
                    <div className="gradient-blob blob-3"></div>
                </div>
                
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-icon">🎓</span>
                        <span>Professional Placement Management System</span>
                    </div>
                    
                    <h1 className="hero-title">
                        Your Gateway to <br />
                        <span className="text-gradient">Campus Placements</span>
                    </h1>
                    
                    <p className="hero-subtitle">
                        A powerful, centralized platform connecting universities, students, and recruiters. 
                        Manage campus recruitment drives, track academic records, and streamline job applications seamlessly.
                    </p>
                    
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Start Your Journey <FiArrowRight />
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign In
                        </Link>
                    </div>

                    {!loading && stats && (
                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">{stats.totalStudents}+</div>
                                <div className="stat-label">Verified Students</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{stats.activeJobs}+</div>
                                <div className="stat-label">Active Positions</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{stats.successfulPlacements}+</div>
                                <div className="stat-label">Placements</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Role Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Tailored for Every Role</h2>
                    <p>UniPlacements serves all stakeholders in the placement ecosystem</p>
                </div>

                <div className="roles-grid">
                    {/* Students */}
                    <div className="role-card glass-morphism">
                        <div className="role-icon">
                            <FiBookOpen size={32} />
                        </div>
                        <h3>For Students</h3>
                        <p className="role-description">
                            Build your verified academic profile, track placement drives, apply seamlessly, and access AI-powered preparation resources
                        </p>
                        <ul className="role-features">
                            <li><FiCheckCircle size={16} /> Academic Profile Verification</li>
                            <li><FiCheckCircle size={16} /> Job Application Tracking</li>
                            <li><FiCheckCircle size={16} /> Interview Preparation</li>
                            <li><FiCheckCircle size={16} /> Mock Tests & Analysis</li>
                        </ul>
                    </div>

                    {/* Recruiters */}
                    <div className="role-card glass-morphism">
                        <div className="role-icon recruiter">
                            <FiBriefcase size={32} />
                        </div>
                        <h3>For Recruiters</h3>
                        <p className="role-description">
                            Access verified candidates, post campus drives with academic criteria, and streamline your hiring process
                        </p>
                        <ul className="role-features">
                            <li><FiCheckCircle size={16} /> Verified Candidate Pool</li>
                            <li><FiCheckCircle size={16} /> Advanced Filtering</li>
                            <li><FiCheckCircle size={16} /> Drive Management</li>
                            <li><FiCheckCircle size={16} /> Analytics Dashboard</li>
                        </ul>
                    </div>

                    {/* Placement Cells */}
                    <div className="role-card glass-morphism">
                        <div className="role-icon admin">
                            <FiUsers size={32} />
                        </div>
                        <h3>For Placement Cells</h3>
                        <p className="role-description">
                            Manage drives, verify student records in bulk, coordinate with recruiters, and track statistics in real-time
                        </p>
                        <ul className="role-features">
                            <li><FiCheckCircle size={16} /> Drive Management</li>
                            <li><FiCheckCircle size={16} /> Bulk Verification</li>
                            <li><FiCheckCircle size={16} /> Recruiter Coordination</li>
                            <li><FiCheckCircle size={16} /> Real-time Analytics</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Key Features Section */}
            <section className="highlights-section">
                <div className="section-header">
                    <h2>Powerful Features</h2>
                    <p>Everything you need for seamless campus placement management</p>
                </div>

                <div className="highlights-grid">
                    <div className="highlight-card glass-morphism">
                        <div className="highlight-icon">📊</div>
                        <h4>Real-time Analytics</h4>
                        <p>Track placements, applications, and participation statistics in real-time</p>
                    </div>
                    <div className="highlight-card glass-morphism">
                        <div className="highlight-icon">🔐</div>
                        <h4>Verified Profiles</h4>
                        <p>All students and recruiters are verified for authentic interactions</p>
                    </div>
                    <div className="highlight-card glass-morphism">
                        <div className="highlight-icon">🤖</div>
                        <h4>AI-Powered Tools</h4>
                        <p>Resume analysis, interview preparation, and intelligent candidate ranking</p>
                    </div>
                    <div className="highlight-card glass-morphism">
                        <div className="highlight-icon">⚡</div>
                        <h4>Seamless Integration</h4>
                        <p>Works smoothly with academic records and existing university systems</p>
                    </div>
                    <div className="highlight-card glass-morphism">
                        <div className="highlight-icon">📱</div>
                        <h4>Mobile Responsive</h4>
                        <p>Fully responsive design works perfectly on all devices</p>
                    </div>
                    <div className="highlight-card glass-morphism">
                        <div className="highlight-icon">🛡️</div>
                        <h4>Secure & Safe</h4>
                        <p>Enterprise-grade security with encrypted data and compliance</p>
                    </div>
                </div>
            </section>

            {/* Active Drives Section */}
            {!loading && activeDrives.length > 0 && (
                <section className="drives-section">
                    <div className="section-header">
                        <h2>Active Placement Drives</h2>
                        <p>Explore ongoing campus recruitment opportunities</p>
                    </div>

                    <div className="drives-grid">
                        {activeDrives.slice(0, 6).map((drive) => (
                            <div key={drive._id} className="drive-card glass-morphism">
                                <div className="drive-company">{drive.company}</div>
                                <h4 className="drive-title">{drive.title}</h4>
                                <p className="drive-description">{drive.description?.substring(0, 100)}...</p>
                                <div className="drive-dates">
                                    <span className="date-label">📅</span>
                                    <span>
                                        {new Date(drive.startDate).toLocaleDateString()} - {new Date(drive.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Jobs Section */}
            {!loading && featuredJobs.length > 0 && (
                <section className="jobs-section">
                    <div className="section-header">
                        <h2>Featured Opportunities</h2>
                        <p>Latest job openings from verified partners</p>
                    </div>

                    <div className="jobs-grid">
                        {featuredJobs.slice(0, 6).map((job) => (
                            <div key={job._id} className="job-card glass-morphism">
                                <div className="job-company">{job.company}</div>
                                <h4 className="job-title">{job.title}</h4>
                                <p className="job-description">{job.description?.substring(0, 100)}...</p>
                                
                                <div className="job-meta">
                                    {job.package && (
                                        <span className="meta-item">💰 ₹{job.package}+ LPA</span>
                                    )}
                                    {job.minCGPA && (
                                        <span className="meta-item">📊 CGPA: {job.minCGPA}+</span>
                                    )}
                                </div>
                                
                                <Link to="/register" className="job-cta">
                                    Apply Now <FiArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="view-all-link">
                        <Link to="/login" className="btn btn-outline">
                            View All Opportunities <FiArrowRight />
                        </Link>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="cta-section glass-morphism">
                <div className="cta-content">
                    <h2>Ready to Start Your Journey?</h2>
                    <p>Join thousands of students and recruiters on UniPlacements</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Register Now <FiArrowRight />
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Already a Member? Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust & Awards Section */}
            <section className="trust-section">
                <div className="section-header">
                    <h2>Trusted Platform</h2>
                    <p>Trusted by leading universities and companies</p>
                </div>

                <div className="trust-grid">
                    <div className="trust-card">
                        <FiAward size={28} className="trust-icon" />
                        <h4>95%+ Success Rate</h4>
                        <p>Consistent placement success across all programs</p>
                    </div>
                    <div className="trust-card">
                        <FiUsers size={28} className="trust-icon" />
                        <h4>10k+ Placements</h4>
                        <p>Successful student placements annually</p>
                    </div>
                    <div className="trust-card">
                        <FiBriefcase size={28} className="trust-icon" />
                        <h4>500+ Companies</h4>
                        <p>Top organizations partnering with us</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src="/logo.png" alt="UniPlacements" className="footer-logo" />
                        <span>UniPlacements</span>
                    </div>
                    <p>&copy; 2026 UniPlacements - University Placement & Preparation Portal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

