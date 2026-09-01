import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { Permission } from '../../config/roles.js';
import { validate } from '../../middlewares/validate.js';
import { approveUserSchema, rejectUserSchema } from './admin.schema.js';

const router = Router();

// Protect all admin routes with authentication + MANAGE_USERS permission
router.use(authenticate, requirePermission(Permission.MANAGE_USERS));

router.get('/pending-users', adminController.getPendingUsers);
router.get('/teachers', adminController.getTeachers);
router.patch('/approve/:userId', validate(approveUserSchema), adminController.approveUser);
router.delete('/reject/:userId', validate(rejectUserSchema), adminController.rejectUser);

export default router;
