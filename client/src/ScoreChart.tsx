import type { PlayerView, RoundRecord } from '../../shared/protocol'
import { COLORS } from './Avatar'

/** Straight segments from point to point. */
const straightPath = (pts: [number, number][]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')

/**
 * The performance of everybody over the game: points added up after each question (x: the questions, y: the points), as straight
 * lines that draw themselves in. Only yours is highlighted (thick, with a soft halo and area); the rest are thin. Colours are the characters'.
 */
export function ScoreChart({ players, history, me }: { players: PlayerView[]; history: RoundRecord[]; me: string }) {
  const n = history.length
  if (n === 0) return null
  const series = players.map((p) => {
    let sum = 0
    return { p, pts: history.map((r) => (sum += r.results.find((x) => x.playerId === p.id)?.points ?? 0)) }
  })
  const best = Math.max(...series.map((s) => s.pts[n - 1]))
  const top = Math.max(200, Math.ceil(best / 100) * 100)
  const step = top <= 700 ? 100 : 200
  const W = 400, H = 250, L = 38, R = 14, T = 12, B = 40
  const pw = W - L - R, ph = H - T - B
  const pad = 10 // the lines do not touch the axes
  const X = (j: number) => L + pad + (j / n) * (pw - 2 * pad) // j = 0 is the start (no points yet), 1..n the questions
  const Y = (v: number) => T + ph - pad - (v / top) * (ph - 2 * pad)
  const weight = (s: { p: PlayerView }) => (s.p.id === me ? 2 : 0)
  const drawn = [...series].sort((a, b) => weight(a) - weight(b)) // the others first, yours on top
  const color = (p: PlayerView) => COLORS[p.avatar.color % COLORS.length]
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step)
  const path = (s: { pts: number[] }) => straightPath([0, ...s.pts].map((v, j) => [X(j), Y(v)] as [number, number]))
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Puntos acumulados por pregunta de cada jugador">
      <rect x={L} y={T} width={pw} height={ph} rx={4} className="plot" />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={L + pw} y1={Y(v)} y2={Y(v)} className="grid" />
          <text x={L - 6} y={Y(v) + 3.5} textAnchor="end" className="tick">{v}</text>
        </g>
      ))}
      {Array.from({ length: n }, (_, i) => (
        <text key={i} x={X(i + 1)} y={T + ph + 15} textAnchor="middle" className="tick">{i + 1}</text>
      ))}
      <text x={L + pw / 2} y={H - 4} textAnchor="middle" className="axis">Pregunta</text>
      <text x={9} y={T + ph / 2} textAnchor="middle" className="axis" transform={`rotate(-90 9 ${T + ph / 2})`}>Puntos acumulados</text>
      {drawn.map((s, k) => {
        const w = weight(s)
        const c = color(s.p)
        const d = path(s)
        const delay = `${Math.min(k, 8) * 60}ms`
        return (
          <g key={s.p.id}>
            {w === 2 && <path d={`${d} L${X(n)},${Y(0)} L${X(0)},${Y(0)} Z`} fill={c} className="area" style={{ animationDelay: '700ms' }} />}
            {w === 2 && <path d={d} fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" className="halo" style={{ animationDelay: '500ms' }} />}
            <path d={d} pathLength={1} fill="none" stroke={c} strokeWidth={w === 2 ? 4 : 1.6} strokeLinecap="round" strokeLinejoin="round" opacity={w ? 1 : 0.8} className="line" style={{ animationDelay: delay }} />
          </g>
        )
      })}
      {drawn.filter((s) => weight(s) > 0).map((s) => {
        const v = s.pts[n - 1]
        const c = color(s.p)
                return (
          <g key={s.p.id} className="endmark">
            <circle cx={X(n)} cy={Y(v)} r={5.5} fill={c} stroke="#0d1440" strokeWidth={2} />
            <text x={X(n) - 9} y={Y(v) - 8} textAnchor="end" className="endname" fill={c}>Yo</text>
          </g>
        )
      })}
    </svg>
  )
}
