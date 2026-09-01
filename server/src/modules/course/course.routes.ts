import { Router } from 'express';
import { courseController } from './course.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requirePermission } from '../../middlewares/rbacMiddleware.js';
import { Permission } from '../../config/roles.js';
import { validate } from '../../middlewares/validate.js';
import { 
  createCourseSchema, 
  updateCourseSchema, 
  assignTeacherSchema, 
  removeTeacherSchema 
} from './course.schema.js';

const router = Router();

// All course endpoints require authentication
router.use(authenticate);

// List available courses (Student only)
router.get('/available', courseController.getAvailableCourses);

// List courses (accessible by anyone, results filtered by role in controller)
router.get('/', courseController.getCourses);

// Create course (Admin only)
router.post('/', 
  requirePermission(Permission.MANAGE_COURSES), 
  validate(createCourseSchema), 
  courseController.createCourse
);

// Update course (Admin only)
router.put('/:id', 
  requirePermission(Permission.MANAGE_COURSES), 
  validate(updateCourseSchema), 
  courseController.updateCourse
);

// Assign teacher (Admin only)
router.post('/:id/teachers', 
  requirePermission(Permission.MANAGE_COURSES), 
  validate(assignTeacherSchema), 
  courseController.assignTeacher
);

// Remove teacher (Admin only)
router.delete('/:id/teachers/:teacherId', 
  requirePermission(Permission.MANAGE_COURSES), 
  validate(removeTeacherSchema), 
  courseController.removeTeacher
);

export default router;
