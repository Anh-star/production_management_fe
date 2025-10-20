import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  BarChart3,
  Factory,
  Users,
  AlertCircle,
  Calendar,
  Wrench,
  Target
} from 'lucide-react';

interface MESSidebarProps {
  user?: {
    username: string;
    role: string;
    shift: string;
  };
}

export const MESSidebar: React.FC<MESSidebarProps> = ({ user }) => {
  const { state } = useSidebar();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Tổng quan',
      url: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'qc', 'planner', 'operator']
    },
    {
      title: 'Ghi nhận sản xuất',
      url: '/production',
      icon: Factory,
      roles: ['operator', 'admin']
    },
    {
      title: 'Kế hoạch sản xuất',
      url: '/planning',
      icon: Target,
      roles: ['planner', 'admin', 'qc']
    },
    {
      title: 'Kiểm soát chất lượng',
      url: '/quality',
      icon: AlertCircle,
      roles: ['qc', 'planner', 'admin', 'operator']
    }
  ];

  const masterDataItems = [
    {
      title: 'Sản phẩm',
      url: '/master/products',
      icon: ClipboardList,
      roles: ['admin', 'planner', 'qc']
    },
    {
      title: 'Công đoạn',
      url: '/master/operations',
      icon: Wrench,
      roles: ['admin', 'planner', 'qc']
    },
    {
      title: 'Mã lỗi',
      url: '/master/defects',
      icon: AlertCircle,
      roles: ['admin', 'qc', 'planner']
    },
    {
      title: 'Phân ca',
      url: '/master/shifts',
      icon: Calendar,
      roles: ['admin', 'planner']
    },
    {
      title: 'Người dùng',
      url: '/master/users',
      icon: Users,
      roles: ['admin']
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  const canAccess = (roles: string[]) => !user || roles.includes(user.role.toLowerCase());

  return (
    <Sidebar className={state === 'collapsed' ? 'w-14' : 'w-64'}>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Factory className="w-4 h-4 text-primary-foreground" />
          </div>
          {state !== 'collapsed' && (
            <div>
              <h2 className="font-bold text-lg">MES</h2>
              {user && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chức năng chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => canAccess(item.roles)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && ['admin', 'qc', 'planner'].includes(user.role.toLowerCase()) && (
          <SidebarGroup>
            <SidebarGroupLabel>Danh mục</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {masterDataItems.filter(item => canAccess(item.roles)).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {state !== 'collapsed' && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};