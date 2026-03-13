const mongoose = require('mongoose');

const mockTestAttemptSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
    answers: [{
        questionIndex: Number,
        answer: String,
        isCorrect: Boolean,
        pointsAwarded: Number,
        aiFeedback: {
            // Rubric-based scores (new)
            accuracyScore: { type: Number, default: 0 },
            conceptScore: { type: Number, default: 0 },
            clarityScore: { type: Number, default: 0 },
            totalScore: { type: Number, default: 0 },
            strengths: String,
            weaknesses: String,
            improvementAdvice: String,
            // Legacy fields (kept for compatibility)
            score: Number,
            analysis: String,
            improvementSuggestion: String,
        }
    }],
    totalScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    overallAiFeedback: String,
    status: { type: String, enum: ['in-progress', 'submitted', 'evaluated'], default: 'evaluated' },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MockTestAttempt', mockTestAttemptSchema);
