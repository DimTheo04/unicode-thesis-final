import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
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
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z
      .string({ required_error: 'Please enter username or email' })
      .min(1, 'Username or email is required'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .regex(
        /^[\p{L}]+(?:['\s-][\p{L}]+)+$/u,
        'Full name must contain at least a first and last name'
      )
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
  }).refine(data => {
    if (data.newPassword && !data.currentPassword) return false;
    return true;
  }, {
    message: "To change your password, you must provide your current password.",
    path: ["currentPassword"]
  })
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
