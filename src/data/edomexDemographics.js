// Base de datos de Demografía, Problemáticas Locales y Perfiles del Estado de México y la República Mexicana
// Fuentes de referencia: INEGI Censo de Población y Vivienda, CONEVAL, Portal del Gobierno del Estado de México

const ESTADOS_MEXICO = [
  { id: 'MEX', nombre: 'Estado de México', predeterminado: true },
  { id: 'AGS', nombre: 'Aguascalientes' },
  { id: 'BCN', nombre: 'Baja California' },
  { id: 'BCS', nombre: 'Baja California Sur' },
  { id: 'CAM', nombre: 'Campeche' },
  { id: 'CHP', nombre: 'Chiapas' },
  { id: 'CHH', nombre: 'Chihuahua' },
  { id: 'CMX', nombre: 'Ciudad de México' },
  { id: 'COA', nombre: 'Coahuila' },
  { id: 'COL', nombre: 'Colima' },
  { id: 'DUR', nombre: 'Durango' },
  { id: 'GUA', nombre: 'Guanajuato' },
  { id: 'GRO', nombre: 'Guerrero' },
  { id: 'HID', nombre: 'Hidalgo' },
  { id: 'JAL', nombre: 'Jalisco' },
  { id: 'MIC', nombre: 'Michoacán' },
  { id: 'MOR', nombre: 'Morelos' },
  { id: 'NAY', nombre: 'Nayarit' },
  { id: 'NLE', nombre: 'Nuevo León' },
  { id: 'OAX', nombre: 'Oaxaca' },
  { id: 'PUE', nombre: 'Puebla' },
  { id: 'QUE', nombre: 'Querétaro' },
  { id: 'ROO', nombre: 'Quintana Roo' },
  { id: 'SLP', nombre: 'San Luis Potosí' },
  { id: 'SIN', nombre: 'Sinaloa' },
  { id: 'SON', nombre: 'Sonora' },
  { id: 'TAB', nombre: 'Tabasco' },
  { id: 'TAM', nombre: 'Tamaulipas' },
  { id: 'TLA', nombre: 'Tlaxcala' },
  { id: 'VER', nombre: 'Veracruz' },
  { id: 'YUC', nombre: 'Yucatán' },
  { id: 'ZAC', nombre: 'Zacatecas' }
];

