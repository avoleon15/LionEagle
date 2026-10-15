import { useEffect, useRef } from 'react'
import type { GameView, PlayerView } from '../../shared/protocol'
import { AVATAR_H, AVATAR_W, avatarSprite } from './pixel/avatar'
import { drawText, textWidth } from './pixel/font'
import { eagleSprite, lionSprite, rockSprite } from './pixel/mascots'
import { Painter } from './pixel/paint'

// The ascent scene: everything is drawn at a tiny logical resolution and scaled up with
// nearest-neighbour filtering, so every "pixel" is a crisp square.

const H0 = 240 // target logical height; the real size follows the container so the sky always fills it
const GROUND = 40
const MAX_SCORE = 700
const FOOT_DROP = 14 // how far into the grass the characters' feet stand
const SKY = ['#17235f', '#1f3590', '#2a4ba8', '#3862c0', '#4f7fd3', '#6c9ee2', '#8ab9ec', '#a8d0f2', '#c4e3f6', '#dcf0f8', '#eef6e2', '#fbf1c8']
const TIER_COLOR: Record<number, string> = { 10: '#ffffff', 30: '#ffffff', 60: '#8ee06a', 80: '#7fd0ff', 100: '#ffd23f' }
/** In the final scene everybody launches off the top, lowest score first, winner last. */
const LAUNCH_START = 0.8
const LAUNCH_GAP = 0.5

