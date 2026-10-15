// Motor de Inteligencia Electoral y Micro-Targeting Territorial 2027-2030
// Simulación Predictiva, Batería de Propuestas con Viabilidad Ramo 28/33,
// Alianzas con 12 Fuerzas Sindicales y Manual de Campaña Segmentado

const {
  COLONIAS_DATA,
  getColoniasByMunicipio,
  getColoniasStats,
  getMunicipiosDisponibles,
  filterColoniasByPrioridad
} = require('../data/coloniasData');

const {
  MUNICIPIOS_DATOS_OFICIALES
} = require('../data/officialGovernmentData');

class ElectoralRadarEngine {
  constructor() {
    this.name = 'Motor del Radar Electoral 2027-2030 y Micro-Targeting GovTech';
    this.version = '2.0.0';
  }

  /**
   * Ciclos Electorales Vigentes y Proyectados
   */
  getCiclosElectorales() {
    return [
      {
        id: '2027',
        nombre: 'Elecciones Concurrentes del 6 de Junio de 2027',
        fechaJornada: '2027-06-06',
        tipo: 'Elección Intermedia Federal y Ordinaria Local',
        cargosEnJuego: [
          'Presidente Municipal / Alcalde',
          'Regidor',
          'Diputado Local',
          'Diputado Federal'
        ],
        contextoPolitico: 'Mitad de sexenio federal y estatal en el Estado de México. Se renuevan los 125 Ayuntamientos mexiquenses, las 75 diputaciones locales de la XLII Legislatura del Congreso del Edomex y las 500 diputaciones federales de la LXVII Legislatura del H. Congreso de la Unión. Escenario de evaluación de gobernanza y rebalanceo de alianzas partidistas.',
        duracionCampanaDias: 60,
        padronEstimadoEdomex: 13245000,
        listaNominalEstimadaEdomex: 12890000,
        tasaParticipacionEsperada: 52.4
      },
      {
        id: '2030',
        nombre: 'Elecciones Concurrentes Federales y Estatales de Junio de 2030',
        fechaJornada: '2030-06-02',
        tipo: 'Gran Relevo Sexenal Federal y Gubernatura de Edomex',
        cargosEnJuego: [
          'Presidente Municipal / Alcalde',
          'Regidor',
          'Diputado Local',
          'Diputado Federal',
          'Senador',
          'Gobernador'
        ],
        contextoPolitico: 'Gran jornada concurrente donde se renueva la Presidencia de la República, la Gubernatura del Estado de México (periodo 2030-2036), la totalidad del Senado de la República (128 escaños), la Cámara de Diputados, el Congreso Local y los 125 Ayuntamientos. Máxima participación histórica impulsada por la contienda presidencial y el cambio de Poder Ejecutivo estatal.',
        duracionCampanaDias: 90,
        padronEstimadoEdomex: 13950000,
        listaNominalEstimadaEdomex: 13580000,
        tasaParticipacionEsperada: 64.8
      }
    ];
  }

  /**
   * Catálogo de Cargos con Marco Legal y Facultades Presupuestales
   */
  getCargosElectorales() {
    return [
      {
        id: 'alcalde',
        cargo: 'Presidente Municipal / Alcalde',
        ambito: 'Municipal (Ayuntamiento)',
        fundamentoConstitucional: 'Artículo 115 de la Constitución Política de los Estados Unidos Mexicanos y Ley Orgánica Municipal del Estado de México.',
        atribucionesPrincipales: [
          'Prestación y administración directa de servicios públicos: agua potable, drenaje, alcantarillado, alumbrado, limpia, recolección y panteones.',
          'Mando directo de la policía preventiva municipal y tránsito local.',
          'Administración de la hacienda municipal y ejecución de fondos federales transferidos (Ramos 28 y 33).',
          'Emisión de bandos municipales y licencias de operación comercial y desarrollo urbano.'
        ],
        mecanismosPresupuestales: {
          ramo28: 'Participaciones Federales: Ingresos no etiquetados de libre disposición para gasto corriente, programas sociales de ventanilla y servicios públicos operativos.',
          ramo33: 'Aportaciones Federales Etiquetadas: FAISMUN (agua potable, drenaje, electrificación, pavimentación en polígonos marginados) y FORTAMUN-DF (seguridad pública, salarios policiales, patrullas, cámaras C4 y pago de derechos de agua).',
          ingresosPropios: 'Impuesto predial, derechos de suministro de agua potable (ODAPAS/SAPASA) y licencias mercantiles.'
        }
      },
      {
        id: 'regidor',
        cargo: 'Regidor',
        ambito: 'Cuerpo Edilicio Municipal (Cabildo)',
        fundamentoConstitucional: 'Artículo 115, Fracción I Constitucional y Artículos 48 a 55 de la Ley Orgánica Municipal del Edomex.',
        atribucionesPrincipales: [
          'Voto y deliberación en el Cabildo municipal para aprobar el Presupuesto de Egresos y Bando Municipal.',
          'Presidencia y secretaría de comisiones edilicias: Agua Potable, Seguridad Pública, Ecología y Medio Ambiente, Desarrollo Urbano, Comercio y Mercados.',
          'Fiscalización permanente del destino de los recursos del FAISMUN y FORTAMUN-DF.',
          'Vínculo institucional directo con delegados vecinales, COPACIS y uniones gremiales.'
        ],
        mecanismosPresupuestales: {
          ramo28: 'Presupuesto de operación edilicia, comisiones de supervisión y gestión comunitaria barrial.',
          ramo33: 'Facultad de dictaminar y auditar en Cabildo la priorización de obras públicas financiadas con FAISMUN.',
          ingresosPropios: 'Vigilancia de la recaudación y aplicación justa de tarifas de agua y predial sin abusos.'
        }
      },
      {
        id: 'diputado_local',
        cargo: 'Diputado Local',
        ambito: 'Distrito Electoral Local / Congreso del Estado de México',
        fundamentoConstitucional: 'Artículos 39 al 61 de la Constitución Política del Estado Libre y Soberano de México.',
        atribucionesPrincipales: [
          'Aprobación anual del Paquete Fiscal del Estado de México (Ley de Ingresos y Presupuesto de Egresos Estatal).',
          'Reforma al Código Penal del Edomex (tipificación de delitos como huachicoleo de agua y extorsión a comerciantes).',
          'Fiscalización de cuentas públicas municipales y estatales mediante el Órgano Superior de Fiscalización del Edomex (OSFEM).',
          'Gestión de fondos y obras de impacto metropolitano con la Secretaría de Finanzas y Secretaría del Agua estatal.'
        ],
        mecanismosPresupuestales: {
          ramo28: 'Supervisión de fórmulas de distribución de participaciones a los 125 municipios en el Código Financiero estatal.',
          ramo33: 'Fiscalización de fondos estatales y concurrentes: FAFEF (Fortalecimiento de Entidades) y FASP (Seguridad).',
          presupuestoEstatal: 'Etiquetado directo de recursos en el Presupuesto de Egresos del Estado de México para programas distritales.'
        }
      },
      {
        id: 'diputado_federal',
        cargo: 'Diputado Federal',
        ambito: 'Distrito Electoral Federal / Cámara de Diputados de San Lázaro',
        fundamentoConstitucional: 'Artículos 50 al 74 de la Constitución Política de los Estados Unidos Mexicanos.',
        atribucionesPrincipales: [
          'Facultad exclusiva de aprobación, discusión y modificación del Presupuesto de Egresos de la Federación (PEF).',
          'Etiquetado directo de techos financieros de los Ramos 28, 33 y convenios de reasignación presupuestaria.',
          'Reforma a la Ley de Aguas Nacionales, Ley General de Asentamientos Humanos y Ley de Coordinación Fiscal.',
          'Control y fiscalización federal a través de la Auditoría Superior de la Federación (ASF).'
        ],
        mecanismosPresupuestales: {
          ramo28: 'Aprobación del monto global de Recaudación Federal Participable (RFP) transferida a estados y municipios.',
          ramo33: 'Etiquetado multimillonario de los 8 fondos federales (FAISMUN, FORTAMUN-DF, FASSA, FONE, FASP, FAFEF, FISE).',
          ramo23: 'Fondos de infraestructura metropolitana y contingencias hidrometeorológicas.'
        }
      },
      {
        id: 'senador',
        cargo: 'Senador',
        ambito: 'Representación Federal del Estado de México / Senado de la República',
        fundamentoConstitucional: 'Artículos 56 al 76 de la Constitución Política de los Estados Unidos Mexicanos.',
        atribucionesPrincipales: [
          'Garante del Pacto Federal y defensa de la soberanía hacendaria del Estado de México.',
          'Aprobación y ratificación de tratados y convenios internacionales sobre cambio climático, bonos verdes y transición ecológica (T-MEC, Acuerdo de París).',
          'Revisión y reforma a los convenios de cuencas hidrológicas interestatales (Acuerdo Lerma-Cutzamala CDMX-Edomex-Michoacán).',
          'Ratificación de mandos federales, seguridad nacional y reformas constitucionales profundas.'
        ],
        mecanismosPresupuestales: {
          pactoFiscal: 'Liderazgo en la Convención Nacional Hacendaria para elevar el porcentaje de asignación fiscal a Edomex.',
          fondosInternacionales: 'Atracción de fondos multilaterales verdes (BID, Banco Mundial, Fondo Verde del Clima) para cuencas hídricas metropolitanas.',
          ramo28_33: 'Negociación en el Pacto Federal para garantizar reglas de operación flexibles y blindadas contra recortes.'
        }
      },
      {
        id: 'gobernador',
        cargo: 'Gobernador',
        ambito: 'Poder Ejecutivo del Estado de México (Administración Pública Estatal)',
        fundamentoConstitucional: 'Artículos 65 al 80 de la Constitución Política del Estado de México.',
        atribucionesPrincipales: [
          'Conducción del Plan Estatal de Desarrollo y ejecución del presupuesto consolidado estatal (>380 mil millones MXN).',
          'Mando supremo de la Secretaría de Seguridad del Estado de México, C5 Toluca y C5 Ecatepec.',
          'Régimen de concesiones de transporte público masivo metropolitano (Mexibús, Mexicable, Tren Suburbano, Rutas concesionadas).',
          'Gestión macro-hidráulica a través de la Secretaría del Agua y CAEM, y coordinación metropolitana directa con la CDMX.'
        ],
        mecanismosPresupuestales: {
          ramo28: 'Recepción y dispersión equilibrada de Participaciones Federales a los 125 municipios del estado.',
          ramo33: 'Ejecución directa de fondos consolidados estatales: FAFEF (Infraestructura), FASP (Seguridad Estatal), FASSA (Salud IMSS-Bienestar).',
          ingresosEstatales: 'Recaudación de Impuesto sobre Nóminas (3%), Tenencia Vehicular y derechos estatales.',
          deudaSostenible: 'Emisión de Bonos Verdes y financiamiento estructurado para macro-obras hidráulicas y de movilidad.'
        }
      }
    ];
  }

