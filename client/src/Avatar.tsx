import type { Avatar as AvatarData } from '../../shared/protocol'
import { avatarUrl } from './pixel/avatar'

export { COLORS, hatName } from './pixel/avatar'

/** The pixel-art character (20x24 sprite) scaled with nearest-neighbour. */
export function Avatar({ a, size = 96 }: { a: AvatarData; size?: number }) {
  return (
    <img
      src={avatarUrl(a)}
      width={size}
      height={size * 1.2}
      alt=""
      draggable={false}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  )
}
