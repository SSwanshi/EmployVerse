const mongoose = require('mongoose');
require('dotenv').config();

let recruiterConn;

const connectRecruiterDB = async () => {
  if (!recruiterConn) {
    recruiterConn = await mongoose.createConnection(
      process.env.MONGO_URI_RECRUITERS || 'mongodb://localhost:27017/recruiter_db',
      {
        serverSelectionTimeoutMS: 20000,
      }
    );
    console.log("✅ Connected to recruiter DB from applicant server");
  }
  return recruiterConn;
};

module.exports = connectRecruiterDB;

