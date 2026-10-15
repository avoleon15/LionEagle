import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales. Se aceptan nombres en español y los alias más comunes en inglés.'

export default [
  q('africa-paises', 'Geografía', 'Nombra un país de África.', {
    10: ['Egipto|Egypt', 'Sudáfrica|África del Sur|South Africa', 'Nigeria', 'Marruecos|Morocco', 'Kenia|Kenya'],
    30: ['Etiopía|Ethiopia', 'Argelia|Algeria', 'Ghana', 'Senegal', 'Camerún|Cameroon', 'Costa de Marfil|Côte d\'Ivoire|Cote d\'Ivoire|Ivory Coast', 'Túnez|Tunisia', 'Libia|Libya', 'Tanzania', 'Uganda', 'Somalia'],
    60: ['Congo|República del Congo|Congo-Brazzaville|Congo Brazzaville', 'República Democrática del Congo|RD Congo|RDC|Congo Kinshasa|Zaire', 'Angola', 'Mozambique', 'Zimbabue|Zimbabwe', 'Zambia', 'Madagascar', 'Namibia', 'Botsuana|Botswana', 'Sudán|Sudan', 'Mali', 'Ruanda|Rwanda', 'Mauritania', 'Liberia', 'Sierra Leona|Sierra Leone', 'Malaui|Malawi', 'Gabón|Gabon'],
    80: ['Níger|Niger', 'Chad', 'Togo', 'Benín|Benin', 'Burkina Faso', 'Burundi', 'Guinea', 'Gambia', 'Lesoto|Lesotho', 'Esuatini|Suazilandia|Swazilandia|Eswatini|Swaziland', 'Sudán del Sur|South Sudan', 'Mauricio|Mauritius', 'Cabo Verde|Cape Verde', 'Eritrea', 'Yibuti|Djibouti', 'Guinea Ecuatorial|Equatorial Guinea', 'República Centroafricana|Centroáfrica|Central African Republic'],
    100: ['Seychelles', 'Comoras|Comores|Comoros', 'Santo Tomé y Príncipe|Sao Tomé y Príncipe|Sao Tome y Principe|São Tomé e Príncipe', 'Guinea-Bisáu|Guinea Bisáu|Guinea Bissau|Guinea-Bissau'],
  }, `Los 54 países miembros de la ONU en África. Congo y República Democrática del Congo son países distintos (se acepta "Congo" solo como el primero). El Sáhara Occidental no está (no es miembro de la ONU). ${NIVELES}`),

  q('paises-letra-m', 'Geografía', 'Nombra un país que empiece con la letra M.', {
    10: ['México|Mexico', 'Marruecos|Morocco'],
    30: ['Malasia|Malaysia', 'Mónaco|Monaco', 'Mongolia', 'Malta', 'Madagascar', 'Mozambique', 'Mali', 'Maldivas|Maldives', 'Myanmar|Birmania|Burma'],
    60: ['Mauritania', 'Moldavia|Moldova|Moldavia', 'Montenegro', 'Macedonia del Norte|Macedonia'],
    80: ['Malaui|Malawi', 'Mauricio|Mauritius'],
    100: ['Micronesia|Estados Federados de Micronesia'],
  }, `Países reconocidos por la ONU cuyo nombre en español empieza con M. Las Islas Marshall empiezan con I, por eso no están. ${NIVELES}`),

  q('paises-letra-b', 'Geografía', 'Nombra un país que empiece con la letra B.', {
    10: ['Brasil|Brazil', 'Bélgica|Belgium', 'Bolivia'],
    30: ['Bulgaria', 'Bangladés|Bangladesh', 'Bielorrusia|Belarús|Belarus', 'Bahamas'],
    60: ['Barbados', 'Belice|Belize', 'Bosnia y Herzegovina|Bosnia|Bosnia Herzegovina', 'Baréin|Bahréin|Bahrein|Bahrain', 'Bután|Bhután|Bhutan'],
    80: ['Benín|Benin', 'Botsuana|Botswana', 'Burkina Faso', 'Burundi'],
    100: ['Brunéi|Brunei'],
  }, `Países reconocidos por la ONU cuyo nombre en español empieza con B. ${NIVELES}`),

  q('paises-letra-c', 'Geografía', 'Nombra un país que empiece con la letra C.', {
    10: ['Canadá|Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Cuba'],
    30: ['Croacia|Croatia', 'Camerún|Cameroon', 'Corea del Sur|South Korea', 'Corea del Norte|North Korea', 'Chipre|Cyprus', 'Camboya|Cambodia', 'Costa de Marfil|Côte d\'Ivoire|Ivory Coast', 'Chequia|República Checa|Czechia|Czech Republic'],
    60: ['Chad', 'Cabo Verde|Cape Verde', 'Congo|República del Congo|Congo-Brazzaville', 'Catar|Qatar'],
    100: ['Comoras|Comoros|Comores'],
  }, `Países reconocidos por la ONU cuyo nombre en español empieza con C (Catar con C; también se acepta Qatar). "Corea" a secas no cuenta (hay dos). Se acepta el nombre de Chequia o República Checa. ${NIVELES}`),

  q('paises-letra-s', 'Geografía', 'Nombra un país que empiece con la letra S.', {
    10: ['España|Spain', 'Suecia|Sweden', 'Suiza|Switzerland', 'Sudáfrica|South Africa'],
    30: ['Singapur|Singapore', 'Siria|Syria', 'Serbia', 'Senegal', 'Sudán|Sudan', 'Somalia', 'Sri Lanka', 'El Salvador|Salvador'],
    60: ['Surinam|Suriname', 'Santa Lucía|Saint Lucia|Santa Lucia', 'San Marino', 'Sierra Leona|Sierra Leone', 'Samoa', 'Sudán del Sur|South Sudan', 'Seychelles'],
    80: ['San Vicente y las Granadinas|San Vicente', 'San Cristóbal y Nieves|San Cristobal y Nieves|Saint Kitts y Nevis', 'Santo Tomé y Príncipe|Sao Tomé y Príncipe', 'Esuatini|Suazilandia|Swazilandia|Eswatini'],
    100: ['Islas Salomón|Salomón|Solomon Islands'],
  }, `Países reconocidos por la ONU cuyo nombre en español empieza con S. Incluí El Salvador aunque con el artículo empiece con E, porque casi todos lo piensan como S: decisión tuya. Eslovenia y Eslovaquia empiezan con E, no están. ${NIVELES}`),

  q('urss-paises', 'Geografía', 'Nombra un país que fue parte de la Unión Soviética.', {
    10: ['Rusia|Russia', 'Ucrania|Ukraine'],
    30: ['Bielorrusia|Belarús|Belarus', 'Kazajistán|Kazajstán|Kazakhstan', 'Lituania|Lithuania', 'Letonia|Latvia', 'Estonia', 'Georgia'],
    60: ['Armenia', 'Azerbaiyán|Azerbaijan', 'Uzbekistán|Uzbekistan', 'Moldavia|Moldova'],
    80: ['Turkmenistán|Turkmenistan', 'Tayikistán|Tayikistan|Tajikistan'],
    100: ['Kirguistán|Kirguizistán|Kirguistan|Kyrgyzstan'],
  }, `Las 15 repúblicas soviéticas. ${NIVELES}`),

  q('yugoslavia-paises', 'Geografía', 'Nombra un país que fue parte de la antigua Yugoslavia.', {
    10: ['Serbia', 'Croacia|Croatia'],
    30: ['Bosnia y Herzegovina|Bosnia|Bosnia Herzegovina', 'Eslovenia|Slovenia'],
    60: ['Montenegro', 'Macedonia del Norte|Macedonia|Macedonia del Norte'],
    100: ['Kosovo'],
  }, `Los 6 países que eran repúblicas de Yugoslavia más Kosovo (era provincia de Serbia; declaró su independencia en 2008 y no todos los países lo reconocen: decisión tuya si se queda). "Yugoslavia" no cuenta. ${NIVELES}`),

  q('sudamerica-paises', 'Geografía', 'Nombra un país de Sudamérica.', {
    10: ['Brasil|Brazil', 'Argentina', 'Colombia', 'Chile'],
    30: ['Perú|Peru', 'Venezuela', 'Ecuador', 'Uruguay'],
    60: ['Bolivia', 'Paraguay'],
    80: ['Guyana'],
    100: ['Surinam|Suriname'],
  }, `Los 12 países independientes. La Guayana Francesa no cuenta: es territorio de Francia. ${NIVELES}`),

  q('asia-paises', 'Geografía', 'Nombra un país de Asia.', {
    10: ['China', 'Japón|Japon|Japan', 'India', 'Corea del Sur|South Korea'],
    30: ['Tailandia|Thailand', 'Vietnam', 'Indonesia', 'Filipinas|Philippines', 'Corea del Norte|North Korea', 'Arabia Saudita|Arabia Saudí|Saudi Arabia', 'Irán|Iran', 'Irak|Iraq', 'Israel', 'Turquía|Turkey', 'Pakistán|Pakistan', 'Singapur|Singapore', 'Malasia|Malaysia', 'Emiratos Árabes Unidos|Emiratos|Dubái|United Arab Emirates|UAE'],
    60: ['Afganistán|Afghanistan', 'Bangladés|Bangladesh', 'Nepal', 'Camboya|Cambodia', 'Laos', 'Mongolia', 'Kazajistán|Kazajstán|Kazakhstan', 'Líbano|Lebanon', 'Siria|Syria', 'Jordania|Jordan', 'Catar|Qatar', 'Kuwait', 'Sri Lanka', 'Myanmar|Birmania|Burma', 'Taiwán|Taiwan'],
    80: ['Uzbekistán|Uzbekistan', 'Baréin|Bahréin|Bahrein|Bahrain', 'Omán|Oman', 'Yemen', 'Maldivas|Maldives', 'Armenia', 'Azerbaiyán|Azerbaijan', 'Georgia', 'Chipre|Cyprus', 'Kirguistán|Kirguizistán|Kyrgyzstan', 'Tayikistán|Tajikistan', 'Turkmenistán|Turkmenistan'],
    100: ['Timor Oriental|Timor-Leste|East Timor', 'Bután|Bhután|Bhutan', 'Brunéi|Brunei'],
  }, `Países miembros de la ONU en Asia (incluye Asia Occidental y Central: Turquía, Georgia, Armenia, Azerbaiyán, Chipre). Rusia no está porque la ONU la cuenta como Europa. Taiwán lo puse porque mucha gente lo nombra; Palestina la dejé fuera (reconocimiento disputado): decisión tuya. ${NIVELES}`),

  q('estados-eeuu', 'Geografía', 'Nombra un estado de Estados Unidos.', {
    10: ['California', 'Texas', 'Florida', 'Nueva York|New York'],
    30: ['Nevada', 'Arizona', 'Alaska', 'Hawái|Hawaii', 'Illinois', 'Georgia', 'Washington', 'Nuevo México|New Mexico', 'Luisiana|Louisiana', 'Colorado', 'Nueva Jersey|New Jersey', 'Pensilvania|Pennsylvania', 'Ohio', 'Míchigan|Michigan', 'Massachusetts', 'Virginia', 'Oregón|Oregon', 'Carolina del Norte|North Carolina', 'Carolina del Sur|South Carolina', 'Alabama', 'Utah'],
    60: ['Tennessee', 'Kentucky', 'Misuri|Missouri', 'Indiana', 'Minnesota', 'Wisconsin', 'Oklahoma', 'Kansas', 'Maryland', 'Connecticut', 'Arkansas', 'Misisipi|Mississippi', 'Montana', 'Idaho', 'Nebraska', 'Maine', 'Iowa', 'Virginia Occidental|West Virginia'],
    80: ['Dakota del Sur|South Dakota', 'Nuevo Hampshire|Nueva Hampshire|New Hampshire', 'Wyoming', 'Delaware'],
    100: ['Dakota del Norte|North Dakota', 'Vermont', 'Rhode Island|Rhode Island'],
  }, `Los 50 estados. "Carolina", "Dakota" o "Virginia" tienen versiones del norte/sur/occidental: "Virginia" cuenta como el estado de Virginia (nivel 30). Washington D.C. no es estado. ${NIVELES}`),

  q('europa-capitales', 'Geografía', 'Nombra una capital de Europa.', {
    10: ['Madrid', 'París|Paris', 'Londres|London', 'Roma|Rome', 'Berlín|Berlin'],
    30: ['Lisboa|Lisbon', 'Ámsterdam|Amsterdam', 'Atenas|Athens', 'Viena|Vienna', 'Bruselas|Brussels', 'Moscú|Moscow', 'Praga|Prague', 'Budapest', 'Varsovia|Warsaw', 'Estocolmo|Stockholm', 'Oslo', 'Copenhague|Copenhagen', 'Dublín|Dublin'],
    60: ['Helsinki', 'Berna|Bern', 'Bucarest|Bucharest', 'Sofía|Sofia', 'Belgrado|Belgrade', 'Zagreb', 'Kiev|Kyiv|Kyiv', 'Minsk', 'Reikiavik|Reykjavik|Reykjavík', 'Bratislava'],
    80: ['Liubliana|Ljubljana', 'Tallin|Tallinn', 'Riga', 'Vilna|Vilnius', 'Sarajevo', 'Skopie|Skopje', 'Tirana', 'Podgorica', 'Chisináu|Chisinau|Kishinev', 'Luxemburgo|Luxemburgo|Luxembourg', 'La Valeta|Valletta|La Valeta', 'Nicosia'],
    100: ['Andorra la Vieja|Andorra la Vella|Andorra', 'Vaduz', 'San Marino', 'Ciudad del Vaticano|Vaticano|Vatican City', 'Mónaco|Monaco', 'Pristina|Prishtina'],
  }, `Capitales de los países europeos (ONU) más Kosovo (Pristina). Mónaco, San Marino y el Vaticano cuentan porque la ciudad y el país se llaman igual (o casi). ${NIVELES}`),
]
