'use client'

import { useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SongSummary } from '@/lib/types'

type SortField = 'title' | 'artist' | 'year'

interface Props {
  songs: SongSummary[]
}

const SORT_LABELS: Record<SortField, string> = {
  title:  'Title A–Z',
  artist: 'Artist A–Z',
  year:   'Year',
}

export default function SongGrid({ songs }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sort,   setSort]   = useState<SortField>('title')
  const searchRef = useRef<HTMLInputElement>(null)
  const cardRefs  = useRef<(HTMLAnchorElement | null)[]>([])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const result = q
      ? songs.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
        )
      : [...songs]

    result.sort((a, b) => {
      if (sort === 'year') return (b.year ?? 0) - (a.year ?? 0)
      const av = sort === 'title' ? a.title : a.artist
      const bv = sort === 'title' ? b.title : b.artist
      return av.localeCompare(bv)
    })
    return result
  }, [songs, search, sort])

  function detectColumns(): number {
    const refs = cardRefs.current.filter((r): r is HTMLAnchorElement => r !== null)
    if (refs.length < 2) return 1
    const firstTop = refs[0].getBoundingClientRect().top
    let cols = 0
    for (const ref of refs) {
      if (Math.abs(ref.getBoundingClientRect().top - firstTop) < 5) cols++
      else break
    }
    return cols || 1
  }

  function handleCardKey(e: React.KeyboardEvent<HTMLAnchorElement>, idx: number) {
    const total = filtered.length
    const cols  = detectColumns()
    let next    = -1

    switch (e.key) {
      case 'ArrowRight': next = Math.min(idx + 1, total - 1); break
      case 'ArrowLeft':  next = Math.max(idx - 1, 0);         break
      case 'ArrowDown':  next = Math.min(idx + cols, total - 1); break
      case 'ArrowUp':
        if (idx < cols) { e.preventDefault(); searchRef.current?.focus(); return }
        next = idx - cols
        break
      default: return
    }

    if (next !== -1 && next !== idx) {
      e.preventDefault()
      cardRefs.current[next]?.focus()
    }
  }

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); cardRefs.current[0]?.focus() }
  }

  return (
    <div className="fade-up">
      {/* Search + Sort */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '36px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          ref={searchRef}
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search songs or artists…"
          style={{ flex: 1, minWidth: '180px', fontSize: '16px', padding: '12px 16px' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(Object.keys(SORT_LABELS) as SortField[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                background: sort === s ? 'var(--gold)' : 'var(--surface)',
                color:      sort === s ? 'var(--bg)'  : 'var(--dim)',
                border:     sort === s ? '1px solid transparent' : '1px solid var(--line)',
                padding: '11px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {search && (
        <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>
          {filtered.length === 0
            ? `No results for "${search}"`
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`}
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 32px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px', opacity: 0.3 }}>♪</div>
          <p style={{ fontSize: '18px' }}>
            {search ? `No songs matching "${search}"` : 'No songs in the library yet.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="song-grid">
          {filtered.map((song, idx) => (
            <a
              key={song.id}
              ref={el => { cardRefs.current[idx] = el }}
              href={`/songs/${song.id}`}
              onKeyDown={e => handleCardKey(e, idx)}
              tabIndex={0}
              className="song-card"
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                  {song.title}
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--dim)' }}>
                  {song.artist}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
                {song.album && (
                  <span style={{ background: 'var(--surface-3)', color: 'var(--muted)', padding: '2px 9px', borderRadius: '20px', fontSize: '11px' }}>
                    {song.album}
                  </span>
                )}
                {song.year && (
                  <span style={{ background: 'var(--surface-3)', color: 'var(--muted)', padding: '2px 9px', borderRadius: '20px', fontSize: '11px' }}>
                    {song.year}
                  </span>
                )}
                {song.key && (
                  <span style={{ background: 'var(--surface-3)', color: 'var(--gold)', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontFamily: 'var(--font-geist-mono)', fontWeight: 600 }}>
                    {song.key}
                  </span>
                )}
                {song.capo > 0 && (
                  <span style={{ background: 'var(--surface-3)', color: 'var(--dim)', padding: '2px 9px', borderRadius: '20px', fontSize: '11px' }}>
                    Capo {song.capo}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '56px', fontSize: '13px', letterSpacing: '0.04em' }}>
          ↑ ↓ ← →&nbsp; Navigate &nbsp;·&nbsp; ↵&nbsp; Open song
        </p>
      )}
    </div>
  )
}
