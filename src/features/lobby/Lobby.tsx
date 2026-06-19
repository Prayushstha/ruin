import { useEffect, useState } from 'react'
import { Sketch } from '@/shared/components/Sketch'
import { SketchButton } from '@/shared/components/SketchButton'
import { Loader } from '@/shared/components/Loader'
import { leaveRoom, startGame } from '@/api'
import type { Identity } from '@/shared/lib/identity'
import { clearCurrentRoom } from '@/shared/lib/currentRoom'
import { PlayerCard } from './PlayerCard'
import { useRoomState } from './useRoomState'
import { useAutoPromoteHost } from './useAutoPromoteHost'

// Lobby — live player list, host-only start gated on min players.

const MIN_PLAYERS = 3

interface LobbyProps {
  identity: Identity
  roomId: string
  code: string
  isHost: boolean
  onLeave: () => void
  onStarted?: () => void
}

export function Lobby({
  identity,
  roomId,
  code,
  isHost,
  onLeave,
  onStarted,
}: LobbyProps) {
  const { room, players } = useRoomState(roomId, identity.id)
  useAutoPromoteHost(room, players, identity.id)

  const [starting, setStarting] = useState(false)

  // Follow the DB's host_id once the room loads; fall back to entry state.
  const amHost = room ? room.hostId === identity.id : isHost

  const [copied, setCopied] = useState(false)
  const connectedCount = players.filter((p) => p.isConnected).length
  const need = Math.max(0, MIN_PLAYERS - connectedCount)
  const canStart = need === 0 && !starting

  const handleStart = async () => {
    if (!canStart || !room) return
    setStarting(true)
    try {
      await startGame(room.id)
      onStarted?.()
    } catch {
      setStarting(false)
    }
  }

  const handleLeave = async () => {
    await leaveRoom(roomId, identity.id)
    clearCurrentRoom()
    onLeave()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked — they can read it off the screen.
    }
  }

  // Host starting advances the room; everyone follows the phase change.
  useEffect(() => {
    if (room && room.phase !== 'LOBBY') onStarted?.()
  }, [room, onStarted])

  // Room still loading — show the loader instead of an empty lobby.
  if (!room) {
    return (
      <div style={pageStyle}>
        <Loader label="connecting…" />
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <button type="button" onClick={handleLeave} style={leaveStyle}>
        ← leave
      </button>

      <header style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-soft)' }}>room code</p>
        <button
          type="button"
          onClick={handleCopy}
          title="copy room code"
          style={codeButtonStyle}
        >
          {code}
        </button>
        <p style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
          {copied ? 'copied!' : 'tap to copy — share with your friends'}
        </p>
      </header>

      <Sketch style={{ width: 'min(440px, 100%)' }} seed={13}>
        <h2 style={{ marginBottom: 12 }}>
          players ({connectedCount})
        </h2>
        <ul style={listStyle}>
          {players
            .slice()
            .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
            .map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isHost={room?.hostId === player.playerId}
                isYou={player.playerId === identity.id}
              />
            ))}
        </ul>
        <p style={{ color: 'var(--ink-soft)', marginTop: 16 }}>
          {need > 0
            ? `need ${need} more player${need > 1 ? 's' : ''} to start`
            : 'ready when you are'}
        </p>
      </Sketch>

      {amHost ? (
        <SketchButton
          seed={31}
          stroke={canStart ? 'var(--ink-green)' : 'var(--ink-soft)'}
          disabled={!canStart}
          onClick={handleStart}
        >
          {starting ? 'starting…' : 'start the game'}
        </SketchButton>
      ) : (
        <p style={{ color: 'var(--ink-soft)' }}>
          waiting for the host to start…
        </p>
      )}
    </div>
  )
}

const pageStyle = {
  minHeight: '100svh',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 28,
  padding: '0 24px',
}

const leaveStyle = {
  position: 'absolute' as const,
  top: 16,
  left: 16,
  border: 'none',
  background: 'transparent',
  color: 'var(--ink-soft)',
  cursor: 'pointer',
  fontSize: '0.9em',
}

const codeButtonStyle = {
  fontFamily: 'var(--font-casual)',
  fontSize: 'clamp(36px, 9vw, 56px)',
  letterSpacing: 2,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--ink)',
}

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
}
