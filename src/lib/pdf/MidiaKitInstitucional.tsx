import { Document, Page, Text, View, Image, StyleSheet, Svg, Rect, Circle, G, Line, Path } from "@react-pdf/renderer";
import { TOKENS, MARGIN, LAND_W, LAND_H } from "./tokens";
import { ensureFonts } from "./fonts";

ensureFonts();

// ====================== TYPES ======================
export interface MidiaKitPonto {
  id: string;
  codigo: string;
  cidade: string;
  estado?: string;
  rodovia: string;
  endereco?: string;
  formato_label: string;
  dimensao: string;
  iluminacao?: string;
  foto?: string | null;
  lat?: number;
  lng?: number;
  fluxo?: number;
  impacto?: number;
}

export interface MidiaKitData {
  branding: {
    logo_url?: string | null;
    cor_primaria: string;
    contato_oficial: { telefone?: string; email?: string; site?: string; whatsapp?: string };
    texto_institucional?: string | null;
  };
  cobertura: {
    cidades: string[];
    estados: string[];
    total_pontos: number;
    formatos_distintos: number;
  };
  pontos_catalogo: MidiaKitPonto[];
  pontos_todos: MidiaKitPonto[];
  capa_foto?: string | null;
  cta_foto?: string | null;
  qrcode_data_url?: string | null;
  rodovias: Array<{ rodovia: string; sentido?: string; pontos: MidiaKitPonto[]; capa?: string | null }>;
  dimensoes_top: Array<{ label: string; w: number; h: number; area: number; faixa: "padrao" | "impacto" | "gigante" }>;
}

// ====================== STYLES ======================
const M = 36;
const s = StyleSheet.create({
  page: { backgroundColor: TOKENS.ASPHALT, color: TOKENS.ICE, fontFamily: "Helvetica", fontSize: 9.5 },
  inner: { flex: 1, paddingTop: M + 18, paddingBottom: M + 18, paddingHorizontal: M, position: "relative" },
  eyebrow: { fontSize: 7.5, letterSpacing: 2.4, fontFamily: "Helvetica-Bold", color: TOKENS.GRAY, textTransform: "uppercase" },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 32, letterSpacing: -0.2, lineHeight: 1.05, color: TOKENS.ICE },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 16, lineHeight: 1.15, color: TOKENS.ICE },
  lede: { fontFamily: "Helvetica", fontSize: 10.5, lineHeight: 1.5, color: TOKENS.ICE },
  body: { fontFamily: "Helvetica", fontSize: 9, lineHeight: 1.55, color: "#BDBDBA" },
  small: { fontSize: 7.5, color: TOKENS.GRAY, lineHeight: 1.45 },
  caption: { fontSize: 6.8, color: TOKENS.DIM, letterSpacing: 1.6, textTransform: "uppercase" },
});

// ====================== ATOMS ======================
function TopBar({ section, num, total, amber, brand }: { section: string; num: string; total: string; amber: string; brand: string }) {
  return (
    <View fixed style={{ position: "absolute", top: M - 8, left: M, right: M, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 14, height: 2, backgroundColor: amber }} />
        <Text style={[s.eyebrow, { color: TOKENS.ICE }]}>{brand}</Text>
        <Text style={[s.eyebrow, { color: TOKENS.DIM }]}>·</Text>
        <Text style={[s.eyebrow]}>{section}</Text>
      </View>
      <Text style={[s.eyebrow]}>
        <Text style={{ color: TOKENS.ICE }}>{num}</Text> / {total}
      </Text>
    </View>
  );
}

function BottomBar({ left, right, amber }: { left: string; right: string; amber: string }) {
  return (
    <View fixed style={{ position: "absolute", bottom: M - 14, left: M, right: M, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 0.5, borderTopColor: TOKENS.RULE }}>
      <Text style={[s.small, { letterSpacing: 1.4, textTransform: "uppercase" }]}>{left}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 4, height: 4, backgroundColor: amber }} />
        <Text style={[s.small, { color: TOKENS.ICE, letterSpacing: 1.4 }]}>{right}</Text>
      </View>
    </View>
  );
}

function Stat({ amber, value, label }: { amber: string; value: string | number; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 40, color: TOKENS.ICE, lineHeight: 1 }}>{value}</Text>
      <View style={{ width: 18, height: 2, backgroundColor: amber, marginTop: 8, marginBottom: 6 }} />
      <Text style={[s.eyebrow]}>{label}</Text>
    </View>
  );
}

function PhotoOrPlaceholder({ src, w, h, amber }: { src?: string | null; w: number | string; h: number; amber: string }) {
  if (src) return <Image src={src} style={{ width: w as any, height: h, objectFit: "cover" }} />;
  return (
    <View style={{ width: w as any, height: h, backgroundColor: "#0B0B0B", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: "#1F1F1F", letterSpacing: 5 }}>BJ7</Text>
      <View style={{ width: 22, height: 2, backgroundColor: "#1F1F1F", marginTop: 6 }} />
    </View>
  );
}

function CoverageMap({ pontos, amber, w, h }: { pontos: MidiaKitPonto[]; amber: string; w: number; h: number }) {
  const pts = pontos.filter(p => typeof p.lat === "number" && typeof p.lng === "number") as Array<MidiaKitPonto & { lat: number; lng: number }>;
  if (pts.length === 0) {
    return <View style={{ width: w, height: h, backgroundColor: "#0B0B0B", borderWidth: 0.5, borderColor: TOKENS.RULE }} />;
  }
  const lats = pts.map(p => p.lat), lngs = pts.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.2 || 0.05;
  const padLng = (maxLng - minLng) * 0.2 || 0.05;
  const a = minLat - padLat, b = maxLat + padLat;
  const c = minLng - padLng, d = maxLng + padLng;
  const project = (lat: number, lng: number) => ({
    x: ((lng - c) / (d - c)) * w,
    y: h - ((lat - a) / (b - a)) * h,
  });
  return (
    <View style={{ width: w, height: h, backgroundColor: "#0B0B0B", borderWidth: 0.5, borderColor: TOKENS.RULE }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {Array.from({ length: 24 }).map((_, i) => (
          <Rect key={`v${i}`} x={(w / 24) * i} y={0} width={0.25} height={h} fill="#1A1A1A" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <Rect key={`h${i}`} x={0} y={(h / 12) * i} width={w} height={0.25} fill="#1A1A1A" />
        ))}
        {pts.map((p, i) => {
          const { x, y } = project(p.lat, p.lng);
          return (
            <G key={p.id ?? i}>
              <Circle cx={x} cy={y} r={9} fill={amber} fillOpacity={0.10} />
              <Circle cx={x} cy={y} r={4} fill={amber} fillOpacity={0.35} />
              <Circle cx={x} cy={y} r={2} fill={amber} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// Card de ponto: foto full + tarja preta (código âmbar + descrição)
function PontoCard({ p, amber, w, h }: { p: MidiaKitPonto; amber: string; w: number; h: number }) {
  const photoH = h - 56;
  const sentido = p.endereco || "";
  return (
    <View style={{ width: w, height: h, backgroundColor: "#000" }} wrap={false}>
      <PhotoOrPlaceholder src={p.foto} w={w} h={photoH} amber={amber} />
      <View style={{ width: w, height: 56, backgroundColor: "#0A0A0A", padding: 9, justifyContent: "center" }}>
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5, color: amber, letterSpacing: 0.4 }}>
          PONTO {(p.codigo || "—").toUpperCase()}
        </Text>
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: TOKENS.ICE, marginTop: 3 }}>
          {p.rodovia || ""}{p.cidade ? ` — ${p.cidade}` : ""}
        </Text>
        {sentido ? (
          <Text style={{ fontSize: 7.5, color: "#BDBDBA", marginTop: 2 }} >{sentido}</Text>
        ) : null}
      </View>
    </View>
  );
}

// Foto full-bleed com veladura de asfalto
function HeroBackdrop({ src }: { src?: string | null }) {
  return (
    <>
      {src ? (
        <Image src={src} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0A0A0A" }} />
      )}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: TOKENS.ASPHALT, opacity: 0.30 }} />
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "55%", backgroundColor: TOKENS.ASPHALT, opacity: 0.55 }} />
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "28%", backgroundColor: TOKENS.ASPHALT, opacity: 0.85 }} />
    </>
  );
}

