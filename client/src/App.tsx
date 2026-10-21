import { useCallback, useEffect, useRef, useState } from 'react'
import { CODE_LENGTH, type Ack, type JoinResult, type RoomState } from '../../shared/protocol'
import { Backdrop } from './Backdrop'
import { Game } from './Game'
import { sfx } from './sound'
import { SoundToggle } from './SoundToggle'
import { Home } from './Home'
import { Lobby } from './Lobby'
import { clearSession, loadProfile, loadSession, saveProfile, saveSession, type Profile } from './session'
import { socket } from './socket'

const codeFromUrl = () => {
  const c = window.location.pathname.replace(/\//g, '').toUpperCase()
  return c.length === CODE_LENGTH ? c : ''
}

export function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [room, setRoom] = useState<RoomState | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [connected, setConnected] = useState(socket.connected)
  // The "reconnecting" bar only shows when the connection stays down for a moment, not while the page is still connecting.
  const [offline, setOffline] = useState(false)
  useEffect(() => {
    if (connected) return setOffline(false)
    const t = setTimeout(() => setOffline(true), 2500)
    return () => clearTimeout(t)
  }, [connected])
  // True while we try to get back into the room we were in, so a reload doesn't flash the home screen.
  const [restoring, setRestoring] = useState(() => {
    const s = loadSession()
    return s !== null && (!codeFromUrl() || codeFromUrl() === s.code)
  })
  const profileRef = useRef(profile)
  profileRef.current = profile

  const enter = useCallback((res: Ack<JoinResult>) => {
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      clearSession()
      return false
    }
    setError('')
    setRoom(res.data.room)
    setPlayerId(res.data.playerId)
    saveSession({ code: res.data.room.code, playerId: res.data.playerId })
    window.history.replaceState(null, '', `/${res.data.room.code}`)
    return true
  }, [])

  const join = useCallback(
    (code?: string) => {
      const p = profileRef.current
      saveProfile(p)
      setBusy(true)
      setError('')
      const prev = loadSession()
      const playerId = prev && code && prev.code === code.toUpperCase() ? prev.playerId : undefined
      // A reply lost with a dropped connection would otherwise leave the buttons disabled forever.
      socket.timeout(10_000).emit('room:join', { code, nick: p.nick, avatar: p.avatar, playerId }, (err, res) =>
        enter(err ? { ok: false, error: 'No se pudo conectar con el servidor. Intenta de nuevo.' } : res),
      )
    },
    [enter],
  )

  useEffect(() => {
    const onState = (r: RoomState) => setRoom(r)
    const onConnect = () => {
      setConnected(true)
      // Come back to the room we were in (page reload or dropped connection).
      let s = loadSession()
      const p = profileRef.current
      // Opening the link of a different room than the one we were in: that is where the player wants to go.
      const wanted = codeFromUrl()
      if (s && wanted && wanted !== s.code) {
        socket.emit('room:leave')
        clearSession()
        s = null
      }
      if (s && p.nick) {
        socket.emit('room:join', { code: s.code, nick: p.nick, avatar: p.avatar, playerId: s.playerId }, (res) => {
          // The player left (or went to another room) while this was on its way: ignore the answer.
          const now = loadSession()
          if (!now || now.code !== s.code || now.playerId !== s.playerId) return setRestoring(false)
          if (res.ok) {
            enter(res)
          } else {
            // The room is gone (the server restarted, or our seat expired while we were offline):
            // drop whatever we were showing instead of staying stuck on a dead game screen.
            clearSession()
            setRoom(null)
            setPlayerId(null)
            setError('Esa sala ya no existe. Crea una nueva o únete con otro código.')
            window.history.replaceState(null, '', '/')
          }
          setRestoring(false)
        })
      } else {
        setRestoring(false)
      }
    }
    const onDisconnect = () => {
      setConnected(false)
      setBusy(false)
    }
    socket.on('room:state', onState)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    if (socket.connected) onConnect()
    return () => {
      socket.off('room:state', onState)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [enter])

  const leave = () => {
    socket.emit('room:leave')
    clearSession()
    setRoom(null)
    setPlayerId(null)
    window.history.replaceState(null, '', '/')
  }

  const playing = !!(room && playerId && room.phase === 'playing' && room.game)
  // Sound: any first tap or key press unlocks audio; buttons click (the answer box has its own sounds).
  useEffect(() => {
    const unlock = () => sfx.unlock()
    const click = (e: MouseEvent) => {
      const b = (e.target as HTMLElement | null)?.closest('button')
      if (b && !b.closest('.question') && !b.classList.contains('soundbtn')) sfx.click()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])

  return (
    <div className="app">
      {offline && <div className="banner">Reconectando…</div>}
      {!playing && <Backdrop />}
      {!playing && <SoundToggle className="fixed" />}
      {restoring && !room ? (
        <main className="screen">
          <p className="box hint">Volviendo a tu sala…</p>
        </main>
      ) : null}
      {restoring && !room ? null : room && playerId ? (
        playing && room.game ? (
          <Game key={room.gameNo} room={room} game={room.game} me={playerId} connected={connected} onLeave={leave} />
        ) : (
          <Lobby room={room} me={playerId} nick={profile.nick} onLeave={leave} />
        )
      ) : (
        <Home
          profile={profile}
          onProfile={setProfile}
          initialCode={codeFromUrl()}
          error={error}
          busy={busy || !connected}
          onCreate={() => join()}
          onJoin={(code) => join(code)}
        />
      )}
    </div>
  )
}
