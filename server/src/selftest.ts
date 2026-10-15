// Run with: npm run test -w server
// Checks every question's answer list and the matching rules.
import * as db from './db'
import { buildIndex, match, validateQuestion } from './matching'
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { selectQuestions } from './selection'
import * as stats from './stats'
import { Game, GameError } from './game'
import { RateLimiter } from './ratelimit'
import { MAX_ATTEMPTS } from '../../shared/protocol'
import { secondsLeft } from '../../shared/clock'
import { sanitizeJoin, RoomError } from './rooms'
import { SAMPLE_QUESTIONS as QUESTIONS } from './questions'

let failed = 0
const check = (ok: boolean, msg: string) => {
  if (!ok) failed++
  console.log(ok ? 'PASS' : 'FAIL', msg)
}

for (const q of QUESTIONS) {
  const problems = validateQuestion(q)
  check(problems.length === 0, `question ${q.id} valid${problems.length ? ': ' + problems.join('; ') : ''}`)
}
check(new Set(QUESTIONS.map((q) => q.id)).size === QUESTIONS.length, 'question ids are unique')
check(QUESTIONS.length >= 7, 'at least 7 questions')

const get = (id: string) => buildIndex(QUESTIONS.find((q) => q.id === id)!)
const pts = (id: string, text: string) => match(get(id), text)?.points ?? null

const na = 'norteamerica'
check(pts(na, 'usa') === 10, 'alias: usa -> 10')
check(pts(na, '  ESTADOS   unidos ') === 10, 'case/whitespace')
check(pts(na, 'Mexico') === 30, 'accent-free México')
check(pts(na, 'méxico') === 30, 'accented México')
check(pts(na, 'guatemala') === 80, 'Guatemala -> 80')
check(pts(na, 'Barbados') === 100, 'island -> 100')
check(pts(na, 'Paraguay') === null, 'unlisted answer is invalid')
check(pts(na, '') === null, 'empty is invalid')
check(pts(na, '!!!') === null, 'punctuation only is invalid')
check(pts('felinos', 'leones') === 10, 'plural: leones -> León')
check(pts('felinos', 'el tigre') === 10, 'leading article ignored')
check(pts('felinos', 'Tigres') === 10, 'plural: tigres')
check(pts('planetas', 'jupiter') === 10, 'Júpiter without accent')
check(pts('planetas', 'pluton') === 60, 'Plutón without accent')
check(pts('pixar', 'wall-e') === 100 || pts('pixar', 'wall-e') === 30, 'WALL-E hyphen')
check(pts('mario', 'Bowser Jr.') === 60, 'Bowser Jr.')
check(pts('mares', 'mar caribe') === 30 && pts('mares', 'caribe') === 30, 'sea with and without "Mar"')


// ---- database ----
db.init(':memory:')
const cats = db.categories()
check(cats.length === 8, `seeded sample categories (${cats.map((c) => c.name + ':' + c.count).join(', ')})`)
check(db.playable(null).length === QUESTIONS.length, 'all samples are playable')
check(db.playable(['Ciencia']).length === 2, 'playable filters by category')

const good = {
  category: 'Historia',
  prompt: 'Nombra un presidente de Guatemala.',
  answers: [
    { label: 'Jacobo Árbenz', aliases: ['Arbenz'], points: 30 }, { label: 'Álvaro Arzú', aliases: ['Arzu'], points: 30 },
    { label: 'Jorge Ubico', points: 60 }, { label: 'Vinicio Cerezo', points: 60 }, { label: 'Justo Rufino Barrios', points: 80 },
    { label: 'Manuel Estrada Cabrera', points: 100 }, { label: 'Alejandro Giammattei', points: 10 },
  ],
}
const saved = db.saveQuestion({ ...good, status: 'published' })
check(saved.question.status === 'published' && saved.problems.length === 0 && saved.question.id === 'nombra-un-presidente-de-guatemala', 'valid question publishes, id from slug')
check(db.categories().some((c) => c.name === 'Historia' && c.count === 1), 'new category appears')
const dup = db.saveQuestion({ ...good, status: 'draft' })
check(dup.question.id === 'nombra-un-presidente-de-guatemala-2', 'same prompt gets a unique id')

