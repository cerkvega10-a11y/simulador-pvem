// Agente Generador de Perfiles Sintéticos (Persona Builder)
// Crea de 100 a 1,000 agentes ciudadanos hiper-realistas basados en datos censales del INEGI y la zona seleccionada

const { OCUPACIONES_FRECUENTES } = require('../data/edomexDemographics');

// Nombres y apellidos comunes en el centro de México
const NOMBRES_HOMBRES = [
  'Juan Carlos', 'Miguel Ángel', 'José Antonio', 'Alejandro', 'Luis Fernando',
  'Eduardo', 'Jorge Luis', 'Carlos', 'Roberto', 'Gabriel', 'Jesús', 'Daniel',
  'Arturo', 'Francisco Javier', 'Rodrigo', 'Héctor', 'Raúl', 'Víctor Hugo'
];

const NOMBRES_MUJERES = [
  'María Elena', 'Guadalupe', 'Rosa María', 'Ana Patricia', 'Claudia',
  'Karla Sofía', 'Maricarmen', 'Brenda', 'Adriana', 'Leticia', 'Valeria',
  'Monserrat', 'Lucía', 'Esther', 'Gabriela', 'Teresa', 'Yolanda', 'Daniela'
];

const APELLIDOS = [
  'Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez',
  'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Vázquez',
  'Jiménez', 'Reyes', 'Díaz', 'Torres', 'Gutiérrez', 'Ruiz', 'Mendoza', 'Aguilar'
];

const POSTURAS_CIVICAS = [
  { tipo: 'Pragmático Escéptico', desc: 'No cree en promesas políticas hasta ver las obras concluidas.', peso: 28 },
  { tipo: 'Simpatizante Ecologista / Verde', desc: 'Valora la protección del medio ambiente, árboles y energías limpias.', peso: 22 },
  { tipo: 'Activista Comunitario / Vecinal', desc: 'Preocupado por la seguridad, el agua y las cuotas de colonos.', peso: 20 },
  { tipo: 'Protector de Economía Familiar', desc: 'Todo proyecto debe evitar aumentar impuestos o tarifas de transporte.', peso: 18 },
  { tipo: 'Defensor de Bienestar Animal', desc: 'Alta sensibilidad por perros y gatos en abandono y fauna urbana.', peso: 12 }
];

class PersonaBuilderAgent {
  constructor() {
    this.name = 'Agente Generador de Perfiles Sintéticos (Persona Builder)';
  }

  /**
   * Genera N agentes sintéticos (100 a 1,000)
   */
  generateSwarm(swarmSize, municipalData, demographicFilters = {}) {
    const size = Math.min(Math.max(parseInt(swarmSize, 10) || 250, 100), 1000);
    const colonias = municipalData.coloniasRepresentativas || ['Colonia Centro', 'Barrio Tradicional', 'Fraccionamiento'];
    const nseDistribution = municipalData.distribucionNSE || { 'A/B': 5, 'C+': 15, 'C': 35, 'D+': 30, 'D/E': 15 };
    
    const personas = [];

    for (let i = 0; i < size; i++) {
      const id = `agente-${i + 1}`;
      const genero = i % 100 < 51 ? 'Femenino' : (i % 100 < 98 ? 'Masculino' : 'No Binario');
      const nombre = this.pickName(genero);
      const edad = this.generateAge(demographicFilters.rangoEdad);
      const nse = this.pickNSE(nseDistribution, demographicFilters.nse);
      const ocupacion = this.pickOccupation(nse, edad, demographicFilters.ocupacion);
      const colonia = colonias[i % colonias.length];
      const postura = this.pickCivicPosture();
      const transporte = this.pickTransportMode(colonia, ocupacion);
      const preocupacionFamilia = this.pickFamilyConcern(municipalData.top5Problematicas);

      personas.push({
        id,
        nombre,
        genero,
        edad,
        grupoEtario: this.getAgeGroup(edad),
        nse,
        ocupacion,
        colonia,
        posturaCivica: postura.tipo,
        perfilCivicoDesc: postura.desc,
        transporteHabitual: transporte,
        preocupacionPrioritaria: preocupacionFamilia,
        municipio: municipalData.municipio,
        estado: municipalData.estado
      });
    }

    return {
      totalGenerados: personas.length,
      resumenMuestra: {
        distribucionGenero: {
          femenino: personas.filter(p => p.genero === 'Femenino').length,
          masculino: personas.filter(p => p.genero === 'Masculino').length,
          otro: personas.filter(p => p.genero === 'No Binario').length
        },
        distribucionEtaria: {
          '18-29': personas.filter(p => p.grupoEtario === '18-29 años (Jóvenes)').length,
          '30-49': personas.filter(p => p.grupoEtario === '30-49 años (Adultos jóvenes/medios)').length,
          '50-64': personas.filter(p => p.grupoEtario === '50-64 años (Adultos maduros)').length,
          '65+': personas.filter(p => p.grupoEtario === '65+ años (Adultos mayores)').length
        },
        representatividadEstadistica: `${size} agentes equivalen a un intervalo de confianza del 95% con margen de error del ±${(100 / Math.sqrt(size)).toFixed(1)}%`
      },
      personas
    };
  }

