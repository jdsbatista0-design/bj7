import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import CRM from "./pages/CRM";
import Clients from "./pages/Clients";
import Contracts from "./pages/Contracts";
import Operations from "./pages/Operations";
import Financial from "./pages/Financial";
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
        <h1 className="font-display text-2xl font-bold text-primary mb-2">BJ7 MÍDIA</h1>
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
        <h1 className="font-display text-2xl font-bold text-primary mb-2">BJ7 MÍDIA</h1>
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/site" element={<PublicSite />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><AppLayout><Inventory /></AppLayout></ProtectedRoute>} />
      <Route path="/crm" element={<ProtectedRoute><AppLayout><CRM /></AppLayout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><AppLayout><Clients /></AppLayout></ProtectedRoute>} />
      <Route path="/contracts" element={<ProtectedRoute><AppLayout><Contracts /></AppLayout></ProtectedRoute>} />
      <Route path="/operations" element={<ProtectedRoute><AppLayout><Operations /></AppLayout></ProtectedRoute>} />
      <Route path="/financial" element={<ProtectedRoute><AppLayout><Financial /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
