import { Painter } from './paint'
import { rng } from './world'

// The title screen's background drawn entirely by code: a snowy Christmas night in pixel art. Static layers are painted once (the sky,
// and the land in front of it); on top of them, things move every frame: an aurora that waves behind the mountains, twinkling stars,
// a shooting star now and then, Santa's sleigh crossing the sky, chimney smoke, the lights of the cabin, the tree and the lamp, sparkles
// on the snow and falling snow in three depths. Everything is drawn in the scene's own logical pixels (about 240 px tall, enlarged with
// nearest-neighbour), so it stays sharp at any screen size.

const NIGHT = ['#070d33', '#0d1850', '#16266e', '#20398e', '#2f51aa', '#4b6fc2', '#7591d2', '#a9bde3', '#d9d3e3']
const LIGHTS = ['#ff4d5e', '#ffd23f', '#5be37a', '#4cc9f0', '#ff9ad1']
const SNOW = { top: '#ffffff', a: '#edf3fc', b: '#d5e2f4', c: '#b4c8e6', d: '#8fa7d1' }
const WARM = '#ffe1a0'

/** `n` colours going smoothly through the given ones. */
function blend(colors: string[], n: number): string[] {
  const rgb = colors.map((c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)])
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * (rgb.length - 1)
    const a = Math.floor(t)
    const b = Math.min(rgb.length - 1, a + 1)
    const f = t - a
    return '#' + [0, 1, 2].map((k) => Math.round(rgb[a][k] + (rgb[b][k] - rgb[a][k]) * f).toString(16).padStart(2, '0')).join('')
  })
}

interface Light { x: number; y: number; size: number; phase: number; colors: string[]; speed: number }
interface Flake { x: number; y: number; vy: number; depth: 0 | 1 | 2; phase: number }
interface Puff { x: number; y: number; life: number; max: number; vx: number }

export class XmasHome {
  readonly W: number
  readonly H: number
  private sky: HTMLCanvasElement
  private moon: HTMLCanvasElement | null = null
  private land: HTMLCanvasElement
  private lights: Light[] = []
  private stars: Light[] = []
  private sparkles: Light[] = []
  private windows: { x: number; y: number; w: number; h: number }[] = []
  private flakes: Flake[] = []
  private smoke: Puff[] = []
  private chimneys: [number, number][] = []
  private lamp: [number, number] | null = null
  private star: [number, number] | null = null
  private sleigh: HTMLCanvasElement
  private sleighIn = 3 // seconds until the next pass of the sleigh
  private sleighT = -1
  private sleighY = 0
  private shootIn = 6
  private shoot: { x: number; y: number; t: number } | null = null
  private auroraTop = 0
  private horizon = 0
  private r = rng(77)
  private smokeClock = 0

  constructor(W: number, H: number) {
    this.W = W
    this.H = H
    this.sleigh = sleighSprite()
    this.sky = this.buildSky()
    this.land = this.buildLand()
    const r = this.r
    const count = Math.round((W * H) / 520)
    for (let i = 0; i < count; i++) {
      const depth = (r() < 0.45 ? 0 : r() < 0.7 ? 1 : 2) as 0 | 1 | 2
      this.flakes.push({ x: r() * W, y: r() * H, vy: [5, 10, 17][depth] + r() * 4, depth, phase: r() * 6 })
    }
    this.sleighY = H * 0.08 + r() * H * 0.1
  }

  // ---------------------------------------------------------------- the sky: bands, stars and the moon

