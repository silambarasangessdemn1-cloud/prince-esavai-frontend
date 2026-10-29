import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';

const API_BASE = API_ENDPOINTS.auth;

export interface AuthUser {
  _id: string;
  username: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signup: (username: string, phoneNumber: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify stored token
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.data.user);
          setToken(storedToken);
        } else {
          // Token invalid/expired – clear everything
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch {
        // Network error – keep token but clear user; user can retry
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = useCallback(async (phoneNumber: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'LOGIN_FAILED',
        message: data.message || 'Login failed. Please try again.',
      };
    } catch {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  }, []);

  const signup = useCallback(async (username: string, phoneNumber: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phoneNumber, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return { success: true };
      }

      // Handle validation errors array
      if (data.errors && Array.isArray(data.errors)) {
        const messages = data.errors.map((e: { field: string; message: string }) => e.message).join('. ');
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: messages,
        };
      }

      return {
        success: false,
        error: data.error || 'SIGNUP_FAILED',
        message: data.message || 'Registration failed. Please try again.',
      };
    } catch {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

