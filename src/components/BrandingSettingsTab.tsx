import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Palette, Save } from "lucide-react";

interface Branding {
  id: string;
  logo_url: string | null;
  cor_primaria: string;
  contato_oficial: { telefone?: string; email?: string; site?: string; whatsapp?: string };
  texto_institucional: string | null;
  condicoes_comerciais_padrao: string | null;
  validade_padrao_dias: number;
}

export function BrandingSettingsTab() {
  const [b, setB] = useState<Branding | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    const { data } = await supabase.from("branding_settings").select("*").maybeSingle();
    if (data) setB(data as any);
  }

  async function save() {
    if (!b) return;
    setSaving(true);
    const { error } = await supabase
      .from("branding_settings")
      .update({
        logo_url: b.logo_url,
        cor_primaria: b.cor_primaria,
        contato_oficial: b.contato_oficial as any,
        texto_institucional: b.texto_institucional,
        condicoes_comerciais_padrao: b.condicoes_comerciais_padrao,
        validade_padrao_dias: b.validade_padrao_dias,
      })
      .eq("id", b.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Branding atualizado");
  }

  if (!b) return <div className="text-muted-foreground p-4">Carregando…</div>;

  const c = b.contato_oficial || {};
  const update = (patch: Partial<Branding>) => setB({ ...b, ...patch });
  const setContato = (k: string, v: string) => update({ contato_oficial: { ...c, [k]: v } });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Branding & Documentos Comerciais</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Estes dados alimentam o Mídia Kit institucional e o Modelo de Proposta — fonte única.
      </p>

      <Field label="URL do logo (PNG, fundo transparente)">
        <input value={b.logo_url || ""} onChange={(e) => update({ logo_url: e.target.value })} className={inp} placeholder="https://..." />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cor primária">
          <div className="flex gap-2">
            <input type="color" value={b.cor_primaria} onChange={(e) => update({ cor_primaria: e.target.value })} className="w-12 h-10 rounded border border-border bg-transparent" />
            <input value={b.cor_primaria} onChange={(e) => update({ cor_primaria: e.target.value })} className={inp} />
          </div>
        </Field>
        <Field label="Validade padrão da proposta (dias)">
          <input type="number" min={1} value={b.validade_padrao_dias} onChange={(e) => update({ validade_padrao_dias: Number(e.target.value) })} className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Telefone"><input value={c.telefone || ""} onChange={(e) => setContato("telefone", e.target.value)} className={inp} /></Field>
        <Field label="WhatsApp"><input value={c.whatsapp || ""} onChange={(e) => setContato("whatsapp", e.target.value)} className={inp} /></Field>
        <Field label="E-mail"><input value={c.email || ""} onChange={(e) => setContato("email", e.target.value)} className={inp} /></Field>
        <Field label="Site"><input value={c.site || ""} onChange={(e) => setContato("site", e.target.value)} className={inp} /></Field>
      </div>

      <Field label="Texto institucional (Quem somos)">
        <textarea value={b.texto_institucional || ""} onChange={(e) => update({ texto_institucional: e.target.value })} rows={4} className={inp} />
      </Field>

      <Field label="Condições comerciais padrão">
        <textarea value={b.condicoes_comerciais_padrao || ""} onChange={(e) => update({ condicoes_comerciais_padrao: e.target.value })} rows={4} className={inp} />
      </Field>

      <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground">
        <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando…" : "Salvar branding"}
      </Button>
    </div>
  );
}

const inp = "w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}