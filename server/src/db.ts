import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { SUGGESTION_LIMITS, TIERS, type CategoryInfo, type SuggestionPayload } from '../../shared/protocol'
import { validateQuestion, type AnswerDef, type Question } from './matching'
import { SAMPLE_QUESTIONS } from './questions'

export type Status = 'draft' | 'published' | 'archived'
export type Source = 'sample' | 'owner' | 'suggestion'

export interface QuestionRecord extends Question {
  status: Status
  source: Source
  notes: string
  hint: string // one short line shown under the question; never names a listed answer
  createdAt: number
  updatedAt: number
}

/** What the admin tool sends when saving a question. */
export interface QuestionInput {
  id?: string
  category: string
  prompt: string
  status?: Status
  source?: Source
  notes?: string
  hint?: string
  answers: { label: string; aliases?: string[]; points: number }[]
}

export interface SuggestionRecord extends SuggestionPayload {
  id: number
  status: 'new' | 'accepted' | 'rejected'
  createdAt: number
  questionId: string | null
}

/** A structurally invalid request (400), as opposed to a question that is merely incomplete. */
export class InputError extends Error {}

const here = dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = join(here, '../data')

let db: DatabaseSync

const SCHEMA = `
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  source TEXT NOT NULL DEFAULT 'owner',
  notes TEXT NOT NULL DEFAULT '',
  answers TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS questions_status ON questions (status, category);
CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  answers TEXT NOT NULL DEFAULT '',
  nick TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL,
  question_id TEXT
);
-- Everything players type, per question (no player information), to find missing answers and calibrate tiers.
CREATE TABLE IF NOT EXISTS answer_log (
  question_id TEXT NOT NULL,
  key TEXT NOT NULL,
  text TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  first_at INTEGER NOT NULL,
  last_at INTEGER NOT NULL,
  ignored INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (question_id, key)
);
CREATE TABLE IF NOT EXISTS question_stats (
  question_id TEXT PRIMARY KEY,
  asked INTEGER NOT NULL DEFAULT 0,
  answered INTEGER NOT NULL DEFAULT 0
);
`

/** The open database, for the stats module. */
export const handle = () => db

/** Opens the database (a file under server/data by default; ':memory:' for tests) and seeds samples if empty. */
export function init(path = process.env.DB_PATH ?? join(DATA_DIR, 'lion-eagle.db')) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  db = new DatabaseSync(path)
  // WAL lets a second process (the import script) write while the server is running; the timeout makes
  // a briefly locked database wait instead of failing with "database is locked".
  db.exec('PRAGMA busy_timeout = 5000')
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL')
  db.exec(SCHEMA)
  try {
    db.exec("ALTER TABLE questions ADD COLUMN hint TEXT NOT NULL DEFAULT ''") // databases made before hints existed
  } catch {
    /* the column is already there */
  }
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM questions').get() as { n: number }
  if (n === 0) {
    for (const q of SAMPLE_QUESTIONS) {
      saveQuestion({ ...q, status: 'published', source: 'sample', notes: 'Pregunta de muestra: los niveles son una primera estimación sin revisar.' })
    }
  }
}

function toRecord(row: Record<string, unknown>): QuestionRecord {
  return {
    id: row.id as string,
    category: row.category as string,
    prompt: row.prompt as string,
    status: row.status as Status,
    source: row.source as Source,
    notes: row.notes as string,
    hint: (row.hint as string | null) ?? '',
    answers: JSON.parse(row.answers as string) as AnswerDef[],
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }
}

/**
 * The canonical form of a question id: lower case, no accents, words joined by hyphens. Every lookup goes
 * through it, so "Mi Pregunta" and "mi-pregunta" are the same question. It never cuts the id short
 * (ids with a "-2" suffix may be longer than a freshly made slug).
 */
export const canonicalId = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** A new id made from a question's text: canonical and at most 40 characters. */
const slug = (s: string) => canonicalId(s).slice(0, 40).replace(/-+$/g, '') || 'pregunta'

