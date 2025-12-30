import jwt from 'jsonwebtoken';
import Auth from '../models/Auth.model.js';

// Middleware to verify JWT access token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 Auth middleware - URL:', req.url);
    console.log('🔍 Auth middleware - Method:', req.method);
    console.log('🔍 Auth middleware - Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('🔍 Auth middleware - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ Auth middleware - No token provided');
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

    console.log('🔍 Auth middleware - Token decoded successfully, userId:', decoded.userId);

    // Check if user exists and is active
    const user = await Auth.findById(decoded.userId);
    if (!user || !user.isActive) {
      console.log('❌ Auth middleware - User not found or inactive');
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    console.log('✅ Auth middleware - User authenticated:', user.email);

    // Add user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.log('❌ Auth middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
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