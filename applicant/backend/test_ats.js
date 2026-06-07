const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/db');
const { atsScore } = require('./controllers/ats.controller');
const User = require('./models/user');

(async () => {
  await connectDB();
  
  // Find a user with a resume
  const user = await User.findOne({ resumeId: { $ne: null } });
  
  if (!user) {
    console.log('No user with a resume found for testing.');
    process.exit(0);
  }

  console.log('Testing with user:', user.userId);

  const req = {
    user: { id: user.userId },
    body: {}
  };

  const res = {
    status: (code) => {
      console.log('Status:', code);
      return res;
    },
    json: (data) => {
      console.log('Response:', JSON.stringify(data, null, 2));
      process.exit(0);
    }
  };

  try {
    await atsScore(req, res);
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
