import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) toast.error("Credenciais inválidas ou usuário não autorizado.");
    else toast.success("Login realizado!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-black tracking-tight">
            <span className="text-primary">BJ7</span>
            <span className="text-foreground ml-1">MÍDIA</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Sistema de Gestão OOH</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Acesso Restrito</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Aguarde..." : "Entrar"}
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center mt-4">
            Acesso exclusivo para colaboradores autorizados.
            <br />Solicite suas credenciais ao gestor.
          </p>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          BJ7 Mídia OOH © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
