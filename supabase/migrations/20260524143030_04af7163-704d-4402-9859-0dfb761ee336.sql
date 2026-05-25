-- =============================================================
-- BJ7 MIGRATION 04 — Trigger: sync billboard ↔ contract
-- =============================================================
-- O que faz: move a lógica de atualizar status do painel do
-- código React (DataContext.tsx) para o banco. Vantagens:
--   1. Atomicidade: se o UPDATE falhar, nada acontece (rollback)
--   2. Consistência: funciona mesmo se a app não estiver aberta
--   3. Performance: 1 query do banco vs loop no client
--
-- Regras de negócio implementadas:
--   - Contrato vira 'active'       → painéis ficam 'occupied'
--   - Contrato vira 'cancelled'    → painéis voltam 'available'
--   - Contrato vira 'expired'      → painéis voltam 'available'
--
-- ⚠ DEPOIS DE RODAR: remover o loop manual em DataContext.tsx
-- (funções addContract e updateContract), senão o update vai
-- acontecer 2x (uma no client, outra no trigger). Inofensivo,
-- mas redundante.
-- =============================================================

BEGIN;

-- 1. Criar (ou substituir) a função do trigger
CREATE OR REPLACE FUNCTION public.sync_billboard_status_from_contract()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bid UUID;
BEGIN
  -- CASO 1: contrato virou 'active' → painéis viram 'occupied'
  IF NEW.status = 'active'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active')
  THEN
    IF NEW.billboard_ids IS NOT NULL THEN
      FOREACH bid IN ARRAY NEW.billboard_ids LOOP
        UPDATE public.billboards
           SET status = 'occupied'
         WHERE id = bid
           AND deleted_at IS NULL;
      END LOOP;
    END IF;
  END IF;

  -- CASO 2: contrato virou 'cancelled' ou 'expired' → painéis voltam 'available'
  IF NEW.status IN ('cancelled', 'expired')
     AND TG_OP = 'UPDATE'
     AND OLD.status = 'active'
  THEN
    IF OLD.billboard_ids IS NOT NULL THEN
      FOREACH bid IN ARRAY OLD.billboard_ids LOOP
        -- Só volta pra 'available' se não tiver OUTRO contrato ativo nele
        IF NOT EXISTS (
          SELECT 1 FROM public.contracts
           WHERE bid = ANY(billboard_ids)
             AND status = 'active'
             AND id != NEW.id
             AND deleted_at IS NULL
        ) THEN
          UPDATE public.billboards
             SET status = 'available'
           WHERE id = bid
             AND deleted_at IS NULL;
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Recriar o trigger (drop + create garante idempotência)
DROP TRIGGER IF EXISTS trg_sync_billboard_from_contract ON public.contracts;

CREATE TRIGGER trg_sync_billboard_from_contract
  AFTER INSERT OR UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_billboard_status_from_contract();

COMMIT;

-- =============================================================
-- TESTE DO TRIGGER
-- =============================================================
-- Para testar SEM afetar dados reais:
--
-- 1. Pegue um painel disponível qualquer:
--    SELECT id, code, status FROM public.billboards
--    WHERE status = 'available' LIMIT 1;
--
-- 2. Crie contrato de teste com ele:
--    INSERT INTO public.contracts (type, client_name, billboard_ids,
--      start_date, end_date, monthly_value, total_value, status)
--    VALUES ('veiculacao', 'TESTE TRIGGER',
--            ARRAY['<o-uuid-do-painel>']::uuid[],
--            CURRENT_DATE, CURRENT_DATE + 30, 1000, 1000, 'active');
--
-- 3. Verifique se o painel ficou 'occupied':
--    SELECT id, status FROM public.billboards WHERE id = '<uuid>';
--
-- 4. Apague o contrato de teste:
--    DELETE FROM public.contracts WHERE client_name = 'TESTE TRIGGER';
--    UPDATE public.billboards SET status = 'available' WHERE id = '<uuid>';
-- =============================================================
