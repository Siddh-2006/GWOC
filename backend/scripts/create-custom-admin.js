import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Auth from '../src/models/Auth.model.js';
import { User } from '../src/models/User.model.js';

dotenv.config();

/**
 * Script to create a custom admin user
 * Run with: node scripts/create-custom-admin.js
 */

const createCustomAdmin = async () => {
  try {
    // Connect to MongoDB using the provided connection string
    const MONGODB_URI = 'mongodb+srv://mindsettler:zovotfSQfFEvnml8@mindsettler.791pbco.mongodb.net/?retryWrites=true&w=majority&appName=MindSettler';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminData = {
      email: 'mindsettlerbrightweb@gmail.com',
      password: 'Test@123',
      firstName: 'MindSettler',
      lastName: 'Admin',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      authProvider: 'local'
    };

    // Check if admin already exists in Auth model
    const existingAdmin = await Auth.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists in Auth model');
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user role to admin in Auth model');
      }
    } else {
      // Create admin user in Auth model
      const adminAuth = new Auth(adminData);
      await adminAuth.save();
      console.log('✅ Admin auth record created');
    }

    // Check if admin profile exists in User model
    const existingProfile = await User.findOne({ email: adminData.email });
    if (existingProfile) {
      console.log('⚠️  Admin profile already exists in User model');
      
      // Update role to admin if not already
      if (existingProfile.role !== 'admin') {
        existingProfile.role = 'admin';
        await existingProfile.save();
        console.log('✅ Updated existing user profile role to admin in User model');
      }
    } else {
      // Create admin user profile in User model
      const adminProfile = new User({
        email: adminData.email,
        name: `${adminData.firstName} ${adminData.lastName}`,
        role: 'admin'
      });
      await adminProfile.save();
      console.log('✅ Admin profile created in User model');
    }

    console.log('\n🎉 Admin user setup completed successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role: admin');
    console.log('\n✅ User can now login with admin privileges');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('💡 This usually means the user already exists. Check the database manually.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

createCustomAdmin();