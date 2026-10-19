# Prompts para los fondos (ChatGPT / generador de imágenes)

Los prompts están en inglés porque los generadores de imagen lo entienden mejor. Copia cada bloque tal cual. Se ajustaron (2026-10-18) a lo que hace el código: paleta, proporciones y tamaño de los personajes del juego.

## Cómo usarlos

1. Pega primero el **bloque de estilo** y luego el prompt de cada fondo, en el mismo mensaje.
2. ChatGPT genera como máximo **1024×1536** (vertical) o **1536×1024** (horizontal). El fondo largo son **3 imágenes verticales** que el juego pega solas.
3. Una IA no dibuja pixeles reales. El juego redibuja la imagen en su propia cuadrícula (en celular el ancho es de unos 125 pixeles lógicos; en computadora unos 480), así que pide pixeles **grandes y planos** y los detalles chicos se pierden.
4. No pidas texto dentro de las imágenes. El título "León Águila" va en el código.
5. Guárdalas en `client/public/bg/` como `home.png`, `home-wide.png`, `game-1.png` (suelo), `game-2.png` (cielo), `game-3.png` (espacio). El juego las usa solas.

## Lo que el código dicta (por qué los prompts dicen lo que dicen)

- **Pixeles:** la escena se dibuja a 240 pixeles de alto y se amplía sin suavizar. Por eso: bloques grandes, sin degradados, sin ruido.
- **Personajes del juego:** una pastilla de 24×32 pixeles (el 5 % del ancho en computadora, el 19 % en celular), contorno oscuro del mismo color, 3 tonos. El león mide 44×44 y el águila 60×44 sobre una roca gris, de frente, con las alas abiertas.
- **Suelo:** el personaje se para en la línea del pasto, a un 7 % de la altura total de la columna desde abajo. El pasto es de dos verdes (`#4aa63a` con borde claro `#8ee06a`, sombra `#3f8f31`) sobre tierra `#8a5a35`.
- **Cielo:** bandas de color planas con borde punteado, de `#fbf1c8` (horizonte) a `#17235f` (espacio), pasando por `#dcf0f8`, `#a8d0f2`, `#6c9ee2`, `#4f7fd3`, `#2a4ba8`, `#1f3590`.
- **Interfaz que va encima:** cajas azul marino `#151d4a` con borde celeste `#7ec8f2`, oro `#ffd23f`, rosa `#ff5c8a`. Los fondos deben ser **claros y suaves** para que las cajas oscuras resalten.
- **Qué se tapa:** en celular la caja de la sala cubre casi todo el centro, así que lo importante va en los bordes y abajo. En el juego, la pregunta tapa la parte de arriba y el personaje está abajo.

## Bloque de estilo (va siempre primero)

```
Style: simple, cute, friendly pixel art for a party game, in the look of a handheld console game. Very chunky low-resolution pixels, every pixel a clearly visible flat square, as if the image were only 192 pixels wide and then enlarged with nearest-neighbor. No anti-aliasing, no blur, no gradients, no glow, no dithering noise: flat bands of solid color only. Every object has a 1-pixel outline in a darker shade of ITS OWN color, never pure black. Each object uses exactly three tones: a base color, a lighter highlight on the left/top, and a darker shade on the right/bottom. Palette, use only these families: sky blues #7ec8f2, #a8d0f2, #6c9ee2, #4f7fd3, #2a4ba8; deep navy #17235f; warm cream #fbf1c8 and #fde9b8; clouds white #ffffff with light blue-grey shadows #d3e4f7 and #b9d0ec; grass greens #8ee06a, #4aa63a, #3f8f31 and hills #6fb87a, #58a85a; dirt brown #8a5a35 and #6d4526; golden yellow #ffd23f; small touches of pink #ff5c8a. Rounded, soft, kawaii shapes. Absolutely no text, letters, logos, UI, watermark, or any characters other than the ones I describe.
```

---

## 1. Carátula y pantallas principales (inicio y sala de espera)

La tarjeta con los botones va encima. Lo de arriba lo tapa el título "León Águila" (gigante, en oro) y el centro lo tapa la tarjeta.

### 1A. Vertical (celulares), 1024×1536 → `home.png`

