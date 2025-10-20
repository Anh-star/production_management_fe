import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, User, Mail, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { userSchema, type UserFormData } from '@/schemas';
import { useUsers, type User as UserType } from '@/hooks/useUsers';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import UserPasswordDialog from '@/components/UserPasswordDialog';

const UsersPage = () => {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      fullName: '',
      password: '',
      role: 'operator',
      teamId: undefined,
      isActive: true
    }
  });

  const onSubmit = async (data: UserFormData) => {
    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          username: data.username,
          name: data.fullName,
          role: data.role,
          team_id: data.teamId,
          is_active: data.isActive
        });
      } else {
        await createUser({
          username: data.username,
          password: data.password,
          name: data.fullName,
          role: data.role,
          team_id: data.teamId,
          is_active: data.isActive,
        });
      }
      handleCloseDialog();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      fullName: user.name || '',
      password: '',
      role: user.role,
      teamId: user.team_id || undefined,
      isActive: user.is_active !== false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
  };

  const handleToggleActive = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (user) {
      await updateUser(id, { is_active: !user.is_active });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    form.reset();
  };

  const getRoleBadge = (role: string | null) => {
    const variants = {
      admin: { label: 'Quản trị viên', variant: 'destructive' as const },
      planner: { label: 'Kế hoạch', variant: 'default' as const },
      operator: { label: 'Vận hành', variant: 'secondary' as const },
      qc: { label: 'Kiểm tra chất lượng', variant: 'outline' as const }
    };
    const roleData = variants[(role || '').toLowerCase() as keyof typeof variants];
    if (!roleData) {
      return <Badge variant="secondary">{role}</Badge>;
    }
    return <Badge variant={roleData.variant}>{roleData.label}</Badge>;
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý tài khoản và quyền hạn người dùng</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
                </DialogTitle>
              </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input placeholder="nguyen.van.a" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Admin">Quản trị viên</SelectItem>
                          <SelectItem value="Planner">Kế hoạch</SelectItem>
                          <SelectItem value="Operator">Vận hành</SelectItem>
                          <SelectItem value="QC">Kiểm tra chất lượng</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!editingUser && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID nhóm</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="123" 
                          {...field} 
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Kích hoạt</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Cho phép người dùng đăng nhập hệ thống
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <div className="flex gap-2">
                   <Button type="submit" disabled={submitting}>
                     {submitting ? (
                       <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         {editingUser ? 'Đang cập nhật...' : 'Đang thêm...'}
                       </>
                     ) : (
                       editingUser ? 'Cập nhật' : 'Thêm mới'
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
          
          <ChangePasswordDialog>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Đổi mật khẩu
            </Button>
          </ChangePasswordDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.filter(user => user && typeof user.id === 'number').map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || 'Chưa có tên'}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role || '')}</TableCell>
                  <TableCell>Team {user.team_id || 'Chưa phân'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_active !== false}
                        onCheckedChange={() => handleToggleActive(user.id)}
                      />
                      <span className="text-sm">
                        {user.is_active !== false ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <UserPasswordDialog userId={user.id} username={user.username}>
                        <Button variant="outline" size="sm" title="Đổi mật khẩu">
                          <Shield className="w-4 h-4" />
                        </Button>
                      </UserPasswordDialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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

export default UsersPage;