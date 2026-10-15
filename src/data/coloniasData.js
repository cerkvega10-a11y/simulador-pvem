// Base de Datos de Colonias, Barrios y AGEBs Reales del Estado de México
// Micro-Targeting Electoral 2027-2030 con Carencias Oficiales (.gob.mx) y Prioridades de Brigada

const COLONIAS_DATA = [
  // ==========================================
  // 1. ECATEPEC DE MORELOS
  // ==========================================
  {
    id: 'eca-ciudad-azteca',
    nombre: 'Ciudad Azteca (1ra a 3ra Sección)',
    municipio: 'Ecatepec de Morelos',
    ageb: '094-1',
    carenciaPrincipal: 'Escasez severa de agua potable por tandeo y colapso de red secundaria',
    carenciaFuente: 'CONAGUA - Monitor de Sequía & Déficit Cutzamala',
    indicadorOficial: 'Tandeo crítico de 1 vez cada 14 días; 42% de fugas en tomas domiciliarias',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 48500,
    listaNominal: 46200,
    porcentajeApoyoProyectado: 48.6,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Cosecha Hídrica Municipal y Pozos Inteligentes', 'Sendero Seguro en Línea B del Metro'],
    sindicatoDominante: 'Transporte Colectivo y Rutas Concesionadas',
    tasaParticipacionHistorica: 51.2,
    coordenadasAprox: { lat: 19.5441, lng: -99.0275 }
  },
  {
    id: 'eca-jardines-morelos',
    nombre: 'Jardines de Morelos (Secciones Bosques, Elementos y Flores)',
    municipio: 'Ecatepec de Morelos',
    ageb: '108-3',
    carenciaPrincipal: 'Inseguridad urbana, robo a transeúnte y cobro de piso a comercio barrial',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: '88.7% de percepción de inseguridad; 54.3 denuncias por robo al mes por cada 100k hab.',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 53200,
    listaNominal: 50800,
    porcentajeApoyoProyectado: 54.2,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Corredores Seguros Sendero Verde Conectado', 'Ventanilla Única Digital y Cero Moches a Comerciantes'],
    sindicatoDominante: 'Comerciantes, Tianguis y Mercados Públicos',
    tasaParticipacionHistorica: 53.8,
    coordenadasAprox: { lat: 19.5962, lng: -99.0118 }
  },
  {
    id: 'eca-san-cristobal-centro',
    nombre: 'San Cristóbal Centro (Cabecera Municipal)',
    municipio: 'Ecatepec de Morelos',
    ageb: '012-4',
    carenciaPrincipal: 'Carestía de productos básicos e inflación no regulada en comercios tradicionales',
    carenciaFuente: 'PROFECO - Quién es Quién en los Precios / PACIC',
    indicadorOficial: 'Canasta básica 18.4% por encima del promedio metropolitano en mercados de zona',
    estratoSocioeconomico: 'C+',
    poblacionElectoral: 39800,
    listaNominal: 38100,
    porcentajeApoyoProyectado: 44.1,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Ventanilla Única Digital y Cero Moches a Comerciantes', 'Tarifa Cero en Mexibús para Estudiantes y 65+'],
    sindicatoDominante: 'Burócratas y Servidores Públicos (SUTEYM)',
    tasaParticipacionHistorica: 56.4,
    coordenadasAprox: { lat: 19.6015, lng: -99.0506 }
  },
  {
    id: 'eca-las-americas',
    nombre: 'Fraccionamiento Las Américas',
    municipio: 'Ecatepec de Morelos',
    ageb: '145-6',
    carenciaPrincipal: 'Saturación vial sobre Circuito Exterior Mexiquense y falta de áreas verdes arboladas',
    carenciaFuente: 'ENUT INEGI - Movilidad Urbana',
    indicadorOficial: '2.8 horas diarias perdidas en traslados metropolitanos hacia CDMX',
    estratoSocioeconomico: 'B/C+',
    poblacionElectoral: 36400,
    listaNominal: 35100,
    porcentajeApoyoProyectado: 38.5,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Transporte Eléctrico Metropolitano y Conectividad Tren Suburbano', 'Parques Urbanos y Bienestar Animal'],
    sindicatoDominante: 'Telecomunicaciones y Servicios (STRM / Profesionistas)',
    tasaParticipacionHistorica: 61.2,
    coordenadasAprox: { lat: 19.5857, lng: -99.0232 }
  },
  {
    id: 'eca-quinta-zona-poligonos',
    nombre: 'Quinta Zona - Polígonos 1, 2 y 3',
    municipio: 'Ecatepec de Morelos',
    ageb: '201-2',
    carenciaPrincipal: 'Desabasto crítico de agua potable, huachicoleo de pipas y drenaje colapsado',
    carenciaFuente: 'CONAGUA / CONEVAL',
    indicadorOficial: 'Familias pagan hasta $1,800 MXN mensuales por pipas clandestinas de agua turbia',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 62000,
    listaNominal: 58900,
    porcentajeApoyoProyectado: 59.4,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Cosecha Hídrica Municipal y Pozos Inteligentes', 'Penalización Penal al Huachicoleo de Agua'],
    sindicatoDominante: 'Agua Potable, Drenaje y Limpia (ODAPAS / CAEM)',
    tasaParticipacionHistorica: 49.8,
    coordenadasAprox: { lat: 19.5312, lng: -99.0189 }
  },
  {
    id: 'eca-tulpetlac',
    nombre: 'Santa María Tulpetlac',
    municipio: 'Ecatepec de Morelos',
    ageb: '068-7',
    carenciaPrincipal: 'Asaltos armados en transporte público colectivo sobre Vía Morelos',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: '48.2 carpetas mensuales de investigación por robo en microbús y combi',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 41200,
    listaNominal: 39500,
    porcentajeApoyoProyectado: 56.8,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Corredores Seguros Sendero Verde Conectado', 'Botón de Auxilio Conectado a C5'],
    sindicatoDominante: 'Transporte Colectivo y Rutas Concesionadas',
    tasaParticipacionHistorica: 47.9,
    coordenadasAprox: { lat: 19.5678, lng: -99.0634 }
  },
  {
    id: 'eca-hank-gonzalez',
    nombre: 'Hank González y Sierra de Guadalupe',
    municipio: 'Ecatepec de Morelos',
    ageb: '077-5',
    carenciaPrincipal: 'Desabasto de medicamentos y falta de centros de salud de atención 24 horas',
    carenciaFuente: 'ENSANUT - Secretaría de Salud / IMSS-Bienestar',
    indicadorOficial: '34.8% de la población sin afiliación médica con recetas médicas no surtidas',
    estratoSocioeconomico: 'E/D',
    poblacionElectoral: 33500,
    listaNominal: 31800,
    porcentajeApoyoProyectado: 58.1,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Farmacias Populares Municipales y Médico a Tu Puerta', 'Mexicable Línea 3 Integral'],
    sindicatoDominante: 'Salud y Hospitales (SNTSA / ISEM)',
    tasaParticipacionHistorica: 46.5,
    coordenadasAprox: { lat: 19.5583, lng: -99.0789 }
  },
  {
    id: 'eca-chiconautla',
    nombre: 'Santa María Chiconautla y Ciudad Cuauhtémoc',
    municipio: 'Ecatepec de Morelos',
    ageb: '230-9',
    carenciaPrincipal: 'Rezago en pavimentación, drenaje pluvial e iluminación pública deficiente',
    carenciaFuente: 'CONEVAL - Pobreza y Rezago Social',
    indicadorOficial: '31.2% de hogares sin conexión continua a drenaje ni pavimento hidráulico',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 47800,
    listaNominal: 45100,
    porcentajeApoyoProyectado: 51.3,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Pavimentación con Concreto Hidráulico FAISMUN', 'Senderos Iluminados con Energía Solar'],
    sindicatoDominante: 'Construcción y Materialistas (CTM)',
    tasaParticipacionHistorica: 48.3,
    coordenadasAprox: { lat: 19.6389, lng: -99.0125 }
  },
  {
    id: 'eca-el-chamizal',
    nombre: 'El Chamizal y San Agustín 1ra y 2da',
    municipio: 'Ecatepec de Morelos',
    ageb: '115-4',
    carenciaPrincipal: 'Tiempo excesivo en traslados y sobrecarga de labores de cuidado en mujeres jefas de familia',
    carenciaFuente: 'ENUT INEGI - Cuidado y Movilidad Metrópoli',
    indicadorOficial: 'Mujeres dedican 44.5 horas semanales a tareas de cuidado no remuneradas',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 38900,
    listaNominal: 37200,
    porcentajeApoyoProyectado: 47.7,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Fondo Estatal de Cuidados y Casas de Respiro', 'Tarifa Cero en Mexibús para Estudiantes y Madres'],
    sindicatoDominante: 'Magisterio y Educación (SMSEM / SNTE)',
    tasaParticipacionHistorica: 50.1,
    coordenadasAprox: { lat: 19.5398, lng: -99.0432 }
  },
  {
    id: 'eca-valle-aragon-3ra',
    nombre: 'Valle de Aragón 3ra Sección',
    municipio: 'Ecatepec de Morelos',
    ageb: '089-2',
    carenciaPrincipal: 'Extorsión y cobro de cuotas ilegales a tianguis y pequeños comercios de comida',
    carenciaFuente: 'SESNSP - Delitos de Alto Impacto',
    indicadorOficial: 'Incremento del 32.4% en denuncias anónimas por extorsión a negocios de barrio',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 29400,
    listaNominal: 28300,
    porcentajeApoyoProyectado: 43.5,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Blindaje a Mercados Tradicionales y Tianguis', 'Unidad Especializada Anti-Extorsión Municipal'],
    sindicatoDominante: 'Comerciantes y Tianguistas Populares',
    tasaParticipacionHistorica: 55.7,
    coordenadasAprox: { lat: 19.5187, lng: -99.0345 }
  },

  // ==========================================
  // 2. TOLUCA (CAPITAL DEL ESTADO)
  // ==========================================
  {
    id: 'tol-centro-historico',
    nombre: 'Toluca Centro Histórico y Los Portales',
    municipio: 'Toluca',
    ageb: '001-3',
    carenciaPrincipal: 'Ambulantaje sin regulación en Portales y cobros abusivos de servicios',
    carenciaFuente: 'PROFECO / Gobierno Municipal',
    indicadorOficial: 'Tensión comercial por 4,200 puestos informales que bloquean el paso peatonal',
    estratoSocioeconomico: 'B/C+',
    poblacionElectoral: 31200,
    listaNominal: 30100,
    porcentajeApoyoProyectado: 41.2,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Reordenamiento Comercial con Dignidad y Estímulos Fiscales', 'Bacheo Inteligente y Peatonalización'],
    sindicatoDominante: 'Burócratas y Servidores Públicos (SUTEYM)',
    tasaParticipacionHistorica: 58.9,
    coordenadasAprox: { lat: 19.2926, lng: -99.6569 }
  },
  {
    id: 'tol-san-pablo-autopan',
    nombre: 'San Pablo Autopan y Delegaciones del Norte',
    municipio: 'Toluca',
    ageb: '112-7',
    carenciaPrincipal: 'Pobreza multidimensional y falta de red de agua potable continua en comunidades otomíes',
    carenciaFuente: 'CONEVAL - Pobreza y Marginación Indígena',
    indicadorOficial: '46.8% en pobreza moderada; baja presión y pozos con arsénico en temporada seca',
    estratoSocioeconomico: 'D/E',
    poblacionElectoral: 44200,
    listaNominal: 41900,
    porcentajeApoyoProyectado: 60.5,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Pozos con Filtros Purificadores y Tanques Elevados FAISMUN', 'Apoyo Directo a Campesinos y Productores Otomíes'],
    sindicatoDominante: 'Campesinos y Ejidos (CNC)',
    tasaParticipacionHistorica: 49.3,
    coordenadasAprox: { lat: 19.3614, lng: -99.6452 }
  },
  {
    id: 'tol-el-seminario',
    nombre: 'El Seminario (1ra a 5ta Sección)',
    municipio: 'Toluca',
    ageb: '045-8',
    carenciaPrincipal: 'Robo a transeúnte, riñas y falta de luminarias en callejones',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: '77.9% de percepción de inseguridad urbana; robo violento al salir a trabajar',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 38400,
    listaNominal: 36700,
    porcentajeApoyoProyectado: 53.6,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Corredores Seguros Sendero Verde Conectado', 'Recuperación de Canchas y Prevención de Adicciones'],
    sindicatoDominante: 'Construcción y Materialistas (CTM)',
    tasaParticipacionHistorica: 51.5,
    coordenadasAprox: { lat: 19.2789, lng: -99.6781 }
  },
  {
    id: 'tol-san-pedro-totoltepec',
    nombre: 'San Pedro Totoltepec y Corredor Industrial Toluca-Lerma',
    municipio: 'Toluca',
    ageb: '088-2',
    carenciaPrincipal: 'Contaminación atmosférica por partículas PM2.5 y baches por transporte pesado',
    carenciaFuente: 'CONAGUA / Secretaría del Medio Ambiente Edomex',
    indicadorOficial: '14 contingencias ambientales anuales por inversión térmica y emisiones fabriles',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 33900,
    listaNominal: 32400,
    porcentajeApoyoProyectado: 47.9,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Pavimentación Industrial FAISMUN y Vigilancia Ambiental', 'Rutas Alimentadoras al Tren El Insurgente'],
    sindicatoDominante: 'Industria y Manufactura (CROC / CROM)',
    tasaParticipacionHistorica: 54.2,
    coordenadasAprox: { lat: 19.3087, lng: -99.5892 }
  },
  {
    id: 'tol-santa-ana-tlapaltitlan',
    nombre: 'Santa Ana Tlapaltitlán y Sauces',
    municipio: 'Toluca',
    ageb: '067-4',
    carenciaPrincipal: 'Falta de conexión multimodal hacia la estación Pino Suárez del Tren El Insurgente',
    carenciaFuente: 'ENUT INEGI - Tiempos de Movilidad Laboral',
    indicadorOficial: 'Trabajadores pierden 1.8 horas diarias sorteando transbordos en Paseo Tollocan',
    estratoSocioeconomico: 'C+',
    poblacionElectoral: 36100,
    listaNominal: 34800,
    porcentajeApoyoProyectado: 46.2,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Ciclovías Confinadas y Transporte Alimentador Eléctrico', 'Bacheo Permanente en Paseo Tollocan y Las Torres'],
    sindicatoDominante: 'Magisterio y Educación (SMSEM / SNTE Secc. 17)',
    tasaParticipacionHistorica: 57.3,
    coordenadasAprox: { lat: 19.2845, lng: -99.6154 }
  },
  {
    id: 'tol-san-mateo-oxtotitlan',
    nombre: 'San Mateo Oxtotitlán y La Teresona',
    municipio: 'Toluca',
    ageb: '032-6',
    carenciaPrincipal: 'Desabasto de medicamentos para adultos mayores y saturación en Centro de Salud ISEM',
    carenciaFuente: 'ENSANUT - Abasto Sanitario',
    indicadorOficial: 'Tiempos de espera de más de 4 horas para consulta general en clínicas públicas',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 28700,
    listaNominal: 27500,
    porcentajeApoyoProyectado: 50.8,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Farmacias Populares Municipales y Médico a Tu Puerta', 'Casas de Día con Atención Médica Preventiva'],
    sindicatoDominante: 'Salud y Hospitales (ISEM / SNTSA)',
    tasaParticipacionHistorica: 52.8,
    coordenadasAprox: { lat: 19.2981, lng: -99.6843 }
  },

  // ==========================================
  // 3. NEZAHUALCÓYOTL
  // ==========================================
  {
    id: 'nez-benito-juarez',
    nombre: 'Colonia Benito Juárez (La Aurora)',
    municipio: 'Nezahualcóyotl',
    ageb: '015-8',
    carenciaPrincipal: 'Hundimientos diferenciales, fracturas en red de drenaje y agua con sarro',
    carenciaFuente: 'CONAGUA / ODAPAS Neza',
    indicadorOficial: 'Hundimiento acumulado de 35 cm; fracturas en 14 kilómetros de tubería de agua',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 52100,
    listaNominal: 49800,
    porcentajeApoyoProyectado: 57.8,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Sustitución de Red Hidráulica con FAISMUN Plus', 'Planta Potabilizadora Barrial Contra Turbidez'],
    sindicatoDominante: 'Agua Potable, Drenaje y Limpia Municipal',
    tasaParticipacionHistorica: 52.1,
    coordenadasAprox: { lat: 19.4045, lng: -99.0123 }
  },
  {
    id: 'nez-la-perla',
    nombre: 'La Perla y Reforma',
    municipio: 'Nezahualcóyotl',
    ageb: '042-3',
    carenciaPrincipal: 'Asaltos en combis sobre Av. Pantitlán y falta de alumbrado público LED',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: '74.2% de mujeres reportan temor de sufrir acoso y asalto al anochecer',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 46700,
    listaNominal: 44900,
    porcentajeApoyoProyectado: 52.4,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Sendero Iluminado Seguro para Mujeres', 'Botón de Auxilio Conectado a C4 Neza'],
    sindicatoDominante: 'Transporte Colectivo (Rutas Neza-Pantitlán)',
    tasaParticipacionHistorica: 54.6,
    coordenadasAprox: { lat: 19.3876, lng: -98.9984 }
  },
  {
    id: 'nez-el-sol',
    nombre: 'El Sol y Maravillas',
    municipio: 'Nezahualcóyotl',
    ageb: '083-1',
    carenciaPrincipal: 'Carestía de la canasta básica e intermediación abusiva de precios en tianguis',
    carenciaFuente: 'PROFECO - PACIC',
    indicadorOficial: 'Precios de huevo, frijol y gas LP con variaciones de hasta 22% sobre precio oficial',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 41800,
    listaNominal: 39900,
    porcentajeApoyoProyectado: 55.9,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Tiendas Populares Barriales de Abasto Directo', 'Créditos a la Palabra para Microcomerciantes'],
    sindicatoDominante: 'Comerciantes y Tianguistas de Neza',
    tasaParticipacionHistorica: 50.8,
    coordenadasAprox: { lat: 19.4215, lng: -99.0312 }
  },
  {
    id: 'nez-bosques-aragon',
    nombre: 'Bosques de Aragón y Plazas',
    municipio: 'Nezahualcóyotl',
    ageb: '104-5',
    carenciaPrincipal: 'Islas de calor, falta de arbolado urbano y bacheo en accesos principales',
    carenciaFuente: 'INEGI / CONEVAL',
    indicadorOficial: 'Menos de 1.8 m² de áreas verdes públicas por habitante en la zona norte de Neza',
    estratoSocioeconomico: 'C+',
    poblacionElectoral: 34500,
    listaNominal: 33400,
    porcentajeApoyoProyectado: 42.1,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Reforestación Urbana Masiva y Techos Verdes', 'Mantenimiento Vial y Arcos de Seguridad C4'],
    sindicatoDominante: 'Magisterio y Profesionistas Independientes',
    tasaParticipacionHistorica: 63.4,
    coordenadasAprox: { lat: 19.4678, lng: -99.0491 }
  },
  {
    id: 'nez-metropolitana-2da',
    nombre: 'Metropolitana 2da y 3ra Sección',
    municipio: 'Nezahualcóyotl',
    ageb: '055-9',
    carenciaPrincipal: 'Tiempo excesivo de traslado hacia la CDMX y transporte público inseguro',
    carenciaFuente: 'ENUT INEGI',
    indicadorOficial: 'Promedio de 2.6 horas diarias perdidas en traslados metropolitanos',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 43200,
    listaNominal: 41500,
    porcentajeApoyoProyectado: 49.3,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Tarifa Cero en Mexibús para Estudiantes y 65+', 'Modernización de Rutas Alimentadoras Eléctricas'],
    sindicatoDominante: 'Burócratas y Maestros (SMSEM / SUTEYM)',
    tasaParticipacionHistorica: 55.0,
    coordenadasAprox: { lat: 19.3982, lng: -99.0371 }
  },

  // ==========================================
  // 4. NAUCALPAN DE JUÁREZ
  // ==========================================
  {
    id: 'nau-ciudad-satelite',
    nombre: 'Ciudad Satélite (Circuitos Centro, Educadores, Héroes)',
    municipio: 'Naucalpan de Juárez',
    ageb: '018-2',
    carenciaPrincipal: 'Saturación vial en Periférico Norte y robo de autopartes en zonas habitacionales',
    carenciaFuente: 'SESNSP / Tránsito Edomex',
    indicadorOficial: 'Colapso vial de 90 min en horas pico; alta tasa de robo a vehículo estacionado',
    estratoSocioeconomico: 'A/B',
    poblacionElectoral: 47600,
    listaNominal: 46100,
    porcentajeApoyoProyectado: 34.2,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Cámaras con IA Anti-Robo de Autopartes C5', 'Sincronización Semafórica Inteligente y Ciclovías'],
    sindicatoDominante: 'Telecomunicaciones y Servicios (STRM / Colegios Profesionales)',
    tasaParticipacionHistorica: 66.8,
    coordenadasAprox: { lat: 19.5132, lng: -99.2341 }
  },
  {
    id: 'nau-el-molinito',
    nombre: 'El Molinito y San Esteban',
    municipio: 'Naucalpan de Juárez',
    ageb: '071-4',
    carenciaPrincipal: 'Asaltos violentos en paraderos de Cuatro Caminos (Toreo) y narcomenudeo',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: '84.6% de percepción de riesgo en paraderos del Metro Cuatro Caminos',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 42300,
    listaNominal: 40100,
    porcentajeApoyoProyectado: 56.4,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Operativo Paradero Blindado en Cuatro Caminos', 'Prevención de Adicciones y Espacios Deportivos Jóvenes'],
    sindicatoDominante: 'Transporte Colectivo (Rutas Toreo-Naucalpan)',
    tasaParticipacionHistorica: 48.7,
    coordenadasAprox: { lat: 19.4682, lng: -99.2298 }
  },
  {
    id: 'nau-san-bartolo-centro',
    nombre: 'San Bartolo Centro y Naucalpan Tradicional',
    municipio: 'Naucalpan de Juárez',
    ageb: '034-9',
    carenciaPrincipal: 'Extorsión y cobros ilegales a comerciantes por parte de inspectores y mafias',
    carenciaFuente: 'PROFECO / Denuncias Ciudadanas',
    indicadorOficial: 'Comerciantes pierden hasta el 15% de ingresos en pagos indebidos por licencias',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 31800,
    listaNominal: 30400,
    porcentajeApoyoProyectado: 50.1,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Ventanilla Única Digital Cero Corrupción', 'Reordenamiento Integral del Mercado San Bartolo'],
    sindicatoDominante: 'Comerciantes y Tianguistas de Naucalpan',
    tasaParticipacionHistorica: 51.9,
    coordenadasAprox: { lat: 19.4795, lng: -99.2384 }
  },
  {
    id: 'nau-san-mateo-nopala',
    nombre: 'San Mateo Nopala y Praderas de San Mateo',
    municipio: 'Naucalpan de Juárez',
    ageb: '119-3',
    carenciaPrincipal: 'Cortes prolongados de agua potable por tandeo y fugas de aguas negras',
    carenciaFuente: 'CONAGUA / OAPAS Naucalpan',
    indicadorOficial: 'Tandeo de 5 días a la semana sin agua; quejas por cobros de pipas de $1,400 MXN',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 37900,
    listaNominal: 35800,
    porcentajeApoyoProyectado: 58.2,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Reactivación de Pozos de Agua y Tanques de Almacenamiento', 'Subsidio Emergente a Pipas Regulares'],
    sindicatoDominante: 'Construcción y Materialistas (CTM)',
    tasaParticipacionHistorica: 47.4,
    coordenadasAprox: { lat: 19.4921, lng: -99.2712 }
  },
  {
    id: 'nau-lomas-verdes',
    nombre: 'Lomas Verdes (1ra a 6ta Sección)',
    municipio: 'Naucalpan de Juárez',
    ageb: '052-1',
    carenciaPrincipal: 'Contaminación de la Presa Madín por descargas de aguas residuales sin tratar',
    carenciaFuente: 'CONAGUA / Medio Ambiente',
    indicadorOficial: 'Proliferación masiva de lirio acuático y pérdida del 30% de biodiversidad lacustre',
    estratoSocioeconomico: 'A/B',
    poblacionElectoral: 35400,
    listaNominal: 34300,
    porcentajeApoyoProyectado: 36.8,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Macro-Planta de Tratamiento Ecológica Presa Madín', 'Parque Lineal y Corredor Verde Conectado'],
    sindicatoDominante: 'Servicios Profesionales y Tecnológicos',
    tasaParticipacionHistorica: 65.2,
    coordenadasAprox: { lat: 19.5089, lng: -99.2567 }
  },

  // ==========================================
  // 5. HUIXQUILUCAN
  // ==========================================
  {
    id: 'hui-interlomas',
    nombre: 'Interlomas y Bosque Real',
    municipio: 'Huixquilucan',
    ageb: '008-1',
    carenciaPrincipal: 'Congestionamiento vial extremo en accesos a Santa Fe y Cuajimalpa',
    carenciaFuente: 'ENUT INEGI - Movilidad Poniente',
    indicadorOficial: 'Embudos viales en Chamapa-La Venta con demoras de hasta 1 hora y 45 min',
    estratoSocioeconomico: 'A/B',
    poblacionElectoral: 38200,
    listaNominal: 37100,
    porcentajeApoyoProyectado: 31.4,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Paso Superior Vehicular Sustentable y Transporte Ejecutivo Limpio', 'Cámaras LPR Inteligentes en Arcos Viales'],
    sindicatoDominante: 'Sector Corporativo y Telecomunicaciones',
    tasaParticipacionHistorica: 68.2,
    coordenadasAprox: { lat: 19.3989, lng: -99.2789 }
  },
  {
    id: 'hui-magdalena-chichicaspa',
    nombre: 'Magdalena Chichicaspa y San Fernando',
    municipio: 'Huixquilucan',
    ageb: '041-6',
    carenciaPrincipal: 'Brecha de desigualdad en agua potable y falta de pavimentación en zonas tradicionales',
    carenciaFuente: 'CONEVAL - Desigualdad Municipal',
    indicadorOficial: '41.5% de población tradicional sin red hidráulica continua a pesar de colindar con residenciales',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 29800,
    listaNominal: 28400,
    porcentajeApoyoProyectado: 59.2,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Agua por Red Continua con Presupuesto FAISMUN', 'Pavimentación de Callejones y Drenaje Profundo'],
    sindicatoDominante: 'Construcción y Trabajadores de Servicios (CTM / Obreros)',
    tasaParticipacionHistorica: 51.3,
    coordenadasAprox: { lat: 19.3712, lng: -99.3245 }
  },
  {
    id: 'hui-cabecera-tradicional',
    nombre: 'Huixquilucan de Degollado (Pueblo y Barrios)',
    municipio: 'Huixquilucan',
    ageb: '015-4',
    carenciaPrincipal: 'Transporte público precario para trabajadores y desabasto de medicamentos locales',
    carenciaFuente: 'ENSANUT / Movilidad Edomex',
    indicadorOficial: 'Rutas de combi con unidades de más de 15 años de antigüedad sin medidas de seguridad',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 24500,
    listaNominal: 23600,
    porcentajeApoyoProyectado: 52.8,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Renovación Eléctrica del Parque de Transporte con Subsidio', 'Clínica Municipal 24 Horas con Farmacia Gratuita'],
    sindicatoDominante: 'Transporte Colectivo y Ejidatarios',
    tasaParticipacionHistorica: 53.7,
    coordenadasAprox: { lat: 19.3587, lng: -99.3512 }
  },

  // ==========================================
  // 6. TLALNEPANTLA DE BAZ
  // ==========================================
  {
    id: 'tla-san-juanico',
    nombre: 'San Juan Ixhuatepec (San Juanico - Zona Oriente)',
    municipio: 'Tlalnepantla de Baz',
    ageb: '085-7',
    carenciaPrincipal: 'Riesgo químico e industrial, abandono de infraestructura urbana frente al Poniente',
    carenciaFuente: 'CONEVAL / Protección Civil Edomex',
    indicadorOficial: 'Percepción de rezago del 68% respecto a servicios de la zona poniente del municipio',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 41200,
    listaNominal: 39400,
    porcentajeApoyoProyectado: 58.7,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Fondo Especial de Compensación para la Zona Oriente', 'Modernización de Drenajes y Parque Recreativo Familiar'],
    sindicatoDominante: 'Industria y Manufactura (CROC / Petroleros)',
    tasaParticipacionHistorica: 49.5,
    coordenadasAprox: { lat: 19.5212, lng: -99.0984 }
  },
  {
    id: 'tla-centro-san-javier',
    nombre: 'Tlalnepantla Centro y San Javier',
    municipio: 'Tlalnepantla de Baz',
    ageb: '005-2',
    carenciaPrincipal: 'Congestionamiento de carga pesada en Av. Gustavo Baz y contaminación sonora',
    carenciaFuente: 'INEGI / Tránsito Metropolitano',
    indicadorOficial: 'Pérdida de pavimento por paso de más de 12,000 tráileres diarios sin regulación de horarios',
    estratoSocioeconomico: 'C+',
    poblacionElectoral: 33400,
    listaNominal: 32100,
    porcentajeApoyoProyectado: 43.8,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Reubicación de Horarios de Transporte Pesado y Pavimentación Reforzada', 'Corredor Peatonal Seguro San Javier'],
    sindicatoDominante: 'Burócratas (SUTEYM) y Magisterio (SMSEM)',
    tasaParticipacionHistorica: 57.2,
    coordenadasAprox: { lat: 19.5398, lng: -99.1945 }
  },
  {
    id: 'tla-chiquihuite-caracoles',
    nombre: 'Lázaro Cárdenas y Cerro del Chiquihuite (La Presa)',
    municipio: 'Tlalnepantla de Baz',
    ageb: '114-9',
    carenciaPrincipal: 'Riesgo geológico de deslaves en temporada de lluvias y falta de agua por tubería',
    carenciaFuente: 'CONAGUA / CENAPRED',
    indicadorOficial: 'Más de 3,500 viviendas en polígonos de alto riesgo geológico sin muros de contención',
    estratoSocioeconomico: 'D/E',
    poblacionElectoral: 45600,
    listaNominal: 43200,
    porcentajeApoyoProyectado: 61.2,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Muros de Contención Ecológicos y Reubicación Voluntaria Segura', 'Agua por Bombeo Solar FAISMUN'],
    sindicatoDominante: 'Construcción y Mano de Obra (CTM)',
    tasaParticipacionHistorica: 46.8,
    coordenadasAprox: { lat: 19.5412, lng: -99.1256 }
  },
  {
    id: 'tla-valle-ceylan',
    nombre: 'Valle Ceylán y Viveros del Valle',
    municipio: 'Tlalnepantla de Baz',
    ageb: '031-4',
    carenciaPrincipal: 'Asaltos en paraderos de conexión al Tren Suburbano Tlalnepantla',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: 'Alta incidencia de robo con violencia de celulares y bolsos en puentes peatonales',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 27800,
    listaNominal: 26900,
    porcentajeApoyoProyectado: 45.1,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Senderos Conectados al Tren Suburbano con Iluminación LED', 'Cámaras de Reconocimiento Facial en Paraderos'],
    sindicatoDominante: 'Ferrocarrileros y Telecomunicaciones (STRM)',
    tasaParticipacionHistorica: 59.4,
    coordenadasAprox: { lat: 19.5312, lng: -99.1823 }
  },

  // ==========================================
  // 7. CHIMALHUACÁN
  // ==========================================
  {
    id: 'chi-acuitlapilco',
    nombre: 'Acuitlapilco y Santa María Nativitas',
    municipio: 'Chimalhuacán',
    ageb: '028-4',
    carenciaPrincipal: 'Calles de terracería, falta de drenaje y fétidos encharcamientos en lluvias',
    carenciaFuente: 'CONEVAL - Pobreza Urbana y Servicios Básicos',
    indicadorOficial: '38.4% de calles sin pavimentar; desbordamiento recurrente de aguas negras',
    estratoSocioeconomico: 'D/E',
    poblacionElectoral: 49800,
    listaNominal: 46700,
    porcentajeApoyoProyectado: 62.4,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Plan Maestro de Drenaje Sanitario y Pavimentación FAISMUN', 'Red Segura de Mototaxis Eléctricos Regulados'],
    sindicatoDominante: 'Transporte y Mototaxis Populares',
    tasaParticipacionHistorica: 47.1,
    coordenadasAprox: { lat: 19.4234, lng: -98.9456 }
  },
  {
    id: 'chi-san-lorenzo-vidrieros',
    nombre: 'San Lorenzo, Vidrieros y Alfareros',
    municipio: 'Chimalhuacán',
    ageb: '065-1',
    carenciaPrincipal: 'Asaltos en transporte hacia el Metro Pantitlán y extorsión a talleres artesanales',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: '79.3% de percepción de inseguridad; asaltos diarios en combis de Av. Bordo de Xochiaca',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 53100,
    listaNominal: 50400,
    porcentajeApoyoProyectado: 56.9,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Corredor Seguro Bordo de Xochiaca con Mando Único', 'Apoyo Directo a Canteros y Artesanos Tradicionales'],
    sindicatoDominante: 'Artesanos y Pequeños Fabricantes',
    tasaParticipacionHistorica: 48.6,
    coordenadasAprox: { lat: 19.4389, lng: -98.9612 }
  },
  {
    id: 'chi-cabecera-cerro',
    nombre: 'Chimalhuacán Cabecera y Zona del Cerro',
    municipio: 'Chimalhuacán',
    ageb: '002-8',
    carenciaPrincipal: 'Desabasto total de agua por red pública y monopolio de pipas clandestinas',
    carenciaFuente: 'CONAGUA / ODAPAS Chimalhuacán',
    indicadorOficial: 'Cobros de pipas de hasta $1,700 pesos; familias pasan 3 semanas sin una sola gota',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 38700,
    listaNominal: 36900,
    porcentajeApoyoProyectado: 53.4,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Pozos Municipales con Línea de Conducción Directa', 'Vigilancia Penal Contra Venta Clandestina de Agua'],
    sindicatoDominante: 'Agua y Limpia Municipal',
    tasaParticipacionHistorica: 51.2,
    coordenadasAprox: { lat: 19.4123, lng: -98.9534 }
  },

  // ==========================================
  // 8. CUAUTITLÁN IZCALLI
  // ==========================================
  {
    id: 'izc-centro-urbano',
    nombre: 'Centro Urbano y Ensueños',
    municipio: 'Cuautitlán Izcalli',
    ageb: '014-3',
    carenciaPrincipal: 'Bacheo severo en vialidades industriales y deterioro de carpetas asfálticas',
    carenciaFuente: 'Dirección de Obras Públicas / Denuncias Ciudadanas',
    indicadorOficial: 'Más de 3,400 baches reportados en ejes principales; daños recurrentes a vehículos',
    estratoSocioeconomico: 'C+',
    poblacionElectoral: 35800,
    listaNominal: 34600,
    porcentajeApoyoProyectado: 43.6,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Programa de Repavimentación Industrial con Concreto de Alta Resistencia', 'Alumbrado LED Inteligente'],
    sindicatoDominante: 'Burócratas (SUTEYM) y Magisterio (SMSEM)',
    tasaParticipacionHistorica: 58.1,
    coordenadasAprox: { lat: 19.6542, lng: -99.2156 }
  },
  {
    id: 'izc-bosques-del-lago',
    nombre: 'Bosques del Lago y Lago de Guadalupe',
    municipio: 'Cuautitlán Izcalli',
    ageb: '078-6',
    carenciaPrincipal: 'Descargas clandestinas de aguas negras y mortandad de fauna en el Lago de Guadalupe',
    carenciaFuente: 'CONAGUA / PROPAEM Edomex',
    indicadorOficial: 'Contaminación crítica por coliformes y metales pesados; urgencia de humedales artificiales',
    estratoSocioeconomico: 'A/B',
    poblacionElectoral: 28400,
    listaNominal: 27500,
    porcentajeApoyoProyectado: 35.2,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Saneamiento Integral del Lago de Guadalupe con Plantas de Tratamiento', 'Monitoreo Ciudadano Ambiental'],
    sindicatoDominante: 'Profesionistas y Servicios Tecnológicos',
    tasaParticipacionHistorica: 67.4,
    coordenadasAprox: { lat: 19.6278, lng: -99.2489 }
  },
  {
    id: 'izc-infonavit-norte',
    nombre: 'Infonavit Norte y Tepojaco',
    municipio: 'Cuautitlán Izcalli',
    ageb: '102-1',
    carenciaPrincipal: 'Robo a transeúnte en andadores habitacionales y desabasto de medicamentos en clínica',
    carenciaFuente: 'SESNSP / ENSANUT',
    indicadorOficial: '76.8% de percepción de inseguridad en andadores peatonales oscuros sin patrullaje',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 41200,
    listaNominal: 39500,
    porcentajeApoyoProyectado: 54.8,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Recuperación de Andadores con Luminarias Solares y Alarmas Vecinales', 'Médico en tu Unidad Habitacional'],
    sindicatoDominante: 'Industria Automotriz y Manufactura (CTM / CROC)',
    tasaParticipacionHistorica: 52.3,
    coordenadasAprox: { lat: 19.6789, lng: -99.2045 }
  },

  // ==========================================
  // 9. ATIZAPÁN DE ZARAGOZA
  // ==========================================
  {
    id: 'ati-zona-esmeralda',
    nombre: 'Zona Esmeralda (Condados, Bosques y Chiluca)',
    municipio: 'Atizapán de Zaragoza',
    ageb: '006-7',
    carenciaPrincipal: 'Desconexión hídrica por caída del Cutzamala y saturación en salida a Periférico',
    carenciaFuente: 'CONAGUA / SAPASA',
    indicadorOficial: 'Reducción del 50% de caudal asignado; alta dependencia de compras privadas de agua',
    estratoSocioeconomico: 'A/B',
    poblacionElectoral: 33100,
    listaNominal: 32200,
    porcentajeApoyoProyectado: 32.8,
    prioridadBrigada: 'Zona Crítica / Alta Resistencia',
    propuestasClaveRecomendadas: ['Acuerdo Federal de Rebalanceo Hídrico de Cuenca', 'Paso a Desnivel Inteligente en Blvd. Adolfo López Mateos'],
    sindicatoDominante: 'Sector Financiero y Empresarial',
    tasaParticipacionHistorica: 69.1,
    coordenadasAprox: { lat: 19.5678, lng: -99.2891 }
  },
  {
    id: 'ati-mexico-86',
    nombre: 'México 86 y San Miguel Xochimanga',
    municipio: 'Atizapán de Zaragoza',
    ageb: '054-2',
    carenciaPrincipal: 'Calles en mal estado, falta de drenaje y asaltos al transporte en paraderos',
    carenciaFuente: 'CONEVAL / SESNSP',
    indicadorOficial: '28.9% de carencia de servicios básicos urbanos; asaltos frecuentes a trabajadores matutinos',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 36700,
    listaNominal: 34900,
    porcentajeApoyoProyectado: 57.3,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Pavimentación con Drenaje Integrado FAISMUN', 'Sendero Seguro con Presencia Policial Permanente'],
    sindicatoDominante: 'Construcción y Materialistas (CTM)',
    tasaParticipacionHistorica: 50.4,
    coordenadasAprox: { lat: 19.5789, lng: -99.2312 }
  },
  {
    id: 'ati-arboledas-calacoaya',
    nombre: 'Las Arboledas y Calacoaya',
    municipio: 'Atizapán de Zaragoza',
    ageb: '029-8',
    carenciaPrincipal: 'Contaminación del Río San Javier y Presa Madín con malos olores',
    carenciaFuente: 'Secretaría del Medio Ambiente Edomex',
    indicadorOficial: 'Reclamos de vecinos por proliferación de mosquitos y olores fétidos en época de calor',
    estratoSocioeconomico: 'C+',
    poblacionElectoral: 29500,
    listaNominal: 28600,
    porcentajeApoyoProyectado: 44.5,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Saneamiento Biológico del Río San Javier y Presa Madín', 'Ciclovía Conectada a Naucalpan'],
    sindicatoDominante: 'Comercio Establecido y Profesionistas',
    tasaParticipacionHistorica: 62.5,
    coordenadasAprox: { lat: 19.5489, lng: -99.2278 }
  },

  // ==========================================
  // 10. CHALCO
  // ==========================================
  {
    id: 'cha-culturas-de-mexico',
    nombre: 'Culturas de México y Jacalones 1 y 2',
    municipio: 'Chalco',
    ageb: '037-1',
    carenciaPrincipal: 'Inundaciones catastróficas de aguas negras por taponamiento del Colector Solidaridad',
    carenciaFuente: 'CONAGUA / CAEM Edomex',
    indicadorOficial: 'Hasta 40 días bajo aguas fétidas; daño patrimonial severo a más de 1,600 viviendas',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 39400,
    listaNominal: 37200,
    porcentajeApoyoProyectado: 63.8,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Nuevo Colector Solidaridad Definitivo y Cárcamos de Bombeo FAISMUN Plus', 'Seguro de Daños Inundación para Familias'],
    sindicatoDominante: 'Agua y Limpia Municipal (ODAPAS Chalco)',
    tasaParticipacionHistorica: 48.9,
    coordenadasAprox: { lat: 19.2612, lng: -98.8945 }
  },
  {
    id: 'cha-heroes-chalco',
    nombre: 'Los Héroes Chalco y Casas Geo',
    municipio: 'Chalco',
    ageb: '091-4',
    carenciaPrincipal: 'Transporte público saturado hacia Zaragoza y falta de escuelas y guarderías de tiempo completo',
    carenciaFuente: 'ENUT INEGI / SEP',
    indicadorOficial: 'Tiempos de traslado de hasta 2.5 horas en combis sobre la autopista México-Puebla',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 42100,
    listaNominal: 40300,
    porcentajeApoyoProyectado: 52.6,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Trolebús Santa Martha-Chalco Ampliación y Tarifa Social', 'Escuelas de Tiempo Completo con Comedor'],
    sindicatoDominante: 'Transporte Colectivo (Rutas Chalco-Zaragoza)',
    tasaParticipacionHistorica: 51.4,
    coordenadasAprox: { lat: 19.2789, lng: -98.8712 }
  },
  {
    id: 'cha-centro-cabecera',
    nombre: 'Chalco Centro y San Sebastián Chimalpa',
    municipio: 'Chalco',
    ageb: '003-9',
    carenciaPrincipal: 'Carestía de productos básicos, extorsión y falta de estacionamientos seguros',
    carenciaFuente: 'PROFECO / SESNSP',
    indicadorOficial: 'Incremento del 19.5% en denuncias de cobro de piso a locatarios del mercado',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 28900,
    listaNominal: 27800,
    porcentajeApoyoProyectado: 47.1,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Blindaje del Mercado Tradicional y Cero Moches', 'Unidad Especializada Contra Extorsión con Denuncia Anónima'],
    sindicatoDominante: 'Comerciantes y Locatarios del Mercado de Chalco',
    tasaParticipacionHistorica: 55.6,
    coordenadasAprox: { lat: 19.2645, lng: -98.8998 }
  },

  // ==========================================
  // 11. VALLE DE CHALCO SOLIDARIDAD
  // ==========================================
  {
    id: 'vch-san-miguel-xico-1',
    nombre: 'San Miguel Xico 1ra y 2da Sección',
    municipio: 'Valle de Chalco Solidaridad',
    ageb: '024-5',
    carenciaPrincipal: 'Hundimiento del suelo, grietas geológicas y desbordamientos del Canal de la Compañía',
    carenciaFuente: 'CONAGUA / CENAPRED',
    indicadorOficial: 'Hundimiento de hasta 40 cm por año en zona lacustre; 30% de viviendas con fisuras estructurales',
    estratoSocioeconomico: 'D/E',
    poblacionElectoral: 51200,
    listaNominal: 48300,
    porcentajeApoyoProyectado: 64.2,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Obras Hidráulicas de Estabilización y Drenaje Pluvial Profundo', 'Programa de Refuerzo de Vivienda Popular'],
    sindicatoDominante: 'Construcción y Materialistas (CTM)',
    tasaParticipacionHistorica: 47.8,
    coordenadasAprox: { lat: 19.2945, lng: -98.9412 }
  },
  {
    id: 'vch-avandaro-guadalupana',
    nombre: 'Avándaro y Guadalupana',
    municipio: 'Valle de Chalco Solidaridad',
    ageb: '058-2',
    carenciaPrincipal: 'Agua turbia y sulfurosa con alta concentración de sales que arruina tinacos',
    carenciaFuente: 'CONAGUA / ODAPAS Valle de Chalco',
    indicadorOficial: 'Agua no apta para consumo directo; 92% de familias obligadas a comprar garrafones',
    estratoSocioeconomico: 'D',
    poblacionElectoral: 46800,
    listaNominal: 44200,
    porcentajeApoyoProyectado: 58.9,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Planta Desalinizadora y Filtros Comunitarios de Agua', 'Farmacias Populares Municipales'],
    sindicatoDominante: 'Agua Potable y Limpia Municipal',
    tasaParticipacionHistorica: 49.1,
    coordenadasAprox: { lat: 19.2834, lng: -98.9287 }
  },
  {
    id: 'vch-santa-cruz-alfredo-baranda',
    nombre: 'Santa Cruz y Alfredo Baranda',
    municipio: 'Valle de Chalco Solidaridad',
    ageb: '081-3',
    carenciaPrincipal: 'Asaltos en combis hacia Metro Tláhuac y Santa Martha sobre Av. Cuauhtémoc',
    carenciaFuente: 'SESNSP / ENSU INEGI',
    indicadorOficial: '82.4% de percepción de riesgo en transporte público; asaltos a mano armada',
    estratoSocioeconomico: 'D+',
    poblacionElectoral: 39500,
    listaNominal: 37600,
    porcentajeApoyoProyectado: 53.1,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Corredor Metropolitano Seguro Cuauhtémoc con Botón de Pánico', 'Tarifa Social Integrada a Metro CDMX'],
    sindicatoDominante: 'Transporte Colectivo (Rutas Xico-Tláhuac-Santa Martha)',
    tasaParticipacionHistorica: 50.7,
    coordenadasAprox: { lat: 19.3012, lng: -98.9356 }
  },

  // ==========================================
  // 12. TECÁMAC
  // ==========================================
  {
    id: 'tec-los-heroes-tecamac',
    nombre: 'Los Héroes Tecámac (Secciones Bosques, Cedros y Jardines)',
    municipio: 'Tecámac',
    ageb: '056-4',
    carenciaPrincipal: 'Transporte insuficiente y caro hacia paraderos del Mexibús y conexión al AIFA',
    carenciaFuente: 'ENUT INEGI / SCT',
    indicadorOficial: 'Falta de unidades en horas pico; filas de 40 minutos para abordar transporte alimentador',
    estratoSocioeconomico: 'C',
    poblacionElectoral: 49800,
    listaNominal: 47900,
    porcentajeApoyoProyectado: 51.8,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Ampliación de Rutas Alimentadoras Mexibús Línea 1 y 4', 'Tarifa Cero para Estudiantes y 65+'],
    sindicatoDominante: 'Transporte Colectivo y Rutas al AIFA',
    tasaParticipacionHistorica: 53.4,
    coordenadasAprox: { lat: 19.6789, lng: -99.0123 }
  },
  {
    id: 'tec-ojo-de-agua',
    nombre: 'Ojo de Agua y Real del Sol',
    municipio: 'Tecámac',
    ageb: '018-9',
    carenciaPrincipal: 'Tandeo de agua potable por abatimiento de pozos ante crecimiento inmobiliario',
    carenciaFuente: 'CONAGUA / ODAPAS Tecámac',
    indicadorOficial: 'Presión reducida 4 días a la semana; sobreexplotación del acuífero Cuautitlán-Pachuca',
    estratoSocioeconomico: 'C+',
    poblacionElectoral: 38600,
    listaNominal: 37400,
    porcentajeApoyoProyectado: 44.8,
    prioridadBrigada: 'Zona Indecisa / Swarm Battleground',
    propuestasClaveRecomendadas: ['Moratoria a Desarrollos Masivos sin Pozo Propio', 'Cosecha de Lluvia y Pozos Inteligentes'],
    sindicatoDominante: 'Burócratas (SUTEYM) y Magisterio (SMSEM)',
    tasaParticipacionHistorica: 59.8,
    coordenadasAprox: { lat: 19.6892, lng: -99.0354 }
  },
  {
    id: 'tec-centro-pueblos',
    nombre: 'Tecámac de Felipe Villanueva y San Jerónimo Xonacahuacán',
    municipio: 'Tecámac',
    ageb: '004-2',
    carenciaPrincipal: 'Falta de médicos especialistas y desabasto de insumos en Hospital General',
    carenciaFuente: 'ENSANUT - Salud Pública Edomex',
    indicadorOficial: '36.2% de usuarios deben comprar sus propias gasas y medicamentos básicos',
    estratoSocioeconomico: 'C-',
    poblacionElectoral: 31200,
    listaNominal: 29800,
    porcentajeApoyoProyectado: 57.1,
    prioridadBrigada: 'Bastión Electoral',
    propuestasClaveRecomendadas: ['Farmacias Populares Municipales Gratuitas', 'Médico en tu Comunidad con Unidades Móviles'],
    sindicatoDominante: 'Salud y Campesinos Ejidatarios (SNTSA / CNC)',
    tasaParticipacionHistorica: 52.1,
    coordenadasAprox: { lat: 19.7125, lng: -98.9689 }
  }
];

