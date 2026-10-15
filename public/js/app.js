// Lógica Principal de la Aplicación y Manejo de Estado (Frontend)
// Simulador Predictivo de Impacto Social - Partido Verde Ecologista Estado de México

let appState = {
  tituloProyecto: '',
  propuestaTexto: '',
  documentData: null,
  visualData: null,
  estado: 'Estado de México',
  municipio: 'Ecatepec de Morelos',
  localidad: '',
  filtrosDemograficos: { rangoEdad: 'todos', nse: 'todos', ocupacion: 'todos' },
  swarmSize: 250,
  webSearchActive: true,
  aiConfig: {
    provider: 'native',
    model: 'native',
    apiKey: '',
    searchProvider: 'native',
    tavilyApiKey: ''
  },
  currentReport: null,
  presets: []
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  loadStoredAIConfig();
  setupEventListeners();
  await loadStates();
  await loadMunicipalities('Estado de México');
  await loadPresets();
  updateSwarmDepthIndicator(appState.swarmSize);
}

/**
 * Carga inicial de Estados de la República
 */
async function loadStates() {
  const select = document.getElementById('select-estado');
  if (!select) return;

  try {
    const res = await fetch('/api/states');
    const data = await res.json();
    if (data.success && data.states) {
      select.innerHTML = data.states.map(est => `
        <option value="${est.nombre}" ${est.predeterminado ? 'selected' : ''}>${est.nombre}</option>
      `).join('');
    }
  } catch (err) {
    console.error('Error cargando estados:', err);
  }
}

/**
 * Carga dinámica de Municipios según el Estado
 */
async function loadMunicipalities(estado) {
  const select = document.getElementById('select-municipio');
  if (!select) return;

  try {
    const res = await fetch(`/api/municipalities?estado=${encodeURIComponent(estado)}`);
    const data = await res.json();
    if (data.success && data.municipios) {
      select.innerHTML = data.municipios.map(m => `
        <option value="${m.nombre}" ${m.nombre === 'Ecatepec de Morelos' ? 'selected' : ''}>
          ${m.nombre} ${m.tieneDetalleProfundo ? '★ (Perfil Detallado)' : ''}
        </option>
      `).join('');
      appState.municipio = select.value;
    }
  } catch (err) {
    console.error('Error cargando municipios:', err);
  }
}

/**
 * Limpia el formulario para ingresar una propuesta propia personalizada
 */
window.clearForCustomProposal = function() {
  document.getElementById('input-titulo').value = '';
  document.getElementById('input-propuesta').value = '';
  document.getElementById('input-localidad').value = '';

  appState.tituloProyecto = '';
  appState.propuestaTexto = '';
  appState.documentData = null;
  appState.visualData = null;

  // Ocultar cajas de documentos e imágenes previas
  const docStatus = document.getElementById('doc-status-box');
  if (docStatus) {
    docStatus.classList.add('hidden');
    docStatus.innerHTML = '';
  }

  const imgBox = document.getElementById('image-visual-card');
  if (imgBox) {
    imgBox.classList.add('hidden');
    imgBox.innerHTML = '';
  }

  const previewContainer = document.getElementById('image-preview-container');
  if (previewContainer) {
    previewContainer.classList.add('hidden');
  }

  // Scroll suave al módulo 1 y foco en el título
  const inputTitulo = document.getElementById('input-titulo');
  inputTitulo.focus();
  inputTitulo.scrollIntoView({ behavior: 'smooth', block: 'center' });

  showToast('Formulario listo. Redacta tu propuesta o sube tu documento técnico.');
};

/**
 * REGLA 2: Botón de Refresh / Nueva Simulación (Reset Total en Pantalla Principal)
 * Limpia campos, documentos, imágenes, selectores, slider, terminal y resultados sin recargar la página.
 */
window.resetFullSimulation = function() {
  // 1. Limpiar campos de texto
  const inputTitulo = document.getElementById('input-titulo');
  if (inputTitulo) inputTitulo.value = '';
  const inputPropuesta = document.getElementById('input-propuesta');
  if (inputPropuesta) inputPropuesta.value = '';
  const inputLocalidad = document.getElementById('input-localidad');
  if (inputLocalidad) inputLocalidad.value = '';

  // 2. Restablecer selectores territoriales
  const selectEstado = document.getElementById('select-estado');
  if (selectEstado) selectEstado.value = 'Estado de México';
  loadMunicipalities('Estado de México').then(() => {
    const selectMuni = document.getElementById('select-municipio');
    if (selectMuni) selectMuni.value = 'Ecatepec de Morelos';
    appState.municipio = 'Ecatepec de Morelos';
  });

  // 3. Limpiar y ocultar documentos e imágenes
  const fileDoc = document.getElementById('input-file-doc');
  if (fileDoc) fileDoc.value = '';
  const fileImg = document.getElementById('input-file-img');
  if (fileImg) fileImg.value = '';

  const docStatus = document.getElementById('doc-status-box');
  if (docStatus) {
    docStatus.classList.add('hidden');
    docStatus.innerHTML = '';
  }
  const imgBox = document.getElementById('image-visual-card');
  if (imgBox) {
    imgBox.classList.add('hidden');
    imgBox.innerHTML = '';
  }
  const previewContainer = document.getElementById('image-preview-container');
  if (previewContainer) {
    previewContainer.classList.add('hidden');
  }

  // 4. Restablecer slider de enjambre a 100
  const slider = document.getElementById('swarm-slider');
  if (slider) slider.value = 100;
  const countDisp = document.getElementById('swarm-count-display');
  if (countDisp) countDisp.innerText = '100';
  updateSwarmDepthIndicator(100);

  // 5. Restablecer checkbox de búsqueda web
  const toggleWeb = document.getElementById('toggle-web-search');
  if (toggleWeb) toggleWeb.checked = true;

  // 6. Ocultar y limpiar consola de progreso y terminal
  const progressSec = document.getElementById('progress-console-section');
  if (progressSec) progressSec.classList.add('hidden');
  clearTerminal();
  resetProgressSteps();
  const progressBar = document.getElementById('global-progress-bar');
  if (progressBar) progressBar.style.width = '0%';
  const progressText = document.getElementById('global-progress-text');
  if (progressText) progressText.innerText = '0%';

  // 7. Ocultar y limpiar dashboard de resultados y contenedores
  const dashboard = document.getElementById('results-dashboard-section');
  if (dashboard) dashboard.classList.add('hidden');

  const proofCont = document.getElementById('proof-of-reasoning-container');
  if (proofCont) proofCont.innerHTML = '';
  const sourcesCont = document.getElementById('official-sources-table-container');
  if (sourcesCont) sourcesCont.innerHTML = '';
  const verifCont = document.getElementById('real-ai-verification-container');
  if (verifCont) verifCont.innerHTML = '';
  const swarmChatsCont = document.getElementById('swarm-chats-container');
  if (swarmChatsCont) swarmChatsCont.innerHTML = '';
  const respInterrogacion = document.getElementById('respuestas-interrogacion-container');
  if (respInterrogacion) {
    respInterrogacion.classList.add('hidden');
    respInterrogacion.innerHTML = '';
  }

  // Restablecer etiquetas y KPIs a sus valores iniciales
  ['dash-titulo-proyecto', 'dash-territorio', 'dash-tamano-enjambre', 'dash-dictamen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '';
  });
  ['kpi-aprobacion', 'kpi-rechazo', 'kpi-indiferencia', 'kpi-entusiasmo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '--%';
  });
  const friccionValEl = document.getElementById('kpi-friccion-val');
  if (friccionValEl) friccionValEl.innerText = '--/100';

  // 8. Destruir instancias previas de gráficas si existen
  if (typeof Chart !== 'undefined') {
    ['chartGlobal', 'chartSectores', 'chartProblemas', 'chartEvolucion', 'pdfChartGlobal', 'pdfChartSectores', 'pdfChartProblemas', 'pdfChartEvolucion'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const c = Chart.getChart(el);
        if (c) c.destroy();
      }
    });
  }

  // 9. Restablecer estado de la aplicación
  appState.tituloProyecto = '';
  appState.propuestaTexto = '';
  appState.documentData = null;
  appState.visualData = null;
  appState.estado = 'Estado de México';
  appState.municipio = 'Ecatepec de Morelos';
  appState.localidad = '';
  appState.swarmSize = 100;
  appState.webSearchActive = true;
  appState.currentReport = null;

  restoreSimulateButton();

  // 10. Scroll suave hacia arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (inputTitulo) inputTitulo.focus();

  showToast('Sistema reiniciado. Listo para ingresar una nueva simulación.');
};

