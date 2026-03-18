import { useData, WorkOrder } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { Wrench, Clock, CheckCircle2, AlertTriangle, Play, Plus, X, Trash2, Edit, ChevronDown, ChevronUp } from "lucide-react";
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
  type: "installation", billboard_id: null, billboard_code: "", client_name: "", client_id: null, contract_id: null,
  assignee: "", status: "pending", due_date: new Date().toISOString().split("T")[0], sla_hours: 48,
  checklist: [], photos_before: [], photos_after: [],
};

function WorkOrderForm({ initial, billboards, clients, contracts, onSave, onCancel }: {
  initial: Partial<WorkOrder> & { id?: string };
  billboards: { id: string; code: string }[];
  clients: { id: string; name: string }[];
  contracts: { id: string; client_name: string; type: string }[];
  onSave: (d: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [newTask, setNewTask] = useState("");
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const addSubtask = () => {
    if (!newTask.trim()) return;
    set("checklist", [...(form.checklist || []), { item: newTask.trim(), done: false }]);
    setNewTask("");
  };

  const removeSubtask = (idx: number) => {
    set("checklist", (form.checklist || []).filter((_, i) => i !== idx));
  };

  const inputClass = "w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block";

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4" onClick={onCancel}>
      <div className="glass-panel max-w-md w-full animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-display font-bold">{initial.id ? "Editar OS" : "Nova OS"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div><label className={labelClass}>Tipo</label>
            <select className={inputClass} value={form.type || "installation"} onChange={e => set("type", e.target.value)}>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><label className={labelClass}>Ponto</label>
            <select className={inputClass} value={form.billboard_id || ""} onChange={e => { const b = billboards.find(x => x.id === e.target.value); set("billboard_id", e.target.value); set("billboard_code", b?.code || ""); }}>
              <option value="">Selecione...</option>
              {billboards.map(b => <option key={b.id} value={b.id}>#{b.code}</option>)}
            </select></div>
          <div><label className={labelClass}>Cliente</label>
            <select className={inputClass} value={form.client_id || ""} onChange={e => { const c = clients.find(x => x.id === e.target.value); set("client_id", e.target.value || null); set("client_name", c?.name || ""); }}>
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><label className={labelClass}>Contrato</label>
            <select className={inputClass} value={form.contract_id || ""} onChange={e => set("contract_id", e.target.value || null)}>
              <option value="">Nenhum</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.client_name} ({c.type === "veiculacao" ? "Veiculação" : "Locação"})</option>)}
            </select></div>
          <div><label className={labelClass}>Responsável</label>
            <input className={inputClass} value={form.assignee || ""} onChange={e => set("assignee", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Prazo</label>
              <input type="date" className={inputClass} value={form.due_date || ""} onChange={e => set("due_date", e.target.value)} /></div>
            <div><label className={labelClass}>SLA (horas)</label>
              <input type="number" className={inputClass} value={form.sla_hours || 48} onChange={e => set("sla_hours", parseInt(e.target.value) || 0)} /></div>
          </div>
          <div><label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status || "pending"} onChange={e => set("status", e.target.value)}>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select></div>

          {/* Subtasks */}
          <div className="pt-3 border-t border-border">
            <label className={labelClass}>Subtarefas / Checklist</label>
            <div className="space-y-2 mt-1">
              {(form.checklist || []).map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <span className="text-sm flex-1">{item.item}</span>
                  <button onClick={() => removeSubtask(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input className={`${inputClass} flex-1`} placeholder="Adicionar subtarefa..." value={newTask} onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSubtask())} />
              <Button size="sm" variant="outline" onClick={addSubtask} type="button"><Plus className="w-3 h-3" /></Button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

export default function Operations() {
  const { can } = usePermissions();
  const { workOrders, billboards, clients, contracts, addWorkOrder, updateWorkOrder, deleteWorkOrder } = useData();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<any>(null);

  const filtered = statusFilter === "all" ? workOrders : workOrders.filter(o => o.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => (statusConfig[a.status]?.order || 0) - (statusConfig[b.status]?.order || 0));
  const billboardList = billboards.map(b => ({ id: b.id, code: b.code }));
  const clientList = clients.map(c => ({ id: c.id, name: c.name }));
  const contractList = contracts.map(c => ({ id: c.id, client_name: c.client_name, type: c.type }));

  const handleSave = async (data: any) => {
    if (data.id) { await updateWorkOrder(data.id, data); toast.success("OS atualizada"); }
    else { await addWorkOrder(data); toast.success("OS criada"); }
    setFormOpen(false); setEditingOS(null);
  };

  const handleDelete = async (os: WorkOrder) => {
    if (!can("operacao", "can_delete")) { toast.error("Sem permissão"); return; }
    if (confirm("Excluir esta OS?")) { await deleteWorkOrder(os.id); toast.success("OS excluída"); }
  };

  const toggleChecklist = async (osId: string, index: number) => {
    const os = workOrders.find(o => o.id === osId);
    if (!os) return;
    const newChecklist = os.checklist.map((item, i) => i === index ? { ...item, done: !item.done } : item);
    const allDone = newChecklist.every(c => c.done);
    await updateWorkOrder(osId, { checklist: newChecklist, ...(allDone ? { status: "completed", completed_date: new Date().toISOString().split("T")[0] } : {}) });
    if (allDone) toast.success("OS concluída! ✅");
  };

  const block = <PermissionPageBlock module="operacao" label="Operação" />;
  if (!can("operacao", "can_view")) return block;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1200px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-xl md:text-2xl font-display font-bold">Operação</h1><p className="text-muted-foreground text-sm mt-1">Ordens de serviço</p></div>
        <PermissionGate module="operacao" action="can_create" hide>
          <Button size="sm" onClick={() => { setEditingOS({ ...emptyWorkOrder }); setFormOpen(true); }}>
            <Plus className="w-4 h-4" /> Nova OS
          </Button>
        </PermissionGate>
      </div>

      {/* Status counters */}
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

      {/* OS Cards */}
      <div className="space-y-3">
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
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg shrink-0">{typeIcons[os.type]}</div>
                  <div>
                    <p className="font-display font-semibold text-sm">{typeLabels[os.type]}</p>
                    <p className="text-xs text-muted-foreground">
                      #{os.billboard_code}{os.client_name && ` · ${os.client_name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${cfg.style}`}><StatusIcon className="w-3 h-3" /><span className="hidden sm:inline">{cfg.label}</span></span>
                  <PermissionGate module="operacao" action="can_edit" hide>
                    <button onClick={() => { setEditingOS({ ...os }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                  </PermissionGate>
                  <PermissionGate module="operacao" action="can_delete" hide>
                    <button onClick={() => handleDelete(os)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                  </PermissionGate>
                </div>
              </div>

              {/* Progress */}
              {total > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Progresso</span><span>{done}/{total} ({progress}%)</span></div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                </div>
              )}

              {/* Subtasks */}
              <div className="mt-3 space-y-1.5">
                {os.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm cursor-pointer py-1 px-1 -mx-1 rounded hover:bg-muted/50 transition-colors" onClick={() => toggleChecklist(os.id, i)}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${item.done ? "bg-success border-success" : "border-border"}`}>
                      {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-success-foreground" />}
                    </div>
                    <span className={`${item.done ? "text-muted-foreground line-through" : ""}`}>{item.item}</span>
                  </div>
                ))}
                {total === 0 && <p className="text-xs text-muted-foreground italic">Sem subtarefas definidas</p>}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>SLA: {os.sla_hours}h{os.assignee && ` · ${os.assignee}`}</span>
                <span className={os.status === "overdue" ? "text-destructive font-semibold" : ""}>
                  Prazo: {new Date(os.due_date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma OS encontrada</p>}
      </div>

      {formOpen && editingOS && (
        <WorkOrderForm initial={editingOS} billboards={billboardList} clients={clientList} contracts={contractList}
          onSave={handleSave} onCancel={() => { setFormOpen(false); setEditingOS(null); }} />
      )}
    </div>
  );
}