  /**
   * Diagnóstico Oficial de las 6 Problemáticas Críticas del Municipio (.gob.mx)
   */
  getDiagnosticoProblematicas(municipio = 'Ecatepec de Morelos') {
    const dataOficial = MUNICIPIOS_DATOS_OFICIALES[municipio] || MUNICIPIOS_DATOS_OFICIALES['Ecatepec de Morelos'];

    return {
      municipio,
      fuenteValidadora: 'Plataforma Oficial de Datos Abiertos de México (.gob.mx / INEGI)',
      problematicas: [
        {
          id: 'conagua',
          institucion: 'CONAGUA (Comisión Nacional del Agua / SMN)',
          tema: 'Crisis Hídrica, Abatimiento de Acuíferos y Dependencia del Cutzamala',
          severidad: 'Crítica',
          indicadorClave: dataOficial.conagua?.deficitCutzamalaAfectacion || 'Reducción del 42% en caudal entregado y abatimiento de mantos acuíferos',
          estatusSequia: dataOficial.conagua?.estatusMonitorSequia || 'D2 (Sequía Severa)',
          coberturaRed: dataOficial.conagua?.coberturaRedAguaPotable || '78.5% nominal con tandeo intermitente',
          impactoPoblacional: 'Miles de familias en zonas altas y colonias consolidadas pagan sobreprecios de hasta $1,800 pesos a pipas particulares por suministro irregular.',
          fuenteUrl: 'https://smn.conagua.gob.mx/es/climatologia/monitor-de-sequia/monitor-de-sequia-en-mexico'
        },
        {
          id: 'sesnsp',
          institucion: 'SESNSP / ENSU INEGI (Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública)',
          tema: 'Inseguridad en Transporte Colectivo, Robo a Transeúnte y Extorsión Barrial',
          severidad: 'Crítica',
          indicadorClave: dataOficial.sesnsp?.tasaRoboTransportePublico || '48.2 carpetas de investigación por mes por cada 100 mil habitantes en transporte',
          percepcionInseguridad: dataOficial.inegi?.ensuPercepcionInseguridad || '88.7% de los ciudadanos se siente inseguro en su municipio',
          extorsion: dataOficial.sesnsp?.tasaExtorsionCobroPiso || 'Alta incidencia de extorsión a tianguistas, comerciantes y bases de combis',
          impactoPoblacional: 'El trayecto cotidiano al trabajo representa el mayor punto de vulnerabilidad física y despojo patrimonial para la clase trabajadora.',
          fuenteUrl: 'https://www.gob.mx/sesnsp/acciones-y-programas/datos-abiertos-de-incidencia-delictiva'
        },
        {
          id: 'coneval',
          institucion: 'CONEVAL (Consejo Nacional de Evaluación de la Política de Desarrollo Social)',
          tema: 'Pobreza Multidimensional y Carencia por Servicios Básicos en la Vivienda',
          severidad: 'Alta',
          indicadorClave: dataOficial.coneval?.porcentajePobrezaTotal || '43.5% de la población en situación de pobreza multidimensional',
          carenciaServiciosBasicos: dataOficial.coneval?.carencias?.serviciosBasicosAguaDrenaje || '31.2% carece de red de agua continua o drenaje pluvial conectado',
          rezagoSocialDetalle: `Pobreza extrema: ${dataOficial.coneval?.pobrezaExtrema || '6.8%'}; Carencia por acceso a seguridad social: ${dataOficial.coneval?.carencias?.seguridadSocial || '56.9%'}`,
          impactoPoblacional: 'Círculo vicioso de hacinamiento, falta de drenaje y calles de terracería que elevan gastos médicos familiares e impiden la plusvalía barrial.',
          fuenteUrl: 'https://www.coneval.org.mx/Medicion/Paginas/Pobreza-municipio-2020.aspx'
        },
        {
          id: 'profeco',
          institucion: 'PROFECO (Procuraduría Federal del Consumidor / PACIC)',
          tema: 'Carestía de la Canasta Básica, Inflación Alimentaria y Abuso en Gas LP',
          severidad: 'Media-Alta',
          indicadorClave: 'Variación de hasta un 21.4% en precio de canasta básica respecto a tiendas departamentales de CDMX',
          gasLpMonitoreo: 'Precios de gas LP en cilindro rebasan el precio tope oficial en colonias de la periferia con venta clandestina',
          impactoPoblacional: 'Las familias destinan más del 52% de su ingreso total únicamente a alimentos básicos y combustibles esenciales para cocinar y calentarse.',
          fuenteUrl: 'https://www.gob.mx/profeco'
        },
        {
          id: 'ensanut',
          institucion: 'ENSANUT / Secretaría de Salud / IMSS-Bienestar',
          tema: 'Carencia de Servicios de Salud y Desabasto de Medicamentos Esenciales',
          severidad: 'Alta',
          indicadorClave: dataOficial.coneval?.carencias?.serviciosSalud || '34.8% de habitantes sin afiliación ni cobertura efectiva a servicios de salud',
          desabastoRecetas: '4 de cada 10 pacientes en centros de salud de 1er nivel no surten su receta completa por falta de medicinas del cuadro básico',
          saturacionHospitalaria: 'Tiempos de espera de más de 3.5 horas en salas de urgencias y falta de clínicas especializadas en salud mental para jóvenes.',
          fuenteUrl: 'https://ensanut.insp.mx/'
        },
        {
          id: 'enut',
          institucion: 'ENUT INEGI (Encuesta Nacional sobre Uso del Tiempo y Movilidad)',
          tema: 'Tiempo Excesivo en Traslados Metropolitanos y Sobrecarga en Cuidados no Remunerados',
          severidad: 'Alta',
          indicadorClave: 'Traslados cotidianos de 2.5 a 4 horas diarias hacia centros de empleo en CDMX y corredores industriales',
          sobrecargaGenero: 'Mujeres mexiquenses dedican en promedio 42.8 horas semanales al trabajo de cuidados no remunerado (hijos, adultos mayores y enfermos)',
          gastoTransporte: dataOficial.inegi?.enighGastoTransporteHogar || '23.8% del ingreso mensual familiar absorbido por pasajes de combi y transbordos',
          fuenteUrl: 'https://www.inegi.org.mx/programas/enut/2019/'
        }
      ]
    };
  }

  /**
   * Batería de Propuestas Ganadoras con Viabilidad Legal, Presupuestal (Ramo 28/33) y % de Voto Proyectado
   */
  getBateriaPropuestas(cargo = 'Presidente Municipal / Alcalde', municipio = 'Ecatepec de Morelos') {
    const cargoNorm = (cargo || '').toLowerCase();

    // 1. PROPUESTAS PARA ALCALDE / PRESIDENTE MUNICIPAL
    if (cargoNorm.includes('alcalde') || cargoNorm.includes('presidente municipal') || cargoNorm.includes('ayuntamiento')) {
      return [
        {
          id: 'prop-alc-1',
          titulo: 'Cosecha Hídrica Municipal y Pozos Inteligentes con Telemetría',
          problematicaAtendida: 'CONAGUA - Crisis Hídrica y Pipas Clandestinas',
          resumen: 'Instalación de 1,200 sistemas de captación de agua de lluvia en escuelas, mercados y techumbres públicas, sumado a la rehabilitación profunda de pozos con sensores de telemetría para eliminar el huachicoleo de agua.',
          competenciaLegal: 'Artículo 115 Constitucional Fracc. III inc. a) y Fracc. V (Servicios Municipales de Agua y Saneamiento).',
          fuentePresupuestal: {
            ramo: 'Ramo 33 FAISMUN (Fondo de Aportaciones para la Infraestructura Social Municipal)',
            complemento: 'Ramo 28 Participaciones Federales (operación y telemetría)',
            viabilidad: '100% Viable. Las reglas del FAISMUN etiquetan expresamente las obras de agua potable y saneamiento como gasto prioritario sin generar deuda.',
            techoFinancieroEstimado: '$185,000,000 MXN anuales'
          },
          proyeccionVotoBoost: '+11.8%',
          porcentajeIntencionVotoNeto: 58.4,
          focoTerritorial: 'Bastiones y Swarm Battlegrounds con severo tandeo de agua'
        },
        {
          id: 'prop-alc-2',
          titulo: 'Corredores Seguros "Sendero Verde Conectado" y C4 Barrial',
          problematicaAtendida: 'SESNSP / ENSU - Inseguridad en Transporte Colectivo y Paraderos',
          resumen: 'Iluminación LED solar en 150 kilómetros de calles principales y paraderos de transporte, instalación de 2,500 cámaras conectadas con botón de auxilio directo a patrullas de cuadrante.',
          competenciaLegal: 'Artículo 115 Constitucional Fracc. III inc. b) y h) (Alumbrado público y Seguridad Preventiva Municipal).',
          fuentePresupuestal: {
            ramo: 'Ramo 33 FORTAMUN-DF (Fondo de Fortalecimiento de los Municipios)',
            complemento: 'Ramo 28 Participaciones Federales para sueldos de monitoristas',
            viabilidad: 'Completamente Legal. La Ley de Coordinación Fiscal obliga a destinar al menos el 20% del FORTAMUN-DF a equipamiento policial y tecnologías de videovigilancia.',
            techoFinancieroEstimado: '$220,000,000 MXN'
          },
          proyeccionVotoBoost: '+12.4%',
          porcentajeIntencionVotoNeto: 61.2,
          focoTerritorial: 'Battlegrounds y Zonas Críticas con asaltos matutinos a trabajadores'
        },
        {
          id: 'prop-alc-3',
          titulo: 'Ventanilla Única Digital y Blindaje "Cero Moches" a Comerciantes',
          problematicaAtendida: 'PROFECO / SESNSP - Extorsión y Trabas a la Economía Popular',
          resumen: 'Digitalización total de licencias de funcionamiento de bajo impacto en menos de 24 horas. Prohibición expresa de operativos punitivos arbitrarios y congelamiento de tarifas de derechos de piso.',
          competenciaLegal: 'Facultad reglamentaria del Ayuntamiento (Bando Municipal y Código Financiero Municipal).',
          fuentePresupuestal: {
            ramo: 'Ramo 28 Participaciones Federales (Gasto de Modernización Administrativa e Informática)',
            complemento: 'Ahorro por austeridad y eliminación de intermediarios en recaudación',
            viabilidad: 'Totalmente viable. No requiere endeudamiento y genera incremento del 14% en recaudación predial voluntaria por formalización ágil.',
            techoFinancieroEstimado: '$32,000,000 MXN'
          },
          proyeccionVotoBoost: '+8.6%',
          porcentajeIntencionVotoNeto: 54.7,
          focoTerritorial: 'Mercados públicos, tianguis y corredores comerciales populares'
        },
        {
          id: 'prop-alc-4',
          titulo: 'Farmacias Populares Municipales y "Médico en tu Puerta"',
          problematicaAtendida: 'ENSANUT - Desabasto de Medicamentos y Carencia de Salud',
          resumen: 'Red de 15 farmacias comunitarias con cuadro básico de 80 medicamentos esenciales gratuitos para adultos mayores y personas en situación de vulnerabilidad, respaldada con 10 ambulancias de visita médica domiciliaria.',
          competenciaLegal: 'Art. 115 Constitucional Fracc. III y Convenio de Colaboración con IMSS-Bienestar e ISEM.',
          fuentePresupuestal: {
            ramo: 'Ramo 28 Participaciones Federales (Programas Sociales Municipales)',
            complemento: 'Convenio de Subsidio en Especie con la Secretaría de Salud Federal',
            viabilidad: 'Viable mediante fideicomiso social municipal auditado por comités ciudadanos.',
            techoFinancieroEstimado: '$65,000,000 MXN anuales'
          },
          proyeccionVotoBoost: '+9.9%',
          porcentajeIntencionVotoNeto: 57.2,
          focoTerritorial: 'Colonias con alta concentración de personas mayores de 60 años y familias sin IMSS'
        }
      ];
    }

    // 2. PROPUESTAS PARA REGIDOR
    if (cargoNorm.includes('regidor') || cargoNorm.includes('cabildo')) {
      return [
        {
          id: 'prop-reg-1',
          titulo: 'Comisión de Vigilancia y Cabildo Abierto: Transparencia FAISMUN',
          problematicaAtendida: 'CONEVAL / SHCP - Fiscalización del Dinero Público',
          resumen: 'Reglamento de Cabildo Abierto que obliga a sesionar en plazas públicas de colonias prioritarias y somete a votación de los vecinos el catálogo de obras FAISMUN cada trimestre.',
          competenciaLegal: 'Art. 115 Constitucional y Art. 48 de la Ley Orgánica Municipal del Edomex.',
          fuentePresupuestal: {
            ramo: 'Ramo 28 Participaciones (Operación del Cabildo)',
            complemento: 'Presupuesto participativo municipal',
            viabilidad: '100% Viable. Es potestad exclusiva de los regidores emitir y modificar reglamentos internos del Cabildo sin costo presupuestal extraordinario.',
            techoFinancieroEstimado: '$5,000,000 MXN para plataformas de consulta abierta'
          },
          proyeccionVotoBoost: '+6.8%',
          porcentajeIntencionVotoNeto: 52.3,
          focoTerritorial: 'Líderes de COPACIS, asambleas de colonos y comités vecinales'
        },
        {
          id: 'prop-reg-2',
          titulo: 'Reglamento Municipal de Bienestar Animal y Esterilización Comunitaria Gratuita',
          problematicaAtendida: 'Salud Pública Municipal y Demanda Juvenil / Familiar',
          resumen: 'Creación de unidades móviles permanentes de vacunación y esterilización para caninos y felinos comunitarios, y sanciones severas al maltrato animal tipificadas en el Bando Municipal.',
          competenciaLegal: 'Reglamento de Bienestar Animal Municipal derivado del Código para la Biodiversidad del Edomex.',
          fuentePresupuestal: {
            ramo: 'Ramo 28 Participaciones (Medio Ambiente y Servicios Urbanos)',
            complemento: 'Alianzas con facultades de veterinaria y asociaciones protectoras',
            viabilidad: 'Alta viabilidad. Respaldo unánime de votantes jóvenes y familias pet-friendly.',
            techoFinancieroEstimado: '$12,000,000 MXN'
          },
          proyeccionVotoBoost: '+7.4%',
          porcentajeIntencionVotoNeto: 55.6,
          focoTerritorial: 'Jóvenes de 18 a 29 años y colonias con sobrepoblación canina'
        },
        {
          id: 'prop-reg-3',
          titulo: 'Blindaje e Infraestructura en Mercados Tradicionales y Tianguis',
          problematicaAtendida: 'PROFECO / Seguridad - Respaldo al Comercio Popular',
          resumen: 'Dictamen de Cabildo para etiquetar recursos anuales a la rehabilitación eléctrica, techumbres y drenajes de mercados públicos, protegiendo los derechos de antigüedad de los locatarios.',
          competenciaLegal: 'Reglamentación de Mercados y Comercio en Vía Pública del Municipio.',
          fuentePresupuestal: {
            ramo: 'Ramo 33 FAISMUN (Infraestructura Social) + Ramo 28',
            complemento: 'Derechos de piso reinvertidos al 100% en los propios mercados',
            viabilidad: 'Totalmente viable. Garantiza la paz social con uniones de comerciantes.',
            techoFinancieroEstimado: '$28,000,000 MXN'
          },
          proyeccionVotoBoost: '+8.1%',
          porcentajeIntencionVotoNeto: 56.4,
          focoTerritorial: 'Centros de abasto, tianguis sobre ruedas y uniones de locatarios'
        }
      ];
    }

    // 3. PROPUESTAS PARA DIPUTADO LOCAL
    if (cargoNorm.includes('local') || cargoNorm.includes('congreso del estado')) {
      return [
        {
          id: 'prop-loc-1',
          titulo: 'Ley de Tarifa Cero para Estudiantes y 65+ en Mexibús y Mexicable',
          problematicaAtendida: 'ENUT / INEGI - Gasto y Tiempo en Transporte Metropolitano',
          resumen: 'Reforma a la Ley de Movilidad del Estado de México para garantizar gratuidad universal en toda la red de Mexibús y Mexicable a estudiantes acreditados y adultos mayores de 65 años, financiado con el Fondo Estatal de Movilidad Sustentable.',
          competenciaLegal: 'Artículos 61 y 62 de la Constitución del Estado de México (Facultad Legislativa Estatal).',
          fuentePresupuestal: {
            ramo: 'Presupuesto de Egresos del Estado de México (PEEM) / FAFEF (Ramo 33 Estatal)',
            complemento: 'Fideicomiso Estatal de Subsidio al Transporte Público Masivo',
            viabilidad: 'Completamente viable. El impacto presupuestal está proyectado en $380 millones anuales cubiertos con el excedente de recaudación del Impuesto Sobre Nóminas.',
            techoFinancieroEstimado: '$380,000,000 MXN estatales'
          },
          proyeccionVotoBoost: '+13.2%',
          porcentajeIntencionVotoNeto: 62.8,
          focoTerritorial: 'Corredores metropolitanos de alta densidad estudiantil y obrera'
        },
        {
          id: 'prop-loc-2',
          titulo: 'Prisión Oficiosa y Decomiso al Huachicoleo de Agua y Pipas Clandestinas',
          problematicaAtendida: 'CONAGUA / SESNSP - Lucro Ilegal con el Desabasto Hídrico',
          resumen: 'Reforma al Código Penal del Estado de México para elevar a delito grave con prisión oficiosa de 6 a 12 años la extracción ilícita de pozos públicos, el sabotaje de válvulas y el cobro especulativo por agua potable.',
          competenciaLegal: 'Artículo 61 Fracc. I de la Constitución Local (Materia Penal Sustantiva).',
          fuentePresupuestal: {
            ramo: 'Presupuesto Operativo de la Fiscalía General de Justicia del Edomex (FGJEM)',
            complemento: 'Ramo 33 FASP (Fondo de Aportaciones para la Seguridad Pública)',
            viabilidad: 'Cero costo presupuestal extraordinario. Impacto disuasivo inmediato sobre mafias de pipas.',
            techoFinancieroEstimado: '$15,000,000 MXN para unidad de inteligencia ministerial hídrica'
          },
          proyeccionVotoBoost: '+14.5%',
          porcentajeIntencionVotoNeto: 64.9,
          focoTerritorial: 'Toda la zona conurbada que sufre de cortes y extorsión por pipas'
        },
        {
          id: 'prop-loc-3',
          titulo: 'Fondo Estatal de Cuidados y Casas de Respiro para Cuidadoras (SEC-Edomex)',
          problematicaAtendida: 'ENUT INEGI - Sobrecarga en Mujeres Cuidadoras',
          resumen: 'Creación de la Ley del Sistema Integral de Cuidados del Edomex, dotando de un apoyo bimestral directo y centros diurnos de respiro para mujeres que cuidan a personas con discapacidad o adultos mayores.',
          competenciaLegal: 'Constitución Política del Edomex y Ley de Desarrollo Social Estatal.',
          fuentePresupuestal: {
            ramo: 'Presupuesto de Egresos del Estado de México (Ramo Social)',
            complemento: 'Ramo 33 FAISMUN (en la parte de infraestructura comunitaria)',
            viabilidad: 'Viable. Compatible con las directrices nacionales de la política social de género.',
            techoFinancieroEstimado: '$520,000,000 MXN estatales'
          },
          proyeccionVotoBoost: '+10.8%',
          porcentajeIntencionVotoNeto: 59.1,
          focoTerritorial: 'Madres de familia, cuidadoras y jefas de hogar del distrito'
        }
      ];
    }

    // 4. PROPUESTAS PARA DIPUTADO FEDERAL
    if (cargoNorm.includes('federal') || cargoNorm.includes('san lázaro') || cargoNorm.includes('cámara de diputados')) {
      return [
        {
          id: 'prop-fed-1',
          titulo: 'Etiquetado en el PEF: Fondo Metropolitano de Infraestructura Hídrica (FAISMUN Plus)',
          problematicaAtendida: 'CONAGUA - Sustitución Total de Colectores y Redes Fracturadas',
          resumen: 'Etiquetado directo en el Anexo del Presupuesto de Egresos de la Federación de una partida extraordinaria de $3,500 millones de pesos para sustituir 400 kilómetros de tuberías obsoletas y colectores colapsados en el Valle de México y Toluca.',
          competenciaLegal: 'Artículo 74 Fracción IV de la Constitución Federal (Facultad Exclusiva para Aprobar el PEF).',
          fuentePresupuestal: {
            ramo: 'Ramo 33 Aportaciones Federales (FAISMUN componente hídrico metropolitano)',
            complemento: 'Ramo 16 Medio Ambiente y Recursos Naturales (CONAGUA)',
            viabilidad: 'Plena viabilidad en la Cámara de Diputados durante la discusión presupuestal de noviembre.',
            techoFinancieroEstimado: '$3,500,000,000 MXN federales'
          },
          proyeccionVotoBoost: '+13.8%',
          porcentajeIntencionVotoNeto: 63.4,
          focoTerritorial: 'Distritos conurbados con inundaciones o colapso de red de agua'
        },
        {
          id: 'prop-fed-2',
          titulo: 'Reforma a la Ley de Coordinación Fiscal: Aumento al 25% del Fondo FORTAMUN',
          problematicaAtendida: 'SESNSP - Salarios Dignos y Blindaje a Policías Municipales',
          resumen: 'Iniciativa para reformar el Art. 37 de la Ley de Coordinación Fiscal, aumentando el porcentaje de asignación territorial y blindando salarios mínimos de $16,000 pesos netos mensuales más seguro de vida a los policías municipales.',
          competenciaLegal: 'Art. 73 Fracc. VII y Art. 74 Fracc. IV Constitucional.',
          fuentePresupuestal: {
            ramo: 'Ramo 33 FORTAMUN-DF',
            complemento: 'Recaudación Federal Participable',
            viabilidad: 'Alta viabilidad legislativa. Consenso interpartidista sobre fortalecimiento de policías locales.',
            techoFinancieroEstimado: '$1,200,000,000 MXN adicionales para Edomex'
          },
          proyeccionVotoBoost: '+11.5%',
          porcentajeIntencionVotoNeto: 60.1,
          focoTerritorial: 'Distritos electorales de alta incidencia delictiva'
        },
        {
          id: 'prop-fed-3',
          titulo: 'Fondo Nacional de Electrificación de Flotas y Chatarrización de Combis',
          problematicaAtendida: 'ENUT / Calidad del Aire - Modernización Sustentable del Transporte',
          resumen: 'Línea de crédito con tasa subsidiada del 0% a través de BANOBRAS y Nacional Financiera para concesionarios de transporte colectivo que sustituyan unidades a gasolina por vans y autobuses 100% eléctricos.',
          competenciaLegal: 'Ley de Transición Energética y Ley de Ingresos de la Federación.',
          fuentePresupuestal: {
            ramo: 'BANOBRAS / Fideicomisos de Energía Sustentable (FOTEASE)',
            complemento: 'Ramo 23 Provisiones Salariales y Económicas',
            viabilidad: 'Viable en coordinación con la Secretaría de Hacienda y gremios de transportistas.',
            techoFinancieroEstimado: '$2,000,000,000 MXN en garantías bursátiles'
          },
          proyeccionVotoBoost: '+9.4%',
          porcentajeIntencionVotoNeto: 57.8,
          focoTerritorial: 'Rutas concesionadas de transporte y zonas con alta contaminación'
        }
      ];
    }

    // 5. PROPUESTAS PARA SENADOR
    if (cargoNorm.includes('senador') || cargoNorm.includes('senado')) {
      return [
        {
          id: 'prop-sen-1',
          titulo: 'Acuerdo Interestatal de Cuencas: Rebalanceo Hídrico Lerma-Cutzamala',
          problematicaAtendida: 'CONAGUA - Justicia Hídrica para el Estado de México',
          resumen: 'Impulso en el Senado de la República de un nuevo Convenio de Coordinación Interestatal entre la CDMX, el Estado de México y Michoacán para que por cada litro extraído de suelo mexiquense, se compense con inversión directa en infraestructura local y reforestación de cuenca.',
          competenciaLegal: 'Artículo 76 Constitucional (Solución y Ratificación de Convenios Interestatales).',
          fuentePresupuestal: {
            ramo: 'Fondo Metropolitano Hídrico Interestatal',
            complemento: 'Ramo 16 CONAGUA y contraprestaciones del Gobierno de la CDMX',
            viabilidad: '100% Constitucional. Atribución prioritaria de los senadores de la República.',
            techoFinancieroEstimado: '$4,200,000,000 MXN plurianuales'
          },
          proyeccionVotoBoost: '+12.7%',
          porcentajeIntencionVotoNeto: 61.9,
          focoTerritorial: 'Todo el electorado del Estado de México con énfasis en zonas de recarga y conurbadas'
        },
        {
          id: 'prop-sen-2',
          titulo: 'Atracción de Fondos Verdes Multilaterales para Transporte Limpio y Bosques',
          problematicaAtendida: 'Medio Ambiente y Cambio Climático Metropolitano',
          resumen: 'Ratificación de convenios internacionales de financiamiento no reembolsable con el Fondo Verde del Clima (GCF) y Banco Interamericano de Desarrollo (BID) para la preservación de la Sierra de Guadalupe, Nevado de Toluca y el Gran Bosque de Agua.',
          competenciaLegal: 'Artículo 76 Fracción I Constitucional (Política Exterior y Tratados Internacionales).',
          fuentePresupuestal: {
            ramo: 'Cooperación Internacional para el Desarrollo (AMEXCID / Fondo Verde del Clima)',
            complemento: 'Recursos no computables como deuda pública soberana',
            viabilidad: 'Plena. Existe portafolio disponible de financiamiento verde internacional para mega-metrópolis.',
            techoFinancieroEstimado: '$250,000,000 USD de cooperación verde'
          },
          proyeccionVotoBoost: '+8.9%',
          porcentajeIntencionVotoNeto: 56.4,
          focoTerritorial: 'Sectores ambientalistas, académicos, profesionistas y jóvenes de todo el estado'
        }
      ];
    }

    // 6. PROPUESTAS PARA GOBERNADOR
    return [
      {
        id: 'prop-gob-1',
        titulo: 'Plan Maestro Hídrico 2030: "Agua Continua para los 125 Municipios"',
        problematicaAtendida: 'CONAGUA - Soberanía Hídrica Integral del Edomex',
        resumen: 'Construcción de 6 macro-plantas de potabilización y tratamiento terciario, rehabilitación de 450 pozos estatales y sustitución masiva de acueductos metropolitanos con inversión histórica tripartita.',
        competenciaLegal: 'Artículos 65 al 77 de la Constitución Política del Estado de México y Ley del Agua del Edomex.',
        fuentePresupuestal: {
          ramo: 'Ramo 33 FAFEF (Fondo de Fortalecimiento Estatal) + Emisión de Bonos Verdes',
          complemento: 'Ramo 33 FAISMUN municipal cofinanciado',
          viabilidad: 'Eje rector del Plan Estatal de Desarrollo 2030 con viabilidad presupuestal estructurada.',
          techoFinancieroEstimado: '$12,500,000,000 MXN sexenales'
        },
        proyeccionVotoBoost: '+15.4%',
        porcentajeIntencionVotoNeto: 65.8,
        focoTerritorial: 'Los 125 municipios del Edomex con prioridad crítica en Valle de México y Oriente'
      },
      {
        id: 'prop-gob-2',
        titulo: 'Mando Coordinado Metropolitano y 15,000 Nuevos Puntos C5 con Inteligencia Artificial',
        problematicaAtendida: 'SESNSP / ENSU - Erradicación de la Impunidad y Robo en Transporte',
        resumen: 'Conexión en tiempo real de todas las unidades de transporte concesionado a los C5 de Toluca y Ecatepec mediante botón de pánico, geolocalización satelital y cámaras de reconocimiento facial en paraderos.',
        competenciaLegal: 'Ley de Seguridad del Estado de México y Mando de la Policía Estatal.',
        fuentePresupuestal: {
          ramo: 'Ramo 33 FASP (Fondo de Aportaciones para la Seguridad Pública)',
          complemento: 'Presupuesto Directo de la Secretaría de Seguridad del Edomex',
          viabilidad: 'Altamente viable mediante compra consolidada y financiamiento público-privado auditado.',
          techoFinancieroEstimado: '$3,800,000,000 MXN'
        },
        proyeccionVotoBoost: '+14.1%',
        porcentajeIntencionVotoNeto: 63.7,
        focoTerritorial: 'Rutas intermunicipales, terminales de transporte y paraderos del Mexibús'
      },
      {
        id: 'prop-gob-3',
        titulo: 'Sistema Estatal de Cuidados Mexiquense (SEC-Edomex): Red de 300 Casas de Día y Guarderías',
        problematicaAtendida: 'ENUT / CONEVAL - Emancipación Económica de las Mujeres',
        resumen: 'Red universal de estancias infantiles, centros de cuidado diurno para adultos mayores y apoyo directo bimestral a cuidadoras familiares en las 8 regiones del Estado.',
        competenciaLegal: 'Constitución del Edomex y Ley de Desarrollo Social Estatal.',
        fuentePresupuestal: {
          ramo: 'Presupuesto de Egresos del Estado de México (Gasto Social Reorientado)',
          complemento: 'Ramo 33 FISE (Fondo de Infraestructura Social Estatal)',
          viabilidad: 'Completamente alineado a la política de bienestar con sustento en el Código Financiero.',
          techoFinancieroEstimado: '$2,400,000,000 MXN anuales'
        },
        proyeccionVotoBoost: '+12.6%',
        porcentajeIntencionVotoNeto: 61.5,
        focoTerritorial: 'Mujeres jefas de hogar, madres trabajadoras y familias con dependientes'
      }
    ];
  }

