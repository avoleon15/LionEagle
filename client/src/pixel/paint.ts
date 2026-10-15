// Tiny pixel-art toolkit: every call writes whole pixels (no anti-aliasing) onto an offscreen canvas.

export function shade(color: string, f: number): string {
  const n = parseInt(color.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const t = f >= 0 ? 255 : 0
    return Math.round(v + (t - v) * Math.abs(f))
  })
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('')
}

export class Painter {
  readonly canvas: HTMLCanvasElement
  readonly g: CanvasRenderingContext2D

  constructor(readonly w: number, readonly h: number) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = w
    this.canvas.height = h
    this.g = this.canvas.getContext('2d', { willReadFrequently: true })!
  }

  px(x: number, y: number, c: string) {
    this.g.fillStyle = c
    this.g.fillRect(x, y, 1, 1)
  }

  rect(x: number, y: number, w: number, h: number, c: string) {
    this.g.fillStyle = c
    this.g.fillRect(x, y, w, h)
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, c: string) {
    this.g.fillStyle = c
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx
        const dy = (y + 0.5 - cy) / ry
        if (dx * dx + dy * dy <= 1) this.g.fillRect(x, y, 1, 1)
      }
    }
  }

  disc(cx: number, cy: number, r: number, c: string) {
    this.ellipse(cx, cy, r, r, c)
  }

  /** Scanline polygon fill sampled at pixel centres. */
  poly(pts: [number, number][], c: string) {
    this.g.fillStyle = c
    const ys = pts.map((p) => p[1])
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const yc = y + 0.5
      const xs: number[] = []
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i]
        const [x2, y2] = pts[(i + 1) % pts.length]
        if ((y1 <= yc && y2 > yc) || (y2 <= yc && y1 > yc)) xs.push(x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1))
      }
      xs.sort((a, b) => a - b)
      for (let i = 0; i + 1 < xs.length; i += 2) {
        for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++) this.g.fillRect(x, y, 1, 1)
      }
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, c: string) {
    this.g.fillStyle = c
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      this.g.fillRect(x0, y0, 1, 1)
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) { err += dy; x0 += sx }
      if (e2 <= dx) { err += dx; y0 += sy }
    }
  }

  /** Stamps hand-drawn rows; '.' is transparent, other characters index `pal`. */
  rows(x: number, y: number, art: string[], pal: Record<string, string>) {
    art.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const c = pal[row[i]]
        if (c) this.px(x + i, y + j, c)
      }
    })
  }

  /** Copies the already drawn pixels mirrored left-to-right over the right half. */
  mirrorHalf() {
    const half = Math.floor(this.w / 2)
    const src = this.g.getImageData(0, 0, half, this.h)
    const tmp = document.createElement('canvas')
    tmp.width = half
    tmp.height = this.h
    tmp.getContext('2d')!.putImageData(src, 0, 0)
    this.g.save()
    this.g.translate(this.w, 0)
    this.g.scale(-1, 1)
    this.g.drawImage(tmp, 0, 0)
    this.g.restore()
  }

  /** One-pixel outline around everything drawn so far (needs a transparent margin). */
  outline(c: string) {
    const img = this.g.getImageData(0, 0, this.w, this.h)
    const d = img.data
    const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < this.w && y < this.h && d[(y * this.w + x) * 4 + 3] > 0
    const marks: [number, number][] = []
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) marks.push([x, y])
      }
    }
    for (const [x, y] of marks) this.px(x, y, c)
  }
}
