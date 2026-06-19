/** Public surface of the api layer. Features import from '@/api'. */
export { supabase, isSupabaseConfigured } from './client'
export {
  createRoom,
  joinRoom,
  getRoom,
  getPlayers,
  setConnected,
  leaveRoom,
  promoteHost,
  startGame,
  subscribeToPlayers,
  subscribeToRoom,
  RoomError,
  type RoomErrorReason,
  type PlayersListener,
  type RoomListener,
} from './rooms'
