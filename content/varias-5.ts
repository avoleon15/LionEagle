import { q } from '../server/src/dsl'

const NIVELES = 'Niveles estimados según qué tan seguido la gente nombra cada respuesta; hay que calibrarlos con partidas reales.'

// Tres preguntas pedidas por el dueño (2026-10-22). Valores de vitamina C y calcio en mg por 100 g (tablas de Wikipedia / USDA).
export default [
  // ---------------------------------------------------------------- fuente-vitamina-c
  q(
    'fuente-vitamina-c',
    'Cuerpo y salud',
    'Nombra una fuente importante de vitamina C (un alimento que tenga mucha).',
    {
      10: ['Naranja|Orange', 'Limón|Lemon', 'Kiwi'],
      30: ['Fresa|Frutilla|Strawberry', 'Mandarina|Tangerine', 'Pimiento|Pimentón|Chile morrón|Bell pepper', 'Brócoli|Broccoli', 'Guayaba|Guava', 'Toronja|Pomelo|Grapefruit'],
      60: ['Papaya|Lechosa', 'Piña|Ananá|Pineapple', 'Lima', 'Coles de Bruselas|Repollitos de Bruselas|Brussels sprouts', 'Coliflor|Cauliflower', 'Col|Repollo|Cabbage', 'Espinaca|Spinach', 'Melón|Cantaloupe', 'Maracuyá|Parchita|Fruta de la pasión|Passion fruit', 'Frambuesa|Raspberry', 'Grosella negra|Blackcurrant'],
      80: ['Acerola|Cereza de las Antillas', 'Camu camu', 'Escaramujo|Rosa mosqueta|Rosehip', 'Grosella india|Amla|Indian gooseberry', 'Espino amarillo|Sea buckthorn', 'Col rizada|Kale', 'Mango'],
      100: ['Ciruela Kakadu|Kakadu plum', 'Grosella roja|Redcurrant', 'Saúco|Elderberry', 'Mora ártica|Cloudberry', 'Loganberry'],
    },
    `${NIVELES} Criterio: unos 30 mg o más por 100 g (la dosis diaria recomendada ronda 75–90 mg). Se cuentan frutas y verduras crudas; los productos de origen animal casi no tienen. Mango (28 mg) queda en el límite.`,
  ),

  // ---------------------------------------------------------------- fuente-calcio
  q(
    'fuente-calcio',
    'Cuerpo y salud',
    'Nombra una fuente importante de calcio (un alimento que tenga mucho).',
    {
      10: ['Leche|Milk', 'Queso|Cheese', 'Yogur|Yogurt|Yoghurt'],
      30: ['Almendras|Almendra|Almonds', 'Sardinas|Sardina|Sardines', 'Tofu', 'Brócoli|Broccoli', 'Espinaca|Spinach', 'Requesón|Ricotta|Cottage'],
      60: ['Semillas de sésamo|Sésamo|Ajonjolí|Sesame', 'Col rizada|Kale', 'Chía|Semillas de chía|Chia', 'Higos secos|Higo seco|Higos|Dried figs', 'Leche de soya|Leche de soja|Bebida de soya', 'Mozzarella|Mozarela', 'Parmesano|Parmesan', 'Cheddar|Queso cheddar', 'Salmón enlatado|Salmón en lata', 'Frijoles blancos|Alubias|Judías blancas|White beans', 'Avellanas|Hazelnuts'],
      80: ['Tahini|Tahín|Pasta de sésamo', 'Leche en polvo|Leche en polvo entera|Milk powder', 'Col china|Pak choi|Bok choy', 'Hojas de nabo|Nabo', 'Berros|Berro|Watercress', 'Melaza|Molasses', 'Anchoas|Anchoa', 'Hojas de col|Berza|Collard greens'],
      100: ['Cáscara de huevo|Cascarón de huevo', 'Espinas de pescado|Huesos de pescado', 'Okra|Quimbombó', 'Leche de cabra|Goat milk', 'Queso de cabra'],
    },
    `${NIVELES} Criterio: unos 100 mg o más por 100 g (la dosis diaria recomendada ronda 1000 mg). Espinaca tiene ~99 mg pero se absorbe poco por los oxalatos; se acepta porque mucha gente la nombra. Brócoli (47 mg) es más bajo pero muy nombrado; si molesta, se puede quitar.`,
  ),

  // ---------------------------------------------------------------- tipos-lookmaxing
  q(
    'tipos-lookmaxing',
    'Cuerpo y salud',
    'Nombra un tipo de lookmaxing (algo que alguien hace para verse más atractivo).',
    {
      10: ['Mewing', 'Skincare|Cuidado de la piel|Rutina de skincare|Skinmaxxing', 'Gym|Gimnasio|Ejercicio|Gymmaxxing|Fitmaxxing'],
      30: ['Cirugía estética|Cirugía plástica|Operación estética', 'Peinado|Cabello|Corte de pelo|Hairmaxxing', 'Dieta|Bajar de peso|Perder grasa|Cutting', 'Softmaxxing|Soft maxxing', 'Hardmaxxing|Hard maxxing', 'Blanqueamiento dental|Blanquear los dientes|Teeth whitening'],
      60: ['Heightmaxxing|Aumentar la estatura|Alargamiento de piernas', 'Rinoplastia|Operación de nariz', 'Ortodoncia|Brackets|Frenos|Braces', 'Bótox|Botox', 'Rellenos|Fillers|Ácido hialurónico', 'Minoxidil', 'Finasterida|Finasteride', 'Tomar sol|Bronceado|Tanning', 'Barba|Cuidado de la barba|Beardmaxxing', 'Ropa|Estilo|Vestimenta|Fashionmaxxing|Dripmaxxing'],
      80: ['Masticar chicle de mástique|Mastic gum|Falim|Masticar goma', 'Microneedling|Dermaroller|Microagujas', 'Retinol|Tretinoína|Tretinoin', 'Implante de mentón|Mentonoplastia|Cirugía de mentón', 'Trasplante de cabello|Injerto capilar', 'Perfume|Fragancia|Colonia', 'Jawline|Mandíbula marcada|Jawmaxxing', 'Sleepmaxxing|Dormir bien'],
      100: ['Bonesmashing|Bone smashing|Golpearse la cara', 'Roidmaxxing|Esteroides|Anabólicos', 'Cirugía de piernas|Alargamiento óseo', 'Eyemaxxing|Cuidado de ojos', 'Chewmaxxing|Masticar duro'],
    },
    `${NIVELES} Lookmaxing: término de internet (nacido en foros incel, hoy muy usado en TikTok) para maximizar el atractivo físico. Se aceptan las prácticas con nombre propio (-maxxing) y las cosas concretas que la gente hace. Bonesmashing y esteroides están al final porque son peligrosos: se aceptan como respuesta, no se promueven.`,
  ),
]
