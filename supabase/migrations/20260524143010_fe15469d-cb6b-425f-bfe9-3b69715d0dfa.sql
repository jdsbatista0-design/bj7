-- =============================================================
-- BJ7 MIGRATION 02 — Consolidar status do billboard
-- =============================================================
-- O que faz: hoje existem 3 colunas de status no billboard
--   - status              (usado: available/reserved/occupied)
--   - commercial_status   (redundante com status)
--   - operational_status  (usado: active/maintenance/discontinued)
--
-- Esta migration remove a coluna commercial_status (redundante) e
-- adiciona constraints CHECK que documentam os valores válidos.
--
-- ⚠ ATENÇÃO: Se você está usando commercial_status em algum lugar
-- do código React, ATUALIZE ANTES de rodar esta migration.
-- Buscar no Lovable: "commercial_status"
-- =============================================================

BEGIN;

-- 1. (Opcional, defensivo) Copiar valor de commercial_status para
-- status se status estiver vazio. Garante que nenhum dado seja perdido.
UPDATE public.billboards
   SET status = commercial_status
 WHERE status IS NULL
   AND commercial_status IS NOT NULL;

-- 2. Remover commercial_status (redundante)
ALTER TABLE public.billboards DROP COLUMN IF EXISTS commercial_status;

-- 3. Garantir defaults sensatos
ALTER TABLE public.billboards
  ALTER COLUMN status            SET DEFAULT 'available',
  ALTER COLUMN operational_status SET DEFAULT 'active';

-- 4. Constraints CHECK (documenta valores válidos no banco)
-- Remover constraints antigas se existirem
ALTER TABLE public.billboards DROP CONSTRAINT IF EXISTS chk_billboard_status;
ALTER TABLE public.billboards DROP CONSTRAINT IF EXISTS chk_billboard_operational_status;

ALTER TABLE public.billboards
  ADD CONSTRAINT chk_billboard_status
    CHECK (status IN ('available', 'reserved', 'occupied'));

ALTER TABLE public.billboards
  ADD CONSTRAINT chk_billboard_operational_status
    CHECK (operational_status IN ('active', 'maintenance', 'discontinued'));

-- 5. Documentar para futuros mantenedores
COMMENT ON COLUMN public.billboards.status IS
  'Status comercial: available (livre para venda) | reserved (reservado, não fechou) | occupied (com contrato ativo)';
COMMENT ON COLUMN public.billboards.operational_status IS
  'Status operacional: active (funcionando) | maintenance (em manutenção) | discontinued (desativado)';

COMMIT;

-- =============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- =============================================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'billboards'
--   AND column_name IN ('status', 'operational_status', 'commercial_status');
--
-- Resultado esperado: 2 linhas (status e operational_status).
-- commercial_status NÃO deve aparecer.
-- =============================================================
