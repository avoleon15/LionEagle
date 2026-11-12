import { useEffect, useRef } from 'react'
import type { Avatar, MapId } from '../../shared/protocol'
import { climbValue, durationFor, type Climb } from './climb'
import { AVATAR_H, AVATAR_W, avatarSprite } from './pixel/avatar'
import { drawText, textWidth } from './pixel/font'
import { MAX_SCORE, buildWorld, cloudSprite, drawStars, loadGamePicture, rng, type GamePicture, type World } from './pixel/world'

// The game backdrop: one tall pixel-art column (ground, sky, space) that fills the whole screen. Only the
// player's own character is drawn; the camera follows it as it climbs. Everything is drawn at a tiny
// logical resolution (240 px tall, like a handheld console screen) and scaled up with nearest-neighbour.

const H0 = 240

/**
 * On a phone the characters are drawn at about 75% so a full room does not crowd the screen. They are drawn on the screen-resolution
 * layer (not in the scene's coarse pixel grid) with every sprite pixel a whole number of device pixels, so they stay crisp.
 */
const PHONE_MAX_WIDTH = 600
const PHONE_BEAN = 0.75
const tinted = new WeakMap<HTMLCanvasElement, Map<string, HTMLCanvasElement>>()
/** A solid-colour copy of the sprite (its silhouette): the character flashes in gold when it gets a Rey León. */
function silhouette(src: HTMLCanvasElement, color: string): HTMLCanvasElement {
  let byColor = tinted.get(src)
  if (!byColor) tinted.set(src, (byColor = new Map()))
  const hit = byColor.get(color)
  if (hit) return hit
  const out = document.createElement('canvas')
  out.width = src.width
  out.height = src.height
  const og = out.getContext('2d')!
  og.drawImage(src, 0, 0)
  og.globalCompositeOperation = 'source-in'
  og.fillStyle = color
  og.fillRect(0, 0, out.width, out.height)
  byColor.set(color, out)
  return out
}
const GOLD_CONFETTI = ['#ffd23f', '#fff6c2', '#ffffff', '#ff9f1c', '#f4b942']
interface Confetti { x: number; y: number; vx: number; vy: number; g: number; delay: number; t: number; color: string; sway: number; freq: number; phase: number }
// The colour of each score, the same as in the ranking table (--t10 ... --t100 in styles.css), and a lighter tone of it for the sparks.
const TIER_COLOR: Record<number, string> = { 10: '#7fe0ff', 30: '#5b8cff', 60: '#7be35a', 80: '#c77dff', 100: '#ffd23f' }
const TIER_LIGHT: Record<number, string> = { 10: '#d6f6ff', 30: '#b9ccff', 60: '#d2f7c4', 80: '#e8ccff', 100: '#fff6c2' }
/** The score tier of a gain of `pts` points (10, 30, 60, 80 or 100). */
const tierOf = (pts: number) => [100, 80, 60, 30, 10].find((t) => pts >= t) ?? 10

interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface Cloud { x: number; y: number; speed: number; sprite: HTMLCanvasElement }

/** Another player of the room: drawn in the background at the height of their score. */
export interface Other { id: string; avatar: Avatar; nick: string; score: number }

interface Props {
  avatar: Avatar
  /** The background of this game (the same for every player). */
  map: MapId
  nick: string
  others: Other[]
  climb: Climb
  /** Where the feet sit on screen, as a share of its height (lower when a box covers the middle). */
  focus: number
  /** The game is over: the character takes off into space. */
  launch: boolean
}

