import { handle, getQuestion, listQuestions, saveQuestion, InputError, type SaveResult } from './db'
import { buildIndex, keys, match, validateQuestion, type Index } from './matching'

// What players type is logged per question (never who typed it). Answers that are not on the list are the
// useful part: the ones that many people try are probably valid answers we forgot. Whether a logged answer
// counts is decided when it is read, against the question as it is now, so editing a list updates the history.

const MAX_TEXT = 60
/** Distinct typed answers remembered per question; beyond this only answers already seen keep counting. */
export const MAX_LOG_ROWS = 400

/** Never lets a logging problem break a game. */
function safe(fn: () => void) {
  try {
    fn()
  } catch (e) {
    console.error('stats:', e)
  }
}

export function logAnswer(questionId: string, text: string): void {
  safe(() => {
    const t = String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT)
    const key = keys(t)[0]
    if (!key) return
    const now = Date.now()
    const seen = handle().prepare('UPDATE answer_log SET count = count + 1, last_at = ? WHERE question_id = ? AND key = ?').run(now, questionId, key)
    if (Number(seen.changes) > 0) return
    const { n } = handle().prepare('SELECT COUNT(*) AS n FROM answer_log WHERE question_id = ?').get(questionId) as { n: number }
    if (n >= MAX_LOG_ROWS) return // somebody is flooding the log with new junk: remember nothing new
    handle().prepare('INSERT INTO answer_log (question_id, key, text, count, first_at, last_at) VALUES (?, ?, ?, 1, ?, ?)').run(questionId, key, t, now, now)
  })
}

/** Called when a round ends: `asked` players saw the question, `answered` of them locked in a valid answer. */
export function recordRound(questionId: string, asked: number, answered: number): void {
  safe(() => {
    handle()
      .prepare(
        `INSERT INTO question_stats (question_id, asked, answered) VALUES (?, ?, ?)
         ON CONFLICT(question_id) DO UPDATE SET asked = asked + excluded.asked, answered = answered + excluded.answered`,
      )
      .run(questionId, asked, answered)
  })
}

/** Share of all valid answers -> the tier it suggests (same scale as the answer lists). */
export function suggestTier(share: number): 10 | 30 | 60 | 80 | 100 {
  if (share >= 0.08) return 10
  if (share >= 0.03) return 30
  if (share >= 0.01) return 60
  if (share >= 0.003) return 80
  return 100
}

/** Below this many valid answers a question has too little data to suggest tiers. */
export const MIN_FOR_SUGGESTIONS = 100

export interface LoggedAnswer {
  key: string
  text: string
  count: number
  lastAt: number
  ignored: boolean
}

export interface AnswerStat {
  label: string
  points: number
  count: number
  share: number
  suggested: number | null
}

export interface Detail {
  id: string
  prompt: string
  category: string
  asked: number
  answered: number
  validTotal: number
  unknownTotal: number // attempts that were not on the list (not counting ignored ones)
  answers: AnswerStat[]
  unknown: LoggedAnswer[] // sorted by how many times they were tried
}

function loggedRows(id: string): LoggedAnswer[] {
  return handle()
    .prepare('SELECT key, text, count, last_at, ignored FROM answer_log WHERE question_id = ? ORDER BY count DESC, last_at DESC')
    .all(id)
    .map((r) => ({ key: r.key as string, text: r.text as string, count: Number(r.count), lastAt: Number(r.last_at), ignored: Number(r.ignored) === 1 }))
}

function counters(id: string) {
  const r = handle().prepare('SELECT asked, answered FROM question_stats WHERE question_id = ?').get(id) as { asked: number; answered: number } | undefined
  return { asked: Number(r?.asked ?? 0), answered: Number(r?.answered ?? 0) }
}