  private buildSky(): HTMLCanvasElement {
    const { W, H } = this
    const p = new Painter(W, H)
    const r = rng(5)
    const groundTop = H - 30
    this.horizon = groundTop - 8
    const colors = blend(NIGHT, 22)
    const band = this.horizon / colors.length
    colors.forEach((c, i) => p.rect(0, Math.floor(i * band), W, Math.ceil(band) + 2, c))
    // a two-row checkered edge between bands, so the gradient reads smooth but stays pixel art
    for (let i = 1; i < colors.length; i++) {
      const y = Math.floor(i * band)
      for (let x = 0; x < W; x++) {
        if ((x + y) % 2 === 0) p.px(x, y - 1, colors[i])
        else p.px(x, y, colors[i - 1])
      }
    }
    p.rect(0, this.horizon, W, H - this.horizon, colors[colors.length - 1])
    this.auroraTop = Math.round(H * 0.1)

    // stars: many still ones, and some that twinkle (drawn every frame)
    for (let i = 0; i < (W * H) / 150; i++) {
      const x = Math.floor(r() * W)
      const y = Math.floor(Math.pow(r(), 1.6) * this.horizon * 0.75)
      const bright = r()
      p.px(x, y, bright > 0.8 ? '#ffffff' : bright > 0.4 ? '#c6d4ff' : '#7f93d6')
      if (i % 6 === 0) this.stars.push({ x, y, size: 1, phase: r() * 6, colors: ['#ffffff', '#fff3b0', '#c6d4ff'], speed: 1.5 + r() * 2 })
    }

    // the moon with two dithered halos, on its own layer so the aurora passes behind it
    const m = new Painter(W, H)
    const narrow = W < 220
    const mx = Math.round(W * (narrow ? 0.8 : 0.82))
    const my = Math.round(H * (narrow ? 0.09 : 0.15))
    const mr = Math.max(9, Math.min(15, Math.round(H / 20)))
    for (let y = -mr - 9; y <= mr + 9; y++) {
      for (let x = -mr - 9; x <= mr + 9; x++) {
        const d = Math.sqrt(x * x + y * y)
        if (d > mr + 1 && d <= mr + 4 && (x + y) % 2 === 0) m.px(mx + x, my + y, '#5d78c6')
        else if (d > mr + 4 && d <= mr + 8 && (x + y) % 4 === 0) m.px(mx + x, my + y, '#3d58a8')
      }
    }
    m.disc(mx, my, mr, '#fff4c8')
    m.disc(mx - 1, my - 1, mr - 2, '#fffae6')
    // the shadowed edge and the craters
    for (let y = -mr; y <= mr; y++) {
      for (let x = -mr; x <= mr; x++) {
        const d = Math.sqrt(x * x + y * y)
        if (d <= mr && d > mr - 2 && x + y > 0) m.px(mx + x, my + y, '#f0dfa2')
      }
    }
    const crater = (cx: number, cy: number, cr: number) => {
      m.disc(mx + cx * mr, my + cy * mr, cr, '#ecdba0')
      m.px(Math.round(mx + cx * mr - cr / 2), Math.round(my + cy * mr - cr / 2), '#fffae6')
    }
    crater(0.3, 0.25, 2.4); crater(-0.35, -0.3, 1.8); crater(-0.15, 0.5, 1.4); crater(0.45, -0.35, 1.2)
    this.moon = m.canvas
    return p.canvas
  }

  // ---------------------------------------------------------------- the land: mountains, forest, village, cabin, tree, snowman