/**
 * Obtener todas las colonias
 */
function getAllColonias() {
  return COLONIAS_DATA;
}

/**
 * Obtener colonias por municipio con búsqueda flexible
 */
function getColoniasByMunicipio(municipio = '') {
  if (!municipio) return COLONIAS_DATA;
  const cleanMuni = municipio.trim().toLowerCase();
  const filtered = COLONIAS_DATA.filter(c => {
    const cMuni = c.municipio.toLowerCase();
    return cMuni.includes(cleanMuni) || cleanMuni.includes(cMuni);
  });
  return filtered.length > 0 ? filtered : COLONIAS_DATA.filter(c => c.municipio === 'Ecatepec de Morelos');
}

/**
 * Obtener colonia específica por ID
 */
function getColoniaById(id = '') {
  return COLONIAS_DATA.find(c => c.id === id) || null;
}

/**
 * Filtrar colonias por prioridad de brigada
 */
function filterColoniasByPrioridad(municipio = '', prioridad = '') {
  const colonias = getColoniasByMunicipio(municipio);
  if (!prioridad) return colonias;
  return colonias.filter(c => c.prioridadBrigada.toLowerCase() === prioridad.toLowerCase());
}

/**
 * Calcular métricas y estadísticas de micro-targeting para un municipio
 */
