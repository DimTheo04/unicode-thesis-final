import { z } from 'zod';

export const gradeSubmissionSchema = z.object({
  body: z.object({
    grade: z.number().min(0, 'Grade must be at least 0').max(100, 'Grade cannot exceed 100'),
    feedback: z.string().max(1000, 'Feedback cannot exceed 1000 characters').optional().default('')
  })
});
