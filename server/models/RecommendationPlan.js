const mongoose = require('mongoose');

const roadmapPhaseSchema = new mongoose.Schema({
    phase: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
    focusArea: { type: String, required: true },
    topics: [{
        name: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    tasks: [{
        name: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    strategy: { type: String, required: true }
}, { _id: false });

const recommendationPlanSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    overallAssessment: { type: String },
    skillGapAnalysis: [String],
    prioritySkills: [String],
    roadmap: [roadmapPhaseSchema],
    recommendedProjects: [String],
    recommendedResources: [String],
    interviewPreparationTips: [String],
    suggestedCompanies: [String]
}, { timestamps: true });

module.exports = mongoose.model('RecommendationPlan', recommendationPlanSchema);
