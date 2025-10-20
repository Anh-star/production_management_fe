import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from './use-toast';
import { ProductionOrder } from '@/types';

export interface DashboardKPI {
  totalProduction: number;
  planAchievementRate: number;
  defectRate: number;
  oeeRate: number;
}

export interface DefectDistribution {
  defect_name: string;
  count: number;
}

let kpiData: DashboardKPI | null = null;
let defectDistribution: DefectDistribution[] = [];
let activeProductionOrders: ProductionOrder[] = [];
let loading = true;
let error: string | null = null;

const subscribers: Set<() => void> = new Set();

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

const fetchDashboardData = async (toast: ReturnType<typeof useToast>['toast']) => {
  try {
    loading = true;
    notifySubscribers();

    const dashboardResponse = await apiClient.get('/dashboard');
    if (dashboardResponse.data) {
      const backendData = dashboardResponse.data;
      kpiData = {
        totalProduction: backendData.total_production || 0,
        planAchievementRate: backendData.plan_achievement_rate || 0,
        defectRate: backendData.defect_rate || 0,
        oeeRate: backendData.oee_rate || 0,
      };
    }

    const paretoResponse = await apiClient.get('/reports/pareto');
    if (paretoResponse.data) {
      defectDistribution = paretoResponse.data;
    }

    const ordersResponse = await apiClient.get('/orders?status=In Progress');
    if (ordersResponse.data) {
      activeProductionOrders = ordersResponse.data;
    }

  } catch (err) {
    error = err instanceof Error ? err.message : 'Error loading dashboard data';
    toast({ title: 'Lỗi tải dữ liệu', description: 'Không thể tải dữ liệu dashboard', variant: 'destructive' });
  } finally {
    loading = false;
    notifySubscribers();
  }
};

export const useDashboardData = () => {
  const [dataVersion, setDataVersion] = useState(0);
  const { toast } = useToast();

  const refetch = useCallback(() => {
    fetchDashboardData(toast);
  }, [toast]);

  useEffect(() => {
    const subscriber = () => setDataVersion(prev => prev + 1);
    subscribers.add(subscriber);

    if (kpiData === null && loading) {
      refetch();
    }

    const interval = setInterval(refetch, 5 * 60 * 1000);

    return () => {
      subscribers.delete(subscriber);
      clearInterval(interval);
    };
  }, [refetch]);

  return {
    kpiData,
    defectDistribution,
    activeProductionOrders,
    loading,
    error,
    refetch
  };
};