import { useEffect, useRef } from 'react'
import { AVATAR_OPTIONS, type Avatar } from '../../shared/protocol'
import { avatarSprite } from './pixel/avatar'
import { eagleSprite, lionSprite, rockSprite } from './pixel/mascots'

// Dev-only art gallery at /sprites: every customiser option and the mascots, magnified.
function Sprite({ src, scale }: { src: HTMLCanvasElement; scale: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    c.width = src.width
    c.height = src.height
    c.getContext('2d')!.drawImage(src, 0, 0)
  }, [src])
  return <canvas ref={ref} style={{ width: src.width * scale, height: src.height * scale, imageRendering: 'pixelated' }} />
}

const base: Avatar = { color: 5, face: 0, hat: 0, pants: 0 }
const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export function Sprites() {
  const row = (label: string, items: Avatar[]) => (
    <div style={{ margin: '8px 0' }}>
      <b>{label}</b>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', background: '#9fd3f5', padding: 8, borderRadius: 8 }}>
        {items.map((a, i) => <Sprite key={i} src={avatarSprite(a)} scale={5} />)}
      </div>
    </div>
  )
  return (
    <div style={{ padding: 16, background: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: 16, background: '#9fd3f5', padding: 8, borderRadius: 8, alignItems: 'flex-end' }}>
        <Sprite src={lionSprite()} scale={5} />
        <Sprite src={eagleSprite()} scale={5} />
        <Sprite src={rockSprite()} scale={5} />
      </div>
      {row('Colores', range(AVATAR_OPTIONS.color).map((color) => ({ ...base, color })))}
      {row('Caras', range(AVATAR_OPTIONS.face).map((face) => ({ ...base, face })))}
      {row('Gorros y pelo', range(AVATAR_OPTIONS.hat).map((hat) => ({ ...base, hat })))}
      {row('Pantalones', range(AVATAR_OPTIONS.pants).map((pants) => ({ ...base, pants })))}
    </div>
  )
}
