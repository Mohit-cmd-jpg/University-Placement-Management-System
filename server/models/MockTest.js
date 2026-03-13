const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true }, // Aptitude, Technical, Coding
    duration: { type: Number, required: true }, // in minutes
    totalQuestions: { type: Number, required: true },
    isPublished: { type: Boolean, default: true },
    questions: [{
        question: { type: String, required: true },
        type: { type: String, enum: ['mcq', 'subjective', 'coding'], required: true },
        options: [String], // only for mcq
        correctAnswer: String, // index for mcq, expected output for coding, or keywords for subjective
        points: { type: Number, default: 1 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
