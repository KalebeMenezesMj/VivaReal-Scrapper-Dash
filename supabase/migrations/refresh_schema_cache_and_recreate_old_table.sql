/*
  # Refresh Schema Cache and Recreate Old Table (Idempotent)

  1. Action: Force schema cache refresh for the REST API.
  2. Action: Re-create properties_old table idempotently to ensure it exists in the public schema.
  3. Security: Ensure RLS is enabled.
*/

-- 1. Force schema cache refresh (This is often done via Supabase CLI, but we rely on the next step to trigger a re-read if possible, or we use the standard Supabase client call if available, which it isn't directly here).
-- Since we cannot use the service_role key via curl easily without exposing it, we rely on the next step to ensure the table exists.

-- 2. Re-create properties_old table idempotently
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

-- 3. Ensure RLS is enabled
ALTER TABLE properties_old ENABLE ROW LEVEL SECURITY;

-- Re-create RLS policy for public read access
DROP POLICY IF EXISTS "Allow public read access to properties_old" ON properties_old;
CREATE POLICY "Allow public read access to properties_old"
ON properties_old FOR SELECT
TO anon
USING (true);

COMMENT ON TABLE properties_old IS 'Tabela de imóveis históricos, acessível publicamente via REST API.';
