import Link from 'next/link'
import SpatialNav from '@/components/SpatialNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SpatialNav />
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="page-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--gold)', fontSize: '20px' }}>♪</span>
              <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)' }}>Chord Admin</span>
            </Link>
            <Link
              href="/admin/new"
              style={{
                background: 'var(--gold)',
                color: 'var(--bg)',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              + New Song
            </Link>
          </div>
          <Link href="/songs" style={{ color: 'var(--dim)', fontSize: '14px', textDecoration: 'none' }}>
            View Site →
          </Link>
        </div>
      </header>
      <main className="page-main">{children}</main>
    </div>
  )
}
