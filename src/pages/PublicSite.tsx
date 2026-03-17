import { useState } from "react";
import { billboards, Billboard } from "@/data/mockData";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { Search, MapPin, ArrowRight, Menu, X, Phone, Mail, Car, Ruler, Eye, Building2, User } from "lucide-react";
import "leaflet/dist/leaflet.css";

const typeLabels: Record<string, string> = {
  painel_rodoviario: "Painel Rodoviário",
  frontlight: "Frontlight",
  backlight: "Backlight",
  painel_sight: "Painel Sight",
  painel_vip: "Painel VIP",
};

function createPublicIcon(status: Billboard["status"]) {
  const colors = { available: "#3b82f6", occupied: "#6b7280", reserved: "#eab308" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;border:2px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px ${color}66;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-card/90 backdrop-blur-xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-sm">B7</span>
          </div>
          <div>
            <span className="font-display font-bold text-lg">BJ7 Mídia</span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">Mídia Exterior</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
          <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors">Mapa</a>
          <a href="#catalog" className="text-muted-foreground hover:text-foreground transition-colors">Pontos</a>
          <a href="#landowner" className="text-muted-foreground hover:text-foreground transition-colors">Proprietários</a>
          <a href="#contact" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">Anuncie</a>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/30 bg-card/95 backdrop-blur-xl p-4 space-y-3">
          <a href="#about" className="block text-sm text-muted-foreground">Sobre</a>
          <a href="#map" className="block text-sm text-muted-foreground">Mapa</a>
          <a href="#catalog" className="block text-sm text-muted-foreground">Pontos</a>
          <a href="#landowner" className="block text-sm text-muted-foreground">Proprietários</a>
          <a href="#contact" className="block text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg text-center font-semibold">Anuncie</a>
        </div>
      )}
    </nav>
  );
}