interface Actor {
  from: number
  to: number
  shown: number
  t0: number
  launchAt: number | null
  lift: number
  gone: boolean
}
interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface Popup { id: string; text: string; t0: number; color: string }
interface Cloud { x: number; y: number; speed: number; sprite: HTMLCanvasElement }
interface Sim {
  actors: Map<string, Actor>
  particles: Particle[]
  popups: Popup[]
  events: { at: number; fn: () => void }[]
  clouds: Cloud[]
  W: number
  H: number
  bg: HTMLCanvasElement | null
  pos: Map<string, { x: number; y: number }> // where each character was drawn last frame
  revealRound: number
  finalHandled: boolean
  synced: boolean
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ease = (u: number) => 1 - Math.pow(1 - u, 3)

function cloudSprite(w: number, h: number, seed: number): HTMLCanvasElement {
  const p = new Painter(w, h)
  const r = rng(seed)
  const base = h - 3
  const n = Math.max(3, Math.floor(w / 9))
  for (let i = 0; i < n; i++) {
    const rad = 3 + r() * (h / 2 - 3)
    p.disc(5 + (i * (w - 10)) / (n - 1), base - rad + 1, rad, '#ffffff')
  }
  p.rect(3, base - 2, w - 6, 3, '#ffffff')
  p.g.globalCompositeOperation = 'source-atop'
  p.rect(0, h - 4, w, 2, '#d3e4f7')
  p.rect(0, h - 2, w, 2, '#b9d0ec')
  p.g.globalCompositeOperation = 'source-over'
  return p.canvas
}

function skyColor(y: number, groundTop: number) {
  return SKY[Math.min(SKY.length - 1, Math.floor((y / groundTop) * SKY.length))]
}

function buildBackground(W: number, H: number): HTMLCanvasElement {
  const p = new Painter(W, H)
  const g = p.g
  const { groundTop } = geo(H)
  const band = groundTop / SKY.length
  SKY.forEach((c, i) => p.rect(0, Math.floor(i * band), W, Math.ceil(band) + 1, c))
  // dithered band edges
  for (let i = 1; i < SKY.length; i++) {
    const y = Math.floor(i * band)
    for (let x = 0; x < W; x++) {
      if ((x & 1) === 0) p.px(x, y - 1, SKY[i])
      if ((x & 1) === 1) p.px(x, y + 1, SKY[i - 1])
    }
  }
  // moon
  p.disc(W - 26, 26, 8, '#fff4c2')
  p.disc(W - 23, 24, 7, skyColor(24, groundTop))
  // far and near hills
  for (let x = 0; x < W; x++) {
    const far = 14 + Math.sin(x * 0.045) * 5 + Math.sin(x * 0.12 + 1) * 3
    p.rect(x, groundTop - Math.round(far), 1, Math.round(far) + 2, '#6fb87a')
    const near = 7 + Math.sin(x * 0.07 + 2) * 3 + Math.sin(x * 0.19) * 1.5
    p.rect(x, groundTop - Math.round(near), 1, Math.round(near) + 2, '#58a85a')
  }
  // grass and dirt
  p.rect(0, groundTop, W, 14, '#4aa63a')
  p.rect(0, groundTop, W, 2, '#8ee06a')
  p.rect(0, groundTop + 10, W, 4, '#3f8f31')
  p.rect(0, groundTop + 14, W, GROUND - 14, '#8a5a35')
  p.rect(0, groundTop + 14, W, 2, '#6d4526')
  const r = rng(11)
  for (let i = 0; i < W / 3; i++) {
    const x = Math.floor(r() * W)
    const y = groundTop + 18 + Math.floor(r() * (GROUND - 20))
    p.rect(x, y, r() > 0.6 ? 2 : 1, 1, r() > 0.5 ? '#a8723f' : '#6d4526')
  }
  for (let i = 0; i < W / 5; i++) {
    const x = Math.floor(r() * W)
    const y = groundTop + 2 + Math.floor(r() * 9)
    p.px(x, y, '#2f7a2a'); p.px(x, y - 1, '#2f7a2a')
    if (r() > 0.7) p.px(x + 1, y - 2, r() > 0.5 ? '#ffd23f' : '#ff7aa8')
  }
  g.globalAlpha = 1
  return p.canvas
}

export function Scene({ players, game, me }: { players: PlayerView[]; game: GameView; me: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const latest = useRef({ players, game, me })
  latest.current = { players, game, me }
  const sim = useRef<Sim>({
    actors: new Map(), particles: [], popups: [], events: [], clouds: [], W: 180, H: H0, bg: null, pos: new Map(),
    revealRound: -1, finalHandled: false, synced: false,
  })

  // Sync the simulation with the latest server state.
  useEffect(() => {
    const s = sim.current
    const now = performance.now() / 1000
    const ids = new Set(players.map((p) => p.id))
    for (const id of [...s.actors.keys()]) if (!ids.has(id)) s.actors.delete(id)
    for (const p of players) {
      const score = game.scores[p.id] ?? 0
      let a = s.actors.get(p.id)
      if (!a) {
        a = { from: score, to: score, shown: score, t0: now, launchAt: null, lift: 0, gone: false }
        s.actors.set(p.id, a)
      } else if (a.to !== score) {
        a.from = a.shown
        a.to = score
        a.t0 = now
      }
    }

    if (game.stage === 'reveal' && game.reveal && s.revealRound !== game.round) {
      s.revealRound = game.round
      if (s.synced) {
        for (const res of game.reveal.results) {
          if (res.points <= 0 || !ids.has(res.playerId)) continue
          const tier = res.points
          s.popups.push({ id: res.playerId, text: `+${tier}`, t0: now + 0.9, color: TIER_COLOR[tier] ?? '#fff' })
          s.events.push({ at: now + 1.1, fn: () => burst(s, res.playerId, tier) })
        }
      }
    }

    if (game.stage === 'final' && !s.finalHandled) {
      s.finalHandled = true
      if (!s.synced) {
        for (const a of s.actors.values()) a.gone = true // joined after the show: nothing to launch
      } else {
        const order = [...players].sort((x, y) => (game.scores[x.id] ?? 0) - (game.scores[y.id] ?? 0))
        order.forEach((p, i) => {
          const a = s.actors.get(p.id)
          if (a) a.launchAt = now + LAUNCH_START + i * LAUNCH_GAP
        })
      }
    }
    s.synced = true
  }, [players, game])

  useEffect(() => {
    const el = wrap.current!
    const cv = canvas.current!
    const s = sim.current
    let scale = 1
    let raf = 0
    let last = performance.now() / 1000

    const resize = () => {
      const cw = el.clientWidth
      const ch = el.clientHeight
      if (!cw || !ch) return
      scale = ch / H0
      if (scale >= 2) scale = Math.floor(scale)
      const W = Math.max(150, Math.min(360, Math.floor(cw / scale)))
      const H = Math.max(200, Math.min(380, Math.floor(ch / scale)))
      s.W = W
      s.H = H
      cv.width = W
      cv.height = H
      cv.style.width = `${W * scale}px`
      cv.style.height = `${H * scale}px`
      s.bg = buildBackground(W, H)
      const r = rng(5)
      const kinds = [cloudSprite(34, 14, 1), cloudSprite(24, 10, 2), cloudSprite(48, 17, 3)]
      s.clouds = Array.from({ length: 8 }, (_, i) => ({
        x: r() * W,
        y: 12 + r() * (H - GROUND - 70),
        speed: 2 + r() * 6,
        sprite: kinds[i % kinds.length],
      }))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const frame = () => {
      const now = performance.now() / 1000
      const dt = Math.min(0.05, now - last)
      last = now
      step(s, now, dt)
      const g = cv.getContext('2d')!
      g.imageSmoothingEnabled = false
      draw(g, s, now, latest.current)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="scene" ref={wrap}>
      <canvas ref={canvas} role="img" aria-label="Los jugadores suben al cielo según sus puntos" />
    </div>
  )
}

// ---- geometry ----

function geo(H: number) {
  const groundTop = H - GROUND
  const footY0 = groundTop + FOOT_DROP
  return { groundTop, footY0, climb: footY0 - AVATAR_H - 16 } // climb = pixels between the ground and the highest spot
}

const riseOf = (score: number, climb: number) => (Math.min(MAX_SCORE, Math.max(0, score)) / MAX_SCORE) * climb

function laneX(i: number, n: number, W: number) {
  const usable = W - 30
  const spacing = Math.min(28, n > 1 ? usable / (n - 1) : 0)
  return W / 2 + (i - (n - 1) / 2) * spacing
}

// ---- simulation ----

function burst(s: Sim, id: string, tier: number) {
  const a = s.actors.get(id)
  if (!a) return
  const count = tier >= 100 ? 26 : tier >= 80 ? 14 : tier >= 60 ? 7 : 0
  const colors = tier >= 100 ? ['#ffd23f', '#fff6c2', '#ffffff'] : tier >= 80 ? ['#7fd0ff', '#d6f0ff'] : ['#8ee06a', '#d6ffc2']
  const { x, y } = s.pos.get(id) ?? { x: s.W / 2, y: s.H / 2 }
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + (i % 3) * 0.3
    const sp = 25 + (i % 5) * 9
    s.particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 12, life: 0, max: 0.7 + (i % 4) * 0.12, color: colors[i % colors.length], size: tier >= 100 && i % 4 === 0 ? 2 : 1 })
  }
}

function step(s: Sim, now: number, dt: number) {
  for (const [id, a] of s.actors) {
    const u = Math.min(1, (now - a.t0) / 1.3)
    a.shown = a.from + (a.to - a.from) * ease(Math.max(0, u))
    if (a.launchAt !== null && !a.gone && now >= a.launchAt) {
      const t = now - a.launchAt
      a.lift = 0.5 * 700 * t * t
      const at = s.pos.get(id)
      if (at && at.y < -AVATAR_H) {
        a.gone = true
        // a little pop at the top of the sky as they disappear
        for (let i = 0; i < 12; i++) {
          const ang = Math.PI * (0.1 + 0.8 * (i / 11))
          s.particles.push({ x: at.x, y: 3, vx: Math.cos(ang) * 30, vy: Math.sin(ang) * 30, life: 0, max: 0.8, color: i % 2 ? '#ffffff' : '#ffd23f', size: 1 })
        }
      }
    }
  }
  for (const ev of [...s.events]) {
    if (now >= ev.at) {
      s.events.splice(s.events.indexOf(ev), 1)
      ev.fn()
    }
  }
  for (const p of s.particles) {
    p.life += dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 70 * dt
  }
  s.particles = s.particles.filter((p) => p.life < p.max)
  s.popups = s.popups.filter((p) => now < p.t0 + 2.2)
  for (const c of s.clouds) {
    c.x += c.speed * dt
    if (c.x > s.W + 4) c.x = -c.sprite.width - 4
  }
}

// ---- drawing ----

function draw(g: CanvasRenderingContext2D, s: Sim, now: number, props: { players: PlayerView[]; game: GameView; me: string }) {
  const { players, game, me } = props
  const W = s.W
  const { groundTop, footY0, climb } = geo(s.H)
  if (s.bg) g.drawImage(s.bg, 0, 0)

  // twinkling stars in the dark upper sky
  const r = rng(7)
  for (let i = 0; i < 34; i++) {
    const x = Math.floor(r() * W)
    const y = 4 + Math.floor(r() * (groundTop * 0.5))
    const tw = Math.sin(now * (1.5 + (i % 5) * 0.4) + i)
    if (tw > -0.4) {
      g.fillStyle = tw > 0.7 ? '#ffffff' : '#9db8ff'
      g.fillRect(x, y, 1, 1)
      if (tw > 0.9 && i % 3 === 0) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3) }
    }
  }

