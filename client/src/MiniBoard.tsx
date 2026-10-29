import type { PlayerView } from '../../shared/protocol'
import { Avatar } from './Avatar'

// The small scoreboard in the top-left corner while a question is open: the player, the one just above and the one just
// below. It follows the scores as players lock in their answers; the arrow shows whether a place was gained or lost since the round began.

interface Props {
  players: PlayerView[]
  scores: Record<string, number>
  /** The totals when the round began. */
  prev: Record<string, number>
  me: string
  /** Show the arrows (not on the first question: nobody had a place before it). */
  arrows: boolean
}

/** Places with ties sharing the lowest number, in the order of `sorted`. */
function places(sorted: { id: string; s: number }[]): Map<string, number> {
  const out = new Map<string, number>()
  let place = 0
  let last = NaN
  sorted.forEach((r, k) => {
    if (r.s !== last) place = k + 1
    last = r.s
    out.set(r.id, place)
  })
  return out
}

const Arrow = ({ up }: { up: boolean }) => (
  <svg className={`arrow ${up ? 'up' : 'down'}`} viewBox="0 0 10 7" width="14" height="10" role="img" aria-label={up ? 'subió' : 'bajó'} shapeRendering="crispEdges">
    <path fill="currentColor" d={up ? 'M5 0h1v1h1v1h1v1h1v1h1v1H0V4h1V3h1V2h1V1h1z' : 'M0 1h10v1H9v1H8v1H7v1H6v1H5V6H4V5H3V4H2V3H1V2H0z'} />
  </svg>
)

export function MiniBoard({ players, scores, prev, me, arrows }: Props) {
  if (players.length < 2) return null
  const order = (get: (id: string) => number) =>
    players.map((p, i) => ({ p, i, s: get(p.id) })).sort((a, b) => b.s - a.s || a.i - b.i)
  const now = order((id) => scores[id] ?? 0)
  const before = places(order((id) => prev[id] ?? 0).map((r) => ({ id: r.p.id, s: r.s })))
  const placeNow = places(now.map((r) => ({ id: r.p.id, s: r.s })))
  const mine = now.findIndex((r) => r.p.id === me)
  if (mine < 0) return null
  // three rows: me in the middle, or at the edge when I am first or last
  const start = Math.max(0, Math.min(mine - 1, now.length - 3))
  const rows = now.slice(start, start + 3)
  return (
    <ol className="miniboard" aria-label="Tu posición">
      {rows.map((r) => {
        const place = placeNow.get(r.p.id)!
        const delta = (before.get(r.p.id) ?? place) - place // positive: went up
        return (
          <li key={r.p.id} className={r.p.id === me ? 'me' : ''}>
            <span className={`place p${place}`}>{place}</span>
            <Avatar a={r.p.avatar} size={22} />
            <span className="who">{r.p.nick}</span>
            <span className="arrowslot">{arrows && delta !== 0 && <Arrow up={delta > 0} />}</span>
          </li>
        )
      })}
    </ol>
  )
}
