import { usePermissions, type PermissionModule, type PermissionAction } from "@/contexts/PermissionsContext";
import { Shield } from "lucide-react";

interface PermissionGateProps {
  module: PermissionModule;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** If true, hides completely instead of showing fallback */
  hide?: boolean;
}

/** Wraps children and only renders if the user has the required permission */
export function PermissionGate({ module, action, children, fallback, hide }: PermissionGateProps) {
  const { can, loading } = usePermissions();
  if (loading) return null;
  if (can(module, action)) return <>{children}</>;
  if (hide) return null;
  if (fallback) return <>{fallback}</>;
  return null;
}

/** Full-page block when user doesn't have view permission for a module */
export function PermissionPageBlock({ module, label }: { module: PermissionModule; label: string }) {
  const { can, loading } = usePermissions();
  if (loading) return null;
  if (can(module, "can_view")) return null;
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground mt-2">Você não tem permissão para acessar {label}.</p>
        <p className="text-muted-foreground text-sm">Solicite acesso ao administrador.</p>
      </div>
    </div>
  );
}
