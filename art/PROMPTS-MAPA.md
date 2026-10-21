# El mapa grande: 14 piezas, para celular y para computadora

El personaje sube del suelo al espacio profundo. Antes el mapa eran 3 imágenes; ahora son **14 piezas apiladas** (la 01 abajo, la 14 arriba), o sea unas 4.7 veces más alto: por cada punto que ganas, el personaje sube casi 5 veces más. Se generan **dos juegos de 14**: uno **vertical** para celular y otro **horizontal** para computadora.

## Resumen del recorrido (de abajo hacia arriba)

| # | Qué hay | Color del borde de ARRIBA |
|---|---|---|
| 01 | Suelo con el león y el águila, y la silueta de la Estatua de la Libertad al fondo | `#a8d0f2` |
| 02 | Pirámides de Giza, la Torre Eiffel y el Everest detrás, saliendo de un mar de nubes | `#7ec8f2` |
| 03 | Cielo con nubes, pájaros y un globo | `#4f7fd3` |
| 04 | Un cohete subiendo | `#2a4ba8` |
| 05 | La Luna, muy grande | `#17235f` |
| 06 | Marte y un alien | `#141b4d` |
| 07 | Asteroides | `#101640` |
| 08 | Júpiter | `#0d1238` |
| 09 | Saturno | `#0a0f2c` |
| 10 | Una nave alienígena | `#080c24` |
| 11 | Un agujero negro | `#060a1c` |
| 12 | Planeta lejano 1 (otra galaxia) | `#050818` |
| 13 | Planeta lejano 2 (otra galaxia) | `#04061a` |
| 14 | Planeta lejano 3 (otra galaxia), la parte más lejana y estrellada | `#030514` |

**Regla de oro del empalme:** el borde de ABAJO de cada pieza debe ser **exactamente** el color del borde de ARRIBA de la pieza anterior (la de la tabla). Cada pieza empieza y termina con una **franja plana de un solo color**, sin nada tocándola, de unos 120 px de alto. Por eso en cada prompt se repiten los dos colores.

## Cómo generarlas (orden y trucos)

1. Genera **primero todo el juego vertical** (pieza 01 a 14), y después todo el horizontal.
2. **Pieza 01:** pega el bloque de estilo + el bloque de formato + el prompt de la pieza 01. No subas ninguna imagen.
3. **Piezas 02 a 14:** sube la pieza anterior ya generada y pega el bloque de estilo + el de formato + el prompt de la pieza. Todos los prompts ya empiezan diciendo "I uploaded the previous piece", así que sirve igual.
4. Si el borde no empata, pídele: *"keep the bottom 60 px of the new image identical to the top 60 px of the uploaded one"*. Si aun así no empata, no te preocupes: yo igualo las franjas con un script cuando me las pases.
5. Guarda las piezas verticales como `map-01.png` ... `map-14.png` y las horizontales como `map-wide-01.png` ... `map-wide-14.png` en `client/public/bg/`. El juego las detecta solo y las apila.
6. Si una pieza no te gusta, regenera solo esa y la siguiente (porque la siguiente se apoya en su borde).

## Para que pesen poco
Cada prompt le pide a ChatGPT **colores planos, pocos colores y nada de ruido ni degradados suaves**. Eso hace que el PNG pese muy poco. Además, cuando me las pases, yo las convierto a una paleta chica (PNG indexado o WebP) con un script; el peso final suele bajar a menos de la mitad. Si ChatGPT te deja elegir el formato de descarga, escoge **WebP o PNG**.

---

## Bloque de estilo (va SIEMPRE primero, en las 28 imágenes)

```
Style: simple, cute, friendly pixel art for a party game, in the look of a handheld console game. Very chunky low-resolution pixels, every pixel a clearly visible flat square, as if the image were only 192 pixels wide and then enlarged with nearest-neighbor. No anti-aliasing, no blur, no gradients, no glow, no soft shading, no dithering noise, no film grain: flat bands of solid color only. Use a SMALL palette, at most 24 different colors in the whole image, so the file stays light. Every object has a 1-pixel outline in a darker shade of ITS OWN color, never pure black. Each object uses exactly three tones: a base color, a lighter highlight on the left/top, and a darker shade on the right/bottom. Palette families: sky blues #7ec8f2, #a8d0f2, #6c9ee2, #4f7fd3, #2a4ba8; deep space navies #17235f, #141b4d, #101640, #0d1238, #0a0f2c, #080c24, #060a1c, #050818, #04061a, #030514; warm cream #fbf1c8; clouds white #ffffff with light blue-grey shadows #d3e4f7 and #b9d0ec; grass greens #8ee06a, #4aa63a, #3f8f31; dirt brown #8a5a35; golden yellow #ffd23f; moon cream #fff4c2; Mars red #d9573a and #a8402a; accents pink #ff5c8a, purple #c77dff, teal #4cc9f0, alien green #8ee06a. Rounded, soft, kawaii shapes. Absolutely no text, letters, numbers, logos, UI, watermark, or any characters other than the ones I describe.
```

