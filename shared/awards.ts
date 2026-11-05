import type { RoundRecord } from './protocol'

// "Menciones honoríficas": small prizes shown under the podium. Many kinds exist, but only the three that stand out most in
// this game are shown (never two for the same player or of the same kind). They do not change the score.

export type AwardKind = 'joya' | 'cazarrarezas' | 'silencioso' | 'colmena' | 'llamas' | 'reloj' | 'final'

export interface Award {
  kind: AwardKind
  title: string
  playerId: string
  detail: string
  /** How much the award stands out in this game, from 0 to 1: the three highest are shown. */
  strength: number
}

export const MAX_AWARDS = 3
const MIN_PLAYERS = 2
const MIN_ROUNDS = 4

interface Row {
  id: string
  pts: number[] // points per round, 0 when there was no valid answer
  answered: boolean[]
  answers: (string | null)[]
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Best candidate of one kind: the highest value, and on a tie the player who joined first. When everybody has the very same value nobody stands out. */
function best(rows: Row[], value: (r: Row) => number, min: number): { row: Row; v: number } | null {
  let pick: { row: Row; v: number } | null = null
  const values = rows.map(value)
  rows.forEach((row, i) => {
    if (values[i] >= min && (!pick || values[i] > pick.v)) pick = { row, v: values[i] }
  })
  return values.every((v) => Math.abs(v - values[0]) < 1e-9) ? null : pick
}

const longestRun = (pts: number[], atLeast: number) => {
  let run = 0
  let top = 0
  for (const p of pts) {
    run = p >= atLeast ? run + 1 : 0
    top = Math.max(top, run)
  }
  return top
}
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / (a.length || 1)

/**
 * Every kind of mention picks its own winner (if anybody deserves it), then the strongest three are kept, one per player.
 * Fewer than two players or fewer than four rounds give no mentions at all; a kind with nobody above its bar is left out.
 */
export function computeAwards(playerIds: string[], history: RoundRecord[]): Award[] {
  const total = history.length
  if (playerIds.length < MIN_PLAYERS || total < MIN_ROUNDS) return []
  const rows: Row[] = playerIds.map((id) => ({
    id,
    pts: history.map((r) => r.results.find((x) => x.playerId === id)?.points ?? 0),
    answered: history.map((r) => (r.results.find((x) => x.playerId === id)?.answer ?? null) !== null),
    answers: history.map((r) => r.results.find((x) => x.playerId === id)?.answer ?? null),
  }))
  const out: Award[] = []
  const add = (kind: AwardKind, title: string, row: Row | undefined, detail: string, strength: number) => {
    if (row) out.push({ kind, title, playerId: row.id, detail, strength: Math.min(1, strength) })
  }

  // The rarest answer: the highest value of the game, strongest when only that player found it in that round.
  let joya: { row: Row; round: number; alone: boolean } | null = null
  history.forEach((r, i) => {
    for (const x of r.results) {
      if (x.points < 100 || !x.answer) continue
      const row = rows.find((p) => p.id === x.playerId)
      const alone = r.results.filter((y) => y.points >= 100).length === 1
      if (row && (!joya || (alone && !joya.alone))) joya = { row, round: i, alone }
    }
  })
  const j = joya as { row: Row; round: number; alone: boolean } | null
  if (j) add('joya', 'La joya rara', j.row, `Rara: «${j.row.answers[j.round]}»`, j.alone ? 0.62 : 0.42)

  const kings = best(rows, (r) => r.pts.filter((p) => p >= 100).length, 2)
  if (kings) add('cazarrarezas', 'Cazarrarezas', kings.row, plural(kings.v, 'respuesta rara', 'respuestas raras'), (kings.v / total) * 1.6)

  const silent = best(rows, (r) => r.answered.filter((a) => !a).length, 2)
  if (silent) add('silencioso', 'El silencioso', silent.row, `${silent.v} sin responder`, (silent.v / total) * 1.4)

  const hive = best(rows, (r) => r.pts.filter((p) => p === 10).length, 3)
  if (hive) add('colmena', 'Mente colmena', hive.row, `${hive.v} respuestas comunes`, (hive.v / total) * 1.2)

  const fire = best(rows, (r) => longestRun(r.pts, 60), 3)
  if (fire) add('llamas', 'En llamas', fire.row, `${fire.v} raras seguidas`, (fire.v / total) * 1.3)

  // Steadiest: answered every round, a decent average and little ups and downs (spread / average).
  const steady = best(
    rows,
    (r) => {
      const m = mean(r.pts)
      if (r.answered.some((a) => !a) || m < 30) return -1
      const sd = Math.sqrt(mean(r.pts.map((p) => (p - m) ** 2)))
      return 1 - sd / m
    },
    0.55,
  )
  if (steady) add('reloj', 'Reloj suizo', steady.row, 'Puntos parejos', steady.v)

  // Late bloomer: how much better the last three rounds went than the ones before.
  const gain = best(rows, (r) => mean(r.pts.slice(-3)) - mean(r.pts.slice(0, -3)), 25)
  if (gain) add('final', 'Final de campeón', gain.row, `+${Math.round(gain.v)} por ronda al final`, (gain.v / 100) * 1.5)

  out.sort((a, b) => b.strength - a.strength)
  const kept: Award[] = []
  for (const a of out) {
    if (kept.length === MAX_AWARDS) break
    if (!kept.some((k) => k.playerId === a.playerId)) kept.push(a)
  }
  return kept
}
