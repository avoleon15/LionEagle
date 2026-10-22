import { randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import express, { type NextFunction, type Request, type Response } from 'express'
import * as backup from './backup'
import * as db from './db'
import * as metrics from './metrics'
import * as stats from './stats'
import { buildIndex, keys, match, validateQuestion } from './matching'
import { RateLimiter } from './ratelimit'

export type TokenSource = 'env' | 'file' | 'generated'

/** The admin token: ADMIN_TOKEN if set, otherwise one generated on first run and kept in server/data. */
export function adminToken(): { token: string; source: TokenSource } {
  if (process.env.ADMIN_TOKEN) return { token: process.env.ADMIN_TOKEN, source: 'env' }
  const file = join(db.DATA_DIR, 'admin-token.txt')
  if (existsSync(file)) return { token: readFileSync(file, 'utf8').trim(), source: 'file' }
  mkdirSync(db.DATA_DIR, { recursive: true })
  const token = randomBytes(18).toString('base64url')
  writeFileSync(file, token + '\n', { mode: 0o600 })
  return { token, source: 'generated' }
}

/** Shortest admin token that is not worth warning about (the generated one has 24). */
export const MIN_TOKEN_LENGTH = 24

/** A warning for the log when the token is short enough to be guessed, otherwise null. */
export function weakTokenWarning(token: string): string | null {
  if (token.length >= MIN_TOKEN_LENGTH) return null
  return `AVISO: el token de admin tiene solo ${token.length} caracteres. Usa uno de ${MIN_TOKEN_LENGTH} o más (por ejemplo, el que da: openssl rand -base64 24).`
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** Wrong tokens allowed per address before it is locked out for a while. */
const MAX_BAD_TOKENS = 10
const LOCKOUT_MS = 15 * 60_000

export function adminRouter(token: string): express.Router {
  const r = express.Router()
  const failures = new RateLimiter(MAX_BAD_TOKENS, LOCKOUT_MS)

  // Authentication comes first, so nobody can make the server read and parse a big body without the token.
  r.use((req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? ''
    if (failures.blocked(ip)) {
      res.status(429).json({ error: 'Demasiados intentos con un token incorrecto. Espera unos minutos.' })
      return
    }
    const given = String(req.header('x-admin-token') ?? '')
    if (!given || !same(given, token)) {
      failures.record(ip)
      res.status(401).json({ error: 'Token incorrecto.' })
      return
    }
    next()
  })
  r.use(express.json({ limit: '2mb' }))

  const wrap = (fn: (req: Request, res: Response) => unknown) => (req: Request, res: Response) => {
    try {
      res.json(fn(req, res))
    } catch (e) {
      if (e instanceof db.InputError) res.status(400).json({ error: e.message })
      else {
        console.error(e)
        res.status(500).json({ error: 'Error inesperado.' })
      }
    }
  }

  // `ip` and `hops` let the owner check that the server sees real visitor addresses behind the host's proxy (see the admin footer).
  r.get('/ping', wrap((req) => ({ ok: true, ip: req.ip ?? '', hops: String(req.headers['x-forwarded-for'] ?? '').split(',').filter((x) => x.trim()).length, ...db.counts() })))

  // Quality checks (building the answer index of every question) are the expensive part of the list, so
  // their result is remembered until the question changes.
  const problemsCache = new Map<string, { updatedAt: number; problems: string[] }>()
  const problemsOf = (q: db.QuestionRecord) => {
    const hit = problemsCache.get(q.id)
    if (hit && hit.updatedAt === q.updatedAt) return hit.problems
    const problems = validateQuestion(q)
    problemsCache.set(q.id, { updatedAt: q.updatedAt, problems })
    return problems
  }

  /** The list only carries what it shows; a question's answers are loaded when it is opened. */
  r.get('/questions', wrap((req) => ({
    ...db.counts(),
    questions: db.listQuestions({
      category: String(req.query.category ?? '') || undefined,
      status: String(req.query.status ?? '') || undefined,
      search: String(req.query.q ?? '') || undefined,
    }).map((q) => ({
      id: q.id, category: q.category, prompt: q.prompt, status: q.status, source: q.source,
      answerCount: q.answers.length, updatedAt: q.updatedAt, problems: problemsOf(q),
    })),
  })))

  r.get('/categories', wrap(() => ({ categories: db.allCategories() })))

  r.get('/questions/:id', wrap((req) => {
    const q = db.getQuestion(String(req.params.id))
    if (!q) throw new db.InputError('No existe esa pregunta.')
    return { question: q, problems: validateQuestion(q) }
  }))

  r.post('/questions', wrap((req) => db.saveQuestion({ ...req.body, id: undefined })))
  r.put('/questions/:id', wrap((req) => {
    if (!db.getQuestion(String(req.params.id))) throw new db.InputError('No existe esa pregunta.')
    return db.saveQuestion({ ...req.body, id: String(req.params.id) })
  }))
  r.delete('/questions/:id', wrap((req) => {
    backup.snapshot('borrar')
    return { deleted: db.deleteQuestion(String(req.params.id)) }
  }))
  r.post('/questions/:id/status', wrap((req) => {
    const status = String(req.body?.status)
    if (!['draft', 'published', 'archived'].includes(status)) throw new db.InputError('Estado inválido.')
    return db.setStatus(String(req.params.id), status as db.Status)
  }))

  /** Try an answer against a question exactly as the game would (the question may be unsaved). */
  r.post('/test-match', wrap((req) => {
    const q = req.body?.question
    const answers = (q?.answers ?? []).map((a: { label: string; aliases?: string[]; points: number }) => ({ label: String(a.label), aliases: a.aliases ?? [], points: Number(a.points) }))
    let index
    try {
      index = buildIndex({ id: 'x', category: '', prompt: '', answers })
    } catch (e) {
      throw new db.InputError((e as Error).message)
    }
    const text = String(req.body?.text ?? '')
    return { hit: match(index, text), keys: keys(text) }
  }))

  r.post('/import', wrap((req) => {
    const list = Array.isArray(req.body) ? req.body : req.body?.questions
    if (!Array.isArray(list)) throw new db.InputError('Se esperaba una lista de preguntas.')
    backup.snapshot('importar')
    return db.importQuestions(list, req.body?.publish !== false)
  }))
  r.get('/export', wrap(() => ({ questions: db.exportQuestions() })))
  // Automatic copies of the questions (see backup.ts)
  r.get('/backups', wrap(() => ({ backups: backup.listBackups() })))
  r.get('/backups/:name', wrap((req) => backup.readBackup(String(req.params.name))))
  r.post('/backups/:name/restore', wrap((req) => backup.restore(String(req.params.name))))
  r.post('/publish-ready', wrap(() => db.publishReady()))
  r.post('/archive-samples', wrap(() => ({ archived: db.archiveSamples() })))

  r.get('/metrics', wrap(() => metrics.overview()))
  r.get('/stats', wrap(() => ({ overview: stats.overview(), minForSuggestions: stats.MIN_FOR_SUGGESTIONS })))
  r.get('/stats/:id', wrap((req) => {
    const d = stats.detail(String(req.params.id))
    if (!d) throw new db.InputError('No existe esa pregunta.')
    return { ...d, minForSuggestions: stats.MIN_FOR_SUGGESTIONS }
  }))
  r.post('/stats/:id/ignore', wrap((req) => {
    stats.setIgnored(String(req.params.id), String(req.body?.key ?? ''), req.body?.ignored !== false)
    return { ok: true }
  }))
  r.post('/stats/:id/add', wrap((req) =>
    stats.addFromLog(String(req.params.id), String(req.body?.text ?? ''), {
      points: req.body?.points, label: req.body?.label, aliases: req.body?.aliases, alias: req.body?.alias === true, includeTyped: req.body?.includeTyped !== false,
    }),
  ))
  r.delete('/stats/:id', wrap((req) => {
    stats.resetStats(String(req.params.id))
    return { ok: true }
  }))
  r.delete('/stats', wrap(() => {
    stats.resetStats()
    return { ok: true }
  }))

  r.get('/suggestions', wrap((req) => ({ suggestions: db.listSuggestions(String(req.query.status ?? '') || undefined) })))
  r.post('/suggestions/:id/accept', wrap((req) => ({ question: db.acceptSuggestion(Number(req.params.id)) })))
  r.post('/suggestions/:id/reject', wrap((req) => {
    db.rejectSuggestion(Number(req.params.id))
    return { ok: true }
  }))

  return r
}
