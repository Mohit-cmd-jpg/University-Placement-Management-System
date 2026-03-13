import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', priority: 'medium', targetAudience: 'all' });

    useEffect(() => { adminAPI.getAnnouncements().then(res => setAnnouncements(res.data)).catch(() => { }).finally(() => setLoading(false)); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await adminAPI.createAnnouncement(form);
            setAnnouncements([res.data, ...announcements]);
            toast.success('Announcement sent!');
            setShowForm(false);
            setForm({ title: '', content: '', priority: 'medium', targetAudience: 'all' });
        } catch { toast.error('Error'); }
    };

    const deleteAnn = async (id) => {
        try { await adminAPI.deleteAnnouncement(id); setAnnouncements(announcements.filter(a => a._id !== id)); toast.success('Deleted'); } catch { }
    };

    const priorityColors = { low: 'badge-info', medium: 'badge-warning', high: 'badge-danger' };

    if (loading) return <Layout title="Announcements"><div className="loading"><div className="spinner"></div></div></Layout>;

    return (
        <Layout title="Announcements">
            <div className="fade-in">
                <div className="flex items-center justify-between mb-2">
                    <p style={{ color: 'var(--text-muted)' }}>{announcements.length} announcements</p>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Announcement'}</button>
                </div>

                {showForm && (
                    <div className="card mb-2">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                            <div className="form-group"><label>Content *</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows="3" required /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Priority</label>
                                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Target Audience</label>
                                    <select value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}>
                                        <option value="all">All</option><option value="students">Students</option><option value="recruiters">Recruiters</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Send Announcement</button>
                        </form>
                    </div>
                )}

                {announcements.map((ann) => (
                    <div key={ann._id} className="card" style={{ marginBottom: '1rem' }}>
                        <div className="flex items-center justify-between">
                            <h3 style={{ fontSize: '1rem' }}>{ann.title}</h3>
                            <div className="flex gap-1 items-center">
                                <span className={`badge ${priorityColors[ann.priority]}`}>{ann.priority?.toUpperCase()}</span>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteAnn(ann._id)}>Delete</button>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{ann.content}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            Target: {ann.targetAudience} • {new Date(ann.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default AdminAnnouncements;