function getColoniasStats(municipio = 'Ecatepec de Morelos') {
  const colonias = getColoniasByMunicipio(municipio);
  const total = colonias.length;

  let poblacionElectoralTotal = 0;
  let listaNominalTotal = 0;
  let sumaApoyo = 0;
  let bastionesCount = 0;
  let battlegroundCount = 0;
  let zonasCriticasCount = 0;

  const nseCount = {};
  const carenciasCount = {};

  colonias.forEach(c => {
    poblacionElectoralTotal += (c.poblacionElectoral || 0);
    listaNominalTotal += (c.listaNominal || 0);
    sumaApoyo += (c.porcentajeApoyoProyectado || 0);

    if (c.prioridadBrigada === 'Bastión Electoral') bastionesCount++;
    else if (c.prioridadBrigada.includes('Battleground') || c.prioridadBrigada.includes('Indecisa')) battlegroundCount++;
    else if (c.prioridadBrigada.includes('Crítica') || c.prioridadBrigada.includes('Resistencia')) zonasCriticasCount++;

    nseCount[c.estratoSocioeconomico] = (nseCount[c.estratoSocioeconomico] || 0) + 1;
    const catCarencia = (c.carenciaFuente || 'General').split('-')[0].trim();
    carenciasCount[catCarencia] = (carenciasCount[catCarencia] || 0) + 1;
  });

  const promedioApoyoProyectado = total > 0 ? Number((sumaApoyo / total).toFixed(1)) : 50;

  return {
    municipio,
    totalColoniasMapeadas: total,
    poblacionElectoralTotal,
    listaNominalTotal,
    promedioApoyoProyectado,
    bastionesCount,
    battlegroundCount,
    zonasCriticasCount,
    porcentajeBastiones: total > 0 ? Number(((bastionesCount / total) * 100).toFixed(1)) : 0,
    porcentajeBattlegrounds: total > 0 ? Number(((battlegroundCount / total) * 100).toFixed(1)) : 0,
    porcentajeZonasCriticas: total > 0 ? Number(((zonasCriticasCount / total) * 100).toFixed(1)) : 0,
    desgloseNSE: nseCount,
    desgloseCarencias: carenciasCount,
    colonias
  };
}

/**
 * Obtener lista de municipios con cobertura en la base de datos
 */
function getMunicipiosDisponibles() {
  const municipiosSet = new Set(COLONIAS_DATA.map(c => c.municipio));
  return Array.from(municipiosSet);
}

module.exports = {
  COLONIAS_DATA,
  getAllColonias,
  getColoniasByMunicipio,
  getColoniaById,
  filterColoniasByPrioridad,
  getColoniasStats,
  getMunicipiosDisponibles
};