// Mockup proporcional de painel
function PainelMockup({ w, h, amber, maxW, maxH }: { w: number; h: number; amber: string; maxW: number; maxH: number }) {
  const ratio = w / h;
  let dw = maxW;
  let dh = dw / ratio;
  if (dh > maxH) { dh = maxH; dw = dh * ratio; }
  const legW = dh * 0.55;
  return (
    <View style={{ width: maxW, alignItems: "center", justifyContent: "flex-end" }}>
      {/* Cota largura (topo) */}
      <View style={{ flexDirection: "row", alignItems: "center", width: dw, marginBottom: 4 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: TOKENS.GRAY }} />
        <Text style={{ fontSize: 7, color: TOKENS.GRAY, marginHorizontal: 4, fontFamily: "Helvetica-Bold" }}>{w} m</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: TOKENS.GRAY }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {/* Cota altura */}
        <View style={{ height: dh, alignItems: "center", justifyContent: "center", marginRight: 4 }}>
          <Text style={{ fontSize: 7, color: TOKENS.GRAY, fontFamily: "Helvetica-Bold" }}>{h} m</Text>
        </View>
        <View>
          {/* Painel */}
          <View style={{ width: dw, height: dh, backgroundColor: "#F4F4F2", borderWidth: 0.8, borderColor: "#E5E5E5" }} />
          {/* Pernas */}
          <View style={{ width: dw, height: legW, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: dw * 0.08 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={{ width: 2, height: legW, backgroundColor: "#3A3A3A" }} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ====================== DOCUMENT ======================
export function MidiaKitInstitucionalDoc({ data }: { data: MidiaKitData }) {
  const amber = data.branding.cor_primaria || TOKENS.AMBER_FALLBACK;
  const { branding, cobertura, pontos_catalogo, pontos_todos, capa_foto, cta_foto, qrcode_data_url, rodovias, dimensoes_top } = data;

  // Páginas por rodovia: 1 divisor + N grids (6/pg)
  const CARDS = 6;
  const rodoviasPages = rodovias.map(r => ({
    rodovia: r,
    grids: Math.max(1, Math.ceil(r.pontos.length / CARDS)),
  }));
  const totalRotaPages = rodoviasPages.reduce((sum, x) => sum + 1 + x.grids, 0);
  const totalPages = 1 /*capa*/ + 1 /*quem somos*/ + totalRotaPages + 1 /*tabela*/ + 1 /*formatos*/ + 1 /*contato*/;
  const T = (n: number) => String(n).padStart(2, "0");
  const tot = T(totalPages);
  let pn = 0;
  const next = () => { pn += 1; return T(pn); };

  const W = LAND_W - M * 2;

  return (
    <Document title="BJ7 Mídia — Mídia Kit 2026" author="BJ7 Mídia">

      {/* ============== CAPA ============== */}
      {(() => { pn = 1; return null; })()}
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={{ flex: 1, position: "relative" }}>
          <HeroBackdrop src={capa_foto} />

          {/* topo: logo + meta */}
          <View style={{ position: "absolute", top: M, left: M, right: M, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              {branding.logo_url ? (
                <Image src={branding.logo_url} style={{ width: 100, height: 32, objectFit: "contain" }} />
              ) : (
                <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: TOKENS.ICE, letterSpacing: 3 }}>BJ7 MÍDIA</Text>
              )}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[s.eyebrow, { color: amber }]}>N° 01 — Edição 2026</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 }}>
                <View style={{ width: 26, height: 1, backgroundColor: TOKENS.ICE }} />
                <Text style={[s.small, { color: TOKENS.ICE }]}>Catálogo institucional</Text>
              </View>
            </View>
          </View>

          {/* título grande, ancorado canto inferior esquerdo */}
          <View style={{ position: "absolute", left: M, right: M, bottom: M + 28 }}>
            <View style={{ width: 56, height: 2, backgroundColor: amber, marginBottom: 16 }} />
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 78, color: amber, letterSpacing: -1, lineHeight: 0.95 }}>
              BJ7 MÍDIA
            </Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 16, color: TOKENS.ICE, letterSpacing: 2, marginTop: 14 }}>
              PROPOSTA MÍDIA RODOVIÁRIA
            </Text>
            <Text style={[s.lede, { marginTop: 8, maxWidth: 480 }]}>
              {cobertura.total_pontos} pontos estratégicos · {cobertura.cidades.length} cidades · {cobertura.estados.length || 2} estados
            </Text>
          </View>

          <View style={{ position: "absolute", left: M, right: M, bottom: M, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[s.small, { color: TOKENS.ICE, letterSpacing: 2 }]}>{(branding.contato_oficial.site || "bj7.com.br").toUpperCase()}</Text>
            <Text style={[s.small, { color: TOKENS.ICE, letterSpacing: 2 }]}>MÍDIA EXTERIOR</Text>
          </View>
        </View>
      </Page>

      {/* ============== QUEM SOMOS + COBERTURA ============== */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <TopBar section="Quem somos" num={next()} total={tot} amber={amber} brand="BJ7 Mídia" />
        <View style={s.inner}>
          <View style={{ flexDirection: "row", gap: 28 }}>
            <View style={{ flex: 1.4 }}>
              <Text style={[s.eyebrow, { color: amber }]}>01 — Posicionamento</Text>
              <Text style={[s.h1, { marginTop: 10 }]}>Onde a marca{"\n"}vira impacto.</Text>
              <View style={{ width: 38, height: 2, backgroundColor: amber, marginTop: 14, marginBottom: 14 }} />
              <Text style={s.lede}>
                {branding.texto_institucional ||
                  "A BJ7 opera mídia exterior estratégica no Litoral do Paraná e Santa Catarina, conectando marcas ao alto fluxo das rotas turísticas e corredores logísticos da região."}
              </Text>
              <Text style={[s.body, { marginTop: 12 }]}>
                Operação própria, atendimento consultivo e comprovação documentada — cada flight entregue com relatório fotográfico de instalação e manutenção.
              </Text>
            </View>
            <View style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: TOKENS.RULE, paddingLeft: 22 }}>
              <Text style={[s.eyebrow]}>Diferenciais</Text>
              {[
                "Infraestrutura própria",
                "Inventário curado por fluxo",
                "Atendimento consultivo",
                "Comprovação por flight",
              ].map((it, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 12 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: amber, fontSize: 9, width: 22 }}>{T(i + 1)}</Text>
                  <Text style={{ flex: 1, fontFamily: "Helvetica-Bold", fontSize: 10.5, color: TOKENS.ICE }}>{it}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 0.5, backgroundColor: TOKENS.RULE, marginTop: 22, marginBottom: 18 }} />

          <View style={{ flexDirection: "row", gap: 24 }}>
            <Stat amber={amber} value={cobertura.total_pontos} label="Pontos ativos" />
            <Stat amber={amber} value={cobertura.cidades.length} label="Cidades atendidas" />
            <Stat amber={amber} value={cobertura.estados.length || 2} label="Estados" />
            <Stat amber={amber} value={cobertura.formatos_distintos} label="Formatos" />
          </View>

          <View style={{ marginTop: 18, flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <Text style={[s.eyebrow, { color: TOKENS.ICE }]}>Mapa de cobertura</Text>
              <Text style={s.small}>Pontos próprios · escala aproximada</Text>
            </View>
            <CoverageMap pontos={pontos_todos} amber={amber} w={W} h={150} />
          </View>
        </View>
        <BottomBar left="Mídia Kit · Edição 2026" right={branding.contato_oficial.site || "bj7.com.br"} amber={amber} />
      </Page>

      {/* ============== POR RODOVIA: DIVISOR + GRID(S) ============== */}
      {rodoviasPages.map(({ rodovia: r, grids }, ri) => {
        const cardW = (W - 20) / 3;
        const cardH = 200;
        return (
          <>
            {/* Divisor da rodovia */}
            <Page key={`div-${ri}`} size="A4" orientation="landscape" style={s.page}>
              <View style={{ flex: 1, position: "relative" }}>
                <HeroBackdrop src={r.capa || capa_foto} />
                <View style={{ position: "absolute", top: M, left: M, right: M, flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={[s.eyebrow, { color: TOKENS.ICE }]}>BJ7 MÍDIA · RODOVIA</Text>
                  <Text style={[s.eyebrow]}>{next()} / {tot}</Text>
                </View>
                <View style={{ position: "absolute", left: M, right: M, bottom: M + 24 }}>
                  <Text style={[s.eyebrow, { color: amber }]}>RODOVIA</Text>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 120, color: amber, letterSpacing: -2, lineHeight: 0.92, marginTop: 8 }}>
                    {(r.rodovia || "—").toUpperCase()}
                  </Text>
                  {r.sentido ? (
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 18, color: TOKENS.ICE, marginTop: 14, letterSpacing: 0.3 }}>
                      {r.sentido}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 }}>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: amber }}>
                      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, color: "#111" }}>{r.pontos.length} {r.pontos.length === 1 ? "ponto" : "pontos"}</Text>
                    </View>
                    <Text style={[s.small, { color: TOKENS.ICE }]}>Rede estratégica de mídia exterior</Text>
                  </View>
                </View>
              </View>
            </Page>

            {/* Grid(s) com cards */}
            {Array.from({ length: grids }).map((_, gi) => {
              const slice = r.pontos.slice(gi * CARDS, gi * CARDS + CARDS);
              return (
                <Page key={`grid-${ri}-${gi}`} size="A4" orientation="landscape" style={s.page}>
                  <TopBar section={`${r.rodovia} · catálogo`} num={next()} total={tot} amber={amber} brand="BJ7 Mídia" />
                  <View style={s.inner}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
                      <View>
                        <Text style={[s.eyebrow, { color: amber }]}>ROTA</Text>
                        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 24, color: TOKENS.ICE, marginTop: 4, letterSpacing: -0.2 }}>
                          {r.rodovia} {r.sentido ? <Text style={{ color: TOKENS.GRAY, fontSize: 14 }}>· {r.sentido}</Text> : null}
                        </Text>
                      </View>
                      <Text style={[s.small, { color: TOKENS.GRAY }]}>
                        {gi * CARDS + 1}–{gi * CARDS + slice.length} de {r.pontos.length}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                      {slice.map(p => (
                        <PontoCard key={p.id} p={p} amber={amber} w={cardW} h={cardH} />
                      ))}
                    </View>
                  </View>
                  <BottomBar left={`${r.rodovia}${r.sentido ? " | " + r.sentido : ""}`} right="BJ7 MÍDIA" amber={amber} />
                </Page>
              );
            })}
          </>
        );
      })}

      {/* ============== TABELA DE COORDENADAS ============== */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <TopBar section="Coordenadas" num={next()} total={tot} amber={amber} brand="BJ7 Mídia" />
        <View style={s.inner}>
          <Text style={[s.eyebrow, { color: amber }]}>Inventário georreferenciado</Text>
          <Text style={[s.h1, { marginTop: 8, fontSize: 26 }]}>Localização de cada ponto.</Text>
          <View style={{ width: 38, height: 2, backgroundColor: amber, marginTop: 12, marginBottom: 16 }} />

          {/* header */}
          <View style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: amber }}>
            <Text style={[s.eyebrow, { color: amber, width: "14%" }]}>RODOVIA</Text>
            <Text style={[s.eyebrow, { color: amber, width: "36%" }]}>LOCALIZAÇÃO</Text>
            <Text style={[s.eyebrow, { color: amber, width: "26%" }]}>SENTIDO</Text>
            <Text style={[s.eyebrow, { color: amber, width: "24%" }]}>COORDENADAS</Text>
          </View>
          {[...pontos_todos]
            .sort((a, b) => (a.rodovia || "").localeCompare(b.rodovia || ""))
            .slice(0, 22)
            .map((p, i) => (
              <View key={p.id} style={{ flexDirection: "row", paddingVertical: 7, backgroundColor: i % 2 === 0 ? "transparent" : "#181818" }}>
                <Text style={{ width: "14%", fontFamily: "Helvetica-Bold", fontSize: 9, color: TOKENS.ICE }}>{p.rodovia || "—"}</Text>
                <Text style={{ width: "36%", fontSize: 9, color: TOKENS.ICE }}>{p.cidade}{p.endereco ? ` · ${p.endereco}` : ""}</Text>
                <Text style={{ width: "26%", fontSize: 9, color: "#BDBDBA" }}>{(p as any).sentido || "—"}</Text>
                <Text style={{ width: "24%", fontFamily: "Courier", fontSize: 8.5, color: TOKENS.GRAY }}>
                  {typeof p.lat === "number" && typeof p.lng === "number"
                    ? `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`
                    : "—"}
                </Text>
              </View>
            ))}
          {pontos_todos.length > 22 && (
            <Text style={[s.small, { marginTop: 10, color: TOKENS.GRAY }]}>
              + {pontos_todos.length - 22} pontos adicionais disponíveis sob consulta.
            </Text>
          )}
        </View>
        <BottomBar left="Coordenadas · WGS84" right="BJ7 MÍDIA" amber={amber} />
      </Page>

      {/* ============== FORMATOS DE MÍDIA ============== */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <TopBar section="Formatos" num={next()} total={tot} amber={amber} brand="BJ7 Mídia" />
        <View style={s.inner}>
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <Text style={[s.eyebrow, { color: amber }]}>BJ7 MÍDIA</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 32, color: TOKENS.ICE, marginTop: 6, letterSpacing: -0.3 }}>FORMATOS DE MÍDIA</Text>
            <Text style={[s.small, { marginTop: 6, color: TOKENS.GRAY }]}>
              Formatos disponíveis para campanhas na rede BJ7
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", marginTop: 18, flex: 1 }}>
            {(dimensoes_top.length ? dimensoes_top : [{ w: 9, h: 3, area: 27, label: "3m x 9m", faixa: "padrao" as const }]).map((d, i) => {
              const bullets = d.faixa === "padrao"
                ? ["Formato padrão rodoviário", "Alta frequência visual", "Ideal para institucional e varejo"]
                : d.faixa === "impacto"
                ? ["Formato ampliado de grande impacto", "Excelente leitura a longa distância", "Lançamentos imobiliários e marcas nacionais"]
                : ["Painel gigante de alto impacto", "Máxima visibilidade em rodovias", "Ideal para campanhas de grande alcance"];
              return (
                <View key={i} style={{ flex: 1, alignItems: "center", paddingHorizontal: 10 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#1F1F1F", marginBottom: 14 }}>
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10, color: amber, letterSpacing: 2 }}>MODELO {i + 1}</Text>
                  </View>
                  <PainelMockup w={d.w} h={d.h} amber={amber} maxW={210} maxH={120} />
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 14, color: amber, marginTop: 16, letterSpacing: 0.5 }}>{d.label}</Text>
                  <View style={{ marginTop: 12, alignItems: "flex-start", alignSelf: "stretch", paddingHorizontal: 4 }}>
                    {bullets.map((b, j) => (
                      <View key={j} style={{ flexDirection: "row", marginBottom: 4 }}>
                        <Text style={{ color: amber, fontSize: 9, marginRight: 6 }}>•</Text>
                        <Text style={{ fontSize: 8.5, color: TOKENS.ICE, flex: 1, lineHeight: 1.4 }}>{b}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ marginTop: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: amber }}>
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, color: "#111" }}>Área: {d.area} m²</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <BottomBar left="Formatos de mídia" right="BJ7 MÍDIA" amber={amber} />
      </Page>

      {/* ============== CONTATO ============== */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {/* foto fechamento esquerda */}
          <View style={{ width: "45%", height: "100%", position: "relative" }}>
            <HeroBackdrop src={cta_foto || capa_foto} />
          </View>
          {/* direita: contato */}
          <View style={{ flex: 1, padding: M, justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[s.eyebrow, { color: amber }]}>ENTRE EM CONTATO</Text>
              <Text style={[s.eyebrow]}>{next()} / {tot}</Text>
            </View>
            <View>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 36, color: TOKENS.ICE, letterSpacing: -0.3, lineHeight: 1.05 }}>
                Vamos colocar{"\n"}sua marca na rota.
              </Text>
              <View style={{ width: 56, height: 2, backgroundColor: amber, marginTop: 18, marginBottom: 18 }} />
              <Text style={s.lede}>
                Solicite uma proposta personalizada para sua campanha no Litoral do Paraná.
              </Text>

              <View style={{ marginTop: 24 }}>
                {branding.contato_oficial.whatsapp || branding.contato_oficial.telefone ? (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={[s.eyebrow]}>WhatsApp / Telefone</Text>
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: TOKENS.ICE, marginTop: 4 }}>
                      {branding.contato_oficial.whatsapp || branding.contato_oficial.telefone}
                    </Text>
                  </View>
                ) : null}
                <View style={{ marginBottom: 14 }}>
                  <Text style={[s.eyebrow]}>Site</Text>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 16, color: amber, marginTop: 4 }}>
                    {branding.contato_oficial.site || "bj7.com.br"}
                  </Text>
                </View>
                <View>
                  <Text style={[s.eyebrow]}>Cobertura</Text>
                  <Text style={{ fontSize: 11, color: TOKENS.ICE, marginTop: 4 }}>
                    Litoral do Paraná · {cobertura.cidades.length} cidades · {cobertura.total_pontos} pontos
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View>
                <Text style={[s.small, { letterSpacing: 1.4, textTransform: "uppercase" }]}>© 2026 BJ7 Mídia</Text>
                <Text style={[s.small, { marginTop: 2 }]}>Todos os direitos reservados</Text>
              </View>
              {qrcode_data_url ? (
                <View style={{ alignItems: "center" }}>
                  <Image src={qrcode_data_url} style={{ width: 70, height: 70 }} />
                  <Text style={[s.small, { marginTop: 4 }]}>Acesse online</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Page>

    </Document>
  );
}
