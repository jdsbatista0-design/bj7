
-- Helper expression replicated inline: any staff role
-- (admin | comercial | operacao | financeiro)

-- clients
DROP POLICY IF EXISTS "Authenticated can manage clients" ON public.clients;
CREATE POLICY "Staff can view clients" ON public.clients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial') OR public.has_role(auth.uid(),'financeiro'));
CREATE POLICY "Staff can insert clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff can update clients" ON public.clients FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- leads (keep public insert)
DROP POLICY IF EXISTS "Authenticated can manage leads" ON public.leads;
CREATE POLICY "Staff can view leads" ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff can update leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- work_orders
DROP POLICY IF EXISTS "Authenticated can manage work_orders" ON public.work_orders;
CREATE POLICY "Staff can view work_orders" ON public.work_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operacao') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff can insert work_orders" ON public.work_orders FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operacao') OR public.has_role(auth.uid(),'comercial'));
CREATE POLICY "Staff can update work_orders" ON public.work_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operacao'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operacao'));
CREATE POLICY "Admins can delete work_orders" ON public.work_orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- financial_entries
DROP POLICY IF EXISTS "Authenticated can manage financial_entries" ON public.financial_entries;
CREATE POLICY "Finance can view financial_entries" ON public.financial_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro'));
CREATE POLICY "Finance can insert financial_entries" ON public.financial_entries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro'));
CREATE POLICY "Finance can update financial_entries" ON public.financial_entries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro'));
CREATE POLICY "Admins can delete financial_entries" ON public.financial_entries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- cadences, cadence_steps, lead_cadence_runs, contents, campaigns, prompts — comercial/admin
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['cadences','cadence_steps','lead_cadence_runs','contents','campaigns','prompts']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated manage %1$s" ON public.%1$I', t);
    EXECUTE format($p$CREATE POLICY "Staff can view %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))$p$, t);
    EXECUTE format($p$CREATE POLICY "Staff can insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))$p$, t);
    EXECUTE format($p$CREATE POLICY "Staff can update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comercial'))$p$, t);
    EXECUTE format($p$CREATE POLICY "Admins can delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'))$p$, t);
  END LOOP;
END $$;