  private buildLand(): HTMLCanvasElement {
    const { W, H } = this
    const p = new Painter(W, H)
    const r = rng(9)
    const narrow = W < 220
    const groundTop = H - 30
    const horizon = this.horizon
    const k = Math.max(1, H / 230)

    // far mountains: dark faces away from the moon (on the right), lit faces toward it, snowy peaks
    const range = (base: number, amp: number, seed: number, body: string, lit: string, dark: string, snow: string) => {
      const tops: number[] = []
      for (let x = 0; x < W; x++) {
        const t = base - k * amp * (0.55 + 0.25 * Math.sin(x * 0.037 + seed) + 0.14 * Math.sin(x * 0.093 + seed * 2) + 0.06 * Math.sin(x * 0.21 + seed * 3))
        tops.push(Math.round(t))
      }
      for (let x = 0; x < W; x++) {
        const top = tops[x]
        const slope = (tops[Math.min(W - 1, x + 1)] - tops[Math.max(0, x - 1)]) / 2
        p.rect(x, top, 1, base - top + 2, body)
        // faces turned to the moon get a light band, the others a dark one
        if (slope > 0.15) p.rect(x, top + 2, 1, Math.max(3, Math.round((base - top) * 0.55)), lit)
        else if (slope < -0.15) p.rect(x, top + 2, 1, Math.max(3, Math.round((base - top) * 0.45)), dark)
        const cap = 3 + Math.round(2 * Math.sin(x * 0.7 + seed)) + (top < base - k * amp * 0.75 ? 3 : 0)
        p.rect(x, top, 1, Math.max(1, cap), snow)
        if (x % 2 === 0 && cap > 2) p.px(x, top + cap, snow)
      }
    }
    range(horizon + 2, 70, 1, '#3a4f8a', '#5a72b0', '#2b3d72', '#dfe8f8')
    range(horizon + 4, 44, 4, '#4e66a3', '#6f88c4', '#3b5190', '#f2f6fd')

    // a band of far pine forest along the horizon
    for (let x = -2; x < W + 2; x += 3) {
      const h = 5 + Math.round(3 * Math.abs(Math.sin(x * 0.31)) + r() * 3)
      const base = horizon + 4
      for (let j = 0; j < h; j++) p.rect(x - Math.floor(j / 2.4), base - h + j, 1 + Math.floor(j / 1.2), 1, j % 3 === 0 ? '#2a4a72' : '#223c63')
    }
    // the snowy field in front of the forest
    for (let x = 0; x < W; x++) {
      const top = Math.round(horizon + 3 - 2.5 * Math.sin(x * 0.05 + 1) - 1.5 * Math.sin(x * 0.17))
      p.rect(x, top, 1, groundTop - top + 1, SNOW.b)
      p.px(x, top, SNOW.a)
    }

    // far village: little houses with lit windows (only where there is room)
    const village = narrow ? [0.62] : [0.2, 0.27, 0.68, 0.74]
    for (const f of village) {
      const hx = Math.round(W * f)
      const hy = horizon + 3
      p.rect(hx - 4, hy - 5, 9, 5, '#2c3f6e')
      p.poly([[hx - 5, hy - 5], [hx, hy - 9], [hx + 5, hy - 5]], '#e9f0fb')
      p.px(hx - 2, hy - 3, '#ffd27a'); p.px(hx + 2, hy - 3, '#ffd27a')
      this.windows.push({ x: hx - 2, y: hy - 3, w: 1, h: 1 }, { x: hx + 2, y: hy - 3, w: 1, h: 1 })
    }

    // mid-distance pines with snow
    const cabinX = narrow ? -8 : Math.round(W * 0.06)
    const treeX = narrow ? W - 14 : Math.round(W * 0.85)
    const pine = (cx: number, base: number, h: number) => {
      const tiers = h > 18 ? 4 : 3
      for (let i = 0; i < tiers; i++) {
        const y0 = base - h + Math.round((i * h * 0.72) / tiers)
        const y1 = y0 + Math.round(h * 0.38)
        const w = Math.round(h * 0.16 * (1 + i * 0.55)) + 1
        p.poly([[cx + 0.5, y0], [cx - w, y1], [cx + w + 1, y1]], '#123b34')
        p.poly([[cx + 0.5, y0], [cx + w + 1, y1], [cx + 1, y1]], '#1b5545')
        // snow resting on the tier
        p.rect(cx, y0, 1, 1, '#ffffff')
        for (let s = -w + 1; s <= w; s += 2) p.px(cx + s, y1 - 1 - (Math.abs(s) % 3 === 0 ? 1 : 0), Math.abs(s) % 4 === 1 ? '#ffffff' : '#dbe7f7')
      }
      p.rect(cx, base, 1, 2, '#3c2a1e')
    }
    const spots: number[] = []
    for (let i = 0; i < W / 14; i++) spots.push(Math.round(r() * W))
    for (const cx of spots.sort((a, b) => a - b)) {
      if (Math.abs(cx - (cabinX + 22)) < 26 || Math.abs(cx - treeX) < 20) continue
      pine(cx, horizon + 10 + Math.round(r() * 5), 12 + Math.round(r() * 12))
    }

    // the ground: soft drifts of snow with blue shadows
    p.rect(0, groundTop, W, H - groundTop, SNOW.a)
    for (let x = 0; x < W; x++) {
      const d1 = Math.round(1.6 * Math.sin(x * 0.11 + 0.5) + 1.2 * Math.sin(x * 0.043))
      p.rect(x, groundTop - 1 + d1, 1, 2, SNOW.top)
      const d2 = Math.round(groundTop + 10 + 2 * Math.sin(x * 0.07 + 2))
      p.rect(x, d2, 1, 2, SNOW.b)
      const d3 = Math.round(groundTop + 19 + 2 * Math.sin(x * 0.05 + 4))
      p.rect(x, d3, 1, H - d3, SNOW.c)
      if ((x + d3) % 2 === 0) p.px(x, d3 - 1, SNOW.c)
      const d4 = Math.round(groundTop + 25 + Math.sin(x * 0.09))
      p.rect(x, d4, 1, H - d4, SNOW.d)
      if ((x + d4) % 2 === 0) p.px(x, d4 - 1, SNOW.d)
    }
    for (let i = 0; i < W / 3; i++) {
      const x = Math.floor(r() * W)
      const y = groundTop + 2 + Math.floor(r() * 26)
      this.sparkles.push({ x, y, size: 1, phase: r() * 20, colors: ['#ffffff', '#cfe8ff'], speed: 0.6 + r() * 0.8 })
    }

    // the lamp post's pool of warm light on the snow (drawn before the things that stand in it)
    const lampX = narrow ? Math.round(W * 0.34) : Math.round(W * 0.3)
    warmPool(p, lampX, groundTop + 3, 16, 4)

    // ---- the cabin
    const cw = 46
    const cb = groundTop + 3 // its base
    const cx0 = cabinX
    warmPool(p, cx0 + 14, cb + 1, 14, 3)
    // chimney (behind the roof)
    p.rect(cx0 + 31, cb - 40, 6, 12, '#6b6f80')
    for (let y = cb - 39; y < cb - 28; y += 3) p.rect(cx0 + 31, y, 6, 1, '#575b6c')
    p.rect(cx0 + 30, cb - 42, 8, 3, '#ffffff')
    this.chimneys.push([cx0 + 33, cb - 43])
    // log walls
    p.rect(cx0 + 3, cb - 22, cw - 6, 22, '#7a4a2a')
    for (let y = cb - 21; y < cb; y += 3) {
      p.rect(cx0 + 3, y, cw - 6, 1, '#5c3520')
      p.rect(cx0 + 3, y + 1, cw - 6, 1, '#8c5833')
      p.px(cx0 + 2, y, '#9a6a42'); p.px(cx0 + cw - 3, y, '#9a6a42')
    }
    // roof (red under thick snow) with icicles
    p.poly([[cx0 - 2, cb - 22], [cx0 + cw / 2, cb - 40], [cx0 + cw + 2, cb - 22]], '#8a2f2a')
    p.poly([[cx0 + cw / 2, cb - 40], [cx0 + cw + 2, cb - 22], [cx0 + cw / 2 + 2, cb - 22]], '#6e2420')
    p.poly([[cx0 - 4, cb - 21], [cx0 + cw / 2, cb - 43], [cx0 + cw + 4, cb - 21], [cx0 + cw + 2, cb - 19], [cx0 + cw / 2, cb - 38], [cx0 - 2, cb - 19]], '#ffffff')
    p.poly([[cx0 + cw / 2, cb - 40], [cx0 + cw + 2, cb - 20], [cx0 + cw / 2 + 1, cb - 37]], '#dbe7f7')
    for (let x = cx0 - 1; x < cx0 + cw + 2; x += 3) {
      const len = 1 + ((x * 7) % 3)
      p.rect(x, cb - 19, 1, len, '#cfe6ff')
    }
    // windows with warm light and a wreath on the door
    const win = (x: number, y: number) => {
      p.rect(x - 1, y - 1, 11, 10, '#4a2a16')
      p.rect(x, y, 9, 8, '#ffd27a')
      p.rect(x, y, 9, 2, '#ffe9b0')
      p.rect(x + 4, y, 1, 8, '#4a2a16'); p.rect(x, y + 4, 9, 1, '#4a2a16')
      p.rect(x - 2, y + 8, 13, 2, '#ffffff')
      this.windows.push({ x, y, w: 9, h: 8 })
    }
    win(cx0 + 7, cb - 17)
    p.rect(cx0 + 26, cb - 15, 9, 15, '#4f2d12')
    p.rect(cx0 + 27, cb - 14, 7, 14, '#5e381a')
    p.px(cx0 + 32, cb - 7, '#ffd23f')
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2
      p.px(Math.round(cx0 + 30.5 + Math.cos(ang) * 3), Math.round(cb - 10 + Math.sin(ang) * 3), a % 4 === 0 ? '#3aa356' : '#1f7a3c')
    }
    p.px(cx0 + 30, cb - 7, '#d62839'); p.px(cx0 + 31, cb - 7, '#d62839')
    p.rect(cx0, cb - 1, cw, 3, '#ffffff')
    // lights along the edge of the roof
    for (let i = 0; i <= 10; i++) {
      const t = i / 10
      const x = Math.round(cx0 - 2 + t * (cw + 4))
      const y = Math.round(cb - 19 - (1 - Math.abs(t * 2 - 1)) * 18) + 1
      this.lights.push({ x, y, size: 1, phase: i * 0.7, colors: LIGHTS, speed: 1.4 })
    }

