import { Router } from 'express';
import { fileController } from './file.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/attachment/:attachmentId', fileController.downloadAttachment);
router.get('/submission/:submissionId/zip', fileController.downloadSubmissionZip);

export default router;
