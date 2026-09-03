import { Router } from 'express';
import { submissionController } from './submission.controller.js';
import { authenticate, requireRole } from '../../middlewares/authMiddleware.js';
import { validate } from '../../middlewares/validate.js';
import { gradeSubmissionSchema } from './submission.schema.js';
import { Role } from '@prisma/client';
import multer from 'multer';

// Use memory storage so we can handle the zip directly in the controller
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const router = Router({ mergeParams: true }); // Merge params to get assignmentId

router.use(authenticate);

// Student submits an assignment
router.post('/',
  requireRole(Role.STUDENT),
  upload.single('file'),
  submissionController.submitAssignment
);

// Get my submission (for a student)
router.get('/me',
  requireRole(Role.STUDENT),
  submissionController.getMySubmission
);

// Get all submissions for an assignment (Teacher/Admin)
router.get('/',
  requireRole(Role.TEACHER, Role.ADMIN),
  submissionController.getSubmissions
);

// Get file content (Teacher/Admin/Student)
router.get('/:submissionId/files',
  requireRole(Role.STUDENT, Role.TEACHER, Role.ADMIN),
  submissionController.getFileContent
);

// Grade a submission (Teacher/Admin)
router.patch('/:submissionId/grade',
  requireRole(Role.TEACHER, Role.ADMIN),
  validate(gradeSubmissionSchema),
  submissionController.gradeSubmission
);


// Mark grade as seen (Student only)
router.patch('/:submissionId/seen-grade',
  requireRole(Role.STUDENT),
  submissionController.markGradeAsSeen
);

export default router;
