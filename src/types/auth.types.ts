import { Request } from 'express';
import { z } from 'zod';
import { loginSchema, registerSchema } from '../validation/auth.schema';

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export interface UserResponse {
  userID: string;
  userLogin: string;
  name: string;
  surname: string;
  email: string;
  country: string;
  configuration: {
    base_language: string;
    learning_languages: string[];
  };
}

export interface AuthenticatedUser {
  id: string;
  login: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
