import Link from 'next/link'
import SpatialNav from '@/components/SpatialNav'

export default function SongsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SpatialNav />
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="page-header-inner">
          <Link href="/songs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--gold)', fontSize: '26px', lineHeight: 1 }}>♪</span>
            <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.02em' }}>
              Guitar Chords
            </span>
          </Link>
          <Link href="/admin" style={{ color: 'var(--muted)', fontSize: '14px', textDecoration: 'none' }}>
            Admin
          </Link>
        </div>
      </header>
      <main className="page-main">{children}</main>
    </div>
  )
}
