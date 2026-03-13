const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeScore: { type: Number, default: 0 },
    technicalSkillsScore: { type: Number, default: 0 },
    projectsScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    clarityScore: { type: Number, default: 0 },
    strengths: [String],
    weaknesses: [String],
    missingSkills: [String],
    suggestions: [String]
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
