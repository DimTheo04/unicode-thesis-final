import { z } from 'zod';

export const signupFormSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(3, 'Full name must be at least 3 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .regex(
        /^[\p{L}]+(?:['\s-][\p{L}]+)+$/u,
        'Full name must contain at least a first and last name'
      ),
    username: z
      .string({ required_error: 'Username is required' })
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please enter a valid email address'),
    dateOfBirth: z
      .string({ required_error: 'Date of birth is required' })
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid date of birth'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginFormSchema = z.object({
  identifier: z
    .string({ required_error: 'Please enter username or email' })
    .min(1, 'Username or email is required'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
