import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Edit2, Clock, Search, Calendar, Loader2, Trash } from 'lucide-react';
import { z } from 'zod';
import { useShifts, type Shift } from '@/hooks/useShifts';

const shiftSchema = z.object({
  code: z.string().trim().min(1, "Mã ca không được để trống").max(10),
  name: z.string().trim().min(1, "Tên ca không được để trống").max(50),
  startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc")
});

type ShiftFormData = z.infer<typeof shiftSchema>;

const ShiftAssignmentPage: React.FC = () => {
  const { shifts, loading, createShift, updateShift, deleteShift, refetch } = useShifts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      code: '',
      name: '',
      startTime: '',
      endTime: ''
    }
  });

  const filteredShifts = shifts.filter(shift =>
    shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: ShiftFormData) => {
    if (editingShift) {
      await updateShift(editingShift.id, {
        code: data.code,
        name: data.name,
        start_time: data.startTime,
        end_time: data.endTime
      });
    } else {
      await createShift({
        code: data.code,
        name: data.name,
        start_time: data.startTime,
        end_time: data.endTime
      });
    }
    
    form.reset();
    setEditingShift(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    form.reset({
      code: shift.code,
      name: shift.name,
      startTime: shift.start_time,
      endTime: shift.end_time
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    form.reset();
    setEditingShift(null);
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  if (loading) {
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
          <h2 className="text-2xl font-bold">Quản lý ca làm việc</h2>
          <p className="text-muted-foreground">Cấu hình và phân công ca làm việc</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm ca mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingShift ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
              </DialogTitle>
              <DialogDescription>
                {editingShift 
                  ? 'Cập nhật thông tin ca làm việc'
                  : 'Nhập thông tin cho ca làm việc mới'
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã ca *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: CA-A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên ca *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Ca sáng" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ bắt đầu *</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ kết thúc *</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingShift ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Danh sách ca làm việc
          </CardTitle>
          <CardDescription>
            Tổng cộng {shifts.length} ca làm việc
          </CardDescription>
          
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã ca..."
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
                <TableHead>Tên ca</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <div className="font-medium">{shift.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-sm">
                        {formatTimeRange(shift.start_time, shift.end_time)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(shift)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (confirm('Bạn có chắc muốn xóa ca này?')) {
                            await deleteShift(shift.id);
                            refetch?.();
                          }
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredShifts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Không tìm thấy ca làm việc phù hợp' : 'Chưa có ca làm việc nào'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftAssignmentPage;