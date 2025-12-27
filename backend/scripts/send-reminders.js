import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Booking } from '../src/models/Booking.model.js';
import { sendBookingReminder } from '../src/services/booking-email.service.js';

dotenv.config();

const sendSessionReminders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');
    console.log('✅ Connected to MongoDB');

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

    console.log(`🔍 Found ${upcomingBookings.length} bookings to check for reminders`);

    let remindersSent = 0;

    for (const booking of upcomingBookings) {
      try {
        // Get the confirmed session time
        const sessionDate = booking.adminResponse?.confirmedDate || booking.slotId?.date;
        const sessionTime = booking.adminResponse?.confirmedTime || booking.slotId?.startTime;
        
        if (!sessionDate || !sessionTime) {
          console.log(`⚠️ Skipping booking ${booking._id}: Missing session date/time`);
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
          console.log(`📧 Sending reminder for booking ${booking._id} (${minutesUntilSession} minutes until session)`);
          
          // Send reminder email
          const result = await sendBookingReminder(booking, booking.slotId);
          
          if (result.success) {
            // Mark reminder as sent
            booking.notifications.reminderSent = true;
            await booking.save();
            remindersSent++;
            console.log(`✅ Reminder sent successfully for booking ${booking._id}`);
          } else {
            console.error(`❌ Failed to send reminder for booking ${booking._id}:`, result.error);
          }
        } else if (minutesUntilSession < 10) {
          console.log(`⏰ Session for booking ${booking._id} is too close (${minutesUntilSession} minutes) - skipping reminder`);
        } else {
          console.log(`⏳ Session for booking ${booking._id} is too far (${minutesUntilSession} minutes) - not time for reminder yet`);
        }

      } catch (error) {
        console.error(`❌ Error processing booking ${booking._id}:`, error);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  • Bookings checked: ${upcomingBookings.length}`);
    console.log(`  • Reminders sent: ${remindersSent}`);
    
    if (remindersSent > 0) {
      console.log(`\n✅ Successfully sent ${remindersSent} session reminder(s)`);
    } else {
      console.log(`\n💤 No reminders needed at this time`);
    }

  } catch (error) {
    console.error('❌ Error sending session reminders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
sendSessionReminders();