/**
 * Carga de Propuestas de Ejemplo (Presets) con opción destacada de Propuesta Propia
 */
async function loadPresets() {
  const container = document.getElementById('presets-container');
  if (!container) return;

  try {
    const res = await fetch('/api/presets');
    const data = await res.json();
    if (data.success && data.presets) {
      appState.presets = data.presets;
      
      const customBtn = `
        <button type="button" onclick="clearForCustomProposal()"
          class="text-xs text-left px-3 py-2 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold transition-all flex items-center justify-between gap-2 shadow-xs group">
          <span class="truncate group-hover:underline">➕ Mi Propia Propuesta</span>
          <span class="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">En blanco</span>
        </button>
      `;

      container.innerHTML = customBtn + data.presets.map((p, idx) => `
        <button type="button" onclick="applyPreset('${p.id}')"
          class="text-xs text-left px-3 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-gray-800 transition-all flex items-center justify-between gap-2 shadow-sm">
          <span class="font-semibold truncate">${p.titulo}</span>
          <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">${p.municipio.split(' ')[0]}</span>
        </button>
      `).join('');
    }
  } catch (err) {
    console.error('Error cargando presets:', err);
  }
}

/**
 * Aplica una propuesta precargada al formulario
 */
window.applyPreset = function(presetId) {
  const preset = appState.presets.find(p => p.id === presetId);
  if (!preset) return;

  document.getElementById('input-titulo').value = preset.titulo;
  document.getElementById('input-propuesta').value = preset.descripcion;
  document.getElementById('select-estado').value = preset.estado;
  
  loadMunicipalities(preset.estado).then(() => {
    document.getElementById('select-municipio').value = preset.municipio;
    document.getElementById('input-localidad').value = preset.localidad || '';
    appState.municipio = preset.municipio;
    appState.localidad = preset.localidad || '';
  });

  appState.tituloProyecto = preset.titulo;
  appState.propuestaTexto = preset.descripcion;

  // Cargar resumen visual de ejemplo si existe
  if (preset.resumenVisual) {
    appState.visualData = preset.resumenVisual;
    renderVisualSummaryCard(preset.resumenVisual, 'Render institucional de alta resolución');
  }

  // Notificación amigable
  showToast(`Propuesta "${preset.titulo.substring(0, 32)}..." cargada exitosamente`);
};

/**
 * Configuración de Event Listeners
 */
function setupEventListeners() {
  // Cambio de Estado
  const selectEstado = document.getElementById('select-estado');
  selectEstado.addEventListener('change', (e) => {
    appState.estado = e.target.value;
    loadMunicipalities(appState.estado);
  });

  // Cambio de Municipio
  const selectMunicipio = document.getElementById('select-municipio');
  selectMunicipio.addEventListener('change', (e) => {
    appState.municipio = e.target.value;
  });

  // Campo Localidad
  const inputLocalidad = document.getElementById('input-localidad');
  inputLocalidad.addEventListener('input', (e) => {
    appState.localidad = e.target.value;
  });

  // Slider de Agentes
  const swarmSlider = document.getElementById('swarm-slider');
  const swarmCountDisplay = document.getElementById('swarm-count-display');
  swarmSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    appState.swarmSize = val;
    swarmCountDisplay.innerText = val.toLocaleString();
    updateSwarmDepthIndicator(val);
  });

  // Botones de acceso rápido para tamaño del enjambre
  document.querySelectorAll('.btn-swarm-quick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = parseInt(e.target.getAttribute('data-val'), 10);
      swarmSlider.value = val;
      appState.swarmSize = val;
      swarmCountDisplay.innerText = val.toLocaleString();
      updateSwarmDepthIndicator(val);
    });
  });

  // Toggle de Búsqueda Web Activa
  const toggleWeb = document.getElementById('toggle-web-search');
  toggleWeb.addEventListener('change', (e) => {
    appState.webSearchActive = e.target.checked;
  });

  // Dropzone de Documentos
  setupDocumentDropzone();

  // Dropzone de Imágenes
  setupImageDropzone();

  // Botón Principal: Iniciar Simulación
  const btnSimular = document.getElementById('btn-iniciar-simulacion');
  btnSimular.addEventListener('click', () => {
    startSimulation();
  });

  // Botón Exportar PDF
  const btnExportPdf = document.getElementById('btn-export-pdf');
  btnExportPdf.addEventListener('click', () => {
    PDFExport.exportReport(appState.currentReport);
  });

  // Filtros de pestañas de chats del enjambre (Regla Maestro 50%+)
  document.querySelectorAll('.btn-chat-filter').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      document.querySelectorAll('.btn-chat-filter').forEach(t => {
        t.className = 'btn-chat-filter px-3 py-1.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
      });
      btn.className = 'btn-chat-filter px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-600 text-white transition-all';

      const filter = btn.getAttribute('data-filter') || 'todos';
      const searchQuery = document.getElementById('input-search-chats')?.value || '';
      if (appState.currentReport) {
        const chats = appState.currentReport.chatsDelEnjambre || appState.currentReport.vocesDelEnjambre || [];
        Components.renderSwarmChatFeed('swarm-chats-container', chats, filter, searchQuery);
      }
    });
  });

  // Búsqueda en vivo en los comentarios del enjambre
  const inputSearchChats = document.getElementById('input-search-chats');
  if (inputSearchChats) {
    inputSearchChats.addEventListener('input', (e) => {
      const query = e.target.value;
      const activeTab = document.querySelector('.btn-chat-filter.bg-emerald-600');
      const filter = activeTab ? activeTab.getAttribute('data-filter') : 'todos';
      if (appState.currentReport) {
        const chats = appState.currentReport.chatsDelEnjambre || appState.currentReport.vocesDelEnjambre || [];
        Components.renderSwarmChatFeed('swarm-chats-container', chats, filter, query);
      }
    });
  }

  // Filtros de pestañas de testimonios anteriores (retrocompatibilidad)
  document.querySelectorAll('.btn-tab-voces').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      document.querySelectorAll('.btn-tab-voces').forEach(t => {
        t.className = 'btn-tab-voces px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
      });
      btn.className = 'btn-tab-voces px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white transition-all';

      const filter = btn.getAttribute('data-filter') || 'todos';
      if (appState.currentReport) {
        Components.renderSwarmVoices('swarm-voices-container', appState.currentReport.vocesDelEnjambre, filter);
      }
    });
  });

  // Enter en el campo de interrogación al enjambre
  const inputPregunta = document.getElementById('input-pregunta-enjambre');
  if (inputPregunta) {
    inputPregunta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.askSwarmQuestion();
      }
    });
  }
}

