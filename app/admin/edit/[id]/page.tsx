import { supabaseAdmin } from '@/lib/supabase'
import { Song } from '@/lib/types'
import SongForm from '@/components/SongForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = supabaseAdmin()
  const { data, error } = await db.from('songs').select('*').eq('id', id).single()

  if (error || !data) notFound()

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px', color: 'var(--text)' }}>
        Edit Song
      </h1>
      <SongForm song={data as Song} />
    </div>
  )
}
