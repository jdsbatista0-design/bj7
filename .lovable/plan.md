
# Fase 2A — Mídia Kit redesign + fix Receita por Rodovia

## 1. Bug rápido: Receita por Rodovia (Financeiro)

`src/pages/Financial.tsx` agrega receita usando `billboard.price` (valor de tabela) sempre que o ponto está `occupied`, e custo usando `billboard.cost` (valor cadastrado), o que diverge da realidade contratada e ignora os contratos.

Correção:
- Receita por rodovia = soma do `monthly_value` dos contratos ativos `ad_sale` (alias atual `veiculacao`), rateada pelos `billboard_ids` do contrato (rateio igualitário por ponto → soma na rodovia de cada ponto).
- Custo por rodovia = soma do `monthly_value` dos contratos ativos `land_lease` (alias `locacao_terreno`), rateado da mesma forma; fallback para `billboard.cost` se o ponto não tiver land_lease ativo.
- `count` = pontos por rodovia (mantém).
- `margin` = `revenue - cost`.

Resultado: total da seção bate com MRR e total de despesas de terreno do topo da página.

## 2. Schema e dados (billboards)

Migração:
- `ALTER TABLE billboards ADD COLUMN formato_label text` — rótulo apresentável (ex.: "Painel Rodoviário"). Backfill a partir de `type` via mapa (`painel_rodoviario` → "Painel Rodoviário", etc.). Daqui pra frente UI e PDF leem `formato_label` (fallback titlecase do `type`). Nunca exibir o valor cru.
- Conferir o 30º ponto faltante: rodar `select count(*) from billboards where deleted_at is null` e, se faltar, abrir um aviso no painel admin pedindo o insert manual (não inventamos dados de ponto real).

Fotos: usar `main_photo` + `photos[]` (já existem em `billboards`). Onde ausente, placeholder asfalto com motivo de pista renderizado em `<Svg>` dentro do PDF (não imagem externa).

## 3. Mídia Kit — tela do comercial (`/midia-kit`)

Reescreve `src/pages/MidiaKit.tsx`:
- Carrega `branding_settings` + todos `billboards` ativos (com `main_photo`, `photos`, `formato_label`, `city`, `route`, `dimension`, `code`, `address`, `coordinates`).
- **Painel de seleção** acima do botão de download:
  - Coluna esquerda: lista de pontos com checkbox, miniatura, código, cidade, rodovia, formato.
  - Coluna direita: mapa Leaflet (mesmos tiles dark do app) com pin amarelo por ponto; pino fica opaco quando desmarcado.
  - "Selecionar todos" (default marcado) + busca por cidade/rodovia/código.
- Botão **Baixar PDF** passa `selectedIds` para o gerador. Páginas institucionais sempre entram; o catálogo (página 4) só inclui os marcados.
- KPIs do topo continuam mostrando totais da empresa (não da seleção).
- Botão "Copiar link público" mantém comportamento atual (link institucional, sem seleção).

## 4. Mídia Kit — PDF (`src/lib/pdf/MidiaKitInstitucional.tsx`)

Reescrita completa em `@react-pdf/renderer`. Sem `html2canvas`.

### Sistema de design
Tokens centralizados no topo do arquivo:
```
ASPHALT_BG  #111111
CARD_BG     #1C1C1C
RULE        #2A2A2A
ICE         #F4F4F2
GRAY        #8A8A8A
AMBER       = branding.cor_primaria ?? "#F2B705"
```
- `Font.register` para Barlow Condensed (display) e Barlow/Inter (corpo) a partir de fontes do Google Fonts (URLs `.ttf` registradas no boot do app).
- Escala tipográfica conforme briefing (H1 56-64, número-destaque 60-72, eyebrow 9pt uppercase).
- Layout: margem 48pt, grid 12 colunas/gutter 16pt aplicado via `flex`.
- Header de página interna: eyebrow amarelo + nº de página topo-direita.
- Footer fixo: logo (de branding) + `bj7.com.br` + `contato_oficial.telefone/whatsapp`, separados por régua `#2A2A2A`.
- Motivo "faixa de pista": componente `<RoadStripe orientation="horizontal|vertical" />` renderizado com `<Svg>` (dashes amarelos) usado em divisores e bordas.
- Régua amarela 3pt sob cada H1.
- Anti-vazio: cada página tem foto, mapa ou número-destaque preenchendo área principal — não há `<View>` solto centralizado em fundo preto.

