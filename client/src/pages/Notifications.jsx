import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        notificationAPI.getAll().then(res => setNotifications(res.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch { }
    };

    const typeIcons = { info: 'ℹ️', success: '✅', warning: '⚠️', application: '📋', announcement: '📢' };

    if (loading) return <Layout title="Notifications"><div className="loading"><div className="spinner"></div></div></Layout>;

    return (
        <Layout title="Notifications">
            <div className="fade-in">
                <div className="flex items-center justify-between mb-2">
                    <p style={{ color: 'var(--text-muted)' }}>{notifications.filter(n => !n.isRead).length} unread</p>
                    <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark All Read</button>
                </div>
                {notifications.length === 0 ? (
                    <div className="empty-state"><h3>No notifications</h3></div>
                ) : (
                    notifications.map((n) => (
                        <div key={n._id} className="card" style={{ marginBottom: '0.75rem', borderLeft: !n.isRead ? '3px solid var(--primary)' : 'none', opacity: n.isRead ? 0.7 : 1 }}>
                            <div className="flex items-center gap-1">
                                <span style={{ fontSize: '1.2rem' }}>{typeIcons[n.type] || 'ℹ️'}</span>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem' }}>{n.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default Notifications;
