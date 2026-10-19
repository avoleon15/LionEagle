import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales.'

export default [
  q('europa-league-ganadores', 'Fútbol', 'Nombra un equipo que haya ganado la Europa League (antes Copa UEFA).', {
    10: ['Sevilla|Sevilla FC', 'Manchester United|Man United|Man U|Man Utd|Manchester Utd', 'Chelsea', 'Atlético de Madrid|Atletico Madrid|Atleti|Atlético'],
    30: ['Villarreal', 'Eintracht Fráncfort|Eintracht Frankfurt|Frankfurt|Eintracht', 'Atalanta', 'Tottenham|Tottenham Hotspur|Spurs', 'Aston Villa|Villa', 'Liverpool', 'Juventus|Juve', 'Inter de Milán|Inter|Internazionale|Inter Milan', 'Porto|FC Porto', 'Real Madrid', 'Valencia', 'Napoli|Nápoles', 'Shakhtar Donetsk|Shakhtar|Shajtar', 'Bayern Múnich|Bayern|Bayern Munich|Bayern de Múnich'],
    60: ['Ajax', 'Bayer Leverkusen|Leverkusen', 'Zenit San Petersburgo|Zenit|Zenit St. Petersburg', 'Galatasaray', 'Feyenoord', 'PSV Eindhoven|PSV', 'Borussia Mönchengladbach|Gladbach|Mönchengladbach|Moenchengladbach'],
    80: ['Schalke 04|Schalke', 'Parma', 'CSKA Moscú|CSKA Moscow|CSKA'],
    100: ['IFK Göteborg|IFK Goteborg|Göteborg|Goteborg', 'Ipswich Town|Ipswich', 'Anderlecht'],
  }, `Ganadores de la Copa UEFA (desde 1972) y de la Europa League hasta la final del 20 de mayo de 2026, que ganó Aston Villa 3-0 al Friburgo (verificado). No incluí la Copa de Ferias (anterior). 31 clubes. Cuando termine cada temporada hay que agregar al nuevo campeón. ${NIVELES} Revisada 2026-10-15: lista de 31 clubes y final de 2026 (Aston Villa 3-0 Friburgo) verificadas de nuevo; solo agregué alias (Man Utd, Bayern de Múnich).`),

  q('champions-league-ganadores', 'Fútbol', 'Nombra un equipo que haya ganado la Champions League (Copa de Europa).', {
    10: ['Real Madrid', 'Barcelona|FC Barcelona|Barça', 'Bayern Múnich|Bayern|Bayern Munich|Bayern de Múnich', 'Liverpool', 'Milan|AC Milan|Milán', 'Manchester City|Man City', 'Chelsea', 'PSG|Paris Saint-Germain|París Saint-Germain|Paris Saint Germain', 'Manchester United|Man United|Man U|Man Utd|Manchester Utd', 'Inter de Milán|Inter|Internazionale|Inter Milan'],
    30: ['Juventus|Juve', 'Ajax', 'Borussia Dortmund|Dortmund|BVB', 'Porto|FC Porto', 'Benfica'],
    60: ['Celtic', 'Olympique de Marsella|Marsella|Olympique Marseille|Marseille', 'Feyenoord', 'Hamburgo|Hamburger SV|Hamburg', 'PSV Eindhoven|PSV', 'Aston Villa|Villa', 'Nottingham Forest|Forest|Nottingham'],
    80: ['Estrella Roja de Belgrado|Estrella Roja|Red Star Belgrade|Crvena Zvezda'],
    100: ['Steaua Bucarest|Steaua|Steaua Bucharest'],
  }, `Los 24 clubes campeones de Europa hasta 2026 (PSG ganó la final del 30 de mayo de 2026 contra el Arsenal por penales, verificado). El Arsenal NO ha ganado: es una respuesta inválida a propósito. ${NIVELES} Revisada 2026-10-15: lista de 24 verificada (PSG campeón 2025-26 confirmado); solo agregué alias.`),

  q('mundial-campeones', 'Fútbol', 'Nombra un país que haya ganado un Mundial de fútbol.', {
    10: ['Brasil|Brazil', 'Argentina', 'Francia|France', 'Alemania|Germany|Alemania Occidental|West Germany|RFA', 'España|Spain'],
    30: ['Italia|Italy'],
    60: ['Uruguay'],
    100: ['Inglaterra|England'],
  }, `Los 8 campeones del mundo hasta el Mundial 2026 (ganó España 1-0 a Argentina en la final del 19 de julio de 2026, verificado). Son pocos para que la pregunta dure; sirve como pregunta de relleno. ${NIVELES} Revisada 2026-10-15: final de 2026 verificada; moví España a 10 (campeona vigente), Uruguay a 60 (en Latinoamérica se conoce mucho más que Inglaterra) e Inglaterra a 100; alias Alemania Occidental.`),

  q('premier-league-equipos', 'Fútbol', 'Nombra un equipo de la Premier League actual.', {
    10: ['Manchester United|Man United|Man U|Man Utd|Manchester Utd', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester City|Man City', 'Tottenham|Tottenham Hotspur|Spurs'],
    30: ['Newcastle|Newcastle United|Newcastle Utd', 'Everton', 'Aston Villa|Villa', 'Leeds United|Leeds', 'Brighton|Brighton & Hove Albion|Brighton and Hove Albion'],
    60: ['Crystal Palace|Palace', 'Nottingham Forest|Forest|Nottingham', 'Fulham', 'Brentford', 'Bournemouth|AFC Bournemouth', 'Sunderland'],
    80: ['Ipswich Town|Ipswich'],
    100: ['Coventry City|Coventry', 'Hull City|Hull'],
  }, `Los 20 equipos de la temporada 2026-27 (comenzó el 21 de agosto de 2026; ascendieron Coventry, Ipswich y Hull; descendieron West Ham, Burnley y Wolves; verificado). West Ham, Burnley y Wolves NO cuentan. Hay que actualizar la lista cada temporada. ${NIVELES} Revisada 2026-10-15: ascensos y descensos verificados de nuevo; solo agregué alias.`),

  q('nfl-equipos', 'Deportes', 'Nombra un equipo de la NFL.', {
    10: ['Dallas Cowboys|Cowboys|Dallas|Vaqueros|Vaqueros de Dallas', 'New England Patriots|Patriots|Patriotas|New England|Pats', 'Kansas City Chiefs|Chiefs|Kansas City|Kansas|Jefes', 'San Francisco 49ers|49ers|Niners|San Francisco|Forty Niners|Gambusinos', 'Green Bay Packers|Packers|Green Bay|Empacadores'],
    30: ['Philadelphia Eagles|Eagles|Philadelphia|Filadelfia|Águilas|Águilas de Filadelfia', 'Pittsburgh Steelers|Steelers|Pittsburgh|Acereros', 'Chicago Bears|Bears|Chicago|Osos', 'New York Giants|Giants|Gigantes', 'Las Vegas Raiders|Raiders|Oakland Raiders|Las Vegas|Oakland|Malosos', 'Los Angeles Rams|Rams|St. Louis Rams|Carneros', 'Seattle Seahawks|Seahawks|Seattle|Halcones Marinos', 'Denver Broncos|Broncos|Denver', 'Baltimore Ravens|Ravens|Baltimore|Cuervos', 'Buffalo Bills|Bills|Buffalo', 'Miami Dolphins|Dolphins|Miami|Delfines', 'New York Jets|Jets'],
    60: ['Los Angeles Chargers|Chargers|San Diego Chargers|Cargadores', 'Cincinnati Bengals|Bengals|Cincinnati|Bengalíes', 'Detroit Lions|Lions|Detroit|Leones', 'Minnesota Vikings|Vikings|Minnesota|Vikingos', 'Tampa Bay Buccaneers|Buccaneers|Bucs|Tampa Bay|Tampa|Bucaneros', 'New Orleans Saints|Saints|New Orleans|Santos', 'Atlanta Falcons|Falcons|Atlanta|Halcones', 'Houston Texans|Texans|Houston|Texanos', 'Indianapolis Colts|Colts|Indianapolis|Potros|Baltimore Colts', 'Cleveland Browns|Browns|Cleveland|Cafés'],
    80: ['Washington Commanders|Commanders|Washington|Washington Redskins|Redskins|Comandantes', 'Arizona Cardinals|Cardinals|Arizona|Cardenales', 'Carolina Panthers|Panthers|Carolina|Panteras', 'Tennessee Titans|Titans|Tennessee|Titanes|Houston Oilers|Oilers'],
    100: ['Jacksonville Jaguars|Jaguars|Jacksonville|Jaguares|Jags'],
  }, `Los 32 equipos. "New York" y "Los Angeles" solos no cuentan (hay dos equipos en cada ciudad). Se acepta apodo, ciudad o nombre completo. ${NIVELES} Revisada 2026-10-15: agregué los apodos en español que se usan en México y Centroamérica (Acereros, Empacadores, Vaqueros, Malosos, Gambusinos, Halcones Marinos, Carneros, Potros, Cafés...) y nombres viejos (Oakland, San Diego, St. Louis, Houston Oilers).`),

  q('nba-equipos', 'Deportes', 'Nombra un equipo de la NBA.', {
    10: ['Los Angeles Lakers|Lakers', 'Golden State Warriors|Warriors|Golden State', 'Chicago Bulls|Bulls|Chicago', 'Boston Celtics|Celtics|Boston', 'Miami Heat|Heat|Miami'],
    30: ['New York Knicks|Knicks|NY Knicks', 'Brooklyn Nets|Nets|Brooklyn|New Jersey Nets', 'San Antonio Spurs|Spurs|San Antonio', 'Los Angeles Clippers|Clippers', 'Dallas Mavericks|Mavericks|Mavs|Dallas', 'Phoenix Suns|Suns|Phoenix', 'Milwaukee Bucks|Bucks|Milwaukee', 'Philadelphia 76ers|76ers|Sixers|Philadelphia', 'Houston Rockets|Rockets|Houston', 'Denver Nuggets|Nuggets|Denver', 'Oklahoma City Thunder|Thunder|Oklahoma City|Oklahoma|OKC'],
    60: ['Toronto Raptors|Raptors|Toronto', 'Cleveland Cavaliers|Cavaliers|Cavs|Cleveland', 'Memphis Grizzlies|Grizzlies|Memphis|Vancouver Grizzlies', 'Atlanta Hawks|Hawks|Atlanta', 'Sacramento Kings|Kings|Sacramento', 'Minnesota Timberwolves|Timberwolves|Wolves|Minnesota', 'New Orleans Pelicans|Pelicans|New Orleans|New Orleans Hornets', 'Detroit Pistons|Pistons|Detroit', 'Indiana Pacers|Pacers|Indiana', 'Orlando Magic|Magic|Orlando'],
    80: ['Charlotte Hornets|Hornets|Charlotte|Charlotte Bobcats|Bobcats', 'Utah Jazz|Jazz|Utah', 'Portland Trail Blazers|Trail Blazers|Blazers|Portland'],
    100: ['Washington Wizards|Wizards|Washington|Washington Bullets|Bullets'],
  }, `Los 30 equipos. "Los Angeles" y "New York" solos no cuentan (dos equipos en cada ciudad). ${NIVELES} Revisada 2026-10-15: moví Oklahoma City Thunder a 30 (campeón 2025); alias OKC y nombres viejos (New Jersey Nets, Charlotte Bobcats, Washington Bullets, Vancouver Grizzlies, New Orleans Hornets).`),

  q('deportes-contacto', 'Deportes', 'Nombra un deporte de contacto.', {
    10: ['Fútbol americano|Football americano|American football|Futbol americano', 'Boxeo|Box|Boxing', 'Rugby', 'MMA|Artes marciales mixtas|UFC'],
    30: ['Lucha libre|Wrestling|Lucha|Lucha libre mexicana|WWE', 'Hockey sobre hielo|Hockey', 'Karate|Kárate', 'Judo|Yudo', 'Taekwondo|Tae kwon do', 'Fútbol|Futbol|Soccer', 'Jiu-jitsu|Jiujitsu|Jiu-jitsu brasileño|BJJ', 'Artes marciales|Martial arts'],
    60: ['Baloncesto|Basquetbol|Básquetbol|Basketball', 'Kickboxing|Kick boxing', 'Muay Thai|Boxeo tailandés', 'Lucha olímpica|Lucha grecorromana', 'Waterpolo|Water polo|Polo acuático', 'Kung fu|Kungfu', 'Krav Maga'],
    80: ['Lacrosse', 'Sumo', 'Capoeira', 'Hockey sobre césped|Hockey sobre pasto|Hockey de campo', 'Balonmano|Handball', 'Aikido|Aikidō', 'Esgrima|Fencing', 'Fútbol sala|Futsal|Futbol rápido'],
    100: ['Fútbol australiano|Australian football|Footy', 'Fútbol gaélico|Gaelic football', 'Hurling', 'Sambo', 'Savate', 'Roller derby', 'Kendo|Kendō', 'Kabaddi', 'Wushu|Sanda|Sanshou', 'Hapkido', 'Lucha canaria', 'Pancracio|Pankration', 'Lethwei', 'Hockey sobre patines', 'Bandy'],
  }, `Interpretación abierta: incluí los deportes que la gente suele nombrar como "de contacto", incluso los de contacto limitado (fútbol, baloncesto, balonmano). Decisión tuya si prefieres excluir los de contacto limitado. ${NIVELES} Revisada 2026-10-15: agregué artes marciales (genérico, 30), esgrima, fútbol sala, kabaddi, wushu, hapkido, lucha canaria, pancracio, lethwei, hockey sobre patines y bandy; alias WWE, BJJ, boxeo tailandés, polo acuático.`),

  q('balon-de-oro-ganadores', 'Fútbol', 'Nombra un ganador del Balón de Oro.', {
    10: ['Lionel Messi|Messi|Leo Messi|Leo|La Pulga', 'Cristiano Ronaldo|Cristiano|CR7|Ronaldo'],
    30: ['Luka Modrić|Luka Modric|Modrić|Modric', 'Karim Benzema|Benzema', 'Ronaldinho|Ronaldinho Gaúcho|Dinho', 'Kaká|Kaka', 'Ronaldo Nazário|R9|El Fenómeno|Ronaldo Fenómeno|Ronaldo brasileño|Ronaldo Gordo', 'Zinedine Zidane|Zidane|Zizou', 'Johan Cruyff|Cruyff|Cruijff|Johan Cruijff', 'Rodri|Rodrigo Hernández', 'Ousmane Dembélé|Dembélé|Dembele'],
    60: ['Ruud Gullit|Gullit', 'Marco van Basten|Van Basten', 'Michel Platini|Platini', 'Franz Beckenbauer|Beckenbauer|Kaiser', 'George Best|Best', 'Roberto Baggio|Baggio', 'Luís Figo|Luis Figo|Figo', 'Rivaldo', 'Andriy Shevchenko|Shevchenko|Sheva', 'Pavel Nedvěd|Pavel Nedved|Nedved', 'Michael Owen|Owen', 'Fabio Cannavaro|Cannavaro', 'Gerd Müller|Gerd Muller|Müller|Muller', 'Eusébio|Eusebio', 'Bobby Charlton|Charlton', 'Lev Yashin|Yashin|Lev Yachin|Yachin|Araña Negra', 'Stanley Matthews|Matthews', 'Alfredo Di Stéfano|Di Stéfano|Di Stefano', 'Lothar Matthäus|Lothar Matthaus|Matthäus|Matthaus', 'George Weah|Weah', 'Hristo Stoichkov|Stoichkov', 'Paolo Rossi|Rossi', 'Kevin Keegan|Keegan', 'Karl-Heinz Rummenigge|Rummenigge'],
    80: ['Raymond Kopa|Kopa', 'Jean-Pierre Papin|Papin', 'Matthias Sammer|Sammer', 'Oleg Blokhin|Blokhin', 'Allan Simonsen|Simonsen', 'Igor Belanov|Belanov', 'Josef Masopust|Masopust', 'Denis Law|Law', 'Omar Sívori|Omar Sivori|Sívori|Sivori', 'Luis Suárez Miramontes|Suárez Miramontes', 'Gianni Rivera|Rivera', 'Aitana Bonmatí|Aitana|Bonmatí', 'Alexia Putellas|Alexia|Putellas'],
    100: ['Florian Albert|Albert', 'Megan Rapinoe|Rapinoe', 'Ada Hegerberg|Hegerberg'],
  }, `Ganadores del Balón de Oro masculino 1956-2025. Maradona y Pelé NO lo ganaron (solo honoríficos): inválidos a propósito. El ganador de 2026 se anuncia el 26 de octubre de 2026 en Londres: agregarlo si no estaba ya. "Suárez" o "Luis Suárez" solos no se aceptan (el uruguayo Luis Suárez nunca lo ganó). "Ronaldo" solo cuenta como Cristiano (nivel 10); Ronaldo Nazário se acepta como "R9" o con su nombre completo. ${NIVELES} Revisada 2026-10-15: lista 1956-2025 verificada; agregué las ganadoras del Balón de Oro femenino (Aitana Bonmatí y Alexia Putellas en 80, Rapinoe y Hegerberg en 100; quítalas si quieres solo el masculino); alias Leo/La Pulga, Ronaldo Fenómeno/Gordo, Cruijff, Yachin, Rossi.`),
]