  for (const c of s.clouds) g.drawImage(c.sprite, Math.round(c.x), Math.round(c.y))

  // mascots stand on the ground behind the players
  const lion = lionSprite()
  const eagle = eagleSprite()
  const rock = rockSprite()
  const bob = Math.sin(now * 1.6) > 0.55 ? 1 : 0
  g.drawImage(lion, 4, groundTop + 16 - lion.height - bob)
  const ex = W - eagle.width - 4
  g.drawImage(rock, ex + 13, groundTop + 15 - rock.height)
  g.drawImage(eagle, ex, groundTop + 15 - rock.height - eagle.height + 7 + (Math.sin(now * 1.3 + 2) > 0.6 ? 1 : 0))

  // players, lowest first so the ones nearer the ground are in front
  const n = players.length
  const pos = s.pos
  pos.clear()
  const drawn = players
    .map((p, i) => ({ p, i, a: s.actors.get(p.id) }))
    .filter((d) => d.a && !d.a.gone)
    .map((d) => {
      const a = d.a!
      const u = Math.min(1, (now - a.t0) / 1.3)
      const hop = a.to > a.from && u < 1 ? Math.sin(Math.PI * u) * 9 : 0
      const rise = riseOf(a.shown, climb) + hop + a.lift
      const stagger = (d.i % 2) * 3
      const x = Math.round(laneX(d.i, n, W))
      const floating = rise > 2
      const wob = floating && a.lift === 0 ? Math.round(Math.sin(now * 2.2 + d.i * 1.7) * 1.2) : 0
      const footY = footY0 + stagger - rise + wob
      return { ...d, x, footY, rise, stagger }
    })
    .sort((a, b) => b.footY - a.footY)