function freeId(base: string): string {
  let id = base
  for (let i = 2; db.prepare('SELECT 1 FROM questions WHERE id = ?').get(id); i++) id = `${base}-${i}`
  return id
}

/** Cleans and checks the shape of a question; throws InputError with a Spanish message. */
const STATUSES: readonly string[] = ['draft', 'published', 'archived']
const SOURCES: readonly string[] = ['sample', 'owner', 'suggestion']

function normalise(input: QuestionInput): QuestionInput & { answers: AnswerDef[] } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new InputError('Cada pregunta debe ser un objeto con categoría, pregunta y respuestas.')
  const category = String(input.category ?? '').replace(/\s+/g, ' ').trim()
  const prompt = String(input.prompt ?? '').replace(/\s+/g, ' ').trim()
  if (!category || category.length > SUGGESTION_LIMITS.category) throw new InputError('La categoría es obligatoria (máximo 40 letras).')
  if (prompt.length < 5 || prompt.length > 240) throw new InputError('La pregunta debe tener entre 5 y 240 letras.')
  if (input.status !== undefined && !STATUSES.includes(input.status)) throw new InputError('Estado inválido.')
  if (input.source !== undefined && !SOURCES.includes(input.source)) throw new InputError('Origen inválido.')
  if (!Array.isArray(input.answers)) throw new InputError('Faltan las respuestas.')
  if (input.answers.length > 400) throw new InputError('Demasiadas respuestas (máximo 400).')
  const answers: AnswerDef[] = input.answers.map((a) => {
    if (typeof a !== 'object' || a === null) throw new InputError('Cada respuesta debe tener un texto y un nivel.')
    const label = String(a.label ?? '').replace(/\s+/g, ' ').trim()
    const points = Number(a.points)
    if (label.length > 60) throw new InputError(`La respuesta "${label.slice(0, 20)}…" es demasiado larga.`)
    if (!(TIERS as readonly number[]).includes(points)) throw new InputError(`"${label}": el nivel debe ser 10, 30, 60, 80 o 100.`)
    if (a.aliases !== undefined && !Array.isArray(a.aliases)) throw new InputError(`"${label}": los alias deben ser una lista.`)
    const aliases = (a.aliases ?? []).map((x) => String(x).replace(/\s+/g, ' ').trim()).filter(Boolean)
    if (aliases.length > 30 || aliases.some((x) => x.length > 60)) throw new InputError(`"${label}": demasiados alias o alias muy largos.`)
    return { label, aliases, points }
  }).filter((a) => a.label)
  return { ...input, category, prompt, answers }
}

export interface SaveResult {
  question: QuestionRecord
  problems: string[] // why it can't be published yet (empty = ready)
  demoted: boolean // asked to publish but it isn't ready, so it was saved as a draft
}

/** Creates or replaces a question. A question that fails the quality checks can only be a draft. */
export function saveQuestion(input: QuestionInput): SaveResult {
  const q = normalise(input)
  const wanted = q.id ? canonicalId(q.id) || undefined : undefined
  const existing = wanted ? getQuestion(wanted) : null
  const id = existing ? existing.id : freeId(wanted ?? slug(q.prompt))
  const problems = validateQuestion({ id, category: q.category, prompt: q.prompt, answers: q.answers })
  const asked = q.status ?? existing?.status ?? 'draft'
  const demoted = asked === 'published' && problems.length > 0
  const status: Status = demoted ? 'draft' : asked
  const now = Date.now()
  db.prepare(
    `INSERT INTO questions (id, category, prompt, status, source, notes, hint, answers, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET category=excluded.category, prompt=excluded.prompt, status=excluded.status,
       source=excluded.source, notes=excluded.notes, hint=excluded.hint, answers=excluded.answers, updated_at=excluded.updated_at`,
  ).run(id, q.category, q.prompt, status, q.source ?? existing?.source ?? 'owner', q.notes ?? existing?.notes ?? '', String(q.hint ?? existing?.hint ?? '').replace(/\s+/g, ' ').trim().slice(0, 160), JSON.stringify(q.answers), existing?.createdAt ?? now, now)
  return { question: getQuestion(id)!, problems, demoted }
}

