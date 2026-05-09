import { createClient } from '@supabase/supabase-js'
import { Song } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<{ public: { Tables: { songs: { Row: Song } } } }>(
  supabaseUrl,
  supabaseAnonKey
)

export function supabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}
