import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, FileCode2, Folder, FolderOpen, Loader2, Award, CheckCheck, FolderTree, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Editor from '@monaco-editor/react';
import { fetchSubmissionFileContent, fetchAssignmentSubmissions, fetchMySubmission, gradeSubmission, markGradeAsSeen } from '../api/submissionApi';
import type { Submission } from '../api/submissionApi';
import { fetchFileComments, markCommentsAsRead } from '../api/commentApi';
import type { InlineComment } from '../api/commentApi';
import { markNotificationsByComments } from '../api/notificationApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useMonacoComments } from '../hooks/useMonacoComments';
import { useCommentBadges } from '../hooks/useCommentBadges';
import { CommentsSidebar } from './CommentsSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AIAnalysisModal } from './AIAnalysisModal';

interface FileTreeNodeUIProps {
  node: any;
  level: number;
  onSelectFile: (path: string) => void;
  selectedPath: string | null;
  unreadCountsByFile: Record<string, number>;
  readCountsByFile: Record<string, number>;
}

// recursive tree item for rendering files and directories in the explorer sidebar
const FileTreeNodeUI: React.FC<FileTreeNodeUIProps> = ({ 
  node, level, onSelectFile, selectedPath, unreadCountsByFile, readCountsByFile 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedPath === node.path;
  const unreadCount = unreadCountsByFile[node.path] || 0;
  const readCount = readCountsByFile[node.path] || 0;

  // recursively check if any nested child file has unread or read comments
  // so we can display an amber indicator dot on collapsed folders
  const hasChildComments = (n: any): { unread: boolean; read: boolean } => {
    if (!n.isDirectory) {
      return { 
        unread: !!unreadCountsByFile[n.path], 
        read: !!readCountsByFile[n.path] 
      };
    }
    
    let hasUnread = false;
    let hasRead = false;
    
    n.children?.forEach((child: any) => {
      const res = hasChildComments(child);
      if (res.unread) hasUnread = true;
      if (res.read) hasRead = true;
    });
    
    return { unread: hasUnread, read: hasRead };
  };

  const folderComments = node.isDirectory ? hasChildComments(node) : { unread: false, read: false };

  if (node.isDirectory) {
    let dotClass = '';
    if (folderComments.unread) {
      dotClass = 'bg-amber-500';
    } else if (folderComments.read) {
      dotClass = 'bg-muted-foreground/60';
    }

    return (
      <div>
        <div 
          className="flex items-center gap-2 py-1.5 px-2.5 mx-1 rounded-md cursor-pointer hover:bg-secondary/70 text-foreground text-xs font-medium transition-colors select-none"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-foreground/80 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-foreground/80 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
          {!isOpen && dotClass && (
            <span className={cn('w-1.5 h-1.5 rounded-full ml-auto shrink-0', dotClass)} />
          )}
        </div>
        {isOpen && node.children?.map((child: any) => (
          <FileTreeNodeUI 
            key={child.path} 
            node={child} 
            level={level + 1} 
            onSelectFile={onSelectFile} 
            selectedPath={selectedPath}
            unreadCountsByFile={unreadCountsByFile}
            readCountsByFile={readCountsByFile}
          />
        ))}
      </div>
    );
  }

  // File rendering
  const totalCount = unreadCount + readCount;
  const hasUnread = unreadCount > 0;

  return (
    <div 
      className={cn(
        'flex items-center gap-2 py-1.5 px-2.5 mx-1 rounded-md cursor-pointer text-xs justify-between group transition-colors select-none',
        isSelected
          ? 'bg-secondary text-foreground font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
      )}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
      onClick={() => onSelectFile(node.path)}
    >
      <div className="flex items-center gap-2 truncate">
        <FileCode2 className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-foreground' : 'text-muted-foreground')} />
        <span className="truncate">{node.name}</span>
      </div>
      {totalCount > 0 && (
        <Badge
          variant={hasUnread ? 'warning' : 'secondary'}
          className="text-[10px] py-0 px-1.5 h-4 ml-1 shrink-0"
        >
          {totalCount}
        </Badge>
      )}
    </div>
  );
};

// main code review workspace combining file tree explorer, monaco editor, and comment threads
export const CodeReviewScreen: React.FC = () => {
  const { assignmentId, submissionId } = useParams<{ assignmentId: string; submissionId: string }>();
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStudentGradeModal, setShowStudentGradeModal] = useState(false);

  // modal states for instructors grading and triggering ai analysis
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [gradeInput, setGradeInput] = useState<number | ''>('');
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const [comments, setComments] = useState<InlineComment[]>([]);
  const [allComments, setAllComments] = useState<InlineComment[]>([]);

  // custom monaco integration hook for decorations & cursor selection
  const { handleEditorDidMount, activeSelection, scrollToLine } = useMonacoComments(comments);
  const { unreadCountsByFile, readCountsByFile } = useCommentBadges(allComments);

  useEffect(() => {
    if (submission) {
      setGradeInput(submission.grade ?? '');
      setFeedbackInput(submission.feedback || '');
    }
  }, [submission]);

  // prompt student with grade modal once when they first open reviewed submission
  useEffect(() => {
    if (submission && submission.grade !== null && currentUser?.role === 'STUDENT') {
      if (submission.hasSeenGrade === false) {
        setShowStudentGradeModal(true);
      }
    }
  }, [submission, currentUser]);

  const dismissStudentGradeModal = async () => {
    if (submission && token && assignmentId) {
      try {
        await markGradeAsSeen(token, assignmentId, submission.id);
        setSubmission({ ...submission, hasSeenGrade: true });
      } catch (e) {
        console.error(e);
      }
    }
    setShowStudentGradeModal(false);
  };

  // submit grade and feedback comments to backend
  const handleGradeSubmit = async () => {
    // validation for valid grade range 0-100
    if (gradeInput === '' || Number(gradeInput) < 0 || Number(gradeInput) > 100) {
      setGradeError('Grade must be between 0 and 100');
      return;
    }
    if (feedbackInput.length > 1000) {
      setGradeError('Feedback comments are too long (maximum 1000 characters)');
      return;
    }
    if (!token || !assignmentId || !submissionId) return;
    try {
      setIsSubmittingGrade(true);
      const updated = await gradeSubmission(token, assignmentId, submissionId, Number(gradeInput), feedbackInput);
      setSubmission(updated);
      setIsGradeModalOpen(false);
    } catch (err) {
      setGradeError('Failed to record grade');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // load submission metadata depending on whether current user is student or instructor
  useEffect(() => {
    const fetchSub = async () => {
      if (!token || !assignmentId || !submissionId) return;
      try {
        setIsLoadingSubmission(true);
        if (currentUser?.role === 'STUDENT') {
          const sub = await fetchMySubmission(token, assignmentId);
          if (sub && sub.id === submissionId) setSubmission(sub);
        } else {
          const subs = await fetchAssignmentSubmissions(token, assignmentId);
          const found = subs.find(s => s.id === submissionId);
          if (found) setSubmission(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSubmission(false);
      }
    };
    fetchSub();
  }, [token, assignmentId, submissionId, currentUser?.role]);

  // load inline comments for the selected file and mark unread comments as read
  const loadComments = useCallback(async (path: string) => {
    if (!token || !submission) return;
    try {
      const data = await fetchFileComments(token, submission.id, path);
      setComments(data);

      const commentIds = data.map(c => c.id);
      if (commentIds.length > 0) {
        await markCommentsAsRead(token, submission.id, commentIds);
        const updatedAll = await fetchFileComments(token, submission.id);
        setAllComments(updatedAll);
        
        // update notification badge count across app
        await markNotificationsByComments(token, commentIds).catch(console.error);
        window.dispatchEvent(new Event('notifications-updated'));
      }
    } catch (err) {
      console.error(err);
    }
  }, [token, submission]);

  // load all comments for the whole submission to display badge counters in file tree
  useEffect(() => {
    const loadAllComments = async () => {
      if (!token || !submission) return;
      try {
        const allCommentsData = await fetchFileComments(token, submission.id);
        setAllComments(allCommentsData);
      } catch (err) {
        console.error(err);
      }
    };
    loadAllComments();
  }, [token, submission]);

  useEffect(() => {
    if (selectedFile) loadComments(selectedFile);
  }, [selectedFile, loadComments]);

  // parse json file tree structure stored in db
  const fileTree = useMemo(() => {
    if (!submission?.fileTreeJson) return [];
    try {
      return JSON.parse(submission.fileTreeJson);
    } catch (e) {
      return [];
    }
  }, [submission]);

  // fetch text content of file to display inside monaco editor
  const handleSelectFile = async (path: string) => {
    if (!token || !submission || !assignmentId) return;
    setSelectedFile(path);
    setIsLoadingFile(true);
    setError(null);
    try {
      const content = await fetchSubmissionFileContent(token, assignmentId, submission.id, path);
      setFileContent(content);
    } catch (err: any) {
      setFileContent('');
      setError('Unable to load file. It might be binary or missing.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  if (isLoadingSubmission) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Loading submission files...</span>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex h-screen items-center justify-center bg-background flex-col gap-4">
        <p className="text-muted-foreground text-sm font-medium">Submission not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* LEFT SIDEBAR: File Tree */}
      <div className="w-64 border-r border-border flex flex-col bg-card/50 shrink-0">
        <div className="h-12 px-3.5 flex items-center border-b border-border shrink-0 justify-between bg-card">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-foreground/80" />
            <span>Explorer</span>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {fileTree.map((node: any) => (
            <FileTreeNodeUI 
              key={node.path} 
              node={node} 
              level={0} 
              onSelectFile={handleSelectFile} 
              selectedPath={selectedFile}
              unreadCountsByFile={unreadCountsByFile}
              readCountsByFile={readCountsByFile}
            />
          ))}
        </div>
      </div>

      {/* CENTER: Monaco Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
          <div className="flex items-center gap-2 truncate">
            {selectedFile ? (
              <div className="flex items-center gap-2 truncate">
                <FileCode2 className="w-4 h-4 text-foreground/80 shrink-0" />
                <span className="text-xs font-semibold text-foreground">{selectedFile.split('/').pop()}</span>
                <span className="text-[11px] text-muted-foreground truncate hidden md:inline">{selectedFile}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No file selected</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentUser?.role === 'STUDENT' && submission?.grade !== null && submission?.grade !== undefined && (
              <Badge variant="success" className="text-xs py-1 px-3">
                Grade: {submission.grade}/100
              </Badge>
            )}
            {currentUser?.role === 'TEACHER' && submission && (
              <Button 
                size="sm" 
                variant={submission.grade !== null ? "outline" : "default"}
                onClick={() => setIsGradeModalOpen(true)}
                className="h-8 text-xs font-medium"
              >
                {submission.grade !== null ? `Update Grade (${submission.grade}/100)` : 'Grade Submission'}
              </Button>
            )}
            
            {currentUser?.role === 'TEACHER' && submission && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setIsAIModalOpen(true)}
                className="h-8 text-xs font-medium gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Analysis</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 relative bg-card">
          {!selectedFile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2 text-xs">
              <FileCode2 className="w-8 h-8 opacity-30" />
              <span>Select a file from the explorer to view code and discussions</span>
            </div>
          ) : isLoadingFile ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-xs z-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-destructive text-xs font-medium p-4 text-center">
              {error}
            </div>
          ) : (
            <Editor
              height="100%"
              language="typescript"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={fileContent}
              onMount={handleEditorDidMount}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 22,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                glyphMargin: true,
                lineNumbersMinChars: 3,
                wordWrap: 'on'
              }}
            />
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Comments */}
      {selectedFile && (
        <div className="w-88 border-l border-border flex flex-col bg-card shrink-0">
          <CommentsSidebar 
            token={token!}
            submissionId={submission.id}
            filePath={selectedFile}
            comments={comments}
            onCommentsUpdated={() => {
              loadComments(selectedFile);
              fetchFileComments(token!, submission.id).then(setAllComments);
            }}
            activeSelection={activeSelection}
            onCommentClick={scrollToLine}
            currentUser={currentUser!}
          />
        </div>
      )}

      {/* Grading Modal */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground w-full max-w-md p-6 rounded-lg shadow-xl border border-border space-y-4">
            <h3 className="text-base font-semibold text-foreground">Evaluation & Grading</h3>
            
            {gradeError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{gradeError}</p>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-foreground">Grade (0 - 100)</label>
              <input 
                type="number" 
                min="0" max="100"
                value={gradeInput}
                onChange={e => setGradeInput(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 85"
                className="w-full h-9 px-3 rounded-md border border-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-foreground">Overall Feedback / Comments</label>
              <textarea 
                rows={4}
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
                placeholder="Provide general feedback and evaluation notes for the student..."
                className="w-full p-2.5 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsGradeModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleGradeSubmit} disabled={isSubmittingGrade || gradeInput === ''}>
                {isSubmittingGrade ? 'Saving...' : 'Submit Grade'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Grade Celebration / Modal */}
      {showStudentGradeModal && submission?.grade !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground w-full max-w-sm p-6 rounded-xl shadow-2xl border border-border flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground">Evaluation Results</h3>
              <p className="text-xs text-muted-foreground mt-0.5">The instructor has completed the review of your code submission.</p>
            </div>

            <div className="p-4 bg-secondary/50 border border-border rounded-lg w-full flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">
                {submission.grade} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
              </span>
              <Badge variant={submission.grade >= 80 ? 'success' : submission.grade >= 50 ? 'warning' : 'destructive'} className="mt-2 text-[11px]">
                {submission.grade >= 80 ? 'Excellent Work' : submission.grade >= 50 ? 'Passed' : 'Needs Improvement'}
              </Badge>
            </div>

            {submission.feedback && (
              <div className="w-full bg-secondary/30 p-3 rounded-md border border-border text-left">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Instructor Feedback:</span>
                <p className="text-xs text-foreground italic leading-relaxed">"{submission.feedback}"</p>
              </div>
            )}

            <Button onClick={dismissStudentGradeModal} size="sm" className="w-full text-xs">
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              <span>Got it</span>
            </Button>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {submission && (
        <AIAnalysisModal 
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          submissionId={submission.id}
          fileTree={fileTree}
          token={token!}
        />
      )}
    </div>
  );
};
