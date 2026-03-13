const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
    role: { type: String, required: true }, // e.g., 'Software Engineer', 'Data Analyst'
    category: { type: String, enum: ['Technical', 'Behavioral', 'HR'], required: true },
    questionText: { type: String, required: true },
    idealAnswer: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
