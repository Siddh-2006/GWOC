import nodemailer from 'nodemailer';

// Create transporter for corporate emails
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  
  return nodemailer.createTransport({
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
};

// Send corporate inquiry confirmation email
export const sendCorporateConfirmation = async (inquiry) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPassword) {
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const getEngagementTypeDisplay = (type) => {
      const displays = {
        'workplace-workshops': 'Workplace Workshops',
        'institutional-education': 'Institutional Psycho-Education',
        'event-sessions': 'Event-Based Sessions',
        'community-programs': 'Community Programs',
        'other': 'Other Services'
      };
      return displays[type] || type;
    };

    const subject = 'Corporate Inquiry Confirmed - MindSettler';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #10b981; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Corporate Services</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Your Inquiry Has Been Confirmed</h2>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Dear ${inquiry.contactPerson},
          </p>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Thank you for your interest in MindSettler's corporate services. We're pleased to confirm that we've received your inquiry and our team will be in touch with you soon to discuss your requirements.
          </p>
          
          <div style="background-color: #ecfdf5; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Inquiry Details</h3>
            <p style="margin: 8px 0; color: #475569;"><strong>Organization:</strong> ${inquiry.organizationName}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Service Interest:</strong> ${getEngagementTypeDisplay(inquiry.engagementType)}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Contact Person:</strong> ${inquiry.contactPerson}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Email:</strong> ${inquiry.email}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Submitted:</strong> ${new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              <strong>What happens next:</strong><br>
              • Our corporate services team will review your requirements<br>
              • We'll reach out within 2-3 business days to schedule a consultation<br>
              • We'll work together to design a program that meets your organization's needs<br>
              • All our services are customized to align with your specific goals and context
            </p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1e293b; margin-top: 0;">Your Message:</h4>
            <p style="color: #475569; margin-bottom: 0; font-style: italic; line-height: 1.6;">
              "${inquiry.message}"
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            If you have any immediate questions or need to update your inquiry, please don't hesitate to contact us at <a href="mailto:${emailUser}" style="color: #6366f1;">${emailUser}</a>
          </p>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            We look forward to exploring how we can support your organization's well-being journey.
          </p>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Warm regards,<br>
            <strong>The MindSettler Team</strong>
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0; font-size: 12px;">
            MindSettler Studio, Surat, Gujarat, India<br>
            This email was sent to ${inquiry.email}
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"MindSettler Corporate Services" <${emailUser}>`,
      to: inquiry.email,
      subject: subject,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending corporate confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send corporate inquiry notification to admin
export const sendCorporateNotification = async (inquiry) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL || emailUser;
    
    if (!emailUser) {
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const getEngagementTypeDisplay = (type) => {
      const displays = {
        'workplace-workshops': 'Workplace Workshops',
        'institutional-education': 'Institutional Psycho-Education',
        'event-sessions': 'Event-Based Sessions',
        'community-programs': 'Community Programs',
        'other': 'Other Services'
      };
      return displays[type] || type;
    };

    const mailOptions = {
      from: `"MindSettler" <${emailUser}>`,
      to: adminEmail,
      subject: 'New Corporate Inquiry - MindSettler',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler Admin</h1>
            <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">New Corporate Inquiry</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">New Corporate Service Inquiry</h2>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #1e293b; margin-top: 0;">Organization Information</h3>
              <p><strong>Organization:</strong> ${inquiry.organizationName}</p>
              <p><strong>Contact Person:</strong> ${inquiry.contactPerson}</p>
              <p><strong>Email:</strong> ${inquiry.email}</p>
              <p><strong>Service Interest:</strong> ${getEngagementTypeDisplay(inquiry.engagementType)}</p>
              <p><strong>Organization Size:</strong> ${inquiry.organizationSize}</p>
              <p><strong>Preferred Contact:</strong> ${inquiry.preferredContact}</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Inquiry Message</h3>
              <p style="background: white; padding: 15px; border-radius: 4px; line-height: 1.6;">${inquiry.message}</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Submitted:</strong> ${new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Status:</strong> ${inquiry.status}</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Please review this inquiry in the admin dashboard and update the status accordingly.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending corporate notification email:', error);
    return { success: false, error: error.message };
  }
};