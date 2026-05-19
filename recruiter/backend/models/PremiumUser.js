const mongoose = require('mongoose');
const { getApplicantConnection } = require('../config/applicantDb');

// Schema definition - matches applicant backend Premium_User schema
const PremiumUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: () => Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  password: { type: String },
  memberSince: { type: Date, default: Date.now },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' }
}, { 
  timestamps: true
  // Collection name will be automatically set to 'premium_users' by Mongoose (from model name 'Premium_User')
});

// Get the appropriate connection to create the model (called at runtime)
function getPremiumUserModel() {
  try {
    const applicantConn = getApplicantConnection();
    const connection = applicantConn || mongoose;
    
    // Check if model already exists on this connection
    if (connection.models && connection.models['Premium_User']) {
      return connection.models['Premium_User'];
    }
    
    // Create model on the appropriate connection
    // Use 'Premium_User' as model name to match applicant backend
    return connection.model('Premium_User', PremiumUserSchema);
  } catch (error) {
    console.error('Error getting PremiumUser model:', error);
    // Fallback to default mongoose connection
    if (mongoose.models && mongoose.models['Premium_User']) {
      return mongoose.models['Premium_User'];
    }
    return mongoose.model('Premium_User', PremiumUserSchema);
  }
}

// Export a wrapper that gets the model each time
module.exports = {
  find: function(query, projection) {
    return getPremiumUserModel().find(query, projection);
  },
  findOne: function(query) {
    return getPremiumUserModel().findOne(query);
  },
  findById: function(id) {
    return getPremiumUserModel().findById(id);
  }
};

