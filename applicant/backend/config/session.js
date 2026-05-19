// This file is deprecated - JWT authentication is now used instead of sessions
// Keeping this file for reference purposes only

/*
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'applicant-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/applicant_db',
    ttl: 14 * 24 * 60 * 60
  })
};

module.exports = sessionConfig;
*/

module.exports = null;

