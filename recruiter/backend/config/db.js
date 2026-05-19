const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
require('dotenv').config();

let bucket;

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGO_URI_TEST 
      : (process.env.MONGO_URI || 'mongodb://localhost:27017/recruiter_db');    
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ Recruiter MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS bucket
    const db = mongoose.connection.db;
    bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });

    return { conn, bucket };
  } catch (error) {
    console.error('❌ Recruiter MongoDB Connection Failed', error);
    process.exit(1);
  }
};

const getBucket = () => {
  if (!bucket) {
    throw new Error('GridFSBucket not initialized. Connect to DB first.');
  }
  return bucket;
};

module.exports = { connectDB, getBucket };

