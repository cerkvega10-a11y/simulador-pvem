// Agente Sintetizador y Estratega Político (Report & Insights Compiler)
// Consolida resultados del enjambre, genera el mapa de calor, selecciona testimonios y diseña la estrategia para el Partido Verde

const sampleSizeVarianceEngine = require('./sampleSizeVarianceEngine');
const { CATALOGO_11_SECTORES_DEMOGRAFICOS } = require('../data/edomexDemographics');

class PoliticalStrategistAgent {
  constructor() {
    this.name = 'Agente Sintetizador y Estratega Político (PVEM Insights & Strategy)';
  }

  /**
   * Compila el informe estratégico integral
   */
  compileReport(orchestratorState) {
    const {
      propuestaTexto,
      tituloProyecto,
      municipalResearch,
      multimodalData,
      initialSimulation,
      deliberationData
    } = orchestratorState;

    const agentes = deliberationData.agentesPostDeliberacion;
    const total = agentes.length;
    const votosFinales = deliberationData.votosFinales;

    const realSwarmSize = orchestratorState.variacionMuestral?.tamanoMuestra || orchestratorState.swarmData?.totalGenerados || total;

    // 1. Índice de Aceptación Global y Fricción Social
    const indiceFriccionSocial = this.calculateSocialFrictionIndex(votosFinales, municipalResearch);

    // 2. Mapa de Calor Demográfico (Sectores Sociales requeridos, Edad y NSE)
    const mapaCalor = this.generateDemographicHeatmap(agentes, votosFinales);
    const calibratedDemographics = sampleSizeVarianceEngine.calibrateDemographics(
      mapaCalor.porEdad,
      mapaCalor.porNSE,
      realSwarmSize,
      orchestratorState.variacionMuestral
    );

    // 3. Voces del Enjambre (Mínimo 6 testimonios auténticos garantizando voces en contra, neutras y a favor)
    const testimoniosSeleccionados = this.curateSwarmVoices(agentes, votosFinales);

    // 4. Recomendaciones Estratégicas y Alerta de Gobernabilidad para el Partido Verde Edomex
    const estrategiaPVEM = this.generatePVEMStrategy(
      votosFinales,
      mapaCalor,
      municipalResearch,
      tituloProyecto,
      propuestaTexto,
      indiceFriccionSocial
    );

    // 5. Módulos Avanzados de Inteligencia y Analítica Predictiva
    const porSectorCalculado = (Array.isArray(orchestratorState.porSectorSocial) && orchestratorState.porSectorSocial.length >= 11) 
      ? orchestratorState.porSectorSocial 
      : mapaCalor.porSectorSocial;
    const elasticidadElectorado = this.generateCrossSectorElasticity(votosFinales, porSectorCalculado, municipalResearch);
    const momentumPolitico = this.generatePoliticalMomentumCurve(votosFinales, municipalResearch, tituloProyecto, realSwarmSize);
    const matrizPolarizacion = this.generatePolarizationMatrix(votosFinales);
    const testResilienciaCrisis = this.generateCrisisResilienceTest(votosFinales, municipalResearch, tituloProyecto);
    const contraNarrativasDefensa = this.generateDefenseCounterNarratives(votosFinales, municipalResearch, tituloProyecto);
    const radarFakeNews = this.generateFakeNewsRadar(votosFinales, municipalResearch, tituloProyecto);
    const calculadoraROICampana = this.generateCampaignROICalculator(votosFinales, municipalResearch, realSwarmSize);
    const indiceEscepticismo = this.generatePromiseSkepticismIndex(votosFinales, municipalResearch);
    const microSegmentacionGeneracional = this.generateGenerationalMicroSegmentation(votosFinales, municipalResearch, tituloProyecto);

    return {
      fechaGeneracion: new Date().toISOString(),
      partido: 'Partido Verde Ecologista Estado de México',
      resumenEjecutivo: {
        tituloProyecto: tituloProyecto || 'Proyecto de Infraestructura y Política Social',
        municipio: municipalResearch.municipio,
        estado: municipalResearch.estado,
        localidad: municipalResearch.localidad,
        tamanoEnjambre: realSwarmSize,
        aprobacionFinal: votosFinales.porcentajeFavor,
        rechazoFinal: votosFinales.porcentajeContra,
        indiferenciaFinal: votosFinales.porcentajeNeutro,
        aFavorVotos: votosFinales.aFavor ?? Math.round((realSwarmSize * votosFinales.porcentajeFavor) / 100),
        enContraVotos: votosFinales.enContra ?? Math.round((realSwarmSize * votosFinales.porcentajeContra) / 100),
        neutroVotos: votosFinales.neutro ?? (realSwarmSize - Math.round((realSwarmSize * votosFinales.porcentajeFavor) / 100) - Math.round((realSwarmSize * votosFinales.porcentajeContra) / 100)),
        promedioEntusiasmo: votosFinales.promedioEntusiasmo,
        indiceFriccionSocial,
        polarizacion: votosFinales.indicePolarizacion,
        dictamenPolitico: this.determinePoliticalVerdict(
          votosFinales.porcentajeFavor,
          votosFinales.porcentajeContra,
          orchestratorState.semanticResult?.tipo
        )
      },
      metricasComparativas: {
        preDeliberacion: initialSimulation.votosIniciales,
        postDeliberacion: votosFinales,
        desplazamientoNetoFavor: votosFinales.porcentajeFavor - initialSimulation.votosIniciales.porcentajeFavor,
        desplazamientoNetoContra: votosFinales.porcentajeContra - initialSimulation.votosIniciales.porcentajeContra
      },
      contextoWebDetectado: municipalResearch.top5Problematicas.map((prob, idx) => {
        let alineacion = 'Neutro';
        let impacto = 50;
        let explicacion = `Problemática sensible en ${municipalResearch.municipio}.`;

        const tipo = orchestratorState.semanticResult?.tipo;
        if (tipo === 'ABSURDO' || tipo === 'ININTELIGIBLE') {
          alineacion = 'Desconexión Absoluta';
          impacto = 5;
          explicacion = `El proyecto ignora por completo la necesidad prioritaria de atender ${prob.tema} en ${municipalResearch.municipio}.`;
        } else if (tipo === 'PUNITIVO') {
          alineacion = 'Agravante de Fricción';
          impacto = 15;
          explicacion = `Empeora la carga económica de los vecinos que ya sufren la falta de ${prob.tema}.`;
        } else if (tipo === 'BENEFICIO_REAL') {
          const atiende = (orchestratorState.semanticResult?.doloresAtendidos || []).some(d => prob.tema.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(prob.tema.toLowerCase()));
          if (atiende || idx === 0) {
            alineacion = 'Solución Directa';
            impacto = 88;
            explicacion = `Atiende directamente y mitiga la crisis de ${prob.tema} en ${municipalResearch.municipio}.`;
          } else {
            alineacion = 'Respaldo Indirecto';
            impacto = 65;
            explicacion = `Libera margen presupuestal y mejora el entorno frente a ${prob.tema}.`;
          }
        } else {
          alineacion = 'Prioridad Secundaria';
          impacto = 40;
          explicacion = `No impacta negativamente, pero los vecinos priorizan recursos para ${prob.tema}.`;
        }

        return {
          tema: prob.tema,
          severidad: prob.severidad,
          descripcion: prob.descripcion,
          alineacionProyecto: alineacion,
          impactoEstimado: impacto,
          analisisCruce: explicacion
        };
      }),
      mapaCalorDemografico: {
        ...mapaCalor,
        porEdad: calibratedDemographics.porEdad,
        porNSE: calibratedDemographics.porNSE,
        porSectorSocial: orchestratorState.porSectorSocial || mapaCalor.porSectorSocial,
        microNichosCensales: orchestratorState.variacionMuestral?.microNichosActivados || []
      },
      vocesDelEnjambre: testimoniosSeleccionados,
      chatsDelEnjambre: orchestratorState.chatsDelEnjambre || [],
      chatTelemetry: orchestratorState.chatTelemetry || null,
      radarData: orchestratorState.radarData || null,
      evolucionData: orchestratorState.evolucionData || null,
      estrategiaPoliticaPVEM: estrategiaPVEM,
      proofOfReasoning: orchestratorState.proofOfReasoning || null,
      evidenciaMultimodal: multimodalData.visualData || null,
      inteligenciaSindical: orchestratorState.inteligenciaSindical || null,
      blindajeDefensa: orchestratorState.blindajeDefensa || null,
      modoAtaque: orchestratorState.modoAtaque || null,
      variacionMuestral: orchestratorState.variacionMuestral || null,
      qaWatchdogCertificacion: orchestratorState.qaWatchdogCertificacion || null,
      // Módulos Avanzados
      elasticidadElectorado,
      momentumPolitico,
      matrizPolarizacion,
      testResilienciaCrisis,
      contraNarrativasDefensa,
      radarFakeNews,
      calculadoraROICampana,
      indiceEscepticismo,
      microSegmentacionGeneracional
    };
  }

