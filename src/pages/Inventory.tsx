import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useData, Billboard } from "@/contexts/DataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { PermissionGate, PermissionPageBlock } from "@/components/PermissionGate";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, X, Plus, Trash2, Edit, Car, DollarSign, MapPin, Upload, Image,
  Eye, ExternalLink, Globe, Sun, Moon, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
} from "lucide-react";
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
  code: "", title: "", short_description: "", commercial_description: "",
  lat: -25.85, lng: -48.65, city: "", region: "Litoral PR", route: "PR-412",
  address: "", type: "painel_rodoviario", dimension: "9x3m", width: 9, height: 3, area: 27, direction: "",
  estimated_flow: 0, audience_profile: "", seasonality: "media", traffic_type: "",
  land_owner: "", land_owner_id: null, cost: 0, price: 0, production_cost: 0,
  status: "available", commercial_status: "available", operational_status: "active",
  photos: [], main_photo: "", gallery: [], description: "", formats: ["Lona impressa"],
  maps_url: "", google_street_view_url: "", illumination: "nao",
  show_on_site: true, active: true,
};

const newPinIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:#EAB308;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,0.4);"></div></div>`,
  iconSize: [24, 36], iconAnchor: [12, 36],
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// Photo upload helper
async function uploadPhoto(file: File, billboardCode: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${billboardCode}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("billboard-photos").upload(path, file);
  if (error) { toast.error("Erro no upload: " + error.message); return null; }
  const { data: { publicUrl } } = supabase.storage.from("billboard-photos").getPublicUrl(path);
  return publicUrl;
}

