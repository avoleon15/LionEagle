// Sound effects made by the game itself with the Web Audio API (no files). They are in the spirit of classic
// arcade and console games (square-wave pings, rising arpeggios, noise whooshes) but they are our own notes
// and timings, not copies of any particular game's jingles.

const KEY = 'leon.sound'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === 'off'
  } catch {
    return false
  }
})()
const listeners = new Set<() => void>()

type Wave = OscillatorType

function audio(): { c: AudioContext; out: GainNode } | null {
  if (muted) return null
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = 0.22
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return { c: ctx, out: master! }
  } catch {
    return null
  }
}

/** One note: `freq` Hz for `dur` seconds starting `at` seconds from now, optionally gliding to `to` Hz. */
function tone(freq: number, at: number, dur: number, wave: Wave = 'square', vol = 0.5, to?: number) {
  const a = audio()
  if (!a) return
  const t = a.c.currentTime + at
  const osc = a.c.createOscillator()
  const g = a.c.createGain()
  osc.type = wave
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(a.out)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** A burst of filtered noise (wind, whoosh), its filter sweeping from `from` to `to` Hz. */
function noise(at: number, dur: number, from: number, to: number, vol = 0.3) {
  const a = audio()
  if (!a) return
  const t = a.c.currentTime + at
  const len = Math.max(1, Math.floor(a.c.sampleRate * dur))
  const buf = a.c.createBuffer(1, len, a.c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = a.c.createBufferSource()
  src.buffer = buf
  const filter = a.c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(from, t)
  filter.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = a.c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.15, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(g).connect(a.out)
  src.start(t)
}

const N: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760, C7: 2093,
}
const run = (names: string[], step: number, dur = step * 0.9, wave: Wave = 'square', vol = 0.4, from = 0) =>
  names.forEach((n, i) => tone(N[n], from + i * step, dur, wave, vol))

export const sfx = {
  /** Browsers only start audio after a tap or key press: any first interaction unlocks it. */
  unlock() {
    audio()
  },

  /** A valid answer. The rarer it is, the longer and brighter the reward. */
  correct(points: number) {
    if (points >= 100) {
      // "one in a million": a rising fanfare with a sparkle on top
      run(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.07, 0.1, 'square', 0.4)
      tone(N.C7, 0.46, 0.5, 'triangle', 0.5)
      tone(N.G6, 0.46, 0.5, 'square', 0.25)
      for (let i = 0; i < 5; i++) tone(N.C7 * (1 + i * 0.12), 0.7 + i * 0.06, 0.08, 'sine', 0.25)
    } else if (points >= 80) {
      run(['E5', 'G5', 'B5', 'E6', 'G6'], 0.075, 0.1, 'square', 0.4)
      tone(N.B5, 0.4, 0.35, 'triangle', 0.4)
    } else if (points >= 60) {
      run(['C5', 'E5', 'G5', 'C6'], 0.08, 0.1, 'square', 0.4)
      tone(N.E6, 0.34, 0.25, 'triangle', 0.35)
    } else if (points >= 30) {
      run(['G5', 'C6', 'E6'], 0.07, 0.09, 'square', 0.4)
    } else {
      // common answer: a two-note "ping", low then high
      tone(N.A5, 0, 0.07, 'square', 0.4)
      tone(N.E6, 0.07, 0.22, 'square', 0.4)
    }
  },

  /** An answer that is not on the list: a short, soft "bonk" that slides down. */
  wrong() {
    tone(190, 0, 0.16, 'sawtooth', 0.35, 90)
    tone(150, 0.12, 0.2, 'square', 0.2, 70)
  },

  /** Last seconds of a round: quick beeps. */
  tick(last = false) {
    if (last) tone(N.A6, 0, 0.35, 'square', 0.3)
    else tone(N.A5, 0, 0.07, 'square', 0.28)
  },

  /** "Did you mean...?": a soft, curious two-note sound, nothing like the wrong-answer bonk. */
  maybe() {
    tone(620, 0, 0.08, 'sine', 0.28)
    tone(830, 0.08, 0.14, 'sine', 0.28)
  },

  /** Somebody else locked in an answer. */
  pop() {
    tone(660, 0, 0.05, 'sine', 0.22, 880)
  },

  /** The character climbs: a glide upwards for as long as the climb lasts, with a few sparkles. */
  climb(seconds: number) {
    tone(260, 0, seconds, 'triangle', 0.22, 1500)
    noise(0, seconds, 500, 3000, 0.08)
    const n = Math.max(3, Math.round(seconds * 3))
    for (let i = 0; i < n; i++) tone(900 + i * (900 / n), (i / n) * seconds, 0.05, 'sine', 0.12)
  },

  /** Start of a game: three short beeps and a higher long one. */
  start() {
    ;[0, 0.28, 0.56].forEach((t) => tone(N.A4, t, 0.14, 'square', 0.3))
    tone(N.A5, 0.84, 0.5, 'square', 0.35)
  },

  /** Take-off at the end: a rocket that roars and rises. */
  launch() {
    noise(0, 2.4, 200, 4000, 0.45)
    tone(70, 0, 2.4, 'sawtooth', 0.25, 700)
  },

  /** Final ranking: a fanfare if you won, a sad slide if not. */
  finish(won: boolean) {
    if (won) {
      run(['G4', 'C5', 'E5', 'G5'], 0.12, 0.14, 'square', 0.4)
      tone(N.E5, 0.52, 0.12, 'square', 0.35)
      tone(N.G5, 0.66, 0.12, 'square', 0.35)
      tone(N.C6, 0.8, 0.7, 'square', 0.4)
      tone(N.E6, 0.8, 0.7, 'triangle', 0.3)
    } else {
      tone(N.G4, 0, 0.18, 'triangle', 0.4, N.F4)
      tone(N.E4, 0.2, 0.18, 'triangle', 0.4, N.D4)
      tone(N.C4, 0.4, 0.6, 'triangle', 0.4, 130)
    }
  },

  /** Buttons and menus. */
  click() {
    tone(880, 0, 0.04, 'square', 0.2)
    tone(1320, 0.04, 0.05, 'square', 0.2)
  },
}

export const isMuted = () => muted
export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(KEY, m ? 'off' : 'on')
  } catch {
    /* the choice just is not remembered */
  }
  if (!m) sfx.click()
  listeners.forEach((l) => l())
}
export const onMutedChange = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
