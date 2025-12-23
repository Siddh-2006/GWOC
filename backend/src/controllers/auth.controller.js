import jwt from 'jsonwebtoken';
import Auth from '../models/Auth.model.js';
import { User } from '../models/User.model.js';
import OTP from '../models/OTP.model.js';
import { authValidation } from '../validation/auth.validation.js';
import { generateOTP, sendOTPEmail } from '../services/email.service.js';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET || 'access_secret_key',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Sign up controller (now requires email verification)
export const signUp = async (req, res) => {
  try {
    // Validate input
    const { error, value } = authValidation.signUp.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await Auth.findOne({ email });
    const existingUserProfile = await User.findOne({ email });
    
    if (existingUser || existingUserProfile) {
      if (existingUser && existingUser.isEmailVerified) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      } else if (existingUser && !existingUser.isEmailVerified) {
        // User exists but not verified, update their info and resend OTP
        existingUser.password = password;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        await existingUser.save();

        // Generate and send OTP
        const otp = generateOTP();
        await OTP.create({
          email,
          otp,
          type: 'registration'
        });

        await sendOTPEmail(email, otp, 'registration');

        return res.status(200).json({
          success: true,
          message: 'Account updated. Please verify your email with the OTP sent to your email address.',
          data: {
            email,
            requiresVerification: true
          }
        });
      } else {
        // User profile exists but no auth record (shouldn't happen normally)
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Create new user (not verified yet)
    const user = new Auth({
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false
    });

    await user.save();

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: 'registration'
    });

    await sendOTPEmail(email, otp, 'registration');

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email with the OTP sent to your email address.',
      data: {
        email,
        requiresVerification: true
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    
    // Handle specific email configuration errors
    if (error.message.includes('Email configuration missing')) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured. Please contact administrator.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Handle email sending errors
    if (error.message.includes('Failed to send OTP email')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sign in controller
export const signIn = async (req, res) => {
  try {
    // Validate input
    const { error, value } = authValidation.signIn.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password } = value;

    // Find user
    const user = await Auth.findOne({ email, isActive: true, isEmailVerified: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password, or email not verified'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token and update last login
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Sign in successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refresh token controller
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key'
    );

    // Find user and check if refresh token exists
    const user = await Auth.findById(decoded.userId);
    if (!user || !user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
    user.refreshTokens.push({ token: tokens.refreshToken });
    await user.save();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.userId;

    if (userId && refreshToken) {
      // Remove refresh token from database
      await Auth.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } }
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (userId) {
      // Remove all refresh tokens
      await Auth.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] }
      });
    }

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const authUser = await Auth.findById(userId);

    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user profile from User model
    const userProfile = await User.findOne({ email: authUser.email });

    res.json({
      success: true,
      data: {
        auth: authUser,
        profile: userProfile,
        // Combined user data for convenience
        user: {
          _id: authUser._id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          name: userProfile?.name || `${authUser.firstName} ${authUser.lastName}`,
          phone: userProfile?.phone,
          role: authUser.role,
          isActive: authUser.isActive,
          isEmailVerified: authUser.isEmailVerified,
          lastLogin: authUser.lastLogin,
          createdAt: authUser.createdAt,
          updatedAt: authUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    // Validate input
    const { error, value } = authValidation.updateProfile.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.userId;
    const { firstName, lastName, phone } = value;

    // Update Auth model
    const authUser = await Auth.findById(userId);
    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (firstName) authUser.firstName = firstName;
    if (lastName) authUser.lastName = lastName;
    await authUser.save();

    // Update User model
    const userProfile = await User.findOne({ email: authUser.email });
    if (userProfile) {
      if (firstName || lastName) {
        userProfile.name = `${authUser.firstName} ${authUser.lastName}`;
      }
      if (phone !== undefined) userProfile.phone = phone;
      await userProfile.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: authUser._id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          name: userProfile?.name || `${authUser.firstName} ${authUser.lastName}`,
          phone: userProfile?.phone,
          role: authUser.role,
          isActive: authUser.isActive,
          isEmailVerified: authUser.isEmailVerified,
          lastLogin: authUser.lastLogin,
          createdAt: authUser.createdAt,
          updatedAt: authUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forgot password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { error, value } = authValidation.forgotPassword.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email } = value;

    // Check if user exists and is verified
    const user = await Auth.findOne({ email, isEmailVerified: true });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset OTP.'
      });
    }

    // Check for recent OTP requests
    const recentOTP = await OTP.findOne({
      email,
      type: 'password_reset',
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting a new OTP'
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: 'password_reset'
    });

    // Send OTP email
    await sendOTPEmail(email, otp, 'password_reset');

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password - Verify OTP and update password
export const resetPassword = async (req, res) => {
  try {
    const { error, value } = authValidation.resetPassword.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, otp, password } = value;

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Find and update user
    const user = await Auth.findOne({ email, isEmailVerified: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = password;
    // Clear all existing refresh tokens for security on password change
    user.refreshTokens = [];
    await user.save();

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};