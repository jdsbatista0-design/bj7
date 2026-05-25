-- BJ7 MIGRATION 01 — Soft delete
BEGIN;
ALTER TABLE public.billboards         ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.clients            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.contracts          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.leads              ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.work_orders        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.financial_entries  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_billboards_active        ON public.billboards (id)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_active           ON public.clients (id)           WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_active         ON public.contracts (id)         WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_active             ON public.leads (id)             WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_active       ON public.work_orders (id)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_entries_active ON public.financial_entries (id) WHERE deleted_at IS NULL;
COMMENT ON COLUMN public.billboards.deleted_at IS 'Soft delete. NULL = ativo.';
COMMIT;

-- BJ7 MIGRATION 02 — Consolidar status do billboard
BEGIN;
UPDATE public.billboards SET status = commercial_status WHERE status IS NULL AND commercial_status IS NOT NULL;
ALTER TABLE public.billboards DROP COLUMN IF EXISTS commercial_status;
ALTER TABLE public.billboards
  ALTER COLUMN status SET DEFAULT 'available',
  ALTER COLUMN operational_status SET DEFAULT 'active';
ALTER TABLE public.billboards DROP CONSTRAINT IF EXISTS chk_billboard_status;
ALTER TABLE public.billboards DROP CONSTRAINT IF EXISTS chk_billboard_operational_status;
ALTER TABLE public.billboards ADD CONSTRAINT chk_billboard_status CHECK (status IN ('available','reserved','occupied'));
ALTER TABLE public.billboards ADD CONSTRAINT chk_billboard_operational_status CHECK (operational_status IN ('active','maintenance','discontinued'));
COMMIT;

-- BJ7 MIGRATION 03 — Campos comerciais
BEGIN;
ALTER TABLE public.billboards
  ADD COLUMN IF NOT EXISTS preco_minimo NUMERIC,
  ADD COLUMN IF NOT EXISTS preco_promocional NUMERIC,
  ADD COLUMN IF NOT EXISTS promocao_validade DATE,
  ADD COLUMN IF NOT EXISTS fonte_fluxo TEXT DEFAULT 'NAO_INFORMADO',
  ADD COLUMN IF NOT EXISTS fluxo_observacao TEXT,
  ADD COLUMN IF NOT EXISTS argumentos_comerciais TEXT[],
  ADD COLUMN IF NOT EXISTS empresas_ideais TEXT[],
  ADD COLUMN IF NOT EXISTS cta_ideal TEXT,
  ADD COLUMN IF NOT EXISTS responsavel_comercial UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS observacoes_internas TEXT;
ALTER TABLE public.billboards DROP CONSTRAINT IF EXISTS chk_fonte_fluxo;
ALTER TABLE public.billboards ADD CONSTRAINT chk_fonte_fluxo CHECK (fonte_fluxo IN ('DNIT','DER-PR','DEINFRA-SC','Concessionaria','Estimativa interna','NAO_INFORMADO'));
COMMIT;

-- BJ7 MIGRATION 04 — Trigger sync billboard ↔ contract
BEGIN;
CREATE OR REPLACE FUNCTION public.sync_billboard_status_from_contract()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bid UUID;
BEGIN
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    IF NEW.billboard_ids IS NOT NULL THEN
      FOREACH bid IN ARRAY NEW.billboard_ids LOOP
        UPDATE public.billboards SET status = 'occupied' WHERE id = bid AND deleted_at IS NULL;
      END LOOP;
    END IF;
  END IF;
  IF NEW.status IN ('cancelled','expired') AND TG_OP = 'UPDATE' AND OLD.status = 'active' THEN
    IF OLD.billboard_ids IS NOT NULL THEN
      FOREACH bid IN ARRAY OLD.billboard_ids LOOP
        IF NOT EXISTS (SELECT 1 FROM public.contracts WHERE bid = ANY(billboard_ids) AND status = 'active' AND id != NEW.id AND deleted_at IS NULL) THEN
          UPDATE public.billboards SET status = 'available' WHERE id = bid AND deleted_at IS NULL;
        END IF;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_billboard_from_contract ON public.contracts;
CREATE TRIGGER trg_sync_billboard_from_contract AFTER INSERT OR UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.sync_billboard_status_from_contract();
COMMIT;

