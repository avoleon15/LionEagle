import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { CHAT_GAP_MS, CHAT_MAX, type ChatMessage, type PlayerView } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { ChatIcon } from './PixelIcon'
import { sfx } from './sound'
import { socket } from './socket'

// Free chat: a button opens a small panel with a text field; what you send shows up as a bubble (avatar and text, no name) for everybody.
// It works in the waiting room, during the questions and at the end. The field only has focus when the player opens it.

export const SHOW_MS = 4500
const MAX_BUBBLES = 3

interface Bubble {
  msg: ChatMessage
  at: number
}

interface Props {
  players: PlayerView[]
  me: string
  /** Players standing on the podium: once the game is over their messages appear over their heads (see Podium), not here. */
  podium?: string[]
}

export function Chat({ players, me, podium = [] }: Props) {
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

  useEffect(() => {
    const onMsg = (msg: ChatMessage) => {
      if (msg.from !== me) sfx.pop()
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
        {bubbles.map(({ msg }) => {
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
      )}
      {error && <p className="chaterror">{error}</p>}
      <button type="button" className="chatbtn" aria-label="Mensajes" aria-expanded={open} onClick={() => (open ? closePanel() : openPanel())}>
        <ChatIcon />
      </button>
    </div>
  )
}
