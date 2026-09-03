import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { signupSchema, loginSchema, updateProfileSchema } from './auth.schema.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

export default router;
