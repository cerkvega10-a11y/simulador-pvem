// Agente Analizador Semántico, Extractor Profundo de Entidades y Guardrail de Dominio
// Extrae el tema central, nombres propios, lugares específicos, acciones propuestas, sectores afectados
// y valida que el texto o documento subido pertenezca a los dominios de GovTech War Room.

class SemanticAnalyzer {
  constructor() {
    this.name = 'Agente Analizador Semántico y Extractor Profundo de Entidades';
  }

  /**
   * MÓDULO 3: GUARDRAIL DE VALIDACIÓN TEMÁTICA (RECHAZO DE ARCHIVOS O TEXTOS AJENOS)
   * Verifica que la entrada pertenezca a: Política, Gobierno, Leyes, Sociedad, Cultura/Patrimonio Público,
   * Medio Ambiente/Obra Pública, Sindicatos, Economía/Proyectos Productivos o Fomento Deportivo Público.
   */
  validatePlatformDomain(textoPropuesta = '', tituloProyecto = '') {
    const rawCombined = `${tituloProyecto || ''} ${textoPropuesta || ''}`.trim();
    const textLower = rawCombined.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const ERROR_MESSAGE = '⚠️ Archivo o Propuesta No Válida: Esta plataforma no está diseñada para el tipo de archivo o consulta que intenta subir. GovTech War Room procesa exclusivamente propuestas políticas, proyectos sociales, de infraestructura, medio ambiente, sindicales, deportivos públicos o productivos.';

    if (!rawCombined || rawCombined.length < 6) {
      return { valid: false, esValido: false, reason: 'Texto vacío o insuficiente', motivo: 'Texto vacío o insuficiente', errorMessage: ERROR_MESSAGE, mensajeError: ERROR_MESSAGE };
    }

    // 1. Detectar consultas de entretenimiento deportivo / pronósticos de partidos entre clubes (ej. Manchester United vs Chivas)
    const clubSportsRegex = /\b(?:manchester\s+united|manchester\s+city|real\s+madrid|barcelona|barca|chivas|america|club\s+america|cruz\s+azul|pumas\s+unam|tigres|rayados|toluca\s+fc|atlas|champions\s+league|premier\s+league|liga\s+mx|mundial\s+de\s+clubes|super\s+bowl|nba|nfl|mlb|lakers|yankees|messi|cristiano\s+ronaldo|mbappe|haaland)\b/i;
    const matchPredictionRegex = /\b(?:quien\s+ganaria|quien\s+gana|quien\s+va\s+a\s+ganar|pronostico\s+del\s+partido|marcador\s+del\s+partido|apuesta\s+deportiva|jugar\s+contra|vs\.?\s+las?\s+chivas|manchester|partido\s+de\s+futbol\s+entre)\b/i;
    const publicSportPolicyRegex = /\b(?:infraestructura\s+deportiva|canchas?\s+publicas?|deportivo\s+municipal|becas?\s+deportivas?|fomento\s+deportivo|unidad\s+deportiva|parque\s+publico|presupuesto|gobierno|municipio|alcaldia|colonia|jovenes)\b/i;

    if ((clubSportsRegex.test(textLower) || matchPredictionRegex.test(textLower)) && !publicSportPolicyRegex.test(textLower)) {
      const reason = 'Consulta de pronóstico deportivo de entretenimiento ajena a políticas públicas';
      return {
        valid: false,
        esValido: false,
        reason,
        motivo: reason,
        errorMessage: ERROR_MESSAGE,
        mensajeError: ERROR_MESSAGE
      };
    }

    // 2. Detectar recetas de cocina, horóscopos, chistes, videojuegos, tareas escolares ajenas o farándula
    const offTopicPatterns = [
      /\b(?:receta\s+de\s+cocina|ingredientes\s+para\s+preparar|cucharadas\s+de\s+harina|hornear\s+a\s+\d+\s+grados|como\s+hacer\s+un\s+pastel|como\s+preparar\s+tacos)\b/i,
      /\b(?:horoscopo\s+de\s+hoy|signo\s+zodiacal|tarot|compatibilidad\s+entre\s+aries|prediccion\s+astrologica)\b/i,
      /\b(?:cuentame\s+un\s+chiste|chiste\s+de\s+pepito|adivinanza|meme\s+gracioso)\b/i,
      /\b(?:minecraft|fortnite|free\s+fire|call\s+of\s+duty|gta\s+v|roblox|pokemon|league\s+of\s+legends|trucos\s+para\s+el\s+juego)\b/i,
      /\b(?:resuelve\s+esta\s+ecuacion|calcula\s+la\s+derivada|codigo\s+en\s+python\s+para|escribe\s+un\s+poema\s+de\s+amor|carta\s+para\s+mi\s+novi[oa])\b/i
    ];

    for (const pat of offTopicPatterns) {
      if (pat.test(textLower) && !publicSportPolicyRegex.test(textLower)) {
        const reason = 'Contenido de entretenimiento, cocina o consulta personal ajena a GovTech War Room';
        return {
          valid: false,
          esValido: false,
          reason,
          motivo: reason,
          errorMessage: ERROR_MESSAGE,
          mensajeError: ERROR_MESSAGE
        };
      }
    }

    // 3. Verificar que no sea texto sin sentido / gibberish
    if (this.isIncoherentOrGibberish(textLower)) {
      const reason = 'Texto ininteligible o caracteres sin estructura temática válida';
      return {
        valid: false,
        esValido: false,
        reason,
        motivo: reason,
        errorMessage: ERROR_MESSAGE,
        mensajeError: ERROR_MESSAGE
      };
    }

    // 4. Diccionario amplio de dominios válidos de GovTech War Room:
    // Política, Gobierno, Leyes, Sociedad, Cultura/Patrimonio, Medio Ambiente/Obra, Sindicatos, Economía, Salud, Educación, Seguridad, Fomento Deportivo Público
    const validDomainKeywords = /\b(?:propuesta|proyecto|ley|reforma|constitucion|articulo|decreto|gobierno|presidente|expresidente|peña\s+nieto|pena\s+nieto|calderon|salinas|amlo|lopez\s+obrador|sheinbaum|morena|pri|pan|pvem|mc|pt|partido|eleccion|reeleccion|voto|campana|candidat|alcaldia|municipio|estado|nacional|ciudadan|vecin|colonia|comunidad|pueblo|sociedad|social|cultura|patrimonio|castillo|chapultepec|museo|inah|inbal|monumento|arqueologic|historia|educacion|escuela|universidad|unam|ipn|uam|maestro|docente|beca|estudiante|tala|arbol|arboles|arbolado|bosque|selva|parque|area\s+verde|ecologia|ambiente|ambiental|agua|pozo|presa|rio|drenaje|lluvia|pluvial|basura|reciclaje|mina|expropiacion|suelo|construccion|inmobiliaria|obra|paviment|bacheo|alumbrado|solar|energia|transporte|ruta|metro|metrobus|mexibus|taxi|combi|microbus|chofer|caseta|carretera|calle|avenida|vialidad|carril|ambulante|tianguis|mercado|comercio|comerciante|empresa|fabrica|planta|industria|empleo|trabajo|trabajador|sindicato|gremio|huelga|paro|impuesto|predial|tenencia|tarifa|pasaje|multa|presupuesto|subsidio|credito|economia|productiv|campo|agricultura|campesino|ejido|salud|hospital|clinica|imss|issste|medicina|medico|enfermera|veterinaria|animal|seguridad|policia|guardia|patrulla|camara|c5|delito|extorsion|deporte|deportivo|cancha|unidad\s+deportiva|joven|adulto|mujer|familia|pension|salario|plaza|contrato|eliminar|demoler|construir|crear|implementar|prohibir|autorizar|regular|rehabilitar|regreso)\b/i;

    // Si es una pregunta general de cultura pop, deportes privados o trivialidades sin ninguna palabra de dominio público/político/social/territorial
    const looksLikeTrivialQuestion = /^(?:quien|como|cuando|donde|cual|por\s+que)\b/i.test(textLower) && textLower.length < 160;
    if (looksLikeTrivialQuestion && !validDomainKeywords.test(textLower)) {
      const reason = 'Consulta general ajena a los dominios de simulación política y social';
      return {
        valid: false,
        esValido: false,
        reason,
        motivo: reason,
        errorMessage: ERROR_MESSAGE,
        mensajeError: ERROR_MESSAGE
      };
    }

    if (!validDomainKeywords.test(textLower) && rawCombined.split(/\s+/).length < 12) {
      const reason = 'El texto no contiene elementos de política, gobierno, sociedad, infraestructura, medio ambiente o proyectos públicos';
      return {
        valid: false,
        esValido: false,
        reason,
        motivo: reason,
        errorMessage: ERROR_MESSAGE,
        mensajeError: ERROR_MESSAGE
      };
    }

    return { valid: true, esValido: true, mensajeError: null };
  }

