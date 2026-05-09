'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Song, SongInput } from '@/lib/types'
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
  const [title, setTitle]     = useState(song?.title ?? '')
  const [artist, setArtist]   = useState(song?.artist ?? '')
  const [album, setAlbum]     = useState(song?.album ?? '')
  const [year, setYear]       = useState(song?.year?.toString() ?? '')
  const [key, setKey]         = useState(song?.key ?? '')
  const [capo, setCapo]       = useState(song?.capo ?? 0)
  const [content, setContent] = useState(song?.content ?? '')
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)

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
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

        {/* Left column: form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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

          {/* Row 3: Key + Capo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Original Key</label>
              <input
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="e.g. Am, G, C#"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Capo</label>
              <select value={capo} onChange={e => setCapo(parseInt(e.target.value))}>
                {CAPO_OPTIONS.map(n => (
                  <option key={n} value={n}>
                    {n === 0 ? 'No Capo' : `Capo ${n}`}
                  </option>
                ))}
              </select>
            </div>
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
            <label style={labelStyle}>Chord Sheet</label>
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

        {/* Right column: live preview */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={labelStyle}>Live Preview</span>
            {key && (
              <span
                style={{
                  background: 'var(--surface-3)',
                  color: 'var(--gold)',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-geist-mono)',
                  marginBottom: '6px',
                }}
              >
                {key}
              </span>
            )}
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
  )
}
