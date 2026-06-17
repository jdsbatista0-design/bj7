# Roadmap BJ7 — CRM profissional, Mídia Kit, Propostas e correções

Reorganizando a ordem com base no que você pediu. O foco agora é **transformar o CRM no coração do negócio** e corrigir o bug crítico de contratos antes de qualquer feature nova.

---

## Fase 0 — Correção crítica: separar Contrato de Terreno vs Contrato de Anúncio (URGENTE)

**Problema atual:** o trigger `sync_billboard_status_from_contract` marca o billboard como `occupied` para QUALQUER contrato ativo. Mas existem dois tipos de contrato totalmente diferentes:

| Tipo | O que é | Efeito no painel |
|---|---|---|
| **Contrato de Terreno (aluguel/cessão)** | BJ7 aluga o terreno do proprietário pra instalar o painel | Painel fica **ativo / operacional** (existe fisicamente), mas continua **disponível** para venda |
| **Contrato de Anúncio (venda de mídia)** | Cliente anunciante compra a face do painel por X meses | Painel fica **ocupado** (face vendida) |

**Correções:**

1. **Migration** adicionando à tabela `contracts`:
   - `contract_type` enum: `'land_lease'` (terreno) | `'ad_sale'` (anúncio)
   - migrar contratos existentes (default `'ad_sale'`)
2. **Migration** adicionando ao `billboards`:
   - `operational_status` enum: `'planned' | 'active' | 'inactive'` (existe? está rodando?)
   - manter `status` apenas para ocupação comercial: `available | reserved | occupied`
3. **Reescrever o trigger** `sync_billboard_status_from_contract`:
   - Se `contract_type = 'land_lease'` → atualiza `operational_status` para `active` (não toca em `status`)
   - Se `contract_type = 'ad_sale'` → atualiza `status` para `occupied` quando ativo, libera quando expira
4. **UI Contratos** (dentro de ClientsHub): seletor `contract_type` no form + filtro/aba "Terrenos" vs "Anúncios"
5. **Card do painel** no Inventário mostra dois badges: "Operacional ✓" + "Comercial: Disponível/Ocupado/Reservado"

---

## Fase 1 — CRM profissional (o coração)

Quero que o CRM funcione como Pipedrive/HubSpot adaptado pra mídia OOH.

### 1.1 Listas de Prospecção (pré-lead)

**Novo conceito:** antes de virar lead qualificado, você tem **listas brutas** (planilhas de empresas a abordar).

- **Nova tabela `prospect_lists`**: nome, descrição, origem (CSV importado, Google Maps, indicação, etc.), owner, created_at.
- **Nova tabela `prospects`**: list_id, company_name, contact_name, phone, email, city, segment, website, instagram, notes, status (`untouched | contacted | qualified | discarded | converted`), assigned_to.
- **Importador CSV/XLSX**: tela "Prospecção → Importar lista" — upload do arquivo, mapeamento de colunas (nome empresa, telefone, cidade, etc.), preview, import em batch.
- **Tela Listas**: tabela paginada/virtualizada (suporta 10k+ linhas), filtros por cidade/segmento/status, atribuição em massa a vendedor, exportar.
- **Ação "Qualificar"** → cria um `lead` no pipeline e marca prospect como `converted`. Mantém rastreabilidade (`leads.prospect_id`).

### 1.2 Pipeline + Cadência por etapa

- Manter Kanban atual em `CRM.tsx` mas adicionar:
  - **Cadência automática por etapa** (não só lead novo): cada estágio do funil tem sua própria régua de tarefas (ex.: "Proposta enviada" → follow-up em 1d, 3d, 7d).
  - Usa as tabelas já criadas: `cadences`, `cadence_steps`, `lead_cadence_runs`.
  - Quando lead muda de estágio (drag-and-drop), cancela cadência antiga e inicia a nova.
- **Visão "Hoje"** (nova rota `/crm/today`): tarefas do dia agrupadas por tipo (ligar, WhatsApp, enviar proposta, follow-up), ordenadas por prioridade. Botões rápidos: feito / adiar / parar cadência.
- **Atividades** (usa tabela `activities`): timeline por lead com ligações, e-mails, WhatsApp, reuniões, observações. Form rápido pra registrar.
- **Comunicações** (usa tabela `communications`): templates de mensagem (WhatsApp/email) com variáveis `{{nome}} {{ponto}} {{cidade}}`.

### 1.3 Score e priorização

