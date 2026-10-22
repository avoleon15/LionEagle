import { useEffect, useMemo, useState } from 'react'
import type { PlayerView } from '../../shared/protocol'
import { Avatar } from './Avatar'
import { softBreaks } from './nickname'

// The ranking shown between questions: everybody, in the order they had before this round, then the rows slide to
// their new places. A green arrow (went up) or a red one (went down) sits at the right end of the row from the start. Scores count up as the rows move.

const ROW = 42 // px: height of a row plus the gap under it
const WAIT_MS = 650 // the old order stays on screen this long before the rows start to move
const MOVE_MS = 950

interface Props {
  players: PlayerView[]
  /** Total score of each player after this round. */
  scores: Record<string, number>
  /** What each player earned this round. */
  gained: Record<string, number>
  me: string
  /** Show the arrows (not on the first question: nobody had a place before it). */
  arrows: boolean
}

/** Places with ties sharing the lowest number, in the order of `sorted`. */
function placesOf(sorted: { id: string; s: number }[]): Map<string, number> {
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

function Count({ from, to, run }: { from: number; to: number; run: boolean }) {
  const [v, setV] = useState(from)
  useEffect(() => {
    if (!run) return setV(from)
    if (from === to) return setV(to)
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / MOVE_MS)
      setV(Math.round(from + (to - from) * (1 - Math.pow(1 - u, 3))))
      if (u < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [run, from, to])
  return <>{v}</>
}

const Arrow = ({ up }: { up: boolean }) => (
  <svg className={`arrow ${up ? 'up' : 'down'}`} viewBox="0 0 10 7" width="14" height="10" role="img" aria-label={up ? 'subió' : 'bajó'} shapeRendering="crispEdges">
    <path fill="currentColor" d={up ? 'M5 0h1v1h1v1h1v1h1v1h1v1H0V4h1V3h1V2h1V1h1z' : 'M0 1h10v1H9v1H8v1H7v1H6v1H5V6H4V5H3V4H2V3H1V2H0z'} />
  </svg>
)

export function RankTable({ players, scores, gained, me, arrows }: Props) {
  const rows = useMemo(() => {
    const base = players.map((p, i) => ({ p, i, now: scores[p.id] ?? 0, gain: gained[p.id] ?? 0 }))
    const withPrev = base.map((r) => ({ ...r, before: r.now - r.gain }))
    const byNow = [...withPrev].sort((a, b) => b.now - a.now || a.i - b.i)
    const byBefore = [...withPrev].sort((a, b) => b.before - a.before || a.i - b.i)
    const placeNow = placesOf(byNow.map((r) => ({ id: r.p.id, s: r.now })))
    const placeBefore = placesOf(byBefore.map((r) => ({ id: r.p.id, s: r.before })))
    return byNow.map((r, idx) => ({
      ...r,
      idxNow: idx,
      idxBefore: byBefore.indexOf(withPrev.find((x) => x.p.id === r.p.id)!),
      placeNow: placeNow.get(r.p.id)!,
      placeBefore: placeBefore.get(r.p.id)!,
    }))
  }, [players, scores, gained])

  const [moved, setMoved] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setMoved(true), WAIT_MS)
    return () => {
      clearTimeout(a)
    }
  }, [])

  return (
    <ol className="ranktable" style={{ height: rows.length * ROW }} aria-label="Posiciones">
      {rows.map((r) => {
        const idx = moved ? r.idxNow : r.idxBefore
        const place = moved ? r.placeNow : r.placeBefore
        const delta = r.placeBefore - r.placeNow // positive: went up
        return (
          <li
            key={r.p.id}
            className={(r.p.id === me ? 'me' : '') + (moved && r.idxNow !== r.idxBefore ? ' moving' : '')}
            style={{ transform: `translateY(${idx * ROW}px)`, zIndex: moved ? rows.length - r.idxNow : 1 }}
          >
            <span className={`place p${place}`}>{place}</span>
            <Avatar a={r.p.avatar} size={22} />
            <span className="who">{softBreaks(r.p.nick)}</span>
            <span className={`gain t${r.gain}${moved ? ' on' : ''}`}>+{r.gain}</span>
            <b className="score">
              <Count from={r.before} to={r.now} run={moved} />
            </b>
            <span className="arrowslot">{arrows && delta !== 0 && <Arrow up={delta > 0} />}</span>
          </li>
        )
      })}
    </ol>
  )
}
