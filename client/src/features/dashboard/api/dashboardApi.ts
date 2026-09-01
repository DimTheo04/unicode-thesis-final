export interface PendingReviewItem {
  id: string;
  version: number;
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  };
  assignment: {
    id: string;
    title: string;
    courseId: string;
    course: {
      id: string;
      code: string;
      title: string;
    };
  };
}

export interface PendingEnrollmentItem {
  id: string;
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  };
  course: {
    id: string;
    code: string;
    title: string;
  };
}

export interface CourseSummaryItem {
  id: string;
  code: string;
  title: string;
  enrolledCount: number;
  assignmentsCount: number;
  pendingReviewsCount: number;
  averageGrade: number | null;
}

export interface RecentSubmissionItem {
  id: string;
  version: number;
  status: string;
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    username: string;
  };
  assignment: {
    id: string;
    title: string;
    courseId: string;
    course: {
      id: string;
      code: string;
    };
  };
}

export interface UpcomingDeadlineItem {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  dueDate: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'REVIEWED' | 'RESUBMISSION_REQUESTED';
  submissionId?: string;
  version?: number;
  grade?: number | null;
  feedback?: string | null;
  daysLeft: number;
  isOverdue: boolean;
}

export interface RecentGradedItem {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  grade: number;
  feedback?: string | null;
  gradedAt: string;
}

export interface EnrolledCourseItem {
  id: string;
  code: string;
  title: string;
  teachers: Array<{ id: string; fullName: string }>;
  assignmentsCount: number;
  submittedCount: number;
  averageGrade: number | null;
}

export interface DashboardNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface TeacherDashboardData {
  role: 'TEACHER';
  enrolledStudents: number;
  activeCourses: number;
  pendingEnrollmentsCount: number;
  avgStudentsPerCourse: number;

  pendingReviews: number;
  assignmentsWithPendingCount: number;
  reviewedSubmissions: number;
  oldestPendingDays: number | null;

  totalSubmissions: number;
  totalAssignments: number;
  gradedSubmissions: number;
  resubmissionRequestedCount: number;
  submissionCompletionRate: number;

  averageGrade: number | null;
  minGrade: number | null;
  maxGrade: number | null;
  passRate: number | null;
  gradedCount: number;

  pendingReviewsList: PendingReviewItem[];
  pendingEnrollmentsList: PendingEnrollmentItem[];
  courseSummaries: CourseSummaryItem[];
  recentSubmissions: RecentSubmissionItem[];
}

export interface StudentDashboardData {
  role: 'STUDENT';
  activeCourses: number;
  pendingEnrollmentsCount: number;
  availableCoursesCount: number;
  totalCourseAssignments: number;

  upcomingAssignments: number;
  dueSoonCount: number;
  nextDeadline: {
    title: string;
    courseCode: string;
    courseId: string;
    assignmentId: string;
    dueDate: string;
    daysLeft: number;
  } | null;

  totalSubmissions: number;
  gradedSubmissions: number;
  pendingReviewSubmissions: number;
  resubmissionsRequested: number;
  submissionRate: number;

  averageGrade: number | null;
  minGrade: number | null;
  maxGrade: number | null;
  gradedCount: number;

  upcomingDeadlinesList: UpcomingDeadlineItem[];
  recentGradedList: RecentGradedItem[];
  enrolledCoursesList: EnrolledCourseItem[];
  recentNotifications: DashboardNotificationItem[];
}

export interface AdminDashboardData {
  role: 'ADMIN';
  totalUsers: number;
  pendingUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  totalAssignments: number;
  totalSubmissions: number;
  pendingUsersList: Array<{
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
  }>;
  recentCourses: Array<{
    id: string;
    code: string;
    title: string;
    teachers: Array<{ id: string; fullName: string }>;
    _count: { enrollments: number; assignments: number };
  }>;
}

export type DashboardAnalyticsResponse = TeacherDashboardData | StudentDashboardData | AdminDashboardData;

export const fetchDashboardAnalytics = async (token: string): Promise<DashboardAnalyticsResponse> => {
  const res = await fetch('/api/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard analytics');
  }

  return res.json();
};

