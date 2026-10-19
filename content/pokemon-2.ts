import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales. Se aceptan los nombres sin tilde ni mayúsculas.'

export default [
  q('pokemon-tipos', 'Pokémon', 'Nombra un tipo de Pokémon.', {
    10: ['Fuego|Fire', 'Agua|Water', 'Planta|Hierba|Grass', 'Eléctrico|Electrico|Electricidad|Electric'],
    30: ['Psíquico|Psiquico|Psychic', 'Volador|Volar|Flying', 'Normal', 'Fantasma|Ghost', 'Dragón|Dragon', 'Roca|Rock', 'Tierra|Ground', 'Hielo|Ice'],
    60: ['Veneno|Venenoso|Poison', 'Lucha|Pelea|Fighting', 'Bicho|Insecto|Bug', 'Hada|Fairy'],
    80: ['Siniestro|Oscuro|Dark', 'Acero|Metal|Steel'],
    100: ['Astral|Stellar'],
  }, `Los 18 tipos de los juegos principales. "Astral" (Stellar) solo existe como teratipo en Escarlata/Púrpura: lo puse en 100, quitarlo si se quiere estricto. El tipo "???" de las generaciones 2-4 no cuenta. ${NIVELES}`),

  q('pokemon-iniciales', 'Pokémon', 'Nombra un Pokémon inicial (el que eliges al empezar, sin evolucionar).', {
    10: ['Charmander|Charmandar', 'Bulbasaur|Bulbasor|Bulbasaurio', 'Squirtle|Squirtel|Esquirtel'],
    30: ['Pikachu', 'Cyndaquil|Cindaquil', 'Totodile|Totodail', 'Chikorita', 'Torchic', 'Mudkip', 'Treecko|Treeko', 'Piplup'],
    60: ['Chimchar', 'Turtwig', 'Froakie', 'Fennekin|Fenekin', 'Chespin', 'Rowlet', 'Litten', 'Popplio|Poplio', 'Snivy', 'Tepig', 'Oshawott|Oshawot', 'Eevee|Evee|Eevie'],
    80: ['Grookey', 'Scorbunny', 'Sobble', 'Sprigatito', 'Fuecoco', 'Quaxly'],
    100: ['Browt', 'Pombon', 'Gecqua'],
  }, `Los 3 iniciales de cada generación (1 a 9) más los de la generación 10 (Pokémon Vientos y Olas, anunciados en febrero de 2026, salen en 2027) y los iniciales especiales Pikachu (Amarillo, Let's Go Pikachu) y Eevee (Let's Go Eevee). Las evoluciones (Charizard, Blastoise...) NO cuentan. ${NIVELES}`),

  q('pokemon-legendarios', 'Pokémon', 'Nombra un Pokémon legendario o mítico.', {
    10: ['Mewtwo|Mew Two|Mew 2|Mewtu', 'Mew', 'Lugia', 'Rayquaza|Rayquasa|Raycuaza'],
    30: ['Articuno', 'Zapdos', 'Moltres', 'Ho-Oh|Hooh', 'Celebi', 'Arceus|Arseus', 'Groudon|Graudon', 'Kyogre|Kiogre', 'Dialga', 'Palkia', 'Giratina', 'Entei', 'Suicune|Suicun', 'Raikou|Raiku', 'Jirachi', 'Deoxys|Deoxis', 'Darkrai|Darkray', 'Reshiram', 'Zekrom'],
    60: ['Latias', 'Latios', 'Regirock', 'Regice', 'Registeel', 'Kyurem', 'Xerneas', 'Yveltal', 'Zygarde', 'Solgaleo', 'Lunala', 'Necrozma', 'Zacian', 'Zamazenta', 'Eternatus', 'Koraidon', 'Miraidon', 'Victini', 'Shaymin', 'Manaphy', 'Heatran', 'Regigigas', 'Cresselia', 'Hoopa', 'Genesect', 'Meloetta', 'Marshadow', 'Zeraora', 'Keldeo', 'Uxie', 'Mesprit', 'Azelf'],
    80: ['Cobalion', 'Terrakion', 'Virizion', 'Tornadus', 'Thundurus', 'Landorus', 'Tapu Koko', 'Tapu Lele', 'Tapu Bulu', 'Tapu Fini', 'Diancie', 'Volcanion', 'Magearna', 'Meltan', 'Melmetal', 'Calyrex', 'Urshifu', 'Kubfu', 'Zarude', 'Terapagos', 'Ogerpon'],
    100: ['Phione', 'Código Cero|Type: Null|Type Null|Tipo Cero', 'Silvally', 'Cosmog', 'Cosmoem', 'Regieleki', 'Regidrago', 'Glastrier', 'Spectrier', 'Enamorus', 'Wo-Chien|Wochien', 'Chien-Pao|Chienpao', 'Ting-Lu|Tinglu', 'Chi-Yu|Chiyu', 'Okidogi', 'Munkidori', 'Fezandipiti', 'Pecharunt', 'Ondulagua|Walking Wake', 'Ferroverdor|Iron Leaves', 'Flamariete|Gouging Fire', 'Electrofuria|Raging Bolt', 'Ferromole|Iron Boulder', 'Ferrotesta|Iron Crown'],
  }, `Los legendarios y míticos de las generaciones 1 a 9 (lista de Bulbapedia, octubre de 2026). Los 6 Pokémon paradoja "legendarios" de los DLC (Ondulagua, Ferroverdor, Flamariete, Electrofuria, Ferromole, Ferrotesta) no son oficialmente legendarios pero los acepté en 100 (nombres en español verificados en WikiDex). Los Ultraentes (Nihilego, Buzzwole...) NO cuentan. ${NIVELES}`),

  q('pokemon-tipo-psiquico', 'Pokémon', 'Nombra un Pokémon tipo psíquico.', {
    10: ['Mewtwo|Mew two|Mewtu|Mew 2'],
    30: ['Abra', 'Alakazam|Alakazan', 'Slowpoke', 'Mew', 'Espeon', 'Wobbuffet', 'Gardevoir', 'Metagross'],
    60: ['Kadabra', 'Slowbro', 'Drowzee', 'Hypno', 'Exeggutor', 'Starmie', 'Mr. Mime', 'Jynx', 'Natu', 'Xatu', 'Slowking', 'Lugia', 'Celebi', 'Ralts', 'Kirlia', 'Beldum', 'Metang', 'Latias', 'Latios', 'Jirachi', 'Deoxys', 'Gallade', 'Uxie', 'Mesprit', 'Azelf', 'Cresselia', 'Musharna', 'Reuniclus', 'Espurr', 'Meowstic', 'Solgaleo', 'Lunala', 'Necrozma', 'Hatterene', 'Armarouge'],
    80: ['Exeggcute', 'Unown', 'Girafarig', 'Smoochum', 'Meditite', 'Medicham', 'Spoink', 'Grumpig', 'Lunatone', 'Solrock', 'Baltoy', 'Claydol', 'Chimecho', 'Wynaut', 'Chingling', 'Bronzor', 'Bronzong', 'Mime Jr.'],
    100: ['Victini', 'Munna', 'Woobat', 'Swoobat', 'Sigilyph', 'Gothita', 'Gothorita', 'Gothitelle', 'Solosis', 'Duosion', 'Elgyem', 'Beheeyem', 'Meloetta', 'Delphox', 'Inkay', 'Malamar', 'Hoopa', 'Oranguru', 'Bruxish', 'Tapu Lele', 'Cosmog', 'Cosmoem', 'Dottler', 'Orbeetle', 'Hatenna', 'Hattrem', 'Mr. Rime', 'Indeedee', 'Calyrex', 'Wyrdeer', 'Rabsca', 'Flittle', 'Espathra', 'Veluza', 'Farigiraf', 'Colagrito|Scream Tail', 'Ferroverdor|Iron Leaves', 'Munkidori', 'Ferromole|Iron Boulder', 'Ferrotesta|Iron Crown'],
  }, `Los 102 Pokémon de las generaciones 1 a 9 (hasta el n.º 1025, con los DLC de Paldea) que tienen el tipo psíquico, solo o combinado con otro (los de tipo doble cuentan). Nombres oficiales en español. Se excluyen Megaevoluciones, formas regionales y otras formas, a menos que sean otro Pokémon con nombre propio. Lista cotejada con PokeAPI (base de datos de los juegos). ${NIVELES}`),
  q('pokemon-tipo-veneno', 'Pokémon', 'Nombra un Pokémon tipo veneno.', {
    10: ['Bulbasaur|Bulbasur|Bulbasor|Bulbasaurio', 'Ekans', 'Gengar', 'Koffing'],
    30: ['Venusaur|Venasaur|Venusaurio', 'Arbok', 'Nidoking', 'Zubat', 'Muk', 'Gastly', 'Haunter', 'Weezing'],
    60: ['Ivysaur', 'Weedle', 'Beedrill', 'Nidoqueen', 'Golbat', 'Oddish', 'Gloom', 'Vileplume', 'Venomoth', 'Bellsprout', 'Victreebel', 'Tentacool', 'Tentacruel', 'Grimer', 'Spinarak', 'Ariados', 'Crobat', 'Seviper', 'Roserade', 'Stunky', 'Skuntank', 'Croagunk', 'Toxicroak', 'Trubbish', 'Garbodor', 'Amoonguss', 'Dragalge', 'Toxapex', 'Salazzle', 'Toxtricity', 'Eternatus'],
    80: ['Kakuna', 'Nidoran hembra|Nidoran|Nidoran F', 'Nidorina', 'Nidoran macho|Nidoran M', 'Nidorino', 'Venonat', 'Weepinbell', 'Qwilfish', 'Dustox', 'Roselia', 'Gulpin', 'Swalot', 'Budew', 'Skorupi', 'Drapion'],
    100: ['Venipede', 'Whirlipede', 'Scolipede', 'Foongus', 'Skrelp', 'Mareanie', 'Salandit', 'Nihilego', 'Poipole', 'Naganadel', 'Toxel', 'Sneasler', 'Overqwil', 'Shroodle', 'Grafaiai', 'Varoom', 'Revavroom', 'Glimmet', 'Glimmora', 'Clodsire', 'Ferropolilla|Iron Moth', 'Okidogi', 'Munkidori', 'Fezandipiti', 'Pecharunt'],
  }, `Los 83 Pokémon de las generaciones 1 a 9 (hasta el n.º 1025, con los DLC de Paldea) que tienen el tipo veneno, solo o combinado con otro (los de tipo doble cuentan). Nombres oficiales en español. Se excluyen Megaevoluciones, formas regionales y otras formas, a menos que sean otro Pokémon con nombre propio. Lista cotejada con PokeAPI (base de datos de los juegos). ${NIVELES}`),
]