  /**
   * MÓDULO 1.1: EXTRACCIÓN FORZOSA DE ENTIDADES Y TEMA CENTRAL DEL TEXTO O ARCHIVO SUBIDO
   * Extrae: temaCentral, nombresPropios, lugaresEspecificos, accionesPropuestas, sectoresAfectados y categoría temática.
   */
  extractDeepContext(textoPropuesta = '', tituloProyecto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México') {
    const cleanBody = String(textoPropuesta || '')
      .replace(/\[DETALLES DEL DOCUMENTO TÉCNICO ANEXO[^\]]*\]:?/gi, ' ')
      .replace(/\[EVIDENCIA VISUAL ANALIZADA POR IA\][\s\S]*$/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanTitle = String(tituloProyecto || '').trim();
    const genericTitles = ['iniciativa comunitaria verde', 'iniciativa comunitaria ciudadana', 'proyecto de infraestructura y política social', ''];
    const hasCustomTitle = cleanTitle && !genericTitles.includes(cleanTitle.toLowerCase());

    const fullText = hasCustomTitle ? `${cleanTitle}. ${cleanBody}` : cleanBody;
    const textNorm = fullText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Nombres Propios Relevantes (Personajes políticos, expresidentes, instituciones, siglas)
    const nombresPropios = [];
    const catalogNamedEntities = [
      { regex: /\b(?:enrique\s+)?pe[ñn]a\s+nieto\b|\bepn\b/i, label: 'Enrique Peña Nieto' },
      { regex: /\b(?:felipe\s+)?calder[oó]n(?:\s+hinojosa)?\b/i, label: 'Felipe Calderón' },
      { regex: /\b(?:carlos\s+)?salinas(?:\s+de\s+gortari)?\b/i, label: 'Carlos Salinas de Gortari' },
      { regex: /\b(?:vicente\s+)?fox(?:\s+quesada)?\b/i, label: 'Vicente Fox' },
      { regex: /\b(?:andres\s+manuel\s+)?l[oó]pez\s+obrador\b|\bamlo\b/i, label: 'Andrés Manuel López Obrador (AMLO)' },
      { regex: /\b(?:claudia\s+)?sheinbaum\b/i, label: 'Claudia Sheinbaum' },
      { regex: /\binah\b/i, label: 'INAH (Instituto Nacional de Antropología e Historia)' },
      { regex: /\binbal\b|\bbellas\s+artes\b/i, label: 'INBAL (Instituto Nacional de Bellas Artes y Literatura)' },
      { regex: /\bunam\b/i, label: 'UNAM' },
      { regex: /\bipn\b|\bpolitecnico\b/i, label: 'IPN' },
      { regex: /\buam\b/i, label: 'UAM' },
      { regex: /\bine\b|\binstituto\s+nacional\s+electoral\b/i, label: 'INE' },
      { regex: /\bsemarnat\b/i, label: 'SEMARNAT' },
      { regex: /\bconafor\b/i, label: 'CONAFOR' },
      { regex: /\bconagua\b/i, label: 'CONAGUA' },
      { regex: /\bimss\b/i, label: 'IMSS' },
      { regex: /\bissste\b/i, label: 'ISSSTE' },
      { regex: /\bcfe\b/i, label: 'CFE' },
      { regex: /\bpemex\b/i, label: 'PEMEX' }
    ];

    catalogNamedEntities.forEach(item => {
      if (item.regex.test(fullText) && !nombresPropios.includes(item.label)) {
        nombresPropios.push(item.label);
      }
    });

    // Extraer también secuencias capitalizadas del texto del usuario (Nombres propios personalizados)
    const capitalizedMatches = fullText.match(/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de\s+|del\s+|la\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3}\b/g) || [];
    const stopCapWords = new Set(['Estado de México', 'Partido Verde', 'Iniciativa Comunitaria', 'Proyecto de', 'En Contra', 'A Favor']);
    capitalizedMatches.forEach(cap => {
      const trimmedCap = cap.trim();
      if (trimmedCap.length > 4 && !stopCapWords.has(trimmedCap) && !nombresPropios.some(n => n.toLowerCase().includes(trimmedCap.toLowerCase()))) {
        nombresPropios.push(trimmedCap);
      }
    });

