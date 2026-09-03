import { Router } from 'express';
import { enrollmentController } from './enrollment.controller.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Student routes
router.post('/request', requireRole(Role.STUDENT), enrollmentController.requestEnrollment);

// Teacher routes
router.get('/pending', requireRole(Role.TEACHER, Role.ADMIN), enrollmentController.getPendingRequests);
router.patch('/:id/status', requireRole(Role.TEACHER, Role.ADMIN), enrollmentController.updateStatus);

export default router;
