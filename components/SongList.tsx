'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SongSummary, Language } from '@/lib/types'

interface Props {
  initialSongs: SongSummary[]
}

export default function SongList({ initialSongs }: Props) {
  const router = useRouter()
  const [songs, setSongs]     = useState(initialSongs)
  const [lang, setLang]       = useState<Language>('en')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const visible = songs.filter(s => s.language === lang)

  async function handleDelete(id: string) {
    setDeleting(true)
    const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSongs(prev => prev.filter(s => s.id !== id))
      setConfirmId(null)
    }
    setDeleting(false)
    router.refresh()
  }

  const langToggle = (
    <div style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
      {(['en', 'hr'] as Language[]).map(l => (
        <button
          key={l}
          onClick={() => { setLang(l); setConfirmId(null) }}
          style={{
            background: lang === l ? 'var(--gold)' : 'var(--surface)',
            color:      lang === l ? 'var(--bg)'   : 'var(--dim)',
            border: '1px solid var(--line)',
            borderRadius: l === 'en' ? '8px 0 0 8px' : '0 8px 8px 0',
            padding: '10px 28px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.08em',
            transition: 'all 0.15s',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )

  if (visible.length === 0) {
    return (
      <>
        {langToggle}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>♪</div>
          <p style={{ color: 'var(--dim)', marginBottom: '24px' }}>
            No {lang.toUpperCase()} songs yet. Add your first one!
          </p>
          <Link
            href="/admin/new"
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            + Add Song
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      {langToggle}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {['Title', 'Artist', 'Album', 'Year', 'Key', 'Capo', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((song, idx) => (
              <tr
                key={song.id}
                style={{
                  borderBottom: idx < visible.length - 1 ? '1px solid var(--line)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--text)' }}>
                  {song.title}
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--dim)' }}>{song.artist}</td>
                <td style={{ padding: '14px 20px', color: 'var(--dim)' }}>{song.album || '—'}</td>
                <td style={{ padding: '14px 20px', color: 'var(--dim)' }}>{song.year ?? '—'}</td>
                <td style={{ padding: '14px 20px' }}>
                  {song.key ? (
                    <span
                      style={{
                        background: 'var(--surface-3)',
                        color: 'var(--gold)',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-geist-mono)',
                      }}
                    >
                      {song.key}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--dim)' }}>
                  {song.capo > 0 ? `Capo ${song.capo}` : '—'}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  {confirmId === song.id ? (
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '13px', color: 'var(--dim)' }}>Delete?</span>
                      <button
                        onClick={() => handleDelete(song.id)}
                        disabled={deleting}
                        style={{
                          background: 'var(--danger)',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 12px',
                          borderRadius: '5px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {deleting ? '…' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        style={{
                          background: 'var(--surface-3)',
                          color: 'var(--dim)',
                          border: 'none',
                          padding: '4px 12px',
                          borderRadius: '5px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/edit/${song.id}`}
                        style={{
                          background: 'var(--surface-3)',
                          color: 'var(--text)',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                          textDecoration: 'none',
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setConfirmId(song.id)}
                        style={{
                          background: 'transparent',
                          color: 'var(--muted)',
                          border: '1px solid var(--line)',
                          padding: '5px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
