// Types and constants shared by client and server.

export const MAX_PLAYERS = 12
export const MAX_NICK = 16
export const CODE_LENGTH = 4

export const AVATAR_OPTIONS = { color: 12, face: 14, hat: 28 } as const

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
/** Wrong guesses allowed per player per question. Without a cap a script could try every rare answer until one hits. */
export const MAX_ATTEMPTS = 6

const TIER_LABELS: Record<number, string> = {
  0: 'Sin puntos',
  10: 'Común',
  30: 'Poco común',
  60: 'Raro',
  80: 'Muy raro',
  100: 'Una en un millón',
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
  endsAt: number // server clock, ms; 0 when there is no countdown
  durationMs: number // full length of the current countdown
  serverNow: number // server clock when this state was built, to correct clock skew
  scores: Record<string, number>
  answered: string[] // players who already locked in this round (never the answers)
  exhausted: string[] // players who used up their wrong guesses this round
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

export interface SuggestionPayload {
  prompt: string
  category: string
  answers: string // free text: a few example answers, optional
  nick: string
}
export const SUGGESTION_LIMITS = { prompt: 200, category: 40, answers: 600, nick: 16 } as const

export interface JoinPayload {
  code?: string // omit to create a new room
  nick: string
  avatar: Avatar
  playerId?: string // present when rejoining after a disconnect
}

export interface JoinResult {
  playerId: string
  room: RoomState
}

export interface AnswerResult {
  valid: boolean
  label?: string
  points?: number
  attemptsLeft?: number // wrong guesses still allowed in this question (only when the answer was not valid)
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
}

export interface ServerToClient {
  'room:state': (room: RoomState) => void
}
