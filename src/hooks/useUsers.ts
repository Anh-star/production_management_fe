import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from './use-toast';

export interface User {
  id: number;
  username: string;
  name: string | null;
  role: string;
  team_id: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
      toast({ title: 'Lỗi tải dữ liệu', description: 'Không thể tải danh sách người dùng', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createUser = async (userData: {
    username: string;
    password?: string;
    name: string;
    role: string;
    team_id?: number;
    is_active: boolean;
  }) => {
    if (!userData.password) {
      toast({ title: 'Lỗi', description: 'Mật khẩu là bắt buộc', variant: 'destructive' });
      return { success: false, error: 'Mật khẩu là bắt buộc' };
    }

    try {
      await apiClient.post('/users', userData);
      toast({ title: 'Thêm người dùng thành công!' });
      fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error creating user:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Lỗi khi tạo người dùng';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (id: number, updates: Partial<Omit<User, 'id' | 'created_at'>>) => {
    try {
      const response = await apiClient.put(`/users/${id}`, updates);
      setUsers(prev => prev.map(item => item.id === id ? response.data.user : item));
      toast({ title: 'Cập nhật người dùng thành công!' });
      return { success: true, data: response.data.user };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật người dùng';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Xóa người dùng thành công!' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa người dùng';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (id: number, password: string) => {
    try {
      await apiClient.put(`/users/${id}/password`, { password });
      toast({ title: 'Cập nhật mật khẩu thành công!' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật mật khẩu';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    updatePassword,
    refetch: fetchUsers
  };
};
