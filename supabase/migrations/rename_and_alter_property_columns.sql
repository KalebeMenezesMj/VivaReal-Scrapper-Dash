/*
  # Rename and Alter Property Columns to align with properties_old structure
  1. Column Renaming:
     - preco -> valor
     - metragem -> area_privativa
     - quartos -> dormitorio
     - banheiros -> banheiro
     - vagas -> vaga
     - suites -> suite
     - estado -> uf
     - created_at -> data
  2. Type Alterations:
     - Set numeric types for valor, area_privativa, area_terreno, valor_unitario.
     - Set integer types for dormitorio, banheiro, vaga, suite.
     - Set boolean types for piscina, varanda, elevador.
     - Set date type for data.
  3. Column Addition: Added missing columns from properties_old (tipo, nome_fonte, nome_telefone, area_terreno, valor_unitario).
  4. Column Removal: Removed unused columns (idade_aparente, estado_conservacao, padrao_acabamento).
  5. Security: RLS policies remain active, assuming column access permissions are unchanged.
*/

DO $$
BEGIN
    -- 1. Rename existing columns
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'preco' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN preco TO valor;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'metragem' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN metragem TO area_privativa;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'quartos' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN quartos TO dormitorio;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'banheiros' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN banheiros TO banheiro;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'vagas' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN vagas TO vaga;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'suites' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN suites TO suite;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'estado' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN estado TO uf;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'created_at' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties RENAME COLUMN created_at TO data;
    END IF;

    -- 2. Add missing columns from properties_old (assuming they might be null initially)
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'tipo' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties ADD COLUMN tipo text DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'nome_fonte' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties ADD COLUMN nome_fonte text DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'nome_telefone' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties ADD COLUMN nome_telefone text DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'area_terreno' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties ADD COLUMN area_terreno numeric(10,2) DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'valor_unitario' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties ADD COLUMN valor_unitario numeric(10,2) DEFAULT NULL;
    END IF;

    -- 3. Alter types and constraints
    -- Valor (preco)
    ALTER TABLE properties ALTER COLUMN valor TYPE numeric(12,2) USING valor::numeric(12,2);
    -- Area Privativa (metragem)
    ALTER TABLE properties ALTER COLUMN area_privativa TYPE numeric(10,2) USING area_privativa::numeric(10,2);
    -- Dormitorio (quartos)
    ALTER TABLE properties ALTER COLUMN dormitorio TYPE integer USING COALESCE(dormitorio, '0')::integer;
    -- Banheiro (banheiros)
    ALTER TABLE properties ALTER COLUMN banheiro TYPE integer USING COALESCE(banheiro, '0')::integer;
    -- Vaga (vagas)
    ALTER TABLE properties ALTER COLUMN vaga TYPE integer USING COALESCE(vaga, '0')::integer;
    -- Suite (suites)
    ALTER TABLE properties ALTER COLUMN suite TYPE integer USING COALESCE(suite, '0')::integer;
    -- UF (estado)
    ALTER TABLE properties ALTER COLUMN uf TYPE varchar(2) USING COALESCE(uf, '');
    -- Data (created_at)
    ALTER TABLE properties ALTER COLUMN data TYPE date USING COALESCE(data, now())::date;
    -- Amenities (convert existing '1'/'0' strings to boolean if necessary, assuming they were stored as text '1'/'0' previously)
    ALTER TABLE properties ALTER COLUMN piscina TYPE boolean USING (piscina = '1');
    ALTER TABLE properties ALTER COLUMN varanda TYPE boolean USING (varanda = '1');
    ALTER TABLE properties ALTER COLUMN elevador TYPE boolean USING (elevador = '1');

    -- 4. Remove unused columns
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'idade_aparente' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties DROP COLUMN idade_aparente;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'estado_conservacao' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties DROP COLUMN estado_conservacao;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attname = 'padrao_acabamento' AND attrelid = 'properties'::regclass) THEN
        ALTER TABLE properties DROP COLUMN padrao_acabamento;
    END IF;

    -- Ensure RLS is still enabled (it should be, but good practice)
    ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

END
$$;
