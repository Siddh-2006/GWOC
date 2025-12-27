import nodemailer from 'nodemailer';

// Create transporter for booking emails
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

// Send booking confirmation to user
export const sendBookingConfirmation = async (booking, slot, status) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPassword) {
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const formatTime = (time) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    let subject, html;
    
    if (status === 'pending') {
      subject = 'Booking Request Received - MindSettler';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #6366f1; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Journey to Well-being</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Booking Request Received</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Dear ${booking.personalInfo.name},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Thank you for booking a session with MindSettler. We have received your booking request and it is currently under review.
            </p>
            
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6366f1;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Booking Details</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${formatDate(slot.date)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Time:</strong> ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Session Mode:</strong> ${booking.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Number of People:</strong> ${booking.personalInfo.numberOfPeople}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Amount:</strong> ₹${booking.payment.amount}</p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>What's Next?</strong><br>
                • Our team will review your booking within 24 hours<br>
                • You'll receive a confirmation email with payment details<br>
                • For online sessions, you'll get the meeting link after confirmation
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              If you have any questions, feel free to contact us at <a href="mailto:${emailUser}" style="color: #6366f1;">${emailUser}</a>
            </p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              MindSettler Studio, Pune, Maharashtra, India<br>
              This email was sent to ${booking.personalInfo.email}
            </p>
          </div>
        </div>
      `;
    } else if (status === 'confirmed') {
      subject = 'Session Confirmed - MindSettler';
      const sessionDate = booking.adminResponse.confirmedDate || slot.date;
      const sessionTime = booking.adminResponse.confirmedTime || slot.startTime;
      
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Session Confirmed!</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Your Session is Confirmed</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Dear ${booking.personalInfo.name},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Great news! Your session has been confirmed. We're looking forward to supporting you on your wellness journey.
            </p>
            
            <div style="background-color: #ecfdf5; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Confirmed Session Details</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${formatDate(sessionDate)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Time:</strong> ${formatTime(sessionTime)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Session Mode:</strong> ${booking.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
              ${booking.sessionMode === 'online' && booking.adminResponse.meetingLink ? 
                `<p style="margin: 8px 0; color: #475569;"><strong>Meeting Link:</strong> <a href="${booking.adminResponse.meetingLink}" style="color: #10b981;">${booking.adminResponse.meetingLink}</a></p>` : 
                ''}
              ${booking.sessionMode === 'offline' ? 
                `<p style="margin: 8px 0; color: #475569;"><strong>Location:</strong> ${booking.location || 'MindSettler Studio, Pune'}</p>` : 
                ''}
            </div>
            
            ${booking.adminResponse.notes ? `
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #1e293b; margin-top: 0;">Additional Notes:</h4>
              <p style="color: #475569; margin-bottom: 0;">${booking.adminResponse.notes}</p>
            </div>
            ` : ''}
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Important Reminders:</strong><br>
                • Please join 5 minutes before the scheduled time<br>
                • You'll receive a reminder email 10 minutes before the session<br>
                • For any changes, contact us at least 24 hours in advance
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              MindSettler Studio, Pune, Maharashtra, India<br>
              This email was sent to ${booking.personalInfo.email}
            </p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: `"MindSettler" <${emailUser}>`,
      to: booking.personalInfo.email,
      subject: subject,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking notification to admin
export const sendBookingNotification = async (booking, slot, user) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL || emailUser;
    
    if (!emailUser) {
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const formatTime = (time) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const mailOptions = {
      from: `"MindSettler" <${emailUser}>`,
      to: adminEmail,
      subject: 'New Session Booking Request - MindSettler',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler Admin</h1>
            <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">New Booking Request</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">New Session Booking</h2>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #1e293b; margin-top: 0;">Client Information</h3>
              <p><strong>Name:</strong> ${booking.personalInfo.name}</p>
              <p><strong>Email:</strong> ${booking.personalInfo.email}</p>
              <p><strong>Phone:</strong> ${booking.personalInfo.phone}</p>
              <p><strong>Relationship Status:</strong> ${booking.personalInfo.relationshipStatus}</p>
              <p><strong>Number of People:</strong> ${booking.personalInfo.numberOfPeople}</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Session Details</h3>
              <p><strong>Date:</strong> ${formatDate(slot.date)}</p>
              <p><strong>Time:</strong> ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}</p>
              <p><strong>Mode:</strong> ${booking.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
              <p><strong>Amount:</strong> ₹${booking.payment.amount}</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Session Content</h3>
              <p><strong>Topics to Discuss:</strong></p>
              <p style="background: white; padding: 10px; border-radius: 4px;">${booking.sessionContent.topics}</p>
              
              ${booking.sessionContent.concerns ? `
              <p><strong>Concerns:</strong></p>
              <p style="background: white; padding: 10px; border-radius: 4px;">${booking.sessionContent.concerns}</p>
              ` : ''}
              
              ${booking.sessionContent.goals ? `
              <p><strong>Goals:</strong></p>
              <p style="background: white; padding: 10px; border-radius: 4px;">${booking.sessionContent.goals}</p>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #dc2626; font-weight: bold;">Action Required: Please review and confirm this booking</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending booking notification:', error);
    return { success: false, error: error.message };
  }
};

// Send reminder email 10 minutes before session
export const sendBookingReminder = async (booking, slot) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    
    if (!emailUser) {
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const sessionDate = booking.adminResponse.confirmedDate || slot.date;
    const sessionTime = booking.adminResponse.confirmedTime || slot.startTime;
    
    const formatTime = (time) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const mailOptions = {
      from: `"MindSettler" <${emailUser}>`,
      to: booking.personalInfo.email,
      subject: 'Session Reminder - Starting in 10 minutes - MindSettler',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #f59e0b; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
            <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Session Reminder</p>
          </div>
          
          <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Your Session Starts in 10 Minutes!</h2>
            
            <div style="background-color: #fef3c7; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1e293b; margin-top: 0;">Session Details</h3>
              <p style="margin: 8px 0; color: #475569; font-size: 18px;"><strong>Time:</strong> ${formatTime(sessionTime)}</p>
              
              ${booking.sessionMode === 'online' && booking.adminResponse.meetingLink ? `
              <div style="margin: 20px 0;">
                <a href="${booking.adminResponse.meetingLink}" 
                   style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Join Meeting Now
                </a>
              </div>
              ` : ''}
              
              ${booking.sessionMode === 'offline' ? `
              <p style="margin: 8px 0; color: #475569;"><strong>Location:</strong> ${booking.location || 'MindSettler Studio, Pune'}</p>
              ` : ''}
            </div>
            
            <p style="color: #64748b; font-size: 16px;">
              We're looking forward to our session together!
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending session reminder:', error);
    return { success: false, error: error.message };
  }
};