import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Code2, 
  Settings, 
  LogOut, 
  Shield, 
  GraduationCap, 
  BookOpen, 
  ChevronDown,
  User
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { NotificationBell } from '../../features/courses/components/NotificationBell';
import { ThemeToggle } from '../shared/ThemeToggle';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onOpenProfileSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfileSettings }) => {
  const { currentUser, token, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  if (!currentUser || !token) {
    return null;
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'TEACHER':
        return 'Instructor';
      case 'STUDENT':
        return 'Student';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'TEACHER':
        return <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'STUDENT':
        return <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />;
      default:
        return <User className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Brand & Main Route */}
        <div className="flex items-center gap-6">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center transition-transform group-hover:scale-95">
              <Code2 className="w-4 h-4 text-current stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-foreground">
                UNICODE
              </span>
            </div>
          </Link>
        </div>

        {/* Right Controls / Utility Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Notification Bell */}
          <NotificationBell token={token} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Vertical Divider */}
          <div className="h-4 w-px bg-border mx-1" aria-hidden="true" />

          {/* User Profile Menu */}
          <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 pl-1 pr-2 py-1 rounded-md text-left transition-colors cursor-pointer border border-transparent',
                  'hover:bg-secondary hover:border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isUserMenuOpen && 'bg-secondary border-border/60'
                )}
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground">
                  {getInitials(currentUser.fullName)}
                </div>
                <div className="hidden md:flex flex-col text-left leading-none">
                  <span className="text-xs font-medium text-foreground max-w-[130px] truncate">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block opacity-70" />
              </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-60 p-1 bg-popover text-popover-foreground border-border shadow-md rounded-lg">
              {/* User Info Header */}
              <div className="px-3 py-2.5 border-b border-border/70">
                <p className="text-xs font-medium text-foreground truncate">
                  {currentUser.fullName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                  {getRoleIcon(currentUser.role)}
                  <span>{getRoleLabel(currentUser.role)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1 space-y-0.5">
                <button 
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenProfileSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary rounded-md transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Profile Settings</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-destructive" />
                  <span>Log Out</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </header>
  );
};
