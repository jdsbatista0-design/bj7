import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      else toast.success("Login realizado!");
    } else {
      if (!fullName.trim()) { toast.error("Informe seu nome"); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error.message);
      else toast.success("Conta criada com sucesso! Faça login.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-black tracking-tight">
            <span className="text-primary">BJ7</span>
            <span className="text-foreground ml-1">MÍDIA</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Sistema de Gestão OOH</p>
        </div>

        <div className="glass-panel p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LogIn className="w-4 h-4 inline mr-1.5" />Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${!isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" />Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome completo</label>
                <input
                  className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            )}
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
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          BJ7 Mídia OOH © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
