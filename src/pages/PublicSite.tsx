import { useState } from "react";
import { billboards, Billboard } from "@/data/mockData";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Search, MapPin, Eye, Phone, Mail, ArrowRight, Menu, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

function createPublicIcon(status: Billboard["status"]) {
  const colors = { available: "#3b82f6", occupied: "#6b7280", reserved: "#eab308" };
  const color = colors[status];
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;border:2px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px ${color}66;"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-sm">B7</span>
          </div>
          <span className="font-display font-bold text-lg">BJ7 Mídia</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
          <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors">Mapa</a>
          <a href="#catalog" className="text-muted-foreground hover:text-foreground transition-colors">Catálogo</a>
          <a href="#contact" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">Contato</a>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur-xl p-4 space-y-3">
          <a href="#about" className="block text-sm text-muted-foreground">Sobre</a>
          <a href="#map" className="block text-sm text-muted-foreground">Mapa</a>
          <a href="#catalog" className="block text-sm text-muted-foreground">Catálogo</a>
          <a href="#contact" className="block text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg text-center font-medium">Contato</a>
        </div>
      )}
    </nav>
  );
}

export default function PublicSite() {
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);

  const availableBillboards = billboards.filter(b => b.status === "available");
  const cities = [...new Set(billboards.map(b => b.city))];
  const types = [...new Set(billboards.map(b => b.type))];

  const filtered = billboards.filter(b => {
    const matchCity = cityFilter === "all" || b.city === cityFilter;
    const matchType = typeFilter === "all" || b.type === typeFilter;
    const matchSearch = search === "" || b.code.includes(search) || b.address.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchType && matchSearch;
  });

  const statusLabel = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusColor = { available: "text-primary", occupied: "text-destructive", reserved: "text-warning" };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold max-w-3xl mx-auto leading-tight">
          Seu anúncio no <span className="glow-text">lugar certo</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          A BJ7 Mídia conecta sua marca aos melhores pontos de mídia exterior do Brasil.
          {availableBillboards.length} pontos disponíveis agora.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <a href="#catalog" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Ver Pontos
          </a>
          <a href="#contact" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors">
            Fale Conosco
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Cobertura Nacional", desc: "Pontos estratégicos em São Paulo, Rio de Janeiro, Belo Horizonte e mais." },
            { title: "Tecnologia", desc: "Gestão digital com mapa interativo, contratos automatizados e relatórios em tempo real." },
            { title: "Resultados", desc: "Milhões de impactos visuais diários gerando valor real para sua marca." },
          ].map(item => (
            <div key={item.title} className="stat-card text-center">
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section id="map" className="py-16 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Nossos Pontos</h2>
          <div className="h-[400px] rounded-xl overflow-hidden border border-border">
            <MapContainer center={[-23.0, -44.5]} zoom={6} className="w-full h-full">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />
              {filtered.map(b => (
                <Marker
                  key={b.id}
                  position={[b.lat, b.lng]}
                  icon={createPublicIcon(b.status)}
                  eventHandlers={{ click: () => setSelectedBillboard(b) }}
                />
              ))}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-16 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Catálogo de Pontos</h2>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-muted text-sm px-3 py-2 rounded-lg text-foreground outline-none" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
              <option value="all">Todas Cidades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-muted text-sm px-3 py-2 rounded-lg text-foreground outline-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">Todos Tipos</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">{filtered.length} pontos</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => (
              <div
                key={b.id}
                className="stat-card cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setSelectedBillboard(b)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-display font-bold text-lg">#{b.code}</span>
                    <span className={`ml-2 text-xs font-semibold ${statusColor[b.status]}`}>● {statusLabel[b.status]}</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">{b.type}</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{b.address}</p>
                  <p>{b.city} · {b.region} · {b.dimension}</p>
                  <p>{b.estimatedFlow.toLocaleString()} veíc/dia · {b.direction}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="font-display font-bold text-accent text-lg">R$ {b.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mês</span></span>
                  <span className="text-xs text-primary flex items-center gap-1">Ver detalhes <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Billboard detail modal */}
      {selectedBillboard && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBillboard(null)}>
          <div className="glass-panel p-6 max-w-lg w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl">Ponto #{selectedBillboard.code}</h3>
              <button onClick={() => setSelectedBillboard(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className={`text-sm font-semibold mb-4 ${statusColor[selectedBillboard.status]}`}>● {statusLabel[selectedBillboard.status]}</div>
            <div className="space-y-2 text-sm">
              <p><strong>Endereço:</strong> {selectedBillboard.address}</p>
              <p><strong>Cidade:</strong> {selectedBillboard.city} · {selectedBillboard.region}</p>
              <p><strong>Tipo:</strong> {selectedBillboard.type} · {selectedBillboard.dimension}</p>
              <p><strong>Sentido:</strong> {selectedBillboard.direction}</p>
              <p><strong>Fluxo:</strong> {selectedBillboard.estimatedFlow.toLocaleString()} veículos/dia</p>
              <p className="text-muted-foreground">{selectedBillboard.description}</p>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <span className="font-display font-bold text-accent text-2xl">R$ {selectedBillboard.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mês</span></span>
              <a href="#contact" onClick={() => setSelectedBillboard(null)} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
                Solicitar Proposta
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      <section id="contact" className="py-20 px-4 border-t border-border">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Fale Conosco</h2>
          <p className="text-muted-foreground mb-8">Solicite uma proposta comercial ou tire suas dúvidas.</p>
          <form className="space-y-4 text-left" onSubmit={e => e.preventDefault()}>
            <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Nome da empresa" />
            <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Seu nome" />
            <div className="grid grid-cols-2 gap-4">
              <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="Telefone" />
              <input className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" placeholder="E-mail" />
            </div>
            <textarea className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground h-24 resize-none" placeholder="Mensagem..." />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center text-xs text-muted-foreground">
        <p>© 2025 BJ7 Mídia — Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
