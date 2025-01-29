import { z } from 'zod';

// Define schemas as constants
const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long');

// Export the schemas
export const loginSchema = z.object({
  login: z.string()
    .min(1, 'Login is required')
    .max(255, 'Login is too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens'),
  
  email: emailSchema,
  
  password: passwordSchema,
  
  login: z.string()
    .min(3, 'Login must be at least 3 characters')
    .max(30, 'Login is too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Login can only contain letters, numbers, underscores, and hyphens'),
  
  surname: z.string()
    .regex(/^[a-zA-Z\s-]*$/, 'Surname can only contain letters, spaces, and hyphens')
    .max(50, 'Surname is too long')
    .optional(),
  
  country: z.string()
    .max(60, 'Country name is too long')
    .optional(),
  
  birthDate: z.string()
    .transform((str) => new Date(str))
    .refine((date) => date <= new Date(), 'Birth date cannot be in the future')
    .optional()
});

// // Type inference
// export type LoginSchema = z.infer<typeof loginSchema>;
// export type RegisterSchema = z.infer<typeof registerSchema>;