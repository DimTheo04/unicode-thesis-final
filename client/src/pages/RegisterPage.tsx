import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../features/auth/components/SignupForm';
import { signupUser } from '../features/auth/api/authApi';
import type { SignupFormData } from '../features/auth/schemas/authSchemas';

export const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setAuthError(null);
    setSignupSuccess(null);
    try {
      await signupUser(data);
      setSignupSuccess('Account created successfully! Please wait for admin approval before logging in.');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignupForm
      onSubmit={handleSignupSubmit}
      isLoading={isLoading}
      errorMessage={authError}
      successMessage={signupSuccess}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
};
