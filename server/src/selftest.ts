// Run with: npm run test -w server
// Checks every question's answer list and the matching rules.
import { MIN_TOKEN_LENGTH, weakTokenWarning } from './admin'
import * as backup from './backup'
import * as metrics from './metrics'
import * as db from './db'
import { buildIndex, match, suggest, validateQuestion } from './matching'
import { webhookRequest } from './notify'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join as joinPath } from 'node:path'
import { pathToFileURL } from 'node:url'
import { selectQuestions } from './selection'
import * as stats from './stats'
import { Game, GameError, MIN_RETRY_MS } from './game'
import { RateLimiter } from './ratelimit'
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
{
  // An alias that clashes with another answer would make the question invalid; saving it would silently unpublish a live question.
  stats.logAnswer(sq.id, 'azulado')
  const before = db.getQuestion(sq.id)!
  check(before.status === 'published', 'alias guard: the question is live before the attempt')
  check(thrown(() => stats.addFromLog(sq.id, 'azul', { alias: true, label: 'Rojo' })), 'alias guard: an alias that clashes with another answer is refused')
  const after = db.getQuestion(sq.id)!
  check(after.status === 'published' && JSON.stringify(after.answers) === JSON.stringify(before.answers), 'alias guard: the live question stays published and unchanged')
  db.setStatus(sq.id, 'draft')
  check(!stats.addFromLog(sq.id, 'azulado', { alias: true, label: 'Rojo' }).demoted && db.getQuestion(sq.id)!.status === 'draft', 'alias guard: a draft is edited normally')
  db.setStatus(sq.id, 'published')
}
{
  // the owner picks the name and the aliases of what is added; what players typed is accepted too unless turned off
  stats.logAnswer(sq.id, 'rosadito')
  stats.addFromLog(sq.id, 'rosadito', { points: 80, label: 'Rosa', aliases: ['Rosado', ' rosa  claro '] })
  const rosa = db.getQuestion(sq.id)!.answers.find((a) => a.label === 'Rosa')!
  check(rosa.points === 80 && rosa.aliases.join('|') === 'Rosado|rosa claro|rosadito', 'owner-chosen name and aliases are saved, with the typed text added')
  stats.logAnswer(sq.id, 'violeta claro')
  stats.addFromLog(sq.id, 'violeta claro', { points: 60, label: 'Violeta', includeTyped: false })
  const vio = db.getQuestion(sq.id)!.answers.find((a) => a.label === 'Violeta')!
  check(vio.aliases.length === 0, 'the typed text can be left out of the aliases')
  stats.setIgnored(sq.id, 'violeta claro', true)
  stats.logAnswer(sq.id, 'rojo clarito')
  stats.addFromLog(sq.id, 'rojo clarito', { alias: true, label: 'Rojo', aliases: ['Rojo suave', 'rojo claro'] })
  const rojo = db.getQuestion(sq.id)!.answers.find((a) => a.label === 'Rojo')!
  check(rojo.aliases.includes('Rojo suave') && rojo.aliases.includes('rojo claro') && !rojo.aliases.includes('rojo clarito'), 'aliases added to an existing answer are the ones the owner typed')
  stats.setIgnored(sq.id, 'rojo clarito', true)
}
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

// ---- a broken client hook or timer callback must not break the game ----
{
  const members = ['a', 'b']
  let calls = 0
  const game = new Game({ members: () => members, active: () => members, changed: () => { calls++; throw new Error('socket exploded') } }, QUESTIONS.slice(0, 7).map((x) => ({ ...x })))
  const q1 = QUESTIONS.find((x) => x.prompt === game.view().prompt)!
  let threw = false
  const quiet = console.error
  console.error = () => {} // the failures are expected here
  try { game.submit('a', q1.answers[0].label); game.submit('b', q1.answers[1].label) } catch { threw = true }
  console.error = quiet
  check(!threw && calls > 0 && game.view().stage === 'reveal', 'robustness: a failing change notification does not break answering or ending the round')
  game.dispose()
}
{
  // a player who dropped before answering was never really asked
  const members = ['a', 'b', 'c']
  let active = ['a', 'b']
  const game = new Game({ members: () => members, active: () => active, changed: () => {} }, QUESTIONS.slice(0, 7).map((x) => ({ ...x })))
  const q1 = QUESTIONS.find((x) => x.prompt === game.view().prompt)!
  const before = stats.detail(q1.id)?.asked ?? 0
  game.submit('a', q1.answers[0].label)
  game.submit('b', q1.answers[1].label)
  check(game.view().stage === 'reveal', 'stats: the round ends with the connected players done')
  check((stats.detail(q1.id)?.asked ?? 0) - before === 2, 'stats: a disconnected player who never answered is not counted as asked')
  game.dispose()
}

