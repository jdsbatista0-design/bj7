
-- 1. Public-safe view for billboards (marketing-safe columns only)
CREATE OR REPLACE VIEW public.public_billboards
WITH (security_invoker = true) AS
SELECT id, code, title, short_description, commercial_description,
  lat, lng, city, region, route, address, type, dimension, width, height, area,
  direction, traffic_type, audience_profile, seasonality,
  price, preco_promocional, promocao_validade,
  photos, main_photo, gallery, description, formats,
  maps_url, google_street_view_url, illumination, show_on_site, active, status, operational_status
FROM public.billboards
WHERE active = true AND deleted_at IS NULL AND COALESCE(show_on_site, true) = true;

GRANT SELECT ON public.public_billboards TO anon, authenticated;

-- 2. Remove anon access to base billboards table
DROP POLICY IF EXISTS "Public can view active billboards" ON public.billboards;

-- 3. Tighten billboards write policies (role-gated)
DROP POLICY IF EXISTS "Authenticated users can update billboards" ON public.billboards;
DROP POLICY IF EXISTS "Authenticated users can insert billboards" ON public.billboards;

CREATE POLICY "Staff can update billboards" ON public.billboards
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'operacao'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'operacao'));

CREATE POLICY "Staff can insert billboards" ON public.billboards
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'operacao'));

-- 4. Tighten contracts policies
DROP POLICY IF EXISTS "Authenticated can manage contracts" ON public.contracts;

CREATE POLICY "Authorized can view contracts" ON public.contracts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'financeiro'));
CREATE POLICY "Authorized can insert contracts" ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Authorized can update contracts" ON public.contracts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Admins can delete contracts" ON public.contracts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- 5. Storage billboard-photos: role-gated writes, drop public listing
DROP POLICY IF EXISTS "Authenticated can delete billboard photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update billboard photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload billboard photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view billboard photos" ON storage.objects;

CREATE POLICY "Staff can upload billboard photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='billboard-photos' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'operacao')));
CREATE POLICY "Staff can update billboard photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='billboard-photos' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'operacao')));
CREATE POLICY "Staff can delete billboard photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='billboard-photos' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'operacao')));

-- 6. Storage contract-files: role-gated access
DROP POLICY IF EXISTS "Authenticated can view contract files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete contract files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload contract files" ON storage.objects;

CREATE POLICY "Staff can view contract files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='contract-files' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'financeiro')));
CREATE POLICY "Staff can upload contract files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='contract-files' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial')));
CREATE POLICY "Staff can delete contract files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='contract-files' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial')));

-- 7. Revoke EXECUTE on SECURITY DEFINER trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_billboard_status_from_contract() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_trigger_func() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 8. Stop broadcasting billboards via Realtime (avoid channel-auth gap)
ALTER PUBLICATION supabase_realtime DROP TABLE public.billboards;
