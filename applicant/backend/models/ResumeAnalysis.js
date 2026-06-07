const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    required: true
  },
  breakdown: {
    completeness: Number,
    formatting: Number,
    keywordCoverage: Number,
    experienceQuality: Number,
    projectQuality: Number,
    grammar: Number
  },
  strengths: [String],
  weaknesses: [String],
  missingSkills: [String],
  recommendations: [String],
  jobDescriptionProvided: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