    // ---- the lamp post
    p.rect(lampX, groundTop - 26, 2, 28, '#2b2f3a')
    p.rect(lampX - 1, groundTop + 1, 4, 2, '#2b2f3a')
    p.rect(lampX - 3, groundTop - 33, 8, 1, '#2b2f3a')
    p.rect(lampX - 2, groundTop - 32, 6, 6, '#2b2f3a')
    p.rect(lampX - 1, groundTop - 31, 4, 4, '#ffe9a8')
    p.rect(lampX - 4, groundTop - 35, 10, 2, '#ffffff')
    p.rect(lampX - 3, groundTop - 26, 8, 1, '#2b2f3a')
    p.px(lampX - 3, groundTop - 25, '#d62839'); p.px(lampX + 4, groundTop - 25, '#d62839') // a little bow
    this.lamp = [lampX - 1, groundTop - 31]

    // ---- a wooden fence between the cabin and the lamp (wide screens)
    if (!narrow) {
      for (let x = cx0 + cw + 6; x < lampX - 6; x += 6) {
        p.rect(x, groundTop - 9, 2, 10, '#7a4a2a')
        p.rect(x, groundTop - 10, 2, 1, '#ffffff')
      }
      p.rect(cx0 + cw + 6, groundTop - 7, lampX - 12 - cx0 - cw, 1, '#8c5833')
      p.rect(cx0 + cw + 6, groundTop - 3, lampX - 12 - cx0 - cw, 1, '#8c5833')
      p.rect(cx0 + cw + 6, groundTop - 8, lampX - 12 - cx0 - cw, 1, '#ffffff')
    }

