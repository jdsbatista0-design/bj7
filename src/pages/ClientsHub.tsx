import { useState } from "react";
import { Users, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Clients from "./Clients";
import Contracts from "./Contracts";
import { cn } from "@/lib/utils";

export default function ClientsHub() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("tab") === "contracts" ? "contracts" : "clients";
  const [tab, setTab] = useState<"clients" | "contracts">(initial);

  const switchTab = (t: "clients" | "contracts") => {
    setTab(t);
    const np = new URLSearchParams(params);
    np.set("tab", t);
    setParams(np, { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 border-b border-border px-3 md:px-6 bg-card/40 backdrop-blur-sm shrink-0">
        <button
          onClick={() => switchTab("clients")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            tab === "clients" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" /> Clientes
        </button>
        <button
          onClick={() => switchTab("contracts")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            tab === "contracts" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="w-4 h-4" /> Contratos
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {tab === "clients" ? <Clients /> : <Contracts />}
      </div>
    </div>
  );
}