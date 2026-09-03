import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  GraduationCap, 
  BookOpen, 
  LayoutGrid, 
  Users2, 
  Library, 
  Inbox, 
  FolderGit2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// layout router that adapts header title, icons, and navigation tabs based on user role
export const DashboardRouter: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user hits exactly /dashboard, redirect them to their defualt overview tab
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  // determine active sub-route for highlight state
  const isOverview = location.pathname.includes('/overview');
  const isAdminUsers = location.pathname.includes('/admin/users');
  const isAdminCourses = location.pathname.includes('/admin/courses');

  const isTeacherCourses = location.pathname.includes('/teacher/courses');
  const isTeacherRequests = location.pathname.includes('/teacher/requests');

  const isStudentEnrolled = location.pathname.includes('/student/enrolled');
  const isStudentAvailable = location.pathname.includes('/student/available');

  // builds role-specific navigation menu items & descriptions
  const getRoleHeaderInfo = () => {
    switch (currentUser?.role) {
      case 'ADMIN':
        return {
          title: 'Administrator Dashboard',
          subtitle: 'Manage platform users, system roles, and academic courses',
          icon: Shield,
          tabs: [
            { path: '/dashboard/overview', label: 'Overview', icon: LayoutGrid, active: isOverview },
            { path: '/dashboard/admin/users', label: 'Users', icon: Users2, active: isAdminUsers },
            { path: '/dashboard/admin/courses', label: 'Courses', icon: Library, active: isAdminCourses },
          ]
        };
      case 'TEACHER':
        return {
          title: 'Instructor Dashboard',
          subtitle: 'Manage courses, enrollment requests, and assignment reviews',
          icon: GraduationCap,
          tabs: [
            { path: '/dashboard/overview', label: 'Overview', icon: LayoutGrid, active: isOverview },
            { path: '/dashboard/teacher/courses', label: 'My Courses', icon: Library, active: isTeacherCourses },
            { path: '/dashboard/teacher/requests', label: 'Enrollment Requests', icon: Inbox, active: isTeacherRequests },
          ]
        };
      case 'STUDENT':
        return {
          title: 'Student Dashboard',
          subtitle: 'Enrolled courses, assignment submissions, and review feedback',
          icon: BookOpen,
          tabs: [
            { path: '/dashboard/overview', label: 'Overview', icon: LayoutGrid, active: isOverview },
            { path: '/dashboard/student/enrolled', label: 'My Courses', icon: FolderGit2, active: isStudentEnrolled },
            { path: '/dashboard/student/available', label: 'Available Courses', icon: Library, active: isStudentAvailable },
          ]
        };
      default:
        return null;
    }
  };

  const roleInfo = getRoleHeaderInfo();
  if (!roleInfo) return null;

  const RoleIcon = roleInfo.icon;

  return (
    <div className="space-y-6">
      {/* Top Role Header & Segmented Subnav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border">
        {/* Left: Role Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground shrink-0">
            <RoleIcon className="w-4 h-4 text-foreground/80" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground tracking-tight leading-tight">
              {roleInfo.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {roleInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Segmented Subnav Bar */}
        <div className="flex items-center p-1 rounded-lg bg-secondary/50 border border-border self-start md:self-auto overflow-x-auto max-w-full">
          {roleInfo.tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer',
                  tab.active
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <TabIcon className={cn('w-3.5 h-3.5', tab.active ? 'text-foreground' : 'text-muted-foreground')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routed Content View */}
      <Outlet />
    </div>
  );
};
