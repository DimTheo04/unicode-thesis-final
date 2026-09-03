import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Inbox, Check, X, AlertCircle, Loader2, CheckCheck } from 'lucide-react';
import { fetchPendingEnrollments, updateEnrollmentStatus } from '../api/enrollmentApi';
import type { EnrollmentRequest } from '../api/enrollmentApi';
import { useAuth } from '../../../contexts/AuthContext';

export const EnrollmentRequests: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await fetchPendingEnrollments(token);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleStatusUpdate = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateEnrollmentStatus(token, id, status);
      loadData();
    } catch (err: any) {
      setEnrollError(err.message || 'Failed to update request');
    }
  };

  return (
    <div className="space-y-4">
      {enrollError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-lg border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{enrollError}</span>
        </div>
      )}

      {isLoading ? (
        <Card className="p-12 text-center space-y-3 border-border bg-card">
          <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto" />
          <p className="text-xs font-medium text-muted-foreground">Loading course enrollment requests...</p>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-border bg-card">
          <div className="w-12 h-12 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center mx-auto shadow-xs">
            <CheckCheck className="w-6 h-6 text-foreground" />
          </div>
          <CardTitle className="text-sm font-semibold text-foreground">No Pending Requests</CardTitle>
          <CardDescription className="max-w-sm mx-auto text-xs text-muted-foreground">
            All student enrollment requests have been processed.
          </CardDescription>
        </Card>
      ) : (
        <Card className="border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-secondary text-foreground border border-border">
                <Inbox className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Course Enrollment Requests</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Approve or reject student access requests to course materials
                </CardDescription>
              </div>
            </div>

            <Badge variant="warning" className="text-xs py-0.5 px-2 self-start sm:self-auto">
              {requests.length} {requests.length === 1 ? 'Pending' : 'Pending'}
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/80 bg-secondary/40">
                    <TableHead className="text-xs font-semibold text-foreground">Request Date</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Student</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Course</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground">{req.student.fullName}</div>
                        <div className="text-[11px] text-muted-foreground">@{req.student.username}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-semibold">
                            {req.course.code}
                          </Badge>
                          <span className="text-xs font-medium text-foreground">{req.course.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                            className="h-7 px-2.5 text-xs hover:bg-secondary hover:text-foreground transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                            className="h-7 px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            title="Reject request"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
