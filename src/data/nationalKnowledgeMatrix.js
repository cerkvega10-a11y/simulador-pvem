// Matriz de Problemáticas Sociales Reales de México (Edomex + 32 Entidades Federativas)
// Fuentes oficiales: INEGI Censo de Población y Vivienda, CONEVAL, ENSU Seguridad Pública Urbana,
// Monitoreo Conagua y Hemeroteca Estatal.

const REGIONES_NACIONALES = {
  'Ciudad de México': {
    zona: 'Zona Metropolitana del Valle de México (Capital)',
    poblacionPromedio: 575000,
    nse: { 'A/B': 16, 'C+': 22, 'C': 32, 'D+': 20, 'D/E': 10 },
    coloniasTipicas: ['Centro Histórico', 'Condesa / Roma', 'Del Valle', 'Santa Martha Acatitla', 'San Miguel Topilejo', 'Polanco', 'Doctores', 'Copilco'],
    problematicasWeb: [
      {
        tema: 'Gentrificación acelerada, encarecimiento de vivienda y rentas impagables',
        severidad: 'Crítica',
        descripcion: 'Desplazamiento de familias tradicionales y jóvenes trabajadores en Cuauhtémoc, Benito Juárez y Miguel Hidalgo por alza desmedida de rentas y plataformas de hospedaje temporal.'
      },
      {
        tema: 'Crisis hídrica crítica y tandeo severo en alcaldías del oriente y sur',
        severidad: 'Crítica',
        descripcion: 'Iztapalapa, Tlalpan, Xochimilco y Gustavo A. Madero sufren semanas consecutivas sin agua de red por recorte del Cutzamala y sobreexplotación del acuífero.'
      },
      {
        tema: 'Saturación, averías y falta de mantenimiento en la red del Metro y transporte masivo',
        severidad: 'Alta',
        descripcion: 'Líneas 3, 9, A y B colapsan en horas pico con retrasos de más de 40 minutos; reclamo constante por trenes nuevos y ventilación.'
      },
      {
        tema: 'Tensión entre ciclovías / peatonalización y saturación vehicular de automovilistas',
        severidad: 'Media-Alta',
        descripcion: 'Conflicto de movilidad por reducción de carriles para ciclovías y Metrobús sin alternativas de estacionamiento ni semaforización inteligente.'
      },
      {
        tema: 'Disputa del espacio público por comercio ambulante y franeleros',
        severidad: 'Alta',
        descripcion: 'Invasión de banquetas, accesos a estaciones del metro y cobro ilegal de estacionamiento en vía pública por grupos de franeleros.'
      }
    ],
    jergaLocal: ['el Metro', 'el transbordo', 'la renta', 'la alcaldía', 'la pipa', 'la combi a Pantitlán', 'la ciclovía']
  },

  'Norte': {
    estados: ['Nuevo León', 'Chihuahua', 'Coahuila', 'Tamaulipas', 'Sonora', 'Baja California'],
    zona: 'Región Norte e Industrial Fronteriza',
    poblacionPromedio: 750000,
    nse: { 'A/B': 18, 'C+': 24, 'C': 34, 'D+': 16, 'D/E': 8 },
    coloniasTipicas: ['Centro', 'Colonia Industrial', 'Fraccionamiento Las Cumbres', 'Zona Dorada', 'Colonia Obrera', 'Residencial San Pedro', 'Valle Oriente'],
    problematicasWeb: [
      {
        tema: 'Crisis hídrica extrema, estrés en presas y sequía agrícola',
        severidad: 'Crítica',
        descripcion: 'Bajo nivel de presas en Nuevo León, Sonora y Chihuahua; tandeos residenciales y pugnas por concesiones industriales de pozos profundos.'
      },
      {
        tema: 'Crisis de movilidad metropolitana y déficit severo de camiones urbanos',
        severidad: 'Crítica',
        descripcion: 'En el Área Metropolitana de Monterrey y ciudades fronterizas, usuarios esperan hasta 2 horas por camiones con tarifas elevadas ($15-$18 MXN).'
      },
      {
        tema: 'Altas tarifas eléctricas de CFE por uso obligatorio de aire acondicionado en olas de calor',
        severidad: 'Alta',
        descripcion: 'Temperaturas superiores a 42°C disparan los recibos de luz hasta en $4,000 MXN bimestrales, impactando gravemente la economía familiar.'
      },
      {
        tema: 'Seguridad en carreteras, pasos fronterizos e infraestructura industrial',
        severidad: 'Alta',
        descripcion: 'Extorsión en corredores de carga hacia EE.UU., asaltos en carreteras federales y necesidad de aduanas ágiles para el nearshoring.'
      },
      {
        tema: 'Contaminación por refinerías, pedreras y parques industriales pesados',
        severidad: 'Alta',
        descripcion: 'Mala calidad del aire por emisiones de azufre y partículas PM10 que provocan enfermedades respiratorias crónicas en la población.'
      }
    ],
    jergaLocal: ['la presa', 'el calorón', 'la ruta urbana', 'la frontera', 'el jale', 'el clima (aire)', 'las pedreras']
  },

  'Bajío-Occidente': {
    estados: ['Jalisco', 'Guanajuato', 'Querétaro', 'Aguascalientes', 'Michoacán', 'San Luis Potosí', 'Zacatecas'],
    zona: 'Región Bajío y Occidente Industrial-Agropecuario',
    poblacionPromedio: 620000,
    nse: { 'A/B': 14, 'C+': 22, 'C': 35, 'D+': 20, 'D/E': 9 },
    coloniasTipicas: ['Centro Histórico', 'Colonia Americana / Chapultepec', 'Juriquilla', 'Zona Campestre', 'San Miguel', 'El Sauz', 'La Estancia'],
    problematicasWeb: [
      {
        tema: 'Inseguridad, cobro de piso y violencia armada en carreteras y municipios',
        severidad: 'Crítica',
        descripcion: 'Disputa territorial de grupos delictivos en Guanajuato, Michoacán y Zacatecas; asaltos con violencia a transporte de carga y negocios locales.'
      },
      {
        tema: 'Estrés hídrico severo por sobreexplotación agrícola e industrial del acuífero',
        severidad: 'Crítica',
        descripcion: 'Pozos a más de 400 metros de profundidad en Querétaro, Guanajuato y Aguascalientes con presencia de metales pesados y tandeo vecinal.'
      },
      {
        tema: 'Tráfico colapsado en accesos metropolitanos y corredores industriales',
        severidad: 'Alta',
        descripcion: 'Saturación de la Autopista 57 en Querétaro y López Mateos en Guadalajara; demanda de trenes ligeros y transporte masivo.'
      },
      {
        tema: 'Protección de tierras de cultivo ante la especulación inmobiliaria desordenada',
        severidad: 'Media-Alta',
        descripcion: 'Invasión de zonas agrícolas de alto valor por fraccionamientos cerrados sin garantizar agua ni vialidades adecuadas.'
      },
      {
        tema: 'Contaminación de ríos y cuencas hidrológicas por descargas industriales (Río Lerma-Santiago)',
        severidad: 'Alta',
        descripcion: 'Contaminación histórica sin saneamiento que afecta comunidades ribereñas y cultivos de hortalizas.'
      }
    ],
    jergaLocal: ['la 57', 'el periférico', 'el macrolibramiento', 'el pozo', 'los sembradíos', 'la calzada']
  },

  'Sur-Sureste': {
    estados: ['Chiapas', 'Oaxaca', 'Guerrero', 'Veracruz', 'Tabasco', 'Yucatán', 'Quintana Roo', 'Campeche'],
    zona: 'Región Sur-Sureste, Costera y de Alta Biodiversidad',
    poblacionPromedio: 420000,
    nse: { 'A/B': 8, 'C+': 14, 'C': 28, 'D+': 32, 'D/E': 18 },
    coloniasTipicas: ['Centro', 'Barrio de Guadalupe', 'Colonia Linda Vista', 'Zona Hotelera / Turística', 'Ejido Terán', 'Pueblo Tradicional', 'Las Américas'],
    problematicasWeb: [
      {
        tema: 'Carencia estructural de servicios básicos (agua potable entubada, drenaje y hospitales)',
        severidad: 'Crítica',
        descripcion: 'Más del 45% de las localidades carece de red formal de drenaje; clínicas comunitarias sin medicamentos ni especialistas médicos.'
      },
      {
        tema: 'Inundaciones recurrentes por crecida de ríos y desbordamientos en temporada de huracanes',
        severidad: 'Crítica',
        descripcion: 'Anegaciones catastróficas en Tabasco, Veracruz y Chiapas por falta de desazolve de presas, bordos de contención y dragado de ríos.'
      },
      {
        tema: 'Impacto ambiental, tala de selva y encarecimiento de vida por desarrollo turístico',
        severidad: 'Alta',
        descripcion: 'En Quintana Roo y Yucatán, el boom inmobiliario encarece la canasta básica y agua para los locales mientras presiona manglares y cenotes.'
      },
      {
        tema: 'Conflictos agrarios, tenencia irregular de la tierra y defensa comunitaria del territorio',
        severidad: 'Media-Alta',
        descripcion: 'Disputas ejidales históricas y resistencia indígena ante proyectos que no realizan consultas previas e informadas.'
      },
      {
        tema: 'Dependencia de programas sociales y necesidad de apoyo directo a economías artesanales y agrícolas',
        severidad: 'Alta',
        descripcion: 'Falta de crédito barato para cafetaleros, pescadores y artesanos que dependen de intermediarios coyotes.'
      }
    ],
    jergaLocal: ['el río', 'el bordo', 'la creciente', 'el ejido', 'el temporal', 'el muelle', 'el cenote']
  }
};

