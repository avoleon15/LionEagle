// The seasonal look of the backgrounds. The pictures of each theme live in their own folder (client/public/bg/<theme>/) and the
// ones in client/public/bg/ itself are the normal ("clásico") ones, which are never removed.
//
// To turn a theme on or off for everybody, change DEFAULT_THEME. To look at one without changing anything, open the game with
// ?tema=clasico or ?tema=navidad (the choice is remembered in that browser until you pick the other one).

import './navidad.css'

export const THEMES = ['clasico', 'navidad'] as const
export type Theme = (typeof THEMES)[number]

/** The theme everybody sees right now. */
export const DEFAULT_THEME: Theme = 'navidad'

const KEY = 'altus-tema'

export function activeTheme(): Theme {
  try {
    const asked = new URLSearchParams(window.location.search).get('tema')
    if (asked && (THEMES as readonly string[]).includes(asked)) {
      window.localStorage.setItem(KEY, asked)
      return asked as Theme
    }
    const saved = window.localStorage.getItem(KEY)
    if (saved && (THEMES as readonly string[]).includes(saved)) return saved as Theme
  } catch {
    // no storage (private window): the default
  }
  return DEFAULT_THEME
}

/**
 * A test: the title screen's background drawn by code (pixel/homeXmas.ts) instead of the picture. Open the game with ?fondo=codigo to see it
 * and ?fondo=imagen to go back (remembered in that browser). It only exists for the Christmas theme.
 */
export function codedHome(): boolean {
  if (activeTheme() !== 'navidad') return false
  try {
    const asked = new URLSearchParams(window.location.search).get('fondo')
    if (asked === 'codigo' || asked === 'imagen') window.localStorage.setItem('altus-fondo', asked)
    return window.localStorage.getItem('altus-fondo') === 'codigo'
  } catch {
    return false
  }
}

/** The folder of the active theme's pictures inside /bg/, or '' for the normal ones. */
export const themeDir = (): string => {
  const t = activeTheme()
  return t === 'clasico' ? '' : t
}

// The look of the frames and the podium follows the theme through an attribute on <html> (see navidad.css).
if (typeof document !== 'undefined') document.documentElement.dataset.tema = activeTheme()
