import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';

export async function connectDB() {
  const conn = await mongoose.connect(MONGO_URI, { autoIndex: true });
  return conn;
}
