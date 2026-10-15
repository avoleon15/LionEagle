import { useState } from 'react'
import { MAX_PLAYERS, QUESTIONS_PER_GAME, type RoomState } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { SuggestBox } from './SuggestBox'
import { socket } from './socket'

interface Props {
  room: RoomState
  me: string
  nick: string
  onLeave: () => void
}

export function Lobby({ room, me, nick, onLeave }: Props) {
  const [error, setError] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [copied, setCopied] = useState(false)
  const isHost = room.hostId === me
  const link = `${window.location.origin}/${room.code}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copia el enlace:', link)
    }
  }

  const chosen = new Set(room.selected)
  const available = room.categories.filter((c) => chosen.has(c.name)).reduce((n, c) => n + c.count, 0)
  const enough = available >= QUESTIONS_PER_GAME

  const choose = (names: string[]) => {
    setError('')
    socket.emit('room:categories', names, (res) => {
      if (!res.ok) setError(res.error)
    })
  }
  const toggle = (name: string) => choose(chosen.has(name) ? room.selected.filter((n) => n !== name) : [...room.selected, name])

  const start = () => {
    setError('')
    socket.emit('game:start', (res) => {
      if (!res.ok) setError(res.error)
    })
  }

  return (
    <main className="lobby">
      <section className="card">
        <p className="label">Código de la sala</p>
        <div className="code">{room.code}</div>
        <button onClick={copy}>{copied ? '¡Copiado!' : 'Copiar enlace'}</button>

        <p className="label">
          Jugadores ({room.players.length}/{MAX_PLAYERS})
        </p>
        <ul className="players">
          {room.players.map((p) => (
            <li key={p.id} className={p.connected ? '' : 'away'}>
              <Avatar a={p.avatar} size={44} />
              <span>
                {p.nick}
                {p.id === me && ' (tú)'}
              </span>
              {p.id === room.hostId && <span className="tag">Anfitrión</span>}
              {!p.connected && <span className="tag">Sin conexión</span>}
            </li>
          ))}
        </ul>

        <p className="label">Categorías</p>
        <div className="cats">
          {room.categories.map((c) => (
            <button
              key={c.name}
              className={'cat' + (chosen.has(c.name) ? ' on' : '')}
              disabled={!isHost}
              aria-pressed={chosen.has(c.name)}
              onClick={() => toggle(c.name)}
            >
              {c.name} <small>{c.count}</small>
            </button>
          ))}
        </div>
        {isHost && room.selected.length < room.categories.length && (
          <button className="link" onClick={() => choose(room.categories.map((c) => c.name))}>
            Elegir todas
          </button>
        )}
        {!enough && <p className="error">Con estas categorías hay {available} preguntas y se necesitan {QUESTIONS_PER_GAME}.</p>}

        {error && <p className="error">{error}</p>}

        {isHost ? (
          <button className="primary" onClick={start} disabled={room.players.length < 2 || !enough}>
            {room.players.length < 2 ? 'Esperando jugadores…' : 'Empezar'}
          </button>
        ) : (
          <p className="tagline">Esperando a que el anfitrión empiece…</p>
        )}
        <button className="link" onClick={() => setSuggesting(true)}>
          Sugerir una pregunta
        </button>
        <button className="link" onClick={onLeave}>
          Salir de la sala
        </button>
      </section>
      {suggesting && <SuggestBox nick={nick} categories={room.categories.map((c) => c.name)} onClose={() => setSuggesting(false)} />}
    </main>
  )
}
