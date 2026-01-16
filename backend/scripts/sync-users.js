import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models
import Auth from '../src/models/Auth.model.js';
import { User } from '../src/models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

const syncUsers = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Get all Auth users
        const authUsers = await Auth.find({});
        console.log(`📊 Found ${authUsers.length} Auth users`);

        const authEmails = new Set(authUsers.map(u => u.email.toLowerCase()));
        let createdCount = 0;

        // 2. Ensure every Auth user has a User profile
        for (const authUser of authUsers) {
            const existingUser = await User.findOne({ email: authUser.email.toLowerCase() });

            if (!existingUser) {
                console.log(`🆕 Creating User profile for: ${authUser.email}`);
                await User.create({
                    email: authUser.email.toLowerCase(),
                    name: `${authUser.firstName} ${authUser.lastName || ''}`.trim(),
                    role: authUser.role || 'user',
                    createdAt: authUser.createdAt || new Date()
                });
                createdCount++;
            }
        }

        // 3. Delete orphans: User profiles that don't have a matching Auth record
        const allUsers = await User.find({});
        let deletedCount = 0;

        for (const user of allUsers) {
            if (!authEmails.has(user.email.toLowerCase())) {
                console.log(`🗑️ Deleting orphaned User profile: ${user.email}`);
                await User.findByIdAndDelete(user._id);
                deletedCount++;
            }
        }

        console.log('\n--- Sync Results ---');
        console.log(`✅ Task Completed Successfully!`);
        console.log(`✨ Profiles Created: ${createdCount}`);
        console.log(`🧹 Profiles Deleted (Orphans): ${deletedCount}`);
        console.log(`Total Users in Auth: ${authUsers.length}`);
        console.log(`Total Users in User Model: ${await User.countDocuments()}`);
        console.log('--------------------\n');

    } catch (error) {
        console.error('❌ Sync Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

syncUsers();
