const mongoose = require('mongoose');

/**
 * Question Bank - Tracks all generated questions to prevent duplicates
 * Ensures every generated question is unique across all tests
 */
const questionBankSchema = new mongoose.Schema({
    question: { type: String, required: true, unique: true, index: true },
    topic: { type: String, required: true, index: true },
    type: { type: String, enum: ['mcq', 'subjective', 'coding'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    options: [String], // only for mcq
    correctAnswer: { type: String, required: true },
    explanation: String,
    points: { type: Number, default: 1 },
    // Hash for similarity detection
    questionHash: { type: String, index: true }, // SHA256 hash of question
    createdAt: { type: Date, default: Date.now },
    usedInTests: [
        {
            testId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
            generatedAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

// Index for faster lookups
questionBankSchema.index({ topic: 1, type: 1, difficulty: 1 });
questionBankSchema.index({ questionHash: 1 });

/**
 * Get all question hashes for a topic to check for similar questions
 */
questionBankSchema.statics.getTopicQuestionHashes = async function(topic) {
    const questions = await this.find({ topic }).select('questionHash');
    return questions.map(q => q.questionHash);
};

/**
 * Add used test reference to a question
 */
questionBankSchema.methods.addTestUsage = async function(testId) {
    this.usedInTests.push({ testId });
    return this.save();
};

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

module.exports = QuestionBank;
