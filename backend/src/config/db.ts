import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = ENV.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables.');
    }

    console.log('[Database] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    console.log(`[Database] MongoDB successfully connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error);
    // Don't exit process in development to allow server to stay alive and report health
    if (ENV.IS_PRODUCTION) {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected.');
});