/**
 * Actualiza el indicador dinámico de profundidad estadística del enjambre
 */
function updateSwarmDepthIndicator(size) {
  const depthText = document.getElementById('swarm-depth-indicator');
  if (!depthText) return;

  if (size <= 150) {
    depthText.innerHTML = `⚡ <b>${size} Agentes:</b> Muestra rápida exploratoria de barrio (Margen ±8.2%). Rápido para testeos preliminares.`;
  } else if (size <= 400) {
    depthText.innerHTML = `📊 <b>${size} Agentes:</b> Muestra censal estándar representativa por colonias y rangos de edad (Margen ±${(100 / Math.sqrt(size)).toFixed(1)}%). Recomendado.`;
  } else if (size <= 750) {
    depthText.innerHTML = `🔬 <b>${size} Agentes:</b> Muestra profunda con alta sensibilidad barrial y gremial (Margen ±${(100 / Math.sqrt(size)).toFixed(1)}%). Detecta focos de resistencia.`;
  } else {
    depthText.innerHTML = `🚀 <b>${size} Agentes:</b> Simulación masiva a escala territorial completa (Margen ±3.1%). Máxima precisión con deliberación extendida.`;
  }
}

/**
 * Configuración de Dropzone para Documentos (.pdf, .docx, .txt)
 */
function setupDocumentDropzone() {
  const fileInput = document.getElementById('input-file-doc');
  const dropArea = document.getElementById('dropzone-doc');
  const docStatus = document.getElementById('doc-status-box');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('border-emerald-500', 'bg-emerald-50/50'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('border-emerald-500', 'bg-emerald-50/50'), false);
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) handleDocumentUpload(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleDocumentUpload(e.target.files[0]);
  });
}

async function handleDocumentUpload(file) {
  const docStatus = document.getElementById('doc-status-box');
  docStatus.classList.remove('hidden');
  docStatus.innerHTML = `<span class="text-xs text-emerald-700 animate-pulse">⏳ Procesando y extrayendo contenido de <b>${file.name}</b>...</span>`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/upload/multimodal', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success && data.documentAnalysis) {
      appState.documentData = data.documentAnalysis;
      docStatus.innerHTML = `
        <div class="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between">
          <div>
            <b>📄 Documento analizado:</b> ${data.filename} (${data.documentAnalysis.caracteres.toLocaleString()} caracteres extraídos)
          </div>
          <button type="button" onclick="previewDocText()" class="text-[11px] underline font-bold text-emerald-700 hover:text-emerald-900">Ver extracto</button>
        </div>
      `;
      showToast(`Documento "${file.name}" parseado por el Agente Multimodal`);
    } else {
      docStatus.innerHTML = `<span class="text-xs text-red-600">Error al procesar documento: ${data.error || 'Formato no soportado'}</span>`;
    }
  } catch (err) {
    console.error('Error al subir documento:', err);
    docStatus.innerHTML = `<span class="text-xs text-red-600">Error en el servidor al cargar archivo</span>`;
  }
}

window.previewDocText = function() {
  if (appState.documentData && appState.documentData.textoExtraido) {
    alert(`EXTRACTO DEL DOCUMENTO ANALIZADO:\n\n${appState.documentData.textoExtraido.substring(0, 700)}...`);
  }
};

/**
 * Configuración de Dropzone para Imágenes con IA Vision
 */
function setupImageDropzone() {
  const fileInput = document.getElementById('input-file-img');
  const dropArea = document.getElementById('dropzone-img');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('border-emerald-500', 'bg-emerald-50/50'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('border-emerald-500', 'bg-emerald-50/50'), false);
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) handleImageUpload(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleImageUpload(e.target.files[0]);
  });
}

async function handleImageUpload(file) {
  const previewContainer = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('image-preview-element');
  const imgBox = document.getElementById('image-visual-card');

  // Vista previa local inmediata
  const reader = new FileReader();
  reader.onload = function(e) {
    previewImg.src = e.target.result;
    previewContainer.classList.remove('hidden');
  };
  reader.readAsDataURL(file);

  imgBox.classList.remove('hidden');
  imgBox.innerHTML = `<span class="text-xs text-emerald-700 animate-pulse">👁️ Agente Vision analizando render y extrayendo elementos semánticos...</span>`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/upload/multimodal', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success && data.visualAnalysis) {
      appState.visualData = data.visualAnalysis;
      renderVisualSummaryCard(data.visualAnalysis, data.filename);
      showToast(`Imagen "${file.name}" examinada por el Agente Vision`);
    } else {
      imgBox.innerHTML = `<span class="text-xs text-red-600">Error al analizar imagen con IA Vision</span>`;
    }
  } catch (err) {
    console.error('Error al subir imagen:', err);
    imgBox.innerHTML = `<span class="text-xs text-red-600">Error en el servidor al cargar imagen</span>`;
  }
}

/**
 * Renderiza el recuadro de "Resumen Visual detectado por IA" (Requerimiento C.3)
 */
