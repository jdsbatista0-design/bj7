import QRCode from "qrcode";
import type { MidiaKitData, MidiaKitPonto } from "./MidiaKitInstitucional";

function formatoLabel(b: any): string {
  if (b.formato_label) return b.formato_label;
  const t = b.type || "painel";
  const map: Record<string, string> = {
    painel_rodoviario: "Painel Rodoviário",
    painel_urbano: "Painel Urbano",
    outdoor: "Outdoor",
    backlight: "Backlight",
    frontlight: "Frontlight",
    empena: "Empena",
  };
  return map[t] || (t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " "));
}

function pickFoto(b: any): string | null {
  if (b.main_photo) return b.main_photo;
  if (Array.isArray(b.photos) && b.photos.length > 0) return b.photos[0];
  if (Array.isArray(b.gallery) && b.gallery.length > 0) return b.gallery[0];
  return null;
}

export function mapPontos(rows: any[]): MidiaKitPonto[] {
  return (rows || []).map((b: any) => ({
    id: b.id,
    codigo: b.code || "",
    cidade: b.city || "",
    estado: b.region || "",
    rodovia: b.route || "",
    endereco: b.address || "",
    formato_label: formatoLabel(b),
    dimensao: b.dimension || `${b.width || 0}x${b.height || 0}m`,
    iluminacao: b.illumination || "",
    foto: pickFoto(b),
    lat: typeof b.lat === "number" ? b.lat : undefined,
    lng: typeof b.lng === "number" ? b.lng : undefined,
    fluxo: typeof b.estimated_flow === "number" ? b.estimated_flow : 0,
    impacto: typeof b.daily_impact === "number" ? b.daily_impact : 0,
  } as MidiaKitPonto));
}

export async function buildMidiaKitData(opts: {
  branding: any;
  billboards: any[];
  selectedIds?: string[] | null;
}): Promise<MidiaKitData> {
  const { branding, billboards, selectedIds } = opts;
  const todos = mapPontos(billboards);
  const catalogo = selectedIds && selectedIds.length > 0
    ? todos.filter(p => selectedIds.includes(p.id))
    : todos;

  const cidades = Array.from(new Set(todos.map(p => p.cidade).filter(Boolean)));
  const estados = Array.from(new Set(todos.map(p => p.estado).filter(Boolean)));
  // Distintos formatos = combinação tipo + dimensão (ex.: "Painel Rodoviário 9x3m")
  const formatos = Array.from(
    new Set(
      todos
        .map(p => `${p.formato_label || ""} ${p.dimensao || ""}`.trim())
        .filter(Boolean)
    )
  );

  const capa = todos.find(p => p.foto) ?? null;
  const cta = [...todos].reverse().find(p => p.foto) ?? null;

  // ------------ AGRUPAR POR RODOVIA ------------
  const byRoute = new Map<string, MidiaKitPonto[]>();
  for (const p of catalogo) {
    const k = (p.rodovia || "Outras rotas").trim();
    if (!byRoute.has(k)) byRoute.set(k, []);
    byRoute.get(k)!.push(p);
  }
  const rodovias = Array.from(byRoute.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([rodovia, pontos]) => {
      const cidadesRota = Array.from(new Set(pontos.map(p => p.cidade).filter(Boolean)));
      const sentido = cidadesRota.length >= 2
        ? `${cidadesRota[0]} → ${cidadesRota[cidadesRota.length - 1]}`
        : cidadesRota[0] || "";
      const capaRota = pontos.find(p => p.foto)?.foto || null;
      return { rodovia, sentido, pontos, capa: capaRota };
    });

  // ------------ DIMENSÕES TOP 3 ------------
  const dimCount = new Map<string, { count: number; w: number; h: number }>();
  for (const b of billboards || []) {
    const w = Number(b.width) || 0;
    const h = Number(b.height) || 0;
    if (w <= 0 || h <= 0) continue;
    const k = `${w}x${h}`;
    const cur = dimCount.get(k) || { count: 0, w, h };
    cur.count++;
    dimCount.set(k, cur);
  }
  const dimensoes_top = Array.from(dimCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(d => {
      const area = d.w * d.h;
      const faixa: "padrao" | "impacto" | "gigante" = area <= 30 ? "padrao" : area <= 80 ? "impacto" : "gigante";
      return {
        label: `${d.h}m x ${d.w}m`,
        w: d.w,
        h: d.h,
        area,
        faixa,
      };
    });

  const site = branding?.contato_oficial?.site || "bj7.com.br";
  const siteUrl = site.startsWith("http") ? site : `https://${site}`;
  let qrcode_data_url: string | null = null;
  try {
    qrcode_data_url = await QRCode.toDataURL(siteUrl, {
      margin: 0,
      width: 240,
      color: { dark: "#111111", light: "#F4F4F2" },
    });
  } catch {
    qrcode_data_url = null;
  }

  return {
    branding: {
      logo_url: branding?.logo_url ?? null,
      cor_primaria: branding?.cor_primaria || "#F2B705",
      contato_oficial: branding?.contato_oficial ?? {},
      texto_institucional: branding?.texto_institucional ?? null,
    },
    cobertura: {
      cidades,
      estados,
      total_pontos: todos.length,
      formatos_distintos: formatos.length,
    },
    pontos_catalogo: catalogo,
    pontos_todos: todos,
    capa_foto: capa?.foto ?? null,
    cta_foto: cta?.foto ?? null,
    qrcode_data_url,
    rodovias,
    dimensoes_top,
  };
}