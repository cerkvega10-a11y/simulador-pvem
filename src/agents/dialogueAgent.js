// Agente de Diálogo y Deliberación Inter-Agentes (Dialogue & Swarm Debate Agent)
// Genera hilos de debate realistas, imparciales y estrechamente vinculados a la propuesta del usuario
// Soporta APIs de IA Gratuitas: Groq, Google Gemini, OpenRouter y Ollama

const freeLLMService = require('../services/freeLLMService');

class DialogueAgent {
  constructor() {
    this.name = 'Agente de Diálogo y Deliberación Inter-Agentes';
  }

  /**
   * Genera hilos de discusión interactiva entre agentes del enjambre
   */
  async generateDebateThreads(projectTitle, projectText, municipalResearch, swarmAgents, aiConfig = {}, semanticResult = null) {
    // 1. Consulta al Motor Centralizado de IA (Google Gemini Pro / Enterprise)
    const hasCentralKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.BACKUP_API_KEY);
    const hasClientKey = Boolean(aiConfig && aiConfig.apiKey);

    if (hasCentralKey || hasClientKey) {
      try {
        const provider = aiConfig?.provider || 'gemini';
        const activeAiConfig = {
          provider,
          model: aiConfig?.model || (provider === 'gemini' ? (process.env.GEMINI_MODEL || 'gemini-1.5-pro') : 'default'),
          apiKey: aiConfig?.apiKey || (provider === 'gemini' ? (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || '') : ''),
          ...(aiConfig || {})
        };
        const llmDebates = await freeLLMService.generateDebatesWithLLM(
          projectText,
          projectTitle,
          municipalResearch.municipio,
          municipalResearch.estado,
          municipalResearch.top5Problematicas,
          activeAiConfig
        );
        if (llmDebates && Array.isArray(llmDebates) && llmDebates.length > 0) {
          return llmDebates;
        }
      } catch (err) {
        console.warn('[DialogueAgent] Fallback al motor contextual nativo:', err.message);
      }
    }

