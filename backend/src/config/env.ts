import dotenv from 'dotenv';
import path from 'path';

// Check if running from root or backend directory, prioritize root .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to current working directory .env

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGOURI || process.env.MONGOURI_TEST || 'mongodb://localhost:27017/lab-v2',
  JWT_SECRET: process.env.JWT || 'default_jwt_secret',
  IS_PRODUCTION: process.env.PRODUCTION === 'true' || process.env.NODE_ENV === 'production',
};
