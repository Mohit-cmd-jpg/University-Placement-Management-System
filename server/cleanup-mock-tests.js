/**
 * Cleanup Script: Remove all AI-generated mock tests from database
 * This completely clears all AI-generated tests to start fresh with new isolation policies
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
        console.log(`📊 Total AI-generated tests in database: ${countBefore}`);

        if (countBefore === 0) {
            console.log('✅ No AI-generated tests to remove\n');
            await mongoose.connection.close();
            return;
        }

        // Get details of tests to be deleted
        const testsToDelete = await MockTest.find({ category: 'AI Generated' })
            .select('title createdBy createdAt');
        
        console.log('\n📋 Tests to be deleted:\n');
        testsToDelete.forEach((test, idx) => {
            console.log(`${idx + 1}. "${test.title}" - Created by: ${test.createdBy}, Date: ${test.createdAt.toISOString()}`);
        });

        // Delete all AI-generated tests
        const result = await MockTest.deleteMany({ category: 'AI Generated' });
        console.log(`\n✅ Successfully deleted ${result.deletedCount} AI-generated mock test(s)\n`);

        // Count after deletion
        const countAfter = await MockTest.countDocuments({ category: 'AI Generated' });
        console.log(`📊 AI-generated tests remaining: ${countAfter}`);
        console.log('✅ Cleanup completed! Database is now fresh for new isolation policies.\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
};

cleanupAIGeneratedTests();
