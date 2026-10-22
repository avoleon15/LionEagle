// Run with: npm run test:e2e -w server
// Starts a real server on a free port with a throwaway database and attacks it the way a broken or
// hostile client would, then plays a short game. Everything here used to crash or hang the server.
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { io, type Socket } from 'socket.io-client'
import { SAMPLE_QUESTIONS } from './questions'

let failed = 0
const check = (ok: boolean, msg: string) => {
  if (!ok) failed++
  console.log(ok ? 'PASS' : 'FAIL', msg)
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const s = createServer()
    s.listen(0, () => {
      const { port } = s.address() as { port: number }
      s.close(() => resolve(port))
    })
    s.on('error', reject)
  })

const serverDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = mkdtempSync(join(tmpdir(), 'leon-aguila-e2e-'))
const port = await freePort()
const base = `http://localhost:${port}`

let child: ChildProcess | null = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
  cwd: serverDir,
  env: { ...process.env, PORT: String(port), DB_PATH: join(dir, 'e2e.db'), ADMIN_TOKEN: 'e2e', LE_NO_SEED: '1', LE_ROUND_MS: '3000', LE_REVEAL_MS: '400', LE_HOST_HANDOVER_MS: '500', NODE_NO_WARNINGS: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let log = ''
let exited = false
child.stdout!.on('data', (d) => (log += d))
child.stderr!.on('data', (d) => (log += d))
child.on('exit', () => (exited = true))

const cleanup = () => {
  child?.kill()
  child = null
  rmSync(dir, { recursive: true, force: true })
}
const finish = (code: number) => {
  cleanup()
  process.exit(code)
}

for (let i = 0; i < 100 && !log.includes('server on'); i++) await sleep(100)
if (!log.includes('server on')) {
  console.log('FAIL the server did not start\n' + log)
  finish(1)
}

const alive = async () => {
  try {
    const r = await fetch(`${base}/socket.io/?EIO=4&transport=polling`, { signal: AbortSignal.timeout(3000) })
    return r.ok && !exited
  } catch {
    return false
  }
}
const connect = async (): Promise<Socket> => {
  const s = io(base, { forceNew: true, transports: ['websocket'] })
  await new Promise<void>((resolve, reject) => {
    s.on('connect', resolve)
    s.on('connect_error', reject)
  })
  return s
}
const emit = <T = any>(s: Socket, ev: string, ...args: unknown[]) =>
  new Promise<T>((resolve) => {
    const t = setTimeout(() => resolve({ timeout: true } as T), 3000)
    s.emit(ev, ...args, (r: T) => {
      clearTimeout(t)
      resolve(r)
    })
  })
const av = { color: 1, face: 2, hat: 4 }

// ---- 1. a client that does not send callbacks must not take the server down ----
{
  const s = await connect()
  for (const ev of ['room:join', 'room:leave', 'game:start', 'room:categories', 'game:answer', 'game:reset']) {
    s.emit(ev) // no payload, no callback
    s.emit(ev, null)
    s.emit(ev, { code: 'ZZZZ', nick: 'x' }) // payload but no callback
    s.emit(ev, 'basura', 'tampoco-soy-una-funcion')
    s.emit(ev, 42, { a: 1 })
  }
  await sleep(600)
  check(await alive(), 'every event without a callback or with garbage arguments leaves the server running')
  s.close()
}

// ---- 2. malformed join payloads get a clean error, not a crash ----
{
  const s = await connect()
  const results = []
  for (const payload of [null, undefined, 42, 'hola', [], {}, { nick: 'x', code: 123 }, { code: { a: 1 }, nick: ['x'] }]) {
    results.push(await emit(s, 'room:join', payload))
  }
  check(results.every((r) => r && r.ok === false && typeof r.error === 'string'), 'bad join payloads are answered with an error message')
  check(await alive(), 'the server survives malformed join payloads')
  const unknown = await emit(s, 'room:join', { code: 'ZZZZ', nick: 'Ana', avatar: av })
  check(unknown.ok === false && /No existe/.test(unknown.error), 'joining a room that does not exist says so (the client uses this to leave a dead room)')
  s.close()
}

// ---- 3. normal play still works after all that ----
{
  const A = await connect()
  const B = await connect()
  let st: any
  A.on('room:state', (r: any) => (st = r))
  const ra = await emit(A, 'room:join', { nick: 'Ana', avatar: av })
  check(ra.ok && ra.data.room.code.length === 4, 'a room can be created')
  const rb = await emit(B, 'room:join', { code: ra.data.room.code.toLowerCase(), nick: 'Beto', avatar: av })
  check(rb.ok && rb.data.room.players.length === 2, 'a second player can join with a lowercase code')
  check((await emit(B, 'game:start')).ok === false, 'a non-host cannot start')
  check((await emit(A, 'game:start')).ok === true, 'the host can start')
  await sleep(200)
  check(st.phase === 'playing' && st.game.stage === 'answering', 'the game is in the answering stage')

  const q = SAMPLE_QUESTIONS.find((x) => x.prompt === st.game.prompt)!
  const invalid = await emit(A, 'game:answer', 'una respuesta inventada')
  check(invalid.ok && invalid.data.valid === false, 'an unlisted answer is rejected')
  await sleep(300)
  const valid = await emit(A, 'game:answer', q.answers[0].label)
  check(valid.ok && valid.data.valid === true, 'a listed answer is accepted')
  check((await emit(A, 'game:answer', q.answers[1].label)).ok === false, 'a second answer in the same round is refused')
  await emit(B, 'game:answer', q.answers[1].label)
  await sleep(300)
  check(st.game.stage === 'reveal', 'the round ends early once everybody has answered')
  check(await alive(), 'the server is still up at the end')
  A.close()
  B.close()
}

// ---- 4. wrong answers can be retried, but not faster than a person types ----
{
  const A = await connect()
  const B = await connect()
  let st: any
  A.on('room:state', (r: any) => (st = r))
  const ra = await emit(A, 'room:join', { nick: 'Ana', avatar: av })
  await emit(B, 'room:join', { code: ra.data.room.code, nick: 'Beto', avatar: av })
  await emit(A, 'game:start')
  await sleep(200)
  const q = SAMPLE_QUESTIONS.find((x) => x.prompt === st.game.prompt)!
  let last: any
  for (let i = 0; i < 5; i++) {
    last = await emit(A, 'game:answer', 'invento ' + i)
    await sleep(300)
  }
  check(last.ok && last.data.valid === false, 'five wrong answers in a row are all just "not valid"')
  await emit(A, 'game:answer', 'otro invento')
  const fast = await emit(A, 'game:answer', q.answers[0].label)
  check(fast.ok === false && /despacio/.test(fast.error), 'an immediate retry is refused')
  await sleep(300)
  const right = await emit(A, 'game:answer', q.answers[0].label)
  check(right.ok && right.data.valid === true, 'a right answer after those wrong ones still counts')
  await emit(B, 'game:answer', q.answers[0].label)
  await sleep(300)
  check(st.game.stage === 'reveal', 'the round ends early once everybody has answered')
  A.close()
  B.close()
}

// ---- 4b. host who disconnects, nick on rejoin ----
{
  const A = await connect()
  const B = await connect()
  let st: any
  B.on('room:state', (r: any) => (st = r))
  const ra = await emit(A, 'room:join', { nick: 'Ana', avatar: av })
  const rb = await emit(B, 'room:join', { code: ra.data.room.code, nick: 'Beto', avatar: av })
  A.close()
  await sleep(150)
  check(st.hostId === ra.data.playerId, 'host: a short drop does not hand the room over yet')
  await sleep(900)
  check(st.hostId === rb.data.playerId, 'host: after a few seconds away the room goes to a connected player')

  // The first host comes back later with a nickname somebody else has taken meanwhile.
  const A2 = await connect()
  const back = await emit(A2, 'room:join', { code: ra.data.room.code, nick: 'beto', avatar: av, playerId: ra.data.playerId })
  const nicks = back.data.room.players.map((p: any) => p.nick.toLowerCase())
  check(back.ok && new Set(nicks).size === nicks.length, `nick: a rejoin cannot create a duplicate nickname (${nicks.join(', ')})`)
  check(back.data.room.hostId === rb.data.playerId, 'host: the player who came back is not the host again')

  // A host who comes back in time keeps the room.
  const C = await connect()
  const D = await connect()
  let st2: any
  D.on('room:state', (r: any) => (st2 = r))
  const rc = await emit(C, 'room:join', { nick: 'Cata', avatar: av })
  await emit(D, 'room:join', { code: rc.data.room.code, nick: 'Dani', avatar: av })
  C.close()
  await sleep(150)
  const C2 = await connect()
  await emit(C2, 'room:join', { code: rc.data.room.code, nick: 'Cata', avatar: av, playerId: rc.data.playerId })
  await sleep(900)
  check(st2.hostId === rc.data.playerId, 'host: a host who reconnects in time stays the host')
  for (const s of [A2, B, C2, D]) s.close()
}

// ---- 4c. a category the host picked disappears before the game starts ----
{
  const adminApi = (path: string, init: RequestInit = {}) => fetch(base + path, { ...init, headers: { 'x-admin-token': 'e2e', 'Content-Type': 'application/json' } })
  const A = await connect()
  const B = await connect()
  let st: any
  A.on('room:state', (r: any) => (st = r))
  const ra = await emit(A, 'room:join', { nick: 'Ana', avatar: av })
  await emit(B, 'room:join', { code: ra.data.room.code, nick: 'Beto', avatar: av })
  check((await emit(A, 'room:categories', ['Ciencia', 'Música'])).ok === true, 'categories: the host can pick two categories')
  const all = (await (await adminApi('/api/admin/questions')).json()).questions as { id: string; category: string }[]
  for (const x of all.filter((x) => ['Ciencia', 'Música'].includes(x.category))) await adminApi(`/api/admin/questions/${x.id}/status`, { method: 'POST', body: JSON.stringify({ status: 'archived' }) })
  await emit(A, 'room:join', { code: ra.data.room.code, nick: 'Ana', avatar: av, playerId: ra.data.playerId }) // asks the server for fresh state
  await sleep(150)
  check(st.selected.length > 0 && !st.selected.includes('Ciencia') && !st.selected.includes('Música'), `categories: when every picked category is gone the selection falls back to the rest (${st.selected.join(', ')})`)
  const started = await emit(A, 'game:start')
  check(started.ok === true, `categories: the game still starts (${started.error ?? 'ok'})`)
  A.close()
  B.close()
}

// ---- 5. admin and suggestions ----
{
  const api = (path: string, init: RequestInit & { token?: string | null } = {}) => {
    const { token = 'e2e', headers, ...rest } = init
    return fetch(base + path, { ...rest, headers: { ...(token ? { 'x-admin-token': token } : {}), ...(headers as object) } })
  }

  const list = await (await api('/api/admin/questions')).json()
  check(Array.isArray(list.questions) && list.questions.length >= 7 && typeof list.questions[0].answerCount === 'number' && !('answers' in list.questions[0]), 'the admin list carries summaries, not every answer of every question')
  const full = await (await api(`/api/admin/questions/${list.questions[0].id}`)).json()
  check(Array.isArray(full.question.answers) && full.question.answers.length === list.questions[0].answerCount, 'a question is loaded in full when it is opened')
  const cats = await (await api('/api/admin/categories')).json()
  check(Array.isArray(cats.categories) && cats.categories.includes('Geografía'), 'the admin has its own categories list')

  const big = JSON.stringify({ questions: [{ junk: 'x'.repeat(1_900_000) }] })
  const noToken = await api('/api/admin/import', { method: 'POST', token: null, headers: { 'Content-Type': 'application/json' }, body: big })
  check(noToken.status === 401, 'a big request without the token is refused (the body is not even read)')

  const nope = await api('/api/unknown-thing', { token: null })
  check(nope.status === 404 && /json/.test(nope.headers.get('content-type') ?? ''), 'unknown /api paths answer with JSON 404, not the web page')

  const codes: number[] = []
  for (let i = 0; i < 7; i++) {
    const r = await api('/api/suggest', { method: 'POST', token: null, headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `10.9.8.${i}` }, body: JSON.stringify({ prompt: `Sugerencia de prueba número ${i}` }) })
    codes.push(r.status)
  }
  check(codes.filter((c) => c === 200).length === 5 && codes[5] === 429 && codes[6] === 429, `a faked X-Forwarded-For does not get around the suggestion limit (${codes.join(' ')})`)

  const badJson = await api('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"questions": [' })
  const badText = await badJson.text()
  check(badJson.status === 400 && /json/.test(badJson.headers.get('content-type') ?? '') && !/node_modules|\.js:\d+/.test(badText), `a broken JSON body answers with a short JSON error, not an error page with file paths (${badJson.status})`)
  const tooBig = await api('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: big + big })
  check(tooBig.status === 413 && /json/.test(tooBig.headers.get('content-type') ?? ''), `a body over the limit answers 413 with JSON (${tooBig.status})`)
  const exported = await (await api('/api/admin/export')).json()
  check(Array.isArray(exported.questions) && 'hint' in exported.questions[0], 'the backup file carries the hint of every question')

  // Last, because it locks this address out of the admin for a while. The request without a token above
  // already counted as one failure, so the lockout starts at the 10th failure overall (the 9th wrong token here).
  const bad: number[] = []
  for (let i = 0; i < 11; i++) bad.push((await api('/api/admin/ping', { token: 'incorrecto-' + i })).status)
  const first = bad.indexOf(429)
  check(first === 9 && bad.slice(0, first).every((c) => c === 401) && bad.slice(first).every((c) => c === 429), `after 10 failed attempts the address is locked out (${bad.join(' ')})`)
  check((await api('/api/admin/ping')).status === 429, 'while locked out even the right token is refused')
}

console.log(failed ? `\n${failed} FAILED` : '\nall good')
if (failed) console.log('--- server log ---\n' + log)
finish(failed ? 1 : 0)