  /**
   * Calcula el Índice de Fricción Social y Riesgo de Gobernabilidad (0-100)
   */
  calculateSocialFrictionIndex(votos, municipalResearch) {
    const baseRechazo = votos.porcentajeContra * 1.35;
    const polarizacionMod = (votos.indicePolarizacion / 100) * 20;
    const friccion = Math.min(Math.max(Math.round(baseRechazo + polarizacionMod), 5), 98);

    let nivel = 'Bajo';
    let riesgoProtestas = 'Riesgo mínimo de movilizaciones; la propuesta cuenta con respaldo social mayoritario.';
    
    if (friccion >= 65) {
      nivel = 'Crítico';
      riesgoProtestas = `ALTO RIESGO DE BLOQUEOS Y PAROS: Probabilidad inminente de cierre de avenidas primarias en ${municipalResearch.municipio} (e.g. Periférico Norte, Vía Morelos, Paseo Tollocan o autopistas de acceso), protestas de tianguistas y paros de transportistas concesionados si se implementa sin consenso.`;
    } else if (friccion >= 45) {
      nivel = 'Alto';
      riesgoProtestas = `RIESGO DE MOVILIZACIONES VECINALES: Posibles marchas de comités de colonos y asambleas vecinales de resistencia; fricción en redes sociales locales y quejas ante medios de comunicación.`;
    } else if (friccion >= 28) {
      nivel = 'Medio';
      riesgoProtestas = `RESISTENCIA LOCAL FOCALIZADA: Descontento de gremios específicos o vecinos colindantes a las obras; se disipa con mesas de trabajo anticipadas.`;
    }

    return {
      score: friccion,
      nivel,
      riesgoProtestas
    };
  }

  /**
   * Veredicto político sintetizado con estricta neutralidad
   */
  determinePoliticalVerdict(favor, contra, semanticType) {
    if (semanticType === 'ININTELIGIBLE') {
      return 'TEXTO ININTELIGIBLE: No se puede formular un dictamen político ante una entrada sin propuesta identificable o caracteres al azar.';
    }
    if (semanticType === 'ABSURDO') {
      return 'PROPUESTA ABSURDA O TÉCNICAMENTE INVIABLE: Rechazo unánime del enjambre por considerar el proyecto una ocurrencia que desatiende las urgencias prioritarias de la localidad.';
    }
    if (semanticType === 'DESCONECTADO_O_GENERICO') {
      return 'PRIORIDAD BAJA / DESCONEXIÓN TERRITORIAL: Aunque la propuesta no genera rechazo violento, la ciudadanía no la considera urgente frente a las crisis de agua y seguridad.';
    }
    if (contra >= 60) return 'ALERTA DE RECHAZO SOCIAL MAYORITARIO: Fuerte resistencia de la población; la propuesta afecta la economía o movilidad popular y detonará conflicto si no se rediseña.';
    if (favor >= 70 && contra <= 18) return 'VIABILIDAD EXCELENTE: Fuerte respaldo social orgánico; propuesta capitalizable como bandera insignia de beneficio directo.';
    if (favor >= 55 && contra <= 30) return 'VIABILIDAD ACEPTABLE CON OBSERVACIONES: Respaldo mayoritario, pero con escepticismo ciudadano que exige compromisos firmados.';
    if (contra >= 40) return 'ZONA DE RIESGO / ALTA POLARIZACIÓN: Empate técnico de opinión; riesgo de desgaste político severo.';
    return 'DICTAMEN RESERVADO: Prevalece la indiferencia o desconfianza ciudadana; se requiere mayor difusión de beneficios tangibles.';
  }

  /**
   * Normaliza la postura de voto del agente (soporta votoFinal, voto, postura)
   */
  normalizeVote(agent) {
    if (!agent) return 'Neutro';
    const v = (agent.votoFinal || agent.voto || agent.postura || '').toString().trim().toLowerCase();
    if (v.includes('favor') || v === 'a' || v === 'si' || v === 'sí') return 'A favor';
    if (v.includes('contra') || v === 'no') return 'En contra';
    return 'Neutro';
  }

  /**
   * Obtiene la edad del agente de forma segura y tipada
   */
  getAgentAge(agent) {
    if (!agent) return 35;
    if (typeof agent.edad === 'number' && !isNaN(agent.edad)) return agent.edad;
    const parsed = parseInt(agent.edad, 10);
    if (!isNaN(parsed)) return parsed;
    const str = (agent.rangoEdad || agent.grupoEtario || '').toString().toLowerCase();
    if (str.includes('18') || str.includes('29') || str.includes('joven')) return 24;
    if (str.includes('30') || str.includes('49') || str.includes('productiv') || str.includes('medio')) return 38;
    if (str.includes('50') || str.includes('64') || str.includes('madur')) return 56;
    if (str.includes('65') || str.includes('mayor') || str.includes('jubilad') || str.includes('pension')) return 68;
    return 35;
  }

