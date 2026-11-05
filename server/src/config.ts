// Timings in ms. Overridable through the environment so tests can run fast.
/** How long a player has to answer, counted from the moment the question can be answered. */
export const ROUND_MS = Number(process.env.LE_ROUND_MS ?? 25_000)
/** The question is shown this long before answering opens and the countdown starts (time to read it). */
export const READ_MS = Number(process.env.LE_READ_MS ?? 5_000)
export const REVEAL_MS = Number(process.env.LE_REVEAL_MS ?? 5_000)
/** How long a disconnected host keeps the room before somebody else takes over. */
export const HOST_HANDOVER_MS = Number(process.env.LE_HOST_HANDOVER_MS ?? 10_000)
/** Forces one map (a name from MAPS) instead of picking at random: for tests and for looking at a map. */
export const FORCE_MAP = process.env.LE_MAP
