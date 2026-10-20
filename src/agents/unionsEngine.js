// Motor de Inteligencia Sindical y Riesgo Corporativo (Módulo 2 Hiper-Expandido)
// Evalúa la reacción de las Fuerzas Sindicales Estratégicas en México
// y calcula el Semáforo de Riesgo de Paro / Bloqueo Vial (0-100) con Plan de Reacción Concreto (No Pasivo)

class UnionsEngine {
  constructor() {
    this.name = 'Motor de Inteligencia Sindical Hiper-Sensible (12+ Fuerzas Gremiales)';

    // Diccionario Masivo de Disparadores Sindicales (Módulo 2)
    this.TRIGGER_CATEGORIES = {
      politica_constitucion: {
        id: 'politica_constitucion',
        nombre: 'Política, Expresidentes y Reforma Constitucional',
        keywords: [
          'constitucion', 'reforma', 'reeleccion', 'articulo', 'presidente', 'expresidente',
          'pena nieto', 'enrique pena', 'epn', 'calderon', 'felipe calderon', 'salinas',
          'amlo', 'lopez obrador', 'zedillo', 'fox', 'morena', 'pri', 'pan', 'mc', 'pvem',
          'decreto', 'ley', 'congreso', 'camara', 'senado', 'diputado', 'ine', 'tribunal',
          'fuero', 'presupuesto', 'recorte', 'austeridad', 'privatizacion', 'concesion',
          'soberania', 'pacto por mexico', 'sufragio efectivo', 'mandato', 'regreso'
        ],
        sindicatosActivados: [
          'CNTE (Coordinadora Nacional de Trabajadores de la Educación — Secciones IX, X, XI y XXII)',
          'UNT (Unión Nacional de Trabajadores)',
          'SME (Sindicato Mexicano de Electricistas)',
          'FAT (Frente Auténtico del Trabajo)',
          'STUNAM / SITUAM (Sindicatos Universitarios de la UNAM y UAM)',
          'Frente Cívico-Sindical en Defensa de la Constitución y la No Reelección'
        ]
      },
      patrimonio_cultura_educacion: {
        id: 'patrimonio_cultura_educacion',
        nombre: 'Patrimonio Histórico, Cultura, INAH y Educación',
        keywords: [
          'castillo de chapultepec', 'chapultepec', 'museo', 'inah', 'inbal', 'monumento',
          'zona arqueologica', 'patrimonio', 'cultura', 'historico', 'historia', 'escuela',
          'universidad', 'unam', 'ipn', 'uam', 'maestros', 'docentes', 'libros de texto',
          'becas', 'ciencia', 'conahcyt', 'bellas artes', 'antropologia', 'custodios',
          'restauracion', 'recinto cultural', 'demolicion', 'demoler', 'destruir'
        ],
        sindicatosActivados: [
          'SNTSC (Sindicato Nacional de Trabajadores de la Secretaría de Cultura)',
          'SNAINAH / Sindicato Nacional de Trabajadores del INAH (Custodios, Investigadores y Museógrafos)',
          'Sindicato Nacional de Restauradores y Arquitectos del Patrimonio Federal (INAH / INBAL)',
          'CNTE / SNTE (Coordinadora y Sindicato Nacional de Trabajadores de la Educación)',
          'STUNAM / APAUNAM (Sindicatos Académicos y Administrativos Universitarios)',
          'Colectivos Estudiantiles Interuniversitarios (UNAM, IPN, UAM, ENAH)'
        ]
      },
      medio_ambiente_territorio: {
        id: 'medio_ambiente_territorio',
        nombre: 'Medio Ambiente, Territorio, Árboles y Recursos Hídricos',
        keywords: [
          'tala', 'talar', 'arbol', 'arboles', 'arbolado', 'bosque', 'selva', 'parque',
          'area verde', 'reserva', 'ecologia', 'ecocidio', 'ambiental', 'agua', 'pozo',
          'presa', 'rio', 'humedal', 'basura', 'relleno sanitario', 'mina', 'expropiacion',
          'uso de suelo', 'construccion', 'inmobiliaria', 'obra', 'concreto', 'asfalto',
          'camellon', 'deforestacion', 'semarnat', 'conafor', 'sacmex', 'conagua'
        ],
        sindicatosActivados: [
          'SNTSEMARNAT (Sindicato Nacional de Trabajadores de Medio Ambiente y CONAFOR)',
          'SUTGCDMX / SUTEYM — Sección Parques, Jardines y Conservación de Áreas Verdes',
          'Sindicatos de Agua Potable y Operación Hidráulica (SACMEX / CAEM / SNTCONAGUA)',
          'CNC / Comisariados Ejidales y Comuneros Forestales',
          'Frente de Pueblos en Defensa de la Tierra y Colectivos Ecologistas Urbanos'
        ]
      },
      transporte_vialidades_comercio: {
        id: 'transporte_vialidades_comercio',
        nombre: 'Transporte, Vialidades, Comercio e Industria',
        keywords: [
          'transporte', 'ruta', 'metro', 'metrobus', 'mexibus', 'trolebus', 'taxi', 'combi',
          'microbus', 'chofer', 'choferes', 'caseta', 'carretera', 'calle', 'avenida',
          'reforma', 'insurgentes', 'periferico', 'viaducto', 'ambulantes', 'tianguis',
          'mercado', 'local', 'locatarios', 'empresa', 'fabrica', 'planta', 'impuesto',
          'tarifa', 'multa', 'horario', 'pasaje', 'concesion', 'verificacion', 'corredor'
        ],
        sindicatosActivados: [
          'SNTSTC (Sindicato Nacional de Trabajadores del Sistema de Transporte Colectivo Metro)',
          'Alianza de Tranviarios de México y Operadores de Metrobús / Mexibús',
          'FAT / CTM — Bloque de Rutas Concesionadas, Combis, Microbuses y Taxistas',
          'Uniones de Comerciantes, Locatarios de Mercados Públicos y Tianguistas',
          'CROC / CROM y Cámaras Industriales de Autotransporte de Carga'
        ]
      },
      salud_seguridad_burocracia: {
        id: 'salud_seguridad_burocracia',
        nombre: 'Salud, Seguridad Pública y Administración Gubernamental',
        keywords: [
          'hospital', 'clinica', 'imss', 'issste', 'imss-bienestar', 'medicinas', 'medicamentos',
          'medicos', 'enfermeras', 'salud', 'policia', 'guardia', 'seguridad', 'patrulla',
          'limpia', 'trabajadores', 'contrato', 'plaza', 'basificacion', 'pension', 'afore',
          'salario', 'despido', 'liquidacion', 'burocrata', 'sindicato', 'huelga', 'paro'
        ],
        sindicatosActivados: [
          'SNTSA / SNTSS (Sindicatos Nacionales de Trabajadores de la Salud y del IMSS)',
          'SNTISSSTE (Sindicato Nacional de Trabajadores del ISSSTE)',
          'FSTSE / SUTGCDMX / SUTEYM (Federación de Sindicatos de Trabajadores al Servicio del Estado)',
          'Sindicato Único de Trabajadores de Limpia Pública y Servicios Urbanos',
          'Asociaciones de Policías Preventivos y Cuerpos de Seguridad Ciudadana'
        ]
      }
    };
  }