### Páginas
1. **Capa** — `<Image>` full-bleed do painel iluminado mais bem fotografado (heurística: primeiro com `main_photo` no array marcado de "destaque" ou fallback primeiro com foto). Gradiente asfalto via View com `backgroundColor` em camadas. Logo topo-esquerda. "MÍDIA KIT 2026" + tagline ancorados na parte inferior esquerda. `RoadStripe` no rodapé.
2. **Quem somos + Cobertura** — texto institucional curto + três números-destaque grandes (`{total_pontos} PONTOS · {n_cidades} CIDADES · {n_estados} ESTADOS`, derivado dos dados, não chumbado). Metade inferior = mapa estático dark renderizado server-side via Mapbox Static Images API (ou fallback: imagem PNG gerada em build e armazenada em `public/`). Pins amarelos nas coordenadas.
3. **Fluxo & Impacto** — incluída **só se** existir pelo menos um ponto com `traffic_count` ou `daily_impact` preenchido. Caso contrário a página é omitida (não renderiza vazia). Quando renderiza: agrupa por cidade/corredor, números display amarelos.
4. **Catálogo de pontos** — somente `selectedIds`. Cards: foto 40% do card (`<Image src={main_photo}>`), bloco de dados (endereço, cidade, `formato_label`, dimensão, iluminação). Grid 2 colunas em A4 retrato. Quebra automática de página (`break`) usando `wrap` do react-pdf. Substitui a página atual de "Formatos".
5. **Por que BJ7** — 4 diferenciais com bullet amarelo + 1 foto de comprovação (heurística: foto marcada como `comprovacao` ou última foto noturna de qualquer ponto). Foto preenche o lado direito da página, texto à esquerda.
6. **CTA / Contato** — foto noturna full-bleed + headline grande + WhatsApp do `contato_oficial` + QR code para `bj7.com.br` gerado client-side com `qrcode` (npm) e injetado como data-URL em `<Image>`.

### Copy dinâmica
- Texto de formatos derivado dos formatos distintos do inventário (count). Se houver 1 formato, evita "quatro padrões".
- Página 2 sempre mostra totais da empresa; página 4 mostra só a seleção. Sem strings hardcoded de quantidade.

### Branding conectado (teste de aceite)
- Cor amarela usada em números-destaque, réguas e bullets vem de `branding.cor_primaria`. Trocar no admin muda no PDF.
- Logo, contato e texto institucional lidos do `branding_settings` no momento do gerar.

## 5. Dependências
- `qrcode` (npm) para o QR da página 6.
- Fontes (Barlow Condensed, Barlow) carregadas via `Font.register` apontando para CDN do Google Fonts em formato `.ttf`.
- Mapa estático: tentar Mapbox Static API se houver `MAPBOX_TOKEN`; fallback para `public/maps/cobertura.png` pré-gerado (commit manual) para não bloquear a entrega.

## 6. Permissões e rotas
- Mantém rota `/midia-kit` interna e `/midia-kit/publico/:token` pública (sem fluxo de seleção).
- Chave de permissão `media_kit.view` já está no `PermissionGate`.

## 7. Arquivos afetados

```text
src/pages/Financial.tsx                       (fix rodovia)
src/pages/MidiaKit.tsx                        (tela de seleção + mapa)
src/lib/pdf/MidiaKitInstitucional.tsx         (reescrita completa)
src/lib/pdf/tokens.ts                         (novo — tokens visuais)
src/lib/pdf/components/RoadStripe.tsx         (novo)
src/lib/pdf/components/AsphaltPlaceholder.tsx (novo)
src/lib/pdf/fonts.ts                          (novo — Font.register)
public/maps/cobertura.png                     (asset estático fallback)
supabase/migrations/...                        (add billboards.formato_label + backfill)
```

## 8. Fora de escopo (Fase 2A)
- Mídia kit por ponto (one-pager individual) — fica para 2B.
- Proposta padrão e conversão em contrato — Fase 2B.
- Edição de fotos / upload em massa de novas imagens — depende de fotos já estarem no bucket.

## 9. Validação antes de fechar
- Trocar `cor_primaria` no admin e baixar PDF → cor dos números muda.
- Desmarcar 27 pontos, baixar → catálogo tem 3 pontos, página 2 ainda mostra total da empresa.
- Inspeção visual (pdftoppm) de todas as páginas: sem áreas mortas >25%, sem texto sobreposto, fotos presentes.
- Total de "Receita por Rodovia" = MRR exibido no topo do Financeiro.