function renderVisualSummaryCard(visual, filename) {
  const box = document.getElementById('image-visual-card');
  if (!box) return;

  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="visual-summary-box p-3.5 space-y-2">
      <div class="flex items-center justify-between border-b border-emerald-200 pb-2">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-600 animate-ping"></span>
          <span class="text-xs font-bold text-emerald-950 uppercase tracking-wide">Resumen Visual detectado por IA</span>
        </div>
        <span class="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
          Score Verde: ${visual.scoreAmbiental || '95/100'}
        </span>
      </div>

      <div class="text-xs text-gray-800">
        <p class="font-semibold text-emerald-900 mb-1">📐 Tipo: ${visual.tipoVisual || 'Render Arquitectónico'}</p>
        <p class="text-[11px] text-gray-600 mb-2"><b>Archivo:</b> ${filename}</p>

        <span class="text-[11px] font-bold text-gray-700 block mb-1">Elementos identificados por visión computacional:</span>
        <ul class="list-disc list-inside space-y-1 text-[11px] text-gray-700">
          ${(visual.elementosDetectados || []).map(el => `<li>${el}</li>`).join('')}
        </ul>

        <div class="mt-2.5 pt-2 border-t border-emerald-100 text-[11px] text-emerald-800">
          <b>Impacto visual en la comunidad:</b> ${visual.impactoEstetico || visual.beneficioClave || 'Mejora integral del entorno urbano.'}
        </div>
      </div>
    </div>
  `;
}

/**
 * Inicia la Simulación Predictiva del Enjambre
 */
async function startSimulation() {
  const titulo = document.getElementById('input-titulo').value.trim();
  const propuesta = document.getElementById('input-propuesta').value.trim();
  const estado = document.getElementById('select-estado').value;
  const municipio = document.getElementById('select-municipio').value;
  const localidad = document.getElementById('input-localidad').value.trim();

  if (!propuesta && !appState.documentData) {
    alert('Por favor redacta la propuesta o sube un documento técnico para iniciar la simulación.');
    document.getElementById('input-propuesta').focus();
    return;
  }

  appState.tituloProyecto = titulo || 'Iniciativa Comunitaria Ciudadana';
  appState.propuestaTexto = propuesta;
  appState.estado = estado;
  appState.municipio = municipio;
  appState.localidad = localidad;

  // Filtros demográficos
  const filtroEdad = document.getElementById('filtro-edad')?.value || 'todos';
  const filtroNse = document.getElementById('filtro-nse')?.value || 'todos';
  const filtroOcupacion = document.getElementById('filtro-ocupacion')?.value || 'todos';
  appState.filtrosDemograficos = { rangoEdad: filtroEdad, nse: filtroNse, ocupacion: filtroOcupacion };

  // Mostrar sección de consola de progreso y scroll
  const consoleSection = document.getElementById('progress-console-section');
  consoleSection.classList.remove('hidden');
  consoleSection.scrollIntoView({ behavior: 'smooth' });

  // Deshabilitar botón temporalmente
  const btnSimular = document.getElementById('btn-iniciar-simulacion');
  btnSimular.disabled = true;
  btnSimular.classList.add('opacity-50', 'cursor-not-allowed');

  // Resetear estados de pasos
  resetProgressSteps();
  clearTerminal();

  logToTerminal('router', `Iniciando sesión de simulación predictiva para: "${appState.tituloProyecto}"`);
  logToTerminal('router', `Territorio objetivo: ${appState.municipio}, ${appState.estado} (${appState.localidad || 'Zona General'})`);
  logToTerminal('router', `Enjambre configurado: ${appState.swarmSize} agentes ciudadanos sintéticos.`);

  // Feedback inmediato al hacer clic: fijar en 8% y activar paso 1
  handleProgressUpdate({
    paso: 1,
    porcentaje: 8,
    agente: 'Agente Orquestador Central',
    mensaje: `Iniciando sesión predictiva para: "${appState.tituloProyecto}"...`,
    status: 'active'
  });

  const payload = {
    tituloProyecto: appState.tituloProyecto,
    propuestaTexto: appState.propuestaTexto,
    documentData: appState.documentData,
    visualData: appState.visualData,
    estado: appState.estado,
    municipio: appState.municipio,
    localidad: appState.localidad,
    filtrosDemograficos: appState.filtrosDemograficos,
    swarmSize: appState.swarmSize,
    webSearchActive: appState.webSearchActive,
    aiConfig: appState.aiConfig
  };

  let simulationCompleted = false;

  try {
    // 1. Intentar streaming POST en tiempo real (maneja cualquier tamaño de documento o texto)
    const response = await fetch('/api/simulate/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop(); // Guardar residuo incompleto

        for (const evt of events) {
          const trimmed = evt.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            if (jsonStr) {
              try {
                const step = JSON.parse(jsonStr);
                handleProgressUpdate(step);
                if (step.status === 'completed' && step.data) {
                  simulationCompleted = true;
                  onSimulationFinished(step.data);
                }
              } catch (parseErr) {
                console.warn('Chunk no JSON:', parseErr);
              }
            }
          }
        }
      }
    }
  } catch (streamError) {
    console.warn('Streaming fetch falló, recurriendo a motor POST directo:', streamError);
  }

  // 2. Si el streaming no concluyó o el navegador no soporta reader, fallback directo resiliente
  if (!simulationCompleted) {
    try {
      logToTerminal('router', 'Sincronizando pipeline en canal seguro directo...');
      
      // Progresión animada activa mientras responde el servidor
      let animProgress = 15;
      const progressTimer = setInterval(() => {
        if (simulationCompleted) {
          clearInterval(progressTimer);
          return;
        }
        animProgress = Math.min(animProgress + 18, 92);
        const currentStep = animProgress < 30 ? 1 : (animProgress < 55 ? 2 : (animProgress < 80 ? 3 : 4));
        handleProgressUpdate({
          paso: currentStep,
          porcentaje: animProgress,
          agente: currentStep === 1 ? 'Agente Analista Multimodal' : (currentStep === 2 ? 'Agente Investigador OSINT' : (currentStep === 3 ? 'Motor de Enjambre Ciudadano' : 'Agente Estratega PVEM')),
          mensaje: currentStep === 1 ? 'Extrayendo parámetros y variables del proyecto...' : (currentStep === 2 ? 'Cruzando problemáticas censales del municipio...' : (currentStep === 3 ? `Procesando votos individuales de ${appState.swarmSize} ciudadanos...` : 'Deliberando y calculando mapa de calor...')),
          status: 'active'
        });
      }, 350);

      const postRes = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const postData = await postRes.json();
      clearInterval(progressTimer);

      if (postData.success && postData.report) {
        simulationCompleted = true;
        handleProgressUpdate({
          paso: 4,
          porcentaje: 100,
          agente: 'Agente Orquestador Central',
          mensaje: 'Simulación completada con éxito. Desplegando resultados...',
          status: 'completed',
          data: postData.report
        });
        onSimulationFinished(postData.report);
      } else {
        logToTerminal('router', `ERROR: ${postData.error || 'No se pudo completar la simulación'}`);
      }
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      logToTerminal('router', `Error crítico: ${fallbackError.message}`);
    }
  }

  restoreSimulateButton();
}

function restoreSimulateButton() {
  const btnSimular = document.getElementById('btn-iniciar-simulacion');
  btnSimular.disabled = false;
  btnSimular.classList.remove('opacity-50', 'cursor-not-allowed');
}

/**
 * Manejo visual de actualización de progreso paso a paso
 */
function handleProgressUpdate(step) {
  // Barra de progreso global
  const progressBar = document.getElementById('global-progress-bar');
  const progressText = document.getElementById('global-progress-text');
  if (progressBar) progressBar.style.width = `${step.porcentaje}%`;
  if (progressText) progressText.innerText = `${step.porcentaje}%`;

  // Mapeo de tag de agente para la terminal
  let tag = 'router';
  if (step.agente?.includes('Multimodal')) tag = 'multimodal';
  if (step.agente?.includes('Investigador')) tag = 'osint';
  if (step.agente?.includes('Persona')) tag = 'persona';
  if (step.agente?.includes('Enjambre')) tag = 'swarm';
  if (step.agente?.includes('Deliberación')) tag = 'deliberation';
  if (step.agente?.includes('Sintetizador')) tag = 'strategist';
  if (step.agente?.includes('Auditor') || step.agente?.includes('Watchdog')) tag = 'watchdog';

  logToTerminal(tag, step.mensaje);

  // Actualizar indicadores de los 4 pasos visuales
  const p = step.paso;
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step-card-${i}`);
    const badge = document.getElementById(`step-badge-${i}`);

    if (i < p) {
      setStepState(stepEl, badge, 'completed');
    } else if (i === p) {
      setStepState(stepEl, badge, step.status === 'done' ? 'completed' : 'active');
    } else {
      setStepState(stepEl, badge, 'pending');
    }
  }
}

