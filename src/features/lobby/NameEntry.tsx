import { useState } from 'react'
import { Sketch } from '@/shared/components/Sketch'
import { SketchButton } from '@/shared/components/SketchButton'
import { createRoom, joinRoom, RoomError } from '@/api'
import { setIdentity, type Identity } from '@/shared/lib/identity'
import { setCurrentRoom } from '@/shared/lib/currentRoom'

// Name entry → create or join a room. Identity is name-only, no auth.
// Duplicate names are auto-suffixed by the api; nameUsed is passed back.

export interface EnteredRoom {
  identity: Identity
  roomId: string
  code: string
  isHost: boolean
}

interface NameEntryProps {
  onEnter: (room: EnteredRoom) => void
}

export function NameEntry({ onEnter }: NameEntryProps) {
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'choose' | 'join'>('choose')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'create' | 'join'>(null)

  const canAct = name.trim().length > 0 && busy === null

  const handleCreate = async () => {
    if (!canAct) return
    setBusy('create')
    setError(null)
    try {
      const identity = setIdentity(name)
      const { room } = await createRoom(identity.id, identity.name)
      setCurrentRoom({ roomId: room.id, code: room.code })
      onEnter({ identity, roomId: room.id, code: room.code, isHost: true })
    } catch {
      setError('could not create the room — try again')
    } finally {
      setBusy(null)
    }
  }

  const handleJoin = async () => {
    if (!canAct || !code.trim()) return
    setBusy('join')
    setError(null)
    try {
      const identity = setIdentity(name)
      const { room, nameUsed } = await joinRoom(
        code.trim(),
        identity.id,
        identity.name,
      )
      // If the api suffixed our name, persist the name we actually got.
      if (nameUsed !== identity.name) setIdentity(nameUsed, identity.id)
      setCurrentRoom({ roomId: room.id, code: room.code })
      onEnter({
        identity: { ...identity, name: nameUsed },
        roomId: room.id,
        code: room.code,
        isHost: false,
      })
    } catch (e) {
      setError(
        e instanceof RoomError
          ? friendlyJoinError(e.reason)
          : 'could not join the room — try again',
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <div style={pageStyle}>
      <header style={{ textAlign: 'center' }}>
        <h1>ruin</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
          game night for friend groups
        </p>
      </header>

      <Sketch style={{ width: 'min(440px, 100%)' }} seed={7}>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <label style={fieldStyle}>
            <span>what should we call you?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name"
              autoFocus
              style={inputStyle}
            />
          </label>

          {mode === 'choose' && (
            <div style={rowStyle}>
              <SketchButton
                seed={11}
                stroke="var(--ink-accent)"
                disabled={!canAct}
                onClick={handleCreate}
              >
                {busy === 'create' ? 'making the room…' : 'create a room'}
              </SketchButton>
              <SketchButton
                seed={23}
                stroke="var(--ink-blue)"
                disabled={!canAct}
                onClick={() => setMode('join')}
              >
                join with code
              </SketchButton>
            </div>
          )}

          {mode === 'join' && (
            <>
              <label style={fieldStyle}>
                <span>room code</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="MOSS-RAVEN"
                  style={{ ...inputStyle, textTransform: 'uppercase' }}
                />
              </label>
              <div style={{ ...rowStyle, alignItems: 'center' }}>
                <SketchButton
                  seed={23}
                  stroke="var(--ink-blue)"
                  disabled={!canAct || !code.trim()}
                  onClick={handleJoin}
                >
                  {busy === 'join' ? 'joining…' : 'join'}
                </SketchButton>
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  style={linkButtonStyle}
                >
                  back
                </button>
              </div>
            </>
          )}

          {error && <p style={errorStyle}>{error}</p>}
        </form>
      </Sketch>
    </div>
  )
}

/** Map api error reasons to friendly messages. */
function friendlyJoinError(reason: RoomError['reason']): string {
  switch (reason) {
    case 'not_found':
      return 'no room with that code — check it with the host'
    case 'already_started':
      return 'that game already started — wait for the next round'
    default:
      return 'could not join the room — try again'
  }
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

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
}

const inputStyle = {
  padding: '10px 12px',
  border: 'none',
  borderBottom: '2px dashed var(--ink-soft)',
  background: 'transparent',
  outline: 'none',
}

const rowStyle = {
  display: 'flex',
  gap: 16,
  justifyContent: 'center',
}

const linkButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: 'var(--ink-soft)',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.9em',
}

const errorStyle = {
  color: 'var(--ink-accent)',
  textAlign: 'center' as const,
  margin: 0,
}
