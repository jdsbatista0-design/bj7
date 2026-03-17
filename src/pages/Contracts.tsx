import { contracts, billboards } from "@/data/mockData";
import { Calendar, FileText } from "lucide-react";

const statusStyles = {
  active: "bg-accent/10 text-accent",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};
const statusLabels = { active: "Ativo", expired: "Expirado", cancelled: "Cancelado" };

export default function Contracts() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Contratos</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão de contratos e ocupação de placas</p>
      </div>

      <div className="space-y-4">
        {contracts.map(c => {
          const cBillboards = c.billboards.map(bid => billboards.find(b => b.id === bid)).filter(Boolean);
          return (
            <div key={c.id} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{c.clientName}</p>
                    <p className="text-xs text-muted-foreground">Contrato #{c.id}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[c.status]}`}>
                  {statusLabels[c.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Placas</p>
                  <div className="flex gap-1 mt-1">
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
                  <p className="text-sm font-display font-semibold text-accent mt-1">R$ {c.monthlyValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="text-sm font-display font-semibold mt-1">
                    R$ {(c.monthlyValue * Math.ceil((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / (30 * 24 * 60 * 60 * 1000))).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
