/*
  This file is kept for reference/migration purposes but should not be used by the main application logic.
  It reflects the old structure which is now deprecated in the main 'properties' table.
*/
import { supabase } from './supabase'
import type { PropertyOld } from '../types/database.types'

/**
 * WARNING: This function reads from the legacy 'properties_old' table.
 * It is kept for historical data viewing only.
 */
export async function fetchOldProperties() {
  const { data, error } = await supabase
    .from('properties_old') 
    .select('*')
    .order('data', { ascending: false })

  if (error) throw error

  return data as PropertyOld[]
}
