'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { SongSummary, Language } from '@/lib/types'

type SortField = 'title' | 'artist' | 'year'

interface Props {
  songs: SongSummary[]
}

const SORT_LABELS: Record<SortField, string> = {
  title:  'Title A–Z',
  artist: 'Artist A–Z',
  year:   'Year',
}

function sortBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? 'var(--gold)' : 'var(--surface)',
    color:      active ? 'var(--bg)'  : 'var(--dim)',
    border:     active ? '1px solid transparent' : '1px solid var(--line)',
    padding: '11px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  }
}

export default function SongGrid({ songs }: Props) {
  const [lang,           setLang]           = useState<Language>('en')
  const [search,         setSearch]         = useState('')
  const [sort,           setSort]           = useState<SortField>('title')
  const [compact,        setCompact]        = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)

  // Persist language preference
  useEffect(() => {
    const saved = localStorage.getItem('song-lang')
    if (saved === 'en' || saved === 'hr') setLang(saved)
  }, [])
  useEffect(() => {
    localStorage.setItem('song-lang', lang)
    setSelectedLetter(null)
    setSelectedArtist(null)
    setSearch('')
  }, [lang])

  const searchRef = useRef<HTMLInputElement>(null)
  const cardRefs  = useRef<(HTMLAnchorElement | null)[]>([])

  // Letters that have at least one artist starting with them (for current language)
  const availableLetters = useMemo(() => {
    const set = new Set(
      songs.filter(s => s.language === lang).map(s => s.artist[0]?.toUpperCase()).filter(Boolean)
    )
    return [...set].sort()
  }, [songs, lang])

  // Unique artists for the selected letter (for current language)
  const artistsForLetter = useMemo(() => {
    if (!selectedLetter) return []
    const set = new Set(
      songs
        .filter(s => s.language === lang && s.artist[0]?.toUpperCase() === selectedLetter)
        .map(s => s.artist)
    )
    return [...set].sort()
  }, [songs, lang, selectedLetter])

  const filtered = useMemo(() => {
    let result = songs.filter(s => s.language === lang)

    if (selectedArtist) {
      result = result.filter(s => s.artist === selectedArtist)
    } else if (selectedLetter) {
      result = result.filter(s => s.artist[0]?.toUpperCase() === selectedLetter)
    }

    const q = search.toLowerCase().trim()
    if (q) {
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      if (sort === 'year') return (b.year ?? 0) - (a.year ?? 0)
      const av = sort === 'title' ? a.title : a.artist
      const bv = sort === 'title' ? b.title : b.artist
      return av.localeCompare(bv)
    })
    return result
  }, [songs, search, sort, selectedLetter, selectedArtist])

  function selectLetter(letter: string) {
    if (selectedLetter === letter) {
      setSelectedLetter(null)
      setSelectedArtist(null)
    } else {
      setSelectedLetter(letter)
      setSelectedArtist(null)
    }
  }

  function detectColumns(): number {
    if (compact) return 1
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

  const isFiltered = selectedLetter || selectedArtist || search.trim()

  return (
    <div className="fade-up">

      {/* ── EN / HR language switcher ── */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '28px' }}>
        {(['en', 'hr'] as Language[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              background: lang === l ? 'var(--gold)' : 'var(--surface)',
              color:      lang === l ? 'var(--bg)'   : 'var(--dim)',
              border: '1px solid var(--line)',
              borderRadius: l === 'en' ? '8px 0 0 8px' : '0 8px 8px 0',
              padding: '11px 32px',
              fontSize: '15px',
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

      {/* ── Search + Sort + Compact toggle ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <button key={s} onClick={() => setSort(s)} style={sortBtn(sort === s)}>
              {SORT_LABELS[s]}
            </button>
          ))}
          <button
            onClick={() => setCompact(c => !c)}
            title={compact ? 'Switch to grid view' : 'Switch to compact view'}
            style={{ ...sortBtn(compact), padding: '11px 15px', fontSize: '17px', lineHeight: 1 }}
          >
            {compact ? '⊞' : '☰'}
          </button>
        </div>
      </div>

      {/* ── A–Z letter bar ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        marginBottom: artistsForLetter.length > 0 ? '12px' : '32px',
      }}>
        {availableLetters.map(letter => (
          <button
            key={letter}
            onClick={() => selectLetter(letter)}
            style={{
              background: selectedLetter === letter ? 'var(--gold)' : 'transparent',
              color:      selectedLetter === letter ? 'var(--bg)'   : 'var(--dim)',
              border:     selectedLetter === letter ? '1px solid transparent' : '1px solid var(--line)',
              borderRadius: '6px',
              padding: '5px 0',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              width: '34px',
              textAlign: 'center',
              transition: 'all 0.12s',
              fontFamily: 'var(--font-geist-mono)',
            }}
          >
            {letter}
          </button>
        ))}
        {selectedLetter && (
          <button
            onClick={() => { setSelectedLetter(null); setSelectedArtist(null) }}
            style={{
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Artist chips ── */}
      {artistsForLetter.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          {artistsForLetter.map(artist => (
            <button
              key={artist}
              onClick={() => setSelectedArtist(a => a === artist ? null : artist)}
              style={{
                background: selectedArtist === artist ? 'var(--gold)'     : 'var(--surface-2)',
                color:      selectedArtist === artist ? 'var(--bg)'       : 'var(--text)',
                border:     selectedArtist === artist ? '1px solid transparent' : '1px solid var(--line)',
                borderRadius: '20px',
                padding: '6px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {artist}
            </button>
          ))}
        </div>
      )}

      {/* ── Result summary ── */}
      {isFiltered && filtered.length > 0 && (
        <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>
          {filtered.length} song{filtered.length !== 1 ? 's' : ''}
          {selectedArtist ? ` by ${selectedArtist}` : selectedLetter ? ` · artists starting with ${selectedLetter}` : ''}
          {search.trim() ? ` matching "${search.trim()}"` : ''}
        </p>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 32px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px', opacity: 0.3 }}>♪</div>
          <p style={{ fontSize: '18px' }}>
            {search ? `No songs matching "${search}"` : 'No songs in the library yet.'}
          </p>
        </div>
      )}

      {/* ── Compact list ── */}
      {filtered.length > 0 && compact && (
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {filtered.map((song, idx) => (
            <a
              key={song.id}
              ref={el => { cardRefs.current[idx] = el }}
              href={`/songs/${song.id}`}
              onKeyDown={e => handleCardKey(e, idx)}
              tabIndex={0}
              className="song-row"
            >
              <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>
                {song.title}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '13px', flexShrink: 0, marginLeft: '16px' }}>
                {song.artist}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* ── Card grid ── */}
      {filtered.length > 0 && !compact && (
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
