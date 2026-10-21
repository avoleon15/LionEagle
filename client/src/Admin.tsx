import { useCallback, useEffect, useMemo, useState } from 'react'
import { TIERS, tierLabel } from '../../shared/protocol'

// Owner tool at /admin. Everything goes through /api/admin with the admin token.

interface Answer { label: string; aliases: string[]; points: number }
interface Question {
  id: string
  category: string
  prompt: string
  status: 'draft' | 'published' | 'archived'
  source: 'sample' | 'owner' | 'suggestion'
  notes: string
  answers: Answer[]
  problems?: string[]
  updatedAt: number
}
/** What the question list carries; the full question (with its answers) is fetched when it is opened. */
interface Summary { id: string; category: string; prompt: string; status: Question['status']; source: Question['source']; answerCount: number; updatedAt: number; problems: string[] }
interface Suggestion { id: number; prompt: string; category: string; answers: string; nick: string; status: string; createdAt: number; questionId: string | null }
interface Counts { questions: Record<string, number>; newSuggestions: number }
interface OverviewRow { id: string; prompt: string; category: string; status: string; asked: number; answered: number; validTotal: number; unknownTotal: number; topUnknown: { text: string; count: number }[]; mismatches: number }
interface AnswerStat { label: string; points: number; count: number; share: number; suggested: number | null }
interface LoggedAnswer { key: string; text: string; count: number; lastAt: number; ignored: boolean }
interface StatDetail { id: string; prompt: string; category: string; asked: number; answered: number; validTotal: number; unknownTotal: number; answers: AnswerStat[]; unknown: LoggedAnswer[]; minForSuggestions: number }

const TOKEN_KEY = 'leonaguila.admin'
const STATUS_LABEL = { draft: 'Borrador', published: 'Publicada', archived: 'Archivada' } as const
const SOURCE_LABEL = { sample: 'Muestra', owner: 'Propia', suggestion: 'Sugerencia' } as const

const stored = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) ?? '' } catch { return '' }
}

async function call<T>(token: string, path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: { 'x-admin-token': token, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error ?? `Error ${res.status}`), { status: res.status })
  return data as T
}

// ---- answer lists as text: one answer per line, "Respuesta | alias | alias" ----

type TierText = Record<number, string>

const toText = (answers: Answer[]): TierText =>
  Object.fromEntries(TIERS.map((t) => [t, answers.filter((a) => a.points === t).map((a) => [a.label, ...a.aliases].join(' | ')).join('\n')]))

function toAnswers(text: TierText): Answer[] {
  return TIERS.flatMap((points) =>
    (text[points] ?? '')
      .split('\n')
      .map((line) => line.split('|').map((x) => x.trim()).filter(Boolean))
      .filter((parts) => parts.length > 0)
      .map(([label, ...aliases]) => ({ label, aliases, points })),
  )
}

// ---- editor ----

interface Draft { id?: string; category: string; prompt: string; notes: string; status: Question['status']; source: Question['source']; text: TierText }

const blank = (category = ''): Draft => ({ category, prompt: '', notes: '', status: 'draft', source: 'owner', text: toText([]) })
const fromQuestion = (q: Question): Draft => ({ id: q.id, category: q.category, prompt: q.prompt, notes: q.notes, status: q.status, source: q.source, text: toText(q.answers) })