export default function PublicSite() {
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
  const statusLabel = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusBadge = { available: "badge-available", occupied: "badge-occupied", reserved: "badge-reserved" };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-primary font-display font-semibold text-sm tracking-widest uppercase mb-4">Mídia Exterior · Litoral do Paraná</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold max-w-4xl mx-auto leading-tight">
            Sua marca nos <span className="glow-text">melhores pontos</span> do litoral
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto text-lg">
            {billboards.length} pontos estratégicos nas rodovias PR-412, PR-508 e BR-277.
            {available.length > 0 && <> <span className="text-primary font-semibold">{available.length} disponíveis</span> agora.</>}
          </p>
          <div className="flex justify-center gap-3 mt-8">
            <a href="#catalog" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Ver Pontos Disponíveis
            </a>
            <a href="#contact" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
              Solicitar Proposta
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: billboards.length, label: "Pontos Estratégicos" },
            { value: "3", label: "Rodovias Cobertas" },
            { value: `${Math.round(billboards.reduce((s, b) => s + b.estimatedFlow, 0) / 1000)}k+`, label: "Impactos Diários" },
            { value: "3", label: "Formatos Disponíveis" },
          ].map(s => (
            <div key={s.label} className="text-center py-4">
              <p className="text-3xl font-display font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-2">Por que anunciar com a BJ7?</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            Rede estratégica de mídia exterior no principal corredor rodoviário ao litoral paranaense.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: "Pontos Estratégicos", desc: "Localizações selecionadas nas PR-412, PR-508 e BR-277 com máxima visibilidade." },
              { icon: Car, title: "Alto Fluxo", desc: "Milhões de impactos mensais com público turístico, local e logístico." },
              { icon: Eye, title: "Alto Impacto", desc: "Formatos de 27m² a 100m² com baixa poluição visual para destaque da sua marca." },
            ].map(item => (
              <div key={item.title} className="stat-card text-center">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-12 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-display font-bold text-center mb-8">Formatos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Padrão 9x3m", area: "27m²", desc: "Alta frequência visual. Ideal para campanhas institucionais e varejo." },
              { name: "Ampliado 12x4m", area: "48m²", desc: "Excelente leitura a longa distância. Muito usado para lançamentos imobiliários." },
              { name: "Gigante 25x4m", area: "100m²", desc: "Máxima visibilidade em rodovias. Ideal para campanhas de grande alcance." },
            ].map(f => (
              <div key={f.name} className="stat-card stat-card-accent">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display font-semibold">{f.name}</h4>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{f.area}</span>
                </div>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="py-16 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-2">Nossos Pontos</h2>
          <p className="text-muted-foreground text-center mb-8">Clique em um ponto para ver detalhes</p>
          <div className="h-[450px] rounded-xl overflow-hidden border border-border">
            <MapContainer center={[-25.85, -48.65]} zoom={10} className="w-full h-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
              {filtered.map(b => (
                <Marker key={b.id} position={[b.lat, b.lng]} icon={createPublicIcon(b.status)} eventHandlers={{ click: () => setSelectedBillboard(b) }} />
              ))}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-16 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-2">Catálogo de Pontos</h2>
          <p className="text-muted-foreground text-center mb-8">Explore todos os pontos disponíveis na rede BJ7</p>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-muted text-sm px-3 py-2 rounded-lg text-foreground outline-none" value={routeFilter} onChange={e => setRouteFilter(e.target.value)}>
              <option value="all">Todas Rodovias</option>
              {routes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="bg-muted text-sm px-3 py-2 rounded-lg text-foreground outline-none" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
              <option value="all">Todas Cidades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-muted text-sm px-3 py-2 rounded-lg text-foreground outline-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">Todos Formatos</option>
              {types.map(t => <option key={t} value={t}>{typeLabels[t] || t}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">{filtered.length} pontos</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => (
              <div key={b.id} className="stat-card cursor-pointer hover:border-primary/40 transition-colors group" onClick={() => setSelectedBillboard(b)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-display font-bold text-lg text-primary">#{b.code}</span>
                    <span className={`ml-2 ${statusBadge[b.status]}`}>{statusLabel[b.status]}</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">{b.dimension}</span>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 flex-shrink-0" />{b.address}</p>
                  <p className="flex items-center gap-1.5"><Ruler className="w-3 h-3 flex-shrink-0" />{b.route} · {b.city}</p>
                  <p className="flex items-center gap-1.5"><Car className="w-3 h-3 flex-shrink-0" />{b.estimatedFlow.toLocaleString()} veíc/dia · {b.trafficType}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="font-display font-bold text-primary text-lg">
                    R$ {b.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mês</span>
                  </span>
                  <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver detalhes <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Billboard detail modal */}
      {selectedBillboard && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBillboard(null)}>
          <div className="glass-panel max-w-lg w-full animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-xl text-primary">Ponto #{selectedBillboard.code}</h3>
                <span className={statusBadge[selectedBillboard.status]}>{statusLabel[selectedBillboard.status]}</span>
              </div>
              <button onClick={() => setSelectedBillboard(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Rodovia" value={selectedBillboard.route} />
                <Detail label="Cidade" value={selectedBillboard.city} />
                <Detail label="Sentido" value={selectedBillboard.direction} />
                <Detail label="Dimensão" value={`${selectedBillboard.dimension} (${selectedBillboard.area}m²)`} />
                <Detail label="Fluxo diário" value={`${selectedBillboard.estimatedFlow.toLocaleString()} veículos`} />
                <Detail label="Impactos/mês" value={(selectedBillboard.estimatedFlow * 30).toLocaleString()} />
                <Detail label="Tráfego" value={selectedBillboard.trafficType} />
                <Detail label="Sazonalidade" value={selectedBillboard.seasonality === "alta" ? "Alta Temporada" : selectedBillboard.seasonality === "media" ? "Média" : "Baixa"} />
              </div>
              <p className="text-muted-foreground pt-2">{selectedBillboard.description}</p>
            </div>
            <div className="p-5 border-t border-border flex items-center justify-between">
              <span className="font-display font-bold text-primary text-2xl">
                R$ {selectedBillboard.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mês</span>
              </span>
              <a href="#contact" onClick={() => setSelectedBillboard(null)} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm">
                Solicitar Proposta
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Landowner section */}
      <section id="landowner" className="py-16 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-3">Proprietário de terreno?</h2>
          <p className="text-muted-foreground mb-6">Monetize seu espaço na beira da rodovia. Alugue para instalação de painéis e receba renda mensal.</p>
          <a href="#contact" onClick={() => setFormType("landowner")} className="inline-flex bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
            Cadastrar meu terreno
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 border-t border-border">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-2">Fale Conosco</h2>
          <p className="text-muted-foreground text-center mb-6">Solicite uma proposta ou cadastre seu terreno.</p>

          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              onClick={() => setFormType("advertiser")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${formType === "advertiser" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <Building2 className="w-4 h-4" /> Quero Anunciar
            </button>
            <button
              onClick={() => setFormType("landowner")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${formType === "landowner" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <User className="w-4 h-4" /> Tenho Terreno
            </button>
          </div>

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            {formType === "advertiser" ? (
              <>
                <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Nome da empresa" />
                <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Responsável" />
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Telefone" />
                  <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="E-mail" />
                </div>
                <textarea className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground h-24 resize-none" placeholder="Quais pontos te interessam? Qual período?" />
              </>
            ) : (
              <>
                <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Seu nome completo" />
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Telefone" />
                  <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="E-mail" />
                </div>
                <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Localização do terreno (rodovia, km, cidade)" />
                <textarea className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground h-24 resize-none" placeholder="Descreva o espaço disponível..." />
              </>
            )}
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              {formType === "advertiser" ? "Solicitar Proposta" : "Cadastrar Terreno"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground space-y-1">
            <p className="flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> (41) 98424-2067</p>
            <p className="flex items-center justify-center gap-2"><Mail className="w-4 h-4" /> contato@bj7midia.com.br</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-xs">B7</span>
            </div>
            <span className="font-display font-semibold">BJ7 Mídia</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 BJ7 Mídia · Litoral do Paraná, Brasil · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
