/**
 * CATÁLOGO NACIONAL DE LOS 32 INSTITUTOS ELECTORALES LOCALES (OPLEs) + INE
 * GovTech War Room — Neural Media House
 * 
 * Proporciona adaptación jurídica, institucional y estadística dinámica para las
 * 32 entidades federativas de México, enlazando al INE y al OPLE correspondiente.
 */

const OPLES_NATIONAL_CATALOG = {
  'Aguascalientes': {
    siglas: 'IEE Aguascalientes',
    nombreCompleto: 'Instituto Estatal Electoral de Aguascalientes',
    urlOficial: 'https://www.ieeags.org.mx/',
    urlComputos: 'https://www.ieeags.org.mx/',
    legislacionLocal: 'Código Electoral del Estado de Aguascalientes',
    tribunalLocal: 'Tribunal Electoral del Estado de Aguascalientes (TEEA)',
    aniosEleccionRecientes: ['2024', '2022', '2021', '2019', '2018']
  },
  'Baja California': {
    siglas: 'IEEBC',
    nombreCompleto: 'Instituto Estatal Electoral de Baja California',
    urlOficial: 'https://www.ieebc.mx/',
    urlComputos: 'https://www.ieebc.mx/',
    legislacionLocal: 'Ley Electoral del Estado de Baja California',
    tribunalLocal: 'Tribunal de Justicia Electoral del Estado de Baja California (TJEBC)',
    aniosEleccionRecientes: ['2024', '2021', '2019', '2018']
  },
  'Baja California Sur': {
    siglas: 'IEEBCS',
    nombreCompleto: 'Instituto Estatal Electoral de Baja California Sur',
    urlOficial: 'https://www.ieebcs.org.mx/',
    urlComputos: 'https://www.ieebcs.org.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales del Estado de Baja California Sur',
    tribunalLocal: 'Tribunal Estatal Electoral de Baja California Sur (TEEBCS)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Campeche': {
    siglas: 'IEEC',
    nombreCompleto: 'Instituto Electoral del Estado de Campeche',
    urlOficial: 'https://www.ieec.org.mx/',
    urlComputos: 'https://www.ieec.org.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales del Estado de Campeche',
    tribunalLocal: 'Tribunal Electoral del Estado de Campeche (TEEC)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Chiapas': {
    siglas: 'IEPC Chiapas',
    nombreCompleto: 'Instituto de Elecciones y Participación Ciudadana de Chiapas',
    urlOficial: 'https://www.iepc-chiapas.org.mx/',
    urlComputos: 'https://www.iepc-chiapas.org.mx/',
    legislacionLocal: 'Código de Elecciones y Participación Ciudadana del Estado de Chiapas',
    tribunalLocal: 'Tribunal Electoral del Estado de Chiapas (TEECH)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Chihuahua': {
    siglas: 'IEE Chihuahua',
    nombreCompleto: 'Instituto Estatal Electoral de Chihuahua',
    urlOficial: 'https://www.ieechihuahua.org.mx/',
    urlComputos: 'https://www.ieechihuahua.org.mx/',
    legislacionLocal: 'Ley Electoral del Estado de Chihuahua',
    tribunalLocal: 'Tribunal Estatal Electoral de Chihuahua (TEE)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2016']
  },
  'Ciudad de México': {
    siglas: 'IECM',
    nombreCompleto: 'Instituto Electoral de la Ciudad de México',
    urlOficial: 'https://www.iecm.mx/',
    urlComputos: 'https://www.iecm.mx/www/sites/resultados2024/',
    legislacionLocal: 'Código de Instituciones y Procedimientos Electorales de la Ciudad de México',
    tribunalLocal: 'Tribunal Electoral de la Ciudad de México (TECDMX)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Coahuila': {
    siglas: 'IEC Coahuila',
    nombreCompleto: 'Instituto Electoral de Coahuila',
    urlOficial: 'https://www.iec.org.mx/',
    urlComputos: 'https://www.iec.org.mx/',
    legislacionLocal: 'Código Electoral para el Estado de Coahuila de Zaragoza',
    tribunalLocal: 'Tribunal Electoral del Estado de Coahuila de Zaragoza (TECZ)',
    aniosEleccionRecientes: ['2024', '2023', '2021', '2020', '2018']
  },
  'Colima': {
    siglas: 'IEE Colima',
    nombreCompleto: 'Instituto Electoral del Estado de Colima',
    urlOficial: 'https://ieecolima.org.mx/',
    urlComputos: 'https://ieecolima.org.mx/',
    legislacionLocal: 'Código Electoral del Estado de Colima',
    tribunalLocal: 'Tribunal Electoral del Estado de Colima (TEE)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Durango': {
    siglas: 'IEPC Durango',
    nombreCompleto: 'Instituto Electoral y de Participación Ciudadana del Estado de Durango',
    urlOficial: 'https://www.iepcdurango.mx/',
    urlComputos: 'https://www.iepcdurango.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales para el Estado de Durango',
    tribunalLocal: 'Tribunal Electoral del Estado de Durango (TEED)',
    aniosEleccionRecientes: ['2024', '2022', '2021', '2019', '2018']
  },
  'Estado de México': {
    siglas: 'IEEM',
    nombreCompleto: 'Instituto Electoral del Estado de México',
    urlOficial: 'https://www.ieem.org.mx/',
    urlComputos: 'https://www.ieem.org.mx/numeralia/result_elect.html',
    legislacionLocal: 'Código Electoral del Estado de México (CEEM)',
    tribunalLocal: 'Tribunal Electoral del Estado de México (TEEM)',
    aniosEleccionRecientes: ['2024', '2023', '2021', '2018', '2017']
  },
  'Guanajuato': {
    siglas: 'IEEG',
    nombreCompleto: 'Instituto Electoral del Estado de Guanajuato',
    urlOficial: 'https://www.ieeg.mx/',
    urlComputos: 'https://www.ieeg.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales para el Estado de Guanajuato',
    tribunalLocal: 'Tribunal Estatal Electoral de Guanajuato (TEEG)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Guerrero': {
    siglas: 'IEPC Guerrero',
    nombreCompleto: 'Instituto Electoral y de Participación Ciudadana del Estado de Guerrero',
    urlOficial: 'https://www.iepcgro.mx/',
    urlComputos: 'https://www.iepcgro.mx/',
    legislacionLocal: 'Ley Número 483 de Instituciones y Procedimientos Electorales del Estado de Guerrero',
    tribunalLocal: 'Tribunal Electoral del Estado de Guerrero (TEEGRO)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Hidalgo': {
    siglas: 'IEEH',
    nombreCompleto: 'Instituto Estatal Electoral de Hidalgo',
    urlOficial: 'https://www.ieehidalgo.org.mx/',
    urlComputos: 'https://www.ieehidalgo.org.mx/',
    legislacionLocal: 'Código Electoral del Estado de Hidalgo',
    tribunalLocal: 'Tribunal Electoral del Estado de Hidalgo (TEEH)',
    aniosEleccionRecientes: ['2024', '2022', '2021', '2020', '2018']
  },
  'Jalisco': {
    siglas: 'IEPC Jalisco',
    nombreCompleto: 'Instituto Electoral y de Participación Ciudadana del Estado de Jalisco',
    urlOficial: 'https://www.iepcjalisco.org.mx/',
    urlComputos: 'https://www.iepcjalisco.org.mx/',
    legislacionLocal: 'Código Electoral del Estado de Jalisco',
    tribunalLocal: 'Tribunal Electoral del Estado de Jalisco (TRIEJAL)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Michoacán': {
    siglas: 'IEM Michoacán',
    nombreCompleto: 'Instituto Electoral de Michoacán',
    urlOficial: 'https://www.iem.org.mx/',
    urlComputos: 'https://www.iem.org.mx/',
    legislacionLocal: 'Código Electoral del Estado de Michoacán de Ocampo',
    tribunalLocal: 'Tribunal Electoral del Estado de Michoacán (TEEM)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Morelos': {
    siglas: 'IMPEPAC',
    nombreCompleto: 'Instituto Morelense de Procesos Electorales y Participación Ciudadana',
    urlOficial: 'https://impepac.mx/',
    urlComputos: 'https://impepac.mx/',
    legislacionLocal: 'Código de Instituciones y Procedimientos Electorales para el Estado de Morelos',
    tribunalLocal: 'Tribunal Electoral del Estado de Morelos (TEEM)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Nayarit': {
    siglas: 'IEEN',
    nombreCompleto: 'Instituto Estatal Electoral de Nayarit',
    urlOficial: 'https://ieenayarit.org/',
    urlComputos: 'https://ieenayarit.org/',
    legislacionLocal: 'Ley Electoral del Estado de Nayarit',
    tribunalLocal: 'Tribunal Estatal Electoral de Nayarit (TEEN)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2017']
  },
  'Nuevo León': {
    siglas: 'IEEPCNL',
    nombreCompleto: 'Instituto Estatal Electoral y de Participación Ciudadana de Nuevo León',
    urlOficial: 'https://www.ieepcnl.mx/',
    urlComputos: 'https://www.ieepcnl.mx/',
    legislacionLocal: 'Ley Electoral para el Estado de Nuevo León',
    tribunalLocal: 'Tribunal Electoral del Estado de Nuevo León (TEENL)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Oaxaca': {
    siglas: 'IEEPCO',
    nombreCompleto: 'Instituto Estatal Electoral y de Participación Ciudadana de Oaxaca',
    urlOficial: 'https://www.ieepco.org.mx/',
    urlComputos: 'https://www.ieepco.org.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales del Estado de Oaxaca',
    tribunalLocal: 'Tribunal Electoral del Estado de Oaxaca (TEEO)',
    aniosEleccionRecientes: ['2024', '2022', '2021', '2018']
  },
  'Puebla': {
    siglas: 'IEE Puebla',
    nombreCompleto: 'Instituto Electoral del Estado de Puebla',
    urlOficial: 'https://www.ieepuebla.org.mx/',
    urlComputos: 'https://www.ieepuebla.org.mx/',
    legislacionLocal: 'Código de Instituciones y Procesos Electorales del Estado de Puebla',
    tribunalLocal: 'Tribunal Electoral del Estado de Puebla (TEEP)',
    aniosEleccionRecientes: ['2024', '2021', '2019', '2018']
  },
  'Querétaro': {
    siglas: 'IEEQ',
    nombreCompleto: 'Instituto Electoral del Estado de Querétaro',
    urlOficial: 'https://ieeq.mx/',
    urlComputos: 'https://ieeq.mx/',
    legislacionLocal: 'Ley Electoral del Estado de Querétaro',
    tribunalLocal: 'Tribunal Electoral del Estado de Querétaro (TEEQ)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Quintana Roo': {
    siglas: 'IEQROO',
    nombreCompleto: 'Instituto Electoral de Quintana Roo',
    urlOficial: 'https://www.ieqroo.org.mx/',
    urlComputos: 'https://www.ieqroo.org.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales para el Estado de Quintana Roo',
    tribunalLocal: 'Tribunal Electoral de Quintana Roo (TEQROO)',
    aniosEleccionRecientes: ['2024', '2022', '2021', '2019', '2018']
  },
  'San Luis Potosí': {
    siglas: 'CEEPAC',
    nombreCompleto: 'Consejo Estatal Electoral y de Participación Ciudadana de San Luis Potosí',
    urlOficial: 'https://www.ceepacslp.org.mx/',
    urlComputos: 'https://www.ceepacslp.org.mx/',
    legislacionLocal: 'Ley Electoral del Estado de San Luis Potosí',
    tribunalLocal: 'Tribunal Electoral del Estado de San Luis Potosí (TEESLP)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Sinaloa': {
    siglas: 'IEES Sinaloa',
    nombreCompleto: 'Instituto Electoral del Estado de Sinaloa',
    urlOficial: 'https://www.ieesinaloa.mx/',
    urlComputos: 'https://www.ieesinaloa.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales del Estado de Sinaloa',
    tribunalLocal: 'Tribunal Electoral del Estado de Sinaloa (TEESIN)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2016']
  },
  'Sonora': {
    siglas: 'IEE Sonora',
    nombreCompleto: 'Instituto Estatal Electoral y de Participación Ciudadana de Sonora',
    urlOficial: 'https://www.ieesonora.org.mx/',
    urlComputos: 'https://www.ieesonora.org.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales para el Estado de Sonora',
    tribunalLocal: 'Tribunal Estatal Electoral de Sonora (TEE Sonora)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Tabasco': {
    siglas: 'IEPCT Tabasco',
    nombreCompleto: 'Instituto Electoral y de Participación Ciudadana de Tabasco',
    urlOficial: 'https://www.iepct.mx/',
    urlComputos: 'https://www.iepct.mx/',
    legislacionLocal: 'Ley Electoral y de Partidos Políticos del Estado de Tabasco',
    tribunalLocal: 'Tribunal Electoral de Tabasco (TET)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Tamaulipas': {
    siglas: 'IETAM',
    nombreCompleto: 'Instituto Electoral de Tamaulipas',
    urlOficial: 'https://www.ietam.org.mx/',
    urlComputos: 'https://www.ietam.org.mx/',
    legislacionLocal: 'Ley Electoral del Estado de Tamaulipas',
    tribunalLocal: 'Tribunal Electoral del Estado de Tamaulipas (TRIELTAM)',
    aniosEleccionRecientes: ['2024', '2022', '2021', '2018']
  },
  'Tlaxcala': {
    siglas: 'ITE Tlaxcala',
    nombreCompleto: 'Instituto Tlaxcalteca de Elecciones',
    urlOficial: 'https://www.itetlax.org.mx/',
    urlComputos: 'https://www.itetlax.org.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales para el Estado de Tlaxcala',
    tribunalLocal: 'Tribunal Electoral de Tlaxcala (TET)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2016']
  },
  'Veracruz': {
    siglas: 'OPLE Veracruz',
    nombreCompleto: 'Organismo Público Local Electoral del Estado de Veracruz',
    urlOficial: 'https://www.oplever.org.mx/',
    urlComputos: 'https://www.oplever.org.mx/',
    legislacionLocal: 'Código Número 577 Electoral para el Estado de Veracruz de Ignacio de la Llave',
    tribunalLocal: 'Tribunal Electoral de Veracruz (TEV)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2017']
  },
  'Yucatán': {
    siglas: 'IEPAC Yucatán',
    nombreCompleto: 'Instituto Electoral y de Participación Ciudadana de Yucatán',
    urlOficial: 'https://www.iepac.mx/',
    urlComputos: 'https://www.iepac.mx/',
    legislacionLocal: 'Ley de Instituciones y Procedimientos Electorales del Estado de Yucatán',
    tribunalLocal: 'Tribunal Electoral del Estado de Yucatán (TEEY)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2015']
  },
  'Zacatecas': {
    siglas: 'IEEZ Zacatecas',
    nombreCompleto: 'Instituto Electoral del Estado de Zacatecas',
    urlOficial: 'https://www.ieez.org.mx/',
    urlComputos: 'https://www.ieez.org.mx/',
    legislacionLocal: 'Ley Electoral del Estado de Zacatecas',
    tribunalLocal: 'Tribunal de Justicia Electoral del Estado de Zacatecas (TRIJEZ)',
    aniosEleccionRecientes: ['2024', '2021', '2018', '2016']
  }
};

function getOpleByState(estado = 'Estado de México') {
  const cleanState = (estado || 'Estado de México').trim();
  if (OPLES_NATIONAL_CATALOG[cleanState]) {
    return {
      estado: cleanState,
      ...OPLES_NATIONAL_CATALOG[cleanState],
      aniosEleccionRecientes: OPLES_NATIONAL_CATALOG[cleanState].aniosEleccionRecientes || ['2024', '2021', '2018']
    };
  }
  const matchKey = Object.keys(OPLES_NATIONAL_CATALOG).find(
    k => k.toLowerCase() === cleanState.toLowerCase() || cleanState.toLowerCase().includes(k.toLowerCase())
  );
  if (matchKey) {
    return {
      estado: matchKey,
      ...OPLES_NATIONAL_CATALOG[matchKey],
      aniosEleccionRecientes: OPLES_NATIONAL_CATALOG[matchKey].aniosEleccionRecientes || ['2024', '2021', '2018']
    };
  }
  return {
    estado: cleanState,
    siglas: `OPLE ${cleanState}`,
    nombreCompleto: `Instituto Estatal Electoral de ${cleanState}`,
    urlOficial: 'https://www.ine.mx/voto-y-elecciones/opl/',
    urlComputos: 'https://computos2024.ine.mx/',
    legislacionLocal: `Código Electoral del Estado de ${cleanState}`,
    tribunalLocal: `Tribunal Electoral del Estado de ${cleanState}`,
    aniosEleccionRecientes: ['2024', '2021', '2018']
  };
}

function getOfficialVerifiableLinksForState(estado = 'Estado de México', municipio = '') {
  const ople = getOpleByState(estado);
  return [
    {
      institucion: 'INE (Instituto Nacional Electoral)',
      documento: 'Sistema de Cómputos Distritales y Estadística Electoral Nacional',
      url: 'https://computos2024.ine.mx/',
      tipo: 'Electoral Federal'
    },
    {
      institucion: `${ople.siglas} (${ople.nombreCompleto})`,
      documento: `Portal Oficial y Cómputos Electorales de ${ople.estado}${municipio ? ' - ' + municipio : ''}`,
      url: ople.urlOficial,
      tipo: 'Electoral Local (OPLE)'
    },
    {
      institucion: 'Cámara de Diputados / LGIPE',
      documento: 'Ley General de Instituciones y Procedimientos Electorales (Vigente)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LGIPE.pdf',
      tipo: 'Marco Jurídico Electoral'
    },
    {
      institucion: 'TEPJF',
      documento: 'Jurisprudencia y Tesis del Tribunal Electoral del Poder Judicial de la Federación',
      url: 'https://www.te.gob.mx/ius2021/#/',
      tipo: 'Jurisprudencia Electoral'
    },
    {
      institucion: 'INEGI (Censo 2020 / ITER)',
      documento: `Principales Resultados por Localidad y AGEB (${ople.estado})`,
      url: 'https://www.inegi.org.mx/programas/ccpv/2020/',
      tipo: 'Demografía y Padrón'
    },
    {
      institucion: 'CONEVAL',
      documento: `Medición de la Pobreza Municipal e Indicadores de Carencia Social (${ople.estado})`,
      url: 'https://www.coneval.org.mx/Medicion/MP/Paginas/Pobreza_2022.aspx',
      tipo: 'Socioeconómico'
    },
    {
      institucion: 'AMAI (Niveles Socioeconómicos)',
      documento: 'Regla AMAI de Clasificación de Niveles Socioeconómicos en México',
      url: 'https://www.amai.org.mx/NSE/',
      tipo: 'Estratificación NSE'
    }
  ];
}

module.exports = {
  OPLES_NATIONAL_CATALOG,
  getOpleByState,
  getOfficialVerifiableLinksForState
};
