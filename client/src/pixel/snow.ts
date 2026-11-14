import { rng, type World } from './world'

// The Christmas layer: effects drawn by code over the Christmas pictures, so the picture stays the same pixel art and the scene reacts
// when a character passes. For now only the first three pieces of the map (ground, mountains and the Eiffel Tower, sky) have it:
//   - snow falls everywhere in them; every character pushes the flakes aside (more while it climbs) and leaves a wake
//   - piece 1 (ground): snow is kicked up when a character takes off
//   - piece 2 (mountains and tower): the ornaments and the lights of the tower flash when a character passes them, and a trail of ice crystals follows
//   - piece 3 (sky): clouds of snow puff out to both sides and the wind swirls around the character
// Everything is drawn in the scene's own pixels (whole pixels only), and the pictures are never touched.

/** How many of the bottom pieces have effects. */
export const EFFECT_PIECES = 3

export interface Actor {
  key: string
  x: number // centre, in scene pixels
  foot: number // y of the feet in the world
  height: number // height of the character
  rising: boolean
}

interface Flake { x: number; y: number; vx: number; vy: number; far: boolean; phase: number; fade: number }
interface Puff { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string }
interface Crystal { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string }

const SNOW_COLORS = ['#ffffff', '#ffffff', '#f2f9ff']
const CRYSTAL_COLORS = ['#ffffff', '#bfe3f5', '#ffe58a', '#ffffff']

/** The ornaments hanging from the clouds and the lights of the tower in piece 2 of the portrait map, as shares of that piece (x from the left, y from the top). */
const ORNAMENTS = [
  [0.07, 0.305], [0.123, 0.311], [0.056, 0.415], [0.878, 0.311], [0.93, 0.305], [0.948, 0.482],
  [0.844, 0.554], [0.826, 0.564], [0.873, 0.564], [0.838, 0.632], [0.818, 0.678], [0.877, 0.677], [0.807, 0.697], [0.819, 0.741], [0.901, 0.736],
] as const

const step = (a: number) => Math.ceil(Math.max(0, Math.min(1, a)) * 4) / 4 // fades in quarters, so it stays chunky

export class ChristmasLayer {
  private flakes: Flake[] = []
  private puffs: Puff[] = []
  private crystals: Crystal[] = []
  private before = new Map<string, boolean>() // was each character rising in the last frame
  private lit: number[] = ORNAMENTS.map(() => -1) // until when each ornament flashes
  private r = rng(11)
  private actors: Actor[] = []

  /** Called by the scene every frame while the characters are placed: the effects of this frame use them. */
  setActors(actors: Actor[]) {
    this.actors = actors
  }

