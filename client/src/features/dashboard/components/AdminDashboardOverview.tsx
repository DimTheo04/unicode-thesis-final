import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminDashboardData } from '../api/dashboardApi';
import { MetricCard } from './MetricCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Users2,
  Hourglass,
  Library,
  ClipboardList,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  data: AdminDashboardData;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* 1. The 4 Rich KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={data.totalUsers}
          subtitle="Approved accounts"
          icon={Users2}
          subStats={[
            {
              label: 'Students',
              value: `${data.totalStudents} enrolled`
            },
            {
              label: 'Instructors',
              value: `${data.totalTeachers} active`
            }
          ]}
          onClick={() => navigate('/dashboard/admin/users')}
        />

        <MetricCard
          title="Pending Requests"
          value={data.pendingUsers}
          subtitle={data.pendingUsers > 0 ? 'Account approval required' : 'All accounts approved'}
          icon={Hourglass}
          alert={data.pendingUsers > 0}
          subStats={[
            {
              label: 'Status',
              value: data.pendingUsers > 0 ? 'Review pending' : 'No pending actions',
              alert: data.pendingUsers > 0
            },
            {
              label: 'Administrators',
              value: `${data.totalAdmins} active`
            }
          ]}
          onClick={() => navigate('/dashboard/admin/users')}
        />

        <MetricCard
          title="Courses"
          value={data.totalCourses}
          subtitle="Active curricula"
          icon={Library}
          subStats={[
            {
              label: 'Assignments',
              value: `${data.totalAssignments} created`
            },
            {
              label: 'Submissions',
              value: `${data.totalSubmissions} turned in`
            }
          ]}
          onClick={() => navigate('/dashboard/admin/courses')}
        />

        <MetricCard
          title="Assignments & Code"
          value={data.totalAssignments}
          subtitle="Total platform assignments"
          icon={ClipboardList}
          subStats={[
            {
              label: 'Code Submissions',
              value: `${data.totalSubmissions} turned in`
            },
            {
              label: 'Average / course',
              value: data.totalCourses > 0 ? `${(data.totalAssignments / data.totalCourses).toFixed(1)}` : '0'
            }
          ]}
        />
      </div>

      {/* 2. Responsive 2-Column Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left / Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-secondary text-foreground border border-border">
                  <Hourglass className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Recent Pending Registrations
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Users awaiting approval for platform access
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/admin/users')}
                className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1"
              >
                <span>All users</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {data.pendingUsersList.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  There are no pending user registration requests.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/80 bg-secondary/40">
                        <TableHead className="text-xs font-semibold text-foreground">User</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Email</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Role</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.pendingUsersList.map(user => (
                        <TableRow
                          key={user.id}
                          className="border-b border-border/60 hover:bg-secondary/20 transition-colors"
                        >
                          <TableCell>
                            <div className="font-medium text-xs text-foreground">{user.fullName}</div>
                            <div className="text-[11px] text-muted-foreground">@{user.username}</div>
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {user.email}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={user.role === 'TEACHER' ? 'info' : 'secondary'}
                              className="text-[10px] py-0 px-1.5"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate('/dashboard/admin/users')}
                              className="h-7 px-2.5 text-xs hover:bg-secondary transition-colors"
                            >
                              <span>Review</span>
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right / Side Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-semibold text-foreground">
                  Quick Actions
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-1.5">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/admin/users')}
                className="w-full justify-start text-xs h-9 font-normal hover:bg-secondary transition-colors"
              >
                <Users2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <span>Manage Users & Roles</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/admin/courses')}
                className="w-full justify-start text-xs h-9 font-normal hover:bg-secondary transition-colors"
              >
                <Library className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <span>Manage Courses & Assignments</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
