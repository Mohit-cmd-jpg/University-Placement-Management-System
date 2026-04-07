const mongoose = require('mongoose');

const externalJobSchema = new mongoose.Schema({
    jobId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    type: { type: String, default: 'Full-time' },
    applyUrl: { type: String, required: true },
    source: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
    salary: { type: String },
    isIndia: { type: Boolean, default: false },
    searchKeywords: [String] // to match against future students
}, { timestamps: true });

// Setup text indexing for easy searching
externalJobSchema.index({ title: 'text', searchKeywords: 'text' });

// Automatically expire and remove old job listings after 15 days (1296000 seconds)
externalJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1296000 });

module.exports = mongoose.model('ExternalJob', externalJobSchema);