import { supabaseAdmin } from '@/lib/supabase'
import { SongSummary } from '@/lib/types'
import SongList from '@/components/SongList'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('songs')
    .select('id, title, artist, album, year, key, capo, language')
    .order('title', { ascending: true })

  const songs: SongSummary[] = error ? [] : (data ?? [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            Songs
          </h1>
          <p style={{ color: 'var(--dim)', marginTop: '4px', marginBottom: 0 }}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} in the library
          </p>
        </div>
      </div>
      <SongList initialSongs={songs} />
    </div>
  )
}
