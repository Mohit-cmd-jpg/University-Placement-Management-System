const mongoose = require('mongoose');
require('dotenv').config();

const MockTest = require('../models/MockTest');
const MockTestAttempt = require('../models/MockTestAttempt');

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const testCount = await MockTest.countDocuments();
        const attemptCount = await MockTestAttempt.countDocuments();

        console.log(`🗑️ Deleting ${testCount} mock tests...`);
        await MockTest.deleteMany({});

        console.log(`🗑️ Deleting ${attemptCount} test attempts...`);
        await MockTestAttempt.deleteMany({});

        console.log('✅ Successfully cleared all mock test data!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing data:', err.message);
        process.exit(1);
    }
};

clearData();
