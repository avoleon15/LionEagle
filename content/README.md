# Contenido del juego

Aquí viven las listas de preguntas (JSON) que se importan al juego. Formato:

```json
[
  {
    "id": "norteamerica",
    "category": "Geografía",
    "prompt": "Nombra un país de Norteamérica.",
    "notes": "Fuente: …",
    "answers": [
      { "label": "Estados Unidos", "aliases": ["USA", "EEUU"], "points": 10 },
      { "label": "Barbados", "points": 100 }
    ]
  }
]
```

- `points` es el nivel: 10, 30, 60, 80 o 100.
- No hace falta incluir mayúsculas, tildes ni plurales como alias: el juego los ignora.
- Una pregunta solo se publica si tiene al menos 6 respuestas, una de 10 y una de 100, y sin respuestas repetidas. Si no, queda como borrador.
- Importar: `npm run import -w server -- ../content/archivo.ts ../content/otro.ts` (agrega `--draft` para dejarlas todas como borrador), o desde la pestaña "Importar / exportar" del administrador (solo JSON).
- Los archivos `.ts` usan una forma corta para escribir las listas (`q(...)` de `server/src/dsl.ts`): cada respuesta es `"Nombre|alias|alias"` dentro de su nivel. Son la fuente de las preguntas de la primera tanda; tienen una nota con las dudas de cada lista.
- `npm run test -w server` valida todos los archivos de esta carpeta (respuestas repetidas, niveles, conteos conocidos como 118 elementos o 54 países de África).
- Ideas para más preguntas: `IDEAS.md`.
