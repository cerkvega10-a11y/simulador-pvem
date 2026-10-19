// Motor de Blindaje y Defensa Estratégica (20 Preguntas Críticas)
// y Motor de Demolición de Contrincante (Modo Ataque / Ingeniería Inversa Electoral)

class DefenseAndAttackEngine {
  constructor() {
    this.name = 'Motor de Blindaje y Modo Ataque Político';
  }

  /**
   * Genera las 20 Preguntas Letales y Respuestas Maestras (Blindaje y Defensa)
   */
  generateDefenseMatrix(propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', votosFinales = {}, municipalResearch = {}, aiDefenseData = null) {
    const muni = municipio || 'Ecatepec de Morelos';
    const contra = votosFinales.porcentajeContra || 28;
    const favor = votosFinales.porcentajeFavor || 60;
    const neutro = votosFinales.porcentajeNeutro || 12;

    // Si contamos con las 20 preguntas generadas por IA (Groq / LLM) específicamente para esta propuesta
    if (aiDefenseData && Array.isArray(aiDefenseData.preguntas) && aiDefenseData.preguntas.length >= 10) {
      return {
        totalPreguntas: aiDefenseData.preguntas.length,
        bloques: [
          { nombre: 'Financiero y Presupuestal', rango: 'Preguntas 1 a 5' },
          { nombre: 'Impacto Social y Pobreza', rango: 'Preguntas 6 a 10' },
          { nombre: 'Conflicto Sindical y Gremial', rango: 'Preguntas 11 a 15' },
          { nombre: 'Técnico, Legal y de Ejecución', rango: 'Preguntas 16 a 20' }
        ],
        preguntas: aiDefenseData.preguntas.map((p, idx) => ({
          numero: p.numero || idx + 1,
          bloque: p.bloque || (idx < 5 ? 'Financiero y Presupuestal' : (idx < 10 ? 'Impacto Social y Pobreza' : (idx < 15 ? 'Conflicto Sindical y Gremial' : 'Técnico, Legal y de Ejecución'))),
          dardo: p.dardo || '',
          peligro: p.peligro || 'Peligro Crítico — Cuarto de Guerra',
          sectorAtacante: p.sectorAtacante || 'Comisión Especial / Medios',
          escudo: p.escudo || '',
          pivotePolitico: p.pivotePolitico || ''
        })),
        iaGenerada: true
      };
    }

    const preguntas = [
      // ==========================================
      // BLOQUE 1: FINANCIERO Y PRESUPUESTAL (1-5)
      // ==========================================
      {
        numero: 1,
        bloque: 'Financiero y Presupuestal',
        dardo: `¿De dónde saldrá el presupuesto para esta iniciativa sin endeudar al municipio de ${muni} ni recurrir a nuevos créditos bancarios que hipotequen las participaciones federales del Ramo 28?`,
        peligro: 'Peligro Crítico — Hacienda y Regidores Opositores',
        sectorAtacante: 'Comisión de Hacienda del Cabildo y Analistas Financieros',
        escudo: `El proyecto no requiere endeudamiento público ni deuda a largo plazo. Se financia reorientando partidas del Fondo de Aportaciones para la Infraestructura Social Municipal (FAISMUN / Ramo 33) y fondos federales etiquetados de SHCP ya auditados. Según datos oficiales de Transparencia Presupuestaria de la SHCP, ${muni} cuenta con techos financieros viables sin tocar el gasto corriente de nóminas.`,
        pivotePolitico: 'El verdadero costo para el municipio sería no actuar: la inacción frente a este problema cuesta anualmente millones de pesos a los hogares mexiquenses en pérdidas de tiempo y servicios caros.'
      },
      {
        numero: 2,
        bloque: 'Financiero y Presupuestal',
        dardo: `¿No es esto un elefante blanco que terminará costando el doble por costos ocultos de mantenimiento y obras complementarias no presupuestadas?`,
        peligro: 'Peligro Alto — Prensa de Investigación y Contraloría',
        sectorAtacante: 'Prensa Fiscalizadora Local',
        escudo: `El modelo contempla un contrato de obra pública a precio alzado con póliza de garantía de vicios ocultos y mantenimiento preventivo plurianual auditado. Siguiendo las directrices del Sistema Nacional Anticorrupción y la ASF, cada peso está calendarizado bajo partidas verificables públicas, eliminando sobrecostos o adendas discrecionales.`,
        pivotePolitico: 'Frente a las obras del pasado que se abandonaban a la mitad, aquí implementamos comités de contraloría social vecinal con vecinos y técnicos que certificarán cada avance.'
      },
      {
        numero: 3,
        bloque: 'Financiero y Presupuestal',
        dardo: `Con la inflación que reporta PROFECO en la canasta básica ($832.50 MXN), ¿cómo garantizan que esta medida no incremente el costo de vida o tarifas para las familias trabajadoras?`,
        peligro: 'Peligro Alto — Economía Familiar Popular',
        sectorAtacante: 'Asociaciones de Colonos y Consumidores',
        escudo: `Al contrario, el diseño del proyecto tiene un blindaje tarifario explícito. Datos de la ENIGH de INEGI muestran que las familias de ${muni} destinan más del 20% de sus ingresos al gasto diario de traslado y servicios. Al estabilizar la oferta y fijar subsidios directos garantizados por ley, la medida protege el poder adquisitivo familiar y frena la especulación.`,
        pivotePolitico: 'Nuestra prioridad es el bolsillo de la gente: si no cuidamos el gasto familiar, ningún proyecto tiene sentido social.'
      },
      {
        numero: 4,
        bloque: 'Financiero y Presupuestal',
        dardo: `Los empresarios y cámaras de comercio afirman que los recursos deberían usarse para exenciones fiscales y predial. ¿Por qué priorizar esto sobre incentivos fiscales?`,
        peligro: 'Peligro Medio-Alto — Sector Empresarial',
        sectorAtacante: 'Cámaras de Comercio y Contribuyentes A/B',
        escudo: `DataMéxico y el DENUE de INEGI demuestran que las economías municipales crecen cuando se dignifica el entorno barrial y la infraestructura pública. Invertir en infraestructura comunitaria eleva la plusvalía de los negocios locales y disminuye el costo logístico de los comercios en más de un 15%, lo cual es un incentivo real mucho más potente que un perdón fiscal transitorio.`,
        pivotePolitico: 'No es gasto asistencial, es inversión productiva que devuelve dinamismo comercial a las colonias que más lo necesitan.'
      },
      {
        numero: 5,
        bloque: 'Financiero y Presupuestal',
        dardo: `Si los recortes presupuestales federales obligan a un ajuste a mitad del ejercicio fiscal, ¿qué parte de la propuesta cancelarán primero?`,
        peligro: 'Peligro Alto — Oposición en Cabildo',
        sectorAtacante: 'Bancada Opositora',
        escudo: `La propuesta está modularizada en 3 fases de ejecución autónomas. La Fase 1 es autosuficiente y operativa desde el día 100 de gobierno, blindada con recursos locales y convenios multilaterales. Ninguna etapa inicial depende de subsidios flotantes o partidas extraordinarias no aseguradas en el Presupuesto de Egresos.`,
        pivotePolitico: 'Gobernar con seriedad implica tener plan de contingencia; aquí no venimos a improvisar maquetas de saliva.'
      },

      // ==========================================
      // BLOQUE 2: IMPACTO SOCIAL Y POBREZA (6-10)
      // ==========================================
      {
        numero: 6,
        bloque: 'Impacto Social y Pobreza',
        dardo: `El enjambre de simulación ciudadana registra un ${contra}% de ciudadanos que rechazan o desconfían de la iniciativa. ¿Por qué insistir si hay un tercio de la población inconforme?`,
        peligro: 'Peligro Crítico — Sondeo Social y Debate Abierto',
        sectorAtacante: 'Moderadores de Debate y Periodistas Políticos',
        escudo: `Un 60% de aprobación orgánica con ${contra}% de reserva crítica refleja una ciudadanía madura, informada y no complaciente. Los datos sociológicos de CONEVAL demuestran que en municipios como ${muni}, el escepticismo inicial se debe a décadas de promesas incumplidas. No ignoramos el ${contra}%; al contrario, sus dudas han sido incorporadas para mejorar la fase de implementación.`,
        pivotePolitico: 'En democracia real no hay unanimidades fingidas del 100%; escuchar el ${contra}% de rechazo es lo que hace que este proyecto sea robusto y a prueba de fallas.'
      },
      {
        numero: 7,
        bloque: 'Impacto Social y Pobreza',
        dardo: `CONEVAL reporta carencias graves de agua y salud en colonias populares de ${muni}. ¿No es un despropósito aplicar recursos aquí en lugar de atender la falta de agua en las pipas?`,
        peligro: 'Peligro Crítico — Colonias Populares en Rezago',
        sectorAtacante: 'Líderes Barriales y Colectivos Ciudadanos',
        escudo: `Esta propuesta está articulada como una palanca directa para mitigar las carencias sociales diagnosticadas por CONEVAL. Lejos de competir con el agua o la salud, el proyecto libera presión en la red de servicios y canaliza ahorros directos para que el municipio acelere el mantenimiento de pozos y centros ISEM de primer nivel.`,
        pivotePolitico: 'No le pedimos a la gente que elija entre comer o tener servicios dignos; este proyecto integra soluciones transversales.'
      },
      {
        numero: 8,
        bloque: 'Impacto Social y Pobreza',
        dardo: `¿Cómo van a evitar que esto desate procesos de gentrificación o desalojos indirectos de vecinos tradicionales que ya no podrán pagar rentas en la zona?`,
        peligro: 'Peligro Medio — Colectivos Urbanos y Jóvenes',
        sectorAtacante: 'Estudiantes, Académicos y Comités Vecinales',
        escudo: `Se incluye una cláusula de protección patrimonial barrial y congelamiento de cuotas catastrales para residentes originarios durante los primeros 4 años. Además, trabajamos con SEDATU e INFONAVIT para que los instrumentos de ordenamiento urbano prioricen la permanencia vecinal y el arraigo comunitario en ${muni}.`,
        pivotePolitico: 'El progreso no debe expulsar a quienes construyeron la colonia con sus manos; el desarrollo es con la gente, no sobre la gente.'
      },
      {
        numero: 9,
        bloque: 'Impacto Social y Pobreza',
        dardo: `Los adultos mayores manifiestan temor por la accesibilidad de la infraestructura. ¿Está diseñada pensando en personas con bastón o sillas de ruedas o solo en jóvenes activos?`,
        peligro: 'Peligro Alto — Adultos Mayores y Pensionados',
        sectorAtacante: 'Comités de Jubilados y Asociaciones de Discapacidad',
        escudo: `Cumple estrictamente con la Norma Oficial Mexicana de Accesibilidad Universal y los lineamientos del CONAPRED. Contempla rampas con pendiente máxima del 6%, señalización podotáctil, semáforos auditivos y accesos a nivel de piso sin torniquetes bloqueantes, garantizando gratuidad y trato digno a nuestros adultos mayores.`,
        pivotePolitico: 'Una ciudad que no es cómoda para un abuelo o una madre con carriola, no es una ciudad funcional para nadie.'
      },
      {
        numero: 10,
        bloque: 'Impacto Social y Pobreza',
        dardo: `En colonias con alta deserción escolar según la SEP, ¿qué beneficio tangible inmediato recibirán los jóvenes que ni estudian ni trabajan en ${muni}?`,
        peligro: 'Peligro Medio-Alto — Jóvenes en Riesgo de Exclusión',
        sectorAtacante: 'Organizaciones Civiles y Familias',
        escudo: `El proyecto crea una bolsa de empleo juvenil técnico con certificación formal vinculada a planteles de educación media superior de la SEP. Los jóvenes de colonias vulnerables tendrán acceso prioritario a contratos de operación y mantenimiento con sueldos superiores al tabulador de mercado y seguro social del IMSS.`,
        pivotePolitico: 'A los jóvenes se les responde con oportunidades y capacitación, no con estigmas ni policías.'
      },

      // ==========================================
      // BLOQUE 3: CONFLICTO SINDICAL Y GREMIAL (11-15)
      // ==========================================
      {
        numero: 11,
        bloque: 'Conflicto Sindical y Gremial',
        dardo: `Los sindicatos de transportistas y concesionarios amenazan con paralizar las avenidas primarias si se afecta su derrotero. ¿Cómo evitarán que tomen Periférico Norte o Vía Morelos?`,
        peligro: 'Peligro Crítico — Sindicatos de Transporte y Rutas Concesionadas',
        sectorAtacante: 'Alianzas de Transportistas del Estado de México',
        escudo: `No habrá cancelaciones unilaterales ni despojos. El modelo institucionalizado mediante el Centro Federal de Conciliación y Registro Laboral (CFCRL) establece la integración de los concesionarios actuales como socios cooperativistas con acciones preferentes y capacitación laboral. Quienes hoy manejan una combi tendrán certeza de ingresos sin tener que pelear el pasaje en la calle.`,
        pivotePolitico: 'No venimos a quitarle el trabajo a nadie; venimos a terminar con el modelo de explotación de la cuenta diaria que ahoga al chofer.'
      },
      {
        numero: 12,
        bloque: 'Conflicto Sindical y Gremial',
        dardo: `Los líderes de comerciantes y tianguistas dicen que esto es un intento encubierto de desalojarlos y cobrarles piso municipal. ¿Se les reubicará a la fuerza?`,
        peligro: 'Peligro Crítico — Uniones de Comerciantes y Tianguistas',
        sectorAtacante: 'Líderes de Tianguis y Mercados Públicos',
        escudo: `Queda firmado ante notario público: cero desalojos y respeto absoluto a los días y zonas tradicionales de tianguis registradas en el padrón municipal. Se habilitarán corredores comerciales ordenados con iluminación solar y contenedores de limpia gratuitos que aumentarán el flujo de clientes a sus puestos.`,
        pivotePolitico: 'El tianguis es el corazón económico del pueblo mexiquense; nuestro deber es protegerlo y darle dignidad, jamás perseguirlo.'
      },
      {
        numero: 13,
        bloque: 'Conflicto Sindical y Gremial',
        dardo: `El sindicato de trabajadores de gobierno (SUTEYM) teme que se privaticen o subcontraten áreas operativas del ayuntamiento. ¿Garantiza que no habrá despidos?`,
        peligro: 'Peligro Alto — Burocracia y Sindicato de Trabajadores SUTEYM',
        sectorAtacante: 'Sección Sindical SUTEYM / FSTSE',
        escudo: `Garantizamos el 100% de respeto a las condiciones generales de trabajo depositadas ante el Tribunal Federal de Conciliación y Arbitraje (TFCA). Ninguna plaza sindicalizada será sustituida por empresas privadas. La operación del proyecto se realizará fortaleciendo las capacidades de los trabajadores sindicalizados con equipo nuevo.`,
        pivotePolitico: 'El servicio público no es un negocio de amigos; los derechos laborales conquistados por los trabajadores del Estado son intocables.'
      },
      {
        numero: 14,
        bloque: 'Conflicto Sindical y Gremial',
        dardo: `Los sindicatos magisteriales del SMSEM y SNTE protestan por las afectaciones al tránsito que complicarán la llegada de alumnos y profesores a las aulas. ¿Qué plan de vialidad tienen?`,
        peligro: 'Peligro Medio — Magisterio y Padres de Familia',
        sectorAtacante: 'Secciones Magisteriales y Supervisores Escolares',
        escudo: `El plan de ejecución contempla obras nocturnas en tramos escolares y desvíos programados validados con los comités de padres de familia y el Formato 911 de la SEP. Los horarios de entrada y salida escolar de 7:00 a 8:30 y de 13:00 a 14:30 contarán con operativos viales dedicados para garantizar flujo continuo.`,
        pivotePolitico: 'La educación de nuestras niñas y niños es sagrada; las obras se adaptan a la escuela, nunca la escuela a las obras.'
      },
      {
        numero: 15,
        bloque: 'Conflicto Sindical y Gremial',
        dardo: `Los sindicatos de electricistas (SME/SUTERM) y de la construcción (CTM) exigen exclusividad en la contratación colectiva. ¿Habrá pleitos entre sindicatos por las obras?`,
        peligro: 'Peligro Alto — Disputas Intersindicales',
        sectorAtacante: 'Liderazgos Sindicales de Construcción y Energía',
        escudo: `Bajo la reforma laboral del CFCRL, la contratación se regirá por consulta democrática de los trabajadores y registro transparente de contratos colectivos legitimados, impidiendo contratos de protección o monopolios opacos. Se firmará una mesa de concertación tripartita con la STPS para asignar cuotas equilibradas a la mano de obra mexiquense.`,
        pivotePolitico: 'Cero privilegios corporativos bajo la mesa: trabajo para los obreros locales con sueldos transparentes y justos.'
      },

      // ==========================================
      // BLOQUE 4: TÉCNICO, LEGAL Y DE EJECUCIÓN (16-20)
      // ==========================================
      {
        numero: 16,
        bloque: 'Técnico, Legal y de Ejecución',
        dardo: `CONAGUA reporta sequía severa en el Cutzamala y acuíferos sobreexplotados. ¿Cómo sostendrán el consumo de agua del proyecto sin quitarle el agua a las colonias vecinas?`,
        peligro: 'Peligro Crítico — Crisis Hídrica CONAGUA / CAEM',
        sectorAtacante: 'Especialistas Hidráulicos y Comités de Agua',
        escudo: `El proyecto cuenta con diseño de huella hídrica neutra certificado por estándares CAEM. Incorpora sistemas propios de captación pluvial y plantas de tratamiento terciario para reutilizar el 100% de las aguas grises en riego y limpieza, sin extraer un solo litro adicional de la red de agua potable municipal ni de los pozos de tandeo.`,
        pivotePolitico: 'En plena crisis hídrica sería criminal gastar agua limpia; este proyecto devolverá agua al manto freático en vez de robársela a la gente.'
      },
      {
        numero: 17,
        bloque: 'Técnico, Legal y de Ejecución',
        dardo: `Con las cifras del SESNSP sobre asaltos en paraderos y extorsiones en ${muni}, ¿no se convertirá esta infraestructura en una trampa para delincuentes armados?`,
        peligro: 'Peligro Crítico — Seguridad Ciudadana y C5',
        sectorAtacante: 'Percepción de Inseguridad ENSU y Voces de Colonos',
        escudo: `El diseño incorpora prevención situacional del delito: iluminación perimetral LED con respaldo solar continuo, cámaras de reconocimiento facial enlazadas en tiempo real al C5 estatal y botones de alerta con tiempo de respuesta de la policía municipal menor a 4 minutos. Convertimos puntos ciegos oscuros en corredores seguros.`,
        pivotePolitico: 'El mejor antídoto contra la delincuencia no es el miedo ni quedarse encerrados: es iluminar y ocupar los espacios públicos con la comunidad.'
      },
      {
        numero: 18,
        bloque: 'Técnico, Legal y de Ejecución',
        dardo: `Los vecinos y colegios de abogados advierten que lloverán juicios de amparo por falta de Manifestación de Impacto Ambiental (MIA) y consultas previas. ¿Se detendrá la obra en tribunales?`,
        peligro: 'Peligro Alto — Litigio Estratégico y Amparos',
        sectorAtacante: 'Barras de Abogados y Colectivos Ambientalistas',
        escudo: `El expediente cuenta con Dictamen de Impacto Ambiental expedido por la Secretaría del Medio Ambiente del Edomex y apego a la Ley de Asentamientos Humanos y Ordenamiento Territorial. Además, se realizan asambleas de consulta pública previa informada en cada colonia beneficiaria, blindando jurídicamente cada metro de construcción.`,
        pivotePolitico: 'La ley se cumple a rajatabla; quien ampare el proyecto no estará defendiendo el ambiente, estará defendiendo intereses creados de unos cuantos.'
      },
      {
        numero: 19,
        bloque: 'Técnico, Legal y de Ejecución',
        dardo: `Históricamente en el Edomex las obras prometidas para 12 meses tardan 4 años en terminarse. ¿Qué penalizaciones asumirá el gobierno si no entregan a tiempo?`,
        peligro: 'Peligro Alto — Escepticismo Ciudadano por Plazos',
        sectorAtacante: 'Prensa Crítica y Cámaras Industriales',
        escudo: `Los contratos incorporan penalizaciones contractuales del 2% del monto total por cada semana de retraso imputable a los constructores, supervisados por testigos sociales ciudadanos independientes y transmisión en vivo por internet de los frentes de obra las 24 horas.`,
        pivotePolitico: 'El tiempo de los mexiquenses vale oro; la constructora que no cumpla el calendario se va y paga los daños a la comunidad.'
      },
      {
        numero: 20,
        bloque: 'Técnico, Legal y de Ejecución',
        dardo: `¿Cómo garantizan que cuando termine el trienio o el sexenio la siguiente administración municipal no deje abandonado el proyecto para borrar la huella del partido anterior?`,
        peligro: 'Peligro Alto — Continuidad Institucional y Trascendencia',
        sectorAtacante: 'Líderes de Opinión y Cronistas Municipales',
        escudo: `El proyecto se blinda institucionalmente elevándolo a Reglamento Municipal aprobado por el Cabildo y con un Fideicomiso Ciudadano de Mantenimiento con participación vecinal y del sector educativo, de modo que ningún cambio de color partidista en el gobierno pueda desaparecerlo ni desfinanciarlo.`,
        pivotePolitico: 'Las obras no son de un partido ni de un político con ego; son del pueblo mexiquense y nadie se las podrá arrebatar jamás.'
      }
    ];

    return {
      totalPreguntas: preguntas.length,
      bloques: [
        { nombre: 'Financiero y Presupuestal', rango: 'Preguntas 1 a 5' },
        { nombre: 'Impacto Social y Pobreza', rango: 'Preguntas 6 a 10' },
        { nombre: 'Conflicto Sindical y Gremial', rango: 'Preguntas 11 a 15' },
        { nombre: 'Técnico, Legal y de Ejecución', rango: 'Preguntas 16 a 20' }
      ],
      preguntas
    };
  }

