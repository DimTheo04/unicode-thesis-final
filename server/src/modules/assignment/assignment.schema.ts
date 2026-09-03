import { z } from 'zod';

export const createAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)) && new Date(date) > new Date(), 'Due date must be a valid future date')
  })
});

export const updateAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Due date must be a valid date').optional()
  })
});
