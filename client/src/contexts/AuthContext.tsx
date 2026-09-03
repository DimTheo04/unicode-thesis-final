import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../features/auth/api/authApi';
import { fetchCurrentUser } from '../features/auth/api/authApi';

// manages global authenication state, jwt tokens and current logged-in user profile
interface AuthContextType {
  token: string | null;
  currentUser: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // read initial token from localstorage so user stays logged in across page reloads
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // validate stored token against backend on initial mount
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token)
        .then(user => {
          setCurrentUser(user);
          setIsLoading(false);
        })
        .catch(() => {
          // if token is expired or invalidated, purge from storage
          localStorage.removeItem('token');
          setToken(null);
          setCurrentUser(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // save token to persistent storage and update context state
  const login = (newToken: string, user: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setCurrentUser(user);
  };

  // clear credentials on logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  // update local user state (eg after profile edit modal)
  const updateUser = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook helper for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
