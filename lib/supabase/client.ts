import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://geexqvbxvpkxnfnjcvzk.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9VbHaihzlOnYd9Aa-02EMg_g90ydYH3'
  return createBrowserClient(supabaseUrl, supabaseKey)
}
