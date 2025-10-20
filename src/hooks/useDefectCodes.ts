import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from './use-toast';

export interface DefectCode {
  id: number;
  code: string;
  name: string;
  group: string | null;
  severity: string | null;
  is_active: boolean | null;
}

export const useDefectCodes = () => {
  const [defectCodes, setDefectCodes] = useState<DefectCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDefectCodes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/defect-codes');
      setDefectCodes(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading defect codes');
      toast({ title: 'Lỗi tải dữ liệu', description: 'Không thể tải danh sách mã lỗi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createDefectCode = async (defectCode: Omit<DefectCode, 'id'>) => {
    try {
      const response = await apiClient.post('/defect-codes', defectCode);
      setDefectCodes(prev => [...prev, response.data]);
      toast({ title: 'Thêm mã lỗi thành công!' });
      fetchDefectCodes(); 
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error('Error in createDefectCode:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi khi thêm mã lỗi';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const updateDefectCode = async (id: number, updates: Partial<Omit<DefectCode, 'id'>>) => {
    try {
      const response = await apiClient.put(`/defect-codes/${id}`, updates);
      setDefectCodes(prev => prev.map(item => item.id === id ? response.data : item));
      toast({ title: 'Cập nhật mã lỗi thành công!' });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật mã lỗi';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const deleteDefectCode = async (id: number) => {
    try {
      await apiClient.delete(`/defect-codes/${id}`);
      setDefectCodes(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Xóa mã lỗi thành công!' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa mã lỗi';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const toggleDefectCodeStatus = async (id: number, is_active: boolean) => {
    try {
      const existingDefectCodeResponse = await apiClient.get(`/defect-codes/${id}`);
      const existingDefectCode = existingDefectCodeResponse.data;

      if (!existingDefectCode) {
        throw new Error('Defect code not found');
      }

      const updates = {
        code: existingDefectCode.code,
        name: existingDefectCode.name,
        group: existingDefectCode.group,
        severity: existingDefectCode.severity,
        is_active: is_active,
      };

      const response = await apiClient.put(`/defect-codes/${id}`, updates);
      setDefectCodes(prev => prev.map(item => item.id === id ? response.data : item));
      toast({ title: 'Cập nhật trạng thái mã lỗi thành công!' });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật trạng thái mã lỗi';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchDefectCodes();
  }, []);

  return {
    defectCodes,
    loading,
    error,
    createDefectCode,
    updateDefectCode,
    deleteDefectCode,
    toggleDefectCodeStatus,
    refetch: fetchDefectCodes
  };
};