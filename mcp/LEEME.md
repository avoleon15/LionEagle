# Conector de Altus para Claude (MCP, solo lectura)

Le permite a Claude leer los datos de tu juego sin que tengas que descargar archivos: las últimas partidas, el reporte de preguntas,
la calibración, las estadísticas y cualquier pregunta. **No puede cambiar nada**: solo hace consultas.

## Qué necesita

Dos variables de entorno en tu computadora (nunca las escribas en un archivo del repositorio):

- `ALTUS_URL`: la dirección del juego, por ejemplo `https://tu-juego.up.railway.app`. Si no la pones, usa `http://localhost:3001`.
- `ALTUS_ADMIN_TOKEN`: el token de admin (la variable `ADMIN_TOKEN` de Railway).

En una Mac, agrégalas al final de `~/.zshrc` y abre una terminal nueva:

```bash
export ALTUS_URL="https://tu-juego.up.railway.app"
export ALTUS_ADMIN_TOKEN="el-token-de-admin"
```

## Cómo se usa

El archivo `.mcp.json` en la raíz del proyecto ya lo registra para Claude Code: al abrir el proyecto, Claude Code pregunta si quieres
usar el servidor `altus`. Toma las dos variables de tu entorno.

Herramientas que tiene:

| Herramienta | Qué devuelve |
|---|---|
| `partidas_recientes` | Las últimas partidas y un resumen por pregunta (con `solo_resumen` es más corto) |
| `reporte_preguntas` | Todas las preguntas con respuestas correctas e incorrectas (se puede filtrar con `buscar`) |
| `calibracion` | Lo mismo que la pestaña Calibración del admin |
| `estadisticas_generales` | Partidas, jugadores, días, horas, regiones |
| `buscar_preguntas` | Busca por texto, categoría o estado |
| `ver_pregunta` | Una pregunta completa con sus estadísticas |

Ojo: el servidor bloquea la dirección después de 10 intentos con un token equivocado, así que revisa bien el token.
