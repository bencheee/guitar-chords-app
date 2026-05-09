'use client'

import { parseContent } from '@/lib/chord-utils'

interface Props {
  content: string
  fontSize?: number
}

function splitIntoWordTokens(lyric: string): string[] {
  const leadingSpace = lyric.match(/^\s+/)?.[0] ?? ''
  const words = lyric.trimStart().match(/\S+\s*/g) ?? []
  if (words.length === 0) return [lyric || ' ']
  words[0] = leadingSpace + words[0]
  return words
}

export default function ChordPreview({ content, fontSize = 14 }: Props) {
  const lines = parseContent(content)
  const chordFontSize = Math.round(fontSize * 0.82)

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
      }}
    >
      {lines.map((line, i) => {
        if (line.type === 'empty') {
          return <div key={i} style={{ height: `${fontSize * 1.6}px` }} />
        }
        if (line.type === 'text') {
          return (
            <div key={i} style={{ whiteSpace: 'pre-wrap', color: 'var(--text)', lineHeight: 1.9 }}>
              {line.lyricsLine}
            </div>
          )
        }
        const tokens = line.segments.flatMap(({ chord, lyric }) =>
          splitIntoWordTokens(lyric).map((word, idx) => ({
            chord: idx === 0 ? chord : '',
            word,
          }))
        )
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              rowGap: `${Math.round(fontSize * 0.5)}px`,
              marginBottom: `${Math.round(fontSize * 0.9)}px`,
            }}
          >
            {tokens.map(({ chord, word }, j) => (
              <span
                key={j}
                style={{ display: 'inline-flex', flexDirection: 'column', whiteSpace: 'pre' }}
              >
                <span style={{
                  color: 'var(--gold)',
                  fontWeight: 600,
                  fontSize: `${chordFontSize}px`,
                  lineHeight: 1.3,
                  minHeight: `${Math.round(chordFontSize * 1.3)}px`,
                  display: 'block',
                }}>
                  {chord}
                </span>
                <span style={{ color: 'var(--text)', lineHeight: 1.6, display: 'block' }}>
                  {word}
                </span>
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
