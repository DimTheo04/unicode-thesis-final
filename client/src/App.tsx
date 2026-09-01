import { OverviewDashboard } from './features/dashboard/components/OverviewDashboard';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardRouter } from './components/layout/DashboardRouter';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminUsers } from './features/admin/components/AdminUsers';
import { CourseManagement } from './features/courses/components/CourseManagement';
import { EnrollmentRequests } from './features/courses/components/EnrollmentRequests';
import { AvailableCourses } from './features/courses/components/AvailableCourses';
import { AssignmentList } from './features/courses/components/AssignmentList';
import { SubmissionList } from './features/courses/components/SubmissionList';
import { CodeReviewScreen } from './features/courses/components/CodeReviewScreen';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Unauthenticated Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected / Authenticated Routes with Navbar */}
            <Route element={<MainLayout />}>
              {/* Dashboard acts as a role-based redirector and layout for tabs */}
              <Route path="/dashboard" element={<DashboardRouter />}>
                <Route path="overview" element={<OverviewDashboard />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/courses" element={<CourseManagement />} />
                
                <Route path="teacher/courses" element={<CourseManagement />} />
                <Route path="teacher/requests" element={<EnrollmentRequests />} />
                
                <Route path="student/enrolled" element={<CourseManagement />} />
                <Route path="student/available" element={<AvailableCourses />} />
              </Route>

              {/* Drilled-down routes inside a course */}
              <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
              <Route path="/courses/:courseId/assignments/:assignmentId/submissions" element={<SubmissionList />} />
            </Route>

            {/* Full Screen Review Route (Requires Auth but no Navbar) */}
            <Route
              path="/courses/:courseId/assignments/:assignmentId/review/:submissionId"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-card text-card-foreground">
                    <CodeReviewScreen />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

