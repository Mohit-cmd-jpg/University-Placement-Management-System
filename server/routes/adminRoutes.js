const express = require('express');
const router = express.Router();
const ATSSettings = require('../models/ATSSettings');

// In production, add a middleware here like `isAdmin` 
// router.use(isAdmin);

/**
 * GET /admin/ats-settings
 * Retrieve the current ATS settings for the admin panel
 */
router.get('/ats-settings', async (req, res) => {
  try {
    let settings = await ATSSettings.findOne({});
    
    // If no settings exist yet, create default
    if (!settings) {
      settings = await ATSSettings.create({});
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching ATS settings:', error);
    res.status(500).json({ error: 'Failed to fetch ATS settings' });
  }
});

/**
 * POST /admin/ats-settings
 * Update ATS config data
 */
router.post('/ats-settings', async (req, res) => {
  try {
    const { weights, customKeywords, roleBasedSkills, thresholdScore } = req.body;
    
    // Validate weight total
    if (weights) {
      const total = (weights.keywordWeight || 0) + 
                    (weights.skillsWeight || 0) + 
                    (weights.experienceWeight || 0) + 
                    (weights.formattingWeight || 0);
      
      if (total !== 100) {
        return res.status(400).json({ error: 'Total sum of weights must equal 100.' });
      }
    }

    let settings = await ATSSettings.findOne({});

    if (!settings) {
      settings = new ATSSettings(req.body);
    } else {
      settings.weights = weights || settings.weights;
      settings.customKeywords = customKeywords || settings.customKeywords;
      settings.roleBasedSkills = roleBasedSkills || settings.roleBasedSkills;
      settings.thresholdScore = thresholdScore || settings.thresholdScore;
    }

    await settings.save();
    res.status(200).json({ message: 'Settings updated successfully', settings });

  } catch (error) {
    console.error('Error updating ATS settings:', error);
    res.status(500).json({ error: 'Server error updating ATS settings' });
  }
});

module.exports = router;
