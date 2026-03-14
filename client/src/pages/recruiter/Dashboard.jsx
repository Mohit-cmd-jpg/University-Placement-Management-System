import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';
import { FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getProfileCompletion } from '../../services/profileCompletion';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalJobs: 0, totalApplicants: 0, approved: 0 });
    const [showProfilePopup, setShowProfilePopup] = useState(true);
    const profileCompletion = getProfileCompletion(user);

    useEffect(() => {
        jobAPI.getMyJobs().then(res => {
            const jobs = res.data;
            setStats({
                totalJobs: jobs.length,
                approved: jobs.filter(j => j.status === 'approved').length,
                totalApplicants: 0
            });
        }).catch(() => { });
    }, []);

    return (
        <Layout title="Recruiter Dashboard">
            <div className="fade-in">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome back, {user?.name} 👋</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.recruiterProfile?.company || 'Company profile pending'}</p>
                </header>

                {!profileCompletion.isComplete && showProfilePopup && (
                    <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--warning)', background: 'linear-gradient(90deg, rgba(245,158,11,0.08), transparent 55%)' }}>
                        <h3 style={{ marginBottom: '0.4rem', fontSize: '1rem' }}>Complete Your Profile</h3>
                        <p style={{ marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Your profile is {profileCompletion.percentage}% complete. Complete it to fully enable recruiter workflow.
                        </p>
                        <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.9rem' }}>
                            <div style={{ height: '100%', width: `${profileCompletion.percentage}%`, background: 'var(--warning)' }} />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Missing: {profileCompletion.missingFields.join(', ')}
                        </p>
                        <div className="flex gap-1 mt-1.5">
                            <Link to="/recruiter/profile" className="btn btn-primary btn-sm">Complete Profile</Link>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowProfilePopup(false)}>Remind Me Later</button>
                        </div>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue"><FiBriefcase /></div>
                        <div className="stat-info"><h3>{stats.totalJobs}</h3><p>Jobs Posted</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><FiCheckCircle /></div>
                        <div className="stat-info"><h3>{stats.approved}</h3><p>Approved</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><FiUsers /></div>
                        <div className="stat-info"><h3>{stats.totalApplicants}</h3><p>Applicants</p></div>
                    </div>
                </div>

                <div className="flex flex-col-mobile gap-3 mt-3">
                    <Link to="/recruiter/post-job" className="btn btn-primary w-full-mobile flex justify-center">+ Post New Job</Link>
                    <Link to="/recruiter/my-jobs" className="btn btn-secondary w-full-mobile flex justify-center">View My Jobs</Link>
                </div>
            </div>
        </Layout>
    );
};

export default RecruiterDashboard;
