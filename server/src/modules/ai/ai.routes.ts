import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { aiLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

// Apply auth middleware and AI rate limiter
router.post('/analyze', authenticate, aiLimiter, aiController.analyzeCode);

export default router;