  /**
   * Postura y Alianzas de las 12 Fuerzas Sindicales Estratégicas en la Campaña
   */
  getAlianzasYSindicatos(municipio = 'Ecatepec de Morelos', cargo = 'Presidente Municipal / Alcalde') {
    const dataMuni = MUNICIPIOS_DATOS_OFICIALES[municipio] || MUNICIPIOS_DATOS_OFICIALES['Ecatepec de Morelos'];
    const padronBase = dataMuni.inegi?.poblacionCenso2020 || 1000000;
    const factorEscala = Math.max(0.4, Math.min(1.8, padronBase / 1000000));

    const FUERZAS_SINDICALES = [
      {
        id: 'transporte',
        gremio: 'Transporte Colectivo y Rutas Concesionadas',
        siglas: 'Alianzas de Choferes, Rutas, Combis y Taxis Edomex',
        afiliadosEstimados: Math.round(18500 * factorEscala),
        votosFamiliaresProyectados: Math.round(18500 * factorEscala * 3.1),
        posturaCampana: 'Fiel de la Balanza / Negociación Condicionada',
        pliegoPetitorio: 'No cancelación unilateral de derroteros, inclusión preferente en bonos de chatarrización eléctrica, subsidio al combustible y freno a la extorsión policial en paraderos.',
        compromisoRadar: 'Firma de Pacto de Modernización con Subsidio Cero Moches y mesa tripartita permanente sobre seguridad y conectividad alimentadora.',
        impactoParticipacionUrnas: '+4.8% de participación en corredores y paraderos clave',
        riesgoDeConflicto: 'Alto si se plantean corredores de Mexibús sin integración societaria de los concesionarios locales (riesgo de paros viales)',
        semaforoRiesgo: 'Alto',
        aliadoPrioritario: true
      },
      {
        id: 'comerciantes',
        gremio: 'Comerciantes, Tianguis y Mercados Públicos',
        siglas: 'Uniones de Tianguistas, Locatarios y Vendedores Tradicionales',
        afiliadosEstimados: Math.round(24000 * factorEscala),
        votosFamiliaresProyectados: Math.round(24000 * factorEscala * 3.3),
        posturaCampana: 'Aliado Estratégico',
        pliegoPetitorio: 'Cero desalojos en días de plaza, simplificación de licencias, techumbres y drenajes dignos en mercados, y operativos policiales contra cobro de piso.',
        compromisoRadar: 'Ventanilla Única Digital con licencias en 24h, congelamiento de derechos de piso y unidad ministerial especializada anti-extorsión.',
        impactoParticipacionUrnas: '+5.6% de voto territorial movilizado directamente por líderes de tianguis',
        riesgoDeConflicto: 'Medio-Alto si se imponen operativos policiacos fiscales sin concertación previa',
        semaforoRiesgo: 'Medio',
        aliadoPrioritario: true
      },
      {
        id: 'magisterio',
        gremio: 'Magisterio y Docentes de Educación Pública',
        siglas: 'SMSEM / SNTE (Secciones 17 y 36) / Docentes Edomex',
        afiliadosEstimados: Math.round(16200 * factorEscala),
        votosFamiliaresProyectados: Math.round(16200 * factorEscala * 2.9),
        posturaCampana: 'Aliado Estratégico',
        pliegoPetitorio: 'Seguridad en los entornos escolares al entrar y salir de turno vespertino, agua potable continua en planteles y techumbres en patios cívicos.',
        compromisoRadar: 'Programa Sendero Escolar Seguro con presencia policial fija y Cosecha de Lluvia en todas las escuelas públicas del municipio.',
        impactoParticipacionUrnas: '+3.9% de participación de familias organizadas a través de comités escolares',
        riesgoDeConflicto: 'Bajo. Gran afinidad con propuestas de bienestar familiar y escuelas sustentables.',
        semaforoRiesgo: 'Bajo',
        aliadoPrioritario: true
      },
      {
        id: 'burocratas',
        gremio: 'Burócratas y Servidores Públicos Municipales y Estatales',
        siglas: 'SUTEYM / FSTSE',
        afiliadosEstimados: Math.round(9800 * factorEscala),
        votosFamiliaresProyectados: Math.round(9800 * factorEscala * 3.0),
        posturaCampana: 'Negociación Condicionada',
        pliegoPetitorio: 'Respeto irrestricto al Contrato Colectivo de Trabajo, no recorte de plazas sindicalizadas, pago puntual de primas y homologación salarial.',
        compromisoRadar: 'Cero despidos de personal sindicalizado, estabilidad laboral frente a la digitalización de trámites y bono de productividad.',
        impactoParticipacionUrnas: '+3.2% de voto disciplinado en casillas cercanas a edificios administrativos',
        riesgoDeConflicto: 'Alto si se anuncian recortes drásticos de nómina municipal en campaña',
        semaforoRiesgo: 'Alto',
        aliadoPrioritario: false
      },
      {
        id: 'salud',
        gremio: 'Salud, Médicos, Enfermeras y Personal Hospitalario',
        siglas: 'SNTSA / SNTSS / Personal ISEM - IMSS-Bienestar',
        afiliadosEstimados: Math.round(7500 * factorEscala),
        votosFamiliaresProyectados: Math.round(7500 * factorEscala * 2.8),
        posturaCampana: 'Aliado Estratégico',
        pliegoPetitorio: 'Basificación definitiva de médicos y enfermeras suplentes, abasto al 100% de medicamentos e insumos de bioseguridad en clínicas de 1er nivel.',
        compromisoRadar: 'Coordinación con IMSS-Bienestar para abastecimiento médico continuo y apoyo municipal en transporte seguro para personal nocturno.',
        impactoParticipacionUrnas: '+2.8% de respaldo con alto valor moral en la comunidad',
        riesgoDeConflicto: 'Bajo. Respaldo general a las Farmacias Populares si no compiten con el cuadro médico oficial.',
        semaforoRiesgo: 'Bajo',
        aliadoPrioritario: true
      },
      {
        id: 'agua_limpia',
        gremio: 'Agua Potable, Drenaje, Válvulas y Limpia Pública',
        siglas: 'ODAPAS / CAEM / Cuadrillas de Limpia y Mantenimiento',
        afiliadosEstimados: Math.round(5400 * factorEscala),
        votosFamiliaresProyectados: Math.round(5400 * factorEscala * 3.4),
        posturaCampana: 'Aliado Estratégico',
        pliegoPetitorio: 'Nuevos camiones recolectores compactadores, equipo de protección para desazolve en temporada de lluvia, vacuna y bono de insalubridad.',
        compromisoRadar: 'Renovación de flota de camiones de basura, entrega de equipo hidráulico moderno y seguro de vida reforzado.',
        impactoParticipacionUrnas: '+3.5% de movilización de cuadrillas con presencia en cada calle y barrio',
        riesgoDeConflicto: 'Medio si se anuncian concesiones privadas del servicio de limpia o cobro de agua',
        semaforoRiesgo: 'Medio',
        aliadoPrioritario: true
      },
      {
        id: 'construccion',
        gremio: 'Construcción, Albañilería, Carga y Materialistas',
        siglas: 'CTM / Sindicatos de la Construcción y Transportistas de Material',
        afiliadosEstimados: Math.round(14200 * factorEscala),
        votosFamiliaresProyectados: Math.round(14200 * factorEscala * 3.2),
        posturaCampana: 'Negociación Condicionada',
        pliegoPetitorio: 'Contratación obligatoria de mano de obra y camiones de carga locales en toda obra financiada con FAISMUN, y precios justos de acarreo.',
        compromisoRadar: 'Padrón de Proveedores y Mano de Obra Municipal Local con asignación transparente de contratos de obra pública.',
        impactoParticipacionUrnas: '+4.1% de fuerza territorial en colonias periféricas y zonas de terracería',
        riesgoDeConflicto: 'Alto si se contratan constructoras foráneas para las obras de pavimentación y agua',
        semaforoRiesgo: 'Alto',
        aliadoPrioritario: false
      },
      {
        id: 'industria',
        gremio: 'Industria, Manufactura y Parques Industriales',
        siglas: 'CROC / CROM / FROC / Sindicatos Industriales',
        afiliadosEstimados: Math.round(19800 * factorEscala),
        votosFamiliaresProyectados: Math.round(19800 * factorEscala * 2.9),
        posturaCampana: 'Fiel de la Balanza',
        pliegoPetitorio: 'Seguridad en los accesos y paradas de los parques industriales, patrullaje en cambio de turno (madrugada y noche) y alumbrado funcional.',
        compromisoRadar: 'Sendero Industrial Protegido con presencia de la policía municipal en horarios de entrada y salida fabril.',
        impactoParticipacionUrnas: '+4.4% de voto obrero formal en corredores fabriles',
        riesgoDeConflicto: 'Bajo-Medio. Su interés prioritario es la seguridad en el trayecto laboral.',
        semaforoRiesgo: 'Bajo',
        aliadoPrioritario: true
      },
      {
        id: 'electricistas',
        gremio: 'Electricistas, Energía y Redes de Distribución',
        siglas: 'SME / SUTERM / Personal de Cuadrillas Eléctricas',
        afiliadosEstimados: Math.round(4800 * factorEscala),
        votosFamiliaresProyectados: Math.round(4800 * factorEscala * 3.0),
        posturaCampana: 'Fiel de la Balanza',
        pliegoPetitorio: 'Inclusión y certificación técnica sindical en la instalación de luminarias solares y proyectos fotovoltaicos municipales.',
        compromisoRadar: 'Convenio de capacitación técnica para cuadrillas en transición a luminarias solares LED inteligentes.',
        impactoParticipacionUrnas: '+2.1% en colonias con tradición obrera electricista',
        riesgoDeConflicto: 'Medio si se licitan proyectos solares con empresas privadas que excluyan técnicos locales',
        semaforoRiesgo: 'Medio',
        aliadoPrioritario: false
      },
      {
        id: 'telecom',
        gremio: 'Telecomunicaciones, Fibra Óptica y Servicios Digitales',
        siglas: 'STRM / Técnicos en Telecomunicaciones e Informática',
        afiliadosEstimados: Math.round(3600 * factorEscala),
        votosFamiliaresProyectados: Math.round(3600 * factorEscala * 2.8),
        posturaCampana: 'Aliado Estratégico',
        pliegoPetitorio: 'Garantías de seguridad física frente a extorsiones al momento de cablear e instalar postes en colonias de alta incidencia delictiva.',
        compromisoRadar: 'Protocolo de Acompañamiento Policial a Cuadrillas de Fibra Óptica y agilización de trámites de derecho de vía.',
        impactoParticipacionUrnas: '+1.6% de voto técnico especializado y multiplicador en redes sociales',
        riesgoDeConflicto: 'Bajo',
        semaforoRiesgo: 'Bajo',
        aliadoPrioritario: true
      },
      {
        id: 'campesinos',
        gremio: 'Campesinos, Núcleos Agrarios, Ejidatarios y Pozos de Riego',
        siglas: 'CNC / Comisariados Ejidales / Uniones de Riego',
        afiliadosEstimados: Math.round(6200 * factorEscala),
        votosFamiliaresProyectados: Math.round(6200 * factorEscala * 3.5),
        posturaCampana: 'Fiel de la Balanza / Negociación Condicionada',
        pliegoPetitorio: 'Defensa de las concesiones de agua agrícola, freno a la invasión irregular de tierras comunales y fertilizantes subsidiados a tiempo.',
        compromisoRadar: 'Defensa legal de los pozos ejidales, fondo de tecnificación de riego y preservación de zonas de amortiguamiento ambiental.',
        impactoParticipacionUrnas: '+3.1% de voto disciplinado en los pueblos originarios y zonas rurales',
        riesgoDeConflicto: 'Alto si se pretende extraer agua de pozos agrícolas para uso urbano sin indemnización',
        semaforoRiesgo: 'Alto',
        aliadoPrioritario: false
      },
      {
        id: 'policias',
        gremio: 'Asociaciones Policiales, Bomberos y Protección Civil',
        siglas: 'Cuerpos de Seguridad Pública Municipal y Guardia',
        afiliadosEstimados: Math.round(3200 * factorEscala),
        votosFamiliaresProyectados: Math.round(3200 * factorEscala * 3.1),
        posturaCampana: 'Negociación Condicionada / Respaldo Silencioso',
        pliegoPetitorio: 'Aumento salarial con FORTAMUN, chalecos balísticos certificados vigentes, seguro de vida de 1 millón de pesos y asesoría jurídica institucional.',
        compromisoRadar: 'Dignificación salarial, adquisición transparente de patrullas y defensa jurídica a elementos que actúen en cumplimiento del deber.',
        impactoParticipacionUrnas: '+2.0% de voto de personal operativo y familiares directos',
        riesgoDeConflicto: 'Crítico si la campaña estigmatiza de forma generalizada a los cuerpos policiales (riesgo de huelga de brazos caídos)',
        semaforoRiesgo: 'Alto',
        aliadoPrioritario: false
      }
    ];

    // Alianzas Civiles y Vecinales Complementarias
    const ALIANZAS_CIVILES = [
      {
        nombre: 'Comités Ciudadanos por el Agua y Comités de Pipas',
        representatividad: 'Líderes de manzana en zonas con tandeo crítico',
        potencialMovilizacion: 'Alta densidad en asambleas vecinales (15,000+ activistas)',
        accionCampana: 'Firmar acta notariada de compromiso presupuestal FAISMUN para pozos y líneas de conducción directa.'
      },
      {
        nombre: 'Consejos de Participación Ciudadana (COPACI) y Delegados Vecinales',
        representatividad: 'Autoridades auxiliares legalmente electas en cada colonia',
        potencialMovilizacion: 'Control institucional barrial de casillas y difusión de propuestas',
        accionCampana: 'Mesa de diálogo permanente y descentralización de presupuesto participativo de Cabildo.'
      },
      {
        nombre: 'Redes de Madres Cuidadoras y Colectivos de Búsqueda',
        representatividad: 'Mujeres jefas de familia organizadas contra la violencia y la sobrecarga de cuidados',
        potencialMovilizacion: 'Enorme fuerza moral y legitimidad en el voto femenino',
        accionCampana: 'Presentación del Fondo Estatal y Municipal de Cuidados y Casas de Respiro.'
      },
      {
        nombre: 'Colectivos Juveniles Ambientales, Estudiantiles y Ciclistas',
        representatividad: 'Jóvenes de 18 a 29 años universitarios y de preparatorias técnicas',
        potencialMovilizacion: 'Campaña digital viral, defensa del medio ambiente y voluntariado en brigadas verdes',
        accionCampana: 'Tarifa cero en transporte masivo, parques con internet WiFi 6 y adopción de áreas verdes.'
      }
    ];

    return {
      totalFuerzasSindicales: FUERZAS_SINDICALES.length,
      fuerzasSindicales: FUERZAS_SINDICALES,
      alianzasCiviles: ALIANZAS_CIVILES,
      totalVotosFamiliaresGremiales: FUERZAS_SINDICALES.reduce((acc, f) => acc + f.votosFamiliaresProyectados, 0),
      balanceGremial: {
        aliadosEstrategicos: FUERZAS_SINDICALES.filter(f => f.posturaCampana.includes('Aliado Estratégico')).length,
        fielesBalanza: FUERZAS_SINDICALES.filter(f => f.posturaCampana.includes('Fiel de la Balanza')).length,
        negociacionCondicionada: FUERZAS_SINDICALES.filter(f => f.posturaCampana.includes('Negociación Condicionada')).length
      }
    };
  }

