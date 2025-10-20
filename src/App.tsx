import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import MESLayout from "@/components/MESLayout";
import Dashboard from "@/components/Dashboard";
import ProductionRecording from "@/components/ProductionRecording";
import ProductsPage from '@/pages/ProductsPage';
import OperationsPage from '@/pages/OperationsPage';
import DefectCodesPage from '@/pages/DefectCodesPage';
import ShiftAssignmentPage from '@/pages/ShiftAssignmentPage';
import UsersPage from '@/pages/UsersPage';
import ProductionPlanningPage from '@/pages/ProductionPlanningPage';
import QualityControlPage from '@/pages/QualityControlPage';
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const mesUser = {
    username: user.name || user.username,
    role: user.role || 'operator',
    shift: 'A'
  };

  return (
    <BrowserRouter>
      <MESLayout user={mesUser} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/production" element={<ProductionRecording />} />
          <Route path="/planning" element={<ProductionPlanningPage />} />
          <Route path="/quality" element={<QualityControlPage />} />
          <Route path="/master/products" element={<ProductsPage />} />
          <Route path="/master/operations" element={<OperationsPage />} />
          <Route path="/master/defects" element={<DefectCodesPage />} />
          <Route path="/master/shifts" element={<ShiftAssignmentPage />} />
          <Route path="/master/users" element={<UsersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MESLayout>
    </BrowserRouter>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;