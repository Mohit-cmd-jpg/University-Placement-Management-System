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
        const updates = req.body || {};
        const existing = await User.findById(req.user._id);
        if (!existing) {
            return res.status(404).json({ error: 'Recruiter not found' });
        }

        const mergedProfile = { ...(existing.recruiterProfile || {}), ...updates };
        const phoneDigits = String(mergedProfile.phone || '').replace(/\D/g, '');
        const phoneCountryCode = String(mergedProfile.phoneCountryCode || '').trim();
        const resolvedName = String(updates.name || existing.name || '').trim();

        const missingFields = [];
        if (!resolvedName) missingFields.push('name');
        if (!String(mergedProfile.company || '').trim()) missingFields.push('company');
        if (!String(mergedProfile.designation || '').trim()) missingFields.push('designation');
        if (!/^\+\d{1,4}$/.test(phoneCountryCode)) missingFields.push('phone country code');
        if (!/^\d{10}$/.test(phoneDigits)) missingFields.push('phone (10 digits)');
        if (!String(mergedProfile.companyWebsite || '').trim()) missingFields.push('company website');
        if (!String(mergedProfile.companyDescription || '').trim()) missingFields.push('company description');
        if (!String(mergedProfile.industry || '').trim()) missingFields.push('industry');

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Complete all required profile fields before saving. Missing: ${missingFields.join(', ')}.`,
                missingFields,
                profileRequired: true
            });
        }

        mergedProfile.phone = phoneDigits;
        mergedProfile.phoneCountryCode = phoneCountryCode;

        const recruiter = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { recruiterProfile: mergedProfile, name: resolvedName } },
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
