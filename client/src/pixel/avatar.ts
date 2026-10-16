import type { Avatar } from '../../../shared/protocol'
import { Painter, shade } from './paint'

// A thin "pill" character: one rounded body, a face, and a hat. No legs, no arms, no pants.
export const AVATAR_W = 24
export const AVATAR_H = 32

export const COLORS = [
  '#e63946', '#f4a261', '#f2c14e', '#6bbf59', '#2a9d8f', '#4cc9f0',
  '#4361ee', '#7b2cbf', '#f15bb5', '#8d5a3b', '#adb5bd', '#f8f9fa',
]
// Hair is part of the hat: a few of these are only hair, others are a hat with hair coming out of it.
export const HAT_NAMES = [
  'Sin gorro', 'Gorra', 'Copa', 'Corona', 'Boina', 'Vikingo', 'Cinta', 'Sombrero',
  'Gorra con melena', 'Mohicano', 'Afro', 'Coletas', 'Gorro de lana', 'Mago', 'Pirata', 'Melena rubia', 'Puntas', 'Moño',
]
export const hatName = (i: number) => HAT_NAMES[i] ?? ''

const INK = '#1b1426'

// The pill is drawn row by row: these are the widths of the rounded top (and, mirrored, bottom) rows, so the
// curve is placed by hand instead of coming out of a formula (a formula gives straight diagonal "corners").
const TOP_ROWS = [8, 12, 14]
const BODY_W = 14
const BODY_TOP = 6
const BODY_BOTTOM = 29
const CX = 12

function drawBody(p: Painter, body: string) {
  const dark = shade(body, -0.26)
  const light = shade(body, 0.38)
  const rows: [number, number][] = []
  for (let y = BODY_TOP; y <= BODY_BOTTOM; y++) {
    let w = BODY_W
    const fromTop = y - BODY_TOP
    const fromBottom = BODY_BOTTOM - y
    if (fromTop < TOP_ROWS.length) w = TOP_ROWS[fromTop]
    if (fromBottom < TOP_ROWS.length) w = Math.min(w, TOP_ROWS[fromBottom])
    rows.push([y, w])
  }
  for (const [y, w] of rows) p.rect(CX - w / 2, y, w, 1, dark)
  for (const [y, w] of rows) p.rect(CX - w / 2, y, Math.max(1, w - (w >= BODY_W - 2 ? 3 : 2)), 1, body)
  p.rect(6, BODY_TOP + 4, 2, 6, light); p.rect(7, BODY_TOP + 3, 2, 1, light); p.rect(6, BODY_TOP + 11, 2, 2, light) // shine on the left
}

function dotEye(p: Painter, x: number, y: number, tall = 3) {
  p.rect(x, y, 2, tall, INK)
  p.px(x, y, '#fff')
}

/** Eyes and mouth. Eyes sit around y=12, the mouth around y=18. */
function drawFace(p: Painter, kind: number) {
  const smile = () => { p.px(10, 18, INK); p.px(11, 19, INK); p.px(12, 19, INK); p.px(13, 18, INK) }
  switch (kind) {
    case 0: // friendly dots
      dotEye(p, 8, 12); dotEye(p, 14, 12); smile()
      break
    case 1: // happy arcs
      for (const x of [7, 14]) { p.px(x, 13, INK); p.px(x + 1, 12, INK); p.px(x + 2, 13, INK) }
      p.rect(10, 18, 4, 1, INK); p.rect(11, 19, 2, 1, INK) // open smile
      break
    case 2: // surprised
      dotEye(p, 8, 11, 4); dotEye(p, 14, 11, 4)
      p.rect(11, 18, 2, 2, INK)
      break
    case 3: // wink
      dotEye(p, 8, 12); p.rect(14, 13, 3, 1, INK); smile()
      break
    case 4: // sleepy
      p.rect(7, 13, 3, 1, INK); p.rect(14, 13, 3, 1, INK)
      p.rect(11, 18, 2, 1, INK)
      break
    default: // sunglasses
      p.rect(6, 11, 12, 4, INK); p.rect(7, 12, 3, 1, '#7fc4ee'); p.rect(14, 12, 3, 1, '#7fc4ee')
      smile()
  }
}

/** Long hair hanging down both sides of the head, drawn behind a hat. */
function sideHair(p: Painter, c: string, bottom: number) {
  const hi = shade(c, 0.3)
  p.rect(1, 6, 3, bottom - 5, c); p.rect(16, 6, 3, bottom - 5, c)
  p.rect(1, 6, 1, bottom - 5, hi)
}

/** The strip of hair that shows under a hat, over the forehead. */
function fringe(p: Painter, c: string) {
  p.rect(4, 6, 12, 1, c); p.rect(4, 7, 2, 1, c); p.rect(14, 7, 2, 1, c); p.rect(6, 6, 3, 1, shade(c, 0.3))
}