const weak = db.saveQuestion({ category: 'Historia', prompt: 'Pregunta con pocas respuestas', status: 'published', answers: [{ label: 'Uno', points: 10 }, { label: 'Dos', points: 100 }] })
check(weak.demoted && weak.question.status === 'draft' && weak.problems.length > 0, `incomplete question is demoted to draft (${weak.problems[0]})`)
check(db.playable(['Historia']).length === 1, 'drafts are not playable')

const published = db.setStatus(weak.question.id, 'published')
check(published.demoted, 'cannot publish an incomplete question')

const clash = db.saveQuestion({ ...good, prompt: 'Choque de respuestas', status: 'published', answers: [...good.answers, { label: 'Arbenz', points: 10 }] })
check(clash.demoted && clash.problems.some((p) => p.includes('Arbenz')), 'colliding answers are flagged and block publishing')

const thrown = (fn: () => unknown) => { try { fn(); return false } catch (e) { return e instanceof db.InputError } }
check(thrown(() => db.saveQuestion({ category: '', prompt: 'Una pregunta válida', answers: [] })), 'empty category rejected')
check(thrown(() => db.saveQuestion({ category: 'X', prompt: 'ab', answers: [] })), 'too-short prompt rejected')
check(thrown(() => db.saveQuestion({ category: 'X', prompt: 'Una pregunta válida', answers: [{ label: 'a', points: 55 }] })), 'invalid tier rejected')

const update = db.saveQuestion({ ...good, id: saved.question.id, prompt: 'Nombra un presidente de Guatemala (actualizada).', status: 'published' })
check(update.question.id === saved.question.id && update.question.createdAt === saved.question.createdAt, 'update keeps id and creation time')

const rep = db.importQuestions([{ ...good, id: 'import-uno', prompt: 'Importada número uno' }, { category: 'X', prompt: 'ab', answers: [] }, { category: 'Historia', prompt: 'Importada incompleta', answers: [{ label: 'a', points: 10 }] }], true)
check(rep.created === 2 && rep.errors.length === 1 && rep.drafts.length === 1, `import report ${JSON.stringify({ c: rep.created, e: rep.errors.length, d: rep.drafts.length })}`)

db.addSuggestion({ prompt: '  ¿Cuál es el río más largo de Guatemala?  ', category: 'Geografía', answers: 'Motagua, Usumacinta', nick: 'Pepe' })
check(thrown(() => db.addSuggestion({ prompt: 'hi', category: '', answers: '', nick: '' })), 'short suggestion rejected')
const sug = db.listSuggestions('new')
check(sug.length === 1 && sug[0].prompt === '¿Cuál es el río más largo de Guatemala?', 'suggestion stored and trimmed')
const accepted = db.acceptSuggestion(sug[0].id)
check(accepted.status === 'draft' && accepted.source === 'suggestion' && accepted.notes.includes('Pepe') && accepted.notes.includes('Motagua'), 'accepting creates a draft with the notes')
check(db.listSuggestions('new').length === 0 && db.listSuggestions('accepted')[0].questionId === accepted.id, 'suggestion marked accepted')

check(db.archiveSamples() === QUESTIONS.length, 'archive samples')
check(!db.categories().some((c) => c.name === 'Ciencia'), 'archived samples leave the categories')

// ---- selection ----
const mk = (id: string, category: string) => ({ id, category, prompt: id, answers: [] })
const pool = [...'abcdefghij'].map((c, i) => mk(c, ['A', 'B', 'C'][i % 3]))
const pick = selectQuestions(pool, 7, new Set())
check(pick.length === 7 && new Set(pick.map((q) => q.id)).size === 7, 'selects 7 unique questions')
check(new Set(pick.slice(0, 3).map((q) => q.category)).size >= 1 && new Set(pick.map((q) => q.category)).size === 3, 'mixes the categories')
const played = new Set(pool.slice(0, 5).map((q) => q.id))
check(selectQuestions(pool, 5, played).every((q) => !played.has(q.id)), 'skips already played questions')
check(selectQuestions(pool, 7, played).length === 7, 'reuses played ones once fresh ones run out')
check(selectQuestions(pool.filter((q) => q.category === 'A'), 3, new Set()).length === 3, 'works with a single category')

