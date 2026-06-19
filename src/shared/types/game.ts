// Round-level game types shared by both games.

export type GameMode = 'spot-the-ai' | 'trivia'

// Structured author (not a magic 'ai' id) so reveal + scoring are type-safe.
export type ResponseAuthor =
  | { kind: 'player'; playerId: string }
  | { kind: 'ai'; targetPlayerId: string }

export interface Response {
  id: string
  label?: string // anonymous label ("Response A"), assigned after shuffle
  author: ResponseAuthor
  text: string
}

export interface Vote {
  voterId: string
  responseId: string
}

export interface Round {
  index: number
  mode: GameMode
  prompt: string
  targetPlayerId?: string // spot-the-ai only
  responses: Response[]
  votes: Vote[]
}

export interface ScoreEntry {
  playerId: string
  points: number
}

export type Leaderboard = ScoreEntry[]