  pickName(genero) {
    const apellido1 = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
    const apellido2 = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
    if (genero === 'Femenino') {
      const nombre = NOMBRES_MUJERES[Math.floor(Math.random() * NOMBRES_MUJERES.length)];
      return `${nombre} ${apellido1} ${apellido2}`;
    } else {
      const nombre = NOMBRES_HOMBRES[Math.floor(Math.random() * NOMBRES_HOMBRES.length)];
      return `${nombre} ${apellido1} ${apellido2}`;
    }
  }

  generateAge(filtro) {
    if (filtro === 'jovenes') return Math.floor(Math.random() * 12) + 18; // 18 a 29
    if (filtro === 'adultos') return Math.floor(Math.random() * 20) + 30; // 30 a 49
    if (filtro === 'mayores') return Math.floor(Math.random() * 25) + 50; // 50 a 74
    
    // Distribución piramidal mexicana general
    const rand = Math.random();
    if (rand < 0.28) return Math.floor(Math.random() * 12) + 18; // 18-29 (28%)
    if (rand < 0.65) return Math.floor(Math.random() * 20) + 30; // 30-49 (37%)
    if (rand < 0.88) return Math.floor(Math.random() * 15) + 50; // 50-64 (23%)
    return Math.floor(Math.random() * 18) + 65; // 65-82 (12%)
  }

  getAgeGroup(edad) {
    if (edad <= 29) return '18-29 años (Jóvenes)';
    if (edad <= 49) return '30-49 años (Adultos jóvenes/medios)';
    if (edad <= 64) return '50-64 años (Adultos maduros)';
    return '65+ años (Adultos mayores)';
  }

  pickNSE(dist, filtro) {
    if (filtro === 'bajos_medios') return Math.random() < 0.6 ? 'D+' : 'D/E';
    if (filtro === 'altos') return Math.random() < 0.6 ? 'A/B' : 'C+';

    const rand = Math.random() * 100;
    let acumulado = 0;
    for (const [nivel, porcentaje] of Object.entries(dist)) {
      acumulado += porcentaje;
      if (rand <= acumulado) return nivel;
    }
    return 'C';
  }

  pickOccupation(nse, edad, filtro) {
    if (edad < 25 && Math.random() < 0.6) {
      return 'Estudiante universitario (UAEMex / FES UNAM / Politécnico)';
    }
    if (edad >= 65) {
      return 'Jubilado / pensionado (ISSEMYM / IMSS)';
    }

    const opciones = OCUPACIONES_FRECUENTES;
    const rand = Math.random() * 100;
    let acumulado = 0;
    for (const item of opciones) {
      acumulado += item.peso;
      if (rand <= acumulado) return item.puesto;
    }
    return 'Empleado administrativo corporativo (viaja a CDMX)';
  }

  pickCivicPosture() {
    const rand = Math.random() * 100;
    let acumulado = 0;
    for (const p of POSTURAS_CIVICAS) {
      acumulado += p.peso;
      if (rand <= acumulado) return p;
    }
    return POSTURAS_CIVICAS[0];
  }

  pickTransportMode(colonia, ocupacion) {
    if (ocupacion.includes('Operador de transporte')) return 'Unidad de transporte propia / microbús';
    if (ocupacion.includes('Estudiante')) return 'Combi + Mexibús / Metro';
    if (ocupacion.includes('viaja a CDMX')) return 'Mexibús / Suburbano / Camión directo';
    if (ocupacion.includes('tianguis') || ocupacion.includes('abarrotes')) return 'Camioneta de carga ligera / a pie';
    return Math.random() < 0.5 ? 'Combi o microbús colectivo' : 'Automóvil particular';
  }

  pickFamilyConcern(problematicas) {
    if (!problematicas || problematicas.length === 0) return 'Economía familiar y empleo';
    const index = Math.floor(Math.random() * problematicas.length);
    return problematicas[index].tema;
  }
}

module.exports = new PersonaBuilderAgent();
