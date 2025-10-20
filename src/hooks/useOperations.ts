import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from './use-toast';

export interface Operation {
  id: number;
  code: string;
  name: string;
  machine_type: string | null;
  takt_target_sec: number | null;
  is_active: boolean | null;
}

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/operations');
      setOperations(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading operations');
      toast({ title: 'Lỗi tải dữ liệu', description: 'Không thể tải danh sách công đoạn', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const createOperation = async (operationData: Omit<Operation, 'id'>) => {
    try {
      const response = await apiClient.post('/operations', operationData);
      setOperations(prev => [...prev, response.data]);
      toast({ title: 'Thành công', description: 'Đã thêm công đoạn mới' });
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể thêm công đoạn', variant: 'destructive' });
      throw err;
    }
  };

  const updateOperation = async (id: number, operationData: Partial<Omit<Operation, 'id'>>) => {
    try {
      const response = await apiClient.put(`/operations/${id}`, operationData);
      setOperations(prev => prev.map(op => op.id === id ? response.data : op));
      toast({ title: 'Thành công', description: 'Đã cập nhật công đoạn' });
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật công đoạn', variant: 'destructive' });
      throw err;
    }
  };

  const deleteOperation = async (id: number) => {
    try {
      await apiClient.delete(`/operations/${id}`);
      setOperations(prev => prev.filter(op => op.id !== id));
      toast({ title: 'Thành công', description: 'Đã xóa công đoạn' });
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể xóa công đoạn', variant: 'destructive' });
      throw err;
    }
  };

  return {
    operations,
    loading,
    error,
    refetch: fetchOperations,
    createOperation,
    updateOperation,
    deleteOperation
  };
};