    // 2. Lugares Específicos (Monumentos, Bosques, Avenidas, Recintos, Colonias)
    const lugaresEspecificos = [];
    const catalogPlaces = [
      { regex: /\bcastillo\s+de\s+chapultepec\b/i, label: 'Castillo de Chapultepec' },
      { regex: /\bbosque\s+de\s+chapultepec\b|\bchapultepec\b/i, label: 'Bosque de Chapultepec' },
      { regex: /\bpaseo\s+de\s+la\s+reforma\b|\breforma\b/i, label: 'Paseo de la Reforma' },
      { regex: /\bzocalo\b|\bplaza\s+de\s+la\s+constitucion\b/i, label: 'Zócalo / Plaza de la Constitución' },
      { regex: /\bpalacio\s+nacional\b/i, label: 'Palacio Nacional' },
      { regex: /\bpalacio\s+de\s+bellas\s+artes\b/i, label: 'Palacio de Bellas Artes' },
      { regex: /\bteotihuac[aá]n\b/i, label: 'Zona Arqueológica de Teotihuacán' },
      { regex: /\bperif[eé]rico\b/i, label: 'Anillo Periférico' },
      { regex: /\bv[ií]a\s+morelos\b/i, label: 'Vía Morelos' },
      { regex: /\bav(?:enida)?\.?\s+[a-záéíóúñ0-9\s]{3,25}/i, label: null }
    ];

    catalogPlaces.forEach(p => {
      const m = fullText.match(p.regex);
      if (m) {
        const val = p.label || m[0].trim();
        if (!lugaresEspecificos.includes(val)) lugaresEspecificos.push(val);
      }
    });
    if (lugaresEspecificos.length === 0) {
      lugaresEspecificos.push(municipio || 'la demarcación');
    }

