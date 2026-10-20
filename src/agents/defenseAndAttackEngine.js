// Motor de Blindaje y Defensa Estratégica (20 Preguntas Críticas 100% Ancladas al Tema/Archivo)
// y Motor de Demolición de Contrincante (Modo Ataque / Ingeniería Inversa Electoral)
const semanticAnalyzer = require('./semanticAnalyzer');

class DefenseAndAttackEngine {
  constructor() {
    this.name = 'Motor de Blindaje y Modo Ataque Político (100% Vinculado al Texto/Archivo)';
  }

  /**
   * Garantiza que cualquier pregunta o respuesta mencione explícitamente el tema/entidades extraídas
   */
  ensureTopicAnchorInQuestion(qObj, idx, dc, muni, contra) {
    const tema = dc.temaCentral || 'la propuesta presentada';
    const actor = (dc.nombresPropios && dc.nombresPropios.length > 0) ? dc.nombresPropios[0] : null;
    const lugar = (dc.lugaresEspecificos && dc.lugaresEspecificos.length > 0) ? dc.lugaresEspecificos[0] : muni;

    let dardo = String(qObj.dardo || '').trim();
    let escudo = String(qObj.escudo || '').trim();
    let pivote = String(qObj.pivotePolitico || '').trim();

    const normDardo = dardo.toLowerCase();
    const normTemaWords = tema.toLowerCase().split(/\s+/).filter(w => w.length >= 5);
    const hasTopicReference = normTemaWords.some(w => normDardo.includes(w)) ||
      (actor && normDardo.includes(actor.toLowerCase())) ||
      (lugar && normDardo.includes(lugar.toLowerCase()));

    if (!hasTopicReference && dardo.length > 0) {
      dardo = `Respecto a "${tema}"${actor ? ` que involucra a ${actor}` : ''} en ${lugar}: ${dardo}`;
    }
    if (escudo.length > 0 && ! normTemaWords.some(w => escudo.toLowerCase().includes(w))) {
      escudo = `En relación directa con "${tema}" en ${lugar}: ${escudo}`;
    }
    if (!pivote) {
      pivote = `Nuestra postura frente a "${tema}" en ${lugar} responde al interés público y a las demandas reales del ${contra}% de ciudadanos críticos.`;
    }

    return {
      numero: qObj.numero || idx + 1,
      bloque: qObj.bloque || (idx < 5 ? 'Legalidad, Costo Político y Viabilidad' : (idx < 10 ? 'Impacto Social, Ciudadano y Patrimonial' : (idx < 15 ? 'Conflicto Sindical, Gremial y Movilización' : 'Ejecución Técnica, Ambiental y Jurídica'))),
      dardo,
      peligro: qObj.peligro || 'Peligro Crítico — Prensa y Cuarto de Guerra',
      sectorAtacante: qObj.sectorAtacante || 'Prensa de Investigación y Oposición',
      escudo,
      pivotePolitico: pivote
    };
  }

