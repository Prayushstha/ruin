/// <reference types="vite/client" />

/**
 * Typed access to the app's env vars. Copy .env.example to .env.local and
 * fill these in (Supabase dashboard → Project Settings → API).
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
