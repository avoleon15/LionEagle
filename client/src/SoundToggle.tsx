import { useEffect, useState } from 'react'
import { isMuted, onMutedChange, setMuted } from './sound'

/** Speaker button: turns the game's sounds on or off (remembered in this browser). */
export function SoundToggle({ className = '' }: { className?: string }) {
  const [off, setOff] = useState(isMuted())
  useEffect(() => onMutedChange(() => setOff(isMuted())), [])
  return (
    <button className={`soundbtn ${className}`} aria-label={off ? 'Activar sonido' : 'Silenciar'} aria-pressed={!off} title={off ? 'Sonido apagado' : 'Sonido encendido'} onClick={() => setMuted(!off)}>
      {off ? '♪✕' : '♪'}
    </button>
  )
}
