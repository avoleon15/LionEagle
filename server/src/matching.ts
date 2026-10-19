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
    .replace(/[\u0300-\u036f]/g, '') // accents (and ñ -> n)
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

/** Edit distance counting a swap of two neighbouring letters as one edit. */
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

/** How many edits still count as "almost": none for very short words, so people cannot fish for answers. */
const allowedEdits = (len: number) => (len < 5 ? 0 : len < 9 ? 1 : 2)

/**
 * For a wrong answer that is only a typo away from exactly one listed answer: that answer's label.
 * Null when nothing is close, or when two different answers are equally close (we do not guess).
 */
export function suggest(index: Index, text: string): string | null {
  const typed = keys(text)
  if (typed.length === 0) return null
  let best = Infinity
  const labels = new Set<string>()
  for (const t of typed) {
    const max = allowedEdits(t.length)
    for (const [key, hit] of index) {
      if (Math.abs(key.length - t.length) > max) continue
      const dist = distance(t, key)
      if (dist > max) continue
      if (dist < best) { best = dist; labels.clear() }
      if (dist === best) labels.add(hit.label)
    }
  }
  return labels.size === 1 ? [...labels][0] : null
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
