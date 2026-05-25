-- =============================================================
-- BJ7 MIGRATION 07 — Camada de marketing e nutrição
-- =============================================================
-- O que faz: cria as tabelas que sustentam cadências de
-- atendimento, máquina de conteúdo, tracking de Meta Ads e
-- biblioteca de prompts versionados.
--
-- Tabelas criadas:
--   - cadences            (templates de sequência)
--   - cadence_steps       (passos de cada sequência)
--   - lead_cadence_runs   (instância rodando em um lead)
--   - contents            (pipeline editorial)
--   - campaigns           (Meta Ads tracking)
--   - prompts             (biblioteca de prompts da IA)
--   - prompt_history      (versionamento de prompts)
-- =============================================================

BEGIN;

-- =============================================================
-- 1. ENUMS de marketing
-- =============================================================

DO $$ BEGIN
  CREATE TYPE public.cadence_trigger AS ENUM (
    'lead_created', 'lead_qualified', 'proposal_sent',
    'contract_signed', 'lead_lost', 'contract_expiring',
    'manual'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cadence_run_status AS ENUM (
    'running', 'paused_by_response', 'paused_manually',
    'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_format AS ENUM (
    'post_feed', 'carousel', 'reel', 'story', 'ad', 'live'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM (
    'idea', 'script', 'art', 'review', 'approved',
    'scheduled', 'published', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_pillar AS ENUM (
    'vitrine', 'case', 'bastidor', 'educativo', 'comparativo',
    'sazonal', 'nicho', 'institucional', 'comercial'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.campaign_objective AS ENUM (
    'awareness', 'traffic', 'engagement', 'leads',
    'messages', 'conversions', 'sales'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.campaign_status AS ENUM (
    'draft', 'active', 'paused', 'completed', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================
-- 2. TABELA: cadences (templates)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.cadences (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  description         TEXT,
  trigger             public.cadence_trigger NOT NULL,
  is_active           BOOLEAN DEFAULT TRUE,
  trigger_conditions  JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 3. TABELA: cadence_steps (passos)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.cadence_steps (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cadence_id               UUID NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  step_order               INTEGER NOT NULL,
  delay_hours              INTEGER NOT NULL DEFAULT 0,
  channel                  public.comm_channel NOT NULL,
  prompt_code              TEXT NOT NULL,
  template                 TEXT,
  advance_if_no_response   BOOLEAN DEFAULT TRUE,
  UNIQUE(cadence_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_cadence_steps_cadence ON public.cadence_steps(cadence_id, step_order);

-- =============================================================
-- 4. TABELA: lead_cadence_runs (instâncias rodando)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.lead_cadence_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID REFERENCES public.leads(id)   ON DELETE CASCADE,
  client_id     UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  cadence_id    UUID NOT NULL REFERENCES public.cadences(id),

  current_step  INTEGER DEFAULT 0,
  status        public.cadence_run_status DEFAULT 'running',
  next_run_at   TIMESTAMPTZ,

  started_at    TIMESTAMPTZ DEFAULT NOW(),
  paused_at     TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,

  CONSTRAINT chk_run_lead_or_client
    CHECK ((lead_id IS NOT NULL) OR (client_id IS NOT NULL))
);

-- Índice CRÍTICO: n8n consulta isso a cada 15 minutos
CREATE INDEX IF NOT EXISTS idx_cadence_runs_next
  ON public.lead_cadence_runs(next_run_at)
  WHERE status = 'running';

CREATE INDEX IF NOT EXISTS idx_cadence_runs_lead   ON public.lead_cadence_runs(lead_id);
CREATE INDEX IF NOT EXISTS idx_cadence_runs_client ON public.lead_cadence_runs(client_id);

-- Agora pode adicionar a FK em communications (referenciada na migration 06)
ALTER TABLE public.communications
  DROP CONSTRAINT IF EXISTS fk_comm_cadence_run;
ALTER TABLE public.communications
  ADD CONSTRAINT fk_comm_cadence_run
    FOREIGN KEY (cadence_run_id) REFERENCES public.lead_cadence_runs(id) ON DELETE SET NULL;

-- =============================================================
-- 5. TABELA: contents (pipeline editorial)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.contents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  format            public.content_format NOT NULL,
  pillar            public.content_pillar NOT NULL,
  status            public.content_status DEFAULT 'idea',

  -- Referências
  billboard_ids     UUID[],
  client_id         UUID REFERENCES public.clients(id),

  -- Conteúdo
  title             TEXT,
  copy              TEXT,
  script            TEXT,
  hashtags          TEXT[],

  -- Arte
  drive_url         TEXT,
  thumbnail_url     TEXT,

  -- Agendamento
  scheduled_for     TIMESTAMPTZ,
  published_at      TIMESTAMPTZ,
  external_post_id  TEXT,

  -- Performance
  reach             INTEGER,
  impressions       INTEGER,
  engagement        INTEGER,
  saves             INTEGER,
  shares            INTEGER,
  leads_generated   INTEGER DEFAULT 0,

  -- Auditoria
  created_by        UUID REFERENCES auth.users(id),
  approved_by       UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contents_status    ON public.contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_scheduled ON public.contents(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_contents_pillar    ON public.contents(pillar);

-- =============================================================
-- 6. TABELA: campaigns (Meta Ads tracking)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  objective              public.campaign_objective NOT NULL,
  status                 public.campaign_status DEFAULT 'draft',

  -- Segmentação
  audience_description   TEXT,
  audience_config        JSONB DEFAULT '{}'::jsonb,

  -- Verba
  daily_budget           NUMERIC,
  total_budget           NUMERIC,
  spent_to_date          NUMERIC DEFAULT 0,

  -- Datas
  starts_at              DATE,
  ends_at                DATE,

  -- IDs externos (Meta)
  meta_campaign_id       TEXT,
  meta_account_id        TEXT,

  -- Métricas (atualizadas pelo n8n)
  impressions            INTEGER DEFAULT 0,
  clicks                 INTEGER DEFAULT 0,
  conversations          INTEGER DEFAULT 0,
  leads_generated        INTEGER DEFAULT 0,
  contracts_attributed   INTEGER DEFAULT 0,
  revenue_attributed     NUMERIC DEFAULT 0,

  last_synced_at         TIMESTAMPTZ,

  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_meta   ON public.campaigns(meta_campaign_id) WHERE meta_campaign_id IS NOT NULL;

-- Adicionar atribuição UTM e campanha em leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id  UUID REFERENCES public.campaigns(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source   TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium   TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content  TEXT;

-- =============================================================
-- 7. TABELA: prompts (biblioteca versionada)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.prompts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT UNIQUE NOT NULL,    -- ex: 'VITRINE_PONTO'
  category          TEXT NOT NULL,
  description       TEXT,
  template          TEXT NOT NULL,
  variables         TEXT[] DEFAULT '{}',
  version           INTEGER DEFAULT 1,
  is_active         BOOLEAN DEFAULT TRUE,
  performance_data  JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_prompts_code   ON public.prompts(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_prompts_active ON public.prompts(is_active);

-- =============================================================
-- 8. TABELA: prompt_history (arquivo de versões antigas)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.prompt_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id     UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  version       INTEGER NOT NULL,
  template      TEXT NOT NULL,
  archived_at   TIMESTAMPTZ DEFAULT NOW(),
  archived_by   UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt ON public.prompt_history(prompt_id, version DESC);

-- =============================================================
-- 9. RLS — habilitar e criar policies
-- =============================================================

ALTER TABLE public.cadences           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_steps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_cadence_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history     ENABLE ROW LEVEL SECURITY;

-- Policies abertas para authenticated (será refinado depois com roles)
DROP POLICY IF EXISTS "Authenticated manage cadences"          ON public.cadences;
DROP POLICY IF EXISTS "Authenticated manage cadence_steps"     ON public.cadence_steps;
DROP POLICY IF EXISTS "Authenticated manage lead_cadence_runs" ON public.lead_cadence_runs;
DROP POLICY IF EXISTS "Authenticated manage contents"          ON public.contents;
DROP POLICY IF EXISTS "Authenticated manage campaigns"         ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated manage prompts"           ON public.prompts;
DROP POLICY IF EXISTS "Authenticated read prompt_history"      ON public.prompt_history;

CREATE POLICY "Authenticated manage cadences"          ON public.cadences          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage cadence_steps"     ON public.cadence_steps     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage lead_cadence_runs" ON public.lead_cadence_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage contents"          ON public.contents          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage campaigns"         ON public.campaigns         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage prompts"           ON public.prompts           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read prompt_history"      ON public.prompt_history    FOR SELECT TO authenticated USING (true);

-- =============================================================
-- 10. Comentários
-- =============================================================

COMMENT ON TABLE public.cadences IS
  'Templates de cadência: cada cadência é uma sequência reutilizável de mensagens disparada por um evento.';
COMMENT ON TABLE public.lead_cadence_runs IS
  'Instâncias rodando: cada vez que um lead/cliente entra em uma cadência, vira uma run. n8n consulta next_run_at a cada 15 min.';
COMMENT ON TABLE public.contents IS
  'Pipeline editorial completo: do estado IDEIA até PUBLICADO + métricas pós-publicação.';
COMMENT ON TABLE public.campaigns IS
  'Tracking de campanhas Meta Ads. Métricas atualizadas via n8n. Atribuição de leads via lead.campaign_id.';
COMMENT ON TABLE public.prompts IS
  'Biblioteca de prompts da IA. Versionados. performance_data acumula resultado para otimização.';

COMMIT;

-- =============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- =============================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('cadences', 'cadence_steps', 'lead_cadence_runs',
--                      'contents', 'campaigns', 'prompts', 'prompt_history');
--
-- Resultado esperado: 7 linhas.
-- =============================================================
