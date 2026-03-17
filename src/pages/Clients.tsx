import { useData } from "@/contexts/DataContext";
import { Client } from "@/data/mockData";
import { Users, Building2, Phone, Mail, MapPin, FileText, Search, Plus, Edit, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const emptyClient = (type: "advertiser" | "landowner"): Omit<Client, "id"> => ({
  name: "", company: "", document: "", phone: "", email: "", type,
  contracts: [], billboards: [], history: [], address: "",
});

function ClientForm({ initial, onSave, onCancel, title }: {
  initial: Omit<Client, "id"> & { id?: string }; onSave: (c: any) => void; onCancel: () => void; title: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass-panel max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome completo</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Empresa</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.company} onChange={e => set("company", e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">CPF/CNPJ</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.document} onChange={e => set("document", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Telefone</label>
              <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
              <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Endereço</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="advertiser">Anunciante</option>
              <option value="landowner">Proprietário</option>
            </select>
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

export default function Clients() {
  const { clients, contracts, billboards, addClient, updateClient, deleteClient } = useData();
  const [tab, setTab] = useState<"advertiser" | "landowner">("advertiser");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<(Omit<Client, "id"> & { id?: string }) | null>(null);

  const filtered = clients.filter(c => {
    const matchType = c.type === tab;
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleSave = (data: any) => {
    if (data.id) {
      updateClient(data.id, data);
      toast.success("Cliente atualizado");
    } else {
      addClient({ ...data, id: `c${Date.now()}` });
      toast.success("Cliente cadastrado");
    }
    setFormOpen(false);
    setEditingClient(null);
  };

  const handleDelete = (c: Client) => {
    if (confirm(`Excluir ${c.name}?`)) {
      deleteClient(c.id);
      toast.success("Cliente excluído");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Relacionamento</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão de anunciantes e proprietários</p>
        </div>
        <Button onClick={() => { setEditingClient(emptyClient(tab)); setFormOpen(true); }}>
          <Plus className="w-4 h-4" /> Novo {tab === "advertiser" ? "Anunciante" : "Proprietário"}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-muted rounded-lg p-1">
          <button onClick={() => setTab("advertiser")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${tab === "advertiser" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Building2 className="w-4 h-4" /> Anunciantes
          </button>
          <button onClick={() => setTab("landowner")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${tab === "landowner" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Users className="w-4 h-4" /> Proprietários
          </button>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} registros</span>
      </div>

      <div className="space-y-3">
        {filtered.map(c => {
          const clientContracts = contracts.filter(ct => ct.clientId === c.id);
          const clientBillboards = c.billboards.map(bid => billboards.find(b => b.id === bid)).filter(Boolean);
          return (
            <div key={c.id} className={`stat-card ${tab === "landowner" ? "stat-card-accent" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-lg">{c.name}</p>
                  {c.company && <p className="text-sm text-muted-foreground">{c.company}</p>}
                  {c.document && <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.document}</p>}
                </div>
                <div className="flex gap-2 items-center">
                  {clientContracts.length > 0 && <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1"><FileText className="w-3 h-3" /> {clientContracts.length}</span>}
                  {clientBillboards.length > 0 && <span className="text-xs bg-info/10 text-info px-2.5 py-1 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3" /> {clientBillboards.length}</span>}
                  <button onClick={() => { setEditingClient({ ...c }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                {c.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}</span>}
              </div>
              {clientBillboards.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {clientBillboards.map(b => b && <span key={b.id} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">#{b.code} · {b.route}</span>)}
                </div>
              )}
              {c.history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  {c.history.map((h, i) => <p key={i} className="text-xs text-muted-foreground">{h}</p>)}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado</p>}
      </div>

      {formOpen && editingClient && (
        <ClientForm
          initial={editingClient}
          title={editingClient.id ? `Editar ${editingClient.name}` : `Novo ${tab === "advertiser" ? "Anunciante" : "Proprietário"}`}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); setEditingClient(null); }}
        />
      )}
    </div>
  );
}
