import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../errors/AppError.js';

export const notificationController = {
  // Get all notifications for current user
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50
      });

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  },

  // Mark a notification as read
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationId = req.params.notificationId as string;
      const userId = (req as any).user.userId || (req as any).user.id;

      // Verify ownership
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
      });

      if (!notification || notification.userId !== userId) {
        throw new NotFoundError('Notification not found');
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  // Mark all as read
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  // Mark all notifications for specific comments as read
  async markByComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentIds } = req.body;
      const userId = (req as any).user.userId || (req as any).user.id;
      
      if (!Array.isArray(commentIds) || commentIds.length === 0) {
        return res.json({ success: true });
      }

      const unread = await prisma.notification.findMany({
        where: { userId, isRead: false }
      });

      const toUpdate: string[] = [];

      for (const notif of unread) {
        try {
          const data = (typeof notif.actionData === 'string' ? JSON.parse(notif.actionData) : notif.actionData) as Record<string, any> | null;
          if (data && data.commentId && commentIds.includes(data.commentId)) {
            toUpdate.push(notif.id);
          }
        } catch {
          // ignore parsing error if string was malformed
        }
      }

      if (toUpdate.length > 0) {
        await prisma.notification.updateMany({
          where: { id: { in: toUpdate } },
          data: { isRead: true }
        });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
