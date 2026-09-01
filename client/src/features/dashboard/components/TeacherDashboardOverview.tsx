import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TeacherDashboardData } from '../api/dashboardApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users2,
  Hourglass,
  GitPullRequest,
  Award,
  ArrowRight,
  Code2,
  Check,
  X,
  Inbox,
  Library,
  CheckCheck,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { updateEnrollmentStatus } from '../../courses/api/enrollmentApi';
import { useAuth } from '../../../contexts/AuthContext';
import { cn } from '@/lib/utils';

interface TeacherDashboardOverviewProps {
  data: TeacherDashboardData;
  onRefresh?: () => void;
}

export const TeacherDashboardOverview: React.FC<TeacherDashboardOverviewProps> = ({
  data,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleEnrollmentAction = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!token) return;
    try {
      setActionInProgress(id);
      await updateEnrollmentStatus(token, id, status);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update enrollment status:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* 1. Unified Enterprise KPI Metric Strip */}
      <div className="rounded-lg border border-border bg-card shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
        {/* Metric 1: Enrolled Students */}
        <div
          onClick={() => navigate('/dashboard/teacher/courses')}
          className="p-4 flex flex-col justify-between hover:bg-secondary/15 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Enrolled Students
            </span>
            <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Users2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {data.enrolledStudents}
            </div>
            <div className="text-[11px] text-muted-foreground">Across all your courses</div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Courses: <strong className="text-foreground">{data.activeCourses}</strong>
            </span>
            <span
              className={cn(
                data.pendingEnrollmentsCount > 0
                  ? 'text-destructive font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {data.pendingEnrollmentsCount > 0
                ? `${data.pendingEnrollmentsCount} pending`
                : '0 requests'}
            </span>
          </div>
        </div>

        {/* Metric 2: Pending Reviews */}
        <div className="p-4 flex flex-col justify-between hover:bg-secondary/15 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Reviews
            </span>
            <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground">
              <Hourglass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {data.pendingReviews}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {data.pendingReviews > 0 ? 'Awaiting grading' : 'All caught up'}
            </div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Assignments: <strong className="text-foreground">{data.assignmentsWithPendingCount}</strong>
            </span>
            <span
              className={cn(
                (data.oldestPendingDays || 0) >= 3
                  ? 'text-destructive font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {data.oldestPendingDays !== null ? `Oldest: ${data.oldestPendingDays}d` : '—'}
            </span>
          </div>
        </div>

        {/* Metric 3: Submissions */}
        <div className="p-4 flex flex-col justify-between hover:bg-secondary/15 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Submissions
            </span>
            <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground">
              <GitPullRequest className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {data.totalSubmissions}
            </div>
            <div className="text-[11px] text-muted-foreground">Total submissions received</div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Graded: <strong className="text-foreground">{data.gradedSubmissions} ({data.submissionCompletionRate}%)</strong>
            </span>
            <span className="text-muted-foreground">
              {data.pendingReviews} to review
            </span>
          </div>
        </div>

        {/* Metric 4: Average Grade */}
        <div className="p-4 flex flex-col justify-between hover:bg-secondary/15 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Average Grade
            </span>
            <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {data.averageGrade !== null ? `${data.averageGrade}/100` : '—'}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {data.gradedCount > 0 ? `Across ${data.gradedCount} graded papers` : 'No grades yet'}
            </div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Range: <strong className="text-foreground">{data.maxGrade ?? '—'} / {data.minGrade ?? '—'}</strong>
            </span>
            <span className="text-muted-foreground">
              Pass rate: {data.passRate !== null ? `${data.passRate}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation 2-Column Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left / Main Column (8 cols on lg) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Section A: Grading Action Center */}
          <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/25 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-foreground" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Review Queue (Pending Reviews)
                  </h3>
                </div>
              </div>

              {data.pendingReviewsList.length > 0 && (
                <Badge variant="warning" className="text-xs py-0.5 px-2 font-medium">
                  {data.pendingReviewsList.length} {data.pendingReviewsList.length === 1 ? 'Pending' : 'Pending'}
                </Badge>
              )}
            </div>

            {data.pendingReviewsList.length === 0 ? (
              <div className="p-6 text-center flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <CheckCheck className="w-4 h-4 text-foreground" />
                <span>All submissions have been reviewed! No pending reviews in your queue.</span>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {data.pendingReviewsList.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-secondary/15 transition-colors flex items-center justify-between gap-3"
                  >
                    {/* Left: Student Avatar + Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-foreground shrink-0 shadow-2xs">
                        {getInitials(item.student.fullName)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {item.student.fullName}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                            @{item.student.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-semibold shrink-0">
                            {item.assignment.course.code}
                          </Badge>
                          <span className="text-foreground font-medium truncate">
                            {item.assignment.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            (v{item.version})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Date & Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {new Date(item.createdAt).toLocaleDateString('en-US')}
                      </span>

                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/courses/${item.assignment.courseId}/assignments/${item.assignment.id}/review/${item.id}`
                          )
                        }
                        className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors gap-1.5 shadow-2xs"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Course Summaries Directory */}
          <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/25 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Library className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Teaching Courses
                </h3>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/teacher/courses')}
                className="text-xs text-muted-foreground hover:text-foreground h-6 px-2 gap-1"
              >
                <span>All courses ({data.courseSummaries.length})</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            {data.courseSummaries.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                You have not been assigned to any course yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {data.courseSummaries.map(course => (
                  <div
                    key={course.id}
                    className="p-3.5 hover:bg-secondary/15 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Course Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-semibold shrink-0">
                          {course.code}
                        </Badge>
                        <span className="font-semibold text-xs text-foreground truncate">
                          {course.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5 flex-wrap">
                        <span>
                          Students: <strong className="font-medium text-foreground">{course.enrolledCount}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Assignments: <strong className="font-medium text-foreground">{course.assignmentsCount}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Avg:{' '}
                          <strong className="font-medium text-foreground">
                            {course.averageGrade !== null ? `${course.averageGrade}/100` : '—'}
                          </strong>
                        </span>
                        {course.pendingReviewsCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-destructive font-semibold">
                              {course.pendingReviewsCount} pending
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/courses/${course.id}/assignments`)}
                      className="h-7 px-2.5 text-xs hover:bg-secondary transition-colors gap-1 self-start sm:self-auto shrink-0"
                    >
                      <span>Assignments</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right / Side Column (4 cols on lg) - Unified Grounded Operations Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden divide-y divide-border">
            {/* Section 1: Pending Enrollment Requests */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-foreground" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Enrollment Requests
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard/teacher/requests')}
                  className="text-[11px] text-muted-foreground hover:text-foreground h-5 px-1 gap-1"
                >
                  <span>All ({data.pendingEnrollmentsCount})</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {data.pendingEnrollmentsList.length === 0 ? (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  No pending enrollment requests
                </div>
              ) : (
                <div className="space-y-2">
                  {data.pendingEnrollmentsList.map(req => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-md border border-border/70 bg-secondary/20 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {req.student.fullName}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            @{req.student.username}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] py-0 px-1 shrink-0">
                          {req.course.code}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionInProgress === req.id}
                          onClick={() => handleEnrollmentAction(req.id, 'ACCEPTED')}
                          className="h-6 px-2 text-[11px] hover:bg-secondary transition-colors"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionInProgress === req.id}
                          onClick={() => handleEnrollmentAction(req.id, 'REJECTED')}
                          className="h-6 px-1.5 text-[11px] text-muted-foreground hover:bg-secondary transition-colors"
                          title="Reject"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Recent Submissions Feed */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-foreground" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Recent Submissions
                </h3>
              </div>

              {data.recentSubmissions && data.recentSubmissions.length > 0 ? (
                <div className="space-y-2">
                  {data.recentSubmissions.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      onClick={() =>
                        navigate(
                          `/courses/${item.assignment.courseId}/assignments/${item.assignment.id}/submissions`
                        )
                      }
                      className="p-2 rounded-md border border-border/60 bg-secondary/10 hover:bg-secondary/25 transition-colors cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {item.student.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          v{item.version}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate">
                          {item.assignment.course.code} • {item.assignment.title}
                        </span>
                        <span className="text-[9px] shrink-0">
                          {new Date(item.createdAt).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  No recent submissions
                </div>
              )}
            </div>

            {/* Section 3: Quick Operations Link */}
            <div className="p-3 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/teacher/courses')}
                className="w-full text-xs h-8 hover:bg-secondary transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <span>Manage All Courses</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
