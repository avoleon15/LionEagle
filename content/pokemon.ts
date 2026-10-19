import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada Pokémon (popularidad de la franquicia); hay que calibrarlos con partidas reales. Se aceptan los nombres sin tilde ni mayúsculas.'

export default [
  q('pokemon-gen1', 'Pokémon', 'Nombra un Pokémon de la primera generación.', {
    10: ['Pikachu', 'Charizard|Charizar|Charizad', 'Charmander|Charmandar', 'Bulbasaur|Bulbasur|Bulbasor|Bulbasaurio', 'Squirtle|Squirtel|Squirtl|Esquirtle', 'Mewtwo|Mew two|Mewtu|Mew 2', 'Eevee|Evee|Eeve|Ivi', 'Gengar|Genger'],
    30: ['Mew', 'Snorlax', 'Blastoise|Blastois', 'Venusaur|Venasaur|Venusaurio', 'Jigglypuff|Jiglypuff|Jigglipuff|Jiggly', 'Meowth|Meowt', 'Psyduck|Psiduck|Sayduck', 'Magikarp|Magicarp', 'Gyarados|Garados|Gyarado|Giarados', 'Dragonite|Dragonait', 'Onix', 'Vulpix', 'Ninetales|Ninetails', 'Ditto', 'Lapras', 'Machamp', 'Alakazam|Alakazan', 'Raichu', 'Arcanine|Arcanin', 'Scyther|Scither', 'Vaporeon', 'Jolteon', 'Flareon'],
    60: ['Ivysaur', 'Charmeleon', 'Wartortle', 'Caterpie', 'Butterfree', 'Weedle', 'Beedrill', 'Pidgey', 'Pidgeot', 'Rattata', 'Ekans', 'Arbok', 'Nidoqueen', 'Nidoking', 'Clefairy', 'Zubat', 'Oddish', 'Diglett', 'Persian', 'Golduck', 'Growlithe', 'Poliwag', 'Abra', 'Kadabra', 'Machop', 'Tentacool', 'Tentacruel', 'Geodude', 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro', 'Magnemite', 'Grimer', 'Muk', 'Gastly', 'Haunter', 'Hypno', 'Voltorb', 'Exeggutor', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Koffing', 'Weezing', 'Rhydon|Rydon', 'Chansey', 'Staryu', 'Starmie', 'Mr. Mime|Mr Mime|Mime|Mister Mime|Mr Maim', 'Jynx', 'Electabuzz', 'Pinsir', 'Tauros', 'Porygon', 'Aerodactyl', 'Articuno', 'Zapdos', 'Moltres', 'Dratini'],
    80: ['Metapod', 'Pidgeotto', 'Raticate', 'Spearow', 'Fearow', 'Sandshrew', 'Sandslash', 'Nidoran hembra|Nidoran|Nidoran F', 'Nidoran macho|Nidoran M', 'Clefable', 'Wigglytuff', 'Golbat', 'Gloom', 'Vileplume', 'Paras', 'Venonat', 'Venomoth', 'Dugtrio', 'Mankey', 'Primeape', 'Poliwhirl', 'Poliwrath', 'Machoke', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Graveler', 'Magneton', 'Seel', 'Dewgong', 'Shellder', 'Cloyster', 'Drowzee', 'Krabby', 'Kingler', 'Electrode', 'Exeggcute', 'Lickitung', 'Rhyhorn', 'Kangaskhan', 'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Magmar', 'Omanyte', 'Kabuto', 'Kabutops', 'Dragonair'],
    100: ['Kakuna', 'Nidorina', 'Nidorino', 'Parasect', 'Farfetch\'d|Farfetchd|Farfetch d|Farfetch', 'Doduo', 'Dodrio', 'Tangela', 'Omastar'],
  }, `Los 151 Pokémon de la primera generación (Kanto). Nidoran macho/hembra: se acepta "Nidoran" a secas como la hembra (mismo nivel). ${NIVELES} Revisada 2026-10-15: lista completa verificada (151); moví Metapod a 80 (es muy recordado por el anime) y agregué errores de escritura comunes (Charizar, Bulbasur, Evee, Garados, Mewtu...).`),

  q('pokemon-gen1-fuego', 'Pokémon', 'Nombra un Pokémon tipo fuego de la primera generación.', {
    10: ['Charmander|Charmandar', 'Charizard|Charizar|Charizad'],
    30: ['Flareon', 'Arcanine|Arcanin', 'Vulpix'],
    60: ['Ninetales|Ninetails', 'Growlithe', 'Ponyta', 'Moltres'],
    80: ['Charmeleon', 'Rapidash'],
    100: ['Magmar'],
  }, `Los 12 Pokémon de Kanto con tipo fuego (Charizard y Moltres son fuego/volador). ${NIVELES}`),

  q('pokemon-gen1-agua', 'Pokémon', 'Nombra un Pokémon tipo agua de la primera generación.', {
    10: ['Squirtle|Squirtel|Squirtl|Esquirtle', 'Blastoise|Blastois', 'Magikarp|Magicarp', 'Gyarados|Garados|Gyarado|Giarados', 'Psyduck|Psiduck|Sayduck'],
    30: ['Vaporeon', 'Lapras', 'Wartortle', 'Golduck', 'Starmie', 'Slowpoke'],
    60: ['Staryu', 'Poliwag', 'Horsea', 'Seadra', 'Tentacool', 'Tentacruel', 'Krabby', 'Goldeen', 'Shellder', 'Slowbro'],
    80: ['Cloyster', 'Kingler', 'Seaking', 'Poliwhirl', 'Poliwrath', 'Dewgong', 'Seel', 'Omanyte', 'Kabuto'],
    100: ['Omastar', 'Kabutops'],
  }, `Los 32 Pokémon de Kanto con tipo agua (incluye los de tipo doble, como Gyarados, Lapras o Starmie). ${NIVELES}`),

  q('pokemon-gen1-planta', 'Pokémon', 'Nombra un Pokémon tipo planta de la primera generación.', {
    10: ['Bulbasaur|Bulbasur|Bulbasor|Bulbasaurio'],
    30: ['Venusaur|Venasaur|Venusaurio', 'Ivysaur', 'Oddish', 'Exeggutor'],
    60: ['Vileplume', 'Gloom', 'Victreebel', 'Bellsprout', 'Exeggcute'],
    80: ['Weepinbell', 'Paras', 'Tangela'],
    100: ['Parasect'],
  }, `Los 14 Pokémon de Kanto con tipo planta. ${NIVELES}`),

  q('pokemon-gen1-electrico', 'Pokémon', 'Nombra un Pokémon tipo eléctrico de la primera generación.', {
    10: ['Pikachu'],
    30: ['Raichu', 'Jolteon', 'Zapdos'],
    60: ['Magnemite', 'Voltorb', 'Electabuzz'],
    80: ['Magneton'],
    100: ['Electrode'],
  }, `Los 9 Pokémon de Kanto con tipo eléctrico. Electrode va en 100 solo para completar la escala (todos son bastante conocidos). ${NIVELES}`),
]
