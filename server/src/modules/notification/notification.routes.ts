import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/read-by-comments', notificationController.markByComments);
router.patch('/:notificationId/read', notificationController.markAsRead);

export default router;
