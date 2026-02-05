import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auth from '../src/models/Auth.model.js';
import { User } from '../src/models/User.model.js';

dotenv.config();

/**
 * Script to check user admin status and make user admin if needed
 * Run with: node scripts/check-user-admin.js <email>
 */

const checkAndMakeAdmin = async (email) => {
  try {
    // Connect to MongoDB using the provided connection string
    const MONGODB_URI = 'mongodb+srv://mindsettler:zovotfSQfFEvnml8@mindsettler.791pbco.mongodb.net/?retryWrites=true&w=majority&appName=MindSettler';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node scripts/check-user-admin.js <email>');
      process.exit(1);
    }

    console.log(`🔍 Checking user: ${email}`);

    // Check Auth model
    const authUser = await Auth.findOne({ email: email.toLowerCase() });
    if (authUser) {
      console.log('\n📋 Auth Model:');
      console.log(`  ✅ User exists`);
      console.log(`  📧 Email: ${authUser.email}`);
      console.log(`  👤 Name: ${authUser.firstName} ${authUser.lastName}`);
      console.log(`  🔑 Role: ${authUser.role}`);
      console.log(`  ✉️  Email Verified: ${authUser.isEmailVerified}`);
      console.log(`  🟢 Active: ${authUser.isActive}`);
      console.log(`  🔐 Auth Provider: ${authUser.authProvider}`);
      
      // Make admin if not already
      if (authUser.role !== 'admin') {
        authUser.role = 'admin';
        await authUser.save();
        console.log('  ✅ Updated role to admin in Auth model');
      }
    } else {
      console.log('\n❌ Auth Model: User not found');
    }

    // Check User model
    const userProfile = await User.findOne({ email: email.toLowerCase() });
    if (userProfile) {
      console.log('\n📋 User Profile Model:');
      console.log(`  ✅ Profile exists`);
      console.log(`  📧 Email: ${userProfile.email}`);
      console.log(`  👤 Name: ${userProfile.name}`);
      console.log(`  🔑 Role: ${userProfile.role}`);
      console.log(`  📱 Phone: ${userProfile.phone || 'Not set'}`);
      
      // Make admin if not already
      if (userProfile.role !== 'admin') {
        userProfile.role = 'admin';
        await userProfile.save();
        console.log('  ✅ Updated role to admin in User model');
      }
    } else {
      console.log('\n❌ User Profile Model: Profile not found');
      
      // If auth exists but no profile, create profile
      if (authUser) {
        const newProfile = new User({
          email: authUser.email,
          name: `${authUser.firstName} ${authUser.lastName}`,
          role: 'admin'
        });
        await newProfile.save();
        console.log('  ✅ Created admin profile in User model');
      }
    }

    console.log('\n🎉 User check and admin setup completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Get email from command line arguments
const email = process.argv[2];
checkAndMakeAdmin(email);