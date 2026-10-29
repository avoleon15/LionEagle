import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CHAT_GAP_MS, CHAT_NAME_MARK, CHAT_PHRASES, type ChatMessage, type ChatPhrase, type PlayerView } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { chatState } from './chatState'
import { PlayerName } from './PlayerName'
import { sfx } from './sound'
import { socket } from './socket'

// Quick messages, in the style of Clash Royale: a button opens a short list of fixed phrases and the one you pick shows up as a
// bubble for everybody. There is one list for while the questions run and another for the end of the game.
// Some phrases are aimed at another player: after choosing one you pick who.

const SHOW_MS = 3600
const MAX_BUBBLES = 3

interface Bubble {
  msg: ChatMessage
  at: number
}

/** The text of a phrase, with {nombre} replaced by the target's name in their colour. */
export function PhraseText({ phrase, to }: { phrase: ChatPhrase; to?: PlayerView }): ReactNode {
  const [before, after] = phrase.text.split(CHAT_NAME_MARK)
  if (after === undefined) return phrase.text
  return (
    <>
      {before}
      {to ? <PlayerName p={to} /> : <i>alguien</i>}
      {after}
    </>
  )
}

interface Props {
  players: PlayerView[]
  me: string
  /** The game is over: the end phrases are on offer instead of the in-game ones. */
  ended: boolean
  /** Players standing on the podium: once the game is over their messages appear over their heads (see Podium), not here. */
  podium: string[]
}

export function Chat({ players, me, ended, podium }: Props) {
  const [open, setOpen] = useState(false)
  const [picking, setPicking] = useState<ChatPhrase | null>(null)
  const [muted, setMuted] = useState(false)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [error, setError] = useState('')
  const [wait, setWait] = useState(false)
  const mutedRef = useRef(muted)
  mutedRef.current = muted
  chatState.muted = muted
  const onPodium = useRef({ ended, podium })
  onPodium.current = { ended, podium }

  useEffect(() => {
    const onMsg = (msg: ChatMessage) => {
      if (mutedRef.current && msg.from !== me) return
      if (msg.from !== me) sfx.pop()
      if (onPodium.current.ended && onPodium.current.podium.includes(msg.from)) return
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

  const phrases = CHAT_PHRASES.filter((p) => p.when === 'both' || p.when === (ended ? 'end' : 'game'))
  const others = players.filter((p) => p.id !== me)
  const byId = (id?: string) => players.find((p) => p.id === id)

  const send = (phrase: ChatPhrase, to?: string) => {
    setError('')
    setOpen(false)
    setPicking(null)
    setWait(true)
    setTimeout(() => setWait(false), CHAT_GAP_MS)
    socket.emit('chat:send', { phrase: phrase.id, to }, (res) => {
      if (!res.ok) setError(res.error)
    })
  }
  const pick = (phrase: ChatPhrase) => (phrase.text.includes(CHAT_NAME_MARK) ? setPicking(phrase) : send(phrase))

  return (
    <div className="chat">
      <ul className="bubbles" aria-live="polite">
        {bubbles.map(({ msg }) => {
          const from = byId(msg.from)
          const phrase = CHAT_PHRASES.find((p) => p.id === msg.phrase)
          if (!from || !phrase) return null
          return (
            <li key={msg.id} className={msg.from === me ? 'mine' : ''}>
              <Avatar a={from.avatar} size={16} />
              <span>
                <PlayerName p={from} />: <PhraseText phrase={phrase} to={byId(msg.to)} />
              </span>
            </li>
          )
        })}
      </ul>
      {open && (
        <div className="chatmenu" role="menu">
          {picking ? (
            <>
              <p className="kicker">¿A quién?</p>
              {others.map((p) => (
                <button key={p.id} onClick={() => send(picking, p.id)}>
                  <Avatar a={p.avatar} size={16} /> <PlayerName p={p} />
                </button>
              ))}
              <button className="link" onClick={() => setPicking(null)}>Atrás</button>
            </>
          ) : (
            <>
              {phrases.map((p) => (
                <button key={p.id} onClick={() => pick(p)}>
                  <PhraseText phrase={p} />
                </button>
              ))}
              <button className="link" onClick={() => setMuted((m) => !m)}>{muted ? 'Activar mensajes' : 'Silenciar mensajes'}</button>
            </>
          )}
        </div>
      )}
      {error && <p className="chaterror">{error}</p>}
      <button className="chatbtn" aria-label="Mensajes" aria-expanded={open} disabled={wait && !open} onClick={() => { setOpen((o) => !o); setPicking(null) }}>
        {muted ? '🔇' : '💬'}
      </button>
    </div>
  )
}
