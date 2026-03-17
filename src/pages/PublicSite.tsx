import { useState } from "react";
import { useData, Billboard } from "@/contexts/DataContext";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Search, MapPin, ArrowRight, Menu, X, Phone, Mail, Car, Ruler, Eye,
  Building2, User, Shield, Award, TrendingUp, Navigation, ExternalLink,
  ChevronRight, Maximize2, ChevronLeft, Target, DollarSign, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import logoBj7 from "@/assets/logo-bj7.png";
import heroBillboard from "@/assets/hero-billboard.jpg";
import heroVideoAsset from "@/assets/hero-video.mp4.asset.json";

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
          <a href="/login" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors ml-2">
            Acesso Interno
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
          <a href="/login" onClick={() => setOpen(false)} className="block text-xs text-muted-foreground/50 py-2 text-center">Acesso Interno</a>
        </div>
      )}
    </nav>
  );
}

/* ====== FAVRETTO-STYLE BILLBOARD SLIDE ====== */
function BillboardSlide({ billboard, onContact }: { billboard: Billboard; onContact: () => void }) {
  const statusLabel: Record<string, string> = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusStyle: Record<string, string> = {
    available: "bg-primary text-primary-foreground",
    occupied: "bg-destructive text-destructive-foreground",
    reserved: "bg-muted text-muted-foreground",
  };
  const monthlyImpacts = billboard.estimated_flow * 30;

  return (
    <div className="relative w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden rounded-2xl border border-border">
      {/* Full background - Street View embed */}
      <div className="absolute inset-0">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!4v0!6m8!1m7!1s!2m2!1d${billboard.lat}!2d${billboard.lng}!3f0!4f0!5f0.7820865974627469&output=svembed`}
          className="w-full h-full border-0"
          loading="lazy"
          title={`Street View #${billboard.code}`}
        />
      </div>

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-background/30" />

      {/* Top-right: Coordinates + Status */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 text-right z-10">
        <p className="text-xs text-muted-foreground font-mono mb-1">
          Lat/Lng: {billboard.lat.toFixed(6)}, {billboard.lng.toFixed(6)}
        </p>
        <div className="flex items-center gap-2 justify-end">
          <a
            href={getGoogleMapsUrl(billboard.lat, billboard.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
          >
            MAPA
          </a>
          <a
            href={getStreetViewUrl(billboard.lat, billboard.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card/80 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-md border border-border hover:border-primary transition-colors"
          >
            STREET VIEW
          </a>
        </div>
        <div className={`inline-block mt-3 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${statusStyle[billboard.status]}`}>
          {statusLabel[billboard.status]}
        </div>
      </div>

      {/* Left panel: Data overlay (Favretto style) */}
      <div className="absolute left-4 md:left-8 top-20 md:top-24 z-10 space-y-5 max-w-xs">
        {/* Impacts */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Impactos Mensais</p>
            <p className="text-2xl md:text-3xl font-display font-black text-primary">{monthlyImpacts.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">(Fluxo diário × 30)</p>
          </div>
        </div>

        {/* Flow */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fluxo Diário</p>
            <p className="text-xl font-display font-black text-foreground">{billboard.estimated_flow.toLocaleString()} veíc/dia</p>
          </div>
        </div>

        {/* Investment */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Investimento</p>
            <div className="space-y-1 mt-1">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-primary font-semibold">Veiculação Mensal:</span>
                <span className="font-bold text-foreground">R$ {billboard.price.toLocaleString()}</span>
              </div>
              {billboard.production_cost > 0 && (
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-primary font-semibold">Produção (lona):</span>
                  <span className="font-bold text-foreground">R$ {billboard.production_cost.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dimension */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Ruler className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Dimensões</p>
            <p className="text-lg font-display font-bold text-foreground">{billboard.dimension} ({billboard.area}m²)</p>
          </div>
        </div>
      </div>

      {/* Bottom bar: Type + Location (Favretto footer style) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h3 className="font-display font-black text-xl md:text-2xl text-foreground uppercase tracking-wide">
              {typeLabels[billboard.type] || billboard.type} {billboard.dimension}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-primary font-semibold">{billboard.city} ({billboard.code})</span>{" "}
              {billboard.route}, {billboard.address}
              {billboard.direction && <>, sentido {billboard.direction}</>}
            </p>
          </div>
          <button
            onClick={onContact}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 whitespace-nowrap"
          >
            Solicitar Proposta
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

export default function PublicSite() {
  const { billboards } = useData();
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");
  const [search, setSearch] = useState("");
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

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
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
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={heroBillboard}
            className="w-full h-full object-cover"
          >
            <source src={heroVideoAsset.url} type="video/mp4" />
          </video>
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
              Rede estratégica de <span className="text-primary">mídia exterior</span> no litoral do Paraná
            </h2>
            <p className="text-muted-foreground mt-4 max-w-3xl mx-auto text-lg">
              10 pontos estratégicos distribuídos em 3 corredores rodoviários — PR-412, PR-508 e BR-277 — cobrindo todos os acessos ao litoral paranaense. De Garuva a Paranaguá, sua marca presente onde o público realmente trafega.
            </p>
          </div>

          {/* Corredores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Navigation, title: "PR-412 · Rota do Litoral",
                points: "6 pontos",
                desc: "Garuva → Guaratuba. Principal corredor rodoviário de acesso ao litoral paranaense. Trevo de Garuva, trechos intermediários e chegada de Guaratuba.",
              },
              {
                icon: MapPin, title: "PR-508 · Alexandra-Matinhos",
                points: "2 pontos",
                desc: "Corredor turístico de acesso às praias do litoral. Pontos estratégicos na região de Alexandra/Matinhos com visibilidade nos dois sentidos.",
              },
              {
                icon: Building2, title: "BR-277 · Corredor Paranaguá",
                points: "2 pontos",
                desc: "Fluxo logístico entre o Porto de Paranaguá e Curitiba. Chegada e saída da cidade, impactando tanto turistas quanto o tráfego portuário.",
              },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-bold text-lg">{item.title}</h3>
                </div>
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md mb-3">{item.points}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Formatos de Painéis */}
          <div className="text-center mb-8">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Formatos de Mídia</span>
            <h3 className="text-2xl md:text-3xl font-display font-black mt-3">
              Painéis disponíveis para <span className="text-primary">sua campanha</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Painel Padrão",
                size: "3m × 9m",
                area: "27m²",
                desc: "Formato padrão rodoviário com alta frequência visual. Ideal para campanhas institucionais e varejo.",
                icon: Ruler,
              },
              {
                title: "Painel Ampliado",
                size: "4m × 12m",
                area: "48m²",
                desc: "Formato ampliado de grande impacto. Excelente leitura a longa distância, muito usado para lançamentos imobiliários e marcas nacionais.",
                icon: Maximize2,
              },
              {
                title: "Painel Gigante",
                size: "4m × 25m",
                area: "100m²",
                desc: "Painel gigante de alto impacto e máxima visibilidade em rodovias. Ideal para campanhas de grande alcance.",
                icon: Eye,
              },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-display font-bold text-lg mb-1">{item.title}</h4>
                <p className="text-2xl font-display font-black text-primary">{item.size}</p>
                <p className="text-xs text-muted-foreground mb-3">Área: {item.area}</p>
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
                  eventHandlers={{
                    click: () => {
                      document.getElementById(`billboard-${b.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                >
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <p className="font-bold text-base mb-1">#{b.code} · {b.address}</p>
                      <p>{b.route} · {b.city}</p>
                      <p className="font-semibold mt-1">R$ {b.price.toLocaleString()}/mês</p>
                      <div className="flex gap-2 mt-2">
                        <a href={getGoogleMapsUrl(b.lat, b.lng)} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ background: "#3b82f6", color: "#fff" }}>
                          <ExternalLink className="w-3 h-3" /> Google Maps
                        </a>
                        <a href={getStreetViewUrl(b.lat, b.lng)} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ background: "#16a34a", color: "#fff" }}>
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

      {/* ====== CATALOG — FAVRETTO STYLE (full-width slides) ====== */}
      <section id="catalog" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Catálogo</span>
            <h2 className="text-3xl md:text-4xl font-display font-black mt-3">
              Pontos <span className="text-primary">disponíveis</span>
            </h2>
            <p className="text-muted-foreground mt-3">Cada ponto com visão real via Street View, dados técnicos e investimento</p>
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

          {/* Billboard slides — one per billboard, full-width like Favretto PDF */}
          <div className="space-y-8">
            {filtered.map(b => (
              <div key={b.id} id={`billboard-${b.id}`}>
                <BillboardSlide billboard={b} onContact={scrollToContact} />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-16">Nenhum ponto encontrado com os filtros selecionados.</p>
          )}
        </div>
      </section>

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
                <input name="company" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Empresa / Marca" />
                <input name="contact" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Seu nome" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="phone" className="bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Telefone" />
                  <input name="email" type="email" className="bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Email" />
                </div>
                <textarea name="notes" rows={3} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none" placeholder="Observações (opcional)" />
              </>
            ) : (
              <>
                <input name="owner_name" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Seu nome completo" />
                <input name="owner_phone" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Telefone" />
                <input name="owner_email" type="email" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Email" />
                <textarea name="owner_location" rows={3} required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none" placeholder="Descreva a localização do terreno (rodovia, km, cidade...)" />
              </>
            )}
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              {formType === "advertiser" ? "Enviar Proposta" : "Cadastrar Terreno"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="tel:+5541999999999" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" /> (41) 99999-9999
            </a>
            <a href="mailto:contato@bj7midia.com.br" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" /> contato@bj7midia.com.br
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src={logoBj7} alt="BJ7 Mídia" className="h-8 w-auto" />
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BJ7 Mídia Exterior · Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
