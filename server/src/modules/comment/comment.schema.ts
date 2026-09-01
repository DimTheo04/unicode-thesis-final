import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    filePath: z.string().min(1),
    startLine: z.number().positive(),
    endLine: z.number().positive(),
    content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long')
  })
});

export const replyCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Reply cannot be empty').max(1000, 'Reply is too long')
  })
});