// symbols that change the meaning of a word
const langs = buildIndex({ id: 'langs', category: 'x', prompt: 'x', answers: [
  { label: 'C', aliases: [], points: 10 }, { label: 'C++', aliases: ['Cpp'], points: 30 }, { label: 'C#', aliases: ['Csharp'], points: 60 } ] })
check(match(langs, 'c')?.points === 10 && match(langs, 'C++')?.points === 30 && match(langs, 'c#')?.points === 60, 'C, C++ and C# are different answers')
check(match(langs, 'c plus plus')?.points === 30 && match(langs, 'C Sharp')?.points === 60, 'C plus plus / C sharp spelled out')

// ---- answer logging ----
db.init(':memory:')
const sq = db.saveQuestion({ category: 'Prueba', prompt: 'Nombra un color primario.', status: 'published', answers: [
  { label: 'Rojo', aliases: ['Red'], points: 10 }, { label: 'Azul', points: 10 }, { label: 'Amarillo', points: 30 },
  { label: 'Verde', points: 60 }, { label: 'Naranja', points: 80 }, { label: 'Cian', points: 100 } ] }).question
for (let i = 0; i < 60; i++) stats.logAnswer(sq.id, i % 2 ? 'rojo' : 'ROJO')
for (let i = 0; i < 32; i++) stats.logAnswer(sq.id, 'azul')
for (let i = 0; i < 7; i++) stats.logAnswer(sq.id, 'amarillo')
stats.logAnswer(sq.id, 'cian')
for (let i = 0; i < 5; i++) stats.logAnswer(sq.id, 'Magenta')
stats.logAnswer(sq.id, 'magenta ')
stats.logAnswer(sq.id, '   ')
stats.recordRound(sq.id, 20, 18)
stats.recordRound(sq.id, 20, 17)
let d = stats.detail(sq.id)!
check(d.asked === 40 && d.answered === 35, 'round counters add up')
check(d.validTotal === 60 + 32 + 7 + 1, 'valid attempts counted (case-insensitive, per label)')
check(d.unknown.length === 1 && d.unknown[0].count === 6 && d.unknownTotal === 6, 'unknown answers grouped by normalised text')
check(d.answers[0].label === 'Rojo' && d.answers[0].count === 60, 'answers sorted by how often they were typed')
check(d.answers.find((a) => a.label === 'Rojo')!.suggested === 10 && d.answers.find((a) => a.label === 'Azul')!.suggested === 10, 'common answers suggest tier 10')
check(d.answers.find((a) => a.label === 'Amarillo')!.suggested === 30 && d.answers.find((a) => a.label === 'Cian')!.suggested === 60, 'rarer answers suggest higher tiers')
check(stats.suggestTier(0.5) === 10 && stats.suggestTier(0.05) === 30 && stats.suggestTier(0.02) === 60 && stats.suggestTier(0.005) === 80 && stats.suggestTier(0.001) === 100, 'tier thresholds')
check(stats.overview().length === 1 && stats.overview()[0].topUnknown[0].text === 'Magenta', 'overview lists the question with its top unknown answer')

const added = stats.addFromLog(sq.id, 'Magenta', { points: 100 })
check(!added.demoted && stats.detail(sq.id)!.unknown.length === 0, 'adding a logged answer makes the history count as valid')
stats.logAnswer(sq.id, 'rojito')
const al = stats.addFromLog(sq.id, 'rojito', { alias: true, label: 'Rojo' })
check(!al.demoted && stats.detail(sq.id)!.unknown.length === 0, 'adding an alias to an existing answer')
check(thrown(() => stats.addFromLog(sq.id, 'x', { alias: true, label: 'No existe' })), 'alias for an unknown answer is rejected')
stats.logAnswer(sq.id, 'brillante')
stats.setIgnored(sq.id, 'brillante', true)
check(stats.detail(sq.id)!.unknownTotal === 0 && stats.detail(sq.id)!.unknown[0].ignored, 'ignored answers stop counting as missing')
stats.resetStats(sq.id)
check(stats.detail(sq.id)!.validTotal === 0 && stats.overview().length === 0, 'reset clears one question')