  /**
   * Manual de Diseño de Campaña: Naming Ganador, Discursos Segmentados, Punto de Arranque y Proyección
   */
  generarManualCampana(municipio = 'Ecatepec de Morelos', cargo = 'Presidente Municipal / Alcalde', ciclo = '2027', candidato = 'Candidato Verde', coalicion = 'PVEM - Sigamos Haciendo Historia') {
    const colonias = getColoniasByMunicipio(municipio);
    const statsMuni = getColoniasStats(municipio);

    // Selección táctica del Punto de Arranque Territorial ("Banderazo de Salida")
    // Criterio: Colonia clasificada como "Zona Indecisa / Swarm Battleground" o "Bastión",
    // con alta población electoral y carencia crítica de agua o transporte donde la propuesta genera máximo impacto.
    let coloniaArranque = colonias.find(c =>
      (c.prioridadBrigada.includes('Battleground') || c.prioridadBrigada === 'Bastión Electoral') &&
      (c.carenciaPrincipal.toLowerCase().includes('agua') || c.carenciaPrincipal.toLowerCase().includes('inseguridad'))
    ) || colonias[0] || {
      nombre: 'San Cristóbal Centro',
      ageb: '012-4',
      carenciaPrincipal: 'Desabasto de agua y seguridad en transporte'
    };

    const namingGanador = {
      esloganPrincipal: `${municipio} Verde, Seguro y Con Futuro`,
      subClaim: `El poder de nuestra gente para transformar cada barrio y colonia`,
      hashtagsOficiales: [
        `#${municipio.replace(/\s+/g, '')}Verde`,
        `#ElCambioEsVerde${ciclo}`,
        `#AguaYSeguridadYa`,
        `#TuVozEnElCabildo`
      ],
      conceptoNarrativo: `Una campaña de territorio, no de escritorio. Centrada en resolver las 2 grandes heridas del municipio: el negocio inmoral de las pipas de agua y el miedo a subirse a la combi todos los días. Con propuestas presupuestales del Ramo 33 viables y verificables en mano, sin ocurrencias ni falsas promesas.`,
      paletaSimbólica: 'Verde Esperanza (#10B981) + Blanco Transparencia (#FFFFFF) + Dorado Pueblo (#F59E0B)'
    };

    const discursosSegmentados = {
      // 1. JÓVENES (18 A 29 AÑOS)
      jovenes18a29: {
        segmento: 'Jóvenes de 18 a 29 Años (Estudiantes, Emprendedores y Primer Empleo)',
        proporcionPadronAprox: '31.4% del padrón electoral',
        tonoYEstilo: 'Fresco, horizontal, empático, sin tecnicismos burocráticos ni discursos aburridos de templete. Conexión directa a través de causas: internet, libertad, salud mental, transporte seguro y medio ambiente.',
        fraseGanchoCTA: '¡No nos resignemos a vivir con miedo ni sin internet! Tu voto es la llave para un municipio moderno y verde.',
        ejesTematicosClave: [
          'Tarifa Cero para estudiantes en toda la red de Mexibús y transporte masivo.',
          'Plazas y parques públicos con Internet WiFi 6 de alta velocidad gratuito.',
          'Centros Jóvenes de Salud Mental y prevención de ansiedad sin citas burocráticas.',
          'Bolsa municipal de Primer Empleo Verde con estímulos fiscales a empresas locales.'
        ],
        guionDiscursoMitadDeCampana: `¡Hola a todas y todos los jóvenes de ${municipio}!
Sé perfectamente lo que nos dicen todos los días los políticos de siempre: que somos el futuro. Pero nosotros no queremos ser el futuro, ¡queremos vivir con dignidad y sin miedo en el presente!
¿Quién de ustedes no ha pasado dos o tres horas atrapado en una combi temiendo que le quiten el celular o la computadora que con tanto esfuerzo compraron sus papás? ¿Quién no ha batallado para estudiar porque en su colonia el internet no entra o la señal se cae?
Por eso vengo de frente a comprometerme con ustedes: con nuestro triunfo, ¡el Mexibús y el transporte masivo serán con Tarifa Cero para estudiantes! Vamos a convertir los parques de nuestras colonias en espacios con internet WiFi 6 libre, áreas deportivas limpias y centros donde hablar de salud mental no sea un tabú ni cueste un solo peso.
Este 6 de junio de ${ciclo}, no dejen que los mismos de siempre decidan el municipio en el que nos va a tocar vivir. ¡La fuerza joven va a pintar a ${municipio} de Verde y de esperanza!`
      },

      // 2. ADULTOS Y COMERCIANTES (30 A 49 AÑOS)
      adultosYComerciantes30a49: {
        segmento: 'Adultos, Jefes de Familia, Comerciantes y Empleados (30 a 49 Años)',
        proporcionPadronAprox: '42.8% del padrón electoral',
        tonoYEstilo: 'Certeza económica, respeto al trabajo honrado, defensa implacable del ingreso familiar y firmeza total contra la extorsión y el crimen.',
        fraseGanchoCTA: 'Por tu familia y por el patrimonio que construyes todos los días: ni un paso atrás, vamos a defender lo nuestro.',
        ejesTematicosClave: [
          'Agua entubada y pozos funcionales: fin al negocio millonario de las pipas clandestinas.',
          'Sendero Verde Seguro: patrullas con GPS y cámaras con IA en paraderos y combis.',
          'Cero moches e inspecciones corruptas: licencias digitales en 24h para tianguis y comercios.',
          'Guarderías y escuelas de tiempo completo con alimentación caliente para hijos de trabajadores.'
        ],
        guionDiscursoMitadDeCampana: `Vecinas y vecinos trabajadores de ${municipio}:
Ustedes son los que se levantan a las 4:30 de la mañana para abrir la accesoria, para poner el puesto en el tianguis, para subirse a la combi e ir a romperse el lomo a la fábrica o a la oficina. Y no se vale que la mitad del salario de la quincena se les vaya en pagar pipas de agua de $1,800 pesos porque de la llave no sale una sola gota. ¡El agua es un derecho humano, no el botín político de unos cuantos!
Por eso nuestro compromiso no son promesas al aire: es inversión presupuestal directa del Ramo 33 FAISMUN etiquetada pozo por pozo. Vamos a rehabilitar la red, a poner filtros purificadores y a encarcelar a quien lucre con el agua del pueblo.
Y a nuestros comerciantes les digo con toda claridad: en este gobierno se acabaron los inspectores que llegan a extorsionar y a pedir moche. Con nuestra Ventanilla Única Digital, su trámite se hace en 24 horas y nadie tiene derecho a clausurarles su esfuerzo.
Queremos que regresen en la noche a casa con la tranquilidad de que sus hijos están seguros y que el dinero rinde. ¡Por nuestras familias y por un ${municipio} seguro, vamos a ganar!`
      },

      // 3. ADULTOS MAYORES (65+ AÑOS)
      adultosMayores65Plus: {
        segmento: 'Adultos Mayores y Pensionados (65 Años y Más)',
        proporcionPadronAprox: '14.5% del padrón electoral (con la más alta tasa de participación en urnas >68%)',
        tonoYEstilo: 'Profunda gratitud, respeto a la dignidad y memoria histórica, calidez humana, empatía sincera y compromiso absoluto de cuidado.',
        fraseGanchoCTA: 'Ustedes nos dieron todo con su esfuerzo. Hoy nos toca a nosotros cuidarlos con amor y dignidad.',
        ejesTematicosClave: [
          'Farmacias Populares Municipales con entrega domiciliaria de medicamentos básicos.',
          'Médico a Tu Puerta con consultas y toma de glucosa y presión gratuitas.',
          'Casas de Día dignas con talleres culturales, alimentación y fisioterapia.',
          'Banquetas sin baches con rampas seguras y descuento automático del 50% en predial y agua.'
        ],
        guionDiscursoMitadDeCampana: `Queridas abuelas, queridos abuelos de ${municipio}:
Estar frente a ustedes es estar frente a los verdaderos constructores de nuestra comunidad. Cada calle, cada escuela y cada iglesia de este municipio existe gracias a sus manos, a sus desvelos y a su amor incondicional por sus familias.
Y me da una indignación profunda ver que después de una vida entera de trabajo, tengan que madrugar a las 5 de la mañana para formarse en una clínica bajo el frío o el sol, para que al llegar a la ventanilla les digan que no hay la pastilla para la presión o para la diabetes. ¡Eso se va a acabar!
Vamos a abrir las Farmacias Populares Municipales y el programa "Médico a Tu Puerta". Si no pueden salir de su casa, nuestros médicos y enfermeras irán directamente a tocar a su puerta para revisarles y dejarles su medicamento completo y sin costo.
Además, vamos a arreglar las banquetas y a garantizar que en las oficinas públicas se les atienda con la máxima calidez, con una sonrisa y sin filas humillantes.
Su experiencia y sus bendiciones son el motor de esta campaña. ¡Caminen con nosotros y hagamos justicia a nuestros adultos mayores!`
      }
    };

    const puntoDeArranqueTerritorial = {
      coloniaSeleccionada: coloniaArranque.nombre,
      ageb: coloniaArranque.ageb,
      municipio,
      estratoSocioeconomico: coloniaArranque.estratoSocioeconomico,
      poblacionElectoralZona: coloniaArranque.poblacionElectoral,
      prioridadBrigada: coloniaArranque.prioridadBrigada,
      carenciaPrincipal: coloniaArranque.carenciaPrincipal,
      ubicacionSimbólica: `Explanada cívica / Mercado principal de ${coloniaArranque.nombre} junto al nodo de transporte`,
      razonEstrategicaArranque: `Esta colonia representa el corazón neurálgico del micro-targeting municipal: es un ${coloniaArranque.prioridadBrigada} donde convergen ${coloniaArranque.poblacionElectoral.toLocaleString()} electores y donde la carencia de "${coloniaArranque.carenciaPrincipal}" tiene al electorado en máxima tensión social. Iniciar aquí con la firma del compromiso de infraestructura del Ramo 33 genera un golpe de autoridad simbólica, moviliza a los gremios de ${coloniaArranque.sindicatoDominante || 'comerciantes y transporte'} y desarticula la narrativa de la oposición desde el día 1 de campaña.`,
      fuerzasGremialesConvocadasDiaUno: [
        coloniaArranque.sindicatoDominante || 'Comerciantes y Tianguistas',
        'Transporte Colectivo y Rutas Concesionadas',
        'Comités Ciudadanos por el Agua Potable',
        'Jóvenes y Madres Cuidadoras de la Comunidad'
      ]
    };

    // Proyección de Crecimiento Territorial hacia la Victoria (Ruta Crítica)
    const padronTotal = statsMuni.poblacionElectoralTotal || 500000;
    const participacionEstimada = 0.53;
    const votosEsperadosTotal = Math.round(padronTotal * participacionEstimada);
    // Umbral de victoria (estimado en 42% a 48% para ganar en escenario multipartidista)
    const votosParaGanar = Math.round(votosEsperadosTotal * 0.44);

    const proyeccionCrecimiento = {
      padronElectoralConsiderado: padronTotal,
      listaNominalEfectiva: statsMuni.listaNominalTotal || Math.round(padronTotal * 0.96),
      tasaParticipacionProyectada: `${(participacionEstimada * 100).toFixed(1)}%`,
      votosEmitidosEstimados: votosEsperadosTotal,
      umbralDeVictoriaMinimo: votosParaGanar,
      metaDeCampañaObjetivo: Math.round(votosParaGanar * 1.10), // +10% margen de seguridad
      fasesRutaCritica: [
        {
          fase: 'Fase 1 (Días 1 a 15) - Activación de Bastiones y Anclaje Simbólico',
          objetivo: 'Consolidar el 100% de los Bastiones Electorales, firmar pactos con las 12 fuerzas sindicales y realizar el banderazo de salida en punto neurálgico.',
          metaContactoPuertaPorPuerta: '65,000 hogares visitados',
          avanceVotosEsperado: Math.round(votosParaGanar * 0.35)
        },
        {
          fase: 'Fase 2 (Días 16 a 35) - Ofensiva Swarm en Battlegrounds (Zonas Indecisas)',
          objetivo: 'Despliegue intensivo de brigadas ciudadanas en las colonias clasificadas como Zona Indecisa / Swarm Battleground con eventos sectoriales de jóvenes y comerciantes.',
          metaContactoPuertaPorPuerta: '120,000 hogares visitados',
          avanceVotosEsperado: Math.round(votosParaGanar * 0.40)
        },
        {
          fase: 'Fase 3 (Días 36 a 50) - Penetración Quirúrgica en Zonas Críticas y Bombardeo Digital',
          objetivo: 'Persuasión con propuestas de bacheo, conectividad y seguridad en zonas residenciales y de alta resistencia; micro-targeting digital segmentado por edad en Meta y TikTok.',
          metaContactoPuertaPorPuerta: '70,000 hogares visitados',
          avanceVotosEsperado: Math.round(votosParaGanar * 0.15)
        },
        {
          fase: 'Fase 4 (Días 51 a 60 / 90) - Cierre de Campaña y Operación Día D',
          objetivo: 'Mega-cierres distritales, cobertura al 100% de casillas con representantes generales y de casilla blindados, y movilización de la estructura gremial y familiar.',
          metaContactoPuertaPorPuerta: 'Refuerzo de padrón leal casa por casa',
          avanceVotosEsperado: Math.round(votosParaGanar * 0.10)
        }
      ]
    };

    return {
      municipio,
      cargo,
      ciclo,
      candidato,
      coalicion,
      namingGanador,
      discursosSegmentados,
      puntoDeArranqueTerritorial,
      proyeccionCrecimiento
    };
  }

