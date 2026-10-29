import type { PlayerView } from '../../shared/protocol'
import { COLORS } from './pixel/avatar'

const WHITE = 11 // the white character: its name is white with a grey border so it can be read

/** A player's name in the colour of their character. */
export function PlayerName({ p }: { p: PlayerView }) {
  const white = p.avatar.color === WHITE
  return (
    <b className={'pname' + (white ? ' white' : '')} style={white ? undefined : { color: COLORS[p.avatar.color] ?? '#fff' }}>
      {p.nick}
    </b>
  )
}
