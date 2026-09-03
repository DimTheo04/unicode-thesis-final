import { useMemo } from 'react';
import type { InlineComment } from '../api/commentApi';

interface CommentBadges {
  unreadCountsByFile: Record<string, number>;
  readCountsByFile: Record<string, number>;
}

export const useCommentBadges = (comments: InlineComment[]): CommentBadges => {
  return useMemo(() => {
    const unreadCountsByFile: Record<string, number> = {};
    const readCountsByFile: Record<string, number> = {};

    comments.forEach(comment => {
      // 1. If resolved, ignore completely
      if (comment.isResolved) {
        return;
      }

      // Find the latest update time in the thread (comment itself or its replies)
      let latestTime = new Date(comment.updatedAt).getTime();
      comment.threadMessages?.forEach(msg => {
        const msgTime = new Date(msg.createdAt).getTime();
        if (msgTime > latestTime) {
          latestTime = msgTime;
        }
      });

      // 2. Check read state
      const lastReadAtStr = comment.readStates?.[0]?.lastReadAt;
      const lastReadAt = lastReadAtStr ? new Date(lastReadAtStr).getTime() : 0;

      const isUnread = lastReadAt < latestTime;

      if (isUnread) {
        unreadCountsByFile[comment.filePath] = (unreadCountsByFile[comment.filePath] || 0) + 1;
      } else {
        readCountsByFile[comment.filePath] = (readCountsByFile[comment.filePath] || 0) + 1;
      }
    });

    return { unreadCountsByFile, readCountsByFile };
  }, [comments]);
};
