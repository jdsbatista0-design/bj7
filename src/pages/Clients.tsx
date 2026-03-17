import { useData, Client } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { Users, Building2, Phone, Mail, MapPin, FileText, Search, Plus, Edit, Trash2, X, Palette, Landmark, User, CreditCard, FileCheck, Ruler } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const emptyClient = (type: "advertiser" | "landowner"): Partial<Client> => ({
  name: "", company: "", document: "", phone: "", email: "", type,
  contract_ids: [], billboard_ids: [], history: [], address: "",
  segment: "", notes: "", contact_person: "", land_registry: "", property_area: "", bank_info: "",
});

const inputClass = "w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary";
const labelClass = "text-[10px] uppercase tracking-wider text-muted-foreground";

function ClientForm({ initial, onSave, onCancel, title }: {
  initial: Partial<Client> & { id?: string }; onSave: (c: any) => void; onCancel: () => void; title: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const isAdvertiser = form.type === "advertiser";

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass-panel max-w-lg w-full animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isAdvertiser ? "bg-primary/10" : "bg-accent"}`}>
              {isAdvertiser ? <Building2 className="w-5 h-5 text-primary" /> : <Landmark className="w-5 h-5 text-accent-foreground" />}
            </div>
            <h3 className="font-display font-bold text-lg">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo de Cadastro</label>
            <select className={inputClass} value={form.type || "advertiser"} onChange={e => set("type", e.target.value)}>
              <option value="advertiser">🏢 Anunciante</option>
              <option value="landowner">🏞️ Proprietário de Terreno</option>
            </select>
          </div>

          {/* === SEÇÃO: Dados Pessoais === */}
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Dados Pessoais
            </h4>
            <div className="space-y-3">
              <div><label className={labelClass}>Nome completo</label><input className={inputClass} value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="Nome do responsável" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>CPF/CNPJ</label><input className={inputClass} value={form.document || ""} onChange={e => set("document", e.target.value)} placeholder="000.000.000-00" /></div>
                <div><label className={labelClass}>Pessoa de contato</label><input className={inputClass} value={form.contact_person || ""} onChange={e => set("contact_person", e.target.value)} placeholder="Nome do contato secundário" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Telefone</label><input className={inputClass} value={form.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="(00) 00000-0000" /></div>
                <div><label className={labelClass}>Email</label><input className={inputClass} value={form.email || ""} onChange={e => set("email", e.target.value)} placeholder="email@empresa.com" /></div>
              </div>
              <div><label className={labelClass}>Endereço</label><input className={inputClass} value={form.address || ""} onChange={e => set("address", e.target.value)} placeholder="Rua, nº, cidade - UF" /></div>
            </div>
          </div>

          {/* === SEÇÃO ANUNCIANTE === */}
          {isAdvertiser && (
            <div className="border-t border-border pt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Dados do Anunciante
              </h4>
              <div className="space-y-3">
                <div><label className={labelClass}>Empresa / Razão Social</label><input className={inputClass} value={form.company || ""} onChange={e => set("company", e.target.value)} placeholder="Nome da empresa" /></div>
                <div><label className={labelClass}>Segmento / Ramo</label><input className={inputClass} value={form.segment || ""} onChange={e => set("segment", e.target.value)} placeholder="Ex: Varejo, Alimentação, Imobiliário..." /></div>
                <div>
                  <label className={labelClass}>Observações / Histórico de campanhas</label>
                  <textarea className={`${inputClass} h-24 resize-none`} value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Artes já produzidas, campanhas anteriores, preferências de mídia, materiais entregues..." />
                </div>
              </div>
            </div>
          )}

          {/* === SEÇÃO PROPRIETÁRIO === */}
          {!isAdvertiser && (
            <div className="border-t border-border pt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" /> Dados do Proprietário
              </h4>
              <div className="space-y-3">
                <div><label className={labelClass}>Nome do proprietário / Empresa</label><input className={inputClass} value={form.company || ""} onChange={e => set("company", e.target.value)} placeholder="Nome ou razão social" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>Matrícula do imóvel</label><input className={inputClass} value={form.land_registry || ""} onChange={e => set("land_registry", e.target.value)} placeholder="Nº da matrícula" /></div>
                  <div><label className={labelClass}>Área do terreno</label><input className={inputClass} value={form.property_area || ""} onChange={e => set("property_area", e.target.value)} placeholder="Ex: 500m² / 2 hectares" /></div>
                </div>
                <div><label className={labelClass}>Dados bancários para pagamento</label><input className={inputClass} value={form.bank_info || ""} onChange={e => set("bank_info", e.target.value)} placeholder="Banco, Ag, Conta, PIX..." /></div>
                <div>
                  <label className={labelClass}>Observações / Documentos pendentes</label>
                  <textarea className={`${inputClass} h-24 resize-none`} value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Escritura, contrato de cessão, documentos pendentes, anotações sobre o terreno..." />
                </div>
              </div>
            </div>
          )}

          {/* === SEÇÃO FINANCEIRO === */}
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> {isAdvertiser ? "Faturamento" : "Pagamento"}
            </h4>
            <div>
              <label className={labelClass}>{isAdvertiser ? "Dados de faturamento / Observações financeiras" : "Dados bancários (se não preenchido acima)"}</label>
              <input className={inputClass} value={form.bank_info || ""} onChange={e => set("bank_info", e.target.value)} placeholder={isAdvertiser ? "CNPJ faturamento, condição de pgto..." : "Banco, Ag, Conta, PIX..."} />
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

export default function Clients() {
  const { can } = usePermissions();
  const { clients, contracts, billboards, addClient, updateClient, deleteClient } = useData();
  const [tab, setTab] = useState<"advertiser" | "landowner">("advertiser");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<(Partial<Client> & { id?: string }) | null>(null);

  const filtered = clients.filter(c => {
    const matchType = c.type === tab;
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || (c.company || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleSave = async (data: any) => {
    if (data.id) {
      await updateClient(data.id, data);
      toast.success("Cliente atualizado");
    } else {
      await addClient(data);
      toast.success("Cliente cadastrado");
    }
    setFormOpen(false);
    setEditingClient(null);
  };

  const handleDelete = async (c: Client) => {
    if (!can("clientes", "can_delete")) { toast.error("Sem permissão para excluir"); return; }
    if (confirm(`Excluir ${c.name}?`)) {
      await deleteClient(c.id);
      toast.success("Cliente excluído");
    }
  };

  const block = <PermissionPageBlock module="clientes" label="Clientes" />;
  if (!can("clientes", "can_view")) return block;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold">Relacionamento</h1><p className="text-muted-foreground text-sm mt-1">Gestão de anunciantes e proprietários</p></div>
        <PermissionGate module="clientes" action="can_create" hide>
          <Button onClick={() => { setEditingClient(emptyClient(tab)); setFormOpen(true); }}>
            <Plus className="w-4 h-4" /> Novo {tab === "advertiser" ? "Anunciante" : "Proprietário"}
          </Button>
        </PermissionGate>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex bg-muted rounded-lg p-1">
          <button onClick={() => setTab("advertiser")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${tab === "advertiser" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Building2 className="w-4 h-4" /> Anunciantes</button>
          <button onClick={() => setTab("landowner")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${tab === "landowner" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Landmark className="w-4 h-4" /> Proprietários</button>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-xs"><Search className="w-4 h-4 text-muted-foreground" /><input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <span className="text-xs text-muted-foreground">{filtered.length} registros</span>
      </div>
      <div className="space-y-3">
        {filtered.map(c => {
          const clientContracts = contracts.filter(ct => ct.client_id === c.id);
          const clientBillboards = (c.billboard_ids || []).map(bid => billboards.find(b => b.id === bid)).filter(Boolean);
          const isAdv = c.type === "advertiser";
          return (
            <div key={c.id} className={`stat-card ${!isAdv ? "stat-card-accent" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isAdv ? "bg-primary/10" : "bg-accent"}`}>
                    {isAdv ? <Building2 className="w-5 h-5 text-primary" /> : <Landmark className="w-5 h-5 text-accent-foreground" />}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-lg">{c.name}</p>
                    {c.company && <p className="text-sm text-muted-foreground">{c.company}</p>}
                    {c.document && <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.document}</p>}
                    {isAdv && c.segment && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">{c.segment}</span>}
                    {!isAdv && c.land_registry && <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full mt-1 inline-block">Mat. {c.land_registry}</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {clientContracts.length > 0 && <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1"><FileText className="w-3 h-3" /> {clientContracts.length}</span>}
                  {clientBillboards.length > 0 && <span className="text-xs bg-info/10 text-info px-2.5 py-1 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3" /> {clientBillboards.length}</span>}
                  <PermissionGate module="clientes" action="can_edit" hide>
                    <button onClick={() => { setEditingClient({ ...c }); setFormOpen(true); }} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
                  </PermissionGate>
                  <PermissionGate module="clientes" action="can_delete" hide>
                    <button onClick={() => handleDelete(c)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                  </PermissionGate>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                {c.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}</span>}
                {!isAdv && c.property_area && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{c.property_area}</span>}
              </div>
              {c.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">{c.notes}</p>
              )}
              {clientBillboards.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {clientBillboards.map(b => b && <span key={b.id} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">#{b.code} · {b.route}</span>)}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado</p>}
      </div>
      {formOpen && editingClient && (
        <ClientForm initial={editingClient} title={editingClient.id ? `Editar ${editingClient.name}` : `Novo ${tab === "advertiser" ? "Anunciante" : "Proprietário"}`} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditingClient(null); }} />
      )}
    </div>
  );
}