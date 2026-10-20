import { eagleSprite, lionSprite, rockSprite } from './mascots'
import { Painter } from './paint'

// Backgrounds, drawn at a tiny logical resolution and scaled up with nearest-neighbour filtering.
// Each one can be replaced by a picture made outside the code (see art/PROMPTS.md): drop it in
// client/public/bg/ and it is used instead of the drawn one. If the file is missing, the drawn one stays.

export const BG_FILES = {
  game: '/bg/game.png', // the tall column for the game, already stacked (ground at the bottom, space at the top)
  gameParts: ['/bg/game-1.png', '/bg/game-2.png', '/bg/game-3.png'], // or the same in 3 pieces: 1 = ground, 2 = sky, 3 = space
  gameWideParts: ['/bg/game-wide-1.png', '/bg/game-wide-2.png', '/bg/game-wide-3.png'], // the same, landscape (1536x1024 each), used on wide screens
  home: '/bg/home.png', // portrait title background
  homeWide: '/bg/home-wide.png', // landscape title background
}

/** The game column as one picture: game.png, or the pieces stacked (piece 1 at the bottom). Null when there is none. */
export interface GamePicture {
  image: HTMLCanvasElement | HTMLImageElement
  wide: boolean // landscape pieces: they fill the whole width instead of a phone-width strip
}

/** On a wide screen the landscape pieces are used when they exist; otherwise the portrait ones. */
export async function loadGamePicture(preferWide: boolean): Promise<GamePicture | null> {
  if (preferWide) {
    const wide = await stack(BG_FILES.gameWideParts)
    if (wide) return { image: wide, wide: true }
  }
  const whole = await loadImage(BG_FILES.game)
  if (whole) return { image: whole, wide: false }
  const tall = await stack(BG_FILES.gameParts)
  return tall ? { image: tall, wide: false } : null
}

async function stack(files: string[]): Promise<HTMLCanvasElement | null> {
  const parts = (await Promise.all(files.map(loadImage))).filter((x): x is HTMLImageElement => x !== null)
  if (parts.length === 0) return null
  const w = Math.min(files === BG_FILES.gameWideParts ? 768 : 512, ...parts.map((p) => p.naturalWidth))
  const heights = parts.map((p) => Math.round((p.naturalHeight * w) / p.naturalWidth))
  const c = document.createElement('canvas')
  c.width = w
  c.height = heights.reduce((a, b) => a + b, 0)
  const g = c.getContext('2d')!
  g.imageSmoothingQuality = 'high'
  let y = c.height
  parts.forEach((p, i) => {
    y -= heights[i]
    g.drawImage(p, 0, y, w, heights[i])
  })
  return c
}

// top (space) to bottom (horizon)
export const SKY = ['#17235f', '#1f3590', '#2a4ba8', '#3862c0', '#4f7fd3', '#6c9ee2', '#8ab9ec', '#a8d0f2', '#c4e3f6', '#dcf0f8', '#eef6e2', '#fbf1c8']

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const images = new Map<string, Promise<HTMLImageElement | null>>()
/** Loads a picture once; null when it does not exist (the dev server and the app answer missing files with the page). */
export function loadImage(src: string): Promise<HTMLImageElement | null> {
  let p = images.get(src)
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.naturalWidth > 0 ? img : null)
      img.onerror = () => resolve(null)
      img.src = src
    })
    images.set(src, p)
  }
  return p
}

