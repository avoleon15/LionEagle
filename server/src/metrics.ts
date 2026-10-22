import { createHash } from 'node:crypto'
import { handle } from './db'

// How much the game is played: games started and finished, how many players took part and how many different
// browsers they came from, and which questions come up most. Nobody's name or address is stored: a browser is
// told apart by the hash of a random id it made up and keeps in its own storage.

/** Guatemala has no daylight saving time: its days are UTC-6. */
const DAY_OFFSET_MS = -6 * 3_600_000
const DAY_MS = 86_400_000

/** Never lets a counting problem break a game. */
function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn()
  } catch (e) {
    console.error('metrics:', e)
    return fallback
  }
}

/** The id a browser sent, as the short hash that is stored (null when it sent nothing usable). */
export function deviceKey(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length < 8 || raw.length > 64) return null
  return createHash('sha256').update('altus:' + raw).digest('hex').slice(0, 16)
}

/** A game started with `players` people; `devices` are the browsers among them. Returns the game's id (0 if it could not be counted). */
export function gameStarted(players: number, devices: (string | null)[], now = Date.now()): number {
  return safe(() => {
    const db = handle()
    const res = db.prepare('INSERT INTO game_log (started_at, players) VALUES (?, ?)').run(now, players)
    for (const d of new Set(devices.filter((x): x is string => x !== null))) {
      db.prepare('INSERT INTO device_log (device, first_at, last_at, games) VALUES (?, ?, ?, 1) ON CONFLICT(device) DO UPDATE SET last_at = excluded.last_at, games = games + 1').run(d, now, now)
    }
    return Number(res.lastInsertRowid)
  }, 0)
}

export function gameFinished(id: number, now = Date.now()): void {
  if (!id) return
  safe(() => void handle().prepare('UPDATE game_log SET finished_at = ? WHERE id = ? AND finished_at IS NULL').run(now, id), undefined)
}

export interface Overview {
  games: number
  finished: number
  seats: number // players counted once per game they played
  avgPlayers: number
  devices: number // different browsers that played
  returning: number // browsers that played more than one game
  newDevices7: number
  games7: number
  today: number
  byDay: { day: string; games: number; seats: number }[] // the last 14 days, oldest first
  topQuestions: { id: string; prompt: string; category: string; asked: number; answered: number }[]
  neverAsked: number
  published: number
  categories: { category: string; asked: number; questions: number }[]
  firstGameAt: number | null
}

const dayOf = (ms: number) => new Date(ms + DAY_OFFSET_MS).toISOString().slice(0, 10)

export function overview(now = Date.now(), days = 14, top = 20): Overview {
  const db = handle()
  const num = (sql: string, ...args: number[]) => Number((db.prepare(sql).get(...args) as { n: number | null } | undefined)?.n ?? 0)
  const games = num('SELECT COUNT(*) AS n FROM game_log')
  const seats = num('SELECT COALESCE(SUM(players), 0) AS n FROM game_log')
  const startOfToday = Math.floor((now + DAY_OFFSET_MS) / DAY_MS) * DAY_MS - DAY_OFFSET_MS
  const since = (d: number) => startOfToday - (d - 1) * DAY_MS

  const per = new Map<string, { games: number; seats: number }>()
  for (const r of db.prepare('SELECT started_at, players FROM game_log WHERE started_at >= ?').all(since(days)) as { started_at: number; players: number }[]) {
    const k = dayOf(Number(r.started_at))
    const cur = per.get(k) ?? { games: 0, seats: 0 }
    cur.games++
    cur.seats += Number(r.players)
    per.set(k, cur)
  }
  const byDay = Array.from({ length: days }, (_, i) => {
    const day = dayOf(since(days) + i * DAY_MS + DAY_MS / 2)
    return { day, games: per.get(day)?.games ?? 0, seats: per.get(day)?.seats ?? 0 }
  })

  const rows = db
    .prepare(
      `SELECT q.id, q.prompt, q.category, COALESCE(s.asked, 0) AS asked, COALESCE(s.answered, 0) AS answered
       FROM questions q LEFT JOIN question_stats s ON s.question_id = q.id WHERE q.status = 'published'`,
    )
    .all() as { id: string; prompt: string; category: string; asked: number; answered: number }[]
  const cat = new Map<string, { asked: number; questions: number }>()
  for (const r of rows) {
    const c = cat.get(r.category) ?? { asked: 0, questions: 0 }
    c.asked += Number(r.asked)
    c.questions++
    cat.set(r.category, c)
  }
  const first = db.prepare('SELECT MIN(started_at) AS n FROM game_log').get() as { n: number | null }

  return {
    games,
    finished: num('SELECT COUNT(*) AS n FROM game_log WHERE finished_at IS NOT NULL'),
    seats,
    avgPlayers: games ? Math.round((seats / games) * 10) / 10 : 0,
    devices: num('SELECT COUNT(*) AS n FROM device_log'),
    returning: num('SELECT COUNT(*) AS n FROM device_log WHERE games > 1'),
    newDevices7: num('SELECT COUNT(*) AS n FROM device_log WHERE first_at >= ?', since(7)),
    games7: num('SELECT COUNT(*) AS n FROM game_log WHERE started_at >= ?', since(7)),
    today: num('SELECT COUNT(*) AS n FROM game_log WHERE started_at >= ?', startOfToday),
    byDay,
    topQuestions: rows
      .filter((r) => Number(r.asked) > 0)
      .map((r) => ({ id: r.id, prompt: r.prompt, category: r.category, asked: Number(r.asked), answered: Number(r.answered) }))
      .sort((a, b) => b.asked - a.asked || b.answered - a.answered)
      .slice(0, top),
    neverAsked: rows.filter((r) => Number(r.asked) === 0).length,
    published: rows.length,
    categories: [...cat.entries()].map(([category, v]) => ({ category, ...v })).sort((a, b) => b.asked - a.asked),
    firstGameAt: first.n === null ? null : Number(first.n),
  }
}
