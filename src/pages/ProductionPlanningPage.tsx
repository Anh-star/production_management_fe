import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Package, Calendar, Target, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { productionOrderSchema, type ProductionOrderFormData } from '@/schemas';
import { useProductionOrders, type ProductionOrder } from '@/hooks/useProductionOrders';
import { useProducts } from '@/hooks/useProducts';

const ProductionPlanningPage = () => {
  const { productionOrders, loading: poLoading, createProductionOrder, updateProductionOrder, deleteProductionOrder } = useProductionOrders();
  const { products, loading: productsLoading } = useProducts();

  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<ProductionOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const poForm = useForm<ProductionOrderFormData>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      poNumber: '',
      productId: '',
      plannedQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  React.useEffect(() => {
    if (isPODialogOpen && !editingPO) {
      poForm.reset({
        poNumber: '',
        productId: '',
        plannedQuantity: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isPODialogOpen, editingPO, poForm]);

  const onSubmitPO = async (data: ProductionOrderFormData) => {
    setSubmitting(true);
    try {
      if (editingPO) {
        await updateProductionOrder(editingPO.id, {
          code: data.poNumber,
          product_id: parseInt(data.productId),
          qty_plan: data.plannedQuantity,
          start_plan: data.startDate,
          end_plan: data.endDate,
          status: 'Planned'
        });
      } else {
        await createProductionOrder({
          code: data.poNumber,
          product_id: parseInt(data.productId),
          qty_plan: data.plannedQuantity,
          start_plan: data.startDate,
          end_plan: data.endDate,
          status: 'Planned',
          notes: data.notes
        });
      }
      handleClosePODialog();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePODialog = () => {
    setIsPODialogOpen(false);
    setEditingPO(null);
    poForm.reset();
  };

  const handleEditPO = (po: ProductionOrder) => {
    setEditingPO(po);
    poForm.reset({
      poNumber: po.code,
      productId: po.product_id.toString(),
      plannedQuantity: po.qty_plan,
      startDate: po.start_plan || '',
      endDate: po.end_plan || '',
      notes: ''
    });
    setIsPODialogOpen(true);
  };

  const handleDeletePO = async (id: number) => {
    await deleteProductionOrder(id);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Planned': { label: 'Đã lên kế hoạch', variant: 'secondary' as const },
      'In Progress': { label: 'Đang thực hiện', variant: 'default' as const },
      'Completed': { label: 'Hoàn thành', variant: 'outline' as const },
      'Cancelled': { label: 'Đã hủy', variant: 'destructive' as const }
    };
    const s = variants[status as keyof typeof variants] || { label: status, variant: 'secondary' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  if (poLoading || productsLoading) {
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
          <h1 className="text-2xl font-bold">Kế hoạch sản xuất</h1>
          <p className="text-muted-foreground">Quản lý Production Orders</p>
        </div>
        <Dialog open={isPODialogOpen} onOpenChange={setIsPODialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPO(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo PO mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPO ? 'Sửa Production Order' : 'Tạo Production Order mới'}
              </DialogTitle>
            </DialogHeader>
            <Form {...poForm}>
              <form onSubmit={poForm.handleSubmit(onSubmitPO)} className="space-y-4">
                <FormField
                  control={poForm.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số PO</FormLabel>
                      <FormControl>
                        <Input placeholder="PO2024001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={poForm.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sản phẩm</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn sản phẩm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.filter(product => product.is_active && product.has_active_routing).map(product => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.code} - {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={poForm.control}
                  name="plannedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng kế hoạch</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={poForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={poForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingPO ? 'Đang cập nhật...' : 'Đang tạo...'}
                      </>
                    ) : (
                      editingPO ? 'Cập nhật' : 'Tạo PO'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClosePODialog}>
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
          <CardTitle>Danh sách Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số PO</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.code}</TableCell>
                  <TableCell>
                    <div key={`product-name-${po.id}`} className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {po.product_name || 'Sản phẩm không xác định'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div key={`planned-qty-${po.id}`} className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {po.qty_plan}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div key={`plan-dates-${po.id}`} className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div key={`start-plan-${po.id}`}>{po.start_plan ? format(new Date(po.start_plan), 'yyyy-MM-dd') : 'Chưa có'}</div>
                        <div key={`end-plan-${po.id}`} className="text-muted-foreground">đến {po.end_plan ? format(new Date(po.end_plan), 'yyyy-MM-dd') : 'Chưa có'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(po.status || 'Planned')}
                  </TableCell>
                  <TableCell>
                    <div key={`actions-${po.id}`} className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPO(po)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePO(po.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionPlanningPage;