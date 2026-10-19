import type { Avatar as AvatarData } from '../../shared/protocol'
import { AVATAR_H, AVATAR_W, avatarUrl } from './pixel/avatar'

export { COLORS, faceName, hatName } from './pixel/avatar'

/** The pixel-art pill character (24x32 sprite) scaled with nearest-neighbour. */
export function Avatar({ a, size = 96 }: { a: AvatarData; size?: number }) {
  return (
    <img
      src={avatarUrl(a)}
      width={size}
      height={(size * AVATAR_H) / AVATAR_W}
      alt=""
      draggable={false}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  )
}
