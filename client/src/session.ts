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
  hair: 0,
  hat: 0,
  pants: 0,
})

export const loadProfile = (): Profile => read<Profile>(KEY) ?? { nick: '', avatar: randomAvatar() }
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