// ---- countdown clock (client) ----
// The state was built when the server's clock read 1_000_000 and arrived when ours read 5_000 (skew = server - local = 995_000).
const endsAt = 1_020_000 // 20 s after the server built the state
check(secondsLeft(endsAt, 1_000_000, 5_000, 5_000) === 20, 'clock: 20 s left right when the state arrives')
check(secondsLeft(endsAt, 1_000_000, 5_000, 8_000) === 17, 'clock: the countdown advances as time passes (it used to freeze)')
check(secondsLeft(endsAt, 1_000_000, 5_000, 5_000 + 20_000) === 0 && secondsLeft(endsAt, 1_000_000, 5_000, 99_000) === 0, 'clock: never below zero')
check(secondsLeft(0, 1_000_000, 5_000, 6_000) === 0, 'clock: no countdown when endsAt is 0')
check(secondsLeft(endsAt, 1_000_000, 123_456, 123_456 + 4_000) === 16, 'clock: independent of how far apart the two clocks are')

// ---- join payloads from untrusted clients ----
const bad = (v: unknown) => { try { sanitizeJoin(v); return false } catch (e) { return e instanceof RoomError } }
check(bad(null) && bad(undefined) && bad(42) && bad('hola') && bad([]), 'join: null, numbers, strings and arrays are rejected cleanly')
const clean = sanitizeJoin({ code: ' abcd ', nick: 'Ana', avatar: { color: 1 }, playerId: 'x', extra: 'ignored' })
check(clean.code === 'ABCD' && clean.nick === 'Ana' && clean.playerId === 'x' && !('extra' in clean), 'join: code is normalised and unknown fields are dropped')
const weird = sanitizeJoin({ nick: { a: 1 }, avatar: 'nope', playerId: [] })
check(weird.code === undefined && weird.nick === '' && weird.playerId === undefined && typeof weird.avatar === 'object', 'join: wrong types become safe defaults')
check(bad({ code: 123, nick: 'x' }) && bad({ code: {}, nick: 'x' }), 'join: a code that is not text is rejected instead of silently creating a room')
check(sanitizeJoin({ nick: 'x'.repeat(5000) }).nick.length === 200, 'join: huge strings are cut')

// ---- rate limiter ----
{
  const rl = new RateLimiter(3, 1000)
  check(rl.allow('a', 0) && rl.allow('a', 10) && rl.allow('a', 20), 'rate limit: the first 3 hits are allowed')
  check(!rl.allow('a', 30) && rl.blocked('a', 30), 'rate limit: the 4th is refused')
  check(rl.allow('b', 30), 'rate limit: other keys are independent')
  check(rl.allow('a', 1500), 'rate limit: allowed again once the window has passed')
  const sweep = new RateLimiter(1, 1000)
  for (let i = 0; i < 1500; i++) sweep.record('ip-' + i, 0)
  sweep.record('late', 5000)
  check(sweep.size < 10, 'rate limit: expired keys are swept, so the map cannot grow forever')
}

