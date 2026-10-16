import { useState } from 'react'
import { AVATAR_OPTIONS, CODE_LENGTH, MAX_NICK, type Avatar as AvatarData } from '../../shared/protocol'
import { Avatar, COLORS, hatName } from './Avatar'
import { eagleSprite, lionSprite, spriteUrl } from './pixel/mascots'
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

const PARTS: { key: keyof AvatarData; label: string }[] = [
  { key: 'face', label: 'Cara' },
  { key: 'hat', label: 'Gorro' },
]

export function Home({ profile, onProfile, initialCode, error, busy, onCreate, onJoin }: Props) {
  const [code, setCode] = useState(initialCode)
  const [suggesting, setSuggesting] = useState(false)
  const nickOk = profile.nick.trim().length > 0
  const setAvatar = (patch: Partial<AvatarData>) =>
    onProfile({ ...profile, avatar: { ...profile.avatar, ...patch } })
  const cycle = (key: keyof AvatarData, dir: 1 | -1) => {
    const n = AVATAR_OPTIONS[key]
    setAvatar({ [key]: (profile.avatar[key] + dir + n) % n })
  }

  return (
    <main className="home">
      <div className="critters" aria-hidden>
        {Array.from({ length: 48 }, (_, i) => {
          const sprite = (i * 5) % 3 === 0 ? eagleSprite() : lionSprite()
          return (
            <img
              key={i}
              src={spriteUrl(sprite)}
              alt=""
              draggable={false}
              style={{ width: sprite.width * 2, height: sprite.height * 2, animationDelay: `${(i % 7) * -0.9}s` }}
            />
          )
        })}
      </div>

      <section className="card">
        <h1>León Águila</h1>
        <p className="tagline">Mientras más rara tu respuesta, más alto vuelas.</p>

        <div className="preview">
          <Avatar a={profile.avatar} size={110} />
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

        <div className="parts">
          {PARTS.map(({ key, label }) => (
            <div className="part" key={key}>
              <button onClick={() => cycle(key, -1)} aria-label={`${label} anterior`}>‹</button>
              <span>{label}{key === 'hat' && profile.avatar.hat > 0 ? `: ${hatName(profile.avatar.hat)}` : ''}</span>
              <button onClick={() => cycle(key, 1)} aria-label={`${label} siguiente`}>›</button>
            </div>
          ))}
        </div>

        <input
          className="nick"
          placeholder="Tu apodo"
          maxLength={MAX_NICK}
          value={profile.nick}
          onChange={(e) => onProfile({ ...profile, nick: e.target.value })}
        />

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button className="primary" disabled={!nickOk || busy} onClick={onCreate}>
            Crear sala
          </button>
          <div className="join">
            <input
              placeholder="CÓDIGO"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button disabled={!nickOk || busy || code.length !== CODE_LENGTH} onClick={() => onJoin(code)}>
              Unirme
            </button>
          </div>
        </div>
        <button className="link" onClick={() => setSuggesting(true)}>
          Sugerir una pregunta
        </button>
      </section>
      {suggesting && <SuggestBox nick={profile.nick} categories={[]} onClose={() => setSuggesting(false)} />}
    </main>
  )
}