    // 2. Motor de Diálogo Contextual Nativo de Alta Precisión Territorial y Temática
    return this.generateNativeDeepDebates(projectTitle, projectText, municipalResearch, swarmAgents, semanticResult);
  }

  /**
   * Genera debates dinámicos y realistas utilizando el motor contextual profundo
   */
  generateNativeDeepDebates(projectTitle, projectText, municipalResearch, swarmAgents, semanticResult = null) {
    const muni = municipalResearch.municipio;
    const colonias = municipalResearch.coloniasRepresentativas || ['Centro', 'Zona Oriente', 'Barrio Tradicional'];
    const col1 = colonias[0] || 'Cabecera Municipal';
    const col2 = colonias[1] || 'Colonia Morelos';
    const col3 = colonias[2] || 'Valle Oriente';
    const pTextLower = (projectText || '').toLowerCase();
    const tipo = semanticResult?.tipo || 'GENERAL';

    // CASO 1: PROPUESTA ABSURDA O SIN SENTIDO
    if (tipo === 'ABSURDO' || tipo === 'ININTELIGIBLE') {
      return [
        {
          id: 'thread-absurdo-1',
          tema: 'Indignación Ciudadana: Prioridades Urgentes vs Ocurrencias',
          contexto: `Fuerte rechazo en la asamblea vecinal de ${muni} ante una iniciativa considerada inviable y fuera de la realidad.`,
          mensajes: [
            {
              agenteId: 'agente-deb-1',
              nombre: 'Rodrigo Méndez Hernández',
              edad: 46,
              ocupacion: 'Operador de transporte concesionado',
              colonia: col1,
              municipio: muni,
              postura: 'En contra',
              entusiasmo: 5,
              mensaje: `Vecinos, sinceramente me parece una burla. En ${col1} llevamos meses con desabasto de agua, baches enormes que descomponen los carros y asaltos diarios. ¿De dónde sacan que la prioridad en ${muni} es "${projectTitle}"? El dinero público debe usarse con seriedad y respeto a la gente trabajadora.`,
              argumentoTecnico: 'Desconexión total con las carencias prioritarias del municipio.',
              condicionDeCambio: 'Rechazo innegociable; exige retirar el proyecto y canalizar recursos a agua y bacheo.'
            },
            {
              agenteId: 'agente-deb-2',
              nombre: 'Valeria Guadalupe Soto Cruz',
              edad: 22,
              ocupacion: 'Estudiante universitaria (UAEMex / FES)',
              colonia: col2,
              municipio: muni,
              postura: 'En contra',
              entusiasmo: 8,
              mensaje: `Concuerdo totalmente con don Rodrigo. Nosotros los jóvenes queremos proyectos ecológicos y de vanguardia, pero esto no tiene ningún rigor técnico ni beneficio social. Parece una ocurrencia improvisada sin sustento de ingeniería ni presupuesto. En ${muni} necesitamos senderos seguros e internet en bibliotecas, no fantasías.`,
              argumentoTecnico: 'Falta absoluta de viabilidad técnica, ambiental y de beneficio social comprobable.',
              condicionDeCambio: 'Votaría a favor de iniciativas sustentables legítimas, nunca de proyectos inviables.'
            },
            {
              agenteId: 'agente-deb-3',
              nombre: 'Patricia Morales Aguilar',
              edad: 38,
              ocupacion: 'Comerciante de abarrotes y jefa de familia',
              colonia: col3,
              municipio: muni,
              postura: 'En contra',
              entusiasmo: 10,
              mensaje: `Como comerciantes y jefas de familia estamos cansadas de que no atiendan la recolección de basura ni el alumbrado y salgan con este tipo de propuestas. Si el gobierno municipal o los partidos quieren ganarse la confianza en ${muni}, que vengan a pavimentar nuestras calles y a resolver el agua primero.`,
              argumentoTecnico: 'Costo de oportunidad inaceptable: desvía la atención de las urgencias vecinales.',
              condicionDeCambio: 'Exige que todo el presupuesto se dirija a la red hidráulica y seguridad.'
            }
          ]
        }
      ];
    }

    // CASO 2: PROPUESTA PUNITIVA (TARIFAS, IMPUESTOS, CIERRES, DESALOJOS)
    if (tipo === 'PUNITIVO') {
      return [
        {
          id: 'thread-punitivo-1',
          tema: 'Impacto al Bolsillo Familiar y Alerta de Movilización Ciudadana',
          contexto: `Fuerte tensión comunitaria en ${muni} por medidas que encarecen el transporte o la actividad económica popular.`,
          mensajes: [
            {
              agenteId: 'agente-deb-1',
              nombre: 'Rodrigo Méndez Hernández',
              edad: 46,
              ocupacion: 'Chofer de transporte colectivo',
              colonia: col1,
              municipio: muni,
              postura: 'En contra',
              entusiasmo: 15,
              mensaje: `No podemos permitir que aumenten costos o reduzcan nuestro campo de trabajo en ${muni}. La mayoría de las familias gastan hasta el 25% de su sueldo solo en pasajes para llegar a sus empleos. Si imponen estas medidas sin consensuar apoyos, habrá bloqueos y paro total de rutas en las avenidas principales.`,
              argumentoTecnico: 'Impacto inflacionario en el gasto del hogar obrero y riesgo de colapso de movilidad.',
              condicionDeCambio: 'Eliminar el incremento tarifario y sustituirlo por subsidio al combustible limpio.'
            },
            {
              agenteId: 'agente-deb-2',
              nombre: 'Patricia Morales Aguilar',
              edad: 38,
              ocupacion: 'Comerciante local de tianguis y abarrotes',
              colonia: col3,
              municipio: muni,
              postura: 'En contra',
              entusiasmo: 18,
              mensaje: `A nosotros los tianguistas y pequeños comerciantes nos quieren retirar o cobrar derechos excesivos. Vivimos al día, y si nos quitan nuestros puntos de venta o nos imponen multas, nos dejan sin el sustento de nuestros hijos. Exigimos una mesa de diálogo urgente.`,
              argumentoTecnico: 'Afectación directa al autoempleo e ingreso del comercio popular barrial.',
              condicionDeCambio: 'Firma de convenio notariado de respeto a fuentes de trabajo y no desalojo.'
            },
            {
              agenteId: 'agente-deb-3',
              nombre: 'Valeria Guadalupe Soto Cruz',
              edad: 22,
              ocupacion: 'Estudiante y usuaria de transporte',
              colonia: col2,
              municipio: muni,
              postura: 'Neutro',
              entusiasmo: 42,
              mensaje: `Urge modernizar y ordenar ${muni}, pero no a costa de sangrar a los que menos tienen. Los jóvenes y estudiantes necesitamos tarifas preferenciales y descuentos reales. Si todo el costo lo pagamos los usuarios, el proyecto no tiene sentido ecológico ni social.`,
              argumentoTecnico: 'Exige subsidio estudiantil garantizado y transparencia financiera.',
              condicionDeCambio: 'Votará a favor solo si se garantiza tarifa cero o subsidiada para estudiantes y adultos mayores.'
            }
          ]
        }
      ];
    }

    // CASO 3: PROYECTO DE AGUA POTABLE Y COSECHA PLUVIAL
    const isWater = /agua|pozo|pluvial|lluvia|cisterna|h[ií]drico|tandeo|red/i.test(pTextLower);
    if (isWater) {
      return [
        {
          id: 'thread-agua-1',
          tema: 'Solución a la Crisis Hídrica: Distribución Justa y Mantenimiento',
          contexto: `Vecinos de ${col1} y ${col2} debaten sobre la efectividad de los sistemas pluviales y pozos de absorción en ${muni}.`,
          mensajes: [
            {
              agenteId: 'agente-deb-1',
              nombre: 'Patricia Morales Aguilar',
              edad: 38,
              ocupacion: 'Comerciante y vecina de zona con tandeo',
              colonia: col1,
              municipio: muni,
              postura: 'A favor',
              entusiasmo: 88,
              mensaje: `Llevamos años padeciendo por el tandeo y pagando hasta $1,200 pesos por pipa en ${col1}. Que se instalen sistemas de captación pluvial gratuitos y pozos comunitarios es la mejor propuesta que han presentado en años para ${muni}. Nos dará agua limpia para las casas sin depender del huachicoleo de pipas.`,
              argumentoTecnico: 'Autonomía hídrica barrial y ahorro económico sustancial en gasto de pipas privadas.',
              condicionDeCambio: 'Mantendrá su respaldo si se garantiza entrega transparente sin sesgo partidista.'
            },
            {
              agenteId: 'agente-deb-2',
              nombre: 'Carlos Arturo Domínguez Vázquez',
              edad: 61,
              ocupacion: 'Jubilado y líder de comité vecinal de agua',
              colonia: col2,
              municipio: muni,
              postura: 'Neutro',
              entusiasmo: 54,
              mensaje: `La idea técnica es muy buena, pero como jubilado que ha visto pasar muchas administraciones en ${muni}, pregunto: ¿quién se encargará del cambio de filtros y del mantenimiento después del primer año? Si la alcaldía no capacita a comités ciudadanos de vecinos, los equipos se van a tapar con la tierra.`,
              argumentoTecnico: 'Requiere manual técnico ciudadano y presupuesto etiquetado para consumibles y repuestos.',
              condicionDeCambio: 'Se sumará a "A Favor" si se crea la Contraloría Social Vecinal del Agua.'
            },
            {
              agenteId: 'agente-deb-3',
              nombre: 'Rodrigo Méndez Hernández',
              edad: 46,
              ocupacion: 'Vecino de colonia popular',
              colonia: col3,
              municipio: muni,
              postura: 'A favor',
              entusiasmo: 75,
              mensaje: `El agua es vida y en ${muni} ya no aguantamos más promesas vacías. Si realmente van a empezar las instalaciones este mes en las colonias más necesitadas, tienen todo nuestro apoyo. El Partido Verde debe vigilar que la obra no se detenga.`,
              argumentoTecnico: 'Derecho humano al agua potable consagrado en la Constitución.',
              condicionDeCambio: 'Exige calendario público de colonias beneficiadas semana a semana.'
            }
          ]
        }
      ];
    }

    // CASO 4: PROYECTO GENERAL DE BENEFICIO AMBIENTAL / COMUNITARIO
    return [
      {
        id: 'thread-gral-1',
        tema: `Impacto y Viabilidad de "${projectTitle}" en ${muni}`,
        contexto: `Deliberación abierta sobre el impacto económico, urbano y ecológico de la iniciativa en las colonias de ${muni}.`,
        mensajes: [
          {
            agenteId: 'agente-deb-1',
            nombre: 'Valeria Guadalupe Soto Cruz',
            edad: 22,
            ocupacion: 'Estudiante y activista ambiental local',
            colonia: col2,
            municipio: muni,
            postura: 'A favor',
            entusiasmo: 85,
            mensaje: `El municipio de ${muni} necesita proyectos modernos que cuiden el entorno y la salud pública. Apoyo "${projectTitle}" porque atiende rezagos de años y aporta soluciones sustentables con visión de futuro para nuestra generación.`,
            argumentoTecnico: 'Beneficio ecológico medible y modernización del entorno comunitario.',
            condicionDeCambio: 'Exige que se cumplan las normas ambientales y se garantice participación de jóvenes.'
          },
          {
            agenteId: 'agente-deb-2',
            nombre: 'Patricia Morales Aguilar',
            edad: 38,
            ocupacion: 'Comerciante local y jefa de familia',
            colonia: col1,
            municipio: muni,
            postura: 'Neutro',
            entusiasmo: 52,
            mensaje: `El proyecto suena muy positivo en papel, pero queremos garantías de que las obras no entorpezcan nuestras ventas y que se concluyan en el tiempo acordado. En ${muni} no queremos elefantes blancos que dejen las calles abiertas por meses.`,
            argumentoTecnico: 'Mitigación de afectaciones temporales a la actividad comercial de barrio.',
            condicionDeCambio: 'Aprobación condicionada a horarios nocturnos de trabajo y calendario estricto.'
          },
          {
            agenteId: 'agente-deb-3',
            nombre: 'Rodrigo Méndez Hernández',
            edad: 46,
            ocupacion: 'Conductor y habitante de la zona',
            colonia: col3,
            municipio: muni,
            postura: 'En contra',
            entusiasmo: 30,
            mensaje: `Sigo pensando que antes de cualquier obra nueva en ${muni}, el gobierno debería tapar los baches y arreglar las luminarias descompuestas. Es un tema de prioridades: primero lo urgente y luego lo que se ve bonito.`,
            argumentoTecnico: 'Cuestionamiento de prioridades presupuestales frente a servicios básicos pendientes.',
            condicionDeCambio: 'Votaría a favor si de forma paralela se atiende el bacheo integral de la zona.'
          }
        ]
      }
    ];
  }

  /**
   * Responde interactivamente a una pregunta del usuario hacia el enjambre
   */
  async answerSwarmInterrogation(pregunta, projectTitle, projectText, municipalResearch, aiConfig = {}, semanticResult = null) {
    const muni = municipalResearch.municipio;
    const tipo = semanticResult?.tipo || 'GENERAL';

    // Consulta al Motor Centralizado de IA (Google Gemini Pro) o fallback nativo
    const hasCentralKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.BACKUP_API_KEY);
    const hasClientKey = Boolean(aiConfig && aiConfig.apiKey);

    if (hasCentralKey || hasClientKey) {
      try {
        const activeAiConfig = {
          provider: 'gemini',
          model: process.env.GEMINI_MODEL || aiConfig?.model || 'gemini-1.5-pro',
          apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || aiConfig?.apiKey || '',
          ...(aiConfig || {})
        };

        const systemPrompt = `Eres un grupo de 3 ciudadanos del municipio de ${muni}, Estado de México.
Están evaluando el proyecto: "${projectTitle}" (${projectText}).
Tipo semántico detectado: ${tipo}.
El usuario evaluador hace esta pregunta al enjambre: "${pregunta}".
Responde con 3 agentes representativos (A Favor, En Contra, Neutro) con opiniones realistas, fundamentadas y locales de ${muni}.
Devuelve estrictamente un JSON con formato:
[
  { "nombre": "Nombre Apellido", "postura": "A favor", "ocupacion": "Ocupación", "respuesta": "Opinión clara..." },
  { "nombre": "Nombre Apellido", "postura": "En contra", "ocupacion": "Ocupación", "respuesta": "Opinión clara..." },
  { "nombre": "Nombre Apellido", "postura": "Neutro", "ocupacion": "Ocupación", "respuesta": "Opinión clara..." }
]`;

        const raw = await freeLLMService.executeChatCompletion({
          provider: activeAiConfig.provider,
          apiKey: activeAiConfig.apiKey,
          model: activeAiConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Pregunta del evaluador: "${pregunta}"` }
          ],
          temperature: 0.6,
          jsonMode: true
        });

        const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.warn('[DialogueAgent] Error en interrogación LLM:', err.message);
      }
    }

    // Respuestas contextuales nativas ajustadas a la propuesta y la pregunta
    if (tipo === 'ABSURDO' || tipo === 'ININTELIGIBLE') {
      return [
        {
          nombre: 'Rodrigo Méndez Hernández',
          postura: 'En contra',
          ocupacion: 'Operador de transporte concesionado',
          respuesta: `Sobre tu pregunta de "${pregunta}": La respuesta es sencilla: en ${muni} no podemos apoyar una ocurrencia que no atiende nuestras carencias reales. Necesitamos agua y calles transitables, no propuestas fuera de la realidad.`
        },
        {
          nombre: 'Valeria Guadalupe Soto',
          postura: 'En contra',
          ocupacion: 'Estudiante universitaria',
          respuesta: `Respecto a "${pregunta}": Técnicamente la propuesta carece de pies y cabeza. Como estudiantes exigimos que los proyectos públicos cuenten con estudios serios de viabilidad y beneficio a la comunidad.`
        },
        {
          nombre: 'Patricia Morales Aguilar',
          postura: 'Neutro',
          ocupacion: 'Comerciante de abarrotes',
          respuesta: `En cuanto a "${pregunta}": Lo que esperamos es que se retiren estas ocurrencias y se concentren en lo que de verdad urge en las colonias de ${muni}.`
        }
      ];
    }

    if (tipo === 'PUNITIVO') {
      return [
        {
          nombre: 'Rodrigo Méndez Hernández',
          postura: 'En contra',
          ocupacion: 'Chofer de transporte local',
          respuesta: `Respecto a "${pregunta}": Nos oponemos porque cualquier incremento o restricción le pega directo a la comida de nuestras familias en ${muni}. Mientras el gobierno no asuma los costos con subsidios, la gente saldrá a inconformarse.`
        },
        {
          nombre: 'Patricia Morales Aguilar',
          postura: 'En contra',
          ocupacion: 'Comerciante barrial',
          respuesta: `Sobre "${pregunta}": Los comerciantes trabajamos al día. No permitiremos multas ni cobros que amenacen nuestros negocios familiares en ${muni}.`
        },
        {
          nombre: 'Valeria Guadalupe Soto',
          postura: 'Neutro',
          ocupacion: 'Estudiante y usuaria',
          respuesta: `En cuanto a "${pregunta}": Si no hay descuentos transparentes para estudiantes y adultos mayores, el proyecto no tiene legitimidad social.`
        }
      ];
    }

    // Caso regular / beneficio
    return [
      {
        nombre: 'Valeria Guadalupe Soto',
        postura: 'A favor',
        ocupacion: 'Estudiante universitaria en ' + muni,
        respuesta: `Respecto a "${pregunta}": Creemos que si "${projectTitle}" se ejecuta con transparencia en ${muni}, el impacto positivo en sustentabilidad y calidad de vida será muy significativo.`
      },
      {
        nombre: 'Rodrigo Méndez Hernández',
        postura: 'En contra',
        ocupacion: 'Trabajador del transporte en ' + muni,
        respuesta: `Sobre "${pregunta}": Mi preocupación es que dejen las obras a la mitad como en otras ocasiones. En ${muni} necesitamos ver supervisión ciudadana real antes de cantar victoria.`
      },
      {
        nombre: 'Patricia Morales Aguilar',
        postura: 'Neutro',
        ocupacion: 'Comerciante de abarrotes',
        respuesta: `En cuanto a "${pregunta}": Apoyamos el progreso, pero queremos acuerdos firmados para que los pequeños negocios no salgan perjudicados durante la construcción.`
      }
    ];
  }
}

module.exports = new DialogueAgent();
