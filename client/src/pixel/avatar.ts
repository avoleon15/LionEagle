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
  'Ciclista holandés', 'Aureola', 'Cuernos', 'Hacha', 'Flecha', 'Papel aluminio', 'Cono', 'Calzones', 'Fiesta', 'Venda',
]
export const hatName = (i: number) => HAT_NAMES[i] ?? ''
export const FACE_NAMES = [
  'Puntitos', 'Feliz', 'Sorpresa', 'Guiño', 'Dormido', 'Lentes oscuros', 'Bigotito', 'Muerto',
  'Ojo morado', 'Calavera', 'Mareado', 'Bigotón', 'Vampiro', 'Llorando',
]
export const faceName = (i: number) => FACE_NAMES[i] ?? ''

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
    case 5: // sunglasses
      p.rect(6, 11, 12, 4, INK); p.rect(7, 12, 3, 1, '#7fc4ee'); p.rect(14, 12, 3, 1, '#7fc4ee')
      smile()
      break
    case 6: // little square moustache
      dotEye(p, 8, 11); dotEye(p, 14, 11)
      p.rect(10, 16, 4, 2, INK)
      p.rect(11, 19, 2, 1, INK)
      break
    case 7: // dead: X eyes and the tongue out
      for (const x of [7, 14]) { p.px(x, 11, INK); p.px(x + 2, 11, INK); p.px(x + 1, 12, INK); p.px(x, 13, INK); p.px(x + 2, 13, INK) }
      p.rect(9, 18, 6, 1, INK); p.rect(12, 19, 2, 2, '#ff7aa8'); p.px(13, 20, '#d94f7f')
      break
    case 8: // black eye and a plaster
      p.rect(7, 10, 4, 5, '#5b3a8c'); p.rect(6, 11, 1, 3, '#5b3a8c')
      dotEye(p, 8, 12); dotEye(p, 14, 12)
      p.rect(14, 16, 4, 2, '#f1c27d'); p.px(15, 16, '#c99a5b'); p.px(16, 17, '#c99a5b')
      p.px(10, 19, INK); p.px(11, 18, INK); p.px(12, 18, INK); p.px(13, 19, INK) // frown
      break
    case 9: // sugar skull
      p.rect(7, 10, 4, 4, INK); p.rect(14, 10, 4, 4, INK); p.px(8, 11, '#ff5c8a'); p.px(15, 11, '#ff5c8a')
      p.px(11, 15, INK); p.px(13, 15, INK); p.px(12, 16, INK)
      p.rect(9, 18, 7, 2, '#f8f9fa'); for (const x of [10, 12, 14]) p.rect(x, 18, 1, 2, INK)
      p.px(6, 9, '#f2c14e'); p.px(18, 9, '#4cc9f0')
      break
    case 10: // dizzy
      for (const x of [7, 14]) { p.rect(x, 11, 3, 3, INK); p.px(x + 1, 12, '#fff'); p.px(x + 2, 11, '#fff') }
      p.rect(6, 15, 2, 1, '#ff8fab'); p.rect(16, 15, 2, 1, '#ff8fab')
      for (const [x, y] of [[9, 19], [10, 18], [11, 19], [12, 18], [13, 19], [14, 18]]) p.px(x, y, INK)
      break
    case 11: // big handlebar moustache
      dotEye(p, 8, 11); dotEye(p, 14, 11)
      p.rect(8, 16, 8, 2, '#3b2314'); p.rect(9, 15, 6, 1, '#3b2314'); p.px(7, 16, '#3b2314'); p.px(16, 16, '#3b2314'); p.px(6, 15, '#3b2314'); p.px(17, 15, '#3b2314')
      p.rect(10, 15, 2, 1, '#5a3a20')
      break
    case 12: // vampire
      p.rect(8, 12, 2, 3, '#c1121f'); p.px(8, 12, '#fff'); p.rect(14, 12, 2, 3, '#c1121f'); p.px(14, 12, '#fff')
      p.rect(7, 10, 3, 1, INK); p.rect(14, 10, 3, 1, INK)
      p.rect(9, 18, 6, 1, INK); p.px(10, 19, '#fff'); p.px(13, 19, '#fff')
      break
    default: // crying
      dotEye(p, 8, 12); dotEye(p, 14, 12)
      for (const x of [8, 14]) { p.rect(x, 15, 1, 5, '#e6f7ff'); p.rect(x + 1, 15, 1, 5, '#2f80d1'); p.rect(x, 20, 2, 1, '#2f80d1') }
      p.px(10, 19, INK); p.px(11, 18, INK); p.px(12, 18, INK); p.px(13, 19, INK)
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
    case 18: // Dutch cycling cap (orange, flag band, brim flipped up) over blond hair
      sideHair(p, '#f2d16b', 12); fringe(p, '#f2d16b')
      p.rect(4, 3, 12, 3, '#ff7f00'); p.rect(5, 2, 10, 1, '#ff7f00'); p.rect(6, 2, 3, 1, '#ffad5c')
      p.rect(4, 5, 4, 1, '#ae1c28'); p.rect(8, 5, 4, 1, '#ffffff'); p.rect(12, 5, 4, 1, '#21468b')
      p.rect(14, 2, 4, 1, '#cc5f00'); p.rect(16, 3, 2, 1, '#cc5f00')
      break
    case 19: // halo
      p.rect(6, -1, 8, 1, '#ffd23f'); p.rect(6, 1, 8, 1, '#c8932a'); p.px(5, 0, '#ffd23f'); p.px(14, 0, '#c8932a'); p.rect(7, -1, 3, 1, '#fff2a8')
      break
    case 20: // devil horns
      for (const [x, d] of [[4, -1], [15, 1]]) {
        p.rect(x, 3, 2, 3, '#c1121f'); p.rect(x + d, 1, 2, 2, '#c1121f'); p.px(x + 2 * d, 0, '#c1121f')
      }
      p.px(4, 3, '#ff5c5c'); p.px(15, 3, '#ff5c5c')
      break
    case 21: // axe stuck in the head
      p.rect(12, 2, 2, 1, '#8b5a2b'); p.rect(13, 1, 2, 1, '#8b5a2b'); p.rect(14, 0, 2, 1, '#8b5a2b'); p.rect(15, -1, 2, 1, '#6b4423')
      p.rect(6, 3, 6, 3, '#b8c0c8'); p.rect(6, 3, 6, 1, '#e3e8ec'); p.rect(6, 5, 6, 1, '#8a939c'); p.rect(11, 2, 2, 2, '#6b4423')
      p.rect(8, 6, 1, 4, '#d62828'); p.px(8, 10, '#a4161a'); p.px(10, 6, '#d62828')
      break
    case 22: // arrow through the head
      p.rect(-1, 8, 4, 1, '#8b5a2b'); p.px(-2, 7, '#e63946'); p.px(-1, 7, '#e63946'); p.px(-2, 9, '#e63946'); p.px(-1, 9, '#e63946')
      p.rect(17, 8, 2, 1, '#8b5a2b'); p.rect(19, 7, 1, 3, '#c0c6cc'); p.px(20, 8, '#c0c6cc'); p.px(19, 7, '#e3e8ec')
      break
    case 23: // tin-foil hat
      p.rect(9, 0, 2, 1, '#c9ced6'); p.rect(8, 1, 4, 1, '#c9ced6'); p.rect(7, 2, 6, 1, '#c9ced6'); p.rect(6, 3, 8, 1, '#c9ced6'); p.rect(4, 4, 12, 2, '#c9ced6')
      for (const [x, y] of [[9, 1], [7, 3], [11, 2], [5, 5], [10, 4], [13, 5]]) p.px(x, y, '#8f99a6')
      for (const [x, y] of [[9, 0], [8, 2], [6, 4], [12, 4]]) p.px(x, y, '#f2f4f7')
      break
    case 24: // traffic cone
      p.rect(9, -1, 2, 1, '#ff7a1a'); p.rect(8, 0, 4, 1, '#ff7a1a'); p.rect(8, 1, 4, 1, '#ffffff'); p.rect(7, 2, 6, 1, '#ff7a1a'); p.rect(6, 3, 8, 1, '#ffffff'); p.rect(6, 4, 8, 1, '#ff7a1a')
      p.rect(3, 5, 14, 1, '#c2410c'); p.px(8, 0, '#ffb070'); p.px(7, 2, '#ffb070')
      break
    case 25: // underpants on the head
      p.rect(4, 2, 12, 4, '#f8f9fa'); p.rect(4, 2, 12, 1, '#ff8fc7'); p.rect(5, 5, 3, 1, '#d8dde2'); p.rect(12, 5, 3, 1, '#d8dde2')
      for (const [x, y] of [[6, 3], [10, 4], [13, 3]]) { p.px(x, y, '#e63946'); p.px(x + 1, y, '#e63946') }
      break
    case 26: // party hat
      p.rect(9, 0, 2, 2, '#ffd23f'); p.rect(8, 2, 4, 1, '#ff5c8a'); p.rect(8, 3, 4, 1, '#4cc9f0'); p.rect(7, 4, 6, 1, '#ff5c8a'); p.rect(6, 5, 8, 1, '#4cc9f0')
      p.px(9, 0, '#fff2a8'); p.px(8, 4, '#ffd23f'); p.px(11, 2, '#ffd23f')
      break
    case 27: // bandage with a red spot
      p.rect(3, 4, 14, 3, '#f1ede4'); p.rect(3, 5, 14, 1, '#d8d2c4'); p.rect(12, 4, 2, 2, '#d62828'); p.px(13, 6, '#a4161a')
      p.rect(16, 6, 2, 1, '#f1ede4'); p.px(18, 7, '#f1ede4')
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
  drawFace(p, a.face % FACE_NAMES.length)
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
