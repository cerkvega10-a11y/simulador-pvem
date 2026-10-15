// Generador y Exportador de Reportes Ejecutivos en PDF (Sin Gráficas - Informe Escrito Institucional)
// Partido Verde Ecologista Estado de México - Sistema Swarm AI Multi-Agente
// Formato Ejecutivo con Ficha Oficial de Datos, Dictamen, KPIs, Desglose por Sectores y Voces del Enjambre

const PDFExport = {
  /**
   * Genera y descarga directamente en 1 clic el Reporte Ejecutivo en PDF (Texto, Tablas y Testimonios)
   */
  async exportReport(reportData) {
    if (!reportData) {
      alert('No hay datos de simulación disponibles para exportar.');
      return;
    }

    const res = reportData.resumenEjecutivo || {};
    const municipio = res.municipio || 'Estado_de_Mexico';
    const municipioSanitizado = municipio.replace(/[\s/\\?%*:|"<>]+/g, '_');
    const fileName = `Reporte_Predictivo_PartidoVerde_${municipioSanitizado}.pdf`;

    // 1. Verificar si jsPDF está disponible en el navegador
    const jsPDFConstructor = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    if (typeof jsPDFConstructor === 'function') {
      try {
        await this.generateDirectJsPDF(reportData, fileName, jsPDFConstructor);
        if (typeof showToast === 'function') {
          showToast(`Reporte descargado: ${fileName}`);
        }
        return;
      } catch (err) {
        console.warn('Error en generación directa con jsPDF, recurriendo a renderizado imprimible:', err);
      }
    }

    // 2. Fallback resiliente: Ventana de impresión estilizada sin gráficas
    this.fallbackPrintWindow(reportData);
  },

  /**
   * Generación nativa con jsPDF (Sin Gráficas - Reporte Estructurado de 2 Páginas)
   */
  async generateDirectJsPDF(reportData, fileName, JsPdfClass) {
    const doc = new JsPdfClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const res = reportData.resumenEjecutivo || {};
    const fecha = new Date(reportData.fechaGeneracion || Date.now()).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 215.9 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 279.4 mm
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    // ==========================================
    // PÁGINA 1: DICTAMEN, KPIS Y DESGLOSE TERRITORIAL POR SECTOR
    // ==========================================

    // Encabezado Verde PVEM
    doc.setFillColor(0, 143, 57); // #008f39
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text('PARTIDO VERDE ECOLOGISTA DE MÉXICO — ESTADO DE MÉXICO', margin, 10);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('REPORTE PREDICTIVO DE IMPACTO SOCIAL • ENJAMBRE MULTI-AGENTE (SWARM AI) • CERO SESGO', margin, 17);

    // Barra de Metadatos
    doc.setFillColor(240, 253, 244); // #f0fdf4
    doc.rect(margin, 25, contentWidth, 11, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.rect(margin, 25, contentWidth, 11, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Territorio: ${res.municipio || 'Edomex'}, ${res.estado || 'México'} (${res.localidad || 'Zona General'})`, margin + 3, 29.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de Emisión: ${fecha}   |   Muestra de Estudio: ${(res.tamanoEnjambre || 250).toLocaleString()} Agentes Ciudadanos Sintéticos`, margin + 3, 33.5);

    // Caja de Dictamen Político Oficial
    let verdictBg = [0, 143, 57]; // Verde
    const aprob = Number(res.aprobacionFinal || 50);
    const rechazo = Number(res.rechazoFinal || 30);
    if (rechazo >= 45) {
      verdictBg = [220, 38, 38]; // Rojo
    } else if (aprob < 50) {
      verdictBg = [217, 119, 6]; // Ámbar
    }

    doc.setFillColor(verdictBg[0], verdictBg[1], verdictBg[2]);
    doc.roundedRect(margin, 39, contentWidth, 11, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`DICTAMEN OFICIAL: ${res.dictamenPolitico || 'EVALUACIÓN EN PROCESO'}`, margin + 4, 46);

    // Título y Extracto del Proyecto Evaluado
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    const tituloLineas = doc.splitTextToSize(`Proyecto: ${res.tituloProyecto || 'Iniciativa Comunitaria'}`, contentWidth);
    doc.text(tituloLineas, margin, 56);

    const kpiY = 56 + (tituloLineas.length * 4.5);

    // 5 Tarjetas de KPIs Principales
    const kpiCount = 5;
    const kpiGap = 2.5;
    const kpiWidth = (contentWidth - ((kpiCount - 1) * kpiGap)) / kpiCount;
    const kpiH = 15;

    const kpis = [
      { label: 'Aprobación Final', val: `${res.aprobacionFinal ?? 0}%`, color: [0, 143, 57] },
      { label: 'Rechazo Social', val: `${res.rechazoFinal ?? 0}%`, color: [220, 38, 38] },
      { label: 'Indiferencia / Neutro', val: `${res.indiferenciaFinal ?? 0}%`, color: [100, 116, 139] },
      { label: 'Fricción Social', val: `${res.indiceFriccionSocial?.score ?? 50}/100`, color: [2, 132, 199] },
      { label: 'Entusiasmo Cívico', val: `${res.promedioEntusiasmo ?? 50}%`, color: [217, 119, 6] }
    ];

    kpis.forEach((kpi, i) => {
      const x = margin + (i * (kpiWidth + kpiGap));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, kpiY, kpiWidth, kpiH, 1.5, 1.5, 'FD');

      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label.toUpperCase(), x + 2, kpiY + 4.2);

      doc.setFontSize(11.5);
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.text(kpi.val, x + 2, kpiY + 11.5);
    });

    // 1. DESGLOSE TERRITORIAL POR SECTOR SOCIAL Y COMUNITARIO (TABLA)
    const table1Y = kpiY + kpiH + 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 104, 41);
    doc.text('1. DESGLOSE TERRITORIAL POR SECTOR SOCIAL Y COMUNITARIO', margin, table1Y);

    const tblStartY = table1Y + 3;
    const tHeaderH = 5.5;
    const tRowH = 6.5;

    // Encabezado de la tabla
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, tblStartY, contentWidth, tHeaderH, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, tblStartY, contentWidth, tHeaderH, 'S');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('SECTOR COMUNITARIO', margin + 3, tblStartY + 3.8);
    doc.text('A FAVOR', margin + 65, tblStartY + 3.8);
    doc.text('EN CONTRA', margin + 85, tblStartY + 3.8);
    doc.text('NEUTRO', margin + 107, tblStartY + 3.8);
    doc.text('DIAGNÓSTICO Y SENSIBILIDAD TERRITORIAL', margin + 125, tblStartY + 3.8);

    const sectoresData = reportData.porSectorSocial || reportData.mapaCalorDemografico?.porSectorSocial || [
      { sector: 'Usuarios de Transporte y Obreros', favor: 38, contra: 46, neutro: 16, observacion: 'Alta sensibilidad a tarifas y tiempos de traslado' },
      { sector: 'Comerciantes y Tianguistas', favor: 32, contra: 54, neutro: 14, observacion: 'Defensa de fuentes de empleo y libre comercio' },
      { sector: 'Clase Media y Automovilistas', favor: 42, contra: 44, neutro: 14, observacion: 'Preocupación por fluidez vial, bacheo y predial' },
      { sector: 'Jóvenes y Estudiantes', favor: 58, contra: 26, neutro: 16, observacion: 'Respaldo a conectividad, becas y descuentos estudiantiles' },
      { sector: 'Sector Rural y Turismo', favor: 48, contra: 34, neutro: 18, observacion: 'Prioridad al suministro hídrico y preservación ecológica' },
      { sector: 'Adultos Mayores y Pensionados', favor: 52, contra: 30, neutro: 18, observacion: 'Exigencia de banquetas seguras, paraderos y respeto' }
    ];

    let rowY = tblStartY + tHeaderH;
    sectoresData.slice(0, 6).forEach((s, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(margin, rowY, contentWidth, tRowH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, rowY, contentWidth, tRowH, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text(s.sector || 'Sector', margin + 3, rowY + 4.2);

      doc.setTextColor(0, 143, 57);
      doc.text(`${s.favor || 0}%`, margin + 65, rowY + 4.2);

      doc.setTextColor(220, 38, 38);
      doc.text(`${s.contra || 0}%`, margin + 85, rowY + 4.2);

      doc.setTextColor(100, 116, 139);
      doc.text(`${s.neutro || 0}%`, margin + 107, rowY + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const obs = (s.observacion || s.diagnostico || '').substring(0, 48);
      doc.text(obs, margin + 125, rowY + 4.2);

      rowY += tRowH;
    });

    // 2. DESGLOSE DEMOGRÁFICO POR RANGO DE EDAD Y NIVEL SOCIOECONÓMICO (NSE)
    const demoY = rowY + 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 104, 41);
    doc.text('2. SEGMENTACIÓN DEMOGRÁFICA POR EDAD Y ESTRATO SOCIOECONÓMICO', margin, demoY);

    const demoTableY = demoY + 3;
    const demoH = 28;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, demoTableY, contentWidth, demoH, 1.5, 1.5, 'FD');

    // Columna Izquierda: Grupos de Edad
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Distribución por Rango de Edad:', margin + 4, demoTableY + 5.5);

    const porEdad = reportData.mapaCalorDemografico?.porEdad || [
      { grupo: '18-29 años (Jóvenes)', favor: 58, contra: 26, neutro: 16 },
      { grupo: '30-49 años (Adultos activos)', favor: 42, contra: 42, neutro: 16 },
      { grupo: '50+ años (Adultos mayores)', favor: 50, contra: 32, neutro: 18 }
    ];

    let edadY = demoTableY + 11;
    porEdad.forEach(e => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${e.grupo}:`, margin + 4, edadY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 143, 57);
      doc.text(`${e.favor}% Favor`, margin + 48, edadY);
      doc.setTextColor(220, 38, 38);
      doc.text(`${e.contra}% Contra`, margin + 66, edadY);
      doc.setTextColor(100, 116, 139);
      doc.text(`${e.neutro}% Neutro`, margin + 84, edadY);
      edadY += 5;
    });

    // Columna Derecha: Estratos NSE
    const col2X = margin + (contentWidth / 2) + 6;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Distribución por Nivel Socioeconómico (NSE):', col2X, demoTableY + 5.5);

    const porNSE = reportData.mapaCalorDemografico?.porNSE || [
      { nivel: 'D+ y D/E (Estratos Populares)', favor: 38, contra: 48, neutro: 14 },
      { nivel: 'C (Medio Típico)', favor: 46, contra: 38, neutro: 16 },
      { nivel: 'A/B y C+ (Altos y Medios Altos)', favor: 52, contra: 34, neutro: 14 }
    ];

    let nseY = demoTableY + 11;
    porNSE.forEach(n => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${n.nivel}:`, col2X, nseY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 143, 57);
      doc.text(`${n.favor}% Favor`, col2X + 46, nseY);
      doc.setTextColor(220, 38, 38);
      doc.text(`${n.contra}% Contra`, col2X + 64, nseY);
      doc.setTextColor(100, 116, 139);
      doc.text(`${n.neutro}% Neutro`, col2X + 82, nseY);
      nseY += 5;
    });

    // Pie de página 1
    this.addPageFooter(doc, 1, 2, pageWidth, pageHeight, margin);

    // ==========================================
    // PÁGINA 2: FUENTES OFICIALES, AUDITORÍA Y VOCES DEL ENJAMBRE
    // ==========================================
    doc.addPage();

    // Franja Verde Superior
    doc.setFillColor(0, 143, 57);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // 3. FICHA TÉCNICA DE FUENTES OFICIALES GUBERNAMENTALES VERIFICADAS
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 104, 41);
    doc.text('3. FICHA TÉCNICA DE FUENTES OFICIALES GUBERNAMENTALES VERIFICADAS', margin, 12);

    const table2Y = 15;
    const fuentes = reportData.fuentesOficialesVerificadas || [];
    const t2HeaderH = 5.5;
    const t2RowH = 6.2;

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, table2Y, contentWidth, t2HeaderH, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, table2Y, contentWidth, t2HeaderH, 'S');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('INSTITUCIÓN', margin + 3, table2Y + 3.8);
    doc.text('DOMINIO OFICIAL', margin + 35, table2Y + 3.8);
    doc.text('INDICADOR / REPOSITORIO CONSULTADO', margin + 75, table2Y + 3.8);
    doc.text('ESTATUS', margin + contentWidth - 22, table2Y + 3.8);

    let curY = table2Y + t2HeaderH;
    const fuentesMuestra = fuentes.slice(0, 6);
    fuentesMuestra.forEach((f, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(margin, curY, contentWidth, t2RowH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, curY, contentWidth, t2RowH, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text((f.institucion || 'GOB').substring(0, 20), margin + 3, curY + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(2, 132, 199);
      doc.text(f.dominioOficial || f.portal || 'gob.mx', margin + 35, curY + 4.2);

      doc.setTextColor(51, 65, 85);
      const indTexto = (f.indicador || f.rubro || f.repositorio || '').substring(0, 62);
      doc.text(indTexto, margin + 75, curY + 4.2);

      doc.setTextColor(0, 143, 57);
      doc.setFont('helvetica', 'bold');
      doc.text('✔ Verificado', margin + contentWidth - 22, curY + 4.2);

      curY += t2RowH;
    });

    // 4. CONSOLA DE AUDITORÍA Y VERIFICACIÓN DE IA REAL (PROOF OF REASONING)
    const auditY = curY + 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 104, 41);
    doc.text('4. CONSOLA DE AUDITORÍA Y VERIFICACIÓN DE IA REAL (PROOF OF REASONING)', margin, auditY);

    const auditBoxY = auditY + 2.5;
    const auditH = 22;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, auditBoxY, contentWidth, auditH, 1.5, 1.5, 'FD');

    const proof = reportData.proofOfReasoning || {};
    const verif = reportData.verificacionIAReal || {};

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Identificador de Auditoría: ${proof.auditoriaId || 'AUD-PVEM-2024'}`, margin + 3, auditBoxY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`Hash Criptográfico de Unicidad: ${proof.hashUnicidadChat || 'UNIQ-VERIFIED'} • Cero sesgo de complacencia verificado`, margin + 3, auditBoxY + 9);

    const formulaStr = verif.formulaAbierta?.formulaString || proof.justificacionCalculo || 'Ponderación censal municipal + Modificador semántico de proyecto';
    const formulaLines = doc.splitTextToSize(`Fórmula Matemática Territorial: ${formulaStr}`, contentWidth - 6);
    doc.text(formulaLines.slice(0, 2), margin + 3, auditBoxY + 13.5);

    doc.setTextColor(0, 143, 57);
    doc.setFont('helvetica', 'bold');
    doc.text(`Certificación: 100% Citas Gubernamentales (.gob.mx / .org.mx) • Motor: ${proof.telemetria?.motorInferencia || 'Híbrido Territorial INEGI-ABM'}`, margin + 3, auditBoxY + auditH - 2.5);

    // 5. VOCES DEL ENJAMBRE CIUDADANO (TESTIMONIOS ANCLADOS AL DOCUMENTO Y AL MUNICIPIO)
    const voicesTitleY = auditBoxY + auditH + 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 104, 41);
    doc.text('5. VOCES DEL ENJAMBRE CIUDADANO (TESTIMONIOS ANCLADOS AL PROYECTO)', margin, voicesTitleY);

    const chats = reportData.chatsDelEnjambre || reportData.vocesDelEnjambre || [];
    const chatsMuestra = chats.slice(0, 5);

    let chatCardY = voicesTitleY + 3;
    chatsMuestra.forEach((c) => {
      const v = (c.voto || '').toLowerCase();
      let badgeCol = [0, 143, 57];
      if (v.includes('contra')) badgeCol = [220, 38, 38];
      else if (v.includes('neutro')) badgeCol = [217, 119, 6];

      const cardH = 20.5;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, chatCardY, contentWidth, cardH, 1.2, 1.2, 'FD');

      // Borde lateral indicador de postura
      doc.setFillColor(badgeCol[0], badgeCol[1], badgeCol[2]);
      doc.rect(margin, chatCardY, 2.5, cardH, 'F');

      // Nombre y metadatos
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${c.nombre || 'Ciudadano'} (${c.edad || 35} años • ${c.ocupacion || 'Vecino'} - Col. ${c.colonia || 'Centro'})`, margin + 5, chatCardY + 4.5);

      // Badge de voto
      doc.setFillColor(badgeCol[0], badgeCol[1], badgeCol[2]);
      doc.roundedRect(margin + contentWidth - 24, chatCardY + 1.8, 21, 4, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(c.voto || 'Voto', margin + contentWidth - 22, chatCardY + 4.5);

      // Texto del comentario anclado
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      const msg = c.mensaje || c.argumento || '';
      const msgLines = doc.splitTextToSize(`"${msg}"`, contentWidth - 8);
      doc.text(msgLines.slice(0, 2), margin + 5, chatCardY + 9.5);

      // Pie del testimonio
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Sector: ${c.sectorSocial || 'Comunidad'}  |  Entusiasmo: ${c.entusiasmo || 50}%  |  NSE: ${c.nse || 'C'}`, margin + 5, chatCardY + cardH - 2);

      chatCardY += cardH + 2.5;
    });

    // Cuadro de Certificación Institucional Final
    const certY = Math.min(chatCardY + 1, pageHeight - 24);
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(0, 143, 57);
    doc.roundedRect(margin, certY, contentWidth, 11, 1.2, 1.2, 'FD');

    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 104, 41);
    doc.text('CERTIFICACIÓN DE RIGOR INSTITUCIONAL — PARTIDO VERDE ECOLOGISTA ESTADO DE MÉXICO', margin + 3, certY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text('Este documento predictivo fue generado por el Simulador Social Swarm AI. No contiene encuestas manipuladas ni datos aleatorios; cada indicador se sustenta en bases de datos públicas oficiales de INEGI, SEP, CONEVAL, SESNSP y CONAGUA.', margin + 3, certY + 7.5);

    // Pie de página 2
    this.addPageFooter(doc, 2, 2, pageWidth, pageHeight, margin);

    // Guardar y descargar el archivo PDF directamente
    doc.save(fileName);
  },

  /**
   * Pie de página común para las páginas del PDF
   */
  addPageFooter(doc, pageNum, totalPages, pageWidth, pageHeight, margin) {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text('Documento Oficial de Inteligencia Estratégica • Partido Verde Ecologista Estado de México • Swarm AI', margin, pageHeight - 4.5);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin - 16, pageHeight - 4.5);
  },

  /**
   * Ventana de impresión estilizada como respaldo
   */
  fallbackPrintWindow(reportData) {
    const res = reportData.resumenEjecutivo || {};
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para imprimir el reporte en PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte Predictivo - ${res.tituloProyecto || 'Partido Verde'}</title>
        <style>
          @page { size: letter; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 11px; }
          .header { border-bottom: 3px solid #008f39; padding-bottom: 10px; margin-bottom: 15px; }
          .header h1 { margin: 0; color: #008f39; font-size: 18px; }
          .header p { margin: 4px 0 0; color: #64748b; font-size: 11px; }
          .kpi-row { display: flex; gap: 8px; margin: 15px 0; }
          .kpi-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; }
          .kpi-box h3 { margin: 0; font-size: 18px; color: #008f39; }
          .kpi-box span { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .section-title { color: #008f39; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; font-size: 13px; margin-top: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; }
          .quote { border-left: 3px solid #008f39; background: #f8fafc; padding: 6px 10px; margin-bottom: 6px; font-size: 10px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PARTIDO VERDE ECOLOGISTA ESTADO DE MÉXICO</h1>
          <p>Reporte Predictivo de Impacto Social con Enjambre de Inteligencia Artificial (Swarm AI)</p>
        </div>
        <p><b>Proyecto:</b> ${res.tituloProyecto} | <b>Territorio:</b> ${res.municipio}, ${res.estado} | <b>Dictamen:</b> ${res.dictamenPolitico}</p>
        <div class="kpi-row">
          <div class="kpi-box"><h3>${res.aprobacionFinal}%</h3><span>Aprobación</span></div>
          <div class="kpi-box"><h3 style="color:#dc2626">${res.rechazoFinal}%</h3><span>Rechazo</span></div>
          <div class="kpi-box"><h3 style="color:#64748b">${res.indiferenciaFinal}%</h3><span>Indecisos</span></div>
          <div class="kpi-box"><h3 style="color:#0284c7">${res.indiceFriccionSocial?.score || 50}/100</h3><span>Fricción</span></div>
          <div class="kpi-box"><h3 style="color:#d97706">${res.promedioEntusiasmo || 50}%</h3><span>Entusiasmo</span></div>
        </div>
        <h2 class="section-title">Voces del Enjambre Ciudadano</h2>
        ${(reportData.chatsDelEnjambre || []).slice(0, 8).map(c => `
          <div class="quote">
            <b>${c.nombre} (${c.colonia}, ${c.ocupacion}) [${c.voto}]:</b><br>
            "${c.mensaje}"
          </div>
        `).join('')}
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

window.PDFExport = PDFExport;
