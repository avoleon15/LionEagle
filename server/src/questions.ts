import type { AnswerDef, Question } from './matching'

// SAMPLE CONTENT. These questions exist to exercise the game; the tiers are a first
// judgment call by Claude and have NOT been researched or reviewed. The owner supplies
// the real questions and the answer lists are researched against them (see PLAN.md).
//
// Each answer is "Label|alias|alias" under its tier (10 = most common ... 100 = rarest).
// Matching already ignores case, accents, articles and simple plurals, so aliases are
// only needed for genuinely different spellings (abbreviations, English names, etc).

type Tiers = Partial<Record<10 | 30 | 60 | 80 | 100, string[]>>

function q(id: string, category: string, prompt: string, tiers: Tiers): Question {
  const answers: AnswerDef[] = []
  for (const [points, list] of Object.entries(tiers)) {
    for (const entry of list ?? []) {
      const [label, ...aliases] = entry.split('|')
      answers.push({ label, aliases, points: Number(points) })
    }
  }
  return { id, category, prompt, answers }
}

export const SAMPLE_QUESTIONS: Question[] = [
  q('norteamerica', 'Geografía', 'Nombra un país de Norteamérica.', {
    10: ['Estados Unidos|USA|EEUU|EE UU|Estados Unidos de America', 'Canadá'],
    30: ['México|Mexico', 'Cuba'],
    60: ['Costa Rica', 'Panamá', 'Honduras', 'Jamaica', 'República Dominicana'],
    80: ['Guatemala', 'El Salvador', 'Nicaragua', 'Belice', 'Haití', 'Bahamas'],
    100: ['Barbados', 'Dominica', 'Santa Lucía', 'Granada', 'Antigua y Barbuda', 'San Cristóbal y Nieves', 'San Vicente y las Granadinas', 'Trinidad y Tobago'],
  }),
  q('elementos', 'Ciencia', 'Nombra un elemento de la tabla periódica.', {
    10: ['Oxígeno', 'Hidrógeno', 'Oro', 'Hierro', 'Carbono'],
    30: ['Helio', 'Sodio', 'Plata', 'Cobre', 'Nitrógeno', 'Calcio', 'Uranio'],
    60: ['Argón', 'Neón', 'Litio', 'Zinc', 'Platino', 'Cloro', 'Mercurio'],
    80: ['Rubidio', 'Galio', 'Bario', 'Estroncio', 'Bismuto'],
    100: ['Itrio', 'Praseodimio', 'Disprosio', 'Iterbio', 'Tulio', 'Lutecio', 'Holmio', 'Erbio', 'Tecnecio', 'Hafnio'],
  }),
  q('olimpicos', 'Deportes', 'Nombra un deporte de los Juegos Olímpicos de verano.', {
    10: ['Fútbol|Futbol', 'Natación', 'Atletismo', 'Baloncesto|Basquetbol|Basketball'],
    30: ['Tenis', 'Voleibol|Volleyball', 'Gimnasia', 'Boxeo', 'Judo|Yudo', 'Ciclismo', 'Tenis de mesa|Ping pong'],
    60: ['Remo', 'Esgrima', 'Tiro con arco', 'Halterofilia|Levantamiento de pesas|Pesas', 'Waterpolo', 'Equitación|Hipica', 'Lucha', 'Triatlón', 'Bádminton', 'Taekwondo', 'Golf', 'Balonmano|Handball'],
    80: ['Pentatlón moderno', 'Piragüismo|Canotaje', 'Vela', 'Surf', 'Skateboarding|Skate', 'Escalada deportiva|Escalada', 'Marcha'],
    100: ['Breaking|Breakdance', 'Tiro deportivo', 'Saltos de trampolín'],
  }),
  q('fruta-tropical', 'Comida y bebida', 'Nombra una fruta tropical.', {
    10: ['Mango', 'Piña|Ananá', 'Banano|Banana|Plátano', 'Papaya'],
    30: ['Coco', 'Maracuyá|Fruta de la pasión', 'Guayaba', 'Sandía', 'Melón'],
    60: ['Guanábana', 'Rambután', 'Carambola', 'Pitahaya|Pitaya|Fruta del dragón', 'Lichi', 'Tamarindo', 'Granadilla'],
    80: ['Mamey', 'Nance', 'Jocote', 'Zapote', 'Mangostán', 'Anona', 'Marañón'],
    100: ['Durián', 'Caimito', 'Salak', 'Jaca|Yaca'],
  }),
  q('pixar', 'Cine y series', 'Nombra una película de Pixar.', {
    10: ['Toy Story', 'Buscando a Nemo|Finding Nemo|Nemo', 'Cars', 'Los Increíbles|Increibles'],
    30: ['Ratatouille', 'Up|Up una aventura de altura', 'Intensamente|Inside Out', 'Coco', 'Monsters Inc|Monsters, Inc|Monstruos S.A.|Monsters', 'WALL-E|Wall e|Walle'],
    60: ['Valiente|Brave', 'Soul', 'Luca', 'Elemental', 'Bichos|Bichos una aventura en miniatura|A Bug\'s Life', 'Buscando a Dory|Finding Dory', 'Monsters University|Universidad de Monstruos', 'Intensamente 2|Inside Out 2', 'Los Increíbles 2'],
    80: ['Onward', 'Un gran dinosaurio|The Good Dinosaur', 'Red|Turning Red', 'Toy Story 4'],
    100: ['Lightyear', 'Cars 2', 'Cars 3'],
  }),
  q('mario', 'Videojuegos', 'Nombra un personaje de Super Mario.', {
    10: ['Mario', 'Luigi', 'Peach|Princesa Peach', 'Bowser'],
    30: ['Toad', 'Yoshi', 'Wario', 'Donkey Kong'],
    60: ['Waluigi', 'Daisy|Princesa Daisy', 'Rosalina', 'Koopa Troopa|Koopa', 'Goomba', 'Boo', 'Bowser Jr|Bowsy'],
    80: ['Birdo', 'Toadette', 'Pauline', 'Shy Guy', 'Lakitu', 'Diddy Kong', 'Bob-omb|Bomba', 'Chain Chomp'],
    100: ['Kamek', 'Wiggler', 'Cappy', 'Nabbit', 'Petey Piranha'],
  }),
  q('planetas', 'Ciencia', 'Nombra un planeta o planeta enano del Sistema Solar.', {
    10: ['Tierra', 'Marte', 'Júpiter', 'Saturno'],
    30: ['Venus', 'Mercurio', 'Neptuno', 'Urano'],
    60: ['Plutón'],
    80: ['Ceres'],
    100: ['Eris', 'Makemake', 'Haumea'],
  }),
  q('instrumentos', 'Música', 'Nombra un instrumento musical.', {
    10: ['Guitarra', 'Piano', 'Batería|Bateria', 'Violín'],
    30: ['Flauta', 'Trompeta', 'Saxofón|Saxofon|Saxo', 'Bajo', 'Arpa', 'Marimba', 'Acordeón', 'Violonchelo|Chelo|Cello', 'Clarinete'],
    60: ['Ukelele', 'Trombón', 'Oboe', 'Tuba', 'Armónica', 'Banjo', 'Mandolina', 'Xilófono', 'Triángulo', 'Pandereta', 'Contrabajo', 'Órgano', 'Gaita', 'Cajón', 'Bongós|Bongo', 'Maracas', 'Timbales'],
    80: ['Fagot', 'Sitar', 'Zampoña', 'Charango', 'Ocarina', 'Corno francés|Trompa', 'Viola'],
    100: ['Theremín|Theremin', 'Didgeridoo', 'Clavicémbalo|Clavecín', 'Glockenspiel', 'Kazoo', 'Bandoneón'],
  }),
  q('mares', 'Geografía', 'Nombra un océano o un mar.', {
    10: ['Pacífico|Océano Pacífico', 'Atlántico|Océano Atlántico'],
    30: ['Índico|Océano Índico', 'Ártico|Océano Ártico', 'Mediterráneo|Mar Mediterráneo', 'Caribe|Mar Caribe'],
    60: ['Antártico|Austral|Océano Austral', 'Mar Rojo|Rojo', 'Mar Negro|Negro', 'Mar Muerto|Muerto'],
    80: ['Báltico|Mar Báltico', 'Mar del Norte', 'Mar Caspio|Caspio', 'Mar Arábigo|Arábigo', 'Mar Amarillo', 'Adriático|Mar Adriático', 'Egeo|Mar Egeo'],
    100: ['Jónico|Mar Jónico', 'Tirreno|Mar Tirreno', 'Mar de los Sargazos|Sargazos', 'Mar del Coral|Mar Coral', 'Mar de Bering', 'Mar de Japón', 'Mar de Ojotsk', 'Mar de Barents', 'Mar de Weddell', 'Mar de Beaufort'],
  }),
  q('rapaces', 'Naturaleza', 'Nombra un ave rapaz.', {
    10: ['Águila|Aguila', 'Halcón'],
    30: ['Búho|Buho', 'Buitre', 'Cóndor', 'Gavilán', 'Lechuza', 'Zopilote'],
    60: ['Cernícalo', 'Aguilucho', 'Águila arpía|Arpía|Harpía'],
    80: ['Azor', 'Milano', 'Quebrantahuesos', 'Águila pescadora|Pescadora'],
    100: ['Caracara','Alcotán', 'Secretario|Ave secretario'],
  }),
  q('felinos', 'Naturaleza', 'Nombra un felino.', {
    10: ['León', 'Tigre', 'Gato', 'Leopardo', 'Jaguar'],
    30: ['Puma', 'Guepardo|Chita', 'Pantera', 'Lince'],
    60: ['Ocelote', 'Gato montés', 'Leopardo de las nieves|Pantera de las nieves'],
    80: ['Caracal', 'Serval'],
    100: ['Margay', 'Jaguarundi|Yaguarundí', 'Oncilla', 'Manul|Gato de Pallas', 'Gato pescador', 'Gato de arena', 'Pantera nebulosa'],
  }),
]
