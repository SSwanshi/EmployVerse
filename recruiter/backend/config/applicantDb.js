const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
require('dotenv').config();

let applicantConnection = null;
let applicantBucket = null;

const connectApplicantDB = async () => {
  try {
    // If connection already exists and is ready, return it
    if (applicantConnection && applicantConnection.readyState === 1) {
      return applicantConnection;
    }

    // Try to get the applicant database URI
    let mongoURI = process.env.MONGO_URI_APPLICANT;
    
    // If MONGO_URI_APPLICANT is not set, try to derive it from MONGO_URI
    // by changing the database name to the applicant database
    if (!mongoURI && process.env.MONGO_URI) {
      const baseURI = process.env.MONGO_URI;
      // Simple approach: replace the database name in the connection string
      // Pattern: mongodb://host:port/dbname or mongodb+srv://host/dbname
      if (baseURI.includes('/')) {
        // Find the last '/' before any '?' and replace everything after it
        const parts = baseURI.split('?');
        const basePart = parts[0];
        const queryPart = parts.length > 1 ? '?' + parts.slice(1).join('?') : '';
        
        // Replace the database name (everything after the last /)
        const lastSlashIndex = basePart.lastIndexOf('/');
        if (lastSlashIndex >= 0) {
          mongoURI = basePart.substring(0, lastSlashIndex + 1) + 'applicant_db' + queryPart;
        } else {
          mongoURI = baseURI + '/applicant_db';
        }
      } else {
        mongoURI = baseURI + '/applicant_db';
      }
      console.log(`ℹ️ MONGO_URI_APPLICANT not set. Derived from MONGO_URI (masked for security)`);
    }
    
    // If still no URI, use default local connection
    if (!mongoURI) {
      mongoURI = 'mongodb://localhost:27017/applicant_db';
      console.warn('⚠️ MONGO_URI_APPLICANT not set. Using default connection: mongodb://localhost:27017/applicant_db');
      console.warn('⚠️ Please set MONGO_URI_APPLICANT in your .env file to point to your applicant database');
    }

    // Create connection
    applicantConnection = await mongoose.createConnection(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    // Initialize GridFS bucket for resume fetching
    if (applicantConnection.db) {
      applicantBucket = new GridFSBucket(applicantConnection.db, {
        bucketName: 'uploads'
      });
    }

    console.log(`✅ Applicant MongoDB Connected: ${applicantConnection.host || applicantConnection.name || 'connected'}`);
    return applicantConnection;
  } catch (error) {
    console.error('❌ Applicant MongoDB Connection Failed:', error.message);
    console.warn('⚠️ Make sure MONGO_URI_APPLICANT is set correctly in your .env file');
    console.warn('⚠️ It should point to the same MongoDB cluster as your applicant backend');
    return null;
  }
};

const getApplicantConnection = () => {
  return applicantConnection;
};

const getApplicantBucket = () => {
  if (!applicantBucket && applicantConnection && applicantConnection.db) {
    applicantBucket = new GridFSBucket(applicantConnection.db, {
      bucketName: 'uploads'
    });
  }
  return applicantBucket;
};

module.exports = { connectApplicantDB, getApplicantConnection, getApplicantBucket };

