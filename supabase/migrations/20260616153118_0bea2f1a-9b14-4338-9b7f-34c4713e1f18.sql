
DROP POLICY IF EXISTS "Authenticated can manage activities" ON public.activities;
CREATE POLICY "Staff view activities" ON public.activities FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff insert activities" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff update activities" ON public.activities FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Admins delete activities" ON public.activities FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated can manage communications" ON public.communications;
CREATE POLICY "Staff view communications" ON public.communications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff insert communications" ON public.communications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff update communications" ON public.communications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Admins delete communications" ON public.communications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
