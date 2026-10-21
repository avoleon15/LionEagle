import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido un joven adulto de habla hispana diría cada respuesta para este enunciado; hay que calibrarlos con partidas reales.'

// Familia "youtubers y streamers de España". Todos los nombres salen de listas verificadas (Wikipedia en español e inglés: categorías
// "Youtubers de España" y "Streamers de España"/"Spanish Twitch streamers", páginas de Karmaland, Vegetta777, Willyrex, Mikecrack, Knekro,
// IlloJuan; Forbes España/Público 2023 para Twitch; Selectra octubre 2026 para canales por suscriptores; Antonio García Villarán y
// sillas-gaming.com para los de la época clásica). El jugador puede escribir el nombre del canal, el apodo o el nombre real.
// Las constantes de abajo dan una sola forma al nombre y sus apodos para que sea igual en todas las preguntas.
const RUBIUS = 'El Rubius|Rubius|elrubiusOMG|Rubius OMG|Rubén Doblas|Rubén Doblas Gundersen'
const VEGETTA = 'Vegetta777|Vegetta|Vegeta777|Vegetta 777|Samuel de Luque'
const WILLY = 'Willyrex|Willy|TheWillyrex|The Willyrex|Willy Rex|Guillermo Díaz'
const AURON = 'AuronPlay|Auron|Auron Play|Raúl Álvarez|Raúl Álvarez Genes'
const GREFG = 'TheGrefg|Grefg|The Grefg|David Cánovas|David Cánovas Martínez'
const IBAI = 'Ibai|Ibai Llanos'
const MIKE = 'Mikecrack|Mike Crack|Miguel Bernal'
const XOKAS = 'ElXokas|Xokas|El Xokas|Joaquín Domínguez|Joaquín Domínguez Portela'
const ALEXBY = 'Alexby11|Alexby|Alexby 11|Alejandro Bravo'
const FARGAN = 'Fargan'
const MANGEL = 'Mangel|Mangelrogel|Mangel Rogel|Miguel Ángel Rogel'
const LOLITO = 'LolitoFDZ|Lolito|Lolito Fernández|Lolito Fdz'
const STAXX = 'Staxx|ByStaxx|sTaXxCraft|Frank Garnes'
const DALAS = 'Dalas Review|!Dalas|DalasReview'
const WISMICHU = 'Wismichu|Ismael Prego'
const ALPHA = 'AlphaSniper97|Alpha|AlphaSniper|Alpha Sniper|Alpha Sniper 97'
const AMPETER = 'Ampeterby7|Ampeterby|Ampeter|Ampeter by 7'
const GOORGO = 'Goorgo|Gorgo|Goorgo Gaming'
const ILLO = 'IlloJuan|Illo Juan|Illojuan'
const CRISTININI = 'Cristinini|Cristina López|Cristina López Pérez|IamCristinini'
const KNEKRO = 'Knekro|Sergio García Maroto'
const TROLLI = 'ElTrollino|Trolli|El Trollino|Trollino'
const TIMBA = 'Timba Vk|TimbaVk|Timba'
const INVICTOR = 'Invictor|InvictorGS3|Invictor GS3'
const CHUSTER = 'Chuster|Chuster TV|ChusterTV'
const LUZU = 'Luzu|LuzuGames|Luzu Games|LuzuVlogs|Luzu Vlogs|Borja Luzuriaga'
const TADE = 'TadeVlogs|Tade|Tade Vlogs'
const RATITAS = 'Las Ratitas|Ratitas'
const ZARCORT = 'ZarcortGame|Zarcort|Zarcort Game|Miguel Ángel Martos'
const ITOWN = 'iTownGamePlay|iTown|iTown Game Play|Itown'
const DANIREP = 'DaniRep|Dani Rep|Daniel Hidalgo'
const GIORGIO = 'El Rincón de Giorgio|Giorgio|Jordi Carrillo'
const MAKI = 'Makiman131|Makiman|Makiman 131'
const NEXXUZ = 'NexxuzHD|Nexxuz|Nexxuz HD'
const CHURCHES = 'ElChurches|El Churches|Churches|Carlos Iglesia'
const TRILINE = 'Tri-line|Triline|Tri Line|8occho'
const ALEXELCAPO = 'Alexelcapo|Alex el Capo|El Capo'
const BIYIN = 'Biyín|Biyin'
const CRIYIN = 'Criyín|Criyin'
const SPREEN = 'Spreen|ElSpreen|El Spreen'
const PERXITAA = 'Perxitaa|Perxita'
const SPURSITO = 'Spursito'
const MAYICHI = 'Mayichi'
const ELESKY = 'Elesky'
const ELVIRA = 'ElviraYuki|Elvira Yuki'
const MIXWELL = 'Mixwell'
const GONU = 'Paula Gonu|!Gonu'
const WILD = 'Jordi Wild|Wild'
const CREMADES = 'Jorge Cremades|Cremades'
const CHEETO = 'Sr. Cheeto|Señor Cheeto|Cheeto|CheetoSenior|Mr. Cheeto'
const ISASA = 'Isasaweis|Isasa weis|Isasa'
const AISHA = 'Aishawari|Aisha wari'
const DULCEIDA = 'Dulceida|Aida Domènech'
const PATRY = 'Patry Jordan|Patry'

