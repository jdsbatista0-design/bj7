-- =============================================================
-- BJ7 MIGRATION 06 — Camada comercial dinâmica
-- =============================================================
-- O que faz: cria 3 tabelas que sustentam medição de esforço
-- comercial, timeline de comunicações e snapshot por vendedor.
--
-- Tabelas criadas:
--   - activities       (toda ação comercial: ligação, msg, visita)
--   - communications   (toda mensagem enviada/recebida)
--   - seller_metrics   (snapshot diário por vendedor)
--
-- Sem essas tabelas, você só mede resultado. Com elas, mede esforço.
-- =============================================================

BEGIN;

-- =============================================================
-- 1. ENUMS — tipos de atividade e canal de comunicação
-- =============================================================

DO $$ BEGIN
  CREATE TYPE public.activity_type AS ENUM (
    'call', 'whatsapp', 'email', 'meeting', 'visit',
    'proposal_sent', 'document_sent', 'follow_up', 'note'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.activity_outcome AS ENUM (
    'completed', 'no_answer', 'reschedule',
    'positive', 'negative', 'neutral'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.comm_channel AS ENUM (
    'whatsapp', 'email', 'instagram_dm', 'sms', 'phone', 'web_form'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.comm_direction AS ENUM ('in', 'out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.comm_status AS ENUM (
    'queued', 'sent', 'delivered', 'read', 'replied', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================
-- 2. TABELA: activities (esforço comercial)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.activities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             public.activity_type NOT NULL,

  -- Polimórfico: relaciona com lead OU client (CHECK garante um dos dois)
  lead_id          UUID REFERENCES public.leads(id)   ON DELETE CASCADE,
  client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE,

  -- Quem fez
  user_id          UUID NOT NULL REFERENCES auth.users(id),

  -- Detalhes da ação
  duration_minutes INTEGER,
  outcome          public.activity_outcome,
  notes            TEXT,

  -- Para visitas e reuniões agendadas
  scheduled_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ DEFAULT NOW(),

  -- Auditoria
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,

  CONSTRAINT chk_activity_lead_or_client
    CHECK ((lead_id IS NOT NULL) OR (client_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_activities_lead      ON public.activities(lead_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_client    ON public.activities(client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, completed_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_recent    ON public.activities(completed_at DESC) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage activities" ON public.activities;
CREATE POLICY "Authenticated can manage activities"
  ON public.activities FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================
-- 3. TABELA: communications (timeline de mensagens)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.communications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel          public.comm_channel NOT NULL,
  direction        public.comm_direction NOT NULL,

  lead_id          UUID REFERENCES public.leads(id)   ON DELETE CASCADE,
  client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE,

  -- Autor (humano ou automação)
  sent_by          UUID REFERENCES auth.users(id),
  is_automated     BOOLEAN DEFAULT FALSE,
  cadence_run_id   UUID, -- FK virá depois (migration 07)

  -- Conteúdo
  subject          TEXT,
  content          TEXT NOT NULL,
  attachments      JSONB DEFAULT '[]'::jsonb,

  -- Status e tracking
  status           public.comm_status DEFAULT 'queued',
  external_id      TEXT,  -- ID no provedor (WhatsApp message ID etc)

  -- Timeline detalhada
  sent_at          TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  read_at          TIMESTAMPTZ,
  replied_at       TIMESTAMPTZ,

  created_at       TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_comm_lead_or_client
    CHECK ((lead_id IS NOT NULL) OR (client_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_comm_lead       ON public.communications(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_client     ON public.communications(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_external   ON public.communications(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comm_inbound    ON public.communications(direction, created_at DESC) WHERE direction = 'in';

-- RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage communications" ON public.communications;
CREATE POLICY "Authenticated can manage communications"
  ON public.communications FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================
-- 4. TABELA: seller_metrics (snapshot diário)
-- =============================================================
-- Atualizada por n8n às 23h. Evita queries pesadas em tempo real.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.seller_metrics (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id),
  snapshot_date               DATE NOT NULL,

  -- Volume de esforço
  activities_count            INTEGER DEFAULT 0,
  calls_made                  INTEGER DEFAULT 0,
  messages_sent               INTEGER DEFAULT 0,
  proposals_sent              INTEGER DEFAULT 0,
  meetings_held               INTEGER DEFAULT 0,

  -- Movimentação no funil
  leads_received              INTEGER DEFAULT 0,
  leads_qualified             INTEGER DEFAULT 0,
  leads_in_proposal           INTEGER DEFAULT 0,
  leads_closed                INTEGER DEFAULT 0,
  leads_lost                  INTEGER DEFAULT 0,

  -- Performance
  avg_first_response_minutes  INTEGER,
  avg_qualification_hours     INTEGER,
  avg_close_days              INTEGER,

  -- Receita
  revenue_generated           NUMERIC DEFAULT 0,
  avg_ticket                  NUMERIC DEFAULT 0,

  created_at                  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_seller_metrics_date ON public.seller_metrics(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_seller_metrics_user ON public.seller_metrics(user_id, snapshot_date DESC);

-- RLS
ALTER TABLE public.seller_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own metrics, admin sees all" ON public.seller_metrics;
CREATE POLICY "Users see own metrics, admin sees all"
  ON public.seller_metrics FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admin manages metrics" ON public.seller_metrics;
CREATE POLICY "Admin manages metrics"
  ON public.seller_metrics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Comentários
COMMENT ON TABLE public.activities IS
  'Cada ação comercial registrada. Base para métricas de esforço por vendedor.';
COMMENT ON TABLE public.communications IS
  'Timeline completa de mensagens trocadas (manual ou automatizada).';
COMMENT ON TABLE public.seller_metrics IS
  'Snapshot diário pré-calculado por user. Atualizado por n8n às 23h.';

COMMIT;

-- =============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- =============================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('activities', 'communications', 'seller_metrics');
--
-- Resultado esperado: 3 linhas.
-- =============================================================