// Perfiles detallados de los municipios más poblados y estratégicos del Estado de México
const MUNICIPIOS_EDOMEX_DETALLADOS = {
  'Ecatepec de Morelos': {
    poblacion: 1645352,
    zona: 'Valle de México (Oriente)',
    nse: { 'A/B': 3, 'C+': 12, 'C': 30, 'D+': 35, 'D/E': 20 },
    colonias: [
      'Ciudad Azteca', 'San Cristóbal Centro', 'Jardines de Morelos', 'Las Américas',
      'Chiconautla', 'Hank González', 'San Agustín', 'Santa María Tulpetlac',
      'Valle de Aragón 3ra Sección', 'Polígonos 1 y 2', 'La Veleta', 'El Chamizal'
    ],
    problematicasWeb: [
      {
        tema: 'Crisis severa de agua potable y huachicol de pozos',
        severidad: 'Crítica',
        descripcion: 'Miles de familias en la 5ta Zona y colonias altas dependen de pipas clandestinas de hasta $1,800 pesos por viaje tras reducción del Cutzamala.'
      },
      {
        tema: 'Inseguridad en transporte público (rutas de combis y paraderos)',
        severidad: 'Alta',
        descripcion: 'Asaltos recurrentes en tramos de la Vía Morelos, R-1 y paraderos del Mexibús; reclamo ciudadano por cámaras conectadas al C5.'
      },
      {
        tema: 'Inundaciones y colapso de colectores pluviales',
        severidad: 'Alta',
        descripcion: 'Anegaciones recurrentes en temporada de lluvias sobre Av. Central y Vía Morelos por acumulación de basura y azolve.'
      },
      {
        tema: 'Falta de áreas verdes y contaminación atmosférica',
        severidad: 'Media-Alta',
        descripcion: 'Déficit histórico de parques públicos arbolados; la Sierra de Guadalupe sufre presión constante por asentamientos irregulares.'
      },
      {
        tema: 'Comercio informal y congestionamiento vial',
        severidad: 'Media',
        descripcion: 'Tensión entre tianguistas ambulantes y comercios establecidos por invasión de banquetas y carriles en vialidades primarias.'
      }
    ],
    jergaLocal: ['la combi', 'la quinta zona', 'el Cutzamala', 'las pipas', 'la bajada del cerro', 'Vía Morelos', 'San Cristóbal']
  },

  'Toluca': {
    poblacion: 910608,
    zona: 'Valle de Toluca (Capital)',
    nse: { 'A/B': 8, 'C+': 18, 'C': 34, 'D+': 26, 'D/E': 14 },
    colonias: [
      'Centro Histórico', 'San Mateo Oxtotitlán', 'San Pedro Totoltepec', 'Capultitlán',
      'Santa Ana Tlapaltitlán', 'Cacalomacán', 'La Crespa', 'San Pablo Autopan',
      'El Seminario', 'Moderna de la Cruz', 'Los Sauces', 'Santiago Tlacotepec'
    ],
    problematicasWeb: [
      {
        tema: 'Bacheo generalizado y deterioro de vialidades primarias',
        severidad: 'Crítica',
        descripcion: 'Avenidas emblemáticas (Paseo Tollocan, Alfredo del Mazo, Las Torres) con cráteres que dañan suspensión vehicular y ciclovías.'
      },
      {
        tema: 'Contingencias ambientales y quema de pastizales en invierno',
        severidad: 'Alta',
        descripcion: 'Frecuentes contingencias por PM2.5 y PM10 debido a la altitud, inversión térmica y emisiones del corredor industrial Lerma-Toluca.'
      },
      {
        tema: 'Comercio ambulante en el Centro Histórico y Terminal',
        severidad: 'Media-Alta',
        descripcion: 'Disputa por espacios peatonales entre líderes de comerciantes y autoridades municipales en la zona de los Portales y la Terminal.'
      },
      {
        tema: 'Escasez de agua en delegaciones del norte (Autopan, Totoltepec)',
        severidad: 'Alta',
        descripcion: 'Baja presión en la red y desabasto prolongado en delegaciones de origen otomí y periurbanas.'
      },
      {
        tema: 'Integración y movilidad hacia la estación del Tren Interurbano El Insurgente',
        severidad: 'Media',
        descripcion: 'Falta de rutas alimentadoras seguras y ciclovías confinadas para conectar las colonias con las estaciones de Zinacantepec y Pino Suárez.'
      }
    ],
    jergaLocal: ['los Portales', 'Tollocan', 'el frío de Toluca', 'la Terminal', 'las delegaciones', 'el chorizo verde', 'los camiones']
  },

  'Naucalpan de Juárez': {
    poblacion: 834434,
    zona: 'Valle de México (Poniente)',
    nse: { 'A/B': 18, 'C+': 22, 'C': 28, 'D+': 20, 'D/E': 12 },
    colonias: [
      'Ciudad Satélite', 'San Bartolo Centro', 'Lomas Verdes', 'Echegaray',
      'San Mateo Nopala', 'El Molinito', 'San Francisco Chimalpa', 'Las Huertas',
      'Bosques de Moctezuma', 'Rinconada del Molino', 'Praderas de San Mateo', 'La Florida'
    ],
    problematicasWeb: [
      {
        tema: 'Saturación del Periférico Norte y deficiente transporte metropolitano',
        severidad: 'Crítica',
        descripcion: 'Tiempos de traslado de hasta 2 horas hacia CDMX; conflicto con transportistas por modernización de unidades y tarifas.'
      },
      {
        tema: 'Contaminación de la Presa Madín y áreas naturales protegidas',
        severidad: 'Alta',
        descripcion: 'Descarga de aguas residuales sin tratamiento y plaga de lirio acuático que afecta la biodiversidad y el suministro de agua tratada.'
      },
      {
        tema: 'Inseguridad en zonas populares (El Molinito, San Bartolo)',
        severidad: 'Alta',
        descripcion: 'Robo a transeúnte, asaltos en paraderos de Cuatro Caminos y extorsión a pequeños comerciantes.'
      },
      {
        tema: 'Cortes en suministro de agua y dependencia del Sistema Cutzamala',
        severidad: 'Alta',
        descripcion: 'Colonias de clase media y popular enfrentan tandeos de hasta 4 días a la semana sin agua de red.'
      },
      {
        tema: 'Protección y bienestar animal / sobrepoblación canina callejera',
        severidad: 'Media',
        descripcion: 'Creciente demanda vecinal por esterilizaciones masivas, albergues dignos y sanciones severas al maltrato animal.'
      }
    ],
    jergaLocal: ['Satélite', 'las Torres', 'Cuatro Caminos', 'Lomas Verdes', 'la Presa Madín', 'San Bartolo', 'la combi a Toreo']
  },

  'Tlalnepantla de Baz': {
    poblacion: 672202,
    zona: 'Valle de México (Norte)',
    nse: { 'A/B': 10, 'C+': 20, 'C': 35, 'D+': 25, 'D/E': 10 },
    colonias: [
      'Tlalnepantla Centro', 'San Javier', 'Viveros del Valle', 'Valle Ceylán',
      'San Juan Ixhuatepec (San Juanico)', 'Tenayuca', 'La Romana', 'Los Reyes Ixtacala',
      'San Pedro Barrientos', 'Santa Cecilia Acatitlán', 'Loma Bonita', 'Prados Vallejo'
    ],
    problematicasWeb: [
      {
        tema: 'Tráfico pesado y contaminación en corredores industriales (Gustavo Baz / Mario Colín)',
        severidad: 'Crítica',
        descripcion: 'Circulación constante de transporte de carga pesada que destruye pavimento y eleva emisiones de dióxido de carbono.'
      },
      {
        tema: 'Riesgo geológico y asentamientos irregulares en el Cerro del Chiquihuite',
        severidad: 'Alta',
        descripcion: 'Temor constante a deslaves en temporadas de lluvia y falta de reubicación efectiva de familias en zona de alto peligro.'
      },
      {
        tema: 'Tensión entre zona Poniente y zona Oriente (división por la CDMX)',
        severidad: 'Media-Alta',
        descripcion: 'San Juanico y la zona oriente reportan abandono de servicios públicos comparado con la zona industrial poniente.'
      },
      {
        tema: 'Inseguridad en transporte hacia paraderos de Indios Verdes y Suburbano',
        severidad: 'Alta',
        descripcion: 'Asaltos en microbuses y puentes peatonales de conexión al Tren Suburbano Tlalnepantla y San Rafael.'
      },
      {
        tema: 'Falta de espacios verdes comunitarios y canchas públicas',
        severidad: 'Media',
        descripcion: 'Alta densidad industrial y urbana con escasas áreas arboladas por habitante (menos de 2 m² por persona).'
      }
    ],
    jergaLocal: ['Gustavo Baz', 'el Chiquihuite', 'San Juanico', 'el Suburbano', 'Tenayuca', 'Mario Colín']
  },

  'Nezahualcóyotl': {
    poblacion: 1077208,
    zona: 'Valle de México (Oriente)',
    nse: { 'A/B': 4, 'C+': 14, 'C': 38, 'D+': 32, 'D/E': 12 },
    colonias: [
      'Benito Juárez', 'La Perla', 'Maravillas', 'Esperanza',
      'Metropolitana 2da Sección', 'El Sol', 'Agua Azul', 'Bosques de Aragón',
      'Las Flores', 'Campestre Guadalupana', 'Plazas de Aragón', 'Porfirio Díaz'
    ],
    problematicasWeb: [
      {
        tema: 'Hundimientos de suelo, fracturas y colapso de la red de drenaje',
        severidad: 'Crítica',
        descripcion: 'Fallas geológicas provocan hundimientos diferenciales y fugas subterráneas de agua dulce y residual en más de 20 colonias.'
      },
      {
        tema: 'Calidad deficiente del agua potable (agua turbia o con sedimentos)',
        severidad: 'Alta',
        descripcion: 'Vecinos denuncian agua con olor fétido o coloración amarillenta proveniente de pozos sobreexplotados.'
      },
      {
        tema: 'Apoyo urgente al comercio barrial y microempresas familiares',
        severidad: 'Media-Alta',
        descripcion: 'La economía de Neza se sostiene en talleres mecánicos, tianguis y accesorias que demandan incentivos fiscales y seguridad.'
      },
      {
        tema: 'Déficit de arbolado urbano e islas de calor',
        severidad: 'Alta',
        descripcion: 'Uno de los municipios más pavimentados de América Latina; urge programa masivo de techos verdes y reforestación de camellones.'
      },
      {
        tema: 'Alumbrado público y senderos seguros para mujeres y estudiantes',
        severidad: 'Alta',
        descripcion: 'Luminarias descompuestas en calles secundarias elevan riesgo de asaltos y acoso en las noches.'
      }
    ],
    jergaLocal: ['Neza', 'Av. Pantitlán', 'el Bordo de Xochiaca', 'la López Mateos', 'las combis moradas', 'el Coyote', 'Aragón']
  },

  'Chimalhuacán': {
    poblacion: 705193,
    zona: 'Valle de México (Oriente)',
    nse: { 'A/B': 2, 'C+': 8, 'C': 26, 'D+': 42, 'D/E': 22 },
    colonias: [
      'Cabecera Municipal', 'San Lorenzo', 'Acuitlapilco', 'Xochiaca',
      'Tlatel Xochitenco', 'Fundidores', 'Vidrieros', 'Santa María Nativitas',
      'Barrio Alfareros', 'San Agustín Atlapulco'
    ],
    problematicasWeb: [
      { tema: 'Falta de pavimentación y drenaje en zonas de los cerros', severidad: 'Crítica', descripcion: 'Calles de terracería que se convierten en lodazales en lluvias e impiden paso de servicios de emergencia.' },
      { tema: 'Transporte público irregular e inseguro', severidad: 'Alta', descripcion: 'Mototaxis sin regulación y microbuses saturados con altas tasas de robo en rutas hacia Pantitlán y La Paz.' },
      { tema: 'Desabasto de agua por red pública', severidad: 'Alta', descripcion: 'Dependencia extrema de pipas particulares con cobros arbitrarios.' },
      { tema: 'Falta de empleo formal en el municipio', severidad: 'Media-Alta', descripcion: 'Más del 60% de la población activa debe trasladarse diariamente a la CDMX para trabajar.' },
      { tema: 'Manejo deficiente de basura y tiraderos a cielo abierto', severidad: 'Alta', descripcion: 'Quema ilegal de basura y falta de camiones recolectores en colonias altas.' }
    ],
    jergaLocal: ['el cerro de Chimalhuacán', 'el Bordo', 'los mototaxis', 'los canteros', 'Pantitlán']
  },

  'Cuautitlán Izcalli': {
    poblacion: 555163,
    zona: 'Valle de México (Norte)',
    nse: { 'A/B': 14, 'C+': 24, 'C': 34, 'D+': 20, 'D/E': 8 },
    colonias: [
      'Centro Urbano', 'Ensueños', 'Atlanta', 'Infonavit Norte',
      'Santa Rosa de Lima', 'Bosques del Lago', 'Cofradía de San Miguel',
      'Tepojaco', 'San Antonio', 'La Quebrada'
    ],
    problematicasWeb: [
      { tema: 'Deterioro ecológico del Lago de Guadalupe y Laguna de La Piedad', severidad: 'Alta', descripcion: 'Mortandad recurrente de patos y peces por descargas clandestinas de aguas negras de fraccionamientos vecinos.' },
      { tema: 'Baches severos en vialidades industriales y primarias', severidad: 'Crítica', descripcion: 'La autopista México-Querétaro y arterias municipales presentan baches profundos causados por transporte de carga.' },
      { tema: 'Inseguridad en transporte y centros comerciales', severidad: 'Media-Alta', descripcion: 'Robos a transeúnte y comercio en zonas concurridas.' },
      { tema: 'Tandeo de agua potable en colonias residenciales y populares', severidad: 'Alta', descripcion: 'Frecuentes fallas en pozos locales y disminución de caudal del Cutzamala.' },
      { tema: 'Falta de transporte público sustentable interno', severidad: 'Media', descripcion: 'Falta de ciclovías seguras y transporte eléctrico interurbano.' }
    ],
    jergaLocal: ['Izcalli', 'Bosques del Lago', 'la México-Querétaro', 'Centro Urbano', 'Luna Park', 'el Lago']
  },

  'Texcoco': {
    poblacion: 277562,
    zona: 'Valle de México (Oriente-Agrícola)',
    nse: { 'A/B': 10, 'C+': 20, 'C': 38, 'D+': 22, 'D/E': 10 },
    colonias: [
      'Texcoco Centro', 'San Felipe', 'La Purificación', 'San Miguel Tlaixpan',
      'Coatlinchán', 'Huexotla', 'San Juan Tezontla', 'Santa Cruz de Arriba',
      'San Luis Huexotla', 'Montecillo'
    ],
    problematicasWeb: [
      { tema: 'Preservación de tierras agrícolas y el Parque Ecológico Lago de Texcoco', severidad: 'Crítica', descripcion: 'Presión inmobiliaria por fraccionar tierras ejidales versus vocación agroecológica y reserva lacustre.' },
      { tema: 'Saturación vial en la carretera federal México-Texcoco', severidad: 'Alta', descripcion: 'Congestionamiento diario y accidentes viales graves en cruces peatonales.' },
      { tema: 'Protección de bosques comunitarios y recarga de mantos acuíferos', severidad: 'Alta', descripcion: 'Tala clandestina y necesidad de esquemas de pago por servicios ambientales a comunidades serranas.' },
      { tema: 'Apoyo a productores locales, floricultores y artesanos', severidad: 'Media', descripcion: 'Falta de canales directos de comercialización sin intermediarios abusivos.' },
      { tema: 'Crecimiento de asentamientos irregulares en zonas de reserva', severidad: 'Alta', descripcion: 'Riesgo de pérdida de recarga de agua para todo el oriente del Estado de México.' }
    ],
    jergaLocal: ['la Chapingo', 'la feria de Texcoco', 'la barbacoa', 'Coatlinchán', 'el monte', 'los ejidos']
  },

  'Metepec': {
    poblacion: 242307,
    zona: 'Valle de Toluca (Residencial-Comercial)',
    nse: { 'A/B': 24, 'C+': 28, 'C': 26, 'D+': 14, 'D/E': 8 },
    colonias: [
      'Barrio de Santiaguito (Centro)', 'La Providencia', 'San Jerónimo Chicahualco',
      'San Salvador Tizatlalli', 'Infonavit San Francisco', 'Pilares', 'Bellavista',
      'Las Marinas', 'San Salvador Tizatlalli', 'Árbol de la Vida'
    ],
    problematicasWeb: [
      { tema: 'Saturación vehicular en avenidas clave (Tecnológico, Las Torres, Pino Suárez)', severidad: 'Alta', descripcion: 'Crecimiento habitacional desordenado que desborda las arterias principales en horas pico.' },
      { tema: 'Protección del oficio artesanal del Árbol de la Vida y barro tradicional', severidad: 'Media', descripcion: 'Talleres familiares enfrentan alza en materias primas y competencia desleal con réplicas industriales.' },
      { tema: 'Inundaciones por taponamiento de canales a cielo abierto', severidad: 'Media-Alta', descripcion: 'Lluvias intensas colapsan cauces en zonas bajas colindantes con San Mateo Atenco.' },
      { tema: 'Preservación de áreas verdes y parques urbanos caninos', severidad: 'Media', descripcion: 'Demanda de vecinos por más parques pet-friendly, ciclovías interconectadas y corredores biológicos.' },
      { tema: 'Robo a casa habitación y autopartes en zonas residenciales', severidad: 'Alta', descripcion: 'Preocupación de comités vecinales por mayor patrullaje y arcos de seguridad.' }
    ],
    jergaLocal: ['el Árbol de la Vida', 'Av. Tecnológico', 'Galerías Metepec', 'el Calvario', 'los artesanos', 'las Torres']
  },

  'Huixquilucan': {
    poblacion: 284965,
    zona: 'Valle de México (Poniente)',
    nse: { 'A/B': 30, 'C+': 22, 'C': 20, 'D+': 16, 'D/E': 12 },
    colonias: [
      'Interlomas', 'Bosque Real', 'Cabecera Municipal', 'Jesús del Monte',
      'Magdalena Chichicaspa', 'San Fernando', 'La Herradura', 'Pirules',
      'San Cristóbal Texcalucan', 'Zacamulpa'
    ],
    problematicasWeb: [
      { tema: 'Contraste y polarización socioeconómica entre zona tradicional y residencial', severidad: 'Crítica', descripcion: 'Brecha profunda en acceso a agua potable, pavimentación y transporte entre los pueblos y los fraccionamientos cerrados.' },
      { tema: 'Tráfico severo en vialidades de conexión a CDMX (Chamapa-La Venta / Barranca)', severidad: 'Alta', descripcion: 'Embudos viales en accesos a Santa Fe y Cuajimalpa.' },
      { tema: 'Protección de la zona boscosa y cuencas hidrológicas', severidad: 'Alta', descripcion: 'Deforestación por nuevos desarrollos inmobiliarios y riesgo de abatimiento de manantiales locales.' },
      { tema: 'Transporte público digno para trabajadores de servicios', severidad: 'Media-Alta', descripcion: 'Miles de trabajadoras domésticas, jardineros y obreros viajan en unidades precarias hacia las zonas residenciales.' },
      { tema: 'Manejo responsable de residuos y reciclaje en condominios', severidad: 'Media', descripcion: 'Demanda de centros de compostaje y separación rigurosa de basura.' }
    ],
    jergaLocal: ['Interlomas', 'la Barranca', 'Bosque Real', 'el pueblo', 'Chamapa', 'Jesús del Monte']
  },

  'Chalco': {
    poblacion: 401340,
    zona: 'Valle de México (Oriente - Volcanes)',
    nse: { 'A/B': 2, 'C+': 8, 'C': 30, 'D+': 40, 'D/E': 20 },
    colonias: [
      'Culturas de México', 'Jacalones 1 y 2', 'Chalco Centro', 'San Sebastián Chimalpa',
      'La Bomba', 'San Pablo Atlazalpan', 'Casas Geo / Los Héroes Chalco', 'Tres Marías', 'Santa Catarina Ayotzingo'
    ],
    problematicasWeb: [
      {
        tema: 'Inundaciones catastróficas de aguas negras por colapso del Colector Solidaridad',
        severidad: 'Crítica',
        descripcion: 'Colonias Culturas de México y Jacalones pasan hasta 40 días bajo aguas negras fétidas; reclamo urgente por cárcamos nuevos y drenaje profundo.'
      },
      {
        tema: 'Escasez severa de agua potable y cobro excesivo de pipas particulares',
        severidad: 'Crítica',
        descripcion: 'Tandeos quincenales obligan a las familias a pagar hasta $1,600 pesos por pipa, afectando gravemente los ingresos de los hogares.'
      },
      {
        tema: 'Transporte público caro y tardado hacia la CDMX (2 a 3 horas hasta Zaragoza o Pantitlán)',
        severidad: 'Alta',
        descripcion: 'Tarifas mínimas de $12 pesos más transbordos en combis saturadas e inseguras sobre la autopista México-Puebla.'
      },
      {
        tema: 'Alta dependencia del comercio informal y tianguis como sustento familiar',
        severidad: 'Media-Alta',
        descripcion: 'Más del 55% de la población activa vive del comercio ambulante en mercados sobre ruedas; rechazo radical a operativos de desalojo sin reubicación.'
      },
      {
        tema: 'Inseguridad en paraderos y caminos de terracería sin alumbrado público',
        severidad: 'Alta',
        descripcion: 'Asaltos constantes a primera hora de la mañana cuando obreros y estudiantes caminan hacia el transporte.'
      }
    ],
    jergaLocal: ['el Colector Solidaridad', 'Culturas de México', 'Jacalones', 'la combi a Zaragoza', 'los volcanes', 'las pipas', 'la autopista México-Puebla']
  },

  'Valle de Chalco Solidaridad': {
    poblacion: 391724,
    zona: 'Valle de México (Oriente - Laguna de Xico)',
    nse: { 'A/B': 1, 'C+': 6, 'C': 26, 'D+': 44, 'D/E': 23 },
    colonias: [
      'San Miguel Xico', 'Santa Cruz', 'Avándaro', 'Darío Martínez',
      'Guadalupana', 'Alfredo Baranda', 'El Triunfo', 'Providencia', 'San Isidro'
    ],
    problematicasWeb: [
      {
        tema: 'Hundimientos de suelo, fracturas geológicas y desbordamiento del Canal de la Compañía',
        severidad: 'Crítica',
        descripcion: 'Hundimiento acelerado de hasta 40 cm por año en la zona lacustre de Xico, fracturando viviendas y tuberías de drenaje.'
      },
      {
        tema: 'Abasto de agua de pozo con turbidez y sales minerales nocivas',
        severidad: 'Crítica',
        descripcion: 'El agua que llega por red tiene olor sulfuroso y sarro que descompone cisternas; familias dependen de garrafones comerciales.'
      },
      {
        tema: 'Inseguridad y asaltos violentos en transporte hacia el Metro Tláhuac y Santa Martha',
        severidad: 'Alta',
        descripcion: 'Atracos diarios en combis colectivas sobre Av. Cuauhtémoc y la lateral de la autopista.'
      },
      {
        tema: 'Sustento familiar en tianguis y talleres de reciclaje / economía popular',
        severidad: 'Media-Alta',
        descripcion: 'Cualquier cobro de derechos o retiro de puestos genera indignación inmediata de comités vecinales y uniones de comerciantes.'
      },
      {
        tema: 'Calles de terracería sin pavimentar y polvo suspendido en estiaje',
        severidad: 'Media-Alta',
        descripcion: 'Tolvaneras constantes en época seca y lodazales intransitables en temporada de lluvias.'
      }
    ],
    jergaLocal: ['Xico', 'el cerro del Marqués', 'las lagunas', 'Av. Cuauhtémoc', 'el Canal de la Compañía', 'la combi a Santa Martha']
  },

  'Atizapán de Zaragoza': {
    poblacion: 523674,
    zona: 'Valle de México (Norponiente)',
    nse: { 'A/B': 20, 'C+': 24, 'C': 30, 'D+': 16, 'D/E': 10 },
    colonias: [
      'Zona Esmeralda', 'Las Arboledas', 'Mayorazgos del Bosque', 'El Campanario',
      'San Miguel Xochimanga', 'México 86', 'El Potrero', 'Lomas de San Lorenzo', 'Calacoaya'
    ],
    problematicasWeb: [
      {
        tema: 'Crisis hídrica severa por dependencia casi total del Sistema Cutzamala',
        severidad: 'Crítica',
        descripcion: 'Colonias de clase media y popular enfrentan tandeos de hasta 5 días sin suministro; compras de pipas saturadas.'
      },
      {
        tema: 'Tráfico colapsado en Boulevard Adolfo López Mateos y salida a Periférico Norte',
        severidad: 'Alta',
        descripcion: 'Congestionamientos de más de 90 minutos para salir hacia Naucalpan o CDMX en horas pico matutinas.'
      },
      {
        tema: 'Contaminación de la Presa Madín y pérdida de zonas boscosas por desarrollos',
        severidad: 'Alta',
        descripcion: 'Lirio acuático, descargas de fraccionamientos residenciales y reclamo vecinal por plantas de tratamiento efectivas.'
      },
      {
        tema: 'Baches severos y pavimento dañado en avenidas intercolonias',
        severidad: 'Media-Alta',
        descripcion: 'Quejas reiteradas de automovilistas por daños en llantas y rines en accesos a colonias populares.'
      },
      {
        tema: 'Fricción entre residentes de Zona Esmeralda y colonias populares colindantes',
        severidad: 'Media',
        descripcion: 'Disputas por rutas de transporte colectivo, accesos restringidos y servicios públicos desiguales.'
      }
    ],
    jergaLocal: ['Zona Esmeralda', 'López Mateos', 'la Presa Madín', 'Arboledas', 'las alamedas', 'el puente de Atizapán']
  },

  'Tultitlán': {
    poblacion: 524074,
    zona: 'Valle de México (Norte - Vía José López Portillo)',
    nse: { 'A/B': 3, 'C+': 12, 'C': 34, 'D+': 36, 'D/E': 15 },
    colonias: [
      'Tultitlán Centro', 'Buenavista', 'Fuentes del Valle', 'Lechería',
      'San Pablo de las Salinas', 'Cartagena Industrial', 'Prados', 'Izcalli del Valle'
    ],
    problematicasWeb: [
      {
        tema: 'Colapso vial crónico en la Vía José López Portillo y cruces del Mexibús Línea 2',
        severidad: 'Crítica',
        descripcion: 'Tráileres y transporte pesado bloquean carriles y provocan atropellamientos y retrasos de hasta 2 horas hacia Ecatepec o Cuautitlán.'
      },
      {
        tema: 'Inseguridad violenta y asaltos a transporte en la zona de Lechería y San Pablo',
        severidad: 'Alta',
        descripcion: 'Puntos rojos de delincuencia en paraderos y puentes peatonales de conexión al Tren Suburbano.'
      },
      {
        tema: 'Contaminación por parques industriales y descargas químicas al aire',
        severidad: 'Alta',
        descripcion: 'Olores tóxicos nocturnos en colonias aledañas a zonas fabriles de Cartagena y Lechería.'
      },
      {
        tema: 'Falta de agua en colonias del oriente y hundimientos de pozos',
        severidad: 'Alta',
        descripcion: 'Disminución drástica de presión en la red y escasez en San Pablo de las Salinas.'
      },
      {
        tema: 'Bacheo severo y deterioro de banquetas en rutas peatonales a estaciones de transporte',
        severidad: 'Media-Alta',
        descripcion: 'Deterioro de la infraestructura urbana que obliga a peatones a caminar sobre el arroyo vehicular.'
      }
    ],
    jergaLocal: ['la López Portillo', 'Lechería', 'el Suburbano', 'la Bandera', 'San Pablo', 'el Mexibús 2']
  },

  'San Mateo Atenco': {
    poblacion: 97418,
    zona: 'Valle de Toluca (Ciénegas y Calzado)',
    nse: { 'A/B': 4, 'C+': 14, 'C': 36, 'D+': 32, 'D/E': 14 },
    colonias: [
      'Barrio de San Juan', 'Barrio de Guadalupe', 'San Pedro', 'Santa María',
      'La Concepción', 'Fraccionamiento Santa Elena', 'Buenavista'
    ],
    problematicasWeb: [
      {
        tema: 'Inundaciones recurrentes por desbordamiento del Río Lerma y canales a cielo abierto',
        severidad: 'Crítica',
        descripcion: 'Lluvias colapsan el cauce del Lerma inundando talleres de calzado, comercios y viviendas bajo aguas negras.'
      },
      {
        tema: 'Crisis de la industria artesanal y comercial del calzado tradicional',
        severidad: 'Alta',
        descripcion: 'Productores de zapatos de piel enfrentan competencia desleal de calzado asiático de plástico y alza en suelas y pieles.'
      },
      {
        tema: 'Contaminación fétida del aire y agua por el cauce del Río Lerma',
        severidad: 'Alta',
        descripcion: 'Gases tóxicos y mosquitos transmisores de infecciones en los barrios ribereños.'
      },
      {
        tema: 'Congestionamiento vial en Paseo Tollocan y accesos al Tren Interurbano Lerma',
        severidad: 'Media-Alta',
        descripcion: 'Falta de puentes peatonales seguros y rutas de transporte para conectar los barrios con la estación del tren.'
      },
      {
        tema: 'Déficit de drenaje pluvial independiente de la red de aguas residuales',
        severidad: 'Alta',
        descripcion: 'Urgencia de colectores marginales para que el agua de lluvia no se mezcle con las descargas sanitarias.'
      }
    ],
    jergaLocal: ['los zapateros', 'el Río Lerma', 'las botas de piel', 'la avenida Juárez', 'el Tollocan', 'el agua puerca']
  },

  'Lerma': {
    poblacion: 170337,
    zona: 'Valle de Toluca (Corredor Industrial)',
    nse: { 'A/B': 8, 'C+': 18, 'C': 34, 'D+': 26, 'D/E': 14 },
    colonias: [
      'Lerma Centro', 'Parque Industrial Lerma', 'San Pedro Tultepec', 'San Nicolás Taza',
      'Los Encinos', 'Amomolulco', 'La Asunción', 'Santa María Atarasquillo'
    ],
    problematicasWeb: [
      {
        tema: 'Contaminación industrial severa en agua y suelo por descargas de fábricas químicas y textileras',
        severidad: 'Crítica',
        descripcion: 'Afectación directa a la Ciénega de Lerma, pérdida de aves migratorias y malos olores persistentes.'
      },
      {
        tema: 'Tráfico pesado en la carretera libre y autopista México-Toluca',
        severidad: 'Alta',
        descripcion: 'Embotellamientos diarios en Amomolulco y el acceso al Parque Industrial en horas de entrada laboral.'
      },
      {
        tema: 'Inundaciones en Tultepec y zonas bajas por escurrimientos de la Sierra de las Cruces',
        severidad: 'Alta',
        descripcion: 'Talleres tradicionales de muebles de madera en San Pedro Tultepec sufren pérdidas por anegaciones de agua.'
      },
      {
        tema: 'Falta de agua potable en pueblos originarios otomíes de la montaña (Atarasquillo, Taza)',
        severidad: 'Media-Alta',
        descripcion: 'Paradoja hídrica: mientras el agua de Lerma se envía a la CDMX, los pobladores locales sufren desabasto.'
      },
      {
        tema: 'Integración peatonal y transporte seguro a la estación Lerma del Tren El Insurgente',
        severidad: 'Media',
        descripcion: 'Costos elevados de estacionamiento y falta de ciclovías hacia los fraccionamientos residenciales.'
      }
    ],
    jergaLocal: ['el Parque Industrial', 'San Pedro Tultepec', 'la México-Toluca', 'las Ciénegas', 'Amomolulco', 'el Tren Insurgente']
  },

  'Valle de Bravo': {
    poblacion: 61590,
    zona: 'Zona Sur y Turística / Cuenca Cutzamala',
    nse: { 'A/B': 22, 'C+': 16, 'C': 22, 'D+': 24, 'D/E': 16 },
    colonias: [
      'Valle de Bravo Centro', 'Avándaro', 'Colorines', 'San Gaspar',
      'La Peña', 'Santa María Pipioltepec', 'San Mateo Acatitlán', 'Barrio de Santa Ana'
    ],
    problematicasWeb: [
      {
        tema: 'Nivel crítico histórico de la Presa de Valle de Bravo (menos del 30% de capacidad)',
        severidad: 'Crítica',
        descripcion: 'Sobreextracción de agua para la CDMX y lagos artificiales privados de residencias que secan la presa y dañan el turismo náutico.'
      },
      {
        tema: 'Tala clandestina y deforestación acelerada en la cuenca boscosa',
        severidad: 'Crítica',
        descripcion: 'Bandas de talamontes destruyen los bosques de pino y oyamel que captan el agua del Cutzamala sin supervisión suficiente.'
      },
      {
        tema: 'Extorsión y cobro de piso a constructores, hoteleros y campesinos',
        severidad: 'Alta',
        descripcion: 'Presión de grupos delictivos de la zona sur que exigen cuotas sobre materiales de construcción y comercio.'
      },
      {
        tema: 'Polarización social extrema entre residencias de Avándaro y comunidades rurales marginadas',
        severidad: 'Alta',
        descripcion: 'Pueblos originarios sin caminos pavimentados ni centros de salud mientras zonas de descanso cuentan con helipuertos privados.'
      },
      {
        tema: 'Falta de tratamiento de aguas residuales que desembocan directo en el lago',
        severidad: 'Media-Alta',
        descripcion: 'Contaminación con coliformes fecales en bahías del embalse por fosas sépticas deficientes.'
      }
    ],
    jergaLocal: ['el lago', 'Avándaro', 'la presa seca', 'la Peña', 'Colorines', 'los lancheros', 'los talamontes']
  },

  'Tejupilco': {
    poblacion: 79282,
    zona: 'Zona Sur y Tierra Caliente Mexiquense',
    nse: { 'A/B': 3, 'C+': 10, 'C': 25, 'D+': 38, 'D/E': 24 },
    colonias: [
      'Tejupilco Centro', 'Luvianos Viejo', 'Rincón de López', 'Bejucos',
      'San José de la Laguna', 'Zacatepec', 'Tenería', 'El Sauz'
    ],
    problematicasWeb: [
      {
        tema: 'Inseguridad, cobro de piso a productores agrícolas y control delictivo de precios',
        severidad: 'Crítica',
        descripcion: 'Crimen organizado impone precios a la tortilla, carne, huevo y cerveza, asfixiando la economía popular de las familias.'
      },
      {
        tema: 'Caminos rurales y carreteras intermunicipales destruidas por deslaves y falta de mantenimiento',
        severidad: 'Crítica',
        descripcion: 'Tramos carreteros hacia Toluca y Michoacán con baches profundos y deslaves que aíslan a comunidades campesinas en lluvias.'
      },
      {
        tema: 'Sequía extrema y falta de bordos de abrevadero para el ganado',
        severidad: 'Alta',
        descripcion: 'Calores extremos de más de 38°C y estiaje prolongado que matan ganado vacuno y secan cosechas de maíz.'
      },
      {
        tema: 'Carencia grave de médicos especialistas e insumos en el Hospital General de Tejupilco',
        severidad: 'Alta',
        descripcion: 'Pacientes graves deben ser trasladados 3 horas en ambulancia hacia Toluca con riesgo de muerte en el trayecto.'
      },
      {
        tema: 'Falta de oportunidades de empleo formal y migración masiva de jóvenes a EE.UU.',
        severidad: 'Media-Alta',
        descripcion: 'Economía dependiente en más del 40% de las remesas de paisanos en Texas y California.'
      }
    ],
    jergaLocal: ['Tierra Caliente', 'la sierra', 'las remesas', 'el ganado', 'el calorón', 'la salida a Bejucos', 'el hospital regional']
  }
};

