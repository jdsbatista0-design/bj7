import { useData, FinancialEntry } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { DollarSign, TrendingUp, TrendingDown, Percent, MapPin, Plus, X, Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  operacional: "Operacional", administrativo: "Administrativo", imposto: "Impostos",
  imprevisto: "Imprevistos", outro: "Outros",
};
const statusLabels: Record<string, string> = { pending: "Pendente", paid: "Pago", cancelled: "Cancelado" };

const emptyEntry: Partial<FinancialEntry> = {
  category: "operacional", description: "", amount: 0, type: "expense",
  entry_date: new Date().toISOString().split("T")[0], client_id: null,
  contract_id: null, billboard_id: null, status: "pending", notes: "",
};

function EntryForm({ initial, clients, contracts, billboards, onSave, onCancel }: {
  initial: Partial<FinancialEntry> & { id?: string };
  clients: { id: string; name: string }[];
  contracts: { id: string; client_name: string }[];
  billboards: { id: string; code: string }[];
  onSave: (d: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const inputClass = "w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block";

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4" onClick={onCancel}>
      <div className="glass-panel max-w-md w-full animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-display font-bold">{initial.id ? "Editar Lançamento" : "Novo Lançamento"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Tipo</label>
              <select className={inputClass} value={form.type || "expense"} onChange={e => set("type", e.target.value)}>
                <option value="expense">Despesa</option><option value="income">Receita</option>
              </select></div>
            <div><label className={labelClass}>Categoria</label>
              <select className={inputClass} value={form.category || "operacional"} onChange={e => set("category", e.target.value)}>
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
          </div>
          <div><label className={labelClass}>Descrição</label>
            <input className={inputClass} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Descreva o lançamento" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Valor (R$)</label>
              <input type="number" className={inputClass} value={form.amount || 0} onChange={e => set("amount", parseFloat(e.target.value) || 0)} /></div>
            <div><label className={labelClass}>Data</label>
              <input type="date" className={inputClass} value={form.entry_date || ""} onChange={e => set("entry_date", e.target.value)} /></div>
          </div>
          <div><label className={labelClass}>Cliente (opcional)</label>
            <select className={inputClass} value={form.client_id || ""} onChange={e => set("client_id", e.target.value || null)}>
              <option value="">Nenhum</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><label className={labelClass}>Contrato (opcional)</label>
            <select className={inputClass} value={form.contract_id || ""} onChange={e => set("contract_id", e.target.value || null)}>
              <option value="">Nenhum</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
            </select></div>
          <div><label className={labelClass}>Ponto (opcional)</label>
            <select className={inputClass} value={form.billboard_id || ""} onChange={e => set("billboard_id", e.target.value || null)}>
              <option value="">Nenhum</option>
              {billboards.map(b => <option key={b.id} value={b.id}>#{b.code}</option>)}
            </select></div>
          <div><label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status || "pending"} onChange={e => set("status", e.target.value)}>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><label className={labelClass}>Observações</label>
            <textarea className={`${inputClass} h-16 resize-none`} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

export default function Financial() {
  const { can } = usePermissions();
  const { billboards, contracts, clients, financialEntries, addFinancialEntry, updateFinancialEntry, deleteFinancialEntry } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "entries">("overview");

  const { totalRevenue, totalCost, margin, marginPct, totalLandCosts, routeData, totalExpenses, totalIncomes, expensesByCategory } = useMemo(() => {
    const totalRevenue = contracts.filter(c => c.status === "active" && c.type === "veiculacao").reduce((s, c) => s + c.monthly_value, 0);
    const totalCost = contracts.filter(c => c.status === "active" && c.type === "locacao_terreno").reduce((s, c) => s + c.monthly_value, 0);
    const margin = totalRevenue - totalCost;
    const marginPct = totalRevenue > 0 ? Math.round((margin / totalRevenue) * 100) : 0;
    const totalLandCosts = totalCost;

    const totalExpenses = financialEntries.filter(e => e.type === "expense" && e.status !== "cancelled").reduce((s, e) => s + e.amount, 0);
    const totalIncomes = financialEntries.filter(e => e.type === "income" && e.status !== "cancelled").reduce((s, e) => s + e.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    financialEntries.filter(e => e.type === "expense" && e.status !== "cancelled").forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const revenueByRoute = billboards.reduce((acc, b) => {
      if (!acc[b.route]) acc[b.route] = { route: b.route, revenue: 0, cost: 0, count: 0 };
      if (b.status === "occupied") acc[b.route].revenue += b.price;
      acc[b.route].cost += b.cost;
      acc[b.route].count++;
      return acc;
    }, {} as Record<string, { route: string; revenue: number; cost: number; count: number }>);
    const routeData = Object.values(revenueByRoute).map(r => ({ ...r, margin: r.revenue - r.cost }));

    return { totalRevenue, totalCost, margin, marginPct, totalLandCosts, routeData, totalExpenses, totalIncomes, expensesByCategory };
  }, [billboards, contracts, financialEntries]);

  const handleSave = async (data: any) => {
    if (data.id) { await updateFinancialEntry(data.id, data); toast.success("Lançamento atualizado"); }
    else { await addFinancialEntry(data); toast.success("Lançamento criado"); }
    setFormOpen(false); setEditingEntry(null);
  };

  const handleDelete = async (entry: FinancialEntry) => {
    if (confirm("Excluir este lançamento?")) { await deleteFinancialEntry(entry.id); toast.success("Excluído"); }
  };

  const block = <PermissionPageBlock module="financeiro" label="o Financeiro" />;
  if (!can("financeiro", "can_view")) return block;

  const clientList = clients.map(c => ({ id: c.id, name: c.name }));
  const contractList = contracts.map(c => ({ id: c.id, client_name: c.client_name }));
  const billboardList = billboards.map(b => ({ id: b.id, code: b.code }));

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1200px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-xl md:text-2xl font-display font-bold">Financeiro</h1><p className="text-muted-foreground text-sm mt-1">Visão financeira do negócio</p></div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            <button onClick={() => setTab("overview")} className={`px-3 py-1.5 rounded text-xs font-medium ${tab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Visão Geral</button>
            <button onClick={() => setTab("entries")} className={`px-3 py-1.5 rounded text-xs font-medium ${tab === "entries" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Lançamentos</button>
          </div>
          <PermissionGate module="financeiro" action="can_create" hide>
            <Button size="sm" onClick={() => { setEditingEntry({ ...emptyEntry }); setFormOpen(true); }}>
              <Plus className="w-4 h-4" /> Lançamento
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="stat-card stat-card-accent"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">MRR</span></div><p className="text-lg md:text-xl font-display font-bold text-primary">R$ {totalRevenue.toLocaleString()}</p></div>
        <div className="stat-card"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Receitas</span></div><p className="text-lg md:text-xl font-display font-bold">R$ {(totalRevenue + totalIncomes).toLocaleString()}</p></div>
        <div className="stat-card stat-card-warning"><div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Despesas</span></div><p className="text-lg md:text-xl font-display font-bold">R$ {(totalLandCosts + totalExpenses).toLocaleString()}</p></div>
        <div className="stat-card stat-card-success"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Margem</span></div><p className="text-lg md:text-xl font-display font-bold text-success">R$ {margin.toLocaleString()}</p></div>
        <div className="stat-card stat-card-success"><div className="flex items-center gap-2 mb-2"><Percent className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">% Margem</span></div><p className="text-lg md:text-xl font-display font-bold text-success">{marginPct}%</p></div>
      </div>

      {tab === "overview" && (
        <>
          {/* Expenses by category */}
          {Object.keys(expensesByCategory).length > 0 && (
            <div className="stat-card">
              <h3 className="font-display font-semibold mb-4 text-sm">Despesas por Categoria</h3>
              <div className="space-y-3">
                {Object.entries(expensesByCategory).map(([cat, amount]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{categoryLabels[cat] || cat}</span><span className="font-display font-semibold">R$ {amount.toLocaleString()}</span></div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width: `${Math.min((amount / (totalExpenses || 1)) * 100, 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue by route */}
          <div className="stat-card">
            <h3 className="font-display font-semibold mb-4 text-sm">Receita por Rodovia</h3>
            <div className="space-y-4">
              {routeData.map(r => (
                <div key={r.route}>
                  <div className="flex justify-between text-sm mb-1.5"><span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{r.route}</span><span className="font-display font-semibold text-primary">R$ {r.revenue.toLocaleString()}/mês</span></div>
                  <div className="flex gap-2 text-xs text-muted-foreground mb-1.5"><span>{r.count} pontos</span><span>Custo: R$ {r.cost.toLocaleString()}</span><span className="text-success">Margem: R$ {r.margin.toLocaleString()}</span></div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${r.revenue > 0 ? Math.min((r.revenue / 10000) * 100, 100) : 0}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Margin per billboard */}
          <div className="stat-card">
            <h3 className="font-display font-semibold mb-4 text-sm">Margem por Ponto</h3>
            <div className="space-y-2.5">
              {billboards.map(b => {
                const revenue = b.status === "occupied" ? b.price : 0;
                const m = revenue - b.cost;
                const pct = revenue > 0 ? Math.round((m / revenue) * 100) : 0;
                return (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-12">#{b.code}</span>
                    <span className="text-[10px] text-muted-foreground w-16 hidden md:block">{b.route}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${b.status === "occupied" ? "bg-primary" : "bg-muted-foreground/30"}`} style={{ width: `${Math.max(pct, 3)}%` }} /></div>
                    <span className="text-xs font-semibold w-20 text-right">{b.status === "occupied" ? `R$ ${m.toLocaleString()}` : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {tab === "entries" && (
        <div className="space-y-3">
          {financialEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum lançamento registrado</p>
              <p className="text-xs mt-1">Clique em "Lançamento" para adicionar</p>
            </div>
          ) : (
            financialEntries.map(entry => {
              const client = clients.find(c => c.id === entry.client_id);
              const billboard = billboards.find(b => b.id === entry.billboard_id);
              return (
                <div key={entry.id} className="stat-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${entry.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {entry.type === "income" ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm">{entry.description || "Sem descrição"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{categoryLabels[entry.category] || entry.category}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${entry.status === "paid" ? "bg-success/10 text-success" : entry.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{statusLabels[entry.status]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`font-display font-bold text-sm ${entry.type === "income" ? "text-success" : "text-destructive"}`}>
                        {entry.type === "income" ? "+" : "-"} R$ {entry.amount.toLocaleString()}
                      </span>
                      <PermissionGate module="financeiro" action="can_edit" hide>
                        <button onClick={() => { setEditingEntry({ ...entry }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                      </PermissionGate>
                      <PermissionGate module="financeiro" action="can_delete" hide>
                        <button onClick={() => handleDelete(entry)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                      </PermissionGate>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(entry.entry_date).toLocaleDateString("pt-BR")}</span>
                    {client && <span>Cliente: {client.name}</span>}
                    {billboard && <span>Ponto: #{billboard.code}</span>}
                  </div>
                  {entry.notes && <p className="text-xs text-muted-foreground mt-1 italic">{entry.notes}</p>}
                </div>
              );
            })
          )}
        </div>
      )}

      {formOpen && editingEntry && (
        <EntryForm initial={editingEntry} clients={clientList} contracts={contractList} billboards={billboardList}
          onSave={handleSave} onCancel={() => { setFormOpen(false); setEditingEntry(null); }} />
      )}
    </div>
  );
}
