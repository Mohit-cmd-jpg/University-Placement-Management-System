const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'application', 'announcement', 'admin_message'], default: 'info' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    link: { type: String },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // For admin messages
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