// Lista de los 125 municipios del Estado de México para el selector dinámico
const LISTA_125_MUNICIPIOS_EDOMEX = [
  'Acambay', 'Acolman', 'Aculco', 'Almoloya de Alquisiras', 'Almoloya de Juárez',
  'Almoloya del Río', 'Amatlán', 'Amatepec', 'Amecameca', 'Apaxco',
  'Atenco', 'Atizapán', 'Atizapán de Zaragoza', 'Atlacomulco', 'Atlautla',
  'Axapusco', 'Ayapango', 'Calimaya', 'Capulhuac', 'Coacalco de Berriozábal',
  'Coatepec Harinas', 'Cocotitlán', 'Coyotepec', 'Cuautitlán', 'Cuautitlán Izcalli',
  'Chalco', 'Chapa de Mota', 'Chapultepec', 'Chiautla', 'Chicoloapan',
  'Chiconcuac', 'Chimalhuacán', 'Donato Guerra', 'Ecatepec de Morelos', 'Ecatzingo',
  'Huehuetoca', 'Hueypoxtla', 'Huixquilucan', 'Isidro Fabela', 'Ixtapaluca',
  'Ixtapan de la Sal', 'Ixtapan del Oro', 'Ixtlahuaca', 'Jaltenco', 'Jilotepec',
  'Jilotzingo', 'Jiquipilco', 'Jocotitlán', 'Joquicingo', 'Juchitepec',
  'Lerma', 'Luvianos', 'Malinalco', 'Melchor Ocampo', 'Metepec',
  'Mexicaltzingo', 'Morelos', 'Naucalpan de Juárez', 'Nextlalpan', 'Nezahualcóyotl',
  'Nicolás Romero', 'Nopaltepec', 'Ocoyoacac', 'Ocuilan', 'El Oro',
  'Otumba', 'Otzoloapan', 'Otzolotepec', 'Ozumba', 'Papalotla',
  'La Paz', 'Polotitlán', 'Rayón', 'San Antonio la Isla', 'San Felipe del Progreso',
  'San Martín de las Pirámides', 'San Mateo Atenco', 'San Simón de Guerrero', 'Santo Tomás', 'Soyaniquilpan',
  'Sultepec', 'Tecámac', 'Tejupilco', 'Temamatla', 'Temascalapa',
  'Temascalcingo', 'Temascaltepec', 'Temoaya', 'Tenancingo', 'Tenango del Aire',
  'Tenango del Valle', 'Teoloyucan', 'Teotihuacán', 'Tepetlaoxtoc', 'Tepetlixpa',
  'Tepotzotlán', 'Tequixquiac', 'Texcaltitlán', 'Texcalyacac', 'Texcoco',
  'Tezoyuca', 'Tianguistenco', 'Timilpan', 'Tlalmanalco', 'Tlalnepantla de Baz',
  'Tlatlaya', 'Toluca', 'Tonatico', 'Tultepec', 'Tultitlán',
  'Valle de Bravo', 'Valle de Chalco Solidaridad', 'Villa de Allende', 'Villa del Carbón', 'Villa Guerrero',
  'Villa Victoria', 'Xalatlaco', 'Xonacatlán', 'Zacazonapan', 'Zacualpan',
  'Zinacantepec', 'Zumpahuacán', 'Zumpango'
];

