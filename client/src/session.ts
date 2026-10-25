import { AVATAR_OPTIONS, type Avatar } from '../../shared/protocol'
import { randomNick } from './nickname'

const KEY = 'leonaguila.profile'
const SESSION_KEY = 'leonaguila.session'

export interface Profile {
  nick: string
  avatar: Avatar
}
export interface Session {
  code: string
  playerId: string
}

const read = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage may be blocked; the app works without it */
  }
}

export const randomAvatar = (): Avatar => ({
  color: Math.floor(Math.random() * AVATAR_OPTIONS.color),
  face: 0,
  hat: 0,
})

/** Profiles saved by older versions still carry `hair` or `pants`: keep only what exists now. */
export const loadProfile = (): Profile => {
  const saved = read<Profile>(KEY)
  if (!saved) return { nick: randomNick(), avatar: randomAvatar() }
  const fresh = randomAvatar()
  const pick = (key: keyof Avatar) => (Number.isFinite(saved.avatar?.[key]) ? saved.avatar[key] : fresh[key])
  const wrap = (key: keyof Avatar) => ((Math.floor(pick(key)) % AVATAR_OPTIONS[key]) + AVATAR_OPTIONS[key]) % AVATAR_OPTIONS[key]
  return { nick: String(saved.nick ?? '').trim() || randomNick(), avatar: { color: wrap('color'), face: wrap('face'), hat: wrap('hat') } }
}
/**
 * A random id this browser makes up the first time and keeps. It says nothing about the person; the server only
 * stores a hash of it, to tell how many different players have played.
 */
export const deviceId = (): string => {
  const saved = read<string>('altus.device')
  if (typeof saved === 'string' && saved.length >= 8) return saved
  const fresh = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random()).slice(2) + String(Date.now())
  write('altus.device', fresh)
  return fresh
}
export const saveProfile = (p: Profile) => write(KEY, p)
export const loadSession = () => read<Session>(SESSION_KEY)
export const saveSession = (s: Session) => write(SESSION_KEY, s)
export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
