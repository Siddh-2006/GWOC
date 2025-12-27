import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Booking } from '../src/models/Booking.model.js';
import { sendBookingReminder } from '../src/services/booking-email.service.js';

dotenv.config();

const sendSessionReminders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');

    // Get current time
    const now = new Date();
    
    // Calculate 10 minutes from now
    const reminderTime = new Date(now.getTime() + 10 * 60 * 1000);
    
    // Find confirmed bookings that start in approximately 10 minutes
    // and haven't had reminders sent yet
    const upcomingBookings = await Booking.find({
      status: 'confirmed',
      'notifications.reminderSent': false,
      // Match bookings where the confirmed date/time is within the next 10-15 minutes
    }).populate('slotId').populate('userId');

    let remindersSent = 0;

    for (const booking of upcomingBookings) {
      try {
        // Get the confirmed session time
        const sessionDate = booking.adminResponse?.confirmedDate || booking.slotId?.date;
        const sessionTime = booking.adminResponse?.confirmedTime || booking.slotId?.startTime;
        
        if (!sessionDate || !sessionTime) {
          continue;
        }

        // Create session datetime
        const sessionDateTime = new Date(sessionDate);
        const [hours, minutes] = sessionTime.split(':');
        sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Check if session is within 10-15 minutes from now
        const timeDiff = sessionDateTime.getTime() - now.getTime();
        const minutesUntilSession = Math.floor(timeDiff / (1000 * 60));

        if (minutesUntilSession >= 10 && minutesUntilSession <= 15) {
          // Send reminder email
          const result = await sendBookingReminder(booking, booking.slotId);
          
          if (result.success) {
            // Mark reminder as sent
            booking.notifications.reminderSent = true;
            await booking.save();
            remindersSent++;
          }
        }

      } catch (error) {
        // Error processing booking - continue with next
      }
    }

  } catch (error) {
    console.error('❌ Error sending session reminders:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
sendSessionReminders();