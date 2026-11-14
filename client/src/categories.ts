import type { CategoryInfo } from '../../shared/protocol'

// Categories are shown in groups so the lobby is not a wall of buttons. A category that is not listed here
// (the owner added a new one in the admin) goes to "Otras", so nothing ever disappears.
const GROUPS: { name: string; members: string[] }[] = [
  { name: 'Videojuegos', members: ['Videojuegos', 'Minecraft', 'Pokémon'] },
  { name: 'Deportes', members: ['Deportes', 'Fútbol', 'Ajedrez'] },
  { name: 'Cine, series y música', members: ['Cine y series', 'Música', 'Cultura pop', 'Youtubers'] },
  { name: 'Cotidiano y palabras', members: ['Cotidiano', 'Palabras', 'Marcas y apps'] },
  { name: 'Ciencia y mundo', members: ['Ciencia', 'Naturaleza', 'Geografía', 'Historia', 'Cultura general'] },
  { name: 'Comida y bebida', members: ['Comida y bebida'] },
  { name: 'Guatemala', members: ['Guatemala'] },
]

export interface CategoryGroup {
  name: string
  seasonal?: boolean // the seasonal packs that are on: shown first and highlighted
  categories: CategoryInfo[]
  count: number // questions in the whole group
}

export function groupCategories(all: CategoryInfo[]): CategoryGroup[] {
  const placed = new Set<string>()
  const out: CategoryGroup[] = []
  // seasonal packs (turned on by the owner in the admin) go first, in a group of their own
  const seasonal = all.filter((c) => c.seasonal)
  seasonal.forEach((c) => placed.add(c.name))
  if (seasonal.length > 0) out.push({ name: 'De temporada', seasonal: true, categories: seasonal, count: seasonal.reduce((n, c) => n + c.count, 0) })
  for (const g of GROUPS) {
    const categories = all.filter((c) => g.members.includes(c.name) && !placed.has(c.name))
    categories.forEach((c) => placed.add(c.name))
    if (categories.length > 0) out.push({ name: g.name, categories, count: categories.reduce((n, c) => n + c.count, 0) })
  }
  const rest = all.filter((c) => !placed.has(c.name))
  if (rest.length > 0) out.push({ name: 'Otras', categories: rest, count: rest.reduce((n, c) => n + c.count, 0) })
  return out
}
