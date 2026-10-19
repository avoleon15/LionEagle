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

  q('ufc-campeonas', 'Deportes', 'Nombra una campeona de la UFC.', {
    10: ['Ronda Rousey|Rousey', 'Amanda Nunes|Nunes|La Leona|Lioness', 'Valentina Shevchenko|Shevchenko|Bullet', 'Zhang Weili|Weili Zhang|Weili', 'Holly Holm|Holm'],
    30: ['Cris Cyborg|Cyborg|Cristiane Justino', 'Joanna Jędrzejczyk|Joanna Jedrzejczyk|Jedrzejczyk|Joanna', 'Rose Namajunas|Namajunas|Thug Rose', 'Jessica Andrade|Andrade', 'Miesha Tate|Tate', 'Julianna Peña|Julianna Pena|Peña|Pena', 'Alexa Grasso|Grasso', 'Kayla Harrison|Harrison'],
    60: ['Germaine de Randamie|De Randamie', 'Carla Esparza|Esparza', 'Mackenzie Dern|Dern'],
    80: ['Natalia Silva|Natália Silva', 'Raquel Pennington|Pennington'],
    100: ['Nicco Montaño|Nicco Montano|Montaño|Montano'],
  }, `Campeonas indiscutidas de la UFC de todas las divisiones femeninas (Kayla Harrison, Mackenzie Dern y Natalia Silva son las actuales según las fuentes de octubre de 2026, sin fechas confirmadas). ${NIVELES} Revisada 2026-10-15: faltaban Raquel Pennington (campeona gallo en 2024) y Nicco Montaño (primera campeona mosca, 2017). Verificado: Natalia Silva ganó el título mosca vacante en UFC 332 (3 de octubre de 2026) tras la renuncia de Shevchenko; Dern es campeona paja desde UFC 321. Moví a Dern a 60 y a Natalia Silva a 80.`),


]
