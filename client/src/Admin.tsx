import { useCallback, useEffect, useMemo, useState } from 'react'
import { TIERS, tierLabel } from '../../shared/protocol'
import './admin.css'

// Owner tool at /admin. Everything goes through /api/admin with the admin token.

interface Answer { label: string; aliases: string[]; points: number }
interface Question {
  id: string
  category: string
  prompt: string
  status: 'draft' | 'published' | 'archived'
  source: 'sample' | 'owner' | 'suggestion'
  notes: string
  hint: string
  answers: Answer[]
  problems?: string[]
  updatedAt: number
}
/** What the question list carries; the full question (with its answers) is fetched when it is opened. */
interface Summary { id: string; category: string; prompt: string; status: Question['status']; source: Question['source']; answerCount: number; updatedAt: number; problems: string[] }
interface Suggestion { id: number; prompt: string; category: string; answers: string; nick: string; status: string; createdAt: number; questionId: string | null }
interface Counts { questions: Record<string, number>; newSuggestions: number; ip?: string; hops?: number }
interface BackupRow { name: string; createdAt: number; reason: string; size: number; questions: number }
interface Overview {
  games: number; finished: number; seats: number; avgPlayers: number; devices: number; returning: number
  newDevices7: number; games7: number; today: number
  byDay: { day: string; games: number; seats: number }[]
  topQuestions: { id: string; prompt: string; category: string; asked: number; answered: number }[]
  neverAsked: number; published: number
  categories: { category: string; asked: number; questions: number }[]
  firstGameAt: number | null
}
const BACKUP_REASON: Record<string, string> = { borrar: 'Antes de borrar una pregunta', importar: 'Antes de importar', diaria: 'Copia diaria', 'antes-de-restaurar': 'Antes de restaurar otra copia' }
interface OverviewRow { id: string; prompt: string; category: string; status: string; asked: number; answered: number; validTotal: number; unknownTotal: number; avgScore: number | null; wrongShare: number | null; topUnknown: { text: string; count: number }[]; mismatches: number }
interface AnswerStat { label: string; points: number; count: number; share: number; suggested: number | null; variants: { text: string; count: number }[] }
interface LoggedAnswer { key: string; text: string; count: number; lastAt: number; ignored: boolean }
interface StatDetail { id: string; prompt: string; category: string; asked: number; answered: number; validTotal: number; unknownTotal: number; avgScore: number | null; tiers: Record<number, number>; answers: AnswerStat[]; unknown: LoggedAnswer[]; minForSuggestions: number }

const TOKEN_KEY = 'leonaguila.admin'
/** Hints in the content files stay within this many letters; the server accepts up to 160. */
const HINT_SOFT_LIMIT = 120
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

interface Draft { id?: string; category: string; prompt: string; notes: string; hint: string; status: Question['status']; source: Question['source']; text: TierText }

const blank = (category = ''): Draft => ({ category, prompt: '', notes: '', hint: '', status: 'draft', source: 'owner', text: toText([]) })
const fromQuestion = (q: Question): Draft => ({ id: q.id, category: q.category, prompt: q.prompt, notes: q.notes, hint: q.hint ?? '', status: q.status, source: q.source, text: toText(q.answers) })

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
    const body = { category: d.category, prompt: d.prompt, notes: d.notes, hint: d.hint, source: d.source, status, answers }
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
      <label>Pista (se muestra pequeña debajo de la pregunta)
        <input value={d.hint} maxLength={160} onChange={(e) => setD({ ...d, hint: e.target.value })} placeholder="Piensa en: ciudades, países y ríos." />
        <small className={d.hint.length > HINT_SOFT_LIMIT ? 'warn' : 'hint'}>{d.hint.length}/{HINT_SOFT_LIMIT}{d.hint.length > HINT_SOFT_LIMIT ? ' · una pista tan larga ocupa mucho espacio en el teléfono' : ''}. No pongas respuestas de la lista en la pista.</small>
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
      <div className="tiles">
        <div className="tile published"><b>{counts?.questions.published ?? 0}</b><span>Publicadas</span></div>
        <div className="tile"><b>{counts?.questions.draft ?? 0}</b><span>Borradores</span></div>
        <div className="tile"><b>{counts?.questions.archived ?? 0}</b><span>Archivadas</span></div>
        <div className="tile suggest"><b>{counts?.newSuggestions ?? 0}</b><span>Sugerencias nuevas</span></div>
      </div>
      <p className="hint">Para jugar se necesitan al menos 7 publicadas en las categorías elegidas.</p>
      <div className="actions">
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
      </div>
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

