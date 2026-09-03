import { z } from 'zod';

export const createCourseSchema = z.object({
  body: z.object({
    code: z.string().min(2, 'Course code must be at least 2 characters').regex(/^\S+$/, 'Course code cannot contain spaces'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().optional()
  })
});

export const updateCourseSchema = z.object({
  body: z.object({
    code: z.string().min(2, 'Course code must be at least 2 characters').regex(/^\S+$/, 'Course code cannot contain spaces').optional(),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').optional(),
    description: z.string().optional()
  })
});

export const assignTeacherSchema = z.object({
  body: z.object({
    teacherId: z.string().uuid('Invalid teacher ID')
  })
});

export const removeTeacherSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
    teacherId: z.string().uuid('Invalid teacher ID')
  })
});
