const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    description: { type: String },
    eligibility: {
        minCGPA: { type: Number, default: 0 },
        branches: [String],
        batch: String
    },
    schedule: [{
        time: String,
        activity: String
    }],
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
    isActive: { type: Boolean, default: true }, // Inactive if date has passed
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