// ---- tries per question ----
{
  db.init(':memory:')
  const members = ['a', 'b']
  const game = new Game({ members: () => members, active: () => members, changed: () => {} }, QUESTIONS.slice(0, 7).map((x) => ({ ...x })))
  const q0 = QUESTIONS.find((x) => x.prompt === game.view().prompt)!
  const realNow = Date.now
  let clock = realNow()
  Date.now = () => clock
  try {
    for (let i = 0; i < 40; i++) {
      check(game.submit('a', 'respuesta que no existe ' + i).valid === false || i > 0, 'tries: a wrong answer is just not valid')
      clock += MIN_RETRY_MS + 10
    }
    check(game.view().stage === 'answering', 'tries: there is no cap, forty wrong answers in a row do not end anything')
    game.submit('a', 'otra mala')
    let tooFast = false
    try { game.submit('a', q0.answers[0].label) } catch (e) { tooFast = e instanceof GameError }
    check(tooFast, 'tries: a retry right after a wrong answer is refused (guessing cannot be scripted)')
    clock += MIN_RETRY_MS + 10
    check(game.submit('a', q0.answers[0].label).valid === true, 'tries: a person can still answer right after many wrong tries')
  } finally {
    Date.now = realNow
  }
  game.submit('b', q0.answers[0].label)
  check(game.view().stage === 'reveal', 'tries: the round ends early when everybody has answered')
  game.dispose()
}

// ---- a question that cannot be played is caught before the game starts ----
{
  const qs = QUESTIONS.slice(0, 7).map((x) => ({ ...x, answers: [...x.answers] }))
  qs[3].answers.push({ label: 'Otra distinta', aliases: [qs[3].answers[0].label], points: 100 }) // two answers that collide
  let notified = 0
  let threw = false
  try { new Game({ members: () => ['a', 'b'], active: () => ['a', 'b'], changed: () => notified++ }, qs) } catch { threw = true }
  check(threw && notified === 0, 'start: a game with a broken question fails at once, without announcing anything')
}

// ---- "did you mean" ----
{
  const sq = { id: 'sug', category: 'x', prompt: 'x', answers: [
    { label: 'Semuc Champey', aliases: [], points: 80 }, { label: 'Tikal', aliases: [], points: 10 }, { label: 'Antigua Guatemala', aliases: [], points: 10 },
    { label: 'Lago de Atitlán', aliases: [], points: 10 }, { label: 'Rio Dulce', aliases: [], points: 30 }, { label: 'Flores', aliases: [], points: 60 }, { label: 'Pacaya', aliases: [], points: 100 },
  ] }
  const ix = buildIndex(sq)
  check(suggest(ix, 'semuc champei') === 'Semuc Champey', 'suggest: one wrong letter in a long answer gives the right label')
  check(suggest(ix, 'semuc champy') === 'Semuc Champey', 'suggest: a missing letter is still close')
  check(suggest(ix, 'Antigua Guatemla') === 'Antigua Guatemala', 'suggest: accents and a missing letter')
  check(suggest(ix, 'Tikla') === 'Tikal', 'suggest: two swapped letters count as one edit')
  check(suggest(ix, 'Tika') === null, 'suggest: very short words get no suggestion')
  check(suggest(ix, 'montaña') === null && suggest(ix, 'playa de arena') === null, 'suggest: unrelated words get nothing')
  check(suggest(ix, 'semuc') === 'Semuc Champey', 'suggest: the first part of a name suggests the whole name')
}

// ---- suggestion notifications ----
{
  check(JSON.parse(webhookRequest('https://discord.com/api/webhooks/1/x', 'hola').body).content === 'hola', 'notify: Discord gets {content}')
  check(JSON.parse(webhookRequest('https://hooks.slack.com/services/a/b/c', 'hola').body).text === 'hola', 'notify: Slack gets {text}')
  const nt = webhookRequest('https://ntfy.sh/mi-tema', 'hola')
  check(nt.body === 'hola' && nt.headers.Title === 'Nueva sugerencia', 'notify: ntfy gets plain text with a title')
  check(JSON.parse(webhookRequest('https://example.com/hook', 'hola').body).text === 'hola', 'notify: anything else gets {text}')
  check(JSON.stringify(JSON.parse(webhookRequest('https://discord.com/api/webhooks/1/x', '@everyone').body).allowed_mentions) === '{"parse":[]}', 'notify: Discord messages cannot mention anybody')
  check(JSON.parse(webhookRequest('https://hooks.slack.com/services/a/b/c', 'hola <!channel> & <@U1>').body).text === 'hola &lt;!channel&gt; &amp; &lt;@U1&gt;', 'notify: Slack messages cannot ping (<, > and & are escaped)')
}

