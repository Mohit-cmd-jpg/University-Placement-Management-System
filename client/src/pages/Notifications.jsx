import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
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

    const resolveNotificationRoute = (notification) => {
        if (notification?.link) return notification.link;

        const text = `${notification?.title || ''} ${notification?.message || ''}`.toLowerCase();

        if (user?.role === 'student') {
            if (text.includes('job')) return '/student/jobs';
            if (text.includes('application')) return '/student/applications';
            if (text.includes('profile')) return '/student/profile';
            if (text.includes('interview') || text.includes('prep')) return '/student/preparation/tips';
            return '/student/notifications';
        }

        if (user?.role === 'recruiter') {
            if (text.includes('application') || text.includes('job')) return '/recruiter/my-jobs';
            if (text.includes('profile') || text.includes('approval')) return '/recruiter/profile';
            return '/recruiter/notifications';
        }

        if (user?.role === 'admin') {
            if (text.includes('job')) return '/admin/jobs';
            if (text.includes('report') || text.includes('shortlisted')) return '/admin/reports';
            if (text.includes('student')) return '/admin/students';
            if (text.includes('recruiter')) return '/admin/recruiters';
            if (text.includes('announcement')) return '/admin/announcements';
            return '/admin/notifications';
        }

        return '/';
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                await notificationAPI.markRead(notification._id);
                setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)));
            }
        } catch {
            // Non-blocking; still navigate even if mark-read fails.
        }

        navigate(resolveNotificationRoute(notification));
    };

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
                        <button
                            key={n._id}
                            type="button"
                            onClick={() => handleNotificationClick(n)}
                            className="card"
                            style={{ marginBottom: '0.75rem', borderLeft: !n.isRead ? '3px solid var(--primary)' : 'none', opacity: n.isRead ? 0.7 : 1, width: '100%', textAlign: 'left', cursor: 'pointer', borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}
                        >
                            <div className="flex items-center gap-1">
                                <span style={{ fontSize: '1.2rem' }}>{typeIcons[n.type] || 'ℹ️'}</span>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem' }}>{n.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default Notifications;
