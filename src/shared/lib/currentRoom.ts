// Last room this browser was in, so a refresh reconnects to it instead of
// forcing re-entry. Cleared on deliberate leave or when the room is gone.

const STORAGE_KEY = 'ruin.currentRoom'

export interface StoredRoom {
  roomId: string
  code: string
}

export function getCurrentRoom(): StoredRoom | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredRoom) : null
  } catch {
    return null
  }
}

export function setCurrentRoom(room: StoredRoom): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(room))
  } catch {
    // Storage unavailable — reconnection just won't work this session.
  }
}

export function clearCurrentRoom(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
