import { MAX_ANSWER_LENGTH, QUESTIONS_PER_GAME, type AnswerResult, type GameStage, type GameView, type Reveal, type RoundRecord } from '../../shared/protocol'
import { REVEAL_MS, ROUND_MS } from './config'
import { buildIndex, match, suggest, type Index, type Question } from './matching'
import { logAnswer, recordRound } from './stats'

export class GameError extends Error {}

/** After a wrong answer the next try has to wait this long: a script cannot sweep through answers, a person never notices. */
export const MIN_RETRY_MS = 250

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
  /** Called once when the last question is over. */
  finished?: () => void
}

export class Game {
  private stage: GameStage = 'answering'
  private round = 0
  private endsAt = 0
  private durationMs = 0
  private locks = new Map<string, Lock>()
  private lastWrong = new Map<string, number>() // when each player last typed a wrong answer (to slow down guessing)
  private scores = new Map<string, number>()
  private scoresAtStart = new Map<string, number>() // the totals when the current round began, to see who moved up or down during it
  private reveal: Reveal | null = null
  private history: RoundRecord[] = []
  private timer: NodeJS.Timeout | null = null
  private readonly questions: Question[]
  private readonly indexes: Index[]
  private index: Index

  /** Throws (before anything starts) if a question cannot be played. The caller announces the new game. */
  constructor(private hooks: GameHooks, questions: Question[]) {
    if (questions.length < QUESTIONS_PER_GAME) throw new GameError('No hay suficientes preguntas.')
    this.questions = questions
    // Built up front: a list that became inconsistent fails here, not in the middle of the game.
    this.indexes = questions.map((q) => buildIndex(q))
    this.index = this.indexes[0]
    for (const id of hooks.members()) this.scores.set(id, 0)
    this.startRound(false)
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

  private startRound(notify = true) {
    this.stage = 'answering'
    this.scoresAtStart = new Map(this.scores)
    this.locks.clear()
    this.lastWrong.clear()
    this.reveal = null
    this.index = this.indexes[this.round]
    this.schedule(ROUND_MS, () => this.finishRound())
    if (notify) this.changed()
  }

  private finishRound() {
    if (this.stage !== 'answering') return
    // The points were already added when each answer locked in (see submit).
    const results = this.hooks.members().map((playerId) => {
      const lock = this.locks.get(playerId)
      return { playerId, answer: lock?.label ?? null, points: lock?.points ?? 0 }
    })
    const top = [...this.question.answers]
      .sort((a, b) => b.points - a.points)
      .slice(0, 6)
      .map((a) => ({ text: a.label, points: a.points }))
    // Somebody who dropped out before answering never really saw the question: do not count them as asked.
    const present = new Set(this.hooks.active())
    recordRound(this.question.id, results.filter((r) => r.answer !== null || present.has(r.playerId)).length, results.filter((r) => r.answer !== null).length)
    this.history.push({ prompt: this.question.prompt, category: this.question.category, results })
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
      try {
        this.hooks.finished?.()
      } catch (e) {
        console.error('game finished:', e)
      }
      this.changed()
    } else {
      this.round++
      this.startRound()
    }
  }

  /** Nothing more this player can do in the current round. */
  private isDone(playerId: string) {
    return this.locks.has(playerId)
  }

  /** The first valid answer locks in for the round. Wrong ones can be retried as often as you like, but not faster than a person types. */
  submit(playerId: string, text: string): AnswerResult {
    if (this.stage !== 'answering') throw new GameError('Ya terminó el tiempo.')
    if (!this.scores.has(playerId)) throw new GameError('No estás en la partida.')
    if (this.locks.has(playerId)) throw new GameError('Ya respondiste esta pregunta.')
    if (Date.now() - (this.lastWrong.get(playerId) ?? 0) < MIN_RETRY_MS) throw new GameError('Más despacio.')
    const typed = String(text ?? '').slice(0, MAX_ANSWER_LENGTH)
    const hit = match(this.index, typed)
    logAnswer(this.question.id, typed)
    if (!hit) {
      this.lastWrong.set(playerId, Date.now())
      const suggestion = suggest(this.index, typed)
      return { valid: false, ...(suggestion ? { suggestion } : {}) }
    }
    this.locks.set(playerId, hit)
    // Scores are live: the player sees their character climb right after answering, and the others see the
    // scoreboard move (they still only learn the answers at the reveal).
    this.scores.set(playerId, (this.scores.get(playerId) ?? 0) + hit.points)
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
    this.lastWrong.delete(playerId)
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
    const prevScores: Record<string, number> = {}
    for (const [id, s] of this.scoresAtStart) if (members.has(id)) prevScores[id] = s
    return {
      stage: this.stage,
      round: this.round,
      total: this.questions.length,
      category: this.question.category,
      prompt: this.question.prompt,
      hint: this.question.hint ?? '',
      endsAt: this.endsAt,
      durationMs: this.durationMs,
      serverNow: Date.now(),
      scores,
      prevScores,
      answered: [...this.locks.keys()].filter((id) => members.has(id)),
      reveal: this.reveal,
      history: this.stage === 'final' ? this.history.map((r) => ({ ...r, results: r.results.filter((x) => members.has(x.playerId)) })) : null,
    }
  }
}
