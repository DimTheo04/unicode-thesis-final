import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchDashboardAnalytics } from '../api/dashboardApi';
import type {
  DashboardAnalyticsResponse,
  StudentDashboardData,
  TeacherDashboardData,
  AdminDashboardData
} from '../api/dashboardApi';
import { StudentDashboardOverview } from './StudentDashboardOverview';
import { TeacherDashboardOverview } from './TeacherDashboardOverview';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OverviewDashboard: React.FC = () => {
  const { token, currentUser } = useAuth();
  const [data, setData] = useState<DashboardAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchDashboardAnalytics(token);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard analytics:', err);
      setError(err?.message || 'Failed to load overview analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-32 bg-secondary/40 border-border" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-6 animate-pulse">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <Card className="h-72 bg-secondary/30 border-border" />
            <Card className="h-56 bg-secondary/30 border-border" />
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <Card className="h-64 bg-secondary/30 border-border" />
            <Card className="h-48 bg-secondary/30 border-border" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-border bg-card space-y-3">
        <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">An error occurred</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={loadAnalytics}
          className="mt-2 text-xs gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </Button>
      </Card>
    );
  }

  if (!data || !currentUser) return null;

  if (currentUser.role === 'STUDENT' && data.role === 'STUDENT') {
    return <StudentDashboardOverview data={data as StudentDashboardData} />;
  }

  if (currentUser.role === 'TEACHER' && data.role === 'TEACHER') {
    return (
      <TeacherDashboardOverview
        data={data as TeacherDashboardData}
        onRefresh={loadAnalytics}
      />
    );
  }

  if (currentUser.role === 'ADMIN' && data.role === 'ADMIN') {
    return <AdminDashboardOverview data={data as AdminDashboardData} />;
  }

  return null;
};