/**
 * Obtiene el perfil sociopolítico y problemáticas reales para cualquier estado de México
 */
function getRegionalProfileForState(estado, municipio) {
  if (estado === 'Ciudad de México') {
    return REGIONES_NACIONALES['Ciudad de México'];
  }

  const norteEstados = REGIONES_NACIONALES['Norte'].estados;
  if (norteEstados.includes(estado)) {
    return REGIONES_NACIONALES['Norte'];
  }

  const bajioEstados = REGIONES_NACIONALES['Bajío-Occidente'].estados;
  if (bajioEstados.includes(estado)) {
    return REGIONES_NACIONALES['Bajío-Occidente'];
  }

  const surEstados = REGIONES_NACIONALES['Sur-Sureste'].estados;
  if (surEstados.includes(estado)) {
    return REGIONES_NACIONALES['Sur-Sureste'];
  }

  // Perfil centro estándar (Puebla, Hidalgo, Tlaxcala, Morelos)
  return {
    zona: `Región Centro de México (${estado})`,
    poblacionPromedio: 380000,
    nse: { 'A/B': 9, 'C+': 18, 'C': 35, 'D+': 26, 'D/E': 12 },
    coloniasTipicas: ['Centro Histórico', 'Barrio San Sebastián', 'Colonia Benito Juárez', 'Fraccionamiento Real', 'Zona Agrícola / Periférica'],
    problematicasWeb: [
      {
        tema: 'Bacheo crónico y falta de mantenimiento a carreteras estatales',
        severidad: 'Alta',
        descripcion: 'Caminos intermunicipales en mal estado que dañan mercancías agrícolas y elevan costos de transporte.'
      },
      {
        tema: 'Falta de agua potable por tandeos prolongados y contaminación de ríos locales',
        severidad: 'Crítica',
        descripcion: 'Comunidades periurbanas dependen de pozos comunitarios con caudal disminuido por sequía.'
      },
      {
        tema: 'Inseguridad en transporte de pasajeros y asaltos en tramos despoblados',
        severidad: 'Alta',
        descripcion: 'Robo a choferes y usuarios en microbuses y combis que conectan con cabeceras de empleo.'
      },
      {
        tema: 'Economía local informal dependiente de mercados sobre ruedas y tianguis',
        severidad: 'Media-Alta',
        descripcion: 'Familias exigen apoyos a microcréditos y respeto a sus lugares tradicionales de venta.'
      },
      {
        tema: 'Déficit de luminarias y servicios de salud médica de primer contacto',
        severidad: 'Media',
        descripcion: 'Centros de salud cerrados los fines de semana y calles oscuras en colonias periféricas.'
      }
    ],
    jergaLocal: ['la cabecera', 'la combi', 'el tianguis', 'el bordo', 'la carretera']
  };
}

module.exports = {
  REGIONES_NACIONALES,
  getRegionalProfileForState
};
