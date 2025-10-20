import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { productSchema, type ProductFormData } from '@/schemas';
import { Plus, Edit2, Package, Search, Loader2, Trash2 } from 'lucide-react';
import { useProducts, type Product } from '@/hooks/useProducts';
import { Switch } from '@/components/ui/switch';
import { useOperations, type Operation } from '@/hooks/useOperations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RoutingStepForm {
  operationId: string;
  stdTimeSec: number;
}

const ProductsPage: React.FC = () => {
  const { products, loading, createProduct, updateProduct } = useProducts();
  const { operations } = useOperations();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [routingSteps, setRoutingSteps] = useState<RoutingStepForm[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: '',
      name: '',
      version: '',
      unit: '',
      standardTime: ''
    }
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          code: data.code,
          name: data.name,
          version: data.version || null,
          uom: data.unit,
        });
      } else {
        await createProduct({
          code: data.code,
          name: data.name,
          version: data.version || null,
          uom: data.unit,
          quality_spec_json: null,
          is_active: true,
          routingSteps: routingSteps.map((step, index) => ({
            step_no: index + 1,
            operation_id: parseInt(step.operationId),
            std_time_sec: step.stdTimeSec,
          })),
        });
      }
      
      form.reset();
      setEditingProduct(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      code: product.code,
      name: product.name,
      version: product.version || '',
      unit: product.uom || '',
      standardTime: '0'
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (product: Product) => {
    await updateProduct(product.id, { 
      ...product,
      is_active: !product.is_active 
    });
  };

  const resetForm = () => {
    form.reset();
    setEditingProduct(null);
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
          <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
          <p className="text-muted-foreground">Danh mục sản phẩm và thông tin kỹ thuật</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Cập nhật thông tin sản phẩm'
                  : 'Nhập thông tin cho sản phẩm mới'
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
                        <FormLabel>Mã sản phẩm *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: MTR-X200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phiên bản</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: V1.0" {...field} />
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
                      <FormLabel>Tên sản phẩm *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn vị tính *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: pcs, set, kg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Routing Steps Section */}
                {!editingProduct && (
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Cấu hình Routing</h3>
                    {routingSteps.map((step, index) => (
                      <div key={index} className="flex items-end gap-2">
                        <div className="flex-1">
                          <FormLabel>Công đoạn {index + 1}</FormLabel>
                          <Select
                            value={step.operationId}
                            onValueChange={(value) => {
                              const newSteps = [...routingSteps];
                              newSteps[index].operationId = value;
                              setRoutingSteps(newSteps);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn công đoạn" />
                            </SelectTrigger>
                            <SelectContent>
                              {operations.filter(op => op.is_active).map(op => (
                                <SelectItem key={op.id} value={op.id.toString()}>
                                  {op.code} - {op.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24">
                          <FormLabel>TG Chuẩn (s)</FormLabel>
                          <Input
                            type="number"
                            value={step.stdTimeSec}
                            onChange={(e) => {
                              const newSteps = [...routingSteps];
                              newSteps[index].stdTimeSec = parseInt(e.target.value) || 0;
                              setRoutingSteps(newSteps);
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => setRoutingSteps(routingSteps.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRoutingSteps([...routingSteps, { operationId: '', stdTimeSec: 0 }])}
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm công đoạn
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
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
            <Package className="w-5 h-5" />
            Danh sách sản phẩm
          </CardTitle>
          <CardDescription>
            Tổng cộng {products.length} sản phẩm
          </CardDescription>
          
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
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
                <TableHead>Mã SP</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Phiên bản</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono">{product.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                  </TableCell>
                  <TableCell>{product.version || '-'}</TableCell>
                  <TableCell>{product.uom || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() => handleToggleActive(product)}
                      />
                      <span className="text-sm">
                        {product.is_active ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;