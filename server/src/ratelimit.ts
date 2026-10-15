/** At most `max` hits per `windowMs` for each key (an address, usually). Expired entries are swept so the map cannot grow forever. */
export class RateLimiter {
  private hits = new Map<string, number[]>()

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  private recent(key: string, now: number): number[] {
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs)
    if (list.length > 0) this.hits.set(key, list)
    else this.hits.delete(key)
    return list
  }

  private sweep(now: number) {
    for (const key of [...this.hits.keys()]) this.recent(key, now)
  }

  /** True when this key already used up its allowance (nothing is recorded). */
  blocked(key: string, now = Date.now()): boolean {
    return this.recent(key, now).length >= this.max
  }

  /** Records a hit. */
  record(key: string, now = Date.now()): void {
    if (this.hits.size > 1000) this.sweep(now)
    this.hits.set(key, [...this.recent(key, now), now])
  }

  /** Records a hit and says whether it was within the allowance. */
  allow(key: string, now = Date.now()): boolean {
    if (this.blocked(key, now)) return false
    this.record(key, now)
    return true
  }

  get size() {
    return this.hits.size
  }
}
