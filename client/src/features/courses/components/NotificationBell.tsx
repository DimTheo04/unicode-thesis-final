import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationApi';
import type { Notification } from '../api/notificationApi';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  token: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ token }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(token);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // refresh every 30s
    
    const handleUpdate = () => loadNotifications();
    window.addEventListener('notifications-updated', handleUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-updated', handleUpdate);
    };
  }, [token]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(token);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(token, notif.id);
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    
    try {
      const actionData = typeof notif.actionData === 'string' ? JSON.parse(notif.actionData) : notif.actionData;
      
      if (notif.type === 'NEW_SUBMISSION' || actionData?.type === 'NEW_SUBMISSION') {
        if (actionData?.courseId && actionData?.assignmentId) {
          navigate(`/courses/${actionData.courseId}/assignments/${actionData.assignmentId}/submissions`);
        }
      } else if (notif.type === 'NEW_ASSIGNMENT' || actionData?.type === 'NEW_ASSIGNMENT') {
        if (actionData?.courseId) {
          navigate(`/courses/${actionData.courseId}/assignments`);
        }
      } else if (actionData?.courseId && actionData?.assignmentId && actionData?.submissionId) {
        navigate(`/courses/${actionData.courseId}/assignments/${actionData.assignmentId}/review/${actionData.submissionId}`);
      } else if (actionData?.courseId && actionData?.assignmentId) {
        navigate(`/courses/${actionData.courseId}/assignments`);
      }
      
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative p-2 h-8 w-8 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-md border-border bg-popover text-popover-foreground rounded-lg" align="end">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-medium bg-secondary text-secondary-foreground border border-border px-1.5 py-0.2 rounded">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              type="button"
              onClick={handleMarkAllRead} 
              className="text-[11px] text-muted-foreground hover:text-foreground hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
              <Bell className="w-5 h-5 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-medium text-foreground">No notifications</p>
              <p className="text-[11px]">All updates and announcements will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={cn(
                    'p-3 cursor-pointer hover:bg-muted/40 transition-colors flex items-start gap-2.5',
                    !notif.isRead && 'bg-muted/20'
                  )}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="mt-0.5 shrink-0">
                    {!notif.isRead ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className={cn('text-xs leading-snug', !notif.isRead ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground')}>
                      {notif.title}
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                      {new Date(notif.createdAt).toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
