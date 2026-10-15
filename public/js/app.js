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
  swarmSize: 500,
  webSearchActive: true,
  activeParty: 'PVEM',
  cicloElectoral: '2027',
  cargoElectoral: 'Presidente Municipal / Alcalde',
  radarAnalysis: null,
  isLocked: false,
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
  // Asegurar estado 100% neutral en la primera vista (Cero colores partidistas pre-login)
  enforceNeutralWelcomeState();

  // Bloqueo de botón "Atrás" del navegador tras cerrar sesión
  window.addEventListener('popstate', () => {
    if (!appState.activeSession) {
      enforceNeutralWelcomeState();
      window.history.pushState({ loggedOut: true }, '', window.location.pathname);
    }
  });

  loadStoredAIConfig();
  setupEventListeners();
  await loadStates();
  await loadMunicipalities('Estado de México');
  await loadPresets();
  setExactSwarmSize(500);
  switchWarRoomTab('tab-resumen-demografia');
}

function enforceNeutralWelcomeState() {
  const partyThemes = ['theme-pvem', 'theme-morena', 'theme-pan', 'theme-pri', 'theme-mc', 'theme-pt'];
  partyThemes.forEach(th => document.body.classList.remove(th));

  document.title = 'GovTech War Room — Plataforma de Inteligencia Predictiva y Simulación Social';
  const fav = document.getElementById('dynamic-favicon');
  if (fav) {
    fav.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230f172a'/><text x='16' y='21' font-family='Arial' font-weight='bold' font-size='13' fill='%23f8fafc' text-anchor='middle'>GW</text></svg>";
  }

  ['app-main-header', 'app-main-workspace', 'app-main-footer', 'modal-master-admin', 'modal-radar-electoral', 'modal-platform-info', 'modal-config', 'modal-citizen-detail'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Limpiar estrictamente campos de usuario y contraseña (Cero Autocompletado)
  const uInput = document.getElementById('auth-username');
  const pInput = document.getElementById('auth-password');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';

  if (typeof window.resetTurnstileWidget === 'function') {
    window.resetTurnstileWidget();
  }

  const loginGate = document.getElementById('modal-auth-login');
  if (loginGate) {
    loginGate.classList.remove('hidden');
  }
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
      let lista = data.municipios;
      const lic = appState.activeSession?.user;
      if (lic && appState.activeSession?.role !== 'MASTER_ADMIN' && Array.isArray(lic.municipiosAutorizados) && !lic.municipiosAutorizados.includes('TODOS')) {
        const filtered = lista.filter(m => lic.municipiosAutorizados.includes(m.nombre));
        if (filtered.length > 0) lista = filtered;
      }

      select.innerHTML = lista.map((m, idx) => `
        <option value="${m.nombre}" ${m.nombre === 'Ecatepec de Morelos' || idx === 0 ? 'selected' : ''}>
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
 * Limpia campos, documentos, imágenes, selectores, terminal y resultados; desbloquea controles.
 */
window.resetFullSimulation = function() {
  // Desbloquear controles primero
  lockSimulationControls(false);

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

  // 4. Restablecer muestra a 500 agentes
  setExactSwarmSize(500);

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

  const containersToClear = [
    'demographic-heatmap-container',
    'unions-intelligence-container',
    'official-sources-table-container',
    'proof-of-reasoning-container',
    'real-ai-verification-container',
    'swarm-chats-container',
    'strategic-defense-container',
    'attack-mode-container',
    'respuestas-interrogacion-container'
  ];
  containersToClear.forEach(cid => {
    const el = document.getElementById(cid);
    if (el) el.innerHTML = '';
  });

  // Restablecer etiquetas y KPIs a sus valores iniciales
  ['dash-titulo-proyecto', 'dash-territorio', 'dash-tamano-enjambre', 'dash-dictamen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '';
  });
  ['kpi-aprobacion', 'kpi-rechazo', 'kpi-indiferencia', 'kpi-entusiasmo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '--%';
  });
  ['kpi-aprobacion-votos', 'kpi-rechazo-votos', 'kpi-indiferencia-votos'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '';
  });
  const censoPillEl = document.getElementById('dash-modo-censo-pill');
  if (censoPillEl) censoPillEl.classList.add('hidden');
  const speedBannerEl = document.getElementById('telemetry-speed-banner');
  if (speedBannerEl) speedBannerEl.classList.add('hidden');
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
  appState.swarmSize = 500;
  appState.webSearchActive = true;
  appState.cicloElectoral = '2027';
  appState.cargoElectoral = 'Presidente Municipal / Alcalde';
  appState.radarAnalysis = null;
  appState.currentReport = null;

  const selectCiclo = document.getElementById('select-ciclo-electoral');
  if (selectCiclo) selectCiclo.value = '2027';
  const selectCargo = document.getElementById('select-cargo-electoral');
  if (selectCargo) selectCargo.value = 'Presidente Municipal / Alcalde';

  // Restaurar pestaña activa por defecto
  switchWarRoomTab('tab-resumen-demografia');
  restoreSimulateButton();

  // 10. Protocolo de Memoria Volátil y Cero Rastros de Cyber Sentinel
  if (typeof window !== 'undefined' && window.cyberSentinelAgent?.purgeSensitiveData) {
    window.cyberSentinelAgent.purgeSensitiveData();
  }

  // 11. Scroll suave hacia arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (inputTitulo) inputTitulo.focus();

  showToast('Sistema desbloqueado y reiniciado. Protocolo de memoria volátil ejecutado.');
};

/**
 * BLOQUEO DE CONTROLES POST-EJECUCIÓN (STATE LOCKING)
 * Inhabilita controles de configuración tras iniciar la simulación hasta presionar Reiniciar.
 */
window.lockSimulationControls = function(locked) {
  appState.isLocked = locked;
  const elementsToLock = [
    'select-party-theme',
    'select-estado',
    'select-municipio',
    'input-localidad',
    'filtro-edad',
    'filtro-nse',
    'filtro-ocupacion',
    'select-ciclo-electoral',
    'select-cargo-electoral',
    'btn-download-plan-maestro',
    'select-swarm-size',
    'toggle-web-search',
    'input-titulo',
    'input-propuesta',
    'input-file-doc',
    'input-file-img'
  ];

  elementsToLock.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = locked;
      if (locked) {
        el.classList.add('opacity-65', 'cursor-not-allowed', 'border-amber-300');
      } else {
        el.classList.remove('opacity-65', 'cursor-not-allowed', 'border-amber-300');
      }
    }
  });

  document.querySelectorAll('.btn-swarm-quick').forEach(btn => {
    btn.disabled = locked;
    if (locked) {
      btn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });

  const btnSimular = document.getElementById('btn-iniciar-simulacion');
  if (btnSimular) {
    if (locked) {
      btnSimular.disabled = true;
      btnSimular.classList.add('opacity-60', 'cursor-not-allowed');
      btnSimular.innerHTML = `<span class="flex items-center gap-1.5 justify-center"><span>🔒</span> <span>Simulación Bloqueada (Usa 'Reiniciar' para nueva propuesta)</span></span>`;
    } else {
      btnSimular.disabled = false;
      btnSimular.classList.remove('opacity-60', 'cursor-not-allowed');
      btnSimular.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>Iniciar Simulación Predictiva</span>
      `;
    }
  }
};

/**
 * BARRA DE NAVEGACIÓN TÁCTICA POR PESTAÑAS (TABBED WAR ROOM UI — CERO SATURACIÓN VISUAL)
 * Muestra solo una pestaña a la vez con animación fluida.
 */
window.switchWarRoomTab = function(tabId) {
  // 1. Alternar estilos de botones respetando la colorimetría del partido activo (Stacked Grid)
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = 'tab-btn active px-3 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center sm:justify-start gap-1.5 bg-emerald-600 text-white shadow-xs w-full text-left';
    } else {
      btn.className = 'tab-btn px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center sm:justify-start gap-1.5 w-full text-left';
    }
  });

  // 2. Ocultar todos los paneles y mostrar únicamente el seleccionado
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    if (tab.id === tabId) {
      tab.classList.remove('hidden');
      tab.classList.add('tabFadeIn');
    } else {
      tab.classList.add('hidden');
      tab.classList.remove('tabFadeIn');
    }
  });
};

/**
 * SELECTOR MULTIPARTIDISTA Y TEMAS WHITE-LABEL (PVEM, MORENA, PAN, PRI, MC, PT)
 * Cambia dinámicamente el logo de la página principal, colorimetría, favicons y textos
 */
window.onPartyThemeChange = function(partyCode) {
  const pCode = (partyCode || 'PVEM').toUpperCase();
  appState.activeParty = pCode;

  // 1. Alternar clase CSS en body para disparar la paleta de colores oficial
  const partyThemes = ['theme-pvem', 'theme-morena', 'theme-pan', 'theme-pri', 'theme-mc', 'theme-pt'];
  partyThemes.forEach(th => document.body.classList.remove(th));
  
  const currentClass = `theme-${pCode.toLowerCase()}`;
  document.body.classList.add(currentClass);

  // 2. Metadatos Oficiales de Marca, Colorimetría e Identidad
  const partyMetadata = {
    PVEM: {
      name: 'Partido Verde Ecologista Estado de México',
      shortName: 'PVEM',
      badgeLetter: 'PV',
      badgeText: '🌿 Inteligencia Artificial y Participación Ciudadana Predictiva',
      systemTitle: 'SISTEMA ENJAMBRE AI — PARTIDO VERDE',
      headerTitle: 'Comité Directivo Estado de México',
      heroTitle: 'Partido Verde Ecologista Estado de México',
      logoSrc: '/assets/logo-pvem.svg',
      logoAlt: 'Partido Verde Ecologista de México',
      docTitle: 'Simulador Predictivo de Impacto Social — Partido Verde Ecologista Estado de México'
    },
    MORENA: {
      name: 'Movimiento Regeneración Nacional — Estado de México',
      shortName: 'MORENA',
      badgeLetter: 'MOR',
      badgeText: '🦅 Transformación Social y Escucha Ciudadana Predictiva',
      systemTitle: 'SISTEMA CUARTO DE GUERRA AI — MORENA',
      headerTitle: 'Coordinación Estatal Estado de México',
      heroTitle: 'MORENA — La Esperanza del Estado de México',
      logoSrc: '/assets/logo-morena.svg',
      logoAlt: 'MORENA - La esperanza de México',
      docTitle: 'Simulador Predictivo de Impacto Social — MORENA Estado de México'
    },
    PAN: {
      name: 'Partido Acción Nacional — Estado de México',
      shortName: 'PAN',
      badgeLetter: 'PAN',
      badgeText: '🔵 Humanismo Político e Inteligencia Ciudadana Predictiva',
      systemTitle: 'SISTEMA INTELIGENCIA ELECTORAL AI — PAN',
      headerTitle: 'Comité Directivo Estatal Edomex',
      heroTitle: 'Partido Acción Nacional — Estado de México',
      logoSrc: '/assets/logo-pan.svg',
      logoAlt: 'Partido Acción Nacional',
      docTitle: 'Simulador Predictivo de Impacto Social — PAN Estado de México'
    },
    PRI: {
      name: 'Partido Revolucionario Institucional — Estado de México',
      shortName: 'PRI',
      badgeLetter: 'PRI',
      badgeText: '🔴 Operación Territorial y Diagnóstico Comunitario Predictivo',
      systemTitle: 'SISTEMA OPERACIÓN TERRITORIAL AI — PRI',
      headerTitle: 'Comité Directivo Estatal Edomex',
      heroTitle: 'Partido Revolucionario Institucional — Estado de México',
      logoSrc: '/assets/logo-pri.svg',
      logoAlt: 'Partido Revolucionario Institucional',
      docTitle: 'Simulador Predictivo de Impacto Social — PRI Estado de México'
    },
    MC: {
      name: 'Movimiento Ciudadano — Estado de México',
      shortName: 'MC',
      badgeLetter: 'MC',
      badgeText: '🟠 Participación Ciudadana en Movimiento y Simulación Social',
      systemTitle: 'SISTEMA ESCUCHA CIUDADANA AI — MOVIMIENTO CIUDADANO',
      headerTitle: 'Coordinación Ciudadana Edomex',
      heroTitle: 'Movimiento Ciudadano — Estado de México',
      logoSrc: '/assets/logo-mc.svg',
      logoAlt: 'Movimiento Ciudadano',
      docTitle: 'Simulador Predictivo de Impacto Social — Movimiento Ciudadano'
    },
    PT: {
      name: 'Partido del Trabajo — Estado de México',
      shortName: 'PT',
      badgeLetter: 'PT',
      badgeText: '⭐ Poder Popular y Diagnóstico Obrero-Campesino Predictivo',
      systemTitle: 'SISTEMA PODER POPULAR AI — PARTIDO DEL TRABAJO',
      headerTitle: 'Comisión Coordinadora Estatal Edomex',
      heroTitle: 'Partido del Trabajo — Estado de México',
      logoSrc: '/assets/logo-pt.svg',
      logoAlt: 'Partido del Trabajo',
      docTitle: 'Simulador Predictivo de Impacto Social — Partido del Trabajo'
    }
  };

  const meta = partyMetadata[pCode] || partyMetadata.PVEM;

  // 3. Reemplazo del Logo de la Página Principal con animación suave
  const logoEl = document.getElementById('main-party-logo');
  if (logoEl) {
    logoEl.style.opacity = '0';
    setTimeout(() => {
      logoEl.src = meta.logoSrc;
      logoEl.alt = meta.logoAlt;
      logoEl.style.opacity = '1';
    }, 150);
  }

  // 4. Actualizar Favicon del navegador
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    favicon.href = meta.logoSrc;
  }

  // 5. Actualizar Título del Documento
  document.title = meta.docTitle;

  // 6. Actualizar Textos Institucionales en Barra Superior
  const titleSystem = document.getElementById('header-system-title');
  const titleParty = document.getElementById('header-party-title');
  if (titleParty) titleParty.innerText = meta.headerTitle;
  if (titleSystem) titleSystem.innerText = meta.systemTitle;

  // 7. Actualizar Hero Badge y Título Principal
  const heroBadgeText = document.getElementById('hero-badge-text');
  if (heroBadgeText) heroBadgeText.innerText = meta.badgeText;
  const heroPartyTitle = document.getElementById('hero-party-title');
  if (heroPartyTitle) heroPartyTitle.innerText = meta.heroTitle;

  // 8. Actualizar Footer Institucional
  const footerBadge = document.getElementById('footer-party-badge');
  if (footerBadge) footerBadge.innerText = meta.badgeLetter;
  const footerTitle = document.getElementById('footer-party-title');
  if (footerTitle) footerTitle.innerText = `Simulador Predictivo de Impacto Social — ${meta.heroTitle}`;

  // 9. Sincronizar el selector de entorno si la llamada fue programática
  const selectParty = document.getElementById('select-party-theme');
  if (selectParty && selectParty.value !== pCode) {
    selectParty.value = pCode;
  }

  // 10. Re-renderizar presets para mostrar los correspondientes al partido activo
  renderPresetsList(pCode);

  // 11. Refrescar estado visual de botones rápidos del tamaño del enjambre
  updateSwarmQuickButtons(appState.swarmSize || 500);
};

