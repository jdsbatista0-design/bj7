import { workOrders } from "@/data/mockData";
import { Wrench, Clock, CheckCircle2, AlertTriangle, Play } from "lucide-react";

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, style: "bg-muted text-muted-foreground" },
  in_progress: { label: "Em Andamento", icon: Play, style: "bg-primary/10 text-primary" },
  completed: { label: "Concluída", icon: CheckCircle2, style: "bg-accent/10 text-accent" },
  overdue: { label: "Atrasada", icon: AlertTriangle, style: "bg-destructive/10 text-destructive" },
};
const typeLabels = { installation: "Instalação", swap: "Troca de Lona", maintenance: "Manutenção", inspection: "Vistoria" };

export default function Operations() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Operação</h1>
        <p className="text-muted-foreground text-sm mt-1">Ordens de serviço e SLA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workOrders.map(os => {
          const cfg = statusConfig[os.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={os.id} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{typeLabels[os.type]}</p>
                    <p className="text-xs text-muted-foreground">Placa #{os.billboardCode} · {os.assignee}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${cfg.style}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>

              <div className="mt-4 space-y-1.5">
                {os.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.done ? "bg-accent border-accent" : "border-border"}`}>
                      {item.done && <CheckCircle2 className="w-3 h-3 text-accent-foreground" />}
                    </div>
                    <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>SLA: {os.slaHours}h</span>
                <span>Prazo: {new Date(os.dueDate).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
