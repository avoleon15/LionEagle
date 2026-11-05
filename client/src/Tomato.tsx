import { useEffect, useRef, useState } from 'react'
import { TOMATO_GAP_MS, type TomatoSplat } from '../../shared/protocol'
import { TomatoIcon } from './PixelIcon'
import { socket } from './socket'
import { sfx } from './sound'

// Anybody can throw tomatoes at a player, in the waiting room (at the avatars) and once the game is over (at the podium):
// each one leaves a red stain and some drops on that player, for everybody. The tomato buttons share one wait of half a second between throws.

const MAX_SPLATS = 60
/** How long a stain stays on the screen before it is wiped off (it fades during the last second, see .splat in styles.css). */
export const SPLAT_LIFE_MS = 5000

/** The stains that landed lately on anybody: each one is wiped off after a few seconds (the lobby and the podium each start empty). */
export function useSplats(): TomatoSplat[] {
  const [splats, setSplats] = useState<TomatoSplat[]>([])
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const onSplat = (t: TomatoSplat) => {
      sfx.splat()
      setSplats((s) => [...s.slice(-(MAX_SPLATS - 1)), t])
      const timer = setTimeout(() => {
        timers.delete(timer)
        setSplats((s) => s.filter((x) => x.id !== t.id))
      }, SPLAT_LIFE_MS)
      timers.add(timer)
    }
    socket.on('tomato:splat', onSplat)
    return () => {
      socket.off('tomato:splat', onSplat)
      timers.forEach(clearTimeout)
    }
  }, [])
  return splats
}

// A stain made of whole pixels: a body and a few drops around it.
const BODY: [number, number, number, number][] = [[7, 7, 10, 10], [5, 9, 14, 6], [9, 5, 6, 14], [6, 6, 12, 12]]
const DROPS: [number, number][] = [[2, 4], [19, 3], [21, 12], [3, 17], [14, 21], [11, 1], [22, 20], [1, 11]]

/** A hash of the id: every stain looks a little different (turned, bigger or smaller) but the same on every screen. */
function seedOf(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

/** The stains of one player: draw it inside that player's step or slot (position: relative). */
export function SplatLayer({ splats }: { splats: TomatoSplat[] }) {
  return (
    <div className="splats" aria-hidden>
      {splats.map((t) => {
        const h = seedOf(t.id)
        const rot = h % 360
        const scale = 0.8 + ((h >> 8) % 60) / 100
        const lean = ((h >> 16) % 120) - 60
        return (
          <div key={t.id} className="splat" style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%`, ['--lean' as string]: `${lean}px` }}>
            <span className="flying"><TomatoIcon size={24} /></span>
            <svg viewBox="0 0 24 24" width="38" height="38" shapeRendering="crispEdges" style={{ transform: `rotate(${rot}deg) scale(${scale})` }}>
              {BODY.map(([x, y, w, hh], i) => <rect key={i} x={x} y={y} width={w} height={hh} fill={i === 3 ? '#9d0208' : '#d00000'} />)}
              <rect x="9" y="9" width="4" height="4" fill="#e85d04" opacity="0.7" />
              {DROPS.map(([x, y], i) => ((h >> i) & 1 ? <rect key={i} x={x} y={y} width={2 + (i % 2)} height={2 + (i % 2)} fill="#d00000" /> : null))}
            </svg>
          </div>
        )
      })}
    </div>
  )
}

/** The half-second wait between throws, shared by every tomato button of the screen. */
export function useThrower() {
  const [wait, setWait] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const throwAt = (at: string) => {
    if (wait) return
    setWait(true)
    timer.current = setTimeout(() => setWait(false), TOMATO_GAP_MS)
    socket.emit('tomato:send', { at, x: 0.1 + Math.random() * 0.8, y: 0.05 + Math.random() * 0.9 }, () => undefined)
  }
  return { wait, throwAt }
}

/** A small tomato to throw at one player. */
export function TomatoButton({ at, name, thrower, size = 22 }: { at: string; name: string; thrower: ReturnType<typeof useThrower>; size?: number }) {
  return (
    <button type="button" className={'tomatobtn' + (thrower.wait ? ' cool' : '')} onClick={() => thrower.throwAt(at)} aria-label={`Tirar un tomate a ${name}`} title="Tirar un tomate">
      <TomatoIcon size={size} />
    </button>
  )
}
