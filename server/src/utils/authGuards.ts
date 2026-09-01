import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ForbiddenError, NotFoundError } from '../errors/AppError.js';
import { JwtPayload } from '../middlewares/authMiddleware.js';

export async function assertTeacherOfCourse(userId: string, courseId: string, userRole?: Role) {
  if (userRole === Role.ADMIN) return true;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { teachers: { select: { id: true } } }
  });

  if (!course) {
    throw new NotFoundError('Course not found.');
  }

  const isTeacher = course.teachers.some(t => t.id === userId);
  if (!isTeacher) {
    throw new ForbiddenError('You do not have instructor permissions for this course.');
  }

  return true;
}

export async function assertTeacherOfAssignment(userId: string, assignmentId: string, userRole?: Role) {
  if (userRole === Role.ADMIN) return true;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { course: { include: { teachers: { select: { id: true } } } } }
  });

  if (!assignment) {
    throw new NotFoundError('Assignment not found.');
  }

  const isTeacher = assignment.course.teachers.some(t => t.id === userId);
  if (!isTeacher) {
    throw new ForbiddenError('You do not have instructor permissions for this assignment.');
  }

  return assignment;
}

export async function assertCanAccessSubmission(user: JwtPayload, submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        include: {
          course: {
            include: { teachers: { select: { id: true } } }
          }
        }
      }
    }
  });

  if (!submission) {
    throw new NotFoundError('Submission not found.');
  }

  if (user.role === Role.ADMIN) return submission;

  if (user.role === Role.STUDENT) {
    if (submission.studentId !== user.userId) {
      throw new ForbiddenError('You can only access your own submissions.');
    }
    return submission;
  }

  if (user.role === Role.TEACHER) {
    const isTeacherOfCourse = submission.assignment.course.teachers.some(t => t.id === user.userId);
    if (!isTeacherOfCourse) {
      throw new ForbiddenError('You do not have permission to access submissions for this course.');
    }
    return submission;
  }

  throw new ForbiddenError('Unauthorized access.');
}
