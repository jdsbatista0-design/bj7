import { useData, WorkOrder } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { Wrench, Clock, CheckCircle2, AlertTriangle, Play, Plus, X, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusConfig: Record<string, any> = {
  pending: { label: "Pendente", icon: Clock, style: "bg-muted text-muted-foreground", order: 2 },
  in_progress: { label: "Em Andamento", icon: Play, style: "bg-info/10 text-info", order: 1 },
  completed: { label: "Concluída", icon: CheckCircle2, style: "bg-success/10 text-success", order: 3 },
  overdue: { label: "Atrasada", icon: AlertTriangle, style: "bg-destructive/10 text-destructive", order: 0 },
};
const typeLabels: Record<string, string> = { installation: "Instalação", swap: "Troca de Lona", maintenance: "Manutenção", inspection: "Vistoria" };
const typeIcons: Record<string, string> = { installation: "🔧", swap: "🔄", maintenance: "🛠️", inspection: "👁️" };

const emptyWorkOrder: Partial<WorkOrder> = {
  type: "installation", billboard_id: null, billboard_code: "", client_name: "", assignee: "",
  status: "pending", due_date: new Date().toISOString().split("T")[0], sla_hours: 48,
  checklist: [{ item: "Item 1", done: false }], photos_before: [], photos_after: [],
};

function WorkOrderForm({ initial, billboards, onSave, onCancel }: {
  initial: Partial<WorkOrder> & { id?: string }; billboards: { id: string; code: string }[]; onSave: (d: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass-panel max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold">{initial.id ? "Editar OS" : "Nova OS"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label><select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.type || "installation"} onChange={e => set("type", e.target.value)}>
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Ponto</label><select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.billboard_id || ""} onChange={e => { const b = billboards.find(x => x.id === e.target.value); set("billboard_id", e.target.value); set("billboard_code", b?.code || ""); }}>
            <option value="">Selecione...</option>
            {billboards.map(b => <option key={b.id} value={b.id}>#{b.code}</option>)}
          </select></div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cliente</label><input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.client_name || ""} onChange={e => set("client_name", e.target.value)} /></div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Responsável</label><input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.assignee || ""} onChange={e => set("assignee", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Prazo</label><input type="date" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.due_date || ""} onChange={e => set("due_date", e.target.value)} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">SLA (horas)</label><input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.sla_hours || 48} onChange={e => set("sla_hours", parseInt(e.target.value) || 0)} /></div>
          </div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</label><select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.status || "pending"} onChange={e => set("status", e.target.value)}>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select></div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

export default function Operations() {
  const { workOrders, billboards, addWorkOrder, updateWorkOrder, deleteWorkOrder } = useData();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<any>(null);

  const filtered = statusFilter === "all" ? workOrders : workOrders.filter(o => o.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => (statusConfig[a.status]?.order || 0) - (statusConfig[b.status]?.order || 0));
  const billboardList = billboards.map(b => ({ id: b.id, code: b.code }));

  const handleSave = async (data: any) => {
    if (data.id) { await updateWorkOrder(data.id, data); toast.success("OS atualizada"); }
    else { await addWorkOrder(data); toast.success("OS criada"); }
    setFormOpen(false); setEditingOS(null);
  };

  const handleDelete = async (os: WorkOrder) => {
    if (confirm("Excluir esta OS?")) { await deleteWorkOrder(os.id); toast.success("OS excluída"); }
  };

  const toggleChecklist = async (osId: string, index: number) => {
    const os = workOrders.find(o => o.id === osId);
    if (!os) return;
    const newChecklist = os.checklist.map((item, i) => i === index ? { ...item, done: !item.done } : item);
    await updateWorkOrder(osId, { checklist: newChecklist });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold">Operação</h1><p className="text-muted-foreground text-sm mt-1">Ordens de serviço e SLA</p></div>
        <Button onClick={() => { setEditingOS({ ...emptyWorkOrder }); setFormOpen(true); }}><Plus className="w-4 h-4" /> Nova OS</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = workOrders.filter(o => o.status === key).length;
          return (
            <button key={key} onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className={`stat-card ${statusFilter === key ? "ring-1 ring-primary" : ""} cursor-pointer hover:border-primary/30 transition-all text-left`}>
              <div className="flex items-center gap-2 mb-1"><cfg.icon className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">{cfg.label}</span></div>
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
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div key={os.id} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">{typeIcons[os.type]}</div>
                  <div><p className="font-display font-semibold text-sm">{typeLabels[os.type]}</p><p className="text-xs text-muted-foreground">#{os.billboard_code}{os.client_name && ` · ${os.client_name}`}</p></div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${cfg.style}`}><StatusIcon className="w-3 h-3" />{cfg.label}</span>
                  <button onClick={() => { setEditingOS({ ...os }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(os)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Progresso</span><span>{done}/{total} ({progress}%)</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="mt-3 space-y-1.5">
                {os.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => toggleChecklist(os.id, i)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.done ? "bg-success border-success" : "border-border"}`}>
                      {item.done && <CheckCircle2 className="w-3 h-3 text-success-foreground" />}
                    </div>
                    <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>SLA: {os.sla_hours}h · {os.assignee}</span>
                <span className={os.status === "overdue" ? "text-destructive font-semibold" : ""}>Prazo: {new Date(os.due_date).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">Nenhuma OS encontrada</p>}
      </div>
      {formOpen && editingOS && (
        <WorkOrderForm initial={editingOS} billboards={billboardList} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditingOS(null); }} />
      )}
    </div>
  );
}
