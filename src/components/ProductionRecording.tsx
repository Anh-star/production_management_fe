import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { productionRecordingSchema, type ProductionRecordingFormData } from '@/schemas';
import { useShifts } from '@/hooks/useShifts';
import { useProductionOrders } from '@/hooks/useProductionOrders';
import apiClient from '@/lib/apiClient';
import { useOperations } from '@/hooks/useOperations';
import { useDefectCodes } from '@/hooks/useDefectCodes';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useProductionReports } from '@/hooks/useProductionReports';
import {
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Clock,
  Factory,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

interface SelectedDefect {
  id: number;
  code: string;
  name: string;
  group: string | null;
}

interface ProductionSession {
  poId: string;
  operation: string;
  shift: string;
  line: string;
  startTime?: Date;
  isActive: boolean;
  prodReportId?: number;
}

const ProductionRecording: React.FC = () => {
  const lines = [
    { id: 'LINE-A', name: 'Dây chuyền A' },
    { id: 'LINE-B', name: 'Dây chuyền B' },
    { id: 'LINE-C', name: 'Dây chuyền C' }
  ];

  const [currentSession, setCurrentSession] = useState<ProductionSession>(() => {
    const saved = localStorage.getItem('productionSession');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          poId: parsed.poId || '',
          operation: parsed.operation || '',
          shift: parsed.shift || '',
          line: parsed.line || '',
          isActive: !!parsed.isActive,
          startTime: parsed.startTime ? new Date(parsed.startTime) : undefined,
          prodReportId: Number(parsed.prodReportId) || undefined,
        } as ProductionSession;
      } catch {
      }
    }
    return { poId: '', operation: '', shift: '', line: '', isActive: false } as ProductionSession;
  });
  const [selectedDefects, setSelectedDefects] = useState<SelectedDefect[]>([]);
  const [sessionTimer, setSessionTimer] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  const { shifts } = useShifts();
  const { productionOrders } = useProductionOrders(); 
  const { operations } = useOperations();
  const { defectCodes } = useDefectCodes();
  const { user, profile } = useAuth();
  const { refetch } = useDashboardData();
  const { fetchReportById } = useProductionReports();

  const form = useForm<ProductionRecordingFormData>({
    resolver: zodResolver(productionRecordingSchema),
    defaultValues: {
      okQuantity: '',
      ngQuantity: '',
      notes: ''
    }
  });


  const startSession = async () => {
    if (!currentSession?.poId || !currentSession?.operation || !currentSession?.shift || !currentSession?.line) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn đầy đủ thông tin PO, công đoạn, ca và dây chuyền",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiClient.post('/reports/start', {
        po_id: parseInt(currentSession.poId),
        operation_id: parseInt(currentSession.operation),
        shift_id: parseInt(currentSession.shift),
        line: currentSession.line,
      });

      setCurrentSession({
        ...currentSession,
        isActive: true,
        startTime: new Date(),
        prodReportId: response.data.report.id,
      });

      toast({
        title: "Bắt đầu ca làm việc",
        description: `Đã bắt đầu ghi nhận sản xuất cho ${currentSession.poId}`,
      });

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timerRef.current = window.setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'An active production report already exists for this task.') {
        setCurrentSession({
          ...currentSession,
          isActive: true,
          startTime: error.response.data.report.started_at ? new Date(error.response.data.report.started_at) : undefined,
          prodReportId: error.response.data.report.id,
        });
        toast({
          title: "Tiếp tục ca làm việc",
          description: "Đã tìm thấy ca làm việc đang hoạt động, tiếp tục ghi nhận.",
        });
      } else {
        toast({
          title: "Lỗi",
          description: error.response?.data?.message || "Không thể bắt đầu ca làm việc",
          variant: "destructive"
        });
      }
    }
  };

  const addDefectCode = (defectId: string) => {
    if (defectId === 'no_defect') {
      setSelectedDefects([]);
      return;
    }
    const defect = defectCodes.find(d => d.id.toString() === defectId);
    if (defect && !selectedDefects.find(d => d.id === defect.id)) {
      setSelectedDefects([...selectedDefects, defect]);
    }
  };

  const removeDefectCode = (defectId: number) => {
    setSelectedDefects(selectedDefects.filter(d => d.id !== defectId));
  };

  const handleStopSession = async () => {
    if (!currentSession?.isActive || !currentSession.prodReportId || typeof currentSession.prodReportId !== 'number') {
      toast({
        title: "Lỗi",
        description: "Chưa bắt đầu ca làm việc hoặc ID báo cáo không hợp lệ.",
        variant: "destructive"
      });
      return;
    }

    const ok = Number(form.getValues('okQuantity')) || 0;
    const ng = Number(form.getValues('ngQuantity')) || 0;
    const notes = form.getValues('notes') || '';

    try {
      const formData = new FormData();
      formData.append('prod_report_id', currentSession.prodReportId.toString());
      formData.append('qty_ok', ok.toString());
      formData.append('qty_ng', ng.toString());
      formData.append('note', notes);

      if (selectedDefects.length > 0 && ng > 0) {
        const defects = selectedDefects.map(d => ({
          defect_code_id: d.id,
          qty: Math.floor(ng / selectedDefects.length)
        }));
        formData.append('defects', JSON.stringify(defects));
      }

      formData.append('is_final', 'true');

      await apiClient.post('/reports/stop', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: "Ca làm việc đã kết thúc",
        description: `Đã ghi nhận cuối cùng: ${ok} OK, ${ng} NG. Sẵn sàng để bắt đầu ca mới.`,
      });
      
      resetSession();
      refetch();

    } catch (error: any) {
      console.error('Error stopping session:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể kết thúc ca làm việc.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: ProductionRecordingFormData) => {
    if (!currentSession?.isActive || !currentSession.startTime || !currentSession.prodReportId) {
      toast({
        title: "Lỗi",
        description: "Chưa bắt đầu ca làm việc hoặc không có ID báo cáo",
        variant: "destructive"
      });
      return;
    }
    
    if (!profile) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
        variant: "destructive"
      });
      return;
    }

    try {
      const ok = Number(data.okQuantity) || 0;
      const ng = Number(data.ngQuantity) || 0;

      const formData = new FormData();
      formData.append('prod_report_id', currentSession.prodReportId.toString());
      formData.append('qty_ok', ok.toString());
      formData.append('qty_ng', ng.toString());
      formData.append('note', data.notes || '');
      
      if (selectedDefects.length > 0 && ng > 0) {
        const defects = selectedDefects.map(d => ({
          defect_code_id: d.id,
          qty: Math.floor(ng / selectedDefects.length) 
        }));
        formData.append('defects', JSON.stringify(defects));
      }

      await apiClient.post('/reports/stop', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Ghi nhận thành công",
        description: `Đã ghi nhận thêm: ${ok} OK, ${ng} NG.`,
      });

      form.reset({ okQuantity: '', ngQuantity: '', notes: '' });
      setSelectedDefects([]);
      refetch();

    } catch (error: any) {
      console.error('Production recording error:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể ghi nhận sản lượng",
        variant: "destructive"
      });
    }
  };


  const resetSession = () => {
    localStorage.removeItem('productionSession');
    setCurrentSession({ poId: '', operation: '', shift: '', line: '', isActive: false });
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSessionTimer(0);
    form.reset();
    setSelectedDefects([]);
  };

  useEffect(() => {
    const toSave = {
      ...currentSession,
      startTime: currentSession.startTime ? currentSession.startTime.toISOString() : undefined,
    };
    localStorage.setItem('productionSession', JSON.stringify(toSave));
  }, [currentSession, currentSession.prodReportId]);

  useEffect(() => {
    const verifySession = async () => {
      if (currentSession.isActive && currentSession.prodReportId) {
        try {
          const report = await fetchReportById(currentSession.prodReportId);
          if (report && report.ended_at) {
            resetSession();
          }
        } catch (error) {
          console.error('Error verifying session with backend, resetting session:', error);
          resetSession();
        }
      }
    };

    verifySession();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (currentSession.isActive && currentSession.startTime) {
      setSessionTimer(Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000));
      timerRef.current = window.setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentSession.isActive, currentSession.startTime, currentSession.prodReportId, fetchReportById]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ghi nhận sản xuất</h2>
          <p className="text-muted-foreground">Thao tác cho công nhân vận hành</p>
        </div>
        {currentSession?.isActive && (
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="w-5 h-5 text-success" />
            <span>{formatTime(sessionTimer)}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Thiết lập ca làm việc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lệnh sản xuất (PO)</Label>
                <Select
                  value={currentSession.poId}
                  onValueChange={(value) => setCurrentSession((prev) => ({ ...prev, poId: value }))}
                  disabled={currentSession.isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {productionOrders.map(po => (
                      <SelectItem key={po.id} value={po.id.toString()}>
                        <div className="space-y-1">
                          <div className="font-medium">{po.code}</div>
                          <div className="text-sm text-muted-foreground">{po.products?.name || 'Sản phẩm không xác định'}</div>
                          <Badge variant="secondary" className="text-xs">Kế hoạch: {po.qty_plan}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Công đoạn</Label>
                <Select
                  value={currentSession.operation}
                  onValueChange={(value) => setCurrentSession((prev) => ({ ...prev, operation: value }))}
                  disabled={currentSession.isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn công đoạn" />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.filter(op => op.is_active).map(op => (
                      <SelectItem key={op.id} value={op.id.toString()}>
                        <div>
                          <div className="font-medium">{op.name}</div>
                          <div className="text-sm text-muted-foreground">Máy: {op.machine_type || 'Không xác định'}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ca</Label>
                  <Select
                    value={currentSession.shift}
                    onValueChange={(value) => setCurrentSession((prev) => ({ ...prev, shift: value }))}
                    disabled={currentSession.isActive}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ca">
                        {currentSession.shift ? 
                          shifts.find(s => s.id.toString() === currentSession.shift)?.name + 
                          ' (' + shifts.find(s => s.id.toString() === currentSession.shift)?.start_time + 
                          ' - ' + shifts.find(s => s.id.toString() === currentSession.shift)?.end_time + ')'
                          : ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map(shift => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.name} ({shift.start_time} - {shift.end_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dây chuyền</Label>
                  <Select
                    value={currentSession.line}
                    onValueChange={(value) => setCurrentSession((prev) => ({ ...prev, line: value }))}
                    disabled={currentSession.isActive}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Line" />
                    </SelectTrigger>
                    <SelectContent>
                      {lines.map(line => (
                        <SelectItem key={line.id} value={line.id}>{line.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {!currentSession?.isActive ? (
                  <Button onClick={startSession} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Bắt đầu ca làm việc
                  </Button>
                ) : (
                  <Button onClick={handleStopSession} variant="destructive" className="w-full" size="lg">
                    <Square className="w-4 h-4 mr-2" />
                    Kết thúc ca làm việc
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ghi nhận sản lượng</CardTitle>
              <CardDescription>
                Nhập số lượng sản phẩm đạt và không đạt yêu cầu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="okQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            Số lượng OK
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Nhập số lượng đạt"
                              disabled={!currentSession?.isActive}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ngQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            Số lượng NG
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Nhập số lượng lỗi"
                              disabled={!currentSession?.isActive}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Mã lỗi
                      </Label>
                    </div>

                    <Select onValueChange={addDefectCode} disabled={!currentSession?.isActive}>
                      <SelectTrigger>
                        <SelectValue placeholder="Thêm mã lỗi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_defect">Không có lỗi</SelectItem>
                        {defectCodes.filter(d => d.is_active).map(defect => (
                          <SelectItem key={defect.id} value={defect.id.toString()}>
                            <div>
                              <div className="font-medium">{defect.code} - {defect.name}</div>
                              <div className="text-sm text-muted-foreground">{defect.group || 'Không phân loại'}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedDefects.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedDefects.map(defect => (
                          <Badge key={defect.id} variant="secondary" className="gap-1">
                            {defect.code} - {defect.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeDefectCode(defect.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Ghi chú
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Thêm ghi chú nếu cần..."
                            disabled={!currentSession?.isActive}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <Button 
                    type="submit"
                    className="w-full" 
                    size="lg"
                    disabled={!currentSession?.isActive}
                  >
                    Ghi nhận sản lượng
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductionRecording;