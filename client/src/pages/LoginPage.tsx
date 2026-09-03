import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { loginUser } from '../features/auth/api/authApi';
import type { LoginFormData } from '../features/auth/schemas/authSchemas';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await loginUser(data);
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLoginSubmit}
      isLoading={isLoading}
      errorMessage={authError}
      onSwitchToSignup={() => navigate('/register')}
    />
  );
};
