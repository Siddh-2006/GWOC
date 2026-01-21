import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import connectDB from './config/db.js';

// Configure environment variables first
// In serverless, environment variables are provided by the platform
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' });
}

// Import routes
import authRoutes from './api/auth.routes.js';
import otpRoutes from './api/otp.routes.js';
import bookingRoutes from './api/booking.routes.js';
import chatbotRoutes from './api/chatbot.routes.js';
import adminRoutes from './api/admin.routes.js';
import contentRoutes from './api/content.routes.js';
import corporateRoutes from './api/corporate.routes.js';
import contactRoutes from './api/contact.routes.js';
import mediaRoutes from './api/media.routes.js';
import psychoEducationRoutes from './api/psychoEducation.routes.js';
import reflectionRoutes from './api/reflection.routes.js';
import sessionsRoutes from './api/sessions.routes.js';
import taskRoutes from './api/task.routes.js';
import journeyRoutes from './api/journey.routes.js';
import uploadRoutes from './api/upload.routes.js';

// Import reminder service
import { sessionReminderService } from './services/session-reminder.service.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel/serverless environments
app.set('trust proxy', 1);

// Initialize database connection
let dbConnected = false;

// Connect to database and set flag
connectDB()
  .then(() => {
    dbConnected = true;
    console.log('✅ Database connection established');

    // Start session reminder service only after DB is connected and in development
    if (process.env.NODE_ENV !== 'production') {
      sessionReminderService.start();
    }
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Middleware to check database connection
const ensureDbConnection = (req, res, next) => {
  if (!dbConnected || mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable - database not ready'
    });
  }
  next();
};

// Graceful shutdown for serverless
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  if (process.env.NODE_ENV !== 'production') {
    console.log('🛑 MongoDB connection closed through app termination');
  }
  process.exit(0);
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'https://gwoc-f8d2.vercel.app',
      'https://gwoc-lovat.vercel.app',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN
    ].filter(Boolean);

    // Also handle comma-separated CORS_ORIGIN
    if (process.env.CORS_ORIGIN) {
      const corsOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
      allowedOrigins.push(...corsOrigins);
    }

    // Remove duplicates
    const uniqueOrigins = [...new Set(allowedOrigins)];

    if (uniqueOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`✅ Allowed origins: ${uniqueOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());
configurePassport();

// Routes - Apply database check middleware to routes that need DB
app.get('/', (req, res) => {
  res.json({
    message: 'MindSettler API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbConnected ? 'connected' : 'connecting'
  });
});

// Routes that require database connection
app.use('/api/auth', ensureDbConnection, authRoutes);
app.use('/api/otp', ensureDbConnection, otpRoutes);
app.use('/api/booking', ensureDbConnection, bookingRoutes);
app.use('/api/chatbot', ensureDbConnection, chatbotRoutes);
app.use('/api/admin', ensureDbConnection, adminRoutes);
app.use('/api/content', ensureDbConnection, contentRoutes);
app.use('/api/corporate', ensureDbConnection, corporateRoutes);
app.use('/api/contact', ensureDbConnection, contactRoutes);
app.use('/api/media', ensureDbConnection, mediaRoutes);
app.use('/api/psycho-education', ensureDbConnection, psychoEducationRoutes);
app.use('/api/reflection', ensureDbConnection, reflectionRoutes);
app.use('/api/sessions', ensureDbConnection, sessionsRoutes);
app.use('/api/tasks', ensureDbConnection, taskRoutes);
app.use('/api/journey', ensureDbConnection, journeyRoutes);
app.use('/api/upload', ensureDbConnection, uploadRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[dbStatus] || 'unknown';

    // Quick database test
    let dbTest = 'untested';
    if (dbStatus === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        dbTest = 'success';
      } catch (dbError) {
        dbTest = 'failed';
      }
    }

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatusText,
        test: dbTest
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Only start the server if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
// Note: In serverless/production, cron jobs should be handled by Vercel Cron Jobs
// or external services like GitHub Actions, not by the application itself

// Export the Express app for Vercel serverless functions
export default app;