// ---- a part of a name: it does not score, it suggests ----
{
  const { q: dslq } = await import('./dsl')
  const qq = dslq('parcial', 'x', 'Nombra un equipo.', {
    10: ['Utah Jazz|Jazz|Utah', 'Los Angeles Lakers|Lakers|Los Angeles', 'Los Angeles Clippers|Clippers', 'Miami Heat|Heat', 'Boston Celtics|Celtics', 'Chicago Bulls|Bulls|!Chicago'],
    30: ['Manchester United|Man Utd', 'Manchester City|Man City'],
    60: ['Mansión del bosque|Woodland mansion'],
    100: ['Roger Federer|Federer|Roger'],
  }) as any
  const jazz = qq.answers.find((a: any) => a.label === 'Utah Jazz')
  check(jazz.aliases.join() === 'Jazz,~Utah', `dsl: only the first-word alias is marked (${jazz.aliases.join()})`)
  check(qq.answers.find((a: any) => a.label === 'Chicago Bulls').aliases.includes('Chicago'), 'dsl: "!alias" forces an alias to score')
  const ix = buildIndex(qq)
  check(match(ix, 'Jazz')?.points === 10 && match(ix, 'Utah Jazz')?.points === 10, 'partial: the last word and the full name still score')
  check(match(ix, 'Utah') === null && suggest(ix, 'Utah') === 'Utah Jazz', 'partial: "Utah" does not score but suggests "Utah Jazz"')
  check(match(ix, 'Mansión') === null && suggest(ix, 'mansion') === 'Mansión del bosque', 'partial: "mansion" suggests the full name')
  check(suggest(ix, 'Los Angeles') === null, 'partial: a part shared by several answers suggests nothing')
  check(suggest(ix, 'Manchester') === null, 'partial: "Manchester" (United or City) suggests nothing')
  check(suggest(ix, 'Roger') === 'Roger Federer' && match(ix, 'Roger') === null, 'partial: a first name alone suggests the full name')
  check(suggest(ix, 'del') === null && suggest(ix, 'los') === null, 'partial: small words never suggest anything')
  check(suggest(ix, 'Utha') === null, 'partial: a typo on a part is not guessed')
}

