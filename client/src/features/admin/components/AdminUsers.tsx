import React, { useState, useEffect } from 'react';
import { fetchPendingUsers, approveUserApi, rejectUserApi } from '../api/adminApi';
import type { PendingUser } from '../api/adminApi';
import { PendingUsersTable } from './PendingUsersTable';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RotateCw, AlertCircle } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const loadPendingUsers = () => {
    if (!token) return;
    setIsPendingLoading(true);
    fetchPendingUsers(token)
      .then((users) => {
        setPendingUsers(users);
        setIsPendingLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsPendingLoading(false);
      });
  };

  useEffect(() => {
    if (token) loadPendingUsers();
  }, [token]);

  const handleApproveUser = async (userId: string, role: 'STUDENT' | 'TEACHER') => {
    try {
      setActionUserId(userId);
      await approveUserApi(token!, userId, role);
      loadPendingUsers();
    } catch (err: any) {
      console.error(err);
      setAdminError('Failed to approve: ' + err.message);
    } finally {
      setActionUserId(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setActionUserId(userId);
      await rejectUserApi(token!, userId);
      loadPendingUsers();
    } catch (err: any) {
      console.error(err);
      setAdminError('Failed to reject: ' + err.message);
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={loadPendingUsers}
          className="gap-1.5 text-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isPendingLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
        </Button>
      </div>

      {adminError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-lg border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{adminError}</span>
        </div>
      )}

      <PendingUsersTable
        pendingUsers={pendingUsers}
        isLoading={isPendingLoading}
        onApprove={handleApproveUser}
        onReject={handleRejectUser}
        actionUserId={actionUserId}
      />
    </div>
  );
};
