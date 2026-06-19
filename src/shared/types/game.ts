/**
 * Round-level game types shared by both games. Each game (spot-the-ai,
 * trivia) extends these with its own specifics under features/game/*.
 */

/** Which game a round runs. */
export type GameMode = 'spot-the-ai' | 'trivia'

/**
 * Who authored a response. Either a real player, or the AI impersonating a
 * specific player (Spot the AI). Keeping the author structured (rather than
 * a magic id like 'ai') makes the reveal + scoring logic type-safe.
 */
export type ResponseAuthor =
  | { kind: 'player'; playerId: string }
  | { kind: 'ai'; targetPlayerId: string }

export interface Response {
  id: string
  /** Anonymous label shown while voting ("Response A", …). Assigned after shuffle. */
  label?: string
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
  /** Spot-the-ai only: the player being impersonated this round. */
  targetPlayerId?: string
  responses: Response[]
  votes: Vote[]
}

/** Per-player points within a session. */
export interface ScoreEntry {
  playerId: string
  points: number
}

export type Leaderboard = ScoreEntry[]
