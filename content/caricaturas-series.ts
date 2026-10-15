import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada personaje; hay que calibrarlos con partidas reales (el registro de respuestas del admin ayuda). Se aceptan nombres en español (doblaje latino) e inglés; los nombres en español de los personajes menos conocidos los puse de memoria.'

export default [
  q('bob-esponja-personajes', 'Cine y series', 'Nombra un personaje de Bob Esponja.', {
    10: ['Bob Esponja|SpongeBob|SpongeBob SquarePants|Bob', 'Patricio Estrella|Patricio|Patrick|Patrick Star', 'Calamardo Tentáculos|Calamardo|Squidward|Squidward Tentacles', 'Don Cangrejo|Cangrejo|Mr. Krabs|Eugene Krabs|Señor Cangrejo', 'Plankton|Sheldon Plankton', 'Arenita Mejillas|Arenita|Sandy|Sandy Cheeks', 'Gary|Gary el caracol|Gary the Snail'],
    30: ['Perlita Cangrejo|Perlita|Pearl|Pearl Krabs', 'Larry la Langosta|Larry|Larry the Lobster', 'Karen|Karen Plankton', 'Hombre Sirena|Mermaid Man', 'Chico Percebe|Barnacle Boy', 'El Holandés Errante|Holandés Errante|Flying Dutchman', 'Señora Puff|Sra. Puff|Mrs. Puff', 'Rey Neptuno|King Neptune|Neptuno'],
    60: ['Burbuja Bass|Bubble Bass', 'Squilliam Fancyson|Squilliam', 'Fred', 'DoodleBob|Doodle Bob', 'Hombre Raya|Man Ray', 'Burbuja sucia|Dirty Bubble', 'Patchy el Pirata|Patchy the Pirate|Patchy', 'Kevin el pepino de mar|Kevin C. Cucumber|Kevin', 'Flats el platija|Flats the Flounder|Flats', 'Amigo burbuja|Bubble Buddy', 'Harold Pantalones Cuadrados|Harold SquarePants|Harold', 'Margaret Pantalones Cuadrados|Margaret SquarePants|Margaret', 'Mamá Cangrejo|Mama Krabs', 'Princesa Mindy|Mindy|Princess Mindy', 'Viejo Jenkins|Old Man Jenkins'],
    80: ['Herb Estrella|Herb Star|Herb', 'Margie Estrella|Margie Star|Margie', 'Dennis', 'Scooter'],
    100: ['Realistic Fish Head|Cabeza de pescado realista', 'Nat Peterson|Nat'],
  }, `Personajes de la serie: el elenco principal y los recurrentes más conocidos. ${NIVELES}`),

  q('toy-story-personajes', 'Cine y series', 'Nombra un personaje de Toy Story.', {
    10: ['Woody', 'Buzz Lightyear|Buzz', 'Jessie', 'Rex', 'Slinky|Slinky Perro|Slinky Dog'],
    30: ['Bullseye|Bull\'s-eye', 'Hamm', 'Señor Cara de Papa|Mr. Potato Head|Sr. Cara de Papa|Cara de Papa', 'Señora Cara de Papa|Mrs. Potato Head|Sra. Cara de Papa', 'Bo Peep|Betty|Bo', 'Andy', 'Sid', 'Lotso|Lotso el oso|Lots-o\'-Huggin\' Bear', 'Forky', 'Zurg|Emperador Zurg|Evil Emperor Zurg', 'Alienígenas|Aliens|Marcianos|Extraterrestres|Los alienígenas'],
    60: ['Duke Caboom|Caboom', 'Gabby Gabby|Gabby', 'Ducky', 'Bunny|Conejito', 'Stinky Pete|Pete el buscador|Pete', 'Wheezy', 'Trixie', 'Buttercup', 'Señor Pricklepants|Mr. Pricklepants|Pricklepants', 'Chunk', 'Big Baby|Bebote', 'Ken', 'Barbie', 'Bonnie', 'Dolly'],
    80: ['Al|Al McWhiggin', 'Combat Carl|Carl', 'Scud', 'Buster', 'Lenny', 'Etch', 'Señor Spell|Mr. Spell', 'Giggle McDimples|Giggle', 'Sargento|Sarge|Sergeant', 'RC'],
    100: ['Stretch|Estirado', 'Chuckles|Chuckles el payaso', 'Peas-in-a-Pod|Tres chícharos', 'Señor Tortilla|Mr. Tortilla Head'],
  }, `Personajes de las cuatro películas (y alguno de los cortos). Los nombres en español del doblaje latino de los menos conocidos los puse de memoria. ${NIVELES}`),

  q('hora-de-aventura-personajes', 'Cine y series', 'Nombra un personaje de Hora de Aventura.', {
    10: ['Finn el humano|Finn|Finn Mertens', 'Jake el perro|Jake', 'Rey Helado|Ice King|El Rey Helado', 'Dulce Princesa|Princesa Chicle|Princess Bubblegum|Bonnibel Bubblegum|Bonnibel', 'Marceline|Marceline la reina vampiro|Marceline the Vampire Queen', 'BMO|Beemo'],
    30: ['Princesa Flama|Flame Princess', 'Lady Arcoíris|Lady Rainicorn|Lady Rainicorn', 'Princesa Grumosa|Lumpy Space Princess|LSP', 'Gunter', 'Tronquitos|Tree Trunks', 'Simon Petrikov|Simon', 'Lemongrab|Limonagrio|El Conde de Limonagrio', 'Fionna', 'Cake|Pastelito'],
    60: ['Panecillo de canela|Cinnamon Bun|Cinnamon Bun', 'Betty', 'Hunson Abadeer|Hunson', 'Prismo', 'El Lich|Lich|The Lich', 'Hombre Mágico|Magic Man', 'Mayordomo Menta|Peppermint Butler', 'Marshall Lee', 'Fern', 'Neptr', 'Susan Strong', 'Billy'],
    80: ['Ganso elegido|Choose Goose', 'Guardia banana|Banana Guard', 'Shelby', 'Martin Mertens|Martin', 'Joshua', 'Margaret', 'Tiffany', 'Jermaine'],
    100: ['Ricardio|Ricardio el corazón', 'Búho cósmico|Cosmic Owl', 'Princesa Baya Salvaje|Wildberry Princess', 'Princesa Hot Dog|Hot Dog Princess', 'Princesa Baba|Slime Princess'],
  }, `Personajes de la serie original (2010-2018). Los nombres en español son los del doblaje latino que recuerdo; revisar. ${NIVELES}`),

  q('gumball-personajes', 'Cine y series', 'Nombra un personaje de El Increíble Mundo de Gumball.', {
    10: ['Gumball Watterson|Gumball', 'Darwin Watterson|Darwin', 'Anais Watterson|Anais|Anaís', 'Nicole Watterson|Nicole', 'Richard Watterson|Richard'],
    30: ['Penny Fitzgerald|Penny', 'Tobias Wilson|Tobias', 'Carrie Krueger|Carrie', 'Banana Joe|Joe', 'Masami Yoshida|Masami', 'Teri', 'Sussie', 'Señor Small|Mr. Small|Sr. Small', 'Señorita Simian|Miss Simian|Srta. Simian', 'Director Brown|Principal Brown', 'Señor Robinson|Mr. Robinson|Sr. Robinson', 'Rocky Robinson|Rocky', 'Bobert'],
    60: ['Leslie', 'Alan Keane|Alan', 'Clayton', 'Tina Rex|Tina', 'Hector', 'Larry Needlemeyer|Larry', 'Harold Wilson|Harold', 'Abuela Jojo|Grandma Jojo|Jojo', 'Molly Collins|Molly', 'Jamie', 'Mr. Fitzgerald|Señor Fitzgerald'],
    80: ['Juke', 'Idaho', 'Sarah G. Lato|Sarah'],
    100: ['Banana Barbara|Barbara', 'Sal Left Thumb|Sal'],
  }, `Personajes de la serie de Cartoon Network. Los de nivel 100 son de memoria: revisar. ${NIVELES}`),

  q('friends-personajes', 'Cine y series', 'Nombra un personaje de Friends.', {
    10: ['Rachel Green|Rachel', 'Ross Geller|Ross', 'Monica Geller|Monica|Mónica', 'Chandler Bing|Chandler', 'Joey Tribbiani|Joey', 'Phoebe Buffay|Phoebe|Phoebs'],
    30: ['Gunther', 'Janice|Janice Litman', 'Mike Hannigan|Mike', 'Richard Burke|Richard', 'Emily Waltham|Emily', 'Carol Willick|Carol', 'Susan Bunch|Susan', 'Ben Geller|Ben', 'Emma Geller-Green|Emma'],
    60: ['Señor Heckles|Mr. Heckles|Heckles', 'Ursula Buffay|Ursula', 'Estelle Leonard|Estelle', 'Jack Geller|Jack', 'Judy Geller|Judy', 'Charlie Wheeler|Charlie', 'Pete Becker|Pete', 'Paolo', 'Marcel'],
    80: ['Tag Jones|Tag', 'Kathy', 'Mona', 'David', 'Janine Lecroix|Janine', 'Eddie Menuek|Eddie', 'Joshua Burgin|Joshua', 'Frank Buffay Jr.|Frank Jr.|Frank Buffay'],
    100: ['Chico desnudo feo|Ugly Naked Guy', 'Hugsy', 'Pato y Pollito|Chick and Duck|Chick|Duck', 'Gavin Mitchell|Gavin'],
  }, `Personajes de la serie (seis protagonistas, familiares, parejas y recurrentes). ${NIVELES}`),

  q('breaking-bad-personajes', 'Cine y series', 'Nombra un personaje de Breaking Bad.', {
    10: ['Walter White|Walt|Heisenberg|Walter', 'Jesse Pinkman|Jesse', 'Skyler White|Skyler', 'Hank Schrader|Hank', 'Saul Goodman|Saul|Jimmy McGill'],
    30: ['Gus Fring|Gustavo Fring|Gus|Gustavo', 'Walter White Jr.|Flynn|Walt Jr.|Walter Jr.', 'Marie Schrader|Marie', 'Mike Ehrmantraut|Mike', 'Tuco Salamanca|Tuco', 'Todd Alquist|Todd', 'Lydia Rodarte-Quayle|Lydia', 'Hector Salamanca|Héctor Salamanca|Tío Héctor'],
    60: ['Gale Boetticher|Gale', 'Krazy-8|Krazy 8', 'Jane Margolis|Jane', 'Gretchen Schwartz|Gretchen', 'Elliott Schwartz|Elliott', 'Don Eladio|Eladio Vuente|Eladio', 'Jack Welker|Tío Jack|Uncle Jack|Jack', 'Brock Cantillo|Brock', 'Andrea Cantillo|Andrea'],
    80: ['Badger', 'Skinny Pete', 'Combo', 'Steve Gomez|Gomez', 'Huell Babineaux|Huell', 'Ted Beneke|Ted', 'Los Primos|Leonel y Marco Salamanca|Primos Salamanca|Leonel Salamanca|Marco Salamanca'],
    100: ['Gonzo', 'Emilio Koyama|Emilio', 'Spooge', 'Tyrus Kitt|Tyrus', 'Víctor|Victor', 'Patrick Kuby|Kuby', 'Bogdan Wolynetz|Bogdan', 'Old Joe|Viejo Joe', 'Declan', 'Lawson'],
  }, `Personajes de la serie (incluye a los de El Camino y algunos de Better Call Saul que ya salían). "Heisenberg" cuenta como Walter White. ${NIVELES}`),

  q('stranger-things-personajes', 'Cine y series', 'Nombra un personaje de Stranger Things.', {
    10: ['Eleven|Once|Jane Hopper|El|Jane', 'Mike Wheeler|Mike', 'Dustin Henderson|Dustin', 'Lucas Sinclair|Lucas', 'Will Byers|Will', 'Max Mayfield|Max', 'Steve Harrington|Steve', 'Eddie Munson|Eddie', 'Vecna|Henry Creel|Uno|One'],
    30: ['Nancy Wheeler|Nancy', 'Jonathan Byers|Jonathan', 'Joyce Byers|Joyce', 'Jim Hopper|Hopper|Jim', 'Robin Buckley|Robin', 'Erica Sinclair|Erica', 'Billy Hargrove|Billy', 'Demogorgon|Demogorgón', 'Azotamentes|Mind Flayer|Devoramentes', 'Dart'],
    60: ['Murray Bauman|Murray', 'Barb Holland|Barb', 'Doctor Brenner|Papá|Martin Brenner|Dr. Brenner|Brenner', 'Bob Newby|Bob', 'Karen Wheeler|Karen', 'Ted Wheeler|Ted', 'Holly Wheeler|Holly', 'Doctor Owens|Dr. Owens|Owens', 'Kali|Ocho|Eight', 'Argyle', 'Suzie'],
    80: ['Yuri', 'Alexei', 'Jason Carver|Jason', 'Chrissy Cunningham|Chrissy', 'Grigori', 'Mr. Clarke|Señor Clarke|Scott Clarke', 'Lonnie Byers|Lonnie'],
    100: ['Tommy H.|Tommy', 'Troy', 'Carol', 'Dmitri Antonov|Dmitri|Enzo'],
  }, `Personajes de las cinco temporadas (la última cerró la serie a fines de 2025). Los de nivel 100 son de memoria: revisar. ${NIVELES}`),

  q('princesas-disney', 'Cine y series', 'Nombra una princesa de Disney.', {
    10: ['Cenicienta|Cinderella', 'Blancanieves|Snow White', 'Ariel|La Sirenita', 'Bella|Belle|Bella (La Bella y la Bestia)', 'Jazmín|Jasmine', 'Elsa', 'Rapunzel', 'Moana|Vaiana'],
    30: ['Aurora|La Bella Durmiente|Bella Durmiente|Sleeping Beauty', 'Mulán|Mulan', 'Pocahontas', 'Tiana', 'Anna|Ana', 'Mérida|Merida'],
    60: ['Raya', 'Vanellope|Vanellope von Schweetz', 'Atta|Princesa Atta'],
    80: ['Sofía|Sofía la Primera|Sofia the First', 'Elena de Ávalor|Elena of Avalor|Elena'],
    100: ['Kida|Kida Nedakh', 'Eilonwy|Princesa Eilonwy'],
  }, `Las 13 "oficiales" de la línea Disney Princess (Blancanieves, Cenicienta, Aurora, Ariel, Bella, Jazmín, Pocahontas, Mulán, Tiana, Rapunzel, Mérida, Moana, Raya) más Elsa y Anna (que no son oficiales pero casi todos las dicen) y otras princesas de películas y series. Decisión tuya si quieres dejar solo las oficiales. ${NIVELES}`),
]