export default [
  // ---------------------------------------------------------------- yt-espana-cualquiera
  q('yt-espana-cualquiera', 'Youtubers', 'Nombra un youtuber o streamer de España (de cualquier tema; no cuentan los de Latinoamérica).', {
    10: [RUBIUS, VEGETTA, WILLY, AURON, GREFG, IBAI, MIKE],
    30: [XOKAS, ALEXBY, FARGAN, MANGEL, LOLITO, STAXX, DALAS, WISMICHU, ALPHA, ILLO, CRISTININI, TROLLI, TIMBA, LUZU, KNEKRO, CHEETO],
    60: [AMPETER, GOORGO, INVICTOR, CHUSTER, TADE, RATITAS, ZARCORT, ITOWN, DANIREP, GIORGIO, MAKI, NEXXUZ, CHURCHES, ALEXELCAPO, BIYIN, SPREEN, PERXITAA, SPURSITO, MAYICHI, WILD, MIXWELL, CREMADES, GONU, ISASA, DULCEIDA],
    80: [TRILINE, CRIYIN, ELESKY, ELVIRA, AISHA, PATRY, 'Venga Monjas', 'Troncho y Poncho', 'Facu Díaz|Facu', 'Javier Santaolalla|Santaolalla|Date un Voltio', 'Eduardo Sáenz de Cabezón|Sáenz de Cabezón|Derivando', 'David Calle|Unicoos', 'Jaime Altozano|Altozano', 'Quantum Fracture|QuantumFracture', 'VisualPolitik|Visual Politik', 'Brianeitor', 'Celopan', 'Jefe de la M|Jefe de la Eme', 'Curricé|Curri', 'Gerard Romero', 'Pol Turrents', 'Siro López', 'Elyoya', 'Nico Abad', 'Byre', 'Antonio García Villarán|Villarán|García Villarán', 'Los Cobras', 'Yellow Mellow', 'Ratolina', 'Elvisa', 'Inesmellaman', 'El Chico Morera|Chico Morera', 'Laia Oli'],
    100: ['Alba Castelló', 'Abby', 'MarkiLokuras|Marki Lokuras|Marki', 'MiqueletsTV|Mikelets TV|Miquelets', 'Cheese|Cheese Speedrunner', 'Plex', 'Emilio Doménech', 'Carles Tamayo', 'Isaac Sánchez', 'Javier Ruescas|Ruescas', 'La Gata de Schrödinger|La Gata de Schrodinger', 'C de Ciencia|CdeCiencia', 'Antroporama', 'José Luis Crespo|Crespo', 'JPelirrojo|J Pelirrojo', 'Percebes y Grelos', 'Soy una Pringada', 'Andrea Compton', 'Claudia Ayuso', 'Cadete', 'Tiparraco', 'Juanmasaurus', 'Diego Marcapáginas|Marcapáginas', 'Los Prieto Flores', 'El Rejón', 'Jano García', 'Dani el Rojo'],
  }, `Pregunta abierta de youtubers/streamers de España. Lista construida con: Wikipedia en español, categorías "Youtubers de España" (67 páginas) y "Streamers de España" (22); Wikipedia en inglés, "Spanish Twitch streamers" (29); Selectra, ranking de canales españoles (12/10/2026: Mikecrack, elrubiusOMG, VEGETTA777, Chuster, invictor, AuronPlay, TadeVlogs, Las Ratitas, ElTrollino...); Forbes España/Público 2023 para Twitch; la lista "Las 3 generaciones de youtubers españoles" de Antonio García Villarán; sillas-gaming.com (18 gamers españoles). Se dejó fuera a todos los latinoamericanos (Dross, Luisito, Quackity, TheDonato, etc.) y a quien no se pudo confirmar como de España (Gorgo, Nahz, Rivers, Reventxz, Zorman, Ampeterby7: no se encontró fuente confiable). Dudas: Luzu (Borja Luzuriaga) aparece como nacido en España y radicado en EE. UU.; Sr. Cheeto no tiene página en Wikipedia (se incluyó por su trabajo con Mangel y el grupo de Vegetta, verificar); Abby, Plex, Emilio Doménech, Isaac Sánchez salen de la categoría de Wikipedia pero son poco conocidos; Dulceida es más influencer que youtuber (tiene canal activo). Se evitaron personas polémicas o de contenido adulto aunque salgan en las categorías. ${NIVELES}`),

  // ---------------------------------------------------------------- yt-epoca-clasica
  q('yt-epoca-clasica', 'Youtubers', 'Nombra un youtuber español de la época clásica (que ya subía vídeos a YouTube antes de 2016; de España, no de Latinoamérica).', {
    10: [RUBIUS, VEGETTA, WILLY, AURON],
    30: [ALEXBY, MANGEL, STAXX, DALAS, WISMICHU, FARGAN, LOLITO, ALPHA, LUZU, TROLLI, TIMBA, MIKE],
    60: [AMPETER, GOORGO, ZARCORT, ITOWN, DANIREP, GIORGIO, MAKI, NEXXUZ, CHURCHES, ALEXELCAPO, GREFG, XOKAS, ISASA, AISHA, 'Yellow Mellow', 'Los Cobras', CREMADES, CHEETO],
    80: [TRILINE, INVICTOR, 'Ratolina', 'Elvisa', 'Inesmellaman', 'El Chico Morera|Chico Morera', PATRY, 'Curricé|Curri', 'Claudia Ayuso', 'Cadete', 'Christian Villanueva', 'Ras Smith|Rassmith', 'Chuchita Fashion Fever|Chuchita', 'Laia Oli', 'David Calle|Unicoos', 'Javier Ruescas|Ruescas', DULCEIDA, WILD, 'Brianeitor', 'Celopan', 'Quantum Fracture|QuantumFracture'],
    100: ['JPelirrojo|J Pelirrojo', 'Tiparraco', 'Juanmasaurus', 'Adelita Power', 'Ovidio Patatas', 'Sebas G. Mouret|Sebas G Mouret', 'May Ayamonte', 'Andreo Rowling', 'Diego Marcapáginas|Marcapáginas', 'Esmeralda Fly Like a Butterfly|Esmeralda', 'Rafa de Grifo', 'Percebes y Grelos', 'Jaime Altozano|Altozano', 'Antroporama', 'C de Ciencia|CdeCiencia', 'Nioh', 'Diegostryke', 'Orslok', 'José Luis Crespo|Crespo', 'Javier Santaolalla|Santaolalla|Date un Voltio', 'Jano García'],
  }, `Youtubers de España con canal anterior a 2016. Fuentes: "Las 3 generaciones de youtubers españoles" (Antonio García Villarán, primera generación: El Rubius desde 2006, Alexby, Mangel, Vegetta777, Willyrex, Isasaweis, Aishawari, DalasReview, AuronPlay; segunda generación c. 2009: Yellow Mellow, Los Cobras, Inesmellaman, El Chico Morera, Patry Jordan, Curri, Claudia Ayuso, Cadete, Christian Villanueva, Ras Smith, Chuchita, Laia Oli, Tiparraco, Juanmasaurus, Adelita Power, Ovidio Patatas, Javier Ruescas, Sebas G. Mouret, May Ayamonte, Andreo Rowling, Diego Marcapáginas, Luzu, Staxx, David Calle, Wismichu, El Rincón de Giorgio y otros), sillas-gaming.com (fechas de inicio de Alexby11 en 2007, Staxx en 2011, etc.), Wikipedia (Vegetta777 desde 2008, Willyrex desde 2009, AlphaSniper97 canal creado en 2011). Dudas: la fecha exacta de inicio de TheGrefg, Mikecrack, Xokas, Timba Vk, Trolli, Invictor, Cremades y Chuster no se pudo contrastar en una fuente fuerte (los tres primeros ya subían vídeos en 2012-2015 según recuerdo y Wikipedia, pero verificar); varios del nivel 80 y 100 salen solo del blog de Villarán (no hay página propia en Wikipedia). Luzu aparece en el nivel 30 como parte de los gamers de 2010-2015 (nacido en España, ver nota de la primera pregunta). ${NIVELES}`),

  // ---------------------------------------------------------------- yt-gaming
  q('yt-gaming', 'Youtubers', 'Nombra un youtuber español de videojuegos (gameplays, Minecraft, GTA, Fortnite...; de España, no de Latinoamérica).', {
    10: [VEGETTA, WILLY, RUBIUS, GREFG, MIKE],
    30: [ALEXBY, FARGAN, MANGEL, LOLITO, STAXX, ALPHA, AURON, TROLLI, TIMBA, ILLO, XOKAS, LUZU, CHEETO],
    60: [AMPETER, GOORGO, INVICTOR, CHUSTER, ZARCORT, ITOWN, DANIREP, MAKI, NEXXUZ, CHURCHES, ALEXELCAPO, KNEKRO, MIXWELL, SPREEN, PERXITAA, SPURSITO, IBAI, CRISTININI],
    80: [TRILINE, BIYIN, CRIYIN, ELESKY, ELVIRA, MAYICHI, 'Curricé|Curri', 'Byre', 'Elyoya', 'MarkiLokuras|Marki Lokuras|Marki', 'Los Cobras', 'Wismichu'],
    100: ['Cheese|Cheese Speedrunner', 'Plex', 'MiqueletsTV|Mikelets TV|Miquelets', 'Abby', 'Alba Castelló'],
  }, `Gamers/youtubers de videojuegos de España. Fuentes: sillas-gaming.com ("Los 18 youtubers gamers más populares en España": elrubiusOMG, VEGETTA777, TheWillyrex, iTownGamePlay, Luzugames, ZarcortGame, Alexby11, DaniRep, sTaXxCraft, Mangelrogel, Makiman131, TheGrefg, AuronPlay, NexxuzHD, ElChurches, Tri-line), Selectra 2026 (Mikecrack, invictor, Chuster, ElTrollino), Wikipedia (Karmaland: Vegetta777, Willyrex, ByStaxx, Luzu, Alexby, ElRubius, Mangel Rogel, Fargan, LolitoFdz, Auronplay, IlloJuan, Maximus), Wikipedia "Spanish Twitch streamers" (Knekro, Spursito, Perxitaa, Byre...). Dudas: Ibai y Cristinini son streamers que juegan pero no son gamers puros (nivel 60 por generosidad); Mixwell es jugador profesional de Valorant español; Plex y Abby salen de la categoría de Wikipedia, verificar su contenido. Gorgo y Rivers no se pudieron verificar como de España y quedaron fuera. Sr. Cheeto tiene fuente débil (ver nota de la primera pregunta). ${NIVELES}`),

  // ---------------------------------------------------------------- yt-twitch
  q('yt-twitch', 'Youtubers', 'Nombra un streamer español de Twitch (de España; no cuentan los de Latinoamérica).', {
    10: [IBAI, AURON, RUBIUS, GREFG],
    30: [XOKAS, ILLO, CRISTININI, KNEKRO, ALEXELCAPO, ALEXBY, SPREEN],
    60: [BIYIN, CRIYIN, PERXITAA, SPURSITO, MAYICHI, ELESKY, ELVIRA, MIXWELL, LUZU, LOLITO, FARGAN, MANGEL, VEGETTA, WILLY, MIKE, ALPHA],
    80: ['Elyoya', 'Byre', 'Alba Castelló', 'Abby', 'MarkiLokuras|Marki Lokuras|Marki', 'MiqueletsTV|Mikelets TV|Miquelets', 'Cheese|Cheese Speedrunner', 'Nico Abad', 'Pol Turrents', 'Siro López', 'Gerard Romero', 'Plex', 'Emilio Doménech', GONU, STAXX, DANIREP, TROLLI, TIMBA, INVICTOR, CHUSTER],
    100: ['Anna Cramling', 'Jordi Wild|Wild', 'Dalas Review|!Dalas|DalasReview', 'Wismichu', 'Carles Tamayo', 'Isaac Sánchez', 'ZarcortGame|Zarcort|Zarcort Game', 'Makiman131|Makiman'],
  }, `Streamers de España en Twitch (y los que también hacen directos). Fuentes: Wikipedia en inglés, categoría "Spanish Twitch streamers" (Nico Abad, Abby, AuronPlay, Elyoya, Byre, Alba Castelló, Cheese, Anna Cramling, Cristinini, Elesky, ElviraYuki, Elxokas, Paula Gonu, IlloJuan, Knekro, Ibai Llanos, MarkiLokuras, Mayichi, MiqueletsTV, Perxitaa, El Rubius, Siro López, Spursito, TheGrefg, Pol Turrents, Vegetta777, Willyrex, Wismichu); Wikipedia en español, categoría "Streamers de España" (también Gerard Romero, Plex, Emilio Doménech, Isaac Sánchez, Carles Tamayo, Malbert, José Antonio Abellán); Forbes España/Público 2023 (AuronPlay, El Rubius, Ibai, TheGrefg, Elxokas, IlloJuan, Alexby11, Cristinini, Biyín, Luzu, Criyín); Twitchalytics (Spreen en el puesto 7 del ranking en español). Dudas: Anna Cramling (ajedrecista; Wikipedia la lista como streamer de España pero tiene nacionalidad sueca y española, verificar), Malbert y José Antonio Abellán salen en categorías pero no se incluyeron por falta de datos, Siro López y Gerard Romero son periodistas que hacen directos, Alexelcapo ya no hace directos con tanta frecuencia. Spreen es español (pese a ser seguido sobre todo en Latinoamérica). Ibai, Auron, Rubius y Grefg están en nivel 10 por su récord de espectadores. ${NIVELES}`),

] 
