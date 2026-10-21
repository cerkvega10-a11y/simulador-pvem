// Motor de Enjambre Ciudadano (Swarm Simulation Engine)
// Ejecuta la evaluación individual de los 100 a 1,000 agentes ciudadanos emitiendo voto, entusiasmo y argumento

class SwarmSimulationEngine {
  constructor() {
    this.name = 'Motor de Enjambre Ciudadano (Swarm Simulation Engine)';
  }

  /**
   * Ejecuta la evaluación masiva de todos los agentes sobre la propuesta
   */
  simulateSwarm(personas, proposalText, municipalResearch) {
    const pTextLower = proposalText.toLowerCase();
    const evaluatedAgents = [];

    // Factores semánticos y de impacto detectados en la propuesta
    const touchesTransport = /transporte|movilidad|carril|mexib[uú]s|ruta|combi|ciclov[ií]a|autob[uú]s|troleb[uú]s/i.test(pTextLower);
    const touchesWater = /agua|pozo|pluvial|lluvia|cisterna|h[ií]drico|tandeo|red de agua/i.test(pTextLower);
    const touchesAnimals = /animal|perro|gato|veterinari|esteriliz|mascota/i.test(pTextLower);
    const touchesEnvironment = /verde|solar|ecolog|recicl|árbol|parque|limpi|basura|contamina/i.test(pTextLower);
    const touchesBudget = /gratuito|tarifa|costo|\$|subsidio|inversi[oó]n|impuesto/i.test(pTextLower);

    // Detección de factores de fricción económica, vial y social
    const isFareHikeOrCost = /(?:aumento|alza|subir|incremento|tarifa|pasaje)\s*(?:a|de|\$)?\s*\d+|impuesto|tenencia|predial|cobro|multa|peaje/i.test(pTextLower);
    const isLaneCutOrRoadBlock = /(?:reduc(?:ir|ci[oó]n)|cerrar|cierre|eliminar)\s*(?:de)?\s*(?:carril|vialidad|avenida|estacionamiento)/i.test(pTextLower);
    const isVendorEviction = /(?:retir(?:ar|o)|desalojo|prohibir|quitar)\s*(?:a|de)?\s*(?:comerciante|tianguis|ambulante|puesto|vendedor)/i.test(pTextLower);
    const isDemagogic = /(?:regalar|gratis para todos|sin l[ií]mite|a todos los habitantes|de por vida|autos gratis)/i.test(pTextLower);

    const flags = {
      touchesTransport,
      touchesWater,
      touchesAnimals,
      touchesEnvironment,
      touchesBudget,
      isFareHikeOrCost,
      isLaneCutOrRoadBlock,
      isVendorEviction,
      isDemagogic
    };

    for (const persona of personas) {
      const evaluation = this.evaluateSingleAgent(
        persona,
        flags,
        municipalResearch
      );

      evaluatedAgents.push({
        ...persona,
        ...evaluation
      });
    }

    // Métricas iniciales antes de deliberación
    const aFavor = evaluatedAgents.filter(a => a.voto === 'A favor').length;
    const enContra = evaluatedAgents.filter(a => a.voto === 'En contra').length;
    const neutro = evaluatedAgents.filter(a => a.voto === 'Neutro').length;
    const total = evaluatedAgents.length;

    const promedioEntusiasmo = Math.round(
      evaluatedAgents.reduce((acc, curr) => acc + curr.entusiasmo, 0) / (total || 1)
    );

    return {
      totalAgentes: total,
      votosIniciales: {
        aFavor,
        enContra,
        neutro,
        porcentajeFavor: Math.round((aFavor / total) * 100),
        porcentajeContra: Math.round((enContra / total) * 100),
        porcentajeNeutro: Math.round((neutro / total) * 100),
        promedioEntusiasmo
      },
      agentesEvaluados: evaluatedAgents
    };
  }

