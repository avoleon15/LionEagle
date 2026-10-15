// Timings in ms. Overridable through the environment so tests can run fast.
export const ROUND_MS = Number(process.env.LE_ROUND_MS ?? 20_000)
export const REVEAL_MS = Number(process.env.LE_REVEAL_MS ?? 7_000)
