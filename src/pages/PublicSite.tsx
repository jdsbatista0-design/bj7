import { useState, useEffect } from "react";
import { Billboard } from "@/contexts/DataContext";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import {
  Search, MapPin, Menu, X, Phone, Car, Ruler, Maximize2,
  Building2, User, Shield, TrendingUp, Navigation, ExternalLink,
  ChevronRight, ChevronLeft, DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import logoBj7 from "@/assets/logo-bj7.png";
import heroBillboard from "@/assets/hero-billboard.jpg";
import heroVideoAsset from "@/assets/hero-video.mp4.asset.json";

const typeLabels: Record<string, string> = {
  painel_rodoviario: "Painel Rodoviário", painel_urbano: "Painel Urbano",
  painel_led: "Painel de Led",
};

function createPublicPinIcon(code: string, status: Billboard["status"]) {
  const colors = { available: "#EAB308", occupied: "#ef4444", reserved: "#6b7280" };
  const color = colors[status];
  const textColor = status === 'available' ? '#000' : '#fff';
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="background:${color};color:${textColor};font-weight:700;font-size:10px;font-family:'Space Grotesk',sans-serif;padding:2px 6px;border-radius:4px;border:2px solid rgba(255,255,255,0.5);box-shadow:0 2px 8px rgba(0,0,0,0.4);white-space:nowrap;margin-bottom:-2px;">#${code}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));"></div>
    </div>`,
    iconSize: [50, 36], iconAnchor: [25, 36],
  });
}

function getGoogleMapsUrl(lat: number, lng: number, customUrl?: string) { return customUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`; }

function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3"><img src={logoBj7} alt="BJ7 Mídia" className="h-8 md:h-10 w-auto" /></a>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">Sobre</a>
          <a href="#map" className="text-muted-foreground hover:text-primary transition-colors font-medium">Mapa</a>
          <a href="#catalog" className="text-muted-foreground hover:text-primary transition-colors font-medium">Pontos</a>
          <a href="#landowner" className="text-muted-foreground hover:text-primary transition-colors font-medium">Proprietários</a>
          <a href="#contact" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">Solicitar Proposta</a>
          <a href="/login" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors ml-2">Acesso Interno</a>
        </div>
        <button className="md:hidden text-foreground p-2" onClick={() => setOpen(!open)}>{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
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

function BillboardModal({ billboard, onClose }: { billboard: Billboard; onClose: () => void }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const allPhotos = [billboard.main_photo, ...(billboard.gallery || []), ...(billboard.photos || [])].filter(Boolean);
  const hasPhotos = allPhotos.length > 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-t-2xl md:rounded-2xl w-full md:max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="sticky top-3 float-right mr-3 mt-3 z-50 bg-background/90 backdrop-blur-sm rounded-full p-2 hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-lg border border-border">
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative aspect-[16/10] bg-muted">
            {hasPhotos ? (
              <>
                <img src={allPhotos[activePhoto]} alt={`Ponto #${billboard.code}`} className="w-full h-full object-cover" />
                {allPhotos.length > 1 && (
                  <>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allPhotos.map((_, i) => (<button key={i} onClick={() => setActivePhoto(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activePhoto ? 'bg-primary' : 'bg-white/50'}`} />))}
                    </div>
                    <button onClick={() => setActivePhoto(p => p > 0 ? p - 1 : allPhotos.length - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full p-1.5"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setActivePhoto(p => p < allPhotos.length - 1 ? p + 1 : 0)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm rounded-full p-1.5"><ChevronRight className="w-4 h-4" /></button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center"><MapPin className="w-10 h-10 text-muted-foreground/30" /></div>
            )}
          </div>
          <div className="relative aspect-[16/10] hidden md:block">
            <MapContainer center={[billboard.lat, billboard.lng]} zoom={14} className="w-full h-full" scrollWheelZoom={false} zoomControl={false} dragging={false}>
              <TileLayer attribution='&copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              <Marker position={[billboard.lat, billboard.lng]} icon={createPublicPinIcon(billboard.code, billboard.status)}><Popup>#{billboard.code}</Popup></Marker>
            </MapContainer>
            <div className="absolute bottom-3 right-3 flex gap-2 z-[1000]">
              <a href={getGoogleMapsUrl(billboard.lat, billboard.lng, billboard.maps_url)} target="_blank" rel="noopener noreferrer" className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Maps</a>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <h3 className="font-display font-black text-xl md:text-2xl uppercase tracking-wide">
            #{billboard.code} · {billboard.title || typeLabels[billboard.type] || billboard.type} {billboard.dimension}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="text-primary font-semibold">{billboard.city}</span> · {billboard.route}{billboard.address && `, ${billboard.address}`}{billboard.direction && <> · sentido {billboard.direction}</>}
          </p>
          {(billboard.commercial_description || billboard.description) && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed bg-muted/50 rounded-lg p-3 border border-border/50">{billboard.commercial_description || billboard.description}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border/50">
            <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Dimensões</span><span className="text-sm font-bold">{billboard.dimension} ({billboard.area}m²)</span></div>
            <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Veiculação/mês</span><span className="text-sm font-bold text-primary">R$ {billboard.price.toLocaleString()}</span></div>
            {billboard.illumination && billboard.illumination !== "nao" && (
              <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Iluminação</span><span className="text-sm font-bold">{billboard.illumination}</span></div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <a href="#contact" onClick={onClose} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm text-center hover:opacity-90">Solicitar Proposta</a>
            <a href={`https://wa.me/554184242067?text=Olá! Tenho interesse no ponto %23${billboard.code}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-success text-success-foreground py-3 rounded-xl font-bold text-sm text-center hover:opacity-90 flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> WhatsApp
            </a>
          </div>
          <div className="flex gap-2 mt-3 md:hidden">
            <a href={getGoogleMapsUrl(billboard.lat, billboard.lng, billboard.maps_url)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary/10 text-primary text-xs font-bold px-3 py-2 rounded-lg text-center flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> Mapa</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillboardCard({ billboard, onOpen }: { billboard: Billboard; onOpen: () => void }) {
  const statusLabel: Record<string, string> = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusStyle: Record<string, string> = { available: "bg-primary text-primary-foreground", occupied: "bg-destructive text-destructive-foreground", reserved: "bg-muted text-muted-foreground" };
  const thumbSrc = billboard.main_photo || (billboard.photos && billboard.photos[0]) || "";

  return (
    <div onClick={onOpen} className="group rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {thumbSrc ? (
          <img src={thumbSrc} alt={`#${billboard.code}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted"><MapPin className="w-8 h-8 text-muted-foreground/40" /></div>
        )}
        <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusStyle[billboard.status]}`}>{statusLabel[billboard.status]}</div>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm uppercase tracking-wide truncate">#{billboard.code} · {billboard.title || typeLabels[billboard.type] || billboard.type}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{billboard.city} · {billboard.route}</p>
          </div>
          {billboard.price > 0 && (
            <span className="text-sm font-display font-black text-primary whitespace-nowrap">R$ {billboard.price.toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">/mês</span></span>
          )}
        </div>
        {(billboard.short_description || billboard.description) && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{billboard.short_description || billboard.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {billboard.dimension}</span>
          <span className="ml-auto text-primary font-semibold flex items-center gap-1">Ver <ChevronRight className="w-3 h-3" /></span>
        </div>
      </div>
    </div>
  );
}

export default function PublicSite() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState<"advertiser" | "landowner">("advertiser");
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);

  useEffect(() => {
    const fetchBillboards = async () => {
      const { data } = await supabase.from("billboards").select("*").order("code");
      if (data) {
        setBillboards(data.filter((row: any) => row.active !== false).map((row: any) => ({
          id: row.id, code: row.code, title: row.title || "", short_description: row.short_description || "",
          commercial_description: row.commercial_description || "",
          lat: row.lat, lng: row.lng, city: row.city || "", region: row.region || "", route: row.route || "",
          address: row.address || "", type: row.type || "painel_rodoviario",
          dimension: row.dimension || "9x3m", width: Number(row.width) || 9, height: Number(row.height) || 3,
          area: Number(row.area) || 27, direction: row.direction || "", estimated_flow: row.estimated_flow || 0,
          audience_profile: row.audience_profile || "", seasonality: row.seasonality || "media",
          traffic_type: row.traffic_type || "", land_owner: row.land_owner || "",
          land_owner_id: row.land_owner_id, cost: Number(row.cost) || 0,
          price: Number(row.price) || 0, production_cost: Number(row.production_cost) || 0,
          status: row.status || "available", commercial_status: row.commercial_status || "available",
          operational_status: row.operational_status || "active",
          photos: row.photos || [], main_photo: row.main_photo || "", gallery: row.gallery || [],
          description: row.description || "", formats: row.formats || [],
          maps_url: row.maps_url || "", google_street_view_url: row.google_street_view_url || "",
          illumination: row.illumination || "nao", show_on_site: true, active: true,
        })));
      }
    };
    fetchBillboards();
    const channel = supabase.channel('public-billboards').on('postgres_changes', { event: '*', schema: 'public', table: 'billboards' }, () => fetchBillboards()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const cities = [...new Set(billboards.map(b => b.city))];
  const routes = [...new Set(billboards.map(b => b.route))].sort();
  const types = [...new Set(billboards.map(b => b.type))];

  const filtered = billboards.filter(b => {
    const matchCity = cityFilter === "all" || b.city === cityFilter;
    const matchType = typeFilter === "all" || b.type === typeFilter;
    const matchRoute = routeFilter === "all" || b.route === routeFilter;
    const matchSearch = search === "" || b.code.includes(search) || b.address.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchType && matchRoute && matchSearch;
  });

  const available = filtered.filter(b => b.status === "available");

  // Group filtered billboards by route
  const groupedByRoute = routes.reduce<Record<string, Billboard[]>>((acc, route) => {
    const routeBillboards = filtered.filter(b => b.route === route);
    if (routeBillboards.length > 0) acc[route] = routeBillboards;
    return acc;
  }, {});
  // Also handle billboards with no matching route
  const ungrouped = filtered.filter(b => !routes.includes(b.route));
  if (ungrouped.length > 0) groupedByRoute["Outros"] = ungrouped;

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formType === "advertiser") {
      const { error } = await supabase.from("leads").insert({
        company: formData.get("company") as string, contact: formData.get("contact") as string,
        phone: formData.get("phone") as string, email: formData.get("email") as string,
        notes: `[ANUNCIANTE]\n${formData.get("notes") as string || ""}`, stage: "lead", origin: "site_anunciante",
        tags: ["Anunciante", "Site"],
      } as any);
      if (error) { toast.error("Erro ao enviar"); return; }
    } else {
      const { error } = await supabase.from("leads").insert({
        company: `Proprietário: ${formData.get("owner_name") as string}`,
        contact: formData.get("owner_name") as string,
        phone: formData.get("owner_phone") as string,
        email: (formData.get("owner_email") as string) || "",
        notes: `[PROPRIETÁRIO]\nLocalização: ${formData.get("owner_location") as string || ""}`,
        stage: "lead", origin: "site_proprietario",
        tags: ["Proprietário", "Site"],
      } as any);
      if (error) { toast.error("Erro ao enviar"); return; }
    }
    toast.success("Proposta enviada com sucesso!");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      {selectedBillboard && <BillboardModal billboard={selectedBillboard} onClose={() => setSelectedBillboard(null)} />}

      {/* Hero */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay muted loop playsInline poster={heroBillboard} className="w-full h-full object-cover"><source src={heroVideoAsset.url} type="video/mp4" /></video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /><span className="text-primary text-sm font-semibold tracking-wide">MÍDIA EXTERIOR · LITORAL DO PARANÁ</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black leading-[1.1] max-w-4xl mx-auto">Sua marca nos <span className="glow-text">melhores pontos</span> do litoral</h1>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-base sm:text-xl">
            Rede premium de painéis rodoviários no corredor mais movimentado ao litoral paranaense.
            {available.length > 0 && <> <span className="text-primary font-semibold">{available.length} pontos disponíveis</span></>}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 md:mt-10">
            <a href="#catalog" className="bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:opacity-90 shadow-lg shadow-primary/25">Ver Pontos</a>
            <a href={`https://wa.me/554184242067?text=Olá! Gostaria de uma proposta de mídia exterior`} target="_blank" rel="noopener noreferrer" className="bg-success text-success-foreground px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:opacity-90 flex items-center justify-center gap-2"><Phone className="w-5 h-5" /> WhatsApp</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 md:py-10 px-4 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 md:gap-6">
          {[
            { value: billboards.length, label: "Pontos Cadastrados", icon: MapPin },
            { value: routes.length, label: "Rodovias Cobertas", icon: Navigation },
            { value: available.length, label: "Pontos Disponíveis", icon: TrendingUp },
          ].map(s => (
            <div key={s.label} className="text-center py-3 md:py-4">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl md:text-4xl font-display font-black text-primary">{s.value}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Por que a BJ7?</span>
            <h2 className="text-2xl md:text-4xl font-display font-black mt-3">A rede que <span className="text-primary">conecta</span> sua marca ao litoral</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-base md:text-lg">Presença estratégica nas principais rodovias de acesso ao litoral paranaense.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            {[
              { icon: Navigation, route: "PR-412", title: "PR-412 · Rota do Litoral", desc: "Garuva → Guaratuba. Principal corredor de acesso ao litoral." },
              { icon: MapPin, route: "PR-508", title: "PR-508 · Alexandra-Matinhos", desc: "Corredor turístico de acesso às praias." },
              { icon: Building2, route: "BR-277", title: "BR-277 · Corredor Paranaguá", desc: "Fluxo logístico entre Porto de Paranaguá e Curitiba." },
            ].map(item => {
              const count = billboards.filter(b => b.route === item.route).length;
              return (
                <div key={item.title} className="rounded-xl border border-border bg-card p-6 md:p-8 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><item.icon className="w-6 h-6 text-primary" /></div>
                  <h3 className="font-display font-bold text-base md:text-lg mb-2">{item.title}</h3>
                  <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md mb-3">{count} pontos</span>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Dimensões */}
          <div className="text-center mb-8">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Formatos</span>
            <h3 className="text-xl md:text-3xl font-display font-black mt-3">Dimensões dos nossos <span className="text-primary">painéis</span></h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { w: 9, h: 3, area: 27, label: "3m × 9m" },
              { w: 18, h: 3, area: 54, label: "3m × 18m" },
              { w: 12, h: 4, area: 48, label: "4m × 12m" },
              { w: 25, h: 4, area: 100, label: "4m × 25m" },
            ].map(dim => (
              <div key={dim.label} className="rounded-xl border border-border bg-card p-5 md:p-6 hover:border-primary/30 transition-colors text-center group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Maximize2 className="w-6 h-6 text-primary" />
                </div>
                <div className="relative mx-auto mb-4 flex items-center justify-center h-16">
                  <div
                    className="border-2 border-primary/60 rounded bg-primary/5 group-hover:border-primary transition-colors"
                    style={{
                      width: `${(dim.w / 25) * 100}%`,
                      height: `${(dim.h / 4) * 100}%`,
                    }}
                  />
                </div>
                <h4 className="font-display font-bold text-lg md:text-xl text-primary">{dim.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">{dim.area}m² de área</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="py-12 md:py-20 px-4 bg-card/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Cobertura</span>
            <h2 className="text-2xl md:text-4xl font-display font-black mt-3">Nossos pontos no <span className="text-primary">mapa</span></h2>
          </div>
          <div className="h-[350px] md:h-[500px] rounded-2xl overflow-hidden border border-border shadow-xl">
            <MapContainer center={[-25.85, -48.65]} zoom={10} className="w-full h-full">
              <TileLayer attribution='&copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}" />
              <MarkerClusterGroup chunkedLoading maxClusterRadius={40} spiderfyOnMaxZoom showCoverageOnHover={false}
                iconCreateFunction={(cluster: any) => L.divIcon({
                  className: "",
                  html: `<div style="background:#EAB308;color:#000;font-weight:800;font-size:13px;font-family:'Space Grotesk',sans-serif;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,0.4);">${cluster.getChildCount()}</div>`,
                  iconSize: [36, 36], iconAnchor: [18, 18],
                })}>
                {filtered.map(b => (
                  <Marker key={b.id} position={[b.lat, b.lng]} icon={createPublicPinIcon(b.code, b.status)} eventHandlers={{ click: () => setSelectedBillboard(b) }}>
                    <Popup><div className="text-sm min-w-[180px]"><p className="font-bold">#{b.code} · {b.title || b.address}</p><p>{b.route} · {b.city}</p><p className="font-semibold mt-1">R$ {b.price.toLocaleString()}/mês</p></div></Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        </div>
      </section>

      {/* Catalog - grouped by route */}
      <section id="catalog" className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Catálogo</span>
            <h2 className="text-2xl md:text-4xl font-display font-black mt-3">Nossos <span className="text-primary">pontos</span></h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8 justify-center">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 md:px-4 py-2 max-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-card border border-border text-sm px-3 py-2 rounded-xl outline-none" value={routeFilter} onChange={e => setRouteFilter(e.target.value)}>
              <option value="all">Todas Rodovias</option>{routes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="bg-card border border-border text-sm px-3 py-2 rounded-xl outline-none hidden md:block" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
              <option value="all">Todas Cidades</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">{filtered.length} pontos</span>
          </div>

          {/* Render by route groups */}
          {Object.entries(groupedByRoute).map(([route, routeBillboards]) => (
            <div key={route} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Navigation className="w-4 h-4 text-primary" /></div>
                <h3 className="font-display font-bold text-lg md:text-xl">{route}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{routeBillboards.length} ponto(s)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {routeBillboards.map(b => <BillboardCard key={b.id} billboard={b} onOpen={() => setSelectedBillboard(b)} />)}
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p className="text-center text-muted-foreground py-16">Nenhum ponto encontrado.</p>}
        </div>
      </section>

      {/* Landowner */}
      <section id="landowner" className="py-12 md:py-20 px-4 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-4xl font-display font-black mb-4">Proprietário de terreno na rodovia?</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">Monetize seu espaço. Cuidamos de instalação, manutenção e comercialização. Renda mensal garantida.</p>
          <a href="#contact" onClick={() => setFormType("landowner")} className="inline-flex mt-6 md:mt-8 bg-card border-2 border-primary text-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-primary hover:text-primary-foreground transition-all">Cadastrar meu terreno</a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 md:py-20 px-4 border-t border-border">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">Contato</span>
            <h2 className="text-2xl md:text-3xl font-display font-black mt-3">Fale Conosco</h2>
          </div>
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button onClick={() => setFormType("advertiser")} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${formType === "advertiser" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Building2 className="w-4 h-4" /> Anunciar</button>
            <button onClick={() => setFormType("landowner")} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${formType === "landowner" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><User className="w-4 h-4" /> Terreno</button>
          </div>
          <form className="space-y-3 md:space-y-4" onSubmit={handleFormSubmit}>
            {formType === "advertiser" ? (
              <>
                <input name="company" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Empresa / Marca" />
                <input name="contact" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Seu nome" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input name="phone" className="bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Telefone" />
                  <input name="email" type="email" className="bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Email" />
                </div>
                <textarea name="notes" rows={3} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none" placeholder="Observações" />
              </>
            ) : (
              <>
                <input name="owner_name" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Seu nome" />
                <input name="owner_phone" required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Telefone" />
                <input name="owner_email" type="email" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Email" />
                <textarea name="owner_location" rows={3} required className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none" placeholder="Localização do terreno (rodovia, km, cidade...)" />
              </>
            )}
            <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-base tracking-wide hover:opacity-90 shadow-lg shadow-primary/25 uppercase">
              {formType === "advertiser" ? "Enviar Proposta" : "Cadastrar Terreno"}
            </button>
          </form>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <a href="tel:+554184242067" className="flex items-center gap-2 hover:text-primary"><Phone className="w-4 h-4" /> (41) 98424-2067</a>
            <a href="https://www.bj7.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary"><ExternalLink className="w-4 h-4" /> www.bj7.com.br</a>
          </div>
        </div>
      </section>

      <footer className="py-8 md:py-10 px-4 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3"><img src={logoBj7} alt="BJ7 Mídia" className="h-8 w-auto" /><span className="text-xs text-muted-foreground">© 2025 BJ7 Mídia Exterior</span></div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="tel:+554184242067" className="hover:text-primary">(41) 98424-2067</a>
            <a href="https://www.bj7.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-primary">www.bj7.com.br</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
