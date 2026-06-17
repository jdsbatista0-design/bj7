import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Link as LinkIcon, FileText, Eye, Search, MapPin } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { MidiaKitInstitucionalDoc } from "@/lib/pdf/MidiaKitInstitucional";
import { buildMidiaKitData } from "@/lib/pdf/buildMidiaKitData";

export default function MidiaKit() {
  const { isAdmin } = useAuth();
  const [branding, setBranding] = useState<any>(null);
  const [billboards, setBillboards] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [views, setViews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: br }, { data: bbs }, { count }] = await Promise.all([
      supabase.from("branding_settings").select("*").maybeSingle(),
      supabase.from("billboards")
        .select("id,code,city,region,route,address,type,formato_label,dimension,width,height,illumination,main_photo,photos,gallery,lat,lng,estimated_flow")
        .is("deleted_at", null).eq("active", true).order("city", { ascending: true }),
      supabase.from("midia_kit_views").select("*", { count: "exact", head: true }).eq("token", "institucional"),
    ]);
    setBranding(br);
    setBillboards(bbs || []);
    setSelected(new Set((bbs || []).map((b: any) => b.id)));
    setViews(count ?? 0);
    setLoading(false);
  }

  async function downloadPDF() {
    if (billboards.length === 0) return;
    if (selected.size === 0) { toast.error("Selecione ao menos um ponto"); return; }
    setGenerating(true);
    toast.info("Gerando PDF…");
    try {
      const data = await buildMidiaKitData({ branding, billboards, selectedIds: Array.from(selected) });
      const blob = await pdf(<MidiaKitInstitucionalDoc data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bj7-midia-kit-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao gerar PDF: " + (e?.message || "desconhecido"));
    } finally {
      setGenerating(false);
    }
  }

  function copyPublicLink() {
    const url = `${window.location.origin}/midia-kit/publico/institucional`;
    navigator.clipboard.writeText(url);
    toast.success("Link público copiado");
  }

  if (loading) return <div className="p-8 text-muted-foreground">Carregando mídia kit…</div>;

  const cidades = Array.from(new Set(billboards.map((b) => b.city).filter(Boolean)));
  const formatos = Array.from(new Set(billboards.map((b) => b.formato_label || b.type).filter(Boolean)));
  const filtered = billboards.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (b.code || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      (b.route || "").toLowerCase().includes(q) ||
      (b.formato_label || b.type || "").toLowerCase().includes(q)
    );
  });
  const allSelected = selected.size === billboards.length && billboards.length > 0;
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(billboards.map((b) => b.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Mídia Kit Institucional
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione os pontos do catálogo e gere o PDF curado para o cliente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadPDF} disabled={generating || selected.size === 0} className="bg-primary text-primary-foreground">
            <Download className="w-4 h-4 mr-2" /> {generating ? "Gerando…" : `Baixar PDF (${selected.size})`}
          </Button>
          <Button onClick={copyPublicLink} variant="outline">
            <LinkIcon className="w-4 h-4 mr-2" /> Link público
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="Pontos ativos" value={billboards.length} />
        <Kpi label="Cidades" value={cidades.length} />
        <Kpi label="Formatos" value={formatos.length} />
        <Kpi label="Aberturas do link" value={views} icon={<Eye className="w-3 h-3" />} />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} id="all" />
            <label htmlFor="all" className="text-sm font-medium cursor-pointer">
              {allSelected ? "Desmarcar todos" : "Selecionar todos"}
            </label>
            <span className="text-xs text-muted-foreground">
              {selected.size}/{billboards.length} no catálogo
            </span>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, cidade, rodovia…"
              className="pl-8 h-9"
            />
          </div>
        </div>
        <ul className="divide-y divide-border max-h-[520px] overflow-y-auto">
          {filtered.map((b) => {
            const checked = selected.has(b.id);
            const foto = b.main_photo || (Array.isArray(b.photos) && b.photos[0]) || null;
            return (
              <li
                key={b.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/40 cursor-pointer"
                onClick={() => toggleOne(b.id)}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleOne(b.id)} onClick={(e) => e.stopPropagation()} />
                <div className="w-14 h-14 rounded bg-muted overflow-hidden shrink-0">
                  {foto ? (
                    <img src={foto} alt={b.code} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">#{b.code}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                      {b.formato_label || b.type}
                    </span>
                  </div>
                  <div className="text-sm font-medium truncate">
                    {b.city}{b.region ? ` · ${b.region}` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {b.route || b.address || "—"}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground hidden md:block">{b.dimension}</div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">
              Nenhum ponto encontrado para "{search}".
            </li>
          )}
        </ul>
      </div>

      {isAdmin && (
        <p className="text-xs text-muted-foreground mt-6">
          Configurações (logo, contato, textos) em{" "}
          <a href="/settings" className="text-primary underline">Configurações → Branding</a>.
        </p>
      )}
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1 flex items-center gap-1">
        {icon}{label}
      </div>
    </div>
  );
}