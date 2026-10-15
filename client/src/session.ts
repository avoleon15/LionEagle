import { AVATAR_OPTIONS, type Avatar } from '../../shared/protocol'

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
  pants: 0,
})

/** Profiles saved before the haircut option was removed still carry a `hair` field: keep only what exists now. */
export const loadProfile = (): Profile => {
  const saved = read<Profile>(KEY)
  if (!saved) return { nick: '', avatar: randomAvatar() }
  const fresh = randomAvatar()
  const pick = (key: keyof Avatar) => (Number.isFinite(saved.avatar?.[key]) ? saved.avatar[key] : fresh[key])
  return { nick: String(saved.nick ?? ''), avatar: { color: pick('color'), face: pick('face'), hat: pick('hat') % AVATAR_OPTIONS.hat, pants: pick('pants') } }
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