// Catálogo Oficial de los 11 Perfiles Sectoriales Estratégicos (INEGI / AMAI / Censo Electoral)
const CATALOGO_11_SECTORES_DEMOGRAFICOS = [
  {
    id: 'sec_estudiantes',
    nombre: 'Estudiantes y Jóvenes Universitarios',
    icono: '🎓',
    rangoEdadSugerido: '18-29',
    pesoElectoral: 14,
    sensibilidad: 'Tecnología, movilidad segura, becas y medio ambiente',
    friccionKey: 'estudiantes'
  },
  {
    id: 'sec_comerciantes',
    nombre: 'Comerciantes y Tianguistas / MiPyMEs',
    icono: '🏪',
    rangoEdadSugerido: '30-55',
    pesoElectoral: 13,
    sensibilidad: 'Libertad de comercio, cero extorsión, cobros de piso y vialidades abiertas',
    friccionKey: 'comerciantes'
  },
  {
    id: 'sec_transportistas',
    nombre: 'Transportistas y Choferes (Taxis, Colectivos, Carga)',
    icono: '🚐',
    rangoEdadSugerido: '28-60',
    pesoElectoral: 9,
    sensibilidad: 'Tarifas, baches, carriles confinados, operativos de tránsito y costo de combustible',
    friccionKey: 'transportistas'
  },
  {
    id: 'sec_salud',
    nombre: 'Trabajadores del Sector Salud (Médicos, Enfermeras)',
    icono: '🩺',
    rangoEdadSugerido: '25-60',
    pesoElectoral: 6,
    sensibilidad: 'Abasto de insumos, seguridad en turnos nocturnos y basificación laboral',
    friccionKey: 'salud'
  },
  {
    id: 'sec_educacion',
    nombre: 'Maestros y Sector Educativo (SNTE / CNTE)',
    icono: '📚',
    rangoEdadSugerido: '28-65',
    pesoElectoral: 8,
    sensibilidad: 'Infraestructura escolar, derechos laborales sindicales y respeto a la docencia',
    friccionKey: 'maestros'
  },
  {
    id: 'sec_burocracia',
    nombre: 'Burocracia y Empleados de Gobierno',
    icono: '🏛️',
    rangoEdadSugerido: '25-62',
    pesoElectoral: 7,
    sensibilidad: 'Estabilidad de plaza, pagos puntuales y digitalización de trámites sin recortes',
    friccionKey: 'burocracia'
  },
  {
    id: 'sec_empresarios',
    nombre: 'Empresarios y Directivos de la Industria',
    icono: '💼',
    rangoEdadSugerido: '35-68',
    pesoElectoral: 6,
    sensibilidad: 'Certeza jurídica, no aumento de impuestos, energía limpia e incentivos fiscales',
    friccionKey: 'empresarios'
  },
  {
    id: 'sec_madres',
    nombre: 'Madres de Familia y Hogares',
    icono: '🏡',
    rangoEdadSugerido: '22-58',
    pesoElectoral: 15,
    sensibilidad: 'Agua constante, estancias infantiles, seguridad en calles y canasta básica',
    friccionKey: 'madres'
  },
  {
    id: 'sec_primario',
    nombre: 'Sector Primario (Campesinos, Ejidatarios y Pescadores)',
    icono: '🌾',
    rangoEdadSugerido: '30-75',
    pesoElectoral: 5,
    sensibilidad: 'Agua para riego, fertilizantes, caminos rurales y apoyo contra intermediarios',
    friccionKey: 'campo'
  },
  {
    id: 'sec_mayores',
    nombre: 'Adultos Mayores y Pensionados',
    icono: '👵',
    rangoEdadSugerido: '60-85',
    pesoElectoral: 10,
    sensibilidad: 'Medicamentos gratuitos, banquetas accesibles, trato digno y apoyo social',
    friccionKey: 'pensionados'
  },
  {
    id: 'sec_construccion',
    nombre: 'Trabajadores de la Construcción y Obreros',
    icono: '🏗️',
    rangoEdadSugerido: '20-58',
    pesoElectoral: 7,
    sensibilidad: 'Obra pública local, salarios justos, equipo de protección y transporte económico',
    friccionKey: 'obreros'
  }
];

