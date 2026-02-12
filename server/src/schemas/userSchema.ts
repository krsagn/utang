import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});
