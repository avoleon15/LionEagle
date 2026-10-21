/**
 * Questions carry clarifications in parentheses ("Nombra un metal (las aleaciones no cuentan)."). To keep the
 * question itself short they are shown in the small clue text instead.
 */
export function splitPrompt(prompt: string): { text: string; note: string } {
  const notes: string[] = []
  const text = prompt
    .replace(/\s*\(([^()]*)\)/g, (_m, inner: string) => {
      const t = inner.trim()
      if (t) notes.push(t.charAt(0).toUpperCase() + t.slice(1))
      return ''
    })
    .replace(/\s+([.,;:?!])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return { text: text || prompt, note: notes.join('. ').replace(/\.\.+/g, '.') }
}
