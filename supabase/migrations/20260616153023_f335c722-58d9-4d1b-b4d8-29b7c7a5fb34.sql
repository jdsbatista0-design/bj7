
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  length(coalesce(contact,'')) BETWEEN 1 AND 200
  AND length(coalesce(company,'')) <= 200
  AND length(coalesce(email,'')) <= 255
  AND length(coalesce(phone,'')) <= 40
  AND length(coalesce(notes,'')) <= 4000
);
