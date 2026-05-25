-- =============================================================
-- BJ7 MIGRATION 03 — Campos comerciais no billboard
-- =============================================================
-- O que faz: adiciona campos que sustentam a inteligência
-- comercial e a geração automatizada de conteúdo via IA.
--
-- Sem esses campos, a IA produz copy genérico. Com eles, gera
-- copy direcionado por nicho/setor.
-- =============================================================

BEGIN;

-- Precificação e negociação
ALTER TABLE public.billboards
  ADD COLUMN IF NOT EXISTS preco_minimo         NUMERIC,
  ADD COLUMN IF NOT EXISTS preco_promocional    NUMERIC,
  ADD COLUMN IF NOT EXISTS promocao_validade    DATE;

-- Dados de fluxo com rastreabilidade de fonte
ALTER TABLE public.billboards
  ADD COLUMN IF NOT EXISTS fonte_fluxo          TEXT DEFAULT 'NAO_INFORMADO',
  ADD COLUMN IF NOT EXISTS fluxo_observacao     TEXT;

-- Inteligência comercial (alimenta IA na geração de copy/proposta)
ALTER TABLE public.billboards
  ADD COLUMN IF NOT EXISTS argumentos_comerciais TEXT[],
  ADD COLUMN IF NOT EXISTS empresas_ideais       TEXT[],
  ADD COLUMN IF NOT EXISTS cta_ideal             TEXT;

-- Responsável e notas internas
ALTER TABLE public.billboards
  ADD COLUMN IF NOT EXISTS responsavel_comercial UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS observacoes_internas  TEXT;

-- Constraint para fonte_fluxo (valores válidos)
ALTER TABLE public.billboards DROP CONSTRAINT IF EXISTS chk_fonte_fluxo;
ALTER TABLE public.billboards
  ADD CONSTRAINT chk_fonte_fluxo
    CHECK (fonte_fluxo IN (
      'DNIT', 'DER-PR', 'DEINFRA-SC', 'Concessionaria',
      'Estimativa interna', 'NAO_INFORMADO'
    ));

-- Documentação
COMMENT ON COLUMN public.billboards.preco_minimo IS
  'Piso interno de negociação. NUNCA exibir em material comercial ao cliente.';
COMMENT ON COLUMN public.billboards.fonte_fluxo IS
  'Fonte do dado de fluxo. Se NAO_INFORMADO, IA NUNCA deve mencionar número de fluxo.';
COMMENT ON COLUMN public.billboards.argumentos_comerciais IS
  'Lista de 3-5 argumentos prontos para vendedor usar. Ex: ["Único painel no acesso ao porto", "Backlight 24h"]';
COMMENT ON COLUMN public.billboards.empresas_ideais IS
  'Setores/perfis ideais para anunciar. Ex: ["Construtoras", "Restaurantes da rota", "Postos"]';
COMMENT ON COLUMN public.billboards.cta_ideal IS
  'Call-to-action específico do ponto. Ex: "Esteja na rota dos decisores do maior porto do PR"';

COMMIT;

-- =============================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- =============================================================
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'billboards' AND column_name IN (
--   'preco_minimo', 'preco_promocional', 'promocao_validade',
--   'fonte_fluxo', 'fluxo_observacao', 'argumentos_comerciais',
--   'empresas_ideais', 'cta_ideal', 'responsavel_comercial',
--   'observacoes_internas'
-- );
--
-- Resultado esperado: 10 linhas.
-- =============================================================
