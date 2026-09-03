export interface UserInfo {
  id: string;
  fullName: string;
  role: string;
}

export interface ThreadMessage {
  id: string;
  commentId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: UserInfo;
}

export interface InlineComment {
  id: string;
  submissionId: string;
  version?: number;
  filePath: string;
  startLine: number;
  endLine: number;
  authorId: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    role: string;
  };
  threadMessages: ThreadMessage[];
  readStates?: { lastReadAt: string }[];
}

export const fetchFileComments = async (token: string, submissionId: string, filePath?: string, version?: number): Promise<InlineComment[]> => {
  const params = new URLSearchParams();
  if (filePath) params.append('filePath', filePath);
  if (version !== undefined) params.append('version', String(version));
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`/api/submissions/${submissionId}/comments${queryString}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
};

export const markCommentsAsRead = async (token: string, submissionId: string, commentIds: string[]): Promise<void> => {
  const res = await fetch(`/api/submissions/${submissionId}/comments/mark-read`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ commentIds })
  });
  if (!res.ok) throw new Error('Failed to mark comments as read');
};

export const createComment = async (token: string, submissionId: string, data: { filePath: string, startLine: number, endLine: number, content: string, version?: number }): Promise<InlineComment> => {
  const res = await fetch(`/api/submissions/${submissionId}/comments`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
};

export const addMessageToComment = async (token: string, commentId: string, content: string): Promise<ThreadMessage> => {
  const res = await fetch(`/api/comments/${commentId}/messages`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to add message');
  return res.json();
};

export const resolveComment = async (token: string, commentId: string, isResolved: boolean): Promise<InlineComment> => {
  const res = await fetch(`/api/comments/${commentId}/resolve`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ isResolved })
  });
  if (!res.ok) throw new Error('Failed to resolve comment');
  return res.json();
};
