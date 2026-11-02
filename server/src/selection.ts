import type { Question } from './matching'

/** How hard a question that was asked more than average is pushed back (higher = evens out faster). */
const FAIRNESS = 4
/** A brand new question is at most this many times likelier than an average one, so it cannot hog every game. */
const MAX_BOOST = 50

/**
 * Picks `n` questions so that, over many games, every question of the pool is shown equally often.
 *
 * Each candidate gets a weight that shrinks the more it was already asked (`asked`: question id ->
 * times asked, counted across all rooms and restarts; missing = 0), and the questions are drawn
 * without replacement with those weights (Efraimidis-Spirakis: sort by `u^(1/w)`, u uniform in
 * (0,1)). Questions behind the average catch up, ones ahead rest, and it keeps correcting itself.
 * Questions the room already played are skipped; once fewer than `n` are left, they come back.
 * For variety inside one game no category gets more than half of the slots, unless that would
 * leave the game short. `rng` is injectable so tests can be deterministic.
 */
export function selectQuestions(
  pool: Question[],
  n: number,
  played: Set<string>,
  asked: ReadonlyMap<string, number> = new Map(),
  rng: () => number = Math.random,
): Question[] {
  const fresh = pool.filter((q) => !played.has(q.id))
  const source = fresh.length >= n ? fresh : pool
  const count = (q: Question) => asked.get(q.id) ?? 0
  const mean = source.reduce((sum, q) => sum + count(q), 0) / (source.length || 1)
  const ranked = source
    .map((q) => {
      const weight = Math.min(MAX_BOOST, ((mean + 1) / (count(q) + 1)) ** FAIRNESS)
      return { q, key: Math.log(1 - rng()) / weight } // log of u^(1/w), larger = picked first
    })
    .sort((a, b) => b.key - a.key)
    .map((r) => r.q)

  const cap = new Set(source.map((q) => q.category)).size > 1 ? Math.ceil(n / 2) : n
  const perCategory = new Map<string, number>()
  const picked: Question[] = []
  for (const q of ranked) {
    const used = perCategory.get(q.category) ?? 0
    if (picked.length >= n || used >= cap) continue
    perCategory.set(q.category, used + 1)
    picked.push(q)
  }
  for (const q of ranked) if (picked.length < n && !picked.includes(q)) picked.push(q)

  // Fisher-Yates, so the order of the game does not follow the weights.
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[picked[i], picked[j]] = [picked[j], picked[i]]
  }
  return picked
}
