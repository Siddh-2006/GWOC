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
    // Always log OTP to console as backup
    console.log(`\n🔐 OTP for ${email}: ${otp}`);
    console.log(`📧 Email type: ${type}`);
    console.log(`⏰ Valid for 10 minutes\n`);

    // Get email credentials
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPassword) {
      console.log('⚠️ Email credentials missing - only console output available');
      return { success: true, messageId: 'dev-mode-no-email-config' };
    }

    console.log('📤 Attempting to send email...');

    // Create Gmail-specific transporter with detailed configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword.replace(/\s/g, '') // Remove any spaces from app password
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug in development
      logger: process.env.NODE_ENV === 'development' // Enable logging in development
    });

    // Verify transporter configuration before sending
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', {
        message: verifyError.message,
        code: verifyError.code,
        response: verifyError.response
      });
      
      // Log the OTP for development if email verification fails
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 OTP for ${email}: ${otp} (${type}) - Email verification failed`);
      }
      
      return { success: false, error: `Email verification failed: ${verifyError.message}` };
    }

    const emailTemplates = {
      registration: {
        subject: 'Verify Your Email - MindSettler',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #6366f1; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Journey to Well-being</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Verify Your Email Address</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Thank you for signing up with MindSettler! To complete your registration, 
                please verify your email address using the OTP below:
              </p>
              <div style="background-color: #f1f5f9; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px solid #e2e8f0;">
                <h1 style="color: #6366f1; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
                This OTP will expire in 10 minutes. If you didn't request this verification, 
                please ignore this email.
              </p>
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Security Note:</strong> Never share this OTP with anyone. MindSettler will never ask for your OTP via phone or other channels.
                </p>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                MindSettler Studio, Pune, Maharashtra, India<br>
                This email was sent to ${email}
              </p>
            </div>
          </div>
        `
      },
      password_reset: {
        subject: 'Reset Your Password - MindSettler',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #dc2626; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
              <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Reset Your Password</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We received a request to reset your password. Use the OTP below to proceed with resetting your password:
              </p>
              <div style="background-color: #fef2f2; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px solid #fecaca;">
                <h1 style="color: #dc2626; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
                This OTP will expire in 10 minutes. If you didn't request a password reset, 
                please ignore this email and your password will remain unchanged.
              </p>
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Security Alert:</strong> If you didn't request this password reset, please contact our support team immediately.
                </p>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                MindSettler Studio, Pune, Maharashtra, India<br>
                This email was sent to ${email}
              </p>
            </div>
          </div>
        `
      }
    };

    const template = emailTemplates[type];

    const mailOptions = {
      from: `"MindSettler" <${emailUser}>`,
      to: email,
      subject: template.subject,
      html: template.html,
      // Add additional headers for better deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📬 Check your inbox for the OTP email\n');
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending OTP email:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    
    // Always log the OTP for development if email fails
    console.log(`\n🔐 OTP for ${email}: ${otp}`);
    console.log(`📧 Email type: ${type}`);
    console.log(`⚠️  Email failed, but OTP is shown above for testing\n`);
    
    // Return success to not block the signup process
    return { success: true, messageId: 'email-failed-but-otp-logged' };
  }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    // Get email credentials
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPassword) {
      console.log('⚠️ Welcome email skipped - no email credentials');
      return { success: true, messageId: 'welcome-email-skipped' };
    }

    console.log('📤 Sending welcome email...');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPassword.replace(/\s/g, '')
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"MindSettler" <${emailUser}>`,
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