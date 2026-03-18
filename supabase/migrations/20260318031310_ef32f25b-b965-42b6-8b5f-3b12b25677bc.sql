
CREATE POLICY "Public can insert clients as landowner"
ON public.clients
FOR INSERT
TO anon
WITH CHECK (type = 'landowner');
