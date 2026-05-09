export interface Song {
  id: string
  title: string
  artist: string
  album: string
  year: number
  capo: number
  key: string
  content: string
  created_at: string
  updated_at: string
}

export type SongInput = Omit<Song, 'id' | 'created_at' | 'updated_at'>