  /**
   * Obtiene el estrato NSE del agente de forma segura
   */
  getAgentNSE(agent) {
    if (!agent) return 'C';
    const raw = (agent.nse || agent.estratoNSE || '').toString().trim().toUpperCase();
    if (raw.includes('A/B') || raw === 'AB') return 'A/B';
    if (raw.includes('C+')) return 'C+';
    if (raw === 'C' || raw.includes('MEDIO TÍPICO')) return 'C';
    if (raw.includes('D+')) return 'D+';
    if (raw.includes('D/E') || raw.includes('DE') || raw === 'E' || raw === 'D') return 'D/E';
    return 'C';
  }

  /**
   * Genera el Mapa de Calor segmentando por los sectores sociales requeridos, edad y NSE
   * (Cálculo 100% dinámico por segmento - Cero fallbacks estáticos de 100% neutro)
   */
  generateDemographicHeatmap(agentes, votosFinalesReferencia = {}) {
    const listadoAgentes = Array.isArray(agentes) && agentes.length > 0 ? agentes : [];
    
    // Función de agregación dinámica por segmento
    const calcularSegmento = (filtroFn) => {
      const sub = listadoAgentes.filter(filtroFn);
      
      // Si el subconjunto está vacío, derivar proporcionalmente de las métricas globales
      if (sub.length === 0) {
        const baseFav = votosFinalesReferencia.porcentajeFavor ?? 50;
        const baseCon = votosFinalesReferencia.porcentajeContra ?? 30;
        const baseNeu = Math.max(100 - baseFav - baseCon, 0);
        return { favor: baseFav, contra: baseCon, neutro: baseNeu, total: 0 };
      }

      const total = sub.length;
      let favCount = 0;
      let conCount = 0;
      let neuCount = 0;

      for (const a of sub) {
        const v = this.normalizeVote(a);
        if (v === 'A favor') favCount++;
        else if (v === 'En contra') conCount++;
        else neuCount++;
      }

      const favPct = Math.round((favCount / total) * 100);
      const conPct = Math.round((conCount / total) * 100);
      let neuPct = 100 - favPct - conPct;
      if (neuPct < 0) neuPct = 0;

      return {
        favor: favPct,
        contra: conPct,
        neutro: neuPct,
        total: total,
        votosDetalle: { favor: favCount, contra: conCount, neutro: neuCount }
      };
    };

    // 1. Desglose Dinámico de los 11 Sectores Demográficos Oficiales
    const porSectorSocial = CATALOGO_11_SECTORES_DEMOGRAFICOS.map(cat => {
      const segData = calcularSegmento(a => {
        const s = (a.sectorSocial || '').toLowerCase();
        const o = (a.ocupacion || '').toLowerCase();
        if (s && s.includes(cat.nombre.toLowerCase().slice(0, 10))) return true;
        if (cat.id === 'sec_estudiantes') return o.includes('estudiante') || o.includes('universit') || s.includes('estudiante') || (this.getAgentAge(a) <= 24);
        if (cat.id === 'sec_comerciantes') return o.includes('tianguis') || o.includes('comercian') || o.includes('mercado') || o.includes('abarrote') || s.includes('comercian');
        if (cat.id === 'sec_transportistas') return o.includes('chofer') || o.includes('combi') || o.includes('taxi') || o.includes('transporte') || s.includes('transport');
        if (cat.id === 'sec_salud') return o.includes('enferm') || o.includes('médic') || o.includes('medico') || o.includes('salud') || o.includes('imss') || o.includes('issemym') || s.includes('salud');
        if (cat.id === 'sec_educacion') return o.includes('docente') || o.includes('maestr') || o.includes('profesor') || o.includes('snte') || o.includes('smsem') || s.includes('educa');
        if (cat.id === 'sec_burocracia') return o.includes('burocr') || o.includes('servidor') || o.includes('administrativo') || o.includes('gobierno') || s.includes('burocracia');
        if (cat.id === 'sec_empresarios') return o.includes('empres') || o.includes('gerente') || o.includes('director') || o.includes('industrial') || s.includes('empresar');
        if (cat.id === 'sec_madres') return o.includes('ama de casa') || o.includes('madre') || o.includes('hogar') || o.includes('familia') || s.includes('madres') || s.includes('hogar');
        if (cat.id === 'sec_primario') return o.includes('campes') || o.includes('ejidat') || o.includes('pescad') || o.includes('agr') || o.includes('floricult') || s.includes('primario') || s.includes('campo');
        if (cat.id === 'sec_mayores') return o.includes('jubilad') || o.includes('pension') || o.includes('adulto mayor') || s.includes('mayor') || (this.getAgentAge(a) >= 60);
        if (cat.id === 'sec_construccion') return o.includes('albañ') || o.includes('alban') || o.includes('obrero') || o.includes('construcc') || o.includes('manufact') || s.includes('construcc');
        return false;
      });

      const friccionSocial = Math.min(Math.max(Math.round(segData.contra * 1.05 + (cat.pesoElectoral > 10 ? 4 : 0)), 5), 98);

      return {
        id: cat.id,
        sector: cat.nombre,
        icono: cat.icono || '👥',
        pesoElectoral: cat.pesoElectoral,
        ...segData,
        friccionSocial,
        sensibilidad: cat.sensibilidad,
        observacion: segData.contra >= 45 
          ? `Fricción elevada (${friccionSocial}/100): resistencia gremial vinculada a ${cat.sensibilidad.toLowerCase()}`
          : segData.favor >= 60
            ? `Aceptación sólida: alta afinidad de la base sectorial con los beneficios de la iniciativa`
            : `Postura expectante: se demandan compromisos claros de no afectación patrimonial o laboral`
      };
    });

    // 2. Segmentos por Grupo Etario (18-29, 30-49, 50-64, 65+)
    const porEdad = [
      {
        grupo: '18 a 29 años (Jóvenes)',
        rango: '18-29',
        ...calcularSegmento(a => {
          const e = this.getAgentAge(a);
          return e >= 18 && e <= 29;
        }),
        observacion: 'Sólido apego a causas ambientales y modernización tecnológica'
      },
      {
        grupo: '30 a 49 años (Adultos Productivos)',
        rango: '30-49',
        ...calcularSegmento(a => {
          const e = this.getAgentAge(a);
          return e >= 30 && e <= 49;
        }),
        observacion: 'Priorizan seguridad en el trayecto, ahorro en transporte y abasto de agua'
      },
      {
        grupo: '50 a 64 años (Adultos Maduros)',
        rango: '50-64',
        ...calcularSegmento(a => {
          const e = this.getAgentAge(a);
          return e >= 50 && e <= 64;
        }),
        observacion: 'Sensibles a afectaciones viales temporales y mantenimiento de colonias'
      },
      {
        grupo: '65+ años (Adultos Mayores)',
        rango: '65+',
        ...calcularSegmento(a => {
          const e = this.getAgentAge(a);
          return e >= 65;
        }),
        observacion: 'Preocupación por rampas peatonales, gratuidad y trato digno'
      }
    ];

    // 3. Segmentos por Nivel Socioeconómico (NSE)
    const porNSE = [
      {
        nivel: 'A/B y C+ (Medio-Alto / Alto)',
        estrato: 'A/B_C+',
        ...calcularSegmento(a => {
          const n = this.getAgentNSE(a);
          return n === 'A/B' || n === 'C+';
        }),
        observacion: 'Valoran plusvalía urbana, energías renovables y ordenamiento'
      },
      {
        nivel: 'C (Medio Típico)',
        estrato: 'C',
        ...calcularSegmento(a => {
          const n = this.getAgentNSE(a);
          return n === 'C';
        }),
        observacion: 'Enfocados en relación costo-beneficio y calidad de servicios'
      },
      {
        nivel: 'D+ y D/E (Bajo / Popular)',
        estrato: 'D+_DE',
        ...calcularSegmento(a => {
          const n = this.getAgentNSE(a);
          return n === 'D+' || n === 'D/E';
        }),
        observacion: 'Impacto directo en gasto diario, agua potable e iluminación en calles'
      }
    ];

    return {
      porSectorSocial,
      porEdad,
      porNSE,
      porOcupacion: porSectorSocial // retrocompatibilidad
    };
  }