export function detail(id: string): Detail | null {
  const q = getQuestion(id)
  if (!q) return null
  let index: Index | null = null
  try {
    index = buildIndex(q)
  } catch {
    index = null // a draft with clashing answers: treat everything as unknown
  }
  const byLabel = new Map<string, number>(q.answers.map((a) => [a.label, 0]))
  const unknown: LoggedAnswer[] = []
  let validTotal = 0
  for (const row of loggedRows(id)) {
    const hit = index ? match(index, row.text) : null
    if (hit) {
      byLabel.set(hit.label, (byLabel.get(hit.label) ?? 0) + row.count)
      validTotal += row.count
    } else {
      unknown.push(row)
    }
  }
  const enough = validTotal >= MIN_FOR_SUGGESTIONS
  const answers = q.answers
    .map((a) => {
      const count = byLabel.get(a.label) ?? 0
      const share = validTotal ? count / validTotal : 0
      return { label: a.label, points: a.points, count, share, suggested: enough && count > 0 ? suggestTier(share) : null }
    })
    .sort((a, b) => b.count - a.count || a.points - b.points)
  const c = counters(id)
  return {
    id: q.id,
    prompt: q.prompt,
    category: q.category,
    asked: c.asked,
    answered: c.answered,
    validTotal,
    unknownTotal: unknown.filter((u) => !u.ignored).reduce((n, u) => n + u.count, 0),
    answers,
    unknown,
  }
}

export interface OverviewRow {
  id: string
  prompt: string
  category: string
  status: string
  asked: number
  answered: number
  validTotal: number
  unknownTotal: number
  topUnknown: { text: string; count: number }[]
  mismatches: number // valid answers whose current tier differs from the one the data suggests
}

/** Every question that has been played, most missing answers first. */
export function overview(): OverviewRow[] {
  const played = new Set<string>([
    ...handle().prepare('SELECT DISTINCT question_id FROM answer_log').all().map((r) => r.question_id as string),
    ...handle().prepare('SELECT question_id FROM question_stats').all().map((r) => r.question_id as string),
  ])
  const rows: OverviewRow[] = []
  for (const q of listQuestions()) {
    if (!played.has(q.id)) continue
    const d = detail(q.id)!
    rows.push({
      id: q.id,
      prompt: q.prompt,
      category: q.category,
      status: q.status,
      asked: d.asked,
      answered: d.answered,
      validTotal: d.validTotal,
      unknownTotal: d.unknownTotal,
      topUnknown: d.unknown.filter((u) => !u.ignored).slice(0, 3).map((u) => ({ text: u.text, count: u.count })),
      mismatches: d.answers.filter((a) => a.suggested !== null && a.suggested !== a.points).length,
    })
  }
  return rows.sort((a, b) => b.unknownTotal - a.unknownTotal || b.asked - a.asked)
}

export function setIgnored(id: string, key: string, ignored: boolean): void {
  handle().prepare('UPDATE answer_log SET ignored = ? WHERE question_id = ? AND key = ?').run(ignored ? 1 : 0, id, key)
}

/** Adds something players typed as a new answer (or as another way to write an existing one). */
export function addFromLog(id: string, text: string, opts: { points?: number; label?: string; alias?: boolean }): SaveResult {
  const q = getQuestion(id)
  if (!q) throw new InputError('No existe esa pregunta.')
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (!clean) throw new InputError('Falta el texto.')
  const answers = q.answers.map((a) => ({ label: a.label, aliases: [...a.aliases], points: a.points }))
  if (opts.alias) {
    const target = answers.find((a) => a.label === opts.label)
    if (!target) throw new InputError('No existe esa respuesta para agregarle el alias.')
    target.aliases.push(clean)
  } else {
    answers.push({ label: String(opts.label ?? clean).trim() || clean, aliases: opts.label && opts.label !== clean ? [clean] : [], points: Number(opts.points) })
  }
  // saveQuestion quietly turns a question that no longer passes the checks into a draft. For a question that is
  // live that would pull it out of the games without anyone noticing, so refuse the change instead.
  if (q.status === 'published') {
    const problems = validateQuestion({ id: q.id, category: q.category, prompt: q.prompt, answers })
    if (problems.length > 0) throw new InputError(`No se agregó, porque la pregunta dejaría de poder jugarse: ${problems.join(' ')}`)
  }
  return saveQuestion({ ...q, answers })
}

export function resetStats(id?: string): void {
  if (id) {
    handle().prepare('DELETE FROM answer_log WHERE question_id = ?').run(id)
    handle().prepare('DELETE FROM question_stats WHERE question_id = ?').run(id)
  } else {
    handle().exec('DELETE FROM answer_log; DELETE FROM question_stats;')
  }
}
