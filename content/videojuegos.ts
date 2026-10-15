import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales.'

export default [
  q('fortnite-c1-lugares', 'Videojuegos', 'Nombra un lugar de Fortnite del Capítulo 1.', {
    10: ['Tilted Towers|Tilted', 'Pleasant Park', 'Retail Row'],
    30: ['Salty Springs', 'Dusty Depot|Dusty Divot', 'Loot Lake', 'Lonely Lodge', 'Greasy Grove', 'Tomato Town|Tomato Temple'],
    60: ['Anarchy Acres', 'Flush Factory', 'Wailing Woods', 'Fatal Fields', 'Junk Junction', 'Shifty Shafts', 'Haunted Hills', 'Snobby Shores', 'Lucky Landing', 'Moisty Mire', 'Paradise Palms'],
    80: ['Lazy Links', 'Lazy Lagoon', 'Risky Reels', 'Happy Hamlet', 'Frosty Flights', 'Polar Peak', 'Viking Village', 'Pressure Plant', 'The Block|El Bloque'],
    100: ['Sunny Steps'],
  }, `Lugares con nombre del mapa del Capítulo 1 (temporadas 1 a 10), en inglés tal como salen en el juego. Dusty Depot y Dusty Divot cuentan como el mismo lugar. Es de memoria + una búsqueda parcial: conviene que alguien que juegue Fortnite lo revise. ${NIVELES}`),

  q('r6-mapas', 'Videojuegos', 'Nombra un mapa de Rainbow Six Siege.', {
    10: ['Bank|Banco', 'Clubhouse|Club House', 'Consulate|Consulado', 'Oregon', 'Kafe Dostoyevsky|Kafe', 'Chalet'],
    30: ['Border|Frontera', 'Skyscraper|Rascacielos', 'Coastline|Costa', 'Villa', 'Theme Park|Parque de diversiones', 'Hereford Base|Hereford', 'House|Casa', 'Yacht|Yate', 'Kanal|Canal', 'Favela'],
    60: ['Plane|Presidential Plane|Avión', 'Fortress', 'Outback', 'Emerald Plains', 'Nighthaven Labs|Laboratorios Nighthaven', 'Lair|Guarida', 'Tower|Torre'],
    80: ['Stadium Bravo|Estadio', 'Close Quarter', 'Calypso Casino|Casino'],
    100: ['Bartlett University|Bartlett', 'District'],
  }, `Mapas jugables de Siege (originales, remodelados y de temporadas recientes). Contrastada con la lista de Wikipedia (Calypso Casino y District solo salen en algunos modos; Close Quarter es solo de Deathmatch); Yacht y Bartlett son de memoria. Ubisoft rota los mapas cada temporada: revisar con alguien que juegue. ${NIVELES}`),

  q('cod-zombies-mapas', 'Videojuegos', 'Nombra un mapa de Zombies de Call of Duty.', {
    10: ['Nacht der Untoten|Nacht', 'Kino der Toten|Kino', 'Der Riese|Riese', 'Origins', 'Mob of the Dead|Mob', 'Shi No Numa|Numa'],
    30: ['Verrückt|Verruckt', 'Ascension', 'Moon|Luna', 'Shangri-La|Shangri La', 'Buried', 'Die Rise', 'TranZit|Transit', 'Nuketown Zombies|Nuketown', 'Der Eisendrache', 'Shadows of Evil', 'The Giant|El Gigante', 'Call of the Dead', 'Revelations'],
    60: ['Five', 'Gorod Krovi', 'Zetsubou No Shima', 'Dead Ops Arcade', 'Voyage of Despair', 'IX', 'Blood of the Dead', 'Classified', 'Alpha Omega', 'Tag der Toten', 'Die Maschine', 'Firebase Z', 'Mauer der Toten', 'Liberty Falls', 'Terminus', 'Citadelle des Morts', 'The Tomb|La Tumba', 'Ashes of the Damned', 'Zombies in Spaceland|Spaceland', 'Rave in the Redwoods', 'The Final Reich'],
    80: ['Ancient Evil', 'Forsaken', 'Der Anfang', 'Shaolin Shuffle', 'Attack of the Radioactive Thing', 'Beast from the Beyond', 'The Darkest Shore', 'The Shadowed Throne', 'Dead of the Night', 'Terra Maledicta', 'The Archon|Archon', 'Shattered Veil', 'The Reckoning|Reckoning', 'Astra Malorum', 'Paradox Junction', 'Totenreich', 'Kowakujō|Kowakujo', 'Rex Infernus'],
    100: ['Groesten Haus', 'Town|Pueblo', 'Farm|Granja', 'Bus Depot', 'Dead Ops Arcade 2'],
  }, `Mapas de Zombies de World at War a Black Ops 7, con los nombres oficiales (muchos en alemán). Contrastada con Wikipedia (WaW a Black Ops 7); los de Advanced Warfare, Infinite Warfare y WWII son de memoria. Puede faltar alguno de temporadas recientes. Se aceptan versiones sin tilde ni diéresis. ${NIVELES}`),

  q('gta5-carros', 'Videojuegos', 'Nombra un carro de GTA V.', {
    10: ['Adder', 'Zentorno', 'T20', 'Sultan', 'Banshee', 'Infernus'],
    30: ['Turismo R', 'Entity XF', 'Osiris', 'Cheetah', 'Vacca', 'Bullet', 'Comet', 'Elegy RH8|Elegy', 'Buffalo', 'Dominator', 'Gauntlet', 'Kuruma', 'Jester', 'Coquette', 'Faction', 'Futo', 'Sentinel', 'Schafter', 'Baller', 'Taxi', 'Police Cruiser|Patrulla|Policía'],
    60: ['Carbonizzare', 'Massacro', 'Tornado', 'Stallion', 'Blista', 'Granger', 'Patriot', 'Dubsta', 'Bifta', 'Dune Buggy|Buggy', 'Insurgent', 'Sandking', 'Rebel', 'Bison', 'Rumpo', 'Burrito', 'Speedo', 'Surfer', 'Phoenix', 'Ruiner', 'Sabre Turbo', 'Tampa', 'Vigero', 'Voodoo', 'Peyote', 'Hotknife', 'Chino', 'Manana', 'Picador', 'Dukes', 'Buccaneer', 'Blade', 'Rapid GT', 'Feltzer', 'Surano', 'Schwartzer', 'Penumbra', 'Fugitive', 'Premier', 'Mamba', 'Stinger', 'Z-Type|Z Type', 'Monster|Monster Truck'],
    80: ['Asea', 'Ingot', 'Intruder', 'Primo', 'Stanier', 'Washington', 'Emperor', 'Regina', 'Stratum', 'Warrener', 'Zion', 'Exemplar', 'F620', 'Felon', 'Oracle', 'Jackal', 'Cognoscenti', 'Super Diamond', 'Fusilade', 'Alpha', 'Ninef|9F', 'Panto', 'Prairie', 'Dilettante', 'Rhapsody', 'Issi', 'Kamacho', 'Habanero', 'BJXL', 'Cavalcade', 'FQ 2|FQ2', 'Gresley', 'Huntley S|Huntley', 'Landstalker', 'Mesa', 'Radius', 'Rocoto', 'Seminole', 'Serrano', 'Sadler', 'Youga', 'Bobcat', 'Minivan', 'Rancher XL|Rancher', 'Kalahari', 'Duke O\'Death|Duke of Death', 'Hustler', 'Nightshade', 'Stinger GT', 'Casco', 'Pigalle', 'Monroe', 'Coquette Classic', 'JB 700|JB700', 'Btype|B-Type', 'Tornado Rat Rod|Rat Rod'],
    100: ['Brioso R/A|Brioso', 'Ruiner 2000', 'Stirling GT', 'Peyote Gasser', 'Fagaloa', 'Hermes', 'Savestra', 'Retinue', 'Michelli GT', 'Viseris', 'Swinger'],
  }, `Autos de GTA V (historia y GTA Online). No incluí motos, helicópteros, tanques ni aviones: la pregunta dice "carro". Hay unos 700 vehículos en el juego, esta lista cubre los más conocidos; los de nivel 100 son de DLC de GTA Online y los armé de memoria. Revisar con alguien que juegue. ${NIVELES}`),

  q('mario-juegos', 'Videojuegos', 'Nombra un juego de Mario.', {
    10: ['Super Mario Bros|Super Mario Bros.|Mario Bros', 'Mario Kart', 'Super Mario 64', 'Super Mario Odyssey|Odyssey'],
    30: ['Super Mario World', 'Mario Party', 'Super Mario Galaxy|Galaxy', 'New Super Mario Bros|New Super Mario Bros.', 'Super Mario Bros 3|Super Mario Bros. 3', 'Mario Kart 8|Mario Kart 8 Deluxe', 'Paper Mario', 'Mario Tennis', 'Super Mario Bros Wonder|Super Mario Bros. Wonder|Wonder', 'Mario Kart Wii'],
    60: ['Super Mario Sunshine|Sunshine', 'Super Mario 3D World', 'Mario Golf', 'Mario Strikers|Super Mario Strikers', 'Mario & Luigi|Mario y Luigi', 'Dr. Mario|Dr Mario', 'Mario Paint', 'Super Mario Land', 'Super Mario Maker|Mario Maker', 'Super Mario Run', 'Super Mario Bros 2|Super Mario Bros. 2', 'Mario Kart 64', 'Super Mario Kart', 'Mario Kart World', 'Mario & Sonic en los Juegos Olímpicos|Mario & Sonic|Mario y Sonic', 'Super Mario Galaxy 2', 'Super Mario All-Stars|Super Mario All Stars', 'New Super Mario Bros. Wii|New Super Mario Bros Wii', 'Super Paper Mario'],
    80: ['Super Mario 3D Land', 'Mario vs. Donkey Kong|Mario vs Donkey Kong', 'Mario Bros. (1983)|Mario Bros arcade', 'Mario Party Superstars', 'Super Mario Party', 'Mario Party Jamboree', 'Mario & Luigi: Brothership|Brothership', 'Super Mario RPG', 'Mario Power Tennis', 'Mario Superstar Baseball|Mario Baseball', 'Mario Hoops 3 on 3|Mario Hoops', 'Mario Sports Mix', 'Mario Tennis Aces', 'Mario Golf: Super Rush|Mario Golf Super Rush', 'Paper Mario: La puerta milenaria|Paper Mario The Thousand-Year Door', 'Super Mario 3D All-Stars', 'Super Mario Bros. U Deluxe|New Super Mario Bros. U'],
    100: ['Super Mario Land 2|Super Mario Land 2: 6 Golden Coins', 'Super Mario Bros.: The Lost Levels|Lost Levels', 'Mario Is Missing|Mario Is Missing!', 'Mario\'s Time Machine', 'Mario Teaches Typing', 'Mario Clash', 'Mario Pinball Land', 'Yoshi\'s Island|Super Mario World 2: Yoshi\'s Island'],
  }, `Juegos principales y derivados donde Mario es protagonista (no incluí los de Luigi, Wario ni Yoshi solos, excepto Yoshi's Island que sale en el nombre de la saga). Hay muchísimos; esta lista es amplia pero no completa. ${NIVELES}`),

  q('zelda-juegos', 'Videojuegos', 'Nombra un juego de The Legend of Zelda.', {
    10: ['Breath of the Wild|Botw', 'Ocarina of Time|Ocarina', 'Tears of the Kingdom|Totk'],
    30: ['Majora\'s Mask|Majoras Mask', 'The Wind Waker|Wind Waker', 'Twilight Princess', 'Link\'s Awakening|Links Awakening', 'A Link to the Past|Link to the Past', 'The Legend of Zelda|Zelda|The Legend of Zelda 1|Zelda 1', 'Skyward Sword'],
    60: ['The Minish Cap|Minish Cap', 'Phantom Hourglass', 'Spirit Tracks', 'Zelda II: The Adventure of Link|Zelda II|Zelda 2|The Adventure of Link', 'A Link Between Worlds', 'Echoes of Wisdom', 'Hyrule Warriors'],
    80: ['Oracle of Ages', 'Oracle of Seasons', 'Four Swords', 'Age of Calamity|Hyrule Warriors: Age of Calamity', 'Hyrule Warriors: Definitive Edition'],
    100: ['Cadence of Hyrule', 'Tri Force Heroes', 'Four Swords Adventures', 'Link\'s Crossbow Training', 'Zelda: The Wand of Gamelon|The Wand of Gamelon', 'Link: The Faces of Evil|The Faces of Evil', 'Zelda\'s Adventure'],
  }, `Juegos principales y los derivados más conocidos de la saga. Nombres en inglés tal como se conocen. ${NIVELES}`),

  q('consolas', 'Videojuegos', 'Nombra una consola de videojuegos.', {
    10: ['PlayStation|PS|PS1|PS2|PS3|PS4|PS5|PlayStation 2|PlayStation 3|PlayStation 4|PlayStation 5|Play Station', 'Xbox|Xbox 360|Xbox One|Xbox Series X|Xbox Series S|Series X', 'Nintendo Switch|Switch', 'Wii|Nintendo Wii'],
    30: ['Game Boy|Gameboy|Game Boy Advance|Game Boy Color', 'Nintendo 64|N64', 'Super Nintendo|SNES|Super Nes', 'NES|Nintendo|Nintendo Entertainment System|Family|Family Game', 'GameCube|Game Cube', 'Nintendo DS|DS|Nintendo 3DS|3DS', 'PSP|PlayStation Portable', 'Sega Genesis|Mega Drive|Sega|Genesis', 'Atari|Atari 2600'],
    60: ['Dreamcast|Sega Dreamcast', 'Sega Saturn|Saturn', 'Game Gear', 'PS Vita|PlayStation Vita|Vita', 'Wii U', 'Neo Geo', 'Master System|Sega Master System', 'Steam Deck', 'Nintendo Switch 2|Switch 2'],
    80: ['Atari Jaguar|Jaguar', 'TurboGrafx-16|TurboGrafx|PC Engine', '3DO', 'Virtual Boy', 'ColecoVision|Coleco', 'Intellivision', 'Magnavox Odyssey|Odyssey'],
    100: ['Atari Lynx|Lynx', 'WonderSwan', 'Neo Geo Pocket', 'Sega CD|Mega CD', 'Sega 32X|32X', 'Philips CD-i|CD-i', 'Ouya', 'Gizmondo', 'N-Gage|Nokia N-Gage', 'Pippin|Apple Pippin'],
  }, `Se aceptan modelos como PS5 o Xbox 360 y cuentan como la consola base. ${NIVELES}`),
]