- Campo `lead_score` calculado: orçamento × probabilidade × tempo no estágio.
- Badge visual no card do Kanban.

### 1.4 Métricas do CRM

- Conversão por estágio, tempo médio em cada estágio, vendedor com maior conversão, motivos de perda.

---

## Fase 2 — Mídia Kit + Modelo de Proposta padrão

### 2.1 Mídia Kit por ponto (PDF)

- Biblioteca: `@react-pdf/renderer` (client-side, sem edge function).
- Template preto + amber (#EAB308) com:
  - Capa (logo BJ7, código do ponto, cidade/rota)
  - Foto do painel + mini-mapa estático (Leaflet → canvas → image)
  - Ficha técnica (medidas, formato, iluminação)
  - Argumento comercial (rota, fluxo qualitativo — sem números proibidos)
  - Preço sob consulta + contato
- Botão "Gerar mídia kit" no card do Inventário e no modal do lead.
- Versão **multi-pontos** (combo): selecionar 3-5 pontos e gerar um único PDF de circuito.

### 2.2 Mídia Kit institucional

- PDF único da empresa (não por ponto): quem somos, cobertura, cases, números agregados.
- Editável em Settings → "Mídia Kit institucional" (campos de texto + upload de imagens).

### 2.3 Modelo de Proposta padrão

- **Nova tabela `proposal_templates`**: nome, conteúdo (markdown/html com variáveis), default flag.
- **Nova tabela `proposals`**: lead_id, client_id, template_id, billboards (array), valor, prazo, desconto, status (`draft | sent | accepted | rejected | expired`), valid_until, pdf_url, sent_at.
- Editor de proposta: seleciona lead + pontos + período → renderiza preview → gera PDF → salva em `contract-files` → link público assinado pra envio por WhatsApp.
- Quando aceita: botão "Converter em contrato" cria o `contract` com `contract_type='ad_sale'` automaticamente.

---

## Fase 3 — Régua de Renovação automática

- Job diário (`pg_cron` + edge function) que lê `contracts.end_date` onde `contract_type='ad_sale'`:
  - 60 dias antes → cria `activity` tipo `renewal_alert` (prioridade baixa)
  - 30 dias → prioridade média + cadência de renovação inicia
  - 15/7 dias → prioridade alta + notificação no sino
- Aba **DashboardHub → "Renovações"**: contratos vencendo agrupados por marco, com ações "renovar / perder / em negociação".
- Mesma lógica para `contract_type='land_lease'`: alerta de renovação de terreno (atinge o operacional).

---

## Fase 4 — Polimento

- Ranking de vendedores + comissionamento (já tem `seller_metrics`)
- Rotina semanal do Dono (SEG-SEX)
- Pixel/UTM/campanhas Meta

---

## Detalhes técnicos consolidados

### Schema novo
- `prospect_lists`, `prospects` (+ índice por `list_id` e `status`)
- `proposal_templates`, `proposals`
- `billboards.operational_status` (enum novo)
- `contracts.contract_type` (enum novo)
- `leads.prospect_id` (FK opcional)

### Triggers a corrigir
- `sync_billboard_status_from_contract` reescrito pra respeitar `contract_type`
- Novo trigger ao mover lead de estágio → cancela `lead_cadence_runs` antigo + cria novo

### Dependências novas
- `@react-pdf/renderer` (mídia kit + proposta)
- `papaparse` ou `xlsx` (importar listas)
- `leaflet-image` ou render estático via API (mapa no PDF)

### RLS
- Todas as novas tabelas com `has_role()` + `service_role`; sem anon.
- `prospects` visíveis ao vendedor atribuído + admin.

### Memória
- Atualizar `mem://features/regras-negocio` com a separação Terreno vs Anúncio.
- Criar `mem://features/crm/prospect-lists` documentando o fluxo Lista → Prospect → Lead → Cliente.

---

## Ordem de entrega sugerida

1. **Fase 0** (correção do bug) — 1 mensagem, prioridade máxima
2. **Fase 1.1** (Listas de prospecção + importador) — base do CRM
3. **Fase 2.3** (Modelo de proposta) — gera caixa rápido
4. **Fase 2.1** (Mídia kit por ponto)
5. **Fase 1.2 + 1.3** (Cadência por etapa + score)
6. **Fase 3** (Régua de renovação)
7. **Fase 2.2 + 1.4 + Fase 4**

Começo pela **Fase 0** assim que aprovado — é bug em produção mexendo na regra de ocupação.
