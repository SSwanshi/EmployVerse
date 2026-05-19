const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
require('dotenv').config();

let gfs;
let bucket;
let conn;

const initGridFS = async () => {
  if (!conn) {
    const mongoURI = process.env.MONGO_URI_RECRUITERS || "mongodb://localhost:27017/recruiter_db";
    
    conn = mongoose.createConnection(mongoURI);

    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
      conn.once('open', () => {
        console.log('✅ Admin GridFS connected');

        bucket = new GridFSBucket(conn.db, {
          bucketName: 'uploads'
        });

        gfs = new mongoose.mongo.GridFSBucket(conn.db, {
          bucketName: 'uploads'
        });
        
        resolve();
      });

      conn.on('error', (err) => {
        console.error('GridFS connection error:', err);
        reject(err);
      });
    });
  } else if (conn.readyState !== 1) {
    // Connection exists but not ready, wait for it
    await new Promise((resolve, reject) => {
      if (conn.readyState === 1) {
        resolve();
      } else {
        conn.once('open', resolve);
        conn.on('error', reject);
      }
    });
  }
  
  return { gfs, bucket, conn };
};

module.exports = { initGridFS };

