import { useState, type FormEvent } from 'react'
import { SUGGESTION_LIMITS } from '../../shared/protocol'

interface Props {
  nick: string
  categories: string[]
  onClose: () => void
}

/** Lets any player propose a question. Suggestions only reach the owner's review inbox. */
export function SuggestBox({ nick, categories, onClose }: Props) {
  const [prompt, setPrompt] = useState('')
  const [category, setCategory] = useState('')
  const [answers, setAnswers] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  const send = async (e: FormEvent) => {
    e.preventDefault()
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category, answers, nick }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'No se pudo enviar.')
      setState('done')
    } catch (err) {
      setError((err as Error).message)
      setState('idle')
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Sugerir una pregunta" onClick={onClose}>
      <form className="card" onClick={(e) => e.stopPropagation()} onSubmit={send}>
        {state === 'done' ? (
          <>
            <h2 className="prompt">¡Gracias!</h2>
            <p className="tagline">Revisaremos tu pregunta y, si funciona, aparecerá en el juego.</p>
            <button type="button" className="primary" onClick={onClose}>Cerrar</button>
          </>
        ) : (
          <>
            <h2 className="prompt">Sugerir una pregunta</h2>
            <p className="tagline">Algo como "Nombra un país de Centroamérica."</p>
            <textarea
              required
              rows={3}
              maxLength={SUGGESTION_LIMITS.prompt}
              placeholder="Tu pregunta"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <input
              list="suggest-cats"
              maxLength={SUGGESTION_LIMITS.category}
              placeholder="Categoría (opcional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="suggest-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            <textarea
              rows={2}
              maxLength={SUGGESTION_LIMITS.answers}
              placeholder="Algunas respuestas posibles (opcional)"
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <button className="primary" disabled={state === 'sending' || prompt.trim().length < 5}>Enviar</button>
            <button type="button" className="link" onClick={onClose}>Cancelar</button>
          </>
        )}
      </form>
    </div>
  )
}
