import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ProfileSettingsModal } from './ProfileSettingsModal';

export const MainLayout: React.FC = () => {
  const { currentUser, token, isLoading } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-muted-foreground tracking-wide">Loading platform...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar onOpenProfileSettings={() => setIsProfileModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Outlet />
      </main>

      <Footer />

      <ProfileSettingsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};
