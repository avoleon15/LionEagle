import type { QuestionInput } from './db'

type Tiers = Partial<Record<10 | 30 | 60 | 80 | 100, string[]>>

/**
 * Compact way to write a question in a content file. Each answer is "Label|alias|alias" under its tier
 * (10 = the answer almost everyone says ... 100 = the rarest valid one). Matching already ignores
 * case, accents, articles and simple plurals, so aliases are only for genuinely different spellings.
 */
export function q(id: string, category: string, prompt: string, tiers: Tiers, notes = ''): QuestionInput {
  const answers: QuestionInput['answers'] = []
  for (const [points, list] of Object.entries(tiers)) {
    for (const entry of list ?? []) {
      const [label, ...aliases] = entry.split('|').map((s) => s.trim())
      answers.push({ label, aliases, points: Number(points) })
    }
  }
  return { id, category, prompt, notes, answers }
}
