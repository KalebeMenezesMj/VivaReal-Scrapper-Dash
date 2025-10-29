import { createClient } from '@supabase/supabase-js'

// Ensure these environment variables are loaded correctly in the runtime environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