export function Scene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const tagCanvas = useRef<HTMLCanvasElement>(null)
  const latest = useRef(props)
  latest.current = props

  useEffect(() => {
    const el = wrap.current!
    const cv = canvas.current!
    const tv = tagCanvas.current!
    let sc = 1 // screen pixels per logical pixel
    let tags: { name: string; cx: number; top: number; mine?: boolean }[] = []
    let W = 160
    let H = H0
    let world: World | null = null
    let picture: GamePicture | null = null
    let pictureWide = false
    let clouds: Cloud[] = []
    let particles: Particle[] = []
    let cam = -1
    let beanPx = 0 // device pixels per sprite pixel on a phone (0 = drawn in the scene like on a computer)
    let beanDpr = 1
    let AW: number = AVATAR_W // size of the characters in scene pixels
    let AH: number = AVATAR_H
    let crowdRow = 0 // with many players the characters stand in staggered rows: which row yours is in, and how much each row stands higher
    let rowGap = 0
    let sprites: { img: HTMLCanvasElement; cx: number; top: number }[] = [] // phone: characters to draw on the screen layer
    let seenClimb: Climb | null = null
    let popup: { text: string; color: string; at: number } | null = null
    let burstAt = 0
    let burstTier = 0
    let trail = ['#ffffff'] // colours of the sparks that come off the rocket while the character climbs
    let confetti: Confetti[] = [] // the golden confetti of a Rey León
    let goldMine = { from: 0, to: 0 } // while your character blinks gold: from the moment you get a Rey León until a moment after its confetti
    const burstedFor = new Map<string, number>() // for each other player, the climb whose end already had its burst
    let launchAt = 0
    // Each other player rises on their own, as soon as their score goes up (nobody waits for a result card but you).
    const flights = new Map<string, Climb>()
    let raf = 0
    let last = performance.now()
    let alive = true

    const build = () => {
      world = buildWorld(W, H, picture)
      const r = rng(5)
      const kinds = [cloudSprite(34, 14, 1), cloudSprite(24, 10, 2), cloudSprite(48, 17, 3)]
      const h = world.canvas.height
      clouds = picture
        ? []
        : Array.from({ length: Math.round(h / 90) }, (_, i) => ({ x: r() * W, y: h * 0.35 + r() * h * 0.5, speed: 2 + r() * 5, sprite: kinds[i % 3] }))
      cam = -1
    }

    const resize = () => {
      const cw = el.clientWidth
      const ch = el.clientHeight
      if (!cw || !ch) return
      // One scene pixel is a whole number of DEVICE pixels (on a phone with a screen ratio such as 2.625 a whole number of css pixels
      // would be uneven blocks of device pixels, and the pixel art looks ragged); with whole ratios (1, 2, 3) nothing changes.
      const ratio = window.devicePixelRatio || 1
      const scale = Math.max(1, Math.round(Math.max(1, Math.floor(ch / H0)) * ratio)) / ratio
      const nw = Math.ceil(cw / scale)
      const nh = Math.ceil(ch / scale)
      cv.width = nw
      cv.height = nh
      cv.style.width = `${nw * scale}px`
      cv.style.height = `${nh * scale}px`
      sc = scale
      beanDpr = window.devicePixelRatio || 1
      beanPx = cw < PHONE_MAX_WIDTH ? Math.max(1, Math.round(scale * PHONE_BEAN * beanDpr)) : 0
      AW = beanPx ? (AVATAR_W * beanPx) / beanDpr / scale : AVATAR_W
      AH = beanPx ? (AVATAR_H * beanPx) / beanDpr / scale : AVATAR_H
      const dpr = window.devicePixelRatio || 1
      tv.width = Math.round(cw * dpr)
      tv.height = Math.round(ch * dpr)
      tv.style.width = `${cw}px`
      tv.style.height = `${ch}px`
      if (nw !== W || nh !== H || !world) {
        W = nw
        H = nh
        build()
      }
      const wide = cw > ch * 1.1
      if (wide !== pictureWide) load(wide)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    // A picture made outside the code replaces the drawn column when it exists.
    function load(wide: boolean) {
      pictureWide = wide
      loadGamePicture(wide, latest.current.map).then((found) => {
        if (!alive || !found || wide !== pictureWide) return
        picture = found
        build()
      })
    }
    load(el.clientWidth > el.clientHeight * 1.1)

    const frame = () => {
      const nowMs = performance.now()
      const now = nowMs / 1000
      const dt = Math.min(0.05, (nowMs - last) / 1000)
      last = nowMs
      const g = cv.getContext('2d')
      tags = []
      sprites = []
      if (g && world) draw(g, nowMs, now, dt)
      drawTags()
      raf = requestAnimationFrame(frame)
    }

    /** Draws a character with its feet at `top + AH`: in the scene, or (phone) queued for the sharp screen layer. */
    const putBean = (g: CanvasRenderingContext2D, img: HTMLCanvasElement, cx: number, top: number) => {
      if (beanPx) sprites.push({ img, cx, top })
      else g.drawImage(img, cx - Math.floor(AW / 2), top)
    }

    /** The sprite, or its gold silhouette (blinking light and dark gold) for 0.8 s after a Rey León. */
    const GOLD_AFTER_MS = 800
    const goldFlash = (sprite: HTMLCanvasElement, from: number, to: number, nowMs: number) => {
      if (nowMs < from || nowMs > to) return sprite
      return silhouette(sprite, Math.floor(((nowMs - from) / 1000) * 14) % 2 ? '#fff6c2' : '#ffd23f')
    }

    /** The sparks at the end of a climb, in the colour of the score; a "Rey León" (100) is golden confetti and the character blinks gold from the moment it is earned. */
    const burst = (x: number, y: number, tier: number, nowMs: number) => {
      const color = TIER_COLOR[tier] ?? '#ffffff'
      const light = TIER_LIGHT[tier] ?? '#ffffff'
      if (tier >= 100) {
        // golden confetti falls over the whole screen, and some more jumps out of the character
        const fall = Math.round(W * 0.5)
        for (let i = 0; i < fall; i++) {
          confetti.push({ x: Math.random() * W, y: -Math.random() * H * 0.2 - 4, vx: 0, vy: H / (2.6 + Math.random() * 1.6), g: 0, delay: Math.random() * 0.8, t: 0, color: GOLD_CONFETTI[i % GOLD_CONFETTI.length], sway: 5 + Math.random() * 8, freq: 3 + Math.random() * 3, phase: Math.random() * 6 })
        }
        for (let i = 0; i < 18; i++) {
          confetti.push({ x, y, vx: (Math.random() - 0.5) * 80, vy: -(60 + Math.random() * 50), g: 130, delay: 0, t: 0, color: GOLD_CONFETTI[i % GOLD_CONFETTI.length], sway: 0, freq: 6, phase: Math.random() * 6 })
        }
        if (confetti.length > 500) confetti = confetti.slice(-500)
        return
      }
      const count = tier >= 80 ? 22 : tier >= 60 ? 16 : tier >= 30 ? 12 : 8
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + (i % 3) * 0.3
        const sp = 25 + (i % 5) * 9
        particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 12, life: 0, max: 0.7 + (i % 4) * 0.12, color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? light : color, size: 1 })
      }
    }

    const draw = (g: CanvasRenderingContext2D, nowMs: number, now: number, dt: number) => {
      const w = world!
      const { avatar, nick, others, climb, focus, launch } = latest.current
      const worldH = w.canvas.height

      // a new climb: "+points" when it starts, sparkles when it ends
      if (climb !== seenClimb) {
        if (seenClimb && climb.to > climb.from) {
          const pts = Math.round(climb.to - climb.from)
          const tier = tierOf(pts)
          popup = { text: `+${pts}`, color: TIER_COLOR[tier] ?? '#ffffff', at: climb.start }
          burstAt = climb.start + climb.dur
          burstTier = tier
          if (tier >= 100) goldMine = { from: climb.start, to: climb.start + climb.dur + GOLD_AFTER_MS }
          trail = [TIER_COLOR[tier] ?? '#ffffff', TIER_LIGHT[tier] ?? '#ffffff']
        }
        seenClimb = climb
      }

      const score = climbValue(climb, nowMs)
      const footBase = w.footLow - (Math.min(MAX_SCORE, Math.max(0, score)) / MAX_SCORE) * (w.footLow - w.footHigh)
      if (launch && !launchAt) launchAt = now + 0.9
      if (!launch) launchAt = 0
      const t = launchAt && now > launchAt ? now - launchAt : 0
      const lift = 0.5 * 420 * t * t
      const rising = nowMs > climb.start && nowMs < climb.start + climb.dur
      const floating = score > 2 && !rising && !lift
      const bob = floating ? Math.round(Math.sin(now * 2.2) * 1.2) : 0
      const footY = footBase - lift + bob

      // camera: keeps the feet at `focus` of the screen, eased
      // The camera stays where the character stood: at the end it only flies up and off the screen, the view never travels.
      const target = Math.max(0, Math.min(worldH - H, footBase - H * focus))
      cam = cam < 0 ? target : cam + (target - cam) * Math.min(1, dt * 3.5)
      const camY = Math.round(cam)

      g.imageSmoothingEnabled = false
      g.drawImage(w.canvas, 0, camY, W, H, 0, 0, W, H)
      if (!w.picture) drawStars(g, W, 0, worldH, camY, H, now)
      for (const c of clouds) {
        c.x += c.speed * dt
        if (c.x > W + 4) c.x = -c.sprite.width - 4
        const sy = Math.round(c.y - camY)
        if (sy > -20 && sy < H + 4) g.drawImage(c.sprite, Math.round(c.x), sy)
      }

      drawOthers(g, others, nowMs, now, camY)

      const x = Math.round(W / 2)
      const top = Math.round(footY - AH - camY - crowdRow * rowGap)
      // shadow on the grass while close to the ground
      const height = w.footLow - footY
      if (height < 40) {
        const sw = Math.max(4, Math.round(12 - height / 5))
        g.fillStyle = 'rgba(0,0,0,0.28)'
        const sy = Math.round(w.footLow - camY - crowdRow * rowGap)
        g.fillRect(x - Math.floor((sw - 4) / 2), sy - 1, sw - 4, 1)
        g.fillRect(x - Math.floor(sw / 2), sy, sw, 1)
        g.fillRect(x - Math.floor((sw - 4) / 2), sy + 1, sw - 4, 1)
      }
      if (rising && Math.floor(now * 24) % 2 === 0) {
        particles.push({ x: x + (Math.random() - 0.5) * 10, y: top + AH, vx: (Math.random() - 0.5) * 8, vy: 18, life: 0, max: 0.6, color: trail[Math.floor(Math.random() * trail.length)], size: burstTier >= 100 ? 2 : 1 })
      }
      if (lift > 0) {
        const f = Math.floor(now * 20) % 2
        g.fillStyle = '#ffd23f'; g.fillRect(x - 2, top + AH, 4, 3 + f)
        g.fillStyle = '#ff7a1a'; g.fillRect(x - 1, top + AH + 3 + f, 2, 3)
        if (Math.floor(now * 30) % 2 === 0) particles.push({ x, y: top + AH + 3, vx: (Math.random() - 0.5) * 14, vy: 20, life: 0, max: 0.45, color: '#ffe9a8', size: 1 })
      }
      if (top > -AH) {
        putBean(g, goldFlash(avatarSprite(avatar), goldMine.from, goldMine.to, nowMs), x, top)
        tags.push({ name: nick.length > 14 ? nick.slice(0, 14) : nick, cx: x, top, mine: true })
      }

      if (burstAt && nowMs >= burstAt) {
        burstAt = 0
        burst(x, top + AH / 2, burstTier, nowMs)
      }
      if (popup) {
        const u = (nowMs - popup.at) / 1000
        if (u > 2.4) popup = null
        else if (u >= 0) drawText(g, popup.text, Math.round(x - textWidth(popup.text) / 2), Math.round(top - 10 - Math.min(u, 1.2) * 8), popup.color, '#1b1426')
      }

      for (const p of particles) {
        p.life += dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 70 * dt
        g.globalAlpha = Math.max(0, 1 - p.life / p.max)
        g.fillStyle = p.color
        g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }
      // golden confetti: falls swaying and flips as it turns
      for (const c of confetti) {
        c.t += dt
        if (c.t < c.delay) continue
        c.vy += c.g * dt
        c.y += c.vy * dt
        c.x += c.vx * dt + Math.sin(c.phase + c.t * c.freq) * c.sway * dt
        const flip = Math.sin(c.phase + c.t * 8) > 0
        g.fillStyle = c.color
        g.fillRect(Math.round(c.x), Math.round(c.y), flip ? 2 : 3, flip ? 3 : 2)
      }
      confetti = confetti.filter((c) => c.y < H + 6)
      g.globalAlpha = 1
      particles = particles.filter((p) => p.life < p.max)
    }

    /**
     * The names above the other characters, written in real screen pixels so that they can be small (the pixel font of the scene
     * cannot get below 3x5 logical pixels, which is large). A name that would run into another is moved up, or left out.
     */
    const drawTags = () => {
      const g = tv.getContext('2d')
      if (!g) return
      const dpr = tv.width / (tv.clientWidth || 1)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, tv.clientWidth, tv.clientHeight)
      if (sprites.length) {
        g.imageSmoothingEnabled = false
        const px = beanPx / dpr // css pixels per sprite pixel
        const snap = (v: number) => Math.round(v * dpr) / dpr
        for (const b of sprites) g.drawImage(b.img, snap(b.cx * sc - (AVATAR_W * px) / 2), snap(b.top * sc), AVATAR_W * px, AVATAR_H * px)
        g.imageSmoothingEnabled = true
      }
      const fs = Math.max(8, Math.round(sc * 2.2))
      g.font = `600 ${fs}px "Pixelify Sans", monospace`
      g.textBaseline = 'alphabetic'
      g.lineJoin = 'round'
      g.lineWidth = 3
      g.strokeStyle = '#1b1426'
      g.fillStyle = '#ffffff'
      const taken: [number, number, number, number][] = []
      // yours first: it always gets its place and the others move around it
      for (const t of [...tags].sort((p, q) => Number(!!q.mine) - Number(!!p.mine))) {
        g.font = `${t.mine ? 700 : 600} ${t.mine ? fs + 1 : fs}px "Pixelify Sans", monospace`
        const tw = g.measureText(t.name).width
        const x = Math.max(2, Math.min(tv.clientWidth - tw - 2, t.cx * sc - tw / 2))
        const clash = (y: number) => taken.some(([l, tp, r, b]) => x < r + 2 && x + tw > l - 2 && y - fs < b && y > tp)
        let y = t.top * sc - 4
        if (!t.mine) for (let tries = 0; tries < 3 && clash(y); tries++) y -= fs + 3
        if (y - fs < 0 || (!t.mine && clash(y))) continue
        g.globalAlpha = t.mine ? 1 : 0.92
        g.strokeStyle = t.mine ? '#000000' : '#1b1426'
        g.fillStyle = t.mine ? '#ffd23f' : '#ffffff'
        g.lineWidth = t.mine ? 3.5 : 3
        g.strokeText(t.name, x, y)
        g.fillText(t.name, x, y)
        taken.push([x, y - fs, x + tw, y])
      }
      g.globalAlpha = 1
    }

    /** The other characters stand behind yours, fully opaque, spread to both sides of the centre. */
    const drawOthers = (g: CanvasRenderingContext2D, others: Other[], nowMs: number, now: number, camY: number) => {
      const w = world!
      // Everybody gets a place across the width (the middle one is yours); the more players, the closer they stand.
      const total = others.length + 1
      const places = Array.from({ length: total }, (_, j) => (total === 1 ? 0.5 : 0.08 + (0.84 * j) / (total - 1)))
      let mid = 0
      places.forEach((v, j) => { if (Math.abs(v - 0.5) < Math.abs(places[mid] - 0.5)) mid = j })
      const slots = places.filter((_, j) => j !== mid)
      // When the characters would stand on top of each other (many players on a narrow screen) they go in 2 or 3 staggered rows:
      // the back rows stand a little higher and are drawn first, so everybody stays visible.
      const spacing = total > 1 ? (W * 0.84) / (total - 1) : W
      const rows = Math.min(3, Math.max(1, Math.ceil((AW + 1) / spacing)))
      rowGap = rows > 1 ? Math.round(AH * 0.3) : 0
      crowdRow = mid % rows
      const rowOf = (i: number) => (i < mid ? i : i + 1) % rows
      const order = others.map((_, i) => i).sort((a, b) => rowOf(b) - rowOf(a))
      order.forEach((i) => {
        const o = others[i]
        let f = flights.get(o.id)
        if (!f) flights.set(o.id, (f = { from: o.score, to: o.score, start: 0, dur: 0 }))
        if (o.score !== f.to) {
          const shown = climbValue(f, nowMs)
          f = o.score > f.to ? { from: shown, to: o.score, start: nowMs, dur: durationFor(o.score - shown) } : { from: o.score, to: o.score, start: nowMs, dur: 0 }
          flights.set(o.id, f)
        }
        const score = climbValue(f, nowMs)
        const foot = w.footLow - (Math.min(MAX_SCORE, Math.max(0, score)) / MAX_SCORE) * (w.footLow - w.footHigh) - rowOf(i) * rowGap
        const rising = nowMs > f.start && nowMs < f.start + f.dur
        const gain = f.to - f.from
        const tier = tierOf(gain)
        const bob = score > 2 && !rising ? Math.round(Math.sin(now * 2 + i * 1.7) * 1.2) : 0
        const cx = Math.round(W * slots[i])
        const top = Math.round(foot - AH - camY + bob)
        if (top > H || top < -AH) return
        putBean(g, goldFlash(avatarSprite(o.avatar), tier >= 100 ? f.start : 0, tier >= 100 ? f.start + f.dur + GOLD_AFTER_MS : 0, nowMs), cx, top)
        tags.push({ name: o.nick.length > 8 ? o.nick.slice(0, 8) : o.nick, cx, top })
        if (rising && Math.floor(now * 24 + i) % 3 === 0) particles.push({ x: cx + (Math.random() - 0.5) * 8, y: top + AH, vx: (Math.random() - 0.5) * 6, vy: 16, life: 0, max: 0.5, color: Math.random() < 0.5 ? TIER_COLOR[tier] : TIER_LIGHT[tier], size: tier >= 100 ? 2 : 1 })
        // when their climb ends on screen: the sparks of their score (an explosion for a Rey León)
        if (gain > 0 && f.dur > 0 && nowMs >= f.start + f.dur && nowMs - (f.start + f.dur) < 1500 && burstedFor.get(o.id) !== f.start) {
          burstedFor.set(o.id, f.start)
          burst(cx, top + AH / 2, tier, nowMs)
        }
      })
      for (const id of flights.keys()) if (!others.some((o) => o.id === id)) flights.delete(id)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="scene" ref={wrap}>
      <canvas ref={canvas} role="img" aria-label="Tu personaje sube al cielo según tus puntos" />
      <canvas ref={tagCanvas} className="tags" aria-hidden />
    </div>
  )
}
