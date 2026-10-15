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
  env: { ...process.env, PORT: String(port), DB_PATH: join(dir, 'e2e.db'), ADMIN_TOKEN: 'e2e', LE_ROUND_MS: '3000', LE_REVEAL_MS: '400', NODE_NO_WARNINGS: '1' },
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
const av = { color: 1, face: 2, hair: 3, hat: 4, pants: 5 }

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

// ---- 4. a player cannot try answers forever ----
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
  for (let i = 0; i < 6; i++) last = await emit(A, 'game:answer', 'invento ' + i)
  check(last.ok && last.data.valid === false && last.data.attemptsLeft === 0, 'the 6th wrong answer reports no tries left')
  const seventh = await emit(A, 'game:answer', q.answers[0].label)
  check(seventh.ok === false && /intentos/.test(seventh.error), 'after that even a correct answer is refused')
  await sleep(200)
  check(st.game.exhausted.length === 1 && st.game.stage === 'answering', 'everybody sees who is out of tries and the round keeps going')
  await emit(B, 'game:answer', q.answers[0].label)
  await sleep(300)
  check(st.game.stage === 'reveal', 'the round ends early once the other player answers')
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
