import * as backup from './backup'
import * as db from './db'
import { validateQuestion } from './matching'
import * as metrics from './metrics'
import * as stats from './stats'

// The calibration panel of the admin: what the data says about the levels of the answers, so the owner can fix them with one click.
// Two sources: the last games kept in detail (which answer each player gave and what it was worth) and the log of everything typed,
// question by question (stats.ts), which suggests a level for every answer once a question has enough answers.

export type IssueKind = 'muchos-rey-leon' | 'nivel-sugerido' | 'nadie-responde' | 'muy-facil'

export interface Issue {
  kind: IssueKind
  questionId: string
  prompt: string
  category: string
  /** The answer whose level could change (missing for issues about the whole question). */
  label?: string
  points?: number
  suggested?: number
  /** A short explanation, in Spanish, of what was seen. */
  detail: string
}

/** Below this many player-answers in the recent games a question is not judged. */
const MIN_SEEN = 6

export function calibration(): { issues: Issue[]; games: number } {
  const exported = metrics.exportGames()
  const all = db.listQuestions()
  const byId = new Map(all.map((q) => [q.id, q]))
  const byPrompt = new Map(all.map((q) => [q.prompt, q]))
  const issues: Issue[] = []

  for (const s of exported.questions) {
    const q = (s.questionId && byId.get(s.questionId)) || byPrompt.get(s.prompt)
    if (!q) continue
    const seen = s.answersGiven + s.noAnswer
    const base = { questionId: q.id, prompt: q.prompt, category: q.category }
    // a 100-point answer that several players gave is not rare: suggest a lower level from how often it came up
    for (const a of s.answers) {
      const def = q.answers.find((x) => x.label === a.answer)
      if (!def || def.points < 100 || a.times < 2) continue
      const share = s.answersGiven ? a.times / s.answersGiven : 0
      // with few games the evidence is thin: the more times it came up, the further down it may go
      const floor = a.times >= 5 ? 10 : a.times >= 4 ? 30 : a.times >= 3 ? 60 : 80
      issues.push({
        ...base, kind: 'muchos-rey-leon', label: def.label, points: def.points, suggested: Math.max(floor, Math.min(80, stats.suggestTier(share))),
        detail: `La dieron ${a.times} veces de ${s.answersGiven} respuestas en las últimas partidas.`,
      })
    }
    if (seen >= MIN_SEEN && s.noAnswer / seen >= 0.5) {
      issues.push({ ...base, kind: 'nadie-responde', detail: `${s.noAnswer} de ${seen} jugadores no respondieron nada válido.` })
    }
    if (s.answersGiven >= 8 && s.avgPoints !== null && s.avgPoints <= 15) {
      issues.push({ ...base, kind: 'muy-facil', detail: `Promedio de ${s.avgPoints} puntos en ${s.answersGiven} respuestas: casi todos dicen lo mismo.` })
    }
  }

  // levels the typed-answers log suggests, for questions with enough answers to say
  for (const row of stats.overview()) {
    if (row.mismatches === 0) continue
    const d = stats.detail(row.id)
    if (!d) continue
    for (const a of d.answers) {
      if (a.suggested === null || a.suggested === a.points) continue
      issues.push({
        kind: 'nivel-sugerido', questionId: d.id, prompt: d.prompt, category: d.category, label: a.label, points: a.points, suggested: a.suggested,
        detail: `La escribió el ${(a.share * 100).toFixed(1)}% de ${d.validTotal} respuestas válidas.`,
      })
    }
  }
  return { issues, games: exported.games.length }
}

/** Changes the level of one answer. Nothing is saved if the question would stop being publishable (it needs a 10 and a 100). */
export function applyLevel(questionId: string, label: string, points: number): db.QuestionRecord {
  const q = db.getQuestion(questionId)
  if (!q) throw new db.InputError('No existe esa pregunta.')
  if (!q.answers.some((a) => a.label === label)) throw new db.InputError(`La respuesta «${label}» ya no está en la pregunta.`)
  const answers = q.answers.map((a) => (a.label === label ? { ...a, points } : a))
  const problems = validateQuestion({ ...q, answers })
  if (problems.length > 0) throw new db.InputError(`No se cambió: ${problems.join(' ')}`)
  backup.snapshot('calibracion')
  return db.saveQuestion({ ...q, answers }).question
}
