import jwt from 'jsonwebtoken';
import Auth from '../models/Auth.model.js';

// Track recent requests to avoid spam logging
const recentRequests = new Map();
const LOG_THROTTLE_MS = 5000; // Only log same endpoint every 5 seconds

const shouldLog = (key, url) => {
  // Skip logging for like/dislike endpoints (both media and psycho-education)
  if (url.includes('/like') || url.includes('/dislike')) {
    return false;
  }
  
  const now = Date.now();
  const lastLogged = recentRequests.get(key);
  
  if (!lastLogged || now - lastLogged > LOG_THROTTLE_MS) {
    recentRequests.set(key, now);
    return true;
  }
  return false;
};

// Middleware to verify JWT access token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // Create a key for throttling logs
    const logKey = `${req.method}:${req.url}`;
    const shouldLogThis = shouldLog(logKey, req.url);

    if (shouldLogThis) {
      console.log(`🔐 Auth: ${req.method} ${req.url} - ${token ? 'Token present' : 'No token'}`);
    }

    if (!token) {
      if (shouldLogThis) console.log('❌ Auth: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'access_secret_key'
    );

    // Check if user exists and is active
    const user = await Auth.findById(decoded.userId);
    if (!user || !user.isActive) {
      if (shouldLogThis) console.log('❌ Auth: Invalid user or inactive account');
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    if (shouldLogThis) {
      console.log(`✅ Auth: ${user.email} authenticated`);
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    // Skip logging auth errors for like/dislike endpoints to reduce noise
    if (!req.url.includes('/like') && !req.url.includes('/dislike')) {
      console.log('❌ Auth error:', error.message);
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Only log full error details for unexpected errors (and not for like endpoints)
    if (error.name !== 'MongoServerSelectionError' && 
        error.name !== 'MongoNetworkError' && 
        !req.url.includes('/like') && 
        !req.url.includes('/dislike')) {
      console.error('Auth middleware unexpected error:', error);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'access_secret_key'
      );

      const user = await Auth.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          email: user.email,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};