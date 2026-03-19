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
    },
    atsEvaluation: {
        atsScore: { type: Number, default: 0 },
        keywordMatch: { type: Number, default: 0 },
        skillsMatch: { type: Number, default: 0 },
        experienceMatch: { type: Number, default: 0 },
        formattingScore: { type: Number, default: 0 },
        missingKeywords: [String],
        suggestions: [String]
    }
}, { timestamps: true });

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