    // ---- footprints from the door into the field
    for (let i = 0; i < 9; i++) {
      const fx = cx0 + 30 + i * 6
      const fy = groundTop + 5 + Math.round(i * 1.2) + (i % 2) * 2
      p.rect(fx, fy, 2, 1, SNOW.c)
    }

    // ---- the snowman
    const sx = narrow ? Math.round(W * 0.6) : Math.round(W * 0.66)
    const sb = groundTop + 4
    snowman(p, sx, sb)

    // ---- the big tree with its presents
    const th = Math.round(Math.min(78, H * 0.3))
    const ty = groundTop + 4
    p.ellipse(treeX, ty + 1, 22, 3, SNOW.b)
    const tiers = 4
    for (let i = 0; i < tiers; i++) {
      const y0 = Math.round(ty - th + (i * th * 0.78) / tiers)
      const y1 = Math.round(y0 + th * 0.36)
      const w = Math.round(th * (0.11 + i * 0.075))
      // stepped edges so the tier reads as pixel art
      for (let y = y0; y <= y1; y++) {
        const half = Math.round(((y - y0) / (y1 - y0)) * w)
        p.rect(treeX - half, y, half * 2 + 1, 1, '#14532d')
        p.rect(treeX + 1, y, Math.max(0, half), 1, '#1f7a3c')
        if (half > 3) p.rect(treeX - half + 1, y, Math.max(1, Math.round(half * 0.35)), 1, '#2a8f48')
      }
      for (let s = -w; s <= w; s += 2) p.px(treeX + s, y1 + (Math.abs(s) % 4 === 0 ? 0 : 1), '#ffffff')
      p.rect(treeX - w, y1 + 1, w * 2 + 1, 1, '#0f3f22')
      // a golden garland across the tier and lights along it
      for (let g = 0; g <= w * 2; g += 2) {
        const gx = treeX - w + g
        const gy = Math.round(y0 + (y1 - y0) * 0.55 + (g / (w * 2)) * (y1 - y0) * 0.35)
        const half = Math.round(((gy - y0) / (y1 - y0)) * w)
        if (Math.abs(gx - treeX) <= half) p.px(gx, gy, '#ffd23f')
      }
      const n = 2 + i
      for (let j = 0; j < n; j++) {
        const t = (j + 0.5) / n
        const ly = Math.round(y0 + (y1 - y0) * (0.3 + 0.55 * ((j * 37) % 10) / 10))
        const half = Math.round(((ly - y0) / (y1 - y0)) * w)
        const lx = Math.round(treeX - half + t * half * 2)
        this.lights.push({ x: lx, y: ly, size: 2, phase: i * 1.3 + j, colors: LIGHTS, speed: 1.1 })
      }
      // round ornaments
      const oy = Math.round(y1 - 3)
      const ohalf = Math.round(((oy - y0) / (y1 - y0)) * w)
      p.disc(treeX - ohalf * 0.55, oy, 1.4, '#d62839'); p.px(Math.round(treeX - ohalf * 0.55) - 1, oy - 1, '#ff9aa5')
      p.disc(treeX + ohalf * 0.5, oy - 1, 1.4, '#4cc9f0'); p.px(Math.round(treeX + ohalf * 0.5) - 1, oy - 2, '#d6f4ff')
    }
    p.rect(treeX - 2, ty - 4, 5, 5, '#5a3a22')
    this.star = [treeX, Math.round(ty - th) - 3]
    const [stx, sty] = this.star
    p.rect(stx - 3, sty, 7, 1, '#ffd23f'); p.rect(stx, sty - 3, 1, 7, '#ffd23f'); p.rect(stx - 1, sty - 1, 3, 3, '#fff2a8')
    const gift = (x: number, w: number, h: number, c: string, shade: string, rb: string) => {
      const y = ty + 1 - h
      p.rect(x, y, w, h, c)
      p.rect(x + w - 2, y, 2, h, shade)
      p.rect(x + Math.floor(w / 2), y, 1, h, rb)
      p.rect(x, y + Math.floor(h / 2), w, 1, rb)
      p.px(x + Math.floor(w / 2) - 1, y - 1, rb); p.px(x + Math.floor(w / 2) + 1, y - 1, rb); p.px(x + Math.floor(w / 2), y - 1, rb)
    }
    gift(treeX - 19, 9, 7, '#d62839', '#a51d2c', '#ffd23f')
    gift(treeX - 9, 6, 5, '#f2f6fd', '#c9d9f0', '#d62839')
    gift(treeX + 6, 8, 9, '#2d8a3e', '#1f6b30', '#ffd23f')
    gift(treeX + 15, 6, 6, '#3b6fd4', '#2b52a6', '#ffffff')

