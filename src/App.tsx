import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/site" element={<PublicSite />} />
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
            <Route path="/crm" element={<AppLayout><CRM /></AppLayout>} />
            <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
            <Route path="/contracts" element={<AppLayout><Contracts /></AppLayout>} />
            <Route path="/operations" element={<AppLayout><Operations /></AppLayout>} />
            <Route path="/financial" element={<AppLayout><Financial /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
