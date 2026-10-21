import { useState } from 'react'
import { MAX_PLAYERS, QUESTIONS_PER_GAME, type RoomState } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { groupCategories } from './categories'
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
  const [open, setOpen] = useState(false)
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
  const groups = groupCategories(room.categories)
  // A group is on when all its categories are, "some" when only a few are. Tapping turns the whole group on, or off when it was all on.
  const allOn = room.selected.length === room.categories.length
  const picked = groups.filter((g) => g.categories.every((c) => chosen.has(c.name)))
  const summary = allOn ? 'Todas las categorías' : picked.length > 0 && picked.length <= 2 && room.selected.length === picked.reduce((n, g) => n + g.categories.length, 0) ? picked.map((g) => g.name).join(' y ') : `${room.selected.length} de ${room.categories.length} categorías`
  const toggleGroup = (names: string[]) => {
    const allOn = names.every((n) => chosen.has(n))
    choose(allOn ? room.selected.filter((n) => !names.includes(n)) : [...new Set([...room.selected, ...names])])
  }

  const start = () => {
    setError('')
    socket.emit('game:start', (res) => {
      if (!res.ok) setError(res.error)
    })
  }

  return (
    <main className="screen lobby">
      <section className="box lobbybox">
        <header className="roomhead">
          <div>
            <p className="kicker">Código de la sala</p>
            <div className="code">{room.code}</div>
          </div>
          <button onClick={copy}>{copied ? '¡Copiado!' : 'Copiar enlace'}</button>
        </header>

        <p className="kicker">
          Jugadores {room.players.length}/{MAX_PLAYERS}
        </p>
        <ul className="crowd">
          {Array.from({ length: MAX_PLAYERS }, (_, i) => {
            const p = room.players[i]
            if (!p) return <li key={`empty-${i}`} className="slot empty" aria-hidden />
            return (
              <li key={p.id} className={'slot' + (p.connected ? '' : ' away') + (p.id === me ? ' me' : '')}>
                <span className="name">
                  {p.id === room.hostId && <span className="crown" title="Host">♛ </span>}
                  {p.nick}
                </span>
                <Avatar a={p.avatar} size={44} />
                {!p.connected && <span className="off">sin conexión</span>}
              </li>
            )
          })}
        </ul>

        <div className="dropdown">
          <button className="dropbtn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span>
              <small>Categorías{isHost ? '' : ' (elige el host)'}</small>
              {summary}
            </span>
            <i aria-hidden>{open ? '▲' : '▼'}</i>
          </button>
          {open && (
        <div className="groups dropmenu">
          <button className={'gbtn all' + (room.selected.length === room.categories.length ? ' on' : '')} disabled={!isHost} aria-pressed={room.selected.length === room.categories.length} onClick={() => choose(room.categories.map((c) => c.name))}>
            ★ Todas las categorías
          </button>
          {groups.map((g) => {
            const names = g.categories.map((c) => c.name)
            const on = names.filter((n) => chosen.has(n)).length
            const state = on === names.length ? ' on' : on > 0 ? ' some' : ''
            return (
              <div key={g.name} className="group">
                <button className={'gbtn' + state} disabled={!isHost} aria-pressed={on === names.length} onClick={() => toggleGroup(names)}>
                  {g.name}
                </button>
              </div>
            )
          })}
        </div>
          )}
        </div>
        {!enough && room.categories.length > 0 && (
          <p className="error">
            Con estas categorías hay {available} preguntas y se necesitan {QUESTIONS_PER_GAME}.
          </p>
        )}
        {error && <p className="error">{error}</p>}

        {isHost ? (
          <button className="primary big" onClick={start} disabled={room.players.length < 2 || !enough}>
            {room.players.length < 2 ? 'Esperando jugadores…' : '¡Empezar!'}
          </button>
        ) : (
          <p className="hint">Esperando a que el host empiece…</p>
        )}
        <div className="links">
          <button className="link" onClick={() => setSuggesting(true)}>
            Sugerir una pregunta
          </button>
          <button className="link" onClick={onLeave}>
            Salir de la sala
          </button>
        </div>
      </section>
      {suggesting && <SuggestBox nick={nick} categories={room.categories.map((c) => c.name)} onClose={() => setSuggesting(false)} />}
    </main>
  )
}
