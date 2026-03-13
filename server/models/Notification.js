const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'application', 'announcement'], default: 'info' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    link: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
