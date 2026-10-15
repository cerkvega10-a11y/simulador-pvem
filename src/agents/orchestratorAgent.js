// Agente Orquestador Central (Master Router)
// Coordina el flujo de trabajo entre los 7 agentes del sistema y emite eventos en tiempo real para la consola de la UI

const multimodalAgent = require('./multimodalAgent');
const webResearchAgent = require('./webResearchAgent');
const personaBuilderAgent = require('./personaBuilderAgent');
const swarmSimulationEngine = require('./swarmSimulationEngine');
const socialDynamicsAgent = require('./socialDynamicsAgent');
const politicalStrategistAgent = require('./politicalStrategistAgent');
const dialogueAgent = require('./dialogueAgent');
const watchdogAuditAgent = require('./watchdogAuditAgent');
const realAiVerificationAgent = require('./realAiVerificationAgent');

class OrchestratorAgent {
  constructor() {
    this.name = 'Agente Orquestador Central (Master Router)';
    this.latestState = null;
  }

  /**
   * Ejecuta el pipeline completo con emisión de progreso
   * onProgress(paso, porcentaje, mensaje, agentName, payload)
   */
  async runSimulationPipeline(inputData, onProgress = () => {}) {
    const startTime = Date.now();
    const {
      tituloProyecto = inputData.titulo || 'Iniciativa Comunitaria Verde',
      propuestaTexto = inputData.propuesta || '',
      documentData = null,
      visualData = null,
      estado = 'Estado de México',
      municipio = 'Ecatepec de Morelos',
      localidad = '',
      filtrosDemograficos = {},
      swarmSize = inputData.tamanoEnjambre || 250,
      webSearchActive = true
    } = inputData;

    // --- PASO 1: Análisis Multimodal (Document & Vision Parser) ---
    onProgress({
      paso: 1,
      porcentaje: 10,
      agente: 'Agente Analista Multimodal',
      mensaje: 'Iniciando parseo semántico de texto y análisis multimodal de archivos...',
      status: 'active'
    });

    const multimodalResult = multimodalAgent.synthesizeInputs(propuestaTexto, documentData, visualData);

    await this.delay(350);

    onProgress({
      paso: 1,
      porcentaje: 25,
      agente: 'Agente Analista Multimodal',
      mensaje: `Contenido multimodal integrado exitosamente (${multimodalResult.textoUnificado.length} caracteres procesados). Elementos visuales y técnicos clasificados.`,
      status: 'done',
      data: { multimodalResult }
    });

    // --- PASO 2: Investigación Web y Contexto Socio-Demográfico (OSINT) ---
    onProgress({
      paso: 2,
      porcentaje: 35,
      agente: 'Agente Investigador Web y Socio-Demográfico',
      mensaje: `Rastreando en tiempo real portales del Edomex, INEGI y noticias locales de ${municipio} (${localidad || 'Cabecera y colonias'})...`,
      status: 'active'
    });

    const municipalResearch = await webResearchAgent.conductResearch(
      estado,
      municipio,
      localidad,
      multimodalResult.textoUnificado,
      webSearchActive
    );

    await this.delay(450);

    onProgress({
      paso: 2,
      porcentaje: 50,
      agente: 'Agente Investigador Web y Socio-Demográfico',
      mensaje: `Diagnóstico territorial completado. Top 5 problemáticas mapeadas (${municipalResearch.top5Problematicas.map(p => p.tema.split(' ')[0]).join(', ')}).`,
      status: 'done',
      data: { municipalResearch }
    });

    // --- PASO 3: Generación del Enjambre y Evaluación Inicial ---
    onProgress({
      paso: 3,
      porcentaje: 60,
      agente: 'Agente Generador de Perfiles Sintéticos (Persona Builder)',
      mensaje: `Sintetizando ${swarmSize} agentes ciudadanos con distribución censal real de ${municipio}...`,
      status: 'active'
    });

    const swarmData = personaBuilderAgent.generateSwarm(swarmSize, municipalResearch, filtrosDemograficos);

    await this.delay(400);

    onProgress({
      paso: 3,
      porcentaje: 75,
      agente: 'Motor de Enjambre Ciudadano (Swarm Simulation Engine)',
      mensaje: `Desplegando ${swarmData.totalGenerados} agentes en evaluación individual. Procesando votos, nivel de entusiasmo y argumentos en primera persona...`,
      status: 'active'
    });

    const initialSimulation = swarmSimulationEngine.simulateSwarm(
      swarmData.personas,
      multimodalResult.textoUnificado,
      municipalResearch
    );

    await this.delay(350);

    onProgress({
      paso: 3,
      porcentaje: 82,
      agente: 'Motor de Enjambre Ciudadano',
      mensaje: `Evaluación base concluida: ${initialSimulation.votosIniciales.porcentajeFavor}% A Favor, ${initialSimulation.votosIniciales.porcentajeContra}% En Contra, ${initialSimulation.votosIniciales.porcentajeNeutro}% Neutros.`,
      status: 'done'
    });

    // --- PASO 4: Deliberación Social y Estrategia Política ---
    onProgress({
      paso: 4,
      porcentaje: 88,
      agente: 'Agente de Deliberación y Contagio Social',
      mensaje: 'Ejecutando modelo de contagio social vecinal (boca a boca, debates en redes, comités de comerciantes y transporte)...',
      status: 'active'
    });

    const deliberationData = socialDynamicsAgent.deliberateSwarm(
      initialSimulation.agentesEvaluados,
      municipalResearch,
      multimodalResult.textoUnificado
    );

    await this.delay(300);

    // --- META-AGENTE 8: Auditoría de Inferencia Real y Neutralidad (AI Watchdog) ---
    onProgress({
      paso: 4,
      porcentaje: 92,
      agente: 'Agente Auditor de Inferencia Real y Neutralidad (AI Watchdog)',
      mensaje: 'Auditando inferencia y consistencia sociopolítica. Aplicando reglas de impacto real y verificando 0% sesgo de complacencia...',
      status: 'active'
    });

    const auditResult = await watchdogAuditAgent.auditAndCalibrate(
      {
        ...inputData,
        propuestaTexto: multimodalResult.textoUnificado
      },
      initialSimulation,
      deliberationData,
      municipalResearch
    );

    // Aplicar votos y agentes auditados para garantizar la matemática de impacto real
    deliberationData.votosFinales = auditResult.votosAuditados;
    deliberationData.agentesPostDeliberacion = auditResult.agentesAuditados;

    await this.delay(250);

    onProgress({
      paso: 4,
      porcentaje: 95,
      agente: 'Agente Auditor de Inferencia Real y Neutralidad',
      mensaje: `Auditoría certificada [${auditResult.proofOfReasoning.auditoriaId}]. Anti-sycophancy activo. Votos finales: ${deliberationData.votosFinales.porcentajeFavor}% A Favor, ${deliberationData.votosFinales.porcentajeContra}% En Contra, ${deliberationData.votosFinales.porcentajeNeutro}% Neutros.`,
      status: 'active'
    });

    onProgress({
      paso: 4,
      porcentaje: 97,
      agente: 'Agente Sintetizador y Estratega Político (PVEM)',
      mensaje: 'Consolidando métricas finales, mapa de calor por sectores sociales, testimonios y recomendaciones de mitigación...',
      status: 'active'
    });

    const state = {
      tituloProyecto,
      propuestaTexto: multimodalResult.textoUnificado,
      multimodalData: {
        documentData,
        visualData
      },
      municipalResearch,
      swarmData,
      initialSimulation,
      deliberationData,
      proofOfReasoning: auditResult.proofOfReasoning,
      semanticResult: auditResult.semanticResult,
      chatsDelEnjambre: auditResult.chatsDelEnjambre,
      chatTelemetry: auditResult.chatTelemetry,
      radarData: auditResult.radarData,
      evolucionData: auditResult.evolucionData,
      porSectorSocial: auditResult.porSectorSocial,
      inteligenciaSindical: auditResult.inteligenciaSindical,
      blindajeDefensa: auditResult.blindajeDefensa,
      modoAtaque: auditResult.modoAtaque,
      variacionMuestral: auditResult.variacionMuestral,
      qaWatchdogCertificacion: auditResult.qaWatchdogCertificacion
    };

    const finalReport = politicalStrategistAgent.compileReport(state);
    finalReport.proofOfReasoning = auditResult.proofOfReasoning;
    finalReport.chatsDelEnjambre = auditResult.chatsDelEnjambre;
    finalReport.chatTelemetry = auditResult.chatTelemetry;
    finalReport.radarData = auditResult.radarData;
    finalReport.evolucionData = auditResult.evolucionData;
    finalReport.porSectorSocial = auditResult.porSectorSocial || state.mapaCalorDemografico?.porSectorSocial;
    finalReport.fuentesOficialesVerificadas = municipalResearch.fuentesOficialesVerificadas || [];
    finalReport.protocoloDeepGov = municipalResearch.protocoloDeepGov || null;
    finalReport.inteligenciaSindical = auditResult.inteligenciaSindical;
    finalReport.blindajeDefensa = auditResult.blindajeDefensa;
    finalReport.modoAtaque = auditResult.modoAtaque;
    finalReport.variacionMuestral = auditResult.variacionMuestral;
    finalReport.qaWatchdogCertificacion = auditResult.qaWatchdogCertificacion;

    // --- META-AGENTE: Verificación y Autodiagnóstico de IA Real y Datos Oficiales ---
    onProgress({
      paso: 4,
      porcentaje: 98,
      agente: 'Agente de Verificación y Autodiagnóstico de IA Real',
      mensaje: 'Auditando autenticidad en vivo: Token highlighter, fórmula matemática abierta y validador de datos oficiales...',
      status: 'active'
    });

    const verificacionIAReal = realAiVerificationAgent.generateVerificationDossier({
      proposalText: multimodalResult.textoUnificado,
      municipio,
      estado,
      semanticResult: auditResult.semanticResult,
      municipalResearch,
      votosFinales: deliberationData.votosFinales,
      chatsDelEnjambre: auditResult.chatsDelEnjambre
    });
    finalReport.verificacionIAReal = verificacionIAReal;

    // Generar hilos de debate ciudadano interactivo (con LLM si hay API Key o motor contextual nativo)
    const debatesInterAgentes = await dialogueAgent.generateDebateThreads(
      tituloProyecto,
      multimodalResult.textoUnificado,
      municipalResearch,
      deliberationData.agentesPostDeliberacion,
      inputData.aiConfig,
      auditResult.semanticResult
    );
    finalReport.debatesInterAgentes = debatesInterAgentes;

    this.latestState = {
      ...state,
      finalReport,
      aiConfig: inputData.aiConfig,
      semanticResult: auditResult.semanticResult
    };

    const durationMs = Date.now() - startTime;

    onProgress({
      paso: 4,
      porcentaje: 100,
      agente: 'Agente Orquestador Central',
      mensaje: `Simulación predictiva completada con éxito en ${(durationMs / 1000).toFixed(2)}s por los 8 Meta-Agentes. Resultados y auditoría de IA real listos.`,
      status: 'completed',
      data: finalReport
    });

    return finalReport;
  }

  async answerQuestion(pregunta) {
    if (!this.latestState) {
      return [
        {
          nombre: 'Ciudadano Mexiquense',
          postura: 'Neutro',
          ocupacion: 'Vecino de la zona',
          respuesta: 'Por favor ejecuta primero una simulación predictiva para que el enjambre tenga el contexto territorial del proyecto.'
        }
      ];
    }

    const { tituloProyecto, propuestaTexto, municipalResearch, aiConfig, semanticResult } = this.latestState;
    return await dialogueAgent.answerSwarmInterrogation(
      pregunta,
      tituloProyecto,
      propuestaTexto,
      municipalResearch,
      aiConfig,
      semanticResult
    );
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new OrchestratorAgent();
