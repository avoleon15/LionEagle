import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales.'

export default [
  // Mismo id que la pregunta de muestra: reemplaza esa versión corta por la lista completa.
  q('elementos', 'Ciencia', 'Nombra un elemento de la tabla periódica.', {
    10: ['Oro|Gold', 'Plata|Silver', 'Hierro|Iron', 'Oxígeno|Oxygen', 'Hidrógeno|Hydrogen', 'Carbono|Carbon', 'Helio|Helium'],
    30: ['Sodio|Sodium', 'Cobre|Copper', 'Nitrógeno|Nitrogen', 'Calcio|Calcium', 'Uranio|Uranium', 'Zinc|Cinc|Zinc', 'Plomo|Lead', 'Aluminio|Aluminum|Aluminium', 'Mercurio|Mercury', 'Cloro|Chlorine', 'Neón|Neon', 'Litio|Lithium', 'Platino|Platinum', 'Potasio|Potassium', 'Magnesio|Magnesium', 'Silicio|Silicon', 'Azufre|Sulfur|Sulphur', 'Fósforo|Phosphorus', 'Estaño|Tin', 'Níquel|Nickel', 'Titanio|Titanium', 'Flúor|Fluorine'],
    60: ['Argón|Argon', 'Cobalto|Cobalt', 'Cromo|Chromium', 'Manganeso|Manganese', 'Yodo|Iodine', 'Bromo|Bromine', 'Boro|Boron', 'Berilio|Beryllium', 'Arsénico|Arsenic', 'Cadmio|Cadmium', 'Wolframio|Tungsteno|Tungsten', 'Radio|Radium', 'Plutonio|Plutonium', 'Criptón|Kriptón|Krypton', 'Xenón|Xenon', 'Radón|Radon', 'Selenio|Selenium', 'Antimonio|Antimony', 'Bario|Barium', 'Cesio|Cesium|Caesium', 'Paladio|Palladium', 'Iridio|Iridium', 'Osmio|Osmium', 'Vanadio|Vanadium', 'Polonio|Polonium', 'Einstenio|Einsteinio|Einsteinium'],
    80: ['Estroncio|Strontium', 'Rodio|Rhodium', 'Molibdeno|Molybdenum', 'Galio|Gallium', 'Germanio|Germanium', 'Rubidio|Rubidium', 'Torio|Thorium', 'Escandio|Scandium', 'Circonio|Zirconio|Zirconium', 'Niobio|Niobium', 'Rutenio|Ruthenium', 'Telurio|Tellurium', 'Indio|Indium', 'Talio|Thallium', 'Bismuto|Bismuth', 'Francio|Francium', 'Astato|Astatine', 'Actinio|Actinium', 'Neptunio|Neptunium', 'Americio|Americium', 'Curio|Curium', 'Fermio|Fermium', 'Mendelevio|Mendelevium', 'Nobelio|Nobelium', 'Lawrencio|Lawrencium', 'Hafnio|Hafnium', 'Tantalio|Tántalo|Tantalum', 'Renio|Rhenium', 'Berkelio|Berkelium', 'Californio|Californium'],
    100: ['Itrio|Yttrium', 'Tecnecio|Technetium', 'Lantano|Lanthanum', 'Cerio|Cerium', 'Praseodimio|Praseodymium', 'Neodimio|Neodymium', 'Prometio|Promethium', 'Samario|Samarium', 'Europio|Europium', 'Gadolinio|Gadolinium', 'Terbio|Terbium', 'Disprosio|Dysprosium', 'Holmio|Holmium', 'Erbio|Erbium', 'Tulio|Thulium', 'Iterbio|Ytterbium', 'Lutecio|Lutetium', 'Protactinio|Protactinium', 'Rutherfordio|Rutherfordium', 'Dubnio|Dubnium', 'Seaborgio|Seaborgium', 'Bohrio|Bohrium', 'Hasio|Hassium', 'Meitnerio|Meitnerium', 'Darmstatio|Darmstadtium', 'Roentgenio|Roentgenium', 'Copernicio|Copernicium', 'Nihonio|Nihonium', 'Flerovio|Flerovium', 'Moscovio|Moscovium', 'Livermorio|Livermorium', 'Teneso|Tenesino|Tennessine', 'Oganesón|Oganeson|Oganesson'],
  }, `Los 118 elementos con nombre oficial. Reemplaza la pregunta de muestra de elementos. Se aceptan los nombres en inglés y algunas variantes en español (wolframio/tungsteno, cinc/zinc). Los símbolos (Fe, Au...) no se aceptan. ${NIVELES}`),

  // Mismo id que la pregunta de muestra.
  q('instrumentos', 'Música', 'Nombra un instrumento musical.', {
    10: ['Guitarra|Guitar|Guitarra acústica|Guitarra eléctrica', 'Piano', 'Batería|Bateria|Drums', 'Violín|Violin'],
    30: ['Flauta|Flauta traversa|Flute', 'Trompeta|Trumpet', 'Saxofón|Saxofon|Saxo|Saxophone', 'Bajo|Bajo eléctrico|Bass', 'Arpa|Harp', 'Marimba', 'Acordeón|Acordeon|Accordion', 'Violonchelo|Chelo|Cello', 'Clarinete|Clarinet', 'Teclado|Keyboard', 'Tambor|Redoblante|Snare', 'Ukelele|Ukulele', 'Trombón|Trombon|Trombone', 'Armónica|Armonica|Harmonica', 'Maracas', 'Órgano|Organo|Organ', 'Xilófono|Xilofono|Xylophone', 'Pandero|Pandereta|Tambourine', 'Triángulo|Triangulo|Triangle'],
    60: ['Oboe', 'Tuba', 'Banjo', 'Mandolina|Mandolin', 'Contrabajo|Double bass', 'Gaita|Bagpipe|Bagpipes|Gaita escocesa', 'Cajón|Cajon', 'Bongós|Bongo|Bongos', 'Timbales', 'Flauta dulce|Recorder', 'Sintetizador|Synthesizer|Sinte', 'Castañuelas|Castanets', 'Congas|Conga', 'Bombo|Bass drum', 'Platillos|Cymbals', 'Güiro|Guiro', 'Charango', 'Quena', 'Zampoña|Zampona|Siku', 'Ocarina', 'Kalimba|Mbira|Piano de pulgar', 'Vihuela', 'Laúd|Laud|Lute', 'Lira|Lyre', 'Cítara|Citara|Zither', 'Fagot|Bassoon', 'Piccolo|Flautín|Flautin', 'Vibráfono|Vibrafono|Vibraphone', 'Melódica|Melodica', 'Corno francés|Trompa|French horn', 'Viola'],
    80: ['Sitar', 'Corno inglés|English horn', 'Contrafagot|Contrabassoon', 'Eufonio|Euphonium|Bombardino', 'Sousafón|Sousaphone|Sousafon', 'Glockenspiel|Carillón', 'Campanas tubulares|Tubular bells', 'Celesta', 'Gong', 'Cencerro|Cowbell', 'Claves|Claves', 'Djembé|Djembe|Yembé', 'Tabla', 'Balalaica|Balalaika', 'Shamisen', 'Koto', 'Erhu', 'Guzheng', 'Pipa', 'Concertina', 'Bandoneón|Bandoneon', 'Cuatro', 'Tiple', 'Bandurria', 'Guitarrón|Guitarron', 'Hang drum|Handpan', 'Steel drum|Tambor metálico|Steelpan', 'Cornetín|Cornet', 'Fiscorno|Flugelhorn|Flugabone'],
    100: ['Theremín|Theremin', 'Didgeridoo|Didyeridú|Didjeridu', 'Clavicémbalo|Clavecín|Harpsichord', 'Kazoo', 'Armónica de cristal|Glass harmonica', 'Serpentón|Serpent', 'Ondas Martenot|Ondas Martenot', 'Sarangi', 'Santur|Santoor', 'Oud|Laúd árabe|Ud', 'Duduk', 'Hurdy-gurdy|Zanfona|Zanfoña', 'Nyckelharpa', 'Cimbalón|Cimbalom|Címbalo', 'Dulcimer', 'Vuvuzela', 'Vibraslap', 'Cuíca|Cuica', 'Berimbau', 'Rabel|Rebab', 'Kantele|Kantele'],
  }, `Instrumentos de orquesta, de banda, folclóricos y del mundo. Reemplaza la pregunta de muestra. Hay cientos más: a medida que salgan respuestas válidas no incluidas, conviene agregarlas. ${NIVELES}`),

  q('huesos-cuerpo', 'Ciencia', 'Nombra un hueso del cuerpo humano.', {
    10: ['Cráneo|Craneo|Skull', 'Fémur|Femur', 'Costillas|Costilla|Ribs', 'Columna vertebral|Columna|Vértebras|Vertebras|Espina dorsal|Spine'],
    30: ['Húmero|Humero', 'Tibia', 'Clavícula|Clavicula', 'Omóplato|Omoplato|Escápula|Escapula', 'Esternón|Esternon|Sternum', 'Pelvis|Cadera|Hueso de la cadera', 'Rótula|Rotula|Patella', 'Mandíbula|Mandibula|Quijada', 'Radio', 'Cúbito|Cubito|Ulna', 'Peroné|Perone|Fíbula|Fibula', 'Falanges|Falange|Phalanges', 'Cóccix|Coxis|Coccyx|Cola', 'Sacro|Sacrum'],
    60: ['Metacarpianos|Metacarpiano', 'Metatarsianos|Metatarsiano', 'Carpianos|Carpiano|Huesos del carpo', 'Tarsianos|Tarsiano|Huesos del tarso', 'Astrágalo|Astragalo|Talus', 'Calcáneo|Calcaneo|Talón|Talon', 'Frontal', 'Parietal', 'Temporal', 'Occipital', 'Cigomático|Cigomatico|Pómulo|Pomulo|Malar', 'Maxilar|Maxilar superior', 'Hioides', 'Martillo|Malleus', 'Yunque|Incus', 'Estribo|Stapes', 'Atlas', 'Axis', 'Escafoides|Navicular|Escafoides carpiano', 'Nasal|Hueso nasal'],
    80: ['Esfenoides|Esfenoides', 'Etmoides', 'Vómer|Vomer', 'Lagrimal|Unguis', 'Palatino', 'Cuboides', 'Pisiforme', 'Ganchoso|Hamato', 'Semilunar|Lunar', 'Trapecio', 'Trapezoide', 'Piramidal|Triquetro', 'Hueso grande|Capitado'],
    100: ['Cuneiformes|Cuneiforme', 'Sesamoideos|Sesamoideo|Huesos sesamoideos', 'Cornete inferior|Cornete'],
  }, `Huesos del esqueleto humano (cráneo, columna, extremidades, oído). El esqueleto adulto tiene 206 huesos; esta lista cubre los nombres más conocidos pero no todos. ${NIVELES}`),

  q('estrellas', 'Ciencia', 'Nombra una estrella (puede ser famosa o visible en el cielo).', {
    10: ['Sol|El Sol|Sun', 'Estrella Polar|Polaris|La Polar|Estrella del Norte', 'Sirio|Sirius', 'Betelgeuse|Betelgeuze'],
    30: ['Alfa Centauri|Alpha Centauri|Rigil Kentaurus|Toliman', 'Próxima Centauri|Proxima Centauri|Proxima|Próxima', 'Vega', 'Rigel', 'Antares', 'Arturo|Arcturus', 'Aldebarán|Aldebaran', 'Canopus', 'Altair|Altaír', 'Deneb', 'Capella|Capela'],
    60: ['Procyon|Proción|Procion', 'Spica|Espiga', 'Pollux|Pólux', 'Castor', 'Regulus|Régulo', 'Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak', 'Fomalhaut', 'Achernar', 'Hadar|Agena', 'Acrux', 'Mimosa', 'Algol', 'Mizar', 'Alcor'],
    80: ['Estrella de Barnard|Barnard|Barnard\'s Star', 'Alpheratz|Alferatz', 'Alphard|Alfard', 'Denébola|Denebola', 'Dubhe', 'Merak', 'Kochab', 'Mirfak', 'Sadr', 'Rasalhague', 'Saiph', 'Almach', 'Shaula', 'Sargas', 'Miaplacidus', 'Gacrux', 'Tau Ceti', 'Wolf 359', 'Eta Carinae|Eta Carinae', 'VY Canis Majoris|VY Canis Majoris', 'UY Scuti', 'TRAPPIST-1|Trappist 1|Trappist-1'],
    100: ['Alioth', 'Alkaid', 'Megrez', 'Phecda', 'Menkar', 'Schedar', 'Hamal', 'Diphda', 'Enif', 'Nunki', 'Alnair', 'Épsilon Eridani|Epsilon Eridani'],
  }, `Interpretación de tu "name a star in the solar system": en el Sistema Solar solo hay una (el Sol), así que la pregunta se amplió a "una estrella" en general. Hay una pregunta aparte de planetas entre las de muestra. ${NIVELES}`),

  q('juegos-de-mesa', 'Cultura general', 'Nombra un juego de mesa.', {
    10: ['Monopoly|Monopolio', 'Ajedrez|Chess', 'Damas|Checkers|Draughts', 'Parchís|Parchis|Ludo', 'Scrabble'],
    30: ['Risk|Risiko', 'Clue|Cluedo', 'Jenga', 'Catan|Los colonos de Catán|Colonos de Catán|Settlers of Catan', 'Serpientes y escaleras|Snakes and Ladders', 'Backgammon', 'Batalla naval|Battleship|Hundir la flota', 'Lotería|Loteria|Bingo', 'Dominó|Domino', 'Pictionary', 'Trivial Pursuit|Trivial', 'Conecta 4|Cuatro en línea|Connect 4|Connect Four', 'Candy Land', 'Operando|Operation', 'Ratonera|Mouse Trap', 'Quién es quién|¿Quién es quién?|Guess Who', 'Damas chinas|Chinese checkers', 'Oca|Juego de la oca', 'Mastermind', 'Sorry|Sorry!', 'El juego de la vida|The Game of Life|Life', 'Tabú|Taboo', 'Mahjong|Mah-jong|Mahjongg'],
    60: ['Carcassonne', 'Ticket to Ride|Aventureros al tren', 'Dixit', 'Codenames|Código secreto|Codigo secreto', 'Pandemic|Pandemia', 'Azul', 'Go|Weiqi|Baduk', 'Stratego', 'Cranium', 'Boggle', 'Splendor', '7 Wonders|Seven Wonders', 'Diplomacy|Diplomacia', 'Uno'],
    80: ['Terraforming Mars|Terraformación de Marte', 'Gloomhaven', 'Wingspan|Envergadura', 'Agricola', 'Puerto Rico', 'Twilight Struggle', 'Scythe', 'Root', 'Brass: Birmingham|Brass Birmingham|Brass'],
    100: ['Twilight Imperium', 'Eclipse', 'Through the Ages', 'Dune: Imperium|Dune Imperium', 'Ark Nova', 'Spirit Island|Isla Espíritu'],
  }, `Juegos de mesa clásicos y modernos. Uno es de cartas (no es juego de mesa en sentido estricto) pero lo puse por si acaso porque mucha gente lo nombra: decisión tuya. ${NIVELES}`),

  q('lenguajes-programacion', 'Cultura general', 'Nombra un lenguaje de programación.', {
    10: ['Python', 'Java', 'JavaScript|JS|Javascript', 'C', 'C++|Cpp|C plus plus'],
    30: ['C#|Csharp|C sharp', 'PHP', 'Swift', 'Kotlin', 'Go|Golang', 'Rust', 'Ruby', 'TypeScript|TS', 'SQL', 'R', 'MATLAB|Matlab', 'Scratch'],
    60: ['Assembly|Ensamblador|Assembler|Lenguaje ensamblador', 'Visual Basic|VB|VB.NET', 'Perl', 'Lua', 'Dart', 'Scala', 'Haskell', 'Lisp', 'COBOL', 'Fortran', 'Pascal', 'Objective-C|Objective C', 'Julia', 'Bash|Shell', 'PowerShell', 'BASIC', 'Delphi'],
    80: ['Prolog', 'Erlang', 'Elixir', 'Clojure', 'F#|F sharp', 'OCaml', 'Groovy', 'Smalltalk', 'Ada', 'Logo', 'Racket', 'Scheme', 'Zig', 'Solidity', 'ABAP', 'APL'],
    100: ['Forth', 'Brainfuck', 'Nim', 'Crystal', 'LOLCODE', 'Malbolge', 'Whitespace', 'Befunge', 'Piet'],
  }, `Lenguajes de programación. HTML y CSS NO están (son de marcado/estilos, no de programación): si quieres que cuenten, agrégalos en nivel 30. ${NIVELES}`),

  q('redes-sociales', 'Cultura general', 'Nombra una red social.', {
    10: ['Facebook|Face', 'Instagram|Insta|IG', 'TikTok|Tik Tok', 'Twitter|X|X (Twitter)', 'WhatsApp|Whatsapp|WhatApp', 'YouTube|Youtube'],
    30: ['Snapchat|Snap', 'LinkedIn|Linkedin', 'Pinterest', 'Reddit', 'Telegram', 'Discord', 'Twitch', 'Threads', 'Messenger'],
    60: ['Tumblr', 'BeReal|Be Real', 'Bluesky|Blue sky', 'Mastodon', 'Vine', 'MySpace|My Space', 'Hi5', 'Skype', 'Flickr', 'Quora', 'WeChat|Wechat', 'Line', 'Kik', 'Signal', 'Clubhouse'],
    80: ['Orkut', 'Google+|Google Plus', 'Friendster', 'Periscope', 'Fotolog', 'Taringa', 'Badoo', 'VK|VKontakte', 'Weibo', 'Douyin', 'Gab', 'Truth Social', 'MeWe', 'Nextdoor', 'Foursquare', 'Digg'],
    100: ['Meerkat', 'Path', 'Ello', 'Delicious', 'Koo', 'Parler', 'Peach', 'Yik Yak'],
  }, `Redes sociales y apps de mensajería muy usadas (WhatsApp, Telegram, Messenger cuentan). ${NIVELES}`),

  q('marcas-de-carros', 'Cultura general', 'Nombra una marca de carros.', {
    10: ['Toyota', 'Ford', 'Chevrolet|Chevy', 'Honda', 'BMW', 'Mercedes-Benz|Mercedes|Mercedes Benz', 'Nissan', 'Volkswagen|VW', 'Ferrari', 'Lamborghini', 'Tesla', 'Audi'],
    30: ['Hyundai', 'Kia', 'Mazda', 'Suzuki', 'Mitsubishi', 'Subaru', 'Porsche', 'Jeep', 'Dodge', 'Fiat', 'Renault', 'Peugeot', 'Citroën|Citroen', 'Volvo', 'Land Rover', 'Jaguar', 'Bugatti', 'Maserati', 'Rolls-Royce|Rolls Royce', 'Bentley', 'Aston Martin', 'McLaren', 'Lexus', 'Isuzu', 'Chrysler', 'Cadillac', 'Buick', 'GMC', 'Ram', 'Mini'],
    60: ['Seat|SEAT', 'Skoda|Škoda', 'Opel', 'Alfa Romeo', 'Lancia', 'Infiniti', 'Acura', 'Genesis', 'Lincoln', 'Pontiac', 'Hummer', 'Daewoo', 'SsangYong|Ssangyong', 'Dacia', 'Smart', 'Saab', 'Lotus', 'BYD', 'Chery', 'Geely', 'MG', 'Great Wall|Haval', 'JAC', 'Tata', 'Mahindra', 'Rivian', 'Lucid', 'Polestar', 'Koenigsegg', 'Pagani', 'Datsun', 'Daihatsu', 'Mercury', 'Oldsmobile', 'Plymouth'],
    80: ['Maruti', 'Proton', 'Perodua', 'DeLorean', 'Hispano-Suiza|Hispano Suiza', 'Ariel', 'Morgan', 'Alpine', 'Lada', 'Moskvich|Moskvitch', 'UAZ', 'Trabant', 'Wartburg', 'Yugo', 'Zastava', 'Fisker', 'Saleen'],
    100: ['Spyker', 'Noble', 'Caterham', 'TVR', 'Tatra', 'Studebaker', 'Packard', 'Duesenberg', 'Tucker'],
  }, `Marcas de automóviles (incluye marcas desaparecidas). No son modelos. ${NIVELES}`),

  q('marcas-ropa-deportiva', 'Cultura general', 'Nombra una marca de ropa deportiva.', {
    10: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok'],
    30: ['New Balance', 'Fila', 'Umbro', 'Asics', 'Converse', 'Champion', 'Lotto', 'Mizuno', 'Skechers', 'Kappa', 'Vans', 'Hummel', 'Joma', 'Diadora'],
    60: ['Le Coq Sportif', 'Lululemon', 'Gymshark', 'Saucony', 'Brooks', 'Hoka|Hoka One One', 'On|On Running', 'Columbia', 'The North Face|North Face', 'Patagonia', 'Salomon', 'Merrell', 'Quiksilver', 'Billabong', 'Oakley', 'Everlast', 'Speedo', 'Arena', 'Ellesse', 'Sergio Tacchini', 'Fabletics', 'Athleta'],
    80: ['Mitre', 'Admiral', 'Lonsdale', 'Macron', 'Errea|Erreà', 'Uhlsport', 'Warrior', 'Bauer'],
    100: ['Kelme', 'Patrick', 'Hi-Tec|Hi Tec', 'Karhu', 'Inov-8|Inov 8', 'Topper', 'Penalty', 'Olympikus', 'Kipsta'],
  }, `Marcas de ropa y calzado deportivo. ${NIVELES}`),

  q('marcas-celulares', 'Cultura general', 'Nombra una marca de celulares.', {
    10: ['Apple|iPhone', 'Samsung|Galaxy', 'Xiaomi', 'Huawei', 'Motorola|Moto'],
    30: ['Nokia', 'Sony|Xperia', 'LG', 'Oppo', 'Vivo', 'Realme', 'OnePlus|One Plus', 'Google Pixel|Pixel|Google', 'Honor', 'ZTE', 'Tecno', 'Infinix', 'Alcatel', 'BlackBerry|Blackberry', 'HTC', 'Lenovo', 'Asus'],
    60: ['Nothing|Nothing Phone', 'Fairphone', 'Meizu', 'Sharp', 'Panasonic', 'Sagem', 'Siemens', 'Ericsson|Sony Ericsson', 'Palm', 'Kyocera', 'Micromax', 'Itel', 'Poco', 'Redmi', 'Doogee', 'Ulefone', 'Blackview', 'Gionee', 'Coolpad', 'TCL', 'Wiko', 'BQ'],
    80: ['Lava', 'Cat|Caterpillar', 'Lanix', 'Azumi', 'Archos', 'Razer', 'Essential'],
    100: ['Vertu', 'Nuu', 'Yotaphone|Yota', 'Light Phone'],
  }, `Marcas de teléfonos celulares (iPhone cuenta como Apple, Galaxy como Samsung). ${NIVELES}`),
]
