ALTER TABLE public.billboards ADD COLUMN IF NOT EXISTS formato_label text;
UPDATE public.billboards SET formato_label = CASE
  WHEN type = 'painel_rodoviario' THEN 'Painel Rodoviário'
  WHEN type = 'painel_urbano' THEN 'Painel Urbano'
  WHEN type = 'outdoor' THEN 'Outdoor'
  WHEN type = 'backlight' THEN 'Backlight'
  WHEN type = 'frontlight' THEN 'Frontlight'
  WHEN type = 'empena' THEN 'Empena'
  WHEN type IS NULL OR type = '' THEN 'Painel'
  ELSE initcap(replace(type, '_', ' '))
END
WHERE formato_label IS NULL;