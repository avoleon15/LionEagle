import { useState } from 'react'
import { AVATAR_OPTIONS, CODE_LENGTH, MAX_NICK, type Avatar as AvatarData } from '../../shared/protocol'
import { Avatar, COLORS } from './Avatar'
import type { Profile } from './session'
import { SuggestBox } from './SuggestBox'

interface Props {
  profile: Profile
  onProfile: (p: Profile) => void
  initialCode: string
  error: string
  busy: boolean
  onCreate: () => void
  onJoin: (code: string) => void
}

const PARTS: { key: 'face' | 'hat'; label: string }[] = [
  { key: 'face', label: 'Cara' },
  { key: 'hat', label: 'Gorro' },
]

export function Home({ profile, onProfile, initialCode, error, busy, onCreate, onJoin }: Props) {
  const [code, setCode] = useState(initialCode)
  const [suggesting, setSuggesting] = useState(false)
  const nickOk = profile.nick.trim().length > 0
  const setAvatar = (patch: Partial<AvatarData>) => onProfile({ ...profile, avatar: { ...profile.avatar, ...patch } })
  const cycle = (key: keyof AvatarData, dir: 1 | -1) => {
    const n = AVATAR_OPTIONS[key]
    setAvatar({ [key]: (profile.avatar[key] + dir + n) % n })
  }
  const random = () =>
    setAvatar({
      color: Math.floor(Math.random() * AVATAR_OPTIONS.color),
      face: Math.floor(Math.random() * AVATAR_OPTIONS.face),
      hat: Math.floor(Math.random() * AVATAR_OPTIONS.hat),
    })

  return (
    <main className="screen home">
      <header className="title">
        <h1>
          Altus
        </h1>
      </header>

      <section className="box maker">
        <div className="stand">
          <Avatar a={profile.avatar} size={96} />
          <button className="dice" onClick={random} aria-label="Personaje al azar" title="Al azar">
            ?
          </button>
        </div>

        <div className="swatches" role="group" aria-label="Color">
          {COLORS.map((c, i) => (
            <button
              key={c}
              className={'swatch' + (profile.avatar.color === i ? ' on' : '')}
              style={{ background: c }}
              aria-label={`Color ${i + 1}`}
              onClick={() => setAvatar({ color: i })}
            />
          ))}
        </div>

        <div className="pickers">
        {PARTS.map(({ key, label }) => (
          <div className="picker" key={key}>
            <button onClick={() => cycle(key, -1)} aria-label={`${label} anterior`}>
              ◀
            </button>
            <span>{label}</span>
            <button onClick={() => cycle(key, 1)} aria-label={`${label} siguiente`}>
              ▶
            </button>
          </div>
        ))}
        </div>

        <input className="nick" placeholder="Tu apodo" maxLength={MAX_NICK} value={profile.nick} onChange={(e) => onProfile({ ...profile, nick: e.target.value })} />

        {error && <p className="error">{error}</p>}

        <div className="join">
          <input placeholder="Código" maxLength={CODE_LENGTH} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <button className="joinbtn" disabled={!nickOk || busy || code.length !== CODE_LENGTH} onClick={() => onJoin(code)}>
            Unirme
          </button>
        </div>
        <button className="create" disabled={!nickOk || busy} onClick={onCreate}>
          Crear sala
        </button>
        <button className="link" onClick={() => setSuggesting(true)}>
          Sugerir una pregunta
        </button>
      </section>
      {suggesting && <SuggestBox nick={profile.nick} categories={[]} onClose={() => setSuggesting(false)} />}
    </main>
  )
}
