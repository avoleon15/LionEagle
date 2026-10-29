// Types and constants shared by client and server.

export const MAX_PLAYERS = 12
export const MAX_NICK = 18
export const CODE_LENGTH = 4

export const AVATAR_OPTIONS = { color: 12, face: 12, hat: 11 } as const

export interface Avatar {
  color: number
  face: number
  hat: number
}

export interface PlayerView {
  id: string
  nick: string
  avatar: Avatar
  connected: boolean
}

export type Phase = 'lobby' | 'playing'

export const QUESTIONS_PER_GAME = 7
export const TIERS = [10, 30, 60, 80, 100] as const
export const MAX_ANSWER_LENGTH = 60

const TIER_LABELS: Record<number, string> = {
  0: 'Sin puntos',
  10: 'Polluelo',
  30: 'Gorrión',
  60: 'Halcón',
  80: 'Águila',
  100: 'Rey León',
}
export const tierLabel = (points: number) => TIER_LABELS[points] ?? ''

export type GameStage = 'answering' | 'reveal' | 'final'

export interface RevealResult {
  playerId: string
  answer: string | null // canonical text of the accepted answer; null = no valid answer
  points: number
}

export interface Reveal {
  results: RevealResult[]
  top: { text: string; points: number }[] // the rarest accepted answers of the question
}

export interface GameView {
  stage: GameStage
  round: number // 0-based
  total: number
  category: string
  prompt: string
  hint: string // a short clue about what kind of answer is wanted (may be empty)
  endsAt: number // server clock, ms; 0 when there is no countdown
  durationMs: number // full length of the current countdown
  serverNow: number // server clock when this state was built, to correct clock skew
  scores: Record<string, number>
  prevScores: Record<string, number> // the totals when this round began (scores already include the answers locked in since)
  answered: string[] // players who already locked in this round (never the answers)
  reveal: Reveal | null
  history: RoundRecord[] | null // only in the final stage: what everybody answered in every round
}

export interface RoundRecord {
  prompt: string
  category: string
  results: RevealResult[]
}

export interface CategoryInfo {
  name: string
  count: number // published questions in this category
}

export interface RoomState {
  code: string
  gameNo: number // changes when a new game starts
  hostId: string
  phase: Phase
  players: PlayerView[]
  game: GameView | null
  categories: CategoryInfo[] // lobby only: what the host can choose from
  selected: string[] // lobby only: the categories chosen for the next game
}

/**
 * The quick messages players can send, in the style of Clash Royale: fixed phrases, never free text.
 * `{nombre}` marks a phrase aimed at another player (the sender picks who). `when`: during the questions, once the game is over, or both.
 */
export interface ChatPhrase {
  id: string
  text: string
  when: 'game' | 'end' | 'both'
}
export const CHAT_PHRASES: ChatPhrase[] = [
  { id: 'buena-esa', text: '¡Buena esa!', when: 'game' },
  { id: 'gracias', text: 'Gracias', when: 'both' },
  { id: 'me-equivoque', text: '¡Uy, me equivoqué!', when: 'game' },
  { id: 'suerte', text: '{nombre}, ¡qué suerte tienes!', when: 'game' },
  { id: 'trampa', text: '{nombre}, ¡eso fue trampa!', when: 'game' },
  { id: 'insulto', text: '{nombre}, ¡eres un @#$%&!', when: 'game' },
  { id: 'revancha', text: '¡Revancha!', when: 'end' },
  { id: 'perdoname', text: 'Perdóname, {nombre}, no fue personal.', when: 'end' },
]
export const CHAT_NAME_MARK = '{nombre}'
/** A player can send one message this often. */
export const CHAT_GAP_MS = 2000

export interface ChatSend {
  phrase: string
  to?: string // the player a {nombre} phrase is aimed at
}

export interface ChatMessage {
  id: string
  from: string
  phrase: string
  to?: string
}

/** Tomatoes thrown at the winner once the game is over. x and y are where it lands, from 0 to 1 across the first-place step. */
export const TOMATO_GAP_MS = 500
export interface TomatoSend {
  x: number
  y: number
}
export interface TomatoSplat extends TomatoSend {
  id: string
  from: string
}

export interface SuggestionPayload {
  prompt: string
  category: string
  answers: string // free text: a few example answers, optional
  nick: string
}
export const SUGGESTION_LIMITS = { prompt: 200, category: 40, answers: 600, nick: MAX_NICK } as const

export interface JoinPayload {
  code?: string // omit to create a new room
  nick: string
  avatar: Avatar
  playerId?: string // present when rejoining after a disconnect
  deviceId?: string // a random id the browser made up, only used to count different players
}

export interface JoinResult {
  playerId: string
  room: RoomState
}

export interface AnswerResult {
  valid: boolean
  label?: string
  points?: number
  suggestion?: string // a wrong answer one typo away from a listed answer: the label it was probably meant to be
}

export type Ack<T> = { ok: true; data: T } | { ok: false; error: string }

export interface ClientToServer {
  'room:join': (p: JoinPayload, ack: (r: Ack<JoinResult>) => void) => void
  'room:leave': () => void
  'game:start': (ack: (r: Ack<null>) => void) => void
  'room:categories': (names: string[], ack: (r: Ack<null>) => void) => void
  'game:answer': (text: string, ack: (r: Ack<AnswerResult>) => void) => void
  'game:reset': (ack: (r: Ack<null>) => void) => void
  'chat:send': (p: ChatSend, ack: (r: Ack<null>) => void) => void
  'tomato:send': (p: TomatoSend, ack: (r: Ack<null>) => void) => void
}

export interface ServerToClient {
  'room:state': (room: RoomState) => void
  'chat:msg': (m: ChatMessage) => void
  'tomato:splat': (t: TomatoSplat) => void
}
