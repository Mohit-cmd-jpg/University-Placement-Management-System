const mongoose = require('mongoose');

const ATSSettingsSchema = new mongoose.Schema({
  weights: {
    keywordWeight: { type: Number, default: 40, min: 0, max: 100 },
    skillsWeight: { type: Number, default: 30, min: 0, max: 100 },
    experienceWeight: { type: Number, default: 20, min: 0, max: 100 },
    formattingWeight: { type: Number, default: 10, min: 0, max: 100 }
  },
  customKeywords: { type: [String], default: [] },
  roleBasedSkills: {
    type: Map,
    of: [String],
    default: {}
  },
  thresholdScore: { type: Number, default: 60, min: 0, max: 100 }
}, { timestamps: true });

// Ensure total weights equal 100 before saving
ATSSettingsSchema.pre('save', function (next) {
  const total = this.weights.keywordWeight + 
                this.weights.skillsWeight + 
                this.weights.experienceWeight + 
                this.weights.formattingWeight;
  if(total !== 100) {
    return next(new Error('Total sum of ATS scoring weights must equal 100'));
  }
  next();
});

module.exports = mongoose.model('ATSSettings', ATSSettingsSchema);
