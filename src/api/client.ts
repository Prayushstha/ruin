import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False until .env.local is filled in. Features can show a "not configured"
 * state instead of crashing when the project hasn't been linked to Supabase. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * The single Supabase client for the app. Every backend call goes through
 * src/api — features must never call createClient or import Supabase
 * directly from outside this folder (see STRUCTURE.md).
 *
 * The Database generic is intentionally omitted: once the SQL schema exists,
 * generate types with `supabase gen types typescript` and type the client so
 * table/row access is checked at compile time.
 */
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
})
