import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../shared/ThemeToggle';

export const AuthLayout: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const currentYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-muted-foreground tracking-wide">Loading...</span>
        </div>
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-between p-6 font-sans relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
            UNICODE
          </h1>
        </div>

        <Outlet />
      </div>

      {/* Footer Attribution */}
      <footer className="py-2 text-center text-xs text-muted-foreground/70">
        © {currentYear} • Thesis Project
      </footer>
    </div>
  );
};
