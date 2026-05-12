import mongoose from 'mongoose';
import { config } from './index.js';

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] MongoDB connection error:', err);
    console.error('\n[DB] Fix: 1) Start MongoDB locally, or 2) Use MongoDB Atlas and set MONGODB_URI in .env to your Atlas connection string (e.g. mongodb+srv://user:pass@cluster.mongodb.net/dbname)\n');
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected');
});
