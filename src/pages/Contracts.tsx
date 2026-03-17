import { useData } from "@/contexts/DataContext";
import { Contract } from "@/data/mockData";
import { FileText, Plus, Trash2, Edit, X, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusStyles = { active: "bg-success/10 text-success", expired: "bg-muted text-muted-foreground", cancelled: "bg-destructive/10 text-destructive", pending: "bg-primary/10 text-primary" };
const statusLabels = { active: "Ativo", expired: "Expirado", cancelled: "Cancelado", pending: "Pendente" };
const typeLabels = { veiculacao: "Veiculação", locacao_terreno: "Locação de Terreno" };
const typeBadge = { veiculacao: "bg-primary/10 text-primary", locacao_terreno: "bg-info/10 text-info" };

const emptyContract: Omit<Contract, "id"> = {
  type: "veiculacao", clientId: "", clientName: "", billboards: [],
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  monthlyValue: 0, totalValue: 0, status: "pending", renewalType: "manual", paymentMethod: "Boleto bancário",
};

function ContractForm({ initial, clients, onSave, onCancel }: {
  initial: Omit<Contract, "id"> & { id?: string }; clients: { id: string; name: string }[]; onSave: (d: any) => void; onCancel: () => void;
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
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="veiculacao">Veiculação</option>
              <option value="locacao_terreno">Locação de Terreno</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cliente</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.clientId} onChange={e => { const c = clients.find(x => x.id === e.target.value); set("clientId", e.target.value); set("clientName", c?.name || ""); }}>
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Início</label><input type="date" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.startDate} onChange={e => { set("startDate", e.target.value); set("totalValue", updateTotal(form.monthlyValue, e.target.value, form.endDate)); }} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fim</label><input type="date" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.endDate} onChange={e => { set("endDate", e.target.value); set("totalValue", updateTotal(form.monthlyValue, form.startDate, e.target.value)); }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor Mensal</label><input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.monthlyValue} onChange={e => { const v = parseFloat(e.target.value) || 0; set("monthlyValue", v); set("totalValue", updateTotal(v, form.startDate, form.endDate)); }} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Total calculado</label><p className="text-sm font-display font-semibold text-primary mt-2">R$ {form.totalValue.toLocaleString()}</p></div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.status} onChange={e => set("status", e.target.value)}>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pagamento</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)} />
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

function generateContractText(contract: Contract, type: "veiculacao" | "locacao_terreno"): string {
  const today = new Date().toLocaleDateString("pt-BR");
  if (type === "veiculacao") {
    return `CONTRATO DE VEICULAÇÃO DE PUBLICIDADE\n\nContratante: ${contract.clientName}\nContratada: BJ7 Mídia LTDA\n\nObjeto: Locação de espaço publicitário em painel(is) rodoviário(s).\n\nPeríodo: ${new Date(contract.startDate).toLocaleDateString("pt-BR")} a ${new Date(contract.endDate).toLocaleDateString("pt-BR")}\nValor Mensal: R$ ${contract.monthlyValue.toLocaleString()}\nValor Total: R$ ${contract.totalValue.toLocaleString()}\nForma de Pagamento: ${contract.paymentMethod}\n\nCláusulas:\n1. A CONTRATADA se obriga a manter o painel em boas condições.\n2. A CONTRATANTE se responsabiliza pelo conteúdo da arte.\n3. O presente contrato tem duração definida.\n\nData: ${today}\n\n_________________________\nBJ7 Mídia LTDA\n\n_________________________\n${contract.clientName}`;
  }
  return `CONTRATO DE LOCAÇÃO DE ESPAÇO PARA MÍDIA EXTERIOR\n\nLocador(a): ${contract.clientName}\nLocatária: BJ7 Mídia LTDA\n\nObjeto: Locação de espaço à margem de rodovia para instalação de painel publicitário.\n\nPeríodo: ${new Date(contract.startDate).toLocaleDateString("pt-BR")} a ${new Date(contract.endDate).toLocaleDateString("pt-BR")}\nValor Mensal: R$ ${contract.monthlyValue.toLocaleString()}\nForma de Pagamento: ${contract.paymentMethod}\n\nCláusulas:\n1. O LOCADOR autoriza a instalação e manutenção do painel.\n2. A LOCATÁRIA se responsabiliza pela estrutura instalada.\n3. O contrato é renovável automaticamente.\n\nData: ${today}\n\n_________________________\nBJ7 Mídia LTDA\n\n_________________________\n${contract.clientName}`;
}

export default function Contracts() {
  const { contracts, clients, billboards, addContract, updateContract, deleteContract } = useData();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);

  const filtered = typeFilter === "all" ? contracts : contracts.filter(c => c.type === typeFilter);
  const clientList = clients.map(c => ({ id: c.id, name: c.name }));

  const handleSave = (data: any) => {
    if (data.id) {
      updateContract(data.id, data);
      toast.success("Contrato atualizado");
    } else {
      addContract({ ...data, id: `ct${Date.now()}` });
      toast.success("Contrato criado");
    }
    setFormOpen(false);
    setEditingContract(null);
  };

  const handleDelete = (c: Contract) => {
    if (confirm(`Excluir contrato de ${c.clientName}?`)) {
      deleteContract(c.id);
      toast.success("Contrato excluído");
    }
  };

  const handleDownload = (c: Contract) => {
    const text = generateContractText(c, c.type);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato_${c.type}_${c.clientName.replace(/\s/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contrato baixado");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Contratos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão de contratos de veiculação e locação</p>
        </div>
        <Button onClick={() => { setEditingContract({ ...emptyContract }); setFormOpen(true); }}>
          <Plus className="w-4 h-4" /> Novo Contrato
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {["all", "veiculacao", "locacao_terreno"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
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
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="font-display font-semibold">{c.clientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">#{c.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadge[c.type]}`}>{typeLabels[c.type]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[c.status]}`}>{statusLabels[c.status]}</span>
                  <button onClick={() => handleDownload(c)} className="text-muted-foreground hover:text-primary p-1" title="Baixar contrato"><Download className="w-4 h-4" /></button>
                  <button onClick={() => { setEditingContract({ ...c }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <div><p className="text-xs text-muted-foreground">Pontos</p><div className="flex flex-wrap gap-1 mt-1">{cBillboards.map(b => b && <span key={b.id} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">#{b.code}</span>)}</div></div>
                <div><p className="text-xs text-muted-foreground">Período</p><p className="text-sm mt-1">{new Date(c.startDate).toLocaleDateString("pt-BR")} — {new Date(c.endDate).toLocaleDateString("pt-BR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Valor Mensal</p><p className="text-sm font-display font-semibold text-primary mt-1">R$ {c.monthlyValue.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Valor Total</p><p className="text-sm font-display font-semibold mt-1">R$ {c.totalValue.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Renovação</p><p className="text-sm mt-1">{c.renewalType === "automatic" ? "Automática" : "Manual"}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">Pagamento: {c.paymentMethod} · {months} meses</div>
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
