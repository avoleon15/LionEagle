import { randomUUID } from 'node:crypto'
import {
  AVATAR_OPTIONS,
  CODE_LENGTH,
  QUESTIONS_PER_GAME,
  MAX_NICK,
  MAX_PLAYERS,
  type Avatar,
  type JoinPayload,
  type Phase,
  type RoomState,
} from '../../shared/protocol'
import { HOST_HANDOVER_MS } from './config'
import * as db from './db'
import { Game } from './game'
import { selectQuestions } from './selection'

// No 0/O/1/I so codes are easy to read aloud.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const GRACE_MS = 60_000

interface Player {
  id: string
  nick: string
  avatar: Avatar
  socketId: string | null
  dropTimer: NodeJS.Timeout | null
}

interface Room {
  code: string
  hostId: string
  phase: Phase
  players: Map<string, Player>
  game: Game | null
  selected: string[] | null // categories for the next game; null = all of them
  played: Set<string> // question ids this room has already seen
  handoverTimer: NodeJS.Timeout | null // set while the host is disconnected
}

const rooms = new Map<string, Room>()

let notify: (room: Room) => void = () => {}
/** Registers the function that pushes a room's state to its clients (used by game timers). */
export function onRoomChange(fn: (room: Room) => void) {
  notify = fn
}

export class RoomError extends Error {}

/** Clients are not trusted: whatever arrives as a join request becomes a well-formed payload (or an error). */
export function sanitizeJoin(raw: unknown): JoinPayload {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new RoomError('Datos inválidos.')
  const r = raw as Record<string, unknown>
  if (r.code != null && typeof r.code !== 'string') throw new RoomError('Datos inválidos.') // a wrong code must not silently create a room
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined)
  return {
    code: text(r.code, 16)?.trim().toUpperCase() || undefined,
    nick: text(r.nick, 200) ?? '',
    avatar: (typeof r.avatar === 'object' && r.avatar !== null ? r.avatar : {}) as Avatar,
    playerId: text(r.playerId, 64) || undefined,
  }
}

function clampAvatar(a: Avatar): Avatar {
  const c = (v: unknown, max: number) => Math.min(max - 1, Math.max(0, Math.floor(Number(v)) || 0))
  return {
    color: c(a?.color, AVATAR_OPTIONS.color),
    face: c(a?.face, AVATAR_OPTIONS.face),
    hair: c(a?.hair, AVATAR_OPTIONS.hair),
    hat: c(a?.hat, AVATAR_OPTIONS.hat),
    pants: c(a?.pants, AVATAR_OPTIONS.pants),
  }
}

function cleanNick(raw: unknown): string {
  const nick = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NICK)
  if (!nick) throw new RoomError('Escribe un apodo.')
  return nick
}

function newCode(): string {
  for (;;) {
    let code = ''
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
    }
    if (!rooms.has(code)) return code
  }
}

/**
 * The categories the next game would draw from. A category can disappear after the host picked it (the owner
 * archived its last question): drop those, and if nothing is left fall back to everything, never to "nothing".
 */
function selection(room: Room, names: string[]): string[] {
  const chosen = room.selected?.filter((n) => names.includes(n)) ?? []
  return chosen.length > 0 ? chosen : names
}

export function view(room: Room): RoomState {
  const lobby = room.phase === 'lobby'
  const categories = lobby ? db.categories() : []
  const names = categories.map((c) => c.name)
  const selected = lobby ? selection(room, names) : []
  return {
    categories,
    selected,
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    game: room.game ? room.game.view() : null,
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      nick: p.nick,
      avatar: p.avatar,
      connected: p.socketId !== null,
    })),
  }
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code)
}

/** Creates or joins a room (or rejoins one when playerId matches). */
export function join(
  socketId: string,
  raw: unknown,
): { room: Room; player: Player } {
  const p = sanitizeJoin(raw)
  const nick = cleanNick(p.nick)
  const avatar = clampAvatar(p.avatar)

  if (!p.code) {
    const room: Room = { code: newCode(), hostId: '', phase: 'lobby', players: new Map(), game: null, selected: null, played: new Set(), handoverTimer: null }
    const player: Player = { id: randomUUID(), nick, avatar, socketId, dropTimer: null }
    room.hostId = player.id
    room.players.set(player.id, player)
    rooms.set(room.code, room)
    return { room, player }
  }

  const room = rooms.get(p.code)
  if (!room) throw new RoomError('No existe una sala con ese código.')

  const existing = p.playerId ? room.players.get(p.playerId) : undefined
  if (existing) {
    if (existing.dropTimer) clearTimeout(existing.dropTimer)
    existing.dropTimer = null
    existing.socketId = socketId
    // The saved nick may have been taken by somebody else in the meantime: keep the current one then.
    const clash = [...room.players.values()].some((q) => q.id !== existing.id && q.nick.toLowerCase() === nick.toLowerCase())
    if (!clash) existing.nick = nick
    existing.avatar = avatar
    if (room.hostId === existing.id && room.handoverTimer) {
      clearTimeout(room.handoverTimer)
      room.handoverTimer = null
    }
    return { room, player: existing }
  }

  if (room.phase !== 'lobby') throw new RoomError('La partida ya empezó.')
  if (room.players.size >= MAX_PLAYERS) throw new RoomError('La sala está llena.')
  const taken = [...room.players.values()].some((q) => q.nick.toLowerCase() === nick.toLowerCase())
  if (taken) throw new RoomError('Ese apodo ya está en uso en la sala.')

  const player: Player = { id: randomUUID(), nick, avatar, socketId, dropTimer: null }
  room.players.set(player.id, player)
  return { room, player }
}

