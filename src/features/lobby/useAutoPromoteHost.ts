import { useEffect, useRef } from 'react'
import { promoteHost } from '@/api'
import type { Room, RoomPlayer } from '@/shared/types'

// When the host shows as disconnected, hand host duties to the
// next-longest-joined connected player. Every client evaluates this; the
// promoteHost update is idempotent so the first to fire wins.

export function useAutoPromoteHost(
  room: Room | null,
  players: RoomPlayer[],
  myPlayerId: string,
) {
  const lastPromoted = useRef<string | null>(null)

  useEffect(() => {
    if (!room) return

    const host = players.find((p) => p.playerId === room.hostId)
    if (!host || host.isConnected) return

    const nextHost = players
      .filter((p) => p.isConnected && p.playerId !== room.hostId)
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0]

    if (!nextHost) return
    if (lastPromoted.current === nextHost.playerId) return

    lastPromoted.current = nextHost.playerId
    void promoteHost(room.id, nextHost.playerId)
  }, [room, players, myPlayerId])
}
