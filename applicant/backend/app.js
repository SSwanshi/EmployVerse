const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');

// Routes
const authRoutes = require('./routes/auth.routes');
const applicantRoutes = require('./routes/applicant.routes');
const profileRoutes = require('./routes/profile.routes');
const paymentRoutes = require('./routes/payment.routes');
const filesRoutes = require('./routes/files.routes');
const uploadRoutes = require('./routes/upload.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes = require('./routes/chat.routes');
const resumeRoutes = require('./routes/resume.routes');

const redis = require('./config/redis');

const app = express();
const PORT = 3000; // Hardcoded port

// Disable ETag generation to prevent 304 Not Modified responses
app.set('etag', false);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://employverse.swanshi.me",
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  "https://employverse.swanshi.me",
  "https://employverse-recruiter.swanshi.me",
  "https://employverse-admin.swanshi.me"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// CI pipeline test

// Middleware
// Log to console
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Disable caching for API endpoints (prevents 304 Not Modified responses)
app.use('/api', (req, res, next) => {
  // Prevent caching entirely
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '-1');
  res.setHeader('ETag', '');
  res.removeHeader('ETag');
  
  // Override the res.json to ensure fresh responses
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    return originalJson(data);
  };
  
  next();
});

// Swagger (OpenAPI) docs (spec lives outside backend folder)
// URL: /api/docs and /api/docs.json
// Spec file: applicant/backend/swagger/openapi.js
// eslint-disable-next-line global-require
const openapiSpec = require('./swagger/openapi');
app.get('/api/docs.json', (req, res) => res.json(openapiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'applicant', port: PORT });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resume', resumeRoutes);

// GraphQL (Option B: read-heavy queries)
app.use(
  '/api/graphql',
  graphqlHTTP((req) => ({
    schema: graphqlSchema,
    graphiql: process.env.NODE_ENV !== 'production',
    context: { req },
  })),
);

app.get('/', (req, res) => {
  res.send('Applicant service is running');
})

app.get('/api/redis-test', async (req, res) => {
  try {
    await redis.set('test_key', 'Hello Redis!');    
    const value = await redis.get('test_key');
    res.json({ success: true, value });
  } catch (err) {
    console.error('Redis test error:', err);
    res.status(500).json({ success: false, error: 'Redis test failed' });
  }
});

// Error handler middleware
app.use(errorHandler);

// Wrap app with HTTP Server for Socket.IO support
const http = require('http');
const server = http.createServer(app);
const { initSocket } = require('./config/socket');

// Initialize Socket.IO
initSocket(server);

// Load the Notification Worker to run in background
if (process.env.NODE_ENV !== 'test') {
  require('./workers/notification.worker');
}

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Applicant] Server running on http://localhost:${PORT}`);        
  });
}

module.exports = app;