  normalize(str = '') {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Detecta categorías sindicales activadas por la propuesta
   */
  detectTriggeredCategories(propuestaTexto = '', tituloProyecto = '', semanticResult = {}) {
    const normTxt = this.normalize(`${tituloProyecto || ''} ${propuestaTexto || ''}`);
    const matchedCategories = [];
    const matchedKeywordsAll = [];

    for (const key of Object.keys(this.TRIGGER_CATEGORIES)) {
      const cat = this.TRIGGER_CATEGORIES[key];
      const hits = cat.keywords.filter(kw => {
        if (kw.length <= 4) {
          const rx = new RegExp(`\\b${kw}\\b`, 'i');
          return rx.test(normTxt);
        }
        return normTxt.includes(kw);
      });

      if (hits.length > 0) {
        matchedCategories.push({
          ...cat,
          hits
        });
        matchedKeywordsAll.push(...hits);
      }
    }

    // Si no hubo coincidencia literal, inferir de deepContext / temas para jamás dejar el motor pasivo
    if (matchedCategories.length === 0) {
      const dc = semanticResult?.deepContext || {};
      const flags = dc.flagsTematicos || {};
      if (flags.esTemaExpresidentePolitica) {
        matchedCategories.push({ ...this.TRIGGER_CATEGORIES.politica_constitucion, hits: ['reforma política'] });
      } else if (flags.esTemaPatrimonioChapultepec) {
        matchedCategories.push({ ...this.TRIGGER_CATEGORIES.patrimonio_cultura_educacion, hits: ['patrimonio cultural'] });
      } else if (flags.esTalaEcocidio) {
        matchedCategories.push({ ...this.TRIGGER_CATEGORIES.medio_ambiente_territorio, hits: ['medio ambiente'] });
      } else {
        // Cualquier propuesta pública impacta como mínimo a la Administración Pública y Operación Urbana
        matchedCategories.push({
          ...this.TRIGGER_CATEGORIES.salud_seguridad_burocracia,
          hits: ['operación pública y presupuesto']
        });
      }
    }

    return {
      matchedCategories,
      matchedKeywordsAll: [...new Set(matchedKeywordsAll)]
    };
  }

  /**
   * Construye el Plan de Reacción Sindical Concreto (4 elementos obligatorios del Módulo 2)
   */
  buildConcreteUnionActionPlan(propuestaTexto, municipio, estado, semanticResult, matchedCategories, riesgoParoScore) {
    const dc = semanticResult?.deepContext || {};
    const flags = dc.flagsTematicos || {};
    const temaCentral = dc.temaCentral || (propuestaTexto || '').substring(0, 90);
    const lugarTexto = (dc.lugaresEspecificos && dc.lugaresEspecificos.length > 0)
      ? dc.lugaresEspecificos.slice(0, 2).join(' y ')
      : `${municipio}, ${estado}`;
    const actorTexto = (dc.nombresPropios && dc.nombresPropios.length > 0)
      ? dc.nombresPropios.slice(0, 2).join(', ')
      : 'las autoridades promoventes';

    // 1. Nivel de Riesgo de Bloqueo / Paro (Prohibido "Sin Bloqueo / Riesgo Mínimo")
    let nivelRiesgoBloqueo = 'Moderado';
    if (riesgoParoScore >= 72 || flags.esTemaExpresidentePolitica || flags.esDestruccionPatrimonio || flags.esTalaEcocidio) {
      nivelRiesgoBloqueo = 'Crítico / Paro Nacional';
    } else if (riesgoParoScore >= 48 || semanticResult.tipo === 'PUNITIVO') {
      nivelRiesgoBloqueo = 'Alto';
    }

    // 2. Sindicatos y Gremios Específicos que Reaccionarán
    const sindicatosSet = new Set();
    matchedCategories.forEach(cat => {
      cat.sindicatosActivados.forEach(s => sindicatosSet.add(s));
    });
    const sindicatosReactivos = Array.from(sindicatosSet).slice(0, 8);

    // 3. Modo de Acción en Calle (Táctica Sindical)
    let modoAccionCalle = '';
    // 4. Protocolo de Desactivación / Negociación
    let protocoloDesactivacion = '';

    if (flags.esTemaExpresidentePolitica) {
      modoAccionCalle = `Megamarcha nacional del Ángel de la Independencia al Zócalo y cerco humano permanente al Congreso de la Unión y Senado de la República; paro nacional magisterial de 72 horas convocado por la CNTE, STUNAM, SITUAM y SME; bloqueos intermitentes en Paseo de la Reforma, Insurgentes y casetas de acceso a ${lugarTexto} en rechazo a "${temaCentral}" (${actorTexto}).`;
      protocoloDesactivacion = `Retiro inmediato o archivo definitivo de cualquier iniciativa de reforma al Artículo 83 Constitucional (Principio de No Reelección); instalación de una Mesa Nacional de Gobernabilidad con la UNT, CNTE y sindicatos universitarios garantizando que no habrá regresiones constitucionales, fueros de impunidad ni recortes a conquistas laborales.`;
    } else if (flags.esTemaPatrimonioChapultepec || matchedCategories.some(c => c.id === 'patrimonio_cultura_educacion')) {
      modoAccionCalle = `Cierre total de accesos en Paseo de la Reforma, Circuito Interior y Periférico a la altura del Bosque y Castillo de Chapultepec; paro indefinido de labores y huelga de brazos caídos de custodios, museógrafos, restauradores e investigadores del SNAINAH y SNTSC (INAH / INBAL); toma simbólica de recintos culturales y movilización conjunta con asambleas estudiantiles de la UNAM, IPN y ENAH contra "${temaCentral}".`;
      protocoloDesactivacion = `Suspensión inmediata y definitiva de cualquier intervención, demolición o alteración del recinto histórico en ${lugarTexto}; firma de un Decreto de Intangibilidad Patrimonial avalado por el Consejo de Monumentos Históricos del INAH, el SNTSC y la UNESCO, acompañado de incremento presupuestal para conservación museográfica y basificación de trabajadores de la cultura.`;
    } else if (flags.esTalaEcocidio || matchedCategories.some(c => c.id === 'medio_ambiente_territorio')) {
      modoAccionCalle = `Campamentos permanentes y encadenamiento civil-sindical en la zona arbolada de ${lugarTexto}; paro técnico de cuadrillas de Parques y Jardines (SUTGCDMX / SUTEYM) y brigadistas de SEMARNAT/CONAFOR negándose a ejecutar el derribo; bloqueo de maquinaria pesada y cierre de arterias principales junto con comisariados ejidales (CNC) y frentes ecologistas contra "${temaCentral}".`;
      protocoloDesactivacion = `Cancelación inmediata de las órdenes de tala o desmonte en ${lugarTexto}; presentación de un rediseño de ingeniería que preserve el 100% del arbolado maduro dictaminado con sindicatos ambientales (SNTSEMARNAT), compensación forestal 10 a 1 verificada por universidades públicas y mesa vinculante con ejidatarios y vecinos.`;
    } else if (matchedCategories.some(c => c.id === 'transporte_vialidades_comercio')) {
      modoAccionCalle = `Operación "Caracol" y bloqueo simultáneo de nodos viales, paraderos y accesos carreteros en ${lugarTexto} con unidades de transporte concesionado (CTM, FAT, Alianza de Tranviarios); cierre de cortinas y protesta de locatarios de mercados públicos y tianguistas frente al palacio de gobierno por las afectaciones de "${temaCentral}".`;
      protocoloDesactivacion = `Instalación de una Mesa Mixta de Movilidad y Comercio en ${lugarTexto} antes de publicar el decreto; otorgamiento de subsidio directo a la modernización de unidades, garantía escrita de no extinción de concesiones ni reubicación forzosa de comerciantes, y periodo de gracia gradual de 180 días.`;
    } else {
      modoAccionCalle = `Asambleas permanentes, paro escalonado de brazos caídos en oficinas administrativas y clínicas de ${lugarTexto}, y mitin de presión de la FSTSE, SUTEYM/SUTGCDMX y SNTSA en las inmediaciones del cabildo y vialidades primarias exigiendo certidumbre laboral y presupuestal frente a "${temaCentral}".`;
      protocoloDesactivacion = `Firma de minuta vinculante con los comités ejecutivos seccionales (FSTSE / SUTEYM / SNTSA) garantizando el respeto irrestricto al Contrato Colectivo de Trabajo, inamovilidad de plazas de base, dotación de insumos operativos y participación sindical en el comité de supervisión de "${temaCentral}".`;
    }

    return {
      nivelRiesgoBloqueo,
      sindicatosReactivos,
      modoAccionCalle,
      protocoloDesactivacion,
      categoriasDisparadas: matchedCategories.map(c => ({
        id: c.id,
        nombre: c.nombre,
        palabrasDetectadas: c.hits
      }))
    };
  }

  /**
   * Evalúa las 12 Fuerzas Sindicales frente a la propuesta y el municipio
   */
  evaluateUnions(propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', semanticResult = {}, aiUnionData = null) {
    const dc = semanticResult?.deepContext || {};
    const flags = dc.flagsTematicos || {};
    const temaCentral = dc.temaCentral || (propuestaTexto || '').substring(0, 90);
    const lugar = (dc.lugaresEspecificos && dc.lugaresEspecificos[0]) || municipio;
    const normTxt = this.normalize(propuestaTexto);

    const { matchedCategories, matchedKeywordsAll } = this.detectTriggeredCategories(
      propuestaTexto,
      dc.temaCentral || '',
      semanticResult
    );

    const esAltamenteControversial = Boolean(
      flags.esTemaExpresidentePolitica ||
      flags.esDestruccionPatrimonio ||
      flags.esTalaEcocidio ||
      semanticResult.tipo === 'PUNITIVO'
    );

    // 12 Fuerzas Sindicales Estratégicas con sensibilidad expandida (Módulo 2)
    const FUERZAS_BASE = [
      {
        id: 'magisterio',
        gremio: 'Magisterio, Cultura, INAH y Universidades',
        siglas: 'CNTE / SNTE / SNAINAH / SNTSC / STUNAM',
        sensibilidad: [
          'castillo de chapultepec', 'chapultepec', 'museo', 'inah', 'inbal', 'monumento',
          'zona arqueologica', 'patrimonio', 'cultura', 'escuela', 'universidad', 'unam',
          'ipn', 'uam', 'maestros', 'docentes', 'libros de texto', 'becas', 'ciencia',
          'constitucion', 'reforma', 'reeleccion', 'pena nieto', 'expresidente'
        ],
        pliegoBase: `Defensa irrestricta del patrimonio histórico-cultural (INAH/INBAL), autonomía universitaria y rechazo a regresiones constitucionales frente a "${temaCentral}" en ${lugar}.`,
        liderTestimonio: `Desde el SNAINAH, SNTSC, CNTE y STUNAM advertimos que no permitiremos ningún atropello al patrimonio histórico, la educación pública ni el orden constitucional con "${temaCentral}".`
      },
      {
        id: 'campesinos',
        gremio: 'Medio Ambiente, Parques y Jardines, Bosques y Ejidos',
        siglas: 'SNTSEMARNAT / CONAFOR / SUTGCDMX-Parques / CNC',
        sensibilidad: [
          'tala', 'talar', 'arbol', 'arboles', 'bosque', 'selva', 'parque', 'area verde',
          'reserva', 'ecologia', 'agua', 'pozo', 'presa', 'rio', 'mina', 'expropiacion',
          'uso de suelo', 'chapultepec', 'campo', 'ejido', 'forestal', 'ambiental'
        ],
        pliegoBase: `Veda total a la tala de arbolado urbano y forestal, respeto a reservas ecológicas y dictamen ambiental vinculante del SNTSEMARNAT y comisariados ejidales sobre "${temaCentral}".`,
        liderTestimonio: `Los trabajadores de SEMARNAT, CONAFOR, Parques y Jardines y núcleos ejidales bloquearemos cualquier intento de ecocidio, tala de árboles o privatización de áreas verdes en ${lugar}.`
      },
      {
        id: 'burocratas',
        gremio: 'Burócratas, Poder Legislativo y Servidores Públicos',
        siglas: 'FSTSE / SUTGCDMX / SUTEYM / UNT',
        sensibilidad: [
          'constitucion', 'reforma', 'reeleccion', 'articulo', 'presidente', 'expresidente',
          'pena nieto', 'calderon', 'salinas', 'amlo', 'decreto', 'ley', 'congreso',
          'camara', 'ine', 'tribunal', 'presupuesto', 'recorte', 'austeridad', 'gobierno',
          'municipio', 'contrato', 'plaza', 'pension', 'salario', 'despido'
        ],
        pliegoBase: `Respeto a la estabilidad laboral del servicio público, rechazo a reformas regresivas de Estado y blindaje presupuestal de plazas sindicalizadas ante "${temaCentral}".`,
        liderTestimonio: `Los sindicatos de Estado y la UNT nos declaramos en alerta máxima ante "${temaCentral}": cualquier recorte, imposición política o violación institucional detonará paro de labores.`
      },
      {
        id: 'transporte',
        gremio: 'Transporte Público, Metro, Metrobús y Vialidades',
        siglas: 'SNTSTC Metro / Alianza de Tranviarios / FAT / CTM',
        sensibilidad: [
          'transporte', 'ruta', 'metro', 'metrobus', 'mexibus', 'taxi', 'combi', 'choferes',
          'caseta', 'carretera', 'calle', 'avenida', 'reforma', 'tarifa', 'multa', 'pasaje',
          'concesion', 'tala', 'obra', 'construccion'
        ],
        pliegoBase: `Mesas técnicas previas sobre afectaciones viales, subsidio operativo, respeto a concesiones y derechos laborales de operadores ante "${temaCentral}" en ${lugar}.`,
        liderTestimonio: `Si "${temaCentral}" altera las arterias viales, tarifas o fuentes de trabajo del transporte en ${lugar} sin acuerdo previo, cerraremos los accesos principales.`
      },
      {
        id: 'agua_limpia',
        gremio: 'Agua Potable, Drenaje, Limpia y Servicios Urbanos',
        siglas: 'SACMEX / CAEM / SNTCONAGUA / Limpia Pública',
        sensibilidad: [
          'agua', 'pozo', 'presa', 'rio', 'basura', 'relleno sanitario', 'drenaje',
          'limpia', 'recoleccion', 'parque', 'arbol', 'tala', 'obra', 'inmobiliaria'
        ],
        pliegoBase: `Protección de mantos acuíferos, dotación de equipo pesado y basificación de cuadrillas operativas de agua y limpia frente a "${temaCentral}".`,
        liderTestimonio: `Las cuadrillas de agua y limpia pública exigimos que "${temaCentral}" no comprometa los pozos ni sobrecargue la infraestructura sanitaria de ${lugar}.`
      },
      {
        id: 'salud',
        gremio: 'Salud, Médicos, IMSS e ISSSTE',
        siglas: 'SNTSA / SNTSS / SNTISSSTE',
        sensibilidad: [
          'hospital', 'clinica', 'imss', 'issste', 'medicinas', 'medicos', 'enfermeras',
          'salud', 'presupuesto', 'recorte', 'austeridad', 'pension', 'ambiental', 'tala'
        ],
        pliegoBase: `Abasto garantizado de medicamentos, basificación de personal médico y blindaje al presupuesto de salud pública antes de destinar recursos a "${temaCentral}".`,
        liderTestimonio: `El gremio médico y de enfermería advierte que no se puede desviar presupuesto ni deteriorar la salud ambiental de ${lugar} con proyectos como "${temaCentral}".`
      },
      {
        id: 'electricistas',
        gremio: 'Electricistas, Energía y Frente Sindical Independiente',
        siglas: 'SME / SUTERM / Frente Sindical Mexicano',
        sensibilidad: [
          'energia', 'electrico', 'luz', 'cfe', 'solar', 'privatizacion', 'concesion',
          'constitucion', 'reforma', 'pena nieto', 'expresidente', 'tarifa', 'alumbrado'
        ],
        pliegoBase: `Defensa de la soberanía energética, rechazo a privatizaciones o regresiones neoliberales y participación de técnicos sindicalizados en "${temaCentral}".`,
        liderTestimonio: `El SME y el sindicalismo independiente tienen memoria histórica: rechazamos cualquier intento de regresión política o privatización vinculado a "${temaCentral}".`
      },
      {
        id: 'comerciantes',
        gremio: 'Uniones de Comerciantes, Mercados Públicos y Tianguis',
        siglas: 'CONACCA / Uniones de Locatarios y Tianguistas',
        sensibilidad: [
          'ambulantes', 'tianguis', 'mercado', 'local', 'comercio', 'impuesto', 'tarifa',
          'multa', 'horario', 'calle', 'avenida', 'castillo de chapultepec', 'turismo', 'tala'
        ],
        pliegoBase: `Cero desalojos o clausuras arbitrarias, preservación del flujo turístico/comercial y congelamiento de cuotas de piso ante "${temaCentral}" en ${lugar}.`,
        liderTestimonio: `Miles de familias viven del comercio y el flujo ciudadano en ${lugar}; si "${temaCentral}" daña nuestra actividad o entorno, nos movilizaremos en bloque.`
      },
      {
        id: 'construccion',
        gremio: 'Construcción, Materialistas y Obra Pública',
        siglas: 'CTM Construcción / Sindicatos de Materialistas',
        sensibilidad: [
          'obra', 'construccion', 'inmobiliaria', 'uso de suelo', 'demolicion', 'tala',
          'carretera', 'calle', 'avenida', 'monumento', 'castillo de chapultepec', 'presupuesto'
        ],
        pliegoBase: `Licitación transparente con mano de obra local, apego estricto a normas de impacto urbano-ambiental y rechazo a demoliciones ilegales en "${temaCentral}".`,
        liderTestimonio: `Los trabajadores de la construcción exigimos obras con legalidad y beneficio social real en ${lugar}, no proyectos opacos que enfrenten al gremio con la ciudadanía.`
      },
      {
        id: 'industria',
        gremio: 'Industria, Manufactura y Cámaras Productivas',
        siglas: 'CROC / CROM / Sindicatos Industriales',
        sensibilidad: [
          'empresa', 'fabrica', 'planta', 'impuesto', 'tarifa', 'horario', 'salario',
          'contrato', 'liquidacion', 'reforma', 'ley', 'agua', 'energia'
        ],
        pliegoBase: `Certidumbre jurídica y estabilidad social para evitar que la conflictividad derivada de "${temaCentral}" paralice las cadenas productivas de ${lugar}.`,
        liderTestimonio: `La planta productiva requiere paz social y certidumbre legal; una crisis de gobernabilidad por "${temaCentral}" afectará turnos y empleos formales.`
      },
      {
        id: 'policias',
        gremio: 'Seguridad Pública, Guardia y Custodios Institucionales',
        siglas: 'Asociaciones Policiales / Guardia y Custodia Federal',
        sensibilidad: [
          'policia', 'guardia', 'seguridad', 'patrulla', 'castillo de chapultepec', 'museo',
          'inah', 'constitucion', 'pena nieto', 'fuero', 'manifestacion', 'bloqueo'
        ],
        pliegoBase: `Protocolos de actuación con respaldo legal, negativa a reprimir protestas ciudadanas legítimas y mejora de condiciones operativas ante "${temaCentral}".`,
        liderTestimonio: `Los elementos de seguridad y custodia advertimos el alto desgaste operativo de contener el descontento social que provocará "${temaCentral}" en ${lugar}.`
      },
      {
        id: 'telecom',
        gremio: 'Telecomunicaciones, Prensa y Trabajadores de Medios',
        siglas: 'STRM / SITATYR / Colectivos de Prensa',
        sensibilidad: [
          'internet', 'fibra', 'red', 'digital', 'concesion', 'reforma', 'ley',
          'constitucion', 'pena nieto', 'expresidente', 'inah', 'cultura'
        ],
        pliegoBase: `Libertad de cobertura informativa, respeto a contratos colectivos de telecomunicaciones y transparencia pública absoluta sobre "${temaCentral}".`,
        liderTestimonio: `Los sindicatos de telecomunicaciones y medios mantendremos cobertura abierta sobre las implicaciones reales de "${temaCentral}" frente a cualquier intento de censura.`
      }
    ];

    // Evaluación de las 12 fuerzas garantizando que NUNCA quede pasiva si hay disparadores
    const fuerzasEvaluadas = FUERZAS_BASE.map((f, idx) => {
      const aiF = (aiUnionData && Array.isArray(aiUnionData.fuerzas))
        ? aiUnionData.fuerzas.find(item => item.id === f.id || (item.gremio && this.normalize(item.gremio).includes(f.id)))
        : null;

      const keywordMatch = f.sensibilidad.some(s => normTxt.includes(this.normalize(s)));
      const esAfectadoDirecto = Boolean(keywordMatch || (aiF && aiF.esAfectadoDirecto) || (idx < 3 && matchedCategories.length > 0));

      let favor = 35;
      let contra = 48;
      let neutro = 17;

      if (esAltamenteControversial) {
        if (esAfectadoDirecto) {
          contra = Math.min(92, 76 + ((idx * 5) % 15));
          favor = Math.max(4, 12 - (idx % 6));
          neutro = Math.max(2, 100 - contra - favor);
        } else {
          contra = Math.min(82, 60 + ((idx * 4) % 16));
          favor = Math.max(8, 20 - (idx % 7));
          neutro = Math.max(4, 100 - contra - favor);
        }
      } else if (aiF && typeof aiF.contra === 'number' && typeof aiF.favor === 'number') {
        favor = Math.max(0, Math.min(100, aiF.favor));
        contra = Math.max(0, Math.min(100, aiF.contra));
        // Prohibido dejar oposición pasiva si el gremio fue disparado por keywords
        if (esAfectadoDirecto && contra < 45 && semanticResult.tipo !== 'BENEFICIO_REAL') {
          contra = 56 + ((idx * 3) % 14);
          favor = Math.min(favor, 28);
        }
        const sum = favor + contra;
        if (sum > 100) {
          favor = Math.round((favor / sum) * 100);
          contra = 100 - favor;
        }
        neutro = Math.max(0, 100 - favor - contra);
      } else if (semanticResult.tipo === 'BENEFICIO_REAL' && !flags.esTalaEcocidio && !flags.esDestruccionPatrimonio && !flags.esTemaExpresidentePolitica) {
        favor = esAfectadoDirecto ? 54 + (idx % 10) : 58 + (idx % 8);
        contra = esAfectadoDirecto ? 32 + (idx % 8) : 24 + (idx % 6);
        neutro = Math.max(4, 100 - favor - contra);
      } else {
        contra = esAfectadoDirecto ? 62 + ((idx * 4) % 16) : 44 + ((idx * 3) % 12);
        favor = esAfectadoDirecto ? 18 + (idx % 8) : 34 + (idx % 8);
        neutro = Math.max(4, 100 - contra - favor);
      }

      let postura = 'En Contra / Emplazamiento a Movilización';
      if (contra > favor) {
        postura = contra >= 70 ? 'Rechazo Frontal / Paro Activo' : 'En Contra / Alerta Gremial';
      } else if (favor < 58) {
        postura = 'Condicionado a Pliego Petitorio';
      } else {
        postura = 'Acuerdo Condicionado con Vigilancia Sindical';
      }

      let nivelRiesgo = 'Moderado';
      if (contra >= 68) nivelRiesgo = 'Crítico';
      else if (contra >= 45 || esAfectadoDirecto) nivelRiesgo = 'Alto';

      return {
        id: f.id,
        gremio: f.gremio,
        siglas: f.siglas,
        postura,
        favor,
        contra,
        neutro,
        nivelRiesgo,
        esAfectadoDirecto,
        pliegoPetitorio: (aiF?.pliegoPetitorio && aiF.pliegoPetitorio.length > 25) ? aiF.pliegoPetitorio : f.pliegoBase,
        liderTestimonio: (aiF?.liderTestimonio && aiF.liderTestimonio.length > 25) ? aiF.liderTestimonio : f.liderTestimonio
      };
    });

    // Cálculo de riesgoParoScore garantizando que NUNCA sea pasivo ("Sin Bloqueo / Riesgo Mínimo")
    const directos = fuerzasEvaluadas.filter(f => f.esAfectadoDirecto);
    const promDirectos = directos.length > 0
      ? Math.round(directos.reduce((a, b) => a + b.contra, 0) / directos.length)
      : 55;
    const promGlobal = Math.round(fuerzasEvaluadas.reduce((a, b) => a + b.contra, 0) / fuerzasEvaluadas.length);

    let riesgoParoScore = Math.round((promDirectos * 0.65) + (promGlobal * 0.35));

    if (flags.esTemaExpresidentePolitica || flags.esDestruccionPatrimonio || flags.esTalaEcocidio) {
      riesgoParoScore = Math.max(84, Math.min(96, riesgoParoScore));
    } else if (matchedKeywordsAll.length > 0) {
      // Nunca menos de 48 (Riesgo Moderado-Alto activo) cuando se toca cualquier palabra del diccionario
      riesgoParoScore = Math.max(48, Math.min(95, riesgoParoScore));
    } else {
      riesgoParoScore = Math.max(42, Math.min(92, riesgoParoScore));
    }

    // Construir el Plan de Reacción Sindical Concreto (4 elementos obligatorios)
    const planAccionGremial = this.buildConcreteUnionActionPlan(
      propuestaTexto,
      municipio,
      estado,
      semanticResult,
      matchedCategories,
      riesgoParoScore
    );

    let semaforo = 'Amarillo';
    let semaforoTexto = `Riesgo ${planAccionGremial.nivelRiesgoBloqueo}: Emplazamiento Sindical Activo`;
    let dictamenSindical = '';

    if (riesgoParoScore >= 70 || planAccionGremial.nivelRiesgoBloqueo === 'Crítico / Paro Nacional') {
      semaforo = 'Rojo';
      semaforoTexto = `ALERTA ROJA (${planAccionGremial.nivelRiesgoBloqueo.toUpperCase()}): RIESGO INMINENTE DE BLOQUEO Y PARO`;
      dictamenSindical = `ALERTA MÁXIMA DE PARÁLISIS SINDICAL Y SOCIAL EN ${lugar.toUpperCase()}: El análisis de sensibilidad detectó disparadores críticos (${matchedKeywordsAll.slice(0, 6).join(', ') || 'impacto estructural'}) ante "${temaCentral}". Se activan de inmediato ${planAccionGremial.sindicatosReactivos.slice(0, 3).join(', ')}. MODO DE ACCIÓN EN CALLE: ${planAccionGremial.modoAccionCalle}`;
    } else {
      semaforo = 'Amarillo';
      semaforoTexto = `ALERTA ACTIVA (RIESGO ${planAccionGremial.nivelRiesgoBloqueo.toUpperCase()}): MOVILIZACIÓN Y PLIEGO CONDICIONANTE`;
      dictamenSindical = `ACTIVACIÓN SINDICAL EN ${lugar.toUpperCase()}: La propuesta "${temaCentral}" impacta intereses gremiales directos (${matchedKeywordsAll.slice(0, 5).join(', ') || 'operación pública'}). Reaccionarán ${planAccionGremial.sindicatosReactivos.slice(0, 3).join(', ')}. TÁCTICA PREVISTA: ${planAccionGremial.modoAccionCalle}`;
    }

    return {
      riesgoParoScore,
      semaforo,
      semaforoTexto,
      dictamenSindical,
      nivelRiesgoBloqueo: planAccionGremial.nivelRiesgoBloqueo,
      sindicatosReactivos: planAccionGremial.sindicatosReactivos,
      modoAccionCalle: planAccionGremial.modoAccionCalle,
      protocoloDesactivacion: planAccionGremial.protocoloDesactivacion,
      planAccionGremial,
      totalFuerzas: fuerzasEvaluadas.length,
      fuerzas: fuerzasEvaluadas,
      iaGenerada: Boolean(aiUnionData)
    };
  }
}

module.exports = new UnionsEngine();
