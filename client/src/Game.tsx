import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { computeAwards } from '../../shared/awards'
import { secondsLeft } from '../../shared/clock'
import { MAX_ANSWER_LENGTH, tierLabel, type ChatMessage, type GameView, type PlayerView, type RoomState, type RoundRecord } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { AwardIcon } from './PixelIcon'
import { RESULT_MS, climbing, useClimb, useNow, type Climb } from './climb'
import { Chat, SHOW_MS } from './Chat'
import { MiniBoard } from './MiniBoard'
import { RankTable } from './RankTable'
import { Scene } from './Scene'
import { socket } from './socket'
import { splitPrompt } from './prompt'
import { sfx } from './sound'
import { SplatLayer, TomatoButton, useSplats, useThrower } from './Tomato'
import { SoundToggle } from './SoundToggle'

interface Props {
  room: RoomState
  game: GameView
  me: string
  connected: boolean
  onLeave: () => void
}

/** Seconds left to answer, and seconds left of the reading pause before that. The clock skew is measured once per server state (see shared/clock.ts). */
function useClock(game: GameView): { left: number; read: number } {
  const received = useRef({ serverNow: -1, at: 0 })
  if (received.current.serverNow !== game.serverNow) received.current = { serverNow: game.serverNow, at: Date.now() }
  const { at } = received.current
  return { left: secondsLeft(game.endsAt, game.serverNow, at, Date.now()), read: secondsLeft(game.startsAt, game.serverNow, at, Date.now()) }
}

const tierClass = (points: number) => `t${points}`

interface Result {
  round: number
  points: number
  at: number // performance.now()
}

