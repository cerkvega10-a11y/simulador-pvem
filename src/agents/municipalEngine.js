// Motor de Ponderación Demográfica y Geográfica Cruzada
// Aplica la fórmula: Vector del Municipio x Impacto Temático de la Propuesta
// Garantiza variación matemática estricta y verídica por Estado y Municipio

const { getMunicipalityVector } = require('../data/municipalityVectors');
const { CATALOGO_11_SECTORES_DEMOGRAFICOS } = require('../data/edomexDemographics');

class MunicipalEngine {
  constructor() {
    this.name = 'Motor de Ponderación Demográfica y Geográfica';
  }

  /**
   * Calcula el voto ponderado cruzando el texto del proyecto con el vector del municipio
   */
  calculateCrossDemographicVote(thematicAnalysis, municipio, estado, swarmSize = 100) {
    const vector = getMunicipalityVector(municipio, estado);
    const nse = vector.distribucionNSE;

    // Ponderadores de estrato popular vs medio/alto
    const pesoEstratosPopulares = (nse['D+'] + nse['D/E']) / 100; // e.g. 0.62 en Ecatepec, 0.22 en Huixquilucan
    const pesoEstratosAltos = (nse['A/B'] + nse['C+']) / 100;     // e.g. 0.12 en Ecatepec, 0.60 en Huixquilucan

    // Factores de impacto neto por tema (Positivo = Beneficio, Negativo = Perjuicio/Fricción)
    const defaultTemas = {
      agua: { peso: 0.2, polaridad: 0 },
      transporte: { peso: 0.8, polaridad: -0.6 },
      impuestos: { peso: 0.7, polaridad: -0.5 },
      tianguis: { peso: 0.3, polaridad: -0.2 },
      turismo_campo: { peso: 0.1, polaridad: 0 },
      seguridad: { peso: 0.4, polaridad: 0.1 },
      medio_ambiente: { peso: 0.5, polaridad: 0.3 }
    };
    const temas = (thematicAnalysis && thematicAnalysis.temas) ? thematicAnalysis.temas : defaultTemas;

    // 1. Cálculo de Impacto por Eje
    const impactoAgua = ((temas.agua?.polaridad ?? 0) * (temas.agua?.peso ?? 0.5)) * vector.peso_agua;
    const impactoTransporte = ((temas.transporte?.polaridad ?? -0.6) * (temas.transporte?.peso ?? 0.8)) * vector.peso_transporte_publico;
    const impactoImpuestos = ((temas.impuestos?.polaridad ?? -0.5) * (temas.impuestos?.peso ?? 0.7)) * vector.peso_impuestos_predial_autos;
    const impactoTianguis = ((temas.tianguis?.polaridad ?? -0.2) * (temas.tianguis?.peso ?? 0.3)) * vector.peso_comercio_informal_tianguis;
    const impactoTurismoCampo = ((temas.turismo_campo?.polaridad ?? 0) * (temas.turismo_campo?.peso ?? 0.1)) * vector.peso_turismo_agricultura;
    const impactoSeguridad = ((temas.seguridad?.polaridad ?? 0.1) * (temas.seguridad?.peso ?? 0.4)) * vector.peso_seguridad_publica;
    const impactoMedioAmbiente = ((temas.medio_ambiente?.polaridad ?? 0.3) * (temas.medio_ambiente?.peso ?? 0.5)) * vector.peso_medio_ambiente;

    // Magnificación según estrato socioeconómico local:
    // Los estratos populares resienten mucho más los costos de transporte y tianguis.
    // Los estratos altos resienten mucho más el predial, impuestos vehiculares y reducción de carriles.
    const friccionTransportePop = impactoTransporte < 0 ? impactoTransporte * (1 + pesoEstratosPopulares * 0.8) : impactoTransporte;
    const friccionTianguisPop = impactoTianguis < 0 ? impactoTianguis * (1 + pesoEstratosPopulares * 0.7) : impactoTianguis;
    const friccionImpuestosAltos = impactoImpuestos < 0 ? impactoImpuestos * (1 + pesoEstratosAltos * 0.9) : impactoImpuestos;

    // Sumatoria neta ponderada
    const scoreNeto = (
      impactoAgua * 1.35 +
      friccionTransportePop * 1.30 +
      friccionImpuestosAltos * 1.10 +
      friccionTianguisPop * 1.15 +
      impactoTurismoCampo * 1.10 +
      impactoSeguridad * 1.25 +
      impactoMedioAmbiente * 1.05
    );

    // 2. Determinación de Porcentajes A Favor, En Contra y Neutro
    let favorPct = 50;
    let contraPct = 30;
    let neutroPct = 20;

    if (thematicAnalysis.esIninteligible) {
      favorPct = 0;
      contraPct = 95;
      neutroPct = 5;
    } else if (thematicAnalysis.esAbsurdo) {
      favorPct = 3;
      contraPct = 92;
      neutroPct = 5;
    } else if (scoreNeto < -0.35) {
      // Caso Fuertemente Punitivo o Dañino
      // El porcentaje de contra varía según el vector municipal
      const severidad = Math.min(Math.abs(scoreNeto), 2.5);
      contraPct = Math.min(Math.round(62 + severidad * 12 + pesoEstratosPopulares * 10), 93);
      favorPct = Math.max(Math.round(20 - severidad * 5 - pesoEstratosPopulares * 6), 5);
      neutroPct = 100 - contraPct - favorPct;
    } else if (scoreNeto > 0.35) {
      // Caso de Beneficio Comunitario Directo
      // Si el municipio tiene alta sensibilidad a ese tema, la aprobación sube; si no es su dolor, es menor
      const beneficio = Math.min(scoreNeto, 2.5);
      favorPct = Math.min(Math.round(52 + beneficio * 12 - (contraPct > 20 ? 5 : 0)), 82);
      // Aplicar reserva crítica anti-complacencia (máx 82%)
      contraPct = Math.max(Math.round(24 - beneficio * 5), 10);
      neutroPct = 100 - favorPct - contraPct;
    } else {
      // Propuesta moderada, genérica o desconectada de los dolores urgentes
      favorPct = Math.round(34 + (scoreNeto * 10));
      contraPct = Math.round(26 - (scoreNeto * 8));
      neutroPct = 100 - favorPct - contraPct;
    }

    // 3. Generación de Datos para el Radar de 6 Ejes (<canvas id="chartRadarProblemas">)
    const ejesRadar = [
      'Economía Familiar',
      'Movilidad y Tráfico',
      'Agua y Servicios',
      'Seguridad Pública',
      'Medio Ambiente',
      'Empleo y Comercio Local'
    ];

    const radarData = {
      ejes: ejesRadar,
      labels: ejesRadar,
      sensibilidad: [
        Math.round((vector.peso_impuestos_predial_autos || 0.6) * 100),
        Math.round((vector.peso_transporte_publico || 0.7) * 100),
        Math.round((vector.peso_agua || 0.8) * 100),
        Math.round((vector.peso_seguridad || 0.75) * 100),
        Math.round((vector.peso_medio_ambiente || 0.65) * 100),
        Math.round((vector.peso_comercio_informal_tianguis || 0.7) * 100)
      ],
      impacto: [
        Math.min(Math.max(Math.round(50 + (impactoImpuestos + (impactoTransporte < 0 ? impactoTransporte : 0)) * 30), 10), 95),
        Math.min(Math.max(Math.round(50 + impactoTransporte * 35), 10), 95),
        Math.min(Math.max(Math.round(50 + impactoAgua * 40), 10), 95),
        Math.min(Math.max(Math.round(50 + impactoSeguridad * 35), 10), 95),
        Math.min(Math.max(Math.round(50 + impactoMedioAmbiente * 35), 10), 95),
        Math.min(Math.max(Math.round(50 + (impactoTianguis + impactoTurismoCampo) * 30), 10), 95)
      ]
    };
    radarData.valores = radarData.impacto;

    // 4. Generación de Línea de Evolución y Contagio Social (<canvas id="chartEvolucion">)
    // Simula el desplazamiento de la opinión pública desde Minuto 0 a Hora 72
    const deltaDesplazamiento = contraPct > 50 ? 8 : (favorPct > 60 ? 6 : -4);
    const tiempos = ['Minuto 0', 'Hora 6', 'Hora 18', 'Hora 36', 'Hora 72'];
    const favores = [
      Math.min(Math.max(favorPct - deltaDesplazamiento, 2), 90),
      Math.min(Math.max(favorPct - Math.round(deltaDesplazamiento * 0.6), 2), 90),
      favorPct,
      Math.min(Math.max(favorPct + Math.round(deltaDesplazamiento * 0.3), 2), 90),
      favorPct
    ];
    const contras = [
      Math.min(Math.max(contraPct + (deltaDesplazamiento > 0 ? -deltaDesplazamiento : Math.abs(deltaDesplazamiento)), 5), 95),
      Math.min(Math.max(contraPct + Math.round((deltaDesplazamiento > 0 ? -deltaDesplazamiento : Math.abs(deltaDesplazamiento)) * 0.5), 5), 95),
      contraPct,
      Math.min(Math.max(contraPct + Math.round(deltaDesplazamiento * 0.2), 5), 95),
      contraPct
    ];

    const evolucionData = tiempos.map((t, idx) => {
      const fav = favores[idx];
      const con = contras[idx];
      const neu = Math.max(100 - fav - con, 0);
      return {
        tiempo: t,
        favor: fav,
        contra: con,
        neutro: neu
      };
    });
    // Añadir propiedades directas para cualquier consumidor alternativo
    evolucionData.tiempos = tiempos;
    evolucionData.favor = favores;
    evolucionData.contra = contras;
    evolucionData.neutro = evolucionData.map(e => e.neutro);

    // 5. Desglose de los 11 Sectores Demográficos Oficiales (<canvas id="chartDemografico">)
    const mapaImpactos = {
      sec_estudiantes: (impactoMedioAmbiente * 0.6) + (impactoTransporte * 0.4),
      sec_comerciantes: (impactoTianguis * 0.6) + (impactoImpuestos * 0.4),
      sec_transportistas: (impactoTransporte * 0.7) + (impactoImpuestos * 0.3),
      sec_salud: (impactoAgua * 0.5) + (impactoSeguridad * 0.5),
      sec_educacion: (impactoSeguridad * 0.5) + (impactoImpuestos * 0.5),
      sec_burocracia: (impactoImpuestos * 0.5) + (impactoSeguridad * 0.3),
      sec_empresarios: (impactoImpuestos * 0.7) + (impactoMedioAmbiente * 0.3),
      sec_madres: (impactoAgua * 0.5) + (impactoSeguridad * 0.5),
      sec_primario: (impactoTurismoCampo * 0.6) + (impactoAgua * 0.4),
      sec_mayores: (impactoAgua * 0.5) + (impactoSeguridad * 0.5),
      sec_construccion: (impactoTransporte * 0.6) + (impactoImpuestos * 0.4)
    };

    const porSector = CATALOGO_11_SECTORES_DEMOGRAFICOS.map(sec => {
      const imp = mapaImpactos[sec.id] || 0;
      let f = Math.min(Math.max(Math.round(favorPct + imp * 18), 5), 92);
      let c = Math.min(Math.max(Math.round(contraPct - imp * 16), 5), 94);
      let n = Math.max(100 - f - c, 0);

      // Calcular fricción social sectorial (0-100)
      const friccionSocial = Math.min(Math.max(Math.round(c * 0.95 + (sec.pesoElectoral > 10 ? 5 : 0)), 5), 98);

      return {
        id: sec.id,
        sector: sec.nombre,
        icono: sec.icono || '👥',
        pesoElectoral: sec.pesoElectoral,
        favor: f,
        contra: c,
        neutro: n,
        friccionSocial,
        sensibilidad: sec.sensibilidad,
        observacion: imp < -0.1
          ? `Alerta de resistencia en ${sec.nombre}: sensibilidad alta a ${sec.sensibilidad}`
          : imp > 0.1
            ? `Respaldo prioritario de ${sec.nombre}: alta afinidad con la propuesta`
            : `Postura expectante en ${sec.nombre}: se requiere socialización territorial directa`
      };
    });

    // Ajustar neutro para que cada sector sume exactamente 100%
    porSector.forEach(sec => {
      sec.neutro = 100 - sec.favor - sec.contra;
      if (sec.neutro < 0) {
        sec.contra += sec.neutro;
        sec.neutro = 0;
      }
    });

    return {
      vectorAplicado: vector,
      scoreNeto,
      votos: {
        porcentajeFavor: favorPct,
        porcentajeContra: contraPct,
        porcentajeNeutro: neutroPct
      },
      radarData,
      evolucionData,
      porSector
    };
  }
}

module.exports = new MunicipalEngine();
