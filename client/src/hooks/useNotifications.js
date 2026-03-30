import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';

/**
 * useNotifications Hook
 * Centralizes the logic for fetching, marking, and managing notifications.
 * 
 * @returns {Object} { notifications, unreadCount, fetchNotifications, markAsRead, markAllRead }
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setUnreadCount(res.data.count || 0);
        } catch (err) {
            console.error('[useNotifications] Failed to fetch unread count:', err);
        }
    }, []);

    const fetchNotifications = useCallback(async (limit = 10) => {
        setLoading(true);
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data.slice(0, limit));
        } catch (err) {
            console.error('[useNotifications] Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            await notificationAPI.markRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('[useNotifications] Failed to mark notification as read:', err);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('[useNotifications] Failed to mark all as read:', err);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Polling every minute
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllRead,
        refreshUnreadCount: fetchUnreadCount
    };
};