function Editor({ token, draft: initial, categories, onSaved, onCancel }: {
  token: string
  draft: Draft
  categories: string[]
  onSaved: () => void
  onCancel: () => void
}) {
  const [d, setD] = useState(initial)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'warn' | 'error'; lines: string[] } | null>(null)
  const [probe, setProbe] = useState('')
  const [probeResult, setProbeResult] = useState('')
  const answers = useMemo(() => toAnswers(d.text), [d.text])

  useEffect(() => {
    if (!probe.trim()) return setProbeResult('')
    const t = setTimeout(() => {
      call<{ hit: { label: string; points: number } | null }>(token, '/test-match', 'POST', { question: { answers }, text: probe })
        .then((r) => setProbeResult(r.hit ? `✓ Cuenta como "${r.hit.label}": ${r.hit.points} puntos (${tierLabel(r.hit.points)})` : '✗ No está en la lista: no cuenta.'))
        .catch((e) => setProbeResult(`⚠ ${e.message}`))
    }, 250)
    return () => clearTimeout(t)
  }, [probe, answers, token])

  const save = async (status: Question['status']) => {
    setMsg(null)
    const body = { category: d.category, prompt: d.prompt, notes: d.notes, source: d.source, status, answers }
    try {
      const r = await call<{ question: Question; problems: string[]; demoted: boolean }>(token, d.id ? `/questions/${d.id}` : '/questions', d.id ? 'PUT' : 'POST', body)
      if (r.demoted) {
        setD({ ...d, id: r.question.id, status: 'draft' })
        setMsg({ kind: 'warn', lines: ['Se guardó como borrador: todavía no se puede publicar.', ...r.problems] })
      } else {
        onSaved()
      }
    } catch (e) {
      setMsg({ kind: 'error', lines: [(e as Error).message] })
    }
  }

  const remove = async () => {
    if (!d.id || !window.confirm('¿Borrar esta pregunta para siempre? (Para esconderla sin borrarla, archívala.)')) return
    await call(token, `/questions/${d.id}`, 'DELETE')
    onSaved()
  }

  return (
    <div className="editor">
      <h2>{d.id ? 'Editar pregunta' : 'Nueva pregunta'}</h2>
      <label>Categoría
        <input list="admin-cats" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })} placeholder="Geografía" />
        <datalist id="admin-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
      </label>
      <label>Pregunta
        <input value={d.prompt} onChange={(e) => setD({ ...d, prompt: e.target.value })} placeholder="Nombra un país de Norteamérica." />
      </label>
      <p className="hint">
        Respuestas por nivel, <b>una por línea</b>. Si una respuesta se puede escribir de otra forma, sepárala con <b>|</b>:
        <code> Estados Unidos | USA | EEUU</code>. No hace falta poner mayúsculas, tildes ni plurales.
        Lo que no esté en la lista <b>no cuenta</b>.
      </p>
      <div className="tiers">
        {TIERS.map((t) => (
          <label key={t} className={`tier t${t}`}>
            {t} puntos · {tierLabel(t)} <small>({d.text[t].split('\n').filter((l) => l.trim()).length})</small>
            <textarea rows={Math.max(3, d.text[t].split('\n').length + 1)} value={d.text[t]} onChange={(e) => setD({ ...d, text: { ...d.text, [t]: e.target.value } })} />
          </label>
        ))}
      </div>
      <label>Probar una respuesta
        <input value={probe} onChange={(e) => setProbe(e.target.value)} placeholder="Escribe como lo haría un jugador" />
      </label>
      {probeResult && <p className="probe">{probeResult}</p>}
      <label>Notas (fuentes, dudas)
        <textarea rows={2} value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} />
      </label>
      {msg && <div className={`msg ${msg.kind}`}>{msg.lines.map((l, i) => <p key={i}>{l}</p>)}</div>}
      <div className="row">
        <button className="primary" onClick={() => save('published')}>Guardar y publicar</button>
        <button onClick={() => save('draft')}>Guardar como borrador</button>
        {d.id && d.status !== 'archived' && <button onClick={() => save('archived')}>Archivar</button>}
        {d.id && <button className="danger" onClick={remove}>Borrar</button>}
        <button className="link" onClick={onCancel}>Cerrar</button>
      </div>
    </div>
  )
}

// ---- tabs ----

/** Waits `ms` after the value stops changing, so typing in a search box does not fire a request per letter. */
function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

