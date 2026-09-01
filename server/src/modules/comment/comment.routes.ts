import { Router } from 'express';
import { commentController } from './comment.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

import { validate } from '../../middlewares/validate.js';
import { createCommentSchema, replyCommentSchema } from './comment.schema.js';

// Base route logic will be mixed in app.ts
// We'll export a router for submission-nested routes and one for comment-direct routes
export const submissionCommentRoutes = Router({ mergeParams: true });
submissionCommentRoutes.use(authenticate);

// Mark comments as read
submissionCommentRoutes.post('/mark-read', commentController.markCommentsAsRead);

submissionCommentRoutes.post('/', validate(createCommentSchema), commentController.createComment);
submissionCommentRoutes.get('/', commentController.getCommentsBySubmission);

export const commentActionRoutes = Router({ mergeParams: true });
commentActionRoutes.use(authenticate);
commentActionRoutes.post('/:commentId/messages', validate(replyCommentSchema), commentController.addMessage);
commentActionRoutes.patch('/:commentId/resolve', commentController.resolveComment);