function setStepState(card, badge, state) {
  if (!card || !badge) return;
  if (state === 'completed') {
    card.classList.remove('border-gray-200', 'border-emerald-500', 'bg-emerald-50/50');
    card.classList.add('border-emerald-600', 'bg-emerald-50');
    badge.className = 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold';
    badge.innerHTML = '✓';
  } else if (state === 'active') {
    card.classList.remove('border-gray-200', 'border-emerald-600');
    card.classList.add('border-emerald-500', 'bg-emerald-50/50', 'ring-2', 'ring-emerald-300');
    badge.className = 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold animate-pulse';
    badge.innerHTML = '...';
  } else {
    card.classList.remove('border-emerald-500', 'border-emerald-600', 'bg-emerald-50', 'ring-2', 'ring-emerald-300');
    card.classList.add('border-gray-200');
    badge.className = 'w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold';
  }
}

function resetProgressSteps() {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step-card-${i}`);
    const badge = document.getElementById(`step-badge-${i}`);
    setStepState(stepEl, badge, 'pending');
    badge.innerHTML = `${i}`;
  }
}

/**
 * Log con scroll automático en la terminal
 */
function logToTerminal(agentType, text) {
  const terminal = document.getElementById('terminal-log-content');
  if (!terminal) return;

  const time = new Date().toLocaleTimeString('es-MX', { hour12: false });
  const entry = document.createElement('div');
  entry.className = 'terminal-log-entry flex items-start gap-2';

  let tagClass = 'agent-tag-router';
  let tagLabel = 'ROUTER';

  if (agentType === 'multimodal') { tagClass = 'agent-tag-multimodal'; tagLabel = 'VISION/DOC'; }
  else if (agentType === 'osint') { tagClass = 'agent-tag-osint'; tagLabel = 'OSINT/WEB'; }
  else if (agentType === 'persona') { tagClass = 'agent-tag-persona'; tagLabel = 'PERSONA'; }
  else if (agentType === 'swarm') { tagClass = 'agent-tag-swarm'; tagLabel = 'SWARM'; }
  else if (agentType === 'deliberation') { tagClass = 'agent-tag-deliberation'; tagLabel = 'DELIBERATION'; }
  else if (agentType === 'strategist') { tagClass = 'agent-tag-strategist'; tagLabel = 'STRATEGIST'; }
  else if (agentType === 'watchdog') { tagClass = 'agent-tag-watchdog'; tagLabel = 'WATCHDOG/AUDIT'; }

  entry.innerHTML = `
    <span class="text-gray-500 text-[10px] shrink-0 font-mono">[${time}]</span>
    <span class="agent-tag ${tagClass} shrink-0">${tagLabel}</span>
    <span class="text-gray-200 text-xs">${text}</span>
  `;

  terminal.appendChild(entry);
  terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
  const terminal = document.getElementById('terminal-log-content');
  if (terminal) terminal.innerHTML = '';
}

/**
 * Conclusión de la simulación y despliegue del Dashboard de Resultados
 */
function onSimulationFinished(report) {
  if (!report || !report.resumenEjecutivo) {
    console.error('Reporte inválido recibido en onSimulationFinished:', report);
    return;
  }
  appState.currentReport = report;
  const res = report.resumenEjecutivo;

  const dashboard = document.getElementById('results-dashboard-section');
  if (dashboard) dashboard.classList.remove('hidden');

  // Helper seguro para asignar texto sin riesgo de TypeError
  const safeSetText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = (val !== undefined && val !== null) ? val : '';
  };

  // 1. Rellenar métricas del encabezado del dashboard
  safeSetText('dash-titulo-proyecto', res.tituloProyecto || 'Iniciativa Comunitaria');
  safeSetText('dash-territorio', `${res.municipio || 'Edomex'}, ${res.estado || 'México'} (${res.localidad || 'Zona Urbana'})`);
  safeSetText('dash-tamano-enjambre', `${(res.tamanoEnjambre || appState.swarmSize || 100).toLocaleString()} Agentes Ciudadanos`);
  safeSetText('dash-dictamen', res.dictamenPolitico || 'Evaluación predictiva completada');

  // 2. Tarjetas KPI Principales (Garantía absoluta de porcentajes visibles)
  safeSetText('kpi-aprobacion', `${res.aprobacionFinal ?? 0}%`);
  safeSetText('kpi-rechazo', `${res.rechazoFinal ?? 0}%`);
  safeSetText('kpi-indiferencia', `${res.indiferenciaFinal ?? 0}%`);
  safeSetText('kpi-entusiasmo', `${res.promedioEntusiasmo ?? 50}%`);

  // Fricción social
  const friccionVal = document.getElementById('kpi-friccion-val');
  if (friccionVal) friccionVal.innerText = `${res.indiceFriccionSocial?.score ?? 50}/100`;
  const friccionBadge = document.getElementById('kpi-friccion-badge');
  if (friccionBadge) friccionBadge.innerText = res.indiceFriccionSocial?.nivel || 'Moderada';

  // 2.5 Segmentación Demográfica y Estrato Socioeconómico (Barras Gráficas Visuales)
  try {
    if (report.mapaCalorDemografico) {
      Components.renderHeatmap('demographic-heatmap-container', report.mapaCalorDemografico);
    }
  } catch (e) {
    console.warn('Advertencia en Segmentación Demográfica:', e);
  }

  // 3. Panel del Agente Auditor de IA (Proof of Reasoning)
  try {
    if (report.proofOfReasoning) {
      Components.renderProofOfReasoning('proof-of-reasoning-container', report.proofOfReasoning);
    }
  } catch (e) {
    console.warn('Advertencia en Proof of Reasoning:', e);
  }

  // 4. Tabla de Fuentes Oficiales Gubernamentales Verificadas
  try {
    if (report.fuentesOficialesVerificadas) {
      Components.renderOfficialSourcesTable('official-sources-table-container', report.fuentesOficialesVerificadas);
    }
  } catch (e) {
    console.warn('Advertencia en Fuentes Oficiales:', e);
  }

  // 5. Consola de Verificación y Autodiagnóstico de IA Real
  try {
    if (report.verificacionIAReal) {
      Components.renderRealAiVerificationPanel('real-ai-verification-container', report.verificacionIAReal);
    }
  } catch (e) {
    console.warn('Advertencia en Verificación IA:', e);
  }


  // 7. FEED DE CHATS DEL ENJAMBRE CIUDADANO (RENDERIZADO INMEDIATO Y AUTOMÁTICO EN "TODOS")
  try {
    const swarmChats = report.chatsDelEnjambre || report.vocesDelEnjambre || [];
    Components.renderSwarmChatFeed('swarm-chats-container', swarmChats, 'todos', '');

    // Resetear estilos visuales de pestañas de filtro de chat
    document.querySelectorAll('.btn-chat-filter').forEach(tab => {
      if (tab.getAttribute('data-filter') === 'todos') {
        tab.className = 'btn-chat-filter px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-600 text-white transition-all shadow-xs';
      } else {
        tab.className = 'btn-chat-filter px-3 py-1.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
      }
    });

    const inputSearch = document.getElementById('input-search-chats');
    if (inputSearch) inputSearch.value = '';
  } catch (chatErr) {
    console.error('Error renderizando feed de chats del enjambre:', chatErr);
  }

  // 8. Scroll suave al dashboard de resultados
  setTimeout(() => {
    if (dashboard) dashboard.scrollIntoView({ behavior: 'smooth' });
    showToast('¡Simulación completada! Resultados y comentarios del enjambre listos.');
  }, 300);
}

/**
 * Toast amigable de notificación
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-5 right-5 bg-emerald-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold z-50 flex items-center gap-2 border border-emerald-700 animate-bounce';
  toast.innerHTML = `<span>🟢</span> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/**
 * ========================================================
 * MÓDULO DE CONFIGURACIÓN DE IA Y MODELOS EXTERNOS (MODAL)
 * ========================================================
 */

window.openConfigModal = function() {
  const modal = document.getElementById('modal-config');
  if (!modal) return;

  // Cargar valores actuales en los campos
  const cfg = appState.aiConfig;
  const radioProvider = document.querySelector(`input[name="ai_provider"][value="${cfg.provider}"]`);
  if (radioProvider) {
    radioProvider.checked = true;
    onProviderChange(cfg.provider);
  }

  const apiKeyInput = document.getElementById('cfg-api-key');
  if (apiKeyInput) apiKeyInput.value = cfg.apiKey || '';

  const radioSearch = document.querySelector(`input[name="search_provider"][value="${cfg.searchProvider || 'native'}"]`);
  if (radioSearch) {
    radioSearch.checked = true;
    onSearchProviderChange(cfg.searchProvider || 'native');
  }

  const tavilyKeyInput = document.getElementById('cfg-tavily-key');
  if (tavilyKeyInput) tavilyKeyInput.value = cfg.tavilyApiKey || '';

  // Limpiar alertas previas
  hideConfigAlert();

  modal.classList.remove('hidden');
};

window.closeConfigModal = function() {
  const modal = document.getElementById('modal-config');
  if (modal) modal.classList.add('hidden');
};

window.onProviderChange = function(provider) {
  const settingsDiv = document.getElementById('external-llm-settings');
  const keyLink = document.getElementById('cfg-key-link');
  
  // Actualizar estilos de las tarjetas
  ['native', 'groq', 'gemini', 'openrouter', 'openai'].forEach(p => {
    const label = document.getElementById(`label-provider-${p}`);
    if (label) {
      if (p === provider) {
        label.classList.add('bg-emerald-50/40', 'border-emerald-500', 'ring-1', 'ring-emerald-400');
        label.classList.remove('bg-white', 'border-slate-200');
      } else {
        label.classList.remove('bg-emerald-50/40', 'border-emerald-500', 'ring-1', 'ring-emerald-400');
        label.classList.add('bg-white', 'border-slate-200');
      }
    }
  });

  if (provider === 'native') {
    if (settingsDiv) settingsDiv.classList.add('hidden');
  } else {
    if (settingsDiv) settingsDiv.classList.remove('hidden');
    populateModelOptions(provider, appState.aiConfig.model);

    if (keyLink) {
      if (provider === 'groq') {
        keyLink.href = 'https://console.groq.com/keys';
        keyLink.innerText = 'Obtener clave 100% GRATIS en Groq Console (sin tarjeta) ↗';
      } else if (provider === 'gemini') {
        keyLink.href = 'https://aistudio.google.com/app/apikey';
        keyLink.innerText = 'Obtener clave 100% GRATIS en Google AI Studio (1,500 req/día) ↗';
      } else if (provider === 'openrouter') {
        keyLink.href = 'https://openrouter.ai/keys';
        keyLink.innerText = 'Obtener clave para modelos :free en OpenRouter ↗';
      } else if (provider === 'openai') {
        keyLink.href = 'https://platform.openai.com/api-keys';
        keyLink.innerText = 'Obtener clave en OpenAI Platform ↗';
      }
    }
  }
};

function populateModelOptions(provider, selectedModel) {
  const select = document.getElementById('cfg-model');
  if (!select) return;

  if (provider === 'groq') {
    select.innerHTML = `
      <option value="llama-3.3-70b-versatile" ${selectedModel === 'llama-3.3-70b-versatile' || !selectedModel ? 'selected' : ''}>Llama 3.3 70B Versatile (Recomendado - Gratuito, Potente y Veloz)</option>
      <option value="llama-3.1-8b-instant" ${selectedModel === 'llama-3.1-8b-instant' ? 'selected' : ''}>Llama 3.1 8B Instant (Gratuito y Ultraligero)</option>
      <option value="mixtral-8x7b-32768" ${selectedModel === 'mixtral-8x7b-32768' ? 'selected' : ''}>Mixtral 8x7B (Gratuito - 32k contexto)</option>
    `;
  } else if (provider === 'gemini') {
    select.innerHTML = `
      <option value="gemini-1.5-flash" ${selectedModel === 'gemini-1.5-flash' || !selectedModel ? 'selected' : ''}>Gemini 1.5 Flash (Recomendado - Gratuito, Multimodal)</option>
      <option value="gemini-2.0-flash" ${selectedModel === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash (Experimental Gratuito)</option>
      <option value="gemini-1.5-pro" ${selectedModel === 'gemini-1.5-pro' ? 'selected' : ''}>Gemini 1.5 Pro (Razonamiento Profundo)</option>
    `;
  } else if (provider === 'openrouter') {
    select.innerHTML = `
      <option value="meta-llama/llama-3.2-3b-instruct:free" ${selectedModel === 'meta-llama/llama-3.2-3b-instruct:free' || !selectedModel ? 'selected' : ''}>Meta Llama 3.2 3B (:free - Gratuito)</option>
      <option value="google/gemini-2.0-flash-exp:free" ${selectedModel === 'google/gemini-2.0-flash-exp:free' ? 'selected' : ''}>Google Gemini 2.0 Flash (:free - Gratuito)</option>
      <option value="mistralai/mistral-7b-instruct:free" ${selectedModel === 'mistralai/mistral-7b-instruct:free' ? 'selected' : ''}>Mistral 7B Instruct (:free - Gratuito)</option>
    `;
  } else if (provider === 'openai') {
    select.innerHTML = `
      <option value="gpt-4o-mini" ${selectedModel === 'gpt-4o-mini' || !selectedModel ? 'selected' : ''}>GPT-4o Mini (Rápido, Económico y Preciso)</option>
      <option value="gpt-4o" ${selectedModel === 'gpt-4o' ? 'selected' : ''}>GPT-4o (Máxima Capacidad Multimodal)</option>
    `;
  }
}

window.onSearchProviderChange = function(provider) {
  const tavilyContainer = document.getElementById('tavily-key-container');
  const labelNative = document.getElementById('label-search-native');
  const labelTavily = document.getElementById('label-search-tavily');

  if (provider === 'tavily') {
    if (tavilyContainer) tavilyContainer.classList.remove('hidden');
    if (labelTavily) labelTavily.classList.add('bg-emerald-50/40', 'border-emerald-400');
    if (labelNative) labelNative.classList.remove('bg-emerald-50/30', 'border-emerald-200');
  } else {
    if (tavilyContainer) tavilyContainer.classList.add('hidden');
    if (labelNative) labelNative.classList.add('bg-emerald-50/30', 'border-emerald-200');
    if (labelTavily) labelTavily.classList.remove('bg-emerald-50/40', 'border-emerald-400');
  }
};

window.toggleApiKeyVisibility = function() {
  const input = document.getElementById('cfg-api-key');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
};

window.testAIConnection = async function() {
  const provider = document.querySelector('input[name="ai_provider"]:checked')?.value || 'native';
  const apiKey = document.getElementById('cfg-api-key')?.value.trim() || '';
  const model = document.getElementById('cfg-model')?.value || '';
  const btn = document.getElementById('btn-test-connection');

  if (provider !== 'native' && !apiKey) {
    showConfigAlert(false, 'Por favor escribe o pega tu API Key antes de probar la conexión.');
    return;
  }

  btn.disabled = true;
  btn.innerText = '⏳ Probando conexión...';
  hideConfigAlert();

  try {
    const res = await fetch('/api/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey, model })
    });
    const data = await res.json();

    if (data.success) {
      showConfigAlert(true, `✓ ${data.message}`);
    } else {
      showConfigAlert(false, `✗ Error: ${data.error || 'No se pudo conectar'}`);
    }
  } catch (err) {
    showConfigAlert(false, `✗ Error de red: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerText = '⚡ Probar Conexión';
  }
};

window.saveAIConfig = function() {
  const provider = document.querySelector('input[name="ai_provider"]:checked')?.value || 'native';
  const apiKey = document.getElementById('cfg-api-key')?.value.trim() || '';
  const model = document.getElementById('cfg-model')?.value || 'native';
  const searchProvider = document.querySelector('input[name="search_provider"]:checked')?.value || 'native';
  const tavilyApiKey = document.getElementById('cfg-tavily-key')?.value.trim() || '';

  if (provider !== 'native' && !apiKey) {
    showConfigAlert(false, 'Por favor ingresa una API Key o selecciona "Motor Híbrido".');
    return;
  }

  appState.aiConfig = {
    provider,
    model: provider === 'native' ? 'native' : model,
    apiKey: provider === 'native' ? '' : apiKey,
    searchProvider,
    tavilyApiKey
  };

  // Guardar en localStorage
  try {
    localStorage.setItem('pvem_ai_config', JSON.stringify(appState.aiConfig));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }

  updateNavModelBadge();
  closeConfigModal();
  showToast(`Configuración de IA actualizada: ${getProviderLabel(provider, model)}`);
};

function loadStoredAIConfig() {
  try {
    const stored = localStorage.getItem('pvem_ai_config');
    if (stored) {
      appState.aiConfig = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Error leyendo localStorage:', e);
  }
  updateNavModelBadge();
}

function updateNavModelBadge() {
  const badge = document.getElementById('nav-model-badge');
  if (!badge) return;

  const cfg = appState.aiConfig;
  if (cfg.provider === 'groq') {
    badge.innerText = `Groq (Llama 3.3 Free)`;
    badge.className = 'text-[10px] bg-orange-100 text-orange-900 font-extrabold px-1.5 py-0.5 rounded border border-orange-300';
  } else if (cfg.provider === 'gemini') {
    badge.innerText = `Gemini (${(cfg.model || '1.5-flash').replace('gemini-', '')})`;
    badge.className = 'text-[10px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded border border-blue-200';
  } else if (cfg.provider === 'openrouter') {
    badge.innerText = `OpenRouter (:free)`;
    badge.className = 'text-[10px] bg-indigo-100 text-indigo-900 font-extrabold px-1.5 py-0.5 rounded border border-indigo-200';
  } else if (cfg.provider === 'openai') {
    badge.innerText = `OpenAI (${(cfg.model || 'gpt-4o').toUpperCase()})`;
    badge.className = 'text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded border border-purple-200';
  } else {
    badge.innerText = 'Motor Híbrido Semántico';
    badge.className = 'text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200';
  }
}

function getProviderLabel(provider, model) {
  if (provider === 'groq') return `Groq Cloud (${model || 'Llama 3.3 70B'})`;
  if (provider === 'gemini') return `Google Gemini (${model || '1.5 Flash'})`;
  if (provider === 'openrouter') return `OpenRouter (${model || ':free'})`;
  if (provider === 'openai') return `OpenAI (${model || 'GPT-4o'})`;
  return 'Motor Híbrido Semántico INEGI-ABM';
}

function showConfigAlert(isSuccess, text) {
  const alertEl = document.getElementById('cfg-feedback-alert');
  if (!alertEl) return;
  alertEl.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-900', 'border-emerald-300', 'bg-red-50', 'text-red-900', 'border-red-300');
  
  if (isSuccess) {
    alertEl.classList.add('bg-emerald-50', 'text-emerald-900', 'border', 'border-emerald-300');
  } else {
    alertEl.classList.add('bg-red-50', 'text-red-900', 'border', 'border-red-300');
  }
  alertEl.innerHTML = text;
}

function hideConfigAlert() {
  const alertEl = document.getElementById('cfg-feedback-alert');
  if (alertEl) {
    alertEl.classList.add('hidden');
    alertEl.innerHTML = '';
  }
}

/**
 * ========================================================
 * MÓDULO DE INTERACCIÓN CON EL ENJAMBRE Y MODAL DE CIUDADANO
 * ========================================================
 */

/**
 * Muestra el modal de inspección detallada de un agente ciudadano sintético
 */
window.openCitizenDetailModal = function(encodedData) {
  try {
    const c = JSON.parse(decodeURIComponent(encodedData));
    const modal = document.getElementById('modal-citizen-detail');
    if (!modal) return;

    const avatar = document.getElementById('m-citizen-avatar');
    if (avatar) {
      avatar.src = c.avatarUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(c.nombre || 'Ciudadano')}`;
    }

    const nameEl = document.getElementById('m-citizen-name');
    if (nameEl) nameEl.innerText = c.nombre || 'Ciudadano Sintético';

    const metaEl = document.getElementById('m-citizen-meta');
    if (metaEl) {
      metaEl.innerText = `${c.edad || 35} años • ${c.genero || 'Ciudadano'} • Col. ${c.colonia || 'Centro'}, ${c.municipio || 'Edomex'} • NSE ${c.nse || 'C'}`;
    }

    const voteEl = document.getElementById('m-citizen-vote');
    if (voteEl) {
      const v = c.voto || c.postura || 'A favor';
      voteEl.innerText = v;
      if (v.toLowerCase().includes('contra')) {
        voteEl.className = 'text-red-600 uppercase font-black';
      } else if (v.toLowerCase().includes('neutro')) {
        voteEl.className = 'text-slate-600 uppercase font-black';
      } else {
        voteEl.className = 'text-emerald-700 uppercase font-black';
      }
    }

    const enthEl = document.getElementById('m-citizen-enthusiasm');
    if (enthEl) enthEl.innerText = `${c.entusiasmo || 70}%`;

    const argEl = document.getElementById('m-citizen-argument');
    if (argEl) argEl.innerText = `"${c.argumento || c.mensaje || ''}"`;

    const transportEl = document.getElementById('m-citizen-transport');
    if (transportEl) transportEl.innerText = c.medioTransporte || 'Transporte colectivo y combis concesionadas';

    const concernEl = document.getElementById('m-citizen-concern');
    if (concernEl) concernEl.innerText = c.preocupacionPrincipal || c.interesPrioritario || 'Seguridad barrial, bacheo y suministro de agua';

    const delibEl = document.getElementById('m-citizen-deliberation');
    if (delibEl) {
      if (c.argumentoTecnico) {
        delibEl.innerHTML = `<b>Punto Medular:</b> ${c.argumentoTecnico}<br><b class="text-emerald-800">¿Qué condición le haría cambiar de opinión?:</b> ${c.condicionDeCambio || 'Mesas de trabajo comunitarias con supervisión ciudadana.'}`;
      } else {
        delibEl.innerText = c.deliberacion || 'Evaluó el impacto directo en sus tiempos de traslado, costos familiares y bienestar comunitario.';
      }
    }

    modal.classList.remove('hidden');
  } catch (err) {
    console.error('Error abriendo modal de ciudadano:', err);
  }
};

