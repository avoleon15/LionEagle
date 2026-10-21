import { useEffect, useRef } from 'react'
import type { Avatar } from '../../shared/protocol'
import { climbValue, type Climb } from './climb'
import { AVATAR_H, AVATAR_W, avatarSprite } from './pixel/avatar'
import { drawText, textWidth } from './pixel/font'
import { MAX_SCORE, buildWorld, cloudSprite, drawStars, loadGamePicture, rng, type GamePicture, type World } from './pixel/world'

// The game backdrop: one tall pixel-art column (ground, sky, space) that fills the whole screen. Only the
// player's own character is drawn; the camera follows it as it climbs. Everything is drawn at a tiny
// logical resolution (240 px tall, like a handheld console screen) and scaled up with nearest-neighbour.

const H0 = 240
const TIER_COLOR: Record<number, string> = { 10: '#ffffff', 30: '#ffffff', 60: '#8ee06a', 80: '#7fd0ff', 100: '#ffd23f' }

interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface Cloud { x: number; y: number; speed: number; sprite: HTMLCanvasElement }

interface Props {
  avatar: Avatar
  climb: Climb
  /** Where the feet sit on screen, as a share of its height (lower when a box covers the middle). */
  focus: number
  /** The game is over: the character takes off into space. */
  launch: boolean
}

export function Scene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const latest = useRef(props)
  latest.current = props

  useEffect(() => {
    const el = wrap.current!
    const cv = canvas.current!
    let W = 160
    let H = H0
    let world: World | null = null
    let picture: GamePicture | null = null
    let pictureWide = false
    let clouds: Cloud[] = []
    let particles: Particle[] = []
    let cam = -1
    let seenClimb: Climb | null = null
    let popup: { text: string; color: string; at: number } | null = null
    let burstAt = 0
    let burstTier = 0
    let launchAt = 0
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
      const scale = Math.max(1, Math.floor(ch / H0))
      const nw = Math.ceil(cw / scale)
      const nh = Math.ceil(ch / scale)
      cv.width = nw
      cv.height = nh
      cv.style.width = `${nw * scale}px`
      cv.style.height = `${nh * scale}px`
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
      loadGamePicture(wide).then((found) => {
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
      if (g && world) draw(g, nowMs, now, dt)
      raf = requestAnimationFrame(frame)
    }

    const draw = (g: CanvasRenderingContext2D, nowMs: number, now: number, dt: number) => {
      const w = world!
      const { avatar, climb, focus, launch } = latest.current
      const worldH = w.canvas.height

      // a new climb: "+points" when it starts, sparkles when it ends
      if (climb !== seenClimb) {
        if (seenClimb && climb.to > climb.from) {
          const pts = Math.round(climb.to - climb.from)
          const tier = Math.min(100, pts)
          popup = { text: `+${pts}`, color: TIER_COLOR[tier] ?? '#ffffff', at: climb.start }
          burstAt = climb.start + climb.dur
          burstTier = tier
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

      const x = Math.round(W / 2)
      const top = Math.round(footY - AVATAR_H - camY)
      // shadow on the grass while close to the ground
      const height = w.footLow - footY
      if (height < 40) {
        const sw = Math.max(4, Math.round(12 - height / 5))
        g.fillStyle = 'rgba(0,0,0,0.28)'
        const sy = Math.round(w.footLow - camY)
        g.fillRect(x - Math.floor((sw - 4) / 2), sy - 1, sw - 4, 1)
        g.fillRect(x - Math.floor(sw / 2), sy, sw, 1)
        g.fillRect(x - Math.floor((sw - 4) / 2), sy + 1, sw - 4, 1)
      }
      if (rising && Math.floor(now * 24) % 2 === 0) {
        particles.push({ x: x + (Math.random() - 0.5) * 10, y: top + AVATAR_H, vx: (Math.random() - 0.5) * 8, vy: 18, life: 0, max: 0.6, color: '#ffffff', size: 1 })
      }
      if (lift > 0) {
        const f = Math.floor(now * 20) % 2
        g.fillStyle = '#ffd23f'; g.fillRect(x - 2, top + AVATAR_H, 4, 3 + f)
        g.fillStyle = '#ff7a1a'; g.fillRect(x - 1, top + AVATAR_H + 3 + f, 2, 3)
        if (Math.floor(now * 30) % 2 === 0) particles.push({ x, y: top + AVATAR_H + 3, vx: (Math.random() - 0.5) * 14, vy: 20, life: 0, max: 0.45, color: '#ffe9a8', size: 1 })
      }
      if (top > -AVATAR_H) g.drawImage(avatarSprite(avatar), x - AVATAR_W / 2, top)

      if (burstAt && nowMs >= burstAt) {
        burstAt = 0
        const count = burstTier >= 100 ? 28 : burstTier >= 80 ? 16 : burstTier >= 60 ? 10 : 6
        const colors = burstTier >= 100 ? ['#ffd23f', '#fff6c2', '#ffffff'] : burstTier >= 80 ? ['#7fd0ff', '#d6f0ff'] : ['#8ee06a', '#d6ffc2', '#ffffff']
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2 + (i % 3) * 0.3
          const sp = 25 + (i % 5) * 9
          particles.push({ x, y: top + AVATAR_H / 2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 12, life: 0, max: 0.7 + (i % 4) * 0.12, color: colors[i % colors.length], size: burstTier >= 100 && i % 4 === 0 ? 2 : 1 })
        }
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
      g.globalAlpha = 1
      particles = particles.filter((p) => p.life < p.max)
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
    </div>
  )
}
