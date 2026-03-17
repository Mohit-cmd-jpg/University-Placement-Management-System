import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { studentAPI, adminAPI, FILE_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';

const AdminStudents = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { studentAPI.getAll().then(res => setStudents(res.data)).catch(() => { }).finally(() => setLoading(false)); }, []);

    const toggleVerify = async (id, current) => {
        try {
            await adminAPI.verifyStudent(id, !current);
            setStudents(students.map(s => s._id === id ? { ...s, isVerified: !current } : s));
            toast.success(!current ? 'Student verified' : 'Verification revoked');
        } catch { toast.error('Error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student account? This will also remove their applications.')) return;
        try {
            await adminAPI.deleteStudent(id);
            setStudents(students.filter(s => s._id !== id));
            toast.success('Student deleted successfully');
        } catch { toast.error('Error deleting student'); }
    };

    if (loading) return <Layout title="Student Management"><div className="loading"><div className="spinner"></div></div></Layout>;

    return (
        <Layout title="Student Management">
            <div className="fade-in">
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{students.length} students registered</p>
                <div className="table-container">
                    <table className="responsive-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th className="hidden-mobile">Email</th>
                                <th>Dept</th>
                                <th>CGPA</th>
                                <th className="hidden-mobile">Batch</th>
                                <th>Resume</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s._id}>
                                    <td data-label="Name" style={{ fontWeight: 600 }}>{s.name}</td>
                                    <td data-label="Email" className="hidden-mobile">{s.email}</td>
                                    <td data-label="Dept">{s.studentProfile?.department || 'N/A'}</td>
                                    <td data-label="CGPA">{s.studentProfile?.cgpa || 'N/A'}</td>
                                    <td data-label="Batch" className="hidden-mobile">{s.studentProfile?.batch || 'N/A'}</td>
                                    <td data-label="Resume">
                                        {s.studentProfile?.resumeUrl ? (
                                            <a href={`${FILE_BASE_URL}${s.studentProfile.resumeUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>PDF</a>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                                        )}
                                    </td>
                                    <td data-label="Status">
                                        <span className={`badge ${s.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                            {s.isVerified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="flex gap-1 justify-end-mobile" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            <button className="btn btn-sm btn-primary" onClick={() => navigate(`/admin/students/${s._id}`)}>
                                                Details
                                            </button>
                                            <button className={`btn btn-sm ${s.isVerified ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleVerify(s._id, s.isVerified)}>
                                                {s.isVerified ? 'Revoke' : 'Verify'}
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminStudents;
