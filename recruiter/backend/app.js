const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swaggerDef');
const playgroundMiddleware = require('graphql-playground-middleware-express').default;

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const deleteExpiredJobs = require('./routes/jobCleanup');
const deleteExpiredInternship = require('./routes/intCleanup');

// Routes
const authRoutes = require('./routes/auth.routes');
const recruiterRoutes = require('./routes/recruiter.routes');
const applicationsRoutes = require('./routes/applications.routes');
const internapplicantsRoutes = require('./routes/internapplicants.routes');
const logoRoutes = require('./routes/logo.routes');
const proofRoutes = require('./routes/proof.routes');
const upgradeRoutes = require('./routes/upgrade.routes');
const applicantRoutes = require('./routes/applicant.routes');
const graphqlRoutes = require('./routes/graphql.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || "https://employverse-recruiter.swanshi.me",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "https://employverse-recruiter.swanshi.me"
    ];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  exposedHeaders: ['Cache-Control', 'Pragma', 'Expires']
}));

// Middleware
// Log to console
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to databases
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Connect to applicant database if URI is provided (async, don't await to not block server start)
if (process.env.MONGO_URI_APPLICANT && process.env.NODE_ENV !== 'test') {
  const { connectApplicantDB } = require('./config/applicantDb');
  (async () => {
    await connectApplicantDB();
  })();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'recruiter', port: PORT });
});

// Swagger Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// GraphQL Playground
app.get('/graphql-playground', playgroundMiddleware({ endpoint: '/api/graphql' }));

// Disable caching for API endpoints (prevents 304 Not Modified responses)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/internapplicants', internapplicantsRoutes);
app.use('/recruiter/logo', logoRoutes);
app.use('/recruiter/proof', proofRoutes);
app.use('/api/upgrade', upgradeRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api', graphqlRoutes);
app.use('/api/chat', chatRoutes);

// Cron jobs for cleanup
cron.schedule('0 0 * * *', () => {
  console.log('Running expired jobs cleanup...');
  deleteExpiredJobs();
});

cron.schedule('0 0 * * *', () => {
  console.log('Running expired internships cleanup...');
  deleteExpiredInternship();
});

// 404 handler
app.use(notFound);

// Error handler middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Recruiter] Server running on http://localhost:${PORT}`);        
  });
}

module.exports = app;

