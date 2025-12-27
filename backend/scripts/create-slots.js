import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define Slot schema directly to avoid import issues
const SlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, default: 60, enum: [30, 45, 60, 90, 120] },
  isAvailable: { type: Boolean, default: true },
  availableModes: [{ type: String, enum: ['online', 'offline'] }],
  defaultModes: { type: [String], default: ['online', 'offline'] },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  pricing: {
    online: { type: Number, default: 1200 },
    offline: { type: Number, default: 1500 }
  },
  offlineLocation: {
    address: { type: String, default: "MindSettler Studio, Surat, Gujarat" },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    instructions: String
  },
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String, trim: true },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware
SlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (!this.availableModes || this.availableModes.length === 0) {
    this.availableModes = this.defaultModes;
  }
  next();
});

const Slot = mongoose.model('Slot', SlotSchema);

const createTestSlots = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');
    console.log('✅ Connected to MongoDB');

    // Clear existing slots (optional - remove this line if you want to keep existing slots)
    // await Slot.deleteMany({});
    // console.log('🗑️ Cleared existing slots');

    // Create slots for the next 7 days
    const today = new Date();
    const slots = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      
      // Skip weekends for this example (optional)
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Morning slots
      const morningSlots = [
        { start: '09:00', end: '10:00' },
        { start: '10:30', end: '11:30' },
        { start: '11:45', end: '12:45' }
      ];

      // Afternoon slots
      const afternoonSlots = [
        { start: '14:00', end: '15:00' },
        { start: '15:30', end: '16:30' },
        { start: '17:00', end: '18:00' }
      ];

      // Evening slots
      const eveningSlots = [
        { start: '18:30', end: '19:30' },
        { start: '20:00', end: '21:00' }
      ];

      const allTimeSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots];

      for (const timeSlot of allTimeSlots) {
        const slot = {
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          duration: 60,
          isAvailable: true,
          availableModes: ['online', 'offline'],
          pricing: {
            online: 1200,
            offline: 1500
          },
          offlineLocation: {
            address: "MindSettler Studio, Surat, Gujarat",
            instructions: "Please arrive 5 minutes early"
          },
          isBlocked: false,
          isRecurring: false
        };

        slots.push(slot);
      }
    }

    // Insert slots into database
    const insertedSlots = await Slot.insertMany(slots);
    console.log(`✅ Created ${insertedSlots.length} test slots`);

    // Display summary
    const slotsByDate = {};
    insertedSlots.forEach(slot => {
      const dateKey = slot.date.toISOString().split('T')[0];
      if (!slotsByDate[dateKey]) {
        slotsByDate[dateKey] = 0;
      }
      slotsByDate[dateKey]++;
    });

    console.log('\n📅 Slots created by date:');
    Object.entries(slotsByDate).forEach(([date, count]) => {
      console.log(`  ${date}: ${count} slots`);
    });

    console.log('\n🎯 Sample slot times:');
    console.log('  Morning: 09:00-10:00, 10:30-11:30, 11:45-12:45');
    console.log('  Afternoon: 14:00-15:00, 15:30-16:30, 17:00-18:00');
    console.log('  Evening: 18:30-19:30, 20:00-21:00');

    console.log('\n💰 Pricing:');
    console.log('  Online sessions: ₹1,200');
    console.log('  Offline sessions: ₹1,500');

  } catch (error) {
    console.error('❌ Error creating test slots:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
createTestSlots();