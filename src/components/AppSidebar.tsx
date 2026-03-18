import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import logoBj7 from "@/assets/logo-bj7.png";
import logoBj7Icon from "@/assets/logo-bj7-icon.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Map,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Kanban,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/painel", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inventory", label: "Inventário", icon: Map },
  { path: "/crm", label: "Comercial", icon: Kanban },
  { path: "/clients", label: "Clientes", icon: Users },
  { path: "/contracts", label: "Contratos", icon: FileText },
  { path: "/operations", label: "Operação", icon: Wrench },
  { path: "/financial", label: "Financeiro", icon: DollarSign },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <a href="/site" target="_blank" rel="noopener noreferrer" className="h-16 flex items-center px-3 border-b border-sidebar-border gap-2 cursor-pointer hover:opacity-80 transition-opacity">
        {collapsed ? (
          <img src={logoBj7Icon} alt="BJ7" className="w-10 h-10 rounded-lg object-contain" />
        ) : (
          <img src={logoBj7} alt="BJ7 Mídia" className="h-9 w-auto object-contain" />
        )}
      </a>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* User + Settings + Logout */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {!collapsed && user && (
          <p className="text-[10px] text-muted-foreground truncate px-2">{user.email}</p>
        )}
        {isAdmin && (
          <RouterNavLink
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
              location.pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Configurações</span>}
          </RouterNavLink>
        )}
        <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 flex items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
