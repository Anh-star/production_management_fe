import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from './use-toast';

export interface Shift {
  id: number;
  code: string;
  name: string;
  start_time: string;
  end_time: string;
}

export const useShifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shifts');
      setShifts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading shifts');
      toast({ title: 'Lỗi tải dữ liệu', description: 'Không thể tải danh sách ca làm việc', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createShift = async (shift: Omit<Shift, 'id'>) => {
    try {
      const response = await apiClient.post('/shifts', shift);
      setShifts(prev => [...prev, response.data]);
      toast({ title: 'Thêm ca làm việc thành công!' });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi thêm ca làm việc';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const updateShift = async (id: number, updates: Partial<Omit<Shift, 'id'>>) => {
    try {
      const response = await apiClient.put(`/shifts/${id}`, updates);
      setShifts(prev => prev.map(item => item.id === id ? response.data : item));
      toast({ title: 'Cập nhật ca làm việc thành công!' });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật ca làm việc';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const deleteShift = async (id: number) => {
    try {
      await apiClient.delete(`/shifts/${id}`);
      setShifts(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Xóa ca làm việc thành công!' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa ca làm việc';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  return {
    shifts,
    loading,
    error,
    createShift,
    updateShift,
    deleteShift,
    refetch: fetchShifts
  };
};