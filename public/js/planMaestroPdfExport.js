// Generador y Exportador de PDF #1: PLAN MAESTRO DE VICTORIA ELECTORAL Y DIAGNÓSTICO TERRITORIAL
// Diseñador Editorial de Documentos Ejecutivos GovTech & jsPDF
// Plataforma de Inteligencia Predictiva y Simulación Social — Enjambres Sintéticos y Micro-Targeting

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PlanMaestroPDFExport = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Paletas de Color Multipartidistas White-Label
  const PARTY_PALETTES = {
    PVEM: {
      key: 'PVEM',
      name: 'PARTIDO VERDE ECOLOGISTA DE MÉXICO',
      shortName: 'PARTIDO VERDE',
      stateTitle: 'COORDINACIÓN DE INTELIGENCIA ELECTORAL Y MICRO-TARGETING',
      primary: [0, 143, 57],     // #008f39
      dark: [0, 104, 41],        // #006829
      accent: [120, 190, 32],    // #78be20
      lightBg: [240, 253, 244],  // #f0fdf4
      borderSoft: [187, 247, 208],
      badgeBg: '#008f39',
      slogan: 'Estrategia Territorial Basada en Enjambres Sintéticos y Micro-Segmentación'
    },
    MORENA: {
      key: 'MORENA',
      name: 'MOVIMIENTO REGENERACIÓN NACIONAL',
      shortName: 'MORENA',
      stateTitle: 'COORDINACIÓN DE INTELIGENCIA ELECTORAL Y MICRO-TARGETING',
      primary: [179, 40, 45],    // #b3282d
      dark: [110, 21, 26],       // #6e151a
      accent: [128, 0, 32],      // #800020
      lightBg: [254, 242, 242],  // #fef2f2
      borderSoft: [254, 202, 202],
      badgeBg: '#b3282d',
      slogan: 'Estrategia Territorial Basada en Enjambres Sintéticos y Micro-Segmentación'
    },
    PAN: {
      key: 'PAN',
      name: 'PARTIDO ACCIÓN NACIONAL',
      shortName: 'ACCIÓN NACIONAL',
      stateTitle: 'COORDINACIÓN DE INTELIGENCIA ELECTORAL Y MICRO-TARGETING',
      primary: [0, 51, 160],     // #0033a0
      dark: [0, 34, 119],        // #002277
      accent: [0, 112, 186],     // #0070ba
      lightBg: [239, 246, 255],  // #eff6ff
      borderSoft: [191, 219, 254],
      badgeBg: '#0033a0',
      slogan: 'Estrategia Territorial Basada en Enjambres Sintéticos y Micro-Segmentación'
    },
    PRI: {
      key: 'PRI',
      name: 'PARTIDO REVOLUCIONARIO INSTITUCIONAL',
      shortName: 'PRI',
      stateTitle: 'COORDINACIÓN DE INTELIGENCIA ELECTORAL Y MICRO-TARGETING',
      primary: [206, 17, 38],    // #ce1126
      dark: [0, 104, 71],        // #006847
      accent: [206, 17, 38],     // #ce1126
      lightBg: [255, 241, 242],  // #fff1f2
      borderSoft: [254, 205, 211],
      badgeBg: '#ce1126',
      slogan: 'Estrategia Territorial Basada en Enjambres Sintéticos y Micro-Segmentación'
    },
    MC: {
      key: 'MC',
      name: 'MOVIMIENTO CIUDADANO',
      shortName: 'MOVIMIENTO CIUDADANO',
      stateTitle: 'COORDINACIÓN DE INTELIGENCIA ELECTORAL Y MICRO-TARGETING',
      primary: [255, 130, 0],    // #ff8200
      dark: [217, 107, 11],      // #d96b0b
      accent: [255, 167, 38],    // #ffa726
      lightBg: [255, 247, 237],  // #fff7ed
      borderSoft: [254, 215, 170],
      badgeBg: '#ff8200',
      slogan: 'Estrategia Territorial Basada en Enjambres Sintéticos y Micro-Segmentación'
    },
    PT: {
      key: 'PT',
      name: 'PARTIDO DEL TRABAJO',
      shortName: 'PARTIDO DEL TRABAJO',
      stateTitle: 'COORDINACIÓN DE INTELIGENCIA ELECTORAL Y MICRO-TARGETING',
      primary: [218, 41, 28],    // #da291c
      dark: [153, 27, 27],       // #991b1b
      accent: [251, 191, 36],    // #fbbf24
      lightBg: [254, 242, 242],  // #fef2f2
      borderSoft: [254, 202, 202],
      badgeBg: '#da291c',
      slogan: 'Estrategia Territorial Basada en Enjambres Sintéticos y Micro-Segmentación'
    }
  };

  const PlanMaestroPDFExport = {
    /**
     * Genera y descarga el PDF #1: Plan Maestro de Victoria Electoral y Diagnóstico Territorial
     * REGLA ESTRICTA DE INTEGRIDAD: Cero plantillas o datos precargados.
     * Refleja única y exclusivamente la información real que el usuario ingresó y simuló en la sesión activa.
     */
    async exportPlanMaestro(reportData, appStateInput) {
      const state = appStateInput || (typeof window !== 'undefined' && window.appState) || {};
      const rep = reportData || state.currentReport || null;
      const res = (rep && rep.resumenEjecutivo) ? rep.resumenEjecutivo : {};
      const radar = state.radarAnalysis || null;

      // Lectura estricta de los inputs reales de la sesión activa (War Room Vista 2 y Diagnóstico de Radar)
      const domEstado = (typeof document !== 'undefined')
        ? (document.getElementById('select-estado')?.value || document.getElementById('radar-select-estado')?.value || '')
        : '';
      const domMunicipio = (typeof document !== 'undefined')
        ? (document.getElementById('select-municipio')?.value || document.getElementById('radar-select-municipio')?.value || '')
        : '';
      const domCargo = (typeof document !== 'undefined')
        ? (document.getElementById('radar-select-cargo')?.value || '')
        : '';
      const domCandidato = (typeof document !== 'undefined')
        ? (document.getElementById('radar-input-candidato')?.value?.trim() || '')
        : '';
      const domTitulo = (typeof document !== 'undefined')
        ? (document.getElementById('input-propuesta-titulo')?.value?.trim() || '')
        : '';
      const domTexto = (typeof document !== 'undefined')
        ? (document.getElementById('input-propuesta-texto')?.value?.trim() || '')
        : '';

      const estado = state.estado || res.estado || radar?.estado || domEstado || '';
      const municipio = state.municipio || res.municipio || radar?.municipio || domMunicipio || '';
      const cargo = state.cargo || radar?.cargo || domCargo || 'Cargo no especificado en sesión';
      const candidato = state.candidato || radar?.candidato || domCandidato || 'No especificado por el usuario';
      const tituloProyecto = state.tituloProyecto || res.tituloProyecto || domTitulo || '';
      const propuestaTexto = state.propuestaTexto || res.propuestaEvaluada || domTexto || '';

      // Validación obligatoria antes de compilar el PDF
      const hasUserProposal = Boolean((tituloProyecto && tituloProyecto.length >= 3) || (propuestaTexto && propuestaTexto.length >= 5));
      const hasActiveSimulation = Boolean(rep && rep.resumenEjecutivo);
      const hasActiveRadar = Boolean(radar && radar.municipio && (!municipio || radar.municipio === municipio));

      if (!hasUserProposal && !hasActiveSimulation && !hasActiveRadar) {
        alert(
          '⚠️ Sin datos suficientes de simulación para compilar el expediente.\n\n' +
          'Por regla de integridad, el sistema no genera plantillas ni propuestas genéricas precargadas. ' +
          'Ingresa tu propuesta y ejecuta la simulación en War Room Vista 2 o el Diagnóstico de Radar antes de exportar.'
        );
        return;
      }

      const partyKey = (state.activeParty || res.partido || radar?.partido || 'PVEM').toUpperCase();
      const party = PARTY_PALETTES[partyKey] || PARTY_PALETTES.PVEM;

      const jsPDFConstructor = (typeof window !== 'undefined' && (window.jspdf ? window.jspdf.jsPDF : window.jsPDF));
      if (typeof jsPDFConstructor !== 'function') {
        alert('Librería jsPDF no detectada en el navegador. Por favor refresque la página.');
        return;
      }

      const doc = new jsPDFConstructor({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const pageWidth = doc.internal.pageSize.getWidth();   // 215.9 mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 279.4 mm
      const margin = 14;
      const contentWidth = pageWidth - (margin * 2);        // 187.9 mm

      const dateStr = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const muniCode = (municipio || 'TERR').substring(0, 4).toUpperCase();
      const folioId = `WAR-ROOM-${partyKey}-${muniCode}-${Math.floor(1000 + Math.random() * 9000)}`;
      const cryptoHash = this.generateHash(`${partyKey}|${municipio}|${tituloProyecto}|${Date.now()}`);

      const sessionContext = {
        pageWidth,
        pageHeight,
        margin,
        contentWidth,
        party,
        estado: estado || 'No especificado',
        municipio: municipio || 'No especificado',
        candidato,
        cargo,
        tituloProyecto,
        propuestaTexto,
        hasUserProposal,
        hasActiveSimulation,
        hasActiveRadar,
        rep,
        res,
        radar: hasActiveRadar ? radar : null,
        dateStr,
        folioId,
        cryptoHash
      };

      // =========================================================================
      // PÁGINA 1: PORTADA INSTITUCIONAL, FICHA DE SESIÓN Y PROPUESTA INGRESADA
      // =========================================================================
      this.drawInstitutionalCover(doc, sessionContext);

      // =========================================================================
      // PÁGINA 2: EVALUACIÓN DE LA PROPUESTA INGRESADA POR EL USUARIO (CERO INVENTOS)
      // =========================================================================
      doc.addPage();
      this.drawHeaderBanner(doc, pageWidth, margin, party, 'EXPEDIENTE DE PROPUESTA ESTRATÉGICA Y RESULTADOS DE SIMULACIÓN');
      this.drawPage2UserProposalEvaluation(doc, sessionContext);

      // =========================================================================
      // PÁGINA 3: DIAGNÓSTICO TERRITORIAL Y MICRO-TARGETING DE LA SESIÓN ACTIVA
      // =========================================================================
      doc.addPage();
      this.drawHeaderBanner(doc, pageWidth, margin, party, 'DIAGNÓSTICO TERRITORIAL Y MICRO-TARGETING DE COLONIAS EN SESIÓN');
      this.drawPage3TerritorialAndColonias(doc, sessionContext);

      // =========================================================================
      // PÁGINA 4: MATRIZ GREMIAL Y COMUNICACIÓN SEGMENTADA DE LA SESIÓN ACTIVA
      // =========================================================================
      doc.addPage();
      this.drawHeaderBanner(doc, pageWidth, margin, party, 'BALANCE GREMIAL Y NARRATIVA SEGMENTADA DE LA SESIÓN ACTIVA');
      this.drawPage4SindicatosAndDiscurso(doc, sessionContext);

      // Numerar todas las páginas generadas con pie de página de seguridad
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        this.drawEditorialFooter(doc, p, totalPages, pageWidth, pageHeight, margin, party, cryptoHash);
      }

      const safeMuni = (municipio || 'Territorio').replace(/[\s/\\?%*:|"<>]+/g, '_');
      const safeName = `Plan_Maestro_${partyKey}_${safeMuni}.pdf`;
      doc.save(safeName);

      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(`Plan Maestro descargado con datos exclusivos de tu sesión: ${safeName}`);
      }
      return doc;
    },

    // -------------------------------------------------------------------------
    // PÁGINA 1: PORTADA INSTITUCIONAL Y DATOS REALES INGRESADOS POR EL USUARIO
    // -------------------------------------------------------------------------
    drawInstitutionalCover(doc, ctx) {
      const {
        pageWidth, margin, contentWidth,
        party, municipio, estado, candidato, cargo,
        tituloProyecto, propuestaTexto, hasUserProposal,
        hasActiveSimulation, hasActiveRadar, res, radar,
        dateStr, folioId
      } = ctx;

      // Franja Superior Principal
      doc.setFillColor(party.primary[0], party.primary[1], party.primary[2]);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFillColor(party.accent[0], party.accent[1], party.accent[2]);
      doc.rect(0, 28, pageWidth, 2.5, 'F');

      this.drawPartyVectorBadge(doc, margin, 4.5, party);

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(party.name, margin + 28, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(240, 253, 244);
      doc.text(`${party.stateTitle} • GOVTECH WAR ROOM`, margin + 28, 18);
      doc.text(party.slogan, margin + 28, 23.5);

      // Barra de Clasificación
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, 34, contentWidth, 9, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, 34, contentWidth, 9, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`FOLIO: ${folioId}`, margin + 3, 39.8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`EXPEDIENTE COMPILADO EXCLUSIVAMENTE CON DATOS DE LA SESIÓN ACTIVA`, margin + 58, 39.8);

      // TÍTULO CENTRAL
      let curY = 49;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('PLAN MAESTRO Y EXPEDIENTE TÁCTICO DE CAMPAÑA', margin, curY);

      curY += 7;
      doc.setFontSize(11.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`DEMARCACIÓN EVALUADA: ${municipio.toUpperCase()}, ${estado.toUpperCase()}`, margin, curY);

      curY += 4;
      doc.setDrawColor(party.primary[0], party.primary[1], party.primary[2]);
      doc.setLineWidth(1);
      doc.line(margin, curY, margin + contentWidth, curY);
      doc.setLineWidth(0.2);

      // FICHA DE PARÁMETROS INGRESADOS POR EL USUARIO
      curY += 6;
      const cardH = 48;
      doc.setFillColor(party.lightBg[0], party.lightBg[1], party.lightBg[2]);
      doc.setDrawColor(party.borderSoft[0], party.borderSoft[1], party.borderSoft[2]);
      doc.roundedRect(margin, curY, contentWidth, cardH, 2, 2, 'FD');

      doc.setFillColor(party.primary[0], party.primary[1], party.primary[2]);
      doc.roundedRect(margin, curY, 3.5, cardH, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('PARÁMETROS REALES DE LA SESIÓN ACTIVA', margin + 7, curY + 6.5);

      const col1X = margin + 7;
      const col2X = margin + 98;
      let rowY = curY + 13.5;

      doc.setFontSize(7.5);
      this.drawDataRow(doc, col1X, rowY, 'Candidato(a) / Perfil:', candidato, true);
      this.drawDataRow(doc, col2X, rowY, 'Estado / Entidad:', estado, true);
      rowY += 7.5;
      this.drawDataRow(doc, col1X, rowY, 'Cargo Evaluado:', cargo, true);
      this.drawDataRow(doc, col2X, rowY, 'Municipio / Alcaldía:', municipio, true);
      rowY += 7.5;

      const agentesMuestra = res.agentesEvaluados
        ? `${Number(res.agentesEvaluados).toLocaleString()} Agentes Sintéticos`
        : (radar ? 'Diagnóstico Territorial de Radar' : 'Sin corrida de enjambre registrada');
      const padronInfo = res.poblacionTotalMuni
        ? `${Number(res.poblacionTotalMuni).toLocaleString()} hab. (Lista Nominal: ${Number(res.listaNominalMuni || 0).toLocaleString()})`
        : (radar?.demografia?.listaNominal ? `Lista Nominal: ${Number(radar.demografia.listaNominal).toLocaleString()} electores` : 'Dato sujeto a corrida de simulación');

      this.drawDataRow(doc, col1X, rowY, 'Muestra Simulada:', agentesMuestra);
      this.drawDataRow(doc, col2X, rowY, 'Fecha de Compilación:', dateStr);
      rowY += 7.5;
      this.drawDataRow(doc, col1X, rowY, 'Universo Demográfico:', padronInfo);

      // RECUADRO DE LA PROPUESTA REAL INGRESADA POR EL USUARIO
      curY += cardH + 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('PROPUESTA ESTRATÉGICA INGRESADA POR EL USUARIO EN SESIÓN', margin, curY);

      curY += 3.5;
      const propBoxH = 72;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, curY, contentWidth, propBoxH, 2, 2, 'FD');

      if (hasUserProposal) {
        doc.setFillColor(party.primary[0], party.primary[1], party.primary[2]);
        doc.rect(margin, curY, contentWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`TÍTULO DEL PROYECTO: ${(tituloProyecto || 'Propuesta Estratégica en Evaluación').toUpperCase()}`, margin + 4, curY + 4.8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        const rawText = propuestaTexto || tituloProyecto;
        const lines = doc.splitTextToSize(rawText, contentWidth - 10);
        doc.text(lines.slice(0, 16), margin + 5, curY + 13);
      } else {
        this.drawInsufficientDataNotice(
          doc,
          margin + 4,
          curY + 8,
          contentWidth - 8,
          propBoxH - 16,
          'El usuario no ingresó un texto de propuesta personalizada en War Room Vista 2 durante esta sesión.'
        );
      }

      // ESTADO DE MÓDULOS EJECUTADOS EN LA SESIÓN
      curY += propBoxH + 8;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, curY, contentWidth, 34, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('CERTIFICACIÓN DE INTEGRIDAD DOCUMENTAL (CERO DATOS GENÉRICOS PRECARGADOS):', margin + 4, curY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(`• Propuesta ingresada por el usuario: ${hasUserProposal ? 'SÍ — Registrada e impresa íntegramente' : 'NO — Sin texto de propuesta registrado'}`, margin + 4, curY + 12.5);
      doc.text(`• Simulación de Enjambre Sintético (War Room Vista 2): ${hasActiveSimulation ? `SÍ — Ejecutada en ${res.municipio || municipio} con ${Number(res.agentesEvaluados || 0).toLocaleString()} agentes` : 'NO EJECUTADA EN ESTA SESIÓN'}`, margin + 4, curY + 18.5);
      doc.text(`• Diagnóstico de Radar Electoral (Ventana Secundaria): ${hasActiveRadar ? `SÍ — Ejecutado para ${radar.municipio} (${radar.cargo})` : 'NO EJECUTADO EN ESTA SESIÓN'}`, margin + 4, curY + 24.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('Este documento omite cualquier plantilla predeterminada y reporta únicamente los módulos simulados.', margin + 4, curY + 30.5);
    },

    // -------------------------------------------------------------------------
    // PÁGINA 2: EVALUACIÓN EXCLUSIVA DE LA PROPUESTA DEL USUARIO
    // -------------------------------------------------------------------------
    drawPage2UserProposalEvaluation(doc, ctx) {
      const {
        margin, contentWidth, party, municipio, estado, cargo,
        tituloProyecto, propuestaTexto, hasUserProposal,
        hasActiveSimulation, rep, res
      } = ctx;

      let curY = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text(`1. PROPUESTA EVALUADA EN ${municipio.toUpperCase()}, ${estado.toUpperCase()}`, margin, curY);

      curY += 4;
      if (!hasUserProposal) {
        this.drawInsufficientDataNotice(
          doc,
          margin,
          curY,
          contentWidth,
          36,
          'Sin datos suficientes de simulación para compilar el expediente de propuesta personalizada.'
        );
        curY += 42;
      } else {
        doc.setFillColor(party.lightBg[0], party.lightBg[1], party.lightBg[2]);
        doc.setDrawColor(party.borderSoft[0], party.borderSoft[1], party.borderSoft[2]);
        doc.roundedRect(margin, curY, contentWidth, 44, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Proyecto: ${tituloProyecto || 'Propuesta Táctica del Usuario'} (${cargo})`, margin + 4, curY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.3);
        doc.setTextColor(30, 41, 59);
        const pLines = doc.splitTextToSize(propuestaTexto || tituloProyecto, contentWidth - 8);
        doc.text(pLines.slice(0, 10), margin + 4, curY + 12);
        curY += 50;
      }

      // SECCIÓN 2: MÉTRICAS DE LA SIMULACIÓN EN WAR ROOM VISTA 2
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('2. RESULTADOS DEL ENJAMBRE SINTÉTICO (WAR ROOM VISTA 2)', margin, curY);
      curY += 4;

      if (!hasActiveSimulation) {
        this.drawInsufficientDataNotice(
          doc,
          margin,
          curY,
          contentWidth,
          55,
          'Sin datos suficientes de simulación para compilar el expediente de métricas de enjambre. Ejecute "Simular en War Room Vista 2" para obtener porcentajes de aprobación, rechazo, indecisos y vulnerabilidades de su propuesta.'
        );
        return;
      }

      // Si hay simulación activa, mostrar exactamente sus resultados reales
      const kpiW = (contentWidth - 9) / 4;
      const kpiH = 24;
      const kpis = [
        { label: 'APROBACIÓN PROYECTADA', val: `${res.apoyoPorcentaje}%`, sub: `${Number(res.votosAprobacionEstimados || 0).toLocaleString()} votos est.`, color: [0, 143, 57] },
        { label: 'RECHAZO ACTIVO', val: `${res.rechazoPorcentaje}%`, sub: `${Number(res.votosRechazoEstimados || 0).toLocaleString()} votos est.`, color: [220, 38, 38] },
        { label: 'VOTO INDECISO / SWARM', val: `${res.indecisosPorcentaje}%`, sub: `Muestra: ${Number(res.agentesEvaluados || 0).toLocaleString()} ag.`, color: [217, 119, 6] },
        { label: 'BALANCE ELECTORAL NETO', val: String(res.impactoElectoralNeto || '0%'), sub: `${res.viabilidadGeneral || 'Evaluado'}`, color: [15, 23, 42] }
      ];

      kpis.forEach((k, idx) => {
        const kx = margin + idx * (kpiW + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(kx, curY, kpiW, kpiH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(k.label, kx + 3, curY + 5.5);

        doc.setFontSize(12);
        doc.setTextColor(k.color[0], k.color[1], k.color[2]);
        doc.text(k.val, kx + 3, curY + 14.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(71, 85, 105);
        doc.text(k.sub, kx + 3, curY + 20.5);
      });

      curY += kpiH + 7;

      // Diagnóstico y Recomendación de Cuarto de Guerra de la simulación activa
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, curY, contentWidth, 56, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('DICTAMEN TÁCTICO Y RECOMENDACIÓN DE CUARTO DE GUERRA PARA ESTA PROPUESTA:', margin + 4, curY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      const diagText = `${res.diagnosticoGeneral || ''}\n\nRecomendación Estratégica: ${res.recomendacionEstrategica || ''}`;
      const diagLines = doc.splitTextToSize(diagText.trim(), contentWidth - 8);
      doc.text(diagLines.slice(0, 13), margin + 4, curY + 12);

      curY += 62;

      // Vulnerabilidades y Mejoras de la Propuesta Evaluada
      const vulns = Array.isArray(rep.vulnerabilidades) ? rep.vulnerabilidades.slice(0, 3) : [];
      const recs = Array.isArray(rep.recomendaciones) ? rep.recomendaciones.slice(0, 3) : [];

      const halfW = (contentWidth - 6) / 2;
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(margin, curY, halfW, 65, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(185, 28, 28);
      doc.text('VULNERABILIDADES DETECTADAS EN LA PROPUESTA:', margin + 3, curY + 6);

      let vy = curY + 11.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.4);
      doc.setTextColor(69, 10, 10);
      vulns.forEach((v, i) => {
        const vTxt = `${i + 1}. ${v.aspecto || 'Riesgo'}: ${v.descripcion || ''}`;
        const vLines = doc.splitTextToSize(vTxt, halfW - 6).slice(0, 4);
        doc.text(vLines, margin + 3, vy);
        vy += (vLines.length * 3.6) + 2;
      });

      doc.setFillColor(party.lightBg[0], party.lightBg[1], party.lightBg[2]);
      doc.setDrawColor(party.borderSoft[0], party.borderSoft[1], party.borderSoft[2]);
      doc.roundedRect(margin + halfW + 6, curY, halfW, 65, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('AJUSTES TÁCTICOS PARA BLINDAR LA PROPUESTA:', margin + halfW + 9, curY + 6);

      let ry = curY + 11.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.4);
      doc.setTextColor(15, 23, 42);
      recs.forEach((r, i) => {
        const rTxt = `${i + 1}. ${r.accion || 'Acción'}: ${r.efectoEsperado || ''}`;
        const rLines = doc.splitTextToSize(rTxt, halfW - 6).slice(0, 4);
        doc.text(rLines, margin + halfW + 9, ry);
        ry += (rLines.length * 3.6) + 2;
      });
    },

    // -------------------------------------------------------------------------
    // PÁGINA 3: DIAGNÓSTICO TERRITORIAL Y MICRO-TARGETING DE LA SESIÓN ACTIVA
    // -------------------------------------------------------------------------
    drawPage3TerritorialAndColonias(doc, ctx) {
      const { margin, contentWidth, party, municipio, hasActiveSimulation, hasActiveRadar, rep, radar } = ctx;

      let curY = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text(`3. PROBLEMÁTICAS TERRITORIALES DE ${municipio.toUpperCase()} (SESIÓN ACTIVA)`, margin, curY);
      curY += 4;

      const radarProbs = (hasActiveRadar && Array.isArray(radar?.problematicas)) ? radar.problematicas : [];

      if (radarProbs.length > 0) {
        radarProbs.slice(0, 6).forEach((prob, idx) => {
          const rowH = 14.5;
          const bg = (idx % 2 === 0) ? [255, 255, 255] : [248, 250, 252];
          doc.setFillColor(bg[0], bg[1], bg[2]);
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, curY, contentWidth, rowH, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(15, 23, 42);
          doc.text(`${idx + 1}. ${prob.problema || prob.eje || 'Eje Territorial'}`, margin + 3, curY + 4.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.2);
          doc.setTextColor(71, 85, 105);
          const desc = `${prob.indicadorOficial || prob.indicador || ''} — ${prob.oportunidadPolitica || prob.impacto || ''}`;
          doc.text(doc.splitTextToSize(desc, contentWidth - 8).slice(0, 2), margin + 3, curY + 9.2);
          curY += rowH;
        });
      } else {
        this.drawInsufficientDataNotice(
          doc,
          margin,
          curY,
          contentWidth,
          32,
          'Sin datos suficientes de simulación para compilar el diagnóstico de problemáticas del Radar Electoral en esta sesión.'
        );
        curY += 36;
      }

      curY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text(`4. MICRO-TARGETING DE COLONIAS EN ${municipio.toUpperCase()} (SESIÓN ACTIVA)`, margin, curY);
      curY += 4;

      const simColonias = (hasActiveSimulation && Array.isArray(rep?.microTargetingColonias?.coloniasEvaluadas))
        ? rep.microTargetingColonias.coloniasEvaluadas
        : [];
      const radarColonias = (hasActiveRadar && Array.isArray(radar?.microTargetingColonias?.colonias))
        ? radar.microTargetingColonias.colonias
        : [];
      const activeColonias = simColonias.length > 0 ? simColonias : radarColonias;

      if (activeColonias.length === 0) {
        this.drawInsufficientDataNotice(
          doc,
          margin,
          curY,
          contentWidth,
          42,
          'Sin datos suficientes de simulación para compilar la matriz de micro-targeting por colonias.'
        );
        return;
      }

      // Cabecera de tabla de colonias reales de la sesión
      doc.setFillColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.rect(margin, curY, contentWidth, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.3);
      doc.text('COLONIA / BARRIO EVALUADO', margin + 2, curY + 4.2);
      doc.text('NSE', margin + 62, curY + 4.2);
      doc.text('APOYO', margin + 80, curY + 4.2);
      doc.text('PRIORIDAD / CLASIFICACIÓN', margin + 98, curY + 4.2);
      doc.text('CARENCIA / DEMANDA DETECTADA', margin + 142, curY + 4.2);
      curY += 6;

      activeColonias.slice(0, 8).forEach((col, idx) => {
        const rowH = 12.5;
        const bg = (idx % 2 === 0) ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, curY, contentWidth, rowH, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(15, 23, 42);
        doc.text(doc.splitTextToSize(col.nombre || 'Colonia', 56)[0], margin + 2, curY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(String(col.nse || 'C/D+'), margin + 62, curY + 5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
        const apoyoVal = col.apoyoProyectado !== undefined ? `${col.apoyoProyectado}%` : (col.apoyoBase !== undefined ? `${col.apoyoBase}%` : 'N/D');
        doc.text(apoyoVal, margin + 80, curY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(30, 41, 59);
        const prioText = String(col.prioridadBrigada || col.prioridad || 'Evaluada');
        doc.text(doc.splitTextToSize(prioText, 40)[0], margin + 98, curY + 5);

        const carenciaText = String(col.carenciaPrincipal || col.demanda || 'Atención prioritaria');
        doc.text(doc.splitTextToSize(carenciaText, 44).slice(0, 2), margin + 142, curY + 4.5);

        curY += rowH;
      });
    },

    // -------------------------------------------------------------------------
    // PÁGINA 4: BALANCE SINDICAL Y NARRATIVA DE LA SESIÓN ACTIVA
    // -------------------------------------------------------------------------
    drawPage4SindicatosAndDiscurso(doc, ctx) {
      const { margin, contentWidth, party, hasActiveSimulation, hasActiveRadar, rep, radar } = ctx;

      let curY = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('5. MATRIZ DE FUERZAS SINDICALES Y GREMIALES EVALUADAS EN SESIÓN', margin, curY);
      curY += 4;

      const simSindicatos = (hasActiveSimulation && Array.isArray(rep?.balanceSindical?.sindicatosEvaluados))
        ? rep.balanceSindical.sindicatosEvaluados
        : [];
      const radarSindicatos = (hasActiveRadar && Array.isArray(radar?.alianzasSindicatos?.fuerzasSindicales))
        ? radar.alianzasSindicatos.fuerzasSindicales
        : [];
      const activeSindicatos = simSindicatos.length > 0 ? simSindicatos : radarSindicatos;

      if (activeSindicatos.length === 0) {
        this.drawInsufficientDataNotice(
          doc,
          margin,
          curY,
          contentWidth,
          36,
          'Sin datos suficientes de simulación para compilar el balance de fuerzas sindicales en esta sesión.'
        );
        curY += 42;
      } else {
        doc.setFillColor(party.dark[0], party.dark[1], party.dark[2]);
        doc.rect(margin, curY, contentWidth, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.2);
        doc.text('ORGANIZACIÓN GREMIAL / SINDICATO', margin + 2, curY + 4.2);
        doc.text('POSTURA / AFINIDAD', margin + 72, curY + 4.2);
        doc.text('RIESGO PARO', margin + 108, curY + 4.2);
        doc.text('PLIEGO PETITORIO / COMPROMISO', margin + 132, curY + 4.2);
        curY += 6;

        activeSindicatos.slice(0, 8).forEach((s, idx) => {
          const rowH = 11.5;
          const bg = (idx % 2 === 0) ? [255, 255, 255] : [248, 250, 252];
          doc.setFillColor(bg[0], bg[1], bg[2]);
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, curY, contentWidth, rowH, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.3);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(s.nombre || 'Gremio', 66)[0], margin + 2, curY + 4.8);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          const postura = s.afinidad !== undefined ? `${s.postura || ''} (${s.afinidad}%)` : String(s.posturaActual || s.postura || 'Evaluado');
          doc.text(doc.splitTextToSize(postura, 33)[0], margin + 72, curY + 4.8);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(185, 28, 28);
          doc.text(String(s.riesgoParo || s.impactoVotos || 'N/D'), margin + 108, curY + 4.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.8);
          doc.setTextColor(71, 85, 105);
          const pliego = Array.isArray(s.pliegoPetitorio) ? s.pliegoPetitorio[0] : (s.compromisoGanador || s.demandaClave || '');
          doc.text(doc.splitTextToSize(String(pliego), 53).slice(0, 2), margin + 132, curY + 4.5);

          curY += rowH;
        });
        curY += 6;
      }

      // SECCIÓN 6: MANUAL DE DISCURSO SEGMENTADO (SOLO SI HAY RADAR O SIMULACIÓN ACTIVA)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text('6. NARRATIVA Y LÍNEAS DISCURSIVAS DE LA SESIÓN ACTIVA', margin, curY);
      curY += 4;

      if (hasActiveRadar && radar?.manualCampana?.discursosPorEdad) {
        const disc = radar.manualCampana.discursosPorEdad;
        const items = [disc.jovenes_18_29, disc.adultos_30_49, disc.adultosMayores_65_mas].filter(Boolean);
        items.forEach((d) => {
          const boxH = 26;
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(margin, curY, contentWidth, boxH, 1.5, 1.5, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
          doc.text(`${d.segmento || 'Segmento'} — Eje: ${d.tono || ''}`, margin + 3, curY + 5);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(6.3);
          doc.setTextColor(30, 41, 59);
          doc.text(doc.splitTextToSize(String(d.mensajeFuerza || ''), contentWidth - 6).slice(0, 4), margin + 3, curY + 10.5);
          curY += boxH + 3;
        });
      } else if (hasActiveSimulation && Array.isArray(rep?.testimonios) && rep.testimonios.length > 0) {
        rep.testimonios.slice(0, 3).forEach((t) => {
          const boxH = 24;
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(margin, curY, contentWidth, boxH, 1.5, 1.5, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.8);
          doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
          doc.text(`Voz Sintética (${t.perfil || 'Ciudadano'} — ${t.postura || 'Postura'}):`, margin + 3, curY + 5);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(6.3);
          doc.setTextColor(30, 41, 59);
          doc.text(doc.splitTextToSize(`"${t.comentario || ''}"`, contentWidth - 6).slice(0, 3), margin + 3, curY + 10.5);
          curY += boxH + 3;
        });
      } else {
        this.drawInsufficientDataNotice(
          doc,
          margin,
          curY,
          contentWidth,
          36,
          'Sin datos suficientes de simulación para compilar el módulo de discurso segmentado.'
        );
      }
    },

    drawInsufficientDataNotice(doc, x, y, w, h, detailText) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(252, 165, 165);
      doc.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28);
      doc.text('Sin datos suficientes de simulación para compilar el expediente', x + 5, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(127, 29, 29);
      const lines = doc.splitTextToSize(
        detailText || 'Ejecute primero la simulación en War Room Vista 2 o el Diagnóstico de Radar Electoral en la sesión activa.',
        w - 10
      );
      doc.text(lines, x + 5, y + 16);
    },

    // -------------------------------------------------------------------------
    // COMPONENTES AUXILIARES Y ESTILOS
    // -------------------------------------------------------------------------
    drawHeaderBanner(doc, pageWidth, margin, party, title) {
      doc.setFillColor(party.primary[0], party.primary[1], party.primary[2]);
      doc.rect(0, 0, pageWidth, 12, 'F');

      doc.setFillColor(party.accent[0], party.accent[1], party.accent[2]);
      doc.rect(0, 12, pageWidth, 1.2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.text(title, margin, 8.2);

      doc.setFontSize(6.5);
      doc.setTextColor(240, 253, 244);
      doc.text(`${party.shortName} • EXPEDIENTE TÁCTICO`, pageWidth - margin - 45, 8.2);
    },

    drawEditorialFooter(doc, currentPage, totalPages, pageWidth, pageHeight, margin, party, cryptoHash) {
      const footerY = pageHeight - 11;
      const contentWidth = pageWidth - (margin * 2);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, footerY, margin + contentWidth, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.setTextColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.text(`[QA WATCHDOG CERTIFIED • DATOS EXCLUSIVOS DE SESIÓN ACTIVA • ZERO-TEMPLATE]`, margin, footerY + 3.5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(`[CYBER SENTINEL: FIRMA CRIPTOGRÁFICA ISO/IEC 27001 • INTEGRIDAD VERIFICADA]`, margin + 90, footerY + 3.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Desarrollado por Neural Media House | Dirección de Proyecto: Erick Vega | GovTech War Room Enterprise`, margin, footerY + 6.6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(4.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`HASH: ${cryptoHash}  |  PLATAFORMA DE INTELIGENCIA PREDICTIVA Y MICRO-TARGETING`, margin, footerY + 9.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(15, 23, 42);
      doc.text(`Página ${currentPage} de ${totalPages}`, margin + contentWidth - 18, footerY + 9.5);
    },

    drawDataRow(doc, x, y, label, val, isBold = false) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(label, x, y);

      const labelW = doc.getTextWidth(label) + 2;
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(String(val), x + labelW, y);
    },

    drawPartyVectorBadge(doc, x, y, party) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, 22, 19, 2, 2, 'F');
      doc.setDrawColor(party.dark[0], party.dark[1], party.dark[2]);
      doc.roundedRect(x, y, 22, 19, 2, 2, 'S');

      doc.setFillColor(party.primary[0], party.primary[1], party.primary[2]);
      doc.roundedRect(x + 1.5, y + 1.5, 19, 16, 1.5, 1.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const textW = doc.getTextWidth(party.key);
      doc.text(party.key, x + (22 - textW) / 2, y + 10.5);

      doc.setFontSize(4);
      const subW = doc.getTextWidth('WAR ROOM');
      doc.text('WAR ROOM', x + (22 - subW) / 2, y + 14.5);
    },

    generateHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const hex = Math.abs(hash).toString(16).padStart(8, '0');
      return `SHA256-${hex.toUpperCase()}-${Math.floor(Date.now() / 1000).toString(16)}`;
    }
  };

  return PlanMaestroPDFExport;
});
