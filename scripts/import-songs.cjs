const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

// --- Read env ---
const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=')
  if (idx !== -1) {
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    if (key) env[key] = val
  }
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// --- Chord detection ---
const CHORD_TOKEN = /^[A-G][#b]?(?:maj7?|min7?|m7?|dim7?|aug|sus[24]?|add9?|M7?)?(?:7|9|11|13)?(?:\/[A-G][#b]?)?$/

function isChordToken(t) {
  return CHORD_TOKEN.test(t)
}

function isChordLine(line) {
  if (!line.trim()) return false
  // split on spaces, dashes, asterisks, pipes
  const tokens = line.trim().split(/[\s\-–*|]+/).filter(t => t.length > 0)
  if (tokens.length === 0) return false
  const allChords = tokens.every(t => isChordToken(t))
  // must have at least one chord-looking token
  return allChords && tokens.some(t => /^[A-G]/.test(t))
}

function parseChordsFromLine(line) {
  const pattern = /[A-G][#b]?(?:maj7?|min7?|m7?|dim7?|aug|sus[24]?|add9?|M7?)?(?:7|9|11|13)?(?:\/[A-G][#b]?)?/g
  const chords = []
  let match
  while ((match = pattern.exec(line)) !== null) {
    chords.push({ position: match.index, chord: match[0] })
  }
  return chords
}

function mergeChordLyric(chordLine, lyricLine) {
  const chords = parseChordsFromLine(chordLine)
  chords.sort((a, b) => b.position - a.position)
  let result = lyricLine
  for (const { position, chord } of chords) {
    const pos = Math.min(position, result.length)
    result = result.slice(0, pos) + `[${chord}]` + result.slice(pos)
  }
  return result.trimEnd()
}

function convertToChordPro(raw) {
  const lines = raw.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const next = i + 1 < lines.length ? lines[i + 1] : null
    if (isChordLine(line)) {
      if (next !== null && next.trim() !== '' && !isChordLine(next)) {
        out.push(mergeChordLyric(line, next))
        i += 2
      } else {
        // standalone chord line
        const chords = parseChordsFromLine(line)
        if (chords.length > 0) {
          out.push(chords.map(c => `[${c.chord}]`).join(' '))
        } else {
          out.push(line.trimEnd())
        }
        i++
      }
    } else {
      out.push(line.trimEnd())
      i++
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

// --- Parse PDF text into song blocks ---
function parseSongs(text) {
  // Split on song headers: lines matching "Artist  //  Title"
  const headerRe = /^(.+?)\s{2,}\/\/\s{2,}(.+?)\s*$/m
  const lines = text.split('\n')
  const songStarts = []
  for (let i = 0; i < lines.length; i++) {
    if (headerRe.test(lines[i])) {
      songStarts.push(i)
    }
  }

  const songs = []
  for (let s = 0; s < songStarts.length; s++) {
    const startLine = songStarts[s]
    const endLine = s + 1 < songStarts.length ? songStarts[s + 1] : lines.length
    const headerMatch = lines[startLine].match(headerRe)
    if (!headerMatch) continue
    const artist = headerMatch[1].trim()
    const title = headerMatch[2].trim()

    // Look for capo line
    let capo = 0
    let contentStart = startLine + 1
    if (contentStart < endLine && /^\(Capo/i.test(lines[contentStart].trim())) {
      const capoLine = lines[contentStart].trim()
      const capoMatch = capoLine.match(/\(Capo\s*([^)]*)\)/i)
      if (capoMatch) {
        const capoStr = capoMatch[1].trim()
        const num = parseInt(capoStr)
        capo = isNaN(num) ? 0 : num
      }
      contentStart++
    }

    const rawContent = lines.slice(contentStart, endLine).join('\n')
    const content = convertToChordPro(rawContent)
    songs.push({ artist, title, capo, content })
  }
  return songs
}

// --- Album / year / key metadata ---
const songMeta = {
  'Dancing on my own': { album: 'Only Human', year: 2018, key: 'G' },
  'Behind blue eyes':  { album: "Who's Next", year: 1971, key: 'Am' },
  'Supergirl':         { album: 'Wish', year: 1999, key: 'Am' },
  'Wind of change':    { album: 'Crazy World', year: 1990, key: 'C' },
  'Creep':             { album: 'Pablo Honey', year: 1993, key: 'C' },
  'Zombie':            { album: 'No Need to Argue', year: 1994, key: 'Em' },
  'Stand by me':       { album: "Don't Play That Song!", year: 1962, key: 'C' },
  'House of the rising sun': { album: 'The Animals', year: 1964, key: 'Am' },
  'Let it be':         { album: 'Let It Be', year: 1970, key: 'C' },
  'Folsom prison blues': { album: 'At Folsom Prison', year: 1968, key: 'C' },
  'Jolene':            { album: 'Jolene', year: 1974, key: 'Am' },
  'Someone like you':  { album: '21', year: 2011, key: 'C' },
  'Hotel California':  { album: 'Hotel California', year: 1977, key: 'Am' },
  'Good riddance (Time of your life)': { album: 'Nimrod', year: 1997, key: 'G' },
  "Don't cry":         { album: 'Use Your Illusion I', year: 1991, key: 'Em' },
  'Patience':          { album: "G N' R Lies", year: 1988, key: 'C' },
  'Hallelujah':        { album: 'Grace', year: 1994, key: 'C' },
  'Billie Jean':       { album: 'Thriller', year: 1982, key: 'Am' },
  'Man on the moon':   { album: 'Automatic for the People', year: 1992, key: 'F' },
  'Umbrella':          { album: 'Good Girl Gone Bad', year: 2007, key: 'F' },
  'Under the bridge':  { album: 'Blood Sugar Sex Magik', year: 1991, key: 'C' },
  'Otherside':         { album: 'Californication', year: 1999, key: 'Am' },
}

// --- Main ---
async function main() {
  const text = fs.readFileSync('scripts/pdf-output.txt', 'utf8')
  const parsed = parseSongs(text)

  console.log(`Parsed ${parsed.length} songs from PDF\n`)

  for (const song of parsed) {
    const meta = songMeta[song.title] || {}
    const record = {
      title: song.title,
      artist: song.artist,
      album: meta.album || '',
      year: meta.year || null,
      capo: song.capo,
      key: meta.key || '',
      content: song.content,
    }

    console.log(`Inserting: ${record.artist} - ${record.title} (capo ${record.capo})`)

    const { error } = await supabase.from('songs').insert(record)
    if (error) {
      console.error(`  ERROR: ${error.message}`)
    } else {
      console.log(`  OK`)
    }
  }

  console.log('\nDone.')
}

main().catch(console.error)
