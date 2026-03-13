const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get recruiter profile
router.get('/profile', auth, authorize('recruiter'), async (req, res) => {
    try {
        const recruiter = await User.findById(req.user._id);
        res.json(recruiter);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update recruiter profile
router.put('/profile', auth, authorize('recruiter'), async (req, res) => {
    try {
        const updates = req.body;
        const recruiter = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { recruiterProfile: { ...req.user.recruiterProfile, ...updates }, name: updates.name || req.user.name } },
            { new: true, runValidators: true }
        );
        res.json(recruiter);
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Get all recruiters (for admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const recruiters = await User.find({ role: 'recruiter' }).select('-password');
        res.json(recruiters);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