## Bloque de formato (pega UNO de los dos, según el juego que estés generando)

**Vertical (celular), 1024×1536:**
```
FORMAT: portrait 2:3, 1024x1536. The image is one slice of a very tall vertical column that continues above and below it. The player character stands in the horizontal CENTER of the column, so keep the central 40% of the width calm and mostly empty (only tiny stars or faint details there); put the main subjects and decorations in the left and right thirds, partly cut by the image edges if you like. The TOP 120 px of the image must be one plain flat band of the top color I give, and the BOTTOM 120 px one plain flat band of the bottom color I give, with nothing touching those bands. The bottom band must match the uploaded previous piece's top band exactly.
```

**Horizontal (computadora), 1536×1024:**
```
FORMAT: landscape 3:2, 1536x1024. The image is one slice of a very tall column that continues above and below it, shown on a wide screen. The player character stands in the horizontal CENTER of the screen, so keep the middle 40% of the width calm and mostly empty (only tiny stars or faint details there); put the main subjects and decorations in the left and right thirds, partly cut by the image edges if you like. The TOP 120 px of the image must be one plain flat band of the top color I give, and the BOTTOM 120 px one plain flat band of the bottom color I give, with nothing touching those bands. The bottom band must match the uploaded previous piece's top band exactly.
```

---

## Las 14 piezas (el mismo texto sirve para vertical y horizontal; el bloque de formato decide la forma)

En cada prompt, `<TOP>` y `<BOTTOM>` ya están escritos con sus colores.

### Pieza 01: el suelo y la Estatua de la Libertad (no subas imagen)
```
[bloque de estilo] [bloque de formato]

PIECE 01 of 14, the very bottom of the column. BOTTOM band: this is the ground, so instead of a flat band the bottom 22% of the image is the ground seen from the side: two layers of rolling pixel hills behind (#6fb87a far, #58a85a near), then a flat strip of grass (#4aa63a with a lighter #8ee06a top edge and a darker #3f8f31 lower band) over brown dirt (#8a5a35 with small pebbles). The line where a small character stands, the top edge of the grass, is at 18% of the image height measured from the bottom. A few tiny flowers (yellow #ffd23f and pink #ff5c8a). On the left, a cute front-facing LION cub sitting on the grass (big round orange mane #a85a1c / #c9782e / #7c3b12, golden fur #e9a93f, small pink ears); on the right, a cute front-facing EAGLE (white head, golden beak and feet, brown body, wings spread wide) perched on a small grey rock. In the far distance, standing on the hills, a soft pale blue-grey SILHOUETTE of the STATUE OF LIBERTY (torch raised, crown spikes, flowing robe), drawn in one flat light color #9cb6d6 with a slightly darker #86a2c4 shade, small (about 18% of the image height) and placed off-center (right third), so it reads as a distant landmark and does not distract. Above the ground the sky is flat horizontal bands from warm cream #fbf1c8 at the horizon, through #dcf0f8 and #c4e3f6, up to #a8d0f2. TOP band: plain flat #a8d0f2.
```

