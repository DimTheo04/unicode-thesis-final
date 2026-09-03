import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AppError, ConflictError, NotFoundError } from '../../errors/AppError.js';
import { Role } from '@prisma/client';

export const enrollmentController = {
  async requestEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { courseId } = req.body;

      if (!courseId) {
        throw new AppError('Course ID is required', 400);
      }

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { courseId_studentId: { courseId, studentId: user.userId } },
      });

      let enrollment;
      if (existingEnrollment) {
        if (existingEnrollment.status === 'REJECTED') {
          enrollment = await prisma.enrollment.update({
            where: { id: existingEnrollment.id },
            data: { status: 'PENDING' },
            include: { course: { select: { title: true, code: true } } }
          });
        } else {
          throw new ConflictError(`Enrollment already exists with status: ${existingEnrollment.status}`);
        }
      } else {
        enrollment = await prisma.enrollment.create({
          data: {
            courseId,
            studentId: user.userId,
            status: 'PENDING',
          },
          include: {
            course: { select: { title: true, code: true } },
          }
        });
      }

      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  },

  async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      const enrollments = await prisma.enrollment.findMany({
        where: {
          status: 'PENDING',
          course: {
            teachers: {
              some: { id: user.userId }
            }
          }
        },
        include: {
          student: { select: { id: true, fullName: true, username: true } },
          course: { select: { id: true, title: true, code: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const user = req.user!;

      if (status !== 'ACCEPTED' && status !== 'REJECTED') {
        throw new AppError('Invalid status', 400);
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: { id },
        include: { course: { include: { teachers: true } } }
      });

      if (!enrollment) {
        throw new NotFoundError('Enrollment request not found');
      }

      // Check if teacher is assigned to this course
      const isTeacherOfCourse = enrollment.course.teachers.some(t => t.id === user.userId);
      if (!isTeacherOfCourse && user.role !== Role.ADMIN) {
        throw new AppError('Not authorized to update enrollment for this course', 403);
      }

      const updated = await prisma.enrollment.update({
        where: { id },
        data: { status }
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
};
