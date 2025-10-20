import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Loader2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { defectCodeSchema, type DefectCodeFormData } from '@/schemas';
import { useDefectCodes, type DefectCode } from '@/hooks/useDefectCodes';

const DefectCodesPage = () => {
  const { defectCodes, loading, createDefectCode, updateDefectCode, deleteDefectCode, toggleDefectCodeStatus, refetch } = useDefectCodes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<DefectCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [defectToDeleteId, setDefectToDeleteId] = useState<number | null>(null);

  const form = useForm<DefectCodeFormData>({
    resolver: zodResolver(defectCodeSchema),
    defaultValues: {
      code: '',
      description: '',
      category: 'surface',
      severity: 'minor'
    }
  });

  const onSubmit = async (data: DefectCodeFormData) => {
    setSubmitting(true);
    try {
      let result;
      if (editingDefect) {
        result = await updateDefectCode(editingDefect.id, {
          code: data.code,
          name: data.description,
          group: data.category,
          severity: data.severity,
          is_active: editingDefect.is_active 
        });
      } else {
        result = await createDefectCode({
          code: data.code,
          name: data.description,
          group: data.category,
          severity: data.severity,
          is_active: true
        });
      }
      
      if (result?.success) {
        handleCloseDialog();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (defect: DefectCode) => {
    setEditingDefect(defect);
    form.reset({
      code: defect.code,
      description: defect.name,
      category: defect.group || 'surface',
      severity: defect.severity || 'minor'
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDefect(null);
    form.reset();
  };

  const handleToggleStatus = async (defect: DefectCode) => {
    await toggleDefectCodeStatus(defect.id, !defect.is_active);
    refetch?.();
  };

  const handleConfirmDelete = async () => {
    if (defectToDeleteId) {
      await deleteDefectCode(defectToDeleteId);
      refetch?.();
      setIsConfirmDeleteDialogOpen(false);
      setDefectToDeleteId(null);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      minor: 'secondary',
      major: 'destructive',
      critical: 'destructive'
    } as const;
    return <Badge variant={variants[severity as keyof typeof variants]}>{severity}</Badge>;
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return 'Không phân loại';
    const labels = {
      surface: 'Bề mặt',
      dimensional: 'Kích thước',
      appearance: 'Ngoại quan',
      functional: 'Chức năng',
      material: 'Vật liệu'
    } as const;
    return labels[category as keyof typeof labels] || category;
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
          <h1 className="text-2xl font-bold">Quản lý mã lỗi</h1>
          <p className="text-muted-foreground">Quản lý danh sách các mã lỗi chất lượng</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDefect(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm mã lỗi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDefect ? 'Sửa mã lỗi' : 'Thêm mã lỗi mới'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã lỗi</FormLabel>
                      <FormControl>
                        <Input placeholder="D001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả chi tiết lỗi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="surface">Bề mặt</SelectItem>
                          <SelectItem value="dimensional">Kích thước</SelectItem>
                          <SelectItem value="appearance">Ngoại quan</SelectItem>
                          <SelectItem value="functional">Chức năng</SelectItem>
                          <SelectItem value="material">Vật liệu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mức độ nghiêm trọng</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minor">Nhẹ</SelectItem>
                          <SelectItem value="major">Nghiêm trọng</SelectItem>
                          <SelectItem value="critical">Rất nghiêm trọng</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="flex gap-2">
                   <Button type="submit" disabled={submitting}>
                     {submitting ? (
                       <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         {editingDefect ? 'Đang cập nhật...' : 'Đang thêm...'}
                       </>
                     ) : (
                       editingDefect ? 'Cập nhật' : 'Thêm mới'
                     )}
                   </Button>
                   <Button type="button" variant="outline" onClick={handleCloseDialog}>
                     Hủy
                   </Button>
                 </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách mã lỗi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lỗi</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Mức độ nghiêm trọng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defectCodes.map((defect) => (
                <TableRow key={defect.id}>
                  <TableCell className="font-medium">{defect.code}</TableCell>
                  <TableCell>{defect.name}</TableCell>
                  <TableCell>{getCategoryLabel(defect.group)}</TableCell>
                  <TableCell>{defect.severity ? getSeverityBadge(defect.severity) : 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={defect.is_active ? 'default' : 'destructive'}>
                      {defect.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(defect)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={defect.is_active ?? false}
                      onCheckedChange={() => handleToggleStatus(defect)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDefectToDeleteId(defect.id);
                        setIsConfirmDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa mã lỗi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã lỗi này không? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DefectCodesPage;