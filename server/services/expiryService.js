/**
 * Expiry Service
 * Handles automatic expiration and cleanup of jobs, announcements, and placement drives
 * based on their deadlines/dates
 */

const Job = require('../models/Job');
const Announcement = require('../models/Announcement');
const PlacementDrive = require('../models/PlacementDrive');

/**
 * Mark expired jobs as inactive
 */
const expireJobs = async () => {
    try {
        const now = new Date();
        const result = await Job.updateMany(
            {
                deadline: { $lt: now },
                isActive: true,
                status: 'approved'
            },
            { $set: { isActive: false } }
        );
        if (result.modifiedCount > 0) {
            console.log(`✅ Expired ${result.modifiedCount} job(s) - marked as inactive`);
        }
        return result;
    } catch (error) {
        console.error('❌ Error expiring jobs:', error.message);
    }
};

/**
 * Mark expired announcements as inactive
 */
const expireAnnouncements = async () => {
    try {
        const now = new Date();
        const result = await Announcement.updateMany(
            {
                expiresAt: { $lt: now, $ne: null },
                isActive: true
            },
            { $set: { isActive: false } }
        );
        if (result.modifiedCount > 0) {
            console.log(`✅ Expired ${result.modifiedCount} announcement(s) - marked as inactive`);
        }
        return result;
    } catch (error) {
        console.error('❌ Error expiring announcements:', error.message);
    }
};

/**
 * Mark expired placement drives as inactive and update status
 */
const expirePlacementDrives = async () => {
    try {
        const now = new Date();
        const result = await PlacementDrive.updateMany(
            {
                date: { $lt: now },
                isActive: true
            },
            { 
                $set: { 
                    isActive: false,
                    status: 'completed'
                }
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`✅ Expired ${result.modifiedCount} placement drive(s) - marked as completed and inactive`);
        }
        return result;
    } catch (error) {
        console.error('❌ Error expiring placement drives:', error.message);
    }
};

/**
 * Run all expiry checks
 * @returns {Promise<Object>} Summary of expired items
 */
const runExpiryCheck = async () => {
    console.log('\n⏰ Running expiry check...');
    try {
        const jobsExpired = await expireJobs();
        const announcementsExpired = await expireAnnouncements();
        const drivesExpired = await expirePlacementDrives();

        const summary = {
            jobsExpired: jobsExpired?.modifiedCount || 0,
            announcementsExpired: announcementsExpired?.modifiedCount || 0,
            drivesExpired: drivesExpired?.modifiedCount || 0,
            totalExpired: (jobsExpired?.modifiedCount || 0) + (announcementsExpired?.modifiedCount || 0) + (drivesExpired?.modifiedCount || 0)
        };

        console.log(`📊 Expiry Summary:`, summary);
        return summary;
    } catch (error) {
        console.error('❌ Error in expiry check:', error.message);
        return { error: error.message };
    }
};

/**
 * Setup periodic expiry check using setInterval
 * Runs every 1 hour
 * @param {number} intervalMs - Interval in milliseconds (default: 1 hour)
 * @returns {NodeJS.Timeout} Timer ID
 */
const setupExpiryCheckInterval = (intervalMs = 60 * 60 * 1000) => {
    console.log(`⏲️  Setting up expiry check interval: every ${intervalMs / (60 * 1000)} minutes`);
    
    // Run immediately on startup
    runExpiryCheck();
    
    // Set up recurring check
    const timerId = setInterval(runExpiryCheck, intervalMs);
    return timerId;
};

module.exports = {
    expireJobs,
    expireAnnouncements,
    expirePlacementDrives,
    runExpiryCheck,
    setupExpiryCheckInterval
};