    // ---- a sled with presents (wide screens)
    if (!narrow) {
      const sx2 = Math.round(W * 0.74)
      const sy2 = groundTop + 6
      p.rect(sx2, sy2, 16, 2, '#b8322d'); p.rect(sx2 + 1, sy2 - 2, 14, 2, '#d64a3f')
      p.rect(sx2 - 2, sy2 + 3, 20, 1, '#8a8f9c'); p.px(sx2 - 3, sy2 + 2, '#8a8f9c'); p.px(sx2 - 4, sy2 + 1, '#8a8f9c')
      p.rect(sx2 + 2, sy2 - 7, 6, 5, '#ffd23f'); p.rect(sx2 + 4, sy2 - 7, 1, 5, '#d62839')
      p.rect(sx2 + 9, sy2 - 6, 5, 4, '#5be37a'); p.rect(sx2 + 11, sy2 - 6, 1, 4, '#ffffff')
    }
    return p.canvas
  }

  // ---------------------------------------------------------------- every frame

  draw(g: CanvasRenderingContext2D, now: number, dt: number) {
    const { W, H } = this
    g.imageSmoothingEnabled = false
    g.drawImage(this.sky, 0, 0)
    this.drawAurora(g, now)
    if (this.moon) g.drawImage(this.moon, 0, 0)
    for (const s of this.stars) {
      const t = Math.sin(now * s.speed + s.phase)
      if (t < 0.2) continue
      g.fillStyle = s.colors[Math.floor((now + s.phase) % s.colors.length)]
      g.fillRect(s.x, s.y, 1, 1)
      if (t > 0.9) {
        g.fillRect(s.x - 1, s.y, 3, 1)
        g.fillRect(s.x, s.y - 1, 1, 3)
      }
    }
    this.drawShootingStar(g, dt)
    this.drawSleigh(g, now, dt)
    for (const f of this.flakes) if (f.depth === 0) this.flake(g, f, now, dt)
    g.drawImage(this.land, 0, 0)

    // warm windows flicker a little, like a fire inside
    for (const w of this.windows) {
      if (Math.sin(now * 3 + w.x) > 0.75) {
        g.fillStyle = '#ffc45c'
        g.fillRect(w.x, w.y + (w.h > 2 ? 2 : 0), w.w, Math.max(1, w.h > 2 ? 2 : 1))
      }
    }
    if (this.lamp) {
      const [lx, ly] = this.lamp
      g.fillStyle = Math.sin(now * 9) > 0.92 ? '#ffd27a' : '#fff4c8'
      g.fillRect(lx, ly, 4, 4)
    }
    this.drawSmoke(g, now, dt)
    // lights on the cabin and the tree step through their colours
    for (const l of this.lights) {
      const c = l.colors[Math.floor(now * l.speed + l.phase) % l.colors.length]
      g.fillStyle = c
      g.fillRect(l.x, l.y, l.size, l.size)
    }
    if (this.star) {
      const [sx, sy] = this.star
      const pulse = Math.floor(now * 3) % 3
      g.fillStyle = '#fff6c2'
      g.fillRect(sx - 1, sy - 1, 3, 3)
      if (pulse > 0) {
        g.fillStyle = '#ffe58a'
        g.fillRect(sx - 3 - pulse, sy, 2, 1); g.fillRect(sx + 2 + pulse, sy, 2, 1)
        g.fillRect(sx, sy - 3 - pulse, 1, 2); g.fillRect(sx, sy + 2 + pulse, 1, 2)
      }
    }
    for (const s of this.sparkles) {
      const t = Math.sin(now * s.speed + s.phase)
      if (t < 0.93) continue
      g.fillStyle = '#ffffff'
      g.fillRect(s.x, s.y, 1, 1)
      if (t > 0.985) { g.fillRect(s.x - 1, s.y, 3, 1); g.fillRect(s.x, s.y - 1, 1, 3) }
    }
    for (const f of this.flakes) if (f.depth > 0) this.flake(g, f, now, dt)
  }

  /** Green and teal curtains of light that wave slowly behind the mountains. */
  private drawAurora(g: CanvasRenderingContext2D, now: number) {
    const { W } = this
    const top = this.auroraTop
    for (let x = 0; x < W; x += 2) {
      const wave = Math.sin(x * 0.035 + now * 0.35) * 6 + Math.sin(x * 0.09 - now * 0.5) * 3
      const strength = 0.5 + 0.5 * Math.sin(x * 0.02 + now * 0.25)
      if (strength < 0.25) continue
      const y = Math.round(top + 10 + wave)
      const len = Math.round(6 + strength * 12)
      g.globalAlpha = strength > 0.7 ? 0.4 : 0.2
      g.fillStyle = '#4ff0b0'
      g.fillRect(x, y, 2, len)
      g.globalAlpha = strength > 0.7 ? 0.3 : 0.12
      g.fillStyle = '#9b7bff'
      g.fillRect(x, y - 3, 2, 3)
      g.fillStyle = '#2bd1c9'
      g.fillRect(x, y + len, 2, Math.round(len * 0.6))
    }
    g.globalAlpha = 1
  }

  private drawShootingStar(g: CanvasRenderingContext2D, dt: number) {
    this.shootIn -= dt
    if (!this.shoot && this.shootIn < 0) {
      this.shoot = { x: this.r() * this.W * 0.6, y: this.r() * this.H * 0.18, t: 0 }
      this.shootIn = 7 + this.r() * 9
    }
    if (!this.shoot) return
    const s = this.shoot
    s.t += dt
    const u = s.t / 0.9
    if (u >= 1) {
      this.shoot = null
      return
    }
    const x = s.x + u * 60
    const y = s.y + u * 22
    for (let k = 0; k < 10; k++) {
      g.globalAlpha = Math.ceil((1 - k / 10) * (1 - u) * 4) / 4
      g.fillStyle = k < 2 ? '#ffffff' : '#c6d4ff'
      g.fillRect(Math.round(x - k * 2.7), Math.round(y - k), 1, 1)
    }
    g.globalAlpha = 1
  }

  private drawSleigh(g: CanvasRenderingContext2D, now: number, dt: number) {
    const { W, H } = this
    if (this.sleighT < 0) {
      this.sleighIn -= dt
      if (this.sleighIn > 0) return
      this.sleighT = 0
      this.sleighY = H * 0.06 + this.r() * H * 0.12
    }
    this.sleighT += dt
    const u = this.sleighT / 13
    if (u >= 1) {
      this.sleighT = -1
      this.sleighIn = 14 + this.r() * 14
      return
    }
    const x = -this.sleigh.width - 8 + u * (W + this.sleigh.width + 16)
    const y = this.sleighY + Math.sin(u * 12) * 2
    // a trail of golden sparkles behind it
    for (let k = 1; k < 9; k++) {
      g.globalAlpha = Math.ceil((1 - k / 9) * 4) / 4
      g.fillStyle = k % 3 === 0 ? '#ffffff' : '#ffe58a'
      g.fillRect(Math.round(x - k * 3), Math.round(y + 11 + Math.sin(now * 10 + k) * 1.5), 1, 1)
    }
    g.globalAlpha = 1
    g.drawImage(this.sleigh, Math.round(x), Math.round(y))
  }

  private drawSmoke(g: CanvasRenderingContext2D, now: number, dt: number) {
    this.smokeClock += dt
    if (this.smokeClock > 0.5) {
      this.smokeClock = 0
      for (const [cx, cy] of this.chimneys) this.smoke.push({ x: cx, y: cy, life: 0, max: 3.6, vx: 2 + this.r() * 3 })
    }
    for (const s of this.smoke) {
      s.life += dt
      s.y -= 6.5 * dt
      s.x += s.vx * dt + Math.sin(now * 1.7 + s.life * 2) * 0.15
      const size = 2 + Math.floor(s.life * 1.2)
      g.globalAlpha = Math.ceil((1 - s.life / s.max) * 3) / 4
      g.fillStyle = s.life < 0.6 ? '#c9d2e3' : '#e3e9f4'
      g.fillRect(Math.round(s.x - size / 2), Math.round(s.y), size, size)
    }
    g.globalAlpha = 1
    this.smoke = this.smoke.filter((s) => s.life < s.max)
  }

  private flake(g: CanvasRenderingContext2D, f: Flake, now: number, dt: number) {
    f.y += f.vy * dt
    f.x += Math.sin(now * 1.1 + f.phase) * [2, 4, 7][f.depth] * dt
    if (f.y > this.H + 2) {
      f.y = -2
      f.x = this.r() * this.W
    }
    if (f.x < -2) f.x += this.W + 4
    if (f.x > this.W + 2) f.x -= this.W + 4
    g.fillStyle = f.depth === 0 ? '#8ea4d8' : f.depth === 1 ? '#dfe8f8' : '#ffffff'
    const s = f.depth === 2 ? 2 : 1
    g.fillRect(Math.round(f.x), Math.round(f.y), s, s)
  }
}

