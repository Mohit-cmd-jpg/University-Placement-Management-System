const mongoose = require('mongoose');

const interviewEvaluationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewQuestion', required: true },
    studentAnswer: { type: String, required: true },
    score: { type: Number, default: 0 },
    strengths: { type: String },
    weaknesses: { type: String },
    improvementTips: { type: String },
    aiAnalysis: { type: Object } // Store full AI response for reference
}, { timestamps: true });

module.exports = mongoose.model('InterviewEvaluation', interviewEvaluationSchema);
