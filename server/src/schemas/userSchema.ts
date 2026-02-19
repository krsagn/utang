import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric only'),
  firstName: z.string().min(1, 'Name is required'),
  lastName: z.string().min(1, 'Name is required'),
});

export const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});
