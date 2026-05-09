import { supabaseAdmin } from '@/lib/supabase'
import { SongInput } from '@/lib/types'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = supabaseAdmin()
  const { data, error } = await db.from('songs').select('*').eq('id', id).single()

  if (error) return Response.json({ error: 'Song not found' }, { status: 404 })
  return Response.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body: Partial<SongInput> = await req.json()

  const allowed: (keyof SongInput)[] = ['title', 'artist', 'album', 'year', 'capo', 'key', 'content']
  const updates: Partial<SongInput> = {}
  for (const field of allowed) {
    if (field in body) updates[field] = body[field] as never
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('songs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = supabaseAdmin()
  const { error } = await db.from('songs').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
