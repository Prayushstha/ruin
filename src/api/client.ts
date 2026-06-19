import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// False until .env.local is filled in — lets features show a "not configured"
// state instead of crashing.
export const isSupabaseConfigured = Boolean(url && anonKey)

// The single Supabase client. All backend calls go through src/api; features
// must never import supabase-js directly (see STRUCTURE.md).
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
})
