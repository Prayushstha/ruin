import { useState, useEffect } from 'react'
import { NameEntry, type EnteredRoom } from '@/features/lobby/NameEntry'
import { Lobby } from '@/features/lobby/Lobby'
import type { Identity } from '@/shared/lib/identity'
import { getIdentity } from '@/shared/lib/identity'
import {
  getCurrentRoom,
  clearCurrentRoom,
} from '@/shared/lib/currentRoom'
import { getRoom } from '@/api'

// App shell — screen union + the data each screen needs. Becomes a real
// router once there are more than a couple screens.

type Screen =
  | { name: 'entry' }
  | { name: 'lobby'; identity: Identity; roomId: string; code: string; isHost: boolean }

function App() {
  const [screen, setScreen] = useState<Screen>(() => initialScreen())

  // Verify stored room still exists on mount. If not, drop back to entry.
  useEffect(() => {
    if (screen.name === 'lobby') {
      void getRoom(screen.roomId).catch(() => {
        clearCurrentRoom()
        setScreen({ name: 'entry' })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  switch (screen.name) {
    case 'entry':
      return (
        <NameEntry
          onEnter={(room: EnteredRoom) =>
            setScreen({
              name: 'lobby',
              identity: room.identity,
              roomId: room.roomId,
              code: room.code,
              isHost: room.isHost,
            })
          }
        />
      )

    case 'lobby':
      return (
        <Lobby
          identity={screen.identity}
          roomId={screen.roomId}
          code={screen.code}
          isHost={screen.isHost}
          onLeave={() => setScreen({ name: 'entry' })}
          onStarted={() => {
            // Next screen (game vote / round) isn't built yet.
          }}
        />
      )
  }
}

export default App

// Reconnect to a stored room on refresh. host_id is re-derived from the live
// room row in the Lobby, so we default isHost to false here.
function initialScreen(): Screen {
  const identity = getIdentity()
  const stored = getCurrentRoom()
  if (identity && stored) {
    return {
      name: 'lobby',
      identity,
      roomId: stored.roomId,
      code: stored.code,
      isHost: false,
    }
  }
  // Stale half-state: clear it so they re-enter cleanly.
  if (stored) clearCurrentRoom()
  return { name: 'entry' }
}
