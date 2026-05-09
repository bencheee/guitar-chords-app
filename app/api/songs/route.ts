import { supabaseAdmin } from '@/lib/supabase'
import { SongInput } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const sort = searchParams.get('sort') ?? 'title'
  const order = searchParams.get('order') === 'desc' ? false : true

  const validSortColumns = ['title', 'artist', 'year', 'album']
  const sortColumn = validSortColumns.includes(sort) ? sort : 'title'

  const db = supabaseAdmin()
  let query = db
    .from('songs')
    .select('id, title, artist, album, year, capo, key, created_at, updated_at')
    .order(sortColumn, { ascending: order })

  if (search) {
    query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  const body: SongInput = await req.json()

  const { title, artist, album, year, capo, key, content } = body

  if (!title?.trim() || !artist?.trim()) {
    return Response.json({ error: 'title and artist are required' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('songs')
    .insert({ title: title.trim(), artist: artist.trim(), album, year, capo, key, content })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
