-- =============================================================
-- BJ7 MIGRATION 01 — Soft delete
-- =============================================================
-- O que faz: adiciona coluna deleted_at em todas as tabelas
-- operacionais. Em vez de apagar de verdade, marcamos como
-- "apagado". Permite reverter, auditar, e atender LGPD.
--
-- IMPORTANTE: depois desta migration, você precisa atualizar
-- o código React para filtrar `WHERE deleted_at IS NULL` em
-- todas as queries. Sem isso, o usuário vê registros "apagados".
-- =============================================================

BEGIN;

-- 1. Adicionar coluna deleted_at em todas as tabelas operacionais
ALTER TABLE public.billboards         ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.clients            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.contracts          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.leads              ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.work_orders        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.financial_entries  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Índices parciais (mais rápido que filtrar tudo)
CREATE INDEX IF NOT EXISTS idx_billboards_active        ON public.billboards (id)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_active           ON public.clients (id)           WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_active         ON public.contracts (id)         WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_active             ON public.leads (id)             WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_active       ON public.work_orders (id)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_entries_active ON public.financial_entries (id) WHERE deleted_at IS NULL;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.billboards.deleted_at IS
  'Soft delete. NULL = ativo. Não NULL = apagado em tal data. Filtrar nas queries.';

COMMIT;

-- =============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- =============================================================
-- Rode a query abaixo para confirmar que tudo funcionou:
--
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE column_name = 'deleted_at' AND table_schema = 'public'
-- ORDER BY table_name;
--
-- Resultado esperado: 6 linhas (billboards, clients, contracts,
-- leads, work_orders, financial_entries).
-- =============================================================
