import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ForbiddenError } from '../../errors/AppError.js';
import { Role, EnrollmentStatus } from '@prisma/client';

export const fileController = {
  // Download Assignment Attachment (PDF, Zip, Specs)
  async downloadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const attachmentId = req.params.attachmentId as string;
      const user = req.user!;

      const attachment = await prisma.assignmentAttachment.findUnique({
        where: { id: attachmentId },
        include: {
          assignment: {
            include: {
              course: {
                include: {
                  teachers: { select: { id: true } },
                  enrollments: { where: { studentId: user.userId, status: EnrollmentStatus.ACCEPTED } }
                }
              }
            }
          }
        }
      });

      if (!attachment) {
        throw new NotFoundError('Attachment not found.');
      }

      // Authorization Check: Admin, Teacher of the Course, or Enrolled Student
      const isTeacher = attachment.assignment.course.teachers.some(t => t.id === user.userId);
      const isEnrolled = attachment.assignment.course.enrollments.length > 0;
      const isAdmin = user.role === Role.ADMIN;

      if (!isAdmin && !isTeacher && !isEnrolled) {
        throw new ForbiddenError('You are not authorized to download this file.');
      }

      const relativePath = attachment.fileUrl.startsWith('/') ? attachment.fileUrl.substring(1) : attachment.fileUrl;
      const absoluteFilePath = path.join(process.cwd(), relativePath);

      if (!fs.existsSync(absoluteFilePath)) {
        throw new NotFoundError('File does not exist on server storage.');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.fileName)}"`);
      return res.download(absoluteFilePath, attachment.fileName);
    } catch (error) {
      next(error);
    }
  },

  // Download Student Submission Original ZIP
  async downloadSubmissionZip(req: Request, res: Response, next: NextFunction) {
    try {
      const submissionId = req.params.submissionId as string;
      const user = req.user!;

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              course: {
                include: { teachers: { select: { id: true } } }
              }
            }
          },
          student: { select: { fullName: true, username: true } }
        }
      });

      if (!submission || !submission.zipFilePath) {
        throw new NotFoundError('Submission archive not found.');
      }

      const isOwner = submission.studentId === user.userId;
      const isTeacher = submission.assignment.course.teachers.some(t => t.id === user.userId);
      const isAdmin = user.role === Role.ADMIN;

      if (!isAdmin && !isOwner && !isTeacher) {
        throw new ForbiddenError('You are not authorized to download this submission.');
      }

      const relativePath = submission.zipFilePath.startsWith('/') ? submission.zipFilePath.substring(1) : submission.zipFilePath;
      const absoluteFilePath = path.join(process.cwd(), relativePath);

      if (!fs.existsSync(absoluteFilePath)) {
        throw new NotFoundError('File does not exist on storage.');
      }

      const downloadName = `${submission.student.username}_v${submission.version}_submission.zip`;
      return res.download(absoluteFilePath, downloadName);
    } catch (error) {
      next(error);
    }
  }
};
