import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoUri) {
            console.error('❌ Missing MONGODB_URI or MONGO_URI environment variable');
            console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('MONGO')));
            return;
        }

        // Log a masked version of the URI for verification in logs
        const maskedUri = mongoUri.replace(/\/\/.*@/, '//****:****@');
        console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

        // Enhanced connection options for better reliability
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // 5 seconds (shorter for serverless)
            socketTimeoutMS: 45000,
            maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            bufferCommands: false,
            retryWrites: true,
            retryReads: true
        });

        console.log(`✅ Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error event:', err);
        });

        mongoose.connection.on('disconnected', () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('⚠️ MongoDB disconnected');
            }
        });

        return conn;
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);

        if (err.message.includes('IP address not whitelisted')) {
            console.error('👉 ACTION REQUIRED: Add 0.0.0.0/0 to your MongoDB Atlas Network Access whitelist.');
        } else if (err.message.includes('Authentication failed')) {
            console.error('👉 ACTION REQUIRED: Check your MongoDB username and password in the connection string.');
        }

        if (process.env.NODE_ENV !== 'production') {
            // In development, we might want to retry
            console.log('🔄 Development mode: Retrying MongoDB connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        } else {
            // In production (especially serverless), we don't want to hang
            throw err;
        }
    }
};

export default connectDB;
