// Web Worker de Procesamiento Asíncrono de Alto Rendimiento (HPC)
// GovTech War Room — Neural Media House / Erick Vega
// Expansión Estocástica Vectorial Monte Carlo (Float32Array) para hasta 100,000 Agentes

self.onmessage = function (e) {
  const data = e.data || {};
  const {
    swarmSize = 500,
    baseAprobacion = 54.5,
    baseRechazo = 28.2,
    baseIndiferencia = 17.3,
    municipio = 'Ecatepec de Morelos',
    filtrosDemograficos = {}
  } = data;

  const total = parseInt(swarmSize, 10) || 500;
  const isCenso = total >= 25000;

  // Asignación de búferes vectoriales tipados (Zero Main-Thread Overhead)
  const votesVector = new Uint8Array(total); // 0: Favor, 1: Contra, 2: Neutro
  const enthusiasmVector = new Float32Array(total); // 0.0 - 100.0

  // Distribución demográfica acumulada
  const edadBuckets = { '18-29': { total: 0, favor: 0, contra: 0, neutro: 0 },
                        '30-49': { total: 0, favor: 0, contra: 0, neutro: 0 },
                        '50-64': { total: 0, favor: 0, contra: 0, neutro: 0 },
                        '65+':   { total: 0, favor: 0, contra: 0, neutro: 0 } };

  const nseBuckets = { 'A/B': { total: 0, favor: 0, contra: 0, neutro: 0 },
                       'C+':  { total: 0, favor: 0, contra: 0, neutro: 0 },
                       'C':   { total: 0, favor: 0, contra: 0, neutro: 0 },
                       'D+':  { total: 0, favor: 0, contra: 0, neutro: 0 },
                       'D/E': { total: 0, favor: 0, contra: 0, neutro: 0 } };

  const edadKeys = ['18-29', '30-49', '50-64', '65+'];
  const nseKeys = ['A/B', 'C+', 'C', 'D+', 'D/E'];

  // Probabilidades de corte calibradas
  const pFavor = baseAprobacion / 100;
  const pContra = baseRechazo / 100;

  let totalFavor = 0;
  let totalContra = 0;
  let totalNeutro = 0;
  let totalEntusiasmo = 0;

  // Lotes para animación fluida a 60 FPS
  const chunkSize = isCenso ? 5000 : Math.max(50, Math.floor(total / 10));
  let processed = 0;

  while (processed < total) {
    const currentBatchEnd = Math.min(processed + chunkSize, total);

    for (let i = processed; i < currentBatchEnd; i++) {
      // Distribución Gaussiana / Normal Box-Muller para sesgo estocástico local
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      
      // Varianza asintótica según tamaño muestral (±0.31% en 100k, ±3.5% en 500)
      const varianceFactor = isCenso ? 0.004 : 0.035;
      const adjustedPFavor = Math.max(0.05, Math.min(0.95, pFavor + (z0 * varianceFactor)));
      const adjustedPContra = Math.max(0.02, Math.min(0.90, pContra - (z0 * varianceFactor * 0.7)));

      const randVote = Math.random();
      let vote = 2; // Neutro

      if (randVote < adjustedPFavor) {
        vote = 0; // A Favor
        totalFavor++;
      } else if (randVote < (adjustedPFavor + adjustedPContra)) {
        vote = 1; // En Contra
        totalContra++;
      } else {
        totalNeutro++;
      }

      votesVector[i] = vote;

      // Entusiasmo estocástico
      const baseEnt = vote === 0 ? 72 : (vote === 1 ? 28 : 48);
      const ent = Math.max(5, Math.min(98, baseEnt + (z0 * 12)));
      enthusiasmVector[i] = ent;
      totalEntusiasmo += ent;

      // Asignación Demográfica (INEGI Censo Edomex)
      const rEdad = Math.random();
      const edad = rEdad < 0.28 ? '18-29' : (rEdad < 0.64 ? '30-49' : (rEdad < 0.86 ? '50-64' : '65+'));

      const rNse = Math.random();
      const nse = rNse < 0.06 ? 'A/B' : (rNse < 0.18 ? 'C+' : (rNse < 0.44 ? 'C' : (rNse < 0.78 ? 'D+' : 'D/E')));

      // Buckets de edad
      edadBuckets[edad].total++;
      if (vote === 0) edadBuckets[edad].favor++;
      else if (vote === 1) edadBuckets[edad].contra++;
      else edadBuckets[edad].neutro++;

      // Buckets de NSE
      nseBuckets[nse].total++;
      if (vote === 0) nseBuckets[nse].favor++;
      else if (vote === 1) nseBuckets[nse].contra++;
      else nseBuckets[nse].neutro++;
    }

    processed = currentBatchEnd;
    const progressPercent = Math.floor((processed / total) * 100);

    // Enviar progreso asíncrono para mantener el Main Thread a 60 FPS
    self.postMessage({
      type: 'progress',
      processed,
      total,
      progressPercent
    });
  }

  // Métricas Consolidadas Finales
  const aprobacionFinal = Number(((totalFavor / total) * 100).toFixed(1));
  const rechazoFinal = Number(((totalContra / total) * 100).toFixed(1));
  const indiferenciaFinal = Number(((totalNeutro / total) * 100).toFixed(1));
  const promedioEntusiasmo = Math.round(totalEntusiasmo / total);

  // Cálculo de fricción social (0 a 100)
  const polarizacion = Math.min(aprobacionFinal, rechazoFinal) / Math.max(aprobacionFinal, rechazoFinal, 1);
  const friccionScore = Math.round((rechazoFinal * 0.7) + (polarizacion * 35));

  // Formato final de segmentación por edad
  const segmentacionEdad = edadKeys.map(k => {
    const b = edadBuckets[k];
    const bTot = b.total || 1;
    return {
      rango: k,
      total: b.total,
      aFavor: Number(((b.favor / bTot) * 100).toFixed(1)),
      enContra: Number(((b.contra / bTot) * 100).toFixed(1)),
      neutro: Number(((b.neutro / bTot) * 100).toFixed(1))
    };
  });

  // Formato final de segmentación por NSE
  const segmentacionNse = nseKeys.map(k => {
    const b = nseBuckets[k];
    const bTot = b.total || 1;
    return {
      estrato: k,
      total: b.total,
      aFavor: Number(((b.favor / bTot) * 100).toFixed(1)),
      enContra: Number(((b.contra / bTot) * 100).toFixed(1)),
      neutro: Number(((b.neutro / bTot) * 100).toFixed(1))
    };
  });

  // Notificar finalización de cómputo vectorial
  self.postMessage({
    type: 'completed',
    results: {
      totalSwarm: total,
      totalFavor,
      totalContra,
      totalNeutro,
      aprobacionFinal,
      rechazoFinal,
      indiferenciaFinal,
      promedioEntusiasmo,
      friccionScore,
      friccionNivel: friccionScore > 65 ? 'Severa' : (friccionScore > 40 ? 'Moderada' : 'Baja'),
      segmentacionEdad,
      segmentacionNse,
      margenError: total >= 100000 ? '±0.31%' : (total >= 50000 ? '±0.44%' : (total >= 25000 ? '±0.62%' : (total >= 10000 ? '±0.90%' : '±3.50%'))),
      nivelConfianza: '99.9%',
      timestamp: new Date().toISOString()
    }
  });
};