  /**
   * Genera el Arsenal de Contraataque y Demolición de Contrincante (Modo Ataque / Oposición)
   */
  generateAttackDossier(propuestaRivalTexto = '', partidoRival = 'MORENA', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', municipalResearch = {}, aiAttackData = null) {
    const muni = municipio || 'Ecatepec de Morelos';
    const rival = partidoRival || 'MORENA';
    const txt = (propuestaRivalTexto || '').toLowerCase();

    // Si contamos con expediente de ataque generado por IA (Groq / LLM) específicamente para esta propuesta rival
    if (aiAttackData && Array.isArray(aiAttackData.soundbites) && aiAttackData.soundbites.length > 0 && aiAttackData.guionDebate) {
      return {
        partidoRival: rival,
        municipio: muni,
        estado,
        rechazoEstimado: typeof aiAttackData.rechazoEstimado === 'number' ? aiAttackData.rechazoEstimado : 72,
        aprobacionRival: typeof aiAttackData.aprobacionRival === 'number' ? aiAttackData.aprobacionRival : 28,
        sectoresAgraviados: aiAttackData.sectoresAgraviados || [],
        planCaptura: aiAttackData.planCaptura || { focoTerritorial: `Bastiones en ${muni}`, lugaresVisita: [], promesaCompromiso: '' },
        soundbites: aiAttackData.soundbites || [],
        guionDebate: aiAttackData.guionDebate || {},
        contrapropuestaGanadora: aiAttackData.contrapropuestaGanadora || {},
        iaGenerada: true
      };
    }

    // 1. Detección de Fisuras Temáticas de la Propuesta Rival
    let rechazoEstimado = 68;
    let sectorAgraviado1 = 'Transportistas y Choferes de Ruta';
    let sectorAgraviado2 = 'Comerciantes y Tianguistas Populares';
    let sectorAgraviado3 = 'Familias de Colonias con Desabasto de Agua';

    if (txt.includes('impuesto') || txt.includes('predial') || txt.includes('tenencia') || txt.includes('multa')) {
      rechazoEstimado = 76;
      sectorAgraviado1 = 'Clase Media Trabajadora y Automovilistas';
      sectorAgraviado2 = 'Comerciantes y Pequeños Negocios';
      sectorAgraviado3 = 'Obreros y Usuarios del Transporte';
    } else if (txt.includes('agua') || txt.includes('tarifa') || txt.includes('medidor') || txt.includes('corte')) {
      rechazoEstimado = 82;
      sectorAgraviado1 = 'Comités Vecinales de Agua y Amas de Casa';
      sectorAgraviado2 = 'Campesinos y Ejidatarios de Temporal';
      sectorAgraviado3 = 'Talleres y Negocios Familiares';
    } else if (txt.includes('cierre') || txt.includes('peatonal') || txt.includes('reubica') || txt.includes('retiro')) {
      rechazoEstimado = 74;
      sectorAgraviado1 = 'Uniones de Comerciantes y Tianguistas';
      sectorAgraviado2 = 'Rutas Concesionadas y Taxis';
      sectorAgraviado3 = 'Vecinos Colindantes sin Vías Alternas';
    }

    // 2. Plan Territorial de Captura de Voto Inconforme (Abrazar a los Afectados)
    const planCaptura = {
      focoTerritorial: `Despliegue inmediato en los bastiones y colonias más agraviadas de ${muni}`,
      lugaresVisita: [
        `Base de transportistas y paraderos neurálgicos de ${muni} a las 06:00 AM para dialogar con choferes`,
        `Mercados municipales y asambleas de tianguistas a las 11:00 AM con el pliego petitorio en mano`,
        `Comités vecinales de colonias populares afectadas a las 17:00 PM para firmar compromiso de defensa legal gratuita`
      ],
      promesaCompromiso: `Compromiso notariado de frenar el albazo de ${rival}, garantizar subsidio directo y blindar sus derechos laborales sin imposiciones de escritorio.`
    };

    // 3. 5 Soundbites Demoledores
    const soundbites = [
      `"La ocurrencia de ${rival} en ${muni} demuestra que gobiernan desde el aire acondicionado, sin saber lo que cuesta pagar un pasaje o ganarse el pan en el tianguis."`,
      `"Según datos de CONEVAL y la ENIGH de INEGI, las familias de ${muni} ya sufren para llenar la canasta básica; castigarlas con esta medida es insensible y criminal."`,
      `"Mientras ellos pretenden clausurar y sancionar a los trabajadores, nosotros proponemos tecnificar, ordenar y dar créditos a la palabra para que nadie pierda su sustento."`,
      `"En las cifras oficiales del SESNSP la delincuencia sigue azoteando a las colonias; ¿por qué ${rival} persigue al transportista y al comerciante en vez de atrapar a los extorsionadores?"`,
      `"Que quede claro: el municipio de ${muni} no es laboratorio de experimentos de ${rival}. El pueblo organizado frenará este atropello con la ley y en las urnas."`
    ];

    // 4. Guion para Debate y Redes Sociales
    const guionDebate = {
      apertura: `Candidato de ${rival}: su proyecto es una trampa financiera y un golpe directo al bolsillo de la gente de ${muni}. Usted no consultó al pueblo, vino a imponer.`,
      demolicionTecnica: `El estudio de viabilidad oficial demuestra que la propuesta de ${rival} deja fuera a más del 60% de los afectados, no tiene suficiencia presupuestal avalada por la SHCP y detonará amparos inmediatos que paralizarán el municipio.`,
      contrasteEmocional: `Usted ve números y contratos de amigos; nosotros vemos a las madres de familia que caminan en la oscuridad, a los choferes que pagan combustible caro y a los jóvenes sin oportunidades.`,
      cierreContundente: `Por eso, le decimos a los miles de vecinos que hoy se sienten traicionados por ${rival}: no están solos. Nosotros vamos a abrogar esta medida desde el primer día y a construir la verdadera solución comunitaria.`
    };

    // 5. Contrapropuesta Ganadora
    const contrapropuestaGanadora = {
      titulo: `Alternativa Comunitaria Sustentable e Incluyente para ${muni}`,
      resumen: `En lugar de multas, reubicaciones forzosas o cobros abusivos, la alternativa verde implementa un esquema de modernización progresiva 100% financiado por bonos ambientales del Estado, incorporando a los trabajadores como beneficiarios directos, con tarifa congelada y renovación de unidades sin deuda individual.`,
      ventajaCompetitiva: `Resuelve el problema de fondo sin polarizar, cuenta con el respaldo del 78% del enjambre ciudadano y neutraliza cualquier riesgo de huelga o paro gremial.`
    };

    return {
      partidoRival: rival,
      municipio: muni,
      estado,
      rechazoEstimado,
      aprobacionRival: 100 - rechazoEstimado,
      sectoresAgraviados: [
        { sector: sectorAgraviado1, nivelFriccion: '92% de Oposición', motivo: 'Amenaza directa a sus ingresos diarios y estabilidad laboral.' },
        { sector: sectorAgraviado2, nivelFriccion: '84% de Oposición', motivo: 'Perjuicio en ventas por cierres viales o imposición de cobros arbitrarios.' },
        { sector: sectorAgraviado3, nivelFriccion: '78% de Oposición', motivo: 'Desconexión con las carencias prioritarias de agua y seguridad en la colonia.' }
      ],
      planCaptura,
      soundbites,
      guionDebate,
      contrapropuestaGanadora
    };
  }
}

module.exports = new DefenseAndAttackEngine();
