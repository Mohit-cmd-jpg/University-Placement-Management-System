const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');

// Public landing page statistics
router.get('/landing-stats', async (req, res) => {
    try {
        const [studentCount, recruiterCount, activeJobs, totalPlacements, recentDrives] = await Promise.all([
            User.countDocuments({ role: 'student', isVerified: true }),
            User.countDocuments({ role: 'recruiter', isVerified: true }),
            Job.countDocuments({ status: 'approved', isActive: true }),
            Application.countDocuments({ status: 'accepted' }),
            PlacementDrive.find({}).sort('-createdAt').limit(5).select('title company description startDate endDate')
        ]);

        res.json({
            totalStudents: studentCount,
            totalRecruiters: recruiterCount,
            activeJobs: activeJobs,
            successfulPlacements: totalPlacements,
            recentDrives: recentDrives
        });
    } catch (error) {
        console.error('Landing stats error:', error);
        res.status(500).json({ error: 'Error fetching landing statistics' });
    }
});

// Public featured jobs (limited, recent)
router.get('/featured-jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'approved', isActive: true })
            .populate('postedBy', 'name recruiterProfile')
            .sort('-createdAt')
            .limit(6)
            .select('title company title description package minCGPA branch postedBy');
        
        res.json(jobs);
    } catch (error) {
        console.error('Featured jobs error:', error);
        res.status(500).json({ error: 'Error fetching featured jobs' });
    }
});

// Public active placement drives
router.get('/active-drives', async (req, res) => {
    try {
        const drives = await PlacementDrive.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        })
        .sort('-createdAt')
        .limit(8)
        .select('title company description startDate endDate');
        
        res.json(drives);
    } catch (error) {
        console.error('Active drives error:', error);
        res.status(500).json({ error: 'Error fetching active placement drives' });
    }
});

module.exports = router;
