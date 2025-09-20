'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '@/types/api';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (email: string, password: string, redirectTo?: string) => Promise<void>;
  // OTP Authentication methods
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, redirectTo?: string) => Promise<void>;
  logout: () => void;
  setRedirectDestination: (path: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, redirectTo?: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      localStorage.setItem('accessToken', response.accessToken);
      
      // Store user data from API response
      const userData = {
        id: response.user.id,
        email: response.user.email,
        role: response.role,
        created_at: new Date().toISOString(),
        name: response.user.name,
        picture: response.user.picture,
        provider: response.user.provider,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('با موفقیت وارد شدید');
      
      // Check if there's a stored redirect destination
      const storedRedirect = localStorage.getItem('redirectDestination');
      const finalRedirect = redirectTo || storedRedirect;
      
      if (finalRedirect) {
        // Clear the stored redirect destination
        localStorage.removeItem('redirectDestination');
        window.location.href = finalRedirect;
      } else {
        // Default redirect based on role
        if (response.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ورود');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, redirectTo?: string) => {
    try {
      setIsLoading(true);
      await authApi.register({ email, password });
      toast.success('ثبت‌نام با موفقیت انجام شد');
      
      // After successful registration, redirect to login with the same redirect destination
      if (redirectTo) {
        localStorage.setItem('redirectDestination', redirectTo);
      }
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('redirectDestination');
      setUser(null);
      toast.success('با موفقیت خارج شدید');
    }
  };

  const sendOtp = async (email: string) => {
    try {
      setIsLoading(true);
      await authApi.sendOtp(email);
      toast.success('کد تأیید به ایمیل شما ارسال شد');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ارسال کد تأیید');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string, redirectTo?: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.verifyOtp(email, otp);
      localStorage.setItem('accessToken', response.accessToken);
      
      // Store user data from API response
      const userData = {
        id: response.user.id,
        email: response.user.email,
        role: response.role,
        created_at: new Date().toISOString(),
        name: response.user.name,
        picture: response.user.picture,
        provider: response.user.provider,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('با موفقیت وارد شدید');
      
      // Check if there's a stored redirect destination
      const storedRedirect = localStorage.getItem('redirectDestination');
      const finalRedirect = redirectTo || storedRedirect;
      
      if (finalRedirect) {
        // Clear the stored redirect destination
        localStorage.removeItem('redirectDestination');
        window.location.href = finalRedirect;
      } else {
        // Default redirect based on role
        if (response.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'کد تأیید نامعتبر است');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setRedirectDestination = (path: string) => {
    localStorage.setItem('redirectDestination', path);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        setRedirectDestination,
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
