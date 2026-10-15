// Agente de Deliberación y Contagio Social (Social Dynamics Agent)
// Modela la interacción vecinal, boca a boca en tianguis y redes sociales (WhatsApp) midiendo el desplazamiento de opinión

class SocialDynamicsAgent {
  constructor() {
    this.name = 'Agente de Deliberación y Contagio Social (Social Dynamics Agent)';
  }

  /**
   * Simula la deliberación social entre los agentes del enjambre
   */
  deliberateSwarm(evaluatedAgents, municipalResearch, projectProposal) {
    const total = evaluatedAgents.length;
    const postAgents = [];

    // Factores de contagio basados en argumentos dominantes
    const debateVectors = [
      {
        nombre: 'Círculo de Seguridad y Movilidad Femenina',
        canal: 'Grupos de WhatsApp vecinales y salidas de escuelas',
        foco: 'Iluminación, cámaras y botones de pánico',
        direccion: +1, // Empuja hacia A Favor
        fuerza: 0.18
      },
      {
        nombre: 'Incertidumbre de Comerciantes y Choferes Locales',
        canal: 'Asambleas de tianguistas y bases de transporte',
        foco: 'Miedo a quiebra por cierres viales o pérdida de concesiones',
        direccion: -1, // Empuja hacia En Contra
        fuerza: 0.14
      },
      {
        nombre: 'Conciencia Ecológica Juvenil y Salud Pública',
        canal: 'Redes sociales (TikTok, Facebook comunitario)',
        foco: 'Menos contaminación, árboles nativos y cuidado de animales',
        direccion: +1, // Empuja hacia A Favor
        fuerza: 0.16
      },
      {
        nombre: 'Desconfianza en Tiempos de Entrega de Obras',
        canal: 'Pláticas de sobremesa y paraderos de transporte',
        foco: 'Escepticismo sobre si la obra quedará inconclusa',
        direccion: -1, // Empuja hacia En Contra
        fuerza: 0.11
      }
    ];

    let convertidosAFavor = 0;
    let convertidosAContra = 0;
    let confirmados = 0;

    for (const agent of evaluatedAgents) {
      let nuevoVoto = agent.voto;
      let nuevoEntusiasmo = agent.entusiasmo;
      let notaDeliberacion = '';

      // Si el agente estaba Neutro o con entusiasmo limítrofe (43 - 57), es altamente vulnerable al contagio social
      const esIndeciso = agent.voto === 'Neutro' || (agent.entusiasmo >= 43 && agent.entusiasmo <= 57);

      if (esIndeciso) {
        // Jóvenes y estudiantes tienden a ser influenciados por el vector ecológico y tecnológico
        if (agent.edad <= 29 || agent.posturaCivica.includes('Verde') || agent.posturaCivica.includes('Animal')) {
          nuevoVoto = 'A favor';
          nuevoEntusiasmo += 15;
          convertidosAFavor++;
          notaDeliberacion = 'Cambió a "A Favor" tras debatir en redes vecinales sobre el beneficio ambiental y la modernización con cámaras.';
        }
        // Comerciantes o personas mayores escépticas tienden a ser influenciados por temor a afectaciones viales
        else if (agent.ocupacion.includes('tianguis') || agent.ocupacion.includes('transporte') || agent.posturaCivica.includes('Escéptico')) {
          if (Math.random() < 0.65) {
            nuevoVoto = 'En contra';
            nuevoEntusiasmo -= 14;
            convertidosAContra++;
            notaDeliberacion = 'Cambió a "En Contra" tras escuchar quejas de comerciantes vecinos por posibles afectaciones en la circulación.';
          } else {
            nuevoVoto = 'Neutro';
            notaDeliberacion = 'Mantiene reserva condicionada: exige mesas de diálogo antes del inicio de cualquier intervención.';
          }
        }
        // Jefas de familia priorizan la seguridad y el ahorro familiar
        else if (agent.genero === 'Femenino' && agent.ocupacion.includes('Ama de casa')) {
          nuevoVoto = 'A favor';
          nuevoEntusiasmo += 12;
          convertidosAFavor++;
          notaDeliberacion = 'Convencida a favor tras enterarse de la tarifa subsidiada y la vigilancia para sus hijos.';
        } else {
          confirmados++;
        }
      } else {
        confirmados++;
      }

      // Límites de seguridad matemática
      nuevoEntusiasmo = Math.min(Math.max(nuevoEntusiasmo, 2), 99);

      postAgents.push({
        ...agent,
        voto: nuevoVoto,
        votoFinal: nuevoVoto,
        entusiasmo: nuevoEntusiasmo,
        entusiasmoFinal: nuevoEntusiasmo,
        desplazamiento: nuevoVoto !== agent.voto ? 'Cambio tras deliberación' : 'Voto estable',
        notaDeliberacion: notaDeliberacion || 'Mantuvo su postura inicial tras contrastar opiniones con vecinos.'
      });
    }

    // Métricas post-deliberación
    const finalFavor = postAgents.filter(a => a.votoFinal === 'A favor').length;
    const finalContra = postAgents.filter(a => a.votoFinal === 'En contra').length;
    const finalNeutro = postAgents.filter(a => a.votoFinal === 'Neutro').length;

    const porcFavor = Math.round((finalFavor / total) * 100);
    const porcContra = Math.round((finalContra / total) * 100);
    const porcNeutro = Math.round((finalNeutro / total) * 100);

    const promedioEntusiasmoFinal = Math.round(
      postAgents.reduce((acc, curr) => acc + curr.entusiasmoFinal, 0) / (total || 1)
    );

    // Cálculo del índice de polarización comunitaria (0 a 100)
    const polarizacion = Math.round(100 - Math.abs(porcFavor - porcContra));

    return {
      vectoresDeliberacion: debateVectors,
      dinamicaContagio: {
        convertidosAFavor,
        convertidosAContra,
        estables: confirmados,
        porcentajeVolatilidad: Math.round(((convertidosAFavor + convertidosAContra) / total) * 100)
      },
      votosFinales: {
        aFavor: finalFavor,
        enContra: finalContra,
        neutro: finalNeutro,
        porcentajeFavor: porcFavor,
        porcentajeContra: porcContra,
        porcentajeNeutro: porcNeutro,
        promedioEntusiasmo: promedioEntusiasmoFinal,
        indicePolarizacion: polarizacion
      },
      agentesPostDeliberacion: postAgents
    };
  }
}

module.exports = new SocialDynamicsAgent();
