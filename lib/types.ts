export type Language = 'en' | 'hr'

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  year: number | null
  capo: number
  key: string
  language: Language
  content: string
  created_at: string
  updated_at: string
}

export type SongInput = Omit<Song, 'id' | 'created_at' | 'updated_at'>

export type SongSummary = Pick<Song, 'id' | 'title' | 'artist' | 'album' | 'year' | 'key' | 'capo' | 'language'>
