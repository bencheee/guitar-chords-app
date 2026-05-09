const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

function noteIndex(note: string): number {
  const si = SHARPS.indexOf(note)
  return si !== -1 ? si : FLATS.indexOf(note)
}

function transposeNote(note: string, semitones: number): string {
  const idx = noteIndex(note)
  if (idx === -1) return note
  const newIdx = ((idx + semitones) % 12 + 12) % 12
  // Keep flats if original was flat (and not also a sharp spelling)
  const useFlats = FLATS.includes(note) && !SHARPS.includes(note)
  return useFlats ? FLATS[newIdx] : SHARPS[newIdx]
}

function transposeChordName(chord: string, semitones: number): string {
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return chord
  const [, root, suffix] = match
  return transposeNote(root, semitones) + suffix
}

export function transposeContent(content: string, semitones: number): string {
  if (semitones === 0) return content
  return content.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChordName(chord, semitones)}]`)
}

export function transposeKey(key: string, semitones: number): string {
  return transposeChordName(key, semitones)
}

export interface Segment {
  chord: string  // chord name, or '' for leading lyric text with no chord above
  lyric: string  // lyric text that follows (or sits under) this chord
}

export interface ParsedLine {
  type: 'chord-lyrics' | 'text' | 'empty'
  chordLine: string
  lyricsLine: string
  segments: Segment[]
}

export function parseContent(content: string): ParsedLine[] {
  return content.split('\n').map(parseLine)
}

function parseLine(line: string): ParsedLine {
  if (!line.trim()) return { type: 'empty', chordLine: '', lyricsLine: '', segments: [] }
  if (!line.includes('[')) return { type: 'text', chordLine: '', lyricsLine: line, segments: [] }

  const pattern = /\[([^\]]+)\]/g
  const positions: { pos: number; chord: string }[] = []
  let lyrics = ''
  let lastIndex = 0

  for (const match of line.matchAll(pattern)) {
    lyrics += line.slice(lastIndex, match.index)
    positions.push({ pos: lyrics.length, chord: match[1] })
    lastIndex = (match.index ?? 0) + match[0].length
  }
  lyrics += line.slice(lastIndex)

  // Build the chord line, placing each chord at the right character column
  let chordLine = ''
  for (let i = 0; i < positions.length; i++) {
    const { pos, chord } = positions[i]
    while (chordLine.length < pos) chordLine += ' '
    if (chordLine.length > pos) chordLine += ' '
    chordLine += chord
    // Ensure at least one space between consecutive chords
    if (i < positions.length - 1 && chordLine.length >= positions[i + 1].pos) {
      chordLine += ' '
    }
  }

  // Build segments: each chord paired with the lyric text that follows it
  const segments: Segment[] = []
  if (positions.length > 0 && positions[0].pos > 0) {
    // Leading lyric text before the first chord
    segments.push({ chord: '', lyric: lyrics.slice(0, positions[0].pos) })
  }
  for (let i = 0; i < positions.length; i++) {
    const { pos, chord } = positions[i]
    const nextPos = i + 1 < positions.length ? positions[i + 1].pos : lyrics.length
    segments.push({ chord, lyric: lyrics.slice(pos, nextPos) })
  }

  return { type: 'chord-lyrics', chordLine, lyricsLine: lyrics, segments }
}
