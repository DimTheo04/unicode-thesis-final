import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Download, CalendarDays, Timer, Plus, ArrowLeft, PencilLine } from 'lucide-react';
import { fetchAssignments } from '../api/assignmentApi';
import type { Assignment } from '../api/assignmentApi';
import { CreateAssignmentForm } from './CreateAssignmentForm';
import { StudentSubmission } from './StudentSubmission';
import { useAuth } from '../../../contexts/AuthContext';

export const AssignmentList: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const loadData = async () => {
    if (!token || !courseId) return;
    try {
      setIsLoading(true);
      const data = await fetchAssignments(token, courseId);
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, courseId]);

  const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/files/attachment/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download attachment');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Download error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-secondary/50 rounded-lg w-1/3" />
        {[1, 2].map(i => (
          <Card key={i} className="h-40 bg-secondary/50 border-border" />
        ))}
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <CreateAssignmentForm
        token={token!}
        courseId={courseId!}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingAssignment(null);
        }}
        initialData={editingAssignment || undefined}
        onSuccess={() => {
          setShowCreateForm(false);
          setEditingAssignment(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Back</span>
          </Button>
          <div>
            <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-foreground" />
              <span>Course Assignments</span>
            </h3>
            <p className="text-xs text-muted-foreground">Assigned coursework and submission deadlines</p>
          </div>
        </div>
        
        {(currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN') && (
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setEditingAssignment(null);
              setShowCreateForm(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New Assignment</span>
          </Button>
        )}
      </div>

      {assignments.length === 0 ? (
        <Card className="border-border p-12 text-center">
          <ClipboardList className="w-8 h-8 text-foreground mx-auto mb-3 opacity-40" />
          <h4 className="text-sm font-semibold text-foreground">No Assignments</h4>
          <p className="text-xs text-muted-foreground mt-1">No assignments have been published for this course yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => {
            const isDuePassed = new Date(assignment.dueDate) < new Date();
            return (
              <Card key={assignment.id} className="border-border shadow-xs">
                <CardHeader className="border-b border-border/80 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold text-foreground">
                          {assignment.title}
                        </CardTitle>
                        {(currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN') && (
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition cursor-pointer"
                            onClick={() => {
                              setEditingAssignment(assignment);
                              setShowCreateForm(true);
                            }}
                            title="Edit assignment"
                          >
                            <PencilLine className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>Published: {new Date(assignment.createdAt).toLocaleDateString('en-US')}</span>
                        </span>
                        <Badge variant={isDuePassed ? 'destructive' : 'warning'} className="text-[11px] py-0.5">
                          <Timer className="w-3 h-3" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {assignment.description}
                  </p>
                  
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="pt-3 border-t border-border/80 space-y-2">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Attached Files</p>
                      <div className="flex flex-wrap gap-2">
                        {assignment.attachments.map(att => (
                          <Button
                            key={att.id}
                            variant="outline"
                            size="sm"
                            className="h-8 py-1 px-3 text-xs"
                            onClick={() => handleDownloadAttachment(att.id, att.fileName)}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            <span className="max-w-[200px] truncate">
                              {att.fileName}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentUser?.role === 'STUDENT' && (
                    <StudentSubmission assignmentId={assignment.id} />
                  )}

                  {(currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN') && (
                    <div className="pt-3 border-t border-border/80">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full sm:w-auto text-xs"
                        onClick={() => navigate(`/courses/${courseId}/assignments/${assignment.id}/submissions`)}
                      >
                        View Student Submissions
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
