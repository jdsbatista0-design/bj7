import { contracts, billboards } from "@/data/mockData";
import { FileText, Calendar, ArrowUpDown } from "lucide-react";
import { useState } from "react";

const statusStyles = {
  active: "bg-success/10 text-success",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-primary/10 text-primary",
};
const statusLabels = { active: "Ativo", expired: "Expirado", cancelled: "Cancelado", pending: "Pendente" };
const typeLabels = { veiculacao: "Veiculação", locacao_terreno: "Locação de Terreno" };
const typeBadge = { veiculacao: "bg-primary/10 text-primary", locacao_terreno: "bg-info/10 text-info" };

export default function Contracts() {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = typeFilter === "all" ? contracts : contracts.filter(c => c.type === typeFilter);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-bold">Contratos</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão de contratos de veiculação e locação</p>
      </div>

      <div className="flex items-center gap-3">
        {["all", "veiculacao", "locacao_terreno"].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "Todos" : typeLabels[t as keyof typeof typeLabels]}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} contratos</span>
      </div>

      <div className="space-y-3">
        {filtered.map(c => {
          const cBillboards = c.billboards.map(bid => billboards.find(b => b.id === bid)).filter(Boolean);
          const months = Math.ceil((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / (30 * 24 * 60 * 60 * 1000));

          return (
            <div key={c.id} className={`stat-card ${c.type === "locacao_terreno" ? "stat-card-info" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{c.clientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">Contrato #{c.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadge[c.type]}`}>
                        {typeLabels[c.type]}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[c.status]}`}>
                  {statusLabels[c.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Pontos</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cBillboards.map(b => b && (
                      <span key={b.id} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">#{b.code}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-sm mt-1">
                    {new Date(c.startDate).toLocaleDateString("pt-BR")} — {new Date(c.endDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Mensal</p>
                  <p className="text-sm font-display font-semibold text-primary mt-1">R$ {c.monthlyValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="text-sm font-display font-semibold mt-1">R$ {c.totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renovação</p>
                  <p className="text-sm mt-1">{c.renewalType === "automatic" ? "Automática" : "Manual"}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                Pagamento: {c.paymentMethod} · {months} meses
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