/** Right after answering: only how many points it was worth. */
function ResultCard({ points }: { points: number }) {
  return (
    <section className={`box result ${tierClass(points)}`} role="status">
      <p className="tierline">{tierLabel(points)}</p>
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
  const clock = useClock(game)
  const total = Math.max(1, game.durationMs) / 1000
  // First the question is only shown for a few seconds (reading); then the answering countdown starts.
  const reading = clock.read > 0
  const secs = Math.min(clock.left, total)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [hint, setHint] = useState<{ typed: string; label: string } | null>(null)
  const [shake, setShake] = useState(0)
  const [nudge, setNudge] = useState(0)
  const [sending, setSending] = useState(false)
  const [locked, setLocked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const roundRef = useRef(game.round)
  roundRef.current = game.round
  const lockedByServer = game.answered.includes(me)

  // New round: clear the previous answer.
  useEffect(() => {
    setText('')
    setMsg('')
    setHint(null)
    setLocked(false)
    setSending(false)
    inputRef.current?.focus()
  }, [game.round])

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
    if (!value || sending || !connected || locked || lockedByServer || reading) return
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
        sfx.correct(res.data.points!)
        onResult({ round, points: res.data.points!, at: performance.now() })
        setMsg('')
        setHint(null)
      } else {
        setHint(res.data.suggestion ? { typed: value, label: res.data.suggestion } : null)
        if (res.data.suggestion) {
          // Close, not wrong: a gentle sound and a glow instead of the red shake and the "bonk".
          sfx.maybe()
          setMsg('')
          setNudge((n) => n + 1)
        } else {
          sfx.wrong()
          setMsg('Esa no está en la lista.')
          setShake((n) => n + 1)
          inputRef.current?.select()
        }
      }
    })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && hint && !e.shiftKey) {
      e.preventDefault()
      useHint()
    }
  }

  // Quick beeps in the last 5 seconds (the long beep for time running out is in Game, when the round ends).
  const whole = Math.ceil(secs)
  const lastBeep = useRef(99)
  useEffect(() => {
    if (!reading && !locked && !lockedByServer && whole <= 5 && whole >= 1 && whole !== lastBeep.current) sfx.tick(false)
    lastBeep.current = whole
  }, [whole, locked, lockedByServer, reading])

  // A soft cue when the reading time ends and answering opens.
  const wasReading = useRef(reading)
  useEffect(() => {
    if (wasReading.current && !reading) sfx.go()
    wasReading.current = reading
  }, [reading])

  // The box opens for typing when the reading pause is over.
  useEffect(() => {
    if (!reading) inputRef.current?.focus()
  }, [reading])

  if (locked || lockedByServer) return climbing(climb, now) ? null : <Waiting secs={secs} />

  const shown = splitPrompt(game.prompt)
  const readTotal = Math.max(0.001, game.readMs / 1000)
  const share = reading ? 1 - Math.min(1, clock.read / readTotal) : Math.min(1, secs / total)
  const cells = 20
  const lit = Math.ceil(share * cells)
  return (
    <section className="box question">
      <header className="qhead">
        <span className="round">
          Pregunta {game.round + 1}/{game.total}
        </span>
      </header>
      <h2 className="prompt">{shown.text}</h2>
      {(shown.note || game.hint) && (
        <p className="clue">
          {shown.note && <span className="note">{shown.note}.</span>}
          {game.hint}
        </p>
      )}
      <div className={'clock' + (reading ? ' reading' : secs <= 5 ? ' low' : '')} aria-label={reading ? `Lee la pregunta: ${Math.ceil(clock.read)} segundos` : `${Math.ceil(secs)} segundos`}>
        <b>{Math.ceil(reading ? clock.read : secs)}</b>
        <span className="cells">
          {Array.from({ length: cells }, (_, i) => (
            <i key={i} className={i < lit ? 'on' : ''} />
          ))}
        </span>
      </div>
      <form onSubmit={submit} className="answer">
        <div className="inputwrap">
          <input
            key={shake}
            ref={inputRef}
            className={shake ? 'shake' : ''}
            value={text}
            maxLength={MAX_ANSWER_LENGTH}
            placeholder={reading ? 'Lee la pregunta…' : 'Tu respuesta'}
            autoComplete="off"
            autoCapitalize="none"
            enterKeyHint="send"
            disabled={!connected || reading}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              setText(e.target.value)
              if (hint) setHint(null)
            }}
          />
          <button
            type="button"
            className="trash"
            aria-label="Borrar lo que escribiste"
            title="Borrar"
            disabled={!text || !connected}
            onClick={() => {
              setText('')
              setHint(null)
              setMsg('')
              inputRef.current?.focus()
            }}
          >
            <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden shapeRendering="crispEdges">
              <path fill="currentColor" d="M6 1h4v1h4v2H2V2h4V1zm-3 4h10v10H3V5zm2 2v6h1V7H5zm3 0v6h1V7H8zm3 0v6h1V7h-1z" />
            </svg>
          </button>
        </div>
        <button className="primary" disabled={!text.trim() || sending || !connected || reading}>
          Enviar
        </button>
      </form>
      {hint && (
        <button type="button" key={nudge} className="didyou" onClick={useHint}>
          ¿Quisiste poner <b>{hint.label}</b>? <small>Enter o Tab para usarla</small>
        </button>
      )}
      {msg && <p className="error">{msg}</p>}
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
            <span className="who">{r.p.nick}</span>
            {gained && <span className={`gain ${tierClass(gained[r.p.id] ?? 0)}`}>+{gained[r.p.id] ?? 0}</span>}
            <b className="score">{r.s}</b>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * The players standing on the podium: the best three, in rank order (ties keep the join order). `place` is the PLACE, so players
 * with the same score share it and the lowest number (100, 100, 50 are places 1, 1, 3). When a tie runs past the third slot
 * (100, 50, 50, 50) only the first three of the tied players fit; the full table below shows everybody.
 */
function podiumOf(players: PlayerView[], scores: Record<string, number>) {
  const ranked = players.map((p, i) => ({ p, i, s: scores[p.id] ?? 0 })).sort((a, b) => b.s - a.s || a.i - b.i)
  return ranked.slice(0, 3).map((r) => ({ ...r, place: ranked.findIndex((x) => x.s === r.s) + 1 }))
}
const podiumIds = (players: PlayerView[], scores: Record<string, number>) => podiumOf(players, scores).map((r) => r.p.id)

/** What the players on the podium said lately, to show over their heads (one bubble each, the newest). */
function usePodiumBubbles(ids: string[]): Record<string, ChatMessage> {
  const [said, setSaid] = useState<Record<string, { msg: ChatMessage; at: number }>>({})
  const idsRef = useRef(ids)
  idsRef.current = ids
  useEffect(() => {
    const onMsg = (msg: ChatMessage) => {
      if (!idsRef.current.includes(msg.from)) return
      setSaid((s) => ({ ...s, [msg.from]: { msg, at: Date.now() } }))
    }
    socket.on('chat:msg', onMsg)
    return () => void socket.off('chat:msg', onMsg)
  }, [])
  useEffect(() => {
    if (Object.keys(said).length === 0) return
    const id = setTimeout(() => setSaid((s) => Object.fromEntries(Object.entries(s).filter(([, v]) => Date.now() - v.at < SHOW_MS))), SHOW_MS)
    return () => clearTimeout(id)
  }, [said])
  return Object.fromEntries(Object.entries(said).map(([id, v]) => [id, v.msg]))
}

