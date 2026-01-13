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

// Helper to generate Google Calendar Link
const generateGoogleCalendarLink = (booking, slot, sessionDate, sessionTime) => {
  const title = encodeURIComponent(`MindSettler Session: ${booking.personalInfo.name}`);

  // Parse date and time to construct start and end ISO strings for Google Calendar
  // Format: YYYYMMDDTHHMMSSZ
  const dateObj = new Date(sessionDate);
  const dateStr = dateObj.toISOString().split('T')[0].replace(/-/g, '');

  const [startHour, startMinute] = sessionTime.split(':');
  const [endHour, endMinute] = slot.endTime.split(':');

  // Note: This assumes local time input and converts to simple string format for GCal
  // GCal expects UTC (Z) or local time if no Z. For simplicity in link, we often use local time format YYYYMMDDTHHMMSS

  const startTimeStr = `${dateStr}T${startHour}${startMinute}00`;
  const endTimeStr = `${dateStr}T${endHour}${endMinute}00`;

  const details = encodeURIComponent(`Session with MindSettler\nMode: ${booking.sessionMode}\n\nJoin Link / Location: ${booking.sessionMode === 'online' ? booking.adminResponse?.meetingLink : booking.location}`);
  const location = encodeURIComponent(booking.sessionMode === 'online' ? 'Online Meeting' : (booking.location || 'MindSettler Studio, Surat'));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTimeStr}/${endTimeStr}&details=${details}&location=${location}`;
};

// Send booking confirmation to user (Now triggered AFTER payment is verified)
export const sendBookingConfirmation = async (booking, slot, status, rejectionReason = null) => {
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
              Thank you for requesting a session with MindSettler. We have received your request and it is currently being reviewed by our team.
            </p>
            
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6366f1;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Requested Details</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${formatDate(slot.date)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Time:</strong> ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Session Mode:</strong> ${booking.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
            </div>
            
            <div style="background-color: #e0e7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #4338ca; margin: 25px 0;">
              <p style="color: #3730a3; margin: 0; font-size: 14px;">
                <strong>Next Steps:</strong><br>
                1. Our team will review your request.<br>
                2. Once approved, you will receive an email with payment instructions.<br>
                3. Your session will be confirmed after payment verification.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              MindSettler Studio, Surat, Gujarat, India
            </p>
          </div>
        </div>
      `;
    } else if (status === 'awaiting_payment') {
      subject = 'Booking Request & Payment Received - Verification Pending';
      html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #f59e0b; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
              <p style="color: #fffbeb; margin: 10px 0 0 0; font-size: 16px;">Payment Verification Pending</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Request Received</h2>
              
              <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                Dear ${booking.personalInfo.name},
              </p>
              
              <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                Thank you for your booking request and payment details. We have received your Transaction ID: <strong>${booking.payment?.paymentId || 'N/A'}</strong>.
              </p>

               <div style="background-color: #fff7ed; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #9a3412; margin-top: 0; margin-bottom: 15px;">What's Next?</h3>
                <p style="margin: 8px 0; color: #431407;">Our team is verifying your payment. Once confirmed, you will receive the final booking confirmation with the meeting link.</p>
              </div>
              
              <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6366f1;">
                <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Requested Details</h3>
                <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${formatDate(slot.date)}</p>
                <p style="margin: 8px 0; color: #475569;"><strong>Time:</strong> ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}</p>
                <p style="margin: 8px 0; color: #475569;"><strong>Session Mode:</strong> ${booking.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
                <p style="margin: 8px 0; color: #475569;"><strong>Amount Paid:</strong> ₹${booking.payment.amount}</p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center;">
                This process usually takes less than 24 hours.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                MindSettler Studio, Surat, Gujarat, India
              </p>
            </div>
          </div>
        `;
      subject = 'Payment Received & Session Confirmed - MindSettler';
      const sessionDate = booking.adminResponse.confirmedDate || slot?.date || new Date();
      const sessionTime = booking.adminResponse.confirmedTime || slot?.startTime || '00:00';

      // Fallback for end time if slot is missing
      const endTime = slot?.endTime || '01:00';

      // Only generate calendar link if we have valid date/time
      let calendarLink = '#';
      try {
        calendarLink = generateGoogleCalendarLink(booking, { endTime }, sessionDate, sessionTime);
      } catch (calError) {
        console.warn('Could not generate calendar link:', calError);
      }

      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Everything is Set!</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Payment Received & Session Confirmed</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Dear ${booking.personalInfo.name},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              We have received your payment provided to the admin. Your session is now fully confirmed.
            </p>
            
            <div style="background-color: #ecfdf5; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Session Details</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${formatDate(sessionDate)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Time:</strong> ${formatTime(sessionTime)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Mode:</strong> ${booking.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
              
              ${booking.sessionMode === 'online' && booking.adminResponse.meetingLink ?
          `<p style="margin: 8px 0; color: #475569;"><strong>Meeting Link:</strong> <a href="${booking.adminResponse.meetingLink}" style="color: #10b981;">${booking.adminResponse.meetingLink}</a></p>` :
          ''}
              ${booking.sessionMode === 'offline' ?
          `<p style="margin: 8px 0; color: #475569;"><strong>Location:</strong> ${booking.location || 'MindSettler Studio, Surat'}</p>` :
          ''}
            </div>

             <div style="text-align: center; margin: 30px 0;">
              <a href="${calendarLink}" target="_blank" style="background-color: #4285F4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                📅 Add to Google Calendar
              </a>
            </div>
            
            ${booking.adminResponse.notes ? `
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #1e293b; margin-top: 0;">Admin Notes:</h4>
              <p style="color: #475569; margin-bottom: 0;">${booking.adminResponse.notes}</p>
            </div>
            ` : ''}

            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Thank you for trusting MindSettler. We look forward to seeing you!
            </p>
          </div>
           <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              MindSettler Studio, Surat, Gujarat, India
            </p>
          </div>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = 'Booking Request Update - MindSettler';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #dc2626; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
            <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Booking Update</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Booking Request Update</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Dear ${booking.personalInfo.name},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Thank you for your interest. After reviewing your request, we are unable to accommodate this specific booking at this time.
            </p>
            
            <div style="background-color: #fef2f2; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Booking Details</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${formatDate(slot.date)}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Time:</strong> ${formatTime(slot.startTime)}</p>
            </div>
            
            ${rejectionReason ? `
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #1e293b; margin-top: 0;">Reason:</h4>
              <p style="color: #475569; margin-bottom: 0;">${rejectionReason}</p>
            </div>
            ` : ''}
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
               Please check other available slots or contact us for alternatives.
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

// Send Payment Request Email (Triggered on Approval)
export const sendPaymentRequest = async (booking, slot) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    if (!emailUser) return { success: false, error: 'Email not configured' };

    const transporter = createTransporter();

    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatTime = (time) => new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const mailOptions = {
      from: `"MindSettler" <${emailUser}>`,
      to: booking.personalInfo.email,
      subject: 'Booking Approved - Next Steps: Payment Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #f59e0b; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler</h1>
            <p style="color: #fffbeb; margin: 10px 0 0 0; font-size: 16px;">Action Required: Payment</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Your Session is Approved!</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Dear ${booking.personalInfo.name},
            </p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Good news! Your booking request has been approved by the admin. To confirm your slot, please complete the payment.
            </p>
            
            <div style="background-color: #fff7ed; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f97316;">
              <h3 style="color: #9a3412; margin-top: 0; margin-bottom: 15px;">Payment Details</h3>
              <p style="margin: 8px 0; color: #431407;"><strong>Amount:</strong> <span style="font-size: 18px; font-weight: bold;">₹${booking.payment.amount}</span></p>
              <p style="margin: 8px 0; color: #431407;"><strong>UPI ID:</strong> itssiddh7@okicici</p>
              
              <div style="margin: 20px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay?amount=${booking.payment.amount}&ref=${booking._id}" 
                   style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Go to Secure Payment Page
                </a>
              </div>
              
              <div style="background-color: white; padding: 10px; border-radius: 6px; border: 1px dashed #fdba74; margin-top: 15px;">
                <p style="margin: 0; color: #9a3412; font-size: 13px;">
                  <strong>Note:</strong> Clicking the button will open a secure page with a QR Code (for desktop) and a direct UPI launch button (for mobile).
                </p>
              </div>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1f2937; margin: 0; font-weight: bold;">Next Steps:</p>
              <ol style="color: #4b5563; margin-top: 10px; padding-left: 20px;">
                <li>Complete payment via the link above.</li>
                <li>Reply to this email with a <strong>screenshot of the payment</strong> OR upload it in your dashboard.</li>
                <li>Once verified, you will receive the final confirmation with the meeting link/address.</li>
              </ol>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Questions? Reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending payment request email:', error);
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
              <p style="margin: 8px 0; color: #475569;"><strong>Location:</strong> ${booking.location || 'MindSettler Studio, Surat'}</p>
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