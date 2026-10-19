import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { secondsLeft } from '../../shared/clock'
import { MAX_ANSWER_LENGTH, tierLabel, type GameView, type PlayerView, type RoomState } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { RESULT_MS, climbValue, climbing, useClimb, useNow, type Climb } from './climb'
import { Scene } from './Scene'
import { socket } from './socket'

interface Props {
  room: RoomState
  game: GameView
  me: string
  connected: boolean
  onLeave: () => void
}

/** Seconds left. The clock skew is measured once per server state (see shared/clock.ts). */
function useSecondsLeft(game: GameView): number {
  const received = useRef({ serverNow: -1, at: 0 })
  if (received.current.serverNow !== game.serverNow) received.current = { serverNow: game.serverNow, at: Date.now() }
  return secondsLeft(game.endsAt, game.serverNow, received.current.at, Date.now())
}

const tierClass = (points: number) => `t${points}`

interface Result {
  round: number
  points: number
  at: number // performance.now()
}

/** Right after answering: only how many points it was worth. */
function ResultCard({ points, out }: { points: number; out: boolean }) {
  return (
    <section className={`box result ${tierClass(points)}`} role="status">
      <p className="tierline">{out ? 'Sin intentos' : tierLabel(points)}</p>
      <p className="points">+{points}</p>
    </section>
  )
}

function Waiting({ secs }: { secs: number }) {
  return (
    <section className="box waiting" role="status">
      <span>¡Listo! Esperando a los demás</span>
      <b>{Math.ceil(secs)}</b>
    </section>
  )
}

function Question({ game, me, connected, now, climb, onResult }: { game: GameView; me: string; connected: boolean; now: number; climb: Climb; onResult: (r: Result) => void }) {
  const secs = useSecondsLeft(game)
  const total = Math.max(1, game.durationMs) / 1000
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [hint, setHint] = useState<{ typed: string; label: string } | null>(null)
  const [shake, setShake] = useState(0)
  const [sending, setSending] = useState(false)
  const [locked, setLocked] = useState(false)
  const [examples, setExamples] = useState<string[] | null>(null)
  const [hintBusy, setHintBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const roundRef = useRef(game.round)
  roundRef.current = game.round
  const lockedByServer = game.answered.includes(me)
  const outOfTries = game.exhausted.includes(me) && !locked

  // New round: clear the previous answer.
  useEffect(() => {
    setText('')
    setMsg('')
    setHint(null)
    setLocked(false)
    setSending(false)
    setExamples(null)
    inputRef.current?.focus()
  }, [game.round])

  const askHint = () => {
    if (hintBusy || examples) return
    setHintBusy(true)
    const round = game.round
    socket.timeout(8000).emit('game:hint', (err, res) => {
      setHintBusy(false)
      if (round !== roundRef.current) return
      if (err) return setMsg('No llegó la pista. Intenta de nuevo.')
      if (!res.ok) return setMsg(res.error)
      setExamples(res.data.examples)
    })
  }

  const useHint = () => {
    if (!hint) return
    setText(hint.label)
    setHint(null)
    setMsg('')
    inputRef.current?.focus()
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const value = text.trim()
    if (!value || sending || !connected || locked || lockedByServer || outOfTries) return
    // Enter on a wrong answer that has a suggestion takes the suggestion first.
    if (hint && value === hint.typed) return useHint()
    setSending(true)
    const round = game.round
    socket.timeout(8000).emit('game:answer', value, (err, res) => {
      setSending(false)
      if (round !== roundRef.current) return // the round ended while the answer was on its way
      if (err) return setMsg('No llegó tu respuesta. Intenta de nuevo.')
      if (!res.ok) return setMsg(res.error)
      if (res.data.valid) {
        setLocked(true)
        onResult({ round, points: res.data.points!, at: performance.now() })
        setMsg('')
        setHint(null)
      } else {
        const left = res.data.attemptsLeft ?? 0
        if (left <= 0) onResult({ round, points: 0, at: performance.now() })
        setHint(res.data.suggestion ? { typed: value, label: res.data.suggestion } : null)
        setMsg(left > 0 ? `${res.data.suggestion ? '' : 'Esa no está en la lista. '}Te ${left === 1 ? 'queda 1 intento' : `quedan ${left} intentos`}.` : '')
        setShake((n) => n + 1)
        if (!res.data.suggestion) inputRef.current?.select()
      }
    })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && hint && !e.shiftKey) {
      e.preventDefault()
      useHint()
    }
  }

  if (locked || lockedByServer || outOfTries) return climbing(climb, now) ? null : <Waiting secs={secs} />

  const share = Math.min(1, secs / total)
  const cells = 20
  const lit = Math.ceil(share * cells)
  return (
    <section className="box question">
      <header className="qhead">
        <span className="round">
          Pregunta {game.round + 1}/{game.total}
        </span>
        <span className="qcat">{game.category}</span>
      </header>
      <h2 className="prompt">{game.prompt}</h2>
      <div className={'clock' + (secs <= 5 ? ' low' : '')} aria-label={`${Math.ceil(secs)} segundos`}>
        <b>{Math.ceil(secs)}</b>
        <span className="cells">
          {Array.from({ length: cells }, (_, i) => (
            <i key={i} className={i < lit ? 'on' : ''} />
          ))}
        </span>
      </div>
      <form onSubmit={submit} className="answer">
        <input
          key={shake}
          ref={inputRef}
          className={shake ? 'shake' : ''}
          value={text}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder="Tu respuesta"
          autoComplete="off"
          autoCapitalize="none"
          enterKeyHint="send"
          disabled={!connected}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            setText(e.target.value)
            if (hint) setHint(null)
          }}
        />
        <button className="primary" disabled={!text.trim() || sending || !connected}>
          Enviar
        </button>
      </form>
      {examples ? (
        <p className="examples">
          <span>Pista · ejemplos de respuestas válidas</span>
          {examples.map((e) => (
            <b key={e}>{e}</b>
          ))}
          <small>Hay muchas más. Solo son para que entiendas qué se pide.</small>
        </p>
      ) : (
        <button type="button" className="hintbtn" onClick={askHint} disabled={hintBusy || !connected}>
          Pista
        </button>
      )}
      {hint && (
        <button type="button" className="didyou" onClick={useHint}>
          ¿Quisiste poner <b>{hint.label}</b>? <small>Enter o Tab para usarla</small>
        </button>
      )}
      {msg ? <p className="error">{msg}</p> : !hint && <p className="hint">▲ Mientras más rara, más alto subes ▲</p>}
    </section>
  )
}

