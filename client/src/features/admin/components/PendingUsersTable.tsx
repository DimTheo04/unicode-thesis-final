import React from 'react';
import type { PendingUser } from '../api/adminApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { UserCheck2, GraduationCap, CheckCheck, UserX, Hourglass, Loader2 } from 'lucide-react';

interface PendingUsersTableProps {
  pendingUsers: PendingUser[];
  isLoading: boolean;
  onApprove: (userId: string, role: 'STUDENT' | 'TEACHER') => void;
  onReject: (userId: string) => void;
  actionUserId?: string | null;
}

export const PendingUsersTable: React.FC<PendingUsersTableProps> = ({
  pendingUsers,
  isLoading,
  onApprove,
  onReject,
  actionUserId,
}) => {
  if (isLoading) {
    return (
      <Card className="p-12 text-center space-y-3 border-border bg-card">
        <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto" />
        <p className="text-xs font-medium text-muted-foreground">Loading pending registration requests...</p>
      </Card>
    );
  }

  if (!pendingUsers || pendingUsers.length === 0) {
    return (
      <Card className="p-12 text-center space-y-2 border-border bg-card">
        <div className="w-12 h-12 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center mx-auto shadow-xs">
          <CheckCheck className="w-6 h-6 text-foreground" />
        </div>
        <CardTitle className="text-sm font-semibold text-foreground">No Pending Requests</CardTitle>
        <CardDescription className="max-w-sm mx-auto text-xs text-muted-foreground">
          All user registrations have been evaluated and processed successfully.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-xs overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-secondary text-foreground border border-border">
            <Hourglass className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">Pending User Registrations</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Assign a role (Student / Instructor) to activate platform access
            </CardDescription>
          </div>
        </div>

        <Badge variant="warning" className="text-xs py-0.5 px-2 self-start sm:self-auto">
          {pendingUsers.length} {pendingUsers.length === 1 ? 'Pending' : 'Pending'}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/80 bg-secondary/40">
                <TableHead className="text-xs font-semibold text-foreground">Full Name / Username</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Email</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Date of Birth</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Request Date</TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{user.fullName}</div>
                    <div className="text-[11px] text-muted-foreground">@{user.username}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.dateOfBirth).toLocaleDateString('en-US')}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={actionUserId === user.id}
                        onClick={() => onApprove(user.id, 'STUDENT')}
                        className="text-xs h-7 px-2.5 hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <GraduationCap className="w-3.5 h-3.5 mr-1" />
                        <span>Student</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={actionUserId === user.id}
                        onClick={() => onApprove(user.id, 'TEACHER')}
                        className="text-xs h-7 px-2.5 hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <UserCheck2 className="w-3.5 h-3.5 mr-1" />
                        <span>Instructor</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={actionUserId === user.id}
                        onClick={() => onReject(user.id)}
                        className="text-muted-foreground hover:bg-secondary hover:text-foreground text-xs h-7 px-2"
                        title="Reject request"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