function drawHat(p: Painter, kind: number) {
  switch (kind) {
    case 1: // cap
      p.rect(4, 3, 12, 3, '#d62828'); p.rect(5, 2, 10, 1, '#d62828'); p.rect(12, 5, 7, 1, '#a4161a'); p.rect(6, 3, 3, 1, '#ff6b6b'); p.px(10, 2, '#fff')
      break
    case 2: // top hat
      p.rect(6, 0, 8, 5, '#2b2d42'); p.rect(3, 5, 14, 1, '#2b2d42'); p.rect(6, 3, 8, 1, '#d62828'); p.rect(7, 1, 1, 2, '#555a7a')
      break
    case 3: // crown
      p.rect(4, 3, 12, 3, '#f2c14e'); p.rect(4, 2, 2, 1, '#f2c14e'); p.rect(9, 1, 2, 2, '#f2c14e'); p.rect(14, 2, 2, 1, '#f2c14e')
      p.px(6, 4, '#e63946'); p.px(10, 4, '#4cc9f0'); p.px(13, 4, '#e63946'); p.rect(4, 5, 12, 1, '#c8932a')
      break
    case 4: // beret
      p.ellipse(10, 4, 7, 2.2, '#7b2cbf'); p.rect(10, 1, 1, 2, '#5a189a'); p.rect(6, 3, 3, 1, '#a45ee0')
      break
    case 5: // viking: horned helmet with long blond braids
      sideHair(p, '#e0b44a', 17)
      for (let y = 8; y <= 16; y += 2) { p.rect(1, y, 3, 1, '#b98a26'); p.rect(16, y, 3, 1, '#b98a26') }
      fringe(p, '#e0b44a')
      p.rect(4, 3, 12, 3, '#9aa0a6'); p.rect(5, 2, 10, 1, '#9aa0a6'); p.rect(5, 3, 3, 1, '#cfd4d9')
      p.rect(2, 2, 2, 3, '#f1e6c8'); p.rect(1, 0, 1, 3, '#f1e6c8'); p.rect(16, 2, 2, 3, '#f1e6c8'); p.rect(18, 0, 1, 3, '#f1e6c8')
      break
    case 6: // headband
      p.rect(3, 5, 14, 2, '#ef476f'); p.rect(3, 5, 14, 1, '#ff8fa8'); p.rect(15, 6, 3, 3, '#ef476f'); p.px(17, 9, '#ef476f')
      break
    case 7: // sombrero
      p.rect(0, 5, 20, 2, '#d6a063'); p.rect(5, 1, 10, 5, '#b9803f'); p.rect(5, 4, 10, 1, '#6b3e1b'); p.rect(0, 5, 20, 1, '#e6b97e')
      break
    case 8: // cap with long dark hair
      sideHair(p, '#3b2314', 18); fringe(p, '#3b2314')
      p.rect(4, 3, 12, 3, '#2a6fdb'); p.rect(5, 2, 10, 1, '#2a6fdb'); p.rect(12, 5, 7, 1, '#1b4a9c'); p.rect(6, 3, 3, 1, '#6aa0f0'); p.px(10, 2, '#fff')
      break
    case 9: // mohawk
      p.rect(8, 0, 4, 7, '#ff2e93'); p.rect(7, 3, 1, 3, '#ff2e93'); p.rect(12, 3, 1, 3, '#ff2e93')
      p.rect(8, 0, 1, 6, '#ff8cc6'); p.rect(9, 6, 2, 1, '#c2185b')
      break
    case 10: // afro
      p.ellipse(10, 4, 8.5, 4.4, '#2b2118'); p.disc(2.5, 8, 2, '#2b2118'); p.disc(17.5, 8, 2, '#2b2118')
      p.rect(5, 1, 3, 1, '#4a3a2c'); p.px(4, 3, '#4a3a2c')
      break
    case 11: // pigtails with a bow
      p.rect(5, 4, 10, 3, '#6b4423'); p.rect(4, 5, 12, 2, '#6b4423'); p.rect(6, 4, 3, 1, '#8c5e33'); p.rect(4, 7, 2, 1, '#6b4423'); p.rect(14, 7, 2, 1, '#6b4423')
      p.rect(2, 6, 2, 2, '#ff4d8d'); p.rect(16, 6, 2, 2, '#ff4d8d')
      p.rect(1, 8, 3, 7, '#6b4423'); p.rect(16, 8, 3, 7, '#6b4423'); p.rect(1, 8, 1, 7, '#8c5e33'); p.rect(2, 15, 1, 2, '#6b4423'); p.rect(17, 15, 1, 2, '#6b4423')
      p.rect(8, 2, 4, 2, '#ff4d8d'); p.px(10, 2, '#a4133c'); p.px(10, 3, '#a4133c')
      break
    case 12: // wool beanie with curly red hair
      for (const [x, y] of [[3, 8], [3, 11], [16.5, 8], [16.5, 11], [4.5, 6.5], [15.5, 6.5]]) p.disc(x, y, 2, '#d9531e')
      p.px(3, 8, '#f08a4b'); p.px(3, 11, '#f08a4b')
      p.rect(4, 3, 12, 3, '#2a9d8f'); p.rect(5, 2, 10, 1, '#2a9d8f'); p.rect(4, 5, 12, 1, '#1d6f66')
      for (const x of [6, 8, 10, 12, 14]) p.rect(x, 3, 1, 2, '#52c4b6')
      p.disc(10, 1.3, 1.8, '#fff')
      break
    case 13: // wizard hat with long white hair
      sideHair(p, '#e8e8ee', 19)
      p.rect(8, 0, 4, 2, '#5a2ea6'); p.rect(6, 2, 8, 2, '#5a2ea6'); p.rect(4, 4, 12, 2, '#5a2ea6'); p.rect(2, 5, 16, 2, '#4a2590')
      p.rect(8, 0, 1, 4, '#7d52cf'); p.px(11, 3, '#f2c14e'); p.px(6, 5, '#f2c14e'); p.px(13, 5, '#f2c14e'); p.px(10, 1, '#f2c14e')
      break
    case 14: // pirate bandana with dark hair
      sideHair(p, '#1c1c24', 13)
      p.rect(4, 3, 12, 4, '#c1121f'); p.rect(5, 2, 10, 1, '#c1121f'); p.rect(4, 6, 12, 1, '#8c0d17')
      for (const [x, y] of [[6, 4], [9, 3], [12, 4], [14, 5], [8, 5]]) p.px(x, y, '#fff')
      p.rect(15, 5, 3, 2, '#c1121f'); p.rect(17, 7, 2, 3, '#c1121f'); p.px(18, 10, '#8c0d17')
      break
    case 15: // long blond hair
      sideHair(p, '#f2c14e', 18)
      p.rect(5, 3, 10, 4, '#f2c14e'); p.rect(4, 4, 12, 3, '#f2c14e'); p.rect(6, 3, 3, 1, '#fde08a'); p.rect(4, 7, 2, 1, '#f2c14e'); p.rect(14, 7, 2, 1, '#f2c14e')
      break
    case 16: // spiky
      p.rect(5, 4, 10, 3, '#1f2a5c'); p.rect(4, 5, 12, 2, '#1f2a5c')
      p.rect(4, 2, 2, 3, '#1f2a5c'); p.rect(7, 0, 2, 5, '#1f2a5c'); p.rect(11, 0, 2, 5, '#1f2a5c'); p.rect(14, 2, 2, 3, '#1f2a5c')
      p.rect(7, 0, 1, 4, '#4a5bb3'); p.rect(6, 4, 3, 1, '#4a5bb3'); p.rect(4, 7, 2, 1, '#1f2a5c'); p.rect(14, 7, 2, 1, '#1f2a5c')
      break
    case 17: // bun
      p.rect(5, 4, 10, 3, '#3b2314'); p.rect(4, 5, 12, 2, '#3b2314'); p.rect(6, 4, 3, 1, '#5a3a20'); p.rect(4, 7, 2, 1, '#3b2314'); p.rect(14, 7, 2, 1, '#3b2314')
      p.disc(10, 2.2, 2.6, '#3b2314'); p.px(9, 1, '#5a3a20'); p.rect(7, 4, 6, 1, '#ef476f')
      break
  }
}

const cache = new Map<string, HTMLCanvasElement>()
const urls = new Map<string, string>()

const keyOf = (a: Avatar) => `${a.color}.${a.face}.${a.hat}`

/** The character as a 24x32 sprite. Cached per look. */
export function avatarSprite(a: Avatar): HTMLCanvasElement {
  const key = keyOf(a)
  const hit = cache.get(key)
  if (hit) return hit

  const p = new Painter(AVATAR_W, AVATAR_H)
  const body = COLORS[a.color % COLORS.length]

  drawBody(p, body)
  drawFace(p, a.face % 6)
  // The hats were drawn for the first, wider body: move them onto the pill's head.
  p.g.save()
  p.g.translate(2, 1)
  drawHat(p, a.hat % HAT_NAMES.length)
  p.g.restore()

  p.outline(shade(body, -0.72))
  cache.set(key, p.canvas)
  return p.canvas
}

export function avatarUrl(a: Avatar): string {
  const key = keyOf(a)
  let u = urls.get(key)
  if (!u) {
    u = avatarSprite(a).toDataURL()
    urls.set(key, u)
  }
  return u
}
