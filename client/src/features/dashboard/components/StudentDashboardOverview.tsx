import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StudentDashboardData, UpcomingDeadlineItem } from '../api/dashboardApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderGit2,
  CalendarClock,
  GitPullRequest,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Compass,
  FileCheck2,
  Inbox,
  Eye,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentDashboardOverviewProps {
  data: StudentDashboardData;
}

type FilterType = 'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED';

export const StudentDashboardOverview: React.FC<StudentDashboardOverviewProps> = ({ data }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('ALL');

  const pendingCount = data.upcomingDeadlinesList.filter(
    i => i.status === 'NOT_SUBMITTED' || i.status === 'RESUBMISSION_REQUESTED'
  ).length;
  const submittedCount = data.upcomingDeadlinesList.filter(i => i.status === 'SUBMITTED').length;
  const gradedCount = data.upcomingDeadlinesList.filter(i => i.status === 'REVIEWED').length;

  const filteredList = data.upcomingDeadlinesList.filter(item => {
    if (filter === 'PENDING') {
      return item.status === 'NOT_SUBMITTED' || item.status === 'RESUBMISSION_REQUESTED';
    }
    if (filter === 'SUBMITTED') {
      return item.status === 'SUBMITTED';
    }
    if (filter === 'GRADED') {
      return item.status === 'REVIEWED';
    }
    return true;
  });

  const getStatusBadge = (item: UpcomingDeadlineItem) => {
    switch (item.status) {
      case 'REVIEWED':
        return (
          <Badge variant="success" className="text-[11px] gap-1 shrink-0 font-medium whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" />
            <span>Graded {item.grade !== null ? `(${item.grade}/100)` : ''}</span>
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="info" className="text-[11px] gap-1 shrink-0 font-medium whitespace-nowrap">
            <FileCheck2 className="w-3 h-3" />
            <span>Submitted {item.version ? `(v${item.version})` : ''}</span>
          </Badge>
        );
      case 'RESUBMISSION_REQUESTED':
        return (
          <Badge variant="warning" className="text-[11px] gap-1 shrink-0 font-medium whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" />
            <span>Resubmit</span>
          </Badge>
        );
      default:
        if (item.isOverdue) {
          return (
            <Badge variant="destructive" className="text-[11px] gap-1 shrink-0 font-medium whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>Overdue</span>
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="text-[11px] gap-1 shrink-0 font-medium whitespace-nowrap">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Unified Enterprise KPI Metric Strip */}
      <div className="rounded-lg border border-border bg-card shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
        {/* Metric 1: Enrolled Courses */}
        <div
          onClick={() => navigate('/dashboard/student/enrolled')}
          className="p-4 flex flex-col justify-between hover:bg-secondary/15 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Courses
            </span>
            <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {data.activeCourses}
            </div>
            <div className="text-[11px] text-muted-foreground">Enrolled courses</div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              New: <strong className="text-foreground">{data.availableCoursesCount} available</strong>
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

        {/* Metric 2: Upcoming Deadlines */}
        <div className="p-4 flex flex-col justify-between hover:bg-secondary/15 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming Deadlines
            </span>
            <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {data.upcomingAssignments}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {data.upcomingAssignments > 0 ? 'Open deadlines' : 'No upcoming deadlines'}
            </div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Urgent: <strong className={cn(data.dueSoonCount > 0 ? 'text-destructive font-semibold' : 'text-foreground')}>{data.dueSoonCount > 0 ? `${data.dueSoonCount} (<48h)` : 'None'}</strong>
            </span>
            <span className="text-muted-foreground">
              {data.nextDeadline ? `${data.nextDeadline.courseCode} (${data.nextDeadline.daysLeft}d)` : '—'}
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
            <div className="text-[11px] text-muted-foreground">Completed submissions</div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Graded: <strong className="text-foreground">{data.gradedSubmissions}</strong>
            </span>
            <span className="text-muted-foreground">
              Completion: {data.submissionRate}%
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
              {data.gradedCount > 0 ? `Across ${data.gradedCount} graded assignments` : 'No grades yet'}
            </div>
          </div>
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Range: <strong className="text-foreground">{data.maxGrade ?? '—'} / {data.minGrade ?? '—'}</strong>
            </span>
            <span className="text-muted-foreground">
              {data.gradedCount} graded
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation 2-Column Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left / Main Column (8 cols on lg) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 bg-muted/25 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground">
                  <CalendarClock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Semester Assignments & Deadlines
                  </h3>
                </div>
              </div>

              {/* Clean Inline Segmented Filter Tabs */}
              <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/70 self-start md:self-auto shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                    filter === 'ALL'
                      ? 'bg-background text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All ({data.upcomingDeadlinesList.length})
                </button>

                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('PENDING')}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                      filter === 'PENDING'
                        ? 'bg-background text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Pending ({pendingCount})
                  </button>
                )}

                {submittedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('SUBMITTED')}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                      filter === 'SUBMITTED'
                        ? 'bg-background text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Submitted ({submittedCount})
                  </button>
                )}

                {gradedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('GRADED')}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                      filter === 'GRADED'
                        ? 'bg-background text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Graded ({gradedCount})
                  </button>
                )}
              </div>
            </div>

            {filteredList.length === 0 ? (
              <div className="p-6 text-center space-y-1.5 bg-card">
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-foreground" />
                </div>
                <p className="text-xs font-semibold text-foreground">No assignments in this category</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  All assignments can be viewed under the "All" tab.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredList.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-secondary/15 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    {/* Left: Course Badge + Title + Course Name + Feedback */}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-semibold shrink-0 mt-0.5">
                        {item.courseCode}
                      </Badge>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-semibold text-xs text-foreground leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {item.courseTitle}
                        </div>
                        {item.feedback && (
                          <div className="mt-1 flex items-start gap-1.5 text-[11px] text-muted-foreground bg-secondary/60 dark:bg-secondary/40 px-2.5 py-1 rounded border border-border/60 max-w-md">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="italic line-clamp-2">"{item.feedback}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Deadline + Status + Action */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t border-border/40 md:border-0">
                      {/* Due date */}
                      <div className="text-left md:text-right text-[11px]">
                        <div className="text-foreground font-medium">
                          {new Date(item.dueDate).toLocaleDateString('en-US')}
                        </div>
                        <div
                          className={cn(
                            'text-[10px]',
                            item.daysLeft < 0
                              ? 'text-destructive font-medium'
                              : item.daysLeft <= 2
                              ? 'text-destructive font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          {item.daysLeft < 0
                            ? 'Past due'
                            : item.daysLeft === 0
                            ? 'Today'
                            : `In ${item.daysLeft}d`}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        {getStatusBadge(item)}
                      </div>

                      {/* Action */}
                      <div>
                        {item.status === 'REVIEWED' && item.submissionId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/courses/${item.courseId}/assignments/${item.id}/review/${item.submissionId}`
                              )
                            }
                            className="h-7 px-2.5 text-xs hover:bg-secondary transition-colors gap-1 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Button>
                        ) : item.status === 'SUBMITTED' && item.submissionId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/courses/${item.courseId}/assignments/${item.id}/review/${item.submissionId}`
                              )
                            }
                            className="h-7 px-2.5 text-xs hover:bg-secondary transition-colors gap-1 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Code</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/courses/${item.courseId}/assignments`)}
                            className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors gap-1 shadow-2xs"
                          >
                            <span>Submit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right / Side Column (4 cols on lg) - Unified Grounded Academic Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden divide-y divide-border">
            {/* Section 1: My Courses */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-foreground" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    My Courses
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard/student/enrolled')}
                  className="text-[11px] text-muted-foreground hover:text-foreground h-5 px-1 gap-1"
                >
                  <span>All ({data.enrolledCoursesList.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {data.enrolledCoursesList.length === 0 ? (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  You are not enrolled in any course yet
                </div>
              ) : (
                <div className="space-y-2">
                  {data.enrolledCoursesList.map(course => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/courses/${course.id}/assignments`)}
                      className="p-2.5 rounded-md border border-border/70 hover:border-slate-300 dark:hover:border-slate-700 bg-secondary/15 hover:bg-secondary/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 space-y-0.5 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-semibold shrink-0">
                            {course.code}
                          </Badge>
                          <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {course.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {course.teachers.map(t => t.fullName).join(', ') || 'No instructor assigned'}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <span className="text-[11px] font-medium text-foreground block">
                            {course.submittedCount}/{course.assignmentsCount}
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                            Assignments
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Recent Notifications */}
            {data.recentNotifications && data.recentNotifications.length > 0 && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-foreground" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Recent Activity
                  </h3>
                </div>

                <div className="space-y-2">
                  {data.recentNotifications.map(item => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-md border border-border/60 bg-secondary/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('en-US')}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Quick Action */}
            <div className="p-3 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/student/available')}
                className="w-full text-xs h-8 hover:bg-secondary transition-colors"
              >
                <Compass className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <span>Browse & Enroll in Courses</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
