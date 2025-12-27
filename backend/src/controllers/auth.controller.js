import jwt from 'jsonwebtoken';
import Auth from '../models/Auth.model.js';
import { User } from '../models/User.model.js';
import OTP from '../models/OTP.model.js';
import { authValidation } from '../validation/auth.validation.js';
import { generateOTP, sendOTPEmail } from '../services/auth-email.service.js';

// Generate JWT tokens
const generateTokens = async (userId) => {
  // Get user role from database
  const user = await Auth.findById(userId);
  const role = user?.role || 'user';

  const accessToken = jwt.sign(
    { userId, role, type: 'access' },
    process.env.JWT_ACCESS_SECRET || 'access_secret_key',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
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
        console.log(`\n🚨 SIGNUP OTP GENERATED 🚨`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 OTP: ${otp}`);
        console.log(`⏰ Valid for 10 minutes`);
        console.log(`🚨 USE THIS OTP TO VERIFY 🚨\n`);
        
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
    console.log(`\n🚨 NEW USER SIGNUP OTP 🚨`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`⏰ Valid for 10 minutes`);
    console.log(`🚨 USE THIS OTP TO VERIFY 🚨\n`);
    
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Sign up error:', error.message);
    }
    
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
    const { accessToken, refreshToken } = await generateTokens(user._id);

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
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Sign in error:', error.message);
    }
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
    const tokens = await generateTokens(user._id);

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
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Refresh token error:', error.message);
    }
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
    const { firstName, lastName, avatar, bio, location, interests } = value;

    // Update Auth model
    const authUser = await Auth.findById(userId);
    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (firstName !== undefined) authUser.firstName = firstName;
    if (lastName !== undefined) authUser.lastName = lastName;
    if (avatar !== undefined) authUser.avatar = avatar;
    if (bio !== undefined) authUser.bio = bio;
    if (location !== undefined) authUser.location = location;
    if (interests !== undefined) authUser.interests = interests;
    
    await authUser.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: authUser._id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          avatar: authUser.avatar,
          bio: authUser.bio,
          location: authUser.location,
          interests: authUser.interests,
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
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      // For security, always return success even if user doesn't exist
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset OTP.'
      });
    }

    // Check for recent OTP requests (rate limiting)
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
    try {
      await sendOTPEmail(email, otp, 'password_reset');
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 Password reset OTP sent to ${email}: ${otp}`);
      }
      
      res.json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError.message);
      
      // If email fails, still return success for security but log the error
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 Email failed, but OTP for ${email}: ${otp}`);
      }
      
      res.json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validate current token
export const validateToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Auth.findById(userId);

    if (!user || !user.isActive || !user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user session'
      });
    }

    // Return user data if token is valid
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
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

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Reset password attempt for ${email} with OTP: ${otp}`);
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`❌ Invalid OTP for ${email}. Checking all OTPs...`);
        const allOTPs = await OTP.find({ email, type: 'password_reset' }).sort({ createdAt: -1 });
        console.log('Recent OTPs:', allOTPs.map(o => ({ otp: o.otp, isUsed: o.isUsed, expired: o.expiresAt < new Date() })));
      }
      
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

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Password reset successful for ${email}`);
    }

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