import type { QuestionInput } from './db'

type Tiers = Partial<Record<10 | 30 | 60 | 80 | 100, string[]>>

/**
 * Compact way to write a question in a content file. Each answer is "Label|alias|alias" under its tier
 * (10 = the answer almost everyone says ... 100 = the rarest valid one). Matching already ignores
 * case, accents, articles and simple plurals, so aliases are only for genuinely different spellings.
 */
const plain = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)

/**
 * An alias that is only the FIRST word(s) of a longer label ("Utah" for "Utah Jazz", "Walter" for "Walter White")
 * does not score: it gets a leading "~", which makes the game suggest the full answer instead. Anything else
 * (the last word such as "Jazz" or "Federer", a nickname, another spelling) scores as usual. Write "!alias" to
 * force an alias that would be marked to score anyway.
 */
function markAlias(label: string, alias: string): string {
  if (alias.startsWith('!')) return alias.slice(1).trim()
  if (alias.startsWith('~')) return alias
  const l = plain(label)
  const a = plain(alias)
  return a.length > 0 && a.length < l.length && a.every((w, i) => w === l[i]) ? `~${alias}` : alias
}

export function q(id: string, category: string, prompt: string, tiers: Tiers, notes = ''): QuestionInput {
  const answers: QuestionInput['answers'] = []
  for (const [points, list] of Object.entries(tiers)) {
    for (const entry of list ?? []) {
      const [label, ...aliases] = entry.split('|').map((s) => s.trim())
      answers.push({ label, aliases: aliases.map((a) => markAlias(label, a)), points: Number(points) })
    }
  }
  return { id, category, prompt, notes, answers }
}
