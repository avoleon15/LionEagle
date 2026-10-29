// Small icons drawn pixel by pixel, in the same style as the arrows and the characters: each letter is a colour, a dot is empty.

function PixelIcon({ rows, colors, size, label }: { rows: string[]; colors: Record<string, string>; size: number; label?: string }) {
  return (
    <svg
      className="pixicon"
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      width={size}
      height={(size * rows.length) / rows[0].length}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (colors[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors[c]} /> : null)),
      )}
    </svg>
  )
}

const TOMATO = [
  '....g..g....',
  '...gggggg...',
  '..rrrggrrr..',
  '.rrrrrrrrrr.',
  '.rwwrrrrrrr.',
  'rrwrrrrrrrrd',
  'rrrrrrrrrrrd',
  'rrrrrrrrrrdd',
  '.rrrrrrrrdd.',
  '.rrrrrrrddd.',
  '..rrrrdddd..',
  '...dddddd...',
]
export const TomatoIcon = ({ size = 32 }: { size?: number }) => (
  <PixelIcon rows={TOMATO} size={size} colors={{ r: '#e63946', d: '#a4161a', w: '#ff9aa2', g: '#4fb83a' }} />
)

const CHAT = [
  '..oooooooooooo..',
  '.owwwwwwwwwwwwo.',
  'owwwwwwwwwwwwwwo',
  'owwwwwwwwwwwwwso',
  'owwwddwddwddwwso',
  'owwwddwddwddwwso',
  'owwwwwwwwwwwwwso',
  'owwwwwwwwwwwwsso',
  '.oooowwoooooooo.',
  '....owwo........',
  '....owo.........',
  '.....oo.........',
]
export const ChatIcon = ({ size = 32 }: { size?: number }) => (
  <PixelIcon rows={CHAT} size={size} colors={{ o: '#1b1426', w: '#fffdf2', s: '#bfc9e0', d: '#22306f' }} />
)