  /**
   * Evalúa a un solo agente ciudadano con ponderación rigurosa de sus condiciones particulares
   * (Cero datos aleatorios - cálculo determinista y reproducible)
   */
  evaluateSingleAgent(persona, proposalFlags, municipalResearch) {
    let scoreFavor = 50; // Línea base neutra
    let razon = '';

    const isTransportWorker = (persona.sectorSocial === 'Transportistas y Choferes (Taxis, Colectivos, Carga)') || persona.ocupacion.includes('transporte') || persona.ocupacion.includes('Chofer');
    const isMerchant = (persona.sectorSocial === 'Comerciantes y Tianguistas / MiPyMEs') || persona.ocupacion.includes('tianguis') || persona.ocupacion.includes('abarrotes') || persona.ocupacion.includes('Comerciante');
    const isStudent = (persona.sectorSocial === 'Estudiantes y Jóvenes Universitarios') || persona.ocupacion.includes('Estudiante');
    const isHomemaker = (persona.sectorSocial === 'Madres de Familia y Hogares') || persona.ocupacion.includes('Ama de casa') || persona.ocupacion.includes('Madre');
    const isHealthWorker = (persona.sectorSocial === 'Trabajadores del Sector Salud (Médicos, Enfermeras)') || persona.ocupacion.includes('salud') || persona.ocupacion.includes('Enfermera') || persona.ocupacion.includes('Médico');
    const isTeacher = (persona.sectorSocial === 'Maestros y Sector Educativo (SNTE / CNTE)') || persona.ocupacion.includes('Docente') || persona.ocupacion.includes('Profesor');
    const isBureaucrat = (persona.sectorSocial === 'Burocracia y Empleados de Gobierno') || persona.ocupacion.includes('gobierno') || persona.ocupacion.includes('administrativo');
    const isBusinessOwner = (persona.sectorSocial === 'Empresarios y Directivos de la Industria') || persona.ocupacion.includes('Empresario') || persona.ocupacion.includes('Gerente');
    const isFarmer = (persona.sectorSocial === 'Sector Primario (Campesinos, Ejidatarios y Pescadores)') || persona.ocupacion.includes('agrícola') || persona.ocupacion.includes('Campesino');
    const isConstructionWorker = (persona.sectorSocial === 'Trabajadores de la Construcción y Obreros') || persona.ocupacion.includes('Albañil') || persona.ocupacion.includes('obrero') || persona.ocupacion.includes('manufactura');
    const isSenior = (persona.sectorSocial === 'Adultos Mayores y Pensionados') || persona.edad >= 60;
    const isLowNSE = persona.nse === 'D+' || persona.nse === 'D/E';

    // 1. IMPACTO CRÍTICO: Si la propuesta incluye aumento de tarifas, impuestos o cobros
    if (proposalFlags.isFareHikeOrCost) {
      if (isWorker || isTransportWorker || isLowNSE || isStudent) {
        scoreFavor -= 45;
        razon = `Rechazo total: En ${persona.colonia} el transporte ya consume más del 25% de nuestro sueldo semanal. Un aumento de tarifa o cobro de impuesto es un golpe directo a la comida de mi familia.`;
      } else if (isMerchant) {
        scoreFavor -= 35;
        razon = `Cualquier alza en costos de pasaje o cobros municipales deprime las ventas en nuestro negocio de ${persona.colonia}; la gente tendrá menos dinero para gastar.`;
      } else {
        scoreFavor -= 25;
        razon = `No es momento de subir costos a la ciudadanía; en ${persona.municipio} la inflación y la falta de agua ya tienen asfixiadas a las familias.`;
      }
    }

    // 2. IMPACTO CRÍTICO: Si la propuesta reduce carriles o afecta la vialidad
    if (proposalFlags.isLaneCutOrRoadBlock) {
      if (persona.nse === 'A/B' || persona.nse === 'C+' || isTransportWorker || isWorker) {
        scoreFavor -= 38;
        razon = `Reducir carriles en avenidas principales de ${persona.municipio} va a colapsar el tráfico aún más. Perderemos horas extras en los traslados diarios.`;
      }
    }

    // 3. IMPACTO CRÍTICO: Si la propuesta desaloja comerciantes o retira tianguis
    if (proposalFlags.isVendorEviction) {
      if (isMerchant || isLowNSE) {
        scoreFavor -= 50;
        razon = `En ${persona.colonia} el tianguis es el sustento de cientos de familias trabajadoras. No permitiremos desalojos ni cobros que atenten contra nuestro derecho al trabajo.`;
      } else {
        scoreFavor -= 20;
        razon = `Desalojar sin alternativas provocará protestas, bloqueos y tensión comunitaria en ${persona.municipio}.`;
      }
    }

    // 4. Si la propuesta es demagógica o promete cosas irreales
    if (proposalFlags.isDemagogic) {
      scoreFavor = 48; // Fuerza el escepticismo
      razon = `Suena a promesa electoral vacía de campaña; en ${persona.municipio} no hay presupuesto para cumplir algo así y terminará en endeudamiento municipal.`;
    }

    // 5. Ajustes por problemáticas territoriales legítimas atendidas
    if (!proposalFlags.isFareHikeOrCost && !proposalFlags.isLaneCutOrRoadBlock && !proposalFlags.isVendorEviction && !proposalFlags.isDemagogic) {
      if (proposalFlags.touchesWater) {
        if (persona.preocupacionPrioritaria.toLowerCase().includes('agua') || isLowNSE) {
          scoreFavor += 28;
          razon = `En ${persona.colonia} sufrimos demasiado por el agua y las pipas caras; resolver la red y captar agua de lluvia atiende nuestra necesidad más urgente.`;
        } else {
          scoreFavor += 18;
          razon = `El agua es una urgencia histórica en todo ${persona.municipio}, me parece prioritario antes que cualquier obra de relumbrón.`;
        }
      }

      if (proposalFlags.touchesTransport) {
        if (isTransportWorker) {
          scoreFavor -= 25;
          razon = `Soy transportista en la zona y temo que desplacen nuestras unidades concesionadas sin compensación justa o inclusión laboral.`;
        } else if (isStudent || isHomemaker || isWorker) {
          scoreFavor += 26;
          razon = `Viajar en el transporte actual es caro e inseguro; si garantizan unidades eléctricas modernas, iluminadas y con tarifa social, cuenta con nuestro apoyo.`;
        } else {
          scoreFavor += 15;
          razon = `Urge modernizar la movilidad y bajar las emisiones en ${persona.municipio}.`;
        }
      }

      if (proposalFlags.touchesAnimals) {
        if (persona.posturaCivica.includes('Animal') || isStudent || isHomemaker) {
          scoreFavor += 30;
          razon = `Es un gran alivio tener clínicas veterinarias públicas y esterilización gratuita; en ${persona.colonia} hay muchos animalitos en abandono.`;
        } else {
          scoreFavor += 15;
        }
      }

      if (proposalFlags.touchesEnvironment) {
        scoreFavor += 16;
      }
    }

    // 6. Moduladores por postura cívica censal
    if (persona.posturaCivica.includes('Escéptico')) {
      scoreFavor -= 12;
      if (!razon) {
        razon = `Siempre prometen en campaña y a la hora de la verdad dejan las obras a medias o con sobrecostos en ${persona.municipio}.`;
      }
    }

    // Variabilidad demográfica determinista (Basada en ID y edad censal - CERO Math.random())
    const idNum = parseInt((persona.id || '1').replace(/\D/g, '') || '5', 10);
    const deterministicVariance = ((idNum * 13 + persona.edad * 7) % 17) - 8;
    scoreFavor += deterministicVariance;
    scoreFavor = Math.min(Math.max(Math.round(scoreFavor), 6), 94);

    // Determinación de voto y entusiasmo
    let voto = 'Neutro';
    if (scoreFavor >= 58) {
      voto = 'A favor';
    } else if (scoreFavor <= 42) {
      voto = 'En contra';
    }

    if (!razon) {
      razon = voto === 'A favor'
        ? `Considero que este proyecto puede mejorar la calidad de vida en ${persona.colonia} si se ejecuta con transparencia.`
        : (voto === 'En contra'
          ? `No me convence la prioridad del proyecto; hay carencias más urgentes en ${persona.colonia} que deberían atender primero.`
          : `Tengo dudas sobre los tiempos de ejecución y el impacto en nuestra rutina diaria en ${persona.colonia}.`);
    }

    return {
      voto,
      votoFinal: voto,
      entusiasmo: scoreFavor,
      entusiasmoFinal: scoreFavor,
      argumentoPrincipal: razon
    };
  }
}

module.exports = new SwarmSimulationEngine();
