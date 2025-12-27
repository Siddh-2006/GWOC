import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auth from '../src/models/Auth.model.js';
import { User } from '../src/models/User.model.js';

dotenv.config();

/**
 * Script to make an existing user an admin
 * Run with: node scripts/make-user-admin.js your-email@example.com
 */

const makeUserAdmin = async (email) => {
  try {
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node scripts/make-user-admin.js your-email@example.com');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');
    console.log('✅ Connected to MongoDB');

    // Find user in Auth model
    const authUser = await Auth.findOne({ email: email.toLowerCase() });
    if (!authUser) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    // Check if already admin
    if (authUser.role === 'admin') {
      console.log('ℹ️  User is already an admin:', email);
      process.exit(0);
    }

    // Update user role to admin
    authUser.role = 'admin';
    await authUser.save();
    console.log('✅ Updated Auth record to admin role');

    // Update User profile if exists
    const userProfile = await User.findOne({ email: email.toLowerCase() });
    if (userProfile) {
      userProfile.role = 'admin';
      await userProfile.save();
      console.log('✅ Updated User profile to admin role');
    }

    console.log('\n🎉 User successfully made admin!');
    console.log('📧 Email:', email);
    console.log('👑 Role: admin');
    console.log('\n🔗 User can now access admin panel at: http://localhost:3000/admin');
    console.log('💡 User will be automatically redirected to admin dashboard after login');

  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Get email from command line arguments
const email = process.argv[2];
makeUserAdmin(email);