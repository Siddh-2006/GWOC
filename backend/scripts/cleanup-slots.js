import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Slot } from '../src/models/Slot.model.js';

dotenv.config();

const cleanupSlots = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const now = new Date();
    
    // Find all slots
    const allSlots = await Slot.find();
    console.log(`📊 Total slots found: ${allSlots.length}`);

    // Find expired slots (past start time and not booked)
    const expiredSlots = [];
    const futureSlots = [];
    const bookedSlots = [];

    for (const slot of allSlots) {
      const slotDateTime = new Date(slot.date);
      const [hours, minutes] = slot.startTime.split(':');
      slotDateTime.setHours(parseInt(hours), parseInt(minutes));

      if (slot.bookingId) {
        bookedSlots.push(slot);
      } else if (slotDateTime < now) {
        expiredSlots.push(slot);
      } else {
        futureSlots.push(slot);
      }
    }

    console.log(`📅 Future slots: ${futureSlots.length}`);
    console.log(`📋 Booked slots: ${bookedSlots.length}`);
    console.log(`⏰ Expired slots: ${expiredSlots.length}`);

    if (expiredSlots.length > 0) {
      console.log('\n🗑️ Removing expired slots:');
      for (const slot of expiredSlots) {
        console.log(`   - ${slot.date.toDateString()} ${slot.startTime}-${slot.endTime}`);
      }

      // Delete expired slots
      const deleteResult = await Slot.deleteMany({
        _id: { $in: expiredSlots.map(slot => slot._id) }
      });

      console.log(`✅ Deleted ${deleteResult.deletedCount} expired slots`);
    } else {
      console.log('✨ No expired slots to clean up');
    }

    // Show remaining slots summary
    const remainingSlots = await Slot.find().sort({ date: 1, startTime: 1 });
    console.log(`\n📋 Remaining slots: ${remainingSlots.length}`);
    
    if (remainingSlots.length > 0) {
      console.log('\n📅 Upcoming slots:');
      remainingSlots.slice(0, 10).forEach(slot => {
        const status = slot.bookingId ? '(BOOKED)' : slot.isAvailable ? '(AVAILABLE)' : '(BLOCKED)';
        console.log(`   - ${slot.date.toDateString()} ${slot.startTime}-${slot.endTime} ${status}`);
      });
      
      if (remainingSlots.length > 10) {
        console.log(`   ... and ${remainingSlots.length - 10} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error cleaning up slots:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

cleanupSlots();