```
[pega aquí el bloque de estilo]

Create a vertical background, portrait 2:3. A bright daytime sky made of flat horizontal bands: from sky blue #7ec8f2 at the top, through #a8d0f2 and #dcf0f8, to warm cream #fbf1c8 at the horizon, which sits at about 82% of the image height. A big round pale-yellow pixel sun in the upper right corner. Chunky flat pixel clouds only along the left and right edges, never in the middle. Four tiny far-away birds drawn as small "v" shapes in dark blue. Below the horizon: two layers of rolling pixel hills (#6fb87a far, #58a85a near), then a strip of grass (#4aa63a with a lighter #8ee06a top edge) over brown dirt (#8a5a35). The grass and dirt together take the bottom 14% of the image. In the bottom-left corner stands a cute front-facing LION cub sitting, with a big round orange mane (#a85a1c, #c9782e, #7c3b12), golden fur (#e9a93f), small pink ears and a smiling face. In the bottom-right corner stands a cute front-facing EAGLE with a white head, golden beak and feet, brown body (#7a4a22) and wings spread wide, perched on a small grey rock. The lion is about 26% of the image width and the eagle about 32%; both are chunky and symmetrical. Both stay partly cut by the image edges. VERY IMPORTANT: everything between 12% and 80% of the height and between 10% and 90% of the width must be only plain sky and a couple of faint clouds, because a menu card will cover it. No text.
```

### 1B. Horizontal (computadora), 1536×1024 → `home-wide.png`

```
[pega aquí el bloque de estilo]

Create a horizontal background, landscape 3:2, same scene as a handheld-game title screen. Flat bright daytime sky from sky blue #7ec8f2 at the top to warm cream #fbf1c8 at the horizon, which sits at about 78% of the image height. A round pale-yellow pixel sun in the upper right. Chunky flat pixel clouds spread along the top edge and drifting near the left and right sides. A few tiny far-away birds as dark blue "v" shapes. Two layers of rolling pixel hills (#6fb87a far, #58a85a near), then grass (#4aa63a with a lighter #8ee06a top edge) and brown dirt (#8a5a35), together the bottom 14%. On the far left stands a cute front-facing LION cub with a big round orange mane (#a85a1c, #c9782e, #7c3b12) and golden fur (#e9a93f); on the far right, a cute front-facing EAGLE with white head, golden beak and feet, brown wings spread wide, perched on a small grey rock. The lion is about 16% of the image width and the eagle about 20%. VERY IMPORTANT: keep the center (from 25% to 75% of the width and from 8% to 85% of the height) empty and calm, only plain sky. No text.
```

### 1C. Emblema (opcional, no se usa todavía)

```
[pega aquí el bloque de estilo]

A small round pixel-art emblem on a plain white background: a cute lion head on the left and a cute eagle head on the right, facing each other, with a small golden crown between them and a few tiny sparkles. Symmetrical, centered, chunky, friendly. Same colors as the lion (orange mane, golden fur) and the eagle (white head, golden beak, brown feathers). No text.
```

---

## 2. Fondo largo para cuando se juega

Es una sola columna muy alta por la que sube el personaje: suelo → cielo → espacio. Son 3 imágenes de 1024×1536 pegadas una encima de otra (la 1 abajo). El juego las estira al ancho de la pantalla y la cámara sigue al personaje. Los números de altitud (1000 M, 2000 M…) los pone el código, no los dibujes.

Colores de empalme (las orillas deben coincidir **exactamente**):

| Borde | Color |
|---|---|
| Arriba de `game-1.png` (suelo) | `#a8d0f2`, banda lisa |
| Arriba de `game-2.png` (cielo) | `#4f7fd3`, banda lisa |
| Arriba de `game-3.png` (espacio) | `#17235f` con estrellas |

Para las tres: nubes y adornos solo en el 20 % de cada lado; el centro (donde está el personaje y donde caen las cajas) tranquilo.

### 2A. Abajo: el suelo, 1024×1536 → `game-1.png`

