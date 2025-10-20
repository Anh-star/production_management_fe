import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MESSidebar } from '@/components/MESSidebar';
import { MESHeader } from '@/components/MESHeader';

interface MESLayoutProps {
  children: React.ReactNode;
  user?: {
    username: string;
    role: string;
    shift: string;
  };
  onLogout?: () => void;
}

const MESLayout: React.FC<MESLayoutProps> = ({ children, user, onLogout }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MESSidebar user={user} />
        <div className="flex-1 flex flex-col">
          <MESHeader user={user} onLogout={onLogout} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MESLayout;