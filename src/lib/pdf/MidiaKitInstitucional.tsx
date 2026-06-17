import { Document, Page, Text, View, Image, StyleSheet, Svg, Rect, Circle, G } from "@react-pdf/renderer";
import { TOKENS, MARGIN, PAGE_W, PAGE_H } from "./tokens";
import { RoadStripe } from "./components/RoadStripe";
import { AsphaltPlaceholder } from "./components/AsphaltPlaceholder";
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
  pontos_catalogo: MidiaKitPonto[]; // selecionados pro catálogo
  pontos_todos: MidiaKitPonto[]; // sempre todos (mapa cobertura)
  capa_foto?: string | null;
  cta_foto?: string | null;
  qrcode_data_url?: string | null;
}

const styles = StyleSheet.create({
  page: { backgroundColor: TOKENS.ASPHALT, color: TOKENS.ICE, fontFamily: "Barlow", fontSize: 11 },
  pageInner: { flex: 1, padding: MARGIN, position: "relative" },

  eyebrow: { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Barlow", fontWeight: 500 },
  h1: { fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: 56, letterSpacing: 1, lineHeight: 1, color: TOKENS.ICE },
  h2: { fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 30, letterSpacing: 0.5, lineHeight: 1.05, color: TOKENS.ICE, textTransform: "uppercase" },
  display: { fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: 68, lineHeight: 1 },
  body: { fontFamily: "Barlow", fontSize: 11, lineHeight: 1.55, color: TOKENS.ICE },
  small: { fontSize: 9, color: TOKENS.GRAY, lineHeight: 1.4 },
  rule: { height: 3, marginTop: 10, marginBottom: 14 },

  pageNum: { position: "absolute", top: MARGIN, right: MARGIN, fontSize: 9, color: TOKENS.GRAY, letterSpacing: 2 },

  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: MARGIN, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: TOKENS.RULE,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: TOKENS.GRAY, letterSpacing: 1 },

  card: { backgroundColor: TOKENS.CARD, borderRadius: 4, borderWidth: 0.5, borderColor: TOKENS.RULE, overflow: "hidden" },
});

function PageHeader({ eyebrow, num, amber }: { eyebrow: string; num: string; amber: string }) {
  return (
    <>
      <Text style={[styles.eyebrow, { color: amber, position: "absolute", top: MARGIN, left: MARGIN }]}>{eyebrow}</Text>
      <Text style={styles.pageNum}>{num}</Text>
    </>
  );
}

