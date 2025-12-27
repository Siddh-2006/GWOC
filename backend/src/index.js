import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler')
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Connected to MongoDB');
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(cors());
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running on port ${PORT}`);
  }
});