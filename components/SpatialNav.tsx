'use client'

import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

// Arrow-key spatial navigation for TV remote D-pad.
// On each arrow key press, finds the nearest focusable element in that
// direction and moves focus to it — instead of the browser moving a cursor.
// Song cards and rows are skipped because they handle their own navigation.
export default function SpatialNav() {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return

      const active = document.activeElement as HTMLElement | null
      if (!active || active.tagName === 'BODY' || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return

      // Song cards and rows manage their own arrow-key navigation
      if (active.matches('.song-card, .song-row')) return

      const candidates = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => {
        if (el === active) return false
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })

      const ar = active.getBoundingClientRect()
      const ax = ar.left + ar.width / 2
      const ay = ar.top + ar.height / 2

      let best: HTMLElement | null = null
      let bestScore = Infinity

      for (const el of candidates) {
        const r = el.getBoundingClientRect()
        const ex = r.left + r.width / 2
        const ey = r.top + r.height / 2
        const dx = ex - ax
        const dy = ey - ay

        const inDir =
          e.key === 'ArrowRight' ? dx > 10 :
          e.key === 'ArrowLeft'  ? dx < -10 :
          e.key === 'ArrowDown'  ? dy > 10 :
                                   dy < -10

        if (!inDir) continue

        // Primary axis distance + penalty for off-axis drift
        const primary   = e.key === 'ArrowRight' || e.key === 'ArrowLeft' ? Math.abs(dx) : Math.abs(dy)
        const secondary = e.key === 'ArrowRight' || e.key === 'ArrowLeft' ? Math.abs(dy) : Math.abs(dx)
        const score = primary + secondary * 3

        if (score < bestScore) { bestScore = score; best = el }
      }

      if (best) {
        e.preventDefault()
        best.focus()
        best.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return null
}
