import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Configure environment variables first
dotenv.config({ path: '.env' });

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

// Import reminder service
import { sessionReminderService } from './services/session-reminder.service.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel/serverless environments
app.set('trust proxy', 1);

// Database connection with environment-aware settings
const mongoOptions = {
  serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 5000 : 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
};

// Only add serverless-specific options in production
if (process.env.NODE_ENV === 'production') {
  mongoOptions.bufferMaxEntries = 0; // Correct camelCase
  mongoOptions.bufferCommands = false;
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler', mongoOptions)
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Connected to MongoDB');
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    // In serverless, we don't want to exit the process
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Handle connection events for better serverless performance
mongoose.connection.on('connected', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔗 Mongoose connected to MongoDB');
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔌 Mongoose disconnected from MongoDB');
  }
});

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/psycho-education', psychoEducationRoutes);
app.use('/api/reflection', reflectionRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/journey', journeyRoutes);

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

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running on port ${PORT}`);
  }
  
  // Start the session reminder service
  sessionReminderService.start();
});