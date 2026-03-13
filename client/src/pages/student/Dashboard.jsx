import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI, notificationAPI, studentAPI } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiFileText, FiCheckCircle, FiBell, FiBook, FiTarget, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CategoryScore = ({ label, score, max = 20, color }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{score}</div>
        <div style={{
            height: '4px', background: 'var(--bg-dark)', borderRadius: '99px', overflow: 'hidden',
            margin: '3px auto 4px', width: '80%'
        }}>
            <div style={{ height: '100%', width: `${(score / max) * 100}%`, background: color, borderRadius: '99px' }} />
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
    </div>
);

const StudentDashboard = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ jobs: 0, applications: 0, shortlisted: 0, notifications: 0 });
    const [loadingReco, setLoadingReco] = useState(false);
    const [targetRole, setTargetRole] = useState('');
    const [showRecoInput, setShowRecoInput] = useState(false);
    const [openPhase, setOpenPhase] = useState(0);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [jobsRes, appsRes, notifRes] = await Promise.all([
                jobAPI.getAll(),
                applicationAPI.getMyApplications(),
                notificationAPI.getUnreadCount()
            ]);

            setStats({
                jobs: jobsRes.data.length,
                applications: appsRes.data.length,
                shortlisted: appsRes.data.filter(a => a.status === 'shortlisted' || a.status === 'selected').length,
                notifications: notifRes.data.count
            });
        } catch { }
    };

    const handleGetRecommendations = async () => {
        if (!targetRole || targetRole.trim() === '') {
            return toast.error("Please specify your target job role to generate a personalized plan.");
        }

        setLoadingReco(true);
        try {
            await studentAPI.getRecommendations(targetRole);
            const profileRes = await studentAPI.getProfile();
            updateUser(profileRes.data);
            setShowRecoInput(false);
            setTargetRole('');
            toast.success('✨ New mentor plan generated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate recommendations');
        } finally {
            setLoadingReco(false);
        }
    };

    const handleToggleTopic = async (phaseIndex, index, currentStatus, isTask = false) => {
        try {
            const res = await studentAPI.updateRecommendationProgress({
                phaseIndex,
                [isTask ? 'taskIndex' : 'topicIndex']: index,
                completed: !currentStatus,
                isTask
            });
            const updatedUser = JSON.parse(JSON.stringify(user));
            updatedUser.studentProfile.aiRecommendations.roadmap = res.data.roadmap;
            updateUser(updatedUser);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update progress');
        }
    };

    const aiResume = user?.studentProfile?.aiResumeAnalysis;
    const aiReco = user?.studentProfile?.aiRecommendations;
    const hasResume = aiResume?.resumeScore > 0 || aiResume?.score > 0;
    const resumeScore = aiResume?.resumeScore || aiResume?.score || 0;

    return (
        <Layout title="Student Dashboard">
            <div className="fade-in">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome, {user?.name} 👋</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {user?.isVerified ? '✅ Profile Verified' : '⏳ Profile verification pending'}
                    </p>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card" onClick={() => navigate('/student/jobs')}>
                        <div className="stat-icon blue"><FiBriefcase /></div>
                        <div className="stat-info"><h3>{stats.jobs}</h3><p>Jobs</p></div>
                    </div>
                    <div className="stat-card" onClick={() => navigate('/student/profile')}>
                        <div className="stat-icon purple"><FiFileText /></div>
                        <div className="stat-info">
                            <h3 style={{ color: resumeScore >= 70 ? 'var(--success)' : resumeScore >= 45 ? 'var(--warning)' : undefined }}>
                                {resumeScore}
                            </h3>
                            <p>Resume</p>
                        </div>
                    </div>
                    <div className="stat-card" onClick={() => navigate('/student/applications')}>
                        <div className="stat-icon orange"><FiCheckCircle /></div>
                        <div className="stat-info"><h3>{stats.shortlisted}</h3><p>Shortlisted</p></div>
                    </div>
                    <div className="stat-card" onClick={() => navigate('/student/notifications')}>
                        <div className="stat-icon red"><FiBell /></div>
                        <div className="stat-info"><h3>{stats.notifications}</h3><p>Alerts</p></div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* AI Insights Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">✨ AI Resume Insights</h3>
                        </div>
                        {hasResume ? (
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <CategoryScore label="Tech" score={aiResume.technicalSkillsScore || 0} color="var(--primary)" />
                                    <CategoryScore label="Proj" score={aiResume.projectsScore || 0} color="var(--secondary)" />
                                    <CategoryScore label="Exp" score={aiResume.experienceScore || 0} color="var(--success)" />
                                    <CategoryScore label="ATS" score={aiResume.atsScore || 0} color="var(--warning)" />
                                    <CategoryScore label="Comm" score={aiResume.clarityScore || 0} color="var(--danger)" />
                                </div>
                                <div className="flex justify-between items-center p-2 mb-4" style={{ background: 'var(--bg-dark)', borderRadius: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resume Strength</span>
                                    <span style={{ fontWeight: 800, color: resumeScore >= 70 ? 'var(--success)' : 'var(--warning)' }}>{resumeScore}%</span>
                                </div>

                                <div className="grid-cols-1-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h6 style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Strengths</h6>
                                        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1rem' }}>
                                            {(aiResume.strengths || []).slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h6 style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Gaps</h6>
                                        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1rem' }}>
                                            {(aiResume.weaknesses || []).slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Unlock AI analysis by uploading your resume.</p>
                                <Link to="/student/profile" className="btn btn-primary">Upload Resume</Link>
                            </div>
                        )}
                    </div>

                    {/* AI Mentor Strategy */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🎯 AI Career Mentor</h3>
                        </div>
                        {aiReco?.roadmap?.length > 0 ? (
                            <div style={{ padding: '1rem' }}>
                                <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>Target: {aiReco.targetRole}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{aiReco.overallAssessment}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {aiReco.roadmap.map((phase, idx) => {
                                        const isOpen = openPhase === idx;
                                        return (
                                            <div key={idx} className={`accordion ${isOpen ? 'active' : ''}`}>
                                                <div className="accordion-header" onClick={() => setOpenPhase(isOpen ? -1 : idx)}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{phase.phase}</div>
                                                        <h5 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>{phase.title}</h5>
                                                    </div>
                                                    <FiCpu style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                                                </div>
                                                {isOpen && (
                                                    <div className="accordion-content">
                                                        <div className="grid-cols-1-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                            <div>
                                                                <h6 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Topics</h6>
                                                                {(phase.topics || []).map((t, i) => (
                                                                    <label key={i} className="flex items-center gap-2 p-2 mb-1 bg-dark-soft rounded cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!t.completed}
                                                                            onChange={() => handleToggleTopic(idx, i, !!t.completed, false)}
                                                                        />
                                                                        <span style={{ fontSize: '0.85rem', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.name || t}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            <div>
                                                                <h6 style={{ fontSize: '0.8rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>Tasks</h6>
                                                                {(phase.tasks || []).map((t, i) => (
                                                                    <label key={i} className="flex items-center gap-2 p-2 mb-1 bg-dark-soft rounded cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!t.completed}
                                                                            onChange={() => handleToggleTopic(idx, i, !!t.completed, true)}
                                                                        />
                                                                        <span style={{ fontSize: '0.85rem', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.name || t}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                {!showRecoInput ? (
                                    <>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Get a custom study roadmap targeted to your role.</p>
                                        <button className="btn btn-primary" onClick={() => setShowRecoInput(true)} disabled={!hasResume}>
                                            {hasResume ? '✨ Generate My Plan' : 'Upload resume first'}
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                                        <label className="form-label">Target Job Role</label>
                                        <input
                                            type="text"
                                            className="form-control mb-3"
                                            placeholder="e.g. Frontend Developer"
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button className="btn btn-primary flex-1" onClick={handleGetRecommendations} disabled={loadingReco}>
                                                {loadingReco ? 'AI Thinking...' : 'Generate Plan'}
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => setShowRecoInput(false)}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Access */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Quick Actions</h3>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                <Link to="/student/preparation" className="btn btn-secondary py-4 flex-column gap-2 rounded-xl">
                                    <FiBook size={24} color="var(--secondary)" />
                                    <span>Practice</span>
                                </Link>
                                <Link to="/student/jobs" className="btn btn-secondary py-4 flex-column gap-2 rounded-xl">
                                    <FiBriefcase size={24} color="var(--success)" />
                                    <span>Jobs</span>
                                </Link>
                                <Link to="/student/profile" className="btn btn-secondary py-4 flex-column gap-2 rounded-xl">
                                    <FiFileText size={24} color="var(--primary)" />
                                    <span>Resume</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboard;