/** The automatic copies of the questions: taken before deleting or importing and once a day. Restoring puts a copy's questions back. */
function Backups({ token, refresh }: { token: string; refresh: () => void }) {
  const [rows, setRows] = useState<BackupRow[] | null>(null)
  const [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    try { setRows((await call<{ backups: BackupRow[] }>(token, '/backups')).backups) } catch (e) { setMsg((e as Error).message) }
  }, [token])
  useEffect(() => { void load() }, [load])

  const download = async (b: BackupRow) => {
    const data = await call<unknown>(token, `/backups/${b.name}`)
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = b.name
    a.click()
    URL.revokeObjectURL(url)
  }
  const restore = async (b: BackupRow) => {
    const when = new Date(b.createdAt).toLocaleString('es')
    if (!window.confirm(`¿Restaurar la copia del ${when}?\n\nLas ${b.questions} preguntas de esa copia vuelven como estaban (lo borrado regresa y lo editado vuelve a esa versión). Antes se guarda una copia de cómo está todo ahora.`)) return
    try {
      const r = await call<{ created: number; updated: number }>(token, `/backups/${b.name}/restore`, 'POST', {})
      setMsg(`Copia restaurada: ${r.created} preguntas devueltas y ${r.updated} puestas como estaban.`)
      void load(); refresh()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }
  return (
    <>
      <h2>Copias automáticas</h2>
      <p className="hint">
        El servidor guarda solo una copia de las preguntas antes de borrar una, antes de importar y una vez al día (las últimas 10 de cada tipo). No incluyen
        lo que escribieron los jugadores. Una copia descargada se puede volver a importar abajo.
      </p>
      {msg && <div className="msg ok"><p>{msg}</p></div>}
      <ul className="qlist">
        {rows?.map((b) => (
          <li key={b.name} style={{ cursor: 'default' }}>
            <span className="q-prompt">{BACKUP_REASON[b.reason] ?? b.reason}<small>{new Date(b.createdAt).toLocaleString('es')} · {b.questions} preguntas · {Math.max(1, Math.round(b.size / 1024))} KB</small></span>
            <button onClick={() => void download(b)}>Descargar</button>
            <button className="danger" onClick={() => void restore(b)}>Restaurar</button>
          </li>
        ))}
        {rows && rows.length === 0 && <li className="empty">Todavía no hay copias. La primera se guarda en cuanto arranca el servidor o antes del primer borrado.</li>}
      </ul>
    </>
  )
}

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
    a.download = `altus-preguntas-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <h2>Exportar</h2>
      <p className="hint">Descarga todas las preguntas (copia de seguridad).</p>
      <button onClick={doExport}>Descargar JSON</button>
      <Backups token={token} refresh={refresh} />
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


// ---- charts: plain SVG and divs, no library ----

const TIER_COLOR: Record<number, string> = { 10: 'var(--t10)', 30: 'var(--t30)', 60: 'var(--t60)', 80: 'var(--t80)', 100: 'var(--t100)' }

/** A donut chart with a legend. The centre shows one number (for example the average score). */
function Pie({ title, slices, centre, unit }: { title: string; slices: { label: string; value: number; color: string }[]; centre?: string; unit?: string }) {
  const total = slices.reduce((n, s) => n + s.value, 0)
  const R = 52
  const C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="pie">
      <h3>{title}</h3>
      <div className="pie-body">
        <svg viewBox="0 0 140 140" role="img" aria-label={title}>
          <circle cx="70" cy="70" r={R} fill="none" style={{ stroke: 'var(--field)' }} strokeWidth="26" />
          {total > 0 && slices.filter((s) => s.value > 0).map((s) => {
            const len = (s.value / total) * C
            const el = <circle key={s.label} cx="70" cy="70" r={R} fill="none" style={{ stroke: s.color }} strokeWidth="26" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
            offset += len
            return el
          })}
          <circle cx="70" cy="70" r="65" fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth="3" />
          <circle cx="70" cy="70" r="39" fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth="3" />
          {centre && <text x="70" y="72" textAnchor="middle" className="pie-n">{centre}</text>}
          {unit && <text x="70" y="90" textAnchor="middle" className="pie-u">{unit}</text>}
        </svg>
        <ul>
          {slices.map((s) => (
            <li key={s.label} className={s.value === 0 ? 'zero' : ''}>
              <i style={{ background: s.color }} />
              <span>{s.label}</span>
              <b>{s.value}</b>
              <small>{total ? Math.round((s.value / total) * 100) : 0}%</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Meter({ value, max, color }: { value: number; max: number; color?: string }) {
  return <span className="meter" aria-hidden><i style={{ width: `${max ? Math.max(value > 0 ? 3 : 0, (value / max) * 100) : 0}%`, ...(color ? { background: color } : {}) }} /></span>
}

const pct = (x: number | null | undefined) => (x === null || x === undefined ? '—' : `${Math.round(x * 100)}%`)

// ---- one question: what players typed ----

type SortKey = 'salen' | 'incorrectas' | 'puntaje'

/** Every published question with how it is doing: how often it comes up, the average score and how many answers miss the list. */
function Stats({ token, open }: { token: string; open: (id: string) => void }) {
  const [rows, setRows] = useState<OverviewRow[] | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<SortKey>('salen')

  const load = useCallback(async () => {
    try {
      setRows((await call<{ overview: OverviewRow[] }>(token, '/stats')).overview)
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [token])
  useEffect(() => { void load() }, [load])

  const cats = useMemo(() => [...new Set((rows ?? []).map((r) => r.category))].sort(), [rows])
  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const list = (rows ?? []).filter((r) => (!category || r.category === category) && (!needle || r.prompt.toLowerCase().includes(needle)))
    const by: Record<SortKey, (r: OverviewRow) => number> = {
      salen: (r) => r.asked,
      incorrectas: (r) => r.wrongShare ?? -1,
      puntaje: (r) => r.avgScore ?? -1,
    }
    return [...list].sort((a, b) => by[sort](b) - by[sort](a) || a.prompt.localeCompare(b.prompt))
  }, [rows, search, category, sort])

  return (
    <>
      <h2>Estadísticas por pregunta</h2>
      <p className="hint">Toca una pregunta para ver lo que escribieron los jugadores, su puntaje y qué respuestas faltan. No se guarda quién escribió qué.</p>
      {error && <p className="error">{error}</p>}
      <div className="toolbar">
        <input placeholder="Buscar pregunta…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="salen">Ordenar: las que más salen</option>
          <option value="incorrectas">Ordenar: más respuestas incorrectas</option>
          <option value="puntaje">Ordenar: puntaje promedio</option>
        </select>
      </div>
      {!rows && !error && <p className="hint">Cargando…</p>}
      <ul className="qlist">
        {shown.map((r) => (
          <li key={r.id} onClick={() => open(r.id)}>
            <span className="cat-name">{r.category}</span>
            <span className="q-prompt">{r.prompt}</span>
            <span className="n">{r.asked ? `salió ${r.asked}` : 'sin jugar'}</span>
            {r.avgScore !== null && <span className="n">promedio {r.avgScore}</span>}
            {r.wrongShare !== null && r.wrongShare > 0 && <span className="warn">{pct(r.wrongShare)} incorrectas</span>}
          </li>
        ))}
        {rows && shown.length === 0 && <li className="empty">No hay preguntas con ese filtro.</li>}
      </ul>
      {rows && rows.some((r) => r.asked > 0) && (
        <p>
          <button className="danger" onClick={async () => {
            if (!window.confirm('¿Borrar TODOS los datos de partidas? (No borra las preguntas.)')) return
            await call(token, '/stats', 'DELETE')
            void load()
          }}>Borrar todos los datos de partidas</button>
        </p>
      )}
    </>
  )
}

/** The form to turn something players typed into an answer: the owner picks its name, its aliases and its tier. */
function AddForm({ u, answers, onSave, onCancel }: { u: LoggedAnswer; answers: AnswerStat[]; onSave: (body: Record<string, unknown>) => Promise<void>; onCancel: () => void }) {
  const [mode, setMode] = useState<'new' | 'alias'>('new')
  const [label, setLabel] = useState(u.text)
  const [aliases, setAliases] = useState('')
  const [points, setPoints] = useState(60)
  const [includeTyped, setIncludeTyped] = useState(true)
  const [target, setTarget] = useState('')
  const [aliasText, setAliasText] = useState(u.text)
  const [busy, setBusy] = useState(false)
  const split = (t: string) => t.split(/[|,\n]/).map((x) => x.trim()).filter(Boolean)
  const typedIsName = label.trim().toLowerCase() === u.text.toLowerCase()
  const submit = async () => {
    setBusy(true)
    await onSave(mode === 'new'
      ? { text: u.text, label: label.trim(), aliases: split(aliases), points, includeTyped }
      : { text: u.text, alias: true, label: target, aliases: split(aliasText) })
    setBusy(false)
  }
  return (
    <div className="addform editor" style={{ flexBasis: '100%' }}>
      <div className="row">
        <label className="check"><input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} /> Respuesta nueva</label>
        <label className="check"><input type="radio" checked={mode === 'alias'} onChange={() => setMode('alias')} /> Otra forma de escribir una que ya existe</label>
      </div>
      {mode === 'new' ? (
        <>
          <label>Nombre de la respuesta (el que se muestra)
            <input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label>Alias: otras formas de escribirla (separados por coma o |)
            <input value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="por ejemplo: Rey León, Simba" />
          </label>
          {!typedIsName && (
            <label className="check"><input type="checkbox" checked={includeTyped} onChange={(e) => setIncludeTyped(e.target.checked)} /> También aceptar “{u.text}” (lo que escribieron los jugadores)</label>
          )}
          <label>Nivel
            <select value={points} onChange={(e) => setPoints(Number(e.target.value))}>
              {TIERS.map((t) => <option key={t} value={t}>{t} · {tierLabel(t)}</option>)}
            </select>
          </label>
        </>
      ) : (
        <>
          <label>Respuesta a la que se le agrega
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Elige una…</option>
              {answers.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}
            </select>
          </label>
          <label>Formas de escribirla que se agregan (separadas por coma o |)
            <input value={aliasText} onChange={(e) => setAliasText(e.target.value)} />
          </label>
        </>
      )}
      <div className="row">
        <button className="primary" disabled={busy || (mode === 'new' ? !label.trim() : !target || split(aliasText).length === 0)} onClick={submit}>
          {mode === 'new' ? 'Agregar respuesta' : 'Agregar alias'}
        </button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

function StatDetailView({ token, id, back, openQuestion }: { token: string; id: string; back: () => void; openQuestion: (id: string) => void }) {
  const [d, setD] = useState<StatDetail | null>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setD(await call<StatDetail>(token, `/stats/${id}`))
    } catch (e) {
      setError((e as Error).message)
    }
  }, [token, id])
  useEffect(() => { void load() }, [load])

  const save = async (u: LoggedAnswer, body: Record<string, unknown>) => {
    setMsg('')
    try {
      const r = await call<{ problems: string[]; demoted: boolean }>(token, `/stats/${id}/add`, 'POST', body)
      if (r.demoted) setMsg(`"${u.text}" se agregó, pero la pregunta pasó a borrador: ${r.problems.join(' ')}`)
      setAdding(null)
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }
  const ignore = async (u: LoggedAnswer, ignored: boolean) => {
    await call(token, `/stats/${id}/ignore`, 'POST', { key: u.key, ignored })
    await load()
  }

  if (error) return <p className="error">{error}</p>
  if (!d) return <p className="hint">Cargando…</p>
  const enough = d.validTotal >= d.minForSuggestions
  const attempts = d.validTotal + d.unknownTotal
  const maxCount = Math.max(1, ...d.answers.map((a) => a.count))
  return (
    <>
      <h2 className="first">{d.prompt}</h2>
      <p className="hint">{d.category}</p>
      <div className="tiles">
        <div className="tile"><b>{d.asked}</b><span>Veces que salió</span></div>
        <div className="tile"><b>{d.asked ? pct(d.answered / d.asked) : '—'}</b><span>Respondieron</span></div>
        <div className="tile published"><b>{d.avgScore ?? '—'}</b><span>Puntaje promedio</span></div>
        <div className="tile suggest"><b>{attempts ? pct(d.unknownTotal / attempts) : '—'}</b><span>Respuestas incorrectas</span></div>
      </div>
      {msg && <div className="msg warn"><p>{msg}</p></div>}

      <div className="pies">
        <Pie
          title="Puntos de las respuestas válidas"
          centre={d.avgScore === null ? '—' : String(d.avgScore)}
          unit="promedio"
          slices={TIERS.map((t) => ({ label: `${t} puntos`, value: d.tiers[t] ?? 0, color: TIER_COLOR[t] }))}
        />
        <Pie
          title="Lo que escribieron"
          slices={[
            { label: 'Válidas', value: d.validTotal, color: 'var(--green)' },
            { label: 'No están en la lista', value: d.unknownTotal, color: 'var(--pink)' },
          ]}
        />
      </div>

      <h2>Todas las respuestas</h2>
      <p className="hint">
        {enough
          ? 'La sugerencia sale de qué parte de las respuestas válidas fue cada una: 8% o más = 10, 3% = 30, 1% = 60, 0.3% = 80, menos = 100.'
          : `Faltan datos para sugerir niveles (hay ${d.validTotal} de ${d.minForSuggestions} respuestas válidas necesarias).`}
      </p>
      <ul className="qlist">
        {d.answers.map((a) => {
          const others = a.variants.filter((v) => v.text.toLowerCase() !== a.label.toLowerCase()).slice(0, 4)
          return (
            <li key={a.label} className={a.count === 0 ? 'ignored' : ''} style={{ cursor: 'default' }}>
              <span className="q-prompt">
                {a.label}
                {others.length > 0 && <small>también escribieron: {others.map((v) => `${v.text} (${v.count})`).join(', ')}</small>}
              </span>
              <Meter value={a.count} max={maxCount} color={TIER_COLOR[a.points]} />
              <span className="n num">{a.count} · {(a.share * 100).toFixed(1)}%</span>
              <span className="n">nivel {a.points}</span>
              {a.suggested !== null && a.suggested !== a.points && <span className="warn">sugerido {a.suggested}</span>}
            </li>
          )
        })}
      </ul>

      <h2>No están en la lista</h2>
      {d.unknown.length === 0 && <p className="hint">Nada por ahora.</p>}
      <ul className="qlist">
        {d.unknown.map((u) => (
          <li key={u.key} className={u.ignored ? 'ignored' : ''} style={{ cursor: 'default' }}>
            <span className="q-prompt">{u.text}<small>{u.count} {u.count === 1 ? 'vez' : 'veces'}{u.ignored ? ' · ignorada' : ''}</small></span>
            {!u.ignored ? (
              adding === u.key ? (
                <AddForm u={u} answers={d.answers} onSave={(body) => save(u, body)} onCancel={() => setAdding(null)} />
              ) : (
                <>
                  <button className="primary" onClick={() => { setMsg(''); setAdding(u.key) }}>Agregar…</button>
                  <button onClick={() => ignore(u, true)}>Ignorar</button>
                </>
              )
            ) : (
              <button onClick={() => ignore(u, false)}>Dejar de ignorar</button>
            )}
          </li>
        ))}
      </ul>

      <div className="row end">
        <button onClick={() => openQuestion(id)}>Editar la pregunta</button>
        <button className="danger" onClick={async () => {
          if (!window.confirm('¿Borrar los datos de esta pregunta?')) return
          await call(token, `/stats/${id}`, 'DELETE')
          back()
        }}>Borrar datos de esta pregunta</button>
      </div>
    </>
  )
}

/** The general picture: how much is played, which questions come up most, which are missed most, and how many there are per category. */
function Dashboard({ token, open }: { token: string; open: (id: string) => void }) {
  const [o, setO] = useState<Overview | null>(null)
  const [rows, setRows] = useState<OverviewRow[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    call<Overview>(token, '/metrics').then(setO).catch((e) => setError((e as Error).message))
    call<{ overview: OverviewRow[] }>(token, '/stats').then((r) => setRows(r.overview)).catch(() => undefined)
  }, [token])
  if (error) return <p className="error">{error}</p>
  if (!o) return <p className="hint">Cargando…</p>
  const ratio = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—')
  const peak = Math.max(1, ...o.byDay.map((d) => d.games))
  const top = o.topQuestions.slice(0, 10)
  const maxAsked = Math.max(1, ...top.map((q) => q.asked))
  // Needs a few attempts to mean anything.
  const missed = rows.filter((r) => r.wrongShare !== null && r.validTotal + r.unknownTotal >= 10 && r.wrongShare > 0)
    .sort((a, b) => b.wrongShare! - a.wrongShare! || b.unknownTotal - a.unknownTotal).slice(0, 10)
  const cats = [...o.categories].sort((a, b) => b.questions - a.questions)
  const maxQ = Math.max(1, ...cats.map((c) => c.questions))
  return (
    <>
      <div className="tiles">
        <div className="tile published"><b>{o.games}</b><span>Partidas jugadas</span></div>
        <div className="tile"><b>{o.devices}</b><span>Jugadores distintos</span></div>
        <div className="tile"><b>{o.avgPlayers}</b><span>Jugadores por partida</span></div>
        <div className="tile"><b>{o.today}</b><span>Partidas hoy</span></div>
        <div className="tile"><b>{o.games7}</b><span>Partidas en 7 días</span></div>
        <div className="tile"><b>{ratio(o.finished, o.games)}</b><span>Llegaron al final</span></div>
        <div className="tile"><b>{ratio(o.returning, o.devices)}</b><span>Volvieron a jugar</span></div>
        <div className="tile"><b>{o.published}</b><span>Preguntas publicadas</span></div>
      </div>
      <p className="hint">
        {o.firstGameAt ? `Datos desde el ${new Date(o.firstGameAt).toLocaleDateString('es')}. ` : 'Todavía no se ha jugado ninguna partida desde que se empezó a contar. '}
        “Jugadores distintos” cuenta navegadores o celulares: quien juega desde dos aparatos, o borra los datos del navegador, cuenta como otro.
      </p>

      <h2>Partidas por día (últimos 14)</h2>
      <div className="bars" role="img" aria-label="Partidas por día">
        {o.byDay.map((d) => (
          <div key={d.day} className="bar" title={`${d.day}: ${d.games} partidas, ${d.seats} jugadores`}>
            <span className="n">{d.games || ''}</span>
            <i style={{ height: `${(d.games / peak) * 100}%` }} />
            <small>{d.day.slice(8)}/{d.day.slice(5, 7)}</small>
          </div>
        ))}
      </div>

      <h2>Preguntas que más salen</h2>
      {top.length === 0 && <p className="hint">Todavía no hay datos: aparecen cuando se juegue.</p>}
      <ul className="qlist">
        {top.map((q, i) => (
          <li key={q.id} onClick={() => open(q.id)}>
            <span className="cat-name">{i + 1}</span>
            <span className="q-prompt">{q.prompt}<small>{q.category}</small></span>
            <Meter value={q.asked} max={maxAsked} />
            <span className="n num">{q.asked} veces</span>
          </li>
        ))}
      </ul>
      <p className="hint">{o.neverAsked} de las {o.published} preguntas publicadas todavía no han salido en ninguna partida.</p>

      <h2>Con más respuestas incorrectas</h2>
      {missed.length === 0 && <p className="hint">Todavía no hay suficientes intentos (se necesitan al menos 10 por pregunta).</p>}
      <ul className="qlist">
        {missed.map((r, i) => (
          <li key={r.id} onClick={() => open(r.id)}>
            <span className="cat-name">{i + 1}</span>
            <span className="q-prompt">{r.prompt}<small>{r.category}{r.topUnknown.length > 0 ? ` · intentaron: ${r.topUnknown.map((u) => u.text).join(', ')}` : ''}</small></span>
            <Meter value={r.wrongShare!} max={1} color="var(--pink)" />
            <span className="n num">{pct(r.wrongShare)}</span>
          </li>
        ))}
      </ul>
      {missed.length > 0 && <p className="hint">Es la parte de lo que escribieron que no estaba en la lista. Si es alta, probablemente faltan respuestas.</p>}

      <h2>Preguntas por categoría</h2>
      <ul className="qlist">
        {cats.map((c) => (
          <li key={c.category} style={{ cursor: 'default' }}>
            <span className="q-prompt">{c.category}</span>
            <Meter value={c.questions} max={maxQ} />
            <span className="n num">{c.questions} preguntas</span>
          </li>
        ))}
      </ul>

      <details className="stored-box">
        <summary>Qué se guarda de los jugadores</summary>
        <ul className="stored">
          <li><b>Sí:</b> cada respuesta que se escribe en una pregunta, sea válida o no, con cuántas veces se escribió (hasta 400 textos distintos por pregunta).</li>
          <li><b>Sí:</b> cuántas veces salió cada pregunta y cuántos la respondieron bien.</li>
          <li><b>Sí:</b> de cada partida, la fecha, cuántos jugadores tuvo y si llegó al final.</li>
          <li><b>Sí:</b> un número al azar que cada navegador inventa y guarda; el servidor solo guarda una versión cifrada (hash) para contar jugadores distintos.</li>
          <li><b>No:</b> apodos, direcciones IP, quién escribió cada respuesta ni qué puntos tuvo cada persona. Las salas y las partidas en curso viven en memoria y se pierden al reiniciar.</li>
        </ul>
      </details>
    </>
  )
}

// ---- shell ----

type Tab = 'resumen' | 'preguntas' | 'estadisticas' | 'sugerencias' | 'importar'
/** What is on screen: a tab, and inside it a question's statistics or its editor. */
interface View { tab: Tab; stat: string | null; edit: Draft | null }
const START: View = { tab: 'resumen', stat: null, edit: null }

const HomeIcon = () => (
  <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden shapeRendering="crispEdges" fill="currentColor">
    <path d="M8 1 L0 8h2v7h4v-4h4v4h4V8h2z" />
  </svg>
)
const BackIcon = () => (
  <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden shapeRendering="crispEdges" fill="currentColor">
    <path d="M7 2 L1 8l6 6v-4h8V6H7z" />
  </svg>
)

export function Admin() {
  const [token, setToken] = useState(stored)
  const [typed, setTyped] = useState('')
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState<Counts | null>(null)
  const [view, setView] = useState<View>(START)
  const [trail, setTrail] = useState<View[]>([])

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

  // Going into a question or an editor remembers where we were, so the arrow can go back one step; the tabs and the house start over.
  const go = (next: Partial<View>) => {
    setTrail((t) => [...t, view])
    setView({ tab: view.tab, stat: null, edit: null, ...next })
  }
  const back = () => {
    const prev = trail[trail.length - 1]
    if (prev) {
      setTrail(trail.slice(0, -1))
      setView(prev)
    } else {
      setView({ tab: view.tab, stat: null, edit: null })
    }
  }
  const toTab = (tab: Tab) => { setTrail([]); setView({ tab, stat: null, edit: null }) }
  const canBack = trail.length > 0 || view.stat !== null || view.edit !== null
  const openStat = (id: string) => go({ tab: 'estadisticas', stat: id })
  const openEdit = async (id: string) => {
    const r = await call<{ question: Question }>(token, `/questions/${id}`)
    go({ tab: 'preguntas', edit: fromQuestion(r.question) })
  }

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

  const tabButton = (t: Tab, label: string, extra?: React.ReactNode) => (
    <button className={view.tab === t ? 'on' : ''} onClick={() => toTab(t)}>{label}{extra}</button>
  )
  return (
    <main className="admin">
      <header className="adminbar">
        <div className="barrow">
          {canBack && <button className="icon" onClick={back} aria-label="Volver" title="Volver"><BackIcon /></button>}
          <h1>ALTUS<small>Administrador</small></h1>
          <span className="spacer" />
          <button className="link" onClick={() => { try { sessionStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } setToken(''); setOk(false) }}>Salir</button>
          <button className="icon" onClick={() => toTab('resumen')} aria-label="Inicio" title="Inicio"><HomeIcon /></button>
        </div>
        <nav>
          {tabButton('resumen', 'Resumen')}
          {tabButton('preguntas', 'Preguntas')}
          {tabButton('estadisticas', 'Estadísticas')}
          {tabButton('sugerencias', 'Sugerencias', counts && counts.newSuggestions > 0 ? <span className="count">{counts.newSuggestions}</span> : null)}
          {tabButton('importar', 'Importar / exportar')}
        </nav>
      </header>
      <div className="panel">
        {view.tab === 'resumen' && <Dashboard token={token} open={openStat} />}
        {view.tab === 'preguntas' && (
          <Questions token={token} counts={counts} refresh={refresh} edit={view.edit} setEdit={(d) => (d ? go({ tab: 'preguntas', edit: d }) : back())} />
        )}
        {view.tab === 'estadisticas' && (view.stat
          ? <StatDetailView key={view.stat} token={token} id={view.stat} back={back} openQuestion={openEdit} />
          : <Stats token={token} open={openStat} />)}
        {view.tab === 'sugerencias' && <Suggestions token={token} refresh={refresh} openDraft={(q) => go({ tab: 'preguntas', edit: fromQuestion(q) })} />}
        {view.tab === 'importar' && <ImportExport token={token} refresh={refresh} />}
      </div>
      {counts?.ip !== undefined && (
        <p className="hint footer">
          Tu IP según el servidor: <code>{counts.ip || 'desconocida'}</code>{counts.hops ? ` (${counts.hops} ${counts.hops === 1 ? 'salto' : 'saltos'} de proxy)` : ''}.
          Debe ser tu IP pública (búscala como “cuál es mi ip”). Si sale una dirección privada (10.x, 100.64.x, 172.16–31.x), todos los visitantes
          parecerían la misma persona y el bloqueo de intentos de acceso se compartiría con ellos.
        </p>
      )}
    </main>
  )
}