/** Sets the hint of an existing question without touching anything else. */
export function setHint(id: string, hint: string): boolean {
  const res = db.prepare('UPDATE questions SET hint = ? WHERE id = ?').run(String(hint).replace(/\s+/g, ' ').trim().slice(0, 160), canonicalId(String(id)))
  return Number(res.changes) > 0
}

export function getQuestion(id: string): QuestionRecord | null {
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(canonicalId(String(id)))
  return row ? toRecord(row) : null
}

export function listQuestions(f: { category?: string; status?: string; search?: string } = {}): QuestionRecord[] {
  const where: string[] = []
  const args: string[] = []
  if (f.category) { where.push('category = ?'); args.push(f.category) }
  if (f.status) { where.push('status = ?'); args.push(f.status) }
  if (f.search) { where.push('(prompt LIKE ? OR id LIKE ?)'); args.push(`%${f.search}%`, `%${f.search}%`) }
  const sql = `SELECT * FROM questions ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY category, prompt`
  return db.prepare(sql).all(...args).map(toRecord)
}

export function deleteQuestion(id: string): boolean {
  const key = canonicalId(String(id))
  const deleted = Number(db.prepare('DELETE FROM questions WHERE id = ?').run(key).changes) > 0
  // The id can be reused by a new question with the same text: it must not inherit the old one's play data.
  db.prepare('DELETE FROM answer_log WHERE question_id = ?').run(key)
  db.prepare('DELETE FROM question_stats WHERE question_id = ?').run(key)
  return deleted
}

export function setStatus(id: string, status: Status): SaveResult {
  const q = getQuestion(id)
  if (!q) throw new InputError('No existe esa pregunta.')
  return saveQuestion({ ...q, status })
}

/** Categories with at least one published question, with their counts. */
export function categories(): CategoryInfo[] {
  return db
    .prepare("SELECT category AS name, COUNT(*) AS count FROM questions WHERE status = 'published' GROUP BY category ORDER BY category")
    .all()
    .map((r) => ({ name: r.name as string, count: Number(r.count) }))
}

/** Every category that has any question, whatever its status (for the admin's filters and editor). */
export function allCategories(): string[] {
  return db.prepare('SELECT DISTINCT category FROM questions ORDER BY category').all().map((r) => r.category as string)
}

/** Published questions in the given categories (all published when `names` is null). */
export function playable(names: string[] | null): Question[] {
  return listQuestions({ status: 'published' })
    .filter((q) => !names || names.includes(q.category))
    // Checked again because the matching rules may have changed since the question was published.
    .filter((q) => validateQuestion(q).length === 0)
    .map(({ id, category, prompt, answers, hint }) => ({ id, category, prompt, answers, hint }))
}

/** Publishes every draft that passes the quality checks. Returns how many were published and how many are still incomplete. */
export function publishReady(): { published: number; waiting: number } {
  let published = 0
  let waiting = 0
  for (const q of listQuestions({ status: 'draft' })) {
    if (q.answers.length === 0) continue // empty suggestion drafts are not "waiting", they are not written yet
    if (saveQuestion({ ...q, status: 'published' }).demoted) waiting++
    else published++
  }
  return { published, waiting }
}

export function archiveSamples(): number {
  return Number(db.prepare("UPDATE questions SET status = 'archived', updated_at = ? WHERE source = 'sample' AND status != 'archived'").run(Date.now()).changes)
}

export interface ImportReport {
  created: number
  updated: number
  drafts: { id: string; problems: string[] }[] // saved as drafts because they are incomplete
  errors: { index: number; error: string }[]
}

/**
 * Upserts a list of questions (used by the admin import and the import script). It is one transaction:
 * either everything valid is saved or, if something unexpected happens, nothing is. A bad item is
 * reported in `errors` and does not stop the others.
 */
