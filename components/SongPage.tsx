'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Song } from '@/lib/types'
import { parseContent, transposeContent, transposeKey } from '@/lib/chord-utils'

const FONT_OPTIONS = [
  { label: 'S',  px: 13 },
  { label: 'M',  px: 18 },
  { label: 'L',  px: 26 },
  { label: 'XL', px: 36 },
]

const ctrlBtnBase: React.CSSProperties = {
  borderRadius: '6px',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid var(--line)',
  transition: 'all 0.12s',
  minWidth: '36px',
}

const iconBtnBase: React.CSSProperties = {
  background: 'var(--surface-3)',
  color: 'var(--dim)',
  border: '1px solid var(--line)',
  borderRadius: '6px',
  padding: '8px 14px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  lineHeight: 1,
}

export default function SongPage({ song }: { song: Song }) {
  const [semitones, setSemitones] = useState(0)
  const [fontIdx,   setFontIdx]   = useState(1) // M default
  const [playing,   setPlaying]   = useState(false)
  const [speed,     setSpeed]     = useState(3)  // 1–10

  const rafRef      = useRef<number | null>(null)
  const accumRef    = useRef(0)
  const wakeLockRef = useRef<{ release: () => void } | null>(null)
  const videoRef    = useRef<HTMLVideoElement | null>(null)

  const fontSize      = FONT_OPTIONS[fontIdx].px
  const chordFontSize = Math.round(fontSize * 0.82)
  const transposedKey = song.key ? transposeKey(song.key, semitones) : ''
  const lines         = parseContent(transposeContent(song.content, semitones))

  // ── Wake lock ────────────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        return
      } catch {}
    }
    // Canvas-stream fallback — keeps Samsung TV screen awake
    try {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream = (canvas as any).captureStream()
      const video  = document.createElement('video')
      video.srcObject  = stream
      video.muted      = true
      video.loop       = true
      video.style.cssText =
        'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:0;left:0'
      document.body.appendChild(video)
      videoRef.current = video
      await video.play()
    } catch {}
  }, [])

  useEffect(() => {
    acquireWakeLock()
    const onVisible = () => {
      if (document.visibilityState === 'visible') acquireWakeLock()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      wakeLockRef.current?.release()
      wakeLockRef.current = null
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.remove(); videoRef.current = null }
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [acquireWakeLock])

  // ── Auto scroll ───────────────────────────────────────────────
  useEffect(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (!playing) return

    const pxPerFrame = speed * 0.1
    accumRef.current = 0

    const tick = () => {
      accumRef.current += pxPerFrame
      const px = Math.floor(accumRef.current)
      if (px > 0) {
        window.scrollBy(0, px)
        accumRef.current -= px
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) {
        setPlaying(false)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing, speed])

  // Space → toggle play (when not in a form element)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === ' ' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'BUTTON') {
        e.preventDefault()
        setPlaying(p => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function changeTranspose(delta: number) {
    setSemitones(s => {
      let n = s + delta
      if (n > 11)  n -= 12
      if (n < -11) n += 12
      return n
    })
  }

  function ctrlBtn(active: boolean): React.CSSProperties {
    return {
      ...ctrlBtnBase,
      background: active ? 'var(--gold)' : 'var(--surface-3)',
      color:      active ? 'var(--bg)'  : 'var(--dim)',
      border:     active ? '1px solid transparent' : '1px solid var(--line)',
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      {/* Hero */}
      <div style={{ paddingBottom: '40px' }}>
        <Link
          href="/songs"
          style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}
        >
          ← Back to Library
        </Link>

        <h1
          style={{
            fontSize: 'clamp(30px, 5vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: '0 0 14px',
            letterSpacing: '-0.03em',
            color: 'var(--text)',
          }}
        >
          {song.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <span style={{ color: 'var(--dim)', fontSize: '17px' }}>
            {song.artist}
            {song.album && <> &bull; <em style={{ fontStyle: 'normal' }}>{song.album}</em></>}
            {song.year  && <> &bull; {song.year}</>}
          </span>
          {song.capo > 0 && (
            <span style={{ background: 'var(--surface-3)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em' }}>
              CAPO {song.capo}
            </span>
          )}
        </div>

        {/* Setup controls — transpose + font size */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            padding: '18px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
          }}
        >
          {/* Transpose */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Key</span>
            <button onClick={() => changeTranspose(-1)} style={iconBtnBase} aria-label="Transpose down">−</button>
            <span style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--gold)', fontWeight: 700, fontSize: '16px', minWidth: '36px', textAlign: 'center' }}>
              {transposedKey || song.key || '—'}
            </span>
            <button onClick={() => changeTranspose(+1)} style={iconBtnBase} aria-label="Transpose up">+</button>
            {semitones !== 0 && (
              <>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                  {semitones > 0 ? '+' : ''}{semitones}
                </span>
                <button
                  onClick={() => setSemitones(0)}
                  style={{ ...iconBtnBase, fontSize: '11px', padding: '6px 10px' }}
                >
                  Reset
                </button>
              </>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--line)' }} />

          {/* Font size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Size</span>
            {FONT_OPTIONS.map((f, i) => (
              <button key={f.label} onClick={() => setFontIdx(i)} style={ctrlBtn(fontIdx === i)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Song content */}
      <div
        style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: `${fontSize}px`,
          lineHeight: 1.9,
          paddingBottom: '180px',
        }}
      >
        {lines.map((line, i) => {
          if (line.type === 'empty') {
            return <div key={i} style={{ height: `${fontSize}px` }} />
          }
          if (line.type === 'text') {
            return (
              <div key={i} style={{ whiteSpace: 'pre', color: 'var(--text)' }}>
                {line.lyricsLine}
              </div>
            )
          }
          return (
            <div key={i}>
              <div style={{ whiteSpace: 'pre', color: 'var(--gold)', fontWeight: 700, fontSize: `${chordFontSize}px` }}>
                {line.chordLine}
              </div>
              <div style={{ whiteSpace: 'pre', color: 'var(--text)' }}>
                {line.lyricsLine || ' '}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating play/pause pill — always visible */}
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '60px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          onClick={() => setPlaying(p => !p)}
          style={{
            background: playing ? 'var(--danger)' : 'var(--gold)',
            color: playing ? '#fff' : 'var(--bg)',
            border: 'none',
            borderRadius: '40px',
            padding: '10px 28px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            minWidth: '110px',
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>

        <div style={{ width: '1px', height: '28px', background: 'var(--line)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Speed</span>
          <input
            type="range"
            min={1}
            max={10}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--gold)' }}
            aria-label="Scroll speed"
          />
          <span style={{ fontSize: '13px', color: 'var(--gold)', minWidth: '18px', textAlign: 'center', fontFamily: 'var(--font-geist-mono)', fontWeight: 700 }}>
            {speed}
          </span>
        </div>

        <div style={{ width: '1px', height: '28px', background: 'var(--line)' }} />

        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          <kbd style={{ background: 'var(--surface-3)', padding: '2px 7px', borderRadius: '4px', fontFamily: 'var(--font-geist-mono)', fontSize: '11px' }}>Space</kbd>
          {' '}to toggle
        </span>
      </div>
    </>
  )
}
