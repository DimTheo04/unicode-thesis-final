import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, FilePlus2, PencilLine, AlertTriangle } from 'lucide-react';
import { createAssignment, updateAssignment } from '../api/assignmentApi';
import type { Assignment } from '../api/assignmentApi';

interface CreateAssignmentFormProps {
  token: string;
  courseId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Assignment;
}

export const CreateAssignmentForm: React.FC<CreateAssignmentFormProps> = ({ token, courseId, onSuccess, onCancel, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '');

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 3 || title.length > 100) {
      setError("Title must be between 3 and 100 characters");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!dueDate) {
      setError("Due date is required");
      return;
    }

    const isNewAssignment = !initialData;
    const isDateModified = initialData && new Date(dueDate).getTime() !== new Date(initialData.dueDate).getTime();

    if ((isNewAssignment || isDateModified) && new Date(dueDate) <= new Date()) {
      setError("Due date must be in the future");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (initialData) {
        await updateAssignment(token, courseId, initialData.id, { title, description, dueDate }, files);
      } else {
        await createAssignment(token, courseId, { title, description, dueDate }, files);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save assignment');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm max-w-2xl mx-auto">
      <CardHeader className="border-b border-border/80 flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          {initialData ? (
            <PencilLine className="w-4 h-4 text-foreground" />
          ) : (
            <FilePlus2 className="w-4 h-4 text-foreground" />
          )}
          <span>{initialData ? "Edit Assignment" : "Create New Assignment"}</span>
        </CardTitle>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs font-medium rounded-lg border border-destructive/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-medium text-foreground">Assignment Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="e.g. Lab 1: Sorting Algorithms"
              className="text-xs" 
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-medium text-foreground">Description & Instructions</Label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              rows={4}
              className="w-full p-2.5 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition shadow-xs resize-y" 
              placeholder="Detailed guidelines and submission requirements for this assignment..."
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-medium text-foreground">Submission Deadline</Label>
            <Input 
              type="datetime-local" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              required 
              className="text-xs" 
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-medium text-foreground">Attached Resources (PDF, ZIP, DOCX)</Label>
            <div className="border-2 border-dashed border-border rounded-lg bg-secondary/30 p-5 text-center hover:bg-secondary/60 transition-colors">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload" 
                accept=".pdf,.zip,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                <Upload className="w-5 h-5 text-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {files.length > 0 ? `${files.length} files selected` : 'Select files to attach'}
                </span>
                <span className="text-[11px] text-muted-foreground">PDF, ZIP, DOCX up to 20MB</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {files.map((f, i) => (
                  <span key={i} className="text-[11px] bg-secondary border border-border px-2 py-0.5 rounded text-foreground">
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} size="sm" className="flex-1">
              {isSubmitting ? 'Saving...' : initialData ? 'Update Assignment' : 'Publish Assignment'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
