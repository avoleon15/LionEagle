import type { Question } from './matching'

function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Picks `n` questions, mixing categories round-robin and skipping questions the room already
 * played. Once fewer than `n` unplayed questions are left, previously played ones come back.
 */
export function selectQuestions(pool: Question[], n: number, played: Set<string>): Question[] {
  const fresh = pool.filter((q) => !played.has(q.id))
  const source = fresh.length >= n ? fresh : pool
  const byCategory = new Map<string, Question[]>()
  for (const q of shuffle(source)) {
    const list = byCategory.get(q.category) ?? []
    list.push(q)
    byCategory.set(q.category, list)
  }
  const queues = shuffle([...byCategory.values()])
  const picked: Question[] = []
  while (picked.length < n && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const q = queue.shift()
      if (q && picked.length < n) picked.push(q)
    }
  }
  return shuffle(picked)
}
