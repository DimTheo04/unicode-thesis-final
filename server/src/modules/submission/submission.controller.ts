import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { AppError, ForbiddenError, NotFoundError } from '../../errors/AppError.js';
import { Role } from '@prisma/client';
import { assertTeacherOfAssignment, assertCanAccessSubmission } from '../../utils/authGuards.js';

interface FileNode {
  name: string;
  isDirectory: boolean;
  path: string;
  children?: FileNode[];
}

// recursively traverse directory to generate file tree node structure for frontend explorer
function generateFileTree(dir: string, baseDir: string = dir): FileNode[] {
  const nodes: FileNode[] = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    // standardize slashes to forward slashes for cross-platorm consistency
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (stat.isDirectory()) {
      nodes.push({
        name: file,
        isDirectory: true,
        path: relPath,
        children: generateFileTree(fullPath, baseDir)
      });
    } else {
      nodes.push({
        name: file,
        isDirectory: false,
        path: relPath
      });
    }
  }
  return nodes;
}

export const submissionController = {
  // handles student zip upload, versioning, extraction, and teacher notification
  async submitAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = req.params.assignmentId as string;
      const studentId = req.user!.userId; 

      // quick check to ensure uploaded file is a valid zip archive
      if (!req.file) {
        throw new AppError('No zip file provided.', 400, 'BAD_REQUEST');
      }
      if (req.file.mimetype !== 'application/zip' && req.file.mimetype !== 'application/x-zip-compressed' && !req.file.originalname.endsWith('.zip')) {
        throw new AppError('Only .zip files are allowed.', 400, 'BAD_REQUEST');
      }

      // Check if assignment exists
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
      });

      if (!assignment) {
        throw new NotFoundError('Assignment not found.');
      }

      // Determine submission version (supports resubmissions: v1, v2, v3...)
      const existingSubmission = await prisma.submission.findFirst({
        where: { assignmentId, studentId },
        orderBy: { version: 'desc' }
      });

      const nextVersion = existingSubmission ? existingSubmission.version + 1 : 1;

      // define target storage path for this specific submission version
      const baseSubmissionsDir = path.join(process.cwd(), 'uploads/submissions', assignmentId, studentId, `v${nextVersion}`);
      const extractedDir = path.join(baseSubmissionsDir, 'extracted');
      const zipPath = path.join(baseSubmissionsDir, 'submission.zip');

      // Create directories
      fs.mkdirSync(extractedDir, { recursive: true });

      // 1. Write original zip file to disk
      fs.writeFileSync(zipPath, req.file.buffer);

      // 2. Validate zip archive contents against Zip Slip (Path Traversal attack)
      const zip = new AdmZip(req.file.buffer);
      const zipEntries = zip.getEntries();
      const normalizedBase = path.resolve(extractedDir) + path.sep;

      for (const entry of zipEntries) {
        const resolvedEntryPath = path.resolve(extractedDir, entry.entryName);
        if (!resolvedEntryPath.startsWith(normalizedBase)) {
          // clean up folder immediately on suspicious archive entry
          fs.rmSync(baseSubmissionsDir, { recursive: true, force: true });
          throw new AppError('Invalid file path detected inside zip archive (Zip Slip Protection).', 400);
        }
      }

      // 3. Safe extraction to folder
      zip.extractAllTo(extractedDir, true);

      // generate directory tree structure for client UI explorer
      const fileTree = generateFileTree(extractedDir);
      
      // Save or update submission in DB
      let submission;
      if (existingSubmission) {
        submission = await prisma.submission.update({
          where: { id: existingSubmission.id },
          data: {
            version: nextVersion,
            fileTreeJson: JSON.stringify(fileTree),
            zipFilePath: `/uploads/submissions/${assignmentId}/${studentId}/v${nextVersion}/submission.zip`,
            status: 'SUBMITTED',
            updatedAt: new Date()
          }
        });
      } else {
        submission = await prisma.submission.create({
          data: {
            assignmentId,
            studentId,
            version: nextVersion,
            fileTreeJson: JSON.stringify(fileTree),
            zipFilePath: `/uploads/submissions/${assignmentId}/${studentId}/v${nextVersion}/submission.zip`,
          }
        });
      }

      // Notify the teachers of the course
      const courseWithTeachers = await prisma.course.findUnique({
        where: { id: assignment.courseId },
        include: { teachers: { select: { id: true } } }
      });
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { fullName: true }
      });

      if (courseWithTeachers && courseWithTeachers.teachers.length > 0) {
        await prisma.notification.createMany({
          data: courseWithTeachers.teachers.map(teacher => ({
            userId: teacher.id,
            type: 'NEW_SUBMISSION',
            title: 'New Code Submission',
            message: `Student ${student?.fullName || 'Student'} submitted code (v${nextVersion}) for "${assignment.title}".`,
            actionData: {
              courseId: assignment.courseId,
              assignmentId: assignment.id,
              submissionId: submission.id,
              type: 'NEW_SUBMISSION'
            }
          }))
        });
      }

      res.status(201).json(submission);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      next(error);
    }
  },

  async getSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = req.params.assignmentId as string;
      const user = req.user!;

      // Authorization Check
      await assertTeacherOfAssignment(user.userId, assignmentId, user.role);

      const submissions = await prisma.submission.findMany({
        where: { assignmentId },
        include: {
          student: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });
      res.json(submissions);
    } catch (error) {
      next(error);
    }
  },
  
  async getMySubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = req.params.assignmentId as string;
      const studentId = req.user!.userId;
      const submission = await prisma.submission.findFirst({
        where: { assignmentId, studentId }
      });
      res.json(submission || null);
    } catch (error) {
      next(error);
    }
  },

  // loads individual source file content for the code review monaco editor
  async getFileContent(req: Request, res: Response, next: NextFunction) {
    try {
      const submissionId = req.params.submissionId as string;
      const { path: filePath } = req.query;
      const user = req.user!;

      if (!filePath || typeof filePath !== 'string') {
        throw new AppError('File path is required', 400, 'BAD_REQUEST');
      }

      // check permissions: both student owner and assigned instructors are authorized
      const submission = await assertCanAccessSubmission(user, submissionId);

      const baseSubmissionsDir = path.join(process.cwd(), 'uploads/submissions', submission.assignmentId, submission.studentId, `v${submission.version}`);
      const extractedDir = path.join(baseSubmissionsDir, 'extracted');

      const absolutePath = path.join(extractedDir, filePath);

      // path traversal security check - make sure target does not escape extracted folder
      if (!absolutePath.startsWith(extractedDir)) {
        throw new ForbiddenError('Forbidden');
      }

      if (!fs.existsSync(absolutePath)) {
        throw new NotFoundError('File not found');
      }

      const stat = fs.statSync(absolutePath);
      if (stat.isDirectory()) {
        throw new AppError('Cannot read a directory', 400, 'BAD_REQUEST');
      }

      // read raw source code as utf8 text
      const content = fs.readFileSync(absolutePath, 'utf8');
      res.json({ content });
    } catch (error) {
      next(error);
    }
  },

  // instructor assigns a grade and optional feedback text to the student
  async gradeSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const submissionId = req.params.submissionId as string;
      const { grade, feedback } = req.body;
      const user = req.user!;

      if (typeof grade !== 'number') {
        throw new AppError('Grade must be a number', 400, 'BAD_REQUEST');
      }

      // verify caller is teacher or admin with access to this assignment
      const submission = await assertCanAccessSubmission(user, submissionId);
      if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
        throw new ForbiddenError('Only instructors can grade submissions.');
      }

      // update submission record with numerical score, comments and status
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          grade,
          feedback,
          status: 'REVIEWED'
        }
      });

      // notify the student so they recieve an in-app alert about their grade
      await prisma.notification.create({
        data: {
          userId: submission.studentId,
          type: 'GRADE_RECEIVED',
          title: 'Assignment Graded',
          message: `Your submission for ${submission.assignment.title} has been graded: ${grade}/100.`,
          actionData: {
            courseId: submission.assignment.courseId,
            assignmentId: submission.assignmentId,
            submissionId: submission.id
          }
        }
      });

      res.json(updatedSubmission);
    } catch (error) {
      next(error);
    }
  },

  async markGradeAsSeen(req: Request, res: Response, next: NextFunction) {
    try {
      const submissionId = req.params.submissionId as string;
      const studentId = req.user!.userId;

      // Verify ownership
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId }
      });
      if (!submission) throw new NotFoundError('Submission not found');
      if (submission.studentId !== studentId) throw new ForbiddenError('Access denied');

      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: { hasSeenGrade: true }
      });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
};
