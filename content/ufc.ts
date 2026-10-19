import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido se nombra cada peleador. Solo cuentan campeones indiscutidos (no interinos), salvo que se diga otra cosa. El estado de los títulos actuales es de octubre de 2026 y cambia seguido: revisar con alguien que siga la UFC. Se aceptan apodos comunes.'

export default [
  q('ufc-campeones-peso-pesado', 'Deportes', 'Nombra un campeón de peso pesado de la UFC.', {
    10: ['Jon Jones|Jones|Bones', 'Francis Ngannou|Ngannou|The Predator', 'Brock Lesnar|Lesnar', 'Cain Velasquez|Velasquez|Velásquez', 'Stipe Miocic|Miocic', 'Daniel Cormier|Cormier|DC', 'Tom Aspinall|Aspinall'],
    30: ['Randy Couture|Couture', 'Junior dos Santos|Cigano|Dos Santos', 'Fabricio Werdum|Werdum', 'Ciryl Gane|Gane|Bon Gamin', 'Frank Mir|Mir', 'Andrei Arlovski|Arlovski', 'Tim Sylvia|Sylvia'],
    60: ['Josh Barnett|Barnett', 'Mark Coleman|Coleman'],
    80: ['Bas Rutten|Rutten', 'Kevin Randleman|Randleman'],
    100: ['Maurice Smith', 'Ricco Rodriguez|Ricco Rodríguez'],
  }, `Campeones indiscutidos de peso pesado de 1997 a 2026. Ciryl Gane es el campeón actual después de que Tom Aspinall dejara vacante el título en septiembre de 2026 (según las fuentes más recientes; confirmar). Dan Severn y los campeones interinos no cuentan. ${NIVELES} Revisada 2026-10-15: la lista de campeones está completa. Sobre Gane hay fuentes contradictorias (Dana White dijo en septiembre que seguía siendo interino; otras de octubre lo dan como indiscutido y con su primera defensa contra Josh Hokit el 14 de noviembre): se deja aceptado.`),

  q('ufc-campeones-semipesado', 'Deportes', 'Nombra un campeón de peso semipesado de la UFC.', {
    10: ['Jon Jones|Jones|Bones', 'Chuck Liddell|Liddell|The Iceman', 'Alex Pereira|Pereira|Poatan'],
    30: ['Daniel Cormier|Cormier|DC', 'Tito Ortiz|Ortiz', 'Randy Couture|Couture', 'Quinton Jackson|Rampage Jackson|Rampage', 'Lyoto Machida|Machida', 'Mauricio Rua|Shogun|Shogun Rua|Maurício Rua', 'Forrest Griffin|Griffin', 'Rashad Evans|Evans', 'Jan Błachowicz|Jan Blachowicz|Blachowicz', 'Jiří Procházka|Jiri Prochazka|Prochazka', 'Vitor Belfort|Vítor Belfort|Belfort'],
    60: ['Glover Teixeira|Teixeira', 'Magomed Ankalaev|Ankalaev', 'Jamahal Hill|Hill', 'Carlos Ulberg|Ulberg'],
    100: ['Frank Shamrock|Shamrock'],
  }, `Campeones indiscutidos de peso semipesado. Carlos Ulberg es el campeón actual según las fuentes de octubre de 2026 (ganó en UFC 327). ${NIVELES} Revisada 2026-10-15: faltaba Vitor Belfort (campeón en UFC 46, 2004).`),

  q('ufc-campeones-peso-ligero', 'Deportes', 'Nombra un campeón de peso ligero de la UFC.', {
    10: ['Conor McGregor|McGregor|Notorious', 'Khabib Nurmagomedov|Khabib|Nurmagomedov', 'Islam Makhachev|Makhachev', 'Charles Oliveira|Oliveira|Do Bronx', 'B.J. Penn|BJ Penn|Penn'],
    30: ['Justin Gaethje|Gaethje', 'Ilia Topuria|Topuria|El Matador', 'Frankie Edgar|Edgar', 'Benson Henderson|Henderson', 'Anthony Pettis|Pettis', 'Eddie Alvarez|Alvarez', 'Rafael dos Anjos|Dos Anjos'],
    60: ['Sean Sherk|Sherk'],
    100: ['Jens Pulver|Pulver'],
  }, `Campeones indiscutidos de peso ligero. Justin Gaethje es el actual según las fuentes de octubre de 2026 (venció a Topuria en junio de 2026); antes Topuria y Makhachev lo fueron. ${NIVELES} Revisada 2026-10-15: verificado (Gaethje ganó por TKO en UFC Freedom 250, el 14 de junio de 2026); la lista está completa.`),

  q('ufc-campeones-peso-welter', 'Deportes', 'Nombra un campeón de peso wélter de la UFC.', {
    10: ['Georges St-Pierre|Georges St-Pierre|GSP|St-Pierre|St Pierre', 'Kamaru Usman|Usman', 'Islam Makhachev|Makhachev'],
    30: ['Leon Edwards|Edwards|Rocky', 'Tyron Woodley|Woodley', 'Robbie Lawler|Lawler', 'Matt Hughes|Hughes', 'Belal Muhammad|Muhammad|Belal'],
    60: ['Johny Hendricks|Hendricks', 'Jack Della Maddalena|Della Maddalena|JDM', 'B.J. Penn|BJ Penn|Penn', 'Matt Serra|Serra'],
    80: ['Pat Miletich|Miletich'],
    100: ['Carlos Newton|Newton'],
  }, `Campeones indiscutidos de peso wélter. Islam Makhachev es el actual (ganó el título en UFC 322). ${NIVELES} Revisada 2026-10-15: faltaba Matt Serra (le ganó el título a GSP en UFC 69, 2007).`),

  q('ufc-campeones-peso-mediano', 'Deportes', 'Nombra un campeón de peso mediano de la UFC.', {
    10: ['Anderson Silva|The Spider|Spider', 'Israel Adesanya|Adesanya|Izzy|Stylebender', 'Alex Pereira|Pereira|Poatan'],
    30: ['Chris Weidman|Weidman', 'Luke Rockhold|Rockhold', 'Michael Bisping|Bisping', 'Robert Whittaker|Whittaker', 'Sean Strickland|Strickland', 'Dricus du Plessis|Du Plessis|Dricus', 'Khamzat Chimaev|Chimaev', 'Rich Franklin|Franklin'],
    60: ['Georges St-Pierre|GSP|St-Pierre'],
    80: ['Evan Tanner|Tanner'],
    100: ['Dave Menne|Menne', 'Murilo Bustamante|Bustamante'],
  }, `Campeones indiscutidos de peso mediano. Sean Strickland es el actual según las fuentes de octubre de 2026 (venció a Chimaev en UFC 328). "Silva" a secas no se acepta porque hay otras peleadoras con ese apellido. ${NIVELES}`),

  q('ufc-campeonas', 'Deportes', 'Nombra una campeona de la UFC.', {
    10: ['Ronda Rousey|Rousey', 'Amanda Nunes|Nunes|La Leona|Lioness', 'Valentina Shevchenko|Shevchenko|Bullet', 'Zhang Weili|Weili Zhang|Weili', 'Holly Holm|Holm'],
    30: ['Cris Cyborg|Cyborg|Cristiane Justino', 'Joanna Jędrzejczyk|Joanna Jedrzejczyk|Jedrzejczyk|Joanna', 'Rose Namajunas|Namajunas|Thug Rose', 'Jessica Andrade|Andrade', 'Miesha Tate|Tate', 'Julianna Peña|Julianna Pena|Peña|Pena', 'Alexa Grasso|Grasso', 'Kayla Harrison|Harrison'],
    60: ['Germaine de Randamie|De Randamie', 'Carla Esparza|Esparza', 'Mackenzie Dern|Dern'],
    80: ['Natalia Silva|Natália Silva', 'Raquel Pennington|Pennington'],
    100: ['Nicco Montaño|Nicco Montano|Montaño|Montano'],
  }, `Campeonas indiscutidas de la UFC de todas las divisiones femeninas (Kayla Harrison, Mackenzie Dern y Natalia Silva son las actuales según las fuentes de octubre de 2026, sin fechas confirmadas). ${NIVELES} Revisada 2026-10-15: faltaban Raquel Pennington (campeona gallo en 2024) y Nicco Montaño (primera campeona mosca, 2017). Verificado: Natalia Silva ganó el título mosca vacante en UFC 332 (3 de octubre de 2026) tras la renuncia de Shevchenko; Dern es campeona paja desde UFC 321. Moví a Dern a 60 y a Natalia Silva a 80.`),

  q('ufc-campeones-cualquiera', 'Deportes', 'Nombra un campeón o excampeón de la UFC (de cualquier división).', {
    10: ['Conor McGregor|McGregor|Notorious', 'Khabib Nurmagomedov|Khabib|Nurmagomedov', 'Jon Jones|Jones|Bones', 'Anderson Silva|The Spider|Spider', 'Georges St-Pierre|GSP|St-Pierre|St Pierre', 'Ronda Rousey|Rousey', 'Israel Adesanya|Adesanya|Izzy|Stylebender', 'Alex Pereira|Pereira|Poatan', 'Francis Ngannou|Ngannou', 'Islam Makhachev|Makhachev', 'Max Holloway|Holloway|Blessed', 'Amanda Nunes|Nunes|La Leona'],
    30: ['Brock Lesnar|Lesnar', 'Cain Velasquez|Velasquez|Velásquez', 'Daniel Cormier|Cormier|DC', 'Stipe Miocic|Miocic', 'Tom Aspinall|Aspinall', 'Chuck Liddell|Liddell|The Iceman', 'Randy Couture|Couture', 'Tito Ortiz|Ortiz', 'B.J. Penn|BJ Penn|Penn', 'Kamaru Usman|Usman', 'Leon Edwards|Edwards', 'Charles Oliveira|Oliveira', 'Ilia Topuria|Topuria|El Matador', 'Alexander Volkanovski|Volkanovski|Volk', 'Sean O\'Malley|O\'Malley|Suga', 'Aljamain Sterling|Sterling', 'Petr Yan|Yan|Piotr Yan', 'Henry Cejudo|Cejudo', 'Demetrious Johnson|Mighty Mouse|Demetrius Johnson', 'Valentina Shevchenko|Shevchenko|Bullet', 'Merab Dvalishvili|Merab|Dvalishvili|The Machine', 'Vitor Belfort|Vítor Belfort|Belfort', 'José Aldo|Jose Aldo|Aldo', 'Dominick Cruz|Cruz', 'Justin Gaethje|Gaethje', 'Sean Strickland|Strickland', 'Dricus du Plessis|Du Plessis|Dricus', 'Holly Holm|Holm', 'Zhang Weili|Weili Zhang|Weili', 'Rose Namajunas|Namajunas', 'Joanna Jędrzejczyk|Joanna Jedrzejczyk|Jedrzejczyk', 'Cris Cyborg|Cyborg', 'Miesha Tate|Tate', 'Kayla Harrison|Harrison', 'Alexa Grasso|Grasso', 'Junior dos Santos|Cigano|Dos Santos', 'Fabricio Werdum|Werdum', 'Robert Whittaker|Whittaker'],
    60: ['Frankie Edgar|Edgar', 'Benson Henderson|Henderson', 'Anthony Pettis|Pettis', 'Rafael dos Anjos|Dos Anjos', 'Eddie Alvarez|Alvarez', 'Robbie Lawler|Lawler', 'Tyron Woodley|Woodley', 'Matt Hughes|Hughes', 'Johny Hendricks|Hendricks', 'Rashad Evans|Evans', 'Lyoto Machida|Machida', 'Mauricio Rua|Shogun|Shogun Rua', 'Forrest Griffin|Griffin', 'Quinton Jackson|Rampage Jackson|Rampage', 'Rich Franklin|Franklin', 'Chris Weidman|Weidman', 'Luke Rockhold|Rockhold', 'Michael Bisping|Bisping', 'Jan Błachowicz|Jan Blachowicz|Blachowicz', 'Glover Teixeira|Teixeira', 'Jiří Procházka|Jiri Prochazka|Prochazka', 'Magomed Ankalaev|Ankalaev', 'Jamahal Hill|Hill', 'Belal Muhammad|Muhammad|Belal', 'Jack Della Maddalena|Della Maddalena|JDM', 'Carlos Ulberg|Ulberg', 'Joshua Van', 'Deiveson Figueiredo|Figueiredo', 'Brandon Moreno|Moreno', 'Alexandre Pantoja|Pantoja', 'T.J. Dillashaw|TJ Dillashaw|Dillashaw', 'Cody Garbrandt|Garbrandt', 'Julianna Peña|Julianna Pena|Peña', 'Jessica Andrade|Andrade', 'Carla Esparza|Esparza', 'Germaine de Randamie|De Randamie', 'Khamzat Chimaev|Chimaev', 'Ciryl Gane|Gane', 'Tim Sylvia|Sylvia', 'Frank Mir|Mir', 'Andrei Arlovski|Arlovski', 'Mark Coleman|Coleman', 'Josh Barnett|Barnett', 'Mackenzie Dern|Dern', 'Natalia Silva|Natália Silva', 'Matt Serra|Serra', 'Renan Barão|Renan Barao|Barão|Barao', 'Royce Gracie|Gracie'],
    80: ['Maurice Smith', 'Kevin Randleman|Randleman', 'Bas Rutten|Rutten', 'Pat Miletich|Miletich', 'Evan Tanner|Tanner', 'Sean Sherk|Sherk', 'Frank Shamrock', 'Ricco Rodriguez|Ricco Rodríguez', 'Raquel Pennington|Pennington', 'Ken Shamrock'],
    100: ['Jens Pulver|Pulver', 'Carlos Newton|Newton', 'Dave Menne|Menne', 'Murilo Bustamante|Bustamante', 'Nicco Montaño|Nicco Montano|Montaño', 'Dan Severn|Severn'],
  }, `Todos los campeones indiscutidos (no interinos) de las divisiones masculinas y femeninas, más los campeones actuales de octubre de 2026. Dustin Poirier y otros peleadores famosos que solo fueron campeones interinos NO cuentan: son inválidos a propósito (si prefieres aceptarlos, los agregas). Con solo el apellido se acepta cuando no hay confusión. ${NIVELES} Revisada 2026-10-15: faltaban campeones reales: Merab Dvalishvili (campeón gallo 2024-2025, en 30), Vitor Belfort, Matt Serra, Renan Barão, Raquel Pennington y Nicco Montaño. También acepto a los campeones de los primeros UFC: Royce Gracie (campeón de torneo de UFC 1, 2 y 4), Ken Shamrock y Dan Severn (campeones del Superfight); "Shamrock" solo ya no cuenta porque hay dos. Verificado: Petr Yan (gallo), Joshua Van (mosca), Volkanovski (pluma), Gaethje (ligero, desde junio de 2026), Makhachev (wélter), Strickland (mediano, UFC 328), Ulberg (semipesado), Gane (pesado; algunas fuentes dicen que es interino), Dern, Harrison y Natalia Silva.`),

  q('ufc-divisiones-peso', 'Deportes', 'Nombra una división de peso de la UFC.', {
    10: ['Peso pesado|Heavyweight|Peso completo|Pesado|Completo', 'Peso ligero|Lightweight|Ligero', 'Peso wélter|Peso welter|Welterweight|Welter|Wélter', 'Peso mediano|Middleweight|Mediano|Peso medio'],
    30: ['Peso pluma|Featherweight|Pluma', 'Peso gallo|Bantamweight|Gallo', 'Peso semipesado|Peso medio pesado|Light heavyweight|Semipesado|Semicompleto|Peso semicompleto'],
    60: ['Peso mosca|Flyweight|Mosca'],
    100: ['Peso paja|Strawweight|Paja'],
  }, `Las 8 divisiones masculinas más el peso paja, que en la UFC solo existe en mujeres (también hay mosca, gallo y pluma femenino). ${NIVELES} Revisada 2026-10-15: se acepta el nombre sin "peso" (pluma, gallo...) y los nombres mexicanos (peso completo, semicompleto, peso medio).`),
]
