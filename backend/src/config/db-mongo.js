import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

let isConnected = false;
let keepAliveTimer = null;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 30, // Balanced pool size
      minPoolSize: 2,  // Keep baseline sockets warm
      maxIdleTimeMS: 120000, // 2 minutes idle before closing socket
      serverSelectionTimeoutMS: 30000, // 30s timeout prevents dropping during latency spikes
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Keep connection warm to avoid cold TLS handshakes on residential/slow connections
    if (!keepAliveTimer) {
      keepAliveTimer = setInterval(async () => {
        try {
          if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
          }
        } catch (_) {
          // Ignore ping errors
        }
      }, 45000);
      keepAliveTimer.unref();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected successfully.');
});

export default connectDB;