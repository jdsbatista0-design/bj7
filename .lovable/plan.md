## Diagnóstico

O PDF atual é A4 retrato genérico (capa textual, cards 2 colunas, mapa SVG seco). A referência `bj7_midia-3.pdf` é um **deck paisagem 16:9** estilo apresentação: capa-fotografia, divisores de rota com tipografia gigante, grids de 6 fotos com tarja preta + código amarelo, tabela de coordenadas e prancha de formatos com mockups proporcionais. É esse o alvo.

Vou refazer apenas `MidiaKitInstitucional.tsx` (motor PDF) e ajustar `buildMidiaKitData.ts` para agrupar por rodovia. Sem mexer em UI, contratos, financeiro, schema. Sem fontes externas — manter Helvetica para evitar 404.

## Estrutura do novo deck (paisagem A4, 842×595pt)

```
01 Capa            full-bleed foto + título amarelo + tagline
02 Quem somos      4 pilares + 4 KPIs + mapa de cobertura
[por rodovia, repete 2 páginas:]
   Divisor       full-bleed foto rota + EYEBROW (rodovia) + título gigante amarelo (ex "PR-412") + sentido + N pontos
   Grid          até 6 cards 3×2, agrupados pela rota, com tarja inferior (código amarelo + endereço/sentido)
N-2 Tabela        coordenadas | rodovia · localização · sentido · lat,lng (cabeçalho amarelo)
N-1 Formatos      modelos proporcionais (3m×9m, 4m×12m, 4m×25m) com cota, bullets e área
N   Contato       site, WhatsApp, QR, foto de fechamento
```

Numeração de página tipo `03 / 12` no canto, barra superior fixa com marca + seção.

## Sistema visual (tokens, sem mudar `tokens.ts`)

- Fundo `#111`, card `#1C1C1C`, ice `#F4F4F2`, âmbar do branding (`cor_primaria`)
- Tipografia só Helvetica/Helvetica-Bold (sem Google Fonts)
- Hierarquia: eyebrow 7.5pt tracking 2.4, H1 deck 72pt, H1 página 32pt, lede 11pt, body 9.5pt
- Régua âmbar 38×2pt como acento recorrente
- Sem placeholders gigantes: quando falta foto, usar gradient asfalto + monograma BJ7 discreto

## Páginas — detalhes

**Capa**  
Foto de rota (mais paisagem do inventário) em full-bleed. 3 camadas de veladura escura (35%/55% inferior/85% base) garantindo contraste. Topo direito: "N° 01 — Edição 2026". Bloco inferior esquerdo: régua âmbar 38×2, eyebrow "MÍDIA EXTERIOR ESTRATÉGICA", marca em 48pt amarelo + subtítulo branco ("PROPOSTA MÍDIA RODOVIÁRIA — Litoral PR · SC"), tagline com nº de pontos.

**Quem somos**  
2 colunas: posicionamento à esquerda (eyebrow, H1, lede), 4 diferenciais numerados à direita. Régua. Linha de 4 KPIs (pontos, cidades, estados, formatos) com números 38pt. Mapa de cobertura abaixo (SVG já existente, refinado: grid mais fino, pinos em camadas).

**Divisor de rodovia** (1 por rota relevante)  
Full-bleed: melhor foto da rota. Camadas de veladura. Centralizado/esquerda baixo: eyebrow "RODOVIA", código gigante (ex "PR-412") em 110pt âmbar, subtítulo branco ("Garuva → Guaratuba · principal acesso ao litoral"), chip "N pontos".

**Grid da rodovia**  
Header: eyebrow + título (ex "PR-412 · ROTA DO LITORAL") + lede curta.  
3 colunas × 2 linhas (6 cards/página, paginar se a rota tiver mais). Card:
- Foto 100% topo (180×112pt)
- Tarja inferior preta (`#000` 80%) com `PONTO #CODIGO` em âmbar + cidade/rodovia + sentido em branco
- Sem bordas, espaçamento 10pt entre cards
Rodapé da página: "RODOVIA | trajeto" à esquerda, BJ7 MÍDIA à direita.

**Tabela de coordenadas**  
Cabeçalho amarelo (RODOVIA · LOCALIZAÇÃO · SENTIDO · COORDENADAS). Linhas em zebra muito sutil (`#1A1A1A`). Tipografia mono para coordenadas. Ordena por rodovia.

**Formatos**  
Detecta dimensões distintas no inventário (até 3 mais comuns). Para cada uma desenha um retângulo branco PROPORCIONAL à dimensão real, com setas de cota (h × w), título "MODELO N", subtítulo dimensão, 3 bullets descritivos por faixa (≤30m² institucional, 30–80m² impacto, >80m² gigante) e badge âmbar com área em m². Se só houver 1 dimensão, mostra 1 grande centralizado.

**Contato**  
2 colunas: esquerda foto fechamento full-height; direita fundo preto com eyebrow "ENTRE EM CONTATO", H1 "Vamos colocar sua marca na rota.", régua âmbar, telefone/WhatsApp em destaque, site, cidade, QR-code (já gerado).

## Mudanças por arquivo

**`src/lib/pdf/buildMidiaKitData.ts`**
- Acrescentar `rodovias: Array<{ rodovia: string; sentido?: string; pontos: MidiaKitPonto[]; capa?: string }>` em `MidiaKitData`.
- Acrescentar `dimensoes_top: Array<{ label: string; w: number; h: number; area: number; faixa: "padrao"|"impacto"|"gigante" }>` (top 3 por contagem).
- Não mexer no resto.

**`src/lib/pdf/MidiaKitInstitucional.tsx`**
- Trocar `size="A4"` por `size="A4" orientation="landscape"` em todas as Pages.
- Atualizar `PAGE_W/PAGE_H` no uso (842×595) — adicionar `LAND_W`/`LAND_H` em `tokens.ts`.
- Substituir capa, página institucional, fluxo (removido — não é da referência), catálogo, contato pelos componentes descritos. Adicionar `RodoviaDivider`, `RodoviaGridPage`, `TabelaCoordenadas`, `FormatosPage`.
- Manter `CoverageMap`, `Stat`, `TopBar`, `BottomBar` reaproveitados em landscape (recalcular w).

**`src/lib/pdf/tokens.ts`**
- Adicionar `LAND_W = 841.89; LAND_H = 595.28;`.

## Fora de escopo
- Mapa real estilo Mapbox (mantém SVG simples).
- Versionamento, assinatura, múltiplos templates.
- Mudanças em UI da página `/midia-kit`, financeiro, contratos.

## Validação
1. Gerar PDF com seleção total → comparar visual com `bj7_midia-3.pdf` página a página.
2. Confirmar zero "área grande vazia": cada página preenchida até as margens.
3. Confirmar que código do ponto aparece em âmbar sobre tarja preta nos cards.
4. Confirmar que mudar `cor_primaria` no branding propaga em divisor, KPIs, formatos e contato.
5. Confirmar que rota com apenas 1 ponto não imprime grid com 5 buracos (ajusta para "destaque único" centralizado).
