import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI, notificationAPI, studentAPI } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiFileText, FiCheckCircle, FiBell, FiBook, FiTarget, FiCpu, FiChevronDown, FiChevronUp, FiAlertCircle, FiAward, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CustomCheckbox = ({ checked, onChange, color = 'var(--primary)' }) => (
    <div
        role="checkbox"
        aria-checked={checked}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(); }}
        style={{
            width: '20px', height: '20px', minWidth: '20px',
            borderRadius: '6px',
            border: checked ? `2px solid ${color}` : '2px solid var(--border)',
            background: checked ? color : 'var(--bg-card)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.18s ease',
            boxShadow: checked ? `0 0 0 3px ${color}22` : 'none',
        }}
    >
        {checked && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )}
    </div>
);

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
    const [insightOpen, setInsightOpen] = useState(false);

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
            toast.success('âœ¨ New mentor plan generated!');
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome, {user?.name} ðŸ‘‹</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {user?.isVerified ? 'âœ… Profile Verified' : 'â³ Profile verification pending'}
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
                        {(() => {
                            const criteria = [
                                { key: 'technicalSkills', label: 'Technical Skills', score: aiResume?.technicalSkillsScore || 0, color: '#3b82f6', icon: 'âš™ï¸', desc: 'Relevance & depth of skills, tools, and frameworks' },
                                { key: 'projects',        label: 'Projects',         score: aiResume?.projectsScore || 0,          color: '#8b5cf6', icon: 'ðŸ’»', desc: 'Quality, complexity, quantified impact of projects' },
                                { key: 'experience',      label: 'Experience',       score: aiResume?.experienceScore || 0,        color: '#10b981', icon: 'ðŸ¢', desc: 'Internships, co-ops, open-source, achievements' },
                                { key: 'ats',             label: 'ATS Score',        score: aiResume?.atsScore || 0,               color: '#f59e0b', icon: 'ðŸ¤–', desc: 'Keywords, section headers, formatting, scannability' },
                                { key: 'clarity',         label: 'Clarity & Impact', score: aiResume?.clarityScore || 0,           color: '#ef4444', icon: 'âœï¸', desc: 'Action verbs, quantification, professional tone' },
                            ];
                            const scoreColor = resumeScore >= 75 ? '#10b981' : resumeScore >= 55 ? '#f59e0b' : '#ef4444';
                            const scoreLabel = resumeScore >= 75 ? 'Strong' : resumeScore >= 55 ? 'Average' : 'Needs Work';
                            const bd = aiResume?.criteriaBreakdown || {};
                            const gradeColor = (g) => g === 'A' ? '#10b981' : g === 'B' ? '#3b82f6' : g === 'C' ? '#f59e0b' : '#ef4444';

                            return (
                                <div className="card" style={{ overflow: 'hidden' }}>
                                    {/* Clickable Header */}
                                    <div
                                        onClick={() => hasResume && setInsightOpen(o => !o)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '1rem 1.25rem',
                                            cursor: hasResume ? 'pointer' : 'default',
                                            borderBottom: insightOpen && hasResume ? '1px solid var(--border)' : 'none',
                                            userSelect: 'none',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <span style={{ fontSize: '1.1rem' }}>âœ¨</span>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>AI Resume Insights</span>
                                            {hasResume && (
                                                <span style={{
                                                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px',
                                                    borderRadius: '99px', background: `${scoreColor}20`, color: scoreColor
                                                }}>{scoreLabel}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {hasResume && (
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{resumeScore}</div>
                                                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</div>
                                                </div>
                                            )}
                                            {hasResume && (insightOpen ? <FiChevronUp size={18} color="var(--text-muted)" /> : <FiChevronDown size={18} color="var(--text-muted)" />)}
                                        </div>
                                    </div>

                                    {!hasResume ? (
                                        <div className="text-center p-8">
                                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>ðŸ“„</div>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Upload your resume to unlock AI-powered ATS analysis.</p>
                                            <Link to="/student/profile" className="btn btn-primary">Upload Resume</Link>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Always-visible: 5-bar summary */}
                                            <div style={{ padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                                                {criteria.map(c => (
                                                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <span style={{ fontSize: '0.75rem', width: '120px', minWidth: '120px', color: 'var(--text-secondary)', fontWeight: 500 }}>{c.icon} {c.label}</span>
                                                        <div style={{ flex: 1, height: '7px', background: 'var(--bg-dark)', borderRadius: '99px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${(c.score / 20) * 100}%`, background: c.color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: c.color, minWidth: '36px', textAlign: 'right' }}>{c.score}/20</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Expandable Detail Panel */}
                                            {insightOpen && (
                                                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                                                    {/* Per-Criteria Breakdown */}
                                                    <h6 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.6rem' }}>Detailed Criteria Breakdown</h6>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                                        {criteria.map(c => {
                                                            const info = bd[c.key] || {};
                                                            const grade = info.grade || 'â€”';
                                                            const pct = Math.round((c.score / 20) * 100);
                                                            return (
                                                                <div key={c.key} style={{
                                                                    background: 'var(--bg-dark)', borderRadius: '10px', padding: '0.75rem 1rem',
                                                                    borderLeft: `3px solid ${c.color}`,
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span style={{ fontSize: '0.85rem' }}>{c.icon}</span>
                                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.label}</span>
                                                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.desc}</span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                                            {grade !== 'â€”' && (
                                                                                <span style={{
                                                                                    fontSize: '0.7rem', fontWeight: 800, padding: '1px 7px',
                                                                                    borderRadius: '6px', background: `${gradeColor(grade)}20`, color: gradeColor(grade)
                                                                                }}>Grade {grade}</span>
                                                                            )}
                                                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: c.color }}>{c.score}/20</span>
                                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({pct}%)</span>
                                                                        </div>
                                                                    </div>
                                                                    {/* Mini bar */}
                                                                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: info.notes ? '0.4rem' : 0 }}>
                                                                        <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: '99px' }} />
                                                                    </div>
                                                                    {info.notes && (
                                                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{info.notes}</p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Strengths + Weaknesses */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                                                                <FiAward size={13} color="#10b981" />
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Strengths</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                {(aiResume.strengths || []).map((s, i) => (
                                                                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                                                        <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>âœ“</span>
                                                                        <span>{s}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                                                                <FiAlertCircle size={13} color="#f59e0b" />
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Gaps</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                {(aiResume.weaknesses || []).map((w, i) => (
                                                                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                                                        <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>!</span>
                                                                        <span>{w}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Missing Skills */}
                                                    {(aiResume.missingSkills || []).length > 0 && (
                                                        <div style={{ marginBottom: '1rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                                                                <FiTag size={13} color="#ef4444" />
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Missing Skills</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                {(aiResume.missingSkills || []).map((s, i) => (
                                                                    <span key={i} style={{
                                                                        fontSize: '0.75rem', padding: '3px 10px', borderRadius: '99px',
                                                                        background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430', fontWeight: 500
                                                                    }}>{s}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Suggestions */}
                                                    {(aiResume.suggestions || []).length > 0 && (
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                                                                <span style={{ fontSize: '0.8rem' }}>ðŸ’¡</span>
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Improvement Tips</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                {(aiResume.suggestions || []).map((s, i) => (
                                                                    <div key={i} style={{
                                                                        display: 'flex', gap: '8px', fontSize: '0.8rem',
                                                                        color: 'var(--text-secondary)', background: 'var(--bg-dark)',
                                                                        padding: '6px 10px', borderRadius: '8px', lineHeight: 1.4
                                                                    }}>
                                                                        <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                                                                        <span>{s}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                                        <Link to="/student/profile" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                                                            ðŸ”„ Re-analyze Resume â†’
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })()}
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 className="card-title">AI Career Mentor</h3>
                            {aiReco && (
                                <button className="btn btn-sm" style={{ fontSize: '0.75rem', padding: '4px 12px' }} onClick={() => setShowRecoInput(true)}>
                                    Re-generate Plan
                                </button>
                            )}
                        </div>
                        {aiReco ? (
                            <div style={{ padding: '1rem' }}>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>Target: {aiReco.targetRole}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{aiReco.overallAssessment}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {aiReco.roadmap.map((phase, idx) => {
                                        const isOpen = openPhase === idx;
                                        const topicsDone = (phase.topics || []).filter(t => t.completed).length;
                                        const tasksDone = (phase.tasks || []).filter(t => t.completed).length;
                                        const total = (phase.topics?.length || 0) + (phase.tasks?.length || 0);
                                        const done = topicsDone + tasksDone;
                                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                                        return (
                                            <div key={idx} style={{
                                                border: '1px solid var(--border)',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                background: 'var(--bg-card)',
                                            }}>
                                                {/* Accordion Header */}
                                                <div
                                                    onClick={() => setOpenPhase(isOpen ? -1 : idx)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        padding: '0.85rem 1rem', cursor: 'pointer',
                                                        background: isOpen ? 'var(--bg-dark)' : 'transparent',
                                                        transition: 'background 0.15s',
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    {/* Phase badge */}
                                                    <div style={{
                                                        fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)',
                                                        background: 'var(--primary)15', padding: '2px 8px',
                                                        borderRadius: '99px', whiteSpace: 'nowrap'
                                                    }}>{phase.phase}</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h5 style={{ fontSize: '0.92rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{phase.title}</h5>
                                                    </div>
                                                    {/* Progress pill */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
                                                        <div style={{ width: '52px', height: '5px', background: 'var(--bg-dark)', borderRadius: '99px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: '99px', transition: 'width 0.3s' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{pct}%</span>
                                                    </div>
                                                    <FiCpu size={15} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                                                </div>

                                                {/* Accordion Body */}
                                                {isOpen && (
                                                    <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid var(--border)' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                                            {/* Topics */}
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                                                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topics</span>
                                                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '1px 6px', borderRadius: '99px' }}>{topicsDone}/{phase.topics?.length || 0}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    {(phase.topics || []).map((t, i) => (
                                                                        <div
                                                                            key={i}
                                                                            onClick={() => handleToggleTopic(idx, i, !!t.completed, false)}
                                                                            style={{
                                                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                                                padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
                                                                                background: t.completed ? 'var(--primary)0d' : 'var(--bg-dark)',
                                                                                border: `1px solid ${t.completed ? 'var(--primary)30' : 'transparent'}`,
                                                                                transition: 'all 0.15s',
                                                                            }}
                                                                        >
                                                                            <CustomCheckbox checked={!!t.completed} onChange={() => handleToggleTopic(idx, i, !!t.completed, false)} color="var(--primary)" />
                                                                            <span style={{
                                                                                fontSize: '0.83rem', lineHeight: 1.4,
                                                                                color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                                                                textDecoration: t.completed ? 'line-through' : 'none',
                                                                            }}>{t.name || t}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {/* Tasks */}
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                                                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasks</span>
                                                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '1px 6px', borderRadius: '99px' }}>{tasksDone}/{phase.tasks?.length || 0}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    {(phase.tasks || []).map((t, i) => (
                                                                        <div
                                                                            key={i}
                                                                            onClick={() => handleToggleTopic(idx, i, !!t.completed, true)}
                                                                            style={{
                                                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                                                padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
                                                                                background: t.completed ? 'var(--warning)0d' : 'var(--bg-dark)',
                                                                                border: `1px solid ${t.completed ? 'var(--warning)30' : 'transparent'}`,
                                                                                transition: 'all 0.15s',
                                                                            }}
                                                                        >
                                                                            <CustomCheckbox checked={!!t.completed} onChange={() => handleToggleTopic(idx, i, !!t.completed, true)} color="var(--warning)" />
                                                                            <span style={{
                                                                                fontSize: '0.83rem', lineHeight: 1.4,
                                                                                color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                                                                textDecoration: t.completed ? 'line-through' : 'none',
                                                                            }}>{t.name || t}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
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
                                            {hasResume ? 'âœ¨ Generate My Plan' : 'Upload resume first'}
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
                                                {loadingReco ? 'â³ AI Thinkingâ€¦' : 'âœ¨ Generate Plan'}
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
