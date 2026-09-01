import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Library, CheckCheck, Hourglass, XCircle, UserCheck2, AlertCircle, SendHorizontal } from 'lucide-react';
import { requestEnrollment } from '../api/enrollmentApi';
import type { Course } from '../api/courseApi';
import { fetchAvailableCourses as apiFetchAvailableCourses } from '../api/courseApi';
import { useAuth } from '../../../contexts/AuthContext';

export const AvailableCourses: React.FC = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<(Course & { enrollmentStatus: string | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await apiFetchAvailableCourses(token);
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleRequestEnrollment = async (courseId: string) => {
    try {
      setCourseError(null);
      await requestEnrollment(token, courseId);
      loadData();
    } catch (err: any) {
      setCourseError(err.message || 'Failed to request enrollment');
    }
  };

  return (
    <div className="space-y-4">
      {courseError && (
        <div className="p-3 bg-destructive/10 text-destructive text-xs font-medium rounded-lg border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{courseError}</span>
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          Available Courses for Enrollment
        </h3>
        <p className="text-xs text-muted-foreground">
          Submit enrollment requests for courses you are attending
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map(i => (
            <Card key={i} className="h-44 bg-secondary/50 border-border" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center border-border bg-card">
          <Library className="w-8 h-8 text-foreground mx-auto mb-3 opacity-40" />
          <CardTitle className="text-sm font-semibold text-foreground">No Available Courses</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">All courses have either been enrolled in or are not open for registration.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <Card key={course.id} className="border-border flex flex-col justify-between hover:border-border/90 hover:shadow-sm transition-all shadow-xs bg-card">
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="default" className="text-[10px] font-semibold tracking-wider">
                      {course.code}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <UserCheck2 className="w-3.5 h-3.5 text-foreground" />
                      <span>{course.teachers.map(t => t.fullName).join(', ') || 'No instructor'}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground leading-tight">{course.title}</h4>
                  {course.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-border/80">
                  {!course.enrollmentStatus && (
                    <Button 
                      className="w-full text-xs font-medium"
                      onClick={() => handleRequestEnrollment(course.id)}
                    >
                      <SendHorizontal className="w-3.5 h-3.5 mr-1.5" />
                      <span>Request Enrollment</span>
                    </Button>
                  )}
                  {course.enrollmentStatus === 'PENDING' && (
                    <div className="flex items-center justify-center gap-2 border border-border bg-secondary/50 text-foreground p-2 rounded-md text-xs font-medium">
                      <Hourglass className="w-3.5 h-3.5" />
                      <span>Pending Instructor Approval</span>
                    </div>
                  )}
                  {course.enrollmentStatus === 'ACCEPTED' && (
                    <div className="flex items-center justify-center gap-2 border border-border bg-secondary/50 text-foreground p-2 rounded-md text-xs font-medium">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Enrolled</span>
                    </div>
                  )}
                  {course.enrollmentStatus === 'REJECTED' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 border border-border bg-secondary/50 text-foreground p-2 rounded-md text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Request Rejected</span>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full text-xs font-medium"
                        onClick={() => handleRequestEnrollment(course.id)}
                      >
                        <SendHorizontal className="w-3.5 h-3.5 mr-1.5" />
                        <span>Retry Request</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
