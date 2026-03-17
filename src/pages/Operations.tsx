import { workOrders } from "@/data/mockData";
import { Wrench, Clock, CheckCircle2, AlertTriangle, Play, Camera } from "lucide-react";
import { useState } from "react";

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, style: "bg-muted text-muted-foreground", order: 2 },
  in_progress: { label: "Em Andamento", icon: Play, style: "bg-info/10 text-info", order: 1 },
  completed: { label: "Concluída", icon: CheckCircle2, style: "bg-success/10 text-success", order: 3 },
  overdue: { label: "Atrasada", icon: AlertTriangle, style: "bg-destructive/10 text-destructive", order: 0 },
};
const typeLabels = { installation: "Instalação", swap: "Troca de Lona", maintenance: "Manutenção", inspection: "Vistoria" };
const typeIcons = { installation: "🔧", swap: "🔄", maintenance: "🛠️", inspection: "👁️" };

export default function Operations() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all" ? workOrders : workOrders.filter(o => o.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => statusConfig[a.status].order - statusConfig[b.status].order);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-display font-bold">Operação</h1>
        <p className="text-muted-foreground text-sm mt-1">Ordens de serviço e SLA</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = workOrders.filter(o => o.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className={`stat-card ${statusFilter === key ? "ring-1 ring-primary" : ""} cursor-pointer hover:border-primary/30 transition-all text-left`}
            >
              <div className="flex items-center gap-2 mb-1">
                <cfg.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{cfg.label}</span>
              </div>
              <p className="text-xl font-display font-bold">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map(os => {
          const cfg = statusConfig[os.status];
          const StatusIcon = cfg.icon;
          const done = os.checklist.filter(c => c.done).length;
          const total = os.checklist.length;
          const progress = Math.round((done / total) * 100);

          return (
            <div key={os.id} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                    {typeIcons[os.type]}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{typeLabels[os.type]}</p>
                    <p className="text-xs text-muted-foreground">
                      Ponto #{os.billboardCode}
                      {os.clientName && ` · ${os.clientName}`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${cfg.style}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{done}/{total} ({progress}%)</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {os.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.done ? "bg-success border-success" : "border-border"}`}>
                      {item.done && <CheckCircle2 className="w-3 h-3 text-success-foreground" />}
                    </div>
                    <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>SLA: {os.slaHours}h · {os.assignee}</span>
                <span className={os.status === "overdue" ? "text-destructive font-semibold" : ""}>
                  Prazo: {new Date(os.dueDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
