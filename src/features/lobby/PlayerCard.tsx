import type { RoomPlayer } from '@/shared/types'

/*
 * PlayerCard — one row in the lobby's player list.
 *
 * Shows the name, a "host" badge when relevant, and a dimmed style for
 * players who've dropped (disconnected but not yet removed). A small ink
 * dot doubles as a presence indicator: filled = connected.
 */
interface PlayerCardProps {
  player: RoomPlayer
  isHost: boolean
  isYou: boolean
}

export function PlayerCard({ player, isHost, isYou }: PlayerCardProps) {
  const dim = !player.isConnected

  return (
    <li style={{ ...rowStyle, opacity: dim ? 0.4 : 1 }}>
      <span
        aria-label={player.isConnected ? 'connected' : 'disconnected'}
        style={{
          ...dotStyle,
          background: player.isConnected ? 'var(--ink-green)' : 'var(--ink-soft)',
        }}
      />
      <span>{player.displayName}</span>
      {isYou && <span style={youTagStyle}>you</span>}
      {isHost && <span style={hostBadgeStyle}>host</span>}
    </li>
  )
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: '1.15em',
  listStyle: 'none',
}

const dotStyle = {
  width: 9,
  height: 9,
  borderRadius: '50%',
  border: '1px solid var(--ink-soft)',
  flexShrink: 0,
}

const youTagStyle = {
  fontFamily: 'var(--font-hand)',
  fontSize: '0.65em',
  color: 'var(--ink-blue)',
  border: '1px dashed var(--ink-blue)',
  borderRadius: 4,
  padding: '1px 6px',
}

const hostBadgeStyle = {
  fontFamily: 'var(--font-hand)',
  fontSize: '0.65em',
  color: 'var(--ink-accent)',
  border: '1px dashed var(--ink-accent)',
  borderRadius: 4,
  padding: '1px 6px',
  marginLeft: 'auto',
}
