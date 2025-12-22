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
    // Debug: Check environment variables
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SKIP_EMAIL:', process.env.SKIP_EMAIL);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    
    // If SKIP_EMAIL is true, just log the OTP
    if (process.env.SKIP_EMAIL === 'true') {
      console.log(`\n🔐 OTP for ${email}: ${otp}`);
      console.log(`📧 Email type: ${type}`);
      console.log(`⏰ Valid for 10 minutes\n`);
      return { success: true, messageId: 'dev-mode-skip' };
    }

    // If no email config and not skipping, provide helpful error
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`\n⚠️  Email not configured. OTP for ${email}: ${otp}`);
      console.log(`📧 Email type: ${type}`);
      console.log(`⏰ Valid for 10 minutes`);
      console.log(`💡 Set SKIP_EMAIL=true in .env to use development mode\n`);
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
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  This is an automated email. Please do not reply to this message.
                </p>
              </div>
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
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  This is an automated email. Please do not reply to this message.
                </p>
              </div>
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
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email, firstName) => {
  try {
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
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failure
    return { success: false, error: error.message };
  }
};