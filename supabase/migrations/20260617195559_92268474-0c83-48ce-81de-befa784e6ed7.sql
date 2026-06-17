
-- Função utilitária para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1) BRANDING SETTINGS
CREATE TABLE public.branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  logo_url TEXT,
  cor_primaria TEXT NOT NULL DEFAULT '#EAB308',
  contato_oficial JSONB NOT NULL DEFAULT '{}'::jsonb,
  texto_institucional TEXT,
  condicoes_comerciais_padrao TEXT,
  validade_padrao_dias INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branding_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branding_settings TO authenticated;
GRANT ALL ON public.branding_settings TO service_role;
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read branding"
  ON public.branding_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage branding"
  ON public.branding_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.branding_settings (singleton, cor_primaria, contato_oficial, texto_institucional, condicoes_comerciais_padrao, validade_padrao_dias)
VALUES (
  true, '#EAB308',
  '{"telefone":"","email":"","site":"https://www.bj7.com.br","whatsapp":""}'::jsonb,
  'BJ7 Painéis — mídia exterior premium no Litoral do Paraná e Santa Catarina. Cobertura estratégica em pontos de alto fluxo, com infraestrutura própria e atendimento consultivo para campanhas que vendem.',
  'Pagamento: 50% na assinatura e 50% no início da veiculação. Impressão e instalação inclusas. Manutenção e iluminação por conta da BJ7. Renovação automática mediante aceite por escrito.',
  7
);

-- 2) MÍDIA KIT VIEWS
CREATE TABLE public.midia_kit_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  referer TEXT,
  aberto_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_midia_kit_views_token ON public.midia_kit_views(token);
CREATE INDEX idx_midia_kit_views_aberto ON public.midia_kit_views(aberto_em DESC);
GRANT SELECT ON public.midia_kit_views TO authenticated;
GRANT INSERT ON public.midia_kit_views TO anon, authenticated;
GRANT ALL ON public.midia_kit_views TO service_role;
ALTER TABLE public.midia_kit_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a view"
  ON public.midia_kit_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Internal staff can read views"
  ON public.midia_kit_views FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'comercial')
  );

-- 3) PROPOSALS
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE DEFAULT ('PROP-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,6)),
  cliente_tipo TEXT NOT NULL CHECK (cliente_tipo IN ('lead','client')),
  cliente_id UUID NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_setor TEXT,
  objetivo_campanha TEXT,
  vendedor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','enviada','aceita','recusada','expirada')),
  pontos JSONB NOT NULL DEFAULT '[]'::jsonb,
  periodo_meses INTEGER NOT NULL DEFAULT 1,
  valor_mensal NUMERIC(12,2) NOT NULL DEFAULT 0,
  desconto_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  condicoes_pagamento TEXT,
  validade DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  observacoes TEXT,
  conteudo_ia JSONB,
  pdf_url TEXT,
  enviada_em TIMESTAMPTZ,
  aceita_em TIMESTAMPTZ,
  convertida_contrato_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_cliente ON public.proposals(cliente_tipo, cliente_id);
CREATE INDEX idx_proposals_vendedor ON public.proposals(vendedor_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comercial e admin leem propostas"
  ON public.proposals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'comercial'));

CREATE POLICY "Comercial e admin criam propostas"
  ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'comercial'));

CREATE POLICY "Comercial e admin editam propostas"
  ON public.proposals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'comercial'));

CREATE POLICY "Apenas admin deleta propostas"
  ON public.proposals FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_branding_updated
  BEFORE UPDATE ON public.branding_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_proposals_updated
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
