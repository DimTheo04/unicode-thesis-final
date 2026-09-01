import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Get dashboard analytics based on user role
router.get('/', dashboardController.getAnalytics);

export default router;