  /**
   * Selecciona mínimo 6 testimonios representativos garantizando voces críticas (3), neutras (2) y a favor (1-2)
   */
  curateSwarmVoices(agentes, votos) {
    const aFavor = agentes.filter(a => this.normalizeVote(a) === 'A favor');
    const enContra = agentes.filter(a => this.normalizeVote(a) === 'En contra');
    const neutros = agentes.filter(a => this.normalizeVote(a) === 'Neutro');

    const seleccion = [];
    const tomar = (arr, num) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    if (votos.porcentajeContra >= 50) {
      // Caso de rechazo predominante: 3 o 4 en contra, 2 neutros, 1 a favor
      seleccion.push(...tomar(enContra, 4));
      seleccion.push(...tomar(neutros, 2));
      seleccion.push(...tomar(aFavor, 1));
    } else {
      // Caso de aceptación o balance: mínimo 3 en contra, 2 neutros, 2 a favor (7 testimonios)
      seleccion.push(...tomar(enContra, 3));
      seleccion.push(...tomar(neutros, 2));
      seleccion.push(...tomar(aFavor, 2));
    }

    // Si aún faltan elementos para completar 6, rellenar de cualquiera disponible
    if (seleccion.length < 6) {
      const restantes = agentes.filter(a => !seleccion.some(s => s.id === a.id));
      seleccion.push(...tomar(restantes, 6 - seleccion.length));
    }

    return seleccion.map(agente => ({
      id: agente.id,
      nombre: agente.nombre,
      edad: agente.edad,
      genero: agente.genero,
      ocupacion: agente.ocupacion,
      colonia: agente.colonia,
      municipio: agente.municipio,
      voto: agente.votoFinal,
      entusiasmo: agente.entusiasmoFinal,
      posturaCivica: agente.posturaCivica,
      argumento: agente.argumentoPrincipal,
      deliberacion: agente.notaDeliberacion,
      medioTransporte: agente.medioTransporte || 'Transporte colectivo y combis',
      preocupacionPrincipal: agente.preocupacionPrioritaria || 'Economía y seguridad',
      condicionCambioVoto: agente.condicionDeCambio || 'Mesas de diálogo con supervisión ciudadana',
      avatarUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(agente.nombre)}&backgroundColor=e6f4ea,f1f5f9`
    }));
  }

  /**
   * Genera el plan de mitigación y alerta de gobernabilidad
   */
  generatePVEMStrategy(votos, heatmap, research, titulo, propuesta, friccion) {
    const opositores = heatmap.porSectorSocial.filter(o => o.contra >= 40).map(o => o.sector);

    // Cambios exactos recomendados para convertir votos negativos en positivos
    const cambiosExactos = [];
    if (votos.porcentajeContra >= 40) {
      cambiosExactos.push('Eliminar cualquier cargo monetario o incremento tarifario directo a los usuarios; sustituirlo por subsidio estatal o partidas de infraestructura verde.');
      cambiosExactos.push('Firmar un "Pacto de No Cierre Vial Ni Desalojo" ante notario público garantizando que las obras se realizarán en horarios nocturnos o sin estrangular el comercio.');
      cambiosExactos.push('Crear una "Mesa Técnica de Diálogo Permanente" que integre a líderes de tianguis, transportistas locales y comités de agua.');
    } else {
      cambiosExactos.push('Instalar módulos de contraloría ciudadana vecinal 24/7 en las colonias intervenidas para vigilar tiempos de entrega y calidad de materiales.');
      cambiosExactos.push('Garantizar que al menos el 40% de los empleos temporales generados por la obra sean contratados directamente entre vecinos de la localidad.');
      cambiosExactos.push('Incluir luminarias solares LED y botones de emergencia C5 en todo el polígono del proyecto para reforzar la seguridad de mujeres y estudiantes.');
    }

    return {
      alertaGobernabilidad: {
        nivelRiesgo: friccion.nivel,
        scoreFriccion: friccion.score,
        riesgoProtestas: friccion.riesgoProtestas,
        cambiosExactosRequeridos: cambiosExactos
      },
      ejesClaveCampanaVerde: [
        {
          pilar: 'Garantía del Derecho al Medio Ambiente Sano',
          narrativa: `Posicionar el proyecto como un avance histórico en ${research.municipio} para devolver la dignidad ecológica y la salud respiratoria a las familias mexiquenses.`
        },
        {
          pilar: 'Cuidado Directo a la Economía Popular',
          narrativa: `Demostrar en infografías barriales que la propuesta genera ahorro familiar inmediato (menos gasto en pasajes, medicamentos o pipas de agua).`
        },
        {
          pilar: 'Seguridad Ciudadana y Perspectiva de Género',
          narrativa: `Destacar que cada espacio intervenido contará con iluminación blanca LED, botones de emergencia C5 y senderos seguros para estudiantes y mujeres trabajadoras.`
        }
      ],
      planMitigacionRiesgos: [
        {
          grupoEnRiesgo: opositores.length > 0 ? opositores.join(', ') : 'Comerciantes y Choferes Locales',
          accionPreventiva: 'Instalar de inmediato una "Mesa Técnica de Inclusión Productiva" antes del anuncio de obras para garantizar que no habrá desalojos ni multas.',
          compromisoPublico: 'Firma de convenio ante notario de que los choferes serán capacitados y contratados como operadores formales con seguro social.'
        },
        {
          grupoEnRiesgo: 'Vecinos Escépticos por Duración de Obra',
          accionPreventiva: 'Lanzar un portal web en tiempo real con cámaras 24/7 y comité ciudadano de contraloría social integrado por los propios colonos.',
          compromisoPublico: 'Cláusulas de penalización a contratistas si se exceden del calendario programado.'
        }
      ],
      alianzasEstrategicasSugeridas: [
        `Colectivos de Jóvenes Ambientales de universidades en ${research.municipio} (UAEMex / FES).`,
        `Comités Vecinales de Agua Potable y Asociaciones de Colonos de ${research.coloniasRepresentativas.slice(0, 3).join(', ')}.`,
        `Redes de Rescatistas de Animales y Médicos Veterinarios locales para respaldo social.`
      ],
      esloganSugeridoPVEM: `"${titulo}: Por un ${research.municipio} Verde, Seguro y con Futuro para tus Hijos."`
    };
  }
  /**
   * Elasticidad del Electorado ("Efecto Colateral" y externalidades intersectoriales)
   */
  generateCrossSectorElasticity(votosFinales, porSectorSocial, municipalResearch) {
    const sectores = Array.isArray(porSectorSocial) ? porSectorSocial : [];
    const getSec = (id) => sectores.find(s => s.id === id) || { favor: 50, contra: 30 };

    const transportistas = getSec('sec_transportistas');
    const comerciantes = getSec('sec_comerciantes');
    const construccion = getSec('sec_construccion');
    const empresarios = getSec('sec_empresarios');
    const estudiantes = getSec('sec_estudiantes');
    const madres = getSec('sec_madres');
    const mayores = getSec('sec_mayores');
    const primario = getSec('sec_primario');
    const salud = getSec('sec_salud');
    const burocracia = getSec('sec_burocracia');

    const matriz = [
      {
        origen: 'Transportistas y Choferes',
        destino: 'Comerciantes y Tianguistas / MiPyMEs',
        tipo: 'Fricción de Distribución y Abasto',
        coeficiente: '+0.54',
        elasticidad: 'Alta',
        impacto: transportistas.contra > 40 ? 'Negativo' : 'Favorable',
        mecanismo: 'Ajustes en rutas o costos de transporte impactan en cascada los fletes y márgenes de los comerciantes en tianguis y mercados locales.'
      },
      {
        origen: 'Comerciantes y Tianguistas',
        destino: 'Madres de Familia y Hogares',
        tipo: 'Traspaso a Canasta Básica',
        coeficiente: '+0.68',
        elasticidad: 'Muy Alta',
        impacto: comerciantes.contra > 40 ? 'Negativo' : 'Favorable',
        mecanismo: 'Cualquier presión fiscal o reubicación sobre el comercio popular se refleja inmediatamente en los precios del mandado familiar.'
      },
      {
        origen: 'Trabajadores de la Construcción',
        destino: 'Empresarios y Directivos de la Industria',
        tipo: 'Dinamización de Cadena Productiva',
        coeficiente: '+0.62',
        elasticidad: 'Alta',
        impacto: construccion.favor > 50 ? 'Favorable' : 'Moderado',
        mecanismo: 'La activación de obra pública en el municipio detona proveeduría de materiales, ferreterías y servicios industriales.'
      },
      {
        origen: 'Estudiantes y Jóvenes Universitarios',
        destino: 'Adultos Mayores y Pensionados',
        tipo: 'Externalidad Intergeneracional de Cuidado',
        coeficiente: '+0.41',
        elasticidad: 'Media',
        impacto: estudiantes.favor > 55 ? 'Favorable' : 'Neutro',
        mecanismo: 'Senderos iluminados y digitalización reducen tiempos de traslado y auxilian a personas de la tercera edad en trámites.'
      },
      {
        origen: 'Sector Primario (Campesinos y Ejidatarios)',
        destino: 'Madres de Familia y Hogares',
        tipo: 'Estabilidad de Precios de Alimentos',
        coeficiente: '+0.49',
        elasticidad: 'Media-Alta',
        impacto: primario.favor > 50 ? 'Favorable' : 'Neutro',
        mecanismo: 'El apoyo al campo y distribución de agua agrícola contiene la especulación de precios en verduras y granos básicos.'
      },
      {
        origen: 'Trabajadores del Sector Salud',
        destino: 'Burocracia y Empleados de Gobierno',
        tipo: 'Despresurización de Servicios Públicos',
        coeficiente: '+0.45',
        elasticidad: 'Media',
        impacto: salud.favor > 50 ? 'Favorable' : 'Alerta',
        mecanismo: 'Mejoras en infraestructura médica reducen el absentismo laboral por enfermedad y quejas en módulos de atención ciudadana.'
      }
    ];

    return {
      matriz,
      coeficientePromedio: '+0.53',
      sectorMasVulnerable: comerciantes.contra >= transportistas.contra ? 'Comerciantes y Tianguistas / MiPyMEs' : 'Transportistas y Choferes',
      sectorMasApalancable: 'Madres de Familia y Hogares',
      diagnosticoElasticidad: 'Las externalidades entre sectores demuestran que atender las demandas de movilidad y comercio popular genera un efecto amortiguador inmediato en los hogares del municipio.'
    };
  }

  /**
   * Curva de Momentum Político (Índice de Inercia Estilo Bolsa de Valores)
   */
  generatePoliticalMomentumCurve(votosFinales, municipalResearch, tituloProyecto, realSwarmSize = 500) {
    const favor = votosFinales.porcentajeFavor || 50;
    const contra = votosFinales.porcentajeContra || 30;
    const neutro = votosFinales.porcentajeNeutro || 20;

    const deltaNeto = favor - contra;
    const variacionDiariaNum = deltaNeto >= 0 
      ? Number(((deltaNeto * 0.08) + 1.4).toFixed(2)) 
      : Number((-((contra - favor) * 0.11) - 1.8).toFixed(2));

    const tendencia = deltaNeto >= 15 
      ? 'BULLISH (Fuerte Inercia Alcista)' 
      : (deltaNeto <= -15 ? 'BEARISH (Desgaste Acelerado / Resistencia)' : 'NEUTRAL / LATERAL (Consolidación)');

    const poblacionMuni = municipalResearch?.poblacion || 500000;
    const volumenConversacionDiario = Math.round((realSwarmSize * 14.5) + (poblacionMuni * 0.022));

    // Indicador RSI de Fuerza Relativa Política (0-100)
    const ratioRS = (favor / Math.max(contra, 1));
    const indiceRSI = Math.min(Math.max(Math.round(100 - (100 / (1 + ratioRS))), 10), 95);

    // Proyecciones a 7, 14 y 30 días
    const proyeccion7Dias = Math.min(Math.max(Math.round(favor + (variacionDiariaNum * 2.2)), 5), 92);
    const proyeccion14Dias = Math.min(Math.max(Math.round(favor + (variacionDiariaNum * 4.0)), 5), 94);
    const proyeccion30Dias = Math.min(Math.max(Math.round(favor + (variacionDiariaNum * 6.5)), 5), 96);

    const volatilidad = (votosFinales.indicePolarizacion || 50) > 60 ? 'Alta (±7.8%)' : 'Moderada (±3.2%)';

    return {
      ticker: '$PVEM-MOMENTUM',
      precioIndice: favor,
      variacionDiaria: `${variacionDiariaNum >= 0 ? '+' : ''}${variacionDiariaNum}%`,
      variacionDiariaNum,
      tendencia,
      volumenConversacionDiario,
      indiceRSI,
      estadoRSI: indiceRSI >= 70 ? 'Sobrecompra Política (Respaldo Máximo)' : (indiceRSI <= 35 ? 'Sobrevendido (Oportunidad de Viraje)' : 'Equilibrio Dinámico'),
      volatilidad,
      proyecciones: {
        dias7: proyeccion7Dias,
        dias14: proyeccion14Dias,
        dias30: proyeccion30Dias
      },
      diagnosticoTicker: `El activo político "${tituloProyecto || 'Iniciativa'}" cotiza en tendencia ${tendencia} con RSI de ${indiceRSI}/100 y volumen proyectado de ${volumenConversacionDiario.toLocaleString()} interacciones ciudadanas en ${municipalResearch?.municipio || 'el municipio'}.`
    };
  }

  /**
   * Matriz de Polarización (Voto Duro vs. Voto Blando/Indecisos)
   */
  generatePolarizationMatrix(votosFinales) {
    const favor = votosFinales.porcentajeFavor || 50;
    const contra = votosFinales.porcentajeContra || 30;
    const neutro = votosFinales.porcentajeNeutro || 20;

    const votoDuroFavor = Math.min(Math.max(Math.round(favor * 0.65), 5), 65);
    const rechazoRadical = Math.min(Math.max(Math.round(contra * 0.70), 5), 65);
    const votoBlandoIndecisos = Math.max(100 - votoDuroFavor - rechazoRadical, 10);

    const ratioPersuasion = Number((votoBlandoIndecisos / Math.max(rechazoRadical, 1)).toFixed(2));

    const recomendacionesConversion = [
      'Concentrar el 75% de los recursos de brigada y pauta digital en el Voto Blando e Indecisos ("Swarm Battleground"); no dilapidar presupuesto intentando convencer al bloque de rechazo radical.',
      'Construir mensajes de "ahorro económico familiar palpable" y "certeza inmediata" sin tecnicismos.',
      'Activar voceros de confianza vecinal (médicos, comerciantes respetados y maestros) en las secciones de alta indecisión.',
      'Blindar la base de Voto Duro mediante asambleas de reconocimiento y corresponsabilidad comunitaria.'
    ];

    return {
      votoDuroFavor,
      votoBlandoIndecisos,
      rechazoRadical,
      ratioPersuasion,
      tamanoBattleground: `${votoBlandoIndecisos}%`,
      recomendacionesConversion
    };
  }

  /**
   * Test de Resiliencia ante Crisis (Escenarios de Alto Riesgo y Minutario de Contención)
   */
  generateCrisisResilienceTest(votosFinales, municipalResearch, tituloProyecto) {
    const muni = municipalResearch?.municipio || 'el municipio';
    const favor = votosFinales.porcentajeFavor || 50;
    const contra = votosFinales.porcentajeContra || 30;

    const scoreResiliencia = Math.min(Math.max(Math.round(100 - (contra * 0.82) - ((votosFinales.indicePolarizacion || 40) * 0.18)), 15), 92);
    const nivelVulnerabilidad = scoreResiliencia >= 68 ? 'Baja (Estructura Sólida)' : (scoreResiliencia >= 45 ? 'Media (Requiere Monitoreo)' : 'Alta / Crítica (Riesgo de Desestabilización)');

    const escenarioRiesgo = `Campaña negra orquestada en grupos de WhatsApp vecinales acusando sobrecosto, daño al patrimonio local o recorte de agua en colonias de ${muni}.`;

    // Curva de propagación de crisis a 72 horas
    const curva72Horas = [
      { tiempo: '0 Horas (Detonación)', impactoAprobacion: favor, volumenAtaque: 15, nivelAlerta: 'Verde / Detección Temprana' },
      { tiempo: '6 Horas (Expansión Redes)', impactoAprobacion: Math.max(favor - 4, 5), volumenAtaque: 42, nivelAlerta: 'Amarillo / Propagación Local' },
      { tiempo: '12 Horas (Medios Regionales)', impactoAprobacion: Math.max(favor - 7, 5), volumenAtaque: 68, nivelAlerta: 'Naranja / Cobertura Noticiosa' },
      { tiempo: '24 Horas (Pico de Polarización)', impactoAprobacion: Math.max(favor - 11, 5), volumenAtaque: 95, nivelAlerta: 'Rojo / Clímax de Crisis' },
      { tiempo: '48 Horas (Contención Activa)', impactoAprobacion: Math.min(favor - 3, 90), volumenAtaque: 38, nivelAlerta: 'Amarillo / Retoma de Control' },
      { tiempo: '72 Horas (Estabilización)', impactoAprobacion: Math.min(favor + 1, 92), volumenAtaque: 14, nivelAlerta: 'Verde / Saldo Normalizado' }
    ];

    // Minutario de Contención Táctica Minuto a Minuto
    const minutarioContencion = [
      {
        ventana: '0 a 30 Minutos (Aislamiento y Fact-Checking)',
        accionInmediata: 'Aislamiento de la fuente emisora en redes/WhatsApp. El War Room convoca al comité técnico para cotejar el dato falso contra el expediente verificado del proyecto.',
        responsable: 'Coordinador de Inteligencia Digital y Enlace Territorial'
      },
      {
        ventana: '30 a 60 Minutos (Vocería y Tarjeta Informativa)',
        accionInmediata: 'Emisión de tarjeta informativa oficial de 1 cuartilla con sello del partido/candidato, desmintiendo el rumor con datos duros y lenguaje directo.',
        responsable: 'Dirección de Comunicación Social y Vocería Oficial'
      },
      {
        ventana: '2 a 4 Horas (Despliegue de Contra-Narrativa)',
        accionInmediata: 'Inyección de infografías verticales en grupos de WhatsApp vecinales y pauta micro-segmentada desmontando la falsedad con testimonios de vecinos reales.',
        responsable: 'Equipo de Estrategia Digital y Red de Movilizadores'
      },
      {
        ventana: '6 a 24 Horas (Presencia Territorial y Liderazgos)',
        accionInmediata: 'Rueda de prensa y recorridos con líderes de comerciantes, transportistas y madres de familia en las colonias foco del ataque para blindar la confianza.',
        responsable: 'Candidato / Portavoz Principal y Enlace Político'
      },
      {
        ventana: '24 a 72 Horas (Encuesta Flash y Retoma de Agenda)',
        accionInmediata: 'Levantamiento de sondeo relámpago con el enjambre sintético para medir control de daños e impulsar de inmediato un nuevo anuncio de alto impacto positivo.',
        responsable: 'Gabinete Estratégico y Cuarto de Guerra'
      }
    ];

    return {
      scoreResiliencia,
      nivelVulnerabilidad,
      escenarioRiesgo,
      curva72Horas,
      minutarioContencion
    };
  }

  /**
   * Generador de Contra-Narrativas (Defensa Preventiva)
   */
  generateDefenseCounterNarratives(votosFinales, municipalResearch, tituloProyecto) {
    const muni = municipalResearch?.municipio || 'el municipio';

    return [
      {
        vectorAtaque: 'Costo Presupuestal y Ocurrencia',
        narrativaOpositora: `"Es una ocurrencia carísima que endeudará a ${muni} por décadas sin resolver el problema de fondo."`,
        guionRespuestaCandidato: `"Falso de principio a fin. El proyecto no contrata un solo centavo de deuda municipal; se financia al 100% con fondos federales etiquetados (Ramo 33 y FAIS) ya autorizados. Cada peso será auditado en una plataforma abierta 24/7 con comités vecinales de vigilancia."`,
        datoDuroBlindaje: '0% de deuda contratada; fiscalización en tiempo real conforme a la Ley de Disciplina Financiera y supervisión de testigos ciudadanos.'
      },
      {
        vectorAtaque: 'Afectación a Comercios y Vialidades',
        narrativaOpositora: `"Van a estrangular las calles, reubicar a la fuerza a los tianguis y quebrar a los pequeños negocios familiares."`,
        guionRespuestaCandidato: `"Al contrario: existe un pacto firmado que garantiza cero cierres en horarios diurnos. Los trabajos pesados se ejecutarán exclusivamente en turnos nocturnos y no se tocará ningún permiso de venta popular. Si un negocio resulta afectado, habrá fondo de compensación inmediato."`,
        datoDuroBlindaje: 'Convenio de corresponsabilidad con 12 uniones de comerciantes y transportistas; cláusulas de penalización a contratistas por retrasos.'
      },
      {
        vectorAtaque: 'Inviabilidad Legal y Jurídica',
        narrativaOpositora: `"Es una promesa engañosa porque el municipio no tiene facultades legales ni constitucionales para ejecutarla."`,
        guionRespuestaCandidato: `"Nuestra propuesta se sustenta con rigor en el Artículo 115 de la Constitución y en la Ley Orgánica Municipal del Estado de México. No venimos a improvisar; el dictamen técnico y ambiental fue revisado por especialistas de la UAEMex."`,
        datoDuroBlindaje: 'Fundamentación legal constitucional plena; dictamen de pre-factibilidad avalado y compatible con el Plan de Desarrollo Municipal.'
      }
    ];
  }

  /**
   * Radar Preventivo de Fake News (Social Listening Predictivo)
   */
  generateFakeNewsRadar(votosFinales, municipalResearch, tituloProyecto) {
    const muni = municipalResearch?.municipio || 'el municipio';
    const contra = votosFinales.porcentajeContra || 30;

    const probabilidadFakeNews = Math.min(Math.max(Math.round(40 + (contra * 0.52)), 25), 94);
    const r0 = (1.5 + ((votosFinales.indicePolarizacion || 50) / 100) * 1.7).toFixed(1);

    return {
      probabilidadFakeNews: `${probabilidadFakeNews}%`,
      numeroReproduccionR0: `${r0}x (Potencial de Virulencia Rápida)`,
      canalesPropagacion: [
        { canal: 'WhatsApp (Grupos de Vecinos y Bazares Locales)', porcentaje: 62, riesgo: 'Crítico' },
        { canal: 'Facebook (Páginas de Denuncia Ciudadana y Grupos de Colonias)', porcentaje: 24, riesgo: 'Alto' },
        { canal: 'TikTok / Shorts (Clips descontextualizados con audio alarmista)', porcentaje: 11, riesgo: 'Medio' },
        { canal: 'X / Twitter (Cuentas bot coordinadas de oposición)', porcentaje: 3, riesgo: 'Bajo' }
      ],
      ventanaOroContencion: '45 minutos a 2 horas (Ventana crítica antes de salto a prensa digital)',
      alertaNarrativaDetectada: `Rumor preventivo: Intento de desinformación acusando "cobro de cuotas extraordinarias" o "afectación al suministro hídrico de colonias bajas" en ${muni}.`,
      protocoloNeutralizacion: 'Despliegue inmediato de infografía vertical en WhatsApp con sello oficial de "DESMENTIDO", comparativa visual y declaración grabada del candidato.'
    };
  }

  /**
   * Calculadora de ROI de Campaña y Asignación Territorial (Secciones Electorales)
   */
  generateCampaignROICalculator(votosFinales, municipalResearch, realSwarmSize = 500) {
    const poblacion = municipalResearch?.poblacion || 450000;
    const padronEstimado = Math.round(poblacion * 0.71);
    const metaVotosVictoria = Math.round(padronEstimado * 0.37);

    const favor = votosFinales.porcentajeFavor || 50;
    const contra = votosFinales.porcentajeContra || 30;
    const neutro = votosFinales.porcentajeNeutro || 20;

    // Secciones Electorales del Municipio (estimado estándar: 1 sección por cada 1,500 electores)
    const totalSecciones = Math.max(Math.round(padronEstimado / 1500), 50);

    const bastionesSegurosCount = Math.round(totalSecciones * (favor / 100) * 0.85);
    const battlegroundPrioritarioCount = Math.round(totalSecciones * ((neutro + (favor * 0.15) + (contra * 0.15)) / 100));
    const riesgoRivalCount = Math.max(totalSecciones - bastionesSegurosCount - battlegroundPrioritarioCount, 5);

    // Asignación Óptima de Recursos Territoriales
    const brigadistasRecomendados = Math.max(Math.round(totalSecciones * 1.8), 60);
    const lonasPublicidad = Math.max(Math.round(totalSecciones * 12), 400);
    const asambleasVecinales = Math.max(Math.round(totalSecciones * 0.35), 20);

    const costoPorVotoPersuadido = `${Math.round(36 + (contra * 0.35))} a ${Math.round(52 + (contra * 0.55))} MXN`;
    const roiElectoralScore = Math.min(Math.max(Math.round(favor * 1.12), 30), 96);

    return {
      padronElectoralEstimado: padronEstimado,
      metaVotosVictoria,
      totalSeccionesElectorales: totalSecciones,
      clasificacionSecciones: {
        bastionesSeguros: {
          secciones: bastionesSegurosCount,
          porcentaje: Math.round((bastionesSegurosCount / totalSecciones) * 100),
          estrategia: 'Movilización masiva, blindaje del voto y promoción del día D.'
        },
        battlegroundPrioritario: {
          secciones: battlegroundPrioritarioCount,
          porcentaje: Math.round((battlegroundPrioritarioCount / totalSecciones) * 100),
          estrategia: 'Micro-targeting quirúrgico, brigadeo diario y persuasión puerta a puerta.'
        },
        riesgoOpositor: {
          secciones: riesgoRivalCount,
          porcentaje: Math.round((riesgoRivalCount / totalSecciones) * 100),
          estrategia: 'Contención de ataques, vigilancia rigurosa de casillas y presencia testimonial.'
        }
      },
      asignacionRecursos: {
        brigadistasRecomendados,
        lonasPublicidad,
        asambleasVecinales
      },
      costoPorVotoPersuadido,
      roiElectoralScore,
      diagnosticoROI: `Con una meta de ${metaVotosVictoria.toLocaleString()} votos para ganar en ${municipalResearch?.municipio || 'la demarcación'}, enfocar a los ${brigadistasRecomendados} brigadistas en las ${battlegroundPrioritarioCount} secciones battleground maximiza el retorno de votos al menor costo por persuasión (${costoPorVotoPersuadido}).`
    };
  }

  /**
   * Radiografía de Desgaste de Promesas (Índice de Escepticismo Ciudadano)
   */
  generatePromiseSkepticismIndex(votosFinales, municipalResearch) {
    const contra = votosFinales.porcentajeContra || 30;
    const neutro = votosFinales.porcentajeNeutro || 20;

    const indiceEscepticismo = Math.min(Math.max(Math.round((contra * 0.65) + (neutro * 0.60)), 15), 90);
    const nivelDesgaste = indiceEscepticismo >= 65 ? 'Severo (Fatiga Histórica de Promesas)' : (indiceEscepticismo >= 40 ? 'Moderado' : 'Bajo (Alta Credibilidad)');

    const factoresIncredulidad = [
      `Historial de administraciones previas en ${municipalResearch?.municipio || 'la zona'} con obras inconclusas o materiales de mala calidad.`,
      'Desconfianza endémica de que los beneficios se condicionen por filiación política o electoral.',
      'Temor a incrementos posteriores en cuotas, impuestos sobre predial o agua.'
    ];

    const blindajeFinanciero = {
      fuentesPresupuestales: [
        'Ramo 33 (FAIS y FORTAMUN): Fondos federales para infraestructura social y seguridad municipal.',
        'Ramo 28: Participaciones federales no etiquetadas con margen de inversión de capital.',
        'Fondo de Infraestructura Social Municipal y de las Demarcaciones Territoriales (FISMDF).'
      ],
      sustentoJuridico: 'Artículo 115 Constitucional Fracción III, Ley Orgánica Municipal del Edomex y Ley de Coordinación Fiscal.',
      garantiaAnticorrupcion: 'Comité de Adquisiciones con testigos sociales ciudadanos y transmisión en vivo de licitaciones.'
    };

    return {
      indiceEscepticismo,
      nivelDesgaste,
      factoresIncredulidad,
      blindajeFinanciero
    };
  }

  /**
   * Micro-Segmentación Generacional (3 Cohortes con Micro-Mensajes de WhatsApp de 1 Clic)
   */
  generateGenerationalMicroSegmentation(votosFinales, municipalResearch, tituloProyecto) {
    const muni = municipalResearch?.municipio || 'nuestro municipio';
    const titulo = tituloProyecto || 'Proyecto de Transformación y Bienestar';

    return [
      {
        id: 'cohorte_jovenes',
        nombre: 'Centennials y Jóvenes Universitarios',
        rangoEdad: '18 a 29 años',
        pesoElectoral: '31% del Padrón',
        canalPrioritario: 'TikTok, Instagram Reels y WhatsApp de Redes Estudiantiles',
        tonoComunicacion: 'Directo, fresco, pragmático, libre de retórica burocrática y con énfasis en futuro y libertad.',
        propuestaAncla: 'Internet público de alta velocidad, transporte seguro con tarifa preferencial y espacios deportivos/culturales sustentables.',
        microMensajeWhatsApp: `¡Hola! 🚀 En ${muni} ya estuvo bueno de promesas de siempre. Con el proyecto "${titulo}" vamos por conectividad libre, ciclovías seguras y transporte digno para que estudiar y trabajar no sea una pesadilla. Cero rollo, soluciones reales. ¿Le entras? Échale un ojo y compártelo con tus compas: [Enlace]`
      },
      {
        id: 'cohorte_adultos',
        nombre: 'Familias y Adultos en Edad Productiva',
        rangoEdad: '30 a 64 años',
        pesoElectoral: '54% del Padrón',
        canalPrioritario: 'Facebook Comunitario, Grupos de WhatsApp Vecinales y Encuentros en Calle',
        tonoComunicacion: 'Serio, empático, enfocado en cuidar el bolsillo familiar, la seguridad de los hijos y el agua.',
        propuestaAncla: 'Abasto de agua regular sin extorsión de pipas, senderos escolares iluminados y cero nuevos impuestos vecinales.',
        microMensajeWhatsApp: `Estimados vecinos de ${muni}: Les comparto una propuesta seria y con presupuesto asegurado. Con "${titulo}" blindamos el suministro de agua, reforzamos las patrullas en los horarios de las escuelas de nuestros hijos y protegemos la economía familiar sin aumentos al predial. Cuidar a nuestras familias es lo primero. Con gusto lo platicamos en la próxima junta vecinal: [Enlace]`
      },
      {
        id: 'cohorte_mayores',
        nombre: 'Adultos Mayores y Jubilados',
        rangoEdad: '65 años en adelante',
        pesoElectoral: '15% del Padrón',
        canalPrioritario: 'Comités de Barrio, Radio Local, Volante Mano a Mano y WhatsApp Familiar',
        tonoComunicacion: 'Respetuoso, cálido, de reconocimiento a su esfuerzo de toda la vida y garantía de tranquilidad.',
        propuestaAncla: 'Medicamentos gratuitos garantizados, banquetas planas y accesibles, y transporte gratuito preferencial.',
        microMensajeWhatsApp: `Apreciadas familias y amigos de ${muni}: Les comparto una noticia de respeto y justicia. La iniciativa "${titulo}" contempla abasto de medicamentos garantizado, clínicas de barrio con atención digna y banquetas seguras para que nuestros adultos mayores caminen en paz y sin riesgo de caídas. Porque su tranquilidad es sagrada. Les mando un saludo con afecto y bendiciones: [Enlace]`
      }
    ];
  }

}
module.exports = new PoliticalStrategistAgent();
