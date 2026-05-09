import Link from 'next/link'

export default function SongsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/songs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--gold)', fontSize: '28px', lineHeight: 1 }}>♪</span>
            <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em' }}>
              Guitar Chords
            </span>
          </Link>
          <Link
            href="/admin"
            style={{ color: 'var(--muted)', fontSize: '14px', textDecoration: 'none' }}
          >
            Admin
          </Link>
        </div>
      </header>
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 40px' }}>
        {children}
      </main>
    </div>
  )
}
