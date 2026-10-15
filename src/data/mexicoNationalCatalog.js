/**
 * CATÁLOGO NACIONAL DE LOS 32 ESTADOS DE LA REPÚBLICA MEXICANA
 * Incluye Municipios principales, Alcaldías (CDMX), Zonas Metropolitanas y Distritos Electorales
 * para el Panel de Control Maestro White-Label y el Radar Electoral Nacional.
 */

const { LISTA_125_MUNICIPIOS_EDOMEX } = require('./edomexDemographics');

const CATALOGO_NACIONAL_32_ESTADOS = {
  'Aguascalientes': [
    'Aguascalientes (Capital)', 'Jesús María', 'Calvillo', 'Rincón de Romos', 'Pabellón de Arteaga',
    'San Francisco de los Romo', 'Asientos', 'Tepezalá', 'Cosío', 'El Llano', 'San José de Gracia',
    'Distrito Electoral Federal 01 - Jesús María', 'Distrito Electoral Federal 02 - Aguascalientes Oriente', 'Distrito Electoral Federal 03 - Aguascalientes Poniente'
  ],
  'Baja California': [
    'Tijuana', 'Mexicali (Capital)', 'Ensenada', 'Playas de Rosarito', 'Tecate', 'San Quintín', 'San Felipe',
    'Distrito Electoral Federal 01 - Mexicali', 'Distrito Electoral Federal 04 - Tijuana Oriente', 'Distrito Electoral Federal 05 - Tijuana Centro', 'Distrito Electoral Federal 08 - Tijuana Sur'
  ],
  'Baja California Sur': [
    'La Paz (Capital)', 'Los Cabos (Cabo San Lucas / San José del Cabo)', 'Comondú', 'Mulegé', 'Loreto',
    'Distrito Electoral Federal 01 - La Paz', 'Distrito Electoral Federal 02 - Los Cabos'
  ],
  'Campeche': [
    'San Francisco de Campeche (Capital)', 'Carmen (Ciudad del Carmen)', 'Champotón', 'Escárcega', 'Calkiní',
    'Hecelchakán', 'Hopelchén', 'Tenabo', 'Palizada', 'Calakmul', 'Candelaria', 'Seybaplaya', 'Dzitbalché',
    'Distrito Electoral Federal 01 - Campeche', 'Distrito Electoral Federal 02 - Ciudad del Carmen'
  ],
  'Chiapas': [
    'Tuxtla Gutiérrez (Capital)', 'Tapachula', 'San Cristóbal de las Casas', 'Comitán de Domínguez', 'Palenque',
    'Chiapa de Corzo', 'Ocosingo', 'Villaflores', 'Tonalá', 'Cintalapa', 'Las Margaritas', 'Motozintla', 'Reforma',
    'Distrito Electoral Federal 06 - Tuxtla Poniente', 'Distrito Electoral Federal 09 - Tuxtla Oriente', 'Distrito Electoral Federal 12 - Tapachula'
  ],
  'Chihuahua': [
    'Chihuahua (Capital)', 'Juárez (Ciudad Juárez)', 'Cuauhtémoc', 'Delicias', 'Hidalgo del Parral',
    'Nuevo Casas Grandes', 'Camargo', 'Jiménez', 'Meoqui', 'Ojinaga', 'Guachochi', 'Bocoyna',
    'Distrito Electoral Federal 01 - Juárez', 'Distrito Electoral Federal 06 - Chihuahua Poniente', 'Distrito Electoral Federal 08 - Chihuahua Oriente'
  ],
  'Ciudad de México': [
    'Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa de Morelos',
    'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'La Magdalena Contreras',
    'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco',
    'Distrito Electoral Federal 04 - Iztapalapa', 'Distrito Electoral Federal 10 - Miguel Hidalgo', 'Distrito Electoral Federal 12 - Cuauhtémoc', 'Distrito Electoral Federal 15 - Benito Juárez'
  ],
  'Coahuila': [
    'Saltillo (Capital)', 'Torreón', 'Monclova', 'Piedras Negras', 'Acuña (Ciudad Acuña)',
    'Ramos Arizpe', 'Matamoros', 'San Pedro', 'Frontera', 'Sabinas', 'Parras', 'Múzquiz', 'Arteaga',
    'Distrito Electoral Federal 04 - Saltillo Norte', 'Distrito Electoral Federal 05 - Torreón Sur', 'Distrito Electoral Federal 06 - Torreón Norte'
  ],
  'Colima': [
    'Colima (Capital)', 'Manzanillo', 'Villa de Álvarez', 'Tecomán', 'Cuauhtémoc',
    'Armería', 'Coquimatlán', 'Comala', 'Ixtlahuacán', 'Minatitlán',
    'Distrito Electoral Federal 01 - Colima', 'Distrito Electoral Federal 02 - Manzanillo'
  ],
  'Durango': [
    'Durango (Victoria de Durango - Capital)', 'Gómez Palacio', 'Lerdo', 'Santiago Papasquiaro', 'Pueblo Nuevo',
    'Guadalupe Victoria', 'Cuencamé', 'Canatlán', 'Tamazula', 'Vicente Guerrero', 'Poanas',
    'Distrito Electoral Federal 01 - Durango', 'Distrito Electoral Federal 02 - Gómez Palacio', 'Distrito Electoral Federal 04 - Durango Capital'
  ],
  'Estado de México': [
    ...LISTA_125_MUNICIPIOS_EDOMEX,
    'Distrito Electoral Federal 04 - Nicolás Romero',
    'Distrito Electoral Federal 10 - Ecatepec',
    'Distrito Electoral Federal 18 - Huixquilucan',
    'Distrito Electoral Federal 19 - Tlalnepantla',
    'Distrito Electoral Federal 22 - Naucalpan',
    'Distrito Electoral Federal 26 - Toluca',
    'Distrito Electoral Federal 29 - Nezahualcóyotl'
  ],
  'Guanajuato': [
    'León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato (Capital)', 'Silao de la Victoria',
    'San Miguel de Allende', 'Pénjamo', 'Dolores Hidalgo', 'Valle de Santiago', 'San Francisco del Rincón',
    'Acámbaro', 'Uriangato', 'Cortazar', 'Salvatierra', 'Purísima del Rincón',
    'Distrito Electoral Federal 03 - León', 'Distrito Electoral Federal 04 - Guanajuato', 'Distrito Electoral Federal 09 - Irapuato', 'Distrito Electoral Federal 12 - Celaya'
  ],
  'Guerrero': [
    'Chilpancingo de los Bravo (Capital)', 'Acapulco de Juárez', 'Iguala de la Independencia', 'Zihuatanejo de Azueta',
    'Taxco de Alarcón', 'Chilapa de Álvarez', 'Tlapa de Comonfort', 'Zumpango del Río', 'Ometepec', 'Coyuca de Benítez',
    'Distrito Electoral Federal 02 - Iguala', 'Distrito Electoral Federal 04 - Acapulco', 'Distrito Electoral Federal 07 - Chilpancingo'
  ],
  'Hidalgo': [
    'Pachuca de Soto (Capital)', 'Mineral de la Reforma', 'Tulancingo de Bravo', 'Tizayuca', 'Tula de Allende',
    'Huejutla de Reyes', 'Ixmiquilpan', 'Tepeji del Río', 'Actopan', 'Tepeapulco (Ciudad Sahagún)', 'Zempoala',
    'Distrito Electoral Federal 01 - Huejutla', 'Distrito Electoral Federal 04 - Tulancingo', 'Distrito Electoral Federal 06 - Pachuca', 'Distrito Electoral Federal 07 - Tepeapulco'
  ],
  'Jalisco': [
    'Guadalajara (Capital)', 'Zapopan', 'San Pedro Tlaquepaque', 'Tlajomulco de Zúñiga', 'Tonalá',
    'Puerto Vallarta', 'El Salto', 'Lagos de Moreno', 'Tepatitlán de Morelos', 'Zapotlán el Grande (Ciudad Guzmán)',
    'Ocotlán', 'Tala', 'Arandas', 'San Juan de los Lagos', 'Ixtlahuacán de los Membrillos',
    'Distrito Electoral Federal 04 - Zapopan', 'Distrito Electoral Federal 05 - Puerto Vallarta', 'Distrito Electoral Federal 08 - Guadalajara', 'Distrito Electoral Federal 10 - Zapopan'
  ],
  'Michoacán': [
    'Morelia (Capital)', 'Uruapan', 'Zamora', 'Lázaro Cárdenas', 'Zitácuaro', 'Apatzingán',
    'Pátzcuaro', 'Hidalgo (Ciudad Hidalgo)', 'La Piedad', 'Sahuayo', 'Jacona', 'Tarímbaro', 'Zacapu', 'Maravatío',
    'Distrito Electoral Federal 01 - Lázaro Cárdenas', 'Distrito Electoral Federal 08 - Morelia Poniente', 'Distrito Electoral Federal 09 - Uruapan', 'Distrito Electoral Federal 10 - Morelia Oriente'
  ],
  'Morelos': [
    'Cuernavaca (Capital)', 'Jiutepec', 'Cuautla', 'Temixco', 'Yautepec', 'Emiliano Zapata',
    'Ayala', 'Xochitepec', 'Jojutla', 'Puente de Ixtla', 'Tepoztlán', 'Tlaltizapán', 'Zacatepec',
    'Distrito Electoral Federal 01 - Cuernavaca', 'Distrito Electoral Federal 02 - Jiutepec', 'Distrito Electoral Federal 03 - Cuautla'
  ],
  'Nayarit': [
    'Tepic (Capital)', 'Bahía de Banderas (Nuevo Vallarta / Bucerías)', 'Santiago Ixcuintla', 'Compostela',
    'Xalisco', 'Tuxpan', 'Ixtlán del Río', 'Acaponeta', 'Tecuala', 'San Blas', 'Rosamorada',
    'Distrito Electoral Federal 01 - Santiago Ixcuintla', 'Distrito Electoral Federal 02 - Tepic', 'Distrito Electoral Federal 03 - Bahía de Banderas'
  ],
  'Nuevo León': [
    'Monterrey (Capital)', 'Guadalupe', 'Apodaca', 'San Nicolás de los Garza', 'General Escobedo',
    'Santa Catarina', 'Juárez', 'García', 'San Pedro Garza García', 'Cadereyta Jiménez', 'Santiago', 'Montemorelos', 'Linares', 'Pesquería',
    'Distrito Electoral Federal 01 - Santa Catarina / San Pedro', 'Distrito Electoral Federal 04 - Monterrey / San Nicolás', 'Distrito Electoral Federal 06 - Monterrey', 'Distrito Electoral Federal 11 - Guadalupe'
  ],
  'Oaxaca': [
    'Oaxaca de Juárez (Capital)', 'San Juan Bautista Tuxtepec', 'Juchitán de Zaragoza', 'Salina Cruz',
    'Santa Cruz Xoxocotlán', 'Huajuapan de León', 'Santa Lucía del Camino', 'Santo Domingo Tehuantepec',
    'San Pedro Mixtepec (Puerto Escondido)', 'Santa María Huatulco', 'Miahuatlán de Porfirio Díaz', 'Tlaxiaco',
    'Distrito Electoral Federal 01 - Tuxtepec', 'Distrito Electoral Federal 07 - Ciudad Ixtepec', 'Distrito Electoral Federal 08 - Oaxaca de Juárez'
  ],
  'Puebla': [
    'Puebla (Heroica Puebla de Zaragoza - Capital)', 'Tehuacán', 'San Martín Texmelucan', 'San Andrés Cholula',
    'San Pedro Cholula', 'Atlixco', 'Cuautlancingo', 'Amozoc', 'Teziutlán', 'Huauchinango', 'Izúcar de Matamoros', 'Zacatlán', 'Xicotepec',
    'Distrito Electoral Federal 06 - Puebla', 'Distrito Electoral Federal 09 - Puebla', 'Distrito Electoral Federal 10 - Cholula', 'Distrito Electoral Federal 15 - Tehuacán'
  ],
  'Querétaro': [
    'Querétaro (Santiago de Querétaro - Capital)', 'San Juan del Río', 'El Marqués', 'Corregidora',
    'Tequisquiapan', 'Pedro Escobedo', 'Cadereyta de Montes', 'Colón', 'Ezequiel Montes', 'Amealco de Bonfil', 'Jalpan de Serra', 'Huimilpan',
    'Distrito Electoral Federal 02 - San Juan del Río', 'Distrito Electoral Federal 03 - Querétaro', 'Distrito Electoral Federal 04 - Querétaro / Corregidora', 'Distrito Electoral Federal 05 - El Marqués'
  ],
  'Quintana Roo': [
    'Benito Juárez (Cancún)', 'Solidaridad (Playa del Carmen)', 'Othón P. Blanco (Chetumal - Capital)',
    'Cozumel', 'Tulum', 'Felipe Carrillo Puerto', 'Isla Mujeres', 'Bacalar', 'Puerto Morelos', 'José María Morelos', 'Lázaro Cárdenas',
    'Distrito Electoral Federal 01 - Playa del Carmen', 'Distrito Electoral Federal 02 - Chetumal', 'Distrito Electoral Federal 03 - Cancún', 'Distrito Electoral Federal 04 - Cancún'
  ],
  'San Luis Potosí': [
    'San Luis Potosí (Capital)', 'Soledad de Graciano Sánchez', 'Ciudad Valles', 'Matehuala', 'Rioverde',
    'Tamazunchale', 'Mexquitic de Carmona', 'Villa de Reyes', 'Ciudad Fernández', 'Santa María del Río', 'Ébano',
    'Distrito Electoral Federal 02 - Soledad de Graciano Sánchez', 'Distrito Electoral Federal 04 - Ciudad Valles', 'Distrito Electoral Federal 05 - San Luis Potosí', 'Distrito Electoral Federal 06 - San Luis Potosí'
  ],
  'Sinaloa': [
    'Culiacán (Capital)', 'Mazatlán', 'Ahome (Los Mochis)', 'Guasave', 'Navolato',
    'El Fuerte', 'Salvador Alvarado (Guamúchil)', 'Escuinapa', 'Sinaloa de Leyva', 'Angostura', 'Rosario', 'Mocorito',
    'Distrito Electoral Federal 01 - Mazatlán', 'Distrito Electoral Federal 02 - Los Mochis', 'Distrito Electoral Federal 05 - Culiacán', 'Distrito Electoral Federal 07 - Culiacán'
  ],
  'Sonora': [
    'Hermosillo (Capital)', 'Cajeme (Ciudad Obregón)', 'Nogales', 'San Luis Río Colorado', 'Navojoa',
    'Guaymas', 'Puerto Peñasco', 'Agua Prieta', 'Caborca', 'Huatabampo', 'Empalme', 'Cananea', 'Magdalena',
    'Distrito Electoral Federal 02 - Nogales', 'Distrito Electoral Federal 03 - Hermosillo Norte', 'Distrito Electoral Federal 05 - Hermosillo Sur', 'Distrito Electoral Federal 06 - Cajeme'
  ],
  'Tabasco': [
    'Centro (Villahermosa - Capital)', 'Cárdenas', 'Comalcalco', 'Huimanguillo', 'Macuspana',
    'Cunduacán', 'Paraíso', 'Centla', 'Nacajuca', 'Teapa', 'Jalpa de Méndez', 'Tenosique', 'Balancán',
    'Distrito Electoral Federal 01 - Macuspana', 'Distrito Electoral Federal 02 - Cárdenas', 'Distrito Electoral Federal 03 - Comalcalco', 'Distrito Electoral Federal 04 - Villahermosa'
  ],
  'Tamaulipas': [
    'Reynosa', 'Matamoros', 'Nuevo Laredo', 'Victoria (Ciudad Victoria - Capital)', 'Tampico',
    'Altamira', 'Ciudad Madero', 'Río Bravo', 'El Mante', 'Valle Hermoso', 'Miguel Alemán',
    'Distrito Electoral Federal 01 - Nuevo Laredo', 'Distrito Electoral Federal 02 - Reynosa', 'Distrito Electoral Federal 04 - Matamoros', 'Distrito Electoral Federal 05 - Ciudad Victoria', 'Distrito Electoral Federal 08 - Tampico'
  ],
  'Tlaxcala': [
    'Tlaxcala (Capital)', 'Apizaco', 'Huamantla', 'Chiautempan', 'San Pablo del Monte',
    'Calpulalpan', 'Tlaxco', 'Zacatelco', 'Yauhquemehcan', 'Contla de Juan Cuamatzi', 'Papalotla de Xicohténcatl', 'Ixtacuixtla',
    'Distrito Electoral Federal 01 - Apizaco', 'Distrito Electoral Federal 02 - Tlaxcala', 'Distrito Electoral Federal 03 - Zacatelco'
  ],
  'Veracruz': [
    'Veracruz (Puerto)', 'Xalapa (Capital)', 'Coatzacoalcos', 'Córdoba', 'Poza Rica de Hidalgo',
    'Boca del Río', 'Orizaba', 'Papantla', 'Minatitlán', 'Tuxpan', 'San Andrés Tuxtla', 'Martínez de la Torre', 'Cosoleacaque', 'Tierra Blanca', 'Pánuco',
    'Distrito Electoral Federal 04 - Veracruz', 'Distrito Electoral Federal 05 - Poza Rica', 'Distrito Electoral Federal 10 - Xalapa', 'Distrito Electoral Federal 11 - Coatzacoalcos', 'Distrito Electoral Federal 12 - Veracruz / Boca del Río'
  ],
  'Yucatán': [
    'Mérida (Capital)', 'Kanasín', 'Valladolid', 'Tizimín', 'Umán', 'Progreso',
    'Tekax', 'Ticul', 'Chemax', 'Motul', 'Hunucmá', 'Izamal', 'Peto', 'Maxcanú',
    'Distrito Electoral Federal 01 - Valladolid', 'Distrito Electoral Federal 02 - Progreso', 'Distrito Electoral Federal 03 - Mérida', 'Distrito Electoral Federal 04 - Mérida', 'Distrito Electoral Federal 06 - Kanasín'
  ],
  'Zacatecas': [
    'Zacatecas (Capital)', 'Guadalupe', 'Fresnillo', 'Jerez', 'Río Grande',
    'Sombrerete', 'Loreto', 'Calera', 'Ojocaliente', 'Pinos', 'Tlaltenango de Sánchez Román', 'Nochistlán de Mejía',
    'Distrito Electoral Federal 01 - Fresnillo', 'Distrito Electoral Federal 02 - Jerez', 'Distrito Electoral Federal 03 - Zacatecas', 'Distrito Electoral Federal 04 - Guadalupe'
  ]
};

