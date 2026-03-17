import { useData, Contract } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { FileText, Plus, Trash2, Edit, X, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusStyles: Record<string, string> = { active: "bg-success/10 text-success", expired: "bg-muted text-muted-foreground", cancelled: "bg-destructive/10 text-destructive", pending: "bg-primary/10 text-primary" };
const statusLabels: Record<string, string> = { active: "Ativo", expired: "Expirado", cancelled: "Cancelado", pending: "Pendente" };
const typeLabels: Record<string, string> = { veiculacao: "Veiculação", locacao_terreno: "Locação de Terreno" };
const typeBadge: Record<string, string> = { veiculacao: "bg-primary/10 text-primary", locacao_terreno: "bg-info/10 text-info" };

const emptyContract: Partial<Contract> = {
  type: "veiculacao", client_id: null, client_name: "", billboard_ids: [],
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  monthly_value: 0, total_value: 0, status: "pending", renewal_type: "manual", payment_method: "Boleto bancário",
};

function ContractForm({ initial, clients, onSave, onCancel }: {
  initial: Partial<Contract> & { id?: string }; clients: { id: string; name: string; type: string }[]; onSave: (d: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const updateTotal = (monthly: number, start: string, end: string) => {
    const months = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (30 * 24 * 60 * 60 * 1000)));
    return monthly * months;
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass-panel max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold">{initial.id ? "Editar Contrato" : "Novo Contrato"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label><select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.type || "veiculacao"} onChange={e => set("type", e.target.value)}>
            <option value="veiculacao">Veiculação</option><option value="locacao_terreno">Locação de Terreno</option>
          </select></div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">{form.type === "veiculacao" ? "Anunciante" : "Proprietário"}</label><select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.client_id || ""} onChange={e => { const c = clients.find(x => x.id === e.target.value); set("client_id", e.target.value); set("client_name", c?.name || ""); }}>
            <option value="">Selecione...</option>{clients.filter(c => form.type === "veiculacao" ? c.type === "advertiser" : c.type === "landowner").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Início</label><input type="date" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.start_date || ""} onChange={e => { set("start_date", e.target.value); set("total_value", updateTotal(form.monthly_value || 0, e.target.value, form.end_date || "")); }} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fim</label><input type="date" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.end_date || ""} onChange={e => { set("end_date", e.target.value); set("total_value", updateTotal(form.monthly_value || 0, form.start_date || "", e.target.value)); }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor Mensal</label><input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.monthly_value || 0} onChange={e => { const v = parseFloat(e.target.value) || 0; set("monthly_value", v); set("total_value", updateTotal(v, form.start_date || "", form.end_date || "")); }} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Total calculado</label><p className="text-sm font-display font-semibold text-primary mt-2">R$ {(form.total_value || 0).toLocaleString()}</p></div>
          </div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</label><select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.status || "pending"} onChange={e => set("status", e.target.value)}>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pagamento</label><input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.payment_method || ""} onChange={e => set("payment_method", e.target.value)} /></div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

function generateContractText(contract: Contract): string {
  const today = new Date().toLocaleDateString("pt-BR");
  if (contract.type === "veiculacao") {
    return `CONTRATO DE VEICULAÇÃO DE PUBLICIDADE\n\nContratante: ${contract.client_name}\nContratada: BJ7 Mídia LTDA\n\nPeríodo: ${new Date(contract.start_date).toLocaleDateString("pt-BR")} a ${new Date(contract.end_date).toLocaleDateString("pt-BR")}\nValor Mensal: R$ ${contract.monthly_value.toLocaleString()}\nValor Total: R$ ${contract.total_value.toLocaleString()}\nPagamento: ${contract.payment_method}\n\nData: ${today}\n\n_________________________\nBJ7 Mídia LTDA\n\n_________________________\n${contract.client_name}`;
  }
  return `CONTRATO DE LOCAÇÃO DE ESPAÇO\n\nLocador(a): ${contract.client_name}\nLocatária: BJ7 Mídia LTDA\n\nPeríodo: ${new Date(contract.start_date).toLocaleDateString("pt-BR")} a ${new Date(contract.end_date).toLocaleDateString("pt-BR")}\nValor Mensal: R$ ${contract.monthly_value.toLocaleString()}\nPagamento: ${contract.payment_method}\n\nData: ${today}\n\n_________________________\nBJ7 Mídia LTDA\n\n_________________________\n${contract.client_name}`;
}

