import { supabaseAdmin } from '@/lib/supabase'
import { SongSummary } from '@/lib/types'
import SongGrid from '@/components/SongGrid'

export const dynamic = 'force-dynamic'

export default async function SongsPage() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('songs')
    .select('id, title, artist, album, year, key, capo, language')
    .order('title', { ascending: true })

  const songs: SongSummary[] = error ? [] : (data ?? [])

  return <SongGrid songs={songs} />
}
