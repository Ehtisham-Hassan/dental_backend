import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import Logger from './utils/logger.js';

// Import routes
import claimsRoutes from './routes/claims.js';
import patientsRoutes from './routes/patients.js';
import alertsRoutes from './routes/alerts.js';
import practicesRoutes from './routes/practices.js';
import usersRoutes from './routes/users.js';
import automationRoutes from './routes/automation.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Request logging middleware (must be first)
app.use(Logger.request);

// Security middleware
app.use(helmet());

// CORS configuration - Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:3003',
  'http://172.19.112.1:3003',
  'http://127.0.0.1:3003'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  Logger.info('Health check requested', { ip: req.ip, userAgent: req.get('User-Agent') });
  res.json({ 
    success: true, 
    message: 'Dental Automation Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for frontend integration
app.get('/api/test', (req, res) => {
  Logger.info('Test endpoint requested', { ip: req.ip, userAgent: req.get('User-Agent') });
  res.json({ 
    success: true, 
    message: 'Backend API is working correctly',
    timestamp: new Date().toISOString(),
    data: {
      test: true,
      message: 'Connection successful'
    }
  });
});

// API routes
app.use('/api/claims', claimsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/practices', practicesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  Logger.warn('404 - API endpoint not found', { 
    method: req.method, 
    url: req.originalUrl, 
    ip: req.ip 
  });
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  Logger.error('Global error handler caught an error', error, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Start server
app.listen(PORT, () => {
  Logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    healthCheckUrl: `http://localhost:${PORT}/health`,
    apiBaseUrl: `http://localhost:${PORT}/api`
  });
  
  console.log(`🚀 Dental Automation Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Logs directory: ${process.cwd()}/logs`);
});
