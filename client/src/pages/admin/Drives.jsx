import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDrives = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', company: '', date: '', venue: '', description: '', batch: '', minCGPA: 0, branches: '' });

    useEffect(() => { loadDrives(); }, []);

    const loadDrives = async () => {
        try { const res = await adminAPI.getDrives(); setDrives(res.data); } catch { } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createDrive({
                title: form.title, company: form.company, date: form.date, venue: form.venue,
                description: form.description,
                eligibility: { minCGPA: parseFloat(form.minCGPA), batch: form.batch, branches: form.branches.split(',').map(s => s.trim()).filter(Boolean) }
            });
            toast.success('Drive created!');
            setShowForm(false);
            setForm({ title: '', company: '', date: '', venue: '', description: '', batch: '', minCGPA: 0, branches: '' });
            loadDrives();
        } catch { toast.error('Error creating drive'); }
    };

    const deleteDrive = async (id) => {
        if (!confirm('Delete this drive?')) return;
        try { await adminAPI.deleteDrive(id); setDrives(drives.filter(d => d._id !== id)); toast.success('Deleted'); } catch { toast.error('Error'); }
    };

    const statusColors = { upcoming: 'badge-info', ongoing: 'badge-warning', completed: 'badge-success' };

    if (loading) return <Layout title="Placement Drives"><div className="loading"><div className="spinner"></div></div></Layout>;

    return (
        <Layout title="Placement Drives">
            <div className="fade-in">
                <div className="flex items-center justify-between mb-2">
                    <p style={{ color: 'var(--text-muted)' }}>{drives.length} drives</p>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Drive'}</button>
                </div>

                {showForm && (
                    <div className="card mb-2">
                        <h3 style={{ marginBottom: '1rem' }}>Create Placement Drive</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                                <div className="form-group"><label>Company *</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                                <div className="form-group"><label>Venue *</label><input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required /></div>
                            </div>
                            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="2" /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Batch</label><input value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} /></div>
                                <div className="form-group"><label>Branches (comma sep.)</label><input value={form.branches} onChange={e => setForm({ ...form, branches: e.target.value })} /></div>
                            </div>
                            <button type="submit" className="btn btn-primary">Create Drive</button>
                        </form>
                    </div>
                )}

                {drives.length === 0 ? (
                    <div className="empty-state"><h3>No drives scheduled</h3></div>
                ) : (
                    <div className="jobs-grid">
                        {drives.map((drive) => (
                            <div key={drive._id} className="job-card">
                                <h3>{drive.title}</h3>
                                <p className="company">{drive.company}</p>
                                <div className="meta">
                                    <span>📅 {new Date(drive.date).toLocaleDateString()}</span>
                                    <span>📍 {drive.venue}</span>
                                </div>
                                <span className={`badge ${statusColors[drive.status] || 'badge-info'}`}>{drive.status?.toUpperCase()}</span>
                                <div className="actions" style={{ marginTop: '0.75rem' }}>
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteDrive(drive._id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminDrives;
