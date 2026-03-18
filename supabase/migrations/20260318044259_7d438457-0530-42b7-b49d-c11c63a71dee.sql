
-- 1. Add new columns to billboards
ALTER TABLE public.billboards 
  ADD COLUMN IF NOT EXISTS title text DEFAULT '',
  ADD COLUMN IF NOT EXISTS short_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS commercial_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS maps_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_street_view_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS width numeric DEFAULT 9,
  ADD COLUMN IF NOT EXISTS height numeric DEFAULT 3,
  ADD COLUMN IF NOT EXISTS illumination text DEFAULT 'nao',
  ADD COLUMN IF NOT EXISTS main_photo text DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS commercial_status text DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS operational_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS show_on_site boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- 2. Create storage bucket for billboard photos
INSERT INTO storage.buckets (id, name, public) VALUES ('billboard-photos', 'billboard-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for billboard-photos bucket
CREATE POLICY "Public can view billboard photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'billboard-photos');
CREATE POLICY "Authenticated can upload billboard photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'billboard-photos');
CREATE POLICY "Authenticated can update billboard photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'billboard-photos');
CREATE POLICY "Authenticated can delete billboard photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'billboard-photos');

-- 3. Create storage bucket for contract attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('contract-files', 'contract-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated can view contract files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'contract-files');
CREATE POLICY "Authenticated can upload contract files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contract-files');
CREATE POLICY "Authenticated can delete contract files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'contract-files');

-- 4. Add notes column to contracts
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

-- 5. Create financial_entries table
CREATE TABLE IF NOT EXISTS public.financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'operacional',
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'expense',
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  billboard_id uuid REFERENCES public.billboards(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage financial_entries" ON public.financial_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Add contract_id and client_id to work_orders
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
