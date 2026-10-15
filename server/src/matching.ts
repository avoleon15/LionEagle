import { TIERS } from '../../shared/protocol'

export interface AnswerDef {
  label: string // what the reveal screen shows
  aliases: string[]
  points: number
}

export interface Question {
  id: string
  category: string
  prompt: string
  answers: AnswerDef[]
}

export interface Hit {
  label: string
  points: number
}

const ARTICLES = new Set(['el', 'la', 'los', 'las', 'un', 'una'])

function words(raw: string): string[] {
  const w = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents (and ñ -> n)
    .replace(/\+/g, ' plus ') // "C++" is not "C"
    .replace(/#/g, ' sharp ') // "C#" is not "C"
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return w.length > 1 && ARTICLES.has(w[0]) ? w.slice(1) : w
}

/** Keys a phrase can be looked up by: ignoring case, accents, articles and simple plurals. */
export function keys(raw: string): string[] {
  const w = words(raw)
  if (w.length === 0) return []
  const strip = (x: string, suffix: string) => (x.length > suffix.length + 2 && x.endsWith(suffix) ? x.slice(0, -suffix.length) : x)
  const a = w.map((x) => strip(x, 's')).join(' ')
  const b = w.map((x) => strip(strip(x, 'es'), 's')).join(' ')
  return a === b ? [a] : [a, b]
}

export type Index = Map<string, Hit>

/** Builds the lookup table for a question. Throws if two answers collide. */
export function buildIndex(q: Question): Index {
  const index: Index = new Map()
  for (const def of q.answers) {
    for (const text of [def.label, ...def.aliases]) {
      for (const k of keys(text)) {
        const prev = index.get(k)
        if (prev && prev.label !== def.label) {
          throw new Error(`"${text}" se confunde con "${prev.label}" (en "${def.label}"). Dos respuestas distintas no pueden escribirse igual.`)
        }
        index.set(k, { label: def.label, points: def.points })
      }
    }
  }
  return index
}

export function match(index: Index, text: string): Hit | null {
  for (const k of keys(text)) {
    const hit = index.get(k)
    if (hit) return hit
  }
  return null
}

export function validateQuestion(q: Question): string[] {
  const problems: string[] = []
  if (q.answers.length < 6) problems.push('Necesita al menos 6 respuestas.')
  for (const a of q.answers) {
    if (!(TIERS as readonly number[]).includes(a.points)) problems.push(`"${a.label}" tiene un nivel inválido (${a.points}).`)
  }
  const tiers = new Set(q.answers.map((a) => a.points))
  if (!tiers.has(10) || !tiers.has(100)) problems.push('Necesita al menos una respuesta de 10 y una de 100 puntos.')
  const seen = new Set<string>()
  for (const a of q.answers) {
    const k = keys(a.label)[0] ?? ''
    if (!k) problems.push('Hay una respuesta vacía.')
    else if (seen.has(k)) problems.push(`"${a.label}" está repetida.`)
    seen.add(k)
  }
  try {
    buildIndex(q)
  } catch (e) {
    problems.push((e as Error).message)
  }
  return problems
}
