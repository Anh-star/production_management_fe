import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, Clock, User } from 'lucide-react';

interface MESHeaderProps {
  user?: {
    username: string;
    role: string;
    shift: string;
  };
  onLogout?: () => void;
}

export const MESHeader: React.FC<MESHeaderProps> = ({ user, onLogout }) => {
  const currentTime = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    planner: 'Kế hoạch sản xuất',
    qc: 'Kiểm soát chất lượng',
    operator: 'Công nhân vận hành'
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger />
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.name || user.username}</span>
                <Badge variant="secondary">{roleLabels[user.role]}</Badge>
              </div>
              
              {onLogout && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};