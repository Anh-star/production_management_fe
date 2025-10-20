import { ProductionOrder } from '@/types';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import KPICard from '@/components/KPICard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  Factory,
  ClipboardList
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const { kpiData, defectDistribution, activeProductionOrders, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu dashboard...</span>
      </div>
    );
  }

  const kpiCards = kpiData ? [
    {
      title: 'Sản lượng hôm nay',
      value: kpiData.totalProduction,
      unit: 'pcs',
      trend: 'up' as const,
      trendValue: '+12.3%',
      status: 'success' as const,
      icon: Target,
      target: 10000,
      description: 'So với ngày hôm qua'
    },
    {
      title: '% Đạt kế hoạch',
      value: kpiData.planAchievementRate.toString(),
      unit: '%',
      trend: 'up' as const,
      trendValue: '+2.1%',
      status: kpiData.planAchievementRate >= 90 ? 'success' as const : 'warning' as const,
      icon: TrendingUp,
      target: '90%',
      description: 'Mục tiêu tháng này'
    },
    {
      title: 'Tỷ lệ lỗi',
      value: kpiData.defectRate.toString(),
      unit: '%',
      trend: 'down' as const,
      trendValue: '-0.5%',
      status: kpiData.defectRate <= 3 ? 'success' as const : 'warning' as const,
      icon: AlertTriangle,
      target: '<3%',
      description: 'Giảm so với tuần trước'
    },
    {
      title: 'Hiệu suất OEE',
      value: kpiData.oeeRate.toString(),
      unit: '%',
      trend: 'up' as const,
      trendValue: '+1.8%',
      status: kpiData.oeeRate >= 80 ? 'success' as const : 'warning' as const,
      icon: Factory,
      target: '80%',
      description: 'Trung bình ca A+B'
    }
  ] : [];

  const defectChartData = defectDistribution.map((item, index) => ({
    name: item.defect_name,
    value: item.count,
    color: [
      'hsl(var(--destructive))',
      'hsl(var(--warning))',
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--muted))'
    ][index] || 'hsl(var(--muted))'
  }));

  const getStatusBadge = (status: string) => {
    const statusMap = {
      running: { label: 'Đang chạy', variant: 'default' as const },
      setup: { label: 'Chuẩn bị', variant: 'secondary' as const },
      stopped: { label: 'Dừng', variant: 'destructive' as const },
      completed: { label: 'Hoàn thành', variant: 'outline' as const }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      high: { label: 'Cao', className: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
      medium: { label: 'Trung bình', className: 'bg-warning/10 text-warning hover:bg-warning/20' },
      low: { label: 'Thấp', className: 'bg-success/10 text-success hover:bg-success/20' }
    };
    return priorityMap[priority as keyof typeof priorityMap] || { label: priority, className: '' };
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 lỗi (Pareto)</CardTitle>
            <CardDescription>Phân bố lỗi trong tuần</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={defectChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {defectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Lệnh sản xuất đang thực hiện
          </CardTitle>
          <CardDescription>
            Tình trạng các PO hiện tại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeProductionOrders.map((po: ProductionOrder) => {
              const progress = parseFloat(po.progress as any) || 0;
              const actualQty = po.actual_qty || 0;
              const statusInfo = getStatusBadge(po.status || 'Planned');
              
              return (
                <div key={po.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{po.code}</h4>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{po.products?.name || 'Sản phẩm không xác định'}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{actualQty}/{po.qty_plan}</div>
                      <div className="text-muted-foreground">Hạn: {po.end_plan || 'Chưa có'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{po.products?.name || 'Sản phẩm không xác định'}</span>
                      <span>{actualQty} / {po.qty_plan}</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tiến độ</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;