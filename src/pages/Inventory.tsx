import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { billboards, Billboard } from "@/data/mockData";
import { Search, X, Eye, MapPin, Car, Calendar, DollarSign, Layers } from "lucide-react";
import "leaflet/dist/leaflet.css";

const typeLabels: Record<string, string> = {
  painel_rodoviario: "Painel Rodoviário",
  frontlight: "Frontlight",
  backlight: "Backlight",
  painel_sight: "Painel Sight",
  painel_vip: "Painel VIP",
};

const seasonLabels = { alta: "Alta Temporada", media: "Média", baixa: "Baixa Temporada" };

function createLabelIcon(code: string, status: Billboard["status"]) {
  const colors = { available: "#3b82f6", occupied: "#ef4444", reserved: "#eab308" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="
      padding:4px 10px;border-radius:8px;background:${color};
      color:${status === 'reserved' ? '#000' : '#fff'};font-weight:700;font-size:12px;font-family:'Space Grotesk',sans-serif;
      white-space:nowrap;border:2px solid rgba(255,255,255,0.2);
      box-shadow:0 2px 12px ${color}66;
    ">${code}</div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
  });
}

function BillboardDetail({ billboard, onClose }: { billboard: Billboard; onClose: () => void }) {
  const statusLabels = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusBadge = {
    available: "badge-available",
    occupied: "badge-occupied",
    reserved: "badge-reserved",
  };

  return (
    <div className="absolute top-4 right-4 w-96 glass-panel z-[1000] animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-xl text-primary">#{billboard.code}</span>
          <span className={statusBadge[billboard.status]}>{statusLabels[billboard.status]}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Location */}
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

        {/* Technical */}
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Dados Técnicos</h4>
          <div className="space-y-1 text-sm">
            <Row label="Tipo" value={typeLabels[billboard.type] || billboard.type} />
            <Row label="Dimensão" value={billboard.dimension} />
            <Row label="Área" value={`${billboard.area} m²`} />
            <Row label="Formatos" value={billboard.formats.join(", ")} />
          </div>
        </div>

        {/* Audience */}
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
            <Car className="w-3 h-3" /> Audiência
          </h4>
          <div className="space-y-1 text-sm">
            <Row label="Fluxo estimado" value={`${billboard.estimatedFlow.toLocaleString()} veíc/dia`} highlight />
            <Row label="Impactos/mês" value={`${(billboard.estimatedFlow * 30).toLocaleString()}`} highlight />
            <Row label="Perfil" value={billboard.audienceProfile} />
            <Row label="Sazonalidade" value={seasonLabels[billboard.seasonality]} />
            <Row label="Tipo de tráfego" value={billboard.trafficType} />
          </div>
        </div>

        {/* Commercial */}
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
            <DollarSign className="w-3 h-3" /> Comercial
          </h4>
          <div className="space-y-1 text-sm">
            <Row label="Veiculação mensal" value={`R$ ${billboard.price.toLocaleString()}`} highlight />
            <Row label="Produção (lona)" value={`R$ ${billboard.productionCost.toLocaleString()}`} />
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
  const [selected, setSelected] = useState<Billboard | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [routeFilter, setRouteFilter] = useState<string>("all");

  const routes = [...new Set(billboards.map(b => b.route))];

  const filtered = billboards.filter(b => {
    const matchSearch = b.code.includes(search) || b.city.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchRoute = routeFilter === "all" || b.route === routeFilter;
    return matchSearch && matchStatus && matchRoute;
  });

  return (
    <div className="h-screen flex flex-col relative">
      {/* Toolbar */}
      <div className="p-3 flex items-center gap-2 border-b border-border bg-card/60 backdrop-blur-sm z-10 flex-wrap">
        <h1 className="font-display font-bold text-lg mr-2">Inventário</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 flex-1 max-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            placeholder="Código, cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <select
          className="bg-muted text-sm px-3 py-1.5 rounded-lg text-foreground outline-none"
          value={routeFilter}
          onChange={e => setRouteFilter(e.target.value)}
        >
          <option value="all">Todas Rodovias</option>
          {routes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {["all", "available", "occupied", "reserved"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? "Todos" : s === "available" ? "Disponível" : s === "occupied" ? "Ocupado" : "Reservado"}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} pontos</span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[-25.85, -48.65]}
          zoom={10}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {filtered.map(b => (
            <Marker
              key={b.id}
              position={[b.lat, b.lng]}
              icon={createLabelIcon(b.code, b.status)}
              eventHandlers={{ click: () => setSelected(b) }}
            />
          ))}
        </MapContainer>

        {selected && <BillboardDetail billboard={selected} onClose={() => setSelected(null)} />}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-panel px-4 py-2.5 z-[1000] flex gap-4">
          {[
            { label: "Disponível", color: "bg-info" },
            { label: "Ocupado", color: "bg-destructive" },
            { label: "Reservado", color: "bg-primary" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="absolute top-4 left-4 glass-panel px-4 py-3 z-[1000]">
          <p className="font-display font-bold text-sm text-primary">BJ7 Mídia</p>
          <p className="text-[11px] text-muted-foreground">Litoral do Paraná · {billboards.length} pontos estratégicos</p>
          <div className="flex gap-3 mt-2 text-[11px]">
            <span className="text-info">{billboards.filter(b => b.status === "available").length} disponíveis</span>
            <span className="text-destructive">{billboards.filter(b => b.status === "occupied").length} ocupados</span>
            <span className="text-primary">{billboards.filter(b => b.status === "reserved").length} reservados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
