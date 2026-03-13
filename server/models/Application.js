const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected'], default: 'applied' },
    coverLetter: { type: String },
    resumeUrl: { type: String },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String },
    aiEvaluation: {
        matchScore: { type: Number, default: 0 },
        skillMatchScore: { type: Number, default: 0 },
        experienceMatchScore: { type: Number, default: 0 },
        // Legacy field kept for compatibility
        matchPercentage: { type: Number, default: 0 },
        strengthSummary: String,
        riskFactors: [String],
        recommendation: { type: String, enum: ['Strong', 'Moderate', 'Weak'] },
        lastEvaluated: Date
    }
}, { timestamps: true });

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
