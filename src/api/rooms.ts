import { supabase } from './client'
import { generateRoomCode } from '@/shared/lib/roomCode'
import { RoomPhase, type Room, type RoomPlayer } from '@/shared/types'

// Room API — the only layer that touches the rooms/room_players tables.
// All functions throw RoomError on failure so the UI can branch on reason.

export type RoomErrorReason =
  | 'not_found'
  | 'already_started'
  | 'duplicate_name'
  | 'network'
  | 'unknown'

export class RoomError extends Error {
  reason: RoomErrorReason
  constructor(reason: RoomErrorReason, message?: string) {
    super(message ?? reason)
    this.name = 'RoomError'
    this.reason = reason
  }
}

function toReason(error: { code?: string; message?: string }): RoomErrorReason {
  if (error.code === 'PGRST116') return 'not_found'
  return 'unknown'
}

function toRoom(row: DbRoom): Room {
  return {
    id: row.id,
    code: row.code,
    hostId: row.host_id,
    phase: row.phase as RoomPhase,
    createdAt: row.created_at,
  }
}

function toPlayer(row: DbRoomPlayer): RoomPlayer {
  return {
    id: row.id,
    roomId: row.room_id,
    playerId: row.player_id,
    displayName: row.display_name,
    joinedAt: row.joined_at,
    isConnected: row.is_connected,
  }
}

export async function createRoom(
  hostId: string,
  hostName: string,
): Promise<{ room: Room; player: RoomPlayer }> {
  const code = generateRoomCode()

  const { data: roomRow, error: roomErr } = await supabase
    .from('rooms')
    .insert({ code, host_id: hostId })
    .select()
    .single()
  if (roomErr) throw new RoomError(toReason(roomErr), roomErr.message)

  const { data: playerRow, error: playerErr } = await supabase
    .from('room_players')
    .insert({ room_id: roomRow.id, player_id: hostId, display_name: hostName })
    .select()
    .single()
  if (playerErr) throw new RoomError(toReason(playerErr), playerErr.message)

  return { room: toRoom(roomRow), player: toPlayer(playerRow) }
}

// Refuses to join past the LOBBY phase (late-join rule). Auto-suffixes the
// display name if it collides with an existing player in the room.
export async function joinRoom(
  code: string,
  playerId: string,
  name: string,
): Promise<{ room: Room; player: RoomPlayer; nameUsed: string }> {
  const { data: roomRow, error: roomErr } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase())
    .maybeSingle()
  if (roomErr) throw new RoomError(toReason(roomErr), roomErr.message)
  if (!roomRow) throw new RoomError('not_found')
  if (roomRow.phase !== RoomPhase.Lobby) throw new RoomError('already_started')

  const { data: existing } = await supabase
    .from('room_players')
    .select('display_name')
    .eq('room_id', roomRow.id)
  const nameUsed = dedupeName(name, (existing ?? []).map((r) => r.display_name))

  const { data: playerRow, error: playerErr } = await supabase
    .from('room_players')
    .insert({ room_id: roomRow.id, player_id: playerId, display_name: nameUsed })
    .select()
    .single()
  if (playerErr) throw new RoomError(toReason(playerErr), playerErr.message)

  return { room: toRoom(roomRow), player: toPlayer(playerRow), nameUsed }
}

export async function setConnected(
  roomId: string,
  playerId: string,
  connected: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .update({ is_connected: connected })
    .eq('room_id', roomId)
    .eq('player_id', playerId)
  if (error) throw new RoomError(toReason(error), error.message)
}

export async function leaveRoom(roomId: string, playerId: string): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', playerId)
  if (error) throw new RoomError(toReason(error), error.message)
}

export async function promoteHost(roomId: string, newHostId: string): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ host_id: newHostId })
    .eq('id', roomId)
  if (error) throw new RoomError(toReason(error), error.message)
}

export async function startGame(roomId: string): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ phase: RoomPhase.ProfileCollection })
    .eq('id', roomId)
  if (error) throw new RoomError(toReason(error), error.message)
}

export async function getPlayers(roomId: string): Promise<RoomPlayer[]> {
  const { data, error } = await supabase
    .from('room_players')
    .select()
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })
  if (error) throw new RoomError(toReason(error), error.message)
  return (data ?? []).map(toPlayer)
}

export type PlayersListener = (players: RoomPlayer[]) => void

// Refetch the whole list on any change rather than patching rows locally —
// simpler for friend-group-sized rooms and sidesteps ordering bugs.
export function subscribeToPlayers(
  roomId: string,
  onPlayers: PlayersListener,
): () => void {
  const channel = supabase
    .channel(`room:${roomId}:players`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
      () => void getPlayers(roomId).then(onPlayers),
    )
    .subscribe()
  return () => void supabase.removeChannel(channel)
}

export type RoomListener = (room: Room) => void

export function subscribeToRoom(roomId: string, onRoom: RoomListener): () => void {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      () => void getRoom(roomId).then(onRoom).catch(() => {}),
    )
    .subscribe()
  return () => void supabase.removeChannel(channel)
}

export async function getRoom(roomId: string): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .select()
    .eq('id', roomId)
    .single()
  if (error) throw new RoomError(toReason(error), error.message)
  return toRoom(data)
}

// Append " (2)", " (3)"… until the name is unique within the room.
function dedupeName(name: string, existing: string[]): string {
  const taken = new Set(existing)
  if (!taken.has(name)) return name
  let n = 2
  while (taken.has(`${name} (${n})`)) n++
  return `${name} (${n})`
}

// Snake_case DB rows. Replace with generated types once the schema is stable.
interface DbRoom {
  id: string
  code: string
  host_id: string
  phase: RoomPhase
  created_at: string
}
interface DbRoomPlayer {
  id: string
  room_id: string
  player_id: string
  display_name: string
  joined_at: string
  is_connected: boolean
}
