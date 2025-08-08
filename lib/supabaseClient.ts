import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

// Lightweight singleton for a browser Supabase client when you
// need direct access outside of React components/hooks.
// Prefer using `useSupabaseClient()` inside components.
let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createPagesBrowserClient()
  }
  return browserClient
}

// Module-scope env access (safe for SSR/build time), as required
// Do NOT access process.env inside components/hooks.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Raw Supabase client using explicit env values. Avoid importing this in React components;
// prefer the auth-helpers client from context or getSupabaseBrowserClient().
export const supabaseRawClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

