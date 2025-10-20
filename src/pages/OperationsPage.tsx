import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { operationSchema, type OperationFormData } from '@/schemas';
import { Plus, Edit2, Wrench, Search, Clock, Loader2, Trash } from 'lucide-react';
import { useOperations, type Operation } from '@/hooks/useOperations';
import { Switch } from '@/components/ui/switch';

const OperationsPage: React.FC = () => {
  const { operations, loading, createOperation, updateOperation, deleteOperation } = useOperations();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      code: '',
      name: '',
      machineType: '',
      targetTime: '',
      description: ''
    }
  });

  const filteredOperations = operations.filter((operation: Operation) =>
    operation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (operation.machine_type && operation.machine_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onSubmit = async (data: OperationFormData) => {
    try {
      if (editingOperation) {
        await updateOperation(editingOperation.id, {
          code: data.code,
          name: data.name,
          machine_type: data.machineType || null,
          takt_target_sec: parseInt(data.targetTime) || null,
        });
      } else {
        await createOperation({
          code: data.code,
          name: data.name,
          machine_type: data.machineType || null,
          takt_target_sec: parseInt(data.targetTime) || null,
          is_active: true
        });
      }
      
      form.reset();
      setEditingOperation(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving operation:', error);
    }
  };

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation);
    form.reset({
      code: operation.code,
      name: operation.name,
      machineType: operation.machine_type || '',
      targetTime: operation.takt_target_sec?.toString() || '',
      description: ''
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (operation: Operation) => {
    await updateOperation(operation.id, { 
      ...operation,
      is_active: !operation.is_active 
    });
  };

  const resetForm = () => {
    form.reset();
    setEditingOperation(null);
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
          <h2 className="text-2xl font-bold">Quản lý công đoạn</h2>
          <p className="text-muted-foreground">Danh mục các công đoạn sản xuất</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm công đoạn
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingOperation ? 'Chỉnh sửa công đoạn' : 'Thêm công đoạn mới'}
              </DialogTitle>
              <DialogDescription>
                {editingOperation 
                  ? 'Cập nhật thông tin công đoạn'
                  : 'Nhập thông tin cho công đoạn mới'
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
                        <FormLabel>Mã công đoạn *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: OP-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="machineType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại máy</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: CNC, Assembly" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên công đoạn *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên công đoạn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian mục tiêu (giây)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingOperation ? 'Cập nhật' : 'Thêm mới'}
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
            <Wrench className="w-5 h-5" />
            Danh sách công đoạn
          </CardTitle>
          <CardDescription>
            Tổng cộng {operations.length} công đoạn
          </CardDescription>
          
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã hoặc loại máy..."
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
                <TableHead>Mã công đoạn</TableHead>
                <TableHead>Tên công đoạn</TableHead>
                <TableHead>Loại máy</TableHead>
                <TableHead>Thời gian mục tiêu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((operation: Operation) => (
                <TableRow key={operation.id}>
                  <TableCell className="font-mono">{operation.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{operation.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{operation.machine_type || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{operation.takt_target_sec || 0} giây</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={operation.is_active}
                        onCheckedChange={() => handleToggleActive(operation)}
                      />
                      <span className="text-sm">
                        {operation.is_active ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(operation)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (confirm('Bạn có chắc muốn xóa công đoạn này?')) {
                            await deleteOperation(operation.id);
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
          
          {filteredOperations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Không tìm thấy công đoạn phù hợp' : 'Chưa có công đoạn nào'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationsPage;