import { Document, Page, Text, View, Image, StyleSheet, Svg, Rect, Circle, G, Line } from "@react-pdf/renderer";
import { TOKENS, MARGIN, PAGE_W, PAGE_H } from "./tokens";
import { ensureFonts } from "./fonts";

ensureFonts();

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
}

// ====================== STYLES ======================
const s = StyleSheet.create({
  page: { backgroundColor: TOKENS.ASPHALT, color: TOKENS.ICE, fontFamily: "Helvetica", fontSize: 9.5 },
  inner: { flex: 1, paddingTop: MARGIN + 18, paddingBottom: MARGIN + 24, paddingHorizontal: MARGIN, position: "relative" },

  eyebrow: { fontSize: 7.5, letterSpacing: 2.4, textTransform: "uppercase", fontFamily: "Helvetica-Bold", fontWeight: 700, color: TOKENS.GRAY },
  h1: { fontFamily: "Helvetica-Bold", fontWeight: 900, fontSize: 34, letterSpacing: -0.2, lineHeight: 1.04, color: TOKENS.ICE },
  h2: { fontFamily: "Helvetica-Bold", fontWeight: 700, fontSize: 18, letterSpacing: 0.2, lineHeight: 1.15, color: TOKENS.ICE },
  lede: { fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.5, color: TOKENS.ICE },
  body: { fontFamily: "Helvetica", fontSize: 9.5, lineHeight: 1.55, color: "#BDBDBA" },
  small: { fontSize: 7.5, color: TOKENS.GRAY, lineHeight: 1.45, letterSpacing: 0.2 },
  caption: { fontSize: 7, color: TOKENS.DIM, letterSpacing: 1.6, textTransform: "uppercase" },

  divider: { height: 0.5, backgroundColor: TOKENS.RULE, marginVertical: 10 },
});

// ====================== ATOMS ======================
function TopBar({ section, num, total, amber, brand }: { section: string; num: string; total: string; amber: string; brand: string }) {
  return (
    <View fixed style={{ position: "absolute", top: MARGIN - 8, left: MARGIN, right: MARGIN, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 14, height: 2, backgroundColor: amber }} />
        <Text style={[s.eyebrow, { color: TOKENS.ICE }]}>{brand}</Text>
        <Text style={[s.eyebrow, { color: TOKENS.DIM }]}>·</Text>
        <Text style={[s.eyebrow, { color: TOKENS.GRAY }]}>{section}</Text>
      </View>
      <Text style={[s.eyebrow, { color: TOKENS.GRAY }]}>
        <Text style={{ color: TOKENS.ICE }}>{num}</Text> / {total}
      </Text>
    </View>
  );
}

function BottomBar({ branding, amber }: { branding: MidiaKitData["branding"]; amber: string }) {
  const c = branding.contato_oficial;
  return (
    <View fixed style={{ position: "absolute", bottom: MARGIN - 14, left: MARGIN, right: MARGIN, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 0.5, borderTopColor: TOKENS.RULE }}>
      <Text style={[s.small, { letterSpacing: 1.4, textTransform: "uppercase" }]}>Mídia Kit · Edição 2026</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={[s.small, { color: TOKENS.ICE }]}>{c.site || "bj7.com.br"}</Text>
        {(c.whatsapp || c.telefone) && (
          <>
            <View style={{ width: 2, height: 2, backgroundColor: amber, borderRadius: 1 }} />
            <Text style={s.small}>{c.whatsapp || c.telefone}</Text>
          </>
        )}
      </View>
    </View>
  );
}

