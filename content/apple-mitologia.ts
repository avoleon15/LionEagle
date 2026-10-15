import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales (el registro de respuestas del admin ayuda). Se aceptan nombres en español e inglés.'

export default [
  q('apps-de-apple', 'Cultura general', 'Nombra una app de Apple (de las que vienen con el iPhone o el Mac).', {
    10: ['Safari', 'FaceTime|Face Time', 'Mensajes|iMessage|Messages', 'Fotos|Photos', 'Cámara|Camara|Camera', 'Mapas|Maps|Apple Maps', 'Música|Musica|Music|Apple Music', 'Notas|Notes', 'Calculadora|Calculator', 'Reloj|Clock', 'App Store', 'Salud|Health', 'Mail|Correo'],
    30: ['Calendario|Calendar', 'Recordatorios|Reminders', 'Contactos|Contacts', 'Cartera|Wallet|Apple Wallet', 'Podcasts|Apple Podcasts', 'Apple TV|TV', 'Libros|Books|Apple Books', 'Archivos|Files', 'Atajos|Shortcuts', 'Buscar|Find My|Encontrar', 'Casa|Home', 'Notas de voz|Grabadora de voz|Voice Memos', 'Medidas|Medida|Measure', 'Traducir|Translate', 'Tiempo|Clima|Weather', 'Bolsa|Stocks', 'Teléfono|Telefono|Phone', 'Brújula|Brujula|Compass', 'Pages', 'Numbers', 'Keynote', 'GarageBand|Garage Band', 'iMovie', 'Fitness|Apple Fitness', 'Clips', 'Final Cut Pro|Final Cut', 'Logic Pro|Logic'],
    60: ['iTunes', 'Freeform', 'Contraseñas|Contrasenas|Passwords', 'Diario|Journal', 'Vista previa|Preview', 'Terminal', 'Xcode', 'Finder', 'TestFlight', 'Watch|Apple Watch', 'Apple Sports', 'Apple Invites|Invites', 'Apple Store|Apple Store app', 'Apple Music Classical|Music Classical', 'Time Machine', 'Diccionario|Dictionary', 'Captura de pantalla|Screenshot', 'Utilidad de Discos|Disk Utility', 'Monitor de Actividad|Activity Monitor', 'Automator', 'Boot Camp|Boot Camp Assistant'],
    80: ['Image Playground', 'Swift Playgrounds', 'Apple Configurator|Configurator', 'Image Capture|Captura de imagen', 'Digital Color Meter|Medidor de color digital', 'ColorSync Utility|Utilidad ColorSync', 'Grapher', 'Keychain Access|Acceso a Llaveros|Llavero', 'Console|Consola', 'Script Editor|Editor de Scripts'],
    100: ['Directory Utility|Utilidad de Directorio', 'System Information|Información del Sistema|Informacion del sistema', 'AirPort Utility|Utilidad AirPort', 'Audio MIDI Setup|Configuración de Audio MIDI', 'Bluetooth File Exchange|Intercambio de archivos Bluetooth', 'Migration Assistant|Asistente de migración', 'Feedback Assistant|Asistente de opiniones', 'Voiceover Utility|Utilidad VoiceOver'],
  }, `Apps y utilidades de Apple (iPhone, iPad, Mac y Watch). Las de nivel 80 y 100 son utilidades del Mac que casi nadie nombra: de memoria, conviene que alguien de Apple las revise. Apps de otras empresas (WhatsApp, Instagram) NO cuentan. Si prefieres solo las del iPhone, quita las de Mac. ${NIVELES}`),

  q('dioses-griegos', 'Cultura general', 'Nombra un dios o diosa de la mitología griega.', {
    10: ['Zeus', 'Poseidón|Poseidon', 'Hades', 'Atenea|Athena|Atenas', 'Apolo|Apollo', 'Afrodita|Aphrodite', 'Ares', 'Hermes'],
    30: ['Hera', 'Artemisa|Artemis', 'Deméter|Demeter', 'Hefesto|Hephaestus|Hefestos', 'Dioniso|Dionysus|Dionisio', 'Perséfone|Persefone|Persephone', 'Eros', 'Hestia', 'Pan', 'Hécate|Hecate'],
    60: ['Cronos|Cronos|Kronos|Cronus', 'Gaia|Gea|Gaea', 'Urano|Uranus', 'Helios', 'Selene', 'Eos', 'Niké|Nike', 'Tánatos|Tanatos|Thanatos', 'Hipnos|Hypnos', 'Morfeo|Morpheus', 'Némesis|Nemesis', 'Eris|Éris', 'Iris', 'Hebe', 'Asclepio|Esculapio|Asclepius', 'Prometeo|Prometheus', 'Atlas', 'Rea|Rhea', 'Océano|Oceano|Oceanus', 'Tetis|Tethys', 'Hiperión|Hiperion|Hyperion', 'Jápeto|Japeto|Iapetus', 'Epimeteo|Epimetheus', 'Temis|Themis', 'Mnemósine|Mnemosine|Mnemosyne', 'Nix|Nyx'],
    80: ['Febe|Phoebe', 'Crío|Crio|Crius', 'Ceo|Coeus', 'Tique|Tyche|Tiqué', 'Himeneo|Hymenaios', 'Bóreas|Boreas', 'Eolo|Aeolus', 'Tritón|Triton', 'Proteo|Proteus', 'Nereo|Nereus', 'Anfitrite|Amphitrite', 'Higía|Higia|Hygieia', 'Panacea', 'Zéfiro|Zefiro|Zephyrus', 'Noto|Notus'],
    100: ['Érebo|Erebo|Erebus', 'Éter|Eter|Aether', 'Caos|Chaos', 'Ánemoi|Anemoi', 'Ate|Atē', 'Bia', 'Cratos|Kratos|Cratos', 'Zelo|Zelus', 'Fobos|Phobos', 'Deimos', 'Momo|Momus'],
  }, `Dioses olímpicos, titanes y dioses primordiales o menores de la mitología griega. Se aceptan nombres en español e inglés. ${NIVELES}`),

  q('dioses-romanos', 'Cultura general', 'Nombra un dios o diosa de la mitología romana.', {
    10: ['Júpiter|Jupiter|Jove', 'Neptuno|Neptune', 'Plutón|Pluton|Pluto', 'Minerva', 'Venus', 'Marte|Mars', 'Mercurio|Mercury', 'Juno', 'Apolo|Apollo'],
    30: ['Diana', 'Ceres', 'Vulcano|Vulcan', 'Baco|Bacchus', 'Proserpina', 'Vesta', 'Cupido|Cupid', 'Saturno|Saturn', 'Jano|Janus', 'Aurora'],
    60: ['Fauno|Faunus', 'Victoria', 'Flora', 'Pomona', 'Fortuna', 'Belona|Bellona', 'Quirino|Quirinus', 'Término|Termino|Terminus', 'Silvano|Silvanus', 'Tellus|Terra|Tierra', 'Sol', 'Luna', 'Discordia', 'Somnus|Sueño|Sueno', 'Concordia', 'Ops', 'Orco|Orcus', 'Pax|Paz'],
    80: ['Esculapio|Aesculapius', 'Cibeles|Cybele', 'Hércules|Hercules', 'Juventas', 'Salus', 'Pietas', 'Virtus'],
    100: ['Vertumno|Vertumnus', 'Pales', 'Carmenta', 'Libitina', 'Cardea'],
  }, `Dioses y diosas romanos (muchos son equivalentes de los griegos: Zeus = Júpiter, Atenea = Minerva...). Los nombres griegos NO cuentan en esta pregunta: si alguien dice "Zeus" aquí es inválido a propósito. ${NIVELES}`),

  q('dioses-nordicos', 'Cultura general', 'Nombra un dios o diosa de la mitología nórdica.', {
    10: ['Odín|Odin|Wotan', 'Thor|Tor', 'Loki'],
    30: ['Freya|Freyja', 'Frigg|Frigga|Frig', 'Baldur|Balder|Baldr', 'Tyr|Tiw', 'Heimdall', 'Hel', 'Freyr|Frey', 'Sif'],
    60: ['Njord|Njörd|Njordr', 'Idunn|Iðunn|Idun', 'Bragi', 'Skadi|Skaði', 'Vidar|Víðarr', 'Ullr|Ull', 'Forseti', 'Mimir|Mímir', 'Aegir|Ægir', 'Sigyn', 'Magni', 'Modi|Móði', 'Hermod|Hermóðr', 'Hoenir|Hœnir', 'Kvasir', 'Nanna'],
    80: ['Eir', 'Ran|Rán', 'Mani|Máni', 'Sol|Sól', 'Nott|Nótt', 'Dag|Dagr', 'Fulla', 'Gefjon|Gefion', 'Vali|Váli', 'Hod|Höðr|Hodr', 'Thrud|Þrúðr'],
    100: ['Lofn', 'Syn', 'Snotra', 'Sjofn|Sjöfn', 'Vor|Vör', 'Var|Vár', 'Hlin|Hlín', 'Gna|Gná', 'Saga|Sága'],
  }, `Dioses de los Aesir y los Vanir. Se escriben con letras ASCII (Odin, Njord, Aegir...) y se aceptan las versiones con letras especiales. Fenrir, Jörmungandr y Sleipnir NO son dioses (son criaturas): inválidos a propósito. ${NIVELES}`),
]
