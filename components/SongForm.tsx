'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Song, SongInput, Language } from '@/lib/types'
import ChordPreview from './ChordPreview'

interface Props {
  song?: Song
}

const CAPO_OPTIONS = Array.from({ length: 10 }, (_, i) => i)

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--dim)',
  marginBottom: '6px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

export default function SongForm({ song }: Props) {
  const router = useRouter()
  const [title, setTitle]       = useState(song?.title ?? '')
  const [artist, setArtist]     = useState(song?.artist ?? '')
  const [album, setAlbum]       = useState(song?.album ?? '')
  const [year, setYear]         = useState(song?.year?.toString() ?? '')
  const [key]                   = useState(song?.key ?? '')
  const [capo, setCapo]         = useState(song?.capo ?? 0)
  const [content, setContent]   = useState(song?.content ?? '')
  const [language, setLanguage] = useState<Language>(song?.language ?? 'en')
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [preview, setPreview]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !artist.trim()) {
      setError('Title and Artist are required.')
      return
    }
    setError('')
    setSaving(true)

    const body: SongInput = {
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
      year: year ? parseInt(year) : null,
      key: key.trim(),
      capo,
      language,
      content,
    }

    try {
      const url = song ? `/api/songs/${song.id}` : '/api/songs'
      const method = song ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong')
      }
      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          {/* Left column: form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Language toggle */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Language</label>
              <div style={{ display: 'flex', gap: '0' }}>
                {(['en', 'hr'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    style={{
                      background: language === lang ? 'var(--gold)' : 'var(--surface-2)',
                      color:      language === lang ? 'var(--bg)'   : 'var(--dim)',
                      border: '1px solid var(--line)',
                      borderRadius: lang === 'en' ? '6px 0 0 6px' : '0 6px 6px 0',
                      padding: '10px 28px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.06em',
                      transition: 'all 0.12s',
                    }}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 1: Title + Artist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Song title"
                  required
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Artist *</label>
                <input
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  placeholder="Artist name"
                  required
                />
              </div>
            </div>

            {/* Row 2: Album + Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Album</label>
                <input
                  value={album}
                  onChange={e => setAlbum(e.target.value)}
                  placeholder="Album name"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="e.g. 1994"
                  min={1900}
                  max={2099}
                />
              </div>
            </div>

            {/* Row 3: Capo */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Capo</label>
              <select value={capo} onChange={e => setCapo(parseInt(e.target.value))} style={{ maxWidth: '200px' }}>
                {CAPO_OPTIONS.map(n => (
                  <option key={n} value={n}>
                    {n === 0 ? 'No Capo' : `Capo ${n}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Chord format hint */}
            <div
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '13px',
                color: 'var(--dim)',
                fontFamily: 'var(--font-geist-mono)',
              }}
            >
              <span style={{ color: 'var(--gold)' }}>Tip: </span>
              Place chords inline using square brackets:<br />
              <span style={{ color: 'var(--text)' }}>[Am]Here comes the [G]sun</span>
            </div>

            {/* Content textarea */}
            <div style={fieldStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Chord Sheet</label>
                {/* Preview button — visible on mobile only (hidden on desktop via CSS) */}
                <button
                  type="button"
                  className="form-preview-btn"
                  onClick={() => setPreview(true)}
                  style={{
                    alignItems: 'center',
                    background: 'var(--surface-2)',
                    color: 'var(--dim)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '5px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  Preview
                </button>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={'[Am]Here comes the [G]sun\n[Am]Here comes the [G]sun, and I [F]say\n[C]It\'s alright'}
                rows={18}
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Error + Submit */}
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '14px', margin: 0 }}>{error}</p>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? 'var(--muted)' : 'var(--gold)',
                  color: 'var(--bg)',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {saving ? 'Saving…' : song ? 'Save Changes' : 'Add Song'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                style={{
                  background: 'transparent',
                  color: 'var(--dim)',
                  border: '1px solid var(--line)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right column: live preview — hidden on mobile via CSS */}
          <div className="form-preview-col" style={{ position: 'sticky', top: '24px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={labelStyle}>Live Preview</span>
              {capo > 0 && (
                <span
                  style={{
                    background: 'var(--surface-3)',
                    color: 'var(--dim)',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    marginBottom: '6px',
                  }}
                >
                  Capo {capo}
                </span>
              )}
            </div>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '24px',
                minHeight: '400px',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <ChordPreview content={content} fontSize={14} />
            </div>
          </div>
        </div>
      </form>

      {/* Preview modal — used on mobile only */}
      {preview && (
        <div
          onClick={() => setPreview(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--line)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={labelStyle}>Live Preview</span>
                {capo > 0 && (
                  <span style={{
                    background: 'var(--surface-3)',
                    color: 'var(--dim)',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                  }}>
                    Capo {capo}
                  </span>
                )}
              </div>
              <button
                onClick={() => setPreview(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--muted)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              overflowY: 'auto',
              padding: '24px',
              fontFamily: 'var(--font-geist-mono)',
            }}>
              <ChordPreview content={content} fontSize={14} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
