export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div>Song {id} — coming soon</div>
}
