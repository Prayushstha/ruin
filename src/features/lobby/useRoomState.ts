import { useEffect, useState } from 'react'
import {
  getPlayers,
  getRoom,
  setConnected,
  subscribeToPlayers,
  subscribeToRoom,
} from '@/api'
import type { Room, RoomPlayer } from '@/shared/types'

// Live room + players for a room. Loads once, subscribes to realtime, marks
// this player connected on mount / disconnected on unmount.

export function useRoomState(roomId: string, playerId: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])

  useEffect(() => {
    let alive = true

    void getRoom(roomId).then((r) => {
      if (alive) setRoom(r)
    })
    void getPlayers(roomId).then((p) => {
      if (alive) setPlayers(p)
    })
    void setConnected(roomId, playerId, true)

    const unsubPlayers = subscribeToPlayers(roomId, setPlayers)
    const unsubRoom = subscribeToRoom(roomId, setRoom)

    // Mark disconnected on hard refresh / tab close.
    const handleBeforeUnload = () => {
      void setConnected(roomId, playerId, false)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      alive = false
      unsubPlayers()
      unsubRoom()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      void setConnected(roomId, playerId, false)
    }
  }, [roomId, playerId])

  return { room, players }
}
