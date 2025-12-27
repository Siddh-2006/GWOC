import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('Missing MONGO_URI or MONGODB_URI environment variable');
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