function removePlayer(room: Room, playerId: string): void {
  const p = room.players.get(playerId)
  if (p?.dropTimer) clearTimeout(p.dropTimer)
  room.players.delete(playerId)
  if (room.players.size === 0) {
    if (room.handoverTimer) clearTimeout(room.handoverTimer)
    room.game?.dispose()
    rooms.delete(room.code)
    return
  }
  room.game?.removePlayer(playerId)
  if (room.hostId === playerId) {
    const next = [...room.players.values()].find((q) => q.socketId !== null) ?? [...room.players.values()][0]
    room.hostId = next.id
    if (room.handoverTimer) clearTimeout(room.handoverTimer)
    room.handoverTimer = null
  }
}

/** A host who stays away for a few seconds loses the room to a connected player, so the game is never stuck waiting for them. */
function scheduleHandover(room: Room) {
  if (room.handoverTimer) clearTimeout(room.handoverTimer)
  room.handoverTimer = setTimeout(() => {
    room.handoverTimer = null
    try {
      const host = room.players.get(room.hostId)
      if (!host || host.socketId !== null) return
      const next = [...room.players.values()].find((q) => q.socketId !== null)
      if (!next) return // everybody is gone: the grace timers will clean up
      room.hostId = next.id
      notify(room)
    } catch (e) {
      console.error('host handover:', e)
    }
  }, HOST_HANDOVER_MS)
}

/** Voluntary leave: remove immediately. Returns the room if it still exists. */
export function leave(socketId: string): Room | undefined {
  const found = findBySocket(socketId)
  if (!found) return undefined
  removePlayer(found.room, found.player.id)
  return rooms.get(found.room.code)
}

/** Connection lost: keep the seat for a grace period so the player can rejoin. */
export function disconnect(socketId: string, onExpire: (room: Room) => void): Room | undefined {
  const found = findBySocket(socketId)
  if (!found) return undefined
  const { room, player } = found
  player.socketId = null
  room.game?.checkEarlyEnd()
  if (room.hostId === player.id) scheduleHandover(room)
  player.dropTimer = setTimeout(() => {
    removePlayer(room, player.id)
    if (rooms.has(room.code)) onExpire(room)
  }, GRACE_MS)
  return room
}

export function findBySocket(socketId: string): { room: Room; player: Player } | undefined {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.socketId === socketId) return { room, player }
    }
  }
  return undefined
}

export function start(socketId: string): Room {
  const found = findBySocket(socketId)
  if (!found) throw new RoomError('No estás en una sala.')
  const { room, player } = found
  if (room.hostId !== player.id) throw new RoomError('Solo el anfitrión puede empezar.')
  if (room.phase !== 'lobby') throw new RoomError('La partida ya empezó.')
  if (room.players.size < 2) throw new RoomError('Se necesitan al menos 2 jugadores.')
  const pool = db.playable(selection(room, db.categories().map((c) => c.name)))
  if (pool.length < QUESTIONS_PER_GAME) {
    throw new RoomError(`Con esas categorías solo hay ${pool.length} preguntas y se necesitan ${QUESTIONS_PER_GAME}. Elige más categorías.`)
  }
  const picked = selectQuestions(pool, QUESTIONS_PER_GAME, room.played)
  if (picked.some((q) => room.played.has(q.id))) room.played.clear() // the room has seen everything: start over
  picked.forEach((q) => room.played.add(q.id))
  room.phase = 'playing'
  room.game = new Game(
    {
      members: () => [...room.players.keys()],
      active: () => [...room.players.values()].filter((p) => p.socketId !== null).map((p) => p.id),
      changed: () => notify(room),
    },
    picked,
  )
  return room
}

/** The host chooses which categories the next game draws from. */
export function setCategories(socketId: string, names: string[]): Room {
  const found = findBySocket(socketId)
  if (!found) throw new RoomError('No estás en una sala.')
  const { room, player } = found
  if (room.hostId !== player.id) throw new RoomError('Solo el anfitrión elige las categorías.')
  if (room.phase !== 'lobby') throw new RoomError('La partida ya empezó.')
  const available = db.categories().map((c) => c.name)
  const chosen = [...new Set(names)].filter((n) => available.includes(n))
  if (chosen.length === 0) throw new RoomError('Elige al menos una categoría.')
  room.selected = chosen.length === available.length ? null : chosen
  return room
}

export function answer(socketId: string, text: string) {
  const found = findBySocket(socketId)
  if (!found?.room.game) throw new RoomError('No hay una partida en curso.')
  return found.room.game.submit(found.player.id, text)
}

/** Host sends everyone back to the lobby once the game is over. */
export function reset(socketId: string): Room {
  const found = findBySocket(socketId)
  if (!found) throw new RoomError('No estás en una sala.')
  const { room, player } = found
  if (room.hostId !== player.id) throw new RoomError('Solo el anfitrión puede volver a la sala.')
  if (!room.game?.isFinished()) throw new RoomError('La partida no ha terminado.')
  room.game.dispose()
  room.game = null
  room.phase = 'lobby'
  return room
}
