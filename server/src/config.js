import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/helpdesk';
export const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
export const AUTO_CLOSE_ENABLED = (process.env.AUTO_CLOSE_ENABLED ?? 'true') === 'true';
export const CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD ?? '0.78');
export const STUB_MODE = (process.env.STUB_MODE ?? 'true') === 'true';
