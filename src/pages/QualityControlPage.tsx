import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertCircle, TrendingUp, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useProductionReports, ProductionReport } from '@/hooks/useProductionReports';
import { format, parseISO } from 'date-fns';
import { ReportDetailsDialog } from '@/components/ReportDetailsDialog';

const QualityControlPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { kpiData, defectDistribution, loading } = useDashboardData();
  const { reports: productionReports, loading: reportsLoading, updateReport } = useProductionReports();
  const [selectedReport, setSelectedReport] = useState<ProductionReport | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredReports = productionReports.filter(report => {
    const poCode = report.production_orders?.code || '';
    const operationName = report.operations?.name || '';
    const line = report.line || '';
    return poCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           operationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           line.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleViewDetails = (report: ProductionReport) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  const handleRevertStatus = async (reportId: number) => {
    await updateReport(reportId, { ended_at: null } as Partial<ProductionReport>);
    setIsDetailsOpen(false);
  };

  const getDefectRateColor = (rate: number) => {
    if (rate <= 2) return 'text-green-600';
    if (rate <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'dd/MM/yy HH:mm');
    } catch (error) {
      console.error("Invalid date format:", dateTimeString);
      return "Invalid Date";
    }
  };

  const displayDefectRate = kpiData && typeof kpiData.defectRate === 'number' && !isNaN(kpiData.defectRate)
    ? kpiData.defectRate
    : 0;

  const totalDefects = defectDistribution.reduce((sum, item) => sum + item.count, 0) || 0;

  if (loading || reportsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kiểm soát chất lượng</h2>
          <p className="text-muted-foreground">Theo dõi và phân tích chất lượng sản xuất</p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lỗi hôm nay</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayDefectRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Mục tiêu: &lt;3%
            </p>
            <Progress value={displayDefectRate} max={10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lỗi phát hiện</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDefects}</div>
            <p className="text-xs text-muted-foreground">
              Trong 7 ngày qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Báo cáo chất lượng</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Báo cáo hôm nay
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Báo cáo sản xuất</TabsTrigger>
          <TabsTrigger value="defects">Phân tích lỗi</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Báo cáo ghi nhận sản xuất
              </CardTitle>
              <CardDescription>
                Danh sách các báo cáo sản xuất đã ghi nhận với thông tin chất lượng
              </CardDescription>
              
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo PO, công đoạn, dây chuyền..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Công đoạn</TableHead>
                    <TableHead>Dây chuyền</TableHead>
                    <TableHead>Số lượng OK</TableHead>
                    <TableHead>Số lượng NG</TableHead>
                    <TableHead>Tỷ lệ lỗi</TableHead>
                    <TableHead>Ca</TableHead>
                    <TableHead>Bắt đầu</TableHead>
                    <TableHead>Kết thúc</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report, index) => {
                    const defectRate = report.qty_ok > 0 
                      ? ((report.qty_ng / report.qty_ok) * 100).toFixed(1) 
                      : (report.qty_ng > 0 ? '100.0' : '0.0');
                    
                    return (
                      <TableRow key={report.id || index}>
                        <TableCell className="font-medium">
                          {report.po_code || 'N/A'}
                        </TableCell>
                        <TableCell>{report.operation_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.line || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{report.qty_ok}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="font-medium">{report.qty_ng}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getDefectRateColor(parseFloat(defectRate))}`}>
                            {defectRate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.shift_name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(report.started_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(report.ended_at)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(report)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Không tìm thấy báo cáo phù hợp' : 'Chưa có báo cáo nào'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Phân tích lỗi (Top 5)
              </CardTitle>
              <CardDescription>
                Thống kê các loại lỗi phổ biến trong tuần
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defectDistribution.map((item, index) => {
                  const totalDefects = defectDistribution.reduce((sum, d) => sum + d.count, 0);
                  const percentage = totalDefects > 0 ? ((item.count / totalDefects) * 100).toFixed(1) : '0.0';
                  return (
                  <div key={`${item.defect_name}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.defect_name}</div>
                        <div className="text-sm text-muted-foreground">Số lỗi: {item.count}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {percentage}%
                    </Badge>
                  </div>
                  );
                })}
                
                {defectDistribution.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có dữ liệu lỗi trong tuần
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ReportDetailsDialog
        report={selectedReport}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onRevertStatus={handleRevertStatus}
      />
    </div>
  );
};

export default QualityControlPage;