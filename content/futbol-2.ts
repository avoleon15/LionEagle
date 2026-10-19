import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales.'

/** "Azteca" también se acepta como "Estadio Azteca". */
const est = (...nombres: string[]) => [...new Set(nombres.flatMap((n) => (/^estadio /i.test(n) ? [n] : [n, `Estadio ${n}`])))].join('|')

export default [
  q('copa-libertadores-ganadores', 'Fútbol', 'Nombra un club que haya ganado la Copa Libertadores.', {
    10: ['Boca Juniors|Boca|Boca Jrs', 'River Plate|River', 'Flamengo|Mengão|Mengao', 'Palmeiras|Verdão'],
    30: ['Independiente|Independiente de Avellaneda|Club Atlético Independiente', 'Peñarol|Penarol', 'Nacional|Club Nacional|Nacional de Montevideo|Nacional de Uruguay', 'Santos', 'São Paulo|Sao Paulo', 'Atlético Nacional|Atletico Nacional|Nacional de Medellín', 'Olimpia|Olimpia de Paraguay', 'Estudiantes|Estudiantes de La Plata', 'Grêmio|Gremio', 'Corinthians', 'Fluminense', 'Botafogo', 'Colo-Colo|Colo Colo', 'Racing|Racing Club'],
    60: ['Internacional|Inter de Porto Alegre|Internacional de Porto Alegre|Inter', 'Cruzeiro', 'Vélez Sarsfield|Vélez|Velez|Velez Sarsfield', 'San Lorenzo|San Lorenzo de Almagro', 'Atlético Mineiro|Atletico Mineiro|Galo', 'LDU Quito|Liga de Quito|LDU|Liga Deportiva Universitaria', 'Vasco da Gama|Vasco'],
    80: ['Argentinos Juniors|Argentinos'],
    100: ['Once Caldas'],
  }, `Los 27 clubes campeones de la Libertadores hasta 2025 (la de 2025 la ganó Flamengo 1-0 a Palmeiras en Lima; la final de 2026 todavía no se juega en octubre). Ningún club mexicano la ganó (Cruz Azul, Chivas y Tigres llegaron a la final pero perdieron): NO valen. "Nacional" solo cuenta como el uruguayo (también vale, porque los dos ganaron). ${NIVELES}`),

  q('argentina-campeon-2022', 'Fútbol', 'Nombra un jugador de la selección argentina campeona del Mundial 2022.', {
    10: ['Lionel Messi|Messi|Leo Messi|Lio Messi', 'Ángel Di María|Di María|Di Maria|Fideo', 'Emiliano Martínez|Dibu Martínez|Dibu|Emi Martínez', 'Julián Álvarez|Julian Alvarez|La Araña'],
    30: ['Enzo Fernández|Enzo|Enzo Fernandez', 'Alexis Mac Allister|Mac Allister|MacAllister', 'Rodrigo De Paul|De Paul', 'Lautaro Martínez|Lautaro|Lautaro Martinez', 'Nicolás Otamendi|Otamendi', 'Cristian Romero|Cuti Romero|Cuti', 'Paulo Dybala|Dybala|La Joya', 'Leandro Paredes|Paredes', 'Nahuel Molina|Molina', 'Gonzalo Montiel|Montiel'],
    60: ['Nicolás Tagliafico|Tagliafico', 'Marcos Acuña|Acuña|Huevo Acuña', 'Lisandro Martínez|Licha|Lisandro', 'Alejandro Gómez|Papu Gómez|Papu', 'Germán Pezzella|Pezzella'],
    80: ['Guido Rodríguez|Guido', 'Exequiel Palacios|Palacios', 'Juan Foyth|Foyth', 'Franco Armani|Armani', 'Ángel Correa|Correa'],
    100: ['Thiago Almada|Almada', 'Gerónimo Rulli|Rulli'],
  }, `Los 26 convocados de Qatar 2022 (lista cerrada; Almada y Ángel Correa entraron por las lesiones de Nicolás González y Joaquín Correa, que por eso NO cuentan). Lionel Scaloni es el técnico: no cuenta. "Martínez" solo no vale porque hay tres (Dibu, Lautaro, Lisandro). ${NIVELES}`),

  q('mundial-sedes', 'Fútbol', 'Nombra un país que haya sido (o vaya a ser) sede de un Mundial de fútbol.', {
    10: ['Brasil|Brazil', 'Qatar|Catar', 'Rusia|Russia', 'México|Mexico', 'Estados Unidos|EEUU|EE. UU.|USA|Estados Unidos de América|US', 'Alemania|Alemania Occidental|Alemania Federal|RFA|Germany'],
    30: ['Sudáfrica|Sudafrica|South Africa', 'Francia|France', 'Argentina', 'España|Spain', 'Italia|Italy', 'Corea del Sur|Corea|South Korea', 'Japón|Japan', 'Canadá|Canada', 'Uruguay'],
    60: ['Inglaterra|England|Reino Unido', 'Chile', 'Marruecos|Morocco', 'Portugal', 'Arabia Saudita|Arabia Saudí|Arabia'],
    80: ['Suecia|Sweden', 'Paraguay'],
    100: ['Suiza|Switzerland'],
  }, `Sedes de los Mundiales masculinos de 1930 a 2026, más las ya confirmadas: 2030 (España, Portugal y Marruecos, con partidos inaugurales en Uruguay, Argentina y Paraguay) y 2034 (Arabia Saudita). Mundiales femeninos no cuentan. "Reino Unido" se acepta como Inglaterra (1966). ${NIVELES}`),

  q('copa-america-selecciones', 'Fútbol', 'Nombra una selección que haya jugado la Copa América (local o invitada).', {
    10: ['Argentina', 'Brasil|Brazil', 'Uruguay', 'Colombia'],
    30: ['Chile', 'Perú|Peru', 'Paraguay', 'Ecuador', 'Venezuela', 'Bolivia', 'México|Mexico'],
    60: ['Estados Unidos|EEUU|EE. UU.|USA', 'Costa Rica'],
    80: ['Jamaica', 'Panamá|Panama', 'Japón|Japan', 'Honduras', 'Canadá|Canada'],
    100: ['Qatar|Catar', 'Haití|Haiti'],
  }, `Las 10 selecciones de la Conmebol más las 10 invitadas que llegaron a jugar: México, Estados Unidos, Costa Rica, Japón (1999 y 2019), Honduras (2001), Jamaica, Haití, Panamá, Qatar (2019) y Canadá (2024). Australia, España y China fueron invitadas pero no jugaron: NO valen. Guatemala nunca la jugó. ${NIVELES}`),

  q('estadios-futbol', 'Fútbol', 'Nombra un estadio de fútbol famoso.', {
    10: [est('Camp Nou', 'Nou Camp', 'Spotify Camp Nou'), est('Santiago Bernabéu', 'Bernabéu', 'Bernabeu', 'Santiago Bernabeu'), est('Azteca', 'Estadio Banorte', 'Estadio Ciudad de México'), est('Maracaná', 'Maracana', 'Maracanã'), est('Wembley'), est('Old Trafford')],
    30: [est('Anfield'), est('San Siro', 'Giuseppe Meazza'), est('La Bombonera', 'Bombonera', 'Alberto J. Armando'), est('Monumental', 'Más Monumental', 'Monumental de Núñez', 'Antonio Vespucio Liberti'), est('Allianz Arena'), est('Signal Iduna Park', 'Westfalenstadion'), est('Doroteo Guamuch Flores', 'Mateo Flores', 'Nacional de Guatemala'), est('Metropolitano', 'Wanda Metropolitano', 'Cívitas Metropolitano'), est('Parque de los Príncipes', 'Parc des Princes'), est('Stade de France'), est('Emirates', 'Emirates Stadium'), est('Stamford Bridge'), est('Etihad', 'Etihad Stadium'), est('Centenario'), est('Akron', 'Estadio Chivas'), est('Jalisco'), est('Olímpico Universitario', 'CU', 'Estadio de CU'), est('BBVA', 'Gigante de Acero')],
    60: [est('Mestalla'), est('Diego Armando Maradona', 'Maradona', 'San Paolo'), est('Olímpico de Roma', 'Stadio Olimpico'), est('Da Luz', 'Estádio da Luz'), est('Do Dragão', 'Dragão', 'Dragao'), est('Johan Cruyff Arena', 'Ámsterdam Arena', 'Amsterdam Arena'), est('Celtic Park'), est('Tottenham Hotspur Stadium'), est('Morumbí', 'Morumbi'), est('Mineirão', 'Mineirao'), est('Nacional de Lima'), est('El Campín', 'Campín', 'Nemesio Camacho'), est('Atanasio Girardot'), est('Cuauhtémoc'), est('Nacional de Chile', 'Nacional de Santiago', 'Nacional Julio Martínez Prádanos'), est('Cementos Progreso'), est('Ramón Sánchez-Pizjuán', 'Sánchez Pizjuán', 'Pizjuán'), est('Benito Villamarín', 'Villamarín'), est('San Mamés'), est('Luzhniki'), est('Lusail', 'Icónico de Lusail'), est('Olímpico de Berlín', 'Olympiastadion'), est('Libertadores de América', 'Doble Visera'), est('El Cilindro', 'Cilindro', 'Presidente Perón'), est('Hernando Siles'), est('Defensores del Chaco'), est('Metropolitano de Barranquilla', 'Roberto Meléndez'), est('Saprissa', 'Ricardo Saprissa', 'La Cueva'), est('Cuscatlán', 'Cuscatlan'), est('Universitario', 'El Volcán'), est('Juventus Stadium', 'Allianz Stadium')],
    80: [est('Mario Camposeco'), est('Pensativo'), est('El Trébol', 'Manuel Felipe Carrera'), est('Monumental de Lima', 'Monumental U'), est('Monumental David Arellano', 'David Arellano'), est('Veltins Arena', 'Arena AufSchalke'), est('Philips Stadion'), est('De Kuip', 'Feijenoord'), est('Atatürk', 'Olímpico Atatürk'), est('Hampden Park'), est('Ibrox'), est('Villa Park'), est('Goodison Park'), est('St James\' Park', 'St James Park'), est('Vicente Calderón', 'Calderón'), est('Riazor'), est('Vélodrome', 'Velódromo', 'Stade Vélodrome'), est('Rose Bowl'), est('MetLife', 'MetLife Stadium'), est('SoFi', 'SoFi Stadium'), est('Atahualpa', 'Olímpico Atahualpa'), est('Monumental de Guayaquil', 'Isidro Romero Carbo', 'Monumental Banco Pichincha'), est('Mario Alberto Kempes', 'Kempes'), est('Nemesio Díez', 'Bombonera de Toluca'), est('Arena Corinthians', 'Neo Química Arena'), est('Allianz Parque'), est('Vila Belmiro'), est('Beira-Rio', 'Beira Rio')],
    100: [est('Israel Barrios'), est('Carlos Salazar Hijo'), est('Olímpico Metropolitano de San Pedro Sula', 'Olímpico Metropolitano'), est('Rommel Fernández'), est('Nacional de Costa Rica'), est('Hard Rock Stadium'), est('AT&T Stadium'), est('Mercedes-Benz Stadium'), est('Gigante de Arroyito'), est('São Januário', 'Sao Januario'), est('Arena do Grêmio', 'Arena do Gremio'), est('Gran Parque Central'), est('Craven Cottage'), est('Vallecas'), est('Artemio Franchi'), est('Luigi Ferraris', 'Marassi')],
  }, `Estadios famosos de Europa, Sudamérica, México, Centroamérica y EE. UU. (sedes del Mundial 2026). Incluye los de Guatemala: Doroteo Guamuch Flores (antes Mateo Flores) en 30, Cementos Progreso en 60, Mario Camposeco, Pensativo y El Trébol en 80, Israel Barrios y Carlos Salazar Hijo en 100. Todo se acepta con o sin "Estadio". "Monumental" solo cuenta como el de River. Es abierta: hay miles de estadios, irán apareciendo respuestas válidas que falten. ${NIVELES}`),
]
