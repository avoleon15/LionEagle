import { closeSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as db from './db'

// Automatic copies of the questions, in the same JSON the admin's "Importar" reads. They are taken before anything
// that can lose work (deleting a question, importing a list, restoring a copy) and once a day, and live in a folder
// next to the database, so they survive deploys like it does. Restoring a copy puts its questions back (what was
// deleted comes back, what was edited returns to that version); the answers players typed are not part of it.

/** Copies kept for each reason, the newest ones. */
const KEEP = 10
/** A second copy for the same reason within this time is skipped: the first one already covers a batch of changes. */
const MIN_GAP_MS = 60_000
const NAME = /^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})-([a-z-]+)\.json$/

export interface BackupInfo { name: string; createdAt: number; reason: string; size: number; questions: number }

/** How many questions a copy holds, read from its first bytes (the file starts with the count) without loading the whole file. */
function peekCount(file: string): number {
  const fd = openSync(file, 'r')
  try {
    const buf = Buffer.alloc(200)
    const n = readSync(fd, buf, 0, 200, 0)
    return Number(/"count":(\d+)/.exec(buf.toString('utf8', 0, n))?.[1] ?? 0)
  } finally {
    closeSync(fd)
  }
}

const stamp = (d: Date) => d.toISOString().slice(0, 19).replace(/:/g, '-')
const parseStamp = (s: string) => Date.parse(s.replace(/T(\d{2})-(\d{2})-(\d{2})/, 'T$1:$2:$3') + 'Z')

/** Newest first. */
export function listBackups(dir = db.backupDir()): BackupInfo[] {
  if (!dir) return []
  try {
    return readdirSync(dir)
      .map((name) => ({ name, m: NAME.exec(name) }))
      .filter((x): x is { name: string; m: RegExpExecArray } => x.m !== null)
      .map(({ name, m }) => ({ name, createdAt: parseStamp(m[1]), reason: m[2], size: statSync(join(dir, name)).size, questions: peekCount(join(dir, name)) }))
      .sort((a, b) => b.createdAt - a.createdAt || (a.name < b.name ? 1 : -1))
  } catch {
    return [] // the folder does not exist yet
  }
}

/** Takes a copy of every question. Never throws: a backup problem must not stop the change that asked for it. */
export function snapshot(reason: string, dir = db.backupDir(), now = new Date()): string | null {
  if (!dir) return null
  try {
    const why = reason.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-+|-+$/g, '') || 'copia'
    const same = listBackups(dir).filter((b) => b.reason === why)
    if (same[0] && now.getTime() - same[0].createdAt < MIN_GAP_MS) return null
    mkdirSync(dir, { recursive: true })
    const name = `${stamp(now)}-${why}.json`
    const questions = db.exportQuestions()
    writeFileSync(join(dir, name), JSON.stringify({ count: questions.length, createdAt: now.toISOString(), reason: why, questions }))
    for (const old of same.slice(KEEP - 1)) unlinkSync(join(dir, old.name))
    return name
  } catch (e) {
    console.error('backup:', e instanceof Error ? e.message : e)
    return null
  }
}

/** The questions of a copy, or throws db.InputError when the name is not one of ours. */
export function readBackup(name: string, dir = db.backupDir()): { createdAt: string; reason: string; questions: db.QuestionInput[] } {
  if (!dir || !NAME.test(name)) throw new db.InputError('Esa copia no existe.')
  let data: { createdAt?: string; reason?: string; questions?: unknown }
  try {
    data = JSON.parse(readFileSync(join(dir, name), 'utf8'))
  } catch {
    throw new db.InputError('No se pudo leer esa copia.')
  }
  if (!Array.isArray(data.questions)) throw new db.InputError('Esa copia no tiene preguntas.')
  return { createdAt: String(data.createdAt ?? ''), reason: String(data.reason ?? ''), questions: data.questions as db.QuestionInput[] }
}

/** Puts the questions of a copy back (after taking a copy of how things are now). */
export function restore(name: string, dir = db.backupDir()): db.ImportReport {
  const b = readBackup(name, dir)
  snapshot('antes-de-restaurar', dir)
  return db.importQuestions(b.questions, true)
}

/** One copy a day (and one at start-up when the last one is older than that). */
export function startDailyBackups(): void {
  const DAY = 24 * 3_600_000
  const last = listBackups().find((b) => b.reason === 'diaria')
  if (!last || Date.now() - last.createdAt > DAY - 3_600_000) snapshot('diaria')
  setInterval(() => snapshot('diaria'), DAY).unref()
}