-- BJ7 MIGRATION 05 — Audit log
BEGIN;
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_record ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON public.audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_log(changed_by);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admin can read audit log" ON public.audit_log;
CREATE POLICY "Only admin can read audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "No direct writes to audit log" ON public.audit_log;
CREATE POLICY "No direct writes to audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (false);
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT u.id INTO v_user_id FROM auth.users u WHERE u.id = auth.uid();
  INSERT INTO public.audit_log(table_name, record_id, action, changed_by, old_data, new_data)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, v_user_id,
    CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END);
  RETURN COALESCE(NEW, OLD);
END;
$$;
DROP TRIGGER IF EXISTS audit_contracts ON public.contracts;
DROP TRIGGER IF EXISTS audit_financial_entries ON public.financial_entries;
DROP TRIGGER IF EXISTS audit_billboards ON public.billboards;
CREATE TRIGGER audit_contracts AFTER INSERT OR UPDATE OR DELETE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_financial_entries AFTER INSERT OR UPDATE OR DELETE ON public.financial_entries FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_billboards AFTER INSERT OR UPDATE OR DELETE ON public.billboards FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
COMMIT;

-- BJ7 MIGRATION 06 — Camada comercial
BEGIN;
DO $$ BEGIN CREATE TYPE public.activity_type AS ENUM ('call','whatsapp','email','meeting','visit','proposal_sent','document_sent','follow_up','note'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.activity_outcome AS ENUM ('completed','no_answer','reschedule','positive','negative','neutral'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.comm_channel AS ENUM ('whatsapp','email','instagram_dm','sms','phone','web_form'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.comm_direction AS ENUM ('in','out'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.comm_status AS ENUM ('queued','sent','delivered','read','replied','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.activity_type NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  duration_minutes INTEGER,
  outcome public.activity_outcome,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chk_activity_lead_or_client CHECK ((lead_id IS NOT NULL) OR (client_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON public.activities(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_client ON public.activities(client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, completed_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_recent ON public.activities(completed_at DESC) WHERE deleted_at IS NULL;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage activities" ON public.activities;
CREATE POLICY "Authenticated can manage activities" ON public.activities FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel public.comm_channel NOT NULL,
  direction public.comm_direction NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  sent_by UUID REFERENCES auth.users(id),
  is_automated BOOLEAN DEFAULT FALSE,
  cadence_run_id UUID,
  subject TEXT,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status public.comm_status DEFAULT 'queued',
  external_id TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_comm_lead_or_client CHECK ((lead_id IS NOT NULL) OR (client_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_comm_lead ON public.communications(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_client ON public.communications(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_external ON public.communications(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comm_inbound ON public.communications(direction, created_at DESC) WHERE direction = 'in';
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can manage communications" ON public.communications;
CREATE POLICY "Authenticated can manage communications" ON public.communications FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.seller_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  snapshot_date DATE NOT NULL,
  activities_count INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  proposals_sent INTEGER DEFAULT 0,
  meetings_held INTEGER DEFAULT 0,
  leads_received INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_in_proposal INTEGER DEFAULT 0,
  leads_closed INTEGER DEFAULT 0,
  leads_lost INTEGER DEFAULT 0,
  avg_first_response_minutes INTEGER,
  avg_qualification_hours INTEGER,
  avg_close_days INTEGER,
  revenue_generated NUMERIC DEFAULT 0,
  avg_ticket NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);
CREATE INDEX IF NOT EXISTS idx_seller_metrics_date ON public.seller_metrics(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_seller_metrics_user ON public.seller_metrics(user_id, snapshot_date DESC);
ALTER TABLE public.seller_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own metrics, admin sees all" ON public.seller_metrics;
CREATE POLICY "Users see own metrics, admin sees all" ON public.seller_metrics FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR user_id = auth.uid());
DROP POLICY IF EXISTS "Admin manages metrics" ON public.seller_metrics;
CREATE POLICY "Admin manages metrics" ON public.seller_metrics FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
COMMIT;

-- BJ7 MIGRATION 07 — Camada marketing
BEGIN;
DO $$ BEGIN CREATE TYPE public.cadence_trigger AS ENUM ('lead_created','lead_qualified','proposal_sent','contract_signed','lead_lost','contract_expiring','manual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.cadence_run_status AS ENUM ('running','paused_by_response','paused_manually','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.content_format AS ENUM ('post_feed','carousel','reel','story','ad','live'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.content_status AS ENUM ('idea','script','art','review','approved','scheduled','published','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.content_pillar AS ENUM ('vitrine','case','bastidor','educativo','comparativo','sazonal','nicho','institucional','comercial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.campaign_objective AS ENUM ('awareness','traffic','engagement','leads','messages','conversions','sales'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.campaign_status AS ENUM ('draft','active','paused','completed','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.cadences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger public.cadence_trigger NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.cadence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cadence_id UUID NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  channel public.comm_channel NOT NULL,
  prompt_code TEXT NOT NULL,
  template TEXT,
  advance_if_no_response BOOLEAN DEFAULT TRUE,
  UNIQUE(cadence_id, step_order)
);
CREATE INDEX IF NOT EXISTS idx_cadence_steps_cadence ON public.cadence_steps(cadence_id, step_order);

CREATE TABLE IF NOT EXISTS public.lead_cadence_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  cadence_id UUID NOT NULL REFERENCES public.cadences(id),
  current_step INTEGER DEFAULT 0,
  status public.cadence_run_status DEFAULT 'running',
  next_run_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT chk_run_lead_or_client CHECK ((lead_id IS NOT NULL) OR (client_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_cadence_runs_next ON public.lead_cadence_runs(next_run_at) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_cadence_runs_lead ON public.lead_cadence_runs(lead_id);
CREATE INDEX IF NOT EXISTS idx_cadence_runs_client ON public.lead_cadence_runs(client_id);

ALTER TABLE public.communications DROP CONSTRAINT IF EXISTS fk_comm_cadence_run;
ALTER TABLE public.communications ADD CONSTRAINT fk_comm_cadence_run FOREIGN KEY (cadence_run_id) REFERENCES public.lead_cadence_runs(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  format public.content_format NOT NULL,
  pillar public.content_pillar NOT NULL,
  status public.content_status DEFAULT 'idea',
  billboard_ids UUID[],
  client_id UUID REFERENCES public.clients(id),
  title TEXT,
  copy TEXT,
  script TEXT,
  hashtags TEXT[],
  drive_url TEXT,
  thumbnail_url TEXT,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_post_id TEXT,
  reach INTEGER,
  impressions INTEGER,
  engagement INTEGER,
  saves INTEGER,
  shares INTEGER,
  leads_generated INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contents_status ON public.contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_scheduled ON public.contents(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_contents_pillar ON public.contents(pillar);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  objective public.campaign_objective NOT NULL,
  status public.campaign_status DEFAULT 'draft',
  audience_description TEXT,
  audience_config JSONB DEFAULT '{}'::jsonb,
  daily_budget NUMERIC,
  total_budget NUMERIC,
  spent_to_date NUMERIC DEFAULT 0,
  starts_at DATE,
  ends_at DATE,
  meta_campaign_id TEXT,
  meta_account_id TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversations INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  contracts_attributed INTEGER DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_meta ON public.campaigns(meta_campaign_id) WHERE meta_campaign_id IS NOT NULL;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content TEXT;

CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  performance_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_prompts_code ON public.prompts(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_prompts_active ON public.prompts(is_active);

CREATE TABLE IF NOT EXISTS public.prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  template TEXT NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  archived_by UUID REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt ON public.prompt_history(prompt_id, version DESC);

ALTER TABLE public.cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_cadence_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated manage cadences" ON public.cadences;
DROP POLICY IF EXISTS "Authenticated manage cadence_steps" ON public.cadence_steps;
DROP POLICY IF EXISTS "Authenticated manage lead_cadence_runs" ON public.lead_cadence_runs;
DROP POLICY IF EXISTS "Authenticated manage contents" ON public.contents;
DROP POLICY IF EXISTS "Authenticated manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated manage prompts" ON public.prompts;
DROP POLICY IF EXISTS "Authenticated read prompt_history" ON public.prompt_history;

CREATE POLICY "Authenticated manage cadences" ON public.cadences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage cadence_steps" ON public.cadence_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage lead_cadence_runs" ON public.lead_cadence_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage contents" ON public.contents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage prompts" ON public.prompts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read prompt_history" ON public.prompt_history FOR SELECT TO authenticated USING (true);
COMMIT;