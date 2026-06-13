import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!env.ENABLE_SUPABASE) return null
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return supabaseClient
}
