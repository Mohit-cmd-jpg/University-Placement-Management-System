const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get user notifications
router.get('/', auth, async (req, res) => {
    try {
        // Lazy cleanup: Delete read notifications older than 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await Notification.deleteMany({
            user: req.user._id,
            isRead: true,
            readAt: { $lt: oneDayAgo }
        });

        const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
