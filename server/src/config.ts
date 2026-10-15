// Timings in ms. Overridable through the environment so tests can run fast.
export const ROUND_MS = Number(process.env.LE_ROUND_MS ?? 20_000)
export const REVEAL_MS = Number(process.env.LE_REVEAL_MS ?? 7_000)
/** How long a disconnected host keeps the room before somebody else takes over. */
export const HOST_HANDOVER_MS = Number(process.env.LE_HOST_HANDOVER_MS ?? 10_000)
