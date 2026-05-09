import SongForm from '@/components/SongForm'

export default function NewSongPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px', color: 'var(--text)' }}>
        Add New Song
      </h1>
      <SongForm />
    </div>
  )
}
