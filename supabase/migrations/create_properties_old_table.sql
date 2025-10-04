/*
  # Criação da Tabela de Imóveis Históricos (properties_old)
  1. Nova Tabela: properties_old (Estrutura baseada em dados antigos inferidos).
  2. Segurança: Habilita RLS e cria uma política de SELECT pública para permitir que qualquer usuário (anon) leia os dados históricos.
*/
CREATE TABLE IF NOT EXISTS properties_old (
  id BIGINT PRIMARY KEY,
  tipo TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  uf TEXT,
  nome_fonte TEXT,
  nome_telefone TEXT,
  area_privativa NUMERIC,
  area_terreno NUMERIC,
  valor NUMERIC,
  valor_unitario NUMERIC,
  dormitorio INTEGER,
  suite INTEGER,
  banheiro INTEGER,
  piscina BOOLEAN,
  varanda BOOLEAN,
  vaga INTEGER,
  idade_aparente INTEGER,
  estado_conservacao INTEGER,
  padrao_acabamento INTEGER,
  elevador BOOLEAN,
  link TEXT,
  data TIMESTAMP WITH TIME ZONE
);

ALTER TABLE properties_old ENABLE ROW LEVEL SECURITY;

-- Política de SELECT pública para dados históricos (acessível por 'anon' role)
CREATE POLICY "Allow public read access to properties_old"
ON properties_old FOR SELECT
TO anon
USING (true);

-- Política de INSERT/UPDATE/DELETE restrita (apenas para serviços internos/admin, se necessário)
-- Para este cenário, vamos apenas garantir que o SELECT público funcione.