  for (const d of drawn) {
    // shadow on the ground
    const sw = Math.max(4, Math.round(12 - (d.rise / climb) * 6))
    g.fillStyle = 'rgba(0,0,0,0.28)'
    const sy = footY0 + d.stagger
    g.fillRect(d.x - Math.floor((sw - 4) / 2), sy - 1, sw - 4, 1)
    g.fillRect(d.x - Math.floor(sw / 2), sy, sw, 1)
    g.fillRect(d.x - Math.floor((sw - 4) / 2), sy + 1, sw - 4, 1)
  }

  for (const d of drawn) {
    const top = Math.round(d.footY - AVATAR_H)
    const left = d.x - AVATAR_W / 2
    pos.set(d.p.id, { x: d.x, y: top + AVATAR_H / 2 })

    if (d.a!.lift > 0) {
      // rocket flame while launching
      const f = Math.floor(now * 20) % 2
      g.fillStyle = '#ffd23f'; g.fillRect(d.x - 2, top + AVATAR_H, 4, 3 + f)
      g.fillStyle = '#ff7a1a'; g.fillRect(d.x - 1, top + AVATAR_H + 3 + f, 2, 3)
      if (Math.floor(now * 30) % 2 === 0) s.particles.push({ x: d.x, y: top + AVATAR_H + 3, vx: (Math.random() - 0.5) * 14, vy: 20, life: 0, max: 0.45, color: '#ffe9a8', size: 1 })
    }
    g.drawImage(avatarSprite(d.p.avatar), left, top)

    // name tag under the sprite
    const name = d.p.nick.length > 7 ? d.p.nick.slice(0, 7) : d.p.nick
    const isMe = d.p.id === me
    if (d.a!.lift === 0) {
      drawText(g, name, Math.round(d.x - textWidth(name) / 2), top + AVATAR_H + 3 + (d.i % 2) * 6, isMe ? '#ffd23f' : '#ffffff', '#1b1426')
    }
    // status above the head
    if (game.stage === 'answering' && game.answered.includes(d.p.id)) {
      const bx = d.x - 4, by = top - 11
      g.fillStyle = '#1b1426'; g.fillRect(bx - 1, by - 1, 10, 9)
      g.fillStyle = '#8ee06a'; g.fillRect(bx, by, 8, 7)
      g.fillStyle = '#1b1426'
      g.fillRect(bx + 1, by + 3, 1, 1); g.fillRect(bx + 2, by + 4, 1, 1); g.fillRect(bx + 3, by + 3, 1, 1)
      g.fillRect(bx + 4, by + 2, 1, 1); g.fillRect(bx + 5, by + 1, 1, 1)
    } else if (isMe && game.stage !== 'final' && d.a!.lift === 0) {
      const ay = top - 6 + (Math.floor(now * 3) % 2)
      g.fillStyle = '#1b1426'; g.fillRect(d.x - 3, ay - 1, 7, 3); g.fillRect(d.x - 2, ay + 2, 5, 1); g.fillRect(d.x - 1, ay + 3, 3, 1); g.fillRect(d.x, ay + 4, 1, 1)
      g.fillStyle = '#ffd23f'; g.fillRect(d.x - 2, ay, 5, 1); g.fillRect(d.x - 1, ay + 1, 3, 1); g.fillRect(d.x, ay + 2, 1, 1)
    }
  }

  // "+points" popups
  for (const pop of s.popups) {
    const at = pos.get(pop.id)
    const u = (now - pop.t0) / 1.3
    if (!at || u < 0 || u > 1.6) continue
    const y = Math.round(at.y - AVATAR_H / 2 - 12 - u * 12)
    drawText(g, pop.text, Math.round(at.x - textWidth(pop.text) / 2), y, pop.color, '#1b1426')
  }

  // particles
  for (const p of s.particles) {
    g.globalAlpha = Math.max(0, 1 - p.life / p.max)
    g.fillStyle = p.color
    g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
  }
  g.globalAlpha = 1
}