```
[pega aquí el bloque de estilo]

Create the BOTTOM section of a very tall vertical game background, portrait 2:3. The bottom 28% is the ground seen from the side: two layers of rolling pixel hills behind (#6fb87a far, #58a85a near), then a flat strip of grass (#4aa63a with a lighter #8ee06a top edge and a darker #3f8f31 lower band) over brown dirt (#8a5a35 with a darker #6d4526 line and small pebbles). The grass line where a small character stands is at about 21% of the image height measured from the bottom. A few tiny flowers (yellow #ffd23f and pink #ff5c8a) and small stones on the grass. On the left, a cute front-facing LION cub sitting on the grass (big round orange mane #a85a1c / #c9782e / #7c3b12, golden fur #e9a93f, small pink ears), about 22% of the image width. On the right, a cute front-facing EAGLE (white head, golden beak and feet, brown body, wings spread wide) perched on a small grey rock, about 28% of the image width. A clear empty gap in the center, about 40% of the width. Above the ground the sky is made of flat horizontal bands from warm cream #fbf1c8 at the horizon, through #dcf0f8 and #c4e3f6, up to #a8d0f2 at the very top of the image. A few small flat pixel clouds only near the left and right edges, in the upper half. The TOP EDGE of the image must be a plain flat band of #a8d0f2 with nothing touching it, so another image can continue above it. No text.
```

### 2B. En medio: el cielo, 1024×1536 → `game-2.png`

Sube la imagen 2A a ChatGPT y escribe:

```
[pega aquí el bloque de estilo]

I uploaded the bottom section of a tall vertical game background. Create the NEXT section that goes directly ABOVE it, portrait 2:3, same pixel-art style, same pixel size and same width. The BOTTOM EDGE of the new image must match the TOP EDGE of the uploaded image exactly (a plain flat band of #a8d0f2) so they can be stacked with no visible seam. Going upward, the sky changes in flat horizontal bands from #a8d0f2 to #6c9ee2 to medium blue #4f7fd3 at the very top. Add big chunky flat pixel clouds (white with #d3e4f7 and #b9d0ec shadows) mostly along the left and right edges, a few tiny far-away birds as dark "v" shapes, and one small cute hot-air balloon far on the left edge. Keep the center 60% of the width calm and almost empty. The TOP EDGE must be a plain flat band of #4f7fd3 with nothing touching it. No text.
```

### 2C. Arriba: el espacio, 1024×1536 → `game-3.png`

Sube la imagen 2B y escribe:

```
[pega aquí el bloque de estilo]

I uploaded the middle section of a tall vertical game background. Create the NEXT section that goes directly ABOVE it, portrait 2:3, same pixel-art style, same pixel size and same width. The BOTTOM EDGE of the new image must match the TOP EDGE of the uploaded image exactly (a plain flat band of #4f7fd3). Going upward, the sky changes in flat horizontal bands from #4f7fd3 to #2a4ba8, #1f3590 and finally dark navy #17235f at the top, and becomes outer space: many single-pixel stars in white and light blue #9db8ff, some bigger four-point sparkle stars, a cream crescent moon (#fff4c2) near the right edge, a small purple ringed planet (#c77dff with a golden #ffd23f ring) near the left edge, and two tiny shooting stars. Keep the center 60% of the width calm, with only small stars. The top of the image is the highest point, so it is the darkest and most starry. No text.
```

---

---

## 3. Fondo largo HORIZONTAL (para computadora)

Es lo mismo que el fondo largo vertical, pero en 3 imágenes horizontales de **1536×1024**. En pantallas anchas el juego las usa en lugar de las verticales (en celular sigue usando las verticales). Se guardan como `game-wide-1.png` (suelo), `game-wide-2.png` (cielo) y `game-wide-3.png` (espacio) en `client/public/bg/`. Los colores de empalme son los mismos de la tabla de arriba. La línea del pasto donde se para el personaje debe quedar a un **18 % de la altura, medida desde abajo**.

Importante: en computadora el león y el águila se ven más chicos en proporción (cada uno ocupa aprox. 10 % y 13 % del ancho), y el centro de la imagen tiene que quedar limpio, porque ahí está la caja de la pregunta y el personaje.

### 3A. Abajo: el suelo, 1536×1024 → `game-wide-1.png`

