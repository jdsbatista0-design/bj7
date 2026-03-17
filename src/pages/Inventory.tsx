import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useData } from "@/contexts/DataContext";
import { Billboard } from "@/data/mockData";
import { Search, X, Plus, Trash2, Edit, Car, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

const typeLabels: Record<string, string> = {
  painel_rodoviario: "Painel Rodoviário", frontlight: "Frontlight", backlight: "Backlight",
  painel_sight: "Painel Sight", painel_vip: "Painel VIP",
};
const seasonLabels = { alta: "Alta Temporada", media: "Média", baixa: "Baixa Temporada" };

function createLabelIcon(code: string, status: Billboard["status"]) {
  const colors = { available: "#3b82f6", occupied: "#ef4444", reserved: "#eab308" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="padding:4px 10px;border-radius:8px;background:${color};color:${status === 'reserved' ? '#000' : '#fff'};font-weight:700;font-size:12px;font-family:'Space Grotesk',sans-serif;white-space:nowrap;border:2px solid rgba(255,255,255,0.2);box-shadow:0 2px 12px ${color}66;">${code}</div>`,
    iconSize: [60, 28], iconAnchor: [30, 14],
  });
}

const emptyBillboard: Omit<Billboard, "id"> = {
  code: "", lat: -25.85, lng: -48.65, city: "", region: "Litoral PR", route: "PR-412",
  address: "", type: "painel_rodoviario", dimension: "9x3m", area: 27, direction: "",
  estimatedFlow: 0, audienceProfile: "", seasonality: "media", trafficType: "",
  landOwner: "", landOwnerId: "", cost: 0, price: 0, productionCost: 0,
  status: "available", photos: [], description: "", formats: ["Lona impressa"],
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function BillboardForm({ initial, onSave, onCancel, title }: {
  initial: Omit<Billboard, "id"> & { id?: string };
  onSave: (data: Omit<Billboard, "id"> & { id?: string }) => void;
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
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.code} onChange={e => set("code", e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="available">Disponível</option>
              <option value="occupied">Ocupado</option>
              <option value="reserved">Reservado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Endereço</label>
          <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.address} onChange={e => set("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cidade</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.city} onChange={e => set("city", e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Rodovia</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.route} onChange={e => set("route", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Latitude</label>
            <input type="number" step="any" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.lat} onChange={e => set("lat", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Longitude</label>
            <input type="number" step="any" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.lng} onChange={e => set("lng", parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label>
            <select className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none" value={form.type} onChange={e => set("type", e.target.value)}>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Dimensão</label>
            <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.dimension} onChange={e => set("dimension", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Sentido</label>
          <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.direction} onChange={e => set("direction", e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Preço/mês</label>
            <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.price} onChange={e => set("price", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Custo terreno</label>
            <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.cost} onChange={e => set("cost", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Produção</label>
            <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.productionCost} onChange={e => set("productionCost", parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fluxo estimado (veíc/dia)</label>
          <input type="number" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.estimatedFlow} onChange={e => set("estimatedFlow", parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Proprietário do terreno</label>
          <input className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" value={form.landOwner} onChange={e => set("landOwner", e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Descrição</label>
          <textarea className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary h-20 resize-none" value={form.description} onChange={e => set("description", e.target.value)} />
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
          <button onClick={onEdit} className="text-muted-foreground hover:text-primary p-1"><Edit className="w-4 h-4" /></button>
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
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
            <Row label="Fluxo estimado" value={`${billboard.estimatedFlow.toLocaleString()} veíc/dia`} highlight />
            <Row label="Impactos/mês" value={`${(billboard.estimatedFlow * 30).toLocaleString()}`} highlight />
            <Row label="Sazonalidade" value={seasonLabels[billboard.seasonality]} />
            <Row label="Tipo de tráfego" value={billboard.trafficType} />
          </div>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Comercial</h4>
          <div className="space-y-1 text-sm">
            <Row label="Veiculação mensal" value={`R$ ${billboard.price.toLocaleString()}`} highlight />
            <Row label="Produção" value={`R$ ${billboard.productionCost.toLocaleString()}`} />
            <Row label="Custo terreno" value={`R$ ${billboard.cost.toLocaleString()}/mês`} />
            <Row label="Margem" value={`R$ ${(billboard.price - billboard.cost).toLocaleString()}/mês`} highlight />
            <Row label="Proprietário" value={billboard.landOwner} />
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

  const handleSave = (data: any) => {
    if (mode === "add") {
      const id = `b${Date.now()}`;
      addBillboard({ ...data, id });
      toast.success(`Ponto #${data.code} adicionado`);
    } else if (mode === "edit" && data.id) {
      updateBillboard(data.id, data);
      setSelected({ ...selected!, ...data });
      toast.success(`Ponto #${data.code} atualizado`);
    }
    setMode("view");
    setFormData(null);
  };

  const handleDelete = () => {
    if (selected && confirm(`Excluir ponto #${selected.code}?`)) {
      deleteBillboard(selected.id);
      setSelected(null);
      toast.success("Ponto excluído");
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
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

        <div className="absolute bottom-4 left-4 glass-panel px-4 py-2.5 z-[1000] flex gap-4">
          {[{ label: "Disponível", color: "bg-info" }, { label: "Ocupado", color: "bg-destructive" }, { label: "Reservado", color: "bg-primary" }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} /><span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-4 glass-panel px-4 py-3 z-[1000]">
          <p className="font-display font-bold text-sm text-primary">BJ7 Mídia</p>
          <p className="text-[11px] text-muted-foreground">Litoral do Paraná · {billboards.length} pontos</p>
          <div className="flex gap-3 mt-2 text-[11px]">
            <span className="text-info">{billboards.filter(b => b.status === "available").length} disponíveis</span>
            <span className="text-destructive">{billboards.filter(b => b.status === "occupied").length} ocupados</span>
            <span className="text-primary">{billboards.filter(b => b.status === "reserved").length} reservados</span>
          </div>
        </div>
        {addingByClick && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 z-[1000] text-sm text-primary font-semibold animate-slide-up">
            📍 Clique no mapa para posicionar o ponto
          </div>
        )}
      </div>
    </div>
  );
}
