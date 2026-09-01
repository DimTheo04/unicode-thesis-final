import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AppError, NotFoundError } from '../../errors/AppError.js';
import { Role } from '@prisma/client';

export const assignmentController = {

  async updateAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = req.params.courseId as string;
      const assignmentId = req.params.assignmentId as string;
      const { title, description, dueDate } = req.body;
      const user = req.user!;

      // Check if user is a teacher of this course or admin
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { teachers: true }
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      if (user.role !== Role.ADMIN && !course.teachers.some(t => t.id === user.userId)) {
        throw new AppError('Not authorized to update assignments for this course', 403);
      }

      const existingAssignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
      });

      if (!existingAssignment) {
        throw new NotFoundError('Assignment not found');
      }

      if (existingAssignment.courseId !== courseId) {
        throw new AppError('Assignment does not belong to this course.', 400);
      }

      const files = req.files as Express.Multer.File[] || [];
      const attachmentsData = files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/assignments/${file.filename}`,
        fileType: file.mimetype
      }));

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (attachmentsData.length > 0) {
        updateData.attachments = {
          create: attachmentsData
        };
      }

      const updatedAssignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: updateData,
        include: {
          attachments: true
        }
      });

      res.status(200).json(updatedAssignment);
    } catch (error) {
      next(error);
    }
  },

  async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = req.params.courseId as string;
      const { title, description, dueDate } = req.body;
      const user = req.user!;

      // Check if user is a teacher of this course or admin
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { teachers: true }
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      if (user.role !== Role.ADMIN && !course.teachers.some(t => t.id === user.userId)) {
        throw new AppError('Not authorized to create assignments for this course', 403);
      }

      if (!title || !description || !dueDate) {
        throw new AppError('Title, description and due date are required', 400);
      }

      // Handle file attachments from multer
      const files = req.files as Express.Multer.File[] || [];
      const attachmentsData = files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/assignments/${file.filename}`,
        fileType: file.mimetype
      }));

      const assignment = await prisma.assignment.create({
        data: {
          title,
          description,
          dueDate: new Date(dueDate),
          courseId,
          attachments: {
            create: attachmentsData
          }
        },
        include: {
          attachments: true
        }
      });

      // Notify all enrolled students
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId, status: 'ACCEPTED' },
        select: { studentId: true }
      });

      if (enrollments.length > 0) {
        await prisma.notification.createMany({
          data: enrollments.map(e => ({
            userId: e.studentId,
            type: 'NEW_ASSIGNMENT',
            title: 'New Assignment',
            message: `A new assignment "${assignment.title}" was published in "${course.title}".`,
            actionData: {
              courseId: course.id,
              assignmentId: assignment.id,
              type: 'NEW_ASSIGNMENT'
            }
          }))
        });
      }

      res.status(201).json(assignment);
    } catch (error) {
      next(error);
    }
  },

  async getCourseAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = req.params.courseId as string;
      
      const assignments = await prisma.assignment.findMany({
        where: { courseId },
        include: {
          attachments: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(assignments);
    } catch (error) {
      next(error);
    }
  }
};