### Pieza 02: pirámides, Torre Eiffel y Everest sobre un mar de nubes
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 02 of 14, directly ABOVE it. BOTTOM band: plain flat #a8d0f2 (matches the uploaded piece). TOP band: plain flat #7ec8f2. In between, the sky goes from #a8d0f2 to #7ec8f2 in flat horizontal bands. Show famous world landmarks as small cute pixel silhouettes rising out of a thick sea of fluffy flat pixel clouds (white with #d3e4f7 and #b9d0ec shadows) that fills the lower third of the image: the THREE PYRAMIDS OF GIZA (sandy #e8c27a with #c9a05a shaded side), the EIFFEL TOWER (iron-brown #8a6a50 lattice shape, drawn simply), and, rising behind both and much larger, MOUNT EVEREST (grey-blue rock #8a9ab5, white snow cap #ffffff, shaded side #6c7c99). Everest is the biggest shape and sits in the back; the pyramids and the Eiffel Tower are in front of it, on the left and right thirds so the center stays calm. Add two tiny far-away birds. Keep the landmarks recognizable but very simple.
```

### Pieza 03: el cielo
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 03 of 14, directly ABOVE it. BOTTOM band: plain flat #7ec8f2. TOP band: plain flat #4f7fd3. In between, the sky goes from #7ec8f2 through #6c9ee2 to #4f7fd3 in flat horizontal bands. Big chunky flat pixel clouds (white with #d3e4f7 and #b9d0ec shadows) mostly on the left and right thirds, a few tiny far-away birds as dark blue "v" shapes, and one small cute hot-air balloon (yellow #ffd23f with pink #ff5c8a stripe) near one edge.
```

### Pieza 04: el cohete
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 04 of 14, directly ABOVE it. BOTTOM band: plain flat #4f7fd3. TOP band: plain flat #2a4ba8. The sky darkens in flat bands from #4f7fd3 to #2a4ba8 and the first tiny stars appear near the top. In the left third, a cute chunky pixel ROCKET flying upward (white body #f8f9fa with a lighter left highlight and #d8dde2 shade, red #d62828 nose cone and fins, round teal #4cc9f0 window, golden #ffd23f and orange #ff7a1a flame below) leaving a short trail of flat white pixel smoke puffs that fades out. A few thin high clouds on the right third only.
```

### Pieza 05: la Luna enorme
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 05 of 14, directly ABOVE it. BOTTOM band: plain flat #2a4ba8. TOP band: plain flat #17235f. The sky turns into dark space in flat bands from #2a4ba8 through #1f3590 to #17235f, with many single-pixel stars (white and light blue #9db8ff). A HUGE cute MOON dominates the piece: a giant cream #fff4c2 disc with golden #ffd23f rim light on the left, soft grey-cream craters #e3d49a and #cdbd82 of different sizes, with no face on it. The moon is so big that it fills most of the right two thirds and is partly cut by the right edge; a few small stars and one tiny shooting star on the left.
```

### Pieza 06: Marte y un alien
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 06 of 14, directly ABOVE it. BOTTOM band: plain flat #17235f. TOP band: plain flat #141b4d. Deep space with many single-pixel stars. The red planet MARS (base #d9573a, shade #a8402a, light #f08a5a, dark craters and a pale polar cap #fbf1c8) fills part of the left third, partly cut by the left edge. A cute friendly ALIEN floats on the right third: round green #8ee06a head with a lighter highlight and #5cb04a shade, two big black oval eyes with a white highlight pixel, a tiny smile, two little antennae with golden #ffd23f tips, a small light-blue #4cc9f0 round body, waving one hand.
```

### Pieza 07: asteroides
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 07 of 14, directly ABOVE it. BOTTOM band: plain flat #141b4d. TOP band: plain flat #101640. A field of cute chunky pixel ASTEROIDS drifting: irregular rocks in warm grey-brown (#9a8f86 base, #b8aea5 light, #6f655e shade) with small darker craters, in many sizes from tiny to big, tumbling in different directions, with a few tiny golden #ffd23f sparkling crystals stuck on some. Place the bigger asteroids in the left and right thirds and only tiny ones in the middle. Many single-pixel stars between them.
```

### Pieza 08: Júpiter
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 08 of 14, directly ABOVE it. BOTTOM band: plain flat #101640. TOP band: plain flat #0d1238. The giant planet JUPITER, huge and cute, partly cut by the left edge: horizontal flat bands in cream #fbf1c8, orange #e08a3c, brown #a8623a and pale tan #e9c79a with soft pixel-wave edges between the bands, a big oval GREAT RED SPOT (#c1442a with #8f2f1e shade) and a clear outline in dark brown. Two tiny moons (pale grey and pale yellow) orbit on the right. Many single-pixel stars.
```

### Pieza 09: Saturno
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 09 of 14, directly ABOVE it. BOTTOM band: plain flat #0d1238. TOP band: plain flat #0a0f2c. The ringed planet SATURN, big and cute, on the right third and partly cut by the right edge: a pale golden #f2d27a sphere with soft horizontal bands (#e0b85a and #fbf1c8) and a wide tilted ring system in cream #fbf1c8, golden #ffd23f and tan #c8a45a, the ring passing in front of the planet at the bottom and behind it at the top. A tiny moon near the left. Many single-pixel stars and one four-point sparkle.
```

