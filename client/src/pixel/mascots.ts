import { Painter, shade } from './paint'

const INK = '#2a1810'

let lion: HTMLCanvasElement | null = null
let eagle: HTMLCanvasElement | null = null
let rock: HTMLCanvasElement | null = null

/** Front-facing lion with a big mane, 44x44. */
export function lionSprite(): HTMLCanvasElement {
  if (lion) return lion
  const p = new Painter(44, 44)
  const fur = '#e9a93f', furLight = '#f7cf7a', furDark = '#c47f1f'
  const maneA = '#a85a1c', maneB = '#7c3b12', maneC = '#c9782e'

  // body and paws (behind the mane)
  p.ellipse(22, 35, 12, 7, fur)
  p.ellipse(22, 37, 12, 5, furDark)
  p.ellipse(14, 41, 5, 2.6, furLight); p.ellipse(30, 41, 5, 2.6, furLight)
  p.rect(11, 42, 1, 1, furDark); p.rect(13, 42, 1, 1, furDark); p.rect(30, 42, 1, 1, furDark); p.rect(32, 42, 1, 1, furDark)

  // mane: dark outer tufts, mid core, light inner tufts
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    p.disc(22 + Math.cos(a) * 15.5, 20 + Math.sin(a) * 15.5, 5.2, maneB)
  }
  p.disc(22, 20, 16, maneB)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2
    p.disc(22 + Math.cos(a) * 12.5, 20 + Math.sin(a) * 12.5, 4.4, maneA)
  }
  p.disc(22, 20, 12.5, maneA)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.5
    p.disc(22 + Math.cos(a) * 10, 20 + Math.sin(a) * 10, 3, maneC)
  }

  // ears
  p.disc(10.5, 8.5, 4, fur); p.disc(33.5, 8.5, 4, fur)
  p.disc(10.5, 9, 2, '#e88a8a'); p.disc(33.5, 9, 2, '#e88a8a')

  // face
  p.ellipse(22, 21.5, 10.5, 10, fur)
  p.ellipse(22, 14, 6, 3, furLight) // forehead highlight
  p.ellipse(22, 27, 6.5, 5, '#fbe7b8') // muzzle
  p.ellipse(17.5, 25.5, 3.5, 3.5, '#fbe7b8'); p.ellipse(26.5, 25.5, 3.5, 3.5, '#fbe7b8')
  // eyes
  p.rect(15, 18, 3, 3, INK); p.rect(26, 18, 3, 3, INK)
  p.px(15, 18, '#fff'); p.px(26, 18, '#fff')
  p.rect(14, 16, 5, 1, furDark); p.rect(25, 16, 5, 1, furDark) // brows
  // nose and mouth
  p.rect(20, 23, 4, 2, '#5a2a22'); p.rect(21, 25, 2, 1, '#5a2a22')
  p.px(22, 26, INK); p.px(22, 27, INK)
  p.px(20, 28, INK); p.px(21, 28, INK); p.px(23, 28, INK); p.px(24, 28, INK)
  p.rect(21, 29, 2, 1, '#e88a8a')
  // whisker dots
  for (const [x, y] of [[16, 25], [15, 27], [28, 25], [29, 27]]) p.px(x, y, furDark)

  p.outline(INK)
  lion = p.canvas
  return lion
}

/** Front-facing eagle with spread wings, 60x44. */
export function eagleSprite(): HTMLCanvasElement {
  if (eagle) return eagle
  const W = 60, H = 44
  const p = new Painter(W, H)
  const brown = '#7a4a22', brownDark = '#4f2d12', brownLight = '#a8703a', white = '#f8f4e8', gold = '#f2b01e'

  // left wing (drawn on the left half, then mirrored)
  const wing: [number, number][] = [
    [26, 15], [18, 9], [9, 6], [1, 9], [1, 14], [3, 15], [2, 20], [5, 21], [5, 26], [9, 26], [10, 31], [14, 30], [16, 34], [21, 31], [25, 33],
  ]
  p.poly(wing, brown)
  // feather bands
  p.poly([[26, 20], [16, 15], [4, 14], [3, 20], [9, 22], [17, 24]], brownLight)
  p.line(25, 24, 6, 21, brownDark); p.line(25, 28, 11, 27, brownDark); p.line(24, 31, 16, 31, brownDark)
  p.line(24, 17, 9, 9, brownDark)
  p.mirrorHalf()

  // tail
  p.poly([[23, 34], [37, 34], [40, 43], [30, 41], [20, 43]], brownDark)
  p.line(30, 36, 30, 41, brownLight); p.line(26, 36, 24, 41, brownLight); p.line(34, 36, 36, 41, brownLight)
  // body
  p.ellipse(30, 26, 8, 12, brown)
  p.ellipse(30, 28, 5.5, 8.5, brownLight)
  for (let y = 22; y < 34; y += 3) { p.px(27, y, brown); p.px(30, y + 1, brown); p.px(33, y, brown) }
  // talons
  p.rect(25, 37, 3, 3, gold); p.rect(32, 37, 3, 3, gold)
  p.px(24, 40, gold); p.px(26, 40, gold); p.px(28, 40, gold); p.px(31, 40, gold); p.px(33, 40, gold); p.px(35, 40, gold)
  // head (white) and beak
  p.disc(30, 12, 7, white)
  p.ellipse(30, 15, 6, 3, '#e6dfc9')
  p.poly([[27, 13], [33, 13], [31.5, 20], [28.5, 20]], gold)
  p.poly([[28, 17], [32, 17], [30, 20]], '#c98a10')
  // eyes with brow
  p.rect(25, 9, 3, 2, '#d99b14'); p.rect(32, 9, 3, 2, '#d99b14')
  p.px(26, 10, INK); p.px(33, 10, INK)
  p.rect(24, 8, 4, 1, brownDark); p.rect(32, 8, 4, 1, brownDark)
  p.px(29, 14, INK); p.px(31, 14, INK)

  p.outline(INK)
  eagle = p.canvas
  return eagle
}

/** A small rock for the eagle to perch on. */
export function rockSprite(): HTMLCanvasElement {
  if (rock) return rock
  const p = new Painter(34, 14)
  const g = '#8d939b'
  p.poly([[2, 13], [5, 5], [12, 2], [22, 2], [29, 5], [32, 13]], g)
  p.poly([[5, 13], [8, 7], [13, 4], [20, 4], [14, 8], [11, 13]], shade(g, 0.25))
  p.poly([[22, 6], [28, 6], [31, 13], [20, 13]], shade(g, -0.25))
  p.px(15, 9, shade(g, -0.3)); p.px(24, 9, shade(g, 0.2)); p.px(9, 11, shade(g, -0.2))
  p.outline('#2f3239')
  rock = p.canvas
  return rock
}

const urls = new Map<HTMLCanvasElement, string>()
/** Data URL of a sprite, for use in <img> tags. */
export function spriteUrl(c: HTMLCanvasElement): string {
  let u = urls.get(c)
  if (!u) {
    u = c.toDataURL()
    urls.set(c, u)
  }
  return u
}
