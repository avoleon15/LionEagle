import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales. Se aceptan los nombres en inglés.'

// Dos preguntas de Minecraft pedidas por el dueño (2026-10-22). Fuente: Minecraft Wiki (minecraft.wiki) y su versión en español (es.minecraft.wiki), leídas por su API.
const TOOL_MATERIALS = ['madera', 'piedra', 'cobre', 'hierro', 'oro', 'diamante', 'netherita']
const ARMOR_MATERIALS = ['cuero', 'cota de malla', 'malla', 'cobre', 'hierro', 'oro', 'diamante', 'netherita']
/** "Espada" -> its names with every material ("Espada de madera", ...), so a player can name the exact item. */
const tool = (label: string, english: string[]) => [label, ...english, ...TOOL_MATERIALS.map((m) => `${label} de ${m}`)].join('|')
const armor = (label: string, more: string[]) => [label, ...more, ...ARMOR_MATERIALS.flatMap((m) => [label, ...more].map((n) => `${n} de ${m}`))].join('|')

export default [
  // ---------------------------------------------------------------- mc-aldeanos-profesiones (13 + 1)
  q('mc-aldeanos-profesiones', 'Minecraft', 'Nombra una profesión de aldeano de Minecraft.', {
    10: ['Bibliotecario|Librarian|Bibliotecaria', 'Granjero|Farmer|Granjera|Agricultor', 'Carnicero|Butcher'],
    30: ['Clérigo|Cleric|Sacerdote', 'Pescador|Fisherman', 'Pastor|Shepherd', 'Herrero de armaduras|Armorer|Armero', 'Herrero de armas|Weaponsmith', 'Herrero de herramientas|Toolsmith', 'Cartógrafo|Cartographer', 'Albañil|Mason'],
    60: ['Flechero|Fletcher', 'Peletero|Leatherworker|Curtidor'],
    100: ['Simplón|Nitwit'],
  }, `Las 13 profesiones de aldeano de Minecraft y el Simplón. Fuente: Minecraft Wiki, página Villager, sección Professions (https://minecraft.wiki/w/Villager), y los nombres en español de es.minecraft.wiki (https://es.minecraft.wiki/w/Aldeano). Dudas: el Simplón (Nitwit) no tiene profesión ni bloque de trabajo, pero la wiki lo trata dentro de las profesiones y se aceptó en el nivel más alto; el Desempleado no cuenta. "Herrero" suelto no cuenta porque sirve para tres oficios. ${NIVELES}`),

  // ---------------------------------------------------------------- mc-objetos-que-se-gastan
  q('mc-objetos-que-se-gastan', 'Minecraft', 'Nombra un objeto de Minecraft que se gasta con el uso (tiene durabilidad y se rompe).', {
    10: [tool('Espada', ['Sword']), tool('Pico', ['Pickaxe', 'Piqueta']), armor('Armadura', ['Armor', 'Armadura completa']).split('|').filter((x) => x !== 'Armadura completa de cuero').join('|'), tool('Hacha', ['Axe']), 'Arco|Bow', tool('Pala', ['Shovel'])],
    30: [tool('Azada', ['Hoe']), armor('Casco', ['Helmet']), armor('Peto', ['Chestplate', 'Pechera']), armor('Mallas', ['Leggings', 'Pantalones']), armor('Botas', ['Boots']), 'Escudo|Shield', 'Tijeras|Shears', 'Mechero|Flint and steel|Pedernal y acero|Pedernal|Encendedor|Yesquero', 'Caña de pescar|Fishing rod|Caña', 'Ballesta|Crossbow', 'Tridente|Trident', 'Élitros|Elytra|Elitros', 'Yunque|Anvil'],
    60: ['Zanahoria en un palo|Carrot on a stick|Caña con zanahoria', 'Maza|Mace', 'Brocha|Brush|Cepillo', 'Caparazón de tortuga|Turtle shell|Casco de tortuga|Caparazon de tortuga'],
    80: ['Hongo deformado en un palo|Warped fungus on a stick|Hongo distorsionado en un palo|Caña con hongo'],
    100: ['Armadura de lobo|Wolf armor'],
  }, `Los objetos de Minecraft que tienen barra de durabilidad (o se dañan) y se rompen: herramientas, armas y armaduras de todos los materiales (madera, piedra, cobre, hierro, oro, diamante, netherita; cuero y cota de malla en las armaduras), más escudo, tijeras, mechero (pedernal y acero), caña de pescar, zanahoria y hongo deformado en un palo, élitros, brocha, ballesta, arco, tridente, maza, caparazón de tortuga y armadura de lobo. Fuente: Minecraft Wiki, página Durability (https://minecraft.wiki/w/Durability), que lista las armaduras por material, las herramientas y armas y los objetos con usos propios. El yunque no tiene durabilidad como objeto: se daña por etapas al usarlo (así lo cuenta la wiki en Anvil#Becoming damaged) y se aceptó por pedido del dueño. Se pueden nombrar el tipo ("Espada", "Casco") o el objeto exacto ("Espada de diamante"): cuentan igual. Quedan fuera la armadura de caballo y la de nautilo (no tienen durabilidad) y las bengalas y varitas luminosas de la edición educativa. ${NIVELES}`),
]
