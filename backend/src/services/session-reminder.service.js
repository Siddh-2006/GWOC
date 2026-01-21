import cron from 'node-cron';
import mongoose from 'mongoose';
import { sendBookingReminder } from './booking-email.service.js';
import { Booking } from '../models/Booking.model.js';

/**
 * Session Reminder Service
 * Sends automated reminders before sessions start
 */
class SessionReminderService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the reminder scheduler
   * Runs every minute to check for upcoming sessions
   */
  start() {
    if (this.isRunning) {
      console.log('📅 Session reminder service is already running');
      return;
    }

    // Run every minute to check for sessions starting in 10 minutes
    cron.schedule('* * * * *', async () => {
      await this.checkUpcomingSessions();
    });

    this.isRunning = true;
    console.log('📅 Session reminder service started');
  }

  /**
   * Check for sessions starting in 10 minutes and send reminders
   */
  async checkUpcomingSessions() {
    try {
      // Check if database is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ Session reminder: Database not connected, skipping check');
        return;
      }

      const now = new Date();
      
      // Find confirmed bookings that haven't had reminders sent yet
      const upcomingBookings = await Booking.find({
        status: 'confirmed',
        'notifications.reminderSent': false,
        'adminResponse.confirmedDate': { $exists: true },
        'adminResponse.confirmedTime': { $exists: true }
      }).populate('slotId');

      for (const booking of upcomingBookings) {
        try {
          // Get the confirmed session time
          const sessionDate = booking.adminResponse.confirmedDate;
          const sessionTime = booking.adminResponse.confirmedTime;
          
          if (!sessionDate || !sessionTime) {
            continue;
          }

          // Create session datetime
          const sessionDateTime = new Date(sessionDate);
          const [hours, minutes] = sessionTime.split(':');
          sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          // Check if session is within 10-11 minutes from now
          const timeDiff = sessionDateTime.getTime() - now.getTime();
          const minutesUntilSession = Math.floor(timeDiff / (1000 * 60));

          if (minutesUntilSession >= 10 && minutesUntilSession <= 11) {
            // Send reminder to client
            const clientResult = await sendBookingReminder(booking, booking.slotId);
            
            // Send reminder to admin
            const adminResult = await this.sendAdminReminder(booking, booking.slotId);

            if (clientResult.success || adminResult.success) {
              // Mark reminder as sent
              await Booking.findByIdAndUpdate(booking._id, {
                'notifications.reminderSent': true,
                reminderSentAt: new Date()
              });

              console.log(`📧 Reminder sent for booking ${booking._id} - Session in ${minutesUntilSession} minutes`);
            }
          }
        } catch (error) {
          console.error(`❌ Failed to send reminder for booking ${booking._id}:`, error);
        }
      }

      if (upcomingBookings.length > 0) {
        console.log(`📅 Checked ${upcomingBookings.length} confirmed bookings for reminders`);
      }
    } catch (error) {
      console.error('❌ Error checking upcoming sessions:', error);
    }
  }

  /**
   * Send reminder email to admin
   */
  async sendAdminReminder(booking, slot) {
    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
      const adminEmail = process.env.ADMIN_EMAIL || emailUser;
      
      if (!emailUser || !emailPassword) {
        return { success: false, error: 'Email not configured' };
      }

      // Create transporter locally
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransporter({
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
      
      const sessionDate = booking.adminResponse.confirmedDate || slot.date;
      const sessionTime = booking.adminResponse.confirmedTime || slot.startTime;
      
      const formatTime = (time) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      };

      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      const mailOptions = {
        from: `"MindSettler" <${emailUser}>`,
        to: adminEmail,
        subject: 'Session Starting in 10 Minutes - MindSettler Admin',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #dc2626; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MindSettler Admin</h1>
              <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Session Starting Soon</p>
            </div>
            
            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Session Starting in 10 Minutes!</h2>
              
              <div style="background-color: #fef3c7; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #1e293b; margin-top: 0;">Session Details</h3>
                <p style="margin: 8px 0; color: #475569; font-size: 18px;"><strong>Client:</strong> ${booking.personalInfo.name}</p>
                <p style="margin: 8px 0; color: #475569; font-size: 18px;"><strong>Time:</strong> ${formatTime(sessionTime)}</p>
                <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${formatDate(sessionDate)}</p>
                <p style="margin: 8px 0; color: #475569;"><strong>Mode:</strong> ${booking.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
                
                ${booking.sessionMode === 'online' && booking.adminResponse.meetingLink ? `
                <div style="margin: 20px 0;">
                  <a href="${booking.adminResponse.meetingLink}" 
                     style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Join Meeting Now
                  </a>
                </div>
                ` : ''}
                
                ${booking.sessionMode === 'offline' ? `
                <p style="margin: 8px 0; color: #475569;"><strong>Location:</strong> ${booking.location || 'MindSettler Studio, Surat'}</p>
                ` : ''}
              </div>
              
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: #1e293b; margin-top: 0;">Client Information</h4>
                <p style="margin: 4px 0; color: #475569;"><strong>Email:</strong> ${booking.personalInfo.email}</p>
                <p style="margin: 4px 0; color: #475569;"><strong>Phone:</strong> ${booking.personalInfo.phone}</p>
                <p style="margin: 4px 0; color: #475569;"><strong>Relationship Status:</strong> ${booking.personalInfo.relationshipStatus}</p>
              </div>
              
              ${booking.sessionContent?.topics ? `
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: #1e293b; margin-top: 0;">Session Topics</h4>
                <p style="margin: 0; color: #475569;">${booking.sessionContent.topics}</p>
              </div>
              ` : ''}
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Error sending admin reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop the reminder scheduler
   */
  stop() {
    this.isRunning = false;
    console.log('📅 Session reminder service stopped');
  }
}

// Export singleton instance
export const sessionReminderService = new SessionReminderService();