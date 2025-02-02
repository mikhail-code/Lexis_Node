import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';
import { Request, Response, NextFunction } from 'express';
import Auth from '../3_models/Auth'; // Adjust the import path as necessary
import { User } from '../3_models/User'; // Adjust the import path as necessary

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export function generateAuthToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '12h' });
}

export async function validateRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const authRecord = await Auth.findOne({ where: { token } });
    if (!authRecord) {
      return null;
    }

    const { expiresAt, userId } = authRecord;
    const currentTime = new Date();
    if (currentTime > expiresAt) {
      return null; // Expired token
    }

    return { userId };
  } catch (error) {
    console.error('Error validating refresh token:', error);
    return null;
  }
}

export async function saveAuthToken(userId: string, token: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ms('12h'));
    await Auth.create({
      id: uuidv4(), // Ensure `id` is included or generated
      userId,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user to request object
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