  /**
   * Generación Completa del Radar Electoral y Micro-Targeting Territorial
   */
  generateFullRadarAnalysis(params = {}) {
    const {
      municipio = 'Ecatepec de Morelos',
      cargo = 'Presidente Municipal / Alcalde',
      ciclo = '2027',
      candidato = 'Candidato de Transformación Verde',
      coalicion = 'PVEM - Sigamos Haciendo Historia'
    } = params;

    const statsColonias = getColoniasStats(municipio);
    const problematicasOficiales = this.getDiagnosticoProblematicas(municipio);
    const bateriaPropuestas = this.getBateriaPropuestas(cargo, municipio);
    const alianzasYSindicatos = this.getAlianzasYSindicatos(municipio, cargo);
    const manualCampana = this.generarManualCampana(municipio, cargo, ciclo, candidato, coalicion);

    // Calcular KPI Global del Radar
    const apoyoBasePromedio = statsColonias.promedioApoyoProyectado || 50;
    const sumaBoostPropuestas = bateriaPropuestas.slice(0, 3).reduce((acc, p) => {
      const boostNum = parseFloat((p.proyeccionVotoBoost || '0').replace('+', '').replace('%', '')) || 0;
      return acc + boostNum;
    }, 0);
    // Factor de sinergia gremial
    const impulsoGremial = Number((alianzasYSindicatos.balanceGremial.aliadosEstrategicos * 1.8).toFixed(1));
    const intencionFinalProyectada = Number(Math.min(68.5, apoyoBasePromedio + (sumaBoostPropuestas * 0.45) + (impulsoGremial * 0.35)).toFixed(1));

    return {
      status: 'EXITOSO',
      timestamp: new Date().toISOString(),
      metadatosElectorales: {
        municipio,
        cargo,
        ciclo,
        candidato,
        coalicion,
        fechaJornada: ciclo === '2030' ? '2 de Junio de 2030' : '6 de Junio de 2027',
        diasRestantesCampana: ciclo === '2030' ? 90 : 60
      },
      indicadoresClaveElectorales: {
        intencionVotoProyectadaFinal: `${intencionFinalProyectada}%`,
        intencionBaseInicial: `${apoyoBasePromedio}%`,
        potencialCrecimientoCampana: `+${(intencionFinalProyectada - apoyoBasePromedio).toFixed(1)}%`,
        totalColoniasMapeadas: statsColonias.totalColoniasMapeadas,
        poblacionElectoralTotal: statsColonias.poblacionElectoralTotal,
        listaNominalTotal: statsColonias.listaNominalTotal,
        bastionesElectorales: statsColonias.bastionesCount,
        swarmBattlegrounds: statsColonias.battlegroundCount,
        zonasCriticasResistencia: statsColonias.zonasCriticasCount,
        votosFamiliaresSindicatos: alianzasYSindicatos.totalVotosFamiliaresGremiales
      },
      microTargetingColonias: statsColonias,
      diagnosticoProblematicasGobierno: problematicasOficiales,
      bateriaPropuestasGanadoras: bateriaPropuestas,
      inteligenciaSindicalYAlianzas: alianzasYSindicatos,
      manualCampanaEstrategico: manualCampana
    };
  }
}

module.exports = new ElectoralRadarEngine();
