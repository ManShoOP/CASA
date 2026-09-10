import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://aijbctuvavvolzdemdvr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_9VbHaihzlOnYd9Aa-02EMg_g90ydYH3'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_KEY
  )
}
