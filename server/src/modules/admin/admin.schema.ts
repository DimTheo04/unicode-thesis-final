import { z } from 'zod';
import { Role } from '@prisma/client';

export const approveUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID (UUID)'),
  }),
  body: z.object({
    role: z.enum([Role.STUDENT, Role.TEACHER], {
      required_error: 'Role (STUDENT or TEACHER) is required',
      invalid_type_error: 'Role must be STUDENT or TEACHER',
    }),
  }),
});

export const rejectUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID (UUID)'),
  }),
});

export type ApproveUserInput = z.infer<typeof approveUserSchema>;
