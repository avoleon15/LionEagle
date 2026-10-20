import { useEffect, useRef, useState } from 'react'

// The player's own score is shown through a slow climb: when it goes up, the result is shown first
// (RESULT_MS), then the character rises and the number counts up together.

/** How long the "+80 Águila" card stays before the character starts to rise. */
export const RESULT_MS = 1600

export interface Climb {
  from: number
  to: number
  start: number // performance.now() ms
  dur: number
}

const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)

export function climbValue(c: Climb, now: number): number {
  if (now <= c.start) return c.from
  if (now >= c.start + c.dur) return c.to
  return c.from + (c.to - c.from) * easeInOut((now - c.start) / c.dur)
}

export const climbing = (c: Climb, now: number) => c.to !== c.from && now < c.start + c.dur

/** A slower climb for more points: 10 points ≈ 1.8 s, 100 points ≈ 4.2 s. */
const durationFor = (points: number) => 1500 + Math.min(150, Math.max(0, points)) * 27

/** Follows `score`: the first value is shown as is (a reload or a late join does not animate), increases climb. */
export function useClimb(score: number): Climb {
  const ref = useRef<Climb>({ from: score, to: score, start: 0, dur: 0 })
  const c = ref.current
  if (score !== c.to) {
    const now = performance.now()
    const shown = climbValue(c, now)
    ref.current =
      score > c.to
        ? { from: shown, to: score, start: now + RESULT_MS, dur: durationFor(score - shown) }
        : { from: score, to: score, start: now, dur: 0 }
  }
  return ref.current
}

/** Re-renders every `ms` and returns performance.now(). */
export function useNow(ms: number): number {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), ms)
    return () => clearInterval(id)
  }, [ms])
  return performance.now()
}
