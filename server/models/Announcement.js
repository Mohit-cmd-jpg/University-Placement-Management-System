const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    targetAudience: { type: String, enum: ['all', 'students', 'recruiters'], default: 'all' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null } // Optional: announcement expires after this date
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
