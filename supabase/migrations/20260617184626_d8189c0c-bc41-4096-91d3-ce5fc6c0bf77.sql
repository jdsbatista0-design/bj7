
DO $$ BEGIN
  CREATE TYPE public.contract_type_enum AS ENUM ('land_lease', 'ad_sale');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.operational_status_enum AS ENUM ('planned', 'active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS contract_type public.contract_type_enum NOT NULL DEFAULT 'ad_sale';

ALTER TABLE public.billboards
  ADD COLUMN IF NOT EXISTS operational_status public.operational_status_enum NOT NULL DEFAULT 'active';

CREATE OR REPLACE FUNCTION public.sync_billboard_status_from_contract()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE bid_text TEXT; bid UUID;
BEGIN
  IF NEW.contract_type = 'ad_sale' THEN
    IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
      IF NEW.billboard_ids IS NOT NULL THEN
        FOREACH bid_text IN ARRAY NEW.billboard_ids LOOP
          BEGIN bid := bid_text::uuid; EXCEPTION WHEN OTHERS THEN CONTINUE; END;
          UPDATE public.billboards SET status = 'occupied' WHERE id = bid AND deleted_at IS NULL;
        END LOOP;
      END IF;
    END IF;

    IF NEW.status IN ('cancelled','expired') AND TG_OP = 'UPDATE' AND OLD.status = 'active' THEN
      IF OLD.billboard_ids IS NOT NULL THEN
        FOREACH bid_text IN ARRAY OLD.billboard_ids LOOP
          BEGIN bid := bid_text::uuid; EXCEPTION WHEN OTHERS THEN CONTINUE; END;
          IF NOT EXISTS (
            SELECT 1 FROM public.contracts
            WHERE bid_text = ANY(billboard_ids)
              AND status = 'active'
              AND contract_type = 'ad_sale'
              AND id != NEW.id
              AND deleted_at IS NULL
          ) THEN
            UPDATE public.billboards SET status = 'available' WHERE id = bid AND deleted_at IS NULL;
          END IF;
        END LOOP;
      END IF;
    END IF;
  END IF;

  IF NEW.contract_type = 'land_lease' THEN
    IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
      IF NEW.billboard_ids IS NOT NULL THEN
        FOREACH bid_text IN ARRAY NEW.billboard_ids LOOP
          BEGIN bid := bid_text::uuid; EXCEPTION WHEN OTHERS THEN CONTINUE; END;
          UPDATE public.billboards SET operational_status = 'active' WHERE id = bid AND deleted_at IS NULL;
        END LOOP;
      END IF;
    END IF;

    IF NEW.status IN ('cancelled','expired') AND TG_OP = 'UPDATE' AND OLD.status = 'active' THEN
      IF OLD.billboard_ids IS NOT NULL THEN
        FOREACH bid_text IN ARRAY OLD.billboard_ids LOOP
          BEGIN bid := bid_text::uuid; EXCEPTION WHEN OTHERS THEN CONTINUE; END;
          IF NOT EXISTS (
            SELECT 1 FROM public.contracts
            WHERE bid_text = ANY(billboard_ids)
              AND status = 'active'
              AND contract_type = 'land_lease'
              AND id != NEW.id
              AND deleted_at IS NULL
          ) THEN
            UPDATE public.billboards SET operational_status = 'inactive' WHERE id = bid AND deleted_at IS NULL;
          END IF;
        END LOOP;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_billboard_status_from_contract ON public.contracts;
CREATE TRIGGER trg_sync_billboard_status_from_contract
AFTER INSERT OR UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.sync_billboard_status_from_contract();

-- Liberar painéis marcados como occupied que não têm contrato ad_sale ativo
UPDATE public.billboards b
SET status = 'available'
WHERE b.status = 'occupied'
  AND NOT EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE b.id::text = ANY(c.billboard_ids)
      AND c.status = 'active'
      AND c.contract_type = 'ad_sale'
      AND c.deleted_at IS NULL
  );