function Stat({ amber, value, label, suffix }: { amber: string; value: string | number; label: string; suffix?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text style={{ fontFamily: "Helvetica-Bold", fontWeight: 900, fontSize: 38, color: TOKENS.ICE, lineHeight: 1 }}>{value}</Text>
        {suffix && <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 14, color: amber, marginLeft: 2 }}>{suffix}</Text>}
      </View>
      <View style={{ width: 18, height: 2, backgroundColor: amber, marginTop: 8, marginBottom: 6 }} />
      <Text style={[s.eyebrow, { color: TOKENS.GRAY }]}>{label}</Text>
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
  const padLat = (maxLat - minLat) * 0.18 || 0.05;
  const padLng = (maxLng - minLng) * 0.18 || 0.05;
  const a = minLat - padLat, b = maxLat + padLat;
  const c = minLng - padLng, d = maxLng + padLng;
  const project = (lat: number, lng: number) => ({
    x: ((lng - c) / (d - c)) * w,
    y: h - ((lat - a) / (b - a)) * h,
  });
  return (
    <View style={{ width: w, height: h, backgroundColor: "#0B0B0B", borderWidth: 0.5, borderColor: TOKENS.RULE }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Rect key={`v${i}`} x={(w / 16) * i} y={0} width={0.3} height={h} fill="#1F1F1F" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <Rect key={`h${i}`} x={0} y={(h / 10) * i} width={w} height={0.3} fill="#1F1F1F" />
        ))}
        {pts.map((p, i) => {
          const { x, y } = project(p.lat, p.lng);
          return (
            <G key={p.id ?? i}>
              <Circle cx={x} cy={y} r={8} fill={amber} fillOpacity={0.12} />
              <Circle cx={x} cy={y} r={3.6} fill={amber} fillOpacity={0.35} />
              <Circle cx={x} cy={y} r={1.8} fill={amber} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function PontoCard({ p, amber }: { p: MidiaKitPonto; amber: string }) {
  return (
    <View style={{ width: "48.5%", marginBottom: 14, backgroundColor: TOKENS.CARD, borderWidth: 0.5, borderColor: TOKENS.RULE }} wrap={false}>
      <View style={{ width: "100%", height: 118, backgroundColor: "#0B0B0B", position: "relative" }}>
        {p.foto ? (
          <Image src={p.foto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontFamily: "Helvetica-Bold", color: "#1F1F1F", letterSpacing: 4 }}>BJ7</Text>
          </View>
        )}
        <View style={{ position: "absolute", top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: TOKENS.ASPHALT }}>
          <Text style={[s.eyebrow, { color: amber, fontSize: 6.5, letterSpacing: 1.8 }]}>#{p.codigo}</Text>
        </View>
      </View>
      <View style={{ padding: 11 }}>
        <Text style={[s.caption, { color: amber }]}>{p.formato_label}</Text>
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, color: TOKENS.ICE, marginTop: 4, lineHeight: 1.15 }}>
          {p.cidade}{p.estado ? ` · ${p.estado}` : ""}
        </Text>
        <Text style={[s.small, { color: TOKENS.GRAY, marginTop: 2 }]} >{p.rodovia}</Text>
        {p.endereco ? (
          <Text style={[s.small, { marginTop: 4, color: TOKENS.DIM }]} numberOfLines={1}>{p.endereco}</Text>
        ) : null}
        <View style={{ height: 0.5, backgroundColor: TOKENS.RULE, marginVertical: 8 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={[s.caption, { color: TOKENS.DIM, fontSize: 6 }]}>Dimensão</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: TOKENS.ICE, marginTop: 2 }}>{p.dimensao}</Text>
          </View>
          <View>
            <Text style={[s.caption, { color: TOKENS.DIM, fontSize: 6 }]}>Iluminação</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: TOKENS.ICE, marginTop: 2, textAlign: "right" }}>
              {p.iluminacao === "sim" || p.iluminacao === "led" ? "LED" : p.iluminacao === "nao" ? "—" : (p.iluminacao || "—").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ====================== DOCUMENT ======================
export function MidiaKitInstitucionalDoc({ data }: { data: MidiaKitData }) {
  const amber = data.branding.cor_primaria || TOKENS.AMBER_FALLBACK;
  const { branding, cobertura, pontos_catalogo, pontos_todos, capa_foto, cta_foto, qrcode_data_url } = data;
  const hasFluxo = pontos_todos.some(p => (p.fluxo ?? 0) > 0 || (p.impacto ?? 0) > 0);

  const cardsPerPage = 6; // 2 col x 3 rows
  const catalogChunks: MidiaKitPonto[][] = [];
  for (let i = 0; i < pontos_catalogo.length; i += cardsPerPage) {
    catalogChunks.push(pontos_catalogo.slice(i, i + cardsPerPage));
  }

  const totalPages = 1 + 1 + (hasFluxo ? 1 : 0) + catalogChunks.length + 1 + 1;
  let pageNum = 0;
  const T = (n: number) => String(n).padStart(2, "0");
  const tot = T(totalPages);

  return (
    <Document title="BJ7 Painéis — Mídia Kit 2026" author="BJ7 Painéis">

      {/* ============== CAPA ============== */}
      <Page size="A4" style={s.page}>
        <View style={{ flex: 1, position: "relative" }}>
          {capa_foto ? (
            <Image src={capa_foto} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#0A0A0A" }} />
          )}
          {/* veladura escurecendo todo o frame com gradiente em camadas */}
          <View style={{ position: "absolute", inset: 0, backgroundColor: TOKENS.ASPHALT, opacity: 0.35 }} />
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "55%", backgroundColor: TOKENS.ASPHALT, opacity: 0.55 }} />
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "30%", backgroundColor: TOKENS.ASPHALT, opacity: 0.85 }} />

          {/* topo: logo + meta */}
          <View style={{ position: "absolute", top: MARGIN, left: MARGIN, right: MARGIN, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              {branding.logo_url ? (
                <Image src={branding.logo_url} style={{ width: 92, height: 32, objectFit: "contain" }} />
              ) : (
                <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: TOKENS.ICE, letterSpacing: 3 }}>BJ7 PAINÉIS</Text>
              )}
              <Text style={[s.small, { marginTop: 6, color: TOKENS.ICE, letterSpacing: 1.4 }]}>Out-of-home · PR · SC</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[s.eyebrow, { color: amber }]}>N°  01 — Edição 2026</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 }}>
                <View style={{ width: 26, height: 1, backgroundColor: TOKENS.ICE }} />
                <Text style={[s.small, { color: TOKENS.ICE }]}>Catálogo institucional</Text>
              </View>
            </View>
          </View>

          {/* título ancorado embaixo */}
          <View style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN + 50 }}>
            <View style={{ width: 38, height: 2, backgroundColor: amber, marginBottom: 18 }} />
            <Text style={[s.eyebrow, { color: amber }]}>Mídia exterior estratégica</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontWeight: 900, fontSize: 52, color: TOKENS.ICE, lineHeight: 0.98, letterSpacing: -0.5, marginTop: 14 }}>
              Mídia Kit
            </Text>
            <Text style={{ fontFamily: "Helvetica", fontSize: 52, color: amber, lineHeight: 0.98, letterSpacing: -0.5, marginTop: -2 }}>
              2026.
            </Text>
            <Text style={[s.lede, { maxWidth: 340, marginTop: 22, color: TOKENS.ICE }]}>
              {cobertura.total_pontos} pontos próprios em corredores de alto fluxo do Litoral do Paraná e Santa Catarina.
            </Text>
          </View>

          {/* rodapé editorial */}
          <View style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[s.small, { color: TOKENS.ICE, letterSpacing: 2, textTransform: "uppercase" }]}>{branding.contato_oficial.site || "bj7.com.br"}</Text>
            <Text style={[s.small, { color: TOKENS.ICE, letterSpacing: 2 }]}>{cobertura.cidades.length} cidades · {cobertura.estados.length || 2} estados</Text>
          </View>
        </View>
      </Page>

      {/* ============== QUEM SOMOS + COBERTURA ============== */}
      {(() => { pageNum = 2; return null; })()}
      <Page size="A4" style={s.page}>
        <TopBar section="Quem somos" num={T(pageNum)} total={tot} amber={amber} brand="BJ7 Painéis" />
        <View style={s.inner}>
          <View style={{ flexDirection: "row", gap: 28 }}>
            <View style={{ flex: 1.35 }}>
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
              <Text style={[s.eyebrow, { color: TOKENS.GRAY }]}>Diferenciais</Text>
              {[
                "Infraestrutura própria",
                "Inventário curado por fluxo",
                "Atendimento consultivo",
                "Comprovação por flight",
              ].map((it, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 14 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: amber, fontSize: 9, width: 22 }}>{T(i + 1)}</Text>
                  <Text style={{ flex: 1, fontFamily: "Helvetica-Bold", fontSize: 11, color: TOKENS.ICE, letterSpacing: 0.2 }}>{it}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 0.5, backgroundColor: TOKENS.RULE, marginTop: 30, marginBottom: 22 }} />

          <View style={{ flexDirection: "row", gap: 24 }}>
            <Stat amber={amber} value={cobertura.total_pontos} label="Pontos ativos" />
            <Stat amber={amber} value={cobertura.cidades.length} label="Cidades atendidas" />
            <Stat amber={amber} value={cobertura.estados.length || 2} label="Estados" />
            <Stat amber={amber} value={cobertura.formatos_distintos} label="Formatos" />
          </View>

          <View style={{ marginTop: 26 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <Text style={[s.eyebrow, { color: TOKENS.ICE }]}>Mapa de cobertura</Text>
              <Text style={s.small}>Pontos próprios · escala aproximada</Text>
            </View>
            <CoverageMap pontos={pontos_todos} amber={amber} w={PAGE_W - MARGIN * 2} h={210} />
            <Text style={[s.small, { marginTop: 8, color: TOKENS.GRAY }]}>
              {cobertura.cidades.slice(0, 14).join("  ·  ")}{cobertura.cidades.length > 14 ? "  ·  …" : ""}
            </Text>
          </View>
        </View>
        <BottomBar branding={branding} amber={amber} />
      </Page>

      {/* ============== FLUXO (cond.) ============== */}
      {hasFluxo && (() => { pageNum += 1; return (
        <Page size="A4" style={s.page}>
          <TopBar section="Fluxo & impacto" num={T(pageNum)} total={tot} amber={amber} brand="BJ7 Painéis" />
          <View style={s.inner}>
            <Text style={[s.eyebrow, { color: amber }]}>02 — Tráfego</Text>
            <Text style={[s.h1, { marginTop: 10 }]}>Tráfego que sua marca alcança.</Text>
            <View style={{ width: 38, height: 2, backgroundColor: amber, marginTop: 14, marginBottom: 18 }} />
            <View>
              {Object.entries(
                pontos_todos.reduce((acc, p) => {
                  const k = p.cidade || "—";
                  if (!acc[k]) acc[k] = { fluxo: 0, impacto: 0, count: 0 };
                  acc[k].fluxo += p.fluxo ?? 0;
                  acc[k].impacto += p.impacto ?? 0;
                  acc[k].count++;
                  return acc;
                }, {} as Record<string, { fluxo: number; impacto: number; count: number }>)
              )
                .filter(([, v]) => v.fluxo > 0 || v.impacto > 0)
                .sort(([, a], [, b]) => (b.fluxo + b.impacto) - (a.fluxo + a.impacto))
                .slice(0, 7)
                .map(([cidade, v]) => (
                  <View key={cidade} style={{ flexDirection: "row", alignItems: "baseline", paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: TOKENS.RULE }}>
                    <Text style={[s.h2, { width: 180 }]}>{cidade}</Text>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: amber }}>{Math.round(v.fluxo).toLocaleString("pt-BR")}</Text>
                        <Text style={[s.caption, { color: TOKENS.GRAY, marginTop: 3 }]}>Veículos/dia</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: TOKENS.ICE }}>{Math.round(v.impacto).toLocaleString("pt-BR")}</Text>
                        <Text style={[s.caption, { color: TOKENS.GRAY, marginTop: 3 }]}>Impactos/dia</Text>
                      </View>
                      <View style={{ width: 50, alignItems: "flex-end" }}>
                        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: TOKENS.ICE }}>{v.count}</Text>
                        <Text style={[s.caption, { color: TOKENS.GRAY, marginTop: 3 }]}>Pontos</Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </View>
          <BottomBar branding={branding} amber={amber} />
        </Page>
      ); })()}

      {/* ============== CATÁLOGO ============== */}
      {catalogChunks.map((chunk, idx) => { pageNum += 1; const myNum = T(pageNum); return (
        <Page key={`cat-${idx}`} size="A4" style={s.page}>
          <TopBar section={`Catálogo · ${idx + 1}/${catalogChunks.length}`} num={myNum} total={tot} amber={amber} brand="BJ7 Painéis" />
          <View style={s.inner}>
            {idx === 0 && (
              <View style={{ marginBottom: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.eyebrow, { color: amber }]}>{hasFluxo ? "03" : "02"} — Inventário</Text>
                  <Text style={[s.h1, { marginTop: 8, fontSize: 30 }]}>Pontos selecionados.</Text>
                  <View style={{ width: 38, height: 2, backgroundColor: amber, marginTop: 12 }} />
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 28, color: TOKENS.ICE }}>{pontos_catalogo.length}</Text>
                  <Text style={[s.caption, { color: TOKENS.GRAY }]}>{pontos_catalogo.length === 1 ? "Ponto" : "Pontos"} nesta proposta</Text>
                </View>
              </View>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {chunk.map((p) => (
                <PontoCard key={p.id} p={p} amber={amber} />
              ))}
            </View>
          </View>
          <BottomBar branding={branding} amber={amber} />
        </Page>
      ); })}

      {/* ============== POR QUE BJ7 ============== */}
      {(() => { pageNum += 1; return null; })()}
      <Page size="A4" style={s.page}>
        <TopBar section="Por que BJ7" num={T(pageNum)} total={tot} amber={amber} brand="BJ7 Painéis" />
        <View style={s.inner}>
          <View style={{ flexDirection: "row", gap: 28 }}>
            <View style={{ flex: 1.4 }}>
              <Text style={[s.eyebrow, { color: amber }]}>04 — Operação</Text>
              <Text style={[s.h1, { marginTop: 10 }]}>O que muda quando{"\n"}a operação é nossa.</Text>
              <View style={{ width: 38, height: 2, backgroundColor: amber, marginTop: 14, marginBottom: 6 }} />
              {[
                { t: "Infraestrutura própria", d: "Manutenção, iluminação e instalação geridas diretamente — nada terceirizado." },
                { t: "Pontos escolhidos a dedo", d: "Selecionados por fluxo real e contexto regional, não por inventário pulverizado." },
                { t: "Atendimento consultivo", d: "Cada campanha recebe plano com argumento de praça, não só tabela de preço." },
                { t: "Comprovação documentada", d: "Foto de instalação e relatório de manutenção entregues junto com o flight." },
              ].map((d, i) => (
                <View key={i} style={{ marginTop: 18, flexDirection: "row" }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, color: amber, width: 26, marginTop: 2 }}>{T(i + 1)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, color: TOKENS.ICE, letterSpacing: 0.2 }}>{d.t}</Text>
                    <Text style={[s.body, { marginTop: 4 }]}>{d.d}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              {cta_foto || capa_foto ? (
                <View style={{ width: "100%", height: 360, overflow: "hidden" }}>
                  <Image src={(cta_foto || capa_foto)!} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </View>
              ) : (
                <View style={{ width: "100%", height: 360, backgroundColor: "#0B0B0B", borderWidth: 0.5, borderColor: TOKENS.RULE }} />
              )}
              <Text style={[s.caption, { color: TOKENS.GRAY, marginTop: 8 }]}>Foto · operação documentada</Text>
              <View style={{ marginTop: 18, padding: 14, backgroundColor: TOKENS.CARD, borderLeftWidth: 2, borderLeftColor: amber }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, color: TOKENS.ICE, lineHeight: 1.4 }}>
                  "Operamos no Litoral PR/SC há anos. Cada ponto desse catálogo a gente conhece pelo nome."
                </Text>
                <Text style={[s.caption, { color: TOKENS.GRAY, marginTop: 8 }]}>Equipe BJ7</Text>
              </View>
            </View>
          </View>
        </View>
        <BottomBar branding={branding} amber={amber} />
      </Page>

      {/* ============== CTA / CONTATO ============== */}
      {(() => { pageNum += 1; return null; })()}
      <Page size="A4" style={s.page}>
        <View style={{ flex: 1, position: "relative" }}>
          {cta_foto ? (
            <Image src={cta_foto} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : capa_foto ? (
            <Image src={capa_foto} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}
          <View style={{ position: "absolute", inset: 0, backgroundColor: TOKENS.ASPHALT, opacity: 0.78 }} />

          <View style={{ position: "absolute", top: MARGIN, left: MARGIN, right: MARGIN, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[s.eyebrow, { color: amber }]}>05 — Próximo passo</Text>
            <Text style={[s.eyebrow, { color: TOKENS.GRAY }]}><Text style={{ color: TOKENS.ICE }}>{T(pageNum)}</Text> / {tot}</Text>
          </View>

          <View style={{ position: "absolute", left: MARGIN, right: MARGIN, top: PAGE_H * 0.28 }}>
            <View style={{ width: 38, height: 2, backgroundColor: amber, marginBottom: 18 }} />
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 42, color: TOKENS.ICE, lineHeight: 1.05, letterSpacing: -0.3 }}>
              Quer ver os pontos{"\n"}<Text style={{ color: amber }}>certos</Text> pra sua marca?
            </Text>
            <Text style={[s.lede, { marginTop: 18, maxWidth: 380 }]}>
              Mande sua praça de interesse e a gente devolve com plano, foto real de cada ponto e proposta comercial em 24h.
            </Text>
          </View>

          <View style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN + 24, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              {branding.contato_oficial.whatsapp || branding.contato_oficial.telefone ? (
                <>
                  <Text style={[s.eyebrow, { color: TOKENS.GRAY }]}>{branding.contato_oficial.whatsapp ? "WhatsApp" : "Telefone"}</Text>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, color: TOKENS.ICE, marginTop: 4 }}>
                    {branding.contato_oficial.whatsapp || branding.contato_oficial.telefone}
                  </Text>
                </>
              ) : null}
              <Text style={[s.small, { marginTop: 10, color: TOKENS.ICE, letterSpacing: 1.6, textTransform: "uppercase" }]}>
                {branding.contato_oficial.site || "bj7.com.br"}
              </Text>
            </View>
            {qrcode_data_url ? (
              <View style={{ alignItems: "center" }}>
                <View style={{ padding: 6, backgroundColor: TOKENS.ICE }}>
                  <Image src={qrcode_data_url} style={{ width: 76, height: 76 }} />
                </View>
                <Text style={[s.caption, { color: TOKENS.GRAY, marginTop: 6 }]}>Aponte · acesse o site</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}