/**
 * The final podium. The step height follows the place, so tied players stand at the same height. First place goes in the middle,
 * the next one on its left and the third on its right (one of the slots with a tie, e.g. 1-1-3: two tall steps and a low one).
 * Every step has its own tomato button and takes the stains thrown at that player.
 */
function Podium({ players, scores, me }: { players: PlayerView[]; scores: Record<string, number>; me: string }) {
  const splats = useSplats()
  const thrower = useThrower()
  const top = podiumOf(players, scores)
  const steps = [1, 0, 2].filter((k) => k < top.length).map((k) => top[k])
  const said = usePodiumBubbles(top.map((r) => r.p.id))
  return (
    <div className="podium" aria-label="Podio">
      {steps.map((r, idx) => {
        const msg = said[r.p.id]
        const side = steps.length === 1 ? 'mid' : idx === 0 ? 'left' : idx === steps.length - 1 ? 'right' : 'mid'
        return (
          <div key={r.p.id} className={`step h${r.place} ${side}${r.p.id === me ? ' me' : ''}`}>
            <div className="pedestal">
              {msg && (
                <span key={msg.id} className="saying" role="status">
                  {msg.text}
                </span>
              )}
              <span className="face">
                <Avatar a={r.p.avatar} size={r.place === 1 ? 56 : 44} />
                <TomatoButton at={r.p.id} name={r.p.nick} thrower={thrower} size={18} />
              </span>
              <span className={`block place p${r.place}`}>{r.place}</span>
              <SplatLayer splats={splats.filter((t) => t.at === r.p.id)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Reveal({ room, game, me }: { room: RoomState; game: GameView; me: string }) {
  const reveal = game.reveal!
  const gained: Record<string, number> = {}
  const answers: Record<string, string | null> = {}
  for (const r of reveal.results) {
    gained[r.playerId] = r.points
    answers[r.playerId] = r.answer
  }
  return (
    <section className="box reveal">
      <header className="qhead">
        <span className="round">
          Pregunta {game.round + 1}/{game.total}
        </span>
      </header>
      <RankTable players={room.players} scores={game.scores} gained={gained} answers={answers} me={me} arrows={game.round > 0} />
    </section>
  )
}

/** The three mentions that stand out most in this game (see shared/awards.ts), under the podium. Nothing shows when none stands out. */
function Mentions({ players, history, me }: { players: PlayerView[]; history: RoundRecord[]; me: string }) {
  const awards = computeAwards(players.map((p) => p.id), history)
  if (awards.length === 0) return null
  return (
    <>
      <p className="kicker">Menciones honoríficas</p>
      <ul className="mentions">
        {awards.map((a) => {
          const p = players.find((x) => x.id === a.playerId)!
          return (
            <li key={a.kind} className={`k-${a.kind}${a.playerId === me ? ' me' : ''}`}>
              <span className="micon"><AwardIcon kind={a.kind} size={80} /></span>
              <Avatar a={p.avatar} size={30} />
              <span className="mtext">
                <b className="mtitle">{a.title}</b>
                <span className="mwho">{p.nick}</span>
                <small>{a.detail}</small>
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Final({ room, game, me, onLeave }: Props) {
  const [error, setError] = useState('')
  const [details, setDetails] = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (details) detailsRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [details])
  const isHost = room.hostId === me
  const ranked = [...room.players].sort((a, b) => (game.scores[b.id] ?? 0) - (game.scores[a.id] ?? 0))
  const myPlace = ranked.findIndex((p) => (game.scores[p.id] ?? 0) === (game.scores[me] ?? 0)) + 1
  useEffect(() => {
    sfx.finish(myPlace === 1)
  }, [])
  return (
    <section className="box final">
      <div className="final-scroll">
        <p className="kicker">Resultado final</p>
        <h2 className="prompt">{myPlace === 1 ? '¡Ganaste!' : `Quedaste en el lugar ${myPlace} de ${ranked.length}`}</h2>
        <Podium players={room.players} scores={game.scores} me={me} />
        <Mentions players={room.players} history={game.history ?? []} me={me} />
        <p className="kicker">Tabla completa</p>
        <Table players={room.players} scores={game.scores} me={me} />
        {details && (
          <div className="details" ref={detailsRef}>
            {(game.history ?? []).map((round, i) => (
              <div key={i} className="round-card">
                <p className="rq">
                  <b>{i + 1}.</b> {splitPrompt(round.prompt).text}
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
      </div>
      {/* the buttons stay at the bottom of the box while the podium and the table scroll above them */}
      <div className="final-actions">
        {error && <p className="error">{error}</p>}
        <button onClick={() => setDetails((d) => !d)}>{details ? 'Ocultar mis resultados' : 'Ver mis resultados'}</button>
        {isHost ? (
          <button className="primary" onClick={() => socket.emit('game:reset', (res) => !res.ok && setError(res.error))}>
            Volver a la sala
          </button>
        ) : (
          <p className="hint">Esperando al host…</p>
        )}
        <button onClick={onLeave}>Salir de la sala</button>
      </div>
    </section>
  )
}

let startedGame = -1

export function Game(props: Props) {
  const { room, game, me, connected, onLeave } = props
  const now = useNow(60)
  const climb = useClimb(game.scores[me] ?? 0)
  const rising = climbing(climb, now)
  const finalSeen = useRef(0)
  if (game.stage === 'final' && !finalSeen.current) finalSeen.current = now
  if (game.stage !== 'final') finalSeen.current = 0
  const showFinal = game.stage === 'final' && now - finalSeen.current > 2600
  const self = room.players.find((p) => p.id === me)
  // The "how many points" card: shown right after answering, even if that answer ended the round.
  const [result, setResult] = useState<Result | null>(null)
  const fresh = result && result.round === game.round && game.stage !== 'final' && now - result.at < RESULT_MS ? result : null

  // Sounds that follow the game: start, the climb, other players answering, the take-off.
  // The start jingle plays once per game, not again when this screen is mounted again (StrictMode, a reconnect) in the middle of it.
  useEffect(() => {
    if (game.round === 0 && game.stage === 'answering' && startedGame !== room.gameNo) {
      startedGame = room.gameNo
      sfx.start()
    }
  }, [])
  useEffect(() => {
    if (climb.to <= climb.from) return
    const id = setTimeout(() => sfx.climb(climb.dur / 1000), Math.max(0, climb.start - performance.now()))
    return () => clearTimeout(id)
  }, [climb])
  // Time ran out on you: one long beep when the round ends and you had not answered. (The question screen is already gone by
  // the time the countdown reads zero, so this is decided here, from the round change.)
  const prevStage = useRef(game.stage)
  useEffect(() => {
    if (prevStage.current === 'answering' && game.stage === 'reveal' && !game.answered.includes(me)) sfx.tick(true)
    prevStage.current = game.stage
  }, [game.stage])
  const othersAnswered = game.answered.filter((id) => id !== me).length
  const seenOthers = useRef(0)
  useEffect(() => {
    if (game.stage === 'answering' && othersAnswered > seenOthers.current) sfx.pop()
    seenOthers.current = game.stage === 'answering' ? othersAnswered : 0
  }, [othersAnswered, game.stage])
  useEffect(() => {
    if (game.stage !== 'final') return
    const id = setTimeout(() => sfx.launch(), 900)
    return () => clearTimeout(id)
  }, [game.stage])

  const boxShown = fresh !== null || (game.stage === 'final' ? showFinal : !rising)
  const focus = game.stage === 'final' ? 0.55 : boxShown ? 0.9 : 0.68

  return (
    <main className="play">
      {self && <Scene avatar={self.avatar} map={game.map} nick={self.nick} others={room.players.filter((p) => p.id !== me).map((p) => ({ id: p.id, avatar: p.avatar, nick: p.nick, score: game.scores[p.id] ?? 0 }))} climb={climb} focus={focus} launch={game.stage === 'final'} />}
      <div className="hud">
        <div className="hud-left">
          {game.stage === 'answering' && <MiniBoard players={room.players} scores={game.scores} prev={game.prevScores} me={me} arrows={game.round > 0} />}
        </div>
        <div className="hud-right">
          {game.stage !== 'final' && (
            <span className="pill-chip">
              {game.round + 1}/{game.total}
            </span>
          )}
          <SoundToggle />
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
      <Chat players={room.players} me={me} podium={showFinal ? podiumIds(room.players, game.scores) : undefined} />
      <div className="stage">
        {fresh && <ResultCard points={fresh.points} />}
        {game.stage === 'answering' && !fresh && <Question game={game} me={me} connected={connected} now={now} climb={climb} onResult={setResult} />}
        {game.stage === 'reveal' && game.reveal && !fresh && <Reveal room={room} game={game} me={me} />}
        {showFinal && <Final {...props} />}
      </div>
    </main>
  )
}
