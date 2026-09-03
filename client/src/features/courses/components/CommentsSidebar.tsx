import React, { useState } from 'react';
import { createComment, addMessageToComment, resolveComment } from '../api/commentApi';
import type { InlineComment } from '../api/commentApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, MessagesSquare, MessageSquareCode, SendHorizontal } from 'lucide-react';
import type { User } from '../../auth/api/authApi';
import { cn } from '@/lib/utils';

interface CommentsSidebarProps {
  token: string;
  submissionId: string;
  filePath: string | null;
  comments: InlineComment[];
  currentUser: User;
  activeSelection: { startLine: number, endLine: number } | null;
  onCommentsUpdated: () => void;
  onCommentClick: (line: number) => void;
}

// sidebar for viewing, creating, replying to, and resolving line-specific comment threads
export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({ 
  token, submissionId, filePath, comments, currentUser, activeSelection, onCommentsUpdated, onCommentClick 
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // creates a new thread bound to the selected lines in the code editor
  const handleCreateThread = async () => {
    if (!filePath || !activeSelection || !newCommentText.trim()) return;
    try {
      setIsSubmitting(true);
      await createComment(token, submissionId, {
        filePath,
        startLine: activeSelection.startLine,
        endLine: activeSelection.endLine,
        content: newCommentText
      });
      setNewCommentText('');
      setErrorMsg(null);
      onCommentsUpdated();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // post a reply to an existing discussion thread
  const handleReply = async (commentId: string) => {
    const text = replyText[commentId];
    if (!text || !text.trim()) return;
    try {
      setIsSubmitting(true);
      await addMessageToComment(token, commentId, text);
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      onCommentsUpdated();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // toggle resolved status (fades thread and removes urgent badge)
  const handleToggleResolve = async (commentId: string, currentStatus: boolean) => {
    try {
      setIsSubmitting(true);
      await resolveComment(token, commentId, !currentStatus);
      onCommentsUpdated();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (!filePath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground p-6 gap-2">
        <MessageSquareCode className="w-6 h-6 text-foreground opacity-30" />
        <span>Select a file to view or add comments</span>
      </div>
    );
  }

  return (
    <aside className="flex flex-col h-full w-full overflow-hidden bg-card">
      <div className="h-12 px-4 border-b border-border sticky top-0 bg-card z-10 flex justify-between items-center">
        <h3 className="text-xs font-semibold flex items-center gap-2 text-foreground uppercase tracking-wider">
          <MessagesSquare className="w-3.5 h-3.5 text-foreground/80" />
          <span>Comments & Discussions</span>
        </h3>
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
          {comments.length}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {errorMsg && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
        )}

        {/* New Thread Form */}
        {activeSelection && (
          <div className="border border-border rounded-lg p-3 bg-secondary/30 space-y-2.5 shadow-xs">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>New Comment</span>
              <Badge variant="default" className="text-[10px] py-0">
                Lines {activeSelection.startLine} - {activeSelection.endLine}
              </Badge>
            </div>
            <textarea
              className="w-full text-xs p-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y shadow-xs"
              rows={2}
              placeholder="Write feedback or observations for the selected lines..."
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                size="sm" 
                disabled={!newCommentText.trim() || isSubmitting}
                onClick={handleCreateThread}
                className="text-xs"
              >
                <SendHorizontal className="w-3.5 h-3.5 mr-1" />
                <span>Post Comment</span>
              </Button>
            </div>
          </div>
        )}

        {/* Existing Comments */}
        {comments.length === 0 && !activeSelection ? (
          <div className="text-center text-xs text-muted-foreground py-10 space-y-2">
            <MessageSquareCode className="w-8 h-8 mx-auto text-foreground opacity-30" />
            <p className="font-medium text-foreground">No comments on this file</p>
            <p className="text-[11px]">Select code lines in the editor to start a discussion thread.</p>
          </div>
        ) : (
          comments.map(comment => (
            <div 
              key={comment.id} 
              className={cn(
                'border rounded-lg bg-card transition-all overflow-hidden shadow-xs',
                comment.isResolved 
                  ? 'border-border/60 opacity-70 bg-secondary/20' 
                  : 'border-border hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <div 
                className="p-3 border-b border-border/70 cursor-pointer hover:bg-secondary/40 transition-colors"
                onClick={() => onCommentClick(comment.startLine)}
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">
                      {getInitials(comment.author.fullName)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground block leading-tight">{comment.author.fullName}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {comment.version && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        v{comment.version}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      L{comment.startLine}{comment.startLine !== comment.endLine ? `-${comment.endLine}` : ''}
                    </Badge>
                    {(currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                      <button 
                        className={cn(
                          'text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors cursor-pointer',
                          comment.isResolved 
                            ? 'text-muted-foreground border-border hover:text-foreground' 
                            : 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleResolve(comment.id, comment.isResolved);
                        }}
                        disabled={isSubmitting}
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>{comment.isResolved ? 'Reopen' : 'Resolve'}</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
              </div>

              {/* Thread Messages */}
              {comment.threadMessages && comment.threadMessages.length > 0 && (
                <div className="divide-y divide-border/60 bg-secondary/20">
                  {comment.threadMessages.map(msg => (
                    <div key={msg.id} className="p-3 pl-5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-md bg-secondary border border-border flex items-center justify-center text-[9px] font-semibold text-foreground shrink-0">
                          {getInitials(msg.author.fullName)}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{msg.author.fullName}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed pl-7">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              {!comment.isResolved && (
                <div className="p-2.5 bg-secondary/30 border-t border-border/70">
                  <div className="flex gap-1.5">
                    <input 
                      type="text"
                      placeholder="Write a reply..."
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-xs"
                      value={replyText[comment.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(comment.id);
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="h-8 px-2.5 text-xs"
                      onClick={() => handleReply(comment.id)}
                      disabled={isSubmitting || !replyText[comment.id]?.trim()}
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
