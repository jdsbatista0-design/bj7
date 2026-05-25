-- =============================================================
-- BJ7 MIGRATION 05 — Audit log
-- =============================================================
-- O que faz: cria sistema de auditoria que registra TODA mudança
-- (INSERT, UPDATE, DELETE) nas tabelas críticas. Quem mudou, quando,
-- valor antes, valor depois. Tudo em uma tabela única.
--
-- Por que: você é o cara que acabou de auditar 30 meses do Stone.
-- Sabe o valor de ter histórico. Em mídia OOH com contratos longos,
-- "quem mudou o preço do contrato X?" é pergunta real.
--
-- Tabelas auditadas: contracts, financial_entries, billboards
-- (As 3 que mais doem se alguém mexer escondido)
-- =============================================================

BEGIN;

-- 1. Tabela que guarda o histórico
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by  UUID REFERENCES auth.users(id),
  old_data    JSONB,
  new_data    JSONB,
  changed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_audit_record ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_date   ON public.audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON public.audit_log(changed_by);

-- 3. RLS — só admin pode ler
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admin can read audit log" ON public.audit_log;
CREATE POLICY "Only admin can read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Ninguém pode escrever via API (apenas trigger via SECURITY DEFINER pode)
DROP POLICY IF EXISTS "No direct writes to audit log" ON public.audit_log;
CREATE POLICY "No direct writes to audit log"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (false);

-- 4. Função genérica de auditoria
-- Resiliente: se auth.uid() retornar user inexistente (ex: service_role,
-- background job), grava NULL em changed_by em vez de falhar.
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Pega user atual SE existe em auth.users; senão NULL.
  -- Evita falha em background jobs e service_role calls.
  SELECT u.id INTO v_user_id
    FROM auth.users u
   WHERE u.id = auth.uid();

  INSERT INTO public.audit_log(
    table_name, record_id, action, changed_by, old_data, new_data
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    v_user_id,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Aplicar trigger nas tabelas críticas
DROP TRIGGER IF EXISTS audit_contracts         ON public.contracts;
DROP TRIGGER IF EXISTS audit_financial_entries ON public.financial_entries;
DROP TRIGGER IF EXISTS audit_billboards        ON public.billboards;

CREATE TRIGGER audit_contracts
  AFTER INSERT OR UPDATE OR DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_financial_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_billboards
  AFTER INSERT OR UPDATE OR DELETE ON public.billboards
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

COMMIT;

-- =============================================================
-- VERIFICAÇÃO E USO
-- =============================================================
-- Ver últimas 20 mudanças:
--   SELECT * FROM public.audit_log
--   ORDER BY changed_at DESC LIMIT 20;
--
-- Ver histórico de um contrato específico:
--   SELECT * FROM public.audit_log
--   WHERE table_name = 'contracts' AND record_id = '<uuid-contrato>'
--   ORDER BY changed_at DESC;
--
-- Ver quem mexeu em preço de painel hoje:
--   SELECT changed_by, old_data->>'price' as preco_antes,
--          new_data->>'price' as preco_depois, changed_at
--   FROM public.audit_log
--   WHERE table_name = 'billboards' AND action = 'UPDATE'
--     AND DATE(changed_at) = CURRENT_DATE
--     AND old_data->>'price' IS DISTINCT FROM new_data->>'price';
-- =============================================================