/** Warm light from a window or a lamp falling on the snow: a solid middle and a checkered edge. */
function warmPool(p: Painter, cx: number, cy: number, rx: number, ry: number) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry)
      if (d <= 0.35) p.px(cx + x, cy + y, WARM)
      else if (d <= 1 && (x + y) % 2 === 0) p.px(cx + x, cy + y, WARM)
    }
  }
}

function snowman(p: Painter, x: number, base: number) {
  const ball = (cx: number, cy: number, r: number) => {
    p.disc(cx, cy, r, '#ffffff')
    for (let yy = -Math.ceil(r); yy <= r; yy++) {
      for (let xx = -Math.ceil(r); xx <= r; xx++) {
        const d = Math.sqrt(xx * xx + yy * yy)
        if (d <= r && d > r - 1.6 && xx + yy > r * 0.2) p.px(Math.round(cx + xx), Math.round(cy + yy), '#c9d9f0')
      }
    }
  }
  ball(x, base - 6, 6.5)
  ball(x, base - 16, 5)
  ball(x, base - 24, 3.8)
  // eyes, carrot and smile
  p.px(x - 2, base - 25, '#1b2238'); p.px(x + 1, base - 25, '#1b2238')
  p.rect(x, base - 24, 4, 1, '#ff7a1a'); p.px(x + 3, base - 23, '#e05a0a')
  p.px(x - 2, base - 22, '#1b2238'); p.px(x - 1, base - 21, '#1b2238'); p.px(x, base - 21, '#1b2238'); p.px(x + 1, base - 22, '#1b2238')
  // scarf
  p.rect(x - 4, base - 20, 9, 2, '#d62839'); p.rect(x - 4, base - 20, 9, 1, '#ff5a6a')
  p.rect(x + 2, base - 18, 2, 5, '#d62839'); p.px(x + 2, base - 13, '#ffffff'); p.px(x + 3, base - 13, '#ffffff')
  // top hat
  p.rect(x - 4, base - 28, 9, 1, '#1b2238')
  p.rect(x - 2, base - 33, 5, 5, '#1b2238')
  p.rect(x - 2, base - 30, 5, 1, '#d62839')
  // buttons
  p.px(x, base - 15, '#1b2238'); p.px(x, base - 12, '#1b2238'); p.px(x, base - 7, '#1b2238'); p.px(x, base - 4, '#1b2238')
  // stick arms with twigs
  p.line(x - 5, base - 16, x - 11, base - 21, '#5a3a22'); p.px(x - 10, base - 22, '#5a3a22'); p.px(x - 12, base - 20, '#5a3a22')
  p.line(x + 5, base - 16, x + 11, base - 20, '#5a3a22'); p.px(x + 10, base - 21, '#5a3a22'); p.px(x + 12, base - 19, '#5a3a22')
  p.rect(x - 8, base, 17, 1, '#d5e2f4')
}

