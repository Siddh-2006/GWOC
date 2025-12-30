import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('Missing MONGO_URI or MONGODB_URI environment variable');
        }
        
        // Enhanced connection options for better reliability
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            bufferCommands: false,
            bufferMaxEntries: 0,
            retryWrites: true,
            retryReads: true
        });
        
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        // Don't exit process immediately, allow for retries
        setTimeout(() => {
            console.log('🔄 Retrying MongoDB connection...');
            connectDB();
        }, 5000);
    }
};

export default connectDB;
