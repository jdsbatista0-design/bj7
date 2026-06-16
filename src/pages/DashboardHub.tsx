import { useState } from "react";
import { LayoutDashboard, DollarSign } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Dashboard from "./Dashboard";
import Financial from "./Financial";
import { cn } from "@/lib/utils";

export default function DashboardHub() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("tab") === "financial" ? "financial" : "overview";
  const [tab, setTab] = useState<"overview" | "financial">(initial);

  const switchTab = (t: "overview" | "financial") => {
    setTab(t);
    const np = new URLSearchParams(params);
    np.set("tab", t);
    setParams(np, { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 border-b border-border px-3 md:px-6 bg-card/40 backdrop-blur-sm shrink-0">
        <button
          onClick={() => switchTab("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            tab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-4 h-4" /> Visão Geral
        </button>
        <button
          onClick={() => switchTab("financial")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            tab === "financial" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <DollarSign className="w-4 h-4" /> Financeiro
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {tab === "overview" ? <Dashboard /> : <Financial />}
      </div>
    </div>
  );
}