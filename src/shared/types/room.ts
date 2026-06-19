// Room lifecycle + state. Phase strings MUST match the `room_phase` Postgres
// enum in 0001_rooms.sql. const object + derived type (no TS enum — this
// project forbids non-erasable syntax).

export const RoomPhase = {
  Lobby: 'LOBBY',
  ProfileCollection: 'PROFILE_COLLECTION',
  RoundIntro: 'ROUND_INTRO',
  ResponseOrQuestion: 'RESPONSE_OR_QUESTION_PHASE',
  Voting: 'VOTING_PHASE',
  Reveal: 'REVEAL',
  Scoreboard: 'SCOREBOARD',
} as const

export type RoomPhase = (typeof RoomPhase)[keyof typeof RoomPhase]

export interface Room {
  id: string
  code: string
  hostId: string
  phase: RoomPhase
  createdAt: string
}

export interface RoomPlayer {
  id: string
  roomId: string
  playerId: string
  displayName: string
  joinedAt: string
  isConnected: boolean
}
