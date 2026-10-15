import type { Avatar } from '../../../shared/protocol'
import { Painter, shade } from './paint'

export const AVATAR_W = 20
export const AVATAR_H = 24

export const COLORS = [
  '#e63946', '#f4a261', '#f2c14e', '#6bbf59', '#2a9d8f', '#4cc9f0',
  '#4361ee', '#7b2cbf', '#f15bb5', '#8d5a3b', '#adb5bd', '#f8f9fa',
]
const PANTS = [null, '#264653', '#1d3557', '#6d597a', '#5f0f40', '#386641', '#9c6644', '#3a3f47']
// Hair is part of the hat: a few of these are only hair, others are a hat with hair coming out of it.
export const HAT_NAMES = [
  'Sin gorro', 'Gorra', 'Copa', 'Corona', 'Boina', 'Vikingo', 'Cinta', 'Sombrero',
  'Gorra con melena', 'Mohicano', 'Afro', 'Coletas', 'Gorro de lana', 'Mago', 'Pirata', 'Melena rubia', 'Puntas', 'Moño',
]
export const hatName = (i: number) => HAT_NAMES[i] ?? ''

const INK = '#1b1426'

function drawEyes(p: Painter, kind: number) {
  switch (kind) {
    case 0:
      p.rect(6, 9, 2, 3, '#fff'); p.rect(12, 9, 2, 3, '#fff')
      p.rect(7, 10, 1, 2, INK); p.rect(13, 10, 1, 2, INK)
      break
    case 1: // visor
      p.rect(5, 8, 10, 4, '#223a52'); p.rect(6, 9, 3, 1, '#bfe9ff'); p.px(6, 10, '#7fc4ee')
      break
    case 2: // happy arcs
      for (const x of [6, 12]) { p.px(x, 11, INK); p.px(x + 1, 10, INK); p.px(x + 2, 11, INK) }
      break
    case 3: // one big, one small
      p.rect(5, 8, 3, 4, '#fff'); p.rect(6, 9, 2, 3, INK); p.px(6, 9, '#fff')
      p.rect(12, 10, 2, 2, '#fff'); p.rect(13, 10, 1, 2, INK)
      break
    case 4: // x eyes
      for (const x of [6, 12]) { p.px(x, 9, INK); p.px(x + 2, 9, INK); p.px(x + 1, 10, INK); p.px(x, 11, INK); p.px(x + 2, 11, INK) }
      break
    default: // sleepy
      p.rect(6, 10, 3, 1, INK); p.rect(11, 10, 3, 1, INK); p.rect(6, 9, 3, 1, '#0003'); p.rect(11, 9, 3, 1, '#0003')
  }
}

function drawMouth(p: Painter, kind: number) {
  switch (kind) {
    case 0: p.px(8, 14, INK); p.px(9, 15, INK); p.px(10, 15, INK); p.px(11, 14, INK); break
    case 1: p.rect(8, 15, 4, 1, INK); break
    case 2: p.rect(9, 14, 2, 2, INK); break
    case 3: p.rect(7, 14, 6, 2, '#fff'); p.rect(7, 16, 6, 1, INK); p.rect(7, 13, 6, 1, INK); p.px(10, 14, INK); break
    case 4: p.px(8, 15, INK); p.px(9, 15, INK); p.px(10, 15, INK); p.px(11, 14, INK); p.px(12, 13, INK); break
    default: p.rect(8, 14, 4, 1, INK); p.rect(9, 15, 2, 2, '#ff6b81'); break
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

/** The character as a 20x24 sprite (feet on the bottom row). Cached per look. */
export function avatarSprite(a: Avatar): HTMLCanvasElement {
  const key = `${a.color}.${a.face}.${a.hat}.${a.pants}`
  const hit = cache.get(key)
  if (hit) return hit

  const p = new Painter(AVATAR_W, AVATAR_H)
  const body = COLORS[a.color % COLORS.length]
  const dark = shade(body, -0.28)
  const light = shade(body, 0.35)
  const pants = PANTS[a.pants % PANTS.length]

  // legs
  p.rect(4, 19, 5, 4, dark); p.rect(11, 19, 5, 4, dark)
  // body: rounded blob
  p.rect(5, 5, 10, 1, body); p.rect(4, 6, 12, 1, body); p.rect(3, 7, 14, 11, body)
  p.rect(4, 18, 12, 2, body)
  // shading
  p.rect(15, 7, 2, 11, dark); p.rect(15, 6, 1, 1, dark); p.rect(4, 18, 12, 2, dark)
  p.rect(14, 5, 1, 1, dark)
  p.rect(5, 7, 1, 4, light); p.rect(6, 6, 3, 1, light); p.rect(5, 6, 1, 1, light)
  // pants
  if (pants) {
    p.rect(4, 15, 12, 4, pants); p.rect(3, 15, 1, 2, pants); p.rect(4, 19, 5, 4, pants); p.rect(11, 19, 5, 4, pants)
    p.rect(15, 15, 1, 5, shade(pants, -0.3)); p.rect(4, 15, 12, 1, shade(pants, 0.25))
    p.rect(9, 19, 2, 1, shade(pants, -0.3))
  }
  // shoes
  p.rect(4, 22, 5, 1, INK); p.rect(11, 22, 5, 1, INK)

  drawEyes(p, a.face % 6)
  drawMouth(p, a.face % 6)
  drawHat(p, a.hat % HAT_NAMES.length)

  p.outline(INK)
  cache.set(key, p.canvas)
  return p.canvas
}

export function avatarUrl(a: Avatar): string {
  const key = `${a.color}.${a.face}.${a.hat}.${a.pants}`
  let u = urls.get(key)
  if (!u) {
    u = avatarSprite(a).toDataURL()
    urls.set(key, u)
  }
  return u
}