function PageFooter({ branding, amber }: { branding: MidiaKitData["branding"]; amber: string }) {
  const { contato_oficial } = branding;
  return (
    <View style={styles.footer} fixed>
      <Text style={[styles.footerText, { color: TOKENS.ICE, fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 11, letterSpacing: 3 }]}>BJ7 PAINÉIS</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={styles.footerText}>{contato_oficial.site || "bj7.com.br"}</Text>
        {contato_oficial.whatsapp || contato_oficial.telefone ? (
          <>
            <Text style={[styles.footerText, { color: amber }]}>•</Text>
            <Text style={styles.footerText}>{contato_oficial.whatsapp || contato_oficial.telefone}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

function CoverageMap({ pontos, amber }: { pontos: MidiaKitPonto[]; amber: string }) {
  const withCoords = pontos.filter(p => typeof p.lat === "number" && typeof p.lng === "number") as Array<MidiaKitPonto & { lat: number; lng: number }>;
  const w = PAGE_W - MARGIN * 2;
  const h = 280;
  if (withCoords.length === 0) {
    return <AsphaltPlaceholder amber={amber} label="Mapa de cobertura" />;
  }
  const lats = withCoords.map(p => p.lat);
  const lngs = withCoords.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.15 || 0.05;
  const padLng = (maxLng - minLng) * 0.15 || 0.05;
  const a = minLat - padLat, b = maxLat + padLat;
  const c = minLng - padLng, d = maxLng + padLng;
  const project = (lat: number, lng: number) => ({
    x: ((lng - c) / (d - c)) * w,
    y: h - ((lat - a) / (b - a)) * h,
  });
  return (
    <View style={{ width: w, height: h, backgroundColor: "#0B0B0B", borderRadius: 4, overflow: "hidden", borderWidth: 0.5, borderColor: TOKENS.RULE }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* grid sutil */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Rect key={`v${i}`} x={(w / 12) * i} y={0} width={0.4} height={h} fill={TOKENS.RULE} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <Rect key={`h${i}`} x={0} y={(h / 8) * i} width={w} height={0.4} fill={TOKENS.RULE} />
        ))}
        {/* pins */}
        {withCoords.map((p, i) => {
          const { x, y } = project(p.lat, p.lng);
          return (
            <G key={p.id ?? i}>
              <Circle cx={x} cy={y} r={6} fill={amber} fillOpacity={0.18} />
              <Circle cx={x} cy={y} r={2.8} fill={amber} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function StatBig({ amber, value, label }: { amber: string; value: string | number; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.display, { color: amber }]}>{value}</Text>
      <View style={{ width: 28, height: 2, backgroundColor: amber, marginTop: 6, marginBottom: 8 }} />
      <Text style={[styles.eyebrow, { color: TOKENS.GRAY }]}>{label}</Text>
    </View>
  );
}

function PontoCard({ p, amber }: { p: MidiaKitPonto; amber: string }) {
  return (
    <View style={[styles.card, { flexDirection: "row", height: 168, marginBottom: 12 }]} wrap={false}>
      <View style={{ width: "42%", backgroundColor: TOKENS.ASPHALT }}>
        {p.foto ? (
          <Image src={p.foto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <AsphaltPlaceholder amber={amber} label={p.codigo} />
        )}
      </View>
      <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={[styles.eyebrow, { color: amber }]}>{p.formato_label}</Text>
            <Text style={[styles.eyebrow, { color: TOKENS.GRAY }]}>#{p.codigo}</Text>
          </View>
          <Text style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 20, marginTop: 6, color: TOKENS.ICE, lineHeight: 1.1, textTransform: "uppercase" }}>
            {p.cidade}{p.estado ? ` · ${p.estado}` : ""}
          </Text>
          <Text style={[styles.body, { color: TOKENS.GRAY, marginTop: 2 }]}>{p.rodovia}</Text>
          {p.endereco ? (
            <Text style={[styles.small, { marginTop: 6 }]} >{p.endereco}</Text>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", marginTop: 10, gap: 14 }}>
          <View>
            <Text style={[styles.small, { color: TOKENS.DIM, textTransform: "uppercase", letterSpacing: 1 }]}>Dim.</Text>
            <Text style={[styles.body, { fontFamily: "Barlow Condensed", fontWeight: 700 }]}>{p.dimensao}</Text>
          </View>
          <View>
            <Text style={[styles.small, { color: TOKENS.DIM, textTransform: "uppercase", letterSpacing: 1 }]}>Ilum.</Text>
            <Text style={[styles.body, { fontFamily: "Barlow Condensed", fontWeight: 700 }]}>
              {p.iluminacao === "sim" || p.iluminacao === "led" ? "SIM" : p.iluminacao === "nao" ? "NÃO" : (p.iluminacao || "—").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function MidiaKitInstitucionalDoc({ data }: { data: MidiaKitData }) {
  const amber = data.branding.cor_primaria || TOKENS.AMBER_FALLBACK;
  const { branding, cobertura, pontos_catalogo, pontos_todos, capa_foto, cta_foto, qrcode_data_url } = data;
  const hasFluxo = pontos_todos.some(p => (p.fluxo ?? 0) > 0 || (p.impacto ?? 0) > 0);

  // Catálogo: 4 cards por página (2 col x 2 row), com chunking
  const cardsPerPage = 4;
  const catalogChunks: MidiaKitPonto[][] = [];
  for (let i = 0; i < pontos_catalogo.length; i += cardsPerPage) {
    catalogChunks.push(pontos_catalogo.slice(i, i + cardsPerPage));
  }

  return (
    <Document title="BJ7 Painéis — Mídia Kit" author="BJ7 Painéis">
      {/* === Capa === */}
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1, position: "relative" }}>
          {capa_foto ? (
            <Image src={capa_foto} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: TOKENS.ASPHALT }} />
          )}
          {/* gradiente em camadas (react-pdf não suporta gradient nativo): overlays escurecendo de baixo */}
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "70%", backgroundColor: TOKENS.ASPHALT, opacity: 0.55 }} />
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "40%", backgroundColor: TOKENS.ASPHALT, opacity: 0.7 }} />
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "18%", backgroundColor: TOKENS.ASPHALT, opacity: 0.85 }} />

          {/* logo topo-esquerda */}
          <View style={{ position: "absolute", top: MARGIN, left: MARGIN, right: MARGIN, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            {branding.logo_url ? (
              <Image src={branding.logo_url} style={{ width: 110, height: 40, objectFit: "contain" }} />
            ) : (
              <Text style={[styles.eyebrow, { color: TOKENS.ICE, fontSize: 12, fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: 3 }]}>BJ7 PAINÉIS</Text>
            )}
            <Text style={[styles.eyebrow, { color: amber }]}>Mídia Kit 2026</Text>
          </View>

          {/* título ancorado embaixo-esquerda */}
          <View style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN + 36 }}>
            <Text style={[styles.eyebrow, { color: amber, marginBottom: 12 }]}>Mídia exterior · Litoral PR/SC</Text>
            <Text style={[styles.h1, { fontSize: 64 }]}>MÍDIA{"\n"}KIT <Text style={{ color: amber }}>2026</Text></Text>
            <View style={[styles.rule, { width: 80, backgroundColor: amber }]} />
            <Text style={[styles.body, { maxWidth: 360, color: TOKENS.ICE }]}>
              {cobertura.total_pontos} pontos selecionados em corredores de alto fluxo. Sem inventário pulverizado, sem promessa vazia.
            </Text>
          </View>

          {/* faixa de pista no rodapé */}
          <View style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN }}>
            <RoadStripe color={amber} dashCount={22} thickness={3} />
          </View>
        </View>
      </Page>

      {/* === Quem somos + Cobertura === */}
      <Page size="A4" style={styles.page}>
        <PageHeader eyebrow="01 · Quem somos" num="02" amber={amber} />
        <View style={styles.pageInner}>
          <View style={{ marginTop: 32 }}>
            <Text style={styles.h2}>Onde marca virá impacto.</Text>
            <View style={[styles.rule, { width: 80, backgroundColor: amber }]} />
            <Text style={[styles.body, { maxWidth: 460 }]}>
              {branding.texto_institucional ||
                "A BJ7 opera mídia exterior estratégica no Litoral do Paraná e Santa Catarina, conectando marcas ao alto fluxo das rotas turísticas e corredores logísticos da região. Operação própria, atendimento consultivo, comprovação documentada."}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 18, marginTop: 28 }}>
            <StatBig amber={amber} value={cobertura.total_pontos} label="Pontos ativos" />
            <StatBig amber={amber} value={cobertura.cidades.length} label="Cidades" />
            <StatBig amber={amber} value={cobertura.estados.length || 2} label="Estados" />
          </View>

          <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={[styles.eyebrow, { color: amber }]}>Cobertura</Text>
            <View style={{ flex: 1 }}>
              <RoadStripe color={TOKENS.RULE} dashCount={28} thickness={1.5} />
            </View>
          </View>

          <View style={{ marginTop: 10 }}>
            <CoverageMap pontos={pontos_todos} amber={amber} />
          </View>

          <Text style={[styles.small, { marginTop: 12 }]}>
            {cobertura.cidades.slice(0, 12).join(" · ")}{cobertura.cidades.length > 12 ? " · …" : ""}
          </Text>
        </View>
        <PageFooter branding={branding} amber={amber} />
      </Page>

      {/* === Fluxo & Impacto (condicional) === */}
      {hasFluxo && (
        <Page size="A4" style={styles.page}>
          <PageHeader eyebrow="02 · Fluxo & Impacto" num="03" amber={amber} />
          <View style={styles.pageInner}>
            <View style={{ marginTop: 32 }}>
              <Text style={styles.h2}>Tráfego que sua marca alcança.</Text>
              <View style={[styles.rule, { width: 80, backgroundColor: amber }]} />
            </View>
            <View style={{ marginTop: 16 }}>
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
                .slice(0, 6)
                .map(([cidade, v]) => (
                  <View key={cidade} style={{ flexDirection: "row", alignItems: "baseline", gap: 16, paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: TOKENS.RULE }}>
                    <Text style={[styles.h2, { fontSize: 22, width: 180 }]}>{cidade}</Text>
                    <View style={{ flex: 1, flexDirection: "row", gap: 24 }}>
                      <View>
                        <Text style={[styles.display, { fontSize: 36, color: amber }]}>{Math.round(v.fluxo).toLocaleString("pt-BR")}</Text>
                        <Text style={[styles.eyebrow, { color: TOKENS.GRAY }]}>Veículos/dia</Text>
                      </View>
                      <View>
                        <Text style={[styles.display, { fontSize: 36, color: TOKENS.ICE }]}>{Math.round(v.impacto).toLocaleString("pt-BR")}</Text>
                        <Text style={[styles.eyebrow, { color: TOKENS.GRAY }]}>Impactos/dia</Text>
                      </View>
                      <View>
                        <Text style={[styles.display, { fontSize: 36, color: TOKENS.ICE }]}>{v.count}</Text>
                        <Text style={[styles.eyebrow, { color: TOKENS.GRAY }]}>Pontos</Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </View>
          <PageFooter branding={branding} amber={amber} />
        </Page>
      )}

      {/* === Catálogo de pontos === */}
      {catalogChunks.map((chunk, idx) => (
        <Page key={`cat-${idx}`} size="A4" style={styles.page}>
          <PageHeader eyebrow={`${hasFluxo ? "03" : "02"} · Catálogo de pontos`} num={String(idx + (hasFluxo ? 4 : 3)).padStart(2, "0")} amber={amber} />
          <View style={styles.pageInner}>
            {idx === 0 && (
              <View style={{ marginTop: 32, marginBottom: 18 }}>
                <Text style={styles.h2}>Pontos selecionados.</Text>
                <View style={[styles.rule, { width: 80, backgroundColor: amber }]} />
                <Text style={[styles.small, { maxWidth: 380 }]}>
                  {pontos_catalogo.length} {pontos_catalogo.length === 1 ? "ponto" : "pontos"} curados para esta proposta. Foto real, dimensão real, endereço real.
                </Text>
              </View>
            )}
            <View style={{ marginTop: idx === 0 ? 4 : 28 }}>
              {chunk.map((p) => (
                <PontoCard key={p.id} p={p} amber={amber} />
              ))}
            </View>
          </View>
          <PageFooter branding={branding} amber={amber} />
        </Page>
      ))}

      {/* === Por que BJ7 === */}
      <Page size="A4" style={styles.page}>
        <PageHeader eyebrow="04 · Por que BJ7" num="—" amber={amber} />
        <View style={[styles.pageInner, { flexDirection: "row", gap: 24 }]}>
          <View style={{ flex: 1.2, marginTop: 32 }}>
            <Text style={styles.h2}>O que muda quando{"\n"}a operação é nossa.</Text>
            <View style={[styles.rule, { width: 80, backgroundColor: amber }]} />
            {[
              { t: "Infraestrutura própria", d: "Manutenção, iluminação e instalação geridas diretamente — nada terceirizado." },
              { t: "Pontos escolhidos a dedo", d: "Selecionados por fluxo real e contexto regional, não por inventário pulverizado." },
              { t: "Atendimento consultivo", d: "Cada campanha recebe plano com argumento de praça, não só tabela de preço." },
              { t: "Comprovação documentada", d: "Foto de instalação e relatório de manutenção entregues junto com o flight." },
            ].map((d, i) => (
              <View key={i} style={{ marginTop: 18, flexDirection: "row", gap: 12 }}>
                <Text style={[styles.display, { fontSize: 24, color: amber, width: 30 }]}>{String(i + 1).padStart(2, "0")}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 16, color: TOKENS.ICE, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.t}</Text>
                  <Text style={[styles.body, { color: TOKENS.GRAY, marginTop: 3 }]}>{d.d}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={{ flex: 1, marginTop: 32 }}>
            {cta_foto ? (
              <Image src={cta_foto} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
            ) : (
              <AsphaltPlaceholder amber={amber} label="Operação documentada" />
            )}
          </View>
        </View>
        <PageFooter branding={branding} amber={amber} />
      </Page>

      {/* === CTA / Contato === */}
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1, position: "relative" }}>
          {cta_foto ? (
            <Image src={cta_foto} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : capa_foto ? (
            <Image src={capa_foto} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}
          <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: TOKENS.ASPHALT, opacity: 0.7 }} />

          <View style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: MARGIN + 24, top: MARGIN }}>
            <Text style={[styles.eyebrow, { color: amber }]}>05 · Próximo passo</Text>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={[styles.h1, { fontSize: 56 }]}>
                Quer ver os pontos{"\n"}<Text style={{ color: amber }}>certos</Text> pra sua marca?
              </Text>
              <View style={[styles.rule, { width: 80, backgroundColor: amber, marginTop: 18 }]} />

              <View style={{ flexDirection: "row", gap: 32, marginTop: 24, alignItems: "flex-end" }}>
                <View style={{ flex: 1 }}>
                  {branding.contato_oficial.whatsapp ? (
                    <>
                      <Text style={[styles.eyebrow, { color: TOKENS.GRAY }]}>WhatsApp</Text>
                      <Text style={[styles.h2, { fontSize: 28, marginTop: 4 }]}>{branding.contato_oficial.whatsapp}</Text>
                    </>
                  ) : branding.contato_oficial.telefone ? (
                    <>
                      <Text style={[styles.eyebrow, { color: TOKENS.GRAY }]}>Telefone</Text>
                      <Text style={[styles.h2, { fontSize: 28, marginTop: 4 }]}>{branding.contato_oficial.telefone}</Text>
                    </>
                  ) : null}
                  <Text style={[styles.body, { marginTop: 10, color: TOKENS.ICE }]}>
                    {branding.contato_oficial.site || "bj7.com.br"}
                  </Text>
                </View>
                {qrcode_data_url ? (
                  <View style={{ width: 96, padding: 8, backgroundColor: TOKENS.ICE, borderRadius: 4 }}>
                    <Image src={qrcode_data_url} style={{ width: 80, height: 80 }} />
                    <Text style={{ fontSize: 7, color: TOKENS.ASPHALT, textAlign: "center", marginTop: 4, letterSpacing: 1 }}>SITE</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <RoadStripe color={amber} dashCount={22} thickness={3} />
          </View>
        </View>
      </Page>
    </Document>
  );
}