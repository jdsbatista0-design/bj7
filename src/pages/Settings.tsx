import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, Trash2, Eye, EyeOff, Clock, Users, Settings as SettingsIcon } from "lucide-react";

type AppRole = "admin" | "comercial" | "operacao" | "financeiro";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles: AppRole[];
}

interface AccessLog {
  id: string;
  user_email: string;
  action: string;
  details: string;
  created_at: string;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  comercial: "Comercial",
  operacao: "Operação",
  financeiro: "Financeiro",
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive",
  comercial: "bg-primary/10 text-primary",
  operacao: "bg-orange-500/10 text-orange-600",
  financeiro: "bg-emerald-500/10 text-emerald-600",
};

export default function Settings() {
  const { isAdmin, user } = useAuth();
  const [tab, setTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New user form
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [newRoles, setNewRoles] = useState<AppRole[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadLogs();
    }
  }, [isAdmin]);

  async function loadUsers() {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: allRoles } = await supabase.from("user_roles").select("*");

    if (profiles && allRoles) {
      const mapped: UserProfile[] = profiles.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        roles: allRoles.filter((r: any) => r.user_id === p.id).map((r: any) => r.role as AppRole),
      }));
      setUsers(mapped);
    }
    setLoading(false);
  }

  async function loadLogs() {
    const { data } = await supabase
      .from("access_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setLogs(data as AccessLog[]);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newName || !newPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    setCreating(true);

    // Use edge function to create user (admin only)
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const res = await supabase.functions.invoke("admin-create-user", {
      body: { email: newEmail, password: newPassword, fullName: newName, roles: newRoles },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.error) {
      toast.error(res.error.message || "Erro ao criar usuário");
    } else if (res.data?.error) {
      toast.error(res.data.error);
    } else {
      toast.success(`Usuário ${newEmail} criado com sucesso!`);
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      setNewRoles([]);
      loadUsers();
    }
    setCreating(false);
  }

  async function handleToggleRole(userId: string, role: AppRole, hasRole: boolean) {
    if (userId === user?.id && role === "admin") {
      toast.error("Você não pode remover seu próprio acesso de administrador");
      return;
    }

    if (hasRole) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role });
    }
    loadUsers();
    toast.success("Permissão atualizada");
  }

  if (!isAdmin) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground mt-2">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Configurações & Segurança</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Users className="w-4 h-4" />Usuários & Permissões
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "logs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Clock className="w-4 h-4" />Registro de Acessos
        </button>
      </div>

      {tab === "users" && (
        <div className="space-y-6">
          {/* Create user form */}
          <div className="glass-panel p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-primary" />
              Criar Novo Usuário
            </h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome completo</label>
                <input
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Nome do colaborador"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
                <input
                  type="email"
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Senha inicial</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary pr-10"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Permissões</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(Object.keys(ROLE_LABELS) as AppRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        newRoles.includes(role)
                          ? ROLE_COLORS[role] + " border-current"
                          : "bg-muted text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {ROLE_LABELS[role]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={creating} className="w-full md:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {creating ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </div>

          {/* Users list */}
          <div className="glass-panel p-5">
            <h3 className="font-semibold text-foreground mb-4">Usuários Cadastrados ({users.length})</h3>
            {loading ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{u.full_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 ml-4">
                      {(Object.keys(ROLE_LABELS) as AppRole[]).map(role => {
                        const has = u.roles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => handleToggleRole(u.id, role, has)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide transition-all border ${
                              has
                                ? ROLE_COLORS[role] + " border-current"
                                : "bg-transparent text-muted-foreground/40 border-border/50 hover:border-border"
                            }`}
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="glass-panel p-5">
          <h3 className="font-semibold text-foreground mb-4">Últimos 100 Acessos</h3>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum registro de acesso encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Data/Hora</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Usuário</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Ação</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 text-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 text-foreground">{log.user_email}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.action === "login" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
