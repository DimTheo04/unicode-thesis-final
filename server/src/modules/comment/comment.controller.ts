import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { Role } from '@prisma/client';
import { assertCanAccessSubmission } from '../../utils/authGuards.js';
import { AppError, NotFoundError, ForbiddenError } from '../../errors/AppError.js';

export const commentController = {
  // Create a new inline comment (thread)
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const filePath = req.body.filePath as string;
      const startLine = req.body.startLine as number;
      const endLine = req.body.endLine as number;
      const content = req.body.content as string;
      const submissionId = req.params.submissionId as string;
      const user = req.user!;
      const authorId = user.userId;

      if (!filePath || !startLine || !endLine || !content) {
        throw new AppError('Missing required fields', 400, 'BAD_REQUEST');
      }

      // Assert user can access this submission (Teacher of Course, Student Owner, or Admin)
      const submission = await assertCanAccessSubmission(user, submissionId);
      const version = req.body.version ? Number(req.body.version) : (submission.version || 1);

      const comment = await prisma.inlineComment.create({
        data: {
          submissionId,
          version,
          filePath,
          startLine: Number(startLine),
          endLine: Number(endLine),
          content,
          authorId
        },
        include: {
          author: {
            select: { id: true, fullName: true, role: true }
          },
          threadMessages: true
        }
      });

      if (authorId !== submission.studentId) {
        // Teacher commented on Student's submission
        await prisma.notification.create({
          data: {
            userId: submission.studentId,
            type: 'NEW_COMMENT',
            title: 'New Code Comment',
            message: `${comment.author.fullName} commented on your code in ${submission.assignment.title}.`,
            actionData: {
              courseId: submission.assignment.courseId,
              assignmentId: submission.assignmentId,
              submissionId: submission.id,
              commentId: comment.id
            }
          }
        });
      }

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  },

  // Get comments for a submission
  async getCommentsBySubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const submissionId = req.params.submissionId as string;
      const { filePath, version } = req.query;
      const user = req.user!;

      await assertCanAccessSubmission(user, submissionId);

      const whereClause: any = { submissionId };
      if (filePath && typeof filePath === 'string') {
        whereClause.filePath = filePath;
      }
      if (version && !isNaN(Number(version))) {
        whereClause.version = Number(version);
      }

      const comments = await prisma.inlineComment.findMany({
        where: whereClause,
        include: {
          author: {
            select: { id: true, fullName: true, role: true }
          },
          threadMessages: {
            include: {
              author: {
                select: { id: true, fullName: true, role: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          readStates: {
            where: { userId: user.userId },
            select: { lastReadAt: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json(comments);
    } catch (error) {
      next(error);
    }
  },

  // Add a reply to a thread
  async addMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = req.params.commentId as string;
      const { content } = req.body;
      const user = req.user!;
      const authorId = user.userId;

      if (!content) {
        throw new AppError('Message content is required', 400, 'BAD_REQUEST');
      }

      // Check if comment exists
      const comment = await prisma.inlineComment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        throw new NotFoundError('Comment thread not found');
      }

      const submission = await assertCanAccessSubmission(user, comment.submissionId);

      const message = await prisma.threadMessage.create({
        data: {
          commentId,
          content,
          authorId
        },
        include: {
          author: {
            select: { id: true, fullName: true, role: true }
          }
        }
      });

      let recipientId = null;
      if (authorId === submission.studentId) {
        // Student replied -> notify Teacher (thread creator)
        recipientId = comment.authorId;
      } else {
        // Teacher replied -> notify Student
        recipientId = submission.studentId;
      }

      // Don't notify yourself
      if (recipientId && recipientId !== authorId) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: 'NEW_REPLY',
            title: 'New Reply',
            message: `${message.author.fullName} replied to a thread in ${submission.assignment.title}.`,
            actionData: {
              courseId: submission.assignment.courseId,
              assignmentId: submission.assignmentId,
              submissionId: submission.id,
              commentId: commentId
            }
          }
        });
      }

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },

  // Toggle resolve status
  async resolveComment(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = req.params.commentId as string;
      const { isResolved } = req.body;
      const user = req.user!;

      const comment = await prisma.inlineComment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        throw new NotFoundError('Comment thread not found');
      }

      await assertCanAccessSubmission(user, comment.submissionId);

      if (user.role === Role.STUDENT) {
        throw new ForbiddenError('Students cannot resolve threads');
      }

      const updatedComment = await prisma.inlineComment.update({
        where: { id: commentId },
        data: { isResolved: Boolean(isResolved) },
        include: {
          author: { select: { id: true, fullName: true, role: true } },
          threadMessages: {
            include: { author: { select: { id: true, fullName: true, role: true } } },
            orderBy: { createdAt: 'asc' }
          },
          readStates: {
            where: { userId: user.userId },
            select: { lastReadAt: true }
          }
        }
      });

      res.json(updatedComment);
    } catch (error) {
      next(error);
    }
  },

  // Mark comments as read
  async markCommentsAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentIds } = req.body;
      const user = req.user!;
      const userId = user.userId;

      if (!Array.isArray(commentIds) || commentIds.length === 0) {
        return res.json({ success: true });
      }

      const upsertOperations = commentIds.map(commentId => 
        prisma.commentReadState.upsert({
          where: {
            userId_commentId: {
              userId,
              commentId
            }
          },
          update: {
            lastReadAt: new Date()
          },
          create: {
            userId,
            commentId
          }
        })
      );

      await prisma.$transaction(upsertOperations);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
