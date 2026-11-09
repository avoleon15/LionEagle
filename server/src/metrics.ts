import { createHash } from 'node:crypto'
import { handle } from './db'

// How much the game is played: games started and finished, how many players took part and how many different
// browsers they came from, and which questions come up most. No address (IP) is ever stored: a browser is
// told apart by the hash of a random id it made up and keeps in its own storage, and its region is only the time
// zone it reports (e.g. America/Guatemala). Nicknames are kept ONLY in game_summary (what each player answered
// in the last 100 games, for the admin), which is pruned to the 100 newest games every time a game starts.

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
export function gameStarted(players: number, devices: (string | null)[], now = Date.now(), zones: (string | null)[] = []): number {
  return safe(() => {
    const db = handle()
    // The game's region is the most common time zone among its players.
    const count = new Map<string, number>()
    for (const z of zones) if (z) count.set(z, (count.get(z) ?? 0) + 1)
    const tz = [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    const res = db.prepare('INSERT INTO game_log (started_at, players, tz) VALUES (?, ?, ?)').run(now, players, tz)
    const seen = new Set<string>()
    devices.forEach((d, i) => {
      if (d === null || seen.has(d)) return
      seen.add(d)
      db.prepare('INSERT INTO device_log (device, first_at, last_at, games, tz) VALUES (?, ?, ?, 1, ?) ON CONFLICT(device) DO UPDATE SET last_at = excluded.last_at, games = games + 1, tz = COALESCE(excluded.tz, tz)').run(d, now, now, zones[i] ?? null)
    })
    return Number(res.lastInsertRowid)
  }, 0)
}

/** A time zone a client sent, or undefined when it is not a plausible zone name. */
export function cleanZone(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const z = raw.trim()
  return z.length > 0 && z.length <= 64 && /^[A-Za-z0-9_+\-/]+$/.test(z) ? z : undefined
}

export interface RoundSummary {
  questionId?: string // missing in games saved before the export existed
  category?: string
  prompt: string
  results: { nick: string; answer: string | null; points: number }[]
}

/** What is stored per game: everybody who played (also those who left) and one entry per round played so far. */
export interface GameData {
  players: string[]
  rounds: RoundSummary[]
}

/** How many games keep their detail. */
export const KEEP_GAMES = 100

/** Saves (or replaces) the detail of a game; called when it starts and after every round, so abandoned games are there too. Also drops the detail of older games. */
export function saveSummary(id: number, data: GameData): void {
  if (!id) return
  safe(() => {
    const db = handle()
    db.prepare('INSERT INTO game_summary (game_id, data) VALUES (?, ?) ON CONFLICT(game_id) DO UPDATE SET data = excluded.data').run(id, JSON.stringify(data))
    db.prepare('DELETE FROM game_summary WHERE game_id NOT IN (SELECT game_id FROM game_summary ORDER BY game_id DESC LIMIT ?)').run(KEEP_GAMES)
  }, undefined)
}

export interface GameSummary {
  id: number
  startedAt: number
  finishedAt: number | null
  region: string | null
  rounds: number
  players: { nick: string; score: number; place: number; answers: { prompt: string; answer: string | null; points: number }[] }[]
}

/** The newest games with their players, scores and answers (newest first). */
export function lastGames(limit = KEEP_GAMES): GameSummary[] {
  return safe(() => {
    const rows = handle()
      .prepare('SELECT g.id, g.started_at, g.finished_at, g.tz, s.data FROM game_summary s JOIN game_log g ON g.id = s.game_id ORDER BY g.id DESC LIMIT ?')
      .all(limit) as { id: number; started_at: number; finished_at: number | null; tz: string | null; data: string }[]
    return rows.map((r) => {
      const d = JSON.parse(r.data) as GameData
      const players = d.players.map((nick) => {
        const answers = d.rounds.map((rd) => {
          const x = rd.results.find((y) => y.nick === nick)
          return { prompt: rd.prompt, answer: x?.answer ?? null, points: x?.points ?? 0 }
        })
        return { nick, score: answers.reduce((n, a) => n + a.points, 0), place: 0, answers }
      })
      players.sort((a, b) => b.score - a.score)
      players.forEach((p, i) => (p.place = i > 0 && p.score === players[i - 1].score ? players[i - 1].place : i + 1))
      return { id: Number(r.id), startedAt: Number(r.started_at), finishedAt: r.finished_at === null ? null : Number(r.finished_at), region: r.tz, rounds: d.rounds.length, players }
    })
  }, [])
}

// Spanish names for the time zones people in Latin America, Spain and the US usually play from. Others show the raw zone.
const ZONE_LABELS: Record<string, string> = {
  'America/Guatemala': 'Guatemala',
  'America/El_Salvador': 'El Salvador',
  'America/Tegucigalpa': 'Honduras',
  'America/Managua': 'Nicaragua',
  'America/Costa_Rica': 'Costa Rica',
  'America/Panama': 'Panamá',
  'America/Belize': 'Belice',
  'America/Mexico_City': 'México (centro)',
  'America/Monterrey': 'México (Monterrey)',
  'America/Merida': 'México (Yucatán)',
  'America/Cancun': 'México (Cancún)',
  'America/Tijuana': 'México (Tijuana)',
  'America/Chihuahua': 'México (Chihuahua)',
  'America/Hermosillo': 'México (Sonora)',
  'America/Mazatlan': 'México (Pacífico)',
  'America/Bogota': 'Colombia',
  'America/Lima': 'Perú',
  'America/Guayaquil': 'Ecuador',
  'America/Caracas': 'Venezuela',
  'America/La_Paz': 'Bolivia',
  'America/Santiago': 'Chile',
  'America/Argentina/Buenos_Aires': 'Argentina',
  'America/Buenos_Aires': 'Argentina',
  'America/Montevideo': 'Uruguay',
  'America/Asuncion': 'Paraguay',
  'America/Sao_Paulo': 'Brasil',
  'America/Havana': 'Cuba',
  'America/Santo_Domingo': 'República Dominicana',
  'America/Puerto_Rico': 'Puerto Rico',
  'America/New_York': 'EE. UU. (Este)',
  'America/Chicago': 'EE. UU. (Centro)',
  'America/Denver': 'EE. UU. (Montañas)',
  'America/Phoenix': 'EE. UU. (Arizona)',
  'America/Los_Angeles': 'EE. UU. (Pacífico)',
  'America/Anchorage': 'EE. UU. (Alaska)',
  'Pacific/Honolulu': 'EE. UU. (Hawái)',
  'America/Toronto': 'Canadá (Este)',
  'America/Vancouver': 'Canadá (Pacífico)',
  'Europe/Madrid': 'España',
  'Atlantic/Canary': 'España (Canarias)',
  'Europe/London': 'Reino Unido',
  'Europe/Paris': 'Francia',
  'Europe/Berlin': 'Alemania',
  'Europe/Rome': 'Italia',
  'Europe/Lisbon': 'Portugal',
}

export const zoneLabel = (zone: string): string => (zone === '' ? 'Sin dato' : ZONE_LABELS[zone] ? `${ZONE_LABELS[zone]} (${zone})` : zone)

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
  byHour: { hour: number; games: number }[] // all-time, 0-23 in Guatemala time
  byWeekday: { weekday: number; games: number }[] // all-time, 0 = Sunday, Guatemala time
  regions: { zone: string; label: string; games: number; devices: number }[] // by time zone, most games first
  avgDurationMin: number | null // average minutes of the games that finished
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

  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, games: 0 }))
  const weekdays = Array.from({ length: 7 }, (_, weekday) => ({ weekday, games: 0 }))
  for (const r of db.prepare('SELECT started_at FROM game_log').all() as { started_at: number }[]) {
    const d = new Date(Number(r.started_at) + DAY_OFFSET_MS)
    hours[d.getUTCHours()].games++
    weekdays[d.getUTCDay()].games++
  }
  const zones = new Map<string, { games: number; devices: number }>()
  const zoneOf = (z: string | null) => zones.get(z ?? '') ?? (zones.set(z ?? '', { games: 0, devices: 0 }), zones.get(z ?? '')!)
  for (const r of db.prepare('SELECT tz, COUNT(*) AS n FROM game_log GROUP BY tz').all() as { tz: string | null; n: number }[]) zoneOf(r.tz).games += Number(r.n)
  for (const r of db.prepare('SELECT tz, COUNT(*) AS n FROM device_log GROUP BY tz').all() as { tz: string | null; n: number }[]) zoneOf(r.tz).devices += Number(r.n)
  const dur = db.prepare('SELECT AVG(finished_at - started_at) AS n FROM game_log WHERE finished_at IS NOT NULL').get() as { n: number | null }

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
    byHour: hours,
    byWeekday: weekdays,
    regions: [...zones.entries()].map(([zone, v]) => ({ zone, label: zoneLabel(zone), ...v })).sort((a, b) => b.games - a.games || b.devices - a.devices),
    avgDurationMin: dur.n === null ? null : Math.round((Number(dur.n) / 60_000) * 10) / 10,
  }
}

