/**
 * Seconds left until `endsAt` (server clock, ms).
 *
 * `serverNow` is the server's clock when it built the state, and `receivedAt` is this machine's clock
 * when that state arrived. Their difference is the clock skew, and it must be measured ONCE per state:
 * recomputing it on every redraw would cancel the passing time out and freeze the countdown.
 */
export function secondsLeft(endsAt: number, serverNow: number, receivedAt: number, now: number): number {
  if (!endsAt) return 0
  const skew = serverNow - receivedAt
  return Math.max(0, (endsAt - (now + skew)) / 1000)
}
