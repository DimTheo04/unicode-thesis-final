import type { SignupFormData, LoginFormData } from '../schemas/authSchemas';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  isApproved: boolean;
}

export interface AuthResponse {
  data: {
    token?: string;
    user?: User;
    message?: string;
  };
}

export async function loginUser(data: LoginFormData): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Login failed');
  }

  return json.data;
}

export async function signupUser(data: SignupFormData): Promise<{ message: string }> {
  const { confirmPassword: _confirmPassword, ...signupData } = data;
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupData),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Signup failed');
  }

  return json.data;
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const res = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to fetch user profile');
  }

  return json.data;
}

export async function updateUserProfile(token: string, data: any): Promise<User> {
  const res = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || json.message || 'Failed to update profile');
  }

  return json.data;
}
