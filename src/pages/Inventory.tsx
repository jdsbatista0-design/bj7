import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useData, Billboard } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { Search, X, Plus, Trash2, Edit, Car, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

const typeLabels: Record<string, string> = {
  painel_rodoviario: "Painel Rodoviário", frontlight: "Frontlight", backlight: "Backlight",
  painel_sight: "Painel Sight", painel_vip: "Painel VIP",
};
const seasonLabels: Record<string, string> = { alta: "Alta Temporada", media: "Média", baixa: "Baixa Temporada" };

function createLabelIcon(code: string, status: Billboard["status"]) {
  const colors = { available: "#3b82f6", occupied: "#ef4444", reserved: "#eab308" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="padding:4px 10px;border-radius:8px;background:${color};color:${status === 'reserved' ? '#000' : '#fff'};font-weight:700;font-size:12px;font-family:'Space Grotesk',sans-serif;white-space:nowrap;border:2px solid rgba(255,255,255,0.2);box-shadow:0 2px 12px ${color}66;">${code}</div>`,
    iconSize: [60, 28], iconAnchor: [30, 14],
  });
}

const emptyBillboard: Partial<Billboard> = {
  code: "", lat: -25.85, lng: -48.65, city: "", region: "Litoral PR", route: "PR-412",
  address: "", type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "",
  estimated_flow: 0, audience_profile: "", seasonality: "media", traffic_type: "",
  land_owner: "", land_owner_id: null, cost: 0, price: 0, production_cost: 0,
  status: "available", photos: [], description: "", formats: ["Lona impressa"],
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function BillboardForm({ initial, onSave, onCancel, title }: {
  initial: Partial<Billboard> & { id?: string };
  onSave: (data: any) => void;
  onCancel: () => void;
  title: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="absolute top-4 right-4 w-96 glass-panel z-[1000] animate-slide-up overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-bold text-sm">{title}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Código</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.code || ""} onChange={e => set("code", e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.status || "available"} onChange={e => set("status", e.target.value)}>
              <option value="available">Disponível</option>
              <option value="occupied">Ocupado</option>
              <option value="reserved">Reservado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Endereço</label>
          <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.address || ""} onChange={e => set("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cidade</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.city || ""} onChange={e => set("city", e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Rodovia</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.route || ""} onChange={e => set("route", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Latitude</label>
            <input type="number" step="any" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.lat || 0} onChange={e => set("lat", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Longitude</label>
            <input type="number" step="any" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.lng || 0} onChange={e => set("lng", parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.type || "painel_rodoviario"} onChange={e => set("type", e.target.value)}>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Dimensão</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.dimension || ""} onChange={e => set("dimension", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Sentido</label>
          <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.direction || ""} onChange={e => set("direction", e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Preço/mês</label>
            <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.price || 0} onChange={e => set("price", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Custo terreno</label>
            <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.cost || 0} onChange={e => set("cost", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Produção</label>
            <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.production_cost || 0} onChange={e => set("production_cost", parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fluxo estimado (veíc/dia)</label>
          <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.estimated_flow || 0} onChange={e => set("estimated_flow", parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Proprietário do terreno</label>
          <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.land_owner || ""} onChange={e => set("land_owner", e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Descrição</label>
          <textarea className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary h-20 resize-none" value={form.description || ""} onChange={e => set("description", e.target.value)} />
        </div>
      </div>
      <div className="p-4 border-t border-border flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
      </div>
    </div>
  );
}

function BillboardDetail({ billboard, onClose, onEdit, onDelete }: {
  billboard: Billboard; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const statusLabels = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusBadge = { available: "badge-available", occupied: "badge-occupied", reserved: "badge-reserved" };
  return (
    <div className="absolute top-4 right-4 w-96 glass-panel z-[1000] animate-slide-up overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-xl text-primary">#{billboard.code}</span>
          <span className={statusBadge[billboard.status]}>{statusLabels[billboard.status]}</span>
        </div>
        <div className="flex items-center gap-1">
          <PermissionGate module="inventario" action="can_edit" hide>
            <button onClick={onEdit} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
          </PermissionGate>
          <PermissionGate module="inventario" action="can_delete" hide>
            <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
          </PermissionGate>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Localização</h4>
          <div className="space-y-1 text-sm">
            <Row label="Endereço" value={billboard.address} />
            <Row label="Rodovia" value={billboard.route} />
            <Row label="Cidade" value={`${billboard.city} - ${billboard.region}`} />
            <Row label="Sentido" value={billboard.direction} />
            <Row label="Coordenadas" value={`${billboard.lat}, ${billboard.lng}`} />
          </div>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Dados Técnicos</h4>
          <div className="space-y-1 text-sm">
            <Row label="Tipo" value={typeLabels[billboard.type] || billboard.type} />
            <Row label="Dimensão" value={billboard.dimension} />
            <Row label="Área" value={`${billboard.area} m²`} />
            <Row label="Formatos" value={billboard.formats.join(", ")} />
          </div>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5"><Car className="w-3 h-3" /> Audiência</h4>
          <div className="space-y-1 text-sm">
            <Row label="Fluxo estimado" value={`${billboard.estimated_flow.toLocaleString()} veíc/dia`} highlight />
            <Row label="Impactos/mês" value={`${(billboard.estimated_flow * 30).toLocaleString()}`} highlight />
            <Row label="Sazonalidade" value={seasonLabels[billboard.seasonality] || billboard.seasonality} />
            <Row label="Tipo de tráfego" value={billboard.traffic_type} />
          </div>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Comercial</h4>
          <div className="space-y-1 text-sm">
            <Row label="Veiculação mensal" value={`R$ ${billboard.price.toLocaleString()}`} highlight />
            <Row label="Produção" value={`R$ ${billboard.production_cost.toLocaleString()}`} />
            <Row label="Custo terreno" value={`R$ ${billboard.cost.toLocaleString()}/mês`} />
            <Row label="Margem" value={`R$ ${(billboard.price - billboard.cost).toLocaleString()}/mês`} highlight />
            <Row label="Proprietário" value={billboard.land_owner} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">{billboard.description}</p>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground whitespace-nowrap">{label}</span>
      <span className={`text-right ${highlight ? "font-semibold text-primary" : ""}`}>{value}</span>
    </div>
  );
}

export default function Inventory() {
  const { can } = usePermissions();
  const { billboards, addBillboard, updateBillboard, deleteBillboard } = useData();
  const [selected, setSelected] = useState<Billboard | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [formData, setFormData] = useState<any>(null);
  const [addingByClick, setAddingByClick] = useState(false);

  const routes = [...new Set(billboards.map(b => b.route))];
  const filtered = billboards.filter(b => {
    const matchSearch = b.code.includes(search) || b.city.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchRoute = routeFilter === "all" || b.route === routeFilter;
    return matchSearch && matchStatus && matchRoute;
  });

  const handleMapClick = (lat: number, lng: number) => {
    if (!addingByClick) return;
    setFormData({ ...emptyBillboard, lat, lng, code: String(Math.max(...billboards.map(b => parseInt(b.code) || 0), 0) + 1) });
    setMode("add");
    setAddingByClick(false);
  };

  const handleSave = async (data: any) => {
    if (mode === "add") {
      await addBillboard(data);
      toast.success(`Ponto #${data.code} adicionado`);
    } else if (mode === "edit" && data.id) {
      await updateBillboard(data.id, data);
      setSelected(null);
      toast.success(`Ponto #${data.code} atualizado`);
    }
    setMode("view");
    setFormData(null);
  };

  const handleDelete = async () => {
    if (selected && confirm(`Excluir ponto #${selected.code}?`)) {
      await deleteBillboard(selected.id);
      setSelected(null);
      toast.success("Ponto excluído");
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
      <PermissionPageBlock module="inventario" label="o Inventário" />
      <div className="p-3 flex items-center gap-2 border-b border-border bg-card/60 backdrop-blur-sm z-10 flex-wrap">
        <h1 className="font-display font-bold text-lg mr-2">Inventário</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 flex-1 max-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Código, cidade..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="bg-muted text-sm px-3 py-1.5 rounded-lg text-foreground outline-none" value={routeFilter} onChange={e => setRouteFilter(e.target.value)}>
          <option value="all">Todas Rodovias</option>
          {routes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {["all", "available", "occupied", "reserved"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "Todos" : s === "available" ? "Disponível" : s === "occupied" ? "Ocupado" : "Reservado"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{filtered.length} pontos</span>
          <Button size="sm" variant={addingByClick ? "destructive" : "default"} onClick={() => {
            if (addingByClick) { setAddingByClick(false); } else { setAddingByClick(true); toast.info("Clique no mapa para posicionar o novo ponto"); }
          }}>
            {addingByClick ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Novo Ponto</>}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer center={[-25.85, -48.65]} zoom={10} className="w-full h-full" zoomControl={true}>
          <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapClickHandler onMapClick={handleMapClick} />
          {filtered.map(b => (
            <Marker key={b.id} position={[b.lat, b.lng]} icon={createLabelIcon(b.code, b.status)} eventHandlers={{ click: () => { if (!addingByClick) { setSelected(b); setMode("view"); } } }} />
          ))}
        </MapContainer>

        {mode === "view" && selected && (
          <BillboardDetail billboard={selected} onClose={() => setSelected(null)}
            onEdit={() => { setFormData({ ...selected }); setMode("edit"); }}
            onDelete={handleDelete}
          />
        )}

        {(mode === "add" || mode === "edit") && formData && (
          <BillboardForm
            initial={formData}
            title={mode === "add" ? "Novo Ponto" : `Editar #${formData.code}`}
            onSave={handleSave}
            onCancel={() => { setMode("view"); setFormData(null); }}
          />
        )}
      </div>
    </div>
  );
}
