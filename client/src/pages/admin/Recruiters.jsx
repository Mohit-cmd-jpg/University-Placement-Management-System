import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminRecruiters = () => {
    const navigate = useNavigate();
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.getRecruiters()
            .then(res => setRecruiters(res.data))
            .catch(() => { toast.error('Failed to load recruiters'); })
            .finally(() => setLoading(false));
    }, []);

    const toggleVerify = async (id, currentStatus) => {
        try {
            await adminAPI.verifyRecruiter(id, !currentStatus);
            setRecruiters(recruiters.map(r => r._id === id ? { ...r, isApprovedByAdmin: !currentStatus } : r));
            toast.success(!currentStatus ? 'Recruiter approved' : 'Approval revoked');
        } catch {
            toast.error('Error updating approval status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recruiter account? This will also remove their job postings and associated applications.')) return;
        try {
            await adminAPI.deleteRecruiter(id);
            setRecruiters(recruiters.filter(r => r._id !== id));
            toast.success('Recruiter deleted successfully');
        } catch { toast.error('Error deleting recruiter'); }
    };

    if (loading) return <Layout title="Recruiter Management"><div className="loading"><div className="spinner"></div></div></Layout>;

    return (
        <Layout title="Recruiter Management">
            <div className="fade-in">
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{recruiters.length} recruiters registered</p>
                <div className="table-container">
                    <table className="responsive-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Designation</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recruiters.length > 0 ? recruiters.map((r) => (
                                <tr key={r._id}>
                                    <td data-label="Name" style={{ fontWeight: 600 }}>{r.name}</td>
                                    <td data-label="Email">{r.email}</td>
                                    <td data-label="Company">{r.recruiterProfile?.company || 'N/A'}</td>
                                    <td data-label="Designation">{r.recruiterProfile?.designation || 'N/A'}</td>
                                    <td data-label="Status">
                                        <span className={`badge ${r.isApprovedByAdmin ? 'badge-success' : 'badge-warning'}`}>
                                            {r.isApprovedByAdmin ? 'APPROVED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="flex gap-1 justify-end-mobile" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            <button className="btn btn-sm btn-primary" onClick={() => navigate(`/admin/recruiters/${r._id}`)}>
                                                Details
                                            </button>
                                            <button
                                                className={`btn btn-sm ${r.isApprovedByAdmin ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => toggleVerify(r._id, r.isApprovedByAdmin)}
                                            >
                                                {r.isApprovedByAdmin ? 'Revoke' : 'Approve'}
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No recruiters found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminRecruiters;
