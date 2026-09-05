import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'revenue_ai_default_secret_key_2026',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  aiApiKey: process.env.AI_API_KEY || '',
};
