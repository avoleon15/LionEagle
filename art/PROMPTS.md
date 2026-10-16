# Prompts para los fondos (ChatGPT / generador de imágenes)

Los prompts están en inglés porque los generadores de imagen lo entienden mejor. Copia cada bloque tal cual.

## Cómo usarlos

1. Pega primero el **bloque de estilo** y luego el prompt de cada fondo (en el mismo mensaje).
2. ChatGPT genera como máximo **1024×1536** (vertical) o **1536×1024** (horizontal). Para el fondo largo se hacen **3 imágenes verticales** y se pegan una encima de la otra.
3. Una IA no dibuja pixeles reales: la imagen sale "estilo pixel art" pero con bordes suaves. Después se baja a una cuadrícula chica (por ejemplo 256 px de ancho) con escalado de **vecino más cercano** para que los pixeles queden cuadrados y nítidos. Eso lo puedo hacer yo con un script cuando pongas las imágenes en esta carpeta (`art/`).
4. No pidas texto dentro de las imágenes (título, letras): los generadores lo escriben mal. El título "León Águila" va en el código.

## Bloque de estilo (va siempre primero)

```
Style: cute, friendly, simple pixel art for a mobile party game. Chunky low-resolution look with clearly visible square pixels, no anti-aliasing, no blur, no gradients and no dithering noise (large bands of flat color instead). Every object has a 1-pixel outline in a darker shade of ITS OWN color, never pure black. Each object uses exactly three tones: a base color, a lighter highlight on the left/top, and a darker shade on the right/bottom. Soft, saturated, cheerful palette: sky blues #7ec8f2 and #a8d0f2, warm cream #fde9b8, grass greens, golden yellow #f2a900, deep navy #17235f for the highest sky. Rounded, soft, kawaii-style shapes. No text, no letters, no logos, no UI, no watermark, no characters other than the ones I describe.
```

---

## 1. Carátula y pantallas principales (todas menos la de jugar)

Se usa detrás de la pantalla de inicio, la sala de espera y los resultados. La tarjeta con los botones va encima del centro, por eso el centro debe quedar tranquilo.

### 1A. Vertical (celulares), 1024×1536

```
[pega aquí el bloque de estilo]

Create a vertical background, portrait 2:3. Bright daytime sky in the upper two thirds, going from sky blue #7ec8f2 at the top to warm cream #fde9b8 near the horizon. A few big, soft, rounded pixel clouds placed only near the left and right edges and near the top. At the bottom, rolling green pixel-art hills with a few tiny flowers and a small wooden path. On the left hill sits a friendly cartoon LION cub, facing right, smiling. On the right hill sits a friendly cartoon EAGLE with its wings half open, facing left, smiling. Both are small (each about 15% of the image height), chunky and cute. Three tiny far-away birds in the sky. VERY IMPORTANT: leave the whole central area of the image, from 20% to 80% of the height and from 15% to 85% of the width, empty and calm (only plain sky), because a menu card will be placed there. No text.
```

### 1B. Horizontal (computadora), 1536×1024

```
[pega aquí el bloque de estilo]

Create a horizontal background, landscape 3:2, same scene as a mobile game title screen. Bright daytime sky from sky blue #7ec8f2 at the top to warm cream #fde9b8 at the horizon, with big soft pixel clouds spread along the top edge. At the bottom, rolling green pixel-art hills. On the far left hill sits a friendly cartoon LION cub facing right; on the far right hill sits a friendly cartoon EAGLE with its wings half open facing left; both small, chunky and smiling. A few tiny far-away birds. VERY IMPORTANT: keep the center of the image (from 25% to 75% of the width and from 10% to 85% of the height) empty and calm, only plain sky, because a menu card will be placed there. No text.
```

### 1C. Emblema para el título (opcional)

Solo el dibujo, sin letras. El texto "León Águila" lo pongo yo en la pantalla.