/** Points of the top tier: a "Rey León" answer. */
const TOP_POINTS = 100

export interface GamesExport {
  generatedAt: string
  note: string
  games: {
    id: number
    startedAt: string
    finishedAt: string | null
    region: string | null
    players: string[]
    rounds: { round: number; questionId: string | null; category: string | null; prompt: string; results: { nick: string; answer: string | null; points: number }[] }[]
  }[]
  /** Per question, over the games in this file: how often it came up and how its answers were scored. */
  questions: {
    questionId: string | null
    prompt: string
    category: string | null
    timesAsked: number
    gamesWithIt: number
    answersGiven: number
    noAnswer: number
    reyLeon: number // answers worth 100 points
    reyLeonShare: number | null // out of the answers given
    avgPoints: number | null // mean points of the answers given
    tiers: Record<string, number>
    answers: { answer: string; points: number; times: number }[]
  }[]
}

/** Everything kept about the newest games, ready to analyse: the raw rounds plus a summary per question. */
export function exportGames(): GamesExport {
  const rows = safe(
    () =>
      handle()
        .prepare('SELECT g.id, g.started_at, g.finished_at, g.tz, s.data FROM game_summary s JOIN game_log g ON g.id = s.game_id ORDER BY g.id DESC LIMIT ?')
        .all(KEEP_GAMES) as { id: number; started_at: number; finished_at: number | null; tz: string | null; data: string }[],
    [],
  )
  const games: GamesExport['games'] = rows.map((r) => {
    const d = JSON.parse(r.data) as GameData
    return {
      id: Number(r.id),
      startedAt: new Date(Number(r.started_at)).toISOString(),
      finishedAt: r.finished_at === null ? null : new Date(Number(r.finished_at)).toISOString(),
      region: r.tz,
      players: d.players,
      rounds: d.rounds.map((rd, i) => ({ round: i + 1, questionId: rd.questionId ?? null, category: rd.category ?? null, prompt: rd.prompt, results: rd.results })),
    }
  })
  type Q = GamesExport['questions'][number]
  const byQuestion = new Map<string, Q & { gameIds: Set<number>; sum: number; byAnswer: Map<string, { answer: string; points: number; times: number }> }>()
  for (const g of games) {
    for (const rd of g.rounds) {
      const key = rd.questionId ?? rd.prompt
      let q = byQuestion.get(key)
      if (!q) {
        q = {
          questionId: rd.questionId, prompt: rd.prompt, category: rd.category, timesAsked: 0, gamesWithIt: 0, answersGiven: 0, noAnswer: 0, reyLeon: 0, reyLeonShare: null, avgPoints: null,
          tiers: {}, answers: [], gameIds: new Set(), sum: 0, byAnswer: new Map(),
        }
        byQuestion.set(key, q)
      }
      q.timesAsked++
      q.gameIds.add(g.id)
      for (const x of rd.results) {
        if (x.answer === null) {
          q.noAnswer++
          continue
        }
        q.answersGiven++
        q.sum += x.points
        if (x.points >= TOP_POINTS) q.reyLeon++
        q.tiers[String(x.points)] = (q.tiers[String(x.points)] ?? 0) + 1
        const a = q.byAnswer.get(x.answer) ?? { answer: x.answer, points: x.points, times: 0 }
        a.times++
        q.byAnswer.set(x.answer, a)
      }
    }
  }
  const questions = [...byQuestion.values()]
    .map(({ gameIds, sum, byAnswer, ...q }) => ({
      ...q,
      gamesWithIt: gameIds.size,
      reyLeonShare: q.answersGiven ? Math.round((q.reyLeon / q.answersGiven) * 1000) / 1000 : null,
      avgPoints: q.answersGiven ? Math.round((sum / q.answersGiven) * 10) / 10 : null,
      answers: [...byAnswer.values()].sort((a, b) => b.times - a.times),
    }))
    .sort((a, b) => b.timesAsked - a.timesAsked || b.reyLeon - a.reyLeon)
  return {
    generatedAt: new Date().toISOString(),
    note: `Últimas ${games.length} partidas (máximo ${KEEP_GAMES}), la más nueva primero. "questions" resume cada pregunta dentro de esas partidas; reyLeon = respuestas de ${TOP_POINTS} puntos.`,
    games,
    questions,
  }
}
