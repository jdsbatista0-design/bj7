import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export interface MidiaKitData {
  branding: {
    logo_url?: string | null;
    cor_primaria: string;
    contato_oficial: { telefone?: string; email?: string; site?: string; whatsapp?: string };
    texto_institucional?: string | null;
  };
  cobertura: {
    cidades: string[];
    total_faces: number;
  };
  formatos: { nome: string; dimensao: string; quantidade: number }[];
  pontos_destaque: { codigo: string; cidade: string; tipo: string; foto?: string }[];
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#0A0A0A", color: "#FFFFFF", padding: 0, fontFamily: "Helvetica" },
  cover: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  coverTitle: { fontSize: 38, fontWeight: 700, marginBottom: 8, letterSpacing: 1 },
  coverSub: { fontSize: 14, color: "#A1A1AA", marginBottom: 40, textAlign: "center" },
  amber: { color: "#EAB308" },
  section: { padding: 40 },
  h2: { fontSize: 22, color: "#EAB308", marginBottom: 14, fontWeight: 700 },
  p: { fontSize: 11, color: "#D4D4D8", lineHeight: 1.6, marginBottom: 10 },
  kpiRow: { flexDirection: "row", gap: 12, marginTop: 14, marginBottom: 20 },
  kpi: { flex: 1, backgroundColor: "#171717", border: "1px solid #262626", borderRadius: 6, padding: 14 },
  kpiVal: { fontSize: 26, color: "#EAB308", fontWeight: 700 },
  kpiLabel: { fontSize: 9, color: "#A1A1AA", marginTop: 4, textTransform: "uppercase" as const },
  formatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  formatCard: { width: "47%", backgroundColor: "#171717", border: "1px solid #262626", borderRadius: 6, padding: 12 },
  formatName: { fontSize: 13, color: "#EAB308", fontWeight: 700, marginBottom: 4 },
  formatDim: { fontSize: 10, color: "#A1A1AA" },
  formatQty: { fontSize: 9, color: "#71717A", marginTop: 6 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 8, color: "#52525B", textAlign: "center", borderTop: "1px solid #262626", paddingTop: 8 },
  source: { fontSize: 8, color: "#52525B", fontStyle: "italic" as const, marginTop: 6 },
  pageBadge: { position: "absolute", top: 20, right: 30, fontSize: 8, color: "#52525B" },
  logo: { width: 140, height: 50, objectFit: "contain", marginBottom: 24 },
  ctaBox: { backgroundColor: "#EAB308", padding: 16, borderRadius: 6, marginTop: 20 },
  ctaText: { color: "#0A0A0A", fontSize: 12, fontWeight: 700 },
  diffItem: { flexDirection: "row", marginBottom: 8, alignItems: "flex-start" },
  diffBullet: { color: "#EAB308", fontSize: 12, marginRight: 8 },
  diffText: { color: "#D4D4D8", fontSize: 11, flex: 1, lineHeight: 1.5 },
});

export function MidiaKitInstitucionalDoc({ data }: { data: MidiaKitData }) {
  const { branding, cobertura, formatos } = data;
  return (
    <Document title="BJ7 Painéis — Mídia Kit" author="BJ7 Painéis">
      {/* Capa */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          {branding.logo_url ? <Image src={branding.logo_url} style={styles.logo} /> : null}
          <Text style={styles.coverTitle}>
            MÍDIA KIT <Text style={styles.amber}>2026</Text>
          </Text>
          <Text style={styles.coverSub}>
            Mídia exterior premium{"\n"}Litoral do Paraná e Santa Catarina
          </Text>
          <View style={{ marginTop: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 9, color: "#52525B" }}>{branding.contato_oficial.site || "www.bj7.com.br"}</Text>
          </View>
        </View>
        <Text style={styles.footer}>BJ7 Painéis · Mídia Kit Institucional</Text>
      </Page>

      {/* Quem somos + cobertura */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageBadge}>02</Text>
        <View style={styles.section}>
          <Text style={styles.h2}>Quem somos</Text>
          <Text style={styles.p}>
            {branding.texto_institucional ||
              "BJ7 Painéis opera mídia exterior estratégica no Litoral do Paraná e Santa Catarina, conectando marcas ao alto fluxo das rotas mais movimentadas da região."}
          </Text>

          <Text style={[styles.h2, { marginTop: 20 }]}>Cobertura</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={styles.kpiVal}>{cobertura.total_faces}</Text>
              <Text style={styles.kpiLabel}>Faces ativas</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={styles.kpiVal}>{cobertura.cidades.length}</Text>
              <Text style={styles.kpiLabel}>Cidades atendidas</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={styles.kpiVal}>2</Text>
              <Text style={styles.kpiLabel}>Estados</Text>
            </View>
          </View>
          <Text style={styles.p}>
            <Text style={{ color: "#A1A1AA" }}>Cidades: </Text>
            {cobertura.cidades.join(" · ")}
          </Text>
          <Text style={styles.source}>Fonte de dados de mercado OOH: InfoOOH.</Text>
        </View>
        <Text style={styles.footer}>bj7.com.br</Text>
      </Page>

      {/* Catálogo de formatos */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageBadge}>03</Text>
        <View style={styles.section}>
          <Text style={styles.h2}>Formatos disponíveis</Text>
          <Text style={styles.p}>Quatro padrões de painel atendendo desde alto impacto rodoviário até presença urbana.</Text>
          <View style={styles.formatGrid}>
            {formatos.map((f) => (
              <View key={f.nome} style={styles.formatCard}>
                <Text style={styles.formatName}>{f.nome}</Text>
                <Text style={styles.formatDim}>{f.dimensao}</Text>
                <Text style={styles.formatQty}>{f.quantidade} {f.quantidade === 1 ? "ponto" : "pontos"} disponíveis</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.footer}>bj7.com.br</Text>
      </Page>

      {/* Diferenciais + CTA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageBadge}>04</Text>
        <View style={styles.section}>
          <Text style={styles.h2}>Por que BJ7</Text>
          {[
            "Infraestrutura própria: manutenção, iluminação e instalação geridos diretamente, sem terceirização da operação.",
            "Pontos selecionados por fluxo real e contexto regional — não inventário pulverizado.",
            "Atendimento consultivo: cada campanha recebe um plano com argumento de praça, não apenas tabela de preço.",
            "Veiculação e comprovação documentadas (foto de instalação + relatório de manutenção).",
          ].map((t, i) => (
            <View key={i} style={styles.diffItem}>
              <Text style={styles.diffBullet}>›</Text>
              <Text style={styles.diffText}>{t}</Text>
            </View>
          ))}

          <View style={styles.ctaBox}>
            <Text style={styles.ctaText}>Quer ver os pontos certos para sua marca?</Text>
            <Text style={{ color: "#0A0A0A", fontSize: 10, marginTop: 6 }}>
              {branding.contato_oficial.whatsapp ? `WhatsApp ${branding.contato_oficial.whatsapp} · ` : ""}
              {branding.contato_oficial.site || "www.bj7.com.br"}
            </Text>
          </View>
        </View>
        <Text style={styles.footer}>BJ7 Painéis · Mídia Kit Institucional</Text>
      </Page>
    </Document>
  );
}