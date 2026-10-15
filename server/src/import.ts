// Usage: npm run import -w server -- ../content/minecraft.ts ../content/pokemon.ts [--draft] [--only-new]
// --only-new skips questions whose id already exists, so edits made in the admin are never overwritten.
// Upserts the questions in each file. A file is either JSON (a list, same format as the admin
// "Importar" tab) or a TypeScript/JS module whose default export is a list built with q() from dsl.ts.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as db from './db'

const args = process.argv.slice(2)
const files = args.filter((a) => !a.startsWith('--'))
if (files.length === 0) {
  console.error('Falta el archivo (JSON o .ts).')
  process.exit(1)
}

db.init()
let failed = false
for (const file of files) {
  const path = resolve(file)
  const data = path.endsWith('.json') ? JSON.parse(readFileSync(path, 'utf8')) : (await import(pathToFileURL(path).href)).default
  let list: { id?: string }[] = Array.isArray(data) ? data : data.questions
  let skipped = 0
  if (args.includes('--only-new')) {
    // Never touch a question that already exists (it may have been edited in the admin).
    const fresh = list.filter((x) => !x || !x.id || db.getQuestion(x.id) === null)
    skipped = list.length - fresh.length
    list = fresh
  }
  const report = db.importQuestions(list as db.QuestionInput[], !args.includes('--draft'))
  console.log(`${file}: ${report.created} nuevas, ${report.updated} reemplazadas${skipped ? `, ${skipped} ya existían (no se tocaron)` : ''}.`)
  for (const d of report.drafts) console.log(`  borrador "${d.id}": ${d.problems.join(' ')}`)
  for (const e of report.errors) {
    failed = true
    console.log(`  error en la pregunta ${e.index + 1}: ${e.error}`)
  }
}
process.exit(failed ? 1 : 0)
