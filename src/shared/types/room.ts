/**
 * A room is one session: one host, one group of friends, a live lifecycle
 * that can mix rounds of both games. This file models the shared room state
 * machine described in idea.md, independent of any specific game's round.
 *
 *   LOBBY → PROFILE_COLLECTION → ROUND_INTRO →
 *   RESPONSE_OR_QUESTION_PHASE → VOTING_PHASE → REVEAL →
 *   SCOREBOARD → (next round, or back to LOBBY)
 *
 * Note: we use a `const` object + derived type rather than an `enum` so the
 * config's `erasableSyntaxOnly` rule is satisfied (enums aren't erasable).
 */
export const GamePhase = {
  Lobby: 'LOBBY',
  ProfileCollection: 'PROFILE_COLLECTION',
  RoundIntro: 'ROUND_INTRO',
  ResponseOrQuestion: 'RESPONSE_OR_QUESTION_PHASE',
  Voting: 'VOTING_PHASE',
  Reveal: 'REVEAL',
  Scoreboard: 'SCOREBOARD',
} as const

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase]

/**
 * Opaque room join code, e.g. "RUIN-42". Branded so it can't be silently
 * swapped with any string — it's a user-facing token that gets validated.
 */
export type RoomCode = string & { readonly __brand: 'RoomCode' }

/** One game session. */
export interface Room {
  id: string
  code: RoomCode
  hostId: string
  phase: GamePhase
  playerIds: string[]
  createdAt: string
}
