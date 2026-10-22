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