// ---- live scores ----
{
  const members = ['a', 'b']
  const game = new Game({ members: () => members, active: () => members, changed: () => {} }, QUESTIONS.slice(0, 7).map((x) => ({ ...x })))
  const q0 = QUESTIONS.find((x) => x.prompt === game.view().prompt)!
  const hit = game.submit('a', q0.answers[0].label)
  check(game.view().stage === 'answering' && game.view().scores.a === hit.points && game.view().scores.b === 0, 'scores: the points count as soon as the answer locks in')
  game.submit('b', q0.answers[1].label)
  const after = game.view()
  const ra = after.reveal?.results.find((r) => r.playerId === 'a')
  check(after.stage === 'reveal' && after.scores.a === hit.points && ra?.points === hit.points, 'scores: ending the round does not add the points a second time')
  game.dispose()
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
for (const f of readdirSync(contentDir).filter((n) => n.endsWith('.ts') && !n.startsWith('pistas'))) {
  const list = (await import(pathToFileURL(new URL(f, contentDir).pathname).href)).default as { id: string; category: string; prompt: string; answers: { label: string; aliases?: string[]; points: number }[] }[]
  for (const x of list) {
    const problems = validateQuestion({ id: x.id, category: x.category, prompt: x.prompt, answers: x.answers.map((a) => ({ label: a.label, aliases: a.aliases ?? [], points: a.points })) })
    check(problems.length === 0, `content ${f} / ${x.id} is valid${problems.length ? ': ' + problems.join(' ') : ''}`)
    check(!ids.has(x.id), `content id ${x.id} is unique`)
    ids.add(x.id)
    byId.set(x.id, x.answers.length)
  }
}
const known: Record<string, number> = { elementos: 118, 'africa-paises': 54, 'estados-eeuu': 50, 'pokemon-gen1': 151, 'urss-paises': 15, 'nfl-equipos': 32, 'nba-equipos': 30, 'premier-league-equipos': 51, 'guatemala-departamentos': 22 }
for (const [id, n] of Object.entries(known)) check(byId.get(id) === n, `content ${id} has exactly ${n} answers (has ${byId.get(id)})`)

// ---- every content question can be saved (the database limits are stricter than the content checks) ----
{
  db.init(':memory:')
  const dir = new URL('../../content/', import.meta.url)
  const all: any[] = []
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.ts') && !n.startsWith('pistas'))) all.push(...(await import(pathToFileURL(new URL(f, dir).pathname).href)).default)
  const report = db.importQuestions(all, true)
  check(report.errors.length === 0 && report.drafts.length === 0, `import: every content question is accepted by the database as published${report.errors[0] ? ' (' + report.errors[0].error + ')' : ''}`)
}

// ---- hints of the content questions ----
{
  const hintsDir = new URL('../../content/', import.meta.url)
  const all: { id: string; answers: { label: string; aliases?: string[] }[] }[] = []
  const hints: Record<string, string> = {}
  for (const f of readdirSync(hintsDir).filter((n) => n.endsWith('.ts'))) {
    const mod = (await import(pathToFileURL(new URL(f, hintsDir).pathname).href)).default
    if (f.startsWith('pistas')) Object.assign(hints, mod)
    else all.push(...mod)
  }
  const plain = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const missing = all.filter((q) => !hints[q.id]).map((q) => q.id)
  check(missing.length === 0, `hints: every content question has one${missing.length ? ' (missing: ' + missing.slice(0, 5).join(', ') + ')' : ''}`)
  const orphan = Object.keys(hints).filter((id) => !all.some((q) => q.id === id))
  check(orphan.length === 0, `hints: none belongs to a question that does not exist${orphan.length ? ' (' + orphan.slice(0, 5).join(', ') + ')' : ''}`)
  check(Object.values(hints).every((h) => h.length >= 15 && h.length <= 120), 'hints: every hint is between 15 and 120 characters')
  const leaks: string[] = []
  for (const q of all) {
    const h = plain(hints[q.id] ?? '')
    for (const a of q.answers) for (const t of [a.label, ...(a.aliases ?? []).map((x) => x.replace(/^~/, ''))]) {
      if (plain(t).length >= 5 && new RegExp(`(^|[^a-z0-9])${plain(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(h)) leaks.push(`${q.id}:${t}`)
    }
  }
  check(leaks.length === 0, `hints: none contains a listed answer${leaks.length ? ' (' + leaks.slice(0, 5).join(', ') + ')' : ''}`)
}

{
  // the admin backup keeps hints, and importing it back restores them
  const withHint = db.saveQuestion({ category: 'Prueba export', prompt: 'Nombra una pregunta con pista.', hint: 'Una pista de prueba larga.', answers: [{ label: 'A', points: 10 }] })
  const backup = db.exportQuestions().find((x) => x.id === withHint.question.id)!
  check(backup.hint === 'Una pista de prueba larga.', 'export: the backup carries the hint')
  db.setHint(withHint.question.id, '')
  db.importQuestions([backup], false)
  check(db.getQuestion(withHint.question.id)!.hint === 'Una pista de prueba larga.', 'export: importing the backup restores the hint')
  db.deleteQuestion(withHint.question.id)
  check(weakTokenWarning('1234') !== null && weakTokenWarning('x'.repeat(MIN_TOKEN_LENGTH)) === null, 'admin token: a short one is warned about, a long one is not')
}

{
  // automatic copies of the questions
  const dir = mkdtempSync(joinPath(tmpdir(), 'altus-backups-'))
  const t0 = new Date('2026-10-22T12:00:00Z')
  const keep = db.saveQuestion({ category: 'Prueba copia', prompt: 'Nombra algo que se pueda recuperar.', hint: 'Una pista de copia.', answers: [{ label: 'Algo', points: 10 }] })
  const name = backup.snapshot('borrar', dir, t0)!
  const info = backup.listBackups(dir)
  check(name !== null && info.length === 1 && info[0].reason === 'borrar' && info[0].questions === db.exportQuestions().length, 'backup: a copy is written and lists how many questions it holds')
  check(backup.snapshot('borrar', dir, new Date(t0.getTime() + 30_000)) === null, 'backup: a second copy for the same reason within a minute is skipped')
  check(backup.snapshot('importar', dir, new Date(t0.getTime() + 30_000)) !== null, 'backup: another reason is not skipped')
  for (let i = 1; i <= 12; i++) backup.snapshot('borrar', dir, new Date(t0.getTime() + i * 120_000))
  check(backup.listBackups(dir).filter((b) => b.reason === 'borrar').length === 10, 'backup: only the newest 10 copies of each reason are kept')
  check(['../x.json', 'x.json', '2026-10-22T12-00-00-borrar.json/../..'].every((n) => thrown(() => backup.readBackup(n, dir))), 'backup: names that are not ours are refused')
  const first = backup.snapshot('probar', dir, new Date(t0.getTime() + 99 * 120_000))!
  db.deleteQuestion(keep.question.id)
  check(db.getQuestion(keep.question.id) === null, 'backup: the question is gone before restoring')
  backup.restore(first, dir)
  const back = db.getQuestion(keep.question.id)
  check(back !== null && back.hint === 'Una pista de copia.' && back.status === 'draft', 'backup: restoring a copy brings the question back, with its hint')
  check(backup.listBackups(dir).some((b) => b.reason === 'antes-de-restaurar'), 'backup: restoring takes a copy of how things were first')
  db.deleteQuestion(keep.question.id)
  rmSync(dir, { recursive: true, force: true })
}

{
  // how much the game is played: games, players, different browsers and the most asked questions
  check(metrics.deviceKey('abc') === null && metrics.deviceKey('x'.repeat(65)) === null && metrics.deviceKey(5) === null, 'metrics: a missing, short, long or non-text browser id counts as nobody')
  const k1 = metrics.deviceKey('navegador-uno-0001')!
  const k2 = metrics.deviceKey('navegador-dos-0002')!
  check(k1 !== k2 && k1 === metrics.deviceKey('navegador-uno-0001') && !k1.includes('navegador'), 'metrics: the same id gives the same short hash, which hides the id')
  const t = Date.UTC(2026, 9, 22, 18, 0, 0) // noon in Guatemala
  const before = metrics.overview(t)
  const g1 = metrics.gameStarted(4, [k1, k2, null], t)
  metrics.gameFinished(g1, t + 1000)
  metrics.gameStarted(2, [k1], t + 60_000)
  const o = metrics.overview(t + 120_000)
  check(o.games - before.games === 2 && o.finished - before.finished === 1 && o.seats - before.seats === 6, 'metrics: games, finished games and player seats are counted')
  check(o.devices - before.devices === 2 && o.returning - before.returning === 1, 'metrics: a browser counts once and as returning when it plays again')
  check(o.byDay.length === 14 && o.byDay[13].games === o.today && o.today - before.today === 2, 'metrics: the day list ends today')
  const midnight = Date.UTC(2026, 9, 23, 6, 0, 0) // 00:00 in Guatemala
  metrics.gameStarted(3, [], midnight - 60_000) // 23:59 on the 22nd
  metrics.gameStarted(3, [], midnight) // 00:00 on the 23rd
  const days = metrics.overview(midnight + 3_600_000).byDay
  check(days[13].day === '2026-10-23' && days[12].day === '2026-10-22' && days[13].games === 1 && days[12].games - before.today === 3, 'metrics: days change at midnight Guatemala time (UTC-6)')
  const mq = db.saveQuestion({ category: 'Prueba métricas', prompt: 'Nombra algo muy preguntado.', status: 'published', answers: [{ label: 'Alfa', points: 10 }, { label: 'Beta', points: 10 }, { label: 'Gamma', points: 30 }, { label: 'Delta', points: 30 }, { label: 'Epsilon', points: 60 }, { label: 'Zeta', points: 100 }] })
  check(mq.question.status === 'published', 'metrics: the test question is published')
  stats.recordRound(mq.question.id, 4, 3)
  stats.recordRound(mq.question.id, 4, 2)
  const top = metrics.overview(t).topQuestions.find((x) => x.id === mq.question.id)
  check(top?.asked === 8 && top.answered === 5, 'metrics: the most asked questions come with how many answered')
  check(metrics.overview(t).categories.some((c) => c.category === 'Prueba métricas' && c.asked === 8), 'metrics: asked counts add up per category')
  db.deleteQuestion(mq.question.id)
}

process.exit(failed ? 1 : 0)
