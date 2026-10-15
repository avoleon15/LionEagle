import type { Avatar } from '../../../shared/protocol'
import { Painter, shade } from './paint'

export const AVATAR_W = 20
export const AVATAR_H = 24

export const COLORS = [
  '#e63946', '#f4a261', '#f2c14e', '#6bbf59', '#2a9d8f', '#4cc9f0',
  '#4361ee', '#7b2cbf', '#f15bb5', '#8d5a3b', '#adb5bd', '#f8f9fa',
]
const PANTS = [null, '#264653', '#1d3557', '#6d597a', '#5f0f40', '#386641', '#9c6644', '#3a3f47']
const HAIRS = [null, 'short', 'spiky', 'mohawk', 'bun', 'long', 'curly', 'pigtails'] as const
const HAIR_COLORS = [null, '#2b2118', '#d9a521', '#c1121f', '#6b4423', '#3a86ff', '#e5e5e5', '#f15bb5']
export const HAT_NAMES = ['Sin gorro', 'Gorra', 'Copa', 'Corona', 'Boina', 'Vikingo', 'Cinta', 'Sombrero']
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

function drawHair(p: Painter, style: (typeof HAIRS)[number], c: string) {
  const hi = shade(c, 0.3)
  const cap = () => { p.rect(5, 4, 10, 3, c); p.rect(4, 5, 12, 2, c); p.rect(6, 4, 3, 1, hi) }
  switch (style) {
    case 'short': cap(); p.rect(4, 7, 2, 1, c); p.rect(14, 7, 2, 1, c); break
    case 'spiky': cap(); p.rect(5, 2, 2, 3, c); p.rect(9, 0, 2, 5, c); p.rect(13, 2, 2, 3, c); p.px(9, 1, hi); break
    case 'mohawk': p.rect(8, 0, 4, 7, c); p.rect(8, 0, 1, 6, hi); break
    case 'bun': cap(); p.disc(10, 2.5, 2.5, c); p.px(9, 2, hi); break
    case 'long': cap(); p.rect(2, 7, 2, 9, c); p.rect(16, 7, 2, 9, c); p.rect(4, 7, 2, 1, c); p.rect(14, 7, 2, 1, c); break
    case 'curly': cap(); for (const [x, y] of [[5, 4], [8, 3], [12, 3], [15, 4]]) p.disc(x, y, 2, c); p.px(8, 2, hi); break
    case 'pigtails': cap(); p.disc(2.5, 9, 2.5, c); p.disc(17.5, 9, 2.5, c); p.rect(3, 6, 1, 2, c); p.rect(16, 6, 1, 2, c); break
  }
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
    case 5: // viking
      p.rect(4, 3, 12, 3, '#9aa0a6'); p.rect(5, 2, 10, 1, '#9aa0a6'); p.rect(5, 3, 3, 1, '#cfd4d9')
      p.rect(2, 2, 2, 3, '#f1e6c8'); p.rect(1, 0, 1, 3, '#f1e6c8'); p.rect(16, 2, 2, 3, '#f1e6c8'); p.rect(18, 0, 1, 3, '#f1e6c8')
      break
    case 6: // headband
      p.rect(3, 5, 14, 2, '#ef476f'); p.rect(3, 5, 14, 1, '#ff8fa8'); p.rect(15, 6, 3, 3, '#ef476f'); p.px(17, 9, '#ef476f')
      break
    case 7: // sombrero
      p.rect(0, 5, 20, 2, '#d6a063'); p.rect(5, 1, 10, 5, '#b9803f'); p.rect(5, 4, 10, 1, '#6b3e1b'); p.rect(0, 5, 20, 1, '#e6b97e')
      break
  }
}

const cache = new Map<string, HTMLCanvasElement>()
const urls = new Map<string, string>()

/** The character as a 20x24 sprite (feet on the bottom row). Cached per look. */
export function avatarSprite(a: Avatar): HTMLCanvasElement {
  const key = `${a.color}.${a.face}.${a.hair}.${a.hat}.${a.pants}`
  const hit = cache.get(key)
  if (hit) return hit

  const p = new Painter(AVATAR_W, AVATAR_H)
  const body = COLORS[a.color % COLORS.length]
  const dark = shade(body, -0.28)
  const light = shade(body, 0.35)
  const pants = PANTS[a.pants % PANTS.length]
  const hairStyle = HAIRS[a.hair % HAIRS.length]
  const hairColor = HAIR_COLORS[a.hair % HAIR_COLORS.length]

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
  if (hairStyle && hairColor) drawHair(p, hairStyle, hairColor)
  drawHat(p, a.hat % 8)

  p.outline(INK)
  cache.set(key, p.canvas)
  return p.canvas
}

export function avatarUrl(a: Avatar): string {
  const key = `${a.color}.${a.face}.${a.hair}.${a.hat}.${a.pants}`
  let u = urls.get(key)
  if (!u) {
    u = avatarSprite(a).toDataURL()
    urls.set(key, u)
  }
  return u
}
