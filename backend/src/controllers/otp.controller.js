import OTP from '../models/OTP.model.js';
import Auth from '../models/Auth.model.js';
import { User } from '../models/User.model.js';
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from '../services/email.service.js';
import { otpValidation } from '../validation/otp.validation.js';

// Send OTP for registration
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { error, value } = otpValidation.sendOTP.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email } = value;

    // Check if user already exists and is verified
    const existingUser = await Auth.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Also check if user exists in User model
    const existingUserProfile = await User.findOne({ email });
    if (existingUserProfile) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await OTP.findOne({
      email,
      type: 'registration',
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // Last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting a new OTP'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      type: 'registration'
    });

    // Send OTP email
    await sendOTPEmail(email, otp, 'registration');

    res.json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again later.'
    });
  }
};

// Verify OTP and complete registration
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { error, value } = otpValidation.verifyOTP.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, otp } = value;

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'registration',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      // Increment attempts for all matching OTPs
      await OTP.updateMany(
        { email, type: 'registration', isUsed: false },
        { $inc: { attempts: 1 } }
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user verification status if user exists
    const authUser = await Auth.findOne({ email });
    if (authUser) {
      authUser.isEmailVerified = true;
      await authUser.save();

      // Create user profile in User model
      const existingUserProfile = await User.findOne({ email });
      if (!existingUserProfile) {
        const userProfile = new User({
          email: authUser.email,
          name: `${authUser.firstName} ${authUser.lastName}`,
          role: authUser.role
        });
        await userProfile.save();
      }

      // Send welcome email
      await sendWelcomeEmail(email, authUser.firstName);
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { error, value } = otpValidation.sendOTP.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email } = value;

    // Invalidate all previous OTPs for this email
    await OTP.updateMany(
      { email, type: 'registration', isUsed: false },
      { isUsed: true }
    );

    // Generate new OTP
    const otp = generateOTP();

    // Save new OTP
    await OTP.create({
      email,
      otp,
      type: 'registration'
    });

    // Send OTP email
    await sendOTPEmail(email, otp, 'registration');

    res.json({
      success: true,
      message: 'New OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again later.'
    });
  }
};