// Agente Sintetizador y Estratega Político (Report & Insights Compiler)
// Consolida resultados del enjambre, genera el mapa de calor, selecciona testimonios y diseña la estrategia para el Partido Verde

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

    // 1. Índice de Aceptación Global y Fricción Social
    const indiceFriccionSocial = this.calculateSocialFrictionIndex(votosFinales, municipalResearch);

    // 2. Mapa de Calor Demográfico (Sectores Sociales requeridos, Edad y NSE)
    const mapaCalor = this.generateDemographicHeatmap(agentes);

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

    return {
      fechaGeneracion: new Date().toISOString(),
      partido: 'Partido Verde Ecologista Estado de México',
      resumenEjecutivo: {
        tituloProyecto: tituloProyecto || 'Proyecto de Infraestructura y Política Social',
        municipio: municipalResearch.municipio,
        estado: municipalResearch.estado,
        localidad: municipalResearch.localidad,
        tamanoEnjambre: total,
        aprobacionFinal: votosFinales.porcentajeFavor,
        rechazoFinal: votosFinales.porcentajeContra,
        indiferenciaFinal: votosFinales.porcentajeNeutro,
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
        porSectorSocial: orchestratorState.porSectorSocial || mapaCalor.porSectorSocial
      },
      vocesDelEnjambre: testimoniosSeleccionados,
      chatsDelEnjambre: orchestratorState.chatsDelEnjambre || [],
      chatTelemetry: orchestratorState.chatTelemetry || null,
      radarData: orchestratorState.radarData || null,
      evolucionData: orchestratorState.evolucionData || null,
      estrategiaPoliticaPVEM: estrategiaPVEM,
      proofOfReasoning: orchestratorState.proofOfReasoning || null,
      evidenciaMultimodal: multimodalData.visualData || null
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
   * Genera el Mapa de Calor segmentando por los sectores sociales requeridos, edad y NSE
   */
  generateDemographicHeatmap(agentes) {
    const calcularSegmento = (filtroFn) => {
      const sub = agentes.filter(filtroFn);
      if (sub.length === 0) return { favor: 50, contra: 30, neutro: 20, total: 0 };
      const fav = Math.round((sub.filter(a => a.votoFinal === 'A favor').length / sub.length) * 100);
      const con = Math.round((sub.filter(a => a.votoFinal === 'En contra').length / sub.length) * 100);
      const neu = 100 - fav - con;
      return { favor: fav, contra: con, neutro: neu, total: sub.length };
    };

    // 1. Desglose por Sector Social Específico (Requerimiento Maestro)
    const porSectorSocial = [
      {
        sector: 'Obreros y Usuarios de Transporte',
        ...calcularSegmento(a => a.ocupacion.includes('obrero') || a.ocupacion.includes('transporte') || a.ocupacion.includes('viaja a CDMX') || a.nse === 'D+' || a.nse === 'D/E'),
        observacion: 'Sensibles al costo del pasaje, tiempos de traslado y asaltos en paraderos'
      },
      {
        sector: 'Comerciantes y Tianguistas',
        ...calcularSegmento(a => a.ocupacion.includes('tianguis') || a.ocupacion.includes('abarrotes') || a.ocupacion.includes('Comerciante')),
        observacion: 'Rechazo frontal a cierres viales prolongados o reubicaciones sin garantías de venta'
      },
      {
        sector: 'Automovilistas y Clase Media',
        ...calcularSegmento(a => (a.nse === 'A/B' || a.nse === 'C+') || a.ocupacion.includes('Profesionista') || a.ocupacion.includes('corporativo')),
        observacion: 'Rechazan reducción de carriles, nuevos impuestos vehiculares o prediales'
      },
      {
        sector: 'Jóvenes y Estudiantes',
        ...calcularSegmento(a => a.edad <= 29 || a.ocupacion.includes('Estudiante')),
        observacion: 'Aliados de la agenda verde, ciclovías, internet y movilidad eléctrica'
      },
      {
        sector: 'Adultos Mayores y Pensionados',
        ...calcularSegmento(a => a.edad >= 60 || a.ocupacion.includes('pensionado')),
        observacion: 'Exigen rampas, gratuidad en transporte y suministro constante de agua'
      }
    ];

    // 2. Segmentos por Grupo Etario
    const porEdad = [
      { grupo: '18 a 29 años (Jóvenes)', ...calcularSegmento(a => a.edad <= 29), observacion: 'Sólido apego a causas ambientales y modernización tecnológica' },
      { grupo: '30 a 49 años (Adultos Productivos)', ...calcularSegmento(a => a.edad >= 30 && a.edad <= 49), observacion: 'Priorizan seguridad en el trayecto, ahorro en transporte y abasto de agua' },
      { grupo: '50 a 64 años (Adultos Maduros)', ...calcularSegmento(a => a.edad >= 50 && a.edad <= 64), observacion: 'Sensibles a afectaciones viales temporales y mantenimiento de colonias' },
      { grupo: '65+ años (Adultos Mayores)', ...calcularSegmento(a => a.edad >= 65), observacion: 'Preocupación por rampas peatonales, gratuidad y trato digno' }
    ];

    // 3. Segmentos por Nivel Socioeconómico
    const porNSE = [
      { nivel: 'A/B y C+ (Medio-Alto / Alto)', ...calcularSegmento(a => a.nse === 'A/B' || a.nse === 'C+'), observacion: 'Valoran plusvalía urbana, energías renovables y ordenamiento' },
      { nivel: 'C (Medio Típico)', ...calcularSegmento(a => a.nse === 'C'), observacion: 'Enfocados en relación costo-beneficio y calidad de servicios' },
      { nivel: 'D+ y D/E (Bajo / Popular)', ...calcularSegmento(a => a.nse === 'D+' || a.nse === 'D/E'), observacion: 'Impacto directo en gasto diario, agua potable e iluminación en calles' }
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
    const aFavor = agentes.filter(a => a.votoFinal === 'A favor');
    const enContra = agentes.filter(a => a.votoFinal === 'En contra');
    const neutros = agentes.filter(a => a.votoFinal === 'Neutro');

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
}

module.exports = new PoliticalStrategistAgent();
