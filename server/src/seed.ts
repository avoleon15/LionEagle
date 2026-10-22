import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'
import * as db from './db'

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '../../content')

/**
 * A brand-new database (a first deploy) only holds the built-in samples. When that happens the owner's questions
 * in content/ are loaded, their hints applied and the samples archived. A database that already has real
 * questions is never touched, so edits made in the admin survive every restart.
 */
export async function seedContent() {
  if (process.env.LE_NO_SEED) return // the end-to-end test plays with the built-in samples
  const real = db.handle().prepare("SELECT COUNT(*) AS n FROM questions WHERE source != 'sample'").get() as { n: number }
  if (real.n > 0 || !existsSync(contentDir)) return
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.ts'))
  let loaded = 0
  for (const f of files.filter((f) => !f.startsWith('pistas'))) {
    const data = (await import(pathToFileURL(join(contentDir, f)).href)).default
    const list = Array.isArray(data) ? data : data.questions
    const report = db.importQuestions(list, true)
    loaded += report.created + report.updated
    for (const e of report.errors) console.error(`content/${f}, pregunta ${e.index + 1}: ${e.error}`)
  }
  for (const f of files.filter((f) => f.startsWith('pistas'))) {
    const map = (await import(pathToFileURL(join(contentDir, f)).href)).default as Record<string, string>
    for (const [id, hint] of Object.entries(map)) db.setHint(id, hint)
  }
  if (loaded > 0) db.archiveSamples()
  console.log(`Primer arranque: ${loaded} preguntas cargadas desde content/.`)
}
