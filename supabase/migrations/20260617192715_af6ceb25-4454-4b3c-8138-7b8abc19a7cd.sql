
-- 1) Remove anon INSERT capability on clients
DROP POLICY IF EXISTS "Public can insert clients as landowner" ON public.clients;
REVOKE INSERT ON public.clients FROM anon;

-- 2) Restrict prompt_history SELECT to admin/comercial
DROP POLICY IF EXISTS "Authenticated read prompt_history" ON public.prompt_history;
CREATE POLICY "Admin and comercial can read prompt_history"
ON public.prompt_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'comercial'::app_role));
