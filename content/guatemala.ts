import { q } from '../server/src/dsl'

const NIVELES = 'Niveles pensados para un grupo de jugadores guatemaltecos (lo que ellos nombrarían primero); hay que calibrarlos con partidas reales.'

/** "Fuego" también se acepta como "Volcán Fuego" y "Volcán de Fuego". */
const volcan = (nombre: string, ...otros: string[]) => [nombre, `Volcán ${nombre}`, `Volcán de ${nombre}`, ...otros].join('|')
/** "Atitlán" también se acepta como "Lago Atitlán", "Lago de Atitlán", "Laguna ...". */
const lago = (nombre: string, ...otros: string[]) => [nombre, `Lago ${nombre}`, `Lago de ${nombre}`, `Laguna ${nombre}`, `Laguna de ${nombre}`, ...otros].join('|')

export default [
  q('guatemala-departamentos', 'Guatemala', 'Nombra un departamento de Guatemala.', {
    10: ['Guatemala', 'Quetzaltenango|Xela|Quezaltenango', 'Petén|Peten', 'Escuintla', 'Sacatepéquez|Sacatepequez|Sacatepeques', 'Alta Verapaz'],
    30: ['Huehuetenango|Huehue|Huehuetenamgo', 'San Marcos', 'Izabal|Izabál', 'Chimaltenango|Chimal', 'Sololá|Solola', 'Zacapa', 'Quiché|Quiche|El Quiché', 'Santa Rosa', 'Jutiapa'],
    60: ['Chiquimula', 'Jalapa', 'Suchitepéquez|Suchitepequez|Suchi|Suchitepeques', 'Baja Verapaz'],
    80: ['Totonicapán|Totonicapan|Toto', 'Retalhuleu|Reu'],
    100: ['El Progreso|Progreso'],
  }, `Los 22 departamentos. ${NIVELES} Revisada 2026-10-15: agregué apodos y errores comunes (Chimal, Suchi, Quezaltenango).`),

  q('guatemala-platos-tipicos', 'Guatemala', 'Nombra un plato o comida típica de Guatemala.', {
    10: ['Pepián|Pepian|Pollo en pepián|Pepián de pollo|Pepián de res', 'Tamales|Tamal|Tamal colorado|Tamal negro|Tamal de arroz', 'Chuchitos|Chuchito', 'Fiambre', 'Shuco|Shucos'],
    30: ['Jocón|Jocon|Pollo en jocón', 'Kak\'ik|Kaq\'ik|Kak ik|Cak ik|Kaqik|Kakik|Caquic', 'Hilachas', 'Rellenitos|Rellenitos de plátano', 'Plátanos en mole|Platanos en mole|Mole de plátano|Mole', 'Revolcado', 'Caldo de res|Cocido', 'Caldo de gallina|Caldo de gallina criolla', 'Tostadas', 'Chiles rellenos', 'Atol de elote|Atol|Atole', 'Paches|Pache', 'Garnachas|Garnacha', 'Molletes|Mollete', 'Torrejas', 'Frijoles volteados|Frijoles|Frijoles negros', 'Longaniza', 'Churrasco', 'Mixtas|Mixta', 'Enchiladas|Enchilada', 'Quesadilla', 'Pan de manteca', 'Cocadas|Cocada', 'Elote loco|Elotes locos', 'Salpicón|Salpicon', 'Dobladas|Doblada', 'Desayuno chapín|Desayuno chapin|Desayuno típico', 'Plátanos fritos|Plátano frito|Plátanos con crema|Platanos fritos', 'Tortillas|Tortilla', 'Guacamol|Guacamole', 'Buñuelos|Bunuelos', 'Chicharrones|Chicharrón', 'Carne asada'],
    60: ['Pollo en crema', 'Tapado', 'Subanik|Sub\'anik', 'Empanadas de leche', 'Chilate', 'Colochos|Colocho', 'Champurradas|Champurrada', 'Chojín|Chojin', 'Pacaya|Flor de pacaya', 'Tamalitos de chipilín|Chipilín', 'Canillitas de leche|Canillitas', 'Chirmol', 'Arroz con leche', 'Ayote en miel|Ayote en dulce', 'Tacos dorados|Tacos', 'Caldo de mariscos', 'Chocobananos|Chocobanano', 'Atol blanco'],
    80: ['Gallo en chicha', 'Pulique|Pulik', 'Chuchitos de recado', 'Atol shuco|Atole shuco', 'Tamalitos de elote', 'Patín|Patin', 'Rice and beans|Rice and bean', 'Pan de coco', 'Chancletas|Chancleta', 'Jocotes en miel|Jocotes en dulce'],
    100: ['Boxbol|Box bol', 'Caldo de jute|Jute', 'Chilacayote en miel|Miel de chilacayote', 'Tayuyos|Tayuyo', 'Tamalitos de cambray|Cambray'],
  }, `Comidas y antojitos típicos. Los de nivel 100 son regionales y los puse de memoria (Boxbol, Tayuyos, Jute...): conviene que alguien de la zona los revise. ${NIVELES} Revisada 2026-10-15: agregué comidas comunes que faltaban (salpicón, dobladas, desayuno chapín, plátanos fritos, tortillas, guacamol, buñuelos, chicharrones, carne asada, chirmol, ayote en miel, tacos dorados...) y platos garífunas (tapado, rice and beans, pan de coco).`),

  q('guatemala-volcanes', 'Guatemala', 'Nombra un volcán de Guatemala.', {
    10: [volcan('Fuego'), volcan('Pacaya'), volcan('Agua'), volcan('Acatenango')],
    30: [volcan('Santiaguito'), volcan('Tajumulco'), volcan('Atitlán|Atitlan'), volcan('San Pedro'), volcan('Tolimán|Toliman')],
    60: [volcan('Santa María|Santa Maria'), volcan('Tacaná|Tacana'), volcan('Cerro Quemado'), volcan('Ipala'), volcan('Zunil'), volcan('Chicabal')],
    80: [volcan('Moyuta'), volcan('Chingo'), volcan('Jumaytepeque'), volcan('Suchitán|Suchitan'), volcan('Quetzaltepeque|Quezaltepeque'), volcan('Tecuamburro'), volcan('Siete Orejas'), volcan('Santo Tomás|Santo Tomas|Pecul'), volcan('Ixtepeque'), volcan('Cerro Redondo')],
    100: [volcan('Alzatate'), volcan('Cuxliquel'), volcan('Amatitlán|Amatitlan'), volcan('Culma'), volcan('Lacandón|Lacandon'), volcan('Tahual'), volcan('Las Víboras|Las Viboras'), volcan('Cerro de Oro'), volcan('Jumay'), volcan('Las Flores|Flores'), volcan('Almolonga|Cerro Almolonga'), volcan('Cuilapa|Cuilapa-Barberena|Barberena')],
  }, `Volcanes de Guatemala (la lista oficial tiene unos 37, aquí van los conocidos). "Volcán de Fuego" y "Fuego" cuentan igual. Culma y Lacandón de nivel 100 los puse de memoria: revisar. ${NIVELES} Revisada 2026-10-15: quité "Santa Clara" (no aparece en ninguna lista de volcanes de Guatemala); agregué Santo Tomás, Ixtepeque, Cerro Redondo, Tahual, Las Víboras, Cerro de Oro, Jumay, Las Flores, Almolonga y Cuilapa (Smithsonian / Wikipedia). Cuxliquel y Culma sí están verificados; Amatitlán es la caldera donde está el Pacaya.`),

  q('guatemala-lagos', 'Guatemala', 'Nombra un lago o laguna de Guatemala.', {
    10: [lago('Atitlán|Atitlan'), lago('Izabal'), 'Petén Itzá|Peten Itza|Lago Petén Itzá|Lago Peten Itza|Lago de Petén Itzá|Lago de Peten Itza|Laguna Petén Itzá|Lago Petén|Lago de Petén|Petén|Peten', lago('Amatitlán|Amatitlan')],
    30: [lago('Ayarza'), lago('Lachuá|Lachua'), lago('Güija|Guija'), lago('Chicabal')],
    60: [lago('Yaxhá|Yaxha'), lago('Ipala'), lago('Calderas'), lago('Atescatempa'), lago('Petexbatún|Petexbatun'), lago('Chichoj')],
    80: [lago('Macanché|Macanche'), lago('Sacnab'), lago('Quexil'), lago('Sacpuy'), lago('Brava', 'Yolnabaj'), lago('Magdalena'), lago('Ixpaco'), lago('Salpetén|Salpeten'), 'El Golfete|Golfete'],
    100: [lago('Lemoa'), lago('El Pino'), lago('Sepalau'), lago('El Hoyo', 'Laguna del Hoyo'), lago('Retana'), lago('Perdida'), lago('Del Tigre', 'Laguna del Tigre')],
  }, `Lagos y lagunas de Guatemala. Las de nivel 100 (Lemoa, El Pino, Sepalau) son de memoria: revisar. ${NIVELES} Revisada 2026-10-15: agregué Chichoj, Magdalena, Ixpaco, Salpetén, El Golfete, del Hoyo, Retana, Perdida y del Tigre.`),

  q('guatemala-sitios-mayas', 'Guatemala', 'Nombra un sitio arqueológico maya de Guatemala.', {
    10: ['Tikal'],
    30: ['Quiriguá|Quirigua', 'Iximché|Iximche', 'Yaxhá|Yaxha', 'El Mirador|Mirador', 'Zaculeu', 'Kaminaljuyú|Kaminaljuyu|Kaminal Juyú'],
    60: ['Uaxactún|Uaxactun', 'Piedras Negras', 'El Ceibal|Ceibal|Seibal', 'Dos Pilas', 'Nakum', 'Q\'umarkaj|Utatlán|Utatlan|Gumarcaaj|Gumarcaj|Kumarcaaj|Qumarkaj', 'Mixco Viejo|Jilotepeque Viejo', 'Takalik Abaj|Tak\'alik Ab\'aj|Abaj Takalik', 'Naranjo|Naranjo-Sa\'al'],
    80: ['Río Azul|Rio Azul', 'Topoxté|Topoxte', 'Aguateca', 'Cancuén|Cancuen', 'San Bartolo', 'El Perú-Waka\'|El Perú|Waka|Waka\'', 'Nakbé|Nakbe', 'Xultún|Xultun', 'Cotzumalguapa|Santa Lucía Cotzumalguapa|El Baúl|Bilbao', 'Tayasal'],
    100: ['Holmul', 'Naachtún|Naachtun', 'La Corona', 'Tamarindito', 'Machaquilá|Machaquila', 'El Tintal|Tintal', 'El Zotz|Zotz', 'La Blanca', 'Chocolá|Chocola', 'Ixkún|Ixkun', 'Motul de San José|Motul'],
  }, `Sitios arqueológicos en territorio guatemalteco. Los de nivel 100 son de memoria: revisar. ${NIVELES} Revisada 2026-10-15: agregué Naranjo, Nakbé, Xultún, Cotzumalguapa (El Baúl/Bilbao), Tayasal, El Tintal, El Zotz, La Blanca, Chocolá, Ixkún y Motul de San José.`),

  q('guatemala-presidentes', 'Guatemala', 'Nombra un presidente de Guatemala.', {
    10: ['Jimmy Morales|Morales', 'Alejandro Giammattei|Giammattei', 'Bernardo Arévalo|Bernardo Arévalo de León|Bernardo', 'Otto Pérez Molina|Pérez Molina|Otto Pérez|Otto', 'Álvaro Colom|Colom', 'Óscar Berger|Berger'],
    30: ['Álvaro Arzú|Arzú|Arzu', 'Alfonso Portillo|Portillo', 'Efraín Ríos Montt|Ríos Montt|Rios Montt', 'Jorge Serrano Elías|Serrano Elías|Jorge Serrano|Serrano', 'Vinicio Cerezo|Cerezo', 'Jacobo Árbenz|Jacobo Arbenz|Árbenz|Arbenz', 'Jorge Ubico|Ubico', 'Justo Rufino Barrios|Rufino Barrios|Barrios'],
    60: ['Juan José Arévalo|Juan José Arévalo Bermejo', 'Carlos Castillo Armas|Castillo Armas', 'Miguel Ydígoras Fuentes|Ydígoras Fuentes|Ydígoras|Ydigoras', 'Enrique Peralta Azurdia|Peralta Azurdia', 'Julio César Méndez Montenegro|Méndez Montenegro|Mendez Montenegro', 'Carlos Arana Osorio|Arana Osorio|Arana', 'Kjell Laugerud|Laugerud García|Laugerud', 'Romeo Lucas García|Lucas García|Romeo Lucas', 'Óscar Mejía Víctores|Mejía Víctores|Mejia Victores', 'Ramiro de León Carpio|De León Carpio|Ramiro de León', 'Manuel Estrada Cabrera|Estrada Cabrera', 'Rafael Carrera|Carrera'],
    80: ['José María Reina Barrios|Reina Barrios', 'Mariano Gálvez|Mariano Galvez|Gálvez', 'Alejandro Maldonado Aguirre|Maldonado Aguirre|Alejandro Maldonado'],
    100: ['Miguel García Granados|García Granados', 'Manuel Lisandro Barillas|Lisandro Barillas|Barillas', 'Vicente Cerna|Cerna', 'Lázaro Chacón|Lazaro Chacon|Chacón', 'José María Orellana|Jose Maria Orellana|Orellana', 'Federico Ponce Vaides|Ponce Vaides', 'Carlos Herrera|Carlos Herrera Luna', 'Guillermo Flores Avendaño|Flores Avendaño', 'Mariano Rivera Paz|Rivera Paz', 'Gustavo Espina|Espina'],
  }, `Presidentes y jefes de Estado de Guatemala (no están todos los del siglo XIX ni los de transición): Bernardo Arévalo es el actual (desde enero de 2024). "Arévalo" a secas no se acepta porque hay dos (Juan José y Bernardo). ${NIVELES} Revisada 2026-10-15: agregué a Alejandro Maldonado Aguirre (presidente en 2015 tras la renuncia de Pérez Molina) y a Orellana, Ponce Vaides, Carlos Herrera, Flores Avendaño, Rivera Paz y Gustavo Espina.`),

  q('guatemala-lugares-turisticos', 'Guatemala', 'Nombra un lugar turístico de Guatemala.', {
    10: ['Antigua Guatemala|Antigua', 'Tikal', 'Lago de Atitlán|Atitlán|Lago Atitlán|Atitlan', 'Semuc Champey|Semuc'],
    30: ['Chichicastenango|Chichi', 'Flores|Isla de Flores|Ciudad Flores', 'Livingston', 'Río Dulce|Rio Dulce', 'Panajachel|Pana', 'Volcán de Pacaya|Pacaya', 'Monterrico', 'Quetzaltenango|Xela', 'Volcán de Acatenango|Acatenango|Volcán Acatenango', 'IRTRA|Xetulul|Xocomil|Parques del IRTRA|IRTRA Petapa'],
    60: ['Cobán|Coban', 'Esquipulas|Basílica de Esquipulas|Cristo Negro', 'Quiriguá|Quirigua', 'Iximché|Iximche', 'Yaxhá|Yaxha', 'San Pedro La Laguna|San Pedro', 'Santiago Atitlán|Santiago Atitlan', 'Santa Catarina Palopó', 'El Estor', 'Lanquín|Lanquin|Grutas de Lanquín', 'Zunil', 'Almolonga', 'Tecpán|Tecpan', 'San Juan La Laguna', 'Puerto Barrios', 'Sipacate', 'Hobbitenango', 'El Paredón|Paredón|Paredon', 'Cerro de la Cruz', 'Castillo de San Felipe|San Felipe de Lara|Castillo de San Felipe de Lara', 'Laguna de Chicabal|Chicabal', 'Fuentes Georginas', 'Palacio Nacional|Palacio Nacional de la Cultura', 'Paseo Cayalá|Cayalá|Cayala|Ciudad Cayalá', 'El Mirador|Mirador', 'Zoológico La Aurora|La Aurora|Zoológico', 'Auto Safari Chapín|Autosafari Chapín|Auto Safari'],
    80: ['Los Siete Altares|Siete Altares', 'Cuevas de Candelaria|Candelaria', 'Laguna Lachuá|Lachuá', 'Biotopo del Quetzal|Biotopo', 'Finca El Paraíso|El Paraíso', 'Ixcán|Ixcan', 'Las Lisas', 'Mapa en Relieve|Mapa en relieve', 'Sierra de los Cuchumatanes|Cuchumatanes|Los Cuchumatanes', 'Todos Santos Cuchumatán|Todos Santos', 'Playa Blanca', 'Centro Histórico|Zona 1|Catedral Metropolitana', 'Ciudad Vieja'],
    100: ['Biotopo Cerro Cahuí|Cerro Cahuí', 'Cuevas de K\'anba|K\'anba|Kanba', 'Puerto San José|San José', 'Salcajá|Salcaja', 'Punta de Manabique', 'San Antonio Aguas Calientes', 'Cañón El Boquerón|El Boquerón|Boquerón', 'Las Conchas'],
  }, `Destinos turísticos conocidos (ciudades, sitios naturales y arqueológicos). Hay muchos más: se puede ir agregando. ${NIVELES} Revisada 2026-10-15: agregué lugares muy visitados que faltaban (Acatenango, IRTRA/Xetulul/Xocomil, Hobbitenango, El Paredón, Cerro de la Cruz, Castillo de San Felipe, Chicabal, Fuentes Georginas, Cayalá, Palacio Nacional, La Aurora, Auto Safari Chapín, El Mirador...).`),
]
