// Local identity — display name + generated id, no auth. Stored in
// localStorage so a refresh reconnects someone as themselves.

const STORAGE_KEY = 'ruin.identity'

export interface Identity {
  id: string
  name: string
}

export function getIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Identity) : null
  } catch {
    return null
  }
}

export function setIdentity(name: string, id?: string): Identity {
  const identity: Identity = { id: id ?? crypto.randomUUID(), name: name.trim() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  } catch {
    // Storage unavailable — identity still works in-memory for the session.
  }
  return identity
}

export function clearIdentity(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
