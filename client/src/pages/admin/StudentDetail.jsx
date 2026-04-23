import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { studentAPI, applicationAPI, FILE_BASE_URL, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appLoading, setAppLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageSubject, setMessageSubject] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                // Fetch student profile by ID - using the general student endpoint and filter
                const allStudents = await studentAPI.getAll();
                const foundStudent = allStudents.data.find(s => s._id === id);
                if (foundStudent) {
                    setStudent(foundStudent);
                } else {
                    toast.error('Student not found');
                    navigate('/admin/students');
                }
            } catch (err) {
                toast.error('Error loading student profile');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchApplications = async () => {
            try {
                setAppLoading(true);
                // Get all applications and filter by student id
                const response = await applicationAPI.getAll();
                const studentApps = response.data.filter(app => app.student._id === id);
                // Sort by appliedAt date descending
                studentApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
                setApplications(studentApps);
            } catch (err) {
                console.error('Error loading applications:', err);
            } finally {
                setAppLoading(false);
            }
        };

        if (id) {
            fetchStudentData();
            fetchApplications();
        }
    }, [id, navigate]);

    const getStatusCount = (status) => {
        return applications.filter(app => app.status === status).length;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'selected': return 'badge-success';
            case 'rejected': return 'badge-danger';
            case 'shortlisted': return 'badge-info';
            case 'interview': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'selected': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'shortlisted': return '#3b82f6';
            case 'interview': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const handleSendMessage = async () => {
        if (!messageSubject.trim() || !messageBody.trim()) {
            toast.error('Please fill in both subject and message');
            return;
        }

        try {
            setSendingMessage(true);
            await adminAPI.sendMessage(id, messageSubject, messageBody);
            toast.success('Message sent successfully!');
            setMessageSubject('');
            setMessageBody('');
            setShowMessageModal(false);
        } catch (error) {
            toast.error('Error sending message');
            console.error(error);
        } finally {
            setSendingMessage(false);
        }
    };

    if (loading) return <Layout title="Student Profile"><div className="loading"><div className="spinner"></div></div></Layout>;

    if (!student) return <Layout title="Student Profile"><div style={{ padding: '2rem', textAlign: 'center' }}>Student not found</div></Layout>;

    const sp = student.studentProfile || {};
    const totalApplications = applications.length;
    const statusCounts = {
        applied: getStatusCount('applied'),
        shortlisted: getStatusCount('shortlisted'),
        interview: getStatusCount('interview'),
        selected: getStatusCount('selected'),
        rejected: getStatusCount('rejected'),
    };

    return (
        <Layout title="Student Profile">
            <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header with back and message buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/admin/students')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        ← Back to Students
                    </button>
                    <button onClick={() => setShowMessageModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                        💬 Send Message
                    </button>
                </div>

                {/* Profile Section */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Profile Photo */}
                        <div style={{ flex: '0 0 150px', textAlign: 'center' }}>
                            {sp.profileImage ? (
                                <img
                                    src={`data:${sp.profileImageContentType};base64,${sp.profileImage}`}
                                    alt={student.name}
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        border: '3px solid var(--primary)',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                    border: '2px dashed var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem'
                                }}>
                                    No Photo
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{student.name}</h2>
                            <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                <strong>Email:</strong> {student.email}
                            </p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                                <strong>Department:</strong> {sp.department || 'N/A'}
                            </p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                                <strong>Batch:</strong> {sp.batch || 'N/A'} | <strong>CGPA:</strong> {sp.cgpa || 'N/A'}
                            </p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
                                <strong>Roll Number:</strong> {sp.rollNumber || 'N/A'} | <strong>Gender:</strong> {sp.gender || 'N/A'}
                            </p>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <span className={`badge ${student.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                    {student.isVerified ? '✓ VERIFIED' : 'PENDING'}
                                </span>
                                {sp.isPlaced && (
                                    <>
                                        <span className="badge badge-success">✓ PLACED</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>at {sp.placedAt}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Profile Info */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Academic & Contact Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>10th Percentage</p>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{sp.tenthPercentage || 'N/A'}%</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>12th Percentage</p>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{sp.twelfthPercentage || 'N/A'}%</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Mobile</p>
                                <p style={{ margin: 0, fontWeight: 600 }}>{sp.phoneCountryCode || '+91'} {sp.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Address</p>
                                <p style={{ margin: 0, fontWeight: 600 }}>{sp.address || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Skills</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {(sp.skills || []).map((skill, i) => (
                                    <span key={i} style={{
                                        background: 'var(--primary-glow)',
                                        color: 'var(--primary)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {sp.linkedIn && (
                                <a href={sp.linkedIn} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                    LinkedIn
                                </a>
                            )}
                            {sp.github && (
                                <a href={sp.github} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                    GitHub
                                </a>
                            )}
                            {sp.portfolio && (
                                <a href={sp.portfolio} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                    Portfolio
                                </a>
                            )}
                            {sp.resumeUrl && (
                                <a href={`${FILE_BASE_URL}${sp.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                    📄 View Resume
                                </a>
                            )}
                        </div>

                        {/* Work Experience */}
                        {sp.experience?.length > 0 && (
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Work Experience</h3>
                                {sp.experience.map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{exp.title}</h4>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{exp.duration}</span>
                                        </div>
                                        <p style={{ margin: '0.25rem 0 0.75rem 0', fontWeight: 600, color: 'var(--primary)' }}>{exp.company}</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects */}
                        {sp.projects?.length > 0 && (
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Projects</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {sp.projects.map((proj, i) => (
                                        <div key={i} style={{ background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{proj.title}</h4>
                                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{proj.description}</p>
                                            {proj.link && (
                                                <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    View Project ↗
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certificates */}
                        {sp.certificates?.length > 0 && (
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Certificates</h3>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {sp.certificates.map((cert, i) => (
                                        <span key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Application Statistics */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Application Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Applications</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#3b82f6' }}>{totalApplications}</p>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>{statusCounts.selected}</p>
                        </div>
                        <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rejected</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#f43f5e' }}>{statusCounts.rejected}</p>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shortlisted</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#3b82f6' }}>{statusCounts.shortlisted}</p>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interview</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{statusCounts.interview}</p>
                        </div>
                        <div style={{ background: 'rgba(107, 114, 128, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(107, 114, 128, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Applied</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: '#6b7280' }}>{statusCounts.applied}</p>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Job Applications ({totalApplications})</h3>
                    {appLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" style={{ margin: '0 auto' }}></div>
                        </div>
                    ) : totalApplications === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            No job applications yet.
                        </p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="responsive-table">
                                <thead>
                                    <tr>
                                        <th>Job Title</th>
                                        <th className="hidden-mobile">Company</th>
                                        <th>Applied Date</th>
                                        <th>Status</th>
                                        <th className="hidden-mobile">AI Evaluation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app._id}>
                                            <td data-label="Job Title" style={{ fontWeight: 600 }}>
                                                {app.job?.title || 'Job Removed'}
                                            </td>
                                            <td data-label="Company" className="hidden-mobile">
                                                {app.job?.postedBy?.recruiterProfile?.company || app.job?.postedBy?.name || 'N/A'}
                                            </td>
                                            <td data-label="Applied Date">
                                                {new Date(app.appliedAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                                            </td>
                                            <td data-label="Status">
                                                <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                                                    {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Applied'}
                                                </span>
                                            </td>
                                            <td data-label="AI Evaluation" className="hidden-mobile">
                                                {app.aiEvaluation?.matchScore ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '50%',
                                                            background: `conic-gradient(${getStatusColor(app.aiEvaluation.recommendation === 'Strong' ? 'selected' : app.aiEvaluation.recommendation === 'Moderate' ? 'shortlisted' : 'rejected')} ${app.aiEvaluation.matchScore}%, #e5e7eb 0)`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            color: 'white'
                                                        }}>
                                                            {app.aiEvaluation.matchScore}
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem' }}>
                                                            {app.aiEvaluation.recommendation}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Message Modal */}
                {showMessageModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Send Message to {student.name}</h3>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Subject</label>
                                <input
                                    type="text"
                                    value={messageSubject}
                                    onChange={(e) => setMessageSubject(e.target.value)}
                                    placeholder="Message subject"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Message</label>
                                <textarea
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows="6"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="btn btn-secondary"
                                    disabled={sendingMessage}
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    className="btn btn-primary"
                                    disabled={sendingMessage}
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    {sendingMessage ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentDetail;
