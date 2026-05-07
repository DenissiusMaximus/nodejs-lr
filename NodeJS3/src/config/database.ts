import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
        console.error('Error: MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('MongoDB Successfully connected');
    } catch (error) {
        console.error('DB error:', error);
        throw error; 
    }
}

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});