  draw(g: CanvasRenderingContext2D, w: World, wide: boolean, W: number, H: number, camY: number, dt: number, now: number) {
    if (w.theme !== 'navidad' || w.pieces < 2) return
    const worldH = w.canvas.height
    const zoneOf = (y: number) => Math.floor((worldH - y) / w.pieceH)
    // snow all over the first pieces, fading out where the effects end
    const camZone = (worldH - (camY + H / 2)) / w.pieceH
    const intensity = Math.max(0, Math.min(1, (EFFECT_PIECES + 0.4 - camZone) / 1.2))
    this.flakesStep(g, W, H, dt, now, intensity)

    const r = this.r
    for (const a of this.actors) {
      const zone = zoneOf(a.foot - a.height / 2)
      if (zone < 0 || zone >= EFFECT_PIECES) {
        this.before.set(a.key, a.rising)
        continue
      }
      const sx = a.x
      const sy = a.foot - a.height / 2 - camY
      const was = this.before.get(a.key) ?? false
      this.before.set(a.key, a.rising)
      if (sy < -40 || sy > H + 40) continue
      const power = a.rising ? 2.6 : 1
      // the wind: flakes near the character are pushed away, and a climbing one drags the air up behind it
      const R = zone === 2 ? 26 : 20
      for (const f of this.flakes) {
        const dx = f.x - sx
        const dy = f.y - sy
        const d2 = dx * dx + dy * dy
        if (d2 > R * R || d2 < 0.5) continue
        const d = Math.sqrt(d2)
        const k = (1 - d / R) * (1 - d / R) * power * (zone === 2 ? 1.5 : 1)
        f.vx += (dx / d) * k * 90 * dt
        f.vy += (dy / d) * k * 40 * dt - (a.rising && dy > 0 ? k * 70 * dt : 0)
        if (zone === 2) f.vx += (-dy / d) * k * 50 * dt // swirl
      }
      const feetY = a.foot - camY
      if (zone === 0) {
        // piece 1: snow kicked up from the ground as it takes off
        if (a.rising && !was) {
          for (let i = 0; i < 16; i++) this.puff(sx + (r() - 0.5) * 8, feetY, (r() - 0.5) * 70, -r() * 34 - 6, 0.5 + r() * 0.5, r() < 0.4 ? 3 : 2)
        } else if (a.rising && Math.floor(now * 30) % 2 === 0 && w.footLow - a.foot < 60) {
          this.puff(sx + (r() - 0.5) * 8, feetY, (r() - 0.5) * 36, r() * 12, 0.5 + r() * 0.4, 2)
        }
      } else if (zone === 1) {
        // piece 2: ice crystals trailing behind it, and the lights that flash when it passes
        if (a.rising && r() < dt * 22) {
          this.crystals.push({ x: sx + (r() - 0.5) * 14, y: sy + (r() - 0.2) * 12, vx: (r() - 0.5) * 8, vy: 4 + r() * 8, life: 0, max: 0.7 + r() * 0.5, color: CRYSTAL_COLORS[Math.floor(r() * 4)] })
        }
        if (!wide) {
          const top = worldH - 2 * w.pieceH // top of piece 2
          ORNAMENTS.forEach(([nx, ny], i) => {
            const wy = top + ny * w.pieceH
            if (Math.abs(a.foot - a.height / 2 - wy) < a.height * 0.9 && this.lit[i] < now) this.lit[i] = now + 1
          })
        }
      } else {
        // piece 3: puffs of snow-cloud out to both sides
        if (a.rising && r() < dt * 26) {
          const side = r() < 0.5 ? -1 : 1
          this.puff(sx + side * (4 + r() * 8), sy + (r() - 0.5) * 16, side * (14 + r() * 26), (r() - 0.5) * 10, 0.9 + r() * 0.6, r() < 0.5 ? 4 : 3)
        }
      }
    }

    if (this.puffs.length > 320) this.puffs.splice(0, this.puffs.length - 320)
    if (this.crystals.length > 200) this.crystals.splice(0, this.crystals.length - 200)

    for (const p of this.puffs) {
      p.life += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= Math.exp(-1.6 * dt)
      p.vy *= Math.exp(-1.2 * dt)
      g.globalAlpha = step(1 - p.life / p.max)
      g.fillStyle = p.color
      g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
    }
    for (const c of this.crystals) {
      c.life += dt
      c.x += c.vx * dt
      c.y += c.vy * dt
      const u = c.life / c.max
      g.globalAlpha = step(1 - u)
      g.fillStyle = c.color
      const x = Math.round(c.x)
      const y = Math.round(c.y)
      g.fillRect(x, y, 1, 1)
      if (Math.floor(c.life * 14) % 2 === 0) {
        g.fillRect(x - 1, y, 3, 1)
        g.fillRect(x, y - 1, 1, 3)
      }
    }
    // the flashing ornaments and lights (portrait pieces only: their places are known)
    if (!wide) {
      const top = worldH - 2 * w.pieceH
      this.lit.forEach((until, i) => {
        const left = until - now
        if (left <= 0 || left > 1) return
        const [nx, ny] = ORNAMENTS[i]
        const x = Math.round(w.stripX + nx * w.stripW)
        const y = Math.round(top + ny * w.pieceH - camY)
        if (y < -8 || y > H + 8) return
        const blink = Math.floor(now * 14 + i) % 2 === 0
        g.globalAlpha = step(left)
        g.fillStyle = blink ? '#ffffff' : '#ffe58a'
        g.fillRect(x - 3, y, 7, 1)
        g.fillRect(x, y - 3, 1, 7)
        g.fillStyle = blink ? '#ffe58a' : '#ffffff'
        g.fillRect(x - 1, y - 1, 3, 3)
      })
    }
    g.globalAlpha = 1
    this.puffs = this.puffs.filter((p) => p.life < p.max)
    this.crystals = this.crystals.filter((c) => c.life < c.max)
  }

  private puff(x: number, y: number, vx: number, vy: number, max: number, size: number) {
    this.puffs.push({ x, y, vx, vy, life: 0, max, size, color: SNOW_COLORS[Math.floor(this.r() * SNOW_COLORS.length)] })
  }

  private flakesStep(g: CanvasRenderingContext2D, W: number, H: number, dt: number, now: number, intensity: number) {
    const r = this.r
    const target = Math.round((W * H) / 650 * intensity)
    while (this.flakes.length < target && r() < 0.5) {
      const far = r() < 0.75
      this.flakes.push({ x: r() * W, y: this.flakes.length < target * 0.6 ? r() * H : -2, vx: 0, vy: far ? 7 + r() * 6 : 14 + r() * 10, far, phase: r() * 6, fade: 1 })
    }
    for (let i = this.flakes.length - 1; i >= 0; i--) {
      const f = this.flakes[i]
      const base = f.far ? 8 : 16
      f.vx *= Math.exp(-1.8 * dt)
      f.vy += (base - f.vy) * Math.min(1, dt * 1.5)
      f.x += (f.vx + Math.sin(now * 1.3 + f.phase) * (f.far ? 3 : 6)) * dt
      f.y += f.vy * dt
      if (f.x < -3) f.x += W + 6
      if (f.x > W + 3) f.x -= W + 6
      if (f.y > H + 2 || (this.flakes.length > target + 4 && r() < dt * 2)) {
        if (this.flakes.length > target) this.flakes.splice(i, 1)
        else {
          f.y = -2
          f.x = r() * W
          f.vx = 0
        }
        continue
      }
      g.globalAlpha = f.far ? 0.75 : 1
      g.fillStyle = f.far ? '#eaf6ff' : '#ffffff'
      const s = f.far ? 1 : 2
      g.fillRect(Math.round(f.x), Math.round(f.y), s, s)
    }
    g.globalAlpha = 1
  }
}
