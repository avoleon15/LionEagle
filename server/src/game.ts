import { MAX_ANSWER_LENGTH, MAX_ATTEMPTS, QUESTIONS_PER_GAME, type AnswerResult, type GameStage, type GameView, type Reveal } from '../../shared/protocol'
import { REVEAL_MS, ROUND_MS } from './config'
import { buildIndex, match, type Index, type Question } from './matching'
import { logAnswer, recordRound } from './stats'

export class GameError extends Error {}

interface Lock {
  label: string
  points: number
}

export interface GameHooks {
  /** Everyone currently in the room, connected or not. */
  members: () => string[]
  /** Members with a live connection; the round ends early once all of them have answered. */
  active: () => string[]
  /** Called whenever the visible game state changed. */
  changed: () => void
}

export class Game {
  private stage: GameStage = 'answering'
  private round = 0
  private endsAt = 0
  private durationMs = 0
  private locks = new Map<string, Lock>()
  private wrong = new Map<string, number>() // wrong guesses per player in the current round
  private scores = new Map<string, number>()
  private reveal: Reveal | null = null
  private timer: NodeJS.Timeout | null = null
  private readonly questions: Question[]
  private index: Index

  constructor(private hooks: GameHooks, questions: Question[]) {
    if (questions.length < QUESTIONS_PER_GAME) throw new GameError('No hay suficientes preguntas.')
    this.questions = questions
    this.index = buildIndex(this.questions[0])
    for (const id of hooks.members()) this.scores.set(id, 0)
    this.startRound()
  }

  private get question() {
    return this.questions[this.round]
  }

  private schedule(ms: number, fn: () => void) {
    if (this.timer) clearTimeout(this.timer)
    this.endsAt = Date.now() + ms
    this.durationMs = ms
    // A timer callback that throws would be an uncaught exception and take the whole server (every room) down.
    this.timer = setTimeout(() => {
      try {
        fn()
      } catch (e) {
        console.error('game timer:', e)
      }
    }, ms)
  }

  /** Telling the clients must never break the game logic, whatever the transport does. */
  private changed() {
    try {
      this.hooks.changed()
    } catch (e) {
      console.error('game changed:', e)
    }
  }

  private startRound() {
    this.stage = 'answering'
    this.locks.clear()
    this.wrong.clear()
    this.reveal = null
    this.index = buildIndex(this.question)
    this.schedule(ROUND_MS, () => this.finishRound())
    this.changed()
  }

  private finishRound() {
    if (this.stage !== 'answering') return
    const results = this.hooks.members().map((playerId) => {
      const lock = this.locks.get(playerId)
      const points = lock?.points ?? 0
      this.scores.set(playerId, (this.scores.get(playerId) ?? 0) + points)
      return { playerId, answer: lock?.label ?? null, points }
    })
    const top = [...this.question.answers]
      .sort((a, b) => b.points - a.points)
      .slice(0, 6)
      .map((a) => ({ text: a.label, points: a.points }))
    // Somebody who dropped out before answering never really saw the question: do not count them as asked.
    const present = new Set(this.hooks.active())
    recordRound(this.question.id, results.filter((r) => r.answer !== null || present.has(r.playerId)).length, results.filter((r) => r.answer !== null).length)
    this.reveal = { results, top }
    this.stage = 'reveal'
    this.schedule(REVEAL_MS, () => this.next())
    this.changed()
  }

  private next() {
    if (this.stage !== 'reveal') return
    if (this.round + 1 >= this.questions.length) {
      this.stage = 'final'
      this.endsAt = 0
      if (this.timer) clearTimeout(this.timer)
      this.timer = null
      this.changed()
    } else {
      this.round++
      this.startRound()
    }
  }

  /** Nothing more this player can do in the current round. */
  private isDone(playerId: string) {
    return this.locks.has(playerId) || (this.wrong.get(playerId) ?? 0) >= MAX_ATTEMPTS
  }

  /** The first valid answer locks in for the round; a limited number of wrong ones may be retried. */
  submit(playerId: string, text: string): AnswerResult {
    if (this.stage !== 'answering') throw new GameError('Ya terminó el tiempo.')
    if (!this.scores.has(playerId)) throw new GameError('No estás en la partida.')
    if (this.locks.has(playerId)) throw new GameError('Ya respondiste esta pregunta.')
    if (this.isDone(playerId)) throw new GameError('Ya no te quedan intentos en esta pregunta.')
    const typed = String(text ?? '').slice(0, MAX_ANSWER_LENGTH)
    const hit = match(this.index, typed)
    logAnswer(this.question.id, typed)
    if (!hit) {
      const used = (this.wrong.get(playerId) ?? 0) + 1
      this.wrong.set(playerId, used)
      if (used >= MAX_ATTEMPTS) {
        this.changed() // others see that this player is out of tries
        this.checkEarlyEnd()
      }
      return { valid: false, attemptsLeft: MAX_ATTEMPTS - used }
    }
    this.locks.set(playerId, hit)
    this.changed()
    this.checkEarlyEnd()
    return { valid: true, label: hit.label, points: hit.points }
  }

  /** Ends the round as soon as every connected player has answered or run out of tries. */
  checkEarlyEnd() {
    if (this.stage !== 'answering') return
    const active = this.hooks.active()
    if (active.length > 0 && active.every((id) => this.isDone(id))) this.finishRound()
  }

  removePlayer(playerId: string) {
    this.scores.delete(playerId)
    this.locks.delete(playerId)
    this.wrong.delete(playerId)
    this.checkEarlyEnd()
  }

  isFinished() {
    return this.stage === 'final'
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }

  view(): GameView {
    const members = new Set(this.hooks.members())
    const scores: Record<string, number> = {}
    for (const [id, s] of this.scores) if (members.has(id)) scores[id] = s
    return {
      stage: this.stage,
      round: this.round,
      total: this.questions.length,
      category: this.question.category,
      prompt: this.question.prompt,
      endsAt: this.endsAt,
      durationMs: this.durationMs,
      serverNow: Date.now(),
      scores,
      answered: [...this.locks.keys()].filter((id) => members.has(id)),
      exhausted: [...this.wrong].filter(([id, n]) => n >= MAX_ATTEMPTS && !this.locks.has(id) && members.has(id)).map(([id]) => id),
      reveal: this.reveal,
    }
  }
}
