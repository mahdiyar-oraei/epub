'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '@/types/api';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // You would typically decode the JWT token here to get user info
      // For now, we'll set a placeholder user
      setUser({
        id: '1',
        email: 'user@example.com',
        role: 'USER',
        created_at: new Date().toISOString(),
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      localStorage.setItem('token', response.token);
      
      // In a real app, you'd decode the JWT to get user info
      setUser({
        id: '1',
        email,
        role: 'USER',
        created_at: new Date().toISOString(),
      });
      
      toast.success('با موفقیت وارد شدید');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ورود');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authApi.register({ email, password });
      toast.success('ثبت‌نام با موفقیت انجام شد');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ثبت‌نام');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('با موفقیت خارج شدید');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
