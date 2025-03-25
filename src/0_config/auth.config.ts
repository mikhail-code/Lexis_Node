import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.ACCESS_TOKEN_LIFE || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_LIFE || '30d',
  bcryptSaltRounds: 10,
  cookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};