import { q } from '../server/src/dsl'

const NIVELES = 'Niveles pensados para un grupo de jugadores guatemaltecos (lo que ellos nombrarían primero); hay que calibrarlos con partidas reales.'

/** "Fuego" también se acepta como "Volcán Fuego" y "Volcán de Fuego". */
const volcan = (nombre: string, ...otros: string[]) => [nombre, `Volcán ${nombre}`, `Volcán de ${nombre}`, ...otros].join('|')
/** "Atitlán" también se acepta como "Lago Atitlán", "Lago de Atitlán", "Laguna ...". */
const lago = (nombre: string, ...otros: string[]) => [nombre, `Lago ${nombre}`, `Lago de ${nombre}`, `Laguna ${nombre}`, `Laguna de ${nombre}`, ...otros].join('|')

export default [
  q('guatemala-departamentos', 'Guatemala', 'Nombra un departamento de Guatemala.', {
    10: ['Guatemala', 'Quetzaltenango|Xela', 'Petén|Peten', 'Escuintla', 'Sacatepéquez|Sacatepequez', 'Alta Verapaz'],
    30: ['Huehuetenango|Huehue', 'San Marcos', 'Izabal', 'Chimaltenango', 'Sololá|Solola', 'Zacapa', 'Quiché|Quiche', 'Santa Rosa', 'Jutiapa'],
    60: ['Chiquimula', 'Jalapa', 'Suchitepéquez|Suchitepequez', 'Baja Verapaz'],
    80: ['Totonicapán|Totonicapan|Toto', 'Retalhuleu|Reu'],
    100: ['El Progreso'],
  }, `Los 22 departamentos. ${NIVELES}`),

  q('guatemala-platos-tipicos', 'Guatemala', 'Nombra un plato o comida típica de Guatemala.', {
    10: ['Pepián|Pepian', 'Tamales|Tamal|Tamal colorado|Tamal negro', 'Chuchitos|Chuchito', 'Fiambre', 'Shuco|Shucos'],
    30: ['Jocón|Jocon', 'Kak\'ik|Kaq\'ik|Kak ik|Cak ik|Kaqik', 'Hilachas', 'Rellenitos', 'Plátanos en mole|Platanos en mole|Mole de plátano', 'Revolcado', 'Caldo de res', 'Caldo de gallina', 'Tostadas', 'Chiles rellenos', 'Atol de elote|Atol|Atole', 'Paches|Pache', 'Garnachas|Garnacha', 'Molletes|Mollete', 'Torrejas', 'Frijoles volteados|Frijoles', 'Longaniza', 'Churrasco', 'Mixtas|Mixta', 'Enchiladas|Enchilada', 'Quesadilla', 'Pan de manteca', 'Cocadas|Cocada', 'Elote loco|Elotes locos'],
    60: ['Pollo en crema', 'Tapado', 'Subanik|Sub\'anik', 'Empanadas de leche', 'Chilate', 'Colochos|Colocho', 'Champurradas|Champurrada', 'Chojín|Chojin', 'Pacaya|Flor de pacaya', 'Tamalitos de chipilín|Chipilín', 'Canillitas de leche|Canillitas'],
    80: ['Gallo en chicha', 'Pulique|Pulik', 'Chuchitos de recado', 'Atol shuco|Atole shuco', 'Tamalitos de elote'],
    100: ['Boxbol|Box bol', 'Caldo de jute|Jute', 'Chilacayote en miel|Miel de chilacayote', 'Tayuyos|Tayuyo', 'Tamalitos de cambray|Cambray'],
  }, `Comidas y antojitos típicos. Los de nivel 100 son regionales y los puse de memoria (Boxbol, Tayuyos, Jute...): conviene que alguien de la zona los revise. ${NIVELES}`),

  q('guatemala-volcanes', 'Guatemala', 'Nombra un volcán de Guatemala.', {
    10: [volcan('Fuego'), volcan('Pacaya'), volcan('Agua'), volcan('Acatenango')],
    30: [volcan('Santiaguito'), volcan('Tajumulco'), volcan('Atitlán|Atitlan'), volcan('San Pedro'), volcan('Tolimán|Toliman')],
    60: [volcan('Santa María|Santa Maria'), volcan('Tacaná|Tacana'), volcan('Cerro Quemado'), volcan('Ipala'), volcan('Zunil'), volcan('Chicabal')],
    80: [volcan('Moyuta'), volcan('Chingo'), volcan('Jumaytepeque'), volcan('Suchitán|Suchitan'), volcan('Quetzaltepeque'), volcan('Tecuamburro'), volcan('Santa Clara'), volcan('Siete Orejas')],
    100: [volcan('Alzatate'), volcan('Cuxliquel'), volcan('Amatitlán|Amatitlan'), volcan('Culma'), volcan('Lacandón|Lacandon')],
  }, `Volcanes de Guatemala (la lista oficial tiene unos 37, aquí van los conocidos). "Volcán de Fuego" y "Fuego" cuentan igual. Culma y Lacandón de nivel 100 los puse de memoria: revisar. ${NIVELES}`),

  q('guatemala-lagos', 'Guatemala', 'Nombra un lago o laguna de Guatemala.', {
    10: [lago('Atitlán|Atitlan'), lago('Izabal'), lago('Petén Itzá|Peten Itza'), lago('Amatitlán|Amatitlan')],
    30: [lago('Ayarza'), lago('Lachuá|Lachua'), lago('Güija|Guija'), lago('Chicabal')],
    60: [lago('Yaxhá|Yaxha'), lago('Ipala'), lago('Calderas'), lago('Atescatempa'), lago('Petexbatún|Petexbatun')],
    80: [lago('Macanché|Macanche'), lago('Sacnab'), lago('Quexil'), lago('Sacpuy'), lago('Brava')],
    100: [lago('Lemoa'), lago('El Pino'), lago('Sepalau')],
  }, `Lagos y lagunas de Guatemala. Las de nivel 100 (Lemoa, El Pino, Sepalau) son de memoria: revisar. ${NIVELES}`),

  q('guatemala-sitios-mayas', 'Guatemala', 'Nombra un sitio arqueológico maya de Guatemala.', {
    10: ['Tikal'],
    30: ['Quiriguá|Quirigua', 'Iximché|Iximche', 'Yaxhá|Yaxha', 'El Mirador|Mirador', 'Zaculeu', 'Kaminaljuyú|Kaminaljuyu'],
    60: ['Uaxactún|Uaxactun', 'Piedras Negras', 'El Ceibal|Ceibal|Seibal', 'Dos Pilas', 'Nakum', 'Q\'umarkaj|Utatlán|Utatlan|Gumarcaaj', 'Mixco Viejo|Jilotepeque Viejo', 'Takalik Abaj|Tak\'alik Ab\'aj|Takalik Abaj'],
    80: ['Río Azul|Rio Azul', 'Topoxté|Topoxte', 'Aguateca', 'Cancuén|Cancuen', 'San Bartolo', 'El Perú-Waka\'|El Perú|Waka|Waka\''],
    100: ['Holmul', 'Naachtún|Naachtun', 'La Corona', 'Tamarindito', 'Machaquilá|Machaquila'],
  }, `Sitios arqueológicos en territorio guatemalteco. Los de nivel 100 son de memoria: revisar. ${NIVELES}`),

  q('guatemala-presidentes', 'Guatemala', 'Nombra un presidente de Guatemala.', {
    10: ['Jimmy Morales|Morales', 'Alejandro Giammattei|Giammattei', 'Bernardo Arévalo|Bernardo Arévalo de León|Bernardo', 'Otto Pérez Molina|Pérez Molina|Otto Pérez|Otto', 'Álvaro Colom|Colom', 'Óscar Berger|Berger'],
    30: ['Álvaro Arzú|Arzú|Arzu', 'Alfonso Portillo|Portillo', 'Efraín Ríos Montt|Ríos Montt|Rios Montt', 'Jorge Serrano Elías|Serrano Elías|Jorge Serrano|Serrano', 'Vinicio Cerezo|Cerezo', 'Jacobo Árbenz|Jacobo Arbenz|Árbenz|Arbenz', 'Jorge Ubico|Ubico', 'Justo Rufino Barrios|Rufino Barrios|Barrios'],
    60: ['Juan José Arévalo|Juan José Arévalo Bermejo', 'Carlos Castillo Armas|Castillo Armas', 'Miguel Ydígoras Fuentes|Ydígoras Fuentes|Ydígoras|Ydigoras', 'Enrique Peralta Azurdia|Peralta Azurdia', 'Julio César Méndez Montenegro|Méndez Montenegro|Mendez Montenegro', 'Carlos Arana Osorio|Arana Osorio|Arana', 'Kjell Laugerud|Laugerud García|Laugerud', 'Romeo Lucas García|Lucas García|Romeo Lucas', 'Óscar Mejía Víctores|Mejía Víctores|Mejia Victores', 'Ramiro de León Carpio|De León Carpio|Ramiro de León', 'Manuel Estrada Cabrera|Estrada Cabrera', 'Rafael Carrera|Carrera'],
    80: ['José María Reina Barrios|Reina Barrios', 'Mariano Gálvez|Mariano Galvez|Gálvez'],
    100: ['Miguel García Granados|García Granados', 'Manuel Lisandro Barillas|Lisandro Barillas|Barillas', 'Vicente Cerna|Cerna', 'Lázaro Chacón|Lazaro Chacon|Chacón'],
  }, `Presidentes y jefes de Estado de Guatemala (no están todos los del siglo XIX ni los de transición): Bernardo Arévalo es el actual (desde enero de 2024). "Arévalo" a secas no se acepta porque hay dos (Juan José y Bernardo). ${NIVELES}`),

  q('guatemala-lugares-turisticos', 'Guatemala', 'Nombra un lugar turístico de Guatemala.', {
    10: ['Antigua Guatemala|Antigua', 'Tikal', 'Lago de Atitlán|Atitlán|Lago Atitlán|Atitlan', 'Semuc Champey|Semuc'],
    30: ['Chichicastenango|Chichi', 'Flores|Isla de Flores|Ciudad Flores', 'Livingston', 'Río Dulce|Rio Dulce', 'Panajachel|Pana', 'Volcán de Pacaya|Pacaya', 'Monterrico', 'Quetzaltenango|Xela'],
    60: ['Cobán|Coban', 'Esquipulas', 'Quiriguá|Quirigua', 'Iximché|Iximche', 'Yaxhá|Yaxha', 'San Pedro La Laguna|San Pedro', 'Santiago Atitlán|Santiago Atitlan', 'Santa Catarina Palopó', 'El Estor', 'Lanquín|Lanquin', 'Zunil', 'Almolonga', 'Tecpán|Tecpan', 'San Juan La Laguna', 'Puerto Barrios', 'Sipacate|Sipacate'],
    80: ['Los Siete Altares|Siete Altares', 'Cuevas de Candelaria|Candelaria', 'Laguna Lachuá|Lachuá', 'Biotopo del Quetzal|Biotopo', 'Finca El Paraíso|El Paraíso', 'Ixcán|Ixcan'],
    100: ['Biotopo Cerro Cahuí|Cerro Cahuí', 'Cuevas de K\'anba|K\'anba|Kanba', 'Puerto San José|San José', 'Salcajá|Salcaja'],
  }, `Destinos turísticos conocidos (ciudades, sitios naturales y arqueológicos). Hay muchos más: se puede ir agregando. ${NIVELES}`),
]
