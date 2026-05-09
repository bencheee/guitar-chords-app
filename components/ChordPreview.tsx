'use client'

import { parseContent } from '@/lib/chord-utils'

interface Props {
  content: string
  fontSize?: number
}

export default function ChordPreview({ content, fontSize = 14 }: Props) {
  const lines = parseContent(content)

  if (!content.trim()) {
    return (
      <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '14px' }}>
        Preview will appear here as you type…
      </div>
    )
  }

  return (
    <div
      style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: `${fontSize}px`,
        lineHeight: 1.6,
        overflowX: 'auto',
      }}
    >
      {lines.map((line, i) => {
        if (line.type === 'empty') {
          return <div key={i} style={{ height: `${fontSize * 1.6}px` }} />
        }
        if (line.type === 'text') {
          return (
            <div key={i} style={{ whiteSpace: 'pre', color: 'var(--text)' }}>
              {line.lyricsLine}
            </div>
          )
        }
        // chord-lyrics
        return (
          <div key={i}>
            <div style={{ whiteSpace: 'pre', color: 'var(--gold)', fontWeight: 600 }}>
              {line.chordLine}
            </div>
            <div style={{ whiteSpace: 'pre', color: 'var(--text)' }}>
              {line.lyricsLine || ' '}
            </div>
          </div>
        )
      })}
    </div>
  )
}
