import { supabaseAdmin } from '@/lib/supabase'
import { Song } from '@/lib/types'
import SongPage from '@/components/SongPage'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = supabaseAdmin()
  const { data } = await db.from('songs').select('title, artist').eq('id', id).single()
  if (!data) return { title: 'Song not found' }
  return { title: `${data.title} — ${data.artist}` }
}

export default async function SongRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = supabaseAdmin()
  const { data, error } = await db.from('songs').select('*').eq('id', id).single()

  if (error || !data) notFound()

  return <SongPage song={data as Song} />
}
