import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { pdf } from "@react-pdf/renderer";
import { MidiaKitInstitucionalDoc, type MidiaKitData } from "@/lib/pdf/MidiaKitInstitucional";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function MidiaKitPublico() {
  const { token = "institucional" } = useParams();
  const [data, setData] = useState<MidiaKitData | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Track view
    void supabase.from("midia_kit_views").insert({
      token,
      user_agent: navigator.userAgent.slice(0, 200),
      referer: document.referrer.slice(0, 200),
    } as any);

    void (async () => {
      const [{ data: branding }, { data: bbs }] = await Promise.all([
        supabase.from("branding_settings").select("*").maybeSingle(),
        supabase.from("public_billboards" as any).select("city,type,dimension"),
      ]);
      const cidades = Array.from(new Set((bbs || []).map((b: any) => b.city).filter(Boolean)));
      const formatMap = new Map<string, any>();
      (bbs || []).forEach((b: any) => {
        const key = b.type || "Painel";
        const prev = formatMap.get(key);
        if (prev) prev.quantidade++;
        else formatMap.set(key, { nome: key, dimensao: b.dimension || "—", quantidade: 1 });
      });
      setData({
        branding: {
          logo_url: (branding as any)?.logo_url ?? null,
          cor_primaria: (branding as any)?.cor_primaria ?? "#EAB308",
          contato_oficial: (branding as any)?.contato_oficial ?? {},
          texto_institucional: (branding as any)?.texto_institucional,
        },
        cobertura: { cidades, total_faces: (bbs || []).length },
        formatos: Array.from(formatMap.values()).slice(0, 4),
        pontos_destaque: [],
      });
    })();
  }, [token]);

  async function download() {
    if (!data) return;
    setBusy(true);
    const blob = await pdf(<MidiaKitInstitucionalDoc data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bj7-midia-kit.pdf"; a.click();
    URL.revokeObjectURL(url);
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium uppercase tracking-wide">
          BJ7 Painéis
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          Mídia Kit <span className="text-amber-500">2026</span>
        </h1>
        <p className="text-neutral-400">
          Mídia exterior premium no Litoral do Paraná e Santa Catarina. Baixe o material completo com cobertura, formatos e diferenciais.
        </p>
        {data && (
          <div className="flex justify-center gap-6 text-sm text-neutral-500">
            <span><span className="text-white font-semibold">{data.cobertura.total_faces}</span> faces</span>
            <span><span className="text-white font-semibold">{data.cobertura.cidades.length}</span> cidades</span>
            <span><span className="text-white font-semibold">{data.formatos.length}</span> formatos</span>
          </div>
        )}
        <Button onClick={download} disabled={!data || busy} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
          <Download className="w-4 h-4 mr-2" /> {busy ? "Gerando…" : "Baixar Mídia Kit (PDF)"}
        </Button>
        <p className="text-xs text-neutral-600 pt-8">www.bj7.com.br</p>
      </div>
    </div>
  );
}