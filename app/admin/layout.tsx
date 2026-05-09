import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 no-underline">
              <span style={{ color: 'var(--gold)', fontSize: '20px' }}>♪</span>
              <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)' }}>
                Chord Admin
              </span>
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
          <Link
            href="/songs"
            style={{ color: 'var(--dim)', fontSize: '14px', textDecoration: 'none' }}
          >
            View Site →
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
