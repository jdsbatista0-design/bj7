import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import logoBj7Icon from "@/assets/logo-bj7-icon.png";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { AppLayout } from "@/components/AppLayout";
import Inventory from "./pages/Inventory";
import CRM from "./pages/CRM";
import Operations from "./pages/Operations";
import ClientsHub from "./pages/ClientsHub";
import DashboardHub from "./pages/DashboardHub";
import PublicSite from "./pages/PublicSite";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <img src={logoBj7Icon} alt="BJ7" className="w-12 h-12 mx-auto mb-3 animate-pulse" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <img src={logoBj7Icon} alt="BJ7" className="w-12 h-12 mx-auto mb-3 animate-pulse" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicSite />} />
      <Route path="/login" element={user ? <Navigate to="/painel" replace /> : <Auth />} />
      {/* Protected */}
      <Route path="/painel" element={<ProtectedRoute><AppLayout><DashboardHub /></AppLayout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><AppLayout><Inventory /></AppLayout></ProtectedRoute>} />
      <Route path="/crm" element={<ProtectedRoute><AppLayout><CRM /></AppLayout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><AppLayout><ClientsHub /></AppLayout></ProtectedRoute>} />
      <Route path="/contracts" element={<Navigate to="/clients?tab=contracts" replace />} />
      <Route path="/operations" element={<ProtectedRoute><AppLayout><Operations /></AppLayout></ProtectedRoute>} />
      <Route path="/financial" element={<Navigate to="/painel?tab=financial" replace />} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PermissionsProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
        </PermissionsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
