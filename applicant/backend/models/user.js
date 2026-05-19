const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: () => Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  password: {
    type: String,
    required: true
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'uploads.files'
  },
  profileImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'uploads.files'
  },
  // Additional profile fields
  collegeName: {
    type: String,
    default: ''
  },
  skills: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  linkedinProfile: {
    type: String,
    default: ''
  },
  githubProfile: {
    type: String,
    default: ''
  },
  portfolioWebsite: {
    type: String,
    default: ''
  },
  workExperience: {
    type: String,
    default: ''
  },
  achievements: {
    type: String,
    default: ''
  },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

