import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { Role } from '@prisma/client';

export const dashboardController = {
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const now = new Date();

      if (user.role === Role.ADMIN) {
        const totalUsers = await prisma.user.count({ where: { isApproved: true } });
        const pendingUsers = await prisma.user.count({ where: { isApproved: false } });
        const totalStudents = await prisma.user.count({ where: { role: Role.STUDENT, isApproved: true } });
        const totalTeachers = await prisma.user.count({ where: { role: Role.TEACHER, isApproved: true } });
        const totalAdmins = await prisma.user.count({ where: { role: Role.ADMIN, isApproved: true } });

        const totalCourses = await prisma.course.count();
        const totalAssignments = await prisma.assignment.count();
        const totalSubmissions = await prisma.submission.count();

        const pendingUsersList = await prisma.user.findMany({
          where: { isApproved: false },
          select: { id: true, fullName: true, email: true, username: true, role: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        const recentCourses = await prisma.course.findMany({
          include: {
            teachers: { select: { id: true, fullName: true } },
            _count: { select: { enrollments: true, assignments: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        return res.json({
          role: 'ADMIN',
          totalUsers,
          pendingUsers,
          totalStudents,
          totalTeachers,
          totalAdmins,
          totalCourses,
          totalAssignments,
          totalSubmissions,
          pendingUsersList,
          recentCourses
        });
      } 
      
      if (user.role === Role.TEACHER) {
        // Teacher's courses
        const courses = await prisma.course.findMany({
          where: { teachers: { some: { id: user.userId } } },
          include: {
            teachers: { select: { id: true, fullName: true } },
            _count: {
              select: {
                enrollments: { where: { status: 'ACCEPTED' } },
                assignments: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        const courseIds = courses.map(c => c.id);

        // 1. Enrolled Students
        const enrolledStudents = await prisma.enrollment.count({
          where: { courseId: { in: courseIds }, status: 'ACCEPTED' }
        });

        // 2. Pending Enrollments
        const pendingEnrollmentsCount = await prisma.enrollment.count({
          where: { courseId: { in: courseIds }, status: 'PENDING' }
        });

        const pendingEnrollmentsList = await prisma.enrollment.findMany({
          where: { courseId: { in: courseIds }, status: 'PENDING' },
          include: {
            student: { select: { id: true, fullName: true, username: true, email: true } },
            course: { select: { id: true, code: true, title: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        // 3. Assignments & Submissions
        const totalAssignments = await prisma.assignment.count({
          where: { courseId: { in: courseIds } }
        });

        const submissions = await prisma.submission.findMany({
          where: { assignment: { courseId: { in: courseIds } } },
          select: {
            id: true,
            status: true,
            grade: true,
            version: true,
            createdAt: true,
            assignmentId: true,
            assignment: { select: { courseId: true } }
          }
        });

        const totalSubmissions = submissions.length;
        const pendingReviews = submissions.filter(s => s.status === 'SUBMITTED').length;
        const resubmissionRequestedCount = submissions.filter(s => s.status === 'RESUBMISSION_REQUESTED').length;
        const gradedSubmissions = submissions.filter(s => s.grade !== null);
        const gradedCount = gradedSubmissions.length;

        const averageGrade = gradedCount > 0
          ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedCount)
          : null;

        const minGrade = gradedCount > 0 ? Math.min(...gradedSubmissions.map(s => s.grade || 0)) : null;
        const maxGrade = gradedCount > 0 ? Math.max(...gradedSubmissions.map(s => s.grade || 0)) : null;
        const passRate = gradedCount > 0
          ? Math.round((gradedSubmissions.filter(s => (s.grade || 0) >= 50).length / gradedCount) * 100)
          : null;

        const submissionCompletionRate = totalSubmissions > 0
          ? Math.round((gradedCount / totalSubmissions) * 100)
          : 100;

        const avgStudentsPerCourse = courses.length > 0
          ? Math.round((enrolledStudents / courses.length) * 10) / 10
          : 0;

        // Pending reviews detailed queue
        const pendingReviewsList = await prisma.submission.findMany({
          where: {
            assignment: { courseId: { in: courseIds } },
            status: 'SUBMITTED'
          },
          include: {
            student: { select: { id: true, fullName: true, username: true, email: true } },
            assignment: {
              select: {
                id: true,
                title: true,
                courseId: true,
                course: { select: { id: true, code: true, title: true } }
              }
            }
          },
          orderBy: { createdAt: 'asc' }, // oldest pending first
          take: 6
        });

        const oldestPendingDays = pendingReviewsList.length > 0
          ? Math.floor((now.getTime() - new Date(pendingReviewsList[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        const assignmentsWithPendingSet = new Set(pendingReviewsList.map(s => s.assignment.id));
        const assignmentsWithPendingCount = assignmentsWithPendingSet.size;

        // Course Summaries
        const courseSummaries = courses.map(course => {
          const subs = submissions.filter(s => s.assignment.courseId === course.id);
          const graded = subs.filter(s => s.grade !== null);
          const pending = subs.filter(s => s.status === 'SUBMITTED').length;
          const avg = graded.length > 0
            ? Math.round(graded.reduce((acc, cur) => acc + (cur.grade || 0), 0) / graded.length)
            : null;
          return {
            id: course.id,
            code: course.code,
            title: course.title,
            enrolledCount: course._count.enrollments,
            assignmentsCount: course._count.assignments,
            pendingReviewsCount: pending,
            averageGrade: avg,
          };
        });

        // Recent Activity Stream (latest submissions across taught courses)
        const recentSubmissions = await prisma.submission.findMany({
          where: { assignment: { courseId: { in: courseIds } } },
          include: {
            student: { select: { id: true, fullName: true, username: true } },
            assignment: {
              select: {
                id: true,
                title: true,
                courseId: true,
                course: { select: { id: true, code: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 6
        });

        return res.json({
          role: 'TEACHER',
          // 4 Metric Cards Data
          enrolledStudents,
          activeCourses: courses.length,
          pendingEnrollmentsCount,
          avgStudentsPerCourse,

          pendingReviews,
          assignmentsWithPendingCount,
          reviewedSubmissions: gradedCount,
          oldestPendingDays,

          totalSubmissions,
          totalAssignments,
          gradedSubmissions: gradedCount,
          resubmissionRequestedCount,
          submissionCompletionRate,

          averageGrade,
          minGrade,
          maxGrade,
          passRate,
          gradedCount,

          // Dashboard Panels / Widgets
          pendingReviewsList,
          pendingEnrollmentsList,
          courseSummaries,
          recentSubmissions
        });
      } 
      
      if (user.role === Role.STUDENT) {
        // Enrolled courses
        const enrollments = await prisma.enrollment.findMany({
          where: { studentId: user.userId, status: 'ACCEPTED' },
          include: {
            course: {
              include: {
                teachers: { select: { id: true, fullName: true } },
                _count: { select: { assignments: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        const enrolledCourses = enrollments.map(e => e.course);
        const courseIds = enrolledCourses.map(c => c.id);
        const activeCourses = courseIds.length;

        // Pending & Available Courses
        const pendingEnrollmentsCount = await prisma.enrollment.count({
          where: { studentId: user.userId, status: 'PENDING' }
        });

        const totalAllCourses = await prisma.course.count();
        const myAllEnrollmentsCount = await prisma.enrollment.count({
          where: { studentId: user.userId }
        });
        const availableCoursesCount = Math.max(0, totalAllCourses - myAllEnrollmentsCount);

        const totalCourseAssignments = await prisma.assignment.count({
          where: { courseId: { in: courseIds } }
        });

        // Student's submissions
        const submissions = await prisma.submission.findMany({
          where: { studentId: user.userId },
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                courseId: true,
                course: { select: { id: true, code: true, title: true } }
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        const totalSubmissions = submissions.length;
        const gradedSubmissions = submissions.filter(s => s.grade !== null);
        const gradedCount = gradedSubmissions.length;
        const pendingReviewSubmissions = submissions.filter(s => s.status === 'SUBMITTED').length;
        const resubmissionsRequested = submissions.filter(s => s.status === 'RESUBMISSION_REQUESTED').length;

        const averageGrade = gradedCount > 0
          ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedCount)
          : null;

        const minGrade = gradedCount > 0 ? Math.min(...gradedSubmissions.map(s => s.grade || 0)) : null;
        const maxGrade = gradedCount > 0 ? Math.max(...gradedSubmissions.map(s => s.grade || 0)) : null;

        const submissionRate = totalCourseAssignments > 0
          ? Math.round((totalSubmissions / totalCourseAssignments) * 100)
          : 0;

        // Upcoming assignments
        const allEnrolledAssignments = await prisma.assignment.findMany({
          where: { courseId: { in: courseIds } },
          include: {
            course: { select: { id: true, code: true, title: true } },
            submissions: {
              where: { studentId: user.userId },
              select: { id: true, version: true, status: true, grade: true, feedback: true, updatedAt: true }
            }
          },
          orderBy: { dueDate: 'asc' }
        });

        const upcomingAssignments = allEnrolledAssignments.filter(a => new Date(a.dueDate) > now).length;

        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const dueSoonCount = allEnrolledAssignments.filter(a => {
          const due = new Date(a.dueDate);
          return due > now && due <= in48Hours;
        }).length;

        const nextUpcoming = allEnrolledAssignments.find(a => new Date(a.dueDate) > now);
        const nextDeadline = nextUpcoming ? {
          title: nextUpcoming.title,
          courseCode: nextUpcoming.course.code,
          courseId: nextUpcoming.course.id,
          assignmentId: nextUpcoming.id,
          dueDate: nextUpcoming.dueDate.toISOString(),
          daysLeft: Math.max(0, Math.ceil((new Date(nextUpcoming.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        } : null;

        const upcomingDeadlinesList = allEnrolledAssignments
          .slice(0, 10)
          .map(a => {
            const sub = a.submissions[0];
            const due = new Date(a.dueDate);
            const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: a.id,
              title: a.title,
              courseId: a.course.id,
              courseCode: a.course.code,
              courseTitle: a.course.title,
              dueDate: a.dueDate.toISOString(),
              status: (sub ? sub.status : 'NOT_SUBMITTED') as 'NOT_SUBMITTED' | 'SUBMITTED' | 'REVIEWED' | 'RESUBMISSION_REQUESTED',
              submissionId: sub?.id,
              version: sub?.version,
              grade: sub?.grade ?? null,
              feedback: sub?.feedback ?? null,
              daysLeft,
              isOverdue: due < now && !sub,
            };
          });

        const recentGradedList = submissions
          .filter(s => s.status === 'REVIEWED' && s.grade !== null)
          .slice(0, 5)
          .map(s => ({
            submissionId: s.id,
            assignmentId: s.assignment.id,
            assignmentTitle: s.assignment.title,
            courseId: s.assignment.course.id,
            courseCode: s.assignment.course.code,
            courseTitle: s.assignment.course.title,
            grade: s.grade!,
            feedback: s.feedback,
            gradedAt: s.updatedAt.toISOString(),
          }));

        const enrolledCoursesList = enrolledCourses.map(c => {
          const cSubs = submissions.filter(s => s.assignment.course.id === c.id);
          const gradedSubs = cSubs.filter(s => s.grade !== null);
          const avg = gradedSubs.length > 0
            ? Math.round(gradedSubs.reduce((acc, cur) => acc + (cur.grade || 0), 0) / gradedSubs.length)
            : null;
          return {
            id: c.id,
            code: c.code,
            title: c.title,
            teachers: c.teachers,
            assignmentsCount: c._count.assignments,
            submittedCount: cSubs.length,
            averageGrade: avg,
          };
        });

        const recentNotifications = await prisma.notification.findMany({
          where: { userId: user.userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        return res.json({
          role: 'STUDENT',
          // 4 Metric Cards Data
          activeCourses,
          pendingEnrollmentsCount,
          availableCoursesCount,
          totalCourseAssignments,

          upcomingAssignments,
          dueSoonCount,
          nextDeadline,

          totalSubmissions,
          gradedSubmissions: gradedCount,
          pendingReviewSubmissions,
          resubmissionsRequested,
          submissionRate,

          averageGrade,
          minGrade,
          maxGrade,
          gradedCount,

          // Dashboard Panels / Widgets
          upcomingDeadlinesList,
          recentGradedList,
          enrolledCoursesList,
          recentNotifications
        });
      }

      res.json({});
    } catch (error) {
      next(error);
    }
  }
};
