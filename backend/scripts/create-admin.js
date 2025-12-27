import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Auth from '../src/models/Auth.model.js';
import { User } from '../src/models/User.model.js';

dotenv.config();

/**
 * Script to create an admin user
 * Run with: node scripts/create-admin.js
 */

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminData = {
      email: 'admin@mindsettler.com',
      password: 'Admin123456', // Change this to a secure password
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await Auth.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      process.exit(1);
    }

    // Create admin user in Auth model
    const adminAuth = new Auth(adminData);
    await adminAuth.save();
    console.log('✅ Admin auth record created');

    // Create admin user profile in User model
    const adminProfile = new User({
      email: adminData.email,
      name: `${adminData.firstName} ${adminData.lastName}`,
      role: adminData.role
    });
    await adminProfile.save();
    console.log('✅ Admin profile created');

    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('\n⚠️  Please change the password after first login!');
    console.log('\n🔗 Access admin panel at: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser();