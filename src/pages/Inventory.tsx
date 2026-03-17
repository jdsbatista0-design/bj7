import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { billboards, Billboard } from "@/data/mockData";
import { Search, Filter, Plus, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Custom colored markers
function createIcon(status: Billboard["status"]) {
  const colors = { available: "#3b82f6", occupied: "#ef4444", reserved: "#eab308" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="
      width:32px;height:32px;border-radius:50%;background:${color};
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:11px;font-family:Inter;
      border:2px solid rgba(255,255,255,0.3);
      box-shadow:0 2px 8px ${color}88;
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createLabelIcon(code: string, status: Billboard["status"]) {
  const colors = { available: "#3b82f6", occupied: "#ef4444", reserved: "#eab308" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="
      padding:4px 10px;border-radius:8px;background:${color};
      color:white;font-weight:700;font-size:12px;font-family:'Space Grotesk',sans-serif;
      white-space:nowrap;border:2px solid rgba(255,255,255,0.2);
      box-shadow:0 2px 12px ${color}66;
    ">${code}</div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
  });
}

function BillboardDetail({ billboard, onClose }: { billboard: Billboard; onClose: () => void }) {
  const statusLabels = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusColors = { available: "text-primary", occupied: "text-destructive", reserved: "text-warning" };

  return (
    <div className="absolute top-4 right-4 w-80 glass-panel p-5 z-[1000] animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-bold text-lg">#{billboard.code}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className={`text-xs font-semibold mb-3 ${statusColors[billboard.status]}`}>
        ● {statusLabels[billboard.status]}
      </div>
      <div className="space-y-2 text-sm">
        <Row label="Endereço" value={billboard.address} />
        <Row label="Cidade" value={`${billboard.city} - ${billboard.region}`} />
        <Row label="Tipo" value={billboard.type} />
        <Row label="Dimensão" value={billboard.dimension} />
        <Row label="Sentido" value={billboard.direction} />
        <Row label="Fluxo Est." value={`${billboard.estimatedFlow.toLocaleString()} veíc/dia`} />
        <Row label="Proprietário" value={billboard.landOwner} />
        <div className="border-t border-border pt-2 mt-2" />
        <Row label="Custo" value={`R$ ${billboard.cost.toLocaleString()}`} />
        <Row label="Preço" value={`R$ ${billboard.price.toLocaleString()}`} highlight />
        <Row label="Margem" value={`R$ ${(billboard.price - billboard.cost).toLocaleString()}`} highlight />
      </div>
      <p className="text-xs text-muted-foreground mt-3">{billboard.description}</p>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-semibold text-accent" : ""}>{value}</span>
    </div>
  );
}

export default function Inventory() {
  const [selected, setSelected] = useState<Billboard | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = billboards.filter(b => {
    const matchSearch = b.code.includes(search) || b.city.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="h-screen flex flex-col relative">
      {/* Toolbar */}
      <div className="p-4 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <h1 className="font-display font-bold text-lg mr-4">Inventário</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            placeholder="Buscar código, cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
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
          center={[-23.55, -46.63]}
          zoom={12}
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
            { label: "Disponível", color: "bg-primary" },
            { label: "Ocupado", color: "bg-destructive" },
            { label: "Reservado", color: "bg-warning" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