    // 3. Acciones Propuestas
    const accionesPropuestas = [];
    const actionPatterns = [
      { regex: /\b(?:tala|talar|derribo|derribar|cortar)\s+(?:de\s+)?(?:[aá]rboles|bosques?|areas?\s+verdes?|[aá]rbolado)/i, label: 'tala y derribo de árboles / áreas verdes' },
      { regex: /\b(?:eliminar|demoler|demolici[oó]n|destruir|desaparecer|quitar|cerrar)\s+(?:el\s+|la\s+|los\s+|las\s+)?(?:castillo\s+de\s+chapultepec|museo|monumento|patrimonio|[aá]rboles|escuela|hospital|parque)/i, label: null },
      { regex: /\b(?:regreso|retorno|reelecci[oó]n|volver\s+a\s+gobernar|postulaci[oó]n|candidatura)\s+(?:de\s+|del\s+)?(?:enrique\s+pe[ñn]a\s+nieto|pe[ñn]a\s+nieto|expresidente|ex\s+presidente|calder[oó]n|salinas)/i, label: null },
      { regex: /\b(?:reforma\s+constitucional|modificar\s+la\s+constituci[oó]n|eliminar\s+la\s+no\s+reelecci[oó]n|reelecci[oó]n\s+presidencial)/i, label: 'reforma constitucional y alteración del principio de No Reelección' },
      { regex: /\b(?:privatizar|privatizaci[oó]n|concesionar|vender)\s+[a-záéíóúñ\s]{3,30}/i, label: null },
      { regex: /\b(?:aumentar|aumento|subir|incrementar|cobrar)\s+[a-záéíóúñ\s]{3,30}/i, label: null },
      { regex: /\b(?:construir|construcci[oó]n|instalar|implementar|crear|rehabilitar)\s+[a-záéíóúñ\s]{3,35}/i, label: null }
    ];

    actionPatterns.forEach(ap => {
      const m = fullText.match(ap.regex);
      if (m) {
        const val = ap.label || m[0].trim();
        if (!accionesPropuestas.includes(val)) accionesPropuestas.push(val);
      }
    });

    // 4. Determinar Tema Central Exacto (Nunca genérico)
    let temaCentral = '';
    if (cleanBody.length > 0 && cleanBody.length <= 140) {
      temaCentral = cleanBody;
    } else if (hasCustomTitle && cleanBody.length > 0) {
      temaCentral = `${cleanTitle}: ${cleanBody.substring(0, 140)}${cleanBody.length > 140 ? '...' : ''}`;
    } else if (cleanBody.length > 140) {
      const firstSentence = cleanBody.split(/[.;!?]/)[0].trim();
      temaCentral = firstSentence.length >= 15 ? firstSentence.substring(0, 150) : cleanBody.substring(0, 150);
    } else {
      temaCentral = cleanTitle || 'la iniciativa planteada';
    }

    if (accionesPropuestas.length === 0) {
      accionesPropuestas.push(temaCentral);
    }

    // 5. Clasificación de Eje Crítico Especial (Política/Expresidentes, Patrimonio/Chapultepec, Tala/Ecocidio, etc.)
    const esTemaExpresidentePolitica = /\b(?:pe[ñn]a\s+nieto|epn|calder[oó]n|salinas|fox|expresidente|ex\s+presidente|reelecci[oó]n|no\s+reelecci[oó]n|regreso\s+de\s+pe[ñn]a|regreso\s+del?\s+pri)\b/i.test(textNorm);
    const esTemaPatrimonioChapultepec = /\b(?:castillo\s+de\s+chapultepec|chapultepec|inah|inbal|museo\s+nacional|monumento\s+hist[oó]rico|zona\s+arqueol[oó]gica|bellas\s+artes|patrimonio\s+hist[oó]rico)\b/i.test(textNorm);
    const esDestruccionPatrimonio = esTemaPatrimonioChapultepec && /\b(?:eliminar|demoler|destruir|quitar|cerrar|privatizar|vender|desaparecer|derribar)\b/i.test(textNorm);
    const esTalaEcocidio = /\b(?:tala|talar|derribar\s+[aá]rboles|cortar\s+[aá]rboles|eliminar\s+[aá]rboles|eliminar\s+bosque|destruir\s+bosque|deforestaci[oó]n|ecocidio|quitar\s+[aá]reas\s+verdes)\b/i.test(textNorm);

    // 6. Sectores Afectados Específicos
    const sectoresAfectados = [];
    if (esTemaExpresidentePolitica) {
      sectoresAfectados.push(
        'Constitucionalistas, barras de abogados y defensores del Artículo 83 (Sufragio Efectivo, No Reelección)',
        'Magisterio disidente (CNTE / SNTE), sindicatos independientes (UNT / SME) y colectivos estudiantiles',
        'Ciudadanía agraviada por casos históricos de corrupción, inflación y reformas estructurales'
      );
    }
    if (esTemaPatrimonioChapultepec || esDestruccionPatrimonio) {
      sectoresAfectados.push(
        'Investigadores, custodios y trabajadores del INAH / INBAL y Secretaría de Cultura (SNAINAH / SNTSC)',
        'Comunidad académica, historiadores, estudiantes universitarios (UNAM, IPN, UAM) y magisterio (SNTE / CNTE)',
        'Sector turístico, guías certificados, comerciantes culturales y ciudadanía defensora del patrimonio nacional'
      );
    }
    if (esTalaEcocidio) {
      sectoresAfectados.push(
        'Colectivos ambientalistas, vecinos defensores del arbolado urbano y frentes contra el ecocidio',
        'Trabajadores de Parques y Jardines (SUTGCDMX / SUTEYM), brigadistas forestales (SNTSEMARNAT / CONAFOR) y ejidatarios',
        'Familias y adultos mayores afectados por islas de calor, pérdida de infiltración de agua y contaminación'
      );
    }
    if (sectoresAfectados.length === 0) {
      sectoresAfectados.push(
        `Vecinos y familias trabajadoras de ${municipio}`,
        `Gremios sindicales, comerciantes y transportistas de ${municipio}`,
        `Jóvenes, estudiantes y contribuyentes afectados por "${temaCentral.substring(0, 70)}"`
      );
    }

