import { Router } from 'express';
import { assignmentController } from './assignment.controller.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import { validate } from '../../middlewares/validate.js';
import { createAssignmentSchema, updateAssignmentSchema } from './assignment.schema.js';
import { Role } from '@prisma/client';
import multer from 'multer';
import path from 'path';

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const router = Router({ mergeParams: true }); // Merge params to get courseId from parent router

router.use(authenticate);

// List assignments for a course
router.get('/', assignmentController.getCourseAssignments);

// Create an assignment (Teachers and Admins only)
// Expects multipart/form-data with a 'files' field for attachments
router.post('/', 
  requireRole(Role.TEACHER, Role.ADMIN), 
  upload.array('files', 5), // allow up to 5 files
  validate(createAssignmentSchema),
  assignmentController.createAssignment
);


// Update an assignment
router.put('/:assignmentId',
  requireRole(Role.TEACHER, Role.ADMIN),
  upload.array('files', 5),
  validate(updateAssignmentSchema),
  assignmentController.updateAssignment
);

export default router;