/**
 * Obtiene la lista ordenada alfabéticamente de los 32 Estados de la República Mexicana
 */
function get32StatesList() {
  return Object.keys(CATALOGO_NACIONAL_32_ESTADOS).sort((a, b) => a.localeCompare(b, 'es')).map(nombre => ({
    id: nombre.substring(0, 3).toUpperCase(),
    nombre,
    predeterminado: nombre === 'Estado de México'
  }));
}

/**
 * Obtiene los municipios/alcaldías/distritos de un estado o de múltiples estados
 */
function getMunicipalitiesByStates(statesInput) {
  const states = Array.isArray(statesInput)
    ? statesInput
    : String(statesInput || 'Estado de México').split(',').map(s => s.trim()).filter(Boolean);

  const results = [];
  const multipleStates = states.length > 1;

  states.forEach(est => {
    const lista = CATALOGO_NACIONAL_32_ESTADOS[est] || [
      `Capital de ${est}`,
      `Zona Metropolitana Norte (${est})`,
      `Zona Metropolitana Sur (${est})`,
      `Distrito Electoral Federal 01 - ${est}`,
      `Distrito Electoral Federal 02 - ${est}`
    ];

    lista.forEach(m => {
      results.push({
        estado: est,
        nombre: m,
        etiquetaCompleta: multipleStates ? `${m} (${est})` : m
      });
    });
  });

  return results;
}

module.exports = {
  CATALOGO_NACIONAL_32_ESTADOS,
  get32StatesList,
  getMunicipalitiesByStates
};