    return {
      temaCentral,
      resumenCorto: temaCentral.length > 90 ? temaCentral.substring(0, 87) + '...' : temaCentral,
      textoCompletoAnalizado: fullText,
      nombresPropios,
      lugaresEspecificos,
      accionesPropuestas,
      sectoresAfectados,
      flagsTematicos: {
        esTemaExpresidentePolitica,
        esTemaPatrimonioChapultepec,
        esDestruccionPatrimonio,
        esTalaEcocidio
      }
    };
  }

  /**
   * Realiza un análisis multidimensional de la propuesta y extrae entidades reales
   */
  analyze(textoPropuesta = '', municipio = '', estado = '', problematicasLocales = [], tituloProyecto = '') {
    const texto = (textoPropuesta || '').trim();
    const textoLower = texto.toLowerCase();

    // 1. Extracción de Entidades Cuantitativas y Contexto Profundo (Módulo 1)
    const entidades = this.extractEntities(texto);
    const deepContext = this.extractDeepContext(texto, tituloProyecto, municipio, estado);
    entidades.nombresPropios = deepContext.nombresPropios;
    entidades.lugaresEspecificos = deepContext.lugaresEspecificos;
    entidades.accionesPropuestas = deepContext.accionesPropuestas;
    entidades.sectoresAfectados = deepContext.sectoresAfectados;
    entidades.temaCentral = deepContext.temaCentral;

    // 2. Detección de Texto Ininteligible o Muestra Insuficiente
    const esIninteligible = this.isIncoherentOrGibberish(textoLower);
    if (esIninteligible) {
      return {
        tipo: 'ININTELIGIBLE',
        esValido: false,
        esIninteligible: true,
        esAbsurdo: false,
        entidades,
        deepContext,
        temas: this.getDefaultThemes(),
        categoria: 'Ininteligible / Gibberish',
        dictamen: 'TEXTO ININTELIGIBLE: No se puede formular un dictamen político ante una entrada sin propuesta identificable o caracteres al azar.',
        motivoRechazo: 'El texto no contiene una formulación gramatical o técnica evaluable para ' + municipio + '.'
      };
    }

    // 3. Detección de Propuestas Absurdas, Surrealistas o Imposibles
    const analisisAbsurdo = this.detectAbsurdity(textoLower, municipio, estado);
    if (analisisAbsurdo.esAbsurdo) {
      return {
        tipo: 'ABSURDO',
        esValido: false,
        esIninteligible: false,
        esAbsurdo: true,
        entidades,
        deepContext,
        temas: this.getDefaultThemes(),
        motivo: analisisAbsurdo.motivo,
        fragmentosCriticos: analisisAbsurdo.fragmentos,
        categoria: 'Absurdo / Fantasía Inviable',
        dictamen: `PROPUESTA ABSURDA O TÉCNICAMENTE INVIABLE: Rechazo unánime del enjambre por considerar "${deepContext.resumenCorto}" una ocurrencia que desatiende las urgencias prioritarias de ${municipio}.`,
        motivoRechazo: `En ${municipio} la población considera inaceptable proponer ${analisisAbsurdo.motivo} (${deepContext.resumenCorto}).`
      };
    }

    // 4. Extracción de Sensibilidad Temática por Eje
    const temas = this.extractThematicWeights(textoLower, deepContext);

    // 5. Detección de Medidas Punitivas / Polémicas / Anticonstitucionales / Ecocidas / Anti-Patrimonio
    const analisisPunitivo = this.detectPunitiveMeasures(textoLower, deepContext);
    const analisisDemagogico = this.detectDemagogy(textoLower);

    let tipo = 'GENERAL';
    if (analisisPunitivo.esPunitivo) {
      tipo = 'PUNITIVO';
    } else if (analisisDemagogico.esDemagogico) {
      tipo = 'DEMAGOGICO';
    } else if (temas.agua.peso > 0.4 || (temas.medio_ambiente.peso > 0.4 && temas.medio_ambiente.polaridad > 0) || temas.seguridad.peso > 0.4) {
      tipo = 'BENEFICIO_REAL';
    }

    return {
      tipo,
      esValido: true,
      esIninteligible: false,
      esAbsurdo: false,
      entidades,
      deepContext,
      temas,
      punitivo: analisisPunitivo,
      demagogico: analisisDemagogico,
      categoria: tipo === 'PUNITIVO'
        ? 'Polémica / Rechazo Social o Afectación Pública'
        : (tipo === 'DEMAGOGICO' ? 'Demagogia Electoral' : (tipo === 'BENEFICIO_REAL' ? 'Beneficio Comunitario Directo' : 'Intervención Pública focalizada')),
      fragmentosCriticos: [
        deepContext.temaCentral,
        ...(deepContext.nombresPropios.length ? [`Actores: ${deepContext.nombresPropios.join(', ')}`] : []),
        ...(deepContext.lugaresEspecificos.length ? [`Lugares: ${deepContext.lugaresEspecificos.join(', ')}`] : []),
        ...entidades.medidas.slice(0, 2)
      ].slice(0, 5)
    };
  }

  /**
   * Extrae entidades numéricas, montos en pesos ($), plazos y medidas concretas
   */
  extractEntities(text) {
    const montos = [];
    const plazos = [];
    const medidas = [];
    const palabrasClave = [];

    const regexMontos = /(?:\$\s*\d+(?:,\d+)*(?:\.\d+)?|\b\d+\s*pesos|\b\d+\s*mdp|\b\d+\s*millones\s*de\s*pesos)/gi;
    let mMatch;
    while ((mMatch = regexMontos.exec(text)) !== null) {
      if (!montos.includes(mMatch[0])) montos.push(mMatch[0].trim());
    }

    const regexPlazos = /(?:\b\d+\s*(?:d[ií]as|semanas|meses|a[ñn]os|horas)\b|\bhorario\s+nocturno\b|\b24\/7\b)/gi;
    let pMatch;
    while ((pMatch = regexPlazos.exec(text)) !== null) {
      if (!plazos.includes(pMatch[0])) plazos.push(pMatch[0].trim());
    }

    const regexMedidas = /(?:\b\d+\s*(?:kil[oó]metros|km|autobuses|estaciones|pozos|sistemas|tinacos|luminarias|[aá]rboles|hect[aá]reas|mw|viviendas|camionetas|microbuses|unidades|paraderos)\b)/gi;
    let medMatch;
    while ((medMatch = regexMedidas.exec(text)) !== null) {
      if (!medidas.includes(medMatch[0])) medidas.push(medMatch[0].trim());
    }

    const keyTerms = [
      'Mexibús', 'captación pluvial', 'cosecha de lluvia', 'pozos de absorción',
      'ciclovía', 'paneles solares', 'clínica veterinaria', 'bienestar animal',
      'cámaras C5', 'botones de pánico', 'parquímetros', 'retiro de rutas',
      'aumento de tarifa', 'bacheo', 'alumbrado LED', 'reforestación', 'desalojo',
      'Castillo de Chapultepec', 'Enrique Peña Nieto', 'tala de árboles', 'reforma constitucional',
      'No Reelección', 'INAH', 'INBAL', 'patrimonio histórico'
    ];

    keyTerms.forEach(term => {
      if (new RegExp(term, 'i').test(text)) {
        palabrasClave.push(term);
        if (!medidas.includes(term)) medidas.push(term);
      }
    });

    return {
      montos,
      plazos,
      medidas,
      palabrasClave
    };
  }

  /**
   * Extrae los pesos y polaridades de los 7 ejes sociopolíticos
   */
  extractThematicWeights(text, deepContext = null) {
    const result = this.getDefaultThemes();
    const flags = deepContext?.flagsTematicos || {};

    // Si es tala de árboles / ecocidio o destrucción de patrimonio o regreso de expresidente polémico, polaridad altamente negativa
    if (flags.esTalaEcocidio) {
      result.medio_ambiente.peso = 0.98;
      result.medio_ambiente.polaridad = -0.96;
      return result;
    }
    if (flags.esDestruccionPatrimonio) {
      result.turismo_campo.peso = 0.95;
      result.turismo_campo.polaridad = -0.96;
      result.impuestos.peso = 0.85;
      result.impuestos.polaridad = -0.92;
      return result;
    }
    if (flags.esTemaExpresidentePolitica) {
      result.impuestos.peso = 0.92;
      result.impuestos.polaridad = -0.90;
      result.transporte.peso = 0.80;
      result.transporte.polaridad = -0.85;
      return result;
    }

    // 1. AGUA
    if (/(?:agua|pozo|pluvial|lluvia|cisterna|drenaje|tandeo|red h[ií]drica|infiltraci[oó]n|fuga)/i.test(text)) {
      result.agua.peso = 0.95;
      if (/(?:cobro|medidor obligatorio|tarifa al agua|cortar|quitar|privatizar)/i.test(text)) {
        result.agua.polaridad = -0.90;
      } else {
        result.agua.polaridad = 0.95;
      }
    }

    // 2. TRANSPORTE PÚBLICO
    if (/(?:transporte|pasaje|tarifa|combi|microb[uú]s|mexib[uú]s|ruta|carril|metro|autob[uú]s)/i.test(text)) {
      result.transporte.peso = 0.90;
      if (/(?:aumento|alza|subir|incrementar|1[3-9]\s*pesos|retiro de|quitar|cancelar|desaparecer)/i.test(text)) {
        result.transporte.polaridad = -0.95;
      } else if (/(?:el[eé]ctrico|nuevo|subsidio|tarifa social|gratuito|7\s*pesos)/i.test(text)) {
        result.transporte.polaridad = 0.85;
      }
    }

    // 3. IMPUESTOS, PREDIAL Y AUTOS
    if (/(?:impuesto|predial|tenencia|parqu[ií]metro|multa|peaje|sanci[oó]n econ[oó]mica|vehicular|carril)/i.test(text)) {
      result.impuestos.peso = 0.85;
      if (/(?:aumento|cobro|nuevo|parqu[ií]metro|multas?\s*(?:de)?\s*\$|reduc(?:ir|ci[oó]n)\s*(?:de)?\s*carril)/i.test(text)) {
        result.impuestos.polaridad = -0.90;
      } else {
        result.impuestos.polaridad = 0.40;
      }
    }

    // 4. COMERCIO INFORMAL Y TIANGUIS
    if (/(?:comerciante|tianguis|ambulante|puesto|vendedor|mototaxi)/i.test(text)) {
      result.tianguis.peso = 0.85;
      if (/(?:desalojo|retir(?:ar|o)|quitar|prohibir|multa|reubicar)/i.test(text)) {
        result.tianguis.polaridad = -0.95;
      } else {
        result.tianguis.polaridad = 0.80;
      }
    }

    // 5. TURISMO, CULTURA Y AGRICULTURA
    if (/(?:turismo|tur[ií]stico|campo|agricultura|campesino|siembra|cultivo|lago|presa|bosque|artesano|museo|cultura|chapultepec)/i.test(text)) {
      result.turismo_campo.peso = 0.80;
      if (/(?:eliminar|demoler|destruir|cerrar|privatizar|tala|talar)/i.test(text)) {
        result.turismo_campo.polaridad = -0.95;
      } else {
        result.turismo_campo.polaridad = 0.85;
      }
    }

    // 6. SEGURIDAD PÚBLICA
    if (/(?:seguridad|c5|c[aá]mara|bot[oó]n de p[aá]nico|iluminaci[oó]n|luminaria|sendero seguro|patrulla|vigilancia)/i.test(text)) {
      result.seguridad.peso = 0.90;
      result.seguridad.polaridad = 0.92;
    }

    // 7. MEDIO AMBIENTE Y ECOLOGÍA
    if (/(?:ecolog|verde|[aá]rbol|parque|reforestaci[oó]n|solar|fotovoltaico|reciclaje|veterinaria|bienestar animal|esterilizaci[oó]n)/i.test(text)) {
      result.medio_ambiente.peso = 0.85;
      if (/(?:tala|talar|derribar|cortar|eliminar|destruir|cemento|privatizar)/i.test(text)) {
        result.medio_ambiente.polaridad = -0.95;
      } else {
        result.medio_ambiente.polaridad = 0.95;
      }
    }

    return result;
  }

  getDefaultThemes() {
    return {
      agua: { polaridad: 0, peso: 0.1 },
      transporte: { polaridad: 0, peso: 0.1 },
      impuestos: { polaridad: 0, peso: 0.1 },
      tianguis: { polaridad: 0, peso: 0.1 },
      turismo_campo: { polaridad: 0, peso: 0.1 },
      seguridad: { polaridad: 0, peso: 0.1 },
      medio_ambiente: { polaridad: 0, peso: 0.1 }
    };
  }

  isIncoherentOrGibberish(text) {
    if (text.length < 8) return true;
    if (/^[bcdfghjklmnpqrstvwxyz\s]+$/i.test(text)) return true;
    if (/(.)\1{4,}/.test(text)) return true;
    if (/(?:asdf|qwer|zxcv|1234|jklñ|hjkl)/i.test(text)) return true;

    const words = text.split(/\s+/).filter(Boolean);
    const validWords = words.filter(w => /^[a-záéíóúñ]{2,}$/i.test(w));
    if (validWords.length < 2) return true;

    return false;
  }

  detectAbsurdity(text, municipio, estado) {
    const patronesAbsurdos = [
      { regex: /(?:ovni|ovnis|extraterrestre|platillo volador|alien[ií]gena|marciano|gal[aá]ctico)/i, motivo: 'tecnología alienígena u ovnis' },
      { regex: /(?:dinosaurio|drag[oó]n|dragones|pinguino|ping[uü]ino|ping[uü]inos|oso polar|osos polares|leones en la calle|jirafas en combi|unicornio)/i, motivo: 'fauna imposible o de ciencia ficción en vía pública' },
      { regex: /(?:chocolate|queso|refresco|dulces?|cerveza|helado|nieve|caramelos?|pizzas?)\s+(?:en|gratis|de por vida|para todos)/i, motivo: 'fantasías gastronómicas de regalo masivo' },
      { regex: /(?:pista|calle|avenida|carretera|edificio|monumento|fuente|banqueta|parque|cr[aá]ter)\s+(?:de\s+)?(?:chocolate|queso|dulce|refresco|cerveza|helado|nieve|oro|plata)/i, motivo: 'infraestructura fantasiosa o absurda' },
      { regex: /(?:destruir todas las casas|derribar escuelas|tirar basura en calles|quemar autos|prohibir respirar|envenenar)/i, motivo: 'daño deliberado y vandalismo contra la comunidad' },
      { regex: /(?:teletransportaci[oó]n|m[aá]quina del tiempo|viaje interdimensional|lluvia de billetes|magia|varita)/i, motivo: 'física teórica o magia irreal' }
    ];

    const municipiosSinMar = ['ecatepec', 'toluca', 'naucalpan', 'neza', 'nezahualcoyotl', 'chalco', 'chimalhuacan', 'tlalnepantla', 'texcoco', 'cuautitlan'];
    const esMunicipioInterior = municipiosSinMar.some(m => municipio.toLowerCase().includes(m)) || estado.toLowerCase().includes('m[eé]xico');
    if (esMunicipioInterior && /(?:puerto mar[ií]timo|playa marina|muelle de yates|pesca en mar abierto|arrecifes de coral)/i.test(text)) {
      return {
        esAbsurdo: true,
        motivo: `construcción de infraestructura marítima en una cuenca o valle continental sin mar (${municipio})`,
        fragmentos: ['Infraestructura marítima en municipio continental']
      };
    }

    for (const pat of patronesAbsurdos) {
      const match = text.match(pat.regex);
      if (match) {
        return {
          esAbsurdo: true,
          motivo: pat.motivo,
          fragmentos: [match[0]]
        };
      }
    }

    return { esAbsurdo: false };
  }

  detectPunitiveMeasures(text, deepContext = null) {
    const fragmentos = [];
    const detalles = [];
    const flags = deepContext?.flagsTematicos || {};

    if (flags.esTemaExpresidentePolitica) {
      fragmentos.push(`"${deepContext.resumenCorto}" (Crisis Constitucional / Rechazo a Reelección o Regreso de Expresidente)`);
      detalles.push('Rechazo constitucional y político por principio de No Reelección y memoria histórica');
    }
    if (flags.esDestruccionPatrimonio) {
      fragmentos.push(`"${deepContext.resumenCorto}" (Atentado al Patrimonio Histórico y Cultural de la Nación)`);
      detalles.push('Destrucción o afectación de monumento histórico / recinto cultural protegido por ley federal');
    }
    if (flags.esTalaEcocidio) {
      fragmentos.push(`"${deepContext.resumenCorto}" (Ecocidio Urbano / Tala de Árboles y Pérdida de Áreas Verdes)`);
      detalles.push('Tala de arbolado urbano y destrucción de pulmones ecológicos');
    }

    const patrones = [
      { regex: /(?:aumento|alza|subir|incrementar|incremento)\s+(?:de|a|al|del)?\s*(?:la\s+)?(?:tarifa|pasaje|precio|costo|transporte)/i, tipo: 'Alza de tarifa o pasaje' },
      { regex: /(?:tarifa|pasaje)\s*(?:a|de)?\s*\$?\s*(?:1[3-9]|[2-9]\d)/i, tipo: 'Tarifa elevada de pasaje ($13+)' },
      { regex: /(?:nuevo|nuevos|crear|cobrar|alza\s+de)\s*(?:impuesto|impuestos|predial|tenencia|peaje|derecho)/i, tipo: 'Nuevos impuestos o cobros' },
      { regex: /(?:parqu[ií]metros|multas?\s*(?:de)?\s*\$?\d+|sanciones?\s+econ[oó]micas?)/i, tipo: 'Parquímetros o multas severas' },
      { regex: /(?:reduc(?:ir|ci[oó]n)|cerrar|cierre|eliminar)\s*(?:de)?\s*(?:carriles|carril|vialidad|avenida)/i, tipo: 'Reducción de carriles vehiculares' },
      { regex: /(?:retir(?:ar|o)|desalojo|reubicar|prohibir|quitar)\s*(?:a|de)?\s*(?:comerciantes?|tianguis|ambulantes?|puestos?|combis?)/i, tipo: 'Desalojo de comerciantes populares o rutas' },
      { regex: /(?:tala|talar|derribar|cortar)\s+(?:de\s+)?(?:los\s+)?(?:[aá]rboles|bosques?|[aá]reas?\s+verdes?)/i, tipo: 'Tala de árboles y afectación ambiental' },
      { regex: /(?:eliminar|demoler|destruir|desaparecer)\s+(?:el\s+|la\s+)?(?:castillo|museo|monumento|patrimonio|parque|bosque)/i, tipo: 'Eliminación de patrimonio histórico o área pública' }
    ];

    for (const pat of patrones) {
      const match = text.match(pat.regex);
      if (match) {
        const idx = match.index || 0;
        const preceding = text.substring(Math.max(0, idx - 25), idx).toLowerCase();
        const esNegado = /(?:sin|cero|no\s+habr[aá]|evitar|prohibir\s+la|frenar\s+la|contra\s+la|subsidio|tarifa\s+social|gratuito)\s*$/i.test(preceding);

        if (!esNegado) {
          fragmentos.push(`"${match[0]}" (${pat.tipo})`);
          detalles.push(pat.tipo);
        }
      }
    }

    return {
      esPunitivo: fragmentos.length > 0,
      fragmentos,
      detalles
    };
  }

  detectDemagogy(text) {
    const patrones = [
      { regex: /(?:regalar|dinero en efectivo mensual|autom[oó]viles gratis|gasolina gratis|sin costo alguno de por vida|a todos los habitantes sin estudio)/i, tipo: 'Promesa presupuestalmente insostenible' }
    ];

    const fragmentos = [];
    for (const pat of patrones) {
      const match = text.match(pat.regex);
      if (match) {
        fragmentos.push(match[0]);
      }
    }

    return {
      esDemagogico: fragmentos.length > 0,
      fragmentos
    };
  }
}

module.exports = new SemanticAnalyzer();
