import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PermissionModule = "inventario" | "clientes" | "contratos" | "comercial" | "operacao" | "financeiro";
export type PermissionAction = "can_view" | "can_create" | "can_edit" | "can_delete";

export const MODULE_LABELS: Record<PermissionModule, string> = {
  inventario: "Inventário / Pontos",
  clientes: "Clientes",
  contratos: "Contratos",
  comercial: "Comercial / CRM",
  operacao: "Operação / OS",
  financeiro: "Financeiro",
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
  can_view: "Visualizar",
  can_create: "Criar",
  can_edit: "Editar",
  can_delete: "Excluir",
};

export const ALL_MODULES: PermissionModule[] = ["inventario", "clientes", "contratos", "comercial", "operacao", "financeiro"];
export const ALL_ACTIONS: PermissionAction[] = ["can_view", "can_create", "can_edit", "can_delete"];

export interface UserPermission {
  user_id: string;
  module: PermissionModule;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface PermissionsContextType {
  permissions: UserPermission[];
  loading: boolean;
  can: (module: PermissionModule, action: PermissionAction) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionsProvider");
  return ctx;
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) { setPermissions([]); setLoading(false); return; }
    const { data } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", user.id);
    if (data) setPermissions(data as UserPermission[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const can = useCallback((module: PermissionModule, action: PermissionAction): boolean => {
    // Admins can do everything
    if (isAdmin) return true;
    const perm = permissions.find(p => p.module === module);
    if (!perm) return false;
    return perm[action];
  }, [permissions, isAdmin]);

  return (
    <PermissionsContext.Provider value={{ permissions, loading, can, refreshPermissions: fetchPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}
