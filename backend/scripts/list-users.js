import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auth from '../src/models/Auth.model.js';

dotenv.config();

/**
 * Script to list all users and their roles
 * Run with: node scripts/list-users.js
 */

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler');
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await Auth.find({}, 'email role isActive createdAt').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in the database');
      process.exit(0);
    }

    console.log('\n📋 All Users:');
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      const statusIcon = user.isActive ? '✅' : '❌';
      
      console.log(`${index + 1}. ${roleIcon} ${user.email}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Active: ${statusIcon} ${user.isActive}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    console.log('💡 To make a user admin, run:');
    console.log('   node scripts/make-user-admin.js <email>');

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

listUsers();