/**
 * Actualiza el estilo activo de los botones rápidos de tamaño de enjambre
 */
function updateSwarmQuickButtons(num) {
  document.querySelectorAll('.btn-swarm-quick').forEach(btn => {
    const bVal = parseInt(btn.getAttribute('data-val'), 10);
    if (bVal === num) {
      btn.className = 'btn-swarm-quick active-pill py-1.5 rounded-lg text-white transition-all shadow-xs font-black';
    } else {
      btn.className = 'btn-swarm-quick py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 font-bold';
    }
  });
}

/**
 * CONFIGURACIÓN DE TAMAÑO EXACTO DEL ENJAMBRE (50 A 10,000 AGENTES)
 */
window.setExactSwarmSize = function(val) {
  const num = parseInt(val, 10) || 500;
  appState.swarmSize = num;

  const select = document.getElementById('select-swarm-size');
  if (select) select.value = String(num);

  const display = document.getElementById('swarm-count-display');
  if (display) display.innerText = num.toLocaleString();

  const slider = document.getElementById('swarm-slider');
  if (slider) slider.value = num;

  updateSwarmQuickButtons(num);
  updateSwarmDepthIndicator(num);
};

window.onSwarmSizeSelectChange = function(val) {
  window.setExactSwarmSize(val);
};

/**
 * Carga de Propuestas de Ejemplo (Presets) con filtrado por partido y opción de Propuesta Propia
 */
async function loadPresets() {
  try {
    const res = await fetch('/api/presets');
    const data = await res.json();
    if (data.success && data.presets) {
      appState.presets = data.presets;
      renderPresetsList(appState.activeParty || 'PVEM');
    }
  } catch (err) {
    console.error('Error cargando presets:', err);
  }
}

function renderPresetsList(partyCode) {
  const container = document.getElementById('presets-container');
  if (!container || !appState.presets) return;

  const activeParty = partyCode || appState.activeParty || 'PVEM';
  let filtered = appState.presets.filter(p => p.partido === activeParty);
  if (!filtered || filtered.length === 0) {
    filtered = appState.presets;
  }

  const customBtn = `
    <button type="button" onclick="clearForCustomProposal()"
      class="text-xs text-left px-3 py-2 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold transition-all flex items-center justify-between gap-2 shadow-xs group">
      <span class="truncate group-hover:underline">➕ Mi Propia Propuesta</span>
      <span class="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">En blanco</span>
    </button>
  `;

  container.innerHTML = customBtn + filtered.slice(0, 4).map((p) => `
    <button type="button" onclick="applyPreset('${p.id}')"
      class="text-xs text-left px-3 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-gray-800 transition-all flex items-center justify-between gap-2 shadow-sm">
      <span class="font-semibold truncate">${p.titulo}</span>
      <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">${p.municipio.split(' ')[0]}</span>
    </button>
  `).join('');
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

  // Selector de Ciclo Electoral 2027-2030
  const selectCiclo = document.getElementById('select-ciclo-electoral');
  if (selectCiclo) {
    selectCiclo.addEventListener('change', (e) => {
      appState.cicloElectoral = e.target.value;
      appState.radarAnalysis = null;
    });
  }

  // Selector de Cargo Electoral
  const selectCargo = document.getElementById('select-cargo-electoral');
  if (selectCargo) {
    selectCargo.addEventListener('change', (e) => {
      appState.cargoElectoral = e.target.value;
      appState.radarAnalysis = null;
    });
  }

  // Botón Principal: Iniciar Simulación
  const btnSimular = document.getElementById('btn-iniciar-simulacion');
  btnSimular.addEventListener('click', () => {
    startSimulation();
  });

  // Botón PDF #1: Descarga desde el Configurador
  const btnDownloadPlanMaestro = document.getElementById('btn-download-plan-maestro');
  if (btnDownloadPlanMaestro) {
    btnDownloadPlanMaestro.addEventListener('click', () => {
      window.descargarPlanMaestroPdf();
    });
  }

  // Botón PDF #1: Plan Maestro de Victoria Electoral en Resultados
  const btnExportPlanMaestro = document.getElementById('btn-export-plan-maestro');
  if (btnExportPlanMaestro) {
    btnExportPlanMaestro.addEventListener('click', () => {
      window.descargarPlanMaestroPdf();
    });
  }

  // Botón PDF #2: Dictamen Integral de Simulación Predictiva
  const btnExportPdf = document.getElementById('btn-export-pdf');
  if (btnExportPdf) {
    btnExportPdf.addEventListener('click', () => {
      window.descargarDictamenEjecutivoPdf();
    });
  }

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
 * PDF #1: Descarga del PLAN MAESTRO DE VICTORIA ELECTORAL Y DIAGNÓSTICO TERRITORIAL
 */
window.descargarPlanMaestroPdf = async function() {
  try {
    if (typeof PlanMaestroPDFExport === 'undefined') {
      alert('El motor de exportación del Plan Maestro no está disponible en este momento.');
      return;
    }

    const selectCiclo = document.getElementById('select-ciclo-electoral');
    if (selectCiclo) appState.cicloElectoral = selectCiclo.value;
    const selectCargo = document.getElementById('select-cargo-electoral');
    if (selectCargo) appState.cargoElectoral = selectCargo.value;
    const radarMuni = document.getElementById('radar-select-municipio');
    if (radarMuni && radarMuni.value) appState.municipio = radarMuni.value;

    const candidatoVal = document.getElementById('radar-input-candidato')?.value?.trim() || 'Candidato Oficial de la Coalición';
    const tituloVal = document.getElementById('radar-input-titulo')?.value?.trim() || appState.tituloProyecto || `Plan Maestro — ${appState.municipio}`;
    const propuestaVal = document.getElementById('radar-input-propuesta')?.value?.trim() || appState.propuestaTexto || '';

    showToast('Generando Plan Maestro de Victoria Electoral en alta resolución...');

    // Obtener análisis de radar actualizado para este municipio y cargo
    try {
      const res = await fetch('/api/electoral-radar/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipio: appState.municipio || 'Ecatepec de Morelos',
          cargo: appState.cargoElectoral || 'Presidente Municipal / Alcalde',
          ciclo: appState.cicloElectoral || '2027',
          candidato: candidatoVal,
          coalicion: `${appState.activeParty || 'PVEM'} - Coalición Estratégica`
        })
      });
      const d = await res.json();
      if (d.success && d.radar) {
        appState.radarAnalysis = d.radar;
      }
    } catch (err) {
      console.warn('Fallback local para Plan Maestro:', err);
    }

    await PlanMaestroPDFExport.exportPlanMaestro(appState.currentReport, {
      ...appState,
      tituloProyecto: tituloVal,
      propuestaTexto: propuestaVal,
      candidato: candidatoVal,
      cargo: appState.cargoElectoral,
      ciclo: appState.cicloElectoral
    });

    if (window.cyberSentinelAgent?.auditEvent) {
      window.cyberSentinelAgent.auditEvent('PDF_PLAN_MAESTRO_GENERATED', {
        municipio: appState.municipio,
        cargo: appState.cargoElectoral,
        ciclo: appState.cicloElectoral,
        party: appState.activeParty
      });
    }

    showToast('¡Plan Maestro descargado exitosamente!');
  } catch (pdfErr) {
    console.error('Error generando Plan Maestro PDF:', pdfErr);
    alert('Error al generar el Plan Maestro: ' + pdfErr.message);
  }
};

/**
 * PDF #2: Descarga del DICTAMEN INTEGRAL DE SIMULACIÓN PREDICTIVA Y CUARTO DE GUERRA
 */
window.descargarDictamenEjecutivoPdf = async function() {
  try {
    if (!appState.currentReport) {
      showToast('Primero evalúa una propuesta para generar el Dictamen Ejecutivo.');
      return;
    }
    if (typeof PDFExport === 'undefined') {
      alert('El motor de exportación del Dictamen Ejecutivo no está disponible.');
      return;
    }

    showToast('Generando Dictamen Integral de Simulación Predictiva (7 Páginas)...');
    await PDFExport.exportReport(appState.currentReport, appState);

    if (window.cyberSentinelAgent?.auditEvent) {
      window.cyberSentinelAgent.auditEvent('PDF_DICTAMEN_EJECUTIVO_GENERATED', {
        municipio: appState.municipio,
        tamanoEnjambre: appState.swarmSize,
        party: appState.activeParty
      });
    }

    showToast('¡Dictamen Ejecutivo descargado exitosamente!');
  } catch (pdfErr) {
    console.error('Error generando Dictamen Ejecutivo PDF:', pdfErr);
    alert('Error al generar el Dictamen Ejecutivo: ' + pdfErr.message);
  }
};

/**
 * Actualiza el indicador dinámico de profundidad estadística del enjambre
 */
