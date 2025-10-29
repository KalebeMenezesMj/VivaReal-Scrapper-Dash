/*
  # Add 'new_links_to_process' column

  1. Table Modified: `scraping_jobs`
    - Adds a new column `new_links_to_process` to track the number of unique links that are not already in the database.

  2. Security
    - No changes to RLS policies are needed as this is a data column.
*/

ALTER TABLE public.scraping_jobs
ADD COLUMN IF NOT EXISTS new_links_to_process integer DEFAULT 0;