export function importQuestions(list: QuestionInput[], publish: boolean): ImportReport {
  const report: ImportReport = { created: 0, updated: 0, drafts: [], errors: [] }
  db.exec('BEGIN')
  try {
    list.forEach((input, index) => {
      try {
        if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new InputError('Cada pregunta debe ser un objeto con categoría, pregunta y respuestas.')
        const id = input.id ? canonicalId(String(input.id)) : null
        const existed = id !== null && getQuestion(id) !== null
        const res = saveQuestion({ source: 'owner', ...input, status: publish ? (input.status ?? 'published') : 'draft' })
        if (existed) report.updated++
        else report.created++
        if (res.problems.length) report.drafts.push({ id: res.question.id, problems: res.problems })
      } catch (e) {
        if (!(e instanceof InputError)) throw e
        report.errors.push({ index, error: e.message })
      }
    })
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
  return report
}

// ---- suggestions ----

export function addSuggestion(s: SuggestionPayload): void {
  const clip = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
  const prompt = clip(s.prompt, SUGGESTION_LIMITS.prompt)
  if (prompt.length < 5) throw new InputError('Escribe la pregunta (mínimo 5 letras).')
  db.prepare('INSERT INTO suggestions (prompt, category, answers, nick, created_at) VALUES (?, ?, ?, ?, ?)').run(
    prompt, clip(s.category, SUGGESTION_LIMITS.category), clip(s.answers, SUGGESTION_LIMITS.answers), clip(s.nick, SUGGESTION_LIMITS.nick), Date.now(),
  )
}

const toSuggestion = (r: Record<string, unknown>): SuggestionRecord => ({
  id: Number(r.id), prompt: r.prompt as string, category: r.category as string, answers: r.answers as string, nick: r.nick as string,
  status: r.status as SuggestionRecord['status'], createdAt: r.created_at as number, questionId: (r.question_id as string | null) ?? null,
})

export function listSuggestions(status?: string): SuggestionRecord[] {
  const rows = status
    ? db.prepare('SELECT * FROM suggestions WHERE status = ? ORDER BY id DESC').all(status)
    : db.prepare('SELECT * FROM suggestions ORDER BY id DESC').all()
  return rows.map(toSuggestion)
}

/** Turns a suggestion into a draft question (answers still to be researched) and marks it accepted. */
export function acceptSuggestion(id: number): QuestionRecord {
  const row = db.prepare('SELECT * FROM suggestions WHERE id = ?').get(id)
  if (!row) throw new InputError('No existe esa sugerencia.')
  const s = toSuggestion(row)
  if (s.status !== 'new') throw new InputError('Esa sugerencia ya fue procesada.')
  const { question } = saveQuestion({
    category: s.category || 'Sin categoría',
    prompt: s.prompt,
    status: 'draft',
    source: 'suggestion',
    notes: `Sugerida por ${s.nick || 'un jugador'}.${s.answers ? ` Ejemplos de respuestas: ${s.answers}` : ''}`,
    answers: [],
  })
  db.prepare("UPDATE suggestions SET status = 'accepted', question_id = ? WHERE id = ?").run(question.id, id)
  return question
}

export function rejectSuggestion(id: number): void {
  // Only new suggestions can be rejected: an accepted one already became a question.
  const changed = db.prepare("UPDATE suggestions SET status = 'rejected' WHERE id = ? AND status = 'new'").run(id).changes
  if (Number(changed) === 0) throw new InputError('Esa sugerencia no existe o ya fue procesada.')
}

export function counts() {
  const q = db.prepare('SELECT status, COUNT(*) AS n FROM questions GROUP BY status').all()
  const s = db.prepare("SELECT COUNT(*) AS n FROM suggestions WHERE status = 'new'").get() as { n: number }
  return { questions: Object.fromEntries(q.map((r) => [r.status as string, Number(r.n)])), newSuggestions: Number(s.n) }
}
