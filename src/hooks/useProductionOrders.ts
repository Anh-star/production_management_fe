import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from './use-toast';

export interface ProductionOrder {
  id: number;
  code: string;
  product_id: number;
  qty_plan: number;
  start_plan: string | null;
  end_plan: string | null;
  status: string | null;
  product_name: string;
}

export const useProductionOrders = () => {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProductionOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders');
      setProductionOrders(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading production orders');
      toast({ title: 'Lỗi tải dữ liệu', description: 'Không thể tải danh sách lệnh sản xuất', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createProductionOrder = async (order: Omit<ProductionOrder, 'id' | 'products'>) => {
    try {
      const response = await apiClient.post('/orders', order);
      setProductionOrders(prev => [...prev, response.data.po]);
      toast({ title: 'Tạo lệnh sản xuất thành công!' });
      return { success: true, data: response.data.po };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Lỗi khi tạo lệnh sản xuất';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const updateProductionOrder = async (id: number, updates: Partial<Omit<ProductionOrder, 'id' | 'products'>>) => {
    try {
      const response = await apiClient.put(`/orders/${id}`, updates);
      setProductionOrders(prev => prev.map(item => item.id === id ? response.data : item));
      toast({ title: 'Cập nhật lệnh sản xuất thành công!' });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật lệnh sản xuất';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  const deleteProductionOrder = async (id: number) => {
    try {
      await apiClient.delete(`/orders/${id}`);
      setProductionOrders(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Xóa lệnh sản xuất thành công!' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa lệnh sản xuất';
      toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProductionOrders();
  }, []);

  return {
    productionOrders,
    loading,
    error,
    createProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    refetch: fetchProductionOrders
  };
};