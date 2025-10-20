import { useState, useEffect, useCallback } from 'react';
import apiClient, { getReportById } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export interface DefectReport {
  qty: number;
  defect_codes: {
    code: string;
    name: string;
  } | null;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface ProductionReport {
  id: number;
  started_at: string;
  ended_at: string | null;
  qty_ok: number;
  qty_ng: number;
  note: string | null;
  line: string | null;
  user_name: string;
  po_code: string;
  product_name: string;
  operation_name: string;
  shift_name: string;
  defect_reports: DefectReport[];
}

export const useProductionReports = () => {
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/reports'); 
      setReports(response.data || []);
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải báo cáo sản xuất.',
        variant: 'destructive',
      });
      console.error('Error fetching production reports:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchReportById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const report = await getReportById(id);
      return report;
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: `Không thể tải báo cáo #${id}.`,
        variant: 'destructive',
      });
      console.error(`Error fetching report #${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, refetch: fetchReports, fetchReportById };
};