// ---- attempts per question ----
{
  check(MAX_ATTEMPTS >= 3 && MAX_ATTEMPTS <= 10, `attempts: the cap exists and is reasonable (${MAX_ATTEMPTS})`)
  db.init(':memory:')
  let changes = 0
  const members = ['a', 'b']
  const game = new Game({ members: () => members, active: () => members, changed: () => changes++ }, QUESTIONS.slice(0, 7).map((x) => ({ ...x })))
  const view = () => game.view()
  const q0 = QUESTIONS.find((x) => x.prompt === view().prompt)!
  let last = game.submit('a', 'respuesta que no existe 0')
  check(last.valid === false && last.attemptsLeft === MAX_ATTEMPTS - 1, 'attempts: a wrong answer reports how many tries are left')
  for (let i = 1; i < MAX_ATTEMPTS; i++) last = game.submit('a', 'respuesta que no existe ' + i)
  check(last.attemptsLeft === 0 && view().exhausted.includes('a'), 'attempts: after the last wrong try the player is marked as out of tries')
  let refused = false
  try { game.submit('a', q0.answers[0].label) } catch (e) { refused = e instanceof GameError }
  check(refused, 'attempts: even a correct answer is refused once the tries are used up')
  check(view().stage === 'answering', 'attempts: the round keeps going while somebody can still answer')
  game.submit('b', q0.answers[0].label)
  check(view().stage === 'reveal', 'attempts: the round ends early when everybody has answered or is out of tries')
  game.dispose()
  const g2 = new Game({ members: () => members, active: () => members, changed: () => {} }, QUESTIONS.slice(0, 7).map((x) => ({ ...x })))
  const q1 = QUESTIONS.find((x) => x.prompt === g2.view().prompt)!
  for (let i = 0; i < MAX_ATTEMPTS - 1; i++) g2.submit('a', 'nada ' + i)
  check(g2.submit('a', q1.answers[0].label).valid === true, 'attempts: a right answer still works after several wrong ones')
  check(!g2.view().exhausted.includes('a'), 'attempts: a player who answered is not "out of tries"')
  g2.dispose()
}

// ---- answer log cap ----
{
  db.init(':memory:')
  const cq = db.saveQuestion({ category: 'Prueba', prompt: 'Nombra algo para el tope del registro', status: 'published', answers: [
    { label: 'Uno', points: 10 }, { label: 'Dos', points: 30 }, { label: 'Tres', points: 60 }, { label: 'Cuatro', points: 80 }, { label: 'Cinco', points: 100 }, { label: 'Seis', points: 10 } ] }).question
  stats.logAnswer(cq.id, 'uno')
  for (let i = 0; i < stats.MAX_LOG_ROWS + 300; i++) stats.logAnswer(cq.id, 'basura única ' + i)
  const dd = stats.detail(cq.id)!
  check(dd.unknown.length + 1 <= stats.MAX_LOG_ROWS, `answer log: at most ${stats.MAX_LOG_ROWS} distinct answers are remembered per question`)
  stats.logAnswer(cq.id, 'uno'); stats.logAnswer(cq.id, 'basura única 0')
  const d2 = stats.detail(cq.id)!
  check(d2.validTotal === 2 && d2.unknown.find((u) => u.text === 'basura única 0')!.count === 2, 'answer log: answers already seen keep counting after the cap is reached')
}

