import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido se nombra cada carta. La lista de cartas y su rareza salen de Pocket Tactics (octubre de 2026); no incluí cartas derivadas (Golemita, Lava Pup, Huevo de fénix...). Los nombres en español son los que recuerdo del juego y pueden estar mal: lo que no reconozca el juego se verá en el registro de respuestas. Se aceptan los nombres en inglés.'

export default [
  q('clash-royale-cartas', 'Videojuegos', 'Nombra una carta de Clash Royale.', {
    10: ['Hog Rider|Montapuercos|Jinete de cerdo', 'Mega Knight|Mega caballero|Megacaballero', 'Knight|Caballero', 'Giant|Gigante', 'P.E.K.K.A|PEKKA|Pekka', 'Golem|Gólem', 'Fireball|Bola de fuego', 'Musketeer|Mosquetera|Mosquetero', 'Archers|Arqueras|Arqueros', 'Princess|Princesa', 'The Log|El tronco|Tronco|Log', 'Skeleton Army|Ejército de esqueletos', 'Goblin Barrel|Barril de duendes|Barril de goblins', 'Balloon|Globo|Globo bombástico', 'Zap|Descarga', 'Arrows|Flechas', 'Witch|Bruja', 'Baby Dragon|Dragón bebé', 'Miner|Minero'],
    30: ['Valkyrie|Valquiria', 'Wizard|Mago', 'Prince|Príncipe', 'Dark Prince|Príncipe oscuro', 'Minions|Esbirros', 'Minion Horde|Horda de esbirros', 'Goblins|Duendes|Goblins', 'Skeletons|Esqueletos', 'Bats|Murciélagos', 'Lava Hound|Sabueso de lava|Perro de lava', 'Electro Wizard|Mago eléctrico', 'Night Witch|Bruja nocturna', 'Inferno Dragon|Dragón infernal', 'Sparky|Chispitas', 'Lightning|Rayo', 'Poison|Veneno', 'Rocket|Cohete', 'Freeze|Congelación|Hielo', 'Tornado', 'Rage|Furia|Rabia', 'Ice Spirit|Espíritu de hielo', 'Fire Spirit|Espíritu de fuego', 'Electro Spirit|Espíritu eléctrico', 'Cannon|Cañón', 'Tesla', 'X-Bow|X Bow|Ballesta X', 'Archer Queen|Reina arquera', 'Golden Knight|Caballero dorado', 'Skeleton King|Rey esqueleto', 'Royal Giant|Gigante noble|Gigante real', 'Elite Barbarians|Bárbaros de élite', 'Barbarians|Bárbaros', 'Bandit|Bandida|Bandido', 'Ram Rider|Jinete de ariete', 'Graveyard|Cementerio', 'Lumberjack|Leñador', 'Executioner|Verdugo', 'Bowler', 'Hunter|Cazador', 'Ice Wizard|Mago de hielo', 'Magic Archer|Arquero mágico|Arquera mágica', 'Mini P.E.K.K.A|Mini PEKKA|Mini Pekka', 'Three Musketeers|Tres mosqueteras|Tres mosqueteros', 'Battle Ram|Ariete de batalla|Ariete', 'Wall Breakers|Rompemuros', 'Giant Snowball|Bola de nieve gigante|Bola de nieve'],
    60: ['Bomber|Bombardero', 'Spear Goblins|Duendes lanceros|Lanzaduendes', 'Royal Recruits|Reclutas reales', 'Rascals|Pillos|Rascal Boy|Rascal Girl', 'Mortar|Mortero', 'Inferno Tower|Torre infernal', 'Bomb Tower|Torre de bombas|Torre bomba', 'Furnace|Horno', 'Tombstone|Lápida|Tumba', 'Goblin Hut|Cabaña de duendes', 'Barbarian Hut|Cabaña de bárbaros', 'Elixir Collector|Recolector de elixir', 'Electro Dragon|Dragón eléctrico', 'Electro Giant|Gigante eléctrico', 'Mega Minion|Mega esbirro', 'Dart Goblin|Duende dardero', 'Royal Hogs|Cerdos reales', 'Flying Machine|Máquina voladora', 'Zappies', 'Battle Healer|Curandera de batalla|Sanadora de batalla', 'Heal Spirit|Espíritu curativo', 'Fisherman|Pescador', 'Phoenix|Fénix', 'Mother Witch|Bruja madre', 'Royal Ghost|Fantasma real', 'Monk|Monje', 'Mighty Miner|Minero poderoso', 'Little Prince|Príncipe pequeño|Principito', 'Goblin Gang|Pandilla de duendes', 'Guards|Guardias', 'Giant Skeleton|Esqueleto gigante', 'Cannon Cart|Carro cañón', 'Goblin Drill|Taladro de duendes', 'Barbarian Barrel|Barril de bárbaros', 'Earthquake|Terremoto', 'Royal Delivery|Entrega real', 'Skeleton Barrel|Barril de esqueletos', 'Skeleton Dragons|Dragones esqueleto', 'Firecracker|Petardista', 'Berserker', 'Goblin Cage|Jaula de duendes', 'Ice Golem|Gólem de hielo', 'Elixir Golem|Gólem de elixir'],
    80: ['Rune Giant|Gigante rúnico', 'Void|Vacío', 'Vines|Enredaderas', 'Goblin Curse|Maldición de duendes', 'Goblin Giant|Gigante duende', 'Goblin Demolisher|Demoledor duende', 'Goblin Brawler|Duende pendenciero', 'Elixir Blob|Mancha de elixir', 'Boss Bandit|Jefe bandido|Bandida jefa', 'Goblinstein', 'Goblin Machine|Máquina de duendes'],
    100: ['Ronin', 'Spirit Empress|Emperatriz espiritual', 'Guardienne', 'Monster|Monstruo', 'Suspicious Bush|Arbusto sospechoso', 'Bush Goblins|Duendes arbusto', 'Cannoneer|Cañonero', 'Dagger Duchess|Duquesa de dagas', 'Royal Chef|Chef real', 'Tower Princess|Princesa de la torre'],
  }, `Cartas jugables, incluyendo campeones y las tropas de torre más nuevas. ${NIVELES}`),

  q('clash-royale-legendarias', 'Videojuegos', 'Nombra una carta legendaria de Clash Royale.', {
    10: ['Princess|Princesa', 'Miner|Minero', 'Mega Knight|Mega caballero|Megacaballero', 'Lava Hound|Sabueso de lava|Perro de lava', 'The Log|El tronco|Tronco|Log', 'Sparky|Chispitas', 'Electro Wizard|Mago eléctrico', 'Night Witch|Bruja nocturna', 'Inferno Dragon|Dragón infernal', 'Graveyard|Cementerio', 'Bandit|Bandida|Bandido', 'Ice Wizard|Mago de hielo'],
    30: ['Lumberjack|Leñador', 'Magic Archer|Arquero mágico|Arquera mágica', 'Royal Ghost|Fantasma real', 'Ram Rider|Jinete de ariete', 'Fisherman|Pescador', 'Phoenix|Fénix', 'Mother Witch|Bruja madre'],
    60: ['Goblin Machine|Máquina de duendes', 'Ronin', 'Spirit Empress|Emperatriz espiritual'],
    80: ['Dagger Duchess|Duquesa de dagas'],
    100: ['Royal Chef|Chef real'],
  }, `Cartas legendarias, incluyendo las dos tropas de torre legendarias. Los campeones son una rareza aparte (otra pregunta). ${NIVELES}`),

  q('clash-royale-epicas', 'Videojuegos', 'Nombra una carta épica de Clash Royale.', {
    10: ['P.E.K.K.A|PEKKA|Pekka', 'Golem|Gólem', 'Balloon|Globo|Globo bombástico', 'Witch|Bruja', 'Baby Dragon|Dragón bebé', 'Skeleton Army|Ejército de esqueletos', 'Goblin Barrel|Barril de duendes|Barril de goblins', 'Lightning|Rayo', 'Poison|Veneno', 'Prince|Príncipe', 'Tornado', 'Rage|Furia|Rabia', 'Freeze|Congelación|Hielo'],
    30: ['Dark Prince|Príncipe oscuro', 'Executioner|Verdugo', 'Bowler', 'Hunter|Cazador', 'Giant Skeleton|Esqueleto gigante', 'Guards|Guardias', 'Wall Breakers|Rompemuros', 'X-Bow|X Bow|Ballesta X', 'Electro Giant|Gigante eléctrico', 'Electro Dragon|Dragón eléctrico', 'Barbarian Barrel|Barril de bárbaros', 'Cannon Cart|Carro cañón', 'Goblin Drill|Taladro de duendes'],
    60: ['Rune Giant|Gigante rúnico', 'Goblin Giant|Gigante duende'],
    80: ['Void|Vacío', 'Vines|Enredaderas', 'Goblin Curse|Maldición de duendes'],
    100: ['Cannoneer|Cañonero'],
  }, `Cartas épicas, incluyendo la tropa de torre épica. ${NIVELES}`),

  q('clash-royale-raras', 'Videojuegos', 'Nombra una carta rara de Clash Royale.', {
    10: ['Hog Rider|Montapuercos|Jinete de cerdo', 'Giant|Gigante', 'Musketeer|Mosquetera|Mosquetero', 'Valkyrie|Valquiria', 'Wizard|Mago', 'Fireball|Bola de fuego', 'Rocket|Cohete', 'Mini P.E.K.K.A|Mini PEKKA|Mini Pekka'],
    30: ['Three Musketeers|Tres mosqueteras|Tres mosqueteros', 'Battle Ram|Ariete de batalla|Ariete', 'Mega Minion|Mega esbirro', 'Dart Goblin|Duende dardero', 'Royal Hogs|Cerdos reales', 'Flying Machine|Máquina voladora', 'Zappies', 'Battle Healer|Curandera de batalla|Sanadora de batalla', 'Ice Golem|Gólem de hielo', 'Heal Spirit|Espíritu curativo', 'Furnace|Horno', 'Bomb Tower|Torre de bombas|Torre bomba', 'Inferno Tower|Torre infernal', 'Barbarian Hut|Cabaña de bárbaros', 'Elixir Collector|Recolector de elixir', 'Goblin Cage|Jaula de duendes', 'Goblin Hut|Cabaña de duendes', 'Tombstone|Lápida|Tumba', 'Earthquake|Terremoto', 'Elixir Golem|Gólem de elixir'],
    80: ['Goblin Demolisher|Demoledor duende', 'Goblin Brawler|Duende pendenciero', 'Elixir Blob|Mancha de elixir', 'Bush Goblins|Duendes arbusto'],
    100: ['Suspicious Bush|Arbusto sospechoso'],
  }, `Cartas raras. ${NIVELES}`),

  q('clash-royale-comunes', 'Videojuegos', 'Nombra una carta común de Clash Royale.', {
    10: ['Knight|Caballero', 'Archers|Arqueras|Arqueros', 'Skeletons|Esqueletos', 'Goblins|Duendes|Goblins', 'Minions|Esbirros', 'Bats|Murciélagos', 'Zap|Descarga', 'Arrows|Flechas', 'Barbarians|Bárbaros', 'Ice Spirit|Espíritu de hielo', 'Royal Giant|Gigante noble|Gigante real'],
    30: ['Spear Goblins|Duendes lanceros|Lanzaduendes', 'Bomber|Bombardero', 'Fire Spirit|Espíritu de fuego', 'Electro Spirit|Espíritu eléctrico', 'Minion Horde|Horda de esbirros', 'Elite Barbarians|Bárbaros de élite', 'Cannon|Cañón', 'Mortar|Mortero', 'Tesla', 'Giant Snowball|Bola de nieve gigante|Bola de nieve', 'Skeleton Barrel|Barril de esqueletos', 'Goblin Gang|Pandilla de duendes', 'Royal Recruits|Reclutas reales', 'Rascals|Pillos|Rascal Boy|Rascal Girl'],
    60: ['Firecracker|Petardista', 'Berserker', 'Royal Delivery|Entrega real', 'Skeleton Dragons|Dragones esqueleto'],
    100: ['Tower Princess|Princesa de la torre'],
  }, `Cartas comunes (incluye a la tropa de torre común). ${NIVELES}`),

  q('clash-royale-campeones', 'Videojuegos', 'Nombra un campeón de Clash Royale.', {
    10: ['Archer Queen|Reina arquera', 'Golden Knight|Caballero dorado', 'Skeleton King|Rey esqueleto', 'Mighty Miner|Minero poderoso', 'Monk|Monje'],
    30: ['Little Prince|Príncipe pequeño|Principito'],
    60: ['Goblinstein', 'Boss Bandit|Jefe bandido|Bandida jefa'],
    100: ['Guardienne', 'Monster|Monstruo'],
  }, `Los 10 campeones actuales (octubre de 2026). Salen campeones nuevos cada pocos meses: agregar los que falten. ${NIVELES}`),

  q('clash-royale-hechizos', 'Videojuegos', 'Nombra un hechizo de Clash Royale.', {
    10: ['Fireball|Bola de fuego', 'Arrows|Flechas', 'Zap|Descarga', 'The Log|El tronco|Tronco|Log', 'Lightning|Rayo', 'Poison|Veneno', 'Rocket|Cohete', 'Freeze|Congelación|Hielo', 'Rage|Furia|Rabia', 'Tornado', 'Giant Snowball|Bola de nieve gigante|Bola de nieve', 'Graveyard|Cementerio', 'Goblin Barrel|Barril de duendes|Barril de goblins'],
    30: ['Earthquake|Terremoto', 'Barbarian Barrel|Barril de bárbaros', 'Royal Delivery|Entrega real'],
    80: ['Vines|Enredaderas', 'Void|Vacío'],
    100: ['Goblin Curse|Maldición de duendes'],
  }, `Hechizos del juego (se incluyen Goblin Barrel y Graveyard porque se lanzan como hechizos). Clone y Mirror no aparecen en la lista que usé; si siguen en el juego, agregarlos. ${NIVELES}`),

  q('clash-royale-edificios', 'Videojuegos', 'Nombra un edificio de Clash Royale.', {
    10: ['Cannon|Cañón', 'Mortar|Mortero', 'Tesla', 'Inferno Tower|Torre infernal', 'Bomb Tower|Torre de bombas|Torre bomba', 'X-Bow|X Bow|Ballesta X'],
    30: ['Tombstone|Lápida|Tumba', 'Barbarian Hut|Cabaña de bárbaros', 'Goblin Hut|Cabaña de duendes', 'Furnace|Horno', 'Elixir Collector|Recolector de elixir'],
    60: ['Goblin Drill|Taladro de duendes'],
    100: ['Goblin Cage|Jaula de duendes'],
  }, `Edificios jugables. ${NIVELES}`),
]
