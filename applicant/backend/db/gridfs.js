const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;
let gfs;

const initGridFS = async () => {
  const conn = mongoose.connection;
  
  conn.once('open', () => {
    console.log('✅ Applicant GridFS connected');
    
    bucket = new GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });

    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });
  });

  return { bucket, gfs };
};

module.exports = { initGridFS };

