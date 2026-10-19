import { useEffect, useRef, useState } from 'react'
import { BG_FILES, buildHome, cloudSprite, loadImage, rng } from './pixel/world'

// Full-screen background of the title screen and the lobby. Uses the picture in client/public/bg/ when it
// exists (portrait on phones, landscape on wide screens); otherwise a drawn pixel-art landscape.

const H0 = 240

export function Backdrop() {
  const [picture, setPicture] = useState<string | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let alive = true
    const wide = window.innerWidth > window.innerHeight
    const [first, second] = wide ? [BG_FILES.homeWide, BG_FILES.home] : [BG_FILES.home, BG_FILES.homeWide]
    loadImage(first)
      .then((img) => img ?? loadImage(second))
      .then((img) => alive && img && setPicture(img.src))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (picture) return
    const el = wrap.current!
    const cv = canvas.current!
    let W = 0
    let H = 0
    let bg: HTMLCanvasElement | null = null
    let raf = 0
    let last = performance.now()
    const r = rng(21)
    const kinds = [cloudSprite(34, 14, 1), cloudSprite(48, 17, 3), cloudSprite(24, 10, 2)]
    let clouds: { x: number; y: number; speed: number; sprite: HTMLCanvasElement }[] = []

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
      if (nw === W && nh === H && bg) return
      W = nw
      H = nh
      bg = buildHome(W, H)
      clouds = Array.from({ length: Math.max(4, Math.round(W / 60)) }, (_, i) => ({
        x: r() * W,
        y: 8 + r() * H * 0.45,
        speed: 2 + r() * 4,
        sprite: kinds[i % kinds.length],
      }))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const frame = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const g = cv.getContext('2d')
      if (g && bg) {
        g.imageSmoothingEnabled = false
        g.drawImage(bg, 0, 0)
        for (const c of clouds) {
          c.x += c.speed * dt
          if (c.x > W + 4) c.x = -c.sprite.width - 4
          g.drawImage(c.sprite, Math.round(c.x), Math.round(c.y))
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [picture])

  return (
    <div className="backdrop" ref={wrap} aria-hidden>
      {picture ? <div className="picture" style={{ backgroundImage: `url(${picture})` }} /> : <canvas ref={canvas} />}
    </div>
  )
}
