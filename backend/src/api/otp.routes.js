import express from 'express';
import {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  resendOTP
} from '../controllers/otp.controller.js';

const router = express.Router();

// OTP routes
router.post('/send', sendRegistrationOTP);
router.post('/verify', verifyRegistrationOTP);
router.post('/resend', resendOTP);

export default router;