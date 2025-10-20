import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from './use-toast';

export interface Product {
  id: number;
  code: string;
  name: string;
  version: string | null;
  uom: string | null;
  quality_spec_json: Record<string, unknown> | null;
  is_active: boolean | null;
  has_active_routing: boolean | null;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products/with-routing');
      setProducts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
      toast({ title: 'Lỗi tải dữ liệu', description: 'Không thể tải danh sách sản phẩm', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (productData: Omit<Product, 'id' | 'has_active_routing'> & { routingSteps?: { step_no: number; operation_id: number; std_time_sec: number; }[] }) => {
    try {
      const response = await apiClient.post('/products', productData);
      setProducts(prev => [...prev, response.data]);
      toast({ title: 'Thành công', description: 'Đã thêm sản phẩm mới' });
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể thêm sản phẩm', variant: 'destructive' });
      throw err;
    }
  };

  const updateProduct = async (id: number, productData: Partial<Omit<Product, 'id'>>) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      setProducts(prev => prev.map(prod => prod.id === id ? response.data : prod));
      toast({ title: 'Thành công', description: 'Đã cập nhật sản phẩm' });
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật sản phẩm', variant: 'destructive' });
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(prev => prev.filter(prod => prod.id !== id));
      toast({ title: 'Thành công', description: 'Đã xóa sản phẩm' });
    } catch (err) {
      toast({ title: 'Lỗi', description: 'Không thể xóa sản phẩm', variant: 'destructive' });
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};