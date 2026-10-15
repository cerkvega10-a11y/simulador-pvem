// Motor de Inteligencia Sindical y Riesgo Corporativo
// Evalúa la reacción de las 12 Fuerzas Sindicales Estratégicas en Edomex / México
// y calcula el Semáforo de Riesgo de Paro / Bloqueo Vial (0-100)

class UnionsEngine {
  constructor() {
    this.name = 'Motor de Inteligencia Sindical (12 Fuerzas Sindicales)';
  }

  /**
   * Evalúa las 12 Fuerzas Sindicales frente a la propuesta y el municipio
   */
  evaluateUnions(propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', semanticResult = {}) {
    const txt = (propuestaTexto || '').toLowerCase();
    const temas = semanticResult.temas || {};
    const esPunitivo = semanticResult.tipo === 'PUNITIVO' || txt.includes('aumento') || txt.includes('tarifa') || txt.includes('retiro') || txt.includes('multa') || txt.includes('clausura');
    const esBeneficio = semanticResult.tipo === 'BENEFICIO_REAL' || txt.includes('gratuito') || txt.includes('subsidio') || txt.includes('inversion') || txt.includes('apoyo');

    // 12 Fuerzas Sindicales Definidas
    const FUERZAS_BASE = [
      {
        id: 'salud',
        gremio: 'Salud, Médicos y Hospitales',
        siglas: 'SNTSA / SNTSS / ISEM',
        sensibilidad: ['hospital', 'salud', 'veterinaria', 'clinica', 'medico', 'enfermera', 'medicamento'],
        pliegoBase: 'Garantía de insumos médicos de primera necesidad, dotación de equipo de bioseguridad, basificación de personal eventual y no sobrecarga de guardias en clínicas comunitarias.',
        liderTestimonio: 'No podemos avalar nuevos programas de atención en el municipio si no se abastecen primero los centros de salud existentes y se contrata personal con sueldos dignos.'
      },
      {
        id: 'electricistas',
        gremio: 'Electricistas y Energía',
        siglas: 'SME / SUTERM',
        sensibilidad: ['solar', 'energia', 'fotovoltaic', 'electrico', 'luz', 'cfe', 'alumbrado'],
        pliegoBase: 'Intervención y certificación técnica sindical en cualquier nueva infraestructura eléctrica o paneles solares; respeto irrestricto al Contrato Colectivo de Trabajo y convenios con CFE.',
        liderTestimonio: 'Cualquier reconversión a paneles solares o transporte eléctrico debe incluir a los técnicos calificados del gremio en las cuadrillas de montaje y mantenimiento preventivo.'
      },
      {
        id: 'burocratas',
        gremio: 'Burócratas y Servidores Públicos',
        siglas: 'FSTSE / SUTEYM',
        sensibilidad: ['gobierno', 'municipio', 'tramite', 'digital', 'servidor', 'recaudacion', 'catastro'],
        pliegoBase: 'Garantía de estabilidad laboral frente a procesos de digitalización o restructuración administrativa; pago puntual de primas de riesgo y respeto a plazas sindicalizadas.',
        liderTestimonio: 'Exigimos que las nuevas políticas del cabildo no recorten las prestaciones de los trabajadores sindicalizados ni sustituyan plazas con personal por honorarios.'
      },
      {
        id: 'magisterio',
        gremio: 'Magisterio y Educación',
        siglas: 'SNTE / CNTE / SMSEM',
        sensibilidad: ['escuela', 'educacion', 'maestro', 'estudiante', 'plantel', 'aula', 'nino'],
        pliegoBase: 'Infraestructura digna y segura en planteles escolares (techumbres, sanitarios funcionales, agua potable constante) y respeto a la jornada laboral docente.',
        liderTestimonio: 'Si el proyecto involucra escuelas o entornos escolares, debe coordinarse con las secciones magisteriales y garantizar entornos seguros para la comunidad educativa.'
      },
      {
        id: 'agua_limpia',
        gremio: 'Agua Potable, Drenaje y Limpia Pública',
        siglas: 'ODAPAS / CAEM / Limpia Municipal',
        sensibilidad: ['agua', 'drenaje', 'pozo', 'lluvia', 'pipa', 'basura', 'limpia', 'recoleccion'],
        pliegoBase: 'Entrega de camiones recolectores modernos, equipo de protección para cuadrillas de desazolve, vacunación para personal de limpia y bono por insalubridad.',
        liderTestimonio: 'Las cuadrillas de agua y limpia somos los primeros en enfrentar las crisis en las calles. Exigimos equipo adecuado antes de que nos sumen nuevas tareas.'
      },
      {
        id: 'transporte',
        gremio: 'Transporte y Rutas Concesionadas',
        siglas: 'Alianzas de Choferes / Rutas y Combis',
        sensibilidad: ['transporte', 'ruta', 'combi', 'microbus', 'pasaje', 'tarifa', 'carril', 'concesion', 'mexibus'],
        pliegoBase: 'Subsidio directo al combustible, no cancelación arbitraria de derroteros, inclusión preferente en fideicomisos de modernización y mesas permanentes sobre tarifas.',
        liderTestimonio: 'Si pretenden meter corredores confinados o sacarnos de la ruta sin indemnización ni integración accionaria, pararemos los accesos al municipio de forma indefinida.'
      },
      {
        id: 'construccion',
        gremio: 'Construcción y Materialistas',
        siglas: 'CTM / Sindicatos de la Construcción',
        sensibilidad: ['obra', 'construccion', 'material', 'acarreo', 'camion', 'pavimento', 'bacheo'],
        pliegoBase: 'Contratación prioritaria de mano de obra y camiones de carga de sindicatos locales, precios justos por metro cúbico de acarreo y pago puntual de estimaciones de obra pública.',
        liderTestimonio: 'Exigimos que toda obra pública municipal licite con los sindicatos de transportistas de carga y albañiles mexiquenses, sin favorecer a contratistas foráneos.'
      },
      {
        id: 'industria',
        gremio: 'Industria y Manufactura',
        siglas: 'CROC / CROM / Independientes',
        sensibilidad: ['fabrica', 'empleo', 'empresa', 'industrial', 'maquila', 'parque industrial'],
        pliegoBase: 'Seguridad en los corredores industriales y paraderos para evitar asaltos al cambio de turno; incentivos a empresas que mantengan empleos formales en el municipio.',
        liderTestimonio: 'Nuestros obreros sufren robos diarios en las avenidas periféricas. Si la propuesta brinda transporte seguro al parque industrial, tendrá el respaldo absoluto de las bases.'
      },
      {
        id: 'telecom',
        gremio: 'Telecomunicaciones y Servicios',
        siglas: 'STRM / Sindicatos de Telecomunicaciones',
        sensibilidad: ['internet', 'fibra', 'red', 'conectividad', 'digital', 'antena', 'camara'],
        pliegoBase: 'Regulación clara en derecho de vía para tendido de fibra óptica y postes; protección a técnicos frente a extorsiones en colonias de alta incidencia delictiva.',
        liderTestimonio: 'Los instaladores enfrentan cobro de piso para entrar a ciertas colonias. Requerimos garantías de patrullaje policial para tender la red del municipio.'
      },
      {
        id: 'comerciantes',
        gremio: 'Uniones de Comerciantes y Mercados',
        siglas: 'Uniones de Tianguistas y Locatarios',
        sensibilidad: ['tianguis', 'mercado', 'comercio', 'vendedor', 'local', 'puesto', 'abasto'],
        pliegoBase: 'Cero reubicaciones forzosas, respeto a los días tradicionales de plaza de tianguis, tarifas justas de derechos de piso y mantenimiento eléctrico en mercados públicos.',
        liderTestimonio: 'No permitiremos que nos retiren de nuestros espacios de venta con el pretexto de obras. El comercio popular mantiene a miles de familias de este municipio.'
      },
      {
        id: 'campesinos',
        gremio: 'Campesinos y Ejidos',
        siglas: 'CNC / Comisariados Ejidales',
        sensibilidad: ['campo', 'ejido', 'agro', 'riego', 'tierra', 'cosecha', 'rural', 'forestal'],
        pliegoBase: 'Defensa de concesiones de pozos agrícolas, abasto de fertilizante subsidiado a tiempo, apoyo ante sequías y freno a la invasión urbana de tierras ejidales.',
        liderTestimonio: 'Los campesinos no cederemos los derechos de agua de riego para desarrollos inmobiliarios si no se garantizan cosechas protegidas y subsidios emergentes.'
      },
      {
        id: 'policias',
        gremio: 'Asociaciones Policiales y Seguridad',
        siglas: 'Cuerpos Policiales y Guardia Municipal',
        sensibilidad: ['policia', 'seguridad', 'patrulla', 'c5', 'arma', 'delito', 'chaleco'],
        pliegoBase: 'Seguro de vida digno para elementos operativos, uniformes y chalecos balísticos certificados, aumento salarial por turnos extraordinarios y defensa jurídica institucional.',
        liderTestimonio: 'Para pacificar los cuadrantes se requiere respaldo jurídico y armamento adecuado. Los uniformados apoyamos iniciativas de orden, pero exigimos prestaciones justas.'
      }
    ];

    // Evaluar cada fuerza gremial
    const fuerzasEvaluadas = FUERZAS_BASE.map(f => {
      // Coincidencia con palabras clave
      const match = f.sensibilidad.some(s => txt.includes(s));
      let favor = 55;
      let contra = 25;
      let neutro = 20;
      let nivelRiesgo = 'Medio';

      if (match) {
        if (esPunitivo) {
          contra = Math.min(Math.round(65 + Math.random() * 20), 92);
          favor = Math.max(Math.round(12 + Math.random() * 8), 5);
          neutro = 100 - contra - favor;
          nivelRiesgo = contra >= 75 ? 'Crítico' : 'Alto';
        } else if (esBeneficio) {
          favor = Math.min(Math.round(68 + Math.random() * 18), 88);
          contra = Math.max(Math.round(10 + Math.random() * 10), 6);
          neutro = 100 - favor - contra;
          nivelRiesgo = 'Bajo';
        } else {
          favor = Math.round(48 + Math.random() * 15);
          contra = Math.round(30 + Math.random() * 12);
          neutro = 100 - favor - contra;
          nivelRiesgo = contra >= 40 ? 'Alto' : 'Medio';
        }
      } else {
        // Gremio colateral
        favor = Math.round(50 + (Math.random() * 10 - 5));
        contra = Math.round(24 + (Math.random() * 8 - 4));
        neutro = 100 - favor - contra;
        nivelRiesgo = 'Bajo';
      }

      let postura = 'A Favor';
      if (contra > favor) postura = 'En Contra';
      else if (favor < 52) postura = 'Reserva Crítica / Negociación';

      return {
        id: f.id,
        gremio: f.gremio,
        siglas: f.siglas,
        postura,
        favor,
        contra,
        neutro,
        nivelRiesgo,
        esAfectadoDirecto: match,
        pliegoPetitorio: f.pliegoBase,
        liderTestimonio: f.liderTestimonio
      };
    });

    // Calcular Semáforo de Riesgo de Paro / Bloqueo Vial (0-100)
    // Sindicatos de transporte, comerciantes y agua tienen mayor capacidad de colapso vial
    const pesoTransporte = fuerzasEvaluadas.find(f => f.id === 'transporte')?.contra || 25;
    const pesoComercio = fuerzasEvaluadas.find(f => f.id === 'comerciantes')?.contra || 25;
    const pesoAgua = fuerzasEvaluadas.find(f => f.id === 'agua_limpia')?.contra || 20;
    const promedioContraGlobal = Math.round(fuerzasEvaluadas.reduce((acc, f) => acc + f.contra, 0) / fuerzasEvaluadas.length);

    let riesgoParoScore = Math.round(
      (pesoTransporte * 0.40) +
      (pesoComercio * 0.30) +
      (pesoAgua * 0.15) +
      (promedioContraGlobal * 0.15)
    );
    riesgoParoScore = Math.max(8, Math.min(96, riesgoParoScore));

    let semaforo = 'Verde';
    let semaforoTexto = 'Riesgo Mínimo de Movilización Gremial';
    let dictamenSindical = `Clima gremial estable en ${municipio}. No se detectan focos rojos de huelga ni emplazamientos de bloqueo vial por parte de las 12 fuerzas gremiales.`;

    if (riesgoParoScore >= 65) {
      semaforo = 'Rojo';
      semaforoTexto = 'Alerta Máxima: Riesgo Inminente de Paro y Bloqueo Vial';
      dictamenSindical = `PELIGRO DE PARÁLISIS URBANA EN ${municipio.toUpperCase()}: Se detecta rechazo frontal en sectores neurálgicos (Transporte y/o Comerciantes). Alta probabilidad de bloqueos en accesos carreteros y suspensión de servicios si no se activan mesas de concertación inmediatas.`;
    } else if (riesgoParoScore >= 40) {
      semaforo = 'Amarillo';
      semaforoTexto = 'Alerta Preventiva: Fricción Sindical Focalizada';
      dictamenSindical = `TENSIÓN GREMIAL MODERADA EN ${municipio.toUpperCase()}: Resistencia de comités sindicales específicos que exigen garantías sobre contratos colectivos y esquemas tarifarios. Requiere negociación previa.`;
    }

    return {
      riesgoParoScore,
      semaforo,
      semaforoTexto,
      dictamenSindical,
      totalFuerzas: fuerzasEvaluadas.length,
      fuerzas: fuerzasEvaluadas
    };
  }
}

module.exports = new UnionsEngine();
