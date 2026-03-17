import { useState } from "react";
import { useData, Billboard } from "@/contexts/DataContext";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Search, MapPin, ArrowRight, Menu, X, Phone, Mail, Car, Ruler, Eye,
  Building2, User, Shield, Award, TrendingUp, Navigation, ExternalLink,
  ChevronRight, Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import logoBj7 from "@/assets/logo-bj7.png";
import heroBillboard from "@/assets/hero-billboard.jpg";

const typeLabels: Record<string, string> = {
  painel_rodoviario: "Painel Rodoviário", frontlight: "Frontlight",
  backlight: "Backlight", painel_sight: "Painel Sight", painel_vip: "Painel VIP",
};

function createPublicIcon(code: string, status: Billboard["status"]) {
  const colors = { available: "#EAB308", occupied: "#ef4444", reserved: "#6b7280" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="padding:4px 10px;border-radius:8px;background:${color};color:${status === 'available' ? '#000' : '#fff'};font-weight:700;font-size:11px;font-family:'Space Grotesk',sans-serif;white-space:nowrap;border:2px solid rgba(255,255,255,0.25);box-shadow:0 2px 12px ${color}55;cursor:pointer;">#${code}</div>`,
    iconSize: [55, 26],
    iconAnchor: [27, 13],
  });
}

function getStreetViewUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=0&pitch=0&fov=80`;
}

function getGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// Static Street View thumbnail
function getStreetViewThumb(lat: number, lng: number) {
  return `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=&source=outdoor`;
}

function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <img src={logoBj7} alt="BJ7 Mídia" className="h-10 w-auto" />
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">Sobre</a>
          <a href="#map" className="text-muted-foreground hover:text-primary transition-colors font-medium">Mapa</a>
          <a href="#catalog" className="text-muted-foreground hover:text-primary transition-colors font-medium">Pontos</a>
          <a href="#landowner" className="text-muted-foreground hover:text-primary transition-colors font-medium">Proprietários</a>
          <a href="#contact" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Solicitar Proposta
          </a>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/30 bg-background/98 backdrop-blur-xl p-4 space-y-3">
          <a href="#about" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground py-2">Sobre</a>
          <a href="#map" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground py-2">Mapa</a>
          <a href="#catalog" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground py-2">Pontos</a>
          <a href="#landowner" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground py-2">Proprietários</a>
          <a href="#contact" onClick={() => setOpen(false)} className="block text-sm bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-center font-semibold">Solicitar Proposta</a>
        </div>
      )}
    </nav>
  );
}

function BillboardCard({ billboard, onClick }: { billboard: Billboard; onClick: () => void }) {
  const statusLabel: Record<string, string> = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusStyle: Record<string, string> = {
    available: "bg-primary/20 text-primary border border-primary/30",
    occupied: "bg-destructive/20 text-destructive border border-destructive/30",
    reserved: "bg-muted text-muted-foreground border border-border",
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Photo / Street View area */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!4v0!6m8!1m7!1s!2m2!1d${billboard.lat}!2d${billboard.lng}!3f0!4f0!5f0.7820865974627469&output=svembed`}
          className="w-full h-full border-0 pointer-events-none"
          loading="lazy"
          title={`Street View #${billboard.code}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        {/* Top bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl text-primary drop-shadow-lg">#{billboard.code}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${statusStyle[billboard.status]}`}>
              {statusLabel[billboard.status]}
            </span>
          </div>
          <span className="text-xs bg-card/80 backdrop-blur-sm px-2.5 py-1 rounded-md font-mono font-semibold text-foreground border border-border/50">
            {billboard.dimension}
          </span>
        </div>
        {/* View on map link */}
        <a
          href={getStreetViewUrl(billboard.lat, billboard.lng)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute bottom-3 right-3 bg-card/80 backdrop-blur-sm text-primary text-[10px] font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50"
        >
          <Maximize2 className="w-3 h-3" /> Street View
        </a>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="truncate">{billboard.route} - {billboard.address}</span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Navigation className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>{billboard.route} · {billboard.city}</span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Car className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-medium text-foreground">{billboard.estimated_flow.toLocaleString()} veíc/dia</span>
          </p>
        </div>

        {/* Price footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div>
            <span className="font-display font-black text-xl text-primary">R$ {billboard.price.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">/mês</span>
          </div>
          <span className="text-xs text-primary flex items-center gap-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Detalhes <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PublicSite() {
  const { billboards } = useData();
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [formType, setFormType] = useState<"advertiser" | "landowner">("advertiser");

  const cities = [...new Set(billboards.map(b => b.city))];
  const routes = [...new Set(billboards.map(b => b.route))];
  const types = [...new Set(billboards.map(b => b.type))];

  const filtered = billboards.filter(b => {
    const matchCity = cityFilter === "all" || b.city === cityFilter;
    const matchType = typeFilter === "all" || b.type === typeFilter;
    const matchRoute = routeFilter === "all" || b.route === routeFilter;
    const matchSearch = search === "" || b.code.includes(search) || b.address.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchType && matchRoute && matchSearch;
  });

  const available = filtered.filter(b => b.status === "available");
  const totalFlow = billboards.reduce((s, b) => s + b.estimated_flow, 0);

  const statusLabel: Record<string, string> = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusBadge: Record<string, string> = {
    available: "bg-primary/20 text-primary border border-primary/30",
    occupied: "bg-destructive/20 text-destructive border border-destructive/30",
    reserved: "bg-muted text-muted-foreground border border-border",
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formType === "advertiser") {
      await supabase.from("leads").insert({
        company: formData.get("company") as string,
        contact: formData.get("contact") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        notes: formData.get("notes") as string || "",
        stage: "lead",
        origin: "site",
      } as any);
    }
    toast.success(formType === "advertiser" ? "Proposta solicitada! Entraremos em contato." : "Terreno cadastrado! Avaliaremos o local.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* ====== HERO ====== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroBillboard} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-semibold tracking-wide">MÍDIA EXTERIOR · LITORAL DO PARANÁ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-[1.1] max-w-4xl mx-auto">
            Sua marca nos{" "}
            <span className="glow-text">melhores pontos</span>{" "}
            do litoral
          </h1>

          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg sm:text-xl">
            Rede premium de painéis rodoviários no corredor mais movimentado ao litoral paranaense.{" "}
            {available.length > 0 && (
              <span className="text-primary font-semibold">{available.length} pontos disponíveis</span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <a href="#catalog" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
              Ver Pontos Disponíveis
            </a>
            <a href="#contact" className="bg-card border border-border text-foreground px-8 py-4 rounded-xl font-bold text-lg hover:border-primary/40 transition-colors">
              Solicitar Proposta
            </a>
          </div>
        </div>
      </section>

      {/* ====== STATS BAR ====== */}
      <section className="py-10 px-4 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: billboards.length, label: "Pontos Estratégicos", icon: MapPin },
            { value: routes.length, label: "Rodovias Cobertas", icon: Navigation },
            { value: `${Math.round(totalFlow / 1000)}k+`, label: "Impactos Diários", icon: TrendingUp },
            { value: `${Math.round(totalFlow * 30 / 1000000)}M+`, label: "Impactos Mensais", icon: Eye },
          ].map(s => (
            <div key={s.label} className="text-center py-4">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-display font-black text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====== ABOUT ====== */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Por que a BJ7?</span>
            <h2 className="text-3xl md:text-4xl font-display font-black mt-3">
              A rede que <span className="text-primary">conecta</span> sua marca ao litoral
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Presença estratégica nas principais rodovias de acesso ao litoral paranaense, com painéis de alto impacto e visibilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin, title: "Localização Premium",
                desc: "Pontos selecionados nos trechos de maior visibilidade das rodovias PR-412, PR-508 e BR-277.",
              },
              {
                icon: TrendingUp, title: "Máxima Audiência",
                desc: `Mais de ${Math.round(totalFlow / 1000)}mil veículos por dia cruzam nossos painéis. Milhões de impactos todo mês.`,
              },
              {
                icon: Award, title: "Formatos de Impacto",
                desc: "Painéis de 9x3m a 12x4m com formatos frontlight, backlight e painel sight para máxima visibilidade.",
              },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== MAP ====== */}
      <section id="map" className="py-20 px-4 bg-card/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Cobertura</span>
            <h2 className="text-3xl md:text-4xl font-display font-black mt-3">
              Nossos pontos no <span className="text-primary">mapa</span>
            </h2>
            <p className="text-muted-foreground mt-3">Clique em um ponto para ver detalhes e localização no Google Maps</p>
          </div>

          <div className="h-[500px] rounded-2xl overflow-hidden border border-border shadow-xl">
            <MapContainer center={[-25.85, -48.65]} zoom={10} className="w-full h-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
              {filtered.map(b => (
                <Marker
                  key={b.id}
                  position={[b.lat, b.lng]}
                  icon={createPublicIcon(b.code, b.status)}
                  eventHandlers={{ click: () => setSelectedBillboard(b) }}
                >
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <p className="font-bold text-base mb-1">#{b.code} · {b.address}</p>
                      <p>{b.route} · {b.city}</p>
                      <p className="font-semibold mt-1">R$ {b.price.toLocaleString()}/mês</p>
                      <div className="flex gap-2 mt-2">
                        <a href={getGoogleMapsUrl(b.lat, b.lng)} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Google Maps
                        </a>
                        <a href={getStreetViewUrl(b.lat, b.lng)} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Street View
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" /> Disponível
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive" /> Ocupado
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-muted-foreground" /> Reservado
            </span>
          </div>
        </div>
      </section>

      {/* ====== CATALOG ====== */}
      <section id="catalog" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Catálogo</span>
            <h2 className="text-3xl md:text-4xl font-display font-black mt-3">
              Pontos <span className="text-primary">disponíveis</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 max-w-[220px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar ponto..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-card border border-border text-sm px-4 py-2.5 rounded-xl text-foreground outline-none" value={routeFilter} onChange={e => setRouteFilter(e.target.value)}>
              <option value="all">Todas Rodovias</option>
              {routes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="bg-card border border-border text-sm px-4 py-2.5 rounded-xl text-foreground outline-none" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
              <option value="all">Todas Cidades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-card border border-border text-sm px-4 py-2.5 rounded-xl text-foreground outline-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">Todos Formatos</option>
              {types.map(t => <option key={t} value={t}>{typeLabels[t] || t}</option>)}
            </select>
            <span className="text-xs text-muted-foreground font-medium">{filtered.length} pontos</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(b => (
              <BillboardCard key={b.id} billboard={b} onClick={() => setSelectedBillboard(b)} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== DETAIL MODAL ====== */}
      {selectedBillboard && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBillboard(null)}>
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full animate-slide-up overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Street View embed */}
            <div className="relative h-64 bg-muted">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!4v0!6m8!1m7!1s!2m2!1d${selectedBillboard.lat}!2d${selectedBillboard.lng}!3f0!4f0!5f0.7820865974627469&output=svembed`}
                className="w-full h-full border-0"
                loading="lazy"
                title="Street View"
              />
              <button onClick={() => setSelectedBillboard(null)} className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg text-muted-foreground hover:text-foreground border border-border/50">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <a href={getStreetViewUrl(selectedBillboard.lat, selectedBillboard.lng)} target="_blank" rel="noopener noreferrer"
                  className="bg-card/90 backdrop-blur-sm text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50">
                  <Eye className="w-3.5 h-3.5" /> Abrir Street View
                </a>
                <a href={getGoogleMapsUrl(selectedBillboard.lat, selectedBillboard.lng)} target="_blank" rel="noopener noreferrer"
                  className="bg-card/90 backdrop-blur-sm text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50">
                  <ExternalLink className="w-3.5 h-3.5" /> Google Maps
                </a>
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-black text-2xl text-primary">#{selectedBillboard.code}</h3>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide ${statusBadge[selectedBillboard.status]}`}>
                    {statusLabel[selectedBillboard.status]}
                  </span>
                </div>
                <span className="text-sm bg-muted px-3 py-1 rounded-lg font-mono font-semibold">{selectedBillboard.dimension} ({selectedBillboard.area}m²)</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Endereço" value={selectedBillboard.address} />
                <Detail label="Rodovia" value={selectedBillboard.route} />
                <Detail label="Cidade / Região" value={`${selectedBillboard.city} - ${selectedBillboard.region}`} />
                <Detail label="Sentido" value={selectedBillboard.direction} />
                <Detail label="Fluxo Diário" value={`${selectedBillboard.estimated_flow.toLocaleString()} veículos`} highlight />
                <Detail label="Impactos/mês" value={`${(selectedBillboard.estimated_flow * 30).toLocaleString()}`} highlight />
                <Detail label="Tipo" value={typeLabels[selectedBillboard.type] || selectedBillboard.type} />
                <Detail label="Sazonalidade" value={selectedBillboard.seasonality === "alta" ? "Alta Temporada" : selectedBillboard.seasonality === "baixa" ? "Baixa Temporada" : "Média"} />
              </div>

              {selectedBillboard.description && (
                <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">{selectedBillboard.description}</p>
              )}
            </div>

            {/* CTA */}
            <div className="p-6 border-t border-border flex items-center justify-between bg-muted/30">
              <div>
                <span className="font-display font-black text-3xl text-primary">R$ {selectedBillboard.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground ml-1">/mês</span>
              </div>
              <a href="#contact" onClick={() => setSelectedBillboard(null)} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Solicitar Proposta
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ====== LANDOWNER ====== */}
      <section id="landowner" className="py-20 px-4 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-display font-black mb-4">Proprietário de terreno na rodovia?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Monetize seu espaço à beira da rodovia. Cuidamos de toda a instalação, manutenção e comercialização.
            Você recebe renda mensal garantida.
          </p>
          <a href="#contact" onClick={() => setFormType("landowner")} className="inline-flex mt-8 bg-card border-2 border-primary text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary hover:text-primary-foreground transition-all">
            Cadastrar meu terreno
          </a>
        </div>
      </section>

      {/* ====== CONTACT ====== */}
      <section id="contact" className="py-20 px-4 border-t border-border">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Contato</span>
            <h2 className="text-3xl font-display font-black mt-3">Fale Conosco</h2>
          </div>

          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button onClick={() => setFormType("advertiser")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${formType === "advertiser" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <Building2 className="w-4 h-4" /> Quero Anunciar
            </button>
            <button onClick={() => setFormType("landowner")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${formType === "landowner" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <User className="w-4 h-4" /> Tenho Terreno
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleFormSubmit}>
            {formType === "advertiser" ? (
              <>
                <input name="company" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="Nome da empresa" />
                <input name="contact" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="Responsável" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="phone" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="Telefone" />
                  <input name="email" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="E-mail" type="email" />
                </div>
                <textarea name="notes" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all h-24 resize-none" placeholder="Quais pontos te interessam?" />
              </>
            ) : (
              <>
                <input name="name" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="Seu nome completo" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="phone" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="Telefone" />
                  <input name="email" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="E-mail" type="email" />
                </div>
                <input name="location" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all" placeholder="Localização do terreno (rodovia, km)" />
                <textarea name="notes" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground transition-all h-24 resize-none" placeholder="Descreva o espaço..." />
              </>
            )}
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity text-lg">
              {formType === "advertiser" ? "Solicitar Proposta" : "Cadastrar Terreno"}
            </button>
          </form>

          <div className="mt-10 flex justify-center gap-8 text-sm text-muted-foreground">
            <a href="tel:+5541984242067" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" /> (41) 98424-2067
            </a>
            <a href="mailto:contato@bj7midia.com.br" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" /> contato@bj7midia.com.br
            </a>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoBj7} alt="BJ7 Mídia" className="h-8 w-auto" />
            <span className="text-xs text-muted-foreground">Mídia Exterior · Litoral do Paraná</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} BJ7 Mídia OOH. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className={`font-medium mt-0.5 ${highlight ? "text-primary font-semibold" : ""}`}>{value}</p>
    </div>
  );
}
