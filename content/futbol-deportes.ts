import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales.'

export default [
  q('europa-league-ganadores', 'Fútbol', 'Nombra un equipo que haya ganado la Europa League (antes Copa UEFA).', {
    10: ['Sevilla|Sevilla FC', 'Manchester United|Man United|Man U', 'Chelsea', 'Atlético de Madrid|Atletico Madrid|Atleti|Atlético'],
    30: ['Villarreal', 'Eintracht Fráncfort|Eintracht Frankfurt|Frankfurt|Eintracht', 'Atalanta', 'Tottenham|Tottenham Hotspur|Spurs', 'Aston Villa|Villa', 'Liverpool', 'Juventus|Juve', 'Inter de Milán|Inter|Internazionale|Inter Milan', 'Porto|FC Porto', 'Real Madrid', 'Valencia', 'Napoli|Nápoles', 'Shakhtar Donetsk|Shakhtar|Shajtar', 'Bayern Múnich|Bayern|Bayern Munich'],
    60: ['Ajax', 'Bayer Leverkusen|Leverkusen', 'Zenit San Petersburgo|Zenit|Zenit St. Petersburg', 'Galatasaray', 'Feyenoord', 'PSV Eindhoven|PSV', 'Borussia Mönchengladbach|Gladbach|Mönchengladbach|Monchengladbach'],
    80: ['Schalke 04|Schalke', 'Parma', 'CSKA Moscú|CSKA Moscow|CSKA'],
    100: ['IFK Göteborg|IFK Goteborg|Göteborg|Goteborg', 'Ipswich Town|Ipswich', 'Anderlecht'],
  }, `Ganadores de la Copa UEFA (desde 1972) y de la Europa League hasta la final del 20 de mayo de 2026, que ganó Aston Villa 3-0 al Friburgo (verificado). No incluí la Copa de Ferias (anterior). 31 clubes. Cuando termine cada temporada hay que agregar al nuevo campeón. ${NIVELES}`),

  q('champions-league-ganadores', 'Fútbol', 'Nombra un equipo que haya ganado la Champions League (Copa de Europa).', {
    10: ['Real Madrid', 'Barcelona|FC Barcelona|Barça', 'Bayern Múnich|Bayern|Bayern Munich', 'Liverpool', 'Milan|AC Milan', 'Manchester City|Man City', 'Chelsea', 'PSG|Paris Saint-Germain|París Saint-Germain|Paris Saint Germain', 'Manchester United|Man United|Man U', 'Inter de Milán|Inter|Internazionale|Inter Milan'],
    30: ['Juventus|Juve', 'Ajax', 'Borussia Dortmund|Dortmund|BVB', 'Porto|FC Porto', 'Benfica'],
    60: ['Celtic', 'Olympique de Marsella|Marsella|Olympique Marseille|Marseille', 'Feyenoord', 'Hamburgo|Hamburger SV|Hamburg', 'PSV Eindhoven|PSV', 'Aston Villa|Villa', 'Nottingham Forest|Forest'],
    80: ['Estrella Roja de Belgrado|Estrella Roja|Red Star Belgrade|Crvena Zvezda'],
    100: ['Steaua Bucarest|Steaua|Steaua Bucharest'],
  }, `Los 24 clubes campeones de Europa hasta 2026 (PSG ganó la final del 30 de mayo de 2026 contra el Arsenal por penales, verificado). El Arsenal NO ha ganado: es una respuesta inválida a propósito. ${NIVELES}`),

  q('mundial-campeones', 'Fútbol', 'Nombra un país que haya ganado un Mundial de fútbol.', {
    10: ['Brasil|Brazil', 'Argentina', 'Francia|France', 'Alemania|Germany'],
    30: ['Italia|Italy', 'España|Spain'],
    60: ['Inglaterra|England'],
    100: ['Uruguay'],
  }, `Los 8 campeones del mundo hasta el Mundial 2026 (ganó España 1-0 a Argentina en la final del 19 de julio de 2026, verificado). Son pocos para que la pregunta dure; sirve como pregunta de relleno. ${NIVELES}`),

  q('premier-league-equipos', 'Fútbol', 'Nombra un equipo de la Premier League actual.', {
    10: ['Manchester United|Man United|Man U', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester City|Man City', 'Tottenham|Tottenham Hotspur|Spurs'],
    30: ['Newcastle|Newcastle United', 'Everton', 'Aston Villa|Villa', 'Leeds United|Leeds', 'Brighton|Brighton & Hove Albion|Brighton and Hove Albion'],
    60: ['Crystal Palace|Palace', 'Nottingham Forest|Forest', 'Fulham', 'Brentford', 'Bournemouth|AFC Bournemouth', 'Sunderland'],
    80: ['Ipswich Town|Ipswich'],
    100: ['Coventry City|Coventry', 'Hull City|Hull'],
  }, `Los 20 equipos de la temporada 2026-27 (comenzó el 21 de agosto de 2026; ascendieron Coventry, Ipswich y Hull; descendieron West Ham, Burnley y Wolves; verificado). West Ham, Burnley y Wolves NO cuentan. Hay que actualizar la lista cada temporada. ${NIVELES}`),

  q('nfl-equipos', 'Deportes', 'Nombra un equipo de la NFL.', {
    10: ['Dallas Cowboys|Cowboys|Dallas|Vaqueros', 'New England Patriots|Patriots|Patriotas|New England', 'Kansas City Chiefs|Chiefs|Kansas City|Kansas', 'San Francisco 49ers|49ers|Niners|San Francisco', 'Green Bay Packers|Packers|Green Bay'],
    30: ['Philadelphia Eagles|Eagles|Philadelphia|Filadelfia', 'Pittsburgh Steelers|Steelers|Pittsburgh', 'Chicago Bears|Bears|Chicago', 'New York Giants|Giants', 'Las Vegas Raiders|Raiders|Oakland Raiders|Las Vegas', 'Los Angeles Rams|Rams', 'Seattle Seahawks|Seahawks|Seattle', 'Denver Broncos|Broncos|Denver', 'Baltimore Ravens|Ravens|Baltimore', 'Buffalo Bills|Bills|Buffalo', 'Miami Dolphins|Dolphins|Miami', 'New York Jets|Jets'],
    60: ['Los Angeles Chargers|Chargers', 'Cincinnati Bengals|Bengals|Cincinnati', 'Detroit Lions|Lions|Detroit', 'Minnesota Vikings|Vikings|Minnesota', 'Tampa Bay Buccaneers|Buccaneers|Bucs|Tampa Bay|Tampa', 'New Orleans Saints|Saints|New Orleans', 'Atlanta Falcons|Falcons|Atlanta', 'Houston Texans|Texans|Houston', 'Indianapolis Colts|Colts|Indianapolis', 'Cleveland Browns|Browns|Cleveland'],
    80: ['Washington Commanders|Commanders|Washington|Washington Redskins|Redskins', 'Arizona Cardinals|Cardinals|Arizona', 'Carolina Panthers|Panthers|Carolina', 'Tennessee Titans|Titans|Tennessee'],
    100: ['Jacksonville Jaguars|Jaguars|Jacksonville'],
  }, `Los 32 equipos. "New York" y "Los Angeles" solos no cuentan (hay dos equipos en cada ciudad). Se acepta apodo, ciudad o nombre completo. ${NIVELES}`),

  q('nba-equipos', 'Deportes', 'Nombra un equipo de la NBA.', {
    10: ['Los Angeles Lakers|Lakers', 'Golden State Warriors|Warriors|Golden State', 'Chicago Bulls|Bulls|Chicago', 'Boston Celtics|Celtics|Boston', 'Miami Heat|Heat|Miami'],
    30: ['New York Knicks|Knicks', 'Brooklyn Nets|Nets|Brooklyn', 'San Antonio Spurs|Spurs|San Antonio', 'Los Angeles Clippers|Clippers', 'Dallas Mavericks|Mavericks|Mavs|Dallas', 'Phoenix Suns|Suns|Phoenix', 'Milwaukee Bucks|Bucks|Milwaukee', 'Philadelphia 76ers|76ers|Sixers|Philadelphia', 'Houston Rockets|Rockets|Houston', 'Denver Nuggets|Nuggets|Denver'],
    60: ['Toronto Raptors|Raptors|Toronto', 'Cleveland Cavaliers|Cavaliers|Cavs|Cleveland', 'Oklahoma City Thunder|Thunder|Oklahoma City|Oklahoma', 'Memphis Grizzlies|Grizzlies|Memphis', 'Atlanta Hawks|Hawks|Atlanta', 'Sacramento Kings|Kings|Sacramento', 'Minnesota Timberwolves|Timberwolves|Wolves|Minnesota', 'New Orleans Pelicans|Pelicans|New Orleans', 'Detroit Pistons|Pistons|Detroit', 'Indiana Pacers|Pacers|Indiana', 'Orlando Magic|Magic|Orlando'],
    80: ['Charlotte Hornets|Hornets|Charlotte', 'Utah Jazz|Jazz|Utah', 'Portland Trail Blazers|Trail Blazers|Blazers|Portland'],
    100: ['Washington Wizards|Wizards|Washington'],
  }, `Los 30 equipos. "Los Angeles" y "New York" solos no cuentan (dos equipos en cada ciudad). ${NIVELES}`),

  q('deportes-contacto', 'Deportes', 'Nombra un deporte de contacto.', {
    10: ['Fútbol americano|Football americano|American football|Futbol americano', 'Boxeo|Box|Boxing', 'Rugby', 'MMA|Artes marciales mixtas|UFC'],
    30: ['Lucha libre|Wrestling|Lucha', 'Hockey sobre hielo|Hockey', 'Karate|Kárate', 'Judo|Yudo', 'Taekwondo|Tae kwon do', 'Fútbol|Futbol|Soccer', 'Jiu-jitsu|Jiujitsu|Jiu jitsu|Jiu-jitsu brasileño'],
    60: ['Baloncesto|Basquetbol|Básquetbol|Basketball', 'Kickboxing|Kick boxing', 'Muay Thai|Muay thai', 'Lucha olímpica|Lucha grecorromana', 'Waterpolo|Water polo', 'Kung fu|Kungfu', 'Krav Maga'],
    80: ['Lacrosse', 'Sumo', 'Capoeira', 'Hockey sobre césped|Hockey sobre pasto|Hockey de campo', 'Balonmano|Handball', 'Aikido|Aikidō'],
    100: ['Fútbol australiano|Australian football|Footy', 'Fútbol gaélico|Gaelic football', 'Hurling', 'Sambo', 'Savate', 'Roller derby', 'Kendo|Kendō'],
  }, `Interpretación abierta: incluí los deportes que la gente suele nombrar como "de contacto", incluso los de contacto limitado (fútbol, baloncesto, balonmano). Decisión tuya si prefieres excluir los de contacto limitado. ${NIVELES}`),

  q('balon-de-oro-ganadores', 'Fútbol', 'Nombra un ganador del Balón de Oro.', {
    10: ['Lionel Messi|Messi', 'Cristiano Ronaldo|Cristiano|CR7|Ronaldo'],
    30: ['Luka Modrić|Luka Modric|Modrić|Modric', 'Karim Benzema|Benzema', 'Ronaldinho|Ronaldinho Gaúcho', 'Kaká|Kaka', 'Ronaldo Nazário|R9|Ronaldo Nazario|El Fenómeno', 'Zinedine Zidane|Zidane|Zizou', 'Johan Cruyff|Cruyff|Cruyff', 'Rodri|Rodrigo Hernández', 'Ousmane Dembélé|Dembélé|Dembele'],
    60: ['Ruud Gullit|Gullit', 'Marco van Basten|Van Basten', 'Michel Platini|Platini', 'Franz Beckenbauer|Beckenbauer|Kaiser', 'George Best|Best', 'Roberto Baggio|Baggio', 'Luís Figo|Luis Figo|Figo', 'Rivaldo', 'Andriy Shevchenko|Shevchenko|Sheva', 'Pavel Nedvěd|Pavel Nedved|Nedved', 'Michael Owen|Owen', 'Fabio Cannavaro|Cannavaro', 'Gerd Müller|Gerd Muller|Müller|Muller', 'Eusébio|Eusebio', 'Bobby Charlton|Charlton', 'Lev Yashin|Yashin|Lev Yashin', 'Stanley Matthews|Matthews', 'Alfredo Di Stéfano|Di Stéfano|Di Stefano', 'Lothar Matthäus|Lothar Matthaus|Matthäus|Matthaus', 'George Weah|Weah', 'Hristo Stoichkov|Stoichkov', 'Paolo Rossi', 'Kevin Keegan|Keegan', 'Karl-Heinz Rummenigge|Rummenigge'],
    80: ['Raymond Kopa|Kopa', 'Jean-Pierre Papin|Papin', 'Matthias Sammer|Sammer', 'Oleg Blokhin|Blokhin', 'Allan Simonsen|Simonsen', 'Igor Belanov|Belanov', 'Josef Masopust|Masopust', 'Denis Law|Law', 'Omar Sívori|Omar Sivori|Sívori|Sivori', 'Luis Suárez Miramontes|Suárez Miramontes', 'Gianni Rivera|Rivera'],
    100: ['Florian Albert|Albert'],
  }, `Ganadores del Balón de Oro masculino 1956-2025. Maradona y Pelé NO lo ganaron (solo honoríficos): inválidos a propósito. El ganador de 2026 se anuncia el 26 de octubre de 2026 en Londres: agregarlo si no estaba ya. "Suárez" o "Luis Suárez" solos no se aceptan (el uruguayo Luis Suárez nunca lo ganó). "Ronaldo" solo cuenta como Cristiano (nivel 10); Ronaldo Nazário se acepta como "R9" o con su nombre completo. ${NIVELES}`),
]
