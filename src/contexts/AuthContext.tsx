import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { type User as AppUser } from '@/hooks/useUsers';
import { UserData } from '@/types';
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: AppUser | null;
  profile: AppUser | null;
  login: (username: string, password:string) => Promise<{ error: Error | null }>;
  signup: (username: string, password: string, userData: UserData) => Promise<{ error: Error | null }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const decoded: { userId: number, role: string } = jwtDecode(token);
      const response = await apiClient.get(`/users/${decoded.userId}`);
      
      if (response.data) {
        if (response.data.is_active === false) {
          toast({
            title: 'Tài khoản bị khóa',
            description: 'Vui lòng liên hệ quản trị.',
            variant: 'destructive'
          });
          localStorage.removeItem('token');
          setUser(null);
          setProfile(null);
          return;
        }
        setUser(response.data);
        setProfile(response.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
      }
    } catch (e) {
      console.error('Error in fetchUserProfile:', e);
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      await fetchUserProfile();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Lỗi đăng nhập',
        description: error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.',
        variant: 'destructive'
      });
      return { error };
    }
  };

  const signup = async (username: string, password: string, userData: UserData) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        password,
        name: userData.full_name,
        role: userData.role,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      await fetchUserProfile();
      toast({
        title: 'Đăng ký thành công',
        description: 'Tài khoản đã được tạo và có thể sử dụng ngay',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Lỗi đăng ký',
        description: error.response?.data?.message || 'Đã có lỗi xảy ra.',
        variant: 'destructive'
      });
      return { error };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    toast({
      title: 'Đăng xuất thành công',
    });
  };

  const value = {
    user,
    profile,
    login,
    signup,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};