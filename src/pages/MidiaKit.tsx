import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Link as LinkIcon, FileText, Eye } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { MidiaKitInstitucionalDoc, type MidiaKitData } from "@/lib/pdf/MidiaKitInstitucional";

export default function MidiaKit() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<MidiaKitData | null>(null);
  const [views, setViews] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: branding }, { data: bbs }, { count }] = await Promise.all([
      supabase.from("branding_settings").select("*").maybeSingle(),
      supabase.from("billboards").select("city,type,dimension,code,main_photo").is("deleted_at", null).eq("active", true),
      supabase.from("midia_kit_views").select("*", { count: "exact", head: true }).eq("token", "institucional"),
    ]);

    const cidades = Array.from(new Set((bbs || []).map((b: any) => b.city).filter(Boolean)));
    const formatMap = new Map<string, { nome: string; dimensao: string; quantidade: number }>();
    (bbs || []).forEach((b: any) => {
      const key = b.type || "Painel";
      const prev = formatMap.get(key);
      if (prev) prev.quantidade++;
      else formatMap.set(key, { nome: key, dimensao: b.dimension || "—", quantidade: 1 });
    });
    const formatos = Array.from(formatMap.values()).slice(0, 4);

    setData({
      branding: {
        logo_url: (branding as any)?.logo_url ?? null,
        cor_primaria: (branding as any)?.cor_primaria ?? "#EAB308",
        contato_oficial: (branding as any)?.contato_oficial ?? {},
        texto_institucional: (branding as any)?.texto_institucional,
      },
      cobertura: { cidades, total_faces: (bbs || []).length },
      formatos,
      pontos_destaque: [],
    });
    setViews(count ?? 0);
    setLoading(false);
  }

  async function downloadPDF() {
    if (!data) return;
    toast.info("Gerando PDF…");
    const blob = await pdf(<MidiaKitInstitucionalDoc data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bj7-midia-kit-${new Date().toISOString().slice(0,10)}.pdf`;
    a.click(); URL.revokeObjectURL(url);
  }

  function copyPublicLink() {
    const url = `${window.location.origin}/midia-kit/publico/institucional`;
    navigator.clipboard.writeText(url);
    toast.success("Link público copiado");
  }

  if (loading || !data) return <div className="p-8 text-muted-foreground">Carregando mídia kit…</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Mídia Kit Institucional
          </h1>
          <p className="text-sm text-muted-foreground mt-1">PDF gerado dinamicamente a partir do inventário ativo.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadPDF} className="bg-primary text-primary-foreground">
            <Download className="w-4 h-4 mr-2" /> Baixar PDF
          </Button>
          <Button onClick={copyPublicLink} variant="outline">
            <LinkIcon className="w-4 h-4 mr-2" /> Copiar link público
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <Kpi label="Faces ativas" value={data.cobertura.total_faces} />
        <Kpi label="Cidades" value={data.cobertura.cidades.length} />
        <Kpi label="Formatos" value={data.formatos.length} />
        <Kpi label="Aberturas do link" value={views} icon={<Eye className="w-3 h-3" />} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold mb-3">Pré-visualização do conteúdo</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• <span className="text-foreground">Capa</span> com marca, posicionamento e cobertura.</li>
          <li>• <span className="text-foreground">Quem somos</span> — texto institucional + KPIs de cobertura (fonte InfoOOH).</li>
          <li>• <span className="text-foreground">Catálogo de formatos</span> com {data.formatos.length} padrões e quantidade de faces.</li>
          <li>• <span className="text-foreground">Diferenciais + CTA</span> com contato oficial e site.</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-4">
          Cidades: {data.cobertura.cidades.join(" · ") || "—"}
        </p>
      </div>

      {isAdmin && (
        <p className="text-xs text-muted-foreground mt-6">
          Configurações (logo, contato, textos) em <a href="/settings" className="text-primary underline">Configurações → Branding</a>.
        </p>
      )}
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1 flex items-center gap-1">{icon}{label}</div>
    </div>
  );
}