window.closeCitizenDetailModal = function() {
  const modal = document.getElementById('modal-citizen-detail');
  if (modal) modal.classList.add('hidden');
};

/**
 * Pregunta interactivamente al Enjambre Ciudadano y muestra respuestas
 */
window.askSwarmQuestion = async function() {
  const input = document.getElementById('input-pregunta-enjambre');
  const container = document.getElementById('respuestas-interrogacion-container');
  const btn = document.getElementById('btn-enviar-pregunta');
  if (!input || !container) return;

  const pregunta = input.value.trim();
  if (!pregunta) {
    showToast('Por favor escribe una pregunta para el enjambre.');
    input.focus();
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
      <span class="animate-spin text-sm">⏳</span>
      <span>Consultando las opiniones y argumentos de los agentes ciudadanos sobre: "<b>${pregunta}</b>"...</span>
    </div>
  `;

  if (btn) {
    btn.disabled = true;
    btn.classList.add('opacity-50');
  }

  try {
    const res = await fetch('/api/swarm/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta })
    });
    const data = await res.json();

    if (data.success && data.answers && data.answers.length > 0) {
      container.innerHTML = `
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>Resultados de la consulta directa al enjambre (${data.answers.length} agentes representativos):</span>
            <button type="button" onclick="document.getElementById('respuestas-interrogacion-container').classList.add('hidden')"
              class="text-slate-400 hover:text-slate-600 text-xs font-bold">Ocultar ✕</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            ${data.answers.map(ans => {
              let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              let borderCard = 'border-emerald-300 bg-emerald-50/20';
              if ((ans.postura || '').toLowerCase().includes('contra')) {
                badgeColor = 'bg-red-100 text-red-800 border-red-300';
                borderCard = 'border-red-300 bg-red-50/20';
              } else if ((ans.postura || '').toLowerCase().includes('neutro')) {
                badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
                borderCard = 'border-slate-300 bg-slate-50/30';
              }
              return `
                <div class="p-3 border rounded-xl bg-white shadow-xs flex flex-col justify-between ${borderCard} text-xs">
                  <div>
                    <div class="flex items-center justify-between gap-1 mb-1.5">
                      <span class="font-bold text-slate-900 truncate">${ans.nombre}</span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor} shrink-0">${ans.postura}</span>
                    </div>
                    <span class="text-[10px] text-slate-500 block mb-2">${ans.ocupacion}</span>
                    <p class="text-slate-700 italic text-[11px] leading-relaxed">"${ans.respuesta}"</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      showToast('El enjambre ha respondido a tu pregunta.');
    } else {
      container.innerHTML = `
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          No se obtuvieron respuestas directas del enjambre. Intenta con otra pregunta.
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = `
      <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
        Error al interrogar al enjambre: ${err.message}
      </div>
    `;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('opacity-50');
    }
  }
};

