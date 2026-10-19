// Tells the owner when somebody suggests a question. Optional: set SUGGESTION_WEBHOOK_URL to one of
//   - an ntfy topic (https://ntfy.sh/your-secret-topic): push notification to the phone, no account needed
//   - a Discord webhook (https://discord.com/api/webhooks/...) or a Slack incoming webhook (https://hooks.slack.com/...)
//   - any other URL that accepts a JSON POST like {"text": "..."} (Telegram bots, Zapier, Make, ...)
// Without it nothing is sent; the suggestions are always in the admin inbox either way.

export interface WebhookRequest {
  body: string
  headers: Record<string, string>
}

/** What to POST to `url` so that the message shows up as text on that service. */
export function webhookRequest(url: string, text: string): WebhookRequest {
  if (/discord(app)?\.com\/api\/webhooks\//.test(url)) return { body: JSON.stringify({ content: text.slice(0, 1900) }), headers: { 'Content-Type': 'application/json' } }
  if (/hooks\.slack\.com\//.test(url)) return { body: JSON.stringify({ text }), headers: { 'Content-Type': 'application/json' } }
  if (/(^|\/\/)ntfy\.[a-z.]+\//.test(url)) return { body: text, headers: { 'Content-Type': 'text/plain; charset=utf-8', Title: 'Nueva sugerencia', Tags: 'speech_balloon' } }
  return { body: JSON.stringify({ text }), headers: { 'Content-Type': 'application/json' } }
}

/** Fire and forget: a failing notification must never affect the player who sent the suggestion. */
export function notifySuggestion(s: { prompt?: unknown; category?: unknown; nick?: unknown }): void {
  const url = process.env.SUGGESTION_WEBHOOK_URL
  if (!url) return
  const clip = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n)
  const text = `Nueva sugerencia de pregunta${s.nick ? ` de ${clip(s.nick, 16)}` : ''}${s.category ? ` (${clip(s.category, 40)})` : ''}:\n${clip(s.prompt, 200)}\n\nRevísala en /admin, pestaña Sugerencias.`
  const { body, headers } = webhookRequest(url, text)
  fetch(url, { method: 'POST', body, headers, signal: AbortSignal.timeout(5000) }).catch((e) => console.error('notify:', e instanceof Error ? e.message : e))
}
