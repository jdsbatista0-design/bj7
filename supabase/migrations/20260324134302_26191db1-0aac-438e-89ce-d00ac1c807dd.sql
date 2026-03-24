DROP POLICY IF EXISTS "Public can view available billboards" ON public.billboards;
CREATE POLICY "Public can view active billboards"
  ON public.billboards FOR SELECT
  TO anon
  USING (active = true);