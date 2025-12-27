import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Check if email configuration is provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, type = 'registration') => {
  try {
    // If SKIP_EMAIL is true, just log the OTP for development
    if (process.env.SKIP_EMAIL === 'true') {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 OTP for ${email}: ${otp} (${type})`);
      }
      return { success: true, messageId: 'dev-mode-skip' };
    }

    // If no email config and not skipping, provide helpful error
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 OTP for ${email}: ${otp} (${type}) - Email not configured`);
      }
      return { success: true, messageId: 'no-email-config-dev-mode' };
    }

    // Only create transporter if we're actually sending emails
    const transporter = createTransporter();

    const emailTemplates = {
      registration: {
        subject: 'Verify Your Email - MindSettler',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">MindSettler</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Thank you for signing up with MindSettler! To complete your registration, 
                please verify your email address using the OTP below:
              </p>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">
                This OTP will expire in 10 minutes. If you didn't request this verification, 
                please ignore this email.
              </p>
            </div>
          </div>
        `
      },
      password_reset: {
        subject: 'Reset Your Password - MindSettler',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">MindSettler</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                We received a request to reset your password. Use the OTP below to proceed:
              </p>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">
                This OTP will expire in 10 minutes. If you didn't request a password reset, 
                please ignore this email and your password will remain unchanged.
              </p>
            </div>
          </div>
        `
      }
    };

    const template = emailTemplates[type];

    const mailOptions = {
      from: `"MindSettler" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ OTP email sent successfully');
    }
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    // Skip welcome email if email is not configured
    if (process.env.SKIP_EMAIL === 'true' || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return { success: true, messageId: 'welcome-email-skipped' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"MindSettler" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to MindSettler!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">MindSettler</h1>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${firstName}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Your email has been successfully verified and your account is now active. 
              Welcome to the MindSettler community!
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You can now access all features of our platform. If you have any questions 
              or need assistance, feel free to reach out to our support team.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Started
              </a>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Welcome email sent successfully');
    }
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    // Don't throw error for welcome email failure
    return { success: false, error: error.message };
  }
};