// Ocupaciones frecuentes y verosímiles en el Estado de México según INEGI (Mapeadas a los 11 Sectores)
const OCUPACIONES_FRECUENTES = [
  { puesto: 'Estudiante universitario (UAEMex / FES UNAM / Politécnico)', nse: 'C', peso: 10, sector: 'Estudiantes y Jóvenes Universitarios' },
  { puesto: 'Joven profesionista en tecnología / emprendedor digital', nse: 'C+', peso: 4, sector: 'Estudiantes y Jóvenes Universitarios' },
  { puesto: 'Comerciante en tianguis / mercado municipal', nse: 'D+', peso: 8, sector: 'Comerciantes y Tianguistas / MiPyMEs' },
  { puesto: 'Pequeño comerciante con local de abarrotes / miscelánea', nse: 'C', peso: 5, sector: 'Comerciantes y Tianguistas / MiPyMEs' },
  { puesto: 'Operador de transporte público (combi / microbús)', nse: 'D+', peso: 5, sector: 'Transportistas y Choferes (Taxis, Colectivos, Carga)' },
  { puesto: 'Chofer de taxi de sitio / conductor de plataforma / chofer de carga', nse: 'D+', peso: 4, sector: 'Transportistas y Choferes (Taxis, Colectivos, Carga)' },
  { puesto: 'Enfermera / personal de salud en clínica pública (IMSS / ISSEMyM)', nse: 'C', peso: 4, sector: 'Trabajadores del Sector Salud (Médicos, Enfermeras)' },
  { puesto: 'Médico general de consultorio / especialista de hospital', nse: 'C+', peso: 2, sector: 'Trabajadores del Sector Salud (Médicos, Enfermeras)' },
  { puesto: 'Docente de educación básica o media (SNTE / SMSEM)', nse: 'C', peso: 5, sector: 'Maestros y Sector Educativo (SNTE / CNTE)' },
  { puesto: 'Profesor de secundaria / preparatoria pública', nse: 'C+', peso: 3, sector: 'Maestros y Sector Educativo (SNTE / CNTE)' },
  { puesto: 'Empleado administrativo en palacio municipal / gobierno estatal', nse: 'C', peso: 4, sector: 'Burocracia y Empleados de Gobierno' },
  { puesto: 'Servidor público / personal operativo de servicios públicos', nse: 'D+', peso: 3, sector: 'Burocracia y Empleados de Gobierno' },
  { puesto: 'Empresario industrial / dueño de taller manufacturero', nse: 'A/B', peso: 3, sector: 'Empresarios y Directivos de la Industria' },
  { puesto: 'Gerente administrativo en zona industrial corporativa', nse: 'B', peso: 3, sector: 'Empresarios y Directivos de la Industria' },
  { puesto: 'Ama de casa / jefa de familia y cuidadora no remunerada', nse: 'D+', peso: 10, sector: 'Madres de Familia y Hogares' },
  { puesto: 'Madre soltera trabajadora en comercio o servicios', nse: 'D', peso: 5, sector: 'Madres de Familia y Hogares' },
  { puesto: 'Productor agrícola de maíz y hortalizas / ejidatario', nse: 'D+', peso: 3, sector: 'Sector Primario (Campesinos, Ejidatarios y Pescadores)' },
  { puesto: 'Campesino / trabajador pecuario y floricultor', nse: 'D', peso: 2, sector: 'Sector Primario (Campesinos, Ejidatarios y Pescadores)' },
  { puesto: 'Jubilado / pensionado de gobierno (ISSEMYM / ISSSTE)', nse: 'C', peso: 5, sector: 'Adultos Mayores y Pensionados' },
  { puesto: 'Adulto mayor sin pensión formal / vendedor de barrio', nse: 'D/E', peso: 5, sector: 'Adultos Mayores y Pensionados' },
  { puesto: 'Albañil / maestro de obra en construcciones locales', nse: 'D', peso: 4, sector: 'Trabajadores de la Construcción y Obreros' },
  { puesto: 'Empleado de manufactura / obrero de fábrica industrial', nse: 'D', peso: 3, sector: 'Trabajadores de la Construcción y Obreros' }
];

module.exports = {
  ESTADOS_MEXICO,
  MUNICIPIOS_EDOMEX_DETALLADOS,
  LISTA_125_MUNICIPIOS_EDOMEX,
  CATALOGO_11_SECTORES_DEMOGRAFICOS,
  OCUPACIONES_FRECUENTES
};
