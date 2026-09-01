import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Timer, GitPullRequest, Users2 } from 'lucide-react';
import { fetchAssignmentSubmissions } from '../api/submissionApi';
import { useAuth } from '../../../contexts/AuthContext';

export const SubmissionList: React.FC = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!token || !assignmentId) return;
    try {
      setIsLoading(true);
      const data = await fetchAssignmentSubmissions(token, assignmentId);
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, assignmentId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/courses/${courseId}/assignments`)}
          className="text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Assignments</span>
        </Button>
        <div>
          <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-foreground" />
            <span>Student Submissions</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'} recorded
          </p>
        </div>
      </div>

      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-medium text-muted-foreground animate-pulse">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <Users2 className="w-8 h-8 mx-auto text-foreground opacity-40" />
              <p className="text-sm font-semibold text-foreground">No Submissions Yet</p>
              <p className="text-xs">No students have submitted code for this assignment so far.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/80">
              {submissions.map((sub: any) => (
                <div 
                  key={sub.id} 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                      {sub.student?.fullName ? sub.student.fullName.slice(0, 2).toUpperCase() : '??'}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{sub.student?.fullName}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Timer className="w-3 h-3 text-foreground" />
                          <span>{new Date(sub.updatedAt).toLocaleString('en-US')}</span>
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          v{sub.version}
                        </Badge>
                        {sub.grade !== null ? (
                          <Badge variant="success" className="text-[10px] py-0">
                            Grade: {sub.grade}/100
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] py-0">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}/review/${sub.id}`)}
                  >
                    <GitPullRequest className="w-3.5 h-3.5 mr-1" />
                    <span>Review Code</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
