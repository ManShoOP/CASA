import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = 'https://geexqvbxvpkxnfnjcvzk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_9VbHaihzlOnYd9Aa-02EMg_g90ydYH3'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(s) { try { s.forEach(({name,value,options}) => cookieStore.set(name,value,options)) } catch {} },
      },
    }
  )
}
