import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';
import { Request, Response, NextFunction } from 'express';
import Auth from '../3_models/Auth';
import { User } from '../3_models/User';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/auth.types';
import { authConfig } from '../0_config/auth.config';

export function generateAuthToken(userId: string): string {
  return jwt.sign({ userId }, authConfig.jwtSecret, { expiresIn: authConfig.jwtExpiresIn });
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
      id: uuidv4(),
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
    const decoded = jwt.verify(token, authConfig.jwtSecret) as { userId: string };

    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user to request object with proper typing
    (req as AuthenticatedRequest).user = {
      id: user.id,
      login: user.login,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Type guard to check if a request is authenticated
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return 'user' in req && req.user !== undefined;
}
