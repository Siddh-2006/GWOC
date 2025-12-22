import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import bookingRoutes from './api/booking.routes.js';
import chatbotRoutes from './api/chatbot.routes.js';
import adminRoutes from './api/admin.routes.js';
import contentRoutes from './api/content.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/booking', bookingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});