function Questions({ token, counts, refresh, edit, setEdit }: { token: string; counts: Counts | null; refresh: () => void; edit: Draft | null; setEdit: (d: Draft | null) => void }) {
  const [list, setList] = useState<Summary[]>([])
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [all, setAll] = useState<string[]>([])
  const [error, setError] = useState('')
  const typed = useDebounced(search, 300)

  const load = useCallback(async () => {
    const q = new URLSearchParams({ category, status, q: typed })
    try {
      const r = await call<{ questions: Summary[] }>(token, `/questions?${q}`)
      setList(r.questions)
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [token, category, status, typed])
  useEffect(() => { void load() }, [load])

  const loadCategories = useCallback(async () => {
    try {
      setAll((await call<{ categories: string[] }>(token, '/categories')).categories)
    } catch { /* the filter simply stays as it was */ }
  }, [token])
  useEffect(() => { void loadCategories() }, [loadCategories, counts])

  const open = async (id: string) => {
    try {
      setEdit(fromQuestion((await call<{ question: Question }>(token, `/questions/${id}`)).question))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const samples = list.some((q) => q.source === 'sample' && q.status !== 'archived')

  if (edit) {
    return <Editor token={token} draft={edit} categories={all} onCancel={() => setEdit(null)} onSaved={() => { setEdit(null); void load(); refresh() }} />
  }
  return (
    <>
      <div className="toolbar">
        <input placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {all.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="primary" onClick={() => setEdit(blank(category))}>+ Nueva pregunta</button>
      </div>
      {error && <p className="error">{error}</p>}
      <p className="hint">
        {counts?.questions.published ?? 0} publicadas · {counts?.questions.draft ?? 0} borradores · {counts?.questions.archived ?? 0} archivadas.
        Para jugar se necesitan al menos 7 publicadas en las categorías elegidas.
      </p>
      {(counts?.questions.draft ?? 0) > 0 && (
        <button onClick={async () => {
          const r = await call<{ published: number; waiting: number }>(token, '/publish-ready', 'POST', {})
          window.alert(`${r.published} preguntas publicadas.` + (r.waiting ? ` ${r.waiting} siguen como borrador porque les falta algo (mira el ⚠).` : ''))
          void load(); refresh()
        }}>Publicar todos los borradores que estén listos</button>
      )}
      {samples && (
        <button onClick={async () => {
          if (!window.confirm('¿Archivar todas las preguntas de muestra? Dejarán de salir en el juego.')) return
          await call(token, '/archive-samples', 'POST', {})
          void load(); refresh()
        }}>Archivar las preguntas de muestra</button>
      )}
      <ul className="qlist">
        {list.map((q) => (
          <li key={q.id} onClick={() => void open(q.id)}>
            <span className={`badge ${q.status}`}>{STATUS_LABEL[q.status]}</span>
            <span className="cat-name">{q.category}</span>
            <span className="q-prompt">{q.prompt}</span>
            {q.source !== 'owner' && <span className="badge src">{SOURCE_LABEL[q.source]}</span>}
            <span className="n">{q.answerCount} resp.</span>
            {q.problems.length > 0 && q.status !== 'archived' && <span className="warn" title={q.problems.join('\n')}>⚠ {q.problems.length}</span>}
          </li>
        ))}
        {list.length === 0 && <li className="empty">No hay preguntas con ese filtro.</li>}
      </ul>
    </>
  )
}

function Suggestions({ token, refresh, openDraft }: { token: string; refresh: () => void; openDraft: (q: Question) => void }) {
  const [list, setList] = useState<Suggestion[]>([])
  const [status, setStatus] = useState('new')
  const load = useCallback(async () => {
    setList((await call<{ suggestions: Suggestion[] }>(token, `/suggestions?status=${status}`)).suggestions)
  }, [token, status])
  useEffect(() => { void load() }, [load])
  return (
    <>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="new">Nuevas</option>
          <option value="accepted">Aceptadas</option>
          <option value="rejected">Descartadas</option>
        </select>
      </div>
      <ul className="qlist">
        {list.map((s) => (
          <li key={s.id} className="sug">
            <div className="q-prompt">
              <b>{s.prompt}</b>
              <small>{s.category || 'Sin categoría'} · {s.nick || 'anónimo'} · {new Date(s.createdAt).toLocaleDateString('es')}</small>
              {s.answers && <small>Ejemplos: {s.answers}</small>}
            </div>
            {s.status === 'new' && (
              <>
                <button className="primary" onClick={async () => {
                  const r = await call<{ question: Question }>(token, `/suggestions/${s.id}/accept`, 'POST', {})
                  refresh(); openDraft(r.question)
                }}>Crear borrador</button>
                <button onClick={async () => { await call(token, `/suggestions/${s.id}/reject`, 'POST', {}); void load(); refresh() }}>Descartar</button>
              </>
            )}
          </li>
        ))}
        {list.length === 0 && <li className="empty">No hay sugerencias aquí.</li>}
      </ul>
    </>
  )
}

const EXAMPLE = `[
  {
    "category": "Geografía",
    "prompt": "Nombra un país de Centroamérica.",
    "answers": [
      { "label": "Guatemala", "points": 10 },
      { "label": "Belice", "points": 100, "aliases": ["Belize"] }
    ]
  }
]`

function ImportExport({ token, refresh }: { token: string; refresh: () => void }) {
  const [text, setText] = useState('')
  const [publish, setPublish] = useState(true)
  const [report, setReport] = useState<{ created: number; updated: number; drafts: { id: string; problems: string[] }[]; errors: { index: number; error: string }[] } | null>(null)
  const [error, setError] = useState('')

  const doImport = async () => {
    setError(''); setReport(null)
    try {
      const list = JSON.parse(text)
      setReport(await call(token, '/import', 'POST', { questions: list, publish }))
      refresh()
    } catch (e) {
      setError(e instanceof SyntaxError ? 'Ese texto no es JSON válido.' : (e as Error).message)
    }
  }
  const doExport = async () => {
    const r = await call<{ questions: unknown[] }>(token, '/export')
    const url = URL.createObjectURL(new Blob([JSON.stringify(r.questions, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `leon-aguila-preguntas-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <h2>Exportar</h2>
      <p className="hint">Descarga todas las preguntas (copia de seguridad).</p>
      <button onClick={doExport}>Descargar JSON</button>
      <h2>Importar</h2>
      <p className="hint">Pega una lista de preguntas. Si una pregunta tiene el mismo <code>id</code> que una existente, la reemplaza. Formato:</p>
      <pre>{EXAMPLE}</pre>
      <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="[ … ]" />
      <label className="check"><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> Publicar las que estén completas (las incompletas quedan como borrador)</label>
      <button className="primary" disabled={!text.trim()} onClick={doImport}>Importar</button>
      {error && <p className="error">{error}</p>}
      {report && (
        <div className="msg ok">
          <p>{report.created} nuevas, {report.updated} reemplazadas.</p>
          {report.drafts.map((d) => <p key={d.id}>Borrador "{d.id}": {d.problems.join(' ')}</p>)}
          {report.errors.map((e) => <p key={e.index}>Error en la pregunta {e.index + 1}: {e.error}</p>)}
        </div>
      )}
    </>
  )
}


function Stats({ token, openQuestion }: { token: string; openQuestion: (id: string) => void }) {
  const [rows, setRows] = useState<OverviewRow[] | null>(null)
  const [min, setMin] = useState(100)
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const r = await call<{ overview: OverviewRow[]; minForSuggestions: number }>(token, '/stats')
      setRows(r.overview)
      setMin(r.minForSuggestions)
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [token])
  useEffect(() => { void load() }, [load])

  if (open) return <StatDetailView token={token} id={open} onBack={() => { setOpen(null); void load() }} openQuestion={openQuestion} />
  return (
    <>
      <h2>Lo que escriben los jugadores</h2>
      <p className="hint">
        Se guarda todo lo que se escribe en cada pregunta (sin guardar quién lo escribió). Lo que no está en la lista aparece como "no válida": si muchos
        lo intentan, probablemente falta esa respuesta. Con {min} respuestas válidas o más, también se sugiere el nivel según qué tan seguido sale cada respuesta.
      </p>
      {error && <p className="error">{error}</p>}
      {rows && rows.length === 0 && <p className="hint">Todavía no hay partidas jugadas. Cuando se juegue, aquí aparecen las preguntas con sus datos.</p>}
      <ul className="qlist">
        {rows?.map((r) => (
          <li key={r.id} onClick={() => setOpen(r.id)}>
            <span className="cat-name">{r.category}</span>
            <span className="q-prompt">
              {r.prompt}
              {r.topUnknown.length > 0 && <small>Intentaron y no está: {r.topUnknown.map((u) => `${u.text} (${u.count})`).join(', ')}</small>}
            </span>
            <span className="n">{r.answered}/{r.asked} respondieron</span>
            {r.unknownTotal > 0 && <span className="warn">{r.unknownTotal} no válidas</span>}
            {r.mismatches > 0 && <span className="warn">{r.mismatches} niveles por revisar</span>}
          </li>
        ))}
      </ul>
      {rows && rows.length > 0 && (
        <button className="danger" onClick={async () => {
          if (!window.confirm('¿Borrar TODOS los datos de partidas? (No borra las preguntas.)')) return
          await call(token, '/stats', 'DELETE')
          void load()
        }}>Borrar todos los datos de partidas</button>
      )}
    </>
  )
}

function StatDetailView({ token, id, onBack, openQuestion }: { token: string; id: string; onBack: () => void; openQuestion: (id: string) => void }) {
  const [d, setD] = useState<StatDetail | null>(null)
  const [tier, setTier] = useState<Record<string, number>>({})
  const [target, setTarget] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => setD(await call<StatDetail>(token, `/stats/${id}`)), [token, id])
  useEffect(() => { void load() }, [load])

  const add = async (u: LoggedAnswer, alias: boolean) => {
    setMsg('')
    try {
      const r = await call<{ problems: string[]; demoted: boolean }>(token, `/stats/${id}/add`, 'POST', alias
        ? { text: u.text, alias: true, label: target[u.key] }
        : { text: u.text, points: tier[u.key] ?? 60 })
      if (r.demoted) setMsg(`"${u.text}" se agregó, pero la pregunta pasó a borrador: ${r.problems.join(' ')}`)
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }
  const ignore = async (u: LoggedAnswer, ignored: boolean) => {
    await call(token, `/stats/${id}/ignore`, 'POST', { key: u.key, ignored })
    await load()
  }

  if (!d) return <p className="hint">Cargando…</p>
  const enough = d.validTotal >= d.minForSuggestions
  return (
    <>
      <div className="row">
        <button onClick={onBack}>← Volver</button>
        <button onClick={() => openQuestion(id)}>Editar la pregunta</button>
        <button className="danger" onClick={async () => {
          if (!window.confirm('¿Borrar los datos de esta pregunta?')) return
          await call(token, `/stats/${id}`, 'DELETE')
          onBack()
        }}>Borrar datos de esta pregunta</button>
      </div>
      <h2>{d.prompt}</h2>
      <p className="hint">{d.category} · {d.answered} de {d.asked} jugadores respondieron · {d.validTotal} intentos válidos · {d.unknownTotal} no válidos</p>
      {msg && <div className="msg warn"><p>{msg}</p></div>}

      <h2>No están en la lista</h2>
      {d.unknown.length === 0 && <p className="hint">Nada por ahora.</p>}
      <ul className="qlist">
        {d.unknown.map((u) => (
          <li key={u.key} className={u.ignored ? 'ignored' : ''} style={{ cursor: 'default' }}>
            <span className="q-prompt">{u.text}<small>{u.count} {u.count === 1 ? 'vez' : 'veces'}{u.ignored ? ' · ignorada' : ''}</small></span>
            {!u.ignored ? (
              <>
                <select value={tier[u.key] ?? 60} onChange={(e) => setTier({ ...tier, [u.key]: Number(e.target.value) })}>
                  {TIERS.map((t) => <option key={t} value={t}>{t} · {tierLabel(t)}</option>)}
                </select>
                <button className="primary" onClick={() => add(u, false)}>Agregar como respuesta</button>
                <select value={target[u.key] ?? ''} onChange={(e) => setTarget({ ...target, [u.key]: e.target.value })}>
                  <option value="">…o alias de</option>
                  {d.answers.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}
                </select>
                <button disabled={!target[u.key]} onClick={() => add(u, true)}>Agregar alias</button>
                <button onClick={() => ignore(u, true)}>Ignorar</button>
              </>
            ) : (
              <button onClick={() => ignore(u, false)}>Dejar de ignorar</button>
            )}
          </li>
        ))}
      </ul>

      <h2>Respuestas de la lista</h2>
      <p className="hint">
        {enough
          ? 'La sugerencia sale de qué parte de las respuestas válidas fue cada una: 8% o más = 10, 3% = 30, 1% = 60, 0.3% = 80, menos = 100.'
          : `Faltan datos para sugerir niveles (hay ${d.validTotal} de ${d.minForSuggestions} respuestas válidas necesarias).`}
      </p>
      <ul className="qlist">
        {d.answers.filter((a) => a.count > 0).map((a) => (
          <li key={a.label} style={{ cursor: 'default' }}>
            <span className="q-prompt">{a.label}</span>
            <span className="n">{a.count} · {(a.share * 100).toFixed(1)}%</span>
            <span className="n">nivel {a.points}</span>
            {a.suggested !== null && a.suggested !== a.points && <span className="warn">sugerido {a.suggested}</span>}
          </li>
        ))}
        {d.answers.every((a) => a.count === 0) && <li className="empty">Todavía nadie escribió una respuesta válida.</li>}
      </ul>
    </>
  )
}

// ---- shell ----

export function Admin() {
  const [token, setToken] = useState(stored)
  const [typed, setTyped] = useState('')
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState<Counts | null>(null)
  const [tab, setTab] = useState<'preguntas' | 'sugerencias' | 'respuestas' | 'importar'>('preguntas')
  const [edit, setEdit] = useState<Draft | null>(null)

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      setCounts(await call<Counts>(token, '/ping'))
      setOk(true)
      setError('')
    } catch (e) {
      setOk(false)
      if ((e as { status?: number }).status === 401) {
        try { sessionStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
        setToken('')
        setError('Token incorrecto.')
      } else {
        setError((e as Error).message)
      }
    }
  }, [token])
  useEffect(() => { void refresh() }, [refresh])

  if (!token || !ok) {
    return (
      <main className="admin login">
        <form className="card" onSubmit={(e) => {
          e.preventDefault()
          try { sessionStorage.setItem(TOKEN_KEY, typed.trim()) } catch { /* ignore */ }
          setToken(typed.trim())
        }}>
          <h1>Administrador</h1>
          <p className="tagline">El token aparece en la terminal del servidor al arrancarlo (y en server/data/admin-token.txt).</p>
          <input type="password" autoFocus placeholder="Token" value={typed} onChange={(e) => setTyped(e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={!typed.trim()}>Entrar</button>
        </form>
      </main>
    )
  }

  return (
    <main className="admin">
      <header>
        <h1>Altus · Administrador</h1>
        <nav>
          <button className={tab === 'preguntas' ? 'on' : ''} onClick={() => setTab('preguntas')}>Preguntas</button>
          <button className={tab === 'sugerencias' ? 'on' : ''} onClick={() => setTab('sugerencias')}>
            Sugerencias{counts && counts.newSuggestions > 0 ? ` (${counts.newSuggestions})` : ''}
          </button>
          <button className={tab === 'respuestas' ? 'on' : ''} onClick={() => setTab('respuestas')}>Respuestas de jugadores</button>
          <button className={tab === 'importar' ? 'on' : ''} onClick={() => setTab('importar')}>Importar / exportar</button>
          <button className="link" onClick={() => { try { sessionStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } setToken(''); setOk(false) }}>Salir</button>
        </nav>
      </header>
      {tab === 'preguntas' && <Questions token={token} counts={counts} refresh={refresh} edit={edit} setEdit={setEdit} />}
      {tab === 'sugerencias' && <Suggestions token={token} refresh={refresh} openDraft={(q) => { setEdit(fromQuestion(q)); setTab('preguntas') }} />}
      {tab === 'respuestas' && (
        <Stats token={token} openQuestion={async (id) => {
          const r = await call<{ question: Question }>(token, `/questions/${id}`)
          setEdit(fromQuestion(r.question))
          setTab('preguntas')
        }} />
      )}
      {tab === 'importar' && <ImportExport token={token} refresh={refresh} />}
    </main>
  )
}
