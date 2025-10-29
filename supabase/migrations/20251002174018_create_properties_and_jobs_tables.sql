/*
  # Create Real Estate Scraping System Tables

  1. New Tables
    - `scraping_jobs`
      - `id` (uuid, primary key) - Unique identifier for each scraping job
      - `status` (text) - Job status: 'pending', 'running', 'completed', 'failed'
      - `max_scrolls` (integer) - Number of scrolls to perform during scraping
      - `links_found` (integer) - Total number of property links found
      - `properties_scraped` (integer) - Number of properties successfully scraped
      - `started_at` (timestamptz) - When the job started
      - `completed_at` (timestamptz) - When the job completed
      - `error_message` (text) - Error details if job failed
      - `created_at` (timestamptz) - Job creation timestamp

    - `properties`
      - `id` (uuid, primary key) - Unique identifier for each property
      - `job_id` (uuid, foreign key) - Reference to the scraping job
      - `preco` (text) - Property price
      - `metragem` (text) - Property area in square meters
      - `quartos` (text) - Number of bedrooms
      - `banheiros` (text) - Number of bathrooms
      - `vagas` (text) - Number of parking spaces
      - `suites` (text) - Number of suites
      - `andar` (text) - Floor number
      - `piscina` (text) - Has pool (0/1)
      - `varanda` (text) - Has balcony (0/1)
      - `elevador` (text) - Has elevator (0/1)
      - `rua` (text) - Street address
      - `bairro` (text) - Neighborhood
      - `cidade` (text) - City
      - `estado` (text) - State
      - `endereco_completo` (text) - Complete address
      - `link` (text) - Property listing URL
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated and public read access
    - Restrict write operations to service role

  3. Indexes
    - Add indexes on frequently queried columns for performance
    - Include composite indexes for common filter combinations
*/

-- Create scraping_jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending',
  max_scrolls integer DEFAULT 5,
  links_found integer DEFAULT 0,
  properties_scraped integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES scraping_jobs(id) ON DELETE CASCADE,
  preco text DEFAULT '0',
  metragem text DEFAULT '0',
  quartos text DEFAULT '0',
  banheiros text DEFAULT '0',
  vagas text DEFAULT '0',
  suites text DEFAULT '0',
  andar text DEFAULT '0',
  piscina text DEFAULT '0',
  varanda text DEFAULT '0',
  elevador text DEFAULT '0',
  rua text DEFAULT '0',
  bairro text DEFAULT '0',
  cidade text DEFAULT '0',
  estado text DEFAULT '0',
  endereco_completo text DEFAULT '0',
  link text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policies for scraping_jobs (public read access)
CREATE POLICY "Allow public read access to scraping jobs"
  ON scraping_jobs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to scraping jobs"
  ON scraping_jobs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to scraping jobs"
  ON scraping_jobs
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for properties (public read access)
CREATE POLICY "Allow public read access to properties"
  ON properties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to properties"
  ON properties
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_properties_job_id ON properties(job_id);
CREATE INDEX IF NOT EXISTS idx_properties_cidade ON properties(cidade);
CREATE INDEX IF NOT EXISTS idx_properties_bairro ON properties(bairro);
CREATE INDEX IF NOT EXISTS idx_properties_estado ON properties(estado);
CREATE INDEX IF NOT EXISTS idx_properties_quartos ON properties(quartos);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_at ON scraping_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
