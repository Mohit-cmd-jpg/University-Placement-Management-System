/**
 * Cleanup Script: Remove all AI-generated mock tests from database
 * Run with: node server/cleanup-mock-tests.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MockTest = require('./models/MockTest');

const cleanupAIGeneratedTests = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-db');
        console.log('✅ Connected to MongoDB\n');

        // Count before deletion
        const countBefore = await MockTest.countDocuments({ category: 'AI Generated' });
        console.log(`📊 AI-generated tests before cleanup: ${countBefore}`);

        if (countBefore === 0) {
            console.log('✅ No AI-generated tests to remove\n');
            await mongoose.connection.close();
            return;
        }

        // Delete all AI-generated tests
        const result = await MockTest.deleteMany({ category: 'AI Generated' });
        console.log(`🗑️  Deleted ${result.deletedCount} AI-generated mock test(s)\n`);

        // Count after deletion
        const countAfter = await MockTest.countDocuments({ category: 'AI Generated' });
        console.log(`📊 AI-generated tests after cleanup: ${countAfter}`);
        console.log('✅ Cleanup completed successfully!\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
};

cleanupAIGeneratedTests();
