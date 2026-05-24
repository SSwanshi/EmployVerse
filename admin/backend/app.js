const express = require("express");
const session = require("express-session");
const cors = require("cors");
const fs = require('fs');
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const soap = require('soap')
require("dotenv").config();

const connectDB = require("./config/db");
const connectRecruiterDB = require("./config/recruiterDB");
const connectApplicantDB = require("./config/applicantDB");
const setupGraphQL = require("./graphql/apolloServer");

// Routes
const authRoutes = require("./routes/auth.routes");
const applicantsRoutes = require("./routes/applicants.routes");
const recruitersRoutes = require("./routes/recruiters.routes");
const companiesRoutes = require("./routes/companies.routes");
const jobsRoutes = require("./routes/jobs.routes");
const internshipsRoutes = require("./routes/internships.routes");
const adminRoutes = require("./routes/admin.routes");
const adminController = require("./controllers/admin.controller");
const premiumService = require('./services/soap.service');
const backfillApplicantCompanyName = require('./utils/backfillApplicantCompanyName');
const app = express();
const PORT = process.env.PORT || 9000;

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || "https://employverse-admin.swanshi.me",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "https://employverse.swanshi.me",
      "https://employverse-recruiter.swanshi.me",
      "https://employverse-admin.swanshi.me"
    ];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'SOAPAction'
  ],
  exposedHeaders: ['Content-Type']
}));

// checking CI pipeline

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "admin-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI_ADMIN || "mongodb://localhost:27017/admin_db",
      ttl: 14 * 24 * 60 * 60 // 14 days
    })
  })
);

// Connect to databases
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  backfillApplicantCompanyName();
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "admin", port: PORT });
});

// Disable caching for API endpoints (prevents 304 Not Modified responses)
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/applicants", applicantsRoutes);
app.use("/api/recruiters", recruitersRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/internships", internshipsRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/stats", adminController.getStats);

// Error handler middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.use('/wsdl', express.raw({ type: ['text/xml', 'application/soap+xml'], limit: '5mb' }));
const wsdl = fs.readFileSync('./soap/wsdl/premiumUser.wsdl', 'utf8');
soap.listen(app, '/wsdl', premiumService, wsdl).on('request', (xml) => {
  console.log("SOAP REQUEST:\n", xml);
});

// Import Swagger configuration
const swaggerSetup = require('./swagger');

// Setup Swagger API documentation
swaggerSetup(app);

// Setup GraphQL
setupGraphQL(app);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Admin] Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