// ---- database integrity ----
{
  db.init(':memory:')
  const body = { category: 'X', prompt: 'Una pregunta para probar', answers: Array.from({ length: 7 }, (_, i) => ({ label: 'R' + i, points: [10, 30, 60, 80, 100, 10, 30][i] })) }
  const r1 = db.importQuestions([{ ...body, id: 'Mi Pregunta' }], true)
  const r2 = db.importQuestions([{ ...body, id: 'Mi Pregunta' }], true)
  const r3 = db.importQuestions([{ ...body, id: 'mi-pregunta' }], true)
  check(r1.created === 1 && r2.updated === 1 && r3.updated === 1 && db.listQuestions({ category: 'X' }).length === 1, 'import: re-importing an id written differently updates the question instead of duplicating it')
  check(db.getQuestion('MI PREGUNTA')?.id === 'mi-pregunta', 'import: ids are looked up in canonical form')

  const long = 'Nombra una pregunta con un texto bastante largo para probar los ids duplicados'
  const ids = [1, 2, 3].map(() => db.saveQuestion({ ...body, prompt: long, category: 'L' }).question.id)
  check(new Set(ids).size === 3 && ids.every((id) => db.getQuestion(id)?.id === id), `ids: duplicates get suffixes and can all be found again (${ids[2]})`)

  const mixed = db.importQuestions([{ ...body, id: 'bien-uno' }, null as never, 'texto' as never, { ...body, id: 'bien-dos' }], true)
  check(mixed.created === 2 && mixed.errors.length === 2 && db.getQuestion('bien-uno') !== null && db.getQuestion('bien-dos') !== null, 'import: items that are not objects are reported and the rest are still imported')

  const boom = { get category(): string { throw new Error('boom') }, prompt: 'x', answers: [] } as unknown as db.QuestionInput
  let threw = false
  try { db.importQuestions([{ ...body, id: 'no-debe-quedar' }, boom], true) } catch { threw = true }
  check(threw && db.getQuestion('no-debe-quedar') === null, 'import: an unexpected failure rolls back everything from that import')

  check(thrown(() => db.saveQuestion({ ...body, status: 'inventado' as never })) && thrown(() => db.saveQuestion({ ...body, source: 'raro' as never })), 'status and source must be known values')
  check(thrown(() => db.saveQuestion({ ...body, answers: [null as never] })) && thrown(() => db.saveQuestion({ ...body, answers: [{ label: 'a', points: 10, aliases: 'x' as never }] })), 'null answers and non-list aliases are rejected as 400s')

  const dq = db.saveQuestion({ ...body, prompt: 'Pregunta que se borrará para probar', status: 'published' }).question
  stats.logAnswer(dq.id, 'algo'); stats.recordRound(dq.id, 5, 4)
  db.deleteQuestion(dq.id)
  const dq2 = db.saveQuestion({ ...body, prompt: 'Pregunta que se borrará para probar', status: 'published' }).question
  const dd = stats.detail(dq2.id)!
  check(dq.id === dq2.id && dd.asked === 0 && dd.unknown.length === 0, 'delete: a new question that reuses the id does not inherit the old one\'s play data')

  db.addSuggestion({ prompt: '¿Una sugerencia que se acepta una vez?', category: 'X', answers: '', nick: 'a' })
  const sid = db.listSuggestions('new')[0].id
  db.acceptSuggestion(sid)
  check(thrown(() => db.acceptSuggestion(sid)), 'suggestions: the same one cannot be accepted twice')
  check(thrown(() => db.rejectSuggestion(sid)), 'suggestions: an accepted one cannot be rejected afterwards')
  check(db.listQuestions({ category: 'X' }).filter((x) => x.source === 'suggestion').length === 1, 'suggestions: only one draft was created')
  check(db.allCategories().includes('L') && db.allCategories().includes('X'), 'categories: the admin list includes every category, drafts too')
}

// ---- content files (content/*.ts) ----
const contentDir = new URL('../../content/', import.meta.url)
const ids = new Set<string>()
const byId = new Map<string, number>()
for (const f of readdirSync(contentDir).filter((n) => n.endsWith('.ts'))) {
  const list = (await import(pathToFileURL(new URL(f, contentDir).pathname).href)).default as { id: string; category: string; prompt: string; answers: { label: string; aliases?: string[]; points: number }[] }[]
  for (const x of list) {
    const problems = validateQuestion({ id: x.id, category: x.category, prompt: x.prompt, answers: x.answers.map((a) => ({ label: a.label, aliases: a.aliases ?? [], points: a.points })) })
    check(problems.length === 0, `content ${f} / ${x.id} is valid${problems.length ? ': ' + problems.join(' ') : ''}`)
    check(!ids.has(x.id), `content id ${x.id} is unique`)
    ids.add(x.id)
    byId.set(x.id, x.answers.length)
  }
}
const known: Record<string, number> = { elementos: 118, 'africa-paises': 54, 'estados-eeuu': 50, 'pokemon-gen1': 151, 'urss-paises': 15, 'sudamerica-paises': 12, 'nfl-equipos': 32, 'nba-equipos': 30, 'premier-league-equipos': 20, 'guatemala-departamentos': 22, 'pokemon-gen1-fuego': 12, 'pokemon-gen1-agua': 32, 'pokemon-gen1-planta': 14, 'pokemon-gen1-electrico': 9 }
for (const [id, n] of Object.entries(known)) check(byId.get(id) === n, `content ${id} has exactly ${n} answers (has ${byId.get(id)})`)

process.exit(failed ? 1 : 0)
