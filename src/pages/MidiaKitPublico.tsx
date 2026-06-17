import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { pdf } from "@react-pdf/renderer";
import { MidiaKitInstitucionalDoc } from "@/lib/pdf/MidiaKitInstitucional";
import { buildMidiaKitData } from "@/lib/pdf/buildMidiaKitData";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function MidiaKitPublico() {
  const { token = "institucional" } = useParams();
  const [branding, setBranding] = useState<any>(null);
  const [billboards, setBillboards] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.from("midia_kit_views").insert({
      token,
      user_agent: navigator.userAgent.slice(0, 200),
      referer: document.referrer.slice(0, 200),
    } as any);

    void (async () => {
      const [{ data: br }, { data: bbs }] = await Promise.all([
        supabase.from("branding_settings").select("*").maybeSingle(),
        supabase
          .from("billboards")
          .select("id,code,city,region,route,address,type,formato_label,dimension,width,height,illumination,main_photo,photos,gallery,lat,lng,estimated_flow")
          .is("deleted_at", null).eq("active", true).eq("show_on_site", true),
      ]);
      setBranding(br);
      setBillboards(bbs || []);
    })();
  }, [token]);

  async function download() {
    if (billboards.length === 0) return;
    setBusy(true);
    try {
      const data = await buildMidiaKitData({ branding, billboards, selectedIds: null });
      const blob = await pdf(<MidiaKitInstitucionalDoc data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "bj7-midia-kit.pdf"; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  const cidades = Array.from(new Set(billboards.map((b) => b.city).filter(Boolean)));
  const formatos = Array.from(new Set(billboards.map((b) => b.formato_label || b.type).filter(Boolean)));

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
        {billboards.length > 0 && (
          <div className="flex justify-center gap-6 text-sm text-neutral-500">
            <span><span className="text-white font-semibold">{billboards.length}</span> pontos</span>
            <span><span className="text-white font-semibold">{cidades.length}</span> cidades</span>
            <span><span className="text-white font-semibold">{formatos.length}</span> formatos</span>
          </div>
        )}
        <Button onClick={download} disabled={busy || billboards.length === 0} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
          <Download className="w-4 h-4 mr-2" /> {busy ? "Gerando…" : "Baixar Mídia Kit (PDF)"}
        </Button>
        <p className="text-xs text-neutral-600 pt-8">www.bj7.com.br</p>
      </div>
    </div>
  );
}