/** The ranking as a table: your row is marked. `gained` shows the points of the round that just ended. */
function Table({ players, scores, me, gained }: { players: PlayerView[]; scores: Record<string, number>; me: string; gained?: Record<string, number> }) {
  const ranked = players.map((p, i) => ({ p, i, s: scores[p.id] ?? 0 })).sort((a, b) => b.s - a.s || a.i - b.i)
  let place = 0
  let prev = -1
  return (
    <ol className="table">
      {ranked.map((r, k) => {
        if (r.s !== prev) place = k + 1
        prev = r.s
        return (
          <li key={r.p.id} className={r.p.id === me ? 'me' : ''}>
            <span className={`place p${place}`}>{place}</span>
            <Avatar a={r.p.avatar} size={22} />
            <span className="who">{r.p.id === me ? `${r.p.nick} (tú)` : r.p.nick}</span>
            {gained && <span className={`gain ${tierClass(gained[r.p.id] ?? 0)}`}>+{gained[r.p.id] ?? 0}</span>}
            <b className="score">{r.s}</b>
          </li>
        )
      })}
    </ol>
  )
}

function Reveal({ room, game, me }: { room: RoomState; game: GameView; me: string }) {
  const secs = useSecondsLeft(game)
  const reveal = game.reveal!
  const gained: Record<string, number> = {}
  for (const r of reveal.results) gained[r.playerId] = r.points
  const mine = gained[me] ?? 0
  const last = game.round + 1 >= game.total
  return (
    <section className="box reveal">
      <header className="qhead">
        <span className="round">
          Pregunta {game.round + 1}/{game.total}
        </span>
        <span className="qcat">{game.category}</span>
      </header>
      <div className={`mine ${tierClass(mine)}`}>
        <span>{mine > 0 ? tierLabel(mine) : 'Sin puntos esta vez'}</span>
        <b>+{mine}</b>
      </div>
      <Table players={room.players} scores={game.scores} me={me} gained={gained} />
      <p className="next">
        {last ? 'Resultado final en' : 'Siguiente pregunta en'} {Math.ceil(secs)}
      </p>
    </section>
  )
}

