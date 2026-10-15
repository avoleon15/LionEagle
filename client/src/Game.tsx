import { useEffect, useRef, useState, type FormEvent } from 'react'
import { secondsLeft } from '../../shared/clock'
import { MAX_ANSWER_LENGTH, tierLabel, type GameView, type RoomState } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { Scene } from './Scene'
import { socket } from './socket'

interface Props {
  room: RoomState
  game: GameView
  me: string
  onLeave: () => void
}

/** Seconds left, ticking every 100 ms. The clock skew is measured once per server state (see shared/clock.ts). */
function useCountdown(game: GameView): number {
  const received = useRef({ serverNow: -1, at: 0 })
  if (received.current.serverNow !== game.serverNow) received.current = { serverNow: game.serverNow, at: Date.now() }
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 100)
    return () => clearInterval(id)
  }, [])
  return secondsLeft(game.endsAt, game.serverNow, received.current.at, Date.now())
}

function Question({ game, me }: { game: GameView; me: string }) {
  const secs = useCountdown(game)
  const total = Math.max(1, game.durationMs) / 1000
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [shake, setShake] = useState(0)
  const [lock, setLock] = useState<{ label: string; points: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lockedByServer = game.answered.includes(me)
  const outOfTries = game.exhausted.includes(me) && !lock

  // New round: clear the previous answer.
  useEffect(() => {
    setText('')
    setMsg('')
    setLock(null)
    inputRef.current?.focus()
  }, [game.round])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || lock || lockedByServer || outOfTries) return
    socket.emit('game:answer', value, (res) => {
      if (!res.ok) return setMsg(res.error)
      if (res.data.valid) {
        setLock({ label: res.data.label!, points: res.data.points! })
        setMsg('')
      } else {
        const left = res.data.attemptsLeft ?? 0
        setMsg(left > 0 ? `Esa no está en la lista. Te ${left === 1 ? 'queda 1 intento' : `quedan ${left} intentos`}.` : 'Esa no está en la lista y ya no te quedan intentos.')
        setShake((n) => n + 1)
        inputRef.current?.select()
      }
    })
  }

  const locked = lock !== null || lockedByServer
  return (
    <>
      <p className="label">
        {game.category} · Pregunta {game.round + 1}/{game.total}
      </p>
      <h2 className="prompt">{game.prompt}</h2>
      <div className="timer" aria-label={`${Math.ceil(secs)} segundos`}>
        <div className={'bar' + (secs < 5 ? ' low' : '')} style={{ width: `${Math.min(100, (secs / total) * 100)}%` }} />
        <span>{Math.ceil(secs)}</span>
      </div>
      {outOfTries ? (
        <div className="locked out">
          <strong>Sin intentos</strong>
          <span>Esperando a los demás…</span>
        </div>
      ) : locked ? (
        <div className="locked">
          <strong>{lock ? lock.label : 'Respuesta guardada'}</strong>
          <span>Esperando a los demás…</span>
        </div>
      ) : (
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
            onChange={(e) => setText(e.target.value)}
          />
          <button className="primary" disabled={!text.trim()}>
            Enviar
          </button>
        </form>
      )}
      {msg && <p className="error">{msg}</p>}
    </>
  )
}

function Reveal({ room, game, me }: { room: RoomState; game: GameView; me: string }) {
  const secs = useCountdown(game)
  const reveal = game.reveal!
  const byId = new Map(room.players.map((p) => [p.id, p]))
  const results = reveal.results.filter((r) => byId.has(r.playerId)).sort((a, b) => b.points - a.points)
  const last = game.round + 1 >= game.total
  return (
    <>
      <p className="label">
        {game.category} · Pregunta {game.round + 1}/{game.total}
      </p>
      <h2 className="prompt small">{game.prompt}</h2>
      <ul className="results">
        {results.map((r) => {
          const p = byId.get(r.playerId)!
          return (
            <li key={r.playerId} className={r.playerId === me ? 'me' : ''}>
              <Avatar a={p.avatar} size={34} />
              <span className="who">
                <b>{p.nick}</b>
                <small>{r.answer ?? 'Sin respuesta'}</small>
              </span>
              <span className={`pts t${r.points}`}>
                +{r.points}
                {r.points > 0 && <small>{tierLabel(r.points)}</small>}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="label">Las respuestas más raras</p>
      <div className="top">
        {reveal.top.map((a) => (
          <span key={a.text} className={`chip t${a.points}`}>
            {a.text} <b>{a.points}</b>
          </span>
        ))}
      </div>
      <p className="tagline">{last ? 'Resultado final en' : 'Siguiente pregunta en'} {Math.ceil(secs)}…</p>
    </>
  )
}

function Final({ room, game, me, onLeave }: Props) {
  const [error, setError] = useState('')
  const ranking = [...room.players].sort((a, b) => (game.scores[b.id] ?? 0) - (game.scores[a.id] ?? 0))
  const isHost = room.hostId === me
  const medals = ['🥇', '🥈', '🥉']
  return (
    <>
      <h2 className="prompt">Resultado final</h2>
      <ol className="ranking">
        {ranking.map((p, i) => (
          <li key={p.id} className={p.id === me ? 'me' : ''}>
            <span className="medal">{medals[i] ?? i + 1}</span>
            <Avatar a={p.avatar} size={40} />
            <b className="who">{p.nick}</b>
            <span className="score">{game.scores[p.id] ?? 0}</span>
          </li>
        ))}
      </ol>
      {error && <p className="error">{error}</p>}
      {isHost ? (
        <button
          className="primary"
          onClick={() => socket.emit('game:reset', (res) => !res.ok && setError(res.error))}
        >
          Volver a la sala
        </button>
      ) : (
        <p className="tagline">Esperando al anfitrión…</p>
      )}
      <button className="link" onClick={onLeave}>
        Salir de la sala
      </button>
    </>
  )
}

export function Game(props: Props) {
  const { room, game, me } = props
  return (
    <main className="game">
      <Scene players={room.players} game={game} me={me} />
      <section className="card">
        {game.stage === 'answering' && <Question game={game} me={me} />}
        {game.stage === 'reveal' && game.reveal && <Reveal room={room} game={game} me={me} />}
        {game.stage === 'final' && <Final {...props} />}
        {game.stage !== 'final' && (
          <button
            className="link"
            onClick={() => {
              if (window.confirm('¿Salir de la partida? No podrás volver a entrar a esta sala.')) props.onLeave()
            }}
          >
            Salir de la sala
          </button>
        )}
      </section>
    </main>
  )
}