/** Santa in his sleigh pulled by two reindeer, the first with a red nose. */
function sleighSprite(): HTMLCanvasElement {
  const p = new Painter(54, 18)
  const reindeer = (x: number, nose: boolean) => {
    const brown = '#8a5a35'
    const light = '#b07a4a'
    p.ellipse(x, 10, 4.5, 2.6, brown)
    p.rect(x - 3, 9, 6, 1, light)
    p.rect(x + 3, 6, 3, 4, brown)
    p.rect(x + 5, 7, 2, 2, light)
    p.px(x + 7, 8, nose ? '#ff3b3b' : '#4a2a16')
    p.px(x + 4, 6, '#1b1426')
    p.line(x + 4, 5, x + 3, 2, '#e3d2a8'); p.line(x + 5, 5, x + 7, 2, '#e3d2a8'); p.px(x + 2, 3, '#e3d2a8'); p.px(x + 8, 3, '#e3d2a8')
    p.line(x - 3, 12, x - 5, 15, brown); p.line(x - 1, 12, x - 1, 15, brown); p.line(x + 2, 12, x + 3, 15, brown)
    p.px(x - 3, 9, '#ffd23f') // harness bell
  }
  reindeer(45, true)
  reindeer(33, false)
  p.line(27, 10, 18, 10, '#ffd23f')
  p.line(39, 10, 30, 10, '#ffd23f')
  // the sleigh
  p.poly([[3, 7], [19, 7], [18, 13], [8, 14], [3, 10]], '#c62a35')
  p.rect(4, 7, 15, 1, '#ff6b78')
  p.rect(5, 11, 12, 1, '#ffd23f')
  p.line(1, 15, 19, 15, '#ffd23f'); p.px(0, 14, '#ffd23f'); p.px(0, 13, '#ffd23f'); p.px(1, 12, '#ffd23f')
  p.px(6, 14, '#c8932a'); p.px(15, 14, '#c8932a')
  // Santa
  p.rect(10, 3, 6, 5, '#d62839'); p.rect(11, 4, 4, 2, '#f2c18a'); p.rect(10, 6, 6, 2, '#ffffff')
  p.rect(9, 1, 5, 2, '#d62839'); p.rect(9, 3, 7, 1, '#ffffff'); p.px(8, 1, '#ffffff'); p.px(8, 0, '#ffffff')
  p.px(12, 4, '#1b1426')
  // the sack of presents
  p.rect(4, 3, 5, 5, '#8a5a35'); p.px(5, 2, '#d62839'); p.px(7, 2, '#5be37a'); p.px(6, 2, '#ffd23f')
  return p.canvas
}
