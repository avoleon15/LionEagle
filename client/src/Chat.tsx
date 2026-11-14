import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from 'react'
import { CHAT_GAP_MS, CHAT_MAX, type Avatar as AvatarLook, type ChatMessage, type PlayerView } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { ChatIcon } from './PixelIcon'
import { sfx } from './sound'
import { socket } from './socket'

// Free chat: a button opens a small panel with a text field; what you send shows up as a bubble (avatar and text, no name) for everybody.
// It works in the waiting room, during the questions and at the end. The field only has focus when the player opens it.
// Opening the panel also shows the messages of this room (scroll up for the older ones). They are only kept in this browser, in memory,
// while the player is in the room: nothing is stored on the server, and a message sent before you joined cannot be seen.

const MAX_HISTORY = 100
let historyCode = ''
let history: ChatMessage[] = []
const known = new Map<string, { nick: string; avatar: AvatarLook }>() // who said it, also for players who have left since
const listeners = new Set<() => void>()
socket.on('chat:msg', (msg) => {
  history = [...history, msg].slice(-MAX_HISTORY)
  listeners.forEach((f) => f())
})
const subscribe = (f: () => void) => {
  listeners.add(f)
  return () => void listeners.delete(f)
}
const getHistory = () => history

export const SHOW_MS = 4500
const MAX_BUBBLES = 3

interface Bubble {
  msg: ChatMessage
  at: number
}

interface Props {
  players: PlayerView[]
  me: string
  /** The room: when it changes the history starts over. */
  code: string
  /** Players standing on the podium: once the game is over their messages appear over their heads (see Podium), not here. */
  podium?: string[]
}

export function Chat({ players, me, code, podium = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [error, setError] = useState('')
  const [wait, setWait] = useState(false)
  const [lift, setLift] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const before = useRef<Element | null>(null)
  const podiumRef = useRef(podium)
  podiumRef.current = podium
  const log = useRef<HTMLUListElement>(null)
  const stuck = useRef(true) // the list follows the newest message unless the player scrolled up
  if (code !== historyCode) {
    historyCode = code
    history = []
    known.clear()
  }
  players.forEach((p) => known.set(p.id, { nick: p.nick, avatar: p.avatar }))
  const messages = useSyncExternalStore(subscribe, getHistory)

  useEffect(() => {
    const onMsg = (msg: ChatMessage) => {
      if (msg.from !== me) sfx.chat()
      if (podiumRef.current.includes(msg.from)) return
      setBubbles((b) => [...b.slice(-(MAX_BUBBLES - 1)), { msg, at: Date.now() }])
    }
    socket.on('chat:msg', onMsg)
    return () => void socket.off('chat:msg', onMsg)
  }, [me])
  useEffect(() => {
    if (bubbles.length === 0) return
    const id = setTimeout(() => setBubbles((b) => b.filter((x) => Date.now() - x.at < SHOW_MS)), SHOW_MS)
    return () => clearTimeout(id)
  }, [bubbles])

  useEffect(() => {
    const el = log.current
    if (open && el && stuck.current) el.scrollTop = el.scrollHeight
  }, [open, messages])

  // The on-screen keyboard covers the bottom of the page on phones: lift the panel above it while it is open.
  useEffect(() => {
    const vv = window.visualViewport
    if (!open || !vv) return setLift(0)
    const onResize = () => setLift(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    onResize()
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', onResize)
      setLift(0)
    }
  }, [open])

  const openPanel = () => {
    before.current = document.activeElement
    stuck.current = true
    setOpen(true)
    setError('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }
  /** Closing gives the focus back to whatever had it (the answer field during a question). */
  const closePanel = () => {
    setOpen(false)
    const prev = before.current
    before.current = null
    if (prev instanceof HTMLInputElement || prev instanceof HTMLTextAreaElement) setTimeout(() => prev.isConnected && prev.focus(), 0)
  }

  const send = (e?: FormEvent) => {
    e?.preventDefault()
    const value = text.replace(/\s+/g, ' ').trim()
    if (!value || wait) return
    setWait(true)
    setTimeout(() => setWait(false), CHAT_GAP_MS)
    socket.emit('chat:send', { text: value }, (res) => {
      if (res.ok) return
      setError(res.error)
      setTimeout(() => setError(''), 3000)
    })
    setText('')
    setError('')
    closePanel()
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      closePanel()
    }
  }
  const byId = (id: string) => players.find((p) => p.id === id)

  return (
    <div className="chat" style={lift ? { bottom: `calc(${lift}px + 10px)` } : undefined}>
      <ul className="bubbles" aria-live="polite">
        {!open && bubbles.map(({ msg }) => {
          const from = byId(msg.from)
          if (!from) return null
          return (
            <li key={msg.id} className={msg.from === me ? 'own' : ''}>
              <Avatar a={from.avatar} size={20} />
              <span>{msg.text}</span>
            </li>
          )
        })}
      </ul>
      {open && (
        <div className="chatpanel">
          <ul
            className="chatlog"
            ref={log}
            aria-label="Mensajes de la sala"
            onScroll={(e) => {
              const el = e.currentTarget
              stuck.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
            }}
          >
            {messages.length === 0 && <li className="empty">Todavía no hay mensajes.</li>}
            {messages.map((msg) => {
              const who = known.get(msg.from)
              return (
                <li key={msg.id} className={msg.from === me ? 'own' : ''}>
                  {who && <Avatar a={who.avatar} size={20} />}
                  <span className="said">
                    <b>{msg.from === me ? 'Tú' : who?.nick ?? 'Alguien'}</b>
                    <span>{msg.text}</span>
                  </span>
                </li>
              )
            })}
          </ul>
          <form className="chatmenu" onSubmit={send}>
            <input
              ref={inputRef}
              value={text}
              maxLength={CHAT_MAX}
              placeholder="Escribe un mensaje"
              aria-label="Mensaje para la sala"
              autoComplete="off"
              enterKeyHint="send"
              onKeyDown={onKeyDown}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="primary" disabled={!text.trim() || wait}>
              Enviar
            </button>
          </form>
        </div>
      )}
      {error && <p className="chaterror">{error}</p>}
      <button type="button" className="chatbtn" aria-label="Mensajes" aria-expanded={open} onClick={() => (open ? closePanel() : openPanel())}>
        <ChatIcon />
      </button>
    </div>
  )
}
