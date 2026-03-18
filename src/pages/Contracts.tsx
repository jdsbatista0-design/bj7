import { useData, Contract } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Trash2, Edit, X, Download, Upload, Paperclip, ExternalLink } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusStyles: Record<string, string> = { active: "bg-success/10 text-success", expired: "bg-muted text-muted-foreground", cancelled: "bg-destructive/10 text-destructive", pending: "bg-primary/10 text-primary" };
const statusLabels: Record<string, string> = { active: "Ativo", expired: "Expirado", cancelled: "Cancelado", pending: "Pendente" };
const typeLabels: Record<string, string> = { veiculacao: "Veiculação", locacao_terreno: "Locação de Terreno" };

const emptyContract: Partial<Contract> = {
  type: "veiculacao", client_id: null, client_name: "", billboard_ids: [],
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  monthly_value: 0, total_value: 0, status: "pending", renewal_type: "manual",
  payment_method: "Boleto bancário", document_url: "", notes: "",
};

function ContractForm({ initial, clients, billboards, onSave, onCancel }: {
  initial: Partial<Contract> & { id?: string };
  clients: { id: string; name: string; type: string }[];
  billboards: { id: string; code: string }[];
  onSave: (d: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const updateTotal = (monthly: number, start: string, end: string) => {
    const months = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (30 * 24 * 60 * 60 * 1000)));
    return monthly * months;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `contracts/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("contract-files").upload(path, file);
    if (error) { toast.error("Erro no upload"); setUploading(false); return; }
    // For private bucket, use signed URL or just store the path
    set("document_url", path);
    toast.success("Arquivo anexado");
    setUploading(false);
  };

  const toggleBillboard = (bid: string) => {
    const current = form.billboard_ids || [];
    if (current.includes(bid)) {
      set("billboard_ids", current.filter(id => id !== bid));
    } else {
      set("billboard_ids", [...current, bid]);
    }
  };

  const inputClass = "w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block";

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4" onClick={onCancel}>
      <div className="glass-panel max-w-lg w-full animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-display font-bold">{initial.id ? "Editar Contrato" : "Novo Contrato"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div><label className={labelClass}>Tipo</label>
            <select className={inputClass} value={form.type || "veiculacao"} onChange={e => set("type", e.target.value)}>
              <option value="veiculacao">Veiculação</option><option value="locacao_terreno">Locação de Terreno</option>
            </select></div>
          <div><label className={labelClass}>{form.type === "veiculacao" ? "Anunciante" : "Proprietário"}</label>
            <select className={inputClass} value={form.client_id || ""} onChange={e => { const c = clients.find(x => x.id === e.target.value); set("client_id", e.target.value); set("client_name", c?.name || ""); }}>
              <option value="">Selecione...</option>
              {clients.filter(c => form.type === "veiculacao" ? c.type === "advertiser" : c.type === "landowner").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>

          {/* Billboard selection */}
          <div>
            <label className={labelClass}>Pontos vinculados</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {billboards.map(b => (
                <button key={b.id} type="button" onClick={() => toggleBillboard(b.id)}
                  className={`text-xs px-2.5 py-1 rounded-full font-mono transition-colors ${(form.billboard_ids || []).includes(b.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  #{b.code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Início</label>
              <input type="date" className={inputClass} value={form.start_date || ""} onChange={e => { set("start_date", e.target.value); set("total_value", updateTotal(form.monthly_value || 0, e.target.value, form.end_date || "")); }} /></div>
            <div><label className={labelClass}>Fim</label>
              <input type="date" className={inputClass} value={form.end_date || ""} onChange={e => { set("end_date", e.target.value); set("total_value", updateTotal(form.monthly_value || 0, form.start_date || "", e.target.value)); }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Valor Mensal</label>
              <input type="number" className={inputClass} value={form.monthly_value || 0} onChange={e => { const v = parseFloat(e.target.value) || 0; set("monthly_value", v); set("total_value", updateTotal(v, form.start_date || "", form.end_date || "")); }} /></div>
            <div><label className={labelClass}>Total calculado</label>
              <p className="text-sm font-display font-semibold text-primary mt-2">R$ {(form.total_value || 0).toLocaleString()}</p></div>
          </div>
          <div><label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status || "pending"} onChange={e => set("status", e.target.value)}>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><label className={labelClass}>Pagamento</label>
            <input className={inputClass} value={form.payment_method || ""} onChange={e => set("payment_method", e.target.value)} /></div>
          <div><label className={labelClass}>Observações</label>
            <textarea className={`${inputClass} h-16 resize-none`} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>

          {/* File attachment */}
          <div className="pt-3 border-t border-border">
            <label className={labelClass}>Anexo do Contrato</label>
            {form.document_url ? (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <Paperclip className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-foreground flex-1 truncate">{form.document_url}</span>
                <button onClick={() => set("document_url", "")} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={handleFileUpload} />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="w-3 h-3 mr-1" /> {uploading ? "Enviando..." : "Anexar arquivo"}
                </Button>
              </div>
            )}
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

export default function Contracts() {
  const { can } = usePermissions();
  const { contracts, clients, billboards, addContract, updateContract, deleteContract } = useData();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);

  const filtered = typeFilter === "all" ? contracts : contracts.filter(c => c.type === typeFilter);
  const clientList = clients.map(c => ({ id: c.id, name: c.name, type: c.type }));
  const billboardList = billboards.map(b => ({ id: b.id, code: b.code }));

  const handleSave = async (data: any) => {
    if (data.id) { await updateContract(data.id, data); toast.success("Contrato atualizado"); }
    else { await addContract(data); toast.success("Contrato criado"); }
    setFormOpen(false); setEditingContract(null);
  };

  const handleDelete = async (c: Contract) => {
    if (!can("contratos", "can_delete")) { toast.error("Sem permissão"); return; }
    if (confirm(`Excluir contrato de ${c.client_name}?`)) { await deleteContract(c.id); toast.success("Excluído"); }
  };

  const handleDownloadContract = async (c: Contract) => {
    if (c.document_url) {
      const { data } = await supabase.storage.from("contract-files").createSignedUrl(c.document_url, 60);
      if (data?.signedUrl) { window.open(data.signedUrl, "_blank"); return; }
    }
    // Fallback: generate text
    const text = `CONTRATO DE ${c.type === "veiculacao" ? "VEICULAÇÃO" : "LOCAÇÃO"}\n\n${c.client_name}\nPeríodo: ${new Date(c.start_date).toLocaleDateString("pt-BR")} a ${new Date(c.end_date).toLocaleDateString("pt-BR")}\nValor: R$ ${c.monthly_value.toLocaleString()}/mês\nTotal: R$ ${c.total_value.toLocaleString()}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `contrato_${c.client_name.replace(/\s/g, "_")}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const block = <PermissionPageBlock module="contratos" label="Contratos" />;
  if (!can("contratos", "can_view")) return block;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1200px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-xl md:text-2xl font-display font-bold">Contratos</h1><p className="text-muted-foreground text-sm mt-1">Gestão de contratos</p></div>
        <PermissionGate module="contratos" action="can_create" hide>
          <Button size="sm" onClick={() => { setEditingContract({ ...emptyContract }); setFormOpen(true); }}><Plus className="w-4 h-4" /> Novo</Button>
        </PermissionGate>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
          return (
            <div key={c.id} className={`stat-card ${c.type === "locacao_terreno" ? "stat-card-info" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="font-display font-semibold">{c.client_name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.type === "veiculacao" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}>{typeLabels[c.type]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[c.status]}`}>{statusLabels[c.status]}</span>
                  <button onClick={() => handleDownloadContract(c)} className="text-muted-foreground hover:text-primary p-1" title={c.document_url ? "Abrir anexo" : "Gerar contrato"}>
                    {c.document_url ? <Paperclip className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </button>
                  <PermissionGate module="contratos" action="can_edit" hide>
                    <button onClick={() => { setEditingContract({ ...c }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                  </PermissionGate>
                  <PermissionGate module="contratos" action="can_delete" hide>
                    <button onClick={() => handleDelete(c)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                  </PermissionGate>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Período</p><p className="mt-0.5">{new Date(c.start_date).toLocaleDateString("pt-BR")} — {new Date(c.end_date).toLocaleDateString("pt-BR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Mensal</p><p className="font-display font-semibold text-primary mt-0.5">R$ {c.monthly_value.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-display font-semibold mt-0.5">R$ {c.total_value.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Pontos</p><div className="flex flex-wrap gap-1 mt-0.5">{cBillboards.map(b => b && <span key={b.id} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">#{b.code}</span>)}{cBillboards.length === 0 && <span className="text-xs text-muted-foreground">—</span>}</div></div>
              </div>
              {c.notes && <p className="text-xs text-muted-foreground mt-2 italic">{c.notes}</p>}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum contrato encontrado</p>}
      </div>

      {formOpen && editingContract && (
        <ContractForm initial={editingContract} clients={clientList} billboards={billboardList}
          onSave={handleSave} onCancel={() => { setFormOpen(false); setEditingContract(null); }} />
      )}
    </div>
  );
}
