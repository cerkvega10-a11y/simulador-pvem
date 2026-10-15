// Agente Analizador Semántico y Extractor de Entidades
// Extrae temas, polaridad, magnitudes y entidades cuantitativas (montos en $, plazos, medidas) del texto del usuario

class SemanticAnalyzer {
  constructor() {
    this.name = 'Agente Analizador Semántico y Extractor de Entidades';
  }

  /**
   * Realiza un análisis multidimensional de la propuesta y extrae entidades reales
   */
  analyze(textoPropuesta = '', municipio = '', estado = '', problematicasLocales = []) {
    const texto = (textoPropuesta || '').trim();
    const textoLower = texto.toLowerCase();

    // 1. Extracción de Entidades Reales del Prompt
    const entidades = this.extractEntities(texto);

    // 2. Detección de Texto Ininteligible o Muestra Insuficiente
    const esIninteligible = this.isIncoherentOrGibberish(textoLower);
    if (esIninteligible) {
      return {
        tipo: 'ININTELIGIBLE',
        esValido: false,
        esIninteligible: true,
        esAbsurdo: false,
        entidades,
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
        temas: this.getDefaultThemes(),
        motivo: analisisAbsurdo.motivo,
        fragmentosCriticos: analisisAbsurdo.fragmentos,
        categoria: 'Absurdo / Fantasía Inviable',
        dictamen: `PROPUESTA ABSURDA O TÉCNICAMENTE INVIABLE: Rechazo unánime del enjambre por considerar el proyecto una ocurrencia que desatiende las urgencias prioritarias de la localidad.`,
        motivoRechazo: `En ${municipio} la población considera una burla proponer ${analisisAbsurdo.motivo} mientras carecen de servicios básicos indispensables.`
      };
    }

    // 4. Extracción de Sensibilidad Temática por Eje (Agua, Transporte, Impuestos, Tianguis, Campo, Seguridad, Ambiente)
    const temas = this.extractThematicWeights(textoLower);

    // 5. Detección de Medidas Punitivas vs Beneficio
    const analisisPunitivo = this.detectPunitiveMeasures(textoLower);
    const analisisDemagogico = this.detectDemagogy(textoLower);

    let tipo = 'GENERAL';
    if (analisisPunitivo.esPunitivo) {
      tipo = 'PUNITIVO';
    } else if (analisisDemagogico.esDemagogico) {
      tipo = 'DEMAGOGICO';
    } else if (temas.agua.peso > 0.4 || temas.medio_ambiente.peso > 0.4 || temas.seguridad.peso > 0.4) {
      tipo = 'BENEFICIO_REAL';
    }

    return {
      tipo,
      esValido: true,
      esIninteligible: false,
      esAbsurdo: false,
      entidades,
      temas,
      punitivo: analisisPunitivo,
      demagogico: analisisDemagogico,
      categoria: tipo === 'PUNITIVO' ? 'Punitivo / Alza de Costos' : (tipo === 'DEMAGOGICO' ? 'Demagogia Electoral' : (tipo === 'BENEFICIO_REAL' ? 'Beneficio Comunitario Directo' : 'Intervención Urbana General')),
      fragmentosCriticos: entidades.medidas.length > 0 ? entidades.medidas.slice(0, 4) : [texto.substring(0, 70) + '...']
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

    // A. Montos en pesos ($)
    const regexMontos = /(?:\$\s*\d+(?:,\d+)*(?:\.\d+)?|\b\d+\s*pesos|\b\d+\s*mdp|\b\d+\s*millones\s*de\s*pesos)/gi;
    let mMatch;
    while ((mMatch = regexMontos.exec(text)) !== null) {
      if (!montos.includes(mMatch[0])) montos.push(mMatch[0].trim());
    }

    // B. Plazos y tiempos
    const regexPlazos = /(?:\b\d+\s*(?:d[ií]as|semanas|meses|a[ñn]os|horas)\b|\bhorario\s+nocturno\b|\b24\/7\b)/gi;
    let pMatch;
    while ((pMatch = regexPlazos.exec(text)) !== null) {
      if (!plazos.includes(pMatch[0])) plazos.push(pMatch[0].trim());
    }

    // C. Medidas cuantitativas de infraestructura
    const regexMedidas = /(?:\b\d+\s*(?:kil[oó]metros|km|autobuses|estaciones|pozos|sistemas|tinacos|luminarias|[aá]rboles|hect[aá]reas|mw|viviendas|camionetas|microbuses|unidades|paraderos)\b)/gi;
    let medMatch;
    while ((medMatch = regexMedidas.exec(text)) !== null) {
      if (!medidas.includes(medMatch[0])) medidas.push(medMatch[0].trim());
    }

    // D. Términos institucionales o clave de obra
    const keyTerms = [
      'Mexibús', 'captación pluvial', 'cosecha de lluvia', 'pozos de absorción',
      'ciclovía', 'paneles solares', 'clínica veterinaria', 'bienestar animal',
      'cámaras C5', 'botones de pánico', 'parquímetros', 'retiro de rutas',
      'aumento de tarifa', 'bacheo', 'alumbrado LED', 'reforestación', 'desalojo'
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
  extractThematicWeights(text) {
    const result = this.getDefaultThemes();

    // 1. AGUA
    if (/(?:agua|pozo|pluvial|lluvia|cisterna|drenaje|tandeo|red h[ií]drica|infiltraci[oó]n|fuga)/i.test(text)) {
      result.agua.peso = 0.95;
      if (/(?:cobro|medidor obligatorio|tarifa al agua|cortar|quitar)/i.test(text)) {
        result.agua.polaridad = -0.90;
      } else {
        result.agua.polaridad = 0.95; // Cosecha pluvial, pozos, entrega de agua
      }
    }

    // 2. TRANSPORTE PÚBLICO
    if (/(?:transporte|pasaje|tarifa|combi|microb[uú]s|mexib[uú]s|ruta|carril|metro|autob[uú]s)/i.test(text)) {
      result.transporte.peso = 0.90;
      if (/(?:aumento|alza|subir|incrementar|1[3-9]\s*pesos|retiro de|quitar|cancelar)/i.test(text)) {
        result.transporte.polaridad = -0.95; // Alza o retiro
      } else if (/(?:el[eé]ctrico|nuevo|subsidio|tarifa social|gratuito|7\s*pesos)/i.test(text)) {
        result.transporte.polaridad = 0.85; // Mejora o subsidio
      }
    }

    // 3. IMPUESTOS, PREDIAL Y AUTOS
    if (/(?:impuesto|predial|tenencia|parqu[ií]metro|multa|peaje|sanci[oó]n econ[oó]mica|vehicular|carril)/i.test(text)) {
      result.impuestos.peso = 0.85;
      if (/(?:aumento|cobro|nuevo|parqu[ií]metro|multas?\s*(?:de)?\s*\$|reduc(?:ir|ci[oó]n)\s*(?:de)?\s*carril)/i.test(text)) {
        result.impuestos.polaridad = -0.90; // Nuevo cobro o restricción a autos
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
        result.tianguis.polaridad = 0.80; // Apoyo o regularización voluntaria
      }
    }

    // 5. TURISMO Y AGRICULTURA
    if (/(?:turismo|tur[ií]stico|campo|agricultura|campesino|siembra|cultivo|lago|presa|bosque|artesano)/i.test(text)) {
      result.turismo_campo.peso = 0.80;
      result.turismo_campo.polaridad = 0.85;
    }

    // 6. SEGURIDAD PÚBLICA
    if (/(?:seguridad|c5|c[aá]mara|bot[oó]n de p[aá]nico|iluminaci[oó]n|luminaria|sendero seguro|patrulla|vigilancia)/i.test(text)) {
      result.seguridad.peso = 0.90;
      result.seguridad.polaridad = 0.92;
    }

    // 7. MEDIO AMBIENTE Y ECOLOGÍA
    if (/(?:ecolog|verde|[aá]rbol|parque|reforestaci[oó]n|solar|fotovoltaico|reciclaje|veterinaria|bienestar animal|esterilizaci[oó]n)/i.test(text)) {
      result.medio_ambiente.peso = 0.85;
      result.medio_ambiente.polaridad = 0.95;
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
    if (text.length < 14) return true;
    if (/^[bcdfghjklmnpqrstvwxyz\s]+$/i.test(text)) return true;
    if (/(.)\1{4,}/.test(text)) return true;
    if (/(?:asdf|qwer|zxcv|1234|jklñ|hjkl)/i.test(text)) return true;

    const words = text.split(/\s+/).filter(Boolean);
    const validWords = words.filter(w => /^[a-záéíóúñ]{3,}$/i.test(w));
    if (validWords.length < 2) return true;

    return false;
  }

  detectAbsurdity(text, municipio, estado) {
    const patronesAbsurdos = [
      { regex: /(?:ovni|ovnis|extraterrestre|platillo volador|alien[ií]gena|marciano|gal[aá]ctico)/i, motivo: 'tecnología alienígena u ovnis' },
      { regex: /(?:dinosaurio|drag[oó]n|dragones|pinguino|ping[uü]ino|ping[uü]inos|oso polar|osos polares|leones en la calle|jirafas en combi|unicornio)/i, motivo: 'fauna imposible o de ciencia ficción en vía pública' },
      { regex: /(?:chocolate|queso|refresco|dulces?|cerveza|helado|nieve|caramelos?|pizzas?)\s+(?:en|gratis|de por vida|para todos)/i, motivo: 'fantasías gastronómicas de regalo masivo' },
      { regex: /(?:pista|calle|avenida|carretera|edificio|monumento|fuente|banqueta|parque|cr[aá]ter)\s+(?:de\s+)?(?:chocolate|queso|dulce|refresco|cerveza|helado|nieve|oro|plata)/i, motivo: 'infraestructura fantasiosa o absurda' },
      { regex: /(?:destruir todas las casas|derribar escuelas|talar todos los [aá]rboles|tirar basura en calles|quemar autos|prohibir respirar|envenenar)/i, motivo: 'daño deliberado y vandalismo contra la comunidad' },
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

  detectPunitiveMeasures(text) {
    const fragmentos = [];
    const detalles = [];
    const patrones = [
      { regex: /(?:aumento|alza|subir|incrementar|incremento)\s+(?:de|a|al|del)?\s*(?:la\s+)?(?:tarifa|pasaje|precio|costo|transporte)/i, tipo: 'Alza de tarifa o pasaje' },
      { regex: /(?:tarifa|pasaje)\s*(?:a|de)?\s*\$?\s*(?:1[3-9]|[2-9]\d)/i, tipo: 'Tarifa elevada de pasaje ($13+)' },
      { regex: /(?:nuevo|nuevos|crear|cobrar|alza\s+de)\s*(?:impuesto|impuestos|predial|tenencia|peaje|derecho)/i, tipo: 'Nuevos impuestos o cobros' },
      { regex: /(?:parqu[ií]metros|multas?\s*(?:de)?\s*\$?\d+|sanciones?\s+econ[oó]micas?)/i, tipo: 'Parquímetros o multas severas' },
      { regex: /(?:reduc(?:ir|ci[oó]n)|cerrar|cierre|eliminar)\s*(?:de)?\s*(?:carriles|carril|vialidad|avenida)/i, tipo: 'Reducción de carriles vehiculares' },
      { regex: /(?:retir(?:ar|o)|desalojo|reubicar|prohibir|quitar)\s*(?:a|de)?\s*(?:comerciantes?|tianguis|ambulantes?|puestos?|combis?)/i, tipo: 'Desalojo de comerciantes populares o rutas' }
    ];

    for (const pat of patrones) {
      const match = text.match(pat.regex);
      if (match) {
        const idx = match.index || 0;
        const preceding = text.substring(Math.max(0, idx - 25), idx).toLowerCase();
        const esNegado = /(?:sin|cero|no\s+habr[aá]|evitar|subsidio|tarifa\s+social|gratuito)\s*$/i.test(preceding);

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
