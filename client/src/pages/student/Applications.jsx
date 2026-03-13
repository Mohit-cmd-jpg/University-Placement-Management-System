import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { applicationAPI } from '../../services/api';

const statusColors = { applied: 'badge-info', shortlisted: 'badge-warning', interview: 'badge-primary', selected: 'badge-success', rejected: 'badge-danger' };

const StudentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        applicationAPI.getMyApplications()
            .then(res => setApplications(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout title="My Applications"><div className="loading"><div className="spinner"></div></div></Layout>;

    return (
        <Layout title="My Applications">
            <div className="fade-in">
                {applications.length === 0 ? (
                    <div className="empty-state">
                        <h3>No applications yet</h3>
                        <p>Start applying for jobs to track them here</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="responsive-table">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Company</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app._id}>
                                        <td data-label="Job Title" style={{ fontWeight: 600 }}>{app.job?.title || 'N/A'}</td>
                                        <td data-label="Company">{app.job?.company || 'N/A'}</td>
                                        <td data-label="Applied On">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                        <td data-label="Status">
                                            <span className={`badge ${statusColors[app.status] || 'badge-info'}`}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentApplications;
