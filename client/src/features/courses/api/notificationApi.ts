export interface NotificationActionData {
  courseId?: string;
  assignmentId?: string;
  submissionId?: string;
  commentId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionData: NotificationActionData;
  isRead: boolean;
  createdAt: string;
}

export const fetchNotifications = async (token: string): Promise<Notification[]> => {
  const res = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const markNotificationAsRead = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
};

export const markAllNotificationsAsRead = async (token: string): Promise<void> => {
  const res = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
};

export const markNotificationsByComments = async (token: string, commentIds: string[]): Promise<void> => {
  const res = await fetch('/api/notifications/read-by-comments', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ commentIds })
  });
  if (!res.ok) throw new Error('Failed to mark notifications by comments');
};