```
[pega aquí el bloque de estilo]

Create the BOTTOM section of a very tall game background, but in LANDSCAPE format 3:2 (1536x1024). The bottom 24% is the ground seen from the side: two layers of rolling pixel hills behind (#6fb87a far, #58a85a near) with a low flat gap in the middle, then a flat strip of grass (#4aa63a with a lighter #8ee06a top edge and a darker #3f8f31 lower band) over brown dirt (#8a5a35 with a darker #6d4526 line and small pebbles). The line where a small character stands, the top edge of the grass, is exactly at 18% of the image height measured from the bottom. A few tiny flowers (yellow #ffd23f and pink #ff5c8a) and small stones on the grass. On the far left, a cute front-facing LION cub sitting on the grass (big round orange mane #a85a1c / #c9782e / #7c3b12, golden fur #e9a93f, small pink ears), about 10% of the image width. On the far right, a cute front-facing EAGLE (white head, golden beak and feet, brown body, wings spread wide) perched on a small grey rock, about 13% of the image width. The whole middle 60% of the width stays empty (only hills, grass and flowers). Above the ground the sky is made of flat horizontal bands from warm cream #fbf1c8 at the horizon, through #dcf0f8 and #c4e3f6, up to #a8d0f2 at the very top of the image. Chunky flat pixel clouds only near the left and right edges. The TOP EDGE of the image must be a plain flat band of #a8d0f2 with nothing touching it, so another image can continue above it. No text.
```

### 3B. En medio: el cielo, 1536×1024 → `game-wide-2.png`

Sube la imagen 3A a ChatGPT y escribe:

```
[pega aquí el bloque de estilo]

I uploaded the bottom section of a tall game background in landscape format. Create the NEXT section that goes directly ABOVE it, also LANDSCAPE 3:2 (1536x1024), same pixel-art style, same pixel size and same width. The BOTTOM EDGE of the new image must match the TOP EDGE of the uploaded image exactly (a plain flat band of #a8d0f2) so they can be stacked with no visible seam. Going upward, the sky changes in flat horizontal bands from #a8d0f2 to #6c9ee2 to medium blue #4f7fd3 at the very top. Add chunky flat pixel clouds (white with #d3e4f7 and #b9d0ec shadows) spread along the left and right thirds, several tiny far-away birds as dark "v" shapes, and one small cute hot-air balloon near the left edge. Keep the middle 40% of the width calm and almost empty. The TOP EDGE must be a plain flat band of #4f7fd3 with nothing touching it. No text.
```

### 3C. Arriba: el espacio, 1536×1024 → `game-wide-3.png`

Sube la imagen 3B y escribe:

```
[pega aquí el bloque de estilo]

I uploaded the middle section of a tall game background in landscape format. Create the NEXT section that goes directly ABOVE it, also LANDSCAPE 3:2 (1536x1024), same pixel-art style, same pixel size and same width. The BOTTOM EDGE of the new image must match the TOP EDGE of the uploaded image exactly (a plain flat band of #4f7fd3). Going upward, the sky changes in flat horizontal bands from #4f7fd3 to #2a4ba8, #1f3590 and finally dark navy #17235f at the top, and becomes outer space: many single-pixel stars in white and light blue #9db8ff, some bigger four-point sparkle stars, a cream crescent moon (#fff4c2) near the right edge, a small purple ringed planet (#c77dff with a golden #ffd23f ring) near the left edge, and two tiny shooting stars. Keep the middle 40% of the width calm, with only small stars. The top of the image is the highest point, so it is the darkest and most starry. No text.
```

## Si algo sale distinto

- **Sale con degradados, brillo o pixeles finos:** añade al final "strictly flat colors, big hard square pixels, no soft gradients, no glow, as if only 192 pixels wide".
- **Los bordes no empatan:** pídele "keep the bottom 60 px of the new image identical to the top 60 px of the uploaded one".
- **Salen letras:** añade "absolutely no text or writing anywhere".
- **Los animales salen muy grandes o muy chicos:** cambia el porcentaje del ancho (lion 22 %, eagle 28 % en vertical).
- **Los colores se ven apagados o distintos:** repite los códigos de color del bloque de estilo y di "use exactly these hex colors".
