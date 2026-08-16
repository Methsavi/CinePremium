import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.dbUri);
    console.log(`[Database] Successfully connected to MongoDB host: ${conn.connection.host}`);
    console.log(`[Database] Connected to database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[Database] Connection Warning: ${error.message}`);
    console.warn('[Database] Using in-memory fallback storage.');
    return false;
  }
};