export default function Contracts() {
  const { can } = usePermissions();
  const { contracts, clients, billboards, addContract, updateContract, deleteContract } = useData();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);

  const filtered = typeFilter === "all" ? contracts : contracts.filter(c => c.type === typeFilter);
  const clientList = clients.map(c => ({ id: c.id, name: c.name }));

  const handleSave = async (data: any) => {
    if (data.id) { await updateContract(data.id, data); toast.success("Contrato atualizado"); }
    else { await addContract(data); toast.success("Contrato criado"); }
    setFormOpen(false); setEditingContract(null);
  };

  const handleDelete = async (c: Contract) => {
    if (!can("contratos", "can_delete")) { toast.error("Sem permissão para excluir contratos"); return; }
    if (confirm(`Excluir contrato de ${c.client_name}?`)) { await deleteContract(c.id); toast.success("Contrato excluído"); }
  };

  const handleDownload = (c: Contract) => {
    const text = generateContractText(c);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `contrato_${c.type}_${c.client_name.replace(/\s/g, "_")}.txt`; a.click();
    URL.revokeObjectURL(url); toast.success("Contrato baixado");
  };

  const block = <PermissionPageBlock module="contratos" label="Contratos" />;
  if (!can("contratos", "can_view")) return block;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold">Contratos</h1><p className="text-muted-foreground text-sm mt-1">Gestão de contratos</p></div>
        <PermissionGate module="contratos" action="can_create" hide>
          <Button onClick={() => { setEditingContract({ ...emptyContract }); setFormOpen(true); }}><Plus className="w-4 h-4" /> Novo Contrato</Button>
        </PermissionGate>
      </div>
      <div className="flex items-center gap-3">
        {["all", "veiculacao", "locacao_terreno"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? "Todos" : typeLabels[t]}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} contratos</span>
      </div>
      <div className="space-y-3">
        {filtered.map(c => {
          const cBillboards = (c.billboard_ids || []).map(bid => billboards.find(b => b.id === bid)).filter(Boolean);
          const months = Math.ceil((new Date(c.end_date).getTime() - new Date(c.start_date).getTime()) / (30 * 24 * 60 * 60 * 1000));
          return (
            <div key={c.id} className={`stat-card ${c.type === "locacao_terreno" ? "stat-card-info" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                  <div><p className="font-display font-semibold">{c.client_name}</p><div className="flex items-center gap-2 mt-0.5"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadge[c.type]}`}>{typeLabels[c.type]}</span></div></div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[c.status]}`}>{statusLabels[c.status]}</span>
                  <button onClick={() => handleDownload(c)} className="text-muted-foreground hover:text-primary p-1" title="Baixar contrato"><Download className="w-4 h-4" /></button>
                  <PermissionGate module="contratos" action="can_edit" hide>
                    <button onClick={() => { setEditingContract({ ...c }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                  </PermissionGate>
                  <PermissionGate module="contratos" action="can_delete" hide>
                    <button onClick={() => handleDelete(c)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                  </PermissionGate>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <div><p className="text-xs text-muted-foreground">Pontos</p><div className="flex flex-wrap gap-1 mt-1">{cBillboards.map(b => b && <span key={b.id} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">#{b.code}</span>)}</div></div>
                <div><p className="text-xs text-muted-foreground">Período</p><p className="text-sm mt-1">{new Date(c.start_date).toLocaleDateString("pt-BR")} — {new Date(c.end_date).toLocaleDateString("pt-BR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Valor Mensal</p><p className="text-sm font-display font-semibold text-primary mt-1">R$ {c.monthly_value.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Valor Total</p><p className="text-sm font-display font-semibold mt-1">R$ {c.total_value.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Renovação</p><p className="text-sm mt-1">{c.renewal_type === "automatic" ? "Automática" : "Manual"}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">Pagamento: {c.payment_method} · {months} meses</div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum contrato encontrado</p>}
      </div>
      {formOpen && editingContract && (
        <ContractForm initial={editingContract} clients={clientList} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditingContract(null); }} />
      )}
    </div>
  );
}
