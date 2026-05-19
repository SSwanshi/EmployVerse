const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGO_URI_TEST 
      : (process.env.MONGO_URI_ADMIN || 'mongodb://localhost:27017/admin_db');
    const conn = await mongoose.connect(mongoURI);

    console.log("✅ Admin MongoDB Connected");
    return conn;
  } catch (error) {
    console.error("❌ Admin MongoDB Connection Failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;

