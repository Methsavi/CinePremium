import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/CinePremium',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
};
