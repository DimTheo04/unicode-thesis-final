import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AppError, ConflictError } from '../../errors/AppError.js';
import { Role } from '@prisma/client';

export const courseController = {
  // retrieve list of courses based on current user's role and enrollment status
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      let courses;
      if (user.role === Role.ADMIN) {
        // admin sees all courses across the system with teacher list and enrollment count
        courses = await prisma.course.findMany({
          include: {
            teachers: {
              select: { id: true, fullName: true, username: true, email: true },
            },
            _count: {
              select: { enrollments: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else if (user.role === Role.TEACHER) {
        // instructors only see courses they have been assigned to
        courses = await prisma.course.findMany({
          where: {
            teachers: {
              some: { id: user.userId },
            },
          },
          include: {
            teachers: {
              select: { id: true, fullName: true, username: true, email: true },
            },
            _count: {
              select: { enrollments: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        // students only see approved courses they are actively participating in
        courses = await prisma.course.findMany({
          where: {
            enrollments: {
              some: { studentId: user.userId, status: 'ACCEPTED' },
            },
          },
          include: {
            teachers: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }
      
      res.json(courses);
    } catch (error) {
      next(error);
    }
  },

  // browse catalog for students to request enrollment
  async getAvailableCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      // fetch all courses and check if this student has an existing request
      const courses = await prisma.course.findMany({
        include: {
          teachers: {
            select: { id: true, fullName: true },
          },
          enrollments: {
            where: { studentId: user.userId },
            select: { status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // flatten enrollment status so frontend can display badge easily
      const formattedCourses = courses.map(course => ({
        ...course,
        enrollmentStatus: course.enrollments.length > 0 ? course.enrollments[0].status : null,
      }));
      
      res.json(formattedCourses);
    } catch (error) {
      next(error);
    }
  },

  // create a new course (admin only)
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, title, description } = req.body;
      
      // check if course code is allready taken
      const existingCourse = await prisma.course.findUnique({ where: { code } });
      if (existingCourse) {
        throw new ConflictError('Course with this code already exists');
      }
      
      const course = await prisma.course.create({
        data: {
          code,
          title,
          description,
        },
        include: {
          teachers: true,
          _count: {
            select: { enrollments: true },
          },
        },
      });
      
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  },

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { code, title, description } = req.body;
      
      if (code) {
        const existingCourse = await prisma.course.findFirst({
          where: { code, id: { not: id } },
        });
        if (existingCourse) {
          throw new ConflictError('Course with this code already exists');
        }
      }
      
      const course = await prisma.course.update({
        where: { id },
        data: { code, title, description },
        include: {
          teachers: {
            select: { id: true, fullName: true, username: true, email: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });
      
      res.json(course);
    } catch (error) {
      next(error);
    }
  },

  async assignTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const teacherId = req.body.teacherId as string;
      
      const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
      if (!teacher || teacher.role !== Role.TEACHER) {
        throw new AppError('User is not a valid teacher', 400);
      }
      
      const course = await prisma.course.update({
        where: { id },
        data: {
          teachers: {
            connect: { id: teacherId },
          },
        },
        include: {
          teachers: {
            select: { id: true, fullName: true, username: true, email: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });
      
      res.json(course);
    } catch (error) {
      next(error);
    }
  },

  async removeTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const teacherId = req.params.teacherId as string;
      
      const course = await prisma.course.update({
        where: { id },
        data: {
          teachers: {
            disconnect: { id: teacherId },
          },
        },
        include: {
          teachers: {
            select: { id: true, fullName: true, username: true, email: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });
      
      res.json(course);
    } catch (error) {
      next(error);
    }
  },
};