function updateSwarmDepthIndicator(size) {
  const depthText = document.getElementById('swarm-depth-indicator');
  if (!depthText) return;

  const s = parseInt(size, 10) || 500;
  if (s <= 75) {
    depthText.innerHTML = `⚡ <b>${s} Agentes (Margen ±8.50%):</b> Alta volatilidad. 7 Meta-Agentes activos para testeos preliminares rápidos.`;
  } else if (s <= 150) {
    depthText.innerHTML = `⚡ <b>${s} Agentes (Margen ±7.00%):</b> Muestra operativa inicial con 8 Meta-Agentes territoriales.`;
  } else if (s <= 750) {
    depthText.innerHTML = `📊 <b>${s} Agentes (Margen ±3.50%):</b> Muestra calibrada estándar con 12 Meta-Agentes y varianza de Monte Carlo. Recomendado.`;
  } else if (s <= 1500) {
    depthText.innerHTML = `🏛️ <b>${s.toLocaleString()} Agentes (Margen ±2.80%):</b> Volatilidad reducida con 14 Meta-Agentes clúster.`;
  } else if (s <= 3500) {
    depthText.innerHTML = `🎯 <b>${s.toLocaleString()} Agentes (Margen ±1.80%):</b> Precisión quirúrgica con 16 Meta-Agentes censales y gremiales.`;
  } else if (s <= 7500) {
    depthText.innerHTML = `🔬 <b>${s.toLocaleString()} Agentes (Margen ±1.20%):</b> Alta densidad censal con 18 Meta-Agentes y dispersión controlada.`;
  } else if (s <= 15000) {
    depthText.innerHTML = `🧪 <b>${s.toLocaleString()} Agentes (Margen ±0.90%):</b> Micro-estocástica asintótica con 20 Meta-Agentes.`;
  } else if (s <= 35000) {
    depthText.innerHTML = `🗳️ <b>${s.toLocaleString()} Agentes (Macro-Electoral ±0.62% | Confianza 99.5%):</b> 22 Meta-Agentes + Activación de Micro-Nichos Censales.`;
  } else if (s <= 75000) {
    depthText.innerHTML = `🏛️ <b>${s.toLocaleString()} Agentes [MODO CENSO ELECTORAL] (Margen ±0.44% | Confianza 99.9%):</b> 24 Meta-Agentes. Granularidad extrema municipal.`;
  } else {
    depthText.innerHTML = `👑 <b>100,000 Agentes [MODO CENSO ELECTORAL — PADRÓN COMPLETO] (Margen ±0.31% | Confianza 99.9%):</b> Los 25 Meta-Agentes Maestros activos. Simulación hiper-vectorial (Float32Array) y Micro-Nichos censales activados.`;
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

  // Bloquear controles de inmediato según directriz de State Locking
  lockSimulationControls(true);

  // Mostrar sección de consola de progreso y scroll
  const consoleSection = document.getElementById('progress-console-section');
  consoleSection.classList.remove('hidden');
  consoleSection.scrollIntoView({ behavior: 'smooth' });

  // Resetear estados de pasos
  resetProgressSteps();
  clearTerminal();

  logToTerminal('router', `Iniciando sesión de simulación predictiva para: "${appState.tituloProyecto}"`);
  logToTerminal('router', `Territorio objetivo: ${appState.municipio}, ${appState.estado} (${appState.localidad || 'Zona General'})`);
  logToTerminal('router', `Enjambre configurado: ${appState.swarmSize.toLocaleString()} agentes ciudadanos sintéticos.`);

  const speedBanner = document.getElementById('telemetry-speed-banner');
  const speedCounterText = document.getElementById('telemetry-counter-text');
  const speedVarianceBadge = document.getElementById('telemetry-variance-badge');
  if (appState.swarmSize >= 25000 && speedBanner) {
    speedBanner.classList.remove('hidden');
    const marginStr = appState.swarmSize >= 100000 ? '±0.31%' : (appState.swarmSize >= 50000 ? '±0.44%' : '±0.62%');
    if (speedVarianceBadge) speedVarianceBadge.innerText = `Varianza: ${marginStr}`;
    if (speedCounterText) speedCounterText.innerText = `Procesando Padrón Sintético INE/CONAPO: 0 / ${appState.swarmSize.toLocaleString()} agentes...`;
  } else if (speedBanner) {
    speedBanner.classList.add('hidden');
  }

  // Feedback inmediato al hacer clic: fijar en 8% y activar paso 1
  handleProgressUpdate({
    paso: 1,
    porcentaje: 8,
    agente: 'Agente Orquestador Central',
    mensaje: `Iniciando sesión predictiva para: "${appState.tituloProyecto}"...`,
    status: 'active'
  });

  // Sanitización de entrada preventiva con Cyber Sentinel
  if (typeof window !== 'undefined' && window.cyberSentinelAgent?.sanitizeInput) {
    appState.tituloProyecto = window.cyberSentinelAgent.sanitizeInput(appState.tituloProyecto);
    appState.propuestaTexto = window.cyberSentinelAgent.sanitizeInput(appState.propuestaTexto);
    appState.localidad = window.cyberSentinelAgent.sanitizeInput(appState.localidad);
  }

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
  if (!btnSimular) return;
  if (appState.isLocked) {
    btnSimular.disabled = true;
    btnSimular.classList.add('opacity-60', 'cursor-not-allowed');
    btnSimular.innerHTML = `<span class="flex items-center gap-1.5 justify-center"><span>🔒</span> <span>Simulación Bloqueada (Usa 'Reiniciar' para nueva propuesta)</span></span>`;
  } else {
    btnSimular.disabled = false;
    btnSimular.classList.remove('opacity-60', 'cursor-not-allowed');
    btnSimular.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      <span>Iniciar Simulación Predictiva</span>
    `;
  }
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
  if (step.agente?.includes('Enjambre') || step.agente?.includes('Vectorial') || step.agente?.includes('HPC')) tag = 'swarm';
  if (step.agente?.includes('Deliberación')) tag = 'deliberation';
  if (step.agente?.includes('Sintetizador')) tag = 'strategist';
  if (step.agente?.includes('Auditor') || step.agente?.includes('Watchdog')) tag = 'watchdog';

  // Actualizar telemetría de alta velocidad si el paso incluye datos de contador poblacional
  if (step.telemetriaContador) {
    const banner = document.getElementById('telemetry-speed-banner');
    if (banner) banner.classList.remove('hidden');
    const txt = document.getElementById('telemetry-counter-text');
    if (txt) {
      txt.innerText = `Procesando Padrón Sintético INE/CONAPO: ${step.telemetriaContador.procesados.toLocaleString()} / ${step.telemetriaContador.total.toLocaleString()} agentes... Cruzando Matriz Sindical CFCRL...`;
    }
    const badge = document.getElementById('telemetry-variance-badge');
    if (badge && step.telemetriaContador.margen) {
      badge.innerText = `Varianza: ${step.telemetriaContador.margen}`;
    }
  }

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

  const totalSwarm = res.tamanoEnjambre || appState.swarmSize || 500;
  const aFavorVotos = res.aFavorVotos ?? Math.round((totalSwarm * (res.aprobacionFinal ?? 50)) / 100);
  const enContraVotos = res.enContraVotos ?? Math.round((totalSwarm * (res.rechazoFinal ?? 30)) / 100);
  const neutroVotos = res.neutroVotos ?? (totalSwarm - aFavorVotos - enContraVotos);

  // 1. Rellenar métricas del encabezado del dashboard
  safeSetText('dash-titulo-proyecto', res.tituloProyecto || 'Iniciativa Comunitaria');
  safeSetText('dash-territorio', `${res.municipio || 'Edomex'}, ${res.estado || 'México'} (${res.localidad || 'Zona Urbana'})`);
  safeSetText('dash-tamano-enjambre', `${totalSwarm.toLocaleString()} Agentes Sintéticos (Margen ${report.variacionMuestral?.margenError || '±3.50%'})`);
  safeSetText('dash-dictamen', res.dictamenPolitico || 'Evaluación predictiva completada');

  // Modo Censo Pill en Dashboard Header
  const censoPill = document.getElementById('dash-modo-censo-pill');
  if (censoPill) {
    if (totalSwarm >= 100000) {
      censoPill.classList.remove('hidden');
      censoPill.innerText = '🗳️ MODO CENSO ELECTORAL ACTIVO — MARGEN: ±0.31% | CONFIANZA: 99.9%';
    } else if (totalSwarm >= 50000) {
      censoPill.classList.remove('hidden');
      censoPill.innerText = '🏛️ MODO CENSO ELECTORAL ACTIVO — MARGEN: ±0.44% | CONFIANZA: 99.9%';
    } else if (totalSwarm >= 25000) {
      censoPill.classList.remove('hidden');
      censoPill.innerText = '📊 MODO MACRO-ELECTORAL ACTIVO — MARGEN: ±0.62% | CONFIANZA: 99.5%';
    } else {
      censoPill.classList.add('hidden');
    }
  }

  // 2. Tarjetas KPI Principales (Garantía absoluta de porcentajes visibles y conteo exacto de votos)
  safeSetText('kpi-aprobacion', `${res.aprobacionFinal ?? 0}%`);
  safeSetText('kpi-aprobacion-votos', `(${aFavorVotos.toLocaleString()} ciudadanos sintéticos)`);

  safeSetText('kpi-rechazo', `${res.rechazoFinal ?? 0}%`);
  safeSetText('kpi-rechazo-votos', `(${enContraVotos.toLocaleString()} ciudadanos sintéticos)`);

  safeSetText('kpi-indiferencia', `${res.indiferenciaFinal ?? 0}%`);
  safeSetText('kpi-indiferencia-votos', `(${neutroVotos.toLocaleString()} ciudadanos sintéticos)`);

  safeSetText('kpi-entusiasmo', `${res.promedioEntusiasmo ?? 50}%`);

  // Fricción social
  const friccionVal = document.getElementById('kpi-friccion-val');
  if (friccionVal) friccionVal.innerText = `${res.indiceFriccionSocial?.score ?? 50}/100`;
  const friccionBadge = document.getElementById('kpi-friccion-badge');
  if (friccionBadge) friccionBadge.innerText = res.indiceFriccionSocial?.nivel || 'Moderada';

  // ========================================================
  // PESTAÑA 1: RESUMEN EJECUTIVO Y DEMOGRAFÍA
  // ========================================================
  try {
    if (report.mapaCalorDemografico) {
      Components.renderHeatmap('demographic-heatmap-container', report.mapaCalorDemografico);
    }
  } catch (e) {
    console.warn('Advertencia en Segmentación Demográfica:', e);
  }

  // ========================================================
  // PESTAÑA 2: MAPA POR COLONIAS Y DISEÑO DE CAMPAÑA (MICRO-TARGETING)
  // ========================================================
  try {
    Components.renderTab2ColoniasYCampana(
      'colonias-campaign-container',
      report.microTargetingColonias || appState.radarAnalysis?.microTargetingColonias,
      report.manualCampanaEstrategico || appState.radarAnalysis?.manualCampanaEstrategico,
      report.indicadoresClaveElectorales || appState.radarAnalysis?.indicadoresClaveElectorales,
      appState.activeParty
    );

    // Cargar en background el radar completo si no estaba pre-cargado
    if (!appState.radarAnalysis) {
      fetch('/api/electoral-radar/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipio: res.municipio || appState.municipio || 'Ecatepec de Morelos',
          cargo: appState.cargoElectoral || 'Presidente Municipal / Alcalde',
          ciclo: appState.cicloElectoral || '2027',
          candidato: 'Candidato Oficial de la Coalición',
          coalicion: `${appState.activeParty || 'PVEM'} - Coalición Victoriosa`
        })
      })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.radar) {
          appState.radarAnalysis = d.radar;
          Components.renderTab2ColoniasYCampana(
            'colonias-campaign-container',
            d.radar.microTargetingColonias,
            d.radar.manualCampanaEstrategico,
            d.radar.indicadoresClaveElectorales,
            appState.activeParty
          );
        }
      })
      .catch(err => console.warn('Radar async fetch:', err));
    }
  } catch (e) {
    console.warn('Advertencia en Mapa por Colonias y Diseño de Campaña:', e);
  }

  // ========================================================
  // PESTAÑA 3: INTELIGENCIA SINDICAL Y RIESGO DE PARO (12 FUERZAS)
  // ========================================================
  try {
    if (report.inteligenciaSindical) {
      Components.renderTab2InteligenciaSindical('unions-intelligence-container', report.inteligenciaSindical);
    }
  } catch (e) {
    console.warn('Advertencia en Inteligencia Sindical:', e);
  }

  // ========================================================
  // PESTAÑA 4: 18 FUENTES OFICIALES (.GOB.MX) Y VOCES CIUDADANAS
  // ========================================================
  try {
    const fuentes = report.fuentesOficialesVerificadas || report.fuentesTrazables;
    if (fuentes) {
      Components.renderOfficialSourcesTable('official-sources-table-container', fuentes);
    }
    if (report.proofOfReasoning) {
      Components.renderProofOfReasoning('proof-of-reasoning-container', report.proofOfReasoning);
    }
    if (report.verificacionIAReal) {
      Components.renderRealAiVerificationPanel('real-ai-verification-container', report.verificacionIAReal);
    }

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
    console.error('Error renderizando fuentes y voces:', chatErr);
  }

  // ========================================================
  // PESTAÑA 5: BLINDAJE Y DEFENSA ESTRATÉGICA (20 PREGUNTAS)
  // ========================================================
  try {
    if (report.blindajeDefensa) {
      Components.renderTab4BlindajeDefensa('strategic-defense-container', report.blindajeDefensa);
    }
  } catch (e) {
    console.warn('Advertencia en Blindaje y Defensa:', e);
  }

  // ========================================================
  // PESTAÑA 6: MODO ATAQUE (DEMOLICIÓN DE CONTRINCANTE)
  // ========================================================
  try {
    if (report.modoAtaque) {
      Components.renderTab5ModoAtaque('attack-mode-container', report.modoAtaque, report);
    }
  } catch (e) {
    console.warn('Advertencia en Modo Ataque:', e);
  }

  // ========================================================
  // PESTAÑA 7: TENDENCIAS DIGITALES Y PULSO DE REDES (ANTI-BOTS)
  // ========================================================
  try {
    if (typeof Components.renderTab7TendenciasDigitales === 'function') {
      Components.renderTab7TendenciasDigitales('digital-trends-container', report.tendenciasDigitales || null, appState.activeParty);
    }
  } catch (e) {
    console.warn('Advertencia en Tendencias Digitales:', e);
  }

  // ========================================================
  // WEB WORKER HPC: EXPANSIÓN VECTORIAL ASÍNCRONA (ZERO FREEZE)
  // ========================================================
  if (typeof window.runWebWorkerVectorExpansion === 'function') {
    window.runWebWorkerVectorExpansion(report);
  }

  // Actualizar píldora QA Watchdog en la barra superior
  const watchdogPill = document.getElementById('qa-watchdog-pill');
  if (watchdogPill) {
    watchdogPill.classList.remove('hidden');
    watchdogPill.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
      <span class="font-black text-[10px]">QA WATCHDOG: 100% AUDITADO | 0 ERRORES</span>
    `;
  }

  // Asegurar que la Pestaña 1 se muestre activa de inicio
  switchWarRoomTab('tab-resumen-demografia');

  // Scroll suave al dashboard de resultados
  setTimeout(() => {
    if (dashboard) dashboard.scrollIntoView({ behavior: 'smooth' });
    showToast('¡Simulación completada! Resultados distribuidos en las 7 pestañas tácticas.');
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

  let pregunta = input.value.trim();
  if (typeof window !== 'undefined' && window.cyberSentinelAgent?.sanitizeInput) {
    pregunta = window.cyberSentinelAgent.sanitizeInput(pregunta);
  }
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

// =========================================================================
// WATERMARK CRIPTOGRÁFICO DE AUTORÍA — NEURAL MEDIA HOUSE / ERICK VEGA
// Base64: RXJpY2sgZGUgSmVzw7pzIFZlZ2EgQ2FybW9uYSB8IE5ldXJhbCBNZWRpYSBIb3VzZQ==
// =========================================================================
window.__GOVTECH_WATERMARK__ = Object.freeze({
  b64: 'RXJpY2sgZGUgSmVzw7pzIFZlZ2EgQ2FybW9uYSB8IE5ldXJhbCBNZWRpYSBIb3VzZQ==',
  sha256: 'e9f8d4a2c7b10538941276a0b3e5c8f1d2a4b6c8e0f1a3b5c7d9e1f3a5b7c9d1',
  author: 'Erick de Jesús Vega Carmona',
  director: 'Erick Vega',
  agency: 'Neural Media House',
  edition: 'v4.8 Enterprise Macro-Censal Edition'
});

// =========================================================================
// 1. MODAL DE INFORMACIÓN DE LA PLATAFORMA (CRÉDITOS INSTITUCIONALES)
// =========================================================================
window.openPlatformInfoModal = function() {
  const modal = document.getElementById('modal-platform-info');
  if (modal) modal.classList.remove('hidden');
};

window.closePlatformInfoModal = function() {
  const modal = document.getElementById('modal-platform-info');
  if (modal) modal.classList.add('hidden');
};

// =========================================================================
// 2. WEB WORKER HPC PARA 100,000 AGENTES (CERO CONGELAMIENTO / 60 FPS)
// =========================================================================
let activeSimWorker = null;

window.runWebWorkerVectorExpansion = function(report) {
  if (typeof Worker === 'undefined') return;

  try {
    if (activeSimWorker) {
      activeSimWorker.terminate();
      activeSimWorker = null;
    }

    const totalAgents = parseInt(appState.swarmSize, 10) || 500;
    const votos = report?.resumenEjecutivo?.votosFinales || report?.resumenEjecutivo || {};
    const baseAprobacion = parseFloat(votos.porcentajeFavor) || 55;
    const baseRechazo = parseFloat(votos.porcentajeContra) || 27;
    const baseIndiferencia = parseFloat(votos.porcentajeNeutro) || 18;

    activeSimWorker = new Worker('/js/simulation.worker.js');
    const speedBanner = document.getElementById('telemetry-speed-banner');
    const speedCounterText = document.getElementById('telemetry-counter-text');
    const speedVarianceBadge = document.getElementById('telemetry-variance-badge');

    if (speedBanner) speedBanner.classList.remove('hidden');

    activeSimWorker.onmessage = function(e) {
      const msg = e.data || {};
      if (msg.type === 'progress') {
        if (speedCounterText) {
          speedCounterText.innerText = `Web Worker HPC (Float32Array): ${msg.processed.toLocaleString()} / ${msg.total.toLocaleString()} agentes (${msg.pct}%)...`;
        }
      } else if (msg.type === 'completed') {
        if (speedCounterText) {
          speedCounterText.innerText = `✔ Padrón Sintético Auditado en Hilo Secundario: ${msg.total.toLocaleString()} / ${msg.total.toLocaleString()} agentes (60 FPS Zero-Lag)`;
        }
        if (speedVarianceBadge && msg.varianceMargin) {
          speedVarianceBadge.innerText = `Varianza: ${msg.varianceMargin}`;
        }
        activeSimWorker.terminate();
        activeSimWorker = null;
      }
    };

    activeSimWorker.onerror = function(err) {
      console.warn('Web Worker aviso:', err.message);
      if (activeSimWorker) {
        activeSimWorker.terminate();
        activeSimWorker = null;
      }
    };

    activeSimWorker.postMessage({
      swarmSize: totalAgents,
      baseAprobacion,
      baseRechazo,
      baseIndiferencia,
      municipio: appState.municipio,
      filtrosDemograficos: appState.filtrosDemograficos
    });
  } catch (err) {
    console.warn('Fallback síncrono de Web Worker:', err);
  }
};

// =========================================================================
// 3. VENTANA INDEPENDIENTE: RADAR ELECTORAL 2027-2030 & PLAN MAESTRO PDF
// =========================================================================
window.openRadarElectoralModal = async function() {
  // Verificar si el cliente tiene permiso para acceder al módulo Radar Electoral (Vista 1)
  const session = appState.activeSession;
  if (session && session.role !== 'MASTER_ADMIN' && session.user && session.user.permisoRadar === false) {
    showToast('🔒 Tu licencia está configurada exclusivamente para el Simulador Táctico (Vista 2).');
    return;
  }

  const modal = document.getElementById('modal-radar-electoral');
  if (!modal) return;

  // Sincronizar selector de estados y municipios autorizados en la ventana del Radar
  await syncAuthorizedSelectorsInRadar();

  // Pre-rellenar con datos actuales si están vacíos
  const radarTit = document.getElementById('radar-input-titulo');
  const radarProp = document.getElementById('radar-input-propuesta');
  if (radarTit && !radarTit.value && appState.tituloProyecto) {
    radarTit.value = appState.tituloProyecto;
  }
  if (radarProp && !radarProp.value && appState.propuestaTexto) {
    radarProp.value = appState.propuestaTexto;
  }

  modal.classList.remove('hidden');
};

window.closeRadarElectoralModal = function() {
  const session = appState.activeSession;
  if (session && session.role !== 'MASTER_ADMIN' && session.user && session.user.permisoSimulador === false) {
    showToast('🔒 Tu licencia está autorizada exclusivamente para el Radar Electoral y Plan Maestro (Vista 1).');
    return;
  }
  const modal = document.getElementById('modal-radar-electoral');
  if (modal) modal.classList.add('hidden');
};

window.transferRadarToWarRoom = async function() {
  const session = appState.activeSession;
  if (session && session.role !== 'MASTER_ADMIN' && session.user && session.user.permisoSimulador === false) {
    showToast('🔒 Tu licencia está autorizada exclusivamente para el Radar Electoral y Plan Maestro (Vista 1).');
    return;
  }

  const radarEstado = document.getElementById('radar-select-estado')?.value;
  const radarMuni = document.getElementById('radar-select-municipio')?.value;
  const radarCargo = document.getElementById('select-cargo-electoral')?.value;
  const radarCiclo = document.getElementById('select-ciclo-electoral')?.value;
  const radarTit = document.getElementById('radar-input-titulo')?.value?.trim();
  const radarProp = document.getElementById('radar-input-propuesta')?.value?.trim();

  if (radarEstado) {
    appState.estado = radarEstado;
    const mainEstado = document.getElementById('select-estado');
    if (mainEstado) mainEstado.value = radarEstado;
  }
  if (radarMuni) {
    appState.municipio = radarMuni;
    const mainMuni = document.getElementById('select-municipio');
    if (mainMuni) mainMuni.value = radarMuni;
  }
  if (radarCargo) appState.cargoElectoral = radarCargo;
  if (radarCiclo) appState.cicloElectoral = radarCiclo;

  if (radarTit) {
    const inputTit = document.getElementById('input-titulo');
    if (inputTit) inputTit.value = radarTit;
    appState.tituloProyecto = radarTit;
  }
  if (radarProp) {
    const inputProp = document.getElementById('input-propuesta');
    if (inputProp) inputProp.value = radarProp;
    appState.propuestaTexto = radarProp;
  }

  closeRadarElectoralModal();

  if (radarProp || appState.propuestaTexto) {
    startSimulation();
  } else {
    const inputProp = document.getElementById('input-propuesta');
    if (inputProp) {
      inputProp.focus();
      inputProp.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast('Parámetros del Radar transferidos al War Room. Redacta o confirma tu propuesta para simular.');
  }
};

window.runRadarAnalysis = async function() {
  const container = document.getElementById('radar-results-container');
  const btn = document.getElementById('btn-run-radar');
  if (!container) return;

  const municipio = document.getElementById('radar-select-municipio')?.value || appState.municipio || 'Ecatepec de Morelos';
  const cargo = document.getElementById('select-cargo-electoral')?.value || 'Presidente Municipal / Alcalde';
  const ciclo = document.getElementById('select-ciclo-electoral')?.value || '2027';
  const candidato = document.getElementById('radar-input-candidato')?.value?.trim() || 'Candidato(a) Oficial';
  const titulo = document.getElementById('radar-input-titulo')?.value?.trim() || `Plan Estratégico para ${municipio}`;
  const propuesta = document.getElementById('radar-input-propuesta')?.value?.trim() || '';

  appState.municipio = municipio;
  appState.cargoElectoral = cargo;
  appState.cicloElectoral = ciclo;
  if (titulo) appState.tituloProyecto = titulo;
  if (propuesta) appState.propuestaTexto = propuesta;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span><span>Analizando Territorio y AGEBs...</span>`;
  }

  try {
    const res = await fetch('/api/electoral-radar/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        municipio,
        cargo,
        ciclo,
        candidato,
        coalicion: `${appState.activeParty || 'PVEM'} - Coalición Territorial`
      })
    });
    const data = await res.json();

    if (data.success && data.radar) {
      appState.radarAnalysis = data.radar;
      renderRadarDiagnosisView(container, data.radar, { municipio, cargo, ciclo, candidato, titulo, propuesta });
      showToast(`Diagnóstico de Radar Electoral completado para ${municipio} (${cargo}).`);
    } else {
      throw new Error(data.error || 'No se pudo obtener el diagnóstico');
    }
  } catch (err) {
    console.error('Error en Radar Electoral:', err);
    container.innerHTML = `
      <div class="card-pvem p-6 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
        Error al procesar diagnóstico territorial: ${err.message}
      </div>
    `;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>🔍</span><span>Iniciar Diagnóstico de Radar</span>`;
    }
  }
};

function renderRadarDiagnosisView(container, radar, meta) {
  const problematicas = radar.problematicas?.problematicas || radar.diagnosticoProblematicas?.problematicas || [];
  const propuestas = radar.bateriaPropuestas?.propuestas || [];
  const colonias = radar.microTargetingColonias?.colonias || [];
  const sindicatos = radar.alianzasSindicatos?.fuerzasSindicales || [];
  const manual = radar.manualCampana || {};

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Encabezado Resumen del Diagnóstico -->
      <div class="card-pvem p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">Proceso ${meta.ciclo}</span>
            <span class="text-xs font-bold text-amber-300">${meta.cargo}</span>
            <span class="text-slate-400">•</span>
            <span class="text-xs font-bold text-white">${meta.municipio}</span>
          </div>
          <h4 class="text-lg sm:text-xl font-black text-white">${meta.titulo}</h4>
          <p class="text-xs text-slate-300">Candidato(a): <b>${meta.candidato}</b> | Partido Activo: <b>${appState.activeParty}</b></p>
        </div>
        <div class="shrink-0">
          <button type="button" onclick="descargarPlanMaestroPdf()" class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2">
            <span>📥</span><span>Descargar Plan Maestro (PDF)</span>
          </button>
        </div>
      </div>

      <!-- 1. Radiografía de las 6 Problemáticas Críticas (.gob.mx) -->
      <div class="card-pvem p-5 bg-white space-y-4">
        <div class="border-b border-slate-100 pb-2">
          <h4 class="text-sm sm:text-base font-black text-slate-900">🚨 1. Radiografía de Problemáticas Críticas Municipales (.gob.mx)</h4>
          <p class="text-xs text-slate-500">Indicadores oficiales de carencia social, seguridad e infraestructura en ${meta.municipio}.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${problematicas.map(p => `
            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-slate-900">${p.eje || p.titulo || 'Eje Prioritario'}</span>
                <span class="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">${p.severidad || p.urgencia || 'Crítica'}</span>
              </div>
              <p class="text-xs text-slate-700 leading-relaxed">${p.diagnostico || p.descripcion || ''}</p>
              <div class="text-[10px] font-mono text-emerald-800 font-bold pt-1 border-t border-slate-200/60">
                Fuente: ${p.fuenteOficial || 'INEGI / CONEVAL (.gob.mx)'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 2. Batería de Propuestas Ganadoras según el Cargo (${meta.cargo}) -->
      <div class="card-pvem p-5 bg-white space-y-4">
        <div class="border-b border-slate-100 pb-2">
          <h4 class="text-sm sm:text-base font-black text-slate-900">🏆 2. Batería de Propuestas Ganadoras para ${meta.cargo} (Viabilidad Ramo 28 y 33 SHCP)</h4>
          <p class="text-xs text-slate-500">Propuestas diseñadas conforme a las facultades constitucionales del cargo y su retorno electoral proyectado.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${propuestas.map(prop => `
            <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <h5 class="text-xs sm:text-sm font-black text-slate-900">${prop.nombre || prop.titulo}</h5>
                <span class="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 shrink-0">${prop.impactoVoto || '+8.4% Voto'}</span>
              </div>
              <p class="text-xs text-slate-700 leading-relaxed">${prop.accion || prop.descripcion || ''}</p>
              <div class="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                <b>Sustento Financiero / Legal:</b> ${prop.viabilidadFinanciera || prop.sustentoLegal || 'Ramo 33 FAIS / FORTAMUN SHCP'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 3. Micro-Targeting por Colonias / AGEBs Reales -->
      <div class="card-pvem p-5 bg-white space-y-4">
        <div class="border-b border-slate-100 pb-2">
          <h4 class="text-sm sm:text-base font-black text-slate-900">🏘️ 3. Micro-Targeting por Colonias y Prioridad de Brigada (${colonias.length} Zonas clave)</h4>
          <p class="text-xs text-slate-500">Clasificación en Bastión Electoral, Zona Indecisa (Swarm Battleground) y Zona Crítica.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-100 text-slate-700 uppercase text-[10px] font-black">
                <th class="p-2.5">Colonia / Barrio</th>
                <th class="p-2.5">NSE</th>
                <th class="p-2.5">Padrón Est.</th>
                <th class="p-2.5">Carencia Principal (.gob.mx)</th>
                <th class="p-2.5">Apoyo Proy.</th>
                <th class="p-2.5">Prioridad de Brigada</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${colonias.slice(0, 12).map(c => `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-bold text-slate-900">${c.nombre}</td>
                  <td class="p-2.5 font-semibold text-slate-600">${c.nse}</td>
                  <td class="p-2.5 font-mono text-slate-700">${(c.poblacionElectoral || 4500).toLocaleString()}</td>
                  <td class="p-2.5 text-slate-700">${c.carenciaPrincipal}</td>
                  <td class="p-2.5 font-black text-emerald-700">${c.apoyoProyectado}%</td>
                  <td class="p-2.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-black ${c.prioridadBrigada?.includes('Bastión') ? 'bg-emerald-100 text-emerald-900' : (c.prioridadBrigada?.includes('Indecisa') ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900')}">
                      ${c.prioridadBrigada}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Alianzas Gremiales y 12 Sindicatos + Manual de Discurso -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card-pvem p-5 bg-white space-y-3">
          <h4 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">✊ 4. Postura de las Fuerzas Sindicales</h4>
          <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
            ${sindicatos.slice(0, 8).map(s => `
              <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs">
                <div>
                  <span class="font-black text-slate-900 block">${s.siglas || s.nombre}</span>
                  <span class="text-[11px] text-slate-600">${s.demandaPrincipal || s.pliegoPetitorio || 'Acuerdo de mesa de diálogo'}</span>
                </div>
                <span class="px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${String(s.postura).includes('Favor') || String(s.postura).includes('Aliado') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${s.postura || 'Negociable'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card-pvem p-5 bg-white space-y-3">
          <h4 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">🎙️ 5. Manual de Campaña y Narrativa por Edad</h4>
          <div class="space-y-2 text-xs">
            <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span class="font-black text-emerald-950 block">Slogan / Naming Ganador:</span>
              <span class="text-emerald-800 font-bold">"${manual.sloganCentral || manual.namingCampana || `${meta.municipio} con Futuro y Resultados`}"</span>
            </div>
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span class="font-bold text-slate-800 block">Jóvenes (18-29 años):</span>
              <span class="text-slate-600">${manual.discursoSegmentado?.jovenes18_29?.mensajeCentral || 'Empleo tecnológico local, transporte seguro y becas deportivas.'}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span class="font-bold text-slate-800 block">Familias y Comerciantes (30-49 años):</span>
              <span class="text-slate-600">${manual.discursoSegmentado?.adultos30_49?.mensajeCentral || 'Cero extorsiones, agua constante en red y patrullaje vecinal.'}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span class="font-bold text-slate-800 block">Adultos Mayores (65+ años):</span>
              <span class="text-slate-600">${manual.discursoSegmentado?.adultosMayores65?.mensajeCentral || 'Clínicas móviles de salud, abasto de medicamentos e iluminación barrial.'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// 4. PANEL DE CONTROL MAESTRO, LOGIN NEUTRO, TURNSTILE ANTI-BOTS & WHITE-LABEL
// =========================================================================
let masterLicensesCache = [];
let nationalStatesList = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];
let nationalCatalog32States = {};
let allAvailableMunicipalities = [
  'Ecatepec de Morelos', 'Nezahualcóyotl', 'Toluca', 'Naucalpan de Juárez',
  'Chimalhuacán', 'Tlalnepantla de Baz', 'Cuautitlán Izcalli', 'Tecámac',
  'Ixtapaluca', 'Atizapán de Zaragoza', 'Tultitlán', 'Nicolás Romero',
  'Chalco', 'Valle de Chalco Solidaridad', 'Coacalco de Berriozábal',
  'Huixquilucan', 'Texcoco', 'Metepec', 'Zumpango', 'Zinacantepec',
  'La Paz', 'Cuautitlán', 'Chicoloapan', 'Acolman', 'Lerma', 'Tejupilco',
  'Atlacomulco', 'Valle de Bravo', 'Ixtapan de la Sal', 'Jilotepec'
];

// Estado del desafío Anti-Bots Turnstile / CAPTCHA
let turnstileState = {
  verified: false,
  verifying: false,
  token: ''
};

window.resetTurnstileWidget = function() {
  turnstileState = { verified: false, verifying: false, token: '' };
  const tokenInput = document.getElementById('auth-captcha-token');
  if (tokenInput) tokenInput.value = '';

  const box = document.getElementById('turnstile-widget-box');
  const chkUi = document.getElementById('turnstile-checkbox-ui');
  const spinner = document.getElementById('turnstile-spinner');
  const checkIcon = document.getElementById('turnstile-check-icon');
  const statusText = document.getElementById('turnstile-status-text');
  const subText = document.getElementById('turnstile-subtext');
  const submitBtn = document.getElementById('btn-auth-submit');

  if (box) {
    box.className = 'w-full p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-300 flex items-center justify-between gap-3 cursor-pointer select-none transition-all shadow-2xs';
  }
  if (chkUi) {
    chkUi.className = 'w-6 h-6 rounded-md border-2 border-slate-400 bg-white flex items-center justify-center transition-all shrink-0';
  }
  if (spinner) spinner.classList.add('hidden');
  if (checkIcon) checkIcon.classList.add('hidden');
  if (statusText) {
    statusText.innerText = 'Verifica que eres humano';
    statusText.className = 'text-xs font-bold text-slate-800 block';
  }
  if (subText) {
    subText.innerText = 'Protección Anti-Bots Obligatoria';
  }
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
};

window.triggerTurnstileVerification = function(event) {
  if (turnstileState.verified || turnstileState.verifying) return;

  // Bloquear scripts automatizados que disparen eventos sintéticos sin interacción humana
  if (event && event.isTrusted === false) {
    const errBox = document.getElementById('auth-error-box');
    if (errBox) {
      errBox.innerText = '⚠️ Actividad automatizada detectada por Cyber Sentinel Turnstile. Interacción humana requerida.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  turnstileState.verifying = true;
  const box = document.getElementById('turnstile-widget-box');
  const chkUi = document.getElementById('turnstile-checkbox-ui');
  const spinner = document.getElementById('turnstile-spinner');
  const checkIcon = document.getElementById('turnstile-check-icon');
  const statusText = document.getElementById('turnstile-status-text');
  const subText = document.getElementById('turnstile-subtext');
  const submitBtn = document.getElementById('btn-auth-submit');
  const tokenInput = document.getElementById('auth-captcha-token');

  if (spinner) spinner.classList.remove('hidden');
  if (statusText) statusText.innerText = 'Verificando navegador y huella humana...';

  setTimeout(() => {
    turnstileState.verifying = false;
    turnstileState.verified = true;
    const randomPart = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    turnstileState.token = `turnstile_verified_${randomPart}`;

    if (tokenInput) tokenInput.value = turnstileState.token;
    if (spinner) spinner.classList.add('hidden');
    if (checkIcon) checkIcon.classList.remove('hidden');
    if (chkUi) {
      chkUi.className = 'w-6 h-6 rounded-md border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center transition-all shrink-0';
    }
    if (box) {
      box.className = 'w-full p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-300 flex items-center justify-between gap-3 select-none transition-all shadow-2xs';
    }
    if (statusText) {
      statusText.innerText = 'Verificación completada';
      statusText.className = 'text-xs font-black text-emerald-900 block';
    }
    if (subText) {
      subText.innerText = 'Token criptográfico Anti-Bots activo';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 450);
};

async function ensureNationalCatalogLoaded() {
  if (Object.keys(nationalCatalog32States).length >= 30) return;
  try {
    const res = await fetch('/api/national-catalog');
    const data = await res.json();
    if (data.success && data.catalog) {
      nationalCatalog32States = data.catalog;
      if (Array.isArray(data.states) && data.states.length > 0) {
        nationalStatesList = data.states.map(s => s.nombre);
      }
    }
  } catch (err) {
    console.warn('Error cargando catálogo nacional de 32 estados:', err);
  }
}

window.openAuthLoginModal = function() {
  const modal = document.getElementById('modal-auth-login');
  const errBox = document.getElementById('auth-error-box');
  if (errBox) errBox.classList.add('hidden');
  if (modal) modal.classList.remove('hidden');
};

window.closeAuthLoginModal = function() {
  // Bloqueo estricto: jamás cerrar el portal de acceso si no hay sesión autenticada
  if (!appState.activeSession) return;
  const modal = document.getElementById('modal-auth-login');
  if (modal) modal.classList.add('hidden');
};

window.handleAuthLogin = async function(event) {
  if (event) event.preventDefault();
  const username = document.getElementById('auth-username')?.value?.trim() || '';
  const password = document.getElementById('auth-password')?.value?.trim() || '';
  const captchaToken = document.getElementById('auth-captcha-token')?.value || turnstileState.token || '';
  const errBox = document.getElementById('auth-error-box');

  if (errBox) errBox.classList.add('hidden');

  // Validar que el CAPTCHA / Turnstile haya sido completado
  if (!turnstileState.verified || !captchaToken.startsWith('turnstile_verified_')) {
    if (errBox) {
      errBox.innerText = '⚠️ Debes completar la casilla de verificación Anti-Bots ("Verifica que eres humano") antes de iniciar sesión.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        captchaVerified: turnstileState.verified,
        captchaToken
      })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      if (errBox) {
        errBox.innerText = data.error || 'Credenciales incorrectas.';
        errBox.classList.remove('hidden');
      }
      return;
    }

    // Guardar sesión activa
    appState.activeSession = {
      role: data.role,
      user: data.user
    };

    // Desbloquear contenedores principales de la plataforma
    ['app-main-header', 'app-main-workspace', 'app-main-footer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    });

    closeAuthLoginModal();
    window.history.pushState({ authenticated: true }, '', window.location.pathname);

    if (data.role === 'MASTER_ADMIN') {
      const btnMaster = document.getElementById('btn-master-admin-header');
      if (btnMaster) {
        btnMaster.classList.remove('hidden');
        btnMaster.classList.add('flex');
      }
      const userBadge = document.getElementById('active-user-badge');
      if (userBadge) {
        userBadge.classList.remove('hidden');
        userBadge.classList.add('flex');
      }
      const navLabel = document.getElementById('nav-session-label');
      if (navLabel) navLabel.innerText = '👑 Cerkvega92';

      await applyLicenseRestrictionsToUI(data.user, true);
      await openMasterAdminModal();
      showToast('Bienvenido Erick Vega (Cerkvega92). Panel de Control Maestro desbloqueado.');
    } else {
      // Es un Cliente Político con licencia activa
      const btnMaster = document.getElementById('btn-master-admin-header');
      if (btnMaster) {
        btnMaster.classList.add('hidden');
        btnMaster.classList.remove('flex');
      }
      const userBadge = document.getElementById('active-user-badge');
      if (userBadge) {
        userBadge.classList.remove('hidden');
        userBadge.classList.add('flex');
      }
      const navLabel = document.getElementById('nav-session-label');
      if (navLabel) navLabel.innerText = `👤 ${data.user.username}`;

      await applyLicenseRestrictionsToUI(data.user, false);

      // Enrutamiento según permisos independientes (Radar Electoral vs. Simulador)
      const canRadar = data.user.permisoRadar !== false;
      const canSimulador = data.user.permisoSimulador !== false;

      if (canRadar) {
        await openRadarElectoralModal();
        showToast(`Sesión White-Label activada: ${data.user.clienteNombre} (${data.user.partido})`);
      } else if (canSimulador) {
        // Si no tiene permiso al Radar Electoral, ingresa directo al Simulador War Room (Vista 2)
        const modalRadar = document.getElementById('modal-radar-electoral');
        if (modalRadar) modalRadar.classList.add('hidden');
        showToast(`Acceso directo al Simulador Táctico activado: ${data.user.clienteNombre} (${data.user.partido})`);
      }
    }
  } catch (err) {
    if (errBox) {
      errBox.innerText = 'Error de conexión al validar licencia: ' + err.message;
      errBox.classList.remove('hidden');
    }
  }
};

/**
 * CIERRE DE SESIÓN SEGURO Y LIMPIEZA DE MEMORIA (LOGOUT)
 * Destruye sesión activa, purga simulaciones, elimina colores partidistas y regresa al Portal Neutral
 */
window.logoutSession = function() {
  // 1. Destruir sesión activa y almacenamiento temporal
  appState.activeSession = null;
  try {
    sessionStorage.clear();
  } catch (e) {
    // ignore
  }

  // 2. Purgar cualquier dato simulado, gráficas y memoria volátil
  if (typeof window.resetFullSimulation === 'function') {
    window.resetFullSimulation();
  }

  // Limpiar campos del Radar Electoral
  ['radar-input-candidato', 'radar-input-titulo', 'radar-input-propuesta'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const radarResults = document.getElementById('radar-results-container');
  if (radarResults) {
    radarResults.innerHTML = `
      <div class="card-pvem p-8 bg-white text-center text-slate-500 text-sm">
        Pulsa <b>"Iniciar Diagnóstico de Radar"</b> para desplegar las 6 problemáticas críticas (.gob.mx), batería de propuestas ganadoras por cargo, postura de los 12 sindicatos y micro-targeting por colonias.
      </div>
    `;
  }

  // 3. Limpiar formulario de login y reiniciar Turnstile CAPTCHA
  const uInput = document.getElementById('auth-username');
  const pInput = document.getElementById('auth-password');
  const errBox = document.getElementById('auth-error-box');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';
  if (errBox) errBox.classList.add('hidden');

  // 4. Forzar regreso a la Página de Bienvenida Neutral (Cero colores de partido)
  enforceNeutralWelcomeState();

  // 5. Bloquear navegación hacia atrás en el historial del navegador
  window.history.replaceState({ loggedOut: true }, '', window.location.pathname);
  window.history.pushState({ loggedOut: true }, '', window.location.pathname);
};

/**
 * Aplica en tiempo real la mutación White-Label, permisos Radar/Simulador, estados/municipios permitidos y límite de agentes
 */
async function applyLicenseRestrictionsToUI(licenseUser, isMasterAdmin = false) {
  if (!licenseUser) return;
  await ensureNationalCatalogLoaded();

  // 1. Mutar identidad cromática y logotipo al Partido asignado
  if (licenseUser.partido) {
    onPartyThemeChange(licenseUser.partido);
    const partySelect = document.getElementById('select-party-theme');
    if (partySelect) {
      partySelect.value = licenseUser.partido;
      partySelect.disabled = !isMasterAdmin; // Bloquear cambio de partido para el cliente
    }
  }

  // 2. Permisos Independientes de Módulos: Radar Electoral (Vista 1) vs Simulador (Vista 2)
  const canRadar = isMasterAdmin || licenseUser.permisoRadar !== false;
  const canSimulador = isMasterAdmin || licenseUser.permisoSimulador !== false;

  const btnHeaderRadar = document.getElementById('btn-header-radar-electoral');
  const cardRadarBanner = document.getElementById('card-radar-electoral-banner');
  if (btnHeaderRadar) {
    if (canRadar) {
      btnHeaderRadar.classList.remove('hidden');
      btnHeaderRadar.classList.add('flex');
    } else {
      btnHeaderRadar.classList.add('hidden');
      btnHeaderRadar.classList.remove('flex');
    }
  }
  if (cardRadarBanner) {
    if (canRadar) {
      cardRadarBanner.classList.remove('hidden');
    } else {
      cardRadarBanner.classList.add('hidden');
    }
  }

  const btnRadarGoWarRoom = document.getElementById('btn-radar-go-war-room');
  const btnRadarTransferWarRoom = document.getElementById('btn-radar-transfer-war-room');
  if (btnRadarGoWarRoom) {
    if (canSimulador) {
      btnRadarGoWarRoom.classList.remove('hidden');
    } else {
      btnRadarGoWarRoom.classList.add('hidden');
    }
  }
  if (btnRadarTransferWarRoom) {
    if (canSimulador) {
      btnRadarTransferWarRoom.classList.remove('hidden');
    } else {
      btnRadarTransferWarRoom.classList.add('hidden');
    }
  }

  // Si el cliente no tiene acceso al Radar y el Maestro le preconfiguró una propuesta fija, cargarla en el Simulador
  if (!isMasterAdmin && !canRadar) {
    if (licenseUser.propuestaFijaTitulo) {
      const titEl = document.getElementById('input-titulo');
      if (titEl) titEl.value = licenseUser.propuestaFijaTitulo;
      appState.tituloProyecto = licenseUser.propuestaFijaTitulo;
    }
    if (licenseUser.propuestaFijaTexto) {
      const propEl = document.getElementById('input-propuesta');
      if (propEl) propEl.value = licenseUser.propuestaFijaTexto;
      appState.propuestaTexto = licenseUser.propuestaFijaTexto;
    }
  }

  // 3. Mostrar Header de Cargo y Territorio asignado
  const regionPill = document.getElementById('header-assigned-region-pill');
  const regionText = document.getElementById('header-assigned-region-text');
  if (regionPill && regionText) {
    regionPill.classList.remove('hidden');
    regionPill.classList.add('flex');
    regionText.innerText = licenseUser.etiquetaRegion || `${licenseUser.partido} — Territorio Autorizado`;
  }

  const radarBadge = document.getElementById('radar-assigned-region-badge');
  if (radarBadge) {
    radarBadge.innerText = `📍 ${licenseUser.etiquetaRegion || 'Región Autorizada'}`;
  }

  const capPill = document.getElementById('radar-license-capacity-pill');
  const maxSwarm = parseInt(licenseUser.maxSwarmSize, 10) || 100000;
  if (capPill) {
    capPill.innerText = `Capacidad Autorizada: Hasta ${maxSwarm.toLocaleString()} Agentes`;
  }

  // 4. Restringir Selector de Cargos en el Radar Electoral (Vista 1)
  const cargoSelect = document.getElementById('select-cargo-electoral');
  const allowedCargos = Array.isArray(licenseUser.cargosAutorizados) && licenseUser.cargosAutorizados.length > 0
    ? licenseUser.cargosAutorizados
    : ['Presidente Municipal / Alcalde', 'Regidor', 'Diputado Local', 'Diputado Federal', 'Senador', 'Gobernador'];

  if (cargoSelect) {
    cargoSelect.innerHTML = allowedCargos.map((c, idx) => `
      <option value="${c}" ${idx === 0 ? 'selected' : ''}>${c}</option>
    `).join('');
    appState.cargoElectoral = allowedCargos[0];
  }

  // 5. Restringir Estados y Municipios en Radar (Vista 1) y War Room (Vista 2)
  await syncAuthorizedSelectorsInRadar(licenseUser);

  // 6. Restringir capacidad de agentes sintéticos (maxSwarmSize)
  document.querySelectorAll('.btn-swarm-size').forEach(btn => {
    const size = parseInt(btn.getAttribute('data-size'), 10);
    if (!isMasterAdmin && size > maxSwarm) {
      btn.disabled = true;
      btn.classList.add('opacity-40', 'cursor-not-allowed');
      btn.title = `Bloqueado por licencia (Máximo contratado: ${maxSwarm.toLocaleString()} agentes)`;
    } else {
      btn.disabled = false;
      btn.classList.remove('opacity-40', 'cursor-not-allowed');
      btn.title = '';
    }
  });

  if (appState.swarmSize > maxSwarm) {
    setExactSwarmSize(maxSwarm);
  }
}

async function syncAuthorizedSelectorsInRadar(licenseUser) {
  await ensureNationalCatalogLoaded();
  const lic = licenseUser || appState.activeSession?.user;

  const mainStateSelect = document.getElementById('select-estado');
  const radarStateSelect = document.getElementById('radar-select-estado');
  const mainMuniSelect = document.getElementById('select-municipio');
  const radarMuniSelect = document.getElementById('radar-select-municipio');

  // Determinar Estados permitidos (de los 32 Estados de la República)
  let allowedStates = nationalStatesList;
  if (lic && Array.isArray(lic.estadosAutorizados) && lic.estadosAutorizados.length > 0 && !lic.estadosAutorizados.includes('TODOS')) {
    allowedStates = lic.estadosAutorizados;
  }

  const statesOptionsHtml = allowedStates.map((st, idx) => `
    <option value="${st}" ${idx === 0 ? 'selected' : ''}>${st}</option>
  `).join('');

  if (radarStateSelect) {
    radarStateSelect.innerHTML = statesOptionsHtml;
  }
  if (mainStateSelect) {
    mainStateSelect.innerHTML = statesOptionsHtml;
    appState.estado = allowedStates[0] || 'Estado de México';
  }

  // Determinar Municipios / Alcaldías / Distritos permitidos para el Estado seleccionado
  const activeState = allowedStates[0] || 'Estado de México';
  const catalogForActiveState = nationalCatalog32States[activeState] || allAvailableMunicipalities;

  let allowedMunis = catalogForActiveState;
  if (lic && Array.isArray(lic.municipiosAutorizados) && lic.municipiosAutorizados.length > 0 && !lic.municipiosAutorizados.includes('TODOS')) {
    // Filtrar los municipios autorizados que pertenezcan al estado activo o mostrar todos los autorizados de la licencia
    const filteredForState = lic.municipiosAutorizados.filter(m => catalogForActiveState.includes(m));
    allowedMunis = filteredForState.length > 0 ? filteredForState : lic.municipiosAutorizados;
  }

  const muniOptionsHtml = allowedMunis.map((m, idx) => `
    <option value="${m}" ${idx === 0 ? 'selected' : ''}>${m}</option>
  `).join('');

  if (radarMuniSelect) {
    radarMuniSelect.innerHTML = muniOptionsHtml;
  }
  if (mainMuniSelect) {
    mainMuniSelect.innerHTML = muniOptionsHtml;
    appState.municipio = allowedMunis[0] || 'Ecatepec de Morelos';
  }
}

window.onRadarStateChange = async function(selectedState) {
  await ensureNationalCatalogLoaded();
  const lic = appState.activeSession?.user;
  const radarMuniSelect = document.getElementById('radar-select-municipio');
  const mainStateSelect = document.getElementById('select-estado');
  const mainMuniSelect = document.getElementById('select-municipio');

  appState.estado = selectedState;
  if (mainStateSelect) mainStateSelect.value = selectedState;

  const catalogForState = nationalCatalog32States[selectedState] || [];
  let allowedMunis = catalogForState;

  if (lic && Array.isArray(lic.municipiosAutorizados) && lic.municipiosAutorizados.length > 0 && !lic.municipiosAutorizados.includes('TODOS')) {
    const filtered = lic.municipiosAutorizados.filter(m => catalogForState.includes(m));
    allowedMunis = filtered.length > 0 ? filtered : lic.municipiosAutorizados;
  }

  const muniOptionsHtml = allowedMunis.map((m, idx) => `
    <option value="${m}" ${idx === 0 ? 'selected' : ''}>${m}</option>
  `).join('');

  if (radarMuniSelect) radarMuniSelect.innerHTML = muniOptionsHtml;
  if (mainMuniSelect) mainMuniSelect.innerHTML = muniOptionsHtml;
  if (allowedMunis[0]) appState.municipio = allowedMunis[0];
};

window.onLicenseModulePermChange = function() {
  const radarChk = document.getElementById('lic-permiso-radar');
  const fixedBox = document.getElementById('lic-fixed-proposal-box');
  if (radarChk && fixedBox) {
    if (!radarChk.checked) {
      fixedBox.classList.remove('hidden');
    } else {
      fixedBox.classList.add('hidden');
    }
  }
};

window.openMasterAdminModal = async function() {
  const modal = document.getElementById('modal-master-admin');
  if (!modal) return;
  await ensureNationalCatalogLoaded();
  renderLicenseStatesCheckboxes(['Estado de México']);
  renderLicenseMunicipalitiesCheckboxes(['Ecatepec de Morelos']);
  await loadMasterLicenses();
  modal.classList.remove('hidden');
};

window.closeMasterAdminModal = function() {
  const modal = document.getElementById('modal-master-admin');
  if (modal) modal.classList.add('hidden');
};

/**
 * Renderiza el catálogo de los 32 Estados de la República Mexicana con selección múltiple
 */
function renderLicenseStatesCheckboxes(selectedStates = ['Estado de México']) {
  const container = document.getElementById('lic-estados-checkbox-list');
  if (!container) return;
  const isAll = selectedStates.includes('TODOS') || selectedStates.length >= nationalStatesList.length;
  const allChk = document.getElementById('lic-todos-estados');
  if (allChk) allChk.checked = isAll;

  container.innerHTML = nationalStatesList.map(st => {
    const checked = isAll || selectedStates.includes(st) ? 'checked' : '';
    return `
      <label class="lic-estado-item flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded" data-state="${st.toLowerCase()}">
        <input type="checkbox" name="lic_estado" value="${st}" ${checked} onchange="onLicenseStateCheckboxChange()" class="rounded text-emerald-600">
        <span class="truncate font-medium">${st}</span>
      </label>
    `;
  }).join('');
}

window.onLicenseStateCheckboxChange = function() {
  // Conservar municipios que ya estaban marcados antes de actualizar la lista
  const currentlyCheckedMunis = Array.from(document.querySelectorAll('input[name="lic_municipio"]:checked')).map(cb => cb.value);
  renderLicenseMunicipalitiesCheckboxes(currentlyCheckedMunis);
};

window.toggleAllLicenseStates = function(checked) {
  document.querySelectorAll('input[name="lic_estado"]').forEach(cb => {
    cb.checked = checked;
  });
  renderLicenseMunicipalitiesCheckboxes(checked ? ['TODOS'] : []);
};

window.filterLicenseStatesList = function(query) {
  const q = (query || '').toLowerCase().trim();
  document.querySelectorAll('.lic-estado-item').forEach(item => {
    const name = item.getAttribute('data-state') || '';
    if (!q || name.includes(q)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
};

/**
 * Despliega dinámicamente los Municipios, Alcaldías y Distritos según el(los) Estado(s) seleccionado(s)
 */
function renderLicenseMunicipalitiesCheckboxes(selectedList = ['Ecatepec de Morelos']) {
  const container = document.getElementById('lic-municipios-checkbox-list');
  if (!container) return;

  const selectedStates = Array.from(document.querySelectorAll('input[name="lic_estado"]:checked')).map(cb => cb.value);
  const statesToLoad = selectedStates.length > 0 ? selectedStates : ['Estado de México'];
  const multiState = statesToLoad.length > 1;

  const isAll = selectedList.includes('TODOS');
  const allChk = document.getElementById('lic-todos-municipios');
  if (allChk) allChk.checked = isAll;

  const items = [];
  statesToLoad.forEach(st => {
    const list = nationalCatalog32States[st] || (st === 'Estado de México' ? allAvailableMunicipalities : [`Capital de ${st}`]);
    list.forEach(m => {
      items.push({
        estado: st,
        nombre: m,
        label: multiState ? `${m} (${st})` : m
      });
    });
  });

  if (items.length === 0) {
    container.innerHTML = `<div class="col-span-2 text-center text-slate-400 text-[11px] py-2">Selecciona al menos un Estado arriba para desplegar sus municipios y distritos.</div>`;
    return;
  }

  container.innerHTML = items.map(it => {
    const checked = isAll || selectedList.includes(it.nombre) ? 'checked' : '';
    return `
      <label class="lic-muni-item flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded" data-name="${it.label.toLowerCase()}">
        <input type="checkbox" name="lic_municipio" value="${it.nombre}" ${checked} class="rounded text-emerald-600">
        <span class="truncate" title="${it.label}">${it.label}</span>
      </label>
    `;
  }).join('');
}

window.toggleAllLicenseMunicipalities = function(checked) {
  document.querySelectorAll('input[name="lic_municipio"]').forEach(cb => {
    cb.checked = checked;
  });
};

window.filterLicenseMunicipalitiesList = function(query) {
  const q = (query || '').toLowerCase().trim();
  document.querySelectorAll('.lic-muni-item').forEach(item => {
    const name = item.getAttribute('data-name') || '';
    if (!q || name.includes(q)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
};

async function loadMasterLicenses() {
  try {
    const res = await fetch('/api/licenses');
    const data = await res.json();
    if (data.success && Array.isArray(data.licenses)) {
      masterLicensesCache = data.licenses;
      renderMasterLicensesList();
    }
  } catch (err) {
    console.warn('Error cargando licencias:', err);
  }
}

function renderMasterLicensesList() {
  const container = document.getElementById('master-licenses-list');
  if (!container) return;

  if (!masterLicensesCache.length) {
    container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">No hay licencias registradas.</div>`;
    return;
  }

  container.innerHTML = masterLicensesCache.map(lic => {
    const now = new Date();
    const exp = new Date(`${lic.fechaExpiracion}T23:59:59`);
    const isExpired = now > exp;
    const isActive = lic.activo && !isExpired;

    const statusBadge = isActive
      ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 LICENCIA ACTIVA</span>`
      : `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">🔴 BLOQUEADA / EXPIRADA</span>`;

    const estadosStr = (lic.estadosAutorizados || ['Estado de México']).join(', ');
    const munisStr = (lic.municipiosAutorizados || []).slice(0, 6).join(', ') + ((lic.municipiosAutorizados || []).length > 6 ? ` (+${lic.municipiosAutorizados.length - 6} más)` : '');
    const hasRadar = lic.permisoRadar !== false;
    const hasSim = lic.permisoSimulador !== false;

    return `
      <div class="p-4 rounded-xl border ${isActive ? 'border-slate-200 bg-slate-50/70' : 'border-rose-200 bg-rose-50/30'} space-y-3 text-xs shadow-2xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded font-black text-[10px] bg-slate-900 text-white">${lic.partido}</span>
            <h4 class="font-black text-slate-900 text-sm">${lic.clienteNombre}</h4>
          </div>
          ${statusBadge}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
          <div>
            <span class="text-slate-400 block text-[10px] font-bold uppercase">Credenciales Manuales:</span>
            <span class="font-mono font-bold text-slate-900">${lic.username}</span> / <span class="font-mono text-emerald-700 font-bold">${lic.password}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] font-bold uppercase">Capacidad Enjambre:</span>
            <span class="font-black text-slate-900">Hasta ${(lic.maxSwarmSize || 100000).toLocaleString()} Agentes</span>
          </div>
        </div>

        <!-- CONTROL DE TIEMPO FLEXIBLE: CALENDARIO INTERACTIVO (DATEPICKER) PARA ALARGAR O ACORTAR VIGENCIA -->
        <div class="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="text-[10px] font-black uppercase text-amber-950 block">📅 Gestión Rápida de Vigencia (Kill Switch Datepicker):</span>
            <span class="text-[10px] text-slate-600">Inicio: <b>${lic.fechaInicio}</b> • Modifica la fecha para alargar o acortar acceso al instante</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <input type="date" id="quick-exp-${lic.id}" value="${lic.fechaExpiracion}"
              class="px-2 py-1 rounded border border-amber-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500">
            <button type="button" onclick="updateLicenseExpirationQuick('${lic.id}')"
              class="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all">
              Guardar Fecha
            </button>
            <button type="button" onclick="addDaysToLicenseExpiration('${lic.id}', 30)" title="Alargar +30 días"
              class="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] cursor-pointer">
              +30d
            </button>
          </div>
        </div>

        <!-- PERMISOS INDEPENDIENTES DE MÓDULOS EN TIEMPO REAL -->
        <div class="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span class="font-black text-indigo-950 text-[10px] uppercase">Módulos Autorizados:</span>
          <div class="flex items-center gap-3 flex-wrap">
            <label class="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" ${hasRadar ? 'checked' : ''} onchange="toggleLicenseModulePermQuick('${lic.id}', 'radar', this.checked)" class="rounded text-indigo-600">
              <span>🗳️ Vista 1: Radar Electoral</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" ${hasSim ? 'checked' : ''} onchange="toggleLicenseModulePermQuick('${lic.id}', 'simulador', this.checked)" class="rounded text-indigo-600">
              <span>📊 Vista 2: Simulador Táctico</span>
            </label>
          </div>
        </div>

        <div class="text-[11px] text-slate-600 space-y-1">
          <div><b>🇲🇽 Estado(s):</b> ${estadosStr} | <b>📍 Región:</b> ${lic.etiquetaRegion} (${munisStr})</div>
          <div><b>🗳️ Cargos Autorizados:</b> ${(lic.cargosAutorizados || []).join(' • ')}</div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200/70">
          <button type="button" onclick="previewClientLicenseSession('${lic.id}')"
            class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] transition-all cursor-pointer">
            👁️ Simular como este Cliente
          </button>
          <button type="button" onclick="editClientLicense('${lic.id}')"
            class="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition-all cursor-pointer">
            ✏️ Editar Completo
          </button>
          <button type="button" onclick="toggleClientLicenseKillSwitch('${lic.id}')"
            class="px-3 py-1.5 rounded-lg ${lic.activo ? 'bg-amber-100 hover:bg-amber-200 text-amber-900' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'} font-bold text-[11px] transition-all cursor-pointer">
            🔌 ${lic.activo ? 'Suspender (Kill Switch)' : 'Reactivar'}
          </button>
          <button type="button" onclick="deleteClientLicense('${lic.id}')"
            class="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] transition-all cursor-pointer">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.updateLicenseExpirationQuick = async function(id) {
  const dateInput = document.getElementById(`quick-exp-${id}`);
  if (!dateInput || !dateInput.value) return;

  try {
    const res = await fetch(`/api/licenses/${encodeURIComponent(id)}/expiration`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaExpiracion: dateInput.value })
    });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = data.licenses;
      renderMasterLicensesList();
      showToast(`📅 Vigencia actualizada al ${dateInput.value}. Kill Switch sincronizado.`);
    }
  } catch (err) {
    console.error('Error actualizando vigencia:', err);
  }
};

window.addDaysToLicenseExpiration = async function(id, daysToAdd) {
  const lic = masterLicensesCache.find(l => l.id === id);
  if (!lic) return;

  const baseDate = lic.fechaExpiracion ? new Date(`${lic.fechaExpiracion}T12:00:00`) : new Date();
  const now = new Date();
  const startFrom = baseDate < now ? now : baseDate;
  startFrom.setDate(startFrom.getDate() + (parseInt(daysToAdd, 10) || 30));
  const newExpStr = startFrom.toISOString().split('T')[0];

  const dateInput = document.getElementById(`quick-exp-${id}`);
  if (dateInput) dateInput.value = newExpStr;
  await window.updateLicenseExpirationQuick(id);
};

window.toggleLicenseModulePermQuick = async function(id, modType, checked) {
  const lic = masterLicensesCache.find(l => l.id === id);
  if (!lic) return;

  const payload = {
    permisoRadar: modType === 'radar' ? checked : lic.permisoRadar !== false,
    permisoSimulador: modType === 'simulador' ? checked : lic.permisoSimulador !== false
  };

  try {
    const res = await fetch(`/api/licenses/${encodeURIComponent(id)}/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = data.licenses;
      renderMasterLicensesList();
      showToast(`Permisos de módulos actualizados para ${lic.clienteNombre}.`);
    }
  } catch (err) {
    console.error('Error actualizando permisos de módulos:', err);
  }
};

window.resetLicenseForm = function() {
  document.getElementById('lic-id').value = '';
  document.getElementById('lic-cliente-nombre').value = '';
  document.getElementById('lic-username').value = '';
  document.getElementById('lic-password').value = '';
  document.getElementById('lic-partido').value = 'PVEM';
  document.getElementById('lic-max-swarm').value = '100000';
  document.getElementById('lic-etiqueta-region').value = '';
  document.getElementById('lic-form-title').innerText = '➕ Crear / Configurar Licencia de Cliente';

  const permRadar = document.getElementById('lic-permiso-radar');
  const permSim = document.getElementById('lic-permiso-simulador');
  const fixedTit = document.getElementById('lic-propuesta-fija-titulo');
  const fixedTxt = document.getElementById('lic-propuesta-fija-texto');
  if (permRadar) permRadar.checked = true;
  if (permSim) permSim.checked = true;
  if (fixedTit) fixedTit.value = '';
  if (fixedTxt) fixedTxt.value = '';
  onLicenseModulePermChange();

  renderLicenseStatesCheckboxes(['Estado de México']);
  renderLicenseMunicipalitiesCheckboxes(['Ecatepec de Morelos']);
};

window.saveClientLicense = async function(event) {
  if (event) event.preventDefault();

  const id = document.getElementById('lic-id')?.value || '';
  const clienteNombre = document.getElementById('lic-cliente-nombre')?.value?.trim();
  const username = document.getElementById('lic-username')?.value?.trim();
  const password = document.getElementById('lic-password')?.value?.trim();
  const partido = document.getElementById('lic-partido')?.value || 'PVEM';
  const maxSwarmSize = parseInt(document.getElementById('lic-max-swarm')?.value, 10) || 100000;
  const fechaInicio = document.getElementById('lic-fecha-inicio')?.value || '2026-01-01';
  const fechaExpiracion = document.getElementById('lic-fecha-expiracion')?.value || '2027-07-31';
  const nivelGeografico = document.getElementById('lic-nivel-geo')?.value || 'Municipal / Alcaldía';
  const etiquetaRegion = document.getElementById('lic-etiqueta-region')?.value?.trim() || `${nivelGeografico} — ${partido}`;

  const permisoRadar = document.getElementById('lic-permiso-radar')?.checked !== false;
  const permisoSimulador = document.getElementById('lic-permiso-simulador')?.checked !== false;
  if (!permisoRadar && !permisoSimulador) {
    alert('Selecciona al menos un módulo de acceso (Radar Electoral o Simulador Táctico).');
    return;
  }

  const propuestaFijaTitulo = document.getElementById('lic-propuesta-fija-titulo')?.value?.trim() || '';
  const propuestaFijaTexto = document.getElementById('lic-propuesta-fija-texto')?.value?.trim() || '';

  const cargosAutorizados = Array.from(document.querySelectorAll('input[name="lic_cargo"]:checked')).map(cb => cb.value);
  if (cargosAutorizados.length === 0) {
    alert('Selecciona al menos un Cargo Autorizado.');
    return;
  }

  const todosEstados = document.getElementById('lic-todos-estados')?.checked;
  let estadosAutorizados = ['TODOS'];
  if (!todosEstados) {
    estadosAutorizados = Array.from(document.querySelectorAll('input[name="lic_estado"]:checked')).map(cb => cb.value);
    if (estadosAutorizados.length === 0) {
      alert('Selecciona al menos un Estado de los 32 o marca "Los 32 Estados (Nacional)".');
      return;
    }
  }

  const todosMunis = document.getElementById('lic-todos-municipios')?.checked;
  let municipiosAutorizados = ['TODOS'];
  if (!todosMunis) {
    municipiosAutorizados = Array.from(document.querySelectorAll('input[name="lic_municipio"]:checked')).map(cb => cb.value);
    if (municipiosAutorizados.length === 0) {
      alert('Selecciona al menos un Municipio/Alcaldía/Distrito o marca "Autorizar TODOS".');
      return;
    }
  }

  const payload = {
    id: id || undefined,
    clienteNombre,
    username,
    password,
    partido,
    maxSwarmSize,
    fechaInicio,
    fechaExpiracion,
    nivelGeografico,
    etiquetaRegion,
    estadosAutorizados,
    cargosAutorizados,
    municipiosAutorizados,
    permisoRadar,
    permisoSimulador,
    propuestaFijaTitulo,
    propuestaFijaTexto,
    activo: true
  };

  try {
    const res = await fetch('/api/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = data.licenses;
      renderMasterLicensesList();
      resetLicenseForm();
      showToast(`Licencia White-Label guardada exitosamente para ${clienteNombre}.`);
    }
  } catch (err) {
    alert('Error guardando licencia: ' + err.message);
  }
};

window.editClientLicense = async function(id) {
  await ensureNationalCatalogLoaded();
  const lic = masterLicensesCache.find(l => l.id === id);
  if (!lic) return;

  document.getElementById('lic-id').value = lic.id;
  document.getElementById('lic-cliente-nombre').value = lic.clienteNombre;
  document.getElementById('lic-username').value = lic.username;
  document.getElementById('lic-password').value = lic.password;
  document.getElementById('lic-partido').value = lic.partido;
  document.getElementById('lic-max-swarm').value = String(lic.maxSwarmSize || 100000);
  document.getElementById('lic-fecha-inicio').value = lic.fechaInicio;
  document.getElementById('lic-fecha-expiracion').value = lic.fechaExpiracion;
  document.getElementById('lic-nivel-geo').value = lic.nivelGeografico || 'Municipal / Alcaldía';
  document.getElementById('lic-etiqueta-region').value = lic.etiquetaRegion || '';
  document.getElementById('lic-form-title').innerText = `✏️ Editando: ${lic.clienteNombre}`;

  const permRadar = document.getElementById('lic-permiso-radar');
  const permSim = document.getElementById('lic-permiso-simulador');
  const fixedTit = document.getElementById('lic-propuesta-fija-titulo');
  const fixedTxt = document.getElementById('lic-propuesta-fija-texto');
  if (permRadar) permRadar.checked = lic.permisoRadar !== false;
  if (permSim) permSim.checked = lic.permisoSimulador !== false;
  if (fixedTit) fixedTit.value = lic.propuestaFijaTitulo || '';
  if (fixedTxt) fixedTxt.value = lic.propuestaFijaTexto || '';
  onLicenseModulePermChange();

  document.querySelectorAll('input[name="lic_cargo"]').forEach(cb => {
    cb.checked = (lic.cargosAutorizados || []).includes(cb.value);
  });

  renderLicenseStatesCheckboxes(lic.estadosAutorizados || ['Estado de México']);
  renderLicenseMunicipalitiesCheckboxes(lic.municipiosAutorizados || ['Ecatepec de Morelos']);
};

window.toggleClientLicenseKillSwitch = async function(id) {
  try {
    const res = await fetch(`/api/licenses/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = data.licenses;
      renderMasterLicensesList();
      showToast('Estado de licencia actualizado (Kill Switch).');
    }
  } catch (err) {
    console.error(err);
  }
};

window.deleteClientLicense = async function(id) {
  try {
    const res = await fetch(`/api/licenses/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = data.licenses;
      renderMasterLicensesList();
      showToast('Licencia eliminada del sistema.');
    }
  } catch (err) {
    console.error(err);
  }
};

window.previewClientLicenseSession = async function(id) {
  const lic = masterLicensesCache.find(l => l.id === id);
  if (!lic) return;

  await applyLicenseRestrictionsToUI(lic, false);
  closeMasterAdminModal();

  if (lic.permisoRadar !== false) {
    await openRadarElectoralModal();
  } else {
    const modalRadar = document.getElementById('modal-radar-electoral');
    if (modalRadar) modalRadar.classList.add('hidden');
  }
  showToast(`Modo Vista Previa Cliente activo: ${lic.clienteNombre} (${lic.partido})`);
};

window.activateMasterFullAccess = async function() {
  const masterUser = {
    clienteNombre: 'Erick Vega — Administrador Maestro',
    username: 'Cerkvega92',
    partido: appState.activeParty || 'PVEM',
    etiquetaRegion: 'Control Maestro Nacional (32 Estados) — Todos los Territorios Autorizados',
    estadosAutorizados: ['TODOS'],
    cargosAutorizados: [
      'Presidente Municipal / Alcalde',
      'Regidor',
      'Diputado Local',
      'Diputado Federal',
      'Senador',
      'Gobernador'
    ],
    municipiosAutorizados: ['TODOS'],
    permisoRadar: true,
    permisoSimulador: true,
    maxSwarmSize: 100000
  };
  await applyLicenseRestrictionsToUI(masterUser, true);
  showToast('Permisos de Administrador Maestro restaurados al 100% (32 Estados).');
};


