import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales.'

// Dos preguntas pedidas por el dueño (2026-10-22).
const dom = (name: string, ...more: string[]) => [`.${name}`, `punto ${name}`, `dot ${name}`, ...more].join('|')

export default [
  // ---------------------------------------------------------------- dominios-web-tipos
  q('dominios-web-tipos', 'Marcas y apps', 'Nombra un tipo de dominio de una página web (lo que va al final de la dirección, como .com).', {
    10: [dom('com', 'com', 'comercial'), dom('org', 'org', 'organización'), dom('net', 'net')],
    30: [dom('edu', 'edu'), dom('gov', 'gov', 'gobierno'), dom('info', 'info'), dom('io', 'io'), dom('co', 'co'), dom('app', 'app')],
    60: [dom('biz', 'biz'), dom('mil', 'mil'), dom('tv', 'tv'), dom('me', 'me'), dom('ai', 'ai'), dom('dev', 'dev'), dom('online', 'online'), dom('store', 'store'), dom('shop', 'shop'), dom('site', 'site'), dom('tech', 'tech'), dom('xyz', 'xyz'), dom('blog', 'blog'), dom('club', 'club'), dom('mobi', 'mobi'), dom('name', 'name'), dom('pro', 'pro'), dom('int', 'int')],
    80: [dom('museum', 'museum'), dom('aero', 'aero'), dom('coop', 'coop'), dom('travel', 'travel'), dom('jobs', 'jobs'), dom('tel', 'tel'), dom('cat', 'cat'), dom('asia', 'asia'), dom('xxx', 'xxx'), dom('cloud', 'cloud'), dom('page', 'page'), dom('design', 'design'), dom('art', 'art'), dom('news', 'news'), dom('live', 'live'), dom('life', 'life'), dom('world', 'world'), dom('space', 'space'), dom('website', 'website'), dom('agency', 'agency'), dom('games', 'games'), dom('fun', 'fun'), dom('top', 'top'), dom('vip', 'vip'), dom('wiki', 'wiki'), dom('fm', 'fm'), dom('cc', 'cc'), dom('gg', 'gg'), dom('ly', 'ly')],
    100: [dom('post', 'post'), dom('arpa', 'arpa'), dom('ninja', 'ninja'), dom('guru', 'guru'), dom('icu', 'icu'), dom('rocks', 'rocks'), dom('lol', 'lol'), dom('moe', 'moe')],
  }, `Dominios de nivel superior (lo que va después del último punto de una dirección web). Fuente: lista oficial de IANA (https://data.iana.org/TLD/tlds-alpha-by-domain.txt, 1,438 dominios a 2026-10-22): se comprobó que cada respuesta existe. Por pedido del dueño cuentan los genéricos (.com, .org, .net, .info…), los patrocinados o antiguos (.edu, .gov, .mil, .museum, .aero, .coop…), los genéricos nuevos más conocidos (.app, .dev, .online, .shop, .xyz…) y los de país que casi todos usan como si fueran genéricos (.io, .co, .ai, .tv, .me, .fm, .cc, .gg, .ly). NO cuentan los dominios de país normales (.mx, .gt, .es, .ar…); son unos 250 y la lista sería enorme. Se aceptan con o sin punto ("com" y ".com") y "punto com". Hay más de 1,200 dominios genéricos nuevos; aquí van unos 60 de los que la gente conoce. ${NIVELES}`),

  // ---------------------------------------------------------------- paises-idioma-frances
  q('paises-idioma-frances', 'Geografía', 'Nombra un país cuyo idioma principal sea el francés.', {
    10: ['Francia|France'],
    30: ["Costa de Marfil|Côte d'Ivoire|Cote d'Ivoire|Costa Marfil", 'Senegal', 'Mónaco|Monaco', 'Haití|Haiti', 'República Democrática del Congo|RD Congo|RDC|Congo-Kinshasa|Congo Kinshasa|RDCongo', 'Camerún|Camerun|Cameroon'],
    60: ['Benín|Benin', 'Togo', 'Gabón|Gabon', 'Guinea|Guinea Conakri|Conakri', 'República del Congo|Congo|Congo-Brazzaville|Congo Brazzaville|!Congo', 'Chad|Tchad', 'Madagascar', 'Ruanda|Rwanda', 'Burundi', 'Yibuti|Djibouti'],
    80: ['República Centroafricana|Centroafricana|Centroáfrica'],
    100: ['Comoras|Comores'],
  }, `Países donde el francés es el idioma oficial principal o único: los 10 donde es el único oficial según Wikipedia (Francia, Mónaco, Benín, Togo, Gabón, Guinea, Costa de Marfil, Senegal, República del Congo y República Democrática del Congo; https://en.wikipedia.org/wiki/List_of_countries_and_territories_where_French_is_an_official_language, leída 2026-10-22) más los que lo comparten con un idioma local pero lo usan como idioma oficial principal del gobierno y la escuela: Haití, Camerún, Chad, República Centroafricana, Madagascar, Ruanda, Burundi, Yibuti y Comoras. Por pedido del dueño ("francés oficial y de uso general") NO cuentan Canadá, Bélgica, Suiza, Luxemburgo, Seychelles, Vanuatu ni Guinea Ecuatorial: allí el francés es uno de varios y no el principal. Dudas: Mali, Burkina Faso y Níger dejaron de tener el francés como idioma oficial (hoy es solo de trabajo), por eso no están; en Haití la mayoría habla criollo, y en casi toda África la gente habla más una lengua local, pero el francés es el idioma oficial principal. "Congo" suelto cuenta para la República del Congo; "Guinea" suelta cuenta para Guinea (Conakri). ${NIVELES}`),
]