export function cloudSprite(w: number, h: number, seed: number): HTMLCanvasElement {
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

/** Sky bands from `top` (darkest colour) down to `bottom`, with dithered edges. */
function skyBands(p: Painter, W: number, top: number, bottom: number, from = 0) {
  const colors = SKY.slice(from)
  const band = (bottom - top) / colors.length
  colors.forEach((c, i) => p.rect(0, Math.floor(top + i * band), W, Math.ceil(band) + 1, c))
  for (let i = 1; i < colors.length; i++) {
    const y = Math.floor(top + i * band)
    for (let x = 0; x < W; x++) {
      if ((x & 1) === 0) p.px(x, y - 1, colors[i])
      else p.px(x, y + 1, colors[i - 1])
    }
  }
}

function hills(p: Painter, W: number, groundTop: number) {
  for (let x = 0; x < W; x++) {
    const far = 14 + Math.sin(x * 0.045) * 5 + Math.sin(x * 0.12 + 1) * 3
    p.rect(x, groundTop - Math.round(far), 1, Math.round(far) + 2, '#6fb87a')
    const near = 7 + Math.sin(x * 0.07 + 2) * 3 + Math.sin(x * 0.19) * 1.5
    p.rect(x, groundTop - Math.round(near), 1, Math.round(near) + 2, '#58a85a')
  }
}

function grass(p: Painter, W: number, groundTop: number, depth: number) {
  p.rect(0, groundTop, W, 14, '#4aa63a')
  p.rect(0, groundTop, W, 2, '#8ee06a')
  p.rect(0, groundTop + 10, W, 4, '#3f8f31')
  p.rect(0, groundTop + 14, W, depth - 14, '#8a5a35')
  p.rect(0, groundTop + 14, W, 2, '#6d4526')
  const r = rng(11)
  for (let i = 0; i < W / 3; i++) {
    const x = Math.floor(r() * W)
    const y = groundTop + 18 + Math.floor(r() * Math.max(1, depth - 20))
    p.rect(x, y, r() > 0.6 ? 2 : 1, 1, r() > 0.5 ? '#a8723f' : '#6d4526')
  }
  for (let i = 0; i < W / 5; i++) {
    const x = Math.floor(r() * W)
    const y = groundTop + 2 + Math.floor(r() * 9)
    p.px(x, y, '#2f7a2a'); p.px(x, y - 1, '#2f7a2a')
    if (r() > 0.7) p.px(x + 1, y - 2, r() > 0.5 ? '#ffd23f' : '#ff7aa8')
  }
}

/** The lion on the left and the eagle on its rock on the right, standing on `groundTop`. */
function mascots(p: Painter, W: number, groundTop: number) {
  const lion = lionSprite()
  const eagle = eagleSprite()
  const rock = rockSprite()
  // On a narrow (phone) screen they step half out of the picture so the middle stays free for the player.
  const tuck = W < 220 ? 14 : 0
  p.g.drawImage(lion, 2 - tuck, groundTop + 16 - lion.height)
  const ex = W - eagle.width - 2 + tuck
  p.g.drawImage(rock, ex + 13, groundTop + 15 - rock.height)
  p.g.drawImage(eagle, ex, groundTop + 15 - rock.height - eagle.height + 7)
}

export const GROUND = 34
/** Points needed to reach the top of the sky (7 questions x 100). */
export const MAX_SCORE = 700
/** Where the feet are at MAX_SCORE: just below the top of the world, in space. */
const FOOT_HIGH = 70
/** Logical width of the background picture; wider screens get the sides filled in. */
const PICTURE_W = 150

export interface World {
  canvas: HTMLCanvasElement
  /** y of the feet at 0 points and at MAX_SCORE points */
  footLow: number
  footHigh: number
  /** true when the picture from bg/game.png is used */
  picture: boolean
}

/**
 * The tall column the character climbs: ground with the mascots at the bottom, sky, then space.
 * Altitude marks on the left, like a depth meter.
 */
export function buildWorld(W: number, H: number, found: GamePicture | null): World {
  if (found) {
    const picture = found.image
    // The picture is portrait. On a wide screen it is NOT stretched to the full width (the animals would be
    // giant next to the 24 px character): it keeps a phone-like width in the middle and every row of the
    // sides is filled with that row's most common colour, so the sky bands and the grass simply continue.
    const pw = picture instanceof HTMLImageElement ? picture.naturalWidth : picture.width
    const ph = picture instanceof HTMLImageElement ? picture.naturalHeight : picture.height
    const PW = found.wide ? W : Math.min(W, PICTURE_W)
    const h = Math.max(H + 40, Math.round((ph * PW) / pw))
    const strip = new Painter(PW, h)
    strip.g.imageSmoothingEnabled = true
    strip.g.imageSmoothingQuality = 'high'
    strip.g.drawImage(picture, 0, 0, PW, h)
    const p = new Painter(W, h)
    const x0 = Math.floor((W - PW) / 2)
    if (W > PW) {
      const data = strip.g.getImageData(0, 0, PW, h).data
      for (let y = 0; y < h; y++) {
        const counts = new Map<number, number>()
        for (let x = 0; x < PW; x++) {
          const i = (y * PW + x) * 4
          const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        let best = 0
        let bestN = -1
        for (const [k, n] of counts) if (n > bestN) { best = k; bestN = n }
        p.rect(0, y, W, 1, '#' + best.toString(16).padStart(6, '0'))
      }
    }
    p.g.drawImage(strip.canvas, x0, 0)
    // The grass line of the bottom picture is 261 px (of 1536) above its lower edge; a piece is 2:3.
    // Portrait pieces are 2:3 with the grass line 261/1536 above the lower edge; landscape ones are 3:2 with it about 12.9% up (feet 11.5%).
    const footLow = found.wide ? h - Math.round(PW * (2 / 3) * 0.115) : h - Math.round(PW * 1.5 * (261 / 1536))
    return { canvas: p.canvas, footLow, footHigh: FOOT_HIGH, picture: true }
  }
  const h = Math.max(H * 3, 720)
  const p = new Painter(W, h)
  const groundTop = h - GROUND
  skyBands(p, W, 0, groundTop)
  const r = rng(3)
  // space: a ringed planet and a moon
  p.disc(18, 70, 9, '#c77dff'); p.disc(15, 67, 4, '#e0b3ff'); p.rect(4, 70, 29, 1, '#ffd23f'); p.rect(6, 71, 25, 1, '#c8932a')
  p.disc(W - 24, 34, 9, '#fff4c2'); p.disc(W - 20, 31, 8, SKY[0])
  // clouds in the lower two thirds
  const kinds = [cloudSprite(34, 14, 1), cloudSprite(24, 10, 2), cloudSprite(48, 17, 3)]
  for (let i = 0; i < Math.round(h / 55); i++) {
    const c = kinds[i % kinds.length]
    const y = Math.round(h * 0.38 + r() * (groundTop - h * 0.38 - 50))
    const side = i % 2 === 0 ? -0.15 : 0.6
    p.g.drawImage(c, Math.round((side + r() * 0.55) * W), y)
  }
  hills(p, W, groundTop)
  grass(p, W, groundTop, GROUND)
  mascots(p, W, groundTop)
  const footLow = groundTop + 10
  return { canvas: p.canvas, footLow, footHigh: FOOT_HIGH, picture: false }
}

/** Stars in the dark top part of the world, twinkling (drawn every frame). */
export function drawStars(g: CanvasRenderingContext2D, W: number, worldTop: number, worldH: number, camY: number, H: number, now: number) {
  const r = rng(7)
  const n = Math.round((W * worldH) / 2200)
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * W)
    const y = worldTop + Math.floor(r() * worldH * 0.4)
    const sy = y - camY
    if (sy < -2 || sy > H + 2) continue
    const tw = Math.sin(now * (1.5 + (i % 5) * 0.4) + i)
    if (tw > -0.4) {
      g.fillStyle = tw > 0.7 ? '#ffffff' : '#9db8ff'
      g.fillRect(x, sy, 1, 1)
      if (tw > 0.9 && i % 3 === 0) { g.fillRect(x - 1, sy, 3, 1); g.fillRect(x, sy - 1, 1, 3) }
    }
  }
}

/** The title-screen backdrop: daytime sky, hills, the lion and the eagle in the corners. */
export function buildHome(W: number, H: number): HTMLCanvasElement {
  const p = new Painter(W, H)
  const groundTop = H - 30
  skyBands(p, W, 0, groundTop, 6)
  p.disc(W - 30, 30, 11, '#fff4c2'); p.disc(W - 30, 30, 8, '#ffe58a')
  hills(p, W, groundTop)
  grass(p, W, groundTop, 30)
  mascots(p, W, groundTop)
  // far-away birds
  const r = rng(9)
  for (let i = 0; i < 4; i++) {
    const x = Math.round(r() * (W - 20)) + 10
    const y = Math.round(20 + r() * H * 0.3)
    p.px(x - 1, y, '#2a4ba8'); p.px(x + 1, y, '#2a4ba8'); p.px(x - 2, y - 1, '#2a4ba8'); p.px(x + 2, y - 1, '#2a4ba8')
  }
  return p.canvas
}
