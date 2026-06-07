const crypto = require('crypto');
const ResumeAnalysis = require('../../models/ResumeAnalysis');

const generateHash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

const getCachedAnalysis = async (userId, resumeText) => {
  // In a production system we might store the hash in the DB alongside the analysis.
  // For simplicity, we can fetch the user's most recent analysis.
  // If we wanted strict text hashing, we'd add `resumeHash` to the schema.
  
  // Here we just fetch the most recent if within the last 24 hours to prevent spam,
  // but if the user wants true SHA256 caching:
  return null; 
  // Returning null forces full evaluation for now to ensure fresh metrics if job description changes.
  // We can implement strict hashing lookup if added to schema.
};

module.exports = {
  generateHash,
  getCachedAnalysis
};