function Final({ room, game, me, onLeave }: Props) {
  const [error, setError] = useState('')
  const [details, setDetails] = useState(false)
  const isHost = room.hostId === me
  const ranked = [...room.players].sort((a, b) => (game.scores[b.id] ?? 0) - (game.scores[a.id] ?? 0))
  const myPlace = ranked.findIndex((p) => (game.scores[p.id] ?? 0) === (game.scores[me] ?? 0)) + 1
  return (
    <section className="box final">
      <p className="kicker">Resultado final</p>
      <h2 className="prompt">{myPlace === 1 ? '¡Ganaste!' : `Quedaste en el lugar ${myPlace} de ${ranked.length}`}</h2>
      <Table players={room.players} scores={game.scores} me={me} />
      {error && <p className="error">{error}</p>}
      <button onClick={() => setDetails((d) => !d)}>{details ? 'Ocultar mis resultados' : 'Ver mis resultados'}</button>
      {details && (
        <div className="details">
          {(game.history ?? []).map((round, i) => (
            <div key={i} className="round-card">
              <p className="rq">
                <b>{i + 1}.</b> {round.prompt}
              </p>
              <ul>
                {[...round.results]
                  .filter((r) => r.playerId === me)
                  .map((r) => (
                    <li key={r.playerId} className={(r.playerId === me ? 'me ' : '') + tierClass(r.points)}>
                      <span className="what">{r.answer ?? '—'}</span>
                      {r.points > 0 && <small className="rarity">{tierLabel(r.points)}</small>}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {isHost ? (
        <button className="primary" onClick={() => socket.emit('game:reset', (res) => !res.ok && setError(res.error))}>
          Volver a la sala
        </button>
      ) : (
        <p className="hint">Esperando al anfitrión…</p>
      )}
      <button className="link" onClick={onLeave}>
        Salir de la sala
      </button>
    </section>
  )
}

/**
 * Top-left scoreboard: you and your neighbours in the ranking (one above and one below; two below if you
 * are first, two above if you are last).
 */
function Board({ players, scoreOf, me, answered }: { players: PlayerView[]; scoreOf: (id: string) => number; me: string; answered: Set<string> }) {
  const ranked = players.map((p, i) => ({ p, i, s: scoreOf(p.id) })).sort((a, b) => b.s - a.s || a.i - b.i)
  const at = Math.max(0, ranked.findIndex((r) => r.p.id === me))
  const from = Math.max(0, Math.min(at - 1, ranked.length - 3))
  const rows = ranked.slice(from, from + 3)
  return (
    <ol className="board box" aria-label="Puntos">
      {rows.map((r) => (
        <li key={r.p.id} className={r.p.id === me ? 'me' : ''}>
          <span className="rank">{ranked.indexOf(r) + 1}</span>
          <Avatar a={r.p.avatar} size={16} />
          <span className="nick">{r.p.id === me ? 'Tú' : r.p.nick}</span>
          {answered.has(r.p.id) && <span className="tick" aria-label="ya respondió">✓</span>}
          <b className="pts">{r.s}</b>
        </li>
      ))}
    </ol>
  )
}

export function Game(props: Props) {
  const { room, game, me, connected, onLeave } = props
  const now = useNow(60)
  const climb = useClimb(game.scores[me] ?? 0)
  const shown = Math.round(climbValue(climb, now))
  const rising = climbing(climb, now)
  const finalSeen = useRef(0)
  if (game.stage === 'final' && !finalSeen.current) finalSeen.current = now
  if (game.stage !== 'final') finalSeen.current = 0
  const showFinal = game.stage === 'final' && now - finalSeen.current > 2600
  const self = room.players.find((p) => p.id === me)
  // The "how many points" card: shown right after answering, even if that answer ended the round.
  const [result, setResult] = useState<Result | null>(null)
  const fresh = result && result.round === game.round && game.stage !== 'final' && now - result.at < RESULT_MS ? result : null

  const boxShown = fresh !== null || (game.stage === 'final' ? showFinal : !rising)
  const focus = game.stage === 'final' ? 0.55 : boxShown ? 0.9 : 0.68

  return (
    <main className="play">
      {self && <Scene avatar={self.avatar} climb={climb} focus={focus} launch={game.stage === 'final'} />}
      <div className="hud">
        <Board players={room.players} scoreOf={(id) => (id === me ? shown : game.scores[id] ?? 0)} me={me} answered={new Set(game.stage === 'answering' ? game.answered : [])} />
        <div className="hud-right">
          {game.stage !== 'final' && (
            <span className="pill-chip">
              {game.round + 1}/{game.total}
            </span>
          )}
          <button
            className="exit"
            aria-label="Salir de la sala"
            onClick={() => {
              if (game.stage === 'final' || window.confirm('¿Salir de la partida? No podrás volver a entrar a esta sala.')) onLeave()
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="stage">
        {fresh && <ResultCard points={fresh.points} out={fresh.points === 0} />}
        {game.stage === 'answering' && !fresh && <Question game={game} me={me} connected={connected} now={now} climb={climb} onResult={setResult} />}
        {game.stage === 'reveal' && game.reveal && !fresh && !rising && <Reveal room={room} game={game} me={me} />}
        {showFinal && <Final {...props} />}
      </div>
    </main>
  )
}
