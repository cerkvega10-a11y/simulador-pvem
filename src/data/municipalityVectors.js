// Matriz de Pesos Socioeconómicos y Sensibilidad Territorial por Estado y Municipio
// Basado en estadísticas demográficas reales (INEGI, CONEVAL, ENSU)

const MUNICIPALITY_VECTORS = {
  // ==========================================
  // ESTADO DE MÉXICO (EDOMEX)
  // ==========================================
  'Ecatepec de Morelos': {
    nombre: 'Ecatepec de Morelos',
    estado: 'Estado de México',
    peso_agua: 0.96, // Crisis hídrica severa, dependencia extrema de pipas y Cutzamala
    peso_transporte_publico: 0.94, // Más del 60% viaja a CDMX en combis / Mexibús
    peso_impuestos_predial_autos: 0.55,
    peso_comercio_informal_tianguis: 0.92, // Enorme presencia de tianguis y comercio barrial
    peso_turismo_agricultura: 0.15,
    peso_seguridad_publica: 0.97, // Focos rojos en paraderos y transporte
    peso_medio_ambiente: 0.65,
    distribucionNSE: { 'A/B': 3, 'C+': 9, 'C': 26, 'D+': 38, 'D/E': 24 },
    colonias: [
      'San Cristóbal Centro', 'Ciudad Azteca 3ra Sección', 'Jardines de Morelos',
      'Las Américas', 'Valle de Aragón 3ra Sección', 'Chiconautla',
      'Santa Clara Coatitla', 'Xalostoc', 'Tierra Blanca', 'El Chamizal',
      'San Agustín', 'Polígonos 2', 'Rinconada de Aragón', 'Tulpetlac'
    ],
    vialidadesPrincipales: ['Vía Morelos', 'Avenida Central', 'Autopista México-Pachuca', 'Av. R1', 'Circuito Exterior Mexiquense']
  },

  'Chalco': {
    nombre: 'Chalco',
    estado: 'Estado de México',
    peso_agua: 0.95, // Desabasto e inundaciones severas en temporada de lluvias
    peso_transporte_publico: 0.91, // Dependencia de combis hacia Santa Martha / La Paz
    peso_impuestos_predial_autos: 0.45,
    peso_comercio_informal_tianguis: 0.88,
    peso_turismo_agricultura: 0.40,
    peso_seguridad_publica: 0.88,
    peso_medio_ambiente: 0.70,
    distribucionNSE: { 'A/B': 2, 'C+': 7, 'C': 24, 'D+': 42, 'D/E': 25 },
    colonias: [
      'Chalco Centro', 'Culturas de México', 'Jacalones 2da Sección',
      'San Miguel Acambay', 'Los Héroes Chalco', 'Tres Marías',
      'San Juan Tezompa', 'San Martín Cuautlalpan', 'La Candelaria Tlapala'
    ],
    vialidadesPrincipales: ['Carretera Federal México-Cuautla', 'Av. Cuauhtémoc', 'Boulevard Chalco-Ixtapaluca']
  },

  'Nezahualcóyotl': {
    nombre: 'Nezahualcóyotl',
    estado: 'Estado de México',
    peso_agua: 0.93,
    peso_transporte_publico: 0.92,
    peso_impuestos_predial_autos: 0.58,
    peso_comercio_informal_tianguis: 0.94,
    peso_turismo_agricultura: 0.12,
    peso_seguridad_publica: 0.90,
    peso_medio_ambiente: 0.60,
    distribucionNSE: { 'A/B': 4, 'C+': 12, 'C': 32, 'D+': 36, 'D/E': 16 },
    colonias: [
      'Benito Juárez', 'Maravillas', 'Esperanza', 'Agua Azul',
      'Impulsora', 'Campestre Guadalupana', 'Bosques de Aragón', 'Las Águilas'
    ],
    vialidadesPrincipales: ['Av. Adolfo López Mateos', 'Av. Chimalhuacán', 'Av. Pantitlán', 'Periférico Oriente']
  },

  'Chimalhuacán': {
    nombre: 'Chimalhuacán',
    estado: 'Estado de México',
    peso_agua: 0.97,
    peso_transporte_publico: 0.95,
    peso_impuestos_predial_autos: 0.35,
    peso_comercio_informal_tianguis: 0.93,
    peso_turismo_agricultura: 0.20,
    peso_seguridad_publica: 0.95,
    peso_medio_ambiente: 0.65,
    distribucionNSE: { 'A/B': 1, 'C+': 5, 'C': 20, 'D+': 46, 'D/E': 28 },
    colonias: [
      'San Lorenzo Chimalco', 'Barrio Fundidores', 'Barrio Pescadores',
      'Santa María Nativitas', 'Acuitlapilco', 'Tlatelco', 'San Agustín Atlapulco'
    ],
    vialidadesPrincipales: ['Av. Del Peñón', 'Av. Bordo de Xochiaca', 'Av. Patos']
  },

  'Toluca': {
    nombre: 'Toluca',
    estado: 'Estado de México',
    peso_agua: 0.82, // Crisis en delegaciones norte
    peso_transporte_publico: 0.86,
    peso_impuestos_predial_autos: 0.72,
    peso_comercio_informal_tianguis: 0.78,
    peso_turismo_agricultura: 0.35,
    peso_seguridad_publica: 0.84,
    peso_medio_ambiente: 0.88, // Muy sensible a frío, calidad del aire y Nevado
    distribucionNSE: { 'A/B': 8, 'C+': 18, 'C': 34, 'D+': 26, 'D/E': 14 },
    colonias: [
      'Toluca Centro', 'San Pablo Autopan', 'El Seminario', 'San Pedro Totoltepec',
      'San Mateo Oxtotitlán', 'La Maquinita', 'Cacalomacán', 'Santa Ana Tlapaltitlán'
    ],
    vialidadesPrincipales: ['Paseo Tollocan', 'Av. Solidaridad Las Torres', 'Av. Alfredo Del Mazo', 'Paseo Colón']
  },

  'Huixquilucan': {
    nombre: 'Huixquilucan',
    estado: 'Estado de México',
    peso_agua: 0.52, // En zona residencial hay cisternas privadas, en zona tradicional tandeo
    peso_transporte_publico: 0.40, // Gran porcentaje de uso de automóvil particular
    peso_impuestos_predial_autos: 0.94, // Máxima sensibilidad a predial, tenencia, parquímetros
    peso_comercio_informal_tianguis: 0.38,
    peso_turismo_agricultura: 0.45,
    peso_seguridad_publica: 0.89, // Blindaje vecinal y cámaras
    peso_medio_ambiente: 0.85, // Bosques, plusvalía verde
    distribucionNSE: { 'A/B': 36, 'C+': 24, 'C': 18, 'D+': 14, 'D/E': 8 },
    colonias: [
      'Interlomas', 'Bosques de las Lomas (Edomex)', 'La Herradura',
      'Jesús del Monte', 'Huixquilucan Centro', 'San Fernando', 'Magdalena Chichicaspa'
    ],
    vialidadesPrincipales: ['Boulevard Interlomas', 'Vía Magna', 'Carretera Huixquilucan-Naucalpan', 'Chamapa-La Venta']
  },

  'Naucalpan de Juárez': {
    nombre: 'Naucalpan de Juárez',
    estado: 'Estado de México',
    peso_agua: 0.88, // Presa Madín, cuenca de cañadas y tandeo
    peso_transporte_publico: 0.78,
    peso_impuestos_predial_autos: 0.88,
    peso_comercio_informal_tianguis: 0.76,
    peso_turismo_agricultura: 0.22,
    peso_seguridad_publica: 0.94,
    peso_medio_ambiente: 0.82,
    distribucionNSE: { 'A/B': 22, 'C+': 20, 'C': 26, 'D+': 22, 'D/E': 10 },
    colonias: [
      'Ciudad Satélite', 'San Bartolo Centro', 'El Molinito', 'Echegaray',
      'Lomas Verdes', 'San Mateo Nopala', 'San Mateo Oxtotitlán', 'Los Remedios'
    ],
    vialidadesPrincipales: ['Periférico Norte', 'Av. Gustavo Baz', 'Av. Lomas Verdes', 'Av. Primero de Mayo']
  },

  'Tlalnepantla de Baz': {
    nombre: 'Tlalnepantla de Baz',
    estado: 'Estado de México',
    peso_agua: 0.85,
    peso_transporte_publico: 0.88,
    peso_impuestos_predial_autos: 0.75,
    peso_comercio_informal_tianguis: 0.82,
    peso_turismo_agricultura: 0.15,
    peso_seguridad_publica: 0.92,
    peso_medio_ambiente: 0.80, // Fuerte parque industrial y pasivos ambientales
    distribucionNSE: { 'A/B': 14, 'C+': 22, 'C': 32, 'D+': 22, 'D/E': 10 },
    colonias: [
      'Tlalnepantla Centro', 'San Juan Ixhuatepec (San Juanico)', 'Valle Dorado',
      'Viveros de la Loma', 'Los Reyes Ixtacala', 'Barrientos', 'Tenayuca'
    ],
    vialidadesPrincipales: ['Av. Mario Colín', 'Av. Gustavo Baz', 'Periférico Norte', 'Autopista México-Pachuca']
  },

  'Valle de Bravo': {
    nombre: 'Valle de Bravo',
    estado: 'Estado de México',
    peso_agua: 0.88, // Crisis en el nivel de la Presa de Valle de Bravo
    peso_transporte_publico: 0.35,
    peso_impuestos_predial_autos: 0.65,
    peso_comercio_informal_tianguis: 0.45,
    peso_turismo_agricultura: 0.96, // Eje central de la economía municipal
    peso_seguridad_publica: 0.78,
    peso_medio_ambiente: 0.98, // Bosques, cuenca, ordenamiento lacustre
    distribucionNSE: { 'A/B': 28, 'C+': 16, 'C': 22, 'D+': 20, 'D/E': 14 },
    colonias: [
      'Valle de Bravo Centro', 'Avándaro', 'Santa María Ahuacatlán',
      'La Peña', 'Colorines', 'San Gaspar', 'El Arco'
    ],
    vialidadesPrincipales: ['Calzada de las Almas', 'Av. Rosales', 'Carretera Toluca-Valle de Bravo']
  },

  'Tejupilco': {
    nombre: 'Tejupilco',
    estado: 'Estado de México',
    peso_agua: 0.68,
    peso_transporte_publico: 0.55,
    peso_impuestos_predial_autos: 0.30,
    peso_comercio_informal_tianguis: 0.75,
    peso_turismo_agricultura: 0.92, // Ganadería, caminos rurales y agricultura regional
    peso_seguridad_publica: 0.89,
    peso_medio_ambiente: 0.78,
    distribucionNSE: { 'A/B': 3, 'C+': 8, 'C': 25, 'D+': 40, 'D/E': 24 },
    colonias: [
      'Tejupilco Centro', 'Zacatepec', 'Rincón de Jaimes',
      'San José de la Laguna', 'La Glorieta', 'El Salitre'
    ],
    vialidadesPrincipales: ['Carretera Federal 134 (Toluca-Ciudad Altamirano)', 'Libramiento Oriente']
  },

  // ==========================================
  // CIUDAD DE MÉXICO (CDMX)
  // ==========================================
  'Iztapalapa': {
    nombre: 'Iztapalapa',
    estado: 'Ciudad de México',
    peso_agua: 0.98,
    peso_transporte_publico: 0.94,
    peso_impuestos_predial_autos: 0.48,
    peso_comercio_informal_tianguis: 0.96,
    peso_turismo_agricultura: 0.15,
    peso_seguridad_publica: 0.95,
    peso_medio_ambiente: 0.65,
    distribucionNSE: { 'A/B': 3, 'C+': 10, 'C': 28, 'D+': 39, 'D/E': 20 },
    colonias: ['Ermita Zaragoza', 'Santa Martha Acatitla', 'San Lorenzo Tezonco', 'Cerro de la Estrella', 'Cabeza de Juárez'],
    vialidadesPrincipales: ['Calzada Ermita Iztapalapa', 'Eje 6 Sur', 'Periférico Oriente']
  },

  'Benito Juárez': {
    nombre: 'Benito Juárez',
    estado: 'Ciudad de México',
    peso_agua: 0.70,
    peso_transporte_publico: 0.65,
    peso_impuestos_predial_autos: 0.95, // Altísima sensibilidad a predial, parquímetros, obras
    peso_comercio_informal_tianguis: 0.40,
    peso_turismo_agricultura: 0.10,
    peso_seguridad_publica: 0.90,
    peso_medio_ambiente: 0.88,
    distribucionNSE: { 'A/B': 45, 'C+': 30, 'C': 18, 'D+': 5, 'D/E': 2 },
    colonias: ['Del Valle Centro', 'Narvarte Poniente', 'Nápoles', 'San Pedro de los Pinos', 'Portales'],
    vialidadesPrincipales: ['Insurgentes Sur', 'Eje Central', 'Viaducto Miguel Alemán', 'Circuito Interior']
  },

  // ==========================================
  // NUEVO LEÓN (MONTERREY)
  // ==========================================
  'Monterrey': {
    nombre: 'Monterrey',
    estado: 'Nuevo León',
    peso_agua: 0.98, // Crisis de presas Cerro Prieto y La Boca
    peso_transporte_publico: 0.88, // Déficit severo de camiones urbanos
    peso_impuestos_predial_autos: 0.86,
    peso_comercio_informal_tianguis: 0.60,
    peso_turismo_agricultura: 0.30,
    peso_seguridad_publica: 0.85,
    peso_medio_ambiente: 0.92, // Calidad del aire y tarifas eléctricas CFE por calor
    distribucionNSE: { 'A/B': 24, 'C+': 24, 'C': 28, 'D+': 16, 'D/E': 8 },
    colonias: ['Mitras Centro', 'San Jerónimo', 'Cumbres 2do Sector', 'Independencia', 'Obispado', 'San Bernabé'],
    vialidadesPrincipales: ['Av. Constitución', 'Av. Gonzalitos', 'Av. Morones Prieto', 'Av. Garza Sada']
  },

  'San Pedro Garza García': {
    nombre: 'San Pedro Garza García',
    estado: 'Nuevo León',
    peso_agua: 0.75,
    peso_transporte_publico: 0.25, // Uso casi exclusivo de automóvil
    peso_impuestos_predial_autos: 0.96,
    peso_comercio_informal_tianguis: 0.15,
    peso_turismo_agricultura: 0.35,
    peso_seguridad_publica: 0.94,
    peso_medio_ambiente: 0.90,
    distribucionNSE: { 'A/B': 68, 'C+': 18, 'C': 10, 'D+': 3, 'D/E': 1 },
    colonias: ['Valle Oriente', 'Colonia del Valle', 'San Agustín', 'Tampiquito', 'Fuentes del Valle'],
    vialidadesPrincipales: ['Av. Lázaro Cárdenas', 'Calzada del Valle', 'Av. Vasconcelos']
  },

  // ==========================================
  // JALISCO (GUADALAJARA)
  // ==========================================
  'Guadalajara': {
    nombre: 'Guadalajara',
    estado: 'Jalisco',
    peso_agua: 0.84, // Lago de Chapala y presa El Zapotillo
    peso_transporte_publico: 0.82,
    peso_impuestos_predial_autos: 0.84,
    peso_comercio_informal_tianguis: 0.82,
    peso_turismo_agricultura: 0.45,
    peso_seguridad_publica: 0.92,
    peso_medio_ambiente: 0.85,
    distribucionNSE: { 'A/B': 18, 'C+': 22, 'C': 32, 'D+': 20, 'D/E': 8 },
    colonias: ['Americana', 'Providencia', 'Oblatos', 'Santa Tere', 'Centro Barranquitas'],
    vialidadesPrincipales: ['Av. Vallarta', 'Calzada Independencia', 'Av. Chapultepec', 'Av. López Mateos']
  },

  // ==========================================
  // QUINTANA ROO (CANCÚN / BENITO JUÁREZ)
  // ==========================================
  'Cancún (Benito Juárez)': {
    nombre: 'Cancún (Benito Juárez)',
    estado: 'Quintana Roo',
    peso_agua: 0.75,
    peso_transporte_publico: 0.80,
    peso_impuestos_predial_autos: 0.70,
    peso_comercio_informal_tianguis: 0.65,
    peso_turismo_agricultura: 0.98, // Economía 100% turística
    peso_seguridad_publica: 0.95,
    peso_medio_ambiente: 0.96, // Sargazo, manglares, playas públicas
    distribucionNSE: { 'A/B': 14, 'C+': 20, 'C': 30, 'D+': 24, 'D/E': 12 },
    colonias: ['Zona Hotelera', 'Supermanzana 20', 'Región 100', 'Villas Otoch Paraíso', 'Bonampak'],
    vialidadesPrincipales: ['Boulevard Kukulcán', 'Av. Tulum', 'Av. Kabah', 'Av. Colosio']
  }
};