function BillboardForm({ initial, onSave, onCancel, title, clients }: {
  initial: Partial<Billboard> & { id?: string };
  onSave: (data: any) => void;
  onCancel: () => void;
  title: string;
  clients: { id: string; name: string; type: string }[];
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"info" | "location" | "commercial" | "photos">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleMainPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadPhoto(file, form.code || "novo");
    if (url) set("main_photo", url);
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadPhoto(file, form.code || "novo");
      if (url) urls.push(url);
    }
    set("gallery", [...(form.gallery || []), ...urls]);
    setUploading(false);
  };

  const removeGalleryPhoto = (idx: number) => {
    set("gallery", (form.gallery || []).filter((_, i) => i !== idx));
  };

  const landowners = clients.filter(c => c.type === "landowner");
  const inputClass = "w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block";

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4" onClick={onCancel}>
      <div className="glass-panel max-w-2xl w-full animate-slide-up max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 overflow-x-auto">
          {[
            { key: "info", label: "Dados" },
            { key: "location", label: "Local" },
            { key: "commercial", label: "Comercial" },
            { key: "photos", label: "Fotos" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {tab === "info" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Código *</label>
                  <input className={inputClass} value={form.code || ""} onChange={e => set("code", e.target.value)} placeholder="Ex: 001" /></div>
                <div><label className={labelClass}>Status</label>
                  <select className={inputClass} value={form.status || "available"} onChange={e => set("status", e.target.value)}>
                    <option value="available">Disponível</option><option value="occupied">Ocupado</option><option value="reserved">Reservado</option>
                  </select></div>
              </div>
              <div><label className={labelClass}>Título</label>
                <input className={inputClass} value={form.title || ""} onChange={e => set("title", e.target.value)} placeholder="Ex: Painel Trevo de Garuva" /></div>
              <div><label className={labelClass}>Tipo</label>
                <select className={inputClass} value={form.type || "painel_rodoviario"} onChange={e => set("type", e.target.value)}>
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelClass}>Largura (m)</label>
                  <input type="number" step="0.1" className={inputClass} value={form.width || 9} onChange={e => { set("width", parseFloat(e.target.value) || 0); set("dimension", `${e.target.value}x${form.height || 3}m`); set("area", (parseFloat(e.target.value) || 0) * (form.height || 3)); }} /></div>
                <div><label className={labelClass}>Altura (m)</label>
                  <input type="number" step="0.1" className={inputClass} value={form.height || 3} onChange={e => { set("height", parseFloat(e.target.value) || 0); set("dimension", `${form.width || 9}x${e.target.value}m`); set("area", (form.width || 9) * (parseFloat(e.target.value) || 0)); }} /></div>
                <div><label className={labelClass}>Área (m²)</label>
                  <p className="text-sm font-semibold mt-2 text-primary">{((form.width || 9) * (form.height || 3)).toFixed(0)} m²</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Iluminação</label>
                  <select className={inputClass} value={form.illumination || "nao"} onChange={e => set("illumination", e.target.value)}>
                    <option value="nao">Sem iluminação</option><option value="frontal">Frontal</option><option value="interna">Interna (Backlight)</option>
                  </select></div>
                <div><label className={labelClass}>Sentido</label>
                  <input className={inputClass} value={form.direction || ""} onChange={e => set("direction", e.target.value)} placeholder="Sentido Curitiba" /></div>
              </div>
              <div><label className={labelClass}>Descrição curta</label>
                <input className={inputClass} value={form.short_description || ""} onChange={e => set("short_description", e.target.value)} placeholder="Resumo para o card" /></div>
              <div><label className={labelClass}>Descrição comercial</label>
                <textarea className={`${inputClass} h-20 resize-none`} value={form.commercial_description || ""} onChange={e => set("commercial_description", e.target.value)} placeholder="Texto comercial para proposta/site" /></div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => set("show_on_site", !form.show_on_site)}
                    className={`w-10 h-6 rounded-full transition-colors ${form.show_on_site ? "bg-primary" : "bg-muted"} relative`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${form.show_on_site ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                  <span className="text-xs text-muted-foreground">Exibir no site</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => set("active", !form.active)}
                    className={`w-10 h-6 rounded-full transition-colors ${form.active ? "bg-success" : "bg-muted"} relative`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${form.active ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                  <span className="text-xs text-muted-foreground">Ativo</span>
                </label>
              </div>
            </>
          )}

          {tab === "location" && (
            <>
              <div><label className={labelClass}>Endereço</label>
                <input className={inputClass} value={form.address || ""} onChange={e => set("address", e.target.value)} placeholder="Rodovia PR-412, Km 5" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Cidade</label>
                  <input className={inputClass} value={form.city || ""} onChange={e => set("city", e.target.value)} /></div>
                <div><label className={labelClass}>Rodovia</label>
                  <input className={inputClass} value={form.route || ""} onChange={e => set("route", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Região/Eixo</label>
                  <input className={inputClass} value={form.region || ""} onChange={e => set("region", e.target.value)} /></div>
                <div><label className={labelClass}>Sentido</label>
                  <input className={inputClass} value={form.direction || ""} onChange={e => set("direction", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Latitude</label>
                  <input type="number" step="any" className={inputClass} value={form.lat || 0} onChange={e => set("lat", parseFloat(e.target.value) || 0)} /></div>
                <div><label className={labelClass}>Longitude</label>
                  <input type="number" step="any" className={inputClass} value={form.lng || 0} onChange={e => set("lng", parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div><label className={labelClass}>Google Maps URL</label>
                <input className={inputClass} value={form.maps_url || ""} onChange={e => set("maps_url", e.target.value)} placeholder="https://maps.google.com/..." /></div>
              <div><label className={labelClass}>Google Street View URL</label>
                <input className={inputClass} value={form.google_street_view_url || ""} onChange={e => set("google_street_view_url", e.target.value)} placeholder="https://..." /></div>
              <div className="flex gap-2 pt-2">
                <a href={`https://www.google.com/maps?q=${form.lat},${form.lng}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-primary/10 text-primary px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-primary/20">
                  <ExternalLink className="w-3 h-3" /> Abrir Maps
                </a>
                <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${form.lat},${form.lng}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-muted text-muted-foreground px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-muted/80">
                  <Eye className="w-3 h-3" /> Street View
                </a>
              </div>
            </>
          )}

          {tab === "commercial" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelClass}>Preço/mês</label>
                  <input type="number" className={inputClass} value={form.price || 0} onChange={e => set("price", parseFloat(e.target.value) || 0)} /></div>
                <div><label className={labelClass}>Custo terreno</label>
                  <input type="number" className={inputClass} value={form.cost || 0} onChange={e => set("cost", parseFloat(e.target.value) || 0)} /></div>
                <div><label className={labelClass}>Produção</label>
                  <input type="number" className={inputClass} value={form.production_cost || 0} onChange={e => set("production_cost", parseFloat(e.target.value) || 0)} /></div>
              </div>
              <div><label className={labelClass}>Fluxo estimado (veíc/dia)</label>
                <input type="number" className={inputClass} value={form.estimated_flow || 0} onChange={e => set("estimated_flow", parseInt(e.target.value) || 0)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Sazonalidade</label>
                  <select className={inputClass} value={form.seasonality || "media"} onChange={e => set("seasonality", e.target.value)}>
                    <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
                  </select></div>
                <div><label className={labelClass}>Tipo de tráfego</label>
                  <input className={inputClass} value={form.traffic_type || ""} onChange={e => set("traffic_type", e.target.value)} placeholder="Turístico, logístico..." /></div>
              </div>
              <div><label className={labelClass}>Perfil de público</label>
                <input className={inputClass} value={form.audience_profile || ""} onChange={e => set("audience_profile", e.target.value)} placeholder="Turistas, moradores locais..." /></div>
              <div><label className={labelClass}>Proprietário do terreno</label>
                <select className={inputClass} value={form.land_owner_id || ""} onChange={e => {
                  const owner = landowners.find(o => o.id === e.target.value);
                  set("land_owner_id", e.target.value || null);
                  set("land_owner", owner?.name || "");
                }}>
                  <option value="">Selecione...</option>
                  {landowners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select></div>
              <div><label className={labelClass}>Descrição geral</label>
                <textarea className={`${inputClass} h-20 resize-none`} value={form.description || ""} onChange={e => set("description", e.target.value)} /></div>
            </>
          )}

          {tab === "photos" && (
            <>
              {/* Main Photo */}
              <div>
                <label className={labelClass}>Foto Principal</label>
                <div className="flex items-start gap-4">
                  {form.main_photo ? (
                    <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-border">
                      <img src={form.main_photo} alt="Principal" className="w-full h-full object-cover" />
                      <button onClick={() => set("main_photo", "")} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="w-40 h-28 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                      <div className="text-center"><Image className="w-6 h-6 text-muted-foreground mx-auto mb-1" /><span className="text-[10px] text-muted-foreground">Sem foto</span></div>
                    </div>
                  )}
                  <div>
                    <input ref={mainPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleMainPhotoUpload} />
                    <Button size="sm" variant="outline" onClick={() => mainPhotoRef.current?.click()} disabled={uploading}>
                      <Upload className="w-3 h-3 mr-1" /> {uploading ? "Enviando..." : "Upload"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">Usada no card do site</p>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div className="pt-3 border-t border-border">
                <label className={labelClass}>Galeria de Fotos</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {(form.gallery || []).map((url, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removeGalleryPhoto(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                        <X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="aspect-[4/3] rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 hover:border-primary/40 transition-colors">
                    <div className="text-center"><Plus className="w-5 h-5 text-muted-foreground mx-auto" />
                      <span className="text-[10px] text-muted-foreground">{uploading ? "Enviando..." : "Adicionar"}</span></div>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(form)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

function BillboardDetail({ billboard, onClose, onEdit, onDelete }: {
  billboard: Billboard; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const allPhotos = [billboard.main_photo, ...(billboard.gallery || [])].filter(Boolean);
  const statusLabels = { available: "Disponível", occupied: "Ocupado", reserved: "Reservado" };
  const statusBadge = { available: "badge-available", occupied: "badge-occupied", reserved: "badge-reserved" };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div className="glass-panel max-w-lg w-full animate-slide-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-xl text-primary">#{billboard.code}</span>
            <span className={statusBadge[billboard.status]}>{statusLabels[billboard.status]}</span>
            {!billboard.show_on_site && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Oculto do site</span>}
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

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Photos */}
          {allPhotos.length > 0 && (
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
              <img src={allPhotos[photoIdx]} alt={`#${billboard.code}`} className="w-full h-full object-cover" />
              {allPhotos.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {allPhotos.map((_, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)} className={`w-2 h-2 rounded-full ${i === photoIdx ? 'bg-primary' : 'bg-white/50'}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {billboard.title && <h4 className="font-display font-bold text-lg">{billboard.title}</h4>}

          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Localização</h4>
            <div className="space-y-1 text-sm">
              <Row label="Endereço" value={billboard.address} />
              <Row label="Rodovia" value={billboard.route} />
              <Row label="Cidade" value={`${billboard.city} - ${billboard.region}`} />
              <Row label="Sentido" value={billboard.direction} />
            </div>
            <div className="flex gap-2 mt-2">
              <a href={`https://www.google.com/maps?q=${billboard.lat},${billboard.lng}`} target="_blank" rel="noopener noreferrer"
                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Maps</a>
              <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${billboard.lat},${billboard.lng}`} target="_blank" rel="noopener noreferrer"
                className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded flex items-center gap-1"><Eye className="w-3 h-3" /> Street View</a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Dados Técnicos</h4>
            <div className="space-y-1 text-sm">
              <Row label="Tipo" value={typeLabels[billboard.type] || billboard.type} />
              <Row label="Dimensão" value={`${billboard.width}x${billboard.height}m (${billboard.area}m²)`} />
              <Row label="Iluminação" value={billboard.illumination === "nao" ? "Não" : billboard.illumination} />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Comercial</h4>
            <div className="space-y-1 text-sm">
              <Row label="Veiculação/mês" value={`R$ ${billboard.price.toLocaleString()}`} highlight />
              <Row label="Custo terreno" value={`R$ ${billboard.cost.toLocaleString()}/mês`} />
              <Row label="Produção" value={`R$ ${billboard.production_cost.toLocaleString()}`} />
              <Row label="Margem" value={`R$ ${(billboard.price - billboard.cost).toLocaleString()}/mês`} highlight />
              <Row label="Fluxo" value={`${billboard.estimated_flow.toLocaleString()} veíc/dia`} />
              <Row label="Proprietário" value={billboard.land_owner} />
            </div>
          </div>

          {billboard.description && <p className="text-xs text-muted-foreground pt-2 border-t border-border">{billboard.description}</p>}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground whitespace-nowrap">{label}</span>
      <span className={`text-right ${highlight ? "font-semibold text-primary" : ""}`}>{value || "—"}</span>
    </div>
  );
}

export default function Inventory() {
  const { can } = usePermissions();
  const { billboards, clients, addBillboard, updateBillboard, deleteBillboard } = useData();
  const [selected, setSelected] = useState<Billboard | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [formData, setFormData] = useState<any>(null);
  const [addingByClick, setAddingByClick] = useState(false);
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const filtered = billboards.filter(b => {
    const matchSearch = b.code.includes(search) || b.city.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase()) || (b.title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const clientList = clients.map(c => ({ id: c.id, name: c.name, type: c.type }));

  const handleMapClick = (lat: number, lng: number) => {
    if (!addingByClick) return;
    setTempPin({ lat, lng });
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
    setMode("view"); setFormData(null); setTempPin(null);
  };

  const handleDelete = async () => {
    if (!can("inventario", "can_delete")) { toast.error("Sem permissão"); return; }
    if (selected && confirm(`Excluir ponto #${selected.code}?`)) {
      await deleteBillboard(selected.id); setSelected(null); toast.success("Ponto excluído");
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
      <PermissionPageBlock module="inventario" label="o Inventário" />

      {/* Header */}
      <div className="p-3 flex items-center gap-2 border-b border-border bg-card/60 backdrop-blur-sm z-10 flex-wrap">
        <h1 className="font-display font-bold text-lg mr-2">Inventário</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 flex-1 max-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["all", "available", "occupied", "reserved"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors hidden md:block ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "Todos" : s === "available" ? "Disponível" : s === "occupied" ? "Ocupado" : "Reservado"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:block">{filtered.length} pontos</span>
          <div className="flex bg-muted rounded-lg p-0.5">
            <button onClick={() => setViewMode("map")} className={`px-2 py-1 rounded text-xs ${viewMode === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Mapa</button>
            <button onClick={() => setViewMode("list")} className={`px-2 py-1 rounded text-xs ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Lista</button>
          </div>
          {can("inventario", "can_create") && (
            <Button size="sm" variant={addingByClick ? "destructive" : "default"} onClick={() => {
              if (addingByClick) { setAddingByClick(false); } else if (viewMode === "map") { setAddingByClick(true); toast.info("Clique no mapa"); } else { setFormData({ ...emptyBillboard, code: String(Math.max(...billboards.map(b => parseInt(b.code) || 0), 0) + 1) }); setMode("add"); }
            }}>
              {addingByClick ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Novo</>}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {viewMode === "map" ? (
          <>
            <MapContainer center={[-25.85, -48.65]} zoom={10} className="w-full h-full" zoomControl={true}>
              <TileLayer attribution='&copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}" />
              <MapClickHandler onMapClick={handleMapClick} />
              {filtered.map(b => (
                <Marker key={b.id} position={[b.lat, b.lng]} icon={createLabelIcon(b.code, b.status)} eventHandlers={{ click: () => { if (!addingByClick) { setSelected(b); setMode("view"); } } }} />
              ))}
              {tempPin && <Marker position={[tempPin.lat, tempPin.lng]} icon={newPinIcon} />}
            </MapContainer>
            {addingByClick && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold animate-pulse">
                <MapPin className="w-4 h-4" /> Clique no mapa
              </div>
            )}
          </>
        ) : (
          <div className="p-4 space-y-2 overflow-y-auto h-full">
            {filtered.map(b => (
              <div key={b.id} onClick={() => { setSelected(b); setMode("view"); }}
                className="stat-card cursor-pointer hover:border-primary/30 transition-colors flex items-center gap-4">
                {b.main_photo ? (
                  <img src={b.main_photo} alt={`#${b.code}`} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-muted-foreground" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-primary">#{b.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${b.status === "available" ? "bg-info/10 text-info" : b.status === "occupied" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                      {b.status === "available" ? "Disponível" : b.status === "occupied" ? "Ocupado" : "Reservado"}
                    </span>
                    {!b.show_on_site && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Oculto</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{b.title || `${b.city} · ${b.route}`}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-display font-bold text-primary">R$ {b.price.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{b.dimension}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mode === "view" && selected && (
        <BillboardDetail billboard={selected} onClose={() => setSelected(null)}
          onEdit={() => { setFormData({ ...selected }); setMode("edit"); }}
          onDelete={handleDelete} />
      )}

      {(mode === "add" || mode === "edit") && formData && (
        <BillboardForm initial={formData} title={mode === "add" ? "Novo Ponto" : `Editar #${formData.code}`}
          onSave={handleSave} onCancel={() => { setMode("view"); setFormData(null); setTempPin(null); }}
          clients={clientList} />
      )}
    </div>
  );
}