  /**
   * Genera las 20 Preguntas Letales y Respuestas Maestras 100% Ancladas al Tema o Archivo Subido
   */
  generateDefenseMatrix(propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', votosFinales = {}, municipalResearch = {}, aiDefenseData = null, semanticResult = null) {
    const muni = municipio || 'Ecatepec de Morelos';
    const contra = votosFinales.porcentajeContra || 28;
    const favor = votosFinales.porcentajeFavor || 60;

    const dc = (semanticResult && semanticResult.deepContext)
      ? semanticResult.deepContext
      : semanticAnalyzer.extractDeepContext(propuestaTexto, '', muni, estado);

    const flags = dc.flagsTematicos || {};
    const tema = dc.temaCentral || (propuestaTexto || 'la propuesta').substring(0, 95);
    const actorPrincipal = (dc.nombresPropios && dc.nombresPropios.length > 0)
      ? dc.nombresPropios.slice(0, 2).join(' y ')
      : null;
    const lugarPrincipal = (dc.lugaresEspecificos && dc.lugaresEspecificos.length > 0)
      ? dc.lugaresEspecificos[0]
      : `${muni}, ${estado}`;
    const accionPrincipal = (dc.accionesPropuestas && dc.accionesPropuestas.length > 0)
      ? dc.accionesPropuestas[0]
      : tema;
    const sectorPrincipal = (dc.sectoresAfectados && dc.sectoresAfectados.length > 0)
      ? dc.sectoresAfectados.slice(0, 2).join(' y ')
      : 'la ciudadanía y sectores organizados';

    // Si contamos con las 20 preguntas generadas por IA (Groq / LLM), validar y anclar cada una al tema exacto
    if (aiDefenseData && Array.isArray(aiDefenseData.preguntas) && aiDefenseData.preguntas.length >= 15) {
      return {
        totalPreguntas: aiDefenseData.preguntas.length,
        temaCentralAnclado: tema,
        entidadesDetectadas: {
          nombresPropios: dc.nombresPropios || [],
          lugaresEspecificos: dc.lugaresEspecificos || [],
          accionesPropuestas: dc.accionesPropuestas || [],
          sectoresAfectados: dc.sectoresAfectados || []
        },
        bloques: [
          { nombre: 'Legalidad, Costo Político y Presupuesto', rango: 'Preguntas 1 a 5' },
          { nombre: 'Impacto Social, Ciudadano y Patrimonial', rango: 'Preguntas 6 a 10' },
          { nombre: 'Conflicto Sindical, Gremial y Enjambre', rango: 'Preguntas 11 a 15' },
          { nombre: 'Ejecución Técnica, Ambiental y Jurídica', rango: 'Preguntas 16 a 20' }
        ],
        preguntas: aiDefenseData.preguntas.slice(0, 20).map((p, idx) =>
          this.ensureTopicAnchorInQuestion(p, idx, dc, muni, contra)
        ),
        iaGenerada: true
      };
    }

    let preguntas = [];

    // =========================================================================
    // CASO ESPECIALIZADO A: EXPRESIDENTES / REELECCIÓN / CONSTITUCIÓN (ej. Regreso de Enrique Peña Nieto)
    // =========================================================================
    if (flags.esTemaExpresidentePolitica) {
      const personaje = actorPrincipal || 'el expresidente mencionado';
      preguntas = [
        {
          numero: 1,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Cómo pretenden justificar "${tema}" cuando el Artículo 83 de la Constitución Política de los Estados Unidos Mexicanos prohíbe tajantemente que cualquier ciudadano que haya desempeñado el cargo de Presidente vuelva a ocuparlo bajo ningún motivo?`,
          peligro: 'Peligro Crítico — Violación al Principio Constitucional de No Reelección',
          sectorAtacante: 'Constitucionalistas, Suprema Corte (SCJN) y Barra Mexicana de Abogados',
          escudo: `Reconocemos que el Artículo 83 Constitucional es un pilar histórico inamovible ("Sufragio Efectivo, No Reelección"). El planteamiento de "${tema}" sobre ${personaje} no busca quebrantar el orden constitucional por decreto, sino abrir un debate jurídico-político sobre figuras de participación consultiva o someter cualquier eventual reforma al Constituyente Permanente y a referéndum vinculante del INE.`,
          pivotePolitico: `En democracia ningún nombre como ${personaje} está por encima de la Carta Magna; cualquier ruta pasa primero por la ley y el voto ciudadano.`
        },
        {
          numero: 2,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `El enjambre ciudadano registra un ${contra}% de rechazo directo a "${tema}". ¿Acaso ignoran el costo político devastador de revivir la figura de ${personaje} tras escándalos históricos como la Casa Blanca, Odebrecht y la Estafa Maestra?`,
          peligro: 'Peligro Crítico — Indignación Ciudadana y Memoria Anticorrupción',
          sectorAtacante: 'Prensa de Investigación, Colectivos Anticorrupción y Redes Sociales',
          escudo: `El ${contra}% de rechazo ciudadano frente a "${tema}" exige una respuesta de transparencia absoluta: ninguna participación política de ${personaje} puede plantearse con impunidad. Nuestro protocolo condiciona cualquier escenario a la auditoría abierta de la Fiscalía General de la República (FGR) y de la Auditoría Superior de la Federación (ASF), deslindando el proyecto actual de los errores del pasado.`,
          pivotePolitico: `No venimos a ofrecer amnistías ni tapaderas para ${personaje}; quien aspire a participar en la vida pública debe rendir cuentas claras ante la nación.`
        },
        {
          numero: 3,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Quién está financiando la operación política detrás de "${tema}" y la promoción de ${personaje} en ${lugarPrincipal}, y cómo garantizan que no se desvíen recursos públicos del erario?`,
          peligro: 'Peligro Crítico — Fiscalización del INE y Unidad de Inteligencia Financiera (UIF)',
          sectorAtacante: 'Unidad Técnica de Fiscalización del INE y Periodistas de Investigación',
          escudo: `Cero pesos del erario municipal o estatal se destinan a promover "${tema}" ni a la figura de ${personaje}. Toda actividad de análisis o posicionamiento se sujeta a los topes y auditorías en tiempo real del Sistema Integral de Fiscalización del INE y la UIF, con cuentas bancarias transparentadas al escrutinio público.`,
          pivotePolitico: `Los recursos públicos de ${lugarPrincipal} son sagrados y están etiquetados para servicios e infraestructura, jamás para campañas personales de ${personaje}.`
        },
        {
          numero: 4,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `Los propios militantes y cuadros locales en ${lugarPrincipal} advierten una fractura interna masiva si se les impone la narrativa de "${tema}". ¿Van a sacrificar a sus candidatos locales por defender a ${personaje}?`,
          peligro: 'Peligro Alto — Rebelión de Bases Partidistas y Fuga de Votos',
          sectorAtacante: 'Comités Municipales, Militancia de Base y Columnistas Políticos',
          escudo: `Ninguna estrategia nacional o figura como ${personaje} desplazará a los liderazgos territoriales de ${lugarPrincipal}. La discusión sobre "${tema}" se procesa en mesas de evaluación estratégica donde la prioridad electoral sigue siendo la agenda local de seguridad, agua y empleo de nuestras familias.`,
          pivotePolitico: `Nuestro compromiso primario es con la gente que camina las calles de ${lugarPrincipal}, no con las cúpulas del pasado.`
        },
        {
          numero: 5,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Qué impacto tendría en los mercados financieros y el riesgo país abrir una crisis constitucional por intentar impulsar "${tema}" y el retorno político de ${personaje}?`,
          peligro: 'Peligro Alto — Incertidumbre Constitucional y Mercados',
          sectorAtacante: 'Analistas Económicos, Cámaras Empresariales y Calificadoras',
          escudo: `La estabilidad macroeconómica y la certeza jurídica del país están blindadas. Cualquier deliberación en torno a "${tema}" se mantiene estrictamente dentro de los cauces institucionales del Congreso de la Unión y el Poder Judicial, descartando rupturas constitucionales o decretos unilaterales.`,
          pivotePolitico: `México requiere instituciones fuertes y reglas claras, por encima de cualquier debate coyuntural sobre ${personaje}.`
        },
        {
          numero: 6,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Mientras las familias de ${lugarPrincipal} enfrentan carestía e inseguridad, ustedes ponen en la agenda "${tema}". ¿Cómo le explican a una madre trabajadora que la prioridad sea el regreso de ${personaje}?`,
          peligro: 'Peligro Crítico — Desconexión con las Necesidades Populares',
          sectorAtacante: 'Amas de Casa, Líderes Vecinales y Moderadores de Debate',
          escudo: `Comprendemos el reclamo legítimo de las familias de ${lugarPrincipal}. Si hoy se analiza "${tema}" en relación con ${personaje}, es únicamente para contrastar modelos de gestión administrativa y rescatar mecanismos técnicos de inversión en infraestructura que sí funcionaron, sin descuidar un solo minuto la agenda social prioritaria.`,
          pivotePolitico: `Para nosotros el debate sobre ${personaje} solo tiene sentido si sirve para resolver hoy el agua, la seguridad y el ingreso familiar en ${lugarPrincipal}.`
        },
        {
          numero: 7,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `El sector juvenil (18-29 años) y los movimientos estudiantiles como #YoSoy132 rechazan en más del 85% "${tema}". ¿Cómo responderán ante el repudio de las universidades públicas contra ${personaje}?`,
          peligro: 'Peligro Crítico — Protesta Universitaria (UNAM, IPN, UAM)',
          sectorAtacante: 'Asambleas Estudiantiles, Jóvenes Votantes y Académicos',
          escudo: `La juventud universitaria tiene memoria histórica y derecho pleno a cuestionar "${tema}" y el legado de ${personaje}. En lugar de rehuir o criminalizar la crítica estudiantil, proponemos foros abiertos y sin censura en las universidades para contrastar datos duros y escuchar las exigencias de la nueva generación.`,
          pivotePolitico: `A los jóvenes no se les impone el pasado de ${personaje}; se les escucha con respeto y se les garantiza libertad absoluta de expresión.`
        },
        {
          numero: 8,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Colectivos de derechos humanos y víctimas señalan que hablar de "${tema}" revictimiza a quienes sufrieron la crisis de seguridad y casos como Ayotzinapa durante la gestión de ${personaje}. ¿Cuál es su postura ética?`,
          peligro: 'Peligro Crítico — Derechos Humanos y Colectivos de Víctimas',
          sectorAtacante: 'Organizaciones de Derechos Humanos y Colectivos de Búsqueda',
          escudo: `La verdad, la justicia y la reparación integral a las víctimas son innegociables. Cualquier mención o evaluación de "${tema}" vinculada a ${personaje} parte del reconocimiento autocrítico de las deudas históricas en derechos humanos y del respaldo irrestricto a las investigaciones independientes.`,
          pivotePolitico: `El dolor de las víctimas jamás será moneda de cambio político; la memoria y la justicia están por encima de cualquier actor como ${personaje}.`
        },
        {
          numero: 9,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `En las redes sociales de ${lugarPrincipal}, el tema "${tema}" ha desatado una ola de memes, indignación y llamados al voto de castigo. ¿Reconocen que esta propuesta es un suicidio electoral?`,
          peligro: 'Peligro Alto — Crisis Viral Digital y Voto de Castigo',
          sectorAtacante: 'Analistas Digitales, Opinión Pública y Prensa Nacional',
          escudo: `Precisamente para eso utilizamos este Cuarto de Guerra y simulación predictiva: medir en frío el ${contra}% de rechazo hacia "${tema}" y ${personaje} nos permite corregir el rumbo táctico a tiempo, escuchar el pulso real de las redes en ${lugarPrincipal} y evitar decisiones unilaterales desconectadas de la gente.`,
          pivotePolitico: `Un gobierno inteligente mide el sentir ciudadano antes de actuar; la voz del ${contra}% en ${lugarPrincipal} manda y se respeta.`
        },
        {
          numero: 10,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Los adultos mayores y beneficiarios de programas sociales temen que "${tema}" y el regreso del grupo político de ${personaje} signifique eliminar o condicionar las pensiones universales. ¿Lo descartan por completo?`,
          peligro: 'Peligro Crítico — Temor a Pérdida de Programas Sociales',
          sectorAtacante: 'Padrones de Adultos Mayores y Comités Vecinales',
          escudo: `Las pensiones de adultos mayores y los programas sociales son derechos constitucionales adquiridos en el Artículo 4° y nadie puede tocarlos. Garantizamos por escrito que ningún escenario derivado de "${tema}" ni la participación de ${personaje} reducirá un solo peso de los apoyos directos en ${lugarPrincipal}.`,
          pivotePolitico: `Los derechos sociales del pueblo no pertenecen a ningún expresidente ni partido; son conquistas intocables de las familias mexicanas.`
        },
        {
          numero: 11,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `La CNTE y el magisterio nacional advierten paro nacional y bloqueos si se impulsa "${tema}", recordando el conflicto por la Reforma Educativa de ${personaje}. ¿Cómo evitarán el colapso magisterial?`,
          peligro: 'Peligro Crítico — Paro Magisterial CNTE / SNTE',
          sectorAtacante: 'Secciones de la CNTE, SNTE y Comités de Maestros',
          escudo: `Con el magisterio nunca más habrá imposiciones punitivas. Aclaramos ante las bases del SNTE y la CNTE que "${tema}" jamás implicará revivir evaluaciones punitivas ni persecución laboral docente como ocurrió en el sexenio de ${personaje}; la relación con los maestros será de diálogo y dignificación salarial.`,
          pivotePolitico: `Las maestras y maestros de México son aliados de la educación, nunca enemigos a vencer.`
        },
        {
          numero: 12,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `El Sindicato Mexicano de Electricistas (SME), sindicatos energéticos y la UNT amenazan con tomar Paseo de la Reforma contra "${tema}" por las reformas privatizadoras asociadas a ${personaje}. ¿Qué les responden?`,
          peligro: 'Peligro Crítico — Movilización Sindical SME / UNT / FAT',
          sectorAtacante: 'Frente Sindical Independiente, SME y UNT',
          escudo: `Instalamos de inmediato una mesa de diálogo de alto nivel con el SME, la UNT y los sindicatos del sector energético para garantizar que "${tema}" no conlleva ninguna agenda de privatización eléctrica ni mutilación de contratos colectivos de trabajo.`,
          pivotePolitico: `La soberanía laboral y los derechos de los trabajadores electricistas y de Estado no están a discusión.`
        },
        {
          numero: 13,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Los sindicatos universitarios (STUNAM, SITUAM) y de cultura han convocado a marchar del Ángel al Zócalo si avanza "${tema}" y la rehabilitación política de ${personaje}. ¿Habrá represión o diálogo?`,
          peligro: 'Peligro Alto — Megamarcha de Sindicatos Universitarios y Frentes Cívicos',
          sectorAtacante: 'STUNAM, SITUAM y Frentes Cívico-Sindicales',
          escudo: `Garantizamos respeto absoluto al derecho de libre manifestación consagrado en los artículos 6° y 9° constitucionales. Cero uso de la fuerza pública contra el STUNAM, SITUAM o colectivos ciudadanos que protesten por "${tema}", y apertura inmediata de canales institucionales de recepción de pliegos.`,
          pivotePolitico: `Ante la protesta social e intelectual frente a ${personaje}, la única respuesta democrática es el diálogo abierto, jamás el garrote.`
        },
        {
          numero: 14,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Sindicatos de transportistas y comerciantes de ${lugarPrincipal} advierten que los bloqueos y marchas contra "${tema}" paralizarán las ventas y rutas diarias. ¿Quién pagará esas pérdidas económicas?`,
          peligro: 'Peligro Alto — Parálisis Vial y Pérdidas Comerciales',
          sectorAtacante: 'Uniones de Comerciantes, Locatarios y Rutas de Transporte',
          escudo: `Para evitar que la controversia política en torno a "${tema}" y ${personaje} afecte la actividad económica de ${lugarPrincipal}, desactivaremos cualquier foco de conflicto antes de que llegue a las calles mediante acuerdos preventivos con las centrales obreras.`,
          pivotePolitico: `El trabajo diario de los comerciantes y transportistas de ${lugarPrincipal} no tiene por qué pagar los platos rotos del debate político.`
        },
        {
          numero: 15,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `La Federación de Sindicatos de Trabajadores al Servicio del Estado (FSTSE) exige garantías de que "${tema}" no traerá despidos masivos ni recorte de plazas burocráticas. ¿Qué compromiso firman?`,
          peligro: 'Peligro Alto — Inquietud en la Burocracia Federal y Local',
          sectorAtacante: 'FSTSE, SUTGCDMX y SUTEYM',
          escudo: `Firmamos minuta de inamovilidad laboral y respeto irrestricto a las plazas de base con la FSTSE y sindicatos locales: ninguna discusión sobre "${tema}" ni sobre ${personaje} tocará los derechos adquiridos ni las pensiones de los servidores públicos.`,
          pivotePolitico: `Los trabajadores del Estado sostienen a las instituciones más allá de cualquier sexenio o personaje político.`
        },
        {
          numero: 16,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Jurídicamente, cualquier intento de registrar a ${personaje} o ejecutar "${tema}" para un cargo de elección ya desempeñado sería desechado de plano por el INE y el TEPJF en 24 horas. ¿Cuál es la ruta legal real?`,
          peligro: 'Peligro Crítico — Inviabilidad Jurídica ante INE y TEPJF',
          sectorAtacante: 'Magistrados Electorales y Especialistas en Derecho Constitucional',
          escudo: `En efecto, bajo el texto vigente del Artículo 83 Constitucional, el INE y la Sala Superior del TEPJF negarían cualquier registro presidencial de ${personaje}. Por ello, el alcance jurídico real de "${tema}" se circunscribe al análisis de escenarios de reforma legislativa o roles no sujetos a la prohibición expresa del Artículo 83.`,
          pivotePolitico: `La ley electoral no se tuerce: lo que no permite la Constitución no se fuerza por capricho.`
        },
        {
          numero: 17,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `La oposición ya prepara denuncias ante la FGR y solicitudes de juicio político si se utiliza estructura institucional para promover "${tema}" y a ${personaje}. ¿Cómo blindarán legalmente a su equipo?`,
          peligro: 'Peligro Alto — Denuncias Penales Electorales (FISEL)',
          sectorAtacante: 'Partidos de Oposición y Fiscalía Especializada en Delitos Electorales',
          escudo: `Estricto apego al Artículo 134 Constitucional: ningún servidor público, vehículo oficial ni partida presupuestal de ${lugarPrincipal} interviene en la promoción de "${tema}" ni de ${personaje}. Nuestro blindaje jurídico separa tajantemente la función pública del debate político.`,
          pivotePolitico: `Quien busque judicializar el debate político se topará con un cumplimiento estricto de la ley.`
        },
        {
          numero: 18,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `¿Qué investigaciones o procedimientos vigentes en instancias nacionales o internacionales pesan sobre el entorno de ${personaje} y cómo afectan la viabilidad de "${tema}"?`,
          peligro: 'Peligro Crítico — Riesgo Reputacional y Judicial',
          sectorAtacante: 'Corresponsales Extranjeros y Analistas de Riesgo Político',
          escudo: `Cualquier actor público involucrado en "${tema}", incluido ${personaje}, responde de manera individual ante las autoridades ministeriales competentes. Nuestro equipo mantiene una cláusula de integridad ética que impide asumir pasivos legales de terceros.`,
          pivotePolitico: `Cada actor histórico es responsable de sus actos ante la ley y ante el juicio de la historia.`
        },
        {
          numero: 19,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Si las encuestas y este propio simulador muestran un rechazo abrumador del ${contra}% contra "${tema}", ¿cuál es el criterio técnico para retirar la propuesta antes de que destruya la campaña?`,
          peligro: 'Peligro Crítico — Control de Daños en Cuarto de Guerra',
          sectorAtacante: 'Estrategas Electorales y Consejo Político',
          escudo: `El protocolo del Cuarto de Guerra es claro: toda propuesta que supere el umbral crítico del 60% de rechazo social y active alerta roja sindical, como ocurre con "${tema}" (${contra}% en contra), entra en fase de contención inmediata, congelamiento operativo y redirección hacia propuestas de beneficio ciudadano directo.`,
          pivotePolitico: `La soberbia destruye campañas; escuchar los datos a tiempo y rectificar frente a la ciudadanía construye victorias.`
        },
        {
          numero: 20,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Para cerrar: ¿están dispuestos a comprometerse hoy ante los ciudadanos de ${lugarPrincipal} a archivar "${tema}" sobre ${personaje} y enfocarse al 100% en las urgencias reales de la gente?`,
          peligro: 'Peligro Crítico — Definición Final ante la Opinión Pública',
          sectorAtacante: 'Ciudadanía de ${lugarPrincipal} y Medios de Comunicación',
          escudo: `Absolutamente sí. Tras evaluar con rigor técnico y democrático el pulso ciudadano de ${lugarPrincipal} sobre "${tema}", ratificamos que la voluntad popular del ${contra}% es vinculante: archivamos cualquier distracción política sobre ${personaje} y concentramos toda la fuerza institucional en seguridad, agua, salud y empleo.`,
          pivotePolitico: `En nuestra plataforma manda la gente de ${lugarPrincipal}: escuchamos, medimos y obedecemos al ciudadano.`
        }
      ];
    }
    // =========================================================================
    // CASO ESPECIALIZADO B: PATRIMONIO HISTÓRICO / CASTILLO DE CHAPULTEPEC / INAH / CULTURA
    // =========================================================================
    else if (flags.esTemaPatrimonioChapultepec) {
      const recinto = (dc.lugaresEspecificos && dc.lugaresEspecificos.find(l => /chapultepec|museo|castillo|zona arqueol/i.test(l))) || lugarPrincipal || 'el Castillo de Chapultepec';
      preguntas = [
        {
          numero: 1,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Cómo pretenden plantear "${tema}" sobre ${recinto} cuando la Ley Federal sobre Monumentos y Zonas Arqueológicas, Artísticas e Históricas tipifica como delito federal grave cualquier demolición, daño o alteración al patrimonio histórico de la nación resguardado por el INAH?`,
          peligro: 'Peligro Crítico — Delito Federal contra el Patrimonio Histórico (Ley del INAH)',
          sectorAtacante: 'Dirección General del INAH, INBAL y Juristas Constitucionales',
          escudo: `Reconocemos la plena vigencia de la Ley Federal sobre Monumentos y Zonas Arqueológicas, Artísticas e Históricas (artículos 2, 35, 36 y 52). Ninguna acción planteada en "${tema}" puede ejecutarse al margen del INAH ni implicar la destrucción física del acervo histórico de ${recinto}; el planteamiento se somete a revisión estricta para descartar cualquier afectación estructural y reconvertirlo en un programa de preservación y acceso cultural.`,
          pivotePolitico: `El patrimonio histórico de ${recinto} pertenece a todas las generaciones de mexicanos y la ley que lo protege es inquebrantable.`
        },
        {
          numero: 2,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `El enjambre ciudadano arroja un ${contra}% de rechazo rotundo e indignación nacional contra "${tema}". ¿Acaso no midieron el costo político devastador de atentar contra un símbolo patrio como ${recinto}?`,
          peligro: 'Peligro Crítico — Repudio Nacional y Costo Político Irreversible',
          sectorAtacante: 'Prensa Nacional, Historiadores y Opinión Pública',
          escudo: `El ${contra}% de rechazo ciudadano es una señal inequívoca de que la sociedad mexicana defiende con orgullo su memoria histórica en ${recinto}. Escuchamos con humildad este veredicto: retiramos cualquier componente de "${tema}" que vulnere la integridad simbólica o arquitectónica del recinto y abrimos una mesa pública con historiadores y ciudadanía.`,
          pivotePolitico: `Gobernar es saber escuchar cuando el ${contra}% de la ciudadanía dice "con nuestra historia y con ${recinto} no se juega".`
        },
        {
          numero: 3,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Qué intereses inmobiliarios, privados o comerciales se esconden detrás de "${tema}" en el polígono de ${recinto}, y cuánto dinero público pretenden desviar en esta operación?`,
          peligro: 'Peligro Crítico — Sospecha de Especulación Inmobiliaria y Corrupción',
          sectorAtacante: 'Periodistas de Investigación y Contraloría Ciudadana',
          escudo: `Queda prohibida por decreto cualquier privatización, concesión comercial o cambio de uso de suelo con fines inmobiliarios en ${recinto}. Todo el polígono histórico y ambiental permanece 100% bajo dominio público federal inalienable e imprescriptible, auditado por la ASF.`,
          pivotePolitico: `Ni un solo metro cuadrado de ${recinto} se entregará jamás a intereses inmobiliarios privados.`
        },
        {
          numero: 4,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `${recinto} y el Museo Nacional de Historia reciben a millones de visitantes nacionales y extranjeros al año. ¿Evaluaron las pérdidas multimillonarias en turismo y derrama económica que provocaría "${tema}"?`,
          peligro: 'Peligro Alto — Colapso Turístico y Económico',
          sectorAtacante: 'Cámaras de Turismo, Comerciantes y Sector Hotelero',
          escudo: `Los indicadores de la Secretaría de Cultura y Sectur confirman que ${recinto} es uno de los motores culturales y turísticos más importantes del país. Por ello, cualquier ajuste derivado de "${tema}" garantiza la continuidad ininterrumpida de la vocación museística y turística del recinto.`,
          pivotePolitico: `La cultura y la historia en ${recinto} no son un gasto; son identidad nacional y sustento para miles de familias.`
        },
        {
          numero: 5,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `La UNESCO y los organismos internacionales de patrimonio mundial han encendido alertas por "${tema}" en ${recinto}. ¿Están dispuestos a enfrentar una sanción internacional contra México?`,
          peligro: 'Peligro Alto — Sanción Internacional UNESCO / ICOMOS',
          sectorAtacante: 'ICOMOS México, UNESCO y Cuerpo Diplomático Cultural',
          escudo: `México honra todos los tratados internacionales de la UNESCO para la protección del Patrimonio Cultural y Natural. Vinculamos formalmente al comité de ICOMOS México y al Consejo de Monumentos Históricos para que ningún lineamiento de "${tema}" contravenga las cartas internacionales de conservación en ${recinto}.`,
          pivotePolitico: `México seguirá siendo referente mundial en defensa de su riqueza histórica y cultural.`
        },
        {
          numero: 6,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `${recinto} es sede del Museo Nacional de Historia y símbolo de la gesta heroica de 1847. ¿Con qué derecho pretenden borrar o alterar con "${tema}" la memoria histórica donde se educan millones de niños mexicanos?`,
          peligro: 'Peligro Crítico — Agravio a la Identidad Nacional y Memoria Histórica',
          sectorAtacante: 'Académicos de la UNAM, Colegio de México y Maestros de Historia',
          escudo: `La memoria histórica del Heroico Colegio Militar y el acervo del Museo Nacional de Historia en ${recinto} son sagrados e intocables. Rectificamos el alcance de "${tema}" para que, lejos de suprimir el recinto, se fortalezcan sus salas históricas, su conservación estructural y las visitas escolares gratuitas.`,
          pivotePolitico: `Un pueblo que destruye su historia pierde su futuro; ${recinto} seguirá siendo el aula viva de la historia de México.`
        },
        {
          numero: 7,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `¿Qué pasaría con las miles de piezas históricas, murales de Orozco, Siqueiros y O'Gorman, carruajes y documentos resguardados en ${recinto} si se ejecutara "${tema}"?`,
          peligro: 'Peligro Crítico — Riesgo Irreversible al Acervo Artístico y Mural',
          sectorAtacante: 'Restauradores del INAH/INBAL y Críticos de Arte',
          escudo: `Los murales de Siqueiros, Orozco y O'Gorman, así como las colecciones históricas de ${recinto}, cuentan con catalogación y blindaje patrimonial absoluto. Es técnica y legalmente imposible removerlos o dañarlos; por tanto, el protocolo de "${tema}" descarta cualquier intervención física sobre el inmueble histórico.`,
          pivotePolitico: `El arte y los tesoros históricos de la nación en ${recinto} se cuidan con bisturí de restaurador, jamás con piqueta.`
        },
        {
          numero: 8,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Familias enteras, estudiantes y adultos mayores que acuden cada domingo a ${recinto} han convocado a formar una cadena humana para frenar "${tema}". ¿Van a ignorar el clamor ciudadano?`,
          peligro: 'Peligro Crítico — Resistencia Civil Pacífica y Cadena Humana',
          sectorAtacante: 'Colectivos Ciudadanos, Familias y Vecinos de Chapultepec',
          escudo: `Jamás confrontaremos a las familias ni a los estudiantes que defienden ${recinto}. Nos sumamos a su exigencia ciudadana y firmamos un compromiso público de preservación integral del recinto y sus áreas verdes como espacio público abierto y gratuito.`,
          pivotePolitico: `Cuando los ciudadanos hacen una cadena humana por la cultura y por ${recinto}, el gobierno debe ponerse de su lado.`
        },
        {
          numero: 9,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Habiendo tantas urgencias de seguridad, agua y hospitales, ¿por qué generar una crisis artificial proponiendo "${tema}" sobre ${recinto}?`,
          peligro: 'Peligro Alto — Desvío de Prioridades Gubernamentales',
          sectorAtacante: 'Líderes de Opinión y Asociaciones Vecinales',
          escudo: `Tiene toda la razón la ciudadanía: la prioridad presupuestal y operativa debe estar en el agua, la seguridad y la salud pública, no en alterar monumentos históricos como ${recinto}. Los resultados de esta simulación nos permiten cancelar costos innecesarios en "${tema}" y reorientar cada peso a las urgencias sociales.`,
          pivotePolitico: `La simulación previa sirve precisamente para no cometer errores con el dinero ni con el patrimonio del pueblo.`
        },
        {
          numero: 10,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Las facultades de Filosofía y Letras, Arquitectura e Historia de la UNAM, el IPN y la ENAH han emitido un pronunciamiento conjunto de repudio total a "${tema}" en ${recinto}. ¿Qué responde a la comunidad científica y académica?`,
          peligro: 'Peligro Crítico — Pronunciamiento Universitario UNAM / IPN / ENAH',
          sectorAtacante: 'Consejos Universitarios UNAM, ENAH e Investigadores Eméritos',
          escudo: `Ocho décadas de investigación antropológica e histórica de la ENAH y la UNAM respaldan el valor insustituible de ${recinto}. Otorgamos carácter vinculante al dictamen académico interuniversitario sobre "${tema}" para garantizar que ninguna decisión se tome contra la ciencia y la historia.`,
          pivotePolitico: `En materia de patrimonio cultural, la voz de los historiadores y arqueólogos de México es ley técnica para nosotros.`
        },
        {
          numero: 11,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `El Sindicato Nacional de Trabajadores de la Cultura (SNTSC) y los sindicatos de custodios, investigadores y restauradores del INAH (SNAINAH) advierten paro nacional y cierre de todas las zonas arqueológicas y museos si avanza "${tema}" en ${recinto}. ¿Cómo desactivarán el paro?`,
          peligro: 'Peligro Crítico — Paro Nacional del INAH / INBAL / SNTSC',
          sectorAtacante: 'Sindicatos del INAH (SNAINAH) y Secretaría de Cultura (SNTSC)',
          escudo: `Desactivamos de raíz el emplazamiento a paro nacional del SNAINAH y el SNTSC garantizando por escrito la intangibilidad de ${recinto}, la preservación del 100% de las fuentes de trabajo de custodios, museógrafos e investigadores, y el fortalecimiento presupuestal para el mantenimiento del recinto.`,
          pivotePolitico: `Los trabajadores y custodios del INAH son los guardianes de nuestra memoria histórica; cuentan con nuestro respeto y respaldo total.`
        },
        {
          numero: 12,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Los trabajadores advirtieron que cerrarán Paseo de la Reforma, Circuito Interior y Periférico frente a ${recinto} en rechazo a "${tema}". ¿Qué protocolo tienen para evitar el colapso vial de la metrópoli?`,
          peligro: 'Peligro Crítico — Bloqueo Total en Paseo de la Reforma y Periférico',
          sectorAtacante: 'Frente Intergremial de Cultura, Educación y Transporte',
          escudo: `Para evitar el cierre de Paseo de la Reforma y Periférico, instalamos hoy mismo una Mesa Pública de Concertación en ${recinto} con los secretarios generales del SNTSC, SNAINAH y representantes vecinales, dejando sin efecto cualquier orden administrativa de demolición o desmantelamiento asociada a "${tema}".`,
          pivotePolitico: `El conflicto vial se evita escuchando a tiempo a los trabajadores del patrimonio antes de que tengan que salir a bloquear Reforma.`
        },
        {
          numero: 13,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `La CNTE, el SNTE y el STUNAM anunciaron que se sumarán al frente de defensa de ${recinto} contra "${tema}". ¿Por qué abrir un frente de choque simultáneo con el magisterio y las universidades?`,
          peligro: 'Peligro Crítico — Alianza Sindical Magisterial-Cultural (CNTE / STUNAM)',
          sectorAtacante: 'Coordinadora Magisterial y Sindicatos Universitarios',
          escudo: `No abriremos ningún frente de confrontación con el magisterio ni con las universidades por "${tema}". Al contrario, convocamos al SNTE, la CNTE y al STUNAM a integrar el Patronato Público de Preservación Educativa de ${recinto}.`,
          pivotePolitico: `La educación y la cultura caminan juntas; con los maestros y universitarios construimos acuerdos, no batallas.`
        },
        {
          numero: 14,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `El Sindicato Único de Trabajadores (SUTGCDMX) de la sección Parques, Jardines y Bosques rechaza cualquier intervención en el entorno forestal de ${recinto} derivada de "${tema}". ¿Respetarán el bosque y a sus trabajadores?`,
          peligro: 'Peligro Alto — Paro de Trabajadores de Parques, Jardines y Bosques',
          sectorAtacante: 'Sindicato de Trabajadores de Parques y Jardines / SEMARNAT',
          escudo: `El entorno ecológico e histórico de ${recinto} es indivisible. Garantizamos a los trabajadores sindicalizados de Parques y Jardines y de SEMARNAT que no se talará un solo árbol ni se reducirá el área verde ni su plantilla laboral a causa de "${tema}".`,
          pivotePolitico: `Cuidar el monumento histórico es también cuidar cada árbol y cada trabajador que mantiene vivo el bosque.`
        },
        {
          numero: 15,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: ` Las uniones de comerciantes, guías de turistas certificados y trabajadores del entorno de ${recinto} denuncian que "${tema}" destruirá el sustento de miles de familias. ¿Qué respuesta les dan?`,
          peligro: 'Peligro Alto — Protesta de Guías de Turistas y Comerciantes Culturales',
          sectorAtacante: 'Agrupaciones de Guías de Turistas y Comerciantes de Chapultepec',
          escudo: `Protegemos el sustento de cada guía de turistas certificado, artesano y comerciante del corredor cultural de ${recinto}. Al descartar el cierre o eliminación del recinto y potenciar su programación cultural, aseguramos mayor afluencia de visitantes y estabilidad económica para sus familias.`,
          pivotePolitico: `El turismo cultural en ${recinto} es economía popular digna que vamos a fortalecer, nunca a destruir.`
        },
        {
          numero: 16,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `La Secretaría de la Defensa Nacional (SEDENA) y el Heroico Colegio Militar consideran a ${recinto} un recinto de honor histórico nacional. ¿Consultaron a las instituciones del Estado antes de proponer "${tema}"?`,
          peligro: 'Peligro Crítico — Sensibilidad Institucional e Histórica (SEDENA / Estado)',
          sectorAtacante: 'Comisiones de Defensa, Cultura y Gobernación del Congreso',
          escudo: `El carácter de ${recinto} como altar histórico de la soberanía nacional y del Heroico Colegio Militar exige el máximo respeto institucional. Cualquier proyecto en torno a "${tema}" se subordina a los protocolos de Estado de las Secretarías de Cultura, Gobernación y SEDENA, garantizando la intangibilidad absoluta del monumento.`,
          pivotePolitico: `Los símbolos de honor y soberanía de la nación en ${recinto} se honran y se preservan con rigor de Estado.`
        },
        {
          numero: 17,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Jueces federales en materia administrativa ya tienen sobre el escritorio decenas de demandas de amparo colectivo con suspensión de plano contra "${tema}" en ${recinto}. ¿Acatarán la suspensión judicial?`,
          peligro: 'Peligro Crítico — Suspensión Definitiva en Juicios de Amparo Colectivo',
          sectorAtacante: 'Juzgados de Distrito en Materia Administrativa y Colectivos Jurídicos',
          escudo: `No será necesario llegar al litigio en tribunales: antes de cualquier suspensión judicial, emitimos un acuerdo administrativo de preservación integral de ${recinto} que deja sin materia cualquier riesgo de daño patrimonial derivado de "${tema}".`,
          pivotePolitico: `El respeto a la legalidad y al patrimonio cultural se demuestra antes de que un juez tenga que ordenarlo.`
        },
        {
          numero: 18,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Desde el punto de vista ambiental y geofísico, el Cerro del Chapulín en ${recinto} contiene vestigios prehispánicos mexicas, acueductos virreinales y arbolado centenario. ¿Qué estudio arqueológico y ambiental respalda "${tema}"?`,
          peligro: 'Peligro Crítico — Destrucción de Vestigios Prehispánicos y Reserva Ecológica',
          sectorAtacante: 'Consejo de Arqueología del INAH y Biólogos de la UNAM',
          escudo: `El Cerro del Chapulín en ${recinto} es una zona de monumentos arqueológicos e históricos superpuestos (prehispánico, virreinal y moderno) además de reserva ecológica. Por dictamen del Consejo de Arqueología del INAH, queda prohibida cualquier excavación destructiva o demolición vinculada a "${tema}".`,
          pivotePolitico: `Cada piedra y cada ahuehuete de ${recinto} guarda siglos de historia mexicana que nadie tiene derecho a destruir.`
        },
        {
          numero: 19,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Con un ${contra}% de rechazo en la simulación ciudadana y alerta roja de paro en el INAH, ¿cuál es el veredicto técnico del Cuarto de Guerra sobre la viabilidad de "${tema}" en ${recinto}?`,
          peligro: 'Peligro Crítico — Dictamen de Inviabilidad del Cuarto de Guerra',
          sectorAtacante: 'Comité de Estrategia y Control de Crisis',
          escudo: `El veredicto técnico del motor predictivo es contundente: "${tema}" sobre ${recinto} es social, legal y políticamente inviable con ${contra}% de rechazo y riesgo crítico de paro nacional cultural. La recomendación ejecutiva es la cancelación inmediata de cualquier medida destructiva y su transformación en un Plan Maestro de Conservación del recinto.`,
          pivotePolitico: `Para eso sirve la inteligencia artificial aplicada a la política: para detectar a tiempo lo que el pueblo rechaza y corregir con responsabilidad.`
        },
        {
          numero: 20,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `En conclusión: ¿se comprometen públicamente hoy a que ${recinto} no será eliminado, demolido ni vulnerado bajo ningún concepto de "${tema}"?`,
          peligro: 'Peligro Crítico — Compromiso Público Definitivo',
          sectorAtacante: 'Ciudadanía, Comunidad Cultural y Prensa Nacional',
          escudo: `Compromiso absoluto, público y firmado: ${recinto} NO se toca, NO se elimina y NO se privatiza. Atendiendo al ${contra}% de la ciudadanía y a los trabajadores del INAH y la cultura, transformamos "${tema}" en un programa de blindaje y dignificación histórica de nuestro patrimonio nacional.`,
          pivotePolitico: `${recinto} seguirá de pie como orgullo de México hoy y por los próximos siglos.`
        }
      ];
    }
    // =========================================================================
    // CASO ESPECIALIZADO C: TALA DE ÁRBOLES / ECOCIDIO / BOSQUES / IMPACTO AMBIENTAL
    // =========================================================================
    else if (flags.esTalaEcocidio) {
      const zonaAfectada = (dc.lugaresEspecificos && dc.lugaresEspecificos[0]) || lugarPrincipal;
      preguntas = [
        {
          numero: 1,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Dónde está la Manifestación de Impacto Ambiental (MIA) aprobada por SEMARNAT o la Secretaría del Medio Ambiente que autorice "${tema}" en ${zonaAfectada}, considerando que la tala sin dictamen constituye delito ambiental grave?`,
          peligro: 'Peligro Crítico — Delito Ambiental / Ecocidio (PROFEPA / SEMARNAT)',
          sectorAtacante: 'PROFEPA, Abogados Ambientalistas y Prensa de Investigación',
          escudo: `Ningún árbol en ${zonaAfectada} puede ni será intervenido sin contar previamente con la Manifestación de Impacto Ambiental (MIA) pública, dictamen fitosanitario árbol por árbol avalado por biólogos de universidades públicas y autorización expresa de SEMARNAT/SEDEMA. Respecto a "${tema}", suspendemos cualquier derribo de arbolado sano y ordenamos el rediseño geométrico del proyecto.`,
          pivotePolitico: `El desarrollo urbano en ${zonaAfectada} jamás volverá a hacerse a costa de cometer un ecocidio contra nuestros pulmones verdes.`
        },
        {
          numero: 2,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `El enjambre ciudadano registra un ${contra}% de rechazo contundente contra "${tema}" en ${zonaAfectada}. ¿Por qué insistir en talar árboles cuando la ciudadanía exige más áreas verdes y no más concreto?`,
          peligro: 'Peligro Crítico — Rechazo Vecinal Masivo (${contra}% En Contra)',
          sectorAtacante: 'Comités Vecinales, Colectivos Ecologistas y Opinión Pública',
          escudo: `El ${contra}% de rechazo ciudadano frente a "${tema}" en ${zonaAfectada} tiene sustento científico y social: la gente defiende su derecho a un medio ambiente sano (Artículo 4° Constitucional). Acatamos el sentir mayoritario modificando el trazo del proyecto para preservar el 100% del arbolado maduro en pie.`,
          pivotePolitico: `Escuchar al ${contra}% de los vecinos de ${zonaAfectada} significa proteger la vida y el aire de nuestras familias.`
        },
        {
          numero: 3,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Qué constructora o desarrollo inmobiliario se beneficia económicamente detrás de "${tema}" y del derribo de árboles en ${zonaAfectada}?`,
          peligro: 'Peligro Crítico — Sospecha de Negocio Inmobiliario y Tala Comercial',
          sectorAtacante: 'Periodistas Anticorrupción y Contraloría Ciudadana',
          escudo: `Transparentamos el 100% de los expedientes técnicos de "${tema}" en ${zonaAfectada} y prohibimos por reglamento que cualquier particular o inmobiliaria obtenga cambios de uso de suelo, permisos de construcción o lucro comercial sobre áreas verdes o camellones arbolados.`,
          pivotePolitico: `Los árboles de ${zonaAfectada} no son estorbos para negocios privados; son patrimonio vital de la comunidad.`
        },
        {
          numero: 4,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Cuánto cuesta realmente trasplantar y reforestar a razón de 10 a 1 con árboles de porte maduro en ${zonaAfectada}, o piensan sembrar varitas secas que mueren al primer mes para justificar "${tema}"?`,
          peligro: 'Peligro Alto — Simulación en Reforestación y Presupuesto Ambiental',
          sectorAtacante: 'Ingenieros Forestales, CONAFOR y Auditoría Ambiental',
          escudo: `Se acabaron las reforestaciones simuladas con plántulas sin riego. El presupuesto de "${tema}" en ${zonaAfectada} etiqueta por ley un Fideicomiso Verde auditado con obligación de supervivencia certificada a 5 años, trasplante con máquina banquetera hidráulica para ejemplares en riesgo y compensación 10 a 1 con especies endémicas de al menos 3 metros de altura.`,
          pivotePolitico: `Reforestar de verdad es garantizar que cada árbol viva y crezca con mantenimiento pagado y auditado por los vecinos.`
        },
        {
          numero: 5,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `La Procuraduría Ambiental (PAOT / PROFEPA) advierte multas millonarias y clausura definitiva si ejecutan "${tema}" en ${zonaAfectada}. ¿Quién pagará esas sanciones con su patrimonio?`,
          peligro: 'Peligro Alto — Clausura de PROFEPA / PAOT y Fincamiento de Responsabilidades',
          sectorAtacante: 'PAOT, PROFEPA y Órgano Interno de Control',
          escudo: `No habrá clausuras ni multas porque ningún funcionario ni contratista en ${zonaAfectada} tiene autorización para encender una motosierra al margen de la PAOT y PROFEPA. Todo el expediente de "${tema}" se somete primero al visto bueno vinculante de la procuraduría ambiental.`,
          pivotePolitico: `El funcionario o contratista que derribe un árbol sin permiso legal en ${zonaAfectada} responderá penalmente ante la ley.`
        },
        {
          numero: 6,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `En plena crisis climática y olas de calor históricas, ejecutar "${tema}" en ${zonaAfectada} elevará la temperatura local hasta en 4 grados centígrados por el efecto isla de calor. ¿Evaluaron el daño a la salud pública?`,
          peligro: 'Peligro Crítico — Isla de Calor Urbana y Crisis Climática',
          sectorAtacante: 'Científicos del Cambio Climático (UNAM) y Sector Salud',
          escudo: `Los estudios de microclima urbano de la UNAM demuestran que el arbolado maduro de ${zonaAfectada} reduce entre 3°C y 5°C la temperatura superficial y filtra toneladas de partículas PM2.5. Por ello, rediseñamos "${tema}" bajo criterios de infraestructura verde que amplían la cobertura arbórea en lugar de reducirla.`,
          pivotePolitico: `En tiempos de crisis climática, cada árbol en ${zonaAfectada} es un escudo de salud para niños y adultos mayores.`
        },
        {
          numero: 7,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Los árboles que pretenden afectar con "${tema}" en ${zonaAfectada} son clave para la infiltración de agua de lluvia al acuífero en una región con sequía severa según CONAGUA. ¿Por qué agravar la crisis del agua?`,
          peligro: 'Peligro Crítico — Pérdida de Recarga Hídrica y Sequía CONAGUA',
          sectorAtacante: 'Hidrólogos, Comités Comunitarios del Agua y CONAGUA',
          escudo: `Sin árboles no hay agua. Reconociendo los datos de estrés hídrico de CONAGUA en ${zonaAfectada}, incorporamos en "${tema}" jardines infiltrantes, pavimento permeable y conservación total del sistema radicular de los árboles existentes para maximizar la recarga del manto freático.`,
          pivotePolitico: `Defender los árboles de ${zonaAfectada} es defender el agua que mañana saldrá en las llaves de nuestras casas.`
        },
        {
          numero: 8,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Vecinos, madres de familia y colectivos ambientalistas ya acampan y se encadenan a los árboles de ${zonaAfectada} para impedir "${tema}". ¿Van a enviar granaderos contra los vecinos que defienden sus árboles?`,
          peligro: 'Peligro Crítico — Campamentos Vecinales y Encadenamiento Civil',
          sectorAtacante: 'Frentes Vecinales en Defensa del Arbolado y Derechos Humanos',
          escudo: `Prohibido terminantemente el uso de la fuerza pública contra vecinos o activistas ambientales en ${zonaAfectada}. En lugar de policías, enviamos al equipo técnico a firmar con los campamentos vecinales el acta de suspensión de tala y la mesa de co-diseño ciudadano de "${tema}".`,
          pivotePolitico: `A los vecinos que defienden la naturaleza de ${zonaAfectada} no se les reprime; se les escucha y se les da la razón.`
        },
        {
          numero: 9,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Biólogos y ornitólogos denuncian que "${tema}" en ${zonaAfectada} destruirá nidos y hábitat de fauna urbana y especies protegidas por la NOM-059-SEMARNAT. ¿Tienen censo de biodiversidad?`,
          peligro: 'Peligro Alto — Destrucción de Fauna Silvestre y NOM-059-SEMARNAT',
          sectorAtacante: 'Facultad de Ciencias UNAM, Biólogos y Protectoras de Animales',
          escudo: `Cumplimos estrictamente con la NOM-059-SEMARNAT. Se levanta un censo biológico integral de avifauna y polinizadores en ${zonaAfectada} junto con biólogos universitarios, estableciendo vedas absolutas y corredores biológicos protegidos dentro de "${tema}".`,
          pivotePolitico: `La biodiversidad urbana de ${zonaAfectada} es parte viva de nuestra comunidad y está protegida por ley.`
        },
        {
          numero: 10,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Muchos de los árboles amenazados por "${tema}" en ${zonaAfectada} tienen más de 50 o 100 años y fueron plantados por los abuelos de la colonia. ¿No entienden el valor patrimonial y afectivo para el barrio?`,
          peligro: 'Peligro Alto — Agravio al Patrimonio Biocultural e Identidad Barrial',
          sectorAtacante: 'Cronistas Locales, Adultos Mayores y Comités de Colonia',
          escudo: `Declaramos a los ejemplares históricos y centenarios de ${zonaAfectada} como "Árboles Patrimoniales Intocables" con placa de protección municipal/estatal. Ninguna obra vinculada a "${tema}" podrá tocar jamás un árbol histórico de la comunidad.`,
          pivotePolitico: `Un árbol de 80 años en ${zonaAfectada} es historia viva de nuestras familias y ninguna máquina lo va a derribar.`
        },
        {
          numero: 11,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `El Sindicato de Trabajadores de Medio Ambiente (SNTSEMARNAT / CONAFOR) y la sección de Parques y Jardines del SUTGCDMX/SUTEYM anunciaron huelga de brazos caídos: se niegan a ejecutar "${tema}" en ${zonaAfectada}. ¿Los van a despedir por negarse a talar?`,
          peligro: 'Peligro Crítico — Rebelión y Paro de Sindicatos Ambientales y Parques y Jardines',
          sectorAtacante: 'SNTSEMARNAT, CONAFOR y Sindicato de Parques y Jardines',
          escudo: `Respaldamos la ética ambiental y los derechos laborales de los trabajadores del SNTSEMARNAT, CONAFOR y Parques y Jardines. Ningún trabajador será sancionado ni obligado a derribar arbolado sano en ${zonaAfectada}; al contrario, sus cuadrillas liderarán el plan de saneamiento, poda fitosanitaria y reforestación de "${tema}".`,
          pivotePolitico: `Los trabajadores de Parques y Jardines están para dar vida a las áreas verdes de ${zonaAfectada}, no para destruirlas.`
        },
        {
          numero: 12,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Comisariados ejidales (CNC), comuneros forestales y frentes ecologistas advierten que cerrarán las carreteras y avenidas de acceso a ${zonaAfectada} si entra maquinaria pesada por "${tema}". ¿Cómo evitarán el bloqueo?`,
          peligro: 'Peligro Crítico — Bloqueo Carretero de Ejidatarios, Comuneros y Ecologistas',
          sectorAtacante: 'Comisariados Ejidales (CNC), Comuneros y Frentes Ambientales',
          escudo: `Retiramos cualquier maquinaria pesada de tala en ${zonaAfectada} y firmamos un Convenio de Pago por Servicios Ambientales y Protección Forestal con los núcleos ejidales, comuneros y colectivos locales, desactivando de inmediato los bloqueos viales en torno a "${tema}".`,
          pivotePolitico: `Con los ejidatarios y guardianes del bosque de ${zonaAfectada} se pacta la conservación del territorio, nunca el despojo.`
        },
        {
          numero: 13,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Los sindicatos de agua (SACMEX / CAEM / SNTCONAGUA) alertan que "${tema}" afectará las zonas de recarga de pozos en ${zonaAfectada}, sobrecargando la operación de bombeo y pipas. ¿Qué acuerdo tienen con ellos?`,
          peligro: 'Peligro Alto — Alerta Técnica del Sindicato de Agua Potable',
          sectorAtacante: 'Sindicatos Operadores de Agua (SACMEX / CAEM / CONAGUA)',
          escudo: `Integramos a los técnicos sindicalizados del sistema de aguas en la supervisión de "${tema}" en ${zonaAfectada}, blindando los perímetros de protección de pozos y sumando pozos de absorción pluvial que alivien la carga operativa de la red hidráulica.`,
          pivotePolitico: `Cuidar el suelo verde y el arbolado de ${zonaAfectada} es cuidar el trabajo de quienes llevan agua a cada colonia.`
        },
        {
          numero: 14,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Sindicatos de transportistas y comerciantes de ${zonaAfectada} reclaman que los cierres viales y protestas provocados por "${tema}" están colapsando el tránsito y las ventas locales. ¿Cómo resolverán el caos vial?`,
          peligro: 'Peligro Alto — Fricción con Transportistas y Comercio Local',
          sectorAtacante: 'Rutas de Transporte y Uniones de Comerciantes de ${zonaAfectada}',
          escudo: `Al cancelar la tala y acordar con los vecinos un diseño sustentable no invasivo para "${tema}" en ${zonaAfectada}, se levantan los bloqueos de protesta y se garantiza la libre circulación del transporte público y la clientela de los comercios locales.`,
          pivotePolitico: `La paz ambiental y vecinal en ${zonaAfectada} devuelve de inmediato la movilidad y las ventas al comercio local.`
        },
        {
          numero: 15,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Sindicatos universitarios (STUNAM, SITUAM) y colegios de arquitectos e ingenieros civiles proponen alternativas técnicas que no requieren cortar un solo árbol en ${zonaAfectada}. ¿Por qué no adoptaron ese diseño desde el principio en "${tema}"?`,
          peligro: 'Peligro Alto — Cuestionamiento Técnico de Colegios de Ingenieros y Universidades',
          sectorAtacante: 'Colegio de Arquitectos, Ingenieros Civiles y Sindicatos Académicos',
          escudo: `Adoptamos formalmente la alternativa de ingeniería verde propuesta por los especialistas universitarios y colegios de arquitectos para "${tema}" en ${zonaAfectada}, integrando pasos arborizados y adecuación de trazo con "Cero Tala".`,
          pivotePolitico: `La buena ingeniería adapta el cemento a la naturaleza de ${zonaAfectada}, no destruye la naturaleza para poner cemento.`
        },
        {
          numero: 16,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Un Juez de Distrito acaba de admitir un juicio de amparo indirecto promovido por vecinos de ${zonaAfectada} por violación al derecho humano a un medio ambiente sano contra "${tema}". ¿Se detendrá el proyecto?`,
          peligro: 'Peligro Crítico — Amparo Ambiental Colectivo y Suspensión Judicial',
          sectorAtacante: 'Juzgados Federales y Litigio Estratégico Ambiental',
          escudo: `Acatamos de forma inmediata y preventiva el principio precautorio ambiental reconocido por la Suprema Corte (SCJN). Al modificar "${tema}" hacia un esquema de preservación del 100% del arbolado en ${zonaAfectada}, damos cumplimiento cabal al derecho humano al medio ambiente sano.`,
          pivotePolitico: `No litigamos contra los vecinos que defienden los árboles de ${zonaAfectada}; blindamos legalmente sus áreas verdes.`
        },
        {
          numero: 17,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `¿Qué pasará con los árboles que realmente tengan dictamen de riesgo de caída o plaga en ${zonaAfectada}: usarán ese pretexto para talar árboles sanos dentro de "${tema}"?`,
          peligro: 'Peligro Alto — Falsificación de Dictámenes Fitosanitarios',
          sectorAtacante: 'Observatorios Ciudadanos del Arbolado y Vecinos',
          escudo: `Ningún dictamen fitosanitario en ${zonaAfectada} será unilateral: cada árbol será evaluado en recorrido público con vecinos, arboristas certificados de Chapingo/UNAM y transmisión abierta, aplicando primero endoterapia vegetal y rescate arbóreo antes de tocar cualquier ejemplar en "${tema}".`,
          pivotePolitico: `Al árbol enfermo en ${zonaAfectada} se le cura con ciencia forestal, no se le condena a la motosierra.`
        },
        {
          numero: 18,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `¿Cómo garantizan el riego y mantenimiento permanente de las áreas verdes de ${zonaAfectada} cuando hoy muchos camellones están abandonados?`,
          peligro: 'Peligro Medio-Alto — Abandono de Mantenimiento de Parques y Camellones',
          sectorAtacante: 'Asociaciones de Colonos de ${zonaAfectada}',
          escudo: `Dentro de "${tema}" se instala una red de riego automatizado con agua tratada certificada para todo el corredor verde de ${zonaAfectada}, operada por cuadrillas de base equipadas y supervisada por el Comité Vecinal de Guardianes del Bosque.`,
          pivotePolitico: `No basta con no talar; vamos a convertir a ${zonaAfectada} en un corredor verde vivo y bien cuidado los 365 días del año.`
        },
        {
          numero: 19,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Con un ${contra}% de rechazo ciudadano en el simulador y alerta roja ambiental y sindical, ¿reconocen que plantear "${tema}" con derribo de árboles fue un error grave de planeación?`,
          peligro: 'Peligro Crítico — Autocrítica y Rectificación en Cuarto de Guerra',
          sectorAtacante: 'Medios de Comunicación y Moderadores de Debate',
          escudo: `Sí, lo reconocemos con total transparencia: los datos del simulador (${contra}% en contra) demuestran que cualquier afectación al arbolado de ${zonaAfectada} es inaceptable. Por eso rectificamos hoy mismo el proyecto "${tema}" antes de tocar un solo árbol en campo.`,
          pivotePolitico: `Rectificar tras escuchar al ${contra}% de los ciudadanos de ${zonaAfectada} es la mayor prueba de responsabilidad democrática.`
        },
        {
          numero: 20,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Para concluir: ¿firman hoy ante los vecinos de ${zonaAfectada} el compromiso de "Cero Tala" y la reconversión de "${tema}" en un programa de arborización masiva?`,
          peligro: 'Peligro Crítico — Compromiso Notariado de Cero Tala',
          sectorAtacante: 'Asamblea Vecinal y Colectivos Ecologistas de ${zonaAfectada}',
          escudo: `Firmado hoy ante los vecinos de ${zonaAfectada}: decretamos "Cero Tala de Árboles Sanos" y transformamos "${tema}" en el Programa de Arborización y Regeneración Ambiental más importante del municipio, con vigilancia ciudadana vinculante.`,
          pivotePolitico: `En ${zonaAfectada} no cae un árbol más; por el contrario, sembramos futuro y aire limpio con la comunidad.`
        }
      ];
    }
    // =========================================================================
    // CASO DINÁMICO D: CUALQUIER PROPUESTA O ARCHIVO SUBIDO POR EL USUARIO (100% ANCLADO AL TEMA)
    // =========================================================================
    else {
      const ctxActor = actorPrincipal ? ` (involucrando a ${actorPrincipal})` : '';
      preguntas = [
        {
          numero: 1,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿De dónde saldrá el presupuesto público para financiar "${tema}"${ctxActor} en ${lugarPrincipal} sin endeudar al erario ni recortar partidas prioritarias de los Ramos 28 y 33?`,
          peligro: 'Peligro Crítico — Viabilidad Financiera y Techo Presupuestal SHCP',
          sectorAtacante: 'Comisión de Hacienda, Contraloría y Analistas Financieros',
          escudo: `La ejecución de "${tema}" en ${lugarPrincipal} no contrata deuda pública nueva. Se financia mediante reingeniería del gasto corriente y fondos etiquetados auditables de la SHCP, garantizando suficiencia presupuestal plurianual para ${accionPrincipal} sin afectar nóminas ni servicios básicos.`,
          pivotePolitico: `Cada peso invertido en "${tema}" en ${lugarPrincipal} está blindado contra moches y genera retorno social directo para ${sectorPrincipal}.`
        },
        {
          numero: 2,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `¿Cómo garantizan que "${tema}" en ${lugarPrincipal} no termine en sobreprecios, licitaciones a modo o corrupción durante la fase de ${accionPrincipal}?`,
          peligro: 'Peligro Crítico — Fiscalización ASF y Prensa de Investigación',
          sectorAtacante: 'Periodistas de Investigación y Sistema Anticorrupción',
          escudo: `Para blindar "${tema}"${ctxActor}, todas las contrataciones y padrones vinculados a ${accionPrincipal} en ${lugarPrincipal} se someterán a licitación pública abierta en tiempo real, con testigos sociales ciudadanos y auditoría preventiva de la ASF.`,
          pivotePolitico: `En "${tema}" cerramos la puerta a los contratistas favoritos: cuentas claras y vigilancia vecinal en ${lugarPrincipal}.`
        },
        {
          numero: 3,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `Con la inflación actual en la canasta básica reportada por PROFECO, ¿cómo aseguran que "${tema}" no implique nuevos impuestos, tarifas ocultas o cargas económicas para ${sectorPrincipal} en ${lugarPrincipal}?`,
          peligro: 'Peligro Alto — Impacto al Bolsillo Familiar (ENIGH / PROFECO)',
          sectorAtacante: 'Asociaciones de Consumidores y Familias de ${lugarPrincipal}',
          escudo: `El diseño financiero de "${tema}" en ${lugarPrincipal} incluye una cláusula de impacto tarifario cero para los hogares. Lejos de encarecer la vida de ${sectorPrincipal}, la implementación de ${accionPrincipal} reduce costos indirectos y protege el ingreso familiar.`,
          pivotePolitico: `Nuestra regla de oro en ${lugarPrincipal} es clara: "${tema}" viene a apoyar el bolsillo de la gente, jamás a exprimirlo.`
        },
        {
          numero: 4,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `Cámaras empresariales y comercios de ${lugarPrincipal} cuestionan por qué priorizar "${tema}" cuando existen rezagos urgentes en competitividad y seguridad comercial. ¿Cuál es el balance costo-beneficio?`,
          peligro: 'Peligro Medio-Alto — Cuestionamiento de Cámaras Productivas',
          sectorAtacante: 'Cámaras de Comercio, PYMES y Contribuyentes de ${lugarPrincipal}',
          escudo: `Los indicadores de DataMéxico y el DENUE en ${lugarPrincipal} demuestran que atender "${tema}" mediante ${accionPrincipal} detona certidumbre operativa y fortalece el entorno económico de ${sectorPrincipal}, generando un efecto multiplicador para el comercio local.`,
          pivotePolitico: `Impulsar "${tema}" no compite con la economía de ${lugarPrincipal}; es la base para que los negocios locales prosperen con orden.`
        },
        {
          numero: 5,
          bloque: 'Legalidad, Costo Político y Presupuesto',
          dardo: `Si ocurre un recorte en las participaciones federales a mitad del ejercicio fiscal, ¿qué etapa de "${tema}" en ${lugarPrincipal} quedará inconclusa?`,
          peligro: 'Peligro Alto — Riesgo de Parálisis Presupuestal',
          sectorAtacante: 'Bancadas de Oposición en el Congreso / Cabildo',
          escudo: `El cronograma financiero de "${tema}" en ${lugarPrincipal} está dividido en 3 fases modulares 100% fondeadas desde su arranque. La primera etapa de ${accionPrincipal} queda asegurada en fideicomiso irreductible, impidiendo que quede como obra o programa inconcluso.`,
          pivotePolitico: `Con "${tema}" en ${lugarPrincipal} no hacemos promesas al aire; cada etapa que inicia tiene presupuesto garantizado hasta su entrega.`
        },
        {
          numero: 6,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `El simulador de enjambre registra un ${contra}% de rechazo o escepticismo ciudadano hacia "${tema}" en ${lugarPrincipal}. ¿Qué les responden a los vecinos que desconfían de ${accionPrincipal}?`,
          peligro: 'Peligro Crítico — Rechazo Ciudadano del ${contra}% en Simulación',
          sectorAtacante: 'Moderadores de Debate, Encuestadoras y Opinión Pública',
          escudo: `Tomamos con máxima seriedad ese ${contra}% de rechazo o reserva crítica hacia "${tema}" en ${lugarPrincipal}. Esas objeciones ciudadanas sobre ${accionPrincipal} nos obligan a instalar mesas de ajuste en cada colonia para corregir fallas operativas y garantizar que el beneficio llegue directamente a ${sectorPrincipal}.`,
          pivotePolitico: `No gobernamos con oídos sordos: el ${contra}% que cuestiona "${tema}" en ${lugarPrincipal} nos ayuda a perfeccionar y blindar el proyecto.`
        },
        {
          numero: 7,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Según datos de CONEVAL, en ${lugarPrincipal} persisten carencias sociales severas. ¿De qué manera concreta "${tema}" ayuda a reducir la desigualdad en las colonias más vulnerables?`,
          peligro: 'Peligro Crítico — Deuda Social en Zonas de Alta Marginación (CONEVAL)',
          sectorAtacante: 'Colectivos Barriales y Líderes Comunitarios de ${lugarPrincipal}',
          escudo: `El padrón de prelación de "${tema}" prioriza iniciar ${accionPrincipal} exactamente en los polígonos y AGEBs con mayor rezago social diagnosticados por CONEVAL en ${lugarPrincipal}, asegurando que ${sectorPrincipal} reciba el impacto positivo desde el primer trimestre.`,
          pivotePolitico: `Por el bien de ${lugarPrincipal}, "${tema}" empieza donde más se necesita, no en las oficinas de gobierno.`
        },
        {
          numero: 8,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Vecinos de ${lugarPrincipal} temen que la aplicación de "${tema}" (${accionPrincipal}) genere afectaciones cotidianas, desplazamientos o cobros indebidos en sus colonias. ¿Qué candados sociales existirán?`,
          peligro: 'Peligro Alto — Inconformidad Vecinal en Colonias de ${lugarPrincipal}',
          sectorAtacante: 'Comités de Participación Ciudadana y Juntas Vecinales',
          escudo: `Establecemos una Carta de Derechos Vecinales para "${tema}" en ${lugarPrincipal}: ninguna acción de ${accionPrincipal} podrá ejecutarse sin asamblea informativa previa y firma de conformidad del comité vecinal, garantizando cero desplazamientos y protección a ${sectorPrincipal}.`,
          pivotePolitico: `En ${lugarPrincipal}, "${tema}" se construye con el permiso y la supervisión de los vecinos, jamás por imposición.`
        },
        {
          numero: 9,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `¿Cómo contempla "${tema}" en ${lugarPrincipal} las necesidades específicas de adultos mayores, mujeres jefas de familia y personas con discapacidad dentro de ${sectorPrincipal}?`,
          peligro: 'Peligro Alto — Inclusión Social, Perspectiva de Género y Accesibilidad',
          sectorAtacante: 'Colectivos de Mujeres, Adultos Mayores y Derechos Humanos',
          escudo: `Las reglas de operación de "${tema}" en ${lugarPrincipal} incorporan acción afirmativa obligatoria: accesibilidad universal, perspectiva de género y atención preferente a adultos mayores y madres trabajadoras en cada fase de ${accionPrincipal}.`,
          pivotePolitico: `El éxito de "${tema}" en ${lugarPrincipal} se medirá por la dignidad con que trate a nuestras mujeres y adultos mayores.`
        },
        {
          numero: 10,
          bloque: 'Impacto Social, Ciudadano y Patrimonial',
          dardo: `Los jóvenes de 18 a 29 años en ${lugarPrincipal} suelen ser el sector más crítico en redes sociales frente a propuestas como "${tema}". ¿Qué beneficio real tendrán los jóvenes estudiantes y trabajadores?`,
          peligro: 'Peligro Medio-Alto — Escepticismo Juvenil y Crítica en Redes Sociales',
          sectorAtacante: 'Comunidades Estudiantiles, Jóvenes y Creadores Digitales',
          escudo: `Vinculamos "${tema}" en ${lugarPrincipal} con universidades y tecnológicos locales para que los jóvenes participen directamente en la innovación, auditoría técnica y bolsa de empleo generada por ${accionPrincipal}, con transparencia abierta en plataformas digitales.`,
          pivotePolitico: `Los jóvenes de ${lugarPrincipal} no serán espectadores de "${tema}"; serán protagonistas y auditores directos.`
        },
        {
          numero: 11,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `El motor de Inteligencia Sindical advierte que los gremios y sindicatos vinculados a ${sectorPrincipal} en ${lugarPrincipal} amenazan con paros y movilizaciones si "${tema}" afecta sus derechos o fuentes de ingreso. ¿Cómo desactivarán el conflicto?`,
          peligro: 'Peligro Crítico — Emplazamiento a Paro y Bloqueo Sindical',
          sectorAtacante: 'Sindicatos y Organizaciones Gremiales de ${lugarPrincipal}',
          escudo: `Antes de publicar cualquier lineamiento de "${tema}" en ${lugarPrincipal}, instalamos una Mesa Permanente de Concertación Sindical con los liderazgos gremiales de ${sectorPrincipal}, garantizando por escrito que ${accionPrincipal} respetará el 100% de sus derechos laborales y fuentes de sustento.`,
          pivotePolitico: `Con los trabajadores y sindicatos de ${lugarPrincipal}, "${tema}" avanza mediante el diálogo y el acuerdo previo, nunca por el choque.`
        },
        {
          numero: 12,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Uniones de comerciantes, mercados y transportistas de ${lugarPrincipal} exigen garantías de que "${tema}" (${accionPrincipal}) no paralizará las vialidades ni sus ventas diarias. ¿Qué protocolo operativo ofrecen?`,
          peligro: 'Peligro Crítico — Bloqueo de Avenidas Primarias y Mercados',
          sectorAtacante: 'Alianzas de Transportistas, Locatarios y Tianguistas de ${lugarPrincipal}',
          escudo: `Acordamos con las rutas de transporte y uniones de comerciantes de ${lugarPrincipal} un protocolo de mitigación operativa para "${tema}": cero cierres viales arbitrarios, respeto a zonas de comercio popular y estímulos directos durante la implementación de ${accionPrincipal}.`,
          pivotePolitico: `La economía popular y el transporte de ${lugarPrincipal} son aliados estratégicos para que "${tema}" funcione en paz.`
        },
        {
          numero: 13,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Los sindicatos de servidores públicos y burócratas (FSTSE / SUTEYM / SUTGCDMX) cuestionan si "${tema}" implicará subcontratación privada o desplazamiento de personal de base en ${lugarPrincipal}. ¿Qué responden?`,
          peligro: 'Peligro Alto — Tensión con Sindicatos de Administración Pública',
          sectorAtacante: 'Sindicatos Burocráticos y Trabajadores de Base',
          escudo: `Blindamos el Contrato Colectivo de Trabajo en ${lugarPrincipal}: la operación técnica de "${tema}" y de ${accionPrincipal} se apoyará en el fortalecimiento, equipamiento y capacitación de los trabajadores sindicalizados en activo, sin privatizar funciones públicas.`,
          pivotePolitico: `Respetar la base trabajadora de ${lugarPrincipal} es garantizar que "${tema}" opere con experiencia y compromiso público.`
        },
        {
          numero: 14,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `El magisterio (SNTE / CNTE) y los sindicatos del sector salud (SNTSA / SNTSS) exigen que los recursos de "${tema}" en ${lugarPrincipal} no se distraigan de las necesidades de escuelas y clínicas. ¿Cómo responden a este reclamo?`,
          peligro: 'Peligro Alto — Presión de Sindicatos de Educación y Salud',
          sectorAtacante: 'Secciones Magisteriales y Sindicatos de Salud en ${lugarPrincipal}',
          escudo: `Los presupuestos de educación y salud en ${lugarPrincipal} son intocables. Más aún, articulamos "${tema}" para que las acciones de ${accionPrincipal} mejoren de forma complementaria los entornos de escuelas y clínicas donde laboran maestros y personal médico.`,
          pivotePolitico: `Maestros y médicos de ${lugarPrincipal} verán en "${tema}" un refuerzo a su comunidad, jamás un recorte.`
        },
        {
          numero: 15,
          bloque: 'Conflicto Sindical, Gremial y Enjambre',
          dardo: `Si grupos de choque o intereses políticos adversos intentan infiltrar las protestas gremiales contra "${tema}" en ${lugarPrincipal}, ¿cómo mantendrán la gobernabilidad sin caer en la represión?`,
          peligro: 'Peligro Alto — Sabotaje Político y Gobernabilidad en Calle',
          sectorAtacante: 'Operadores Políticos Rivales y Grupos de Presión',
          escudo: `Nuestra mejor vacuna contra el sabotaje político en ${lugarPrincipal} es la transparencia directa con las bases de ${sectorPrincipal}. Al informar y pactar beneficios reales de "${tema}" directamente en asambleas abiertas, aislamos a los provocadores sin usar la fuerza pública.`,
          pivotePolitico: `La gobernabilidad de "${tema}" en ${lugarPrincipal} se sostiene con legitimidad social y acuerdos transparentes.`
        },
        {
          numero: 16,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `En materia ambiental y de recursos hídricos (CONAGUA / SEMARNAT), ¿qué impacto tendrá "${tema}" (${accionPrincipal}) sobre el agua, el arbolado y el entorno ecológico de ${lugarPrincipal}?`,
          peligro: 'Peligro Crítico — Sustentabilidad Ambiental e Hídrica en ${lugarPrincipal}',
          sectorAtacante: 'Colectivos Ambientalistas, CONAGUA y Especialistas en Sustentabilidad',
          escudo: `Todo el expediente técnico de "${tema}" en ${lugarPrincipal} cumple con criterios de huella hídrica neutra, cero tala de arbolado urbano y apego estricto a las normas ambientales de SEMARNAT y CONAGUA durante el desarrollo de ${accionPrincipal}.`,
          pivotePolitico: `Ninguna acción de "${tema}" en ${lugarPrincipal} comprometerá el agua ni las áreas verdes de las próximas generaciones.`
        },
        {
          numero: 17,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Considerando los índices delictivos del SESNSP y la percepción de inseguridad ENSU en ${lugarPrincipal}, ¿cómo se blinda "${tema}" contra la extorsión o la delincuencia organizada?`,
          peligro: 'Peligro Crítico — Seguridad Operativa y Prevención del Delito (SESNSP / C5)',
          sectorAtacante: 'Observatorios de Seguridad Ciudadana y Vecinos de ${lugarPrincipal}',
          escudo: `Integramos en "${tema}" protocolos de seguridad situacional y coordinación en tiempo real con el C5 y la policía de ${lugarPrincipal}, protegiendo tanto la ejecución de ${accionPrincipal} como la integridad física y patrimonial de ${sectorPrincipal}.`,
          pivotePolitico: `En ${lugarPrincipal}, "${tema}" va acompañado de orden, vigilancia e iluminación para devolver la tranquilidad a los vecinos.`
        },
        {
          numero: 18,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Colegios de abogados y partidos de oposición advierten que interpondrán juicios de amparo o controversias legales para frenar "${tema}" en ${lugarPrincipal}. ¿Qué tan sólido es su sustento jurídico?`,
          peligro: 'Peligro Alto — Litigio Estratégico, Amparos y Controversias',
          sectorAtacante: 'Barras de Abogados y Jurídicos de Oposición',
          escudo: `El marco normativo de "${tema}"${ctxActor} en ${lugarPrincipal} ha sido dictaminado conforme a la Constitución Federal, la legislación estatal y la reglamentación municipal aplicable a ${accionPrincipal}, incluyendo consulta ciudadana previa que blinda el proyecto ante cualquier amparo.`,
          pivotePolitico: `Diseñamos "${tema}" con rigor jurídico absoluto para que sirva a ${lugarPrincipal} sin trabas en los tribunales.`
        },
        {
          numero: 19,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Los ciudadanos de ${lugarPrincipal} están cansados de anuncios que tardan años en cumplirse. ¿Cuáles son los plazos verificables y métricas en los primeros 100 días de "${tema}"?`,
          peligro: 'Peligro Alto — Cumplimiento de Plazos y Rendición de Cuentas',
          sectorAtacante: 'Prensa Local, Observatorios Ciudadanos y Cámaras de ${lugarPrincipal}',
          escudo: `Establecemos un tablero público de indicadores para "${tema}" en ${lugarPrincipal} con metas auditables a 30, 60 y 100 días sobre ${accionPrincipal}. Si un responsable operativo incumple el calendario comprometido con ${sectorPrincipal}, es relevado de inmediato.`,
          pivotePolitico: `En ${lugarPrincipal} se acabaron los cheques en blanco: "${tema}" se mide con resultados fechados y verificables por la gente.`
        },
        {
          numero: 20,
          bloque: 'Ejecución Técnica, Ambiental y Jurídica',
          dardo: `Finalmente, ¿cómo aseguran la continuidad institucional de "${tema}" en ${lugarPrincipal} para que el cambio de administración no destruya lo construido para ${sectorPrincipal}?`,
          peligro: 'Peligro Alto — Continuidad Institucional Transexenal / Municipal',
          sectorAtacante: 'Consejos Ciudadanos, Académicos y Cronistas de ${lugarPrincipal}',
          escudo: `Institucionalizamos "${tema}" en ${lugarPrincipal} mediante reglamento formal y un Consejo Ciudadano de Vigilancia integrado por representantes de ${sectorPrincipal}, universidades y gremios, asegurando que los beneficios de ${accionPrincipal} sean patrimonio permanente de la comunidad.`,
          pivotePolitico: `"${tema}" no es propiedad de un político ni de un partido; es una conquista permanente de los ciudadanos de ${lugarPrincipal}.`
        }
      ];
    }

    return {
      totalPreguntas: preguntas.length,
      temaCentralAnclado: tema,
      entidadesDetectadas: {
        nombresPropios: dc.nombresPropios || [],
        lugaresEspecificos: dc.lugaresEspecificos || [],
        accionesPropuestas: dc.accionesPropuestas || [],
        sectoresAfectados: dc.sectoresAfectados || []
      },
      bloques: [
        { nombre: 'Legalidad, Costo Político y Presupuesto', rango: 'Preguntas 1 a 5' },
        { nombre: 'Impacto Social, Ciudadano y Patrimonial', rango: 'Preguntas 6 a 10' },
        { nombre: 'Conflicto Sindical, Gremial y Enjambre', rango: 'Preguntas 11 a 15' },
        { nombre: 'Ejecución Técnica, Ambiental y Jurídica', rango: 'Preguntas 16 a 20' }
      ],
      preguntas
    };
  }

  /**
   * Genera el Arsenal de Contraataque y Demolición de Contrincante (Modo Ataque / Oposición)
   * 100% Anclado al Tema o Archivo de la Propuesta Rival
   */
  generateAttackDossier(propuestaRivalTexto = '', partidoRival = 'MORENA', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', municipalResearch = {}, aiAttackData = null, semanticResult = null) {
    const muni = municipio || 'Ecatepec de Morelos';
    const rival = partidoRival || 'MORENA';

    const dc = (semanticResult && semanticResult.deepContext)
      ? semanticResult.deepContext
      : semanticAnalyzer.extractDeepContext(propuestaRivalTexto, '', muni, estado);

    const tema = dc.temaCentral || (propuestaRivalTexto || 'la propuesta rival').substring(0, 95);
    const lugar = (dc.lugaresEspecificos && dc.lugaresEspecificos[0]) || muni;
    const actor = (dc.nombresPropios && dc.nombresPropios[0]) ? ` (${dc.nombresPropios[0]})` : '';
    const flags = dc.flagsTematicos || {};

    if (aiAttackData && Array.isArray(aiAttackData.soundbites) && aiAttackData.soundbites.length > 0 && aiAttackData.guionDebate) {
      return {
        partidoRival: rival,
        municipio: muni,
        estado,
        temaCentralAnclado: tema,
        rechazoEstimado: typeof aiAttackData.rechazoEstimado === 'number' ? aiAttackData.rechazoEstimado : 76,
        aprobacionRival: typeof aiAttackData.aprobacionRival === 'number' ? aiAttackData.aprobacionRival : 24,
        sectoresAgraviados: aiAttackData.sectoresAgraviados || [],
        planCaptura: aiAttackData.planCaptura || { focoTerritorial: `Bastiones en ${lugar}`, lugaresVisita: [], promesaCompromiso: '' },
        soundbites: aiAttackData.soundbites || [],
        guionDebate: aiAttackData.guionDebate || {},
        contrapropuestaGanadora: aiAttackData.contrapropuestaGanadora || {},
        iaGenerada: true
      };
    }

    let rechazoEstimado = (flags.esTemaExpresidentePolitica || flags.esDestruccionPatrimonio || flags.esTalaEcocidio) ? 88 : 74;

    const sectoresAgraviados = (dc.sectoresAfectados && dc.sectoresAfectados.length >= 2)
      ? dc.sectoresAfectados.slice(0, 3).map((s, i) => ({
          sector: s,
          nivelFriccion: `${92 - i * 5}% de Oposición`,
          motivo: `Rechazo directo a las consecuencias de "${tema}"${actor} en ${lugar}.`
        }))
      : [
          { sector: `Vecinos y Familias de ${lugar}`, nivelFriccion: '90% de Oposición', motivo: `Afectación directa por la imposición de "${tema}".` },
          { sector: 'Sindicatos, Trabajadores y Gremios Locales', nivelFriccion: '85% de Oposición', motivo: `Falta de consulta y riesgo laboral derivado de "${tema}".` },
          { sector: 'Jóvenes, Académicos y Sociedad Civil', nivelFriccion: '81% de Oposición', motivo: `Inviabilidad legal, presupuestal y social de "${tema}".` }
        ];

    const planCaptura = {
      focoTerritorial: `Despliegue inmediato en ${lugar} con los sectores agraviados por "${tema}"`,
      lugaresVisita: [
        `Asamblea abierta a las 08:00 AM en ${lugar} con vecinos y trabajadores afectados por "${tema}"`,
        `Conferencia de prensa y mesa jurídica a las 12:00 PM con sindicatos y especialistas para exhibir la ilegalidad de "${tema}"`,
        `Recorrido territorial a las 17:00 PM en colonias de ${muni} firmando el compromiso de cancelación definitiva de "${tema}"`
      ],
      promesaCompromiso: `Compromiso firmado ante la ciudadanía de ${lugar} para frenar jurídica y políticamente "${tema}" de ${rival}, protegiendo el patrimonio, el medio ambiente y el bolsillo familiar.`
    };

    const soundbites = [
      `"Pretender imponer '${tema}'${actor} en ${lugar} demuestra que ${rival} perdió el piso y gobierna de espaldas a la ciudadanía."`,
      `"Más del ${rechazoEstimado}% de la gente en ${lugar} rechaza '${tema}': es legalmente inviable, socialmente injusto y políticamente insostenible."`,
      `"Mientras las familias de ${muni} exigen agua, seguridad y empleo digno, ${rival} sale con la ocurrencia de '${tema}'."`,
      `"Con nuestro patrimonio, nuestros árboles, nuestra Constitución y el trabajo de la gente de ${lugar} no se juega: vamos a frenar '${tema}' con la ley en la mano."`,
      `"Que se escuche fuerte en ${lugar}: donde ${rival} ofrece imposición y conflicto sindical con '${tema}', nosotros ofrecemos soluciones legales y consenso ciudadano."`
    ];

    const guionDebate = {
      apertura: `Representante de ${rival}: su planteamiento de "${tema}"${actor} en ${lugar} ha encendido un ${rechazoEstimado}% de rechazo social y alerta roja sindical porque atenta directamente contra el interés público.`,
      demolicionTecnica: `El dictamen jurídico y presupuestal demuestra que "${tema}" viola marcos constitucionales y normativos vigentes, carece de respaldo técnico y detonará paros y amparos inmediatos en ${lugar}.`,
      contrasteEmocional: `Ustedes ven en "${tema}" un cálculo de cúpula; nosotros vemos la indignación legítima de las familias, estudiantes y trabajadores de ${lugar} que defienden su patrimonio y su futuro.`,
      cierreContundente: `A ese ${rechazoEstimado}% de ciudadanos que hoy rechazan "${tema}" de ${rival} les decimos: no están solos. Vamos a detener este atropello y a poner los recursos públicos al servicio real de ${muni}.`
    };

    const contrapropuestaGanadora = {
      titulo: `Blindaje Ciudadano, Legal y Sustentable frente a "${tema}" en ${lugar}`,
      resumen: `Abrogación inmediata de cualquier medida regresiva o destructiva contenida en "${tema}", sustituyéndola por un Plan Maestro de Preservación, Inversión Social y Concertación Sindical construido en consulta vinculante con los habitantes de ${lugar}.`,
      ventajaCompetitiva: `Capitaliza el ${rechazoEstimado}% de descontento ciudadano contra ${rival}, desactiva el paro sindical y posiciona a nuestra plataforma como garante de la ley y del interés colectivo.`
    };

    return {
      partidoRival: rival,
      municipio: muni,
      estado,
      temaCentralAnclado: tema,
      rechazoEstimado,
      aprobacionRival: 100 - rechazoEstimado,
      sectoresAgraviados,
      planCaptura,
      soundbites,
      guionDebate,
      contrapropuestaGanadora
    };
  }
}

module.exports = new DefenseAndAttackEngine();
