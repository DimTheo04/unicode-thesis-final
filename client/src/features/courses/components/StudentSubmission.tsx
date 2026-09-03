import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCheck, FileArchive, Loader2, AlertCircle, Eye, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchMySubmission, submitAssignmentZip } from '../api/submissionApi';
import type { Submission } from '../api/submissionApi';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface StudentSubmissionProps {
  assignmentId: string;
}

// component handling zip file dropzone upload and status display for student submissions
export const StudentSubmission: React.FC<StudentSubmissionProps> = ({ assignmentId }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // check if student has allready submitted a solution for this assignment
  const loadSubmission = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await fetchMySubmission(token, assignmentId);
      setSubmission(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [token, assignmentId]);

  // handle dragged or selected zip file
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    // validate file extension before uploading to server
    if (!file.name.endsWith('.zip') && file.type !== 'application/zip') {
      setError('Please upload a valid .zip archive');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      // upload zip archive as multipart form data
      const newSub = await submitAssignmentZip(token, assignmentId, file);
      setSubmission(newSub);
    } catch (err: any) {
      setError(err.message || 'Failed to upload archive');
    } finally {
      setIsUploading(false);
    }
  }, [token, assignmentId]);

  // react-dropzone config restricted to single zip file
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    disabled: isUploading
  });

  if (isLoading) {
    return <div className="p-4 text-xs font-medium text-muted-foreground text-center animate-pulse">Loading submission status...</div>;
  }

  return (
    <div className="pt-4 border-t border-border/80 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Your Submission</span>
        <div className="flex items-center gap-2">
          {submission?.grade !== null && submission?.grade !== undefined && (
            <Badge variant="success" className="text-xs py-0.5">
              Grade: {submission.grade}/100
            </Badge>
          )}
          {submission && (
            <Badge variant="info" className="text-xs py-0.5">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Submitted (v{submission.version})</span>
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-xs font-medium rounded-lg border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {submission ? (
        <div className="p-3.5 border border-border bg-secondary/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-secondary border border-border text-foreground flex items-center justify-center shrink-0">
              <FileArchive className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">submission_v{submission.version}.zip</span>
              <span className="text-[11px] text-muted-foreground">Last submission: {new Date(submission.updatedAt).toLocaleString('en-US')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs"
              onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}/review/${submission.id}`)}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>View Code & Feedback</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                if (window.confirm('Are you sure you want to resubmit? Your previous submission will be versioned.')) {
                  setSubmission(null);
                }
              }}
            >
              <RotateCw className="w-3 h-3 mr-1" />
              <span>Resubmit</span>
            </Button>
          </div>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed p-6 flex flex-col items-center justify-center cursor-pointer transition-colors rounded-lg bg-card text-foreground ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60 hover:bg-secondary/40'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Loader2 className="w-7 h-7 animate-spin text-foreground mb-2" />
          ) : (
            <Upload className="w-7 h-7 text-foreground mb-2" />
          )}
          <p className="text-xs font-semibold text-center">
            {isUploading ? 'Uploading file...' : isDragActive ? 'Drop the .zip file here' : 'Drag & drop your project .zip archive here'}
          </p>
          {!isUploading && (
            <p className="text-[11px] text-muted-foreground mt-1">or click to browse your files</p>
          )}
        </div>
      )}
    </div>
  );
};