### Pieza 10: nave alienígena
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 10 of 14, directly ABOVE it. BOTTOM band: plain flat #0a0f2c. TOP band: plain flat #080c24. A classic cute flying saucer (ALIEN SPACESHIP) flying across the left third: a metallic grey-blue #9db2cc disc with a lighter top highlight and #6f84a0 shade, a glass dome in transparent teal #4cc9f0 with a small green #8ee06a alien peeking out and waving, a row of round glowing yellow #ffd23f and pink #ff5c8a lights along the rim, and a short pale-green #c9ffb0 flat tractor beam pointing down (flat color, no glow). A second, much smaller saucer far away on the right third. Many single-pixel stars.
```

### Pieza 11: agujero negro
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 11 of 14, directly ABOVE it. BOTTOM band: plain flat #080c24. TOP band: plain flat #060a1c. A BLACK HOLE seen slightly from the side, on the right two thirds: a perfectly dark round center (#000000 with a dark purple #1a0a2e outline) surrounded by a thick swirling accretion disc made of chunky flat pixel bands in orange #ff7a1a, gold #ffd23f, pink #ff5c8a and purple #c77dff, stretched into an oval and warped around the top and bottom of the hole. A few stars on the left are stretched into short curved pixel streaks near the hole. Keep the left third calm with only tiny stars.
```

### Pieza 12: planeta lejano 1 (otra galaxia)
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 12 of 14, directly ABOVE it. BOTTOM band: plain flat #060a1c. TOP band: plain flat #050818. Very far away, another galaxy: a small cute pixel SPIRAL GALAXY (purple #c77dff and pink #ff5c8a arms with a golden #ffd23f core, drawn in flat chunky pixels) in the background on the left, and in front of it, on the right third, a cute teal PLANET (#4cc9f0 base, #2f9ac0 shade, #a8e4ff light) with green #8ee06a continents and a thin white pixel ring. Many tiny stars.
```

### Pieza 13: planeta lejano 2 (otra galaxia)
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 13 of 14, directly ABOVE it. BOTTOM band: plain flat #050818. TOP band: plain flat #04061a. Another far galaxy: a small cute flat-pixel ELLIPTICAL GALAXY in soft blue #6c9ee2 on the right in the background, and a molten LAVA PLANET on the left third, partly cut by the left edge: dark red-brown #5a2a22 sphere with glowing orange #ff7a1a and yellow #ffd23f lava cracks, a lighter highlight, and two tiny rocky moons. Many tiny stars and one tiny shooting star.
```

### Pieza 14: planeta lejano 3 y el borde del universo
```
[bloque de estilo] [bloque de formato]

I uploaded the previous piece. Create PIECE 14 of 14, the very TOP of the column. BOTTOM band: plain flat #04061a. TOP band: plain flat #030514 (the darkest, with a few tiny stars allowed even in the band). A far-away NEBULA in flat chunky pixel bands of purple #c77dff, pink #ff5c8a and blue #4f7fd3 behind everything on the right two thirds, and in front of it a cute ICE PLANET on the left third: pale violet #c9b8ff sphere with white #ffffff polar caps, lilac #8e7cc3 shade, soft horizontal pixel stripes and three tiny moons of different sizes orbiting it. This is the highest point of the map, so make it the most starry: many single-pixel stars, several four-point sparkles and one very small bright golden #ffd23f star near the top.
```

---

## Cuando las tengas
Pásamelas (o ponlas en `client/public/bg/` con los nombres de arriba) y yo:
1. Igualo las franjas de empalme que no coincidan.
2. Las comprimo a una paleta chica para que pesen poco.
3. Ajusto en qué punto del mapa se para el personaje en el suelo.
4. Pruebo la subida completa en celular y computadora.

**Nota:** al terminar la partida los personajes solo hacen una animación de despegue (salen volando hacia arriba), pero la cámara no sube: el mapa que se ve es hasta donde llegó cada uno.