/**
 * Obtiene el vector socioeconómico para cualquier municipio o genera uno adaptativo
 */
function getMunicipalityVector(municipio, estado) {
  if (!municipio) municipio = 'Ecatepec de Morelos';

  // Búsqueda directa o normalizada
  const muniKey = Object.keys(MUNICIPALITY_VECTORS).find(
    k => k.toLowerCase() === municipio.toLowerCase() ||
         municipio.toLowerCase().includes(k.toLowerCase()) ||
         k.toLowerCase().includes(municipio.toLowerCase())
  );

  if (muniKey && MUNICIPALITY_VECTORS[muniKey]) {
    return MUNICIPALITY_VECTORS[muniKey];
  }

  // Generador adaptativo basado en el Estado o tipo de territorio
  const esEdomex = (estado || '').toLowerCase().includes('m[eé]xico');
  const esNorte = /(nuevo le[oó]n|coahuila|chihuahua|sonora|tamaulipas|baja california)/i.test(estado || '');
  const esCostero = /(quintana roo|yucat[aá]n|guerrero|oaxaca|veracruz|baja california sur)/i.test(estado || '');

  return {
    nombre: municipio,
    estado: estado || 'Estado de México',
    peso_agua: esNorte ? 0.92 : (esEdomex ? 0.88 : 0.75),
    peso_transporte_publico: esEdomex ? 0.88 : 0.75,
    peso_impuestos_predial_autos: 0.65,
    peso_comercio_informal_tianguis: esEdomex ? 0.80 : 0.70,
    peso_turismo_agricultura: esCostero ? 0.94 : 0.40,
    peso_seguridad_publica: 0.88,
    peso_medio_ambiente: 0.80,
    distribucionNSE: { 'A/B': 10, 'C+': 18, 'C': 32, 'D+': 26, 'D/E': 14 },
    colonias: [
      `${municipio} Centro`, 'Barrio San Juan', 'Colonia Hidalgo',
      'Unidad Morelos', 'La Esperanza', 'Valle Verde', 'San Pedro'
    ],
    vialidadesPrincipales: ['Avenida Principal', 'Carretera Estatal', 'Circuito Poniente']
  };
}

module.exports = {
  MUNICIPALITY_VECTORS,
  getMunicipalityVector
};
