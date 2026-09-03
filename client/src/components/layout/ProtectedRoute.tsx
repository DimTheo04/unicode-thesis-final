import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// route wrapper that blocks unauthenticated visitors and preserves intended destination
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, currentUser, isLoading } = useAuth();
  const location = useLocation();

  // show full page loading spinner while validating token on startup
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // if token or user is missing, kick them back to login screen with return path
  if (!token || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // render either children directly or child router outlet
  return children ? <>{children}</> : <Outlet />;
};
