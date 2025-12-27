import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  // Initialize transporter when first needed
  getTransporter() {
    if (!this.transporter) {
      // Check if required environment variables are set
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Missing email credentials:');
        console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
        console.error('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
        throw new Error('Email credentials not configured properly');
      }

      // Gmail only configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Gmail App Password
        }
      });

      console.log('Email service initialized with user:', process.env.EMAIL_USER);
    }
    return this.transporter;
  }

  // Test email connection
  async testConnection() {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('✅ Email service connection verified successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendContactNotification(contactData) {
    const { name, email, subject, message } = contactData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #334155; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #475569;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
            <p style="margin: 0; color: #92400e;">
              <strong>Action Required:</strong> Please respond to this inquiry within 24-48 hours.
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p>This email was sent from the MindSettler contact form.</p>
          </div>
        </div>
      `
    };

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log('Admin notification email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendUserConfirmation(contactData) {
    const { name, email, subject } = contactData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank you for contacting MindSettler - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background-color: #6366f1; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">MindSettler</h1>
            <p style="margin: 10px 0 0 0;">Your Journey to Well-being</p>
          </div>
          
          <div style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
            <h2 style="color: #334155;">Thank you for reaching out, ${name}!</h2>
            
            <p style="color: #475569; line-height: 1.6;">
              We've received your message regarding "<strong>${subject}</strong>" and truly appreciate you taking the time to contact us.
            </p>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
              <h3 style="color: #6366f1; margin-top: 0;">What happens next?</h3>
              <ul style="color: #475569; line-height: 1.6;">
                <li>Our team will review your message within 24-48 hours</li>
                <li>We'll respond with personalized guidance for your wellness journey</li>
                <li>If you've inquired about sessions, we'll provide available time slots</li>
              </ul>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">
              In the meantime, feel free to follow us on 
              <a href="https://www.instagram.com/mindsettlerbypb/" style="color: #6366f1; text-decoration: none;">
                Instagram @mindsettlerbypb
              </a> for daily wellness tips and mindful practices.
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #ecfdf5; border-radius: 8px;">
              <p style="margin: 0; color: #065f46;">
                <strong>Need immediate support?</strong><br>
                Call us at +91 123 456 7890 or email contact@mindsettler.com
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
            <p>MindSettler Studio, Pune, Maharashtra, India</p>
          </div>
        </div>
      `
    };

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log('User confirmation email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending user confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send both emails when contact form is submitted
  async handleContactFormSubmission(contactData) {
    try {
      // Send notification to admin
      const adminResult = await this.sendContactNotification(contactData);
      
      // Send confirmation to user
      const userResult = await this.sendUserConfirmation(contactData);
      
      return {
        success: adminResult.success && userResult.success,
        adminEmail: adminResult.success,
        userEmail: userResult.success,
        errors: {
          admin: adminResult.error || null,
          user: userResult.error || null
        }
      };
    } catch (error) {
      console.error('Error handling contact form emails:', error);
      return {
        success: false,
        adminEmail: false,
        userEmail: false,
        errors: {
          general: error.message
        }
      };
    }
  }
}

export default new EmailService();