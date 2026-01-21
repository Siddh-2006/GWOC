import mongoose from 'mongoose';

// Set global mongoose options to prevent buffering issues
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoUri) {
            console.error('❌ Missing MONGODB_URI or MONGO_URI environment variable');
            console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('MONGO')));
            throw new Error('Missing MONGODB_URI or MONGO_URI environment variable');
        }

        // Log a masked version of the URI for verification in logs
        const maskedUri = mongoUri.replace(/\/\/.*@/, '//****:****@');
        console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

        // Enhanced connection options for better reliability in serverless
        const connectionOptions = {
            serverSelectionTimeoutMS: 20000, // 20 seconds for cold starts
            socketTimeoutMS: 45000,
            connectTimeoutMS: 20000,
            maxPoolSize: 1, // Recommended for serverless to avoid hitting limits
            minPoolSize: 0,
            maxIdleTimeMS: 10000,
            bufferCommands: false, // Prevent operations from hanging if connection is lost
            retryWrites: true,
            retryReads: true
        };

        const conn = await mongoose.connect(mongoUri, connectionOptions);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        console.log(`📡 Connection State: ${mongoose.connection.readyState} (1 = connected)`);

        return conn;
    } catch (err) {
        // deep diagnostic logging
        console.error('❌ MONGODB ERROR DIAGNOSTICS:');
        console.error(`- Name: ${err.name}`);
        console.error(`- Message: ${err.message}`);

        if (err.reason) {
            console.error('- Reason:', JSON.stringify(err.reason, null, 2));
        }

        if (err.message.includes('IP address not whitelisted')) {
            console.error('👉 ACTION REQUIRED: Ensure 0.0.0.0/0 is whitelisted in Atlas.');
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('🔄 Development mode: Retrying...');
            setTimeout(connectDB, 5000);
        } else {
            console.error('💥 Production Connection Failed. This will cause a 5xx error on Vercel.');
            throw err;
        }
    }
};

export default connectDB;