```
[pega aquí el bloque de estilo]

A small round pixel-art emblem on a transparent or plain white background: a cute lion head on the left and a cute eagle head on the right, facing each other, with a small golden crown between them and a few tiny sparkles. Symmetrical, centered, chunky, friendly. No text.
```

---

## 2. Fondo largo para cuando se juega

Es una columna muy alta por la que suben los personajes. Abajo está el suelo con el león y el águila, y al subir el cielo pasa de claro a azul profundo hasta el espacio con estrellas (arriba es donde salen volando al final). Como son 3 imágenes, hay que cuidar que **los bordes de cada una coincidan** con la siguiente. Los colores de empalme son:

| Borde | Color |
|---|---|
| Parte de arriba de la imagen A (suelo) | azul claro `#a8d0f2` |
| Parte de arriba de la imagen B (cielo) | azul medio `#4f7fd3` |
| Parte de arriba de la imagen C (espacio) | azul marino `#17235f` con estrellas |

Importante para las tres: deja las franjas laterales (15% a cada lado) con la mayor parte de los detalles y el centro más limpio, para que los personajes se vean bien al subir.

### 2A. Abajo: el suelo, 1024×1536

```
[pega aquí el bloque de estilo]

Create the BOTTOM section of a very tall vertical game background, portrait 2:3. The bottom 30% is green grassy ground seen from the side, with a few tiny flowers and small stones. Standing on the grass: a friendly cartoon LION cub on the left side and a friendly cartoon EAGLE with folded wings on the right side, both smiling and chunky, each about 12% of the image height, with a clear empty gap between them in the center. Above the ground the sky goes from warm cream #fde9b8 at the horizon, through light blue #c4e3f6, up to light blue #a8d0f2 at the very top edge of the image. A few small soft clouds near the left and right edges only. The TOP EDGE of the image must be a plain, flat band of #a8d0f2 sky with no clouds touching it, so another image can continue above it. No text.
```

### 2B. En medio: el cielo, 1024×1536

Sube la imagen 2A a ChatGPT y escribe:

```
[pega aquí el bloque de estilo]

I uploaded the bottom section of a tall vertical game background. Create the NEXT section that goes directly ABOVE it, portrait 2:3, same pixel-art style and same width. The BOTTOM EDGE of the new image must match the TOP EDGE of the uploaded image exactly (a flat band of light blue #a8d0f2) so they can be stacked with no visible seam. Going upward, the sky changes from light blue #a8d0f2 to medium blue #4f7fd3 at the very top. Add big soft rounded pixel clouds mostly near the left and right edges, with a few tiny birds far away and one small hot-air balloon on the far left. Keep the center area calm. The TOP EDGE must be a plain, flat band of medium blue #4f7fd3 with no clouds touching it. No text.
```

### 2C. Arriba: el espacio, 1024×1536

Sube la imagen 2B y escribe:

```
[pega aquí el bloque de estilo]

I uploaded the middle section of a tall vertical game background. Create the NEXT section that goes directly ABOVE it, portrait 2:3, same pixel-art style and same width. The BOTTOM EDGE of the new image must match the TOP EDGE of the uploaded image exactly (a flat band of medium blue #4f7fd3). Going upward, the sky turns from medium blue into deep blue, then into dark navy #17235f at the top, and becomes outer space: lots of small pixel stars (some twinkling, plus a few bigger four-point sparkles), a crescent moon on the right edge, a small ringed planet on the left edge and a couple of tiny shooting stars. Keep the center area calm. The top of the image is the highest point, so make it the darkest and the most starry. No text.
```

---

## Si algo sale distinto

- **Sale con pixeles borrosos o con degradados**: añade al final "strictly flat colors, hard pixel edges, no soft gradients, no glow".
- **Los bordes no empatan**: pídele "keep the bottom 60 px of the new image identical to the top 60 px of the uploaded one" o, mejor, súbelas y yo las empato con el script.
- **Salen letras o logos**: añade "absolutely no text or writing anywhere".
- **Los personajes salen muy grandes**: baja el porcentaje ("about 8% of the image height").
