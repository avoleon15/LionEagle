import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada Pokémon (popularidad de la franquicia); hay que calibrarlos con partidas reales. Se aceptan los nombres sin tilde ni mayúsculas.'

export default [
  q('pokemon-gen1', 'Pokémon', 'Nombra un Pokémon de la primera generación.', {
    10: ['Pikachu', 'Charizard', 'Charmander', 'Bulbasaur', 'Squirtle', 'Mewtwo', 'Eevee', 'Gengar'],
    30: ['Mew', 'Snorlax', 'Blastoise', 'Venusaur', 'Jigglypuff', 'Meowth', 'Psyduck', 'Magikarp', 'Gyarados', 'Dragonite', 'Onix', 'Vulpix', 'Ninetales', 'Ditto', 'Lapras', 'Machamp', 'Alakazam', 'Raichu', 'Arcanine', 'Scyther', 'Vaporeon', 'Jolteon', 'Flareon'],
    60: ['Ivysaur', 'Charmeleon', 'Wartortle', 'Caterpie', 'Butterfree', 'Weedle', 'Beedrill', 'Pidgey', 'Pidgeot', 'Rattata', 'Ekans', 'Arbok', 'Nidoqueen', 'Nidoking', 'Clefairy', 'Zubat', 'Oddish', 'Diglett', 'Persian', 'Golduck', 'Growlithe', 'Poliwag', 'Abra', 'Kadabra', 'Machop', 'Tentacool', 'Tentacruel', 'Geodude', 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro', 'Magnemite', 'Grimer', 'Muk', 'Gastly', 'Haunter', 'Hypno', 'Voltorb', 'Exeggutor', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Koffing', 'Weezing', 'Rhydon', 'Chansey', 'Staryu', 'Starmie', 'Mr. Mime|Mr Mime|Mime', 'Jynx', 'Electabuzz', 'Pinsir', 'Tauros', 'Porygon', 'Aerodactyl', 'Articuno', 'Zapdos', 'Moltres', 'Dratini'],
    80: ['Pidgeotto', 'Raticate', 'Spearow', 'Fearow', 'Sandshrew', 'Sandslash', 'Nidoran hembra|Nidoran|Nidoran F', 'Nidoran macho|Nidoran M', 'Clefable', 'Wigglytuff', 'Golbat', 'Gloom', 'Vileplume', 'Paras', 'Venonat', 'Venomoth', 'Dugtrio', 'Mankey', 'Primeape', 'Poliwhirl', 'Poliwrath', 'Machoke', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Graveler', 'Magneton', 'Seel', 'Dewgong', 'Shellder', 'Cloyster', 'Drowzee', 'Krabby', 'Kingler', 'Electrode', 'Exeggcute', 'Lickitung', 'Rhyhorn', 'Kangaskhan', 'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Magmar', 'Omanyte', 'Kabuto', 'Kabutops', 'Dragonair'],
    100: ['Metapod', 'Kakuna', 'Nidorina', 'Nidorino', 'Parasect', 'Farfetch\'d|Farfetchd|Farfetch d', 'Doduo', 'Dodrio', 'Tangela', 'Omastar'],
  }, `Los 151 Pokémon de la primera generación (Kanto). Nidoran macho/hembra: se acepta "Nidoran" a secas como la hembra (mismo nivel). ${NIVELES}`),

  q('pokemon-gen1-fuego', 'Pokémon', 'Nombra un Pokémon tipo fuego de la primera generación.', {
    10: ['Charmander', 'Charizard'],
    30: ['Flareon', 'Arcanine', 'Vulpix'],
    60: ['Ninetales', 'Growlithe', 'Ponyta', 'Moltres'],
    80: ['Charmeleon', 'Rapidash'],
    100: ['Magmar'],
  }, `Los 12 Pokémon de Kanto con tipo fuego (Charizard y Moltres son fuego/volador). ${NIVELES}`),

  q('pokemon-gen1-agua', 'Pokémon', 'Nombra un Pokémon tipo agua de la primera generación.', {
    10: ['Squirtle', 'Blastoise', 'Magikarp', 'Gyarados', 'Psyduck'],
    30: ['Vaporeon', 'Lapras', 'Wartortle', 'Golduck', 'Starmie', 'Slowpoke'],
    60: ['Staryu', 'Poliwag', 'Horsea', 'Seadra', 'Tentacool', 'Tentacruel', 'Krabby', 'Goldeen', 'Shellder', 'Slowbro'],
    80: ['Cloyster', 'Kingler', 'Seaking', 'Poliwhirl', 'Poliwrath', 'Dewgong', 'Seel', 'Omanyte', 'Kabuto'],
    100: ['Omastar', 'Kabutops'],
  }, `Los 32 Pokémon de Kanto con tipo agua (incluye los de tipo doble, como Gyarados, Lapras o Starmie). ${NIVELES}`),

  q('pokemon-gen1-planta', 'Pokémon', 'Nombra un Pokémon tipo planta de la primera generación.', {
    10: ['Bulbasaur'],
    30: ['Venusaur', 'Ivysaur', 'Oddish', 'Exeggutor'],
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
