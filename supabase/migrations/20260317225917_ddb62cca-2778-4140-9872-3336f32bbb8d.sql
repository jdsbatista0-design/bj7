
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS segment text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_person text DEFAULT '',
  ADD COLUMN IF NOT EXISTS land_registry text DEFAULT '',
  ADD COLUMN IF NOT EXISTS property_area text DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_info text DEFAULT '';
