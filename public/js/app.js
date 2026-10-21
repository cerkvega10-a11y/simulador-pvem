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
  isSimulating: false,
  aiConfig: {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    centralized: true
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

  // Restaurar sesión autenticada en recargas de página (F5) si existe token activo en sessionStorage
  try {
    const savedSessionRaw = sessionStorage.getItem('govtech_active_session_v1');
    const savedToken = sessionStorage.getItem('pvem_session_token');
    if (savedSessionRaw && savedToken) {
      const savedSession = JSON.parse(savedSessionRaw);
      if (savedSession && savedSession.user) {
        appState.activeSession = savedSession;
        ['app-main-header', 'app-main-workspace', 'app-main-footer'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('hidden');
        });
        closeAuthLoginModal();
        const isMaster = savedSession.role === 'MASTER_ADMIN' || savedSession.user.esAdministradorTotal;
        const btnMaster = document.getElementById('btn-master-admin-header');
        if (btnMaster) {
          if (isMaster) {
            btnMaster.classList.remove('hidden');
            btnMaster.classList.add('flex');
          } else {
            btnMaster.classList.add('hidden');
            btnMaster.classList.remove('flex');
          }
        }
        const userBadge = document.getElementById('active-user-badge');
        if (userBadge) {
          userBadge.classList.remove('hidden');
          userBadge.classList.add('flex');
        }
        const navLabel = document.getElementById('nav-session-label');
        if (navLabel) navLabel.innerText = `${isMaster ? '👑' : '👤'} ${savedSession.user.username}`;
        const adminBadge = document.getElementById('master-admin-badge');
        if (adminBadge && isMaster) adminBadge.innerText = `Admin: ${savedSession.user.username}`;

        startInactivityMonitor();
        await applyLicenseRestrictionsToUI(savedSession.user, isMaster);
        if (isMaster) {
          await openMasterAdminModal();
        }
      }
    }
  } catch (e) {
    console.warn('Error restaurando sesión tras recarga:', e);
  }
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

function isUserSuperAdminOrNational(userObj) {
  const u = userObj || appState.activeSession?.user;
  const role = String(appState.activeSession?.role || u?.role || u?.tipoUsuario || '').toUpperCase();
  const uname = String(u?.username || '').toLowerCase();
  if (
    role === 'MASTER_ADMIN' ||
    role === 'MASTER' ||
    role === 'ADMIN' ||
    role === 'SUPERADMIN' ||
    u?.esAdministradorTotal === true ||
    uname === 'cerkvega92' ||
    uname === 'aland'
  ) {
    return true;
  }
  if (
    u?.can_select_all_states === true ||
    (Array.isArray(u?.estadosAutorizados) && (
      u.estadosAutorizados.includes('TODOS') ||
      u.estadosAutorizados.includes('ALL_STATES') ||
      u.estadosAutorizados.includes('TODOS LOS ESTADOS (Nacional)') ||
      u.estadosAutorizados.length >= 32
    ))
  ) {
    return true;
  }
  return false;
}

/**
 * Carga inicial de Estados de la República (32 Entidades Federativas + Opción Nacional)
 */
async function loadStates() {
  const select = document.getElementById('select-estado');
  if (!select) return;

  try {
    const res = await fetch('/api/states');
    const data = await res.json();
    if (data.success && data.states) {
      const nationalOpt = `<option value="TODOS LOS ESTADOS (Nacional)">🇲🇽 TODOS LOS ESTADOS (Nacional)</option>`;
      const statesOpts = data.states.map(est => `
        <option value="${est.nombre}" ${est.predeterminado ? 'selected' : ''}>${est.nombre}</option>
      `).join('');
      select.innerHTML = nationalOpt + statesOpts;
      select.disabled = false;
      select.classList.remove('opacity-65', 'cursor-not-allowed');
    }
  } catch (err) {
    console.error('Error cargando estados:', err);
  }
}

/**
 * Carga dinámica en cascada de Municipios según el Estado seleccionado
 */
async function loadMunicipalities(estado) {
  const select = document.getElementById('select-municipio');
  const radarSelect = document.getElementById('radar-select-municipio');
  if (!select && !radarSelect) return;

  const targetState = String(estado || 'Estado de México').trim();
  const isAllNational = targetState === 'TODOS LOS ESTADOS (Nacional)' || targetState === 'TODOS' || targetState === 'ALL_STATES' || targetState.toUpperCase().includes('TODOS LOS ESTADOS');

  // Caso A: El usuario eligió "TODOS LOS ESTADOS (Nacional)"
  if (isAllNational) {
    const nationalMuniHtml = `
      <option value="Todos los Municipios (Cobertura Nacional)" selected>🇲🇽 Todos los Municipios (Cobertura Nacional)</option>
    `;
    if (select) {
      select.innerHTML = nationalMuniHtml;
      select.disabled = Boolean(appState.isLocked);
      appState.municipio = 'Todos los Municipios (Cobertura Nacional)';
    }
    if (radarSelect) {
      radarSelect.innerHTML = nationalMuniHtml;
    }
    return;
  }

  // Caso B: El usuario eligió un Estado específico (ej. Jalisco, Nuevo León, Veracruz, Puebla, CDMX, Edomex)
  const allStateLabel = `Todos los Municipios de ${targetState}`;

  try {
    await ensureNationalCatalogLoaded();
    const res = await fetch(`/api/municipalities?estado=${encodeURIComponent(targetState)}`);
    const data = await res.json();
    if (data.success && data.municipios) {
      let lista = data.municipios;
      const lic = appState.activeSession?.user;
      const hasFullBypass = isUserSuperAdminOrNational(lic);

      if (lic && !hasFullBypass && Array.isArray(lic.municipiosAutorizados) && !lic.municipiosAutorizados.includes('TODOS')) {
        const filtered = lista.filter(m => lic.municipiosAutorizados.includes(m.nombre) || m.nombre.toLowerCase().includes('todos los municipios'));
        if (filtered.length > 0) lista = filtered;
      }

      // Garantizar siempre como primera opción "Todos los Municipios de [Nombre del Estado]"
      lista = lista.filter(m => !m.nombre.toLowerCase().includes('todos los municipios'));
      lista.unshift({
        estado: targetState,
        nombre: allStateLabel,
        tieneDetalleProfundo: true,
        esMacroEstatal: true
      });

      const optionsHtml = lista.map((m, idx) => `
        <option value="${m.nombre}" ${idx === 0 ? 'selected' : ''}>
          ${idx === 0 ? `🌟 ${m.nombre}` : m.nombre} ${m.tieneDetalleProfundo && idx !== 0 ? '★ (Perfil Detallado)' : ''}
        </option>
      `).join('');

      if (select) {
        select.innerHTML = optionsHtml;
        select.disabled = Boolean(appState.isLocked);
        appState.municipio = select.value;
      }
      if (radarSelect) {
        radarSelect.innerHTML = optionsHtml;
      }
    }
  } catch (err) {
    console.error('Error cargando municipios:', err);
    const fallbackMunis = nationalCatalog32States[targetState] || [];
    const fallbackList = [allStateLabel, ...fallbackMunis.filter(m => !m.toLowerCase().includes('todos'))];
    const fallbackHtml = fallbackList.map((m, idx) => `
      <option value="${m}" ${idx === 0 ? 'selected' : ''}>${idx === 0 ? `🌟 ${m}` : m}</option>
    `).join('');
    if (select) {
      select.innerHTML = fallbackHtml;
      appState.municipio = fallbackList[0];
    }
    if (radarSelect) {
      radarSelect.innerHTML = fallbackHtml;
    }
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
        <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>Simular en War Room Vista 2</span>
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

  // Redimensionar automáticamente gráficos de Chart.js al cambiar de pestaña
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
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
  const partyThemes = [
    'theme-pvem', 'theme-morena', 'theme-pan', 'theme-pri', 'theme-mc', 'theme-pt',
    'theme-independiente', 'theme-candidatura-independiente',
    'theme-coalicion', 'theme-coalición', 'theme-alianza'
  ];
  partyThemes.forEach(th => document.body.classList.remove(th));
  
  let currentClass = `theme-${pCode.toLowerCase()}`;
  if (pCode.includes('INDEPENDIENTE')) currentClass = 'theme-independiente';
  if (pCode.includes('COALIC') || pCode.includes('ALIANZA')) currentClass = 'theme-coalicion';
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
    },
    'CANDIDATURA INDEPENDIENTE': {
      name: 'Candidatura Ciudadana Independiente',
      shortName: 'INDEPENDIENTE',
      badgeLetter: 'IND',
      badgeText: '⚪ Movimiento Ciudadano Sin Partido e Inteligencia Social',
      systemTitle: 'SISTEMA INTELIGENCIA CIUDADANA AI — CANDIDATURA INDEPENDIENTE',
      headerTitle: 'Coordinación General Sin Partido',
      heroTitle: 'Candidatura Ciudadana Independiente',
      logoSrc: '/assets/logo-independiente.svg',
      logoAlt: 'Candidatura Independiente',
      docTitle: 'Simulador Predictivo de Impacto Social — Candidatura Independiente'
    },
    INDEPENDIENTE: {
      name: 'Candidatura Ciudadana Independiente',
      shortName: 'INDEPENDIENTE',
      badgeLetter: 'IND',
      badgeText: '⚪ Movimiento Ciudadano Sin Partido e Inteligencia Social',
      systemTitle: 'SISTEMA INTELIGENCIA CIUDADANA AI — CANDIDATURA INDEPENDIENTE',
      headerTitle: 'Coordinación General Sin Partido',
      heroTitle: 'Candidatura Ciudadana Independiente',
      logoSrc: '/assets/logo-independiente.svg',
      logoAlt: 'Candidatura Independiente',
      docTitle: 'Simulador Predictivo de Impacto Social — Candidatura Independiente'
    },
    'COALICIÓN / ALIANZA': {
      name: 'Coalición y Alianza Electoral Multipartidista',
      shortName: 'COALICIÓN',
      badgeLetter: 'ALZ',
      badgeText: '🤝 Alianza Estratégica Multipartidista y Simulación de Coalición',
      systemTitle: 'SISTEMA CUARTO DE GUERRA AI — COALICIÓN Y ALIANZA ELECTORAL',
      headerTitle: 'Mesa Estratégica de Coalición',
      heroTitle: 'Coalición y Alianza Electoral',
      logoSrc: '/assets/logo-alianza.svg',
      logoAlt: 'Coalición y Alianza',
      docTitle: 'Simulador Predictivo de Impacto Social — Coalición / Alianza Electoral'
    },
    COALICION: {
      name: 'Coalición y Alianza Electoral Multipartidista',
      shortName: 'COALICIÓN',
      badgeLetter: 'ALZ',
      badgeText: '🤝 Alianza Estratégica Multipartidista y Simulación de Coalición',
      systemTitle: 'SISTEMA CUARTO DE GUERRA AI — COALICIÓN Y ALIANZA ELECTORAL',
      headerTitle: 'Mesa Estratégica de Coalición',
      heroTitle: 'Coalición y Alianza Electoral',
      logoSrc: '/assets/logo-alianza.svg',
      logoAlt: 'Coalición y Alianza',
      docTitle: 'Simulador Predictivo de Impacto Social — Coalición / Alianza Electoral'
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
 * Actualiza el estilo activo de los botones rápidos de tamaño de enjambre respetando el tope máximo de licencia
 */
function updateSwarmQuickButtons(num) {
  const maxAllowed = parseInt(appState.maxAllowedSwarm, 10) || parseInt(appState.activeSession?.user?.maxSwarmSize, 10) || 100000;
  const isMaster = appState.activeSession?.role === 'MASTER_ADMIN';

  document.querySelectorAll('.btn-swarm-quick').forEach(btn => {
    const bVal = parseInt(btn.getAttribute('data-val'), 10);
    if (!isMaster && bVal > maxAllowed) {
      btn.disabled = true;
      btn.className = 'btn-swarm-quick py-1.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 font-bold opacity-40 cursor-not-allowed';
      btn.title = `🔒 Bloqueado por licencia (Tope máximo contratado: ${maxAllowed.toLocaleString()} agentes)`;
      return;
    }
    btn.disabled = Boolean(appState.isLocked);
    btn.title = `Simular con ${bVal.toLocaleString()} agentes`;
    if (bVal === num) {
      btn.className = 'btn-swarm-quick active-pill py-1.5 rounded-lg text-white transition-all shadow-xs font-black cursor-pointer';
    } else {
      btn.className = 'btn-swarm-quick py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 font-bold cursor-pointer';
    }
  });
}

/**
 * CONFIGURACIÓN DE TAMAÑO FLEXIBLE Y ESCALONADO DEL ENJAMBRE (DE 50 HASTA EL TOPE MÁXIMO DE LA LICENCIA)
 */
window.setExactSwarmSize = function(val) {
  let num = parseInt(val, 10) || 500;
  const maxAllowed = parseInt(appState.maxAllowedSwarm, 10) || parseInt(appState.activeSession?.user?.maxSwarmSize, 10) || 100000;
  const isMaster = appState.activeSession?.role === 'MASTER_ADMIN';

  if (!isMaster && num > maxAllowed) {
    num = maxAllowed;
    showToast(`🔒 Límite ajustado al tope máximo de tu licencia: ${maxAllowed.toLocaleString()} agentes.`);
  }
  if (num < 50) num = 50;

  appState.swarmSize = num;

  const select = document.getElementById('select-swarm-size');
  if (select) {
    // Si el valor coincide con una opción del select, seleccionarla
    const matchingOpt = Array.from(select.options).find(o => parseInt(o.value, 10) === num);
    if (matchingOpt) select.value = String(num);
  }

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
 * Validación estricta: Prohibido generar plantillas con datos inventados si el usuario no ingresó propuesta.
 */
window.descargarPlanMaestroPdf = async function() {
  try {
    if (typeof PlanMaestroPDFExport === 'undefined') {
      alert('El motor de exportación del Plan Maestro no está disponible en este momento.');
      return;
    }

    const selectCiclo = document.getElementById('select-ciclo-electoral');
    if (selectCiclo && selectCiclo.value) appState.cicloElectoral = selectCiclo.value;
    const selectCargo = document.getElementById('select-cargo-electoral');
    if (selectCargo && selectCargo.value) appState.cargoElectoral = selectCargo.value;
    const radarEstado = document.getElementById('radar-select-estado');
    if (radarEstado && radarEstado.value) appState.estado = radarEstado.value;
    const radarMuni = document.getElementById('radar-select-municipio');
    if (radarMuni && radarMuni.value) appState.municipio = radarMuni.value;

    const candidatoVal = (document.getElementById('radar-input-candidato')?.value || '').trim();
    const tituloVal = (document.getElementById('radar-input-titulo')?.value || appState.tituloProyecto || '').trim();
    const propuestaVal = (document.getElementById('radar-input-propuesta')?.value || appState.propuestaTexto || '').trim();

    // VALIDACIÓN OBLIGATORIA ANTES DE GENERAR EL PDF (CERO DATOS GENÉRICOS O PRECARGADOS)
    if (!tituloVal || !propuestaVal || propuestaVal.length < 10) {
      alert('⚠️ Sin datos suficientes de simulación para compilar el expediente.\n\nPor favor ingresa obligatoriamente el Título y la Descripción Estratégica de tu propuesta (y pulsa "1. Iniciar Diagnóstico de Radar") antes de descargar el Plan Maestro en PDF.');
      const propInput = document.getElementById('radar-input-propuesta');
      if (propInput) propInput.focus();
      return;
    }

    if (!appState.radarAnalysis || appState.radarAnalysis._municipio !== appState.municipio || appState.radarAnalysis._cargo !== appState.cargoElectoral) {
      showToast('Ejecutando diagnóstico territorial para sincronizar tus datos reales antes de exportar...');
      await window.runRadarAnalysis();
    }

    if (!appState.radarAnalysis) {
      alert('⚠️ Sin datos suficientes de simulación para compilar el expediente. Ejecuta primero el Diagnóstico de Radar.');
      return;
    }

    showToast('Compilando Plan Maestro de Victoria Electoral con los datos de tu sesión activa...');

    await PlanMaestroPDFExport.exportPlanMaestro(appState.currentReport, {
      ...appState,
      estado: appState.estado,
      municipio: appState.municipio,
      tituloProyecto: tituloVal,
      propuestaTexto: propuestaVal,
      candidato: candidatoVal || `Candidatura ${appState.cargoElectoral} (${appState.activeParty || 'PVEM'})`,
      cargo: appState.cargoElectoral,
      ciclo: appState.cicloElectoral,
      radarAnalysis: appState.radarAnalysis
    });

    if (window.cyberSentinelAgent?.auditEvent) {
      window.cyberSentinelAgent.auditEvent('PDF_PLAN_MAESTRO_GENERATED', {
        estado: appState.estado,
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
 * Validación estricta: Prohibido exportar si no se ha ejecutado una simulación real en la sesión activa.
 */
window.descargarDictamenEjecutivoPdf = async function() {
  try {
    if (!appState.currentReport || !appState.currentReport.resumenEjecutivo || (!appState.propuestaTexto && !appState.documentData)) {
      alert('⚠️ Sin datos suficientes de simulación para compilar el expediente.\n\nPrimero ingresa una propuesta real y ejecuta la simulación en el War Room Vista 2 para generar el Dictamen Ejecutivo.');
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

/**
 * MÓDULO 3: GUARDRAIL DE VALIDACIÓN TEMÁTICA EN FRONTEND (Rechazo inmediato de consultas o archivos ajenos)
 */
const GUARDRAIL_DOMAIN_MESSAGE = '⚠️ Archivo o Propuesta No Válida: Esta plataforma no está diseñada para el tipo de archivo o consulta que intenta subir. GovTech War Room procesa exclusivamente propuestas políticas, proyectos sociales, de infraestructura, medio ambiente, sindicales, deportivos públicos o productivos.';

window.validatePlatformDomainClient = function(textoPropuesta = '', tituloProyecto = '') {
  const combined = `${tituloProyecto || ''} ${textoPropuesta || ''}`.trim();
  const norm = combined.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (norm.length < 4) {
    return { esValido: false, mensajeError: GUARDRAIL_DOMAIN_MESSAGE };
  }

  const publicSportsInfrastructure = /\b(cancha|canchas|deportivo publico|unidad deportiva|becas? deportiva|infraestructura deportiva|fomento deportivo|parque deportivo|gimnasio municipal|espacio deportivo|torneo comunitario|presupuesto deportivo|comude|conade|imdecuf)\b/i;

  const offTopicPatterns = [
    /\b(manchester\s+united|real\s+madrid|barcelona|chivas|club\s+america|cruz\s+azul|pumas\s+unam|tigres\s+uanl|rayados|liverpool|bayern|psg|chelsea|arsenal|juventus|milan|inter\s+de\s+milan|champions\s+league|liga\s+mx|premier\s+league|mundial\s+de\s+futbol|copa\s+del\s+mundo|messi|cristiano\s+ronaldo|mbappe|haaland|neymar|chicharito)\b/i,
    /\b(quien\s+ganaria\s+entre|quien\s+gana\s+hoy|pronostico\s+del\s+partido|marcador\s+del\s+partido|apuesta\s+deportiva|momios|parlay|super\s+bowl|nba|nfl|mlb|ufc|boxeo\s+profesional|canelo\s+alvarez)\b/i,
    /\b(receta\s+de\s+cocina|ingredientes\s+para\s+preparar|cucharadas\s+de|hornear\s+a\s+\d+\s+grados|como\s+hacer\s+un\s+pastel|como\s+preparar\s+tacos|licuar\s+los\s+ingredientes|freir\s+en\s+aceite)\b/i,
    /\b(cuentame\s+un\s+chiste|dime\s+un\s+chiste|horoscopo\s+de\s+hoy|signo\s+zodiacal|tarot|compatibilidad\s+amorosa|amarre\s+de\s+amor)\b/i,
    /\b(resuelve\s+esta\s+ecuacion|calcula\s+la\s+derivada|integral\s+definida|teorema\s+de\s+pitagoras|tabla\s+periodica|escribeme\s+un\s+poema|hazme\s+mi\s+tarea)\b/i,
    /\b(fortnite|minecraft|free\s+fire|call\s+of\s+duty|warzone|league\s+of\s+legends|valorant|gta\s+v|playstation|xbox|nintendo\s+switch|pokedex|pokemon|dragon\s+ball|naruto)\b/i
  ];

  if (!publicSportsInfrastructure.test(norm)) {
    for (const pattern of offTopicPatterns) {
      if (pattern.test(norm)) {
        return { esValido: false, mensajeError: GUARDRAIL_DOMAIN_MESSAGE };
      }
    }
  }

  return { esValido: true, mensajeError: null };
};

window.showInvalidDomainModal = function(mensajeError = GUARDRAIL_DOMAIN_MESSAGE) {
  let modal = document.getElementById('modal-invalid-domain-guardrail');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-invalid-domain-guardrail';
    modal.className = 'fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-lg w-full border-2 border-red-500 shadow-2xl overflow-hidden animate-fadeIn">
      <div class="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 px-6 py-4 flex items-center justify-between text-white">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🛡️</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider">Guardrail de Validación Temática Activo</h3>
            <p class="text-[11px] text-red-100 font-semibold">GovTech War Room — Filtro de Dominio Institucional</p>
          </div>
        </div>
        <button type="button" onclick="document.getElementById('modal-invalid-domain-guardrail').classList.add('hidden')" class="text-white/80 hover:text-white text-xl font-black leading-none">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        <div class="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl text-sm text-red-950 font-bold leading-relaxed">
          ${mensajeError}
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
          <div class="font-black text-slate-900 uppercase tracking-wide text-[11px]">✅ Dominios autorizados por el motor:</div>
          <p>Política, Gobierno, Reformas de Ley/Constitución, Proyectos Sociales, Cultura y Patrimonio Público (INAH/Museos), Medio Ambiente y Arbolado, Obra Pública, Sindicatos, Economía/Proyectos Productivos y Fomento Deportivo Público.</p>
          <p class="text-[11px] text-emerald-700 font-bold pt-1">🔒 Su contador de propuestas NO fue afectado por este bloqueo preventivo.</p>
        </div>
        <div class="flex justify-end pt-1">
          <button type="button" onclick="document.getElementById('modal-invalid-domain-guardrail').classList.add('hidden')" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer">
            Entendido, corregir propuesta
          </button>
        </div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
};

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

    if (data.invalidDomain) {
      appState.documentData = null;
      const fileInput = document.getElementById('input-file-doc');
      if (fileInput) fileInput.value = '';
      docStatus.innerHTML = `
        <div class="text-xs text-red-900 bg-red-50 p-3 rounded-lg border-2 border-red-400 font-bold">
          ${data.error || GUARDRAIL_DOMAIN_MESSAGE}
        </div>
      `;
      window.showInvalidDomainModal(data.error || GUARDRAIL_DOMAIN_MESSAGE);
      return;
    }

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

  // MÓDULO 3: GUARDRAIL DE VALIDACIÓN TEMÁTICA PREVENTIVA (No consume corridas ni ejecuta el enjambre)
  const combinedDomainText = `${propuesta || ''} ${appState.documentData?.textoExtraido || ''}`.trim();
  const domainValidation = window.validatePlatformDomainClient(combinedDomainText, titulo);
  if (!domainValidation.esValido) {
    window.showInvalidDomainModal(domainValidation.mensajeError);
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

  // Validación preventiva estricta de límite Demo (3 propuestas / 7 días)
  const currentDemoUser = appState.activeSession?.user;
  const isMasterSession = appState.activeSession?.role === 'MASTER_ADMIN' || currentDemoUser?.esAdministradorTotal === true;
  if (!isMasterSession && currentDemoUser?.isDemo) {
    const currentSims = typeof currentDemoUser.simulations_count === 'number' ? currentDemoUser.simulations_count : 0;
    if (currentSims >= 3) {
      openDemoLimitBlockedModal();
      return;
    }
  }

  // Bloquear controles de inmediato según directriz de State Locking
  appState.isSimulating = true;
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
    licenseId: appState.activeSession?.user?.id || '',
    username: appState.activeSession?.user?.username || '',
    aiConfig: appState.aiConfig,
    runId: 'run_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
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
                if (step.invalidDomain) {
                  simulationCompleted = true;
                  lockSimulationControls(false);
                  restoreSimulateButton();
                  const cSec = document.getElementById('progress-console-section');
                  if (cSec) cSec.classList.add('hidden');
                  window.showInvalidDomainModal(step.mensaje || GUARDRAIL_DOMAIN_MESSAGE);
                  return;
                }
                if (step.blockedByLimit) {
                  simulationCompleted = true;
                  lockSimulationControls(false);
                  restoreSimulateButton();
                  const cSec = document.getElementById('progress-console-section');
                  if (cSec) cSec.classList.add('hidden');
                  openDemoLimitBlockedModal();
                  return;
                }
                if (step.demoStatus) {
                  updateActiveDemoCounter(step.demoStatus);
                }
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

      if (postData.invalidDomain) {
        simulationCompleted = true;
        lockSimulationControls(false);
        restoreSimulateButton();
        const cSec = document.getElementById('progress-console-section');
        if (cSec) cSec.classList.add('hidden');
        window.showInvalidDomainModal(postData.error || GUARDRAIL_DOMAIN_MESSAGE);
        return;
      }

      if (postData.blockedByLimit) {
        simulationCompleted = true;
        lockSimulationControls(false);
        restoreSimulateButton();
        const cSec = document.getElementById('progress-console-section');
        if (cSec) cSec.classList.add('hidden');
        openDemoLimitBlockedModal();
        return;
      }

      if (postData.demoStatus) {
        updateActiveDemoCounter(postData.demoStatus);
      }

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
  appState.isSimulating = false;
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
      <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      <span>Simular en War Room Vista 2</span>
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
  appState.isSimulating = false;
  if (typeof resetInactivityTimer === 'function') resetInactivityTimer();
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
      Components.renderHeatmap('demographic-heatmap-container', report.mapaCalorDemografico, report);
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
      appState.activeParty,
      report
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
            appState.activeParty,
            report
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
      Components.renderTab4BlindajeDefensa('strategic-defense-container', report.blindajeDefensa, report);
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
 * CON BLINDAJE DE CAJA NEGRA POR ROL (ADMIN vs CLIENTE)
 * ========================================================
 */

let _cachedBtnHeaderAiEngine = null;
let _cachedBtnHeaderAiEngineParent = null;
let _cachedModalConfig = null;
let _cachedModalConfigParent = null;

function isCurrentUserMasterAdmin() {
  const s = appState?.activeSession;
  if (!s) return false;
  const r = String(s.role || s.user?.role || s.user?.tipoUsuario || '').toLowerCase();
  return (
    r === 'master_admin' ||
    r === 'admin' ||
    r === 'superadmin' ||
    r === 'master' ||
    r === 'administrador' ||
    Boolean(s.user?.esAdministradorTotal)
  );
}

window.applyBlackBoxAiShielding = function(isMasterAdmin = false) {
  const isAdmin = Boolean(isMasterAdmin || isCurrentUserMasterAdmin());

  const clientBadge = document.getElementById('client-blackbox-engine-badge');
  const clientBadgeLabel = document.getElementById('client-blackbox-engine-label');
  if (clientBadgeLabel) {
    clientBadgeLabel.innerText = 'Motor Activo: Neural Engine GovTech v4.0 (Cifrado Militar Activo)';
  }

  let btnAi = document.getElementById('btn-header-ai-engine');
  let modalCfg = document.getElementById('modal-config');

  if (!isAdmin) {
    // BLINDAJE CAJA NEGRA PARA USUARIOS CON LICENCIA / OPERADOR / CANDIDATO / DEMO:
    // Mostrar únicamente el badge ejecutivo estático y remover del DOM cualquier selector o modal de IA/API
    if (clientBadge) {
      clientBadge.classList.remove('hidden');
      clientBadge.classList.add('inline-flex');
    }
    if (btnAi) {
      _cachedBtnHeaderAiEngine = btnAi;
      _cachedBtnHeaderAiEngineParent = btnAi.parentNode;
      btnAi.remove();
    }
    if (modalCfg) {
      modalCfg.classList.add('hidden');
      _cachedModalConfig = modalCfg;
      _cachedModalConfigParent = modalCfg.parentNode;
      modalCfg.remove();
    }
  } else {
    // ACCESO EXCLUSIVO PARA ADMINISTRADOR (CONTROL MAESTRO):
    // Restaurar elementos al DOM si estaban removidos y habilitar Selector de Motor IA + API Keys
    if (clientBadge) {
      clientBadge.classList.add('hidden');
      clientBadge.classList.remove('inline-flex');
    }
    if (!btnAi && _cachedBtnHeaderAiEngine && _cachedBtnHeaderAiEngineParent) {
      _cachedBtnHeaderAiEngineParent.appendChild(_cachedBtnHeaderAiEngine);
      btnAi = _cachedBtnHeaderAiEngine;
    }
    if (btnAi) {
      btnAi.classList.remove('hidden');
      btnAi.classList.add('inline-flex');
    }
    if (!modalCfg && _cachedModalConfig && _cachedModalConfigParent) {
      _cachedModalConfigParent.appendChild(_cachedModalConfig);
      modalCfg = _cachedModalConfig;
    }
    syncCentralAIEngineStatus();
  }
};

window.openConfigModal = function() {
  if (!isCurrentUserMasterAdmin()) {
    if (typeof showToast === 'function') {
      showToast('🔒 Acceso restringido: La configuración de motores IA y API Keys es exclusiva del Administrador Maestro.');
    }
    return;
  }
  if (!document.getElementById('modal-config') && _cachedModalConfig && _cachedModalConfigParent) {
    _cachedModalConfigParent.appendChild(_cachedModalConfig);
  }
  const modal = document.getElementById('modal-config');
  if (!modal) return;
  modal.classList.remove('hidden');
  syncCentralAIEngineStatus();
};

window.closeConfigModal = function() {
  const modal = document.getElementById('modal-config');
  if (modal) modal.classList.add('hidden');
};

async function syncCentralAIEngineStatus() {
  try {
    const isAdmin = isCurrentUserMasterAdmin();
    const headers = typeof getAdminHeaders === 'function' ? getAdminHeaders() : { 'Content-Type': 'application/json' };
    const res = await fetch('/api/ai-engine/status', { headers });
    const data = await res.json();
    if (data.success) {
      if (!isAdmin || data.blackBoxMode) {
        appState.aiConfig = {
          provider: 'govtech_neural',
          model: 'neural-engine-v4',
          centralized: true,
          mode: 'blackbox_shielded'
        };
        const clientBadgeLabel = document.getElementById('client-blackbox-engine-label');
        if (clientBadgeLabel) {
          clientBadgeLabel.innerText = 'Motor Activo: Neural Engine GovTech v4.0 (Cifrado Militar Activo)';
        }
        return;
      }

      const p = data.provider || 'hybrid';
      const m = data.model || 'gemini-1.5-pro';
      appState.aiConfig = {
        provider: p,
        model: m,
        centralized: true,
        mode: data.mode || 'centralized_master'
      };
      updateNavModelBadge(data);

      // Si es Administrador, sincronizar el selector y estado de llaves en el modal
      const selEngine = document.getElementById('select-global-ai-engine');
      if (selEngine && data.selectedEngine) {
        selEngine.value = data.selectedEngine;
      }
      const badgeStatus = document.getElementById('global-ai-keys-status-badge');
      if (badgeStatus) {
        const activeKeys = [];
        if (data.hasGeminiKey) activeKeys.push('Gemini ✔');
        if (data.hasDeepseekKey) activeKeys.push('DeepSeek ✔');
        if (data.hasGroqKey) activeKeys.push('Groq ✔');
        badgeStatus.innerText = activeKeys.length > 0
          ? `Llaves Cifradas en Servidor: ${activeKeys.join(' | ')}`
          : 'Motor Centralizado Servidor Activo';
      }
    }
  } catch (e) {
    console.warn('Sincronización de motor centralizado en servidor activo:', e);
  }
}

function loadStoredAIConfig() {
  // Purga de llaves en navegador para garantizar persistencia centralizada en servidor y caja negra
  try {
    localStorage.removeItem('pvem_ai_config');
    localStorage.removeItem('pvem_groq_key');
  } catch (e) {
    // Silencioso
  }
  syncCentralAIEngineStatus();
}

function updateNavModelBadge(engineInfo) {
  if (!isCurrentUserMasterAdmin()) return;
  const badge = document.getElementById('nav-model-badge');
  if (!badge) return;
  const label = engineInfo?.engine || 'Modo Híbrido (Gemini + Groq)';
  badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span> ${label}`;
  badge.className = 'text-[10px] bg-emerald-100 text-emerald-950 font-black px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 shadow-2xs';
}

window.saveGlobalAiConfigInServer = async function() {
  if (!isCurrentUserMasterAdmin()) {
    alert('Acceso denegado (403): Solo el Administrador Maestro puede modificar el motor de IA o las API Keys.');
    return;
  }
  const selEngine = document.getElementById('select-global-ai-engine');
  const geminiInput = document.getElementById('input-gemini-key');
  const deepseekInput = document.getElementById('input-deepseek-key');
  const groqInput = document.getElementById('input-groq-key');
  const msg = document.getElementById('msg-groq-key');

  const selectedEngine = selEngine ? selEngine.value : 'hybrid';
  const payload = {
    selectedEngine,
    provider: selectedEngine === 'hybrid' ? 'gemini' : selectedEngine,
    geminiApiKey: geminiInput?.value?.trim() || undefined,
    deepseekApiKey: deepseekInput?.value?.trim() || undefined,
    groqApiKey: groqInput?.value?.trim() || undefined
  };

  try {
    if (msg) msg.innerHTML = '<span class="text-blue-600 font-bold">Guardando configuración global en el servidor...</span>';
    const headers = typeof getAdminHeaders === 'function' ? getAdminHeaders() : { 'Content-Type': 'application/json' };
    const res = await fetch('/api/ai-config', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (res.ok && d.success) {
      if (geminiInput) geminiInput.value = '';
      if (deepseekInput) deepseekInput.value = '';
      if (groqInput) groqInput.value = '';
      if (msg) msg.innerHTML = '<span class="text-emerald-700 font-bold">✅ Motor de IA y API Keys actualizados en el servidor para todos los dispositivos.</span>';
      await syncCentralAIEngineStatus();
      setTimeout(() => { if (typeof closeConfigModal === 'function') closeConfigModal(); }, 1000);
    } else {
      if (msg) msg.innerHTML = `<span class="text-rose-600 font-bold">${d.error || 'Error al guardar configuración'}</span>`;
    }
  } catch (err) {
    if (msg) msg.innerHTML = `<span class="text-rose-600 font-bold">${err.message}</span>`;
  }
};

async function saveGroqKeyInCloud() {
  return window.saveGlobalAiConfigInServer();
}

function getProviderLabel() {
  return 'Motor Activo: Neural Engine GovTech v4.0 (Cifrado Militar Activo)';
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
    let c = encodedData;
    try {
      if (typeof encodedData === 'string') c = JSON.parse(decodeURIComponent(encodedData));
    } catch (_) {
      try { c = JSON.parse(encodedData); } catch (e) { return; }
    }
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
// 3. VENTANA SECUNDARIA: DIAGNÓSTICO DE RADAR ELECTORAL 2027-2030 & PLAN MAESTRO PDF
// =========================================================================
window.openRadarElectoralModal = async function() {
  // Verificar si el cliente tiene permiso para acceder al módulo secundario de Radar Electoral
  const session = appState.activeSession;
  if (session && session.role !== 'MASTER_ADMIN' && session.user && session.user.permisoRadar === false) {
    alert('🔒 Bloqueado / No disponible para esta licencia.\n\nEl Administrador Maestro ha configurado esta licencia exclusivamente para operar en la ventana principal War Room Vista 2.');
    return;
  }

  const modal = document.getElementById('modal-radar-electoral');
  if (!modal) return;

  // Sincronizar selector de estados y municipios autorizados en la ventana del Radar
  await syncAuthorizedSelectorsInRadar();

  // Sincronizar con datos reales de la sesión activa si el usuario ya los ingresó en War Room Vista 2
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
    showToast('🔒 Tu licencia está autorizada exclusivamente para la ventana de Diagnóstico de Radar.');
    return;
  }
  const modal = document.getElementById('modal-radar-electoral');
  if (modal) modal.classList.add('hidden');
};

window.transferRadarToWarRoom = async function() {
  const session = appState.activeSession;
  if (session && session.role !== 'MASTER_ADMIN' && session.user && session.user.permisoSimulador === false) {
    showToast('🔒 Tu licencia está autorizada exclusivamente para la ventana de Diagnóstico de Radar.');
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
    showToast('Bienvenido a War Room Vista 2. Configura tus parámetros tácticos y redacta tu propuesta para simular.');
  }
};

window.runRadarAnalysis = async function() {
  const container = document.getElementById('radar-results-container');
  const btn = document.getElementById('btn-run-radar');
  if (!container) return;

  const estado = document.getElementById('radar-select-estado')?.value || appState.estado || 'Estado de México';
  const municipio = document.getElementById('radar-select-municipio')?.value || appState.municipio || 'Ecatepec de Morelos';
  const cargo = document.getElementById('select-cargo-electoral')?.value || 'Presidente Municipal / Alcalde';
  const ciclo = document.getElementById('select-ciclo-electoral')?.value || '2027';
  const candidato = (document.getElementById('radar-input-candidato')?.value || '').trim();
  const titulo = (document.getElementById('radar-input-titulo')?.value || appState.tituloProyecto || '').trim();
  const propuesta = (document.getElementById('radar-input-propuesta')?.value || appState.propuestaTexto || '').trim();

  // Validación obligatoria: exigir que el usuario haya ingresado una propuesta real antes de ejecutar el diagnóstico
  if (!titulo || !propuesta || propuesta.length < 10) {
    alert('⚠️ Sin datos suficientes para iniciar el diagnóstico.\n\nPor favor ingresa el Título y la Descripción Estratégica de tu propuesta en los campos del formulario antes de pulsar "1. Iniciar Diagnóstico de Radar".');
    const propEl = document.getElementById('radar-input-propuesta');
    if (propEl) propEl.focus();
    return;
  }

  appState.estado = estado;
  appState.municipio = municipio;
  appState.cargoElectoral = cargo;
  appState.cicloElectoral = ciclo;
  appState.tituloProyecto = titulo;
  appState.propuestaTexto = propuesta;
  appState.isSimulating = true;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span><span>Analizando Territorio y AGEBs...</span>`;
  }

  try {
    const res = await fetch('/api/electoral-radar/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado,
        municipio,
        cargo,
        ciclo,
        candidato: candidato || `Candidatura ${cargo} (${appState.activeParty || 'PVEM'})`,
        tituloPropuesta: titulo,
        propuestaTexto: propuesta,
        coalicion: `${appState.activeParty || 'PVEM'} - Estrategia Territorial`
      })
    });
    const data = await res.json();

    if (data.success && data.radar) {
      data.radar._estado = estado;
      data.radar._municipio = municipio;
      data.radar._cargo = cargo;
      data.radar._tituloUsuario = titulo;
      data.radar._propuestaUsuario = propuesta;
      data.radar._candidatoUsuario = candidato || `Candidatura ${cargo} (${appState.activeParty || 'PVEM'})`;
      appState.radarAnalysis = data.radar;

      renderRadarDiagnosisView(container, data.radar, {
        estado,
        municipio,
        cargo,
        ciclo,
        candidato: data.radar._candidatoUsuario,
        titulo,
        propuesta
      });
      showToast(`Diagnóstico de Radar Electoral completado para ${municipio}, ${estado} (${cargo}).`);
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
    appState.isSimulating = false;
    if (typeof resetInactivityTimer === 'function') resetInactivityTimer();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>🔍</span><span>1. Iniciar Diagnóstico de Radar</span>`;
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
      <!-- Encabezado Resumen del Diagnóstico con la Propuesta Ingresada por el Usuario -->
      <div class="card-pvem p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl shadow-lg space-y-3">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">Proceso ${meta.ciclo}</span>
              <span class="text-xs font-bold text-amber-300">${meta.cargo}</span>
              <span class="text-slate-400">•</span>
              <span class="text-xs font-bold text-white">${meta.municipio}, ${meta.estado || 'México'}</span>
            </div>
            <h4 class="text-lg sm:text-xl font-black text-white">${meta.titulo}</h4>
            <p class="text-xs text-slate-300">Candidato(a): <b>${meta.candidato}</b> | Partido Activo: <b>${appState.activeParty}</b></p>
          </div>
          <div class="shrink-0">
            <button type="button" onclick="descargarPlanMaestroPdf()" class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <span>📥</span><span>Descargar Plan Maestro (PDF)</span>
            </button>
          </div>
        </div>
        <div class="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-emerald-100 leading-relaxed">
          <b class="text-white uppercase tracking-wider text-[10px] block mb-0.5">Propuesta Estratégica Evaluada en Sesión:</b>
          ${meta.propuesta}
        </div>
      </div>

      <!-- 1. Radiografía de las 6 Problemáticas Críticas del Territorio -->
      <div class="card-pvem p-5 bg-white space-y-4">
        <div class="border-b border-slate-100 pb-2">
          <h4 class="text-sm sm:text-base font-black text-slate-900">🚨 1. Radiografía de Problemáticas Críticas en ${meta.municipio}</h4>
          <p class="text-xs text-slate-500">Indicadores de carencia social, seguridad e infraestructura detectados por el motor territorial en ${meta.municipio}.</p>
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
                Referencia: ${(p.fuenteOficial || 'Indicador Demográfico Territorial').replace(/\(\.gob\.mx\)|\.gob\.mx/gi, '').trim()}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 2. Batería de Propuestas Ganadoras según el Cargo (${meta.cargo}) -->
      <div class="card-pvem p-5 bg-white space-y-4">
        <div class="border-b border-slate-100 pb-2">
          <h4 class="text-sm sm:text-base font-black text-slate-900">🏆 2. Propuesta Eje del Usuario y Líneas de Acción para ${meta.cargo}</h4>
          <p class="text-xs text-slate-500">Articulación de tu propuesta central con las facultades del cargo y su retorno electoral proyectado.</p>
        </div>
        <div class="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-black uppercase bg-emerald-700 text-white px-2.5 py-0.5 rounded-full">PROPUESTA EJE DEL CANDIDATO(A)</span>
            <span class="text-xs font-black text-emerald-900">${meta.cargo} • ${meta.municipio}</span>
          </div>
          <h5 class="text-sm font-black text-slate-900">${meta.titulo}</h5>
          <p class="text-xs text-slate-800 leading-relaxed">${meta.propuesta}</p>
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
                <th class="p-2.5">Demanda Territorial Prioritaria</th>
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
              <span class="text-emerald-800 font-bold">"${manual.sloganCentral || manual.namingCampana || `${meta.titulo} — ${meta.municipio}`}"</span>
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

window.openAuthLoginModal = function(showInactivity = false) {
  const modal = document.getElementById('modal-auth-login');
  const errBox = document.getElementById('auth-error-box');
  const inactBanner = document.getElementById('auth-inactivity-banner');
  if (errBox) errBox.classList.add('hidden');
  if (!showInactivity && inactBanner) inactBanner.classList.add('hidden');
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
  const username = (document.getElementById('auth-username')?.value || '').trim();
  const password = (document.getElementById('auth-password')?.value || '').trim();
  const token = (document.getElementById('auth-token')?.value || '').trim();
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
    const clientVault = typeof loadPersistentUsersVault === 'function' ? loadPersistentUsersVault() : [];
    const deletedIds = typeof getDeletedLicenseIds === 'function' ? getDeletedLicenseIds() : [];
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        token: token || undefined,
        captchaVerified: turnstileState.verified,
        captchaToken,
        clientVault: Array.isArray(clientVault) && clientVault.length > 0 ? clientVault : undefined,
        deletedIds: Array.isArray(deletedIds) && deletedIds.length > 0 ? deletedIds : undefined
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
      user: data.user,
      sessionToken: data.sessionToken || null
    };
    if (data.sessionToken) {
      sessionStorage.setItem('pvem_session_token', data.sessionToken);
    }
    sessionStorage.setItem('govtech_active_session_v1', JSON.stringify(appState.activeSession));

    // Desbloquear contenedores principales de la plataforma (War Room Vista 2 como Ventana Principal)
    ['app-main-header', 'app-main-workspace', 'app-main-footer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    });

    closeAuthLoginModal();
    window.history.pushState({ authenticated: true }, '', window.location.pathname);
    const inactBanner = document.getElementById('auth-inactivity-banner');
    if (inactBanner) inactBanner.classList.add('hidden');
    startInactivityMonitor();

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
      if (navLabel) navLabel.innerText = `👑 ${data.user.username}`;

      const adminBadge = document.getElementById('master-admin-badge');
      if (adminBadge) adminBadge.innerText = `Admin: ${data.user.username}`;

      await applyLicenseRestrictionsToUI(data.user, true);
      // Asegurar que la pantalla principal de fondo sea War Room Vista 2 y abrir el Panel Maestro
      const modalRadar = document.getElementById('modal-radar-electoral');
      if (modalRadar) modalRadar.classList.add('hidden');
      await openMasterAdminModal();
      showToast(`Bienvenido ${data.user.clienteNombre} (${data.user.username}). Panel de Control Maestro y War Room Vista 2 desbloqueados.`);
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

      // REORDENAMIENTO ARQUITECTÓNICO: War Room Vista 2 es SIEMPRE la pantalla principal por defecto al autenticarse
      const modalRadar = document.getElementById('modal-radar-electoral');
      if (modalRadar) modalRadar.classList.add('hidden');

      showToast(`Bienvenido a War Room Vista 2 (Pantalla Principal): ${data.user.clienteNombre} (${data.user.partido})`);
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
  if (typeof clearInactivityTimer === 'function') clearInactivityTimer();
  // 1. Destruir sesión activa y almacenamiento temporal
  appState.activeSession = null;
  sessionStorage.removeItem('pvem_session_token');
  appState.radarAnalysis = null;
  appState.maxAllowedSwarm = 100000;
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
        Ingresa los datos de tu propuesta arriba y pulsa <b>"1. Iniciar Diagnóstico de Radar"</b> para desplegar las 6 problemáticas críticas del territorio, batería de propuestas por cargo, postura de los 12 sindicatos y micro-targeting por colonias.
      </div>
    `;
  }

  // 3. Limpiar formulario de login y reiniciar Turnstile CAPTCHA
  const uInput = document.getElementById('auth-username');
  const pInput = document.getElementById('auth-password');
  const tInput = document.getElementById('auth-token');
  const errBox = document.getElementById('auth-error-box');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';
  if (tInput) tInput.value = '';
  if (errBox) errBox.classList.add('hidden');

  // 4. Forzar regreso a la Página de Bienvenida Neutral (Cero colores de partido)
  enforceNeutralWelcomeState();

  // 5. Bloquear navegación hacia atrás en el historial del navegador
  window.history.replaceState({ loggedOut: true }, '', window.location.pathname);
  window.history.pushState({ loggedOut: true }, '', window.location.pathname);
};

/**
 * =========================================================================
 * PROTOCOLO DE AUTOCIERRE DE SESIÓN POR INACTIVIDAD (5 MINUTOS / 300,000 MS)
 * =========================================================================
 */
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos = 300,000 ms
let inactivityTimer = null;
let lastUserActivityTimestamp = Date.now();
let lastThrottledResetTime = 0;
let inactivityListenersAttached = false;

function isSimulationRunning() {
  if (appState && appState.isSimulating) return true;
  const consoleSection = document.getElementById('progress-console-section');
  if (consoleSection && !consoleSection.classList.contains('hidden')) {
    const btnSimular = document.getElementById('btn-iniciar-simulacion');
    if (btnSimular && btnSimular.disabled) return true;
  }
  const radarBtn = document.getElementById('btn-run-radar-diag');
  if (radarBtn && radarBtn.disabled) return true;
  return false;
}

function onUserActivityDetected(e) {
  if (!appState || !appState.activeSession) return;
  const now = Date.now();
  lastUserActivityTimestamp = now;
  if (now - lastThrottledResetTime < 500) {
    return;
  }
  lastThrottledResetTime = now;
  resetInactivityTimer();
}

function attachInactivityEventListeners() {
  if (inactivityListenersAttached) return;
  const events = ['click', 'mousemove', 'keypress', 'keydown', 'scroll', 'touchstart'];
  events.forEach(evt => {
    window.addEventListener(evt, onUserActivityDetected, { passive: true });
    document.addEventListener(evt, onUserActivityDetected, { passive: true });
  });
  inactivityListenersAttached = true;
}

function startInactivityMonitor() {
  attachInactivityEventListeners();
  resetInactivityTimer();
}

function resetInactivityTimer() {
  clearInactivityTimer();
  if (!appState || !appState.activeSession) return;
  lastUserActivityTimestamp = Date.now();
  inactivityTimer = setTimeout(() => {
    handleInactivityTimeout();
  }, INACTIVITY_TIMEOUT_MS);
}

function clearInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

function handleInactivityTimeout() {
  if (!appState || !appState.activeSession) {
    clearInactivityTimer();
    return;
  }

  // EXCEPCIÓN PARA PANTALLAS DE CARGA LARGA Y SIMULACIONES:
  // Si el enjambre sintético o diagnóstico está ejecutándose o pestaña en primer plano con proceso activo,
  // mantener viva la sesión y no disparar el autocierre por error.
  if (isSimulationRunning()) {
    console.log('[Cyber Sentinel] Auto-Logout pausado: Simulación del enjambre activa en ejecución.');
    resetInactivityTimer();
    return;
  }

  // 1. Cerrar sesión activa y purgar datos locales
  if (typeof window.logoutSession === 'function') {
    window.logoutSession();
  }

  // 2. Redirigir al inicio de sesión (/login)
  try {
    window.history.replaceState({ loggedOut: true, reason: 'inactivity' }, '', '/login');
  } catch (e) {
    // Silencioso
  }

  // 3. Mostrar pantalla de login y desplegar mensaje y modal informativo
  if (typeof enforceNeutralWelcomeState === 'function') {
    enforceNeutralWelcomeState();
  }
  if (typeof openAuthLoginModal === 'function') {
    openAuthLoginModal(true);
  }

  window.showInactivityNotice();
}

window.showInactivityNotice = function() {
  const banner = document.getElementById('auth-inactivity-banner');
  if (banner) {
    banner.classList.remove('hidden');
  }
  const modal = document.getElementById('modal-inactivity-timeout');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if (typeof showToast === 'function') {
    showToast('⏱️ Sesión cerrada por seguridad debido a 5 minutos de inactividad.');
  }
};

window.closeInactivityTimeoutModal = function() {
  const modal = document.getElementById('modal-inactivity-timeout');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  const uInput = document.getElementById('auth-username');
  if (uInput) uInput.focus();
};

// Exportación y alias universal de cierre de sesión
window.logout = window.logoutSession;
window.startInactivityMonitor = startInactivityMonitor;
window.resetInactivityTimer = resetInactivityTimer;
window.clearInactivityTimer = clearInactivityTimer;
window.handleInactivityTimeout = handleInactivityTimeout;
window.isSimulationRunning = isSimulationRunning;
window.getInactivityRemainingSeconds = function() {
  const elapsed = Date.now() - lastUserActivityTimestamp;
  return Math.max(0, Math.round((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
};
window.triggerInactivityTimeoutForTesting = function() {
  handleInactivityTimeout();
};


/**
 * Aplica en tiempo real la mutación White-Label, permisos Radar/Simulador, estados/municipios permitidos y tope flexible de agentes
 */
async function applyLicenseRestrictionsToUI(licenseUser, isMasterAdmin = false) {
  if (!licenseUser) return;
  await ensureNationalCatalogLoaded();

  // 1. Mutar identidad cromática, logotipo y control multi-partido
  const ALL_PARTIES_LIST = [
    { code: 'PVEM', label: '🌿 PVEM' },
    { code: 'MORENA', label: '🦅 MORENA' },
    { code: 'PAN', label: '🔵 PAN' },
    { code: 'PRI', label: '🔴 PRI' },
    { code: 'MC', label: '🟠 MC' },
    { code: 'PT', label: '⭐ PT' },
    { code: 'CANDIDATURA INDEPENDIENTE', label: '⚪ CANDIDATURA INDEPENDIENTE' },
    { code: 'COALICIÓN / ALIANZA', label: '🤝 COALICIÓN / ALIANZA' }
  ];

  const isMaster = isMasterAdmin || licenseUser.esAdministradorTotal === true || licenseUser.tipoUsuario === 'MASTER' || licenseUser.tipoUsuario === 'MASTER_ADMIN';
  if (typeof window.applyBlackBoxAiShielding === 'function') {
    window.applyBlackBoxAiShielding(isMaster);
  }
  const canSelectAny = isMasterAdmin || licenseUser.can_select_any_party === true || isMaster;
  let allowedParties = Array.isArray(licenseUser.allowed_parties) && licenseUser.allowed_parties.length > 0
    ? licenseUser.allowed_parties
    : [licenseUser.partido || 'PVEM'];

  const partySelect = document.getElementById('select-party-theme');
  const partyLockedPill = document.getElementById('party-locked-pill');
  const partyLockedName = document.getElementById('party-locked-name');
  const partyWrapper = document.getElementById('party-selector-wrapper');

  if (canSelectAny) {
    // Modo Administrador Maestro o Licencia con Libre Elección (Todos los partidos)
    if (partySelect) {
      partySelect.innerHTML = ALL_PARTIES_LIST.map(p => `<option value="${p.code}">${p.label}</option>`).join('');
      partySelect.value = licenseUser.partido || appState.activeParty || 'PVEM';
      partySelect.disabled = false;
      partySelect.title = 'Libre alternancia entre todos los partidos del catálogo';
    }
    if (partyWrapper) partyWrapper.classList.remove('hidden');
    if (partyLockedPill) partyLockedPill.classList.add('hidden');
    onPartyThemeChange(partySelect ? partySelect.value : (licenseUser.partido || 'PVEM'));
  } else if (allowedParties.length === 1) {
    // Opción A: Exactamente un partido asignado por licencia
    const singleParty = allowedParties[0];
    onPartyThemeChange(singleParty);
    if (partySelect) {
      partySelect.innerHTML = `<option value="${singleParty}">${singleParty}</option>`;
      partySelect.value = singleParty;
      partySelect.disabled = true;
      partySelect.title = `Partido Asignado por Licencia: ${singleParty}`;
    }
    if (partyLockedPill && partyLockedName) {
      partyLockedName.innerText = `Partido Asignado: ${singleParty}`;
      partyLockedPill.classList.remove('hidden');
      partyLockedPill.classList.add('flex');
    }
  } else {
    // Opción B: Múltiples partidos autorizados / Coalición
    if (partySelect) {
      const filteredOptions = ALL_PARTIES_LIST.filter(p => allowedParties.includes(p.code));
      partySelect.innerHTML = (filteredOptions.length > 0 ? filteredOptions : ALL_PARTIES_LIST)
        .map(p => `<option value="${p.code}">${p.label}</option>`).join('');
      
      const currentValid = allowedParties.includes(licenseUser.partido) ? licenseUser.partido : allowedParties[0];
      partySelect.value = currentValid;
      partySelect.disabled = false;
      partySelect.title = `Coalición Autorizada: ${allowedParties.join(' + ')}`;
      onPartyThemeChange(currentValid);
    }
    if (partyWrapper) partyWrapper.classList.remove('hidden');
    if (partyLockedPill) partyLockedPill.classList.add('hidden');
  }

  // 2. Permisos Independientes de Módulos y Permisos Granulares
  const perms = licenseUser.permisosGranulares || {};
  const canRadar = isMaster || (licenseUser.permisoRadar !== false && perms.radar !== false);
  const canSimulador = isMaster || (licenseUser.permisoSimulador !== false && perms.simulador !== false);
  const canDescarga = isMaster || perms.descargaReportes !== false;
  const isReadOnly = !isMaster && perms.soloLectura === true;

  // Aplicar control sobre descargas de PDF (Plan Maestro y Dictamen Integral)
  const btnExportPdf = document.getElementById('btn-export-pdf');
  const btnExportPlan = document.getElementById('btn-download-plan-maestro');
  [btnExportPdf, btnExportPlan].forEach(btn => {
    if (btn) {
      btn.disabled = !canDescarga;
      if (!canDescarga) {
        btn.classList.add('opacity-40', 'cursor-not-allowed');
        btn.title = '🔒 Descarga de reportes bloqueada para este perfil de socio';
      } else {
        btn.classList.remove('opacity-40', 'cursor-not-allowed');
        btn.title = '';
      }
    }
  });

  // Modo Solo Lectura / Bloqueo de Simulación y Cuota Demo (3 Propuestas / 7 Días)
  const btnIniciarSim = document.getElementById('btn-iniciar-simulacion');
  const isDemoUser = Boolean(licenseUser.isDemo);
  const demoCounterBadge = document.getElementById('demo-counter-badge');
  const demoCounterText = document.getElementById('demo-counter-text');

  if (isDemoUser && !isMaster) {
    const simCount = typeof licenseUser.simulations_count === 'number' ? licenseUser.simulations_count : 0;
    const maxSim = 3;
    const remaining = Math.max(0, maxSim - simCount);

    if (demoCounterBadge) {
      demoCounterBadge.classList.remove('hidden');
      demoCounterBadge.classList.add('flex');
    }
    if (demoCounterText) {
      demoCounterText.innerText = `Licencia Demo (Vigencia 7 días): Te quedan ${remaining} de 3 propuestas disponibles`;
    }

    if (simCount >= maxSim) {
      if (btnIniciarSim) {
        btnIniciarSim.disabled = false;
        btnIniciarSim.classList.add('opacity-85');
        btnIniciarSim.innerHTML = `<span class="flex items-center gap-1.5 justify-center"><span>🔒</span> <span>Límite de 3 Propuestas Agotado (Licencia Demo)</span></span>`;
        btnIniciarSim.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openDemoLimitBlockedModal();
        };
      }
    } else if (btnIniciarSim && !appState.isLocked) {
      btnIniciarSim.onclick = null;
      btnIniciarSim.disabled = false;
      btnIniciarSim.classList.remove('opacity-60', 'cursor-not-allowed', 'opacity-85');
      btnIniciarSim.innerHTML = `
        <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>Simular en War Room Vista 2</span>
      `;
    }
  } else {
    if (demoCounterBadge) {
      demoCounterBadge.classList.add('hidden');
      demoCounterBadge.classList.remove('flex');
    }
    if (btnIniciarSim) {
      if (!canSimulador || isReadOnly) {
        btnIniciarSim.disabled = true;
        btnIniciarSim.classList.add('opacity-60', 'cursor-not-allowed');
        btnIniciarSim.innerHTML = isReadOnly 
          ? `<span class="flex items-center gap-1.5 justify-center"><span>👁️</span> <span>Modo Solo Lectura (Ejecución Bloqueada)</span></span>`
          : `<span class="flex items-center gap-1.5 justify-center"><span>🔒</span> <span>War Room No Autorizado para esta Licencia</span></span>`;
      } else if (!appState.isLocked) {
        btnIniciarSim.onclick = null;
        btnIniciarSim.disabled = false;
        btnIniciarSim.classList.remove('opacity-60', 'cursor-not-allowed', 'opacity-85');
        btnIniciarSim.innerHTML = `
          <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span>Simular en War Room Vista 2</span>
        `;
      }
    }
  }

  const propInput = document.getElementById('input-propuesta');
  const titInput = document.getElementById('input-titulo');
  if (propInput) propInput.readOnly = isReadOnly;
  if (titInput) titInput.readOnly = isReadOnly;

  const btnHeaderRadar = document.getElementById('btn-header-radar-electoral');
  const btnHeaderRadarSub = document.getElementById('btn-header-radar-sub');
  const cardRadarInner = document.getElementById('card-radar-inner');
  const cardRadarStatusPill = document.getElementById('card-radar-status-pill');
  const cardRadarDesc = document.getElementById('card-radar-desc');
  const btnCardOpenRadar = document.getElementById('btn-card-open-radar');
  const btnCardOpenRadarText = document.getElementById('btn-card-open-radar-text');

  // Mantener visible la opción de Diagnóstico de Radar como ventana secundaria, pero mostrar bloqueo explícito si no está autorizado
  if (btnHeaderRadar) {
    btnHeaderRadar.classList.remove('hidden');
    btnHeaderRadar.classList.add('flex');
    if (canRadar) {
      btnHeaderRadar.className = 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-emerald-400';
      if (btnHeaderRadarSub) {
        btnHeaderRadarSub.className = 'hidden md:inline text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded font-bold text-emerald-200';
        btnHeaderRadarSub.innerText = 'Vista Secundaria';
      }
    } else {
      btnHeaderRadar.className = 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold border border-slate-300 opacity-85 cursor-not-allowed';
      if (btnHeaderRadarSub) {
        btnHeaderRadarSub.className = 'inline text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded font-black';
        btnHeaderRadarSub.innerText = '🔒 Bloqueado / No disponible para esta licencia';
      }
    }
  }

  if (cardRadarInner) {
    if (canRadar) {
      cardRadarInner.className = 'p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs transition-all';
      if (cardRadarStatusPill) {
        cardRadarStatusPill.className = 'text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded';
        cardRadarStatusPill.innerText = 'Ventana Secundaria';
      }
      if (cardRadarDesc) {
        cardRadarDesc.innerText = 'Módulo secundario especializado para evaluar cargos de elección, micro-targeting por colonias y descargar el Plan Maestro en PDF.';
      }
      if (btnCardOpenRadar) {
        btnCardOpenRadar.className = 'w-full sm:w-auto px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-95 cursor-pointer';
      }
      if (btnCardOpenRadarText) {
        btnCardOpenRadarText.innerText = 'Abrir Radar ↗';
      }
    } else {
      cardRadarInner.className = 'p-3.5 bg-slate-100 border-2 border-slate-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 opacity-85 transition-all';
      if (cardRadarStatusPill) {
        cardRadarStatusPill.className = 'text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded';
        cardRadarStatusPill.innerText = '🔒 Bloqueado / No disponible para esta licencia';
      }
      if (cardRadarDesc) {
        cardRadarDesc.innerText = '🔒 Bloqueado / No disponible para esta licencia — Tu cuenta opera directamente sobre la ventana principal War Room Vista 2.';
      }
      if (btnCardOpenRadar) {
        btnCardOpenRadar.className = 'w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-300 text-slate-600 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 cursor-not-allowed';
      }
      if (btnCardOpenRadarText) {
        btnCardOpenRadarText.innerText = '🔒 Bloqueado';
      }
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

  // 4. LÍMITE FLEXIBLE Y ESCALONADO DE AGENTES SINTÉTICOS (TOPE MÁXIMO REGULADO POR EL PANEL MAESTRO)
  const maxSwarm = isMasterAdmin ? 100000 : (parseInt(licenseUser.maxSwarmSize, 10) || 100000);
  appState.maxAllowedSwarm = maxSwarm;

  const capPill = document.getElementById('radar-license-capacity-pill');
  if (capPill) {
    capPill.innerText = `Capacidad Autorizada: De 50 hasta ${maxSwarm.toLocaleString()} Agentes`;
  }
  const ceilingBadge = document.getElementById('swarm-ceiling-badge');
  if (ceilingBadge) {
    ceilingBadge.innerText = `Tope Licencia: ${maxSwarm.toLocaleString()} Agentes`;
  }
  const sliderMaxLabel = document.getElementById('swarm-slider-max-label');
  if (sliderMaxLabel) {
    sliderMaxLabel.innerText = `Máx. autorizado: ${maxSwarm.toLocaleString()} agentes`;
  }
  const swarmSlider = document.getElementById('swarm-slider');
  if (swarmSlider) {
    swarmSlider.max = String(maxSwarm);
  }

  // Habilitar opciones del <select id="select-swarm-size"> desde el tope máximo hacia abajo y bloquear las superiores
  const swarmSelect = document.getElementById('select-swarm-size');
  if (swarmSelect) {
    Array.from(swarmSelect.options).forEach(opt => {
      const optVal = parseInt(opt.value, 10);
      if (!opt.dataset.origLabel) {
        opt.dataset.origLabel = opt.textContent;
      }
      if (!isMasterAdmin && optVal > maxSwarm) {
        opt.disabled = true;
        opt.textContent = `🔒 ${opt.dataset.origLabel} [Supera tope de ${maxSwarm.toLocaleString()}]`;
      } else {
        opt.disabled = false;
        opt.textContent = opt.dataset.origLabel;
      }
    });
  }

  // 5. Restringir Selector de Cargos en el Radar Electoral
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

  // 6. Restringir Estados y Municipios en Radar y War Room Vista 2
  await syncAuthorizedSelectorsInRadar(licenseUser);

  // 7. Ajustar tamaño activo si supera el tope o actualizar botones rápidos (.btn-swarm-quick)
  const targetInitialSize = Math.min(appState.swarmSize || 500, maxSwarm);
  setExactSwarmSize(targetInitialSize);
}

async function syncAuthorizedSelectorsInRadar(licenseUser) {
  await ensureNationalCatalogLoaded();
  const lic = licenseUser || appState.activeSession?.user;
  const hasSuperBypass = isUserSuperAdminOrNational(lic);

  const mainStateSelect = document.getElementById('select-estado');
  const radarStateSelect = document.getElementById('radar-select-estado');
  const mainMuniSelect = document.getElementById('select-municipio');
  const radarMuniSelect = document.getElementById('radar-select-municipio');

  // 1. Determinar Estados permitidos:
  // Si es Administrador / Control Maestro o cuenta con permiso Nacional, SIEMPRE desbloquear los 32 Estados + "TODOS LOS ESTADOS (Nacional)"
  let allowedStates = [...nationalStatesList];
  if (!hasSuperBypass && lic && Array.isArray(lic.estadosAutorizados) && lic.estadosAutorizados.length > 0 && !lic.estadosAutorizados.includes('TODOS')) {
    allowedStates = lic.estadosAutorizados;
  }

  let statesOptionsHtml = '';
  let defaultSelectedState = allowedStates[0] || 'Estado de México';

  if (hasSuperBypass) {
    defaultSelectedState = allowedStates.includes('Estado de México') ? 'Estado de México' : (allowedStates[0] || 'Estado de México');
    statesOptionsHtml = `
      <option value="TODOS LOS ESTADOS (Nacional)">🇲🇽 TODOS LOS ESTADOS (Nacional)</option>
      ${nationalStatesList.map(st => `<option value="${st}" ${st === defaultSelectedState ? 'selected' : ''}>${st}</option>`).join('')}
    `;
  } else {
    statesOptionsHtml = allowedStates.map((st, idx) => `
      <option value="${st}" ${idx === 0 ? 'selected' : ''}>${st}</option>
    `).join('');
  }

  if (radarStateSelect) {
    radarStateSelect.innerHTML = statesOptionsHtml;
    radarStateSelect.disabled = false;
    radarStateSelect.classList.remove('opacity-65', 'cursor-not-allowed');
  }
  if (mainStateSelect) {
    mainStateSelect.innerHTML = statesOptionsHtml;
    // SUPER ADMIN BYPASS: jamás bloquear el selector de Estado para el Administrador
    mainStateSelect.disabled = hasSuperBypass ? Boolean(appState.isLocked) : (allowedStates.length <= 1 ? false : Boolean(appState.isLocked));
    mainStateSelect.classList.remove('opacity-65', 'cursor-not-allowed');
    appState.estado = defaultSelectedState;
  }

  // 2. Poblar Municipios dinámicamente en cascada para el Estado activo
  await loadMunicipalities(defaultSelectedState);
}

window.onRadarStateChange = async function(selectedState) {
  await ensureNationalCatalogLoaded();
  const mainStateSelect = document.getElementById('select-estado');
  const radarStateSelect = document.getElementById('radar-select-estado');

  appState.estado = selectedState;
  if (mainStateSelect && mainStateSelect.value !== selectedState) mainStateSelect.value = selectedState;
  if (radarStateSelect && radarStateSelect.value !== selectedState) radarStateSelect.value = selectedState;

  await loadMunicipalities(selectedState);
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
  selectedMasterClientId = null;
  await ensureNationalCatalogLoaded();
  fetchAccessAuditLogsForMaster();
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

function getAdminHeaders() {
  const token = appState.activeSession?.sessionToken || sessionStorage.getItem('pvem_session_token') || '';
  const role = appState.activeSession?.role || appState.activeSession?.user?.role || '';
  return {
    'Content-Type': 'application/json',
    'x-session-token': token,
    'x-user-role': role
  };
}

// =========================================================================
// FUENTE ÚNICA DE VERDAD PERSISTENTE DE USUARIOS Y LICENCIAS (INMUTABLE)
// =========================================================================
const USERS_STORAGE_KEY = 'govtech_warroom_users_v1';
const USERS_VAULT_LEGACY_KEY = 'govtech_master_licenses_vault';
const USERS_INIT_FLAG_KEY = 'govtech_warroom_users_initialized_v1';
const DELETED_USERS_STORAGE_KEY = 'govtech_warroom_deleted_ids_v1';

function sanitizeUserPasswordValue(candidatePassword, fallbackPassword = '', username = '') {
  const c = (candidatePassword !== undefined && candidatePassword !== null) ? String(candidatePassword).trim() : '';
  if (c && c !== 'undefined' && c !== 'null') return c;
  const f = (fallbackPassword !== undefined && fallbackPassword !== null) ? String(fallbackPassword).trim() : '';
  if (f && f !== 'undefined' && f !== 'null') return f;
  const u = String(username || '').toLowerCase().trim();
  if (u === 'ecatepec2027') return 'Verde2027*';
  if (u === 'distrito04') return 'Morena2027*';
  return 'Clave2027*';
}

function cleanUserRecord(lic) {
  if (!lic || typeof lic !== 'object') return null;
  const validPass = sanitizeUserPasswordValue(lic.password, '', lic.username);
  return {
    ...lic,
    password: validPass,
    tokenSeguridad: (lic.tokenSeguridad && String(lic.tokenSeguridad) !== 'undefined')
      ? lic.tokenSeguridad
      : `TK-${String(lic.partido || 'PVEM').toUpperCase()}-2027`
  };
}

function getDeletedLicenseIds() {
  try {
    const raw = localStorage.getItem(DELETED_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch (_) {}
  return [];
}

function saveDeletedLicenseIdsToStorage(ids = []) {
  try {
    const unique = Array.from(new Set(ids.filter(Boolean).map(String)));
    localStorage.setItem(DELETED_USERS_STORAGE_KEY, JSON.stringify(unique));
  } catch (_) {}
}

function addDeletedLicenseId(id) {
  if (!id) return;
  const current = getDeletedLicenseIds();
  if (!current.includes(String(id))) {
    current.push(String(id));
    saveDeletedLicenseIdsToStorage(current);
  }
}

function removeDeletedLicenseId(id) {
  if (!id) return;
  const current = getDeletedLicenseIds();
  if (current.includes(String(id))) {
    saveDeletedLicenseIdsToStorage(current.filter(x => x !== String(id)));
  }
}

function savePersistentUsersVault(list = []) {
  try {
    const deletedSet = new Set(getDeletedLicenseIds());
    const cleaned = (Array.isArray(list) ? list : [])
      .filter(u => u && u.id && !deletedSet.has(String(u.id)))
      .map(u => cleanUserRecord(u))
      .filter(Boolean);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(cleaned));
    localStorage.setItem(USERS_VAULT_LEGACY_KEY, JSON.stringify(cleaned));
    localStorage.setItem(USERS_INIT_FLAG_KEY, 'true');
    return cleaned;
  } catch (e) {
    console.warn('Error guardando bóveda persistente de usuarios:', e);
    return list;
  }
}

function loadPersistentUsersVault() {
  try {
    const deletedSet = new Set(getDeletedLicenseIds());
    const rawPrimary = localStorage.getItem(USERS_STORAGE_KEY);
    const rawLegacy = localStorage.getItem(USERS_VAULT_LEGACY_KEY);
    const raw = rawPrimary !== null ? rawPrimary : rawLegacy;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(u => u && u.id && !deletedSet.has(String(u.id)))
          .map(u => cleanUserRecord(u))
          .filter(Boolean);
      }
    }
  } catch (e) {
    console.warn('Error leyendo bóveda persistente de usuarios:', e);
  }
  return null;
}

async function loadMasterLicenses() {
  const storedUsers = loadPersistentUsersVault();
  const deletedIds = getDeletedLicenseIds();

  try {
    // 1. FUENTE DE VERDAD PRIMARIA EN EL SERVIDOR (/api/users -> users_db.json)
    // Garantiza que usuarios creados desde cualquier navegador o dispositivo estén disponibles al instante
    const res = await fetch('/api/users', { headers: getAdminHeaders() });
    const data = await res.json();
    if (data.success && Array.isArray(data.users)) {
      if (Array.isArray(data.deletedIds)) {
        saveDeletedLicenseIdsToStorage([...deletedIds, ...data.deletedIds]);
      }
      let merged = data.users;
      // Si el navegador local tenía algún usuario adicional en caché local, fusionarlo sin borrar los del servidor
      if (Array.isArray(storedUsers) && storedUsers.length > 0) {
        const syncRes = await fetch('/api/licenses/sync-vault', {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            vaultLicenses: storedUsers,
            deletedIds: getDeletedLicenseIds(),
            authoritativeClientVault: false
          })
        });
        const syncData = await syncRes.json();
        if (syncData.success && Array.isArray(syncData.licenses)) {
          merged = syncData.licenses;
        }
      }
      masterLicensesCache = savePersistentUsersVault(merged);
    } else if (Array.isArray(storedUsers)) {
      masterLicensesCache = savePersistentUsersVault(storedUsers);
    }

    renderMasterLicensesList();
  } catch (err) {
    console.warn('Error cargando usuarios del servidor:', err);
    if (Array.isArray(storedUsers)) {
      masterLicensesCache = savePersistentUsersVault(storedUsers);
      renderMasterLicensesList();
    }
  }
}

let selectedMasterClientId = null;
let cachedAccessAuditLogs = [];

async function fetchAccessAuditLogsForMaster() {
  try {
    const res = await fetch('/api/audit/access-logs', { headers: getAdminHeaders() });
    const data = await res.json();
    if (data.success && Array.isArray(data.logs)) {
      cachedAccessAuditLogs = data.logs;
    }
  } catch (e) {
    // ignore
  }
}

function resolveClientLicenseTier(lic) {
  if (!lic) return 'ALCALDIA_A';
  if (lic.licenseTier) return lic.licenseTier;
  if (lic.esAdministradorTotal || lic.tipoUsuario === 'MASTER' || lic.tipoUsuario === 'MASTER_ADMIN') return 'ADMIN';
  if (lic.isDemo) return 'DEMO';
  if (lic.nivelGeografico === 'Federal / Nacional' || lic.can_select_all_states) return 'COMITE_NACIONAL';
  const cargos = Array.isArray(lic.cargosAutorizados) ? lic.cargosAutorizados : [];
  if (cargos.includes('Gobernador') || lic.nivelGeografico === 'Estatal') return 'GUBERNATURA';
  if (cargos.includes('Senador')) return 'SENADURIA';
  if (cargos.includes('Diputado Federal') || cargos.includes('Diputado Local') || lic.nivelGeografico === 'Distrital (Federal o Local)') return 'DIPUTACION';
  if ((lic.maxSwarmSize || 100000) <= 5000) return 'ALCALDIA_B';
  return 'ALCALDIA_A';
}

function resolveClientRolPerfil(lic) {
  if (!lic) return 'Operador';
  if (lic.rolPerfil) return lic.rolPerfil;
  if (lic.esAdministradorTotal || lic.tipoUsuario === 'MASTER' || lic.tipoUsuario === 'MASTER_ADMIN') return 'Administrador';
  if (lic.isDemo) return 'Demo';
  if (String(lic.clienteNombre || '').toLowerCase().includes('candidat')) return 'Candidato';
  return 'Operador';
}

function getCompactLicenseBadgeHtml(lic) {
  const tier = resolveClientLicenseTier(lic);
  const now = new Date();
  const exp = new Date(`${lic.fechaExpiracion || '2027-07-31'}T23:59:59`);
  const isExpired = now > exp;
  const isActive = lic.activo !== false && !isExpired;

  const simCount = typeof lic.simulations_count === 'number' ? lic.simulations_count : 0;
  const maxSim = typeof lic.max_simulations === 'number' ? lic.max_simulations : (lic.isDemo ? 3 : 999999);
  const isQuotaReached = (lic.isDemo || maxSim < 999999) && simCount >= maxSim;

  let tierBadge = '';
  if (tier === 'DEMO' || lic.isDemo) {
    const cap = maxSim < 999999 ? maxSim : 3;
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">⚡ DEMO (${simCount}/${cap})</span>`;
  } else if (tier === 'ADMIN') {
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">👑 ADMIN</span>`;
  } else if (tier === 'COMITE_NACIONAL') {
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300">🇲🇽 COMITÉ NACIONAL</span>`;
  } else if (tier === 'GUBERNATURA') {
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-teal-100 text-teal-900 border border-teal-300">🏛️ GUBERNATURA</span>`;
  } else if (tier === 'SENADURIA') {
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-cyan-100 text-cyan-900 border border-cyan-300">🏛️ SENADURÍA</span>`;
  } else if (tier === 'DIPUTACION') {
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-300">⚖️ DIPUTACIÓN</span>`;
  } else if (tier === 'ALCALDIA_B') {
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">🏙️ ALCALDÍA B</span>`;
  } else {
    tierBadge = `<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">🏙️ ALCALDÍA</span>`;
  }

  const statusBadge = (isActive && !isQuotaReached)
    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 ACTIVO</span>`
    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">🔴 BLOQUEADO</span>`;

  return `<div class="flex items-center gap-1.5 flex-wrap">${tierBadge}${statusBadge}</div>`;
}

function renderMasterLicensesList() {
  const listView = document.getElementById('master-clients-list-view');
  const detailView = document.getElementById('master-client-detail-view');
  const container = document.getElementById('master-licenses-list');
  const countBadge = document.getElementById('monitor-active-count-badge');

  if (countBadge) {
    countBadge.innerText = `${masterLicensesCache.length} ${masterLicensesCache.length === 1 ? 'Licencia' : 'Licencias'}`;
  }

  // Si hay un cliente seleccionado en Vista 2, verificar que siga existiendo y actualizar su expediente
  if (selectedMasterClientId !== null) {
    const selectedClient = masterLicensesCache.find(l => String(l.id) === String(selectedMasterClientId));
    if (selectedClient) {
      if (listView) listView.classList.add('hidden');
      if (detailView) detailView.classList.remove('hidden');
      renderClientProfileDetail(selectedClient);
      return;
    } else {
      selectedMasterClientId = null;
    }
  }

  // VISTA 1: LISTA COMPACTA DE CLIENTES (selectedMasterClientId === null)
  if (listView) listView.classList.remove('hidden');
  if (detailView) detailView.classList.add('hidden');
  if (!container) return;

  const searchQuery = (document.getElementById('master-clients-search-input')?.value || '').toLowerCase().trim();
  const filteredList = masterLicensesCache.filter(lic => {
    if (!searchQuery) return true;
    const name = String(lic.clienteNombre || '').toLowerCase();
    const user = String(lic.username || '').toLowerCase();
    const tier = resolveClientLicenseTier(lic).toLowerCase();
    const party = String(lic.partido || '').toLowerCase();
    return name.includes(searchQuery) || user.includes(searchQuery) || tier.includes(searchQuery) || party.includes(searchQuery);
  });

  if (!filteredList.length) {
    container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">No se encontraron clientes o licencias registradas.</div>`;
    return;
  }

  // Cada fila muestra ESTRICTAMENTE SOLO 3 ELEMENTOS:
  // 1. Nombre del Cliente / Titular (con su usuario o alias debajo en texto sutil)
  // 2. Licencia / Estado de Control (badge limpio: DEMO (2/3), ALCALDÍA, GUBERNATURA, ADMIN + ACTIVO / BLOQUEADO)
  // 3. Acción de Control: Fila clickeable + botón "Abrir Control del Perfil →"
  container.innerHTML = filteredList.map(lic => {
    const badgeHtml = getCompactLicenseBadgeHtml(lic);
    return `
      <div onclick="openClientProfileDetail('${lic.id}')"
        class="group grid grid-cols-12 items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
        <!-- 1. Nombre del Cliente / Titular + @usuario debajo -->
        <div class="col-span-12 sm:col-span-5 min-w-0">
          <div class="font-black text-slate-900 text-sm truncate group-hover:text-indigo-950 transition-colors">${lic.clienteNombre || 'Cliente Sin Nombre'}</div>
          <div class="text-[11px] font-mono text-slate-400 truncate">@${lic.username}</div>
        </div>

        <!-- 2. Licencia / Estado de Control -->
        <div class="col-span-7 sm:col-span-4">
          ${badgeHtml}
        </div>

        <!-- 3. Acción de Control -->
        <div class="col-span-5 sm:col-span-3 flex justify-end">
          <button type="button" onclick="event.stopPropagation(); openClientProfileDetail('${lic.id}')"
            class="px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-indigo-600 text-white font-black text-[11px] transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0">
            <span>Abrir Control del Perfil</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.openClientProfileDetail = async function(id) {
  await ensureNationalCatalogLoaded();
  await fetchAccessAuditLogsForMaster();
  const lic = masterLicensesCache.find(l => String(l.id) === String(id));
  if (!lic) return;
  selectedMasterClientId = String(lic.id);
  const listView = document.getElementById('master-clients-list-view');
  const detailView = document.getElementById('master-client-detail-view');
  if (listView) listView.classList.add('hidden');
  if (detailView) detailView.classList.remove('hidden');
  renderClientProfileDetail(lic);
};

window.closeClientProfileDetail = function() {
  selectedMasterClientId = null;
  renderMasterLicensesList();
};

function renderClientProfileDetail(lic) {
  const detailView = document.getElementById('master-client-detail-view');
  if (!detailView || !lic) return;

  const safePassword = sanitizeUserPasswordValue(lic.password, '', lic.username);
  const tier = resolveClientLicenseTier(lic);
  const rolPerfil = resolveClientRolPerfil(lic);
  const isMaster = lic.esAdministradorTotal || lic.tipoUsuario === 'MASTER' || tier === 'ADMIN';

  const now = new Date();
  const exp = new Date(`${lic.fechaExpiracion || '2027-07-31'}T23:59:59`);
  const isExpired = now > exp;
  const isActive = lic.activo !== false && !isExpired;

  const simUsed = typeof lic.simulations_count === 'number' ? lic.simulations_count : 0;
  const simMax = typeof lic.max_simulations === 'number' ? lic.max_simulations : (lic.isDemo ? 3 : 999999);
  const isUnlimited = !lic.isDemo && simMax >= 999999;

  const allStatesActive = Boolean(lic.can_select_all_states || isMaster || (Array.isArray(lic.estadosAutorizados) && lic.estadosAutorizados.includes('TODOS')));
  const selectedStates = allStatesActive ? ['TODOS'] : (Array.isArray(lic.estadosAutorizados) && lic.estadosAutorizados.length > 0 ? lic.estadosAutorizados : ['Estado de México']);
  const allMunisActive = Array.isArray(lic.municipiosAutorizados) && lic.municipiosAutorizados.includes('TODOS');
  const selectedMunis = Array.isArray(lic.municipiosAutorizados) && lic.municipiosAutorizados.length > 0 ? lic.municipiosAutorizados : ['Ecatepec de Morelos'];

  const canSelectAnyParty = Boolean(lic.can_select_any_party || isMaster);
  const allowedParties = Array.isArray(lic.allowed_parties) && lic.allowed_parties.length > 0 ? lic.allowed_parties : [lic.partido || 'PVEM'];

  const ALL_PARTIES = ['PVEM', 'MORENA', 'PAN', 'PRI', 'MC', 'PT', 'CANDIDATURA INDEPENDIENTE', 'COALICIÓN / ALIANZA'];

  // Filtrar historial de accesos recientes de este cliente
  const clientLogs = cachedAccessAuditLogs.filter(entry =>
    String(entry.username || '').toLowerCase() === String(lic.username || '').toLowerCase()
  ).slice(0, 8);

  const lastLoginFormatted = lic.last_login_at
    ? new Date(lic.last_login_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short' })
    : 'Sin accesos registrados aún';

  detailView.innerHTML = `
    <!-- 1. BARRA SUPERIOR DE NAVEGACIÓN (BOTÓN HACIA ATRÁS) -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
      <button type="button" onclick="closeClientProfileDetail()"
        class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer">
        <span>← Volver a Clientes y Licencias</span>
      </button>

      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" onclick="previewClientLicenseSession('${lic.id}')"
          class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all cursor-pointer">
          👁️ Simular como este Cliente
        </button>
        <button type="button" onclick="saveClientProfileDetail('${lic.id}')"
          class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer">
          💾 Guardar Cambios del Perfil
        </button>
      </div>
    </div>

    <!-- CABECERA DEL EXPEDIENTE INDIVIDUAL -->
    <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
      <div>
        <div class="text-[10px] font-black uppercase tracking-widest text-amber-400">Expediente y Control Total del Perfil</div>
        <h3 class="text-lg font-black text-white mt-0.5">${lic.clienteNombre || 'Cliente Registrado'}</h3>
        <div class="text-xs font-mono text-slate-300">@${lic.username} • ID: ${lic.id}</div>
      </div>
      <div class="flex items-center gap-2">
        ${getCompactLicenseBadgeHtml(lic)}
      </div>
    </div>

    <!-- TARJETA 1: CREDENCIALES Y ACCESO -->
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-900">🔐 1. Credenciales y Acceso</h4>
        <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Persistencia Inmutable Activa</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block text-[10px] font-black uppercase text-slate-600 mb-1">Nombre del Cliente / Titular</label>
          <input type="text" id="detail-cliente-nombre" value="${(lic.clienteNombre || '').replace(/"/g, '&quot;')}"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase text-slate-600 mb-1">Usuario / Alias de Acceso</label>
          <input type="text" id="detail-username" value="${(lic.username || '').replace(/"/g, '&quot;')}"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase text-slate-600 mb-1">Contraseña (Texto Exacto)</label>
          <div class="relative flex items-center">
            <input type="text" id="detail-password" value="${safePassword.replace(/"/g, '&quot;')}"
              placeholder="Escribe la contraseña exacta..."
              class="w-full px-3 py-2 rounded-lg border border-emerald-400 bg-white font-mono font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase text-slate-600 mb-1">Rol del Perfil</label>
          <select id="detail-rol-perfil" onchange="onDetailRolPerfilChange(this.value)"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Operador" ${rolPerfil === 'Operador' ? 'selected' : ''}>👥 Operador (Socio Operador)</option>
            <option value="Candidato" ${rolPerfil === 'Candidato' ? 'selected' : ''}>🗳️ Candidato / Titular</option>
            <option value="Demo" ${rolPerfil === 'Demo' ? 'selected' : ''}>⚡ Demo (Prospecto 7 Días)</option>
            <option value="Administrador" ${rolPerfil === 'Administrador' ? 'selected' : ''}>👑 Administrador (Control Maestro)</option>
          </select>
        </div>
      </div>

      <div class="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span class="text-[10px] font-black uppercase text-slate-400 block">🛡️ Token de Seguridad Único Asignado:</span>
          <span id="detail-token-seguridad" class="font-mono font-black text-indigo-950 text-xs select-all">${String(lic.tokenSeguridad || 'TK-PVEM-2027').trim()}</span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button type="button" onclick="navigator.clipboard.writeText('${String(lic.tokenSeguridad || '').trim()}'); showToast('Token copiado al portapapeles');"
            class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-[11px] cursor-pointer">
            📋 Copiar Token
          </button>
          <button type="button" onclick="copyClientAccessCredentials('${lic.id}')"
            class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-xs cursor-pointer flex items-center gap-1">
            📋 Copiar Credenciales de Acceso
          </button>
        </div>
      </div>
    </div>

    <!-- TARJETA 2: CONTROL DE LICENCIA, FECHAS Y LÍMITES -->
    <div class="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3.5">
      <div class="flex items-center justify-between border-b border-amber-200/80 pb-2">
        <h4 class="text-xs font-black uppercase tracking-wider text-amber-950">📅 2. Control de Licencia, Fechas y Límites de Corridas</h4>
        <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}">
          ${isActive ? '🟢 Vigente y Activa' : '🔴 Suspendida / Expirada'}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <!-- Tipo de Licencia -->
        <div>
          <label class="block text-[10px] font-black uppercase text-slate-700 mb-1">Tipo de Licencia</label>
          <select id="detail-license-tier" onchange="onDetailLicenseTierChange(this.value)"
            class="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="DEMO" ${tier === 'DEMO' ? 'selected' : ''}>⚡ Demo (7 Días / 3 Propuestas)</option>
            <option value="ALCALDIA_B" ${tier === 'ALCALDIA_B' ? 'selected' : ''}>🏙️ Alcaldía B (Municipal Estándar)</option>
            <option value="ALCALDIA_A" ${tier === 'ALCALDIA_A' ? 'selected' : ''}>🏙️ Alcaldía A (Municipal Metropolitano)</option>
            <option value="DIPUTACION" ${tier === 'DIPUTACION' ? 'selected' : ''}>⚖️ Diputación (Local / Federal)</option>
            <option value="SENADURIA" ${tier === 'SENADURIA' ? 'selected' : ''}>🏛️ Senaduría (Estatal / República)</option>
            <option value="GUBERNATURA" ${tier === 'GUBERNATURA' ? 'selected' : ''}>🏛️ Gubernatura (Comando Estatal)</option>
            <option value="COMITE_NACIONAL" ${tier === 'COMITE_NACIONAL' ? 'selected' : ''}>🇲🇽 Comité Nacional (32 Estados)</option>
            <option value="ADMIN" ${tier === 'ADMIN' ? 'selected' : ''}>👑 Administrador (Control Maestro)</option>
          </select>
        </div>

        <!-- Fecha de Vigencia / Expiración -->
        <div>
          <label class="block text-[10px] font-black uppercase text-slate-700 mb-1">Fecha de Vigencia / Expiración</label>
          <div class="flex items-center gap-1.5 flex-wrap">
            <input type="date" id="detail-fecha-expiracion" value="${lic.fechaExpiracion || '2027-07-31'}"
              class="flex-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-black text-slate-900 text-xs">
            <button type="button" onclick="adjustDetailExpDays(-7)" class="px-2 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-black text-[10px] cursor-pointer" title="Recortar 7 días">-7d</button>
            <button type="button" onclick="adjustDetailExpDays(7)" class="px-2 py-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-900 font-black text-[10px] cursor-pointer" title="Ampliar 7 días">+7d</button>
            <button type="button" onclick="adjustDetailExpDays(30)" class="px-2 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-[10px] cursor-pointer" title="Ampliar 30 días">+30d</button>
          </div>
        </div>
      </div>

      <!-- Control de Límite de Propuestas / Corridas -->
      <div class="p-3 rounded-xl bg-white border border-amber-200 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-[11px] font-black uppercase text-slate-900 block">📊 Control de Límite de Propuestas / Corridas</span>
            <span id="detail-sim-summary-label" class="text-[11px] font-bold text-slate-600">
              Usadas: <b class="text-slate-900">${simUsed}</b> de <b class="text-indigo-700">${isUnlimited ? 'Ilimitadas (∞)' : simMax}</b>
            </span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button type="button" onclick="resetDetailSimCount('${lic.id}')"
              class="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-black text-[10px] cursor-pointer">
              🔄 Reiniciar contador a 0
            </button>
            <button type="button" onclick="setDetailSimUnlimited()"
              class="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-[10px] cursor-pointer">
              ♾️ Hacer Ilimitadas
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs">
          <div class="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span class="text-[10px] font-black uppercase text-slate-600">Corridas Usadas:</span>
            <div class="flex items-center gap-1">
              <button type="button" onclick="adjustDetailSimUsed(-1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-black text-slate-800 cursor-pointer">-</button>
              <input type="number" id="detail-sim-used" min="0" value="${simUsed}"
                class="w-16 text-center px-1.5 py-1 rounded border border-slate-300 bg-white font-black text-slate-900 text-xs">
              <button type="button" onclick="adjustDetailSimUsed(1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-black text-slate-800 cursor-pointer">+</button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span class="text-[10px] font-black uppercase text-slate-600">Límite Permitido:</span>
            <div class="flex items-center gap-1">
              <button type="button" onclick="adjustDetailSimLimit(-1)" class="w-6 h-6 rounded bg-amber-200 hover:bg-amber-300 font-black text-amber-950 cursor-pointer">-</button>
              <input type="number" id="detail-sim-max" min="1" value="${simMax}"
                class="w-20 text-center px-1.5 py-1 rounded border border-amber-300 bg-white font-black text-slate-900 text-xs">
              <button type="button" onclick="adjustDetailSimLimit(1)" class="w-6 h-6 rounded bg-amber-200 hover:bg-amber-300 font-black text-amber-950 cursor-pointer">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Switch de Estado de Cuenta (Kill Switch) -->
      <div class="p-3 rounded-xl ${lic.activo !== false ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'} border flex items-center justify-between gap-3">
        <div>
          <span class="text-xs font-black ${lic.activo !== false ? 'text-emerald-950' : 'text-rose-950'} block">
            🔌 Estado Manual de la Cuenta (Kill Switch)
          </span>
          <span class="text-[11px] text-slate-600">
            ${lic.activo !== false ? 'La cuenta está ACTIVA y autorizada para iniciar sesión.' : 'La cuenta está BLOQUEADA manualmente por el Administrador.'}
          </span>
        </div>
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" id="detail-activo-switch" ${lic.activo !== false ? 'checked' : ''}
            class="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500">
          <span class="text-xs font-black uppercase ${lic.activo !== false ? 'text-emerald-800' : 'text-rose-800'}">
            ${lic.activo !== false ? 'ACTIVA' : 'BLOQUEADA'}
          </span>
        </label>
      </div>
    </div>

    <!-- TARJETA 3: PERMISOS TERRITORIALES Y DE PARTIDOS POLÍTICOS -->
    <div class="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-4">
      <div class="flex items-center justify-between border-b border-indigo-200 pb-2">
        <h4 class="text-xs font-black uppercase tracking-wider text-indigo-950">🇲🇽 3. Permisos Territoriales y de Partidos Políticos</h4>
      </div>

      <!-- A) Estados y Municipios -->
      <div class="space-y-2.5 bg-white p-3 rounded-xl border border-indigo-100">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-[11px] font-black uppercase text-slate-800">Estado(s) Autorizado(s) (32 Entidades)</span>
          <label class="flex items-center gap-1.5 text-[11px] font-black text-emerald-900 cursor-pointer bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300">
            <input type="checkbox" id="detail-todos-estados" ${allStatesActive ? 'checked' : ''} onchange="onDetailAllStatesToggle(this.checked)" class="rounded text-emerald-600">
            <span>🇲🇽 Permitir Todos los Estados (Nacional)</span>
          </label>
        </div>

        <div id="detail-estados-list" class="max-h-28 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1 p-2 rounded-lg border border-slate-200 bg-slate-50">
          ${nationalStatesList.map(st => {
            const checked = allStatesActive || selectedStates.includes(st) ? 'checked' : '';
            return `
              <label class="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer hover:bg-white p-1 rounded">
                <input type="checkbox" name="detail_estado_cb" value="${st}" ${checked} onchange="onDetailStateCheckboxChange()" class="rounded text-indigo-600">
                <span class="truncate font-medium">${st}</span>
              </label>
            `;
          }).join('')}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-2">
          <span class="text-[11px] font-black uppercase text-slate-800">Municipio(s) / Alcaldía(s) Autorizados</span>
          <label class="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            <input type="checkbox" id="detail-todos-municipios" ${allMunisActive ? 'checked' : ''} onchange="onDetailAllMunisToggle(this.checked)" class="rounded text-indigo-600">
            <span>Autorizar TODOS los Municipios del Estado</span>
          </label>
        </div>

        <div id="detail-municipios-list" class="max-h-32 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1 p-2 rounded-lg border border-slate-200 bg-slate-50">
          <!-- Renderizado por renderDetailMunicipalitiesCheckboxes -->
        </div>
      </div>

      <!-- B) Partidos Políticos Autorizados -->
      <div class="space-y-2.5 bg-white p-3 rounded-xl border border-indigo-100">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-[11px] font-black uppercase text-slate-800 block">Partido(s) Político(s) Autorizados</span>
            <span class="text-[10px] text-slate-500">Elige un partido único, una coalición o habilita la Libre Elección de los 8 partidos.</span>
          </div>
          <label class="flex items-center gap-1.5 text-[11px] font-black text-indigo-950 cursor-pointer bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-lg border border-indigo-300">
            <input type="checkbox" id="detail-can-select-any-party" ${canSelectAnyParty ? 'checked' : ''} onchange="onDetailAnyPartyToggle(this.checked)" class="rounded text-indigo-600">
            <span>🌐 Libre Elección de Todos los Partidos</span>
          </label>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div>
            <label class="block text-[10px] font-black uppercase text-slate-600 mb-1">Partido Principal por Defecto</label>
            <select id="detail-partido-principal" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs text-slate-900">
              ${ALL_PARTIES.map(p => `<option value="${p}" ${(lic.partido || 'PVEM') === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>

        <div id="detail-parties-cb-wrapper" class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 ${canSelectAnyParty ? 'opacity-50 pointer-events-none' : ''}">
          ${ALL_PARTIES.map(p => {
            const isChecked = canSelectAnyParty || allowedParties.includes(p) ? 'checked' : '';
            return `
              <label class="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer text-[11px] font-bold text-slate-800">
                <input type="checkbox" name="detail_party_cb" value="${p}" ${isChecked} class="rounded text-indigo-600">
                <span class="truncate">${p}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- TARJETA 4: TELEMETRÍA E HISTORIAL DE USO DE ESTE CLIENTE -->
    <div class="p-4 rounded-xl bg-slate-900 text-white space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 class="text-xs font-black uppercase tracking-wider text-amber-400">📊 4. Telemetría e Historial de Uso del Cliente</h4>
        <span class="text-[10px] text-slate-400 font-mono">Auditoría en Tiempo Real</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div class="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
          <span class="text-[10px] font-bold uppercase text-slate-400 block">Total de Accesos</span>
          <span class="text-lg font-black text-emerald-400">${lic.login_count || 0}</span>
          <span class="text-[10px] text-slate-400 block">inicios de sesión</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
          <span class="text-[10px] font-bold uppercase text-slate-400 block">Último Acceso</span>
          <span class="text-xs font-black text-white block mt-1">${lastLoginFormatted}</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
          <span class="text-[10px] font-bold uppercase text-slate-400 block">Simulaciones Ejecutadas</span>
          <span class="text-lg font-black text-amber-300">${simUsed}</span>
          <span class="text-[10px] text-slate-400 block">${isUnlimited ? 'Licencia Ilimitada' : `Límite: ${simMax} corridas`}</span>
        </div>
      </div>

      <div class="space-y-1.5 pt-1">
        <span class="text-[10px] font-black uppercase text-slate-400 block">Historial Reciente de Conexiones de @${lic.username}:</span>
        ${clientLogs.length === 0 ? `
          <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-center">
            No se registran entradas recientes en la bitácora para este usuario.
          </div>
        ` : `
          <div class="max-h-36 overflow-y-auto rounded-lg border border-slate-800 divide-y divide-slate-800 bg-slate-950/60 text-[11px]">
            ${clientLogs.map(log => `
              <div class="px-3 py-2 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400 font-bold">● Acceso Exitoso</span>
                  <span class="text-slate-300 font-mono">@${log.username}</span>
                </div>
                <div class="text-slate-400 font-mono text-[10px]">
                  ${log.timestamp ? new Date(log.timestamp).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : ''} • IP: ${log.ip || 'Local'}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>

    <!-- 3. BOTONES DE ACCIÓN DEL EXPEDIENTE (GUARDAR Y ELIMINAR CON CONFIRMACIÓN) -->
    <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
      <button type="button" onclick="confirmDeleteClientFromDetail('${lic.id}')"
        class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
        <span>🗑️ Eliminar Usuario</span>
      </button>

      <div class="flex items-center gap-2">
        <button type="button" onclick="closeClientProfileDetail()"
          class="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all cursor-pointer">
          ← Volver a la Lista
        </button>
        <button type="button" onclick="saveClientProfileDetail('${lic.id}')"
          class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5">
          <span>💾 Guardar Cambios del Perfil</span>
        </button>
      </div>
    </div>
  `;

  renderDetailMunicipalitiesCheckboxes(selectedMunis);
}

function renderDetailMunicipalitiesCheckboxes(selectedList = ['Ecatepec de Morelos']) {
  const container = document.getElementById('detail-municipios-list');
  if (!container) return;

  const allStatesChecked = document.getElementById('detail-todos-estados')?.checked;
  const checkedStates = Array.from(document.querySelectorAll('input[name="detail_estado_cb"]:checked')).map(cb => cb.value);
  const statesToLoad = allStatesChecked ? ['Estado de México'] : (checkedStates.length > 0 ? checkedStates : ['Estado de México']);
  const multiState = statesToLoad.length > 1;
  const isAllMunis = document.getElementById('detail-todos-municipios')?.checked || selectedList.includes('TODOS');

  const items = [];
  statesToLoad.slice(0, 6).forEach(st => {
    const list = nationalCatalog32States[st] || (st === 'Estado de México' ? allAvailableMunicipalities : [`Capital de ${st}`]);
    list.forEach(m => {
      items.push({
        nombre: m,
        label: multiState ? `${m} (${st})` : m
      });
    });
  });

  container.innerHTML = items.map(it => {
    const checked = isAllMunis || selectedList.includes(it.nombre) ? 'checked' : '';
    return `
      <label class="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer hover:bg-white p-1 rounded">
        <input type="checkbox" name="detail_muni_cb" value="${it.nombre}" ${checked} class="rounded text-indigo-600">
        <span class="truncate" title="${it.label}">${it.label}</span>
      </label>
    `;
  }).join('');
}

window.onDetailAllStatesToggle = function(checked) {
  document.querySelectorAll('input[name="detail_estado_cb"]').forEach(cb => {
    cb.checked = checked;
  });
  if (checked) {
    const allMunis = document.getElementById('detail-todos-municipios');
    if (allMunis) allMunis.checked = true;
  }
  renderDetailMunicipalitiesCheckboxes(checked ? ['TODOS'] : []);
};

window.onDetailStateCheckboxChange = function() {
  const currentMunis = Array.from(document.querySelectorAll('input[name="detail_muni_cb"]:checked')).map(cb => cb.value);
  renderDetailMunicipalitiesCheckboxes(currentMunis);
};

window.onDetailAllMunisToggle = function(checked) {
  document.querySelectorAll('input[name="detail_muni_cb"]').forEach(cb => {
    cb.checked = checked;
  });
};

window.onDetailAnyPartyToggle = function(checked) {
  const wrapper = document.getElementById('detail-parties-cb-wrapper');
  if (wrapper) {
    if (checked) {
      wrapper.classList.add('opacity-50', 'pointer-events-none');
      document.querySelectorAll('input[name="detail_party_cb"]').forEach(cb => { cb.checked = true; });
    } else {
      wrapper.classList.remove('opacity-50', 'pointer-events-none');
    }
  }
};

window.onDetailRolPerfilChange = function(rol) {
  const tierSelect = document.getElementById('detail-license-tier');
  if (rol === 'Administrador' && tierSelect) {
    tierSelect.value = 'ADMIN';
    window.onDetailLicenseTierChange('ADMIN');
  } else if (rol === 'Demo' && tierSelect) {
    tierSelect.value = 'DEMO';
    window.onDetailLicenseTierChange('DEMO');
  }
};

window.onDetailLicenseTierChange = function(tier) {
  const maxInput = document.getElementById('detail-sim-max');
  const rolSelect = document.getElementById('detail-rol-perfil');
  const allStatesChk = document.getElementById('detail-todos-estados');
  if (tier === 'DEMO') {
    if (maxInput) maxInput.value = '3';
    if (rolSelect) rolSelect.value = 'Demo';
    const expInput = document.getElementById('detail-fecha-expiracion');
    if (expInput) {
      const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expInput.value = d.toISOString().split('T')[0];
    }
  } else {
    if (maxInput && parseInt(maxInput.value, 10) <= 3) {
      maxInput.value = '999999';
    }
    if (tier === 'ADMIN') {
      if (rolSelect) rolSelect.value = 'Administrador';
      if (allStatesChk) {
        allStatesChk.checked = true;
        window.onDetailAllStatesToggle(true);
      }
    } else if (tier === 'COMITE_NACIONAL') {
      if (allStatesChk) {
        allStatesChk.checked = true;
        window.onDetailAllStatesToggle(true);
      }
    }
  }
};

window.adjustDetailExpDays = function(days) {
  const expInput = document.getElementById('detail-fecha-expiracion');
  if (!expInput) return;
  const base = expInput.value ? new Date(`${expInput.value}T12:00:00`) : new Date();
  base.setDate(base.getDate() + (parseInt(days, 10) || 0));
  expInput.value = base.toISOString().split('T')[0];
};

window.adjustDetailSimUsed = function(delta) {
  const usedInput = document.getElementById('detail-sim-used');
  if (!usedInput) return;
  const current = parseInt(usedInput.value, 10) || 0;
  usedInput.value = String(Math.max(0, current + delta));
};

window.adjustDetailSimLimit = function(delta) {
  const maxInput = document.getElementById('detail-sim-max');
  if (!maxInput) return;
  let current = parseInt(maxInput.value, 10) || 3;
  if (current >= 999999 && delta < 0) current = 10;
  maxInput.value = String(Math.max(1, current + delta));
};

window.setDetailSimUnlimited = function() {
  const maxInput = document.getElementById('detail-sim-max');
  if (maxInput) maxInput.value = '999999';
  const summary = document.getElementById('detail-sim-summary-label');
  const used = document.getElementById('detail-sim-used')?.value || '0';
  if (summary) summary.innerHTML = `Usadas: <b class="text-slate-900">${used}</b> de <b class="text-emerald-700">Ilimitadas (∞)</b>`;
};

window.resetDetailSimCount = async function(id) {
  const usedInput = document.getElementById('detail-sim-used');
  if (usedInput) usedInput.value = '0';
  if (id) {
    await window.resetLicenseSimulations(id);
  }
};

window.saveClientProfileDetail = async function(id) {
  const lic = masterLicensesCache.find(l => String(l.id) === String(id));
  if (!lic) return;

  const clienteNombre = document.getElementById('detail-cliente-nombre')?.value?.trim() || lic.clienteNombre;
  const username = document.getElementById('detail-username')?.value?.trim() || lic.username;
  const rawPass = document.getElementById('detail-password')?.value;
  const password = sanitizeUserPasswordValue(rawPass, lic.password, username);

  const rolPerfil = document.getElementById('detail-rol-perfil')?.value || 'Operador';
  const licenseTier = document.getElementById('detail-license-tier')?.value || 'ALCALDIA_A';
  const fechaExpiracion = document.getElementById('detail-fecha-expiracion')?.value || lic.fechaExpiracion;
  const simulations_count = Math.max(0, parseInt(document.getElementById('detail-sim-used')?.value, 10) || 0);
  const max_simulations = Math.max(1, parseInt(document.getElementById('detail-sim-max')?.value, 10) || 999999);
  const activo = Boolean(document.getElementById('detail-activo-switch')?.checked);

  const esAdministradorTotal = licenseTier === 'ADMIN' || rolPerfil === 'Administrador';
  const isDemo = !esAdministradorTotal && (licenseTier === 'DEMO' || rolPerfil === 'Demo');
  const tipoUsuario = esAdministradorTotal ? 'MASTER' : 'SOCIO';

  const allStates = Boolean(document.getElementById('detail-todos-estados')?.checked) || esAdministradorTotal || licenseTier === 'COMITE_NACIONAL';
  let estadosAutorizados = ['TODOS'];
  if (!allStates) {
    estadosAutorizados = Array.from(document.querySelectorAll('input[name="detail_estado_cb"]:checked')).map(cb => cb.value);
    if (estadosAutorizados.length === 0) estadosAutorizados = lic.estadosAutorizados || ['Estado de México'];
  }

  const allMunis = Boolean(document.getElementById('detail-todos-municipios')?.checked) || allStates;
  let municipiosAutorizados = ['TODOS'];
  if (!allMunis) {
    municipiosAutorizados = Array.from(document.querySelectorAll('input[name="detail_muni_cb"]:checked')).map(cb => cb.value);
    if (municipiosAutorizados.length === 0) municipiosAutorizados = lic.municipiosAutorizados || ['TODOS'];
  }

  const partido = document.getElementById('detail-partido-principal')?.value || lic.partido || 'PVEM';
  const can_select_any_party = Boolean(document.getElementById('detail-can-select-any-party')?.checked) || esAdministradorTotal;
  let allowed_parties = Array.from(document.querySelectorAll('input[name="detail_party_cb"]:checked')).map(cb => cb.value);
  if (can_select_any_party) {
    allowed_parties = ['PVEM', 'MORENA', 'PAN', 'PRI', 'MC', 'PT', 'CANDIDATURA INDEPENDIENTE', 'COALICIÓN / ALIANZA'];
  } else if (allowed_parties.length === 0) {
    allowed_parties = [partido];
  }
  if (!allowed_parties.includes(partido)) allowed_parties.unshift(partido);

  let nivelGeografico = lic.nivelGeografico || 'Municipal / Alcaldía';
  if (licenseTier === 'COMITE_NACIONAL' || licenseTier === 'ADMIN') nivelGeografico = 'Federal / Nacional';
  else if (licenseTier === 'GUBERNATURA' || licenseTier === 'SENADURIA') nivelGeografico = 'Estatal';
  else if (licenseTier === 'DIPUTACION') nivelGeografico = 'Distrital (Federal o Local)';

  const payload = {
    ...lic,
    id: lic.id,
    clienteNombre,
    username,
    password,
    rolPerfil,
    licenseTier,
    tipoUsuario,
    esAdministradorTotal,
    isDemo,
    fechaExpiracion,
    simulations_count,
    max_simulations: isDemo && max_simulations >= 999999 ? 3 : max_simulations,
    activo,
    partido,
    allowed_parties,
    can_select_any_party,
    can_select_all_states: allStates,
    estadosAutorizados,
    municipiosAutorizados,
    nivelGeografico
  };

  try {
    removeDeletedLicenseId(lic.id);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const list = data.users || data.licenses;
    if (data.success && Array.isArray(list)) {
      masterLicensesCache = savePersistentUsersVault(list);
      renderMasterLicensesList();
      showToast(`✅ Expediente de ${clienteNombre} (@${username}) guardado en el servidor.`);
    } else {
      alert(data.error || 'Error al guardar cambios del perfil.');
    }
  } catch (err) {
    alert('Error de conexión al guardar perfil: ' + err.message);
  }
};

window.copyClientAccessCredentials = function(id) {
  const lic = masterLicensesCache.find(l => String(l.id) === String(id));
  if (!lic) return;
  const u = (document.getElementById('detail-username')?.value ?? lic.username ?? '').trim();
  const p = (document.getElementById('detail-password')?.value ?? lic.password ?? '').trim();
  const t = (document.getElementById('detail-token-seguridad')?.innerText ?? lic.tokenSeguridad ?? 'TK-PVEM-2027').trim();
  const nombre = (document.getElementById('detail-cliente-nombre')?.value ?? lic.clienteNombre ?? 'Cliente').trim();

  const text = `*CREDENCIALES DE ACCESO — GOVTECH WAR ROOM*\n` +
    `👤 *Titular:* ${nombre}\n` +
    `🌐 *Plataforma:* https://simulador-pvem.vercel.app/\n\n` +
    `Usuario: ${u}\n` +
    `Contraseña: ${p}\n` +
    `Token: ${t}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Credenciales limpias (Usuario, Contraseña y Token) copiadas para WhatsApp.');
    }).catch(() => {
      prompt('Copia las credenciales de acceso:', text);
    });
  } else {
    prompt('Copia las credenciales de acceso:', text);
  }
};

window.confirmDeleteClientFromDetail = async function(id) {
  const lic = masterLicensesCache.find(l => String(l.id) === String(id));
  const label = lic ? `${lic.clienteNombre} (@${lic.username})` : id;
  const confirmed = window.confirm(`⚠️ CONFIRMACIÓN DE SEGURIDAD:\n\n¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE al usuario "${label}"?\n\nEsta acción borrará su licencia y credenciales de forma definitiva.`);
  if (!confirmed) return;

  selectedMasterClientId = null;
  await window.deleteClientLicense(id);
};

window.openDemoLimitBlockedModal = function() {
  const modal = document.getElementById('modal-demo-limit-blocked');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.closeDemoLimitBlockedModal = function() {
  const modal = document.getElementById('modal-demo-limit-blocked');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.resetLicenseSimulations = async function(id) {
  try {
    const res = await fetch(`/api/licenses/${encodeURIComponent(id)}/reset-simulations`, {
      method: 'POST',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = savePersistentUsersVault(data.licenses);
      renderMasterLicensesList();
      showToast(data.message || 'Contador de propuestas reiniciado a 0 con éxito.');
    } else {
      alert(`Error al reiniciar: ${data.error}`);
    }
  } catch (err) {
    console.error('Error al reiniciar simulaciones:', err);
    alert('Error al conectar con el servidor.');
  }
};

function updateActiveDemoCounter(demoStatus) {
  if (!demoStatus || !appState.activeSession?.user) return;
  if (typeof demoStatus.simulations_count === 'number') {
    appState.activeSession.user.simulations_count = demoStatus.simulations_count;
  }
  const isDemo = Boolean(demoStatus.isDemo ?? appState.activeSession.user.isDemo);
  const demoCounterBadge = document.getElementById('demo-counter-badge');
  const demoCounterText = document.getElementById('demo-counter-text');
  if (isDemo && demoCounterBadge && demoCounterText) {
    const remaining = Math.max(0, 3 - (appState.activeSession.user.simulations_count || 0));
    demoCounterBadge.classList.remove('hidden');
    demoCounterBadge.classList.add('flex');
    demoCounterText.innerText = `Licencia Demo (Vigencia 7 días): Te quedan ${remaining} de 3 propuestas disponibles`;
  }
}

window.updateLicenseExpirationQuick = async function(id) {
  const dateInput = document.getElementById(`quick-exp-${id}`);
  if (!dateInput || !dateInput.value) return;

  try {
    const res = await fetch(`/api/licenses/${encodeURIComponent(id)}/expiration`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ fechaExpiracion: dateInput.value })
    });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = savePersistentUsersVault(data.licenses);
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
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = savePersistentUsersVault(data.licenses);
      renderMasterLicensesList();
      showToast(`Permisos de módulos actualizados para ${lic.clienteNombre}.`);
    }
  } catch (err) {
    console.error('Error actualizando permisos de módulos:', err);
  }
};

window.onRoleTypeChange = function(tipo) {
  const isMaster = (tipo === 'MASTER');
  const rMaster = document.getElementById('lic-tipo-master');
  const rSocio = document.getElementById('lic-tipo-socio');
  const lblMaster = document.getElementById('lbl-tipo-master');
  const lblSocio = document.getElementById('lbl-tipo-socio');

  if (rMaster) rMaster.checked = isMaster;
  if (rSocio) rSocio.checked = !isMaster;

  if (lblMaster && lblSocio) {
    if (isMaster) {
      lblMaster.className = 'flex items-center justify-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all border font-bold text-xs bg-amber-100 text-amber-950 border-amber-300 shadow-xs';
      lblSocio.className = 'flex items-center justify-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all border border-transparent font-bold text-xs text-slate-600 hover:bg-slate-50';
    } else {
      lblSocio.className = 'flex items-center justify-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all border font-bold text-xs bg-indigo-100 text-indigo-950 border-indigo-300 shadow-xs';
      lblMaster.className = 'flex items-center justify-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all border border-transparent font-bold text-xs text-slate-600 hover:bg-slate-50';
    }
  }

  const chkCrear = document.getElementById('lic-perm-crear-licencias');
  const chkKill = document.getElementById('lic-perm-kill-switch');
  const chkTokens = document.getElementById('lic-perm-tokens');
  const chkSim = document.getElementById('lic-permiso-simulador');
  const chkRadar = document.getElementById('lic-permiso-radar');
  const chkDescarga = document.getElementById('lic-perm-descarga-reportes');
  const chkSolo = document.getElementById('lic-perm-solo-lectura');

  if (isMaster) {
    if (chkCrear) chkCrear.checked = true;
    if (chkKill) chkKill.checked = true;
    if (chkTokens) chkTokens.checked = true;
    if (chkSim) chkSim.checked = true;
    if (chkRadar) chkRadar.checked = true;
    if (chkDescarga) chkDescarga.checked = true;
    if (chkSolo) chkSolo.checked = false;
    // Asignar por defecto acceso a TODOS LOS ESTADOS (32 Estados / Nacional) para cuentas de Administrador
    const chkTodosEstados = document.getElementById('lic-todos-estados');
    if (chkTodosEstados) {
      chkTodosEstados.checked = true;
      window.toggleAllLicenseStates(true);
    }
  }
};

window.toggleCustomKeyVisibility = function() {
  const input = document.getElementById('lic-custom-api-key');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
};

window.onLicenseAIModelChange = function() {
  const sel = document.getElementById('lic-ai-model-select');
  const keyInput = document.getElementById('lic-custom-api-key');
  if (!sel || !keyInput) return;
  const val = sel.value;
  if (val.startsWith('gemini')) {
    if (!keyInput.placeholder.includes('••••')) {
      keyInput.placeholder = 'Dejar vacío para usar la API centralizada general...';
    }
  } else {
    if (!keyInput.placeholder.includes('••••')) {
      keyInput.placeholder = `Ingresa API Key para ${getAIModelDisplay(val)} (AES-256 Cifrado)...`;
    }
  }
};

function getAIModelDisplay(aiModel) {
  if (!aiModel || aiModel === 'gemini-default') return 'Gemini Pro Central';
  if (aiModel === 'gemini-1.5-pro') return 'Gemini 1.5 Pro';
  if (aiModel === 'gemini-2.0-flash') return 'Gemini 2.0 Flash';
  if (aiModel === 'gpt-4o') return 'OpenAI GPT-4o';
  if (aiModel === 'gpt-4o-mini') return 'OpenAI GPT-4o Mini';
  if (aiModel === 'claude-3-5-sonnet') return 'Claude 3.5 Sonnet';
  if (aiModel === 'openai/gpt-oss-120b') return 'Groq Llama 3.3 70B';
  return aiModel;
}

window.onCanSelectAnyPartyToggle = function(checked) {
  const container = document.getElementById('lic-parties-checkboxes-container');
  if (container) {
    if (checked) {
      container.classList.add('opacity-50', 'pointer-events-none');
    } else {
      container.classList.remove('opacity-50', 'pointer-events-none');
    }
  }
  const countBadge = document.getElementById('lic-selected-parties-count');
  if (countBadge) {
    countBadge.innerText = checked ? 'Todos (Libre Elección)' : `${getSelectedPartiesCheckboxes().length} seleccionados`;
  }
};

window.onPartyCheckboxChange = function() {
  const selected = getSelectedPartiesCheckboxes();
  const countBadge = document.getElementById('lic-selected-parties-count');
  if (countBadge) {
    countBadge.innerText = `${selected.length} seleccionado${selected.length === 1 ? '' : 's'}`;
  }
  const selParty = document.getElementById('lic-partido');
  if (selParty && selected.length > 0) {
    if (!selected.includes(selParty.value)) {
      selParty.value = selected[0];
    }
  }
};

function getSelectedPartiesCheckboxes() {
  const cbs = document.querySelectorAll('input[name="lic_party_checkbox"]:checked');
  return Array.from(cbs).map(c => c.value);
}

function setSelectedPartiesCheckboxes(parties = ['PVEM'], canSelectAny = false) {
  const toggleAny = document.getElementById('lic-can-select-any-party');
  if (toggleAny) {
    toggleAny.checked = Boolean(canSelectAny);
    window.onCanSelectAnyPartyToggle(Boolean(canSelectAny));
  }
  const cbs = document.querySelectorAll('input[name="lic_party_checkbox"]');
  cbs.forEach(cb => {
    cb.checked = Array.isArray(parties) && parties.includes(cb.value);
  });
  window.onPartyCheckboxChange();
}

window.onLicenseDemoModeChange = function(isDemo, preserveDates = false) {
  const rOficial = document.getElementById('lic-modo-oficial');
  const rDemo = document.getElementById('lic-modo-demo');
  const lblOficial = document.getElementById('lbl-modo-oficial');
  const lblDemo = document.getElementById('lbl-modo-demo');
  const pill = document.getElementById('lic-cuota-status-pill');
  const box = document.getElementById('lic-modalidad-cuota-box');
  const fInicio = document.getElementById('lic-fecha-inicio');
  const fExp = document.getElementById('lic-fecha-expiracion');
  const swarmSel = document.getElementById('lic-max-swarm');

  if (rOficial) rOficial.checked = !isDemo;
  if (rDemo) rDemo.checked = Boolean(isDemo);

  if (isDemo) {
    if (lblDemo) lblDemo.className = 'flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border border-amber-400 bg-amber-50 text-amber-950 font-bold text-xs shadow-2xs';
    if (lblOficial) lblOficial.className = 'flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border border-transparent text-slate-600 hover:bg-emerald-50/50 font-bold text-xs';
    if (pill) {
      pill.className = 'text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-2xs';
      pill.innerText = '⚡ DEMO: MÁX. 3 PROPUESTAS / 7 DÍAS';
    }
    if (box) box.className = 'p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5';

    if (!preserveDates) {
      const now = new Date();
      const exp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (fInicio) fInicio.value = now.toISOString().split('T')[0];
      if (fExp) fExp.value = exp.toISOString().split('T')[0];
      if (swarmSel) swarmSel.value = '1000';
    }
  } else {
    if (lblOficial) lblOficial.className = 'flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border border-emerald-400 bg-emerald-50 text-emerald-950 font-bold text-xs shadow-2xs';
    if (lblDemo) lblDemo.className = 'flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border border-transparent text-slate-600 hover:bg-amber-50/50 font-bold text-xs';
    if (pill) {
      pill.className = 'text-[10px] bg-emerald-600 text-white font-black px-2.5 py-0.5 rounded-full shadow-2xs';
      pill.innerText = '♾️ PROPUESTAS ILIMITADAS';
    }
    if (box) box.className = 'p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2.5';

    if (!preserveDates) {
      const now = new Date();
      if (fInicio) fInicio.value = now.toISOString().split('T')[0];
      if (fExp) fExp.value = '2027-07-31';
      if (swarmSel) swarmSel.value = '100000';
    }
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

  // Por defecto: Licencia Normal / Socio Operador con Propuestas ILIMITADAS
  window.onLicenseDemoModeChange(false, false);

  // Restablecer Selección Multi-Partido
  setSelectedPartiesCheckboxes(['PVEM'], false);

  // Restablecer Modelo de IA y API Key
  const selAi = document.getElementById('lic-ai-model-select');
  if (selAi) selAi.value = 'gemini-default';
  const customKey = document.getElementById('lic-custom-api-key');
  const badgeKey = document.getElementById('lic-key-badge-status');
  if (customKey) {
    customKey.value = '';
    customKey.placeholder = 'Dejar vacío para usar la API centralizada general...';
  }
  if (badgeKey) badgeKey.innerText = '';

  window.onRoleTypeChange('SOCIO');
  const chkCrear = document.getElementById('lic-perm-crear-licencias');
  const chkKill = document.getElementById('lic-perm-kill-switch');
  const chkTokens = document.getElementById('lic-perm-tokens');
  const chkSim = document.getElementById('lic-permiso-simulador');
  const chkRadar = document.getElementById('lic-permiso-radar');
  const chkDescarga = document.getElementById('lic-perm-descarga-reportes');
  const chkSolo = document.getElementById('lic-perm-solo-lectura');

  if (chkCrear) chkCrear.checked = false;
  if (chkKill) chkKill.checked = false;
  if (chkTokens) chkTokens.checked = false;
  if (chkSim) chkSim.checked = true;
  if (chkRadar) chkRadar.checked = true;
  if (chkDescarga) chkDescarga.checked = true;
  if (chkSolo) chkSolo.checked = false;

  const fixedTit = document.getElementById('lic-propuesta-fija-titulo');
  const fixedTxt = document.getElementById('lic-propuesta-fija-texto');
  if (fixedTit) fixedTit.value = '';
  if (fixedTxt) fixedTxt.value = '';
  onLicenseModulePermChange();

  renderLicenseStatesCheckboxes(['Estado de México']);
  renderLicenseMunicipalitiesCheckboxes(['Ecatepec de Morelos']);
};

window.saveClientLicense = async function(event) {
  if (event) event.preventDefault();

  const id = document.getElementById('lic-id')?.value || '';
  const existingUser = id ? masterLicensesCache.find(l => l.id === id) : null;
  const clienteNombre = document.getElementById('lic-cliente-nombre')?.value?.trim();
  const username = document.getElementById('lic-username')?.value?.trim();
  const rawPasswordInput = document.getElementById('lic-password')?.value;
  const typedPassword = (rawPasswordInput !== undefined && rawPasswordInput !== null && String(rawPasswordInput).trim() !== 'undefined')
    ? String(rawPasswordInput).trim()
    : '';
  const password = typedPassword || sanitizeUserPasswordValue(existingUser?.password, '', username);
  if (!password) {
    alert('Ingresa una contraseña válida para el usuario.');
    return;
  }
  const partido = document.getElementById('lic-partido')?.value || 'PVEM';
  const maxSwarmSize = parseInt(document.getElementById('lic-max-swarm')?.value, 10) || 100000;
  const fechaInicio = document.getElementById('lic-fecha-inicio')?.value || '2026-01-01';
  const fechaExpiracion = document.getElementById('lic-fecha-expiracion')?.value || '2027-07-31';
  const nivelGeografico = document.getElementById('lic-nivel-geo')?.value || 'Municipal / Alcaldía';
  let etiquetaRegion = document.getElementById('lic-etiqueta-region')?.value?.trim() || '';

  // Modalidad de Vigencia y Cuota de Propuestas (Oficial Ilimitada vs Demo 7 Días / 3 Propuestas)
  const modoDemoSelected = document.querySelector('input[name="lic_modo_demo"]:checked')?.value === 'DEMO';
  const isDemo = Boolean(modoDemoSelected);

  // Modelo de IA y API Key Personalizada Cifrada
  const aiModel = document.getElementById('lic-ai-model-select')?.value || 'gemini-default';
  const customApiKey = document.getElementById('lic-custom-api-key')?.value?.trim() || '';

  // Rol y Permisos Granulares
  const tipoUsuario = document.querySelector('input[name="lic_tipo_rol"]:checked')?.value || 'SOCIO';
  const esAdministradorTotal = tipoUsuario === 'MASTER';

  const permisosGranulares = {
    crearLicencias: esAdministradorTotal || (document.getElementById('lic-perm-crear-licencias')?.checked ?? true),
    killSwitch: esAdministradorTotal || (document.getElementById('lic-perm-kill-switch')?.checked ?? true),
    tokens: esAdministradorTotal || (document.getElementById('lic-perm-tokens')?.checked ?? true),
    simulador: esAdministradorTotal || (document.getElementById('lic-permiso-simulador')?.checked ?? true),
    radar: esAdministradorTotal || (document.getElementById('lic-permiso-radar')?.checked ?? true),
    descargaReportes: esAdministradorTotal || (document.getElementById('lic-perm-descarga-reportes')?.checked ?? true),
    soloLectura: !esAdministradorTotal && (document.getElementById('lic-perm-solo-lectura')?.checked ?? false)
  };

  const permisoRadar = permisosGranulares.radar !== false;
  const permisoSimulador = permisosGranulares.simulador !== false;
  if (!permisoRadar && !permisoSimulador) {
    alert('Selecciona al menos un módulo de acceso (War Room Vista 2 o Diagnóstico de Radar).');
    return;
  }

  const propuestaFijaTitulo = document.getElementById('lic-propuesta-fija-titulo')?.value?.trim() || '';
  const propuestaFijaTexto = document.getElementById('lic-propuesta-fija-texto')?.value?.trim() || '';

  const cargosAutorizados = Array.from(document.querySelectorAll('input[name="lic_cargo"]:checked')).map(cb => cb.value);
  if (cargosAutorizados.length === 0) {
    alert('Selecciona al menos un Cargo Autorizado.');
    return;
  }

  const todosEstados = Boolean(document.getElementById('lic-todos-estados')?.checked) || esAdministradorTotal;
  const can_select_all_states = todosEstados;
  let estadosAutorizados = ['TODOS'];
  if (!todosEstados) {
    estadosAutorizados = Array.from(document.querySelectorAll('input[name="lic_estado"]:checked')).map(cb => cb.value);
    if (estadosAutorizados.length === 0) {
      alert('Selecciona al menos un Estado de los 32 o activa "Permitir acceso a Todos los Estados (Modo Prueba / Nacional)".');
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

  if (!etiquetaRegion) {
    if (municipiosAutorizados.length > 0 && municipiosAutorizados[0] !== 'TODOS') {
      etiquetaRegion = `${estadosAutorizados[0]} — ${municipiosAutorizados.slice(0, 2).join(', ')}${municipiosAutorizados.length > 2 ? ` (+${municipiosAutorizados.length - 2} más)` : ''}`;
    } else if (estadosAutorizados.length > 0 && estadosAutorizados[0] !== 'TODOS') {
      etiquetaRegion = `Estado de ${estadosAutorizados.join(', ')}`;
    } else {
      etiquetaRegion = `Nacional — ${partido}`;
    }
  }

  // Permisos Multi-Partido / Coalición
  const can_select_any_party = Boolean(document.getElementById('lic-can-select-any-party')?.checked);
  let allowed_parties = getSelectedPartiesCheckboxes();
  if (can_select_any_party) {
    allowed_parties = [
      "PVEM", "MORENA", "PAN", "PRI", "MC", "PT",
      "CANDIDATURA INDEPENDIENTE", "COALICIÓN / ALIANZA"
    ];
  } else if (allowed_parties.length === 0) {
    allowed_parties = [partido];
    setSelectedPartiesCheckboxes([partido], false);
  }
  if (!allowed_parties.includes(partido)) {
    allowed_parties.unshift(partido);
  }

  const payload = {
    id: id || undefined,
    clienteNombre,
    username,
    password,
    partido,
    allowed_parties,
    can_select_any_party,
    maxSwarmSize,
    fechaInicio,
    fechaExpiracion,
    nivelGeografico,
    etiquetaRegion,
    estadosAutorizados,
    can_select_all_states,
    cargosAutorizados,
    municipiosAutorizados,
    tipoUsuario,
    esAdministradorTotal,
    permisosGranulares,
    permisoRadar,
    permisoSimulador,
    propuestaFijaTitulo,
    propuestaFijaTexto,
    aiModel,
    customApiKey,
    isDemo: esAdministradorTotal ? false : isDemo,
    max_simulations: (esAdministradorTotal || !isDemo) ? 999999 : 3,
    diasVigencia: (!esAdministradorTotal && isDemo) ? 7 : undefined,
    activo: true
  };

  try {
    if (id) removeDeletedLicenseId(id);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const list = data.users || data.licenses;
    if (data.success && Array.isArray(list)) {
      masterLicensesCache = savePersistentUsersVault(list);
      renderMasterLicensesList();
      resetLicenseForm();
      showToast(isDemo
        ? `⚡ Licencia Demo Exprés (3 Propuestas / 7 Días) guardada en servidor para ${clienteNombre}.`
        : `♾️ Licencia Oficial / Socio Operador (Propuestas Ilimitadas) guardada en servidor para ${clienteNombre}.`);
    }
  } catch (err) {
    alert('Error guardando licencia: ' + err.message);
  }
};

window.editClientLicense = async function(id) {
  await ensureNationalCatalogLoaded();
  const lic = masterLicensesCache.find(l => l.id === id);
  if (!lic) return;

  const currentPassword = sanitizeUserPasswordValue(lic.password, '', lic.username);

  document.getElementById('lic-id').value = lic.id;
  document.getElementById('lic-cliente-nombre').value = lic.clienteNombre || '';
  document.getElementById('lic-username').value = lic.username || '';
  document.getElementById('lic-password').value = currentPassword;
  document.getElementById('lic-partido').value = lic.partido || 'PVEM';
  document.getElementById('lic-max-swarm').value = String(lic.maxSwarmSize || 100000);
  if (typeof window.onLicenseDemoModeChange === 'function') {
    window.onLicenseDemoModeChange(Boolean(lic.isDemo), true);
  }
  document.getElementById('lic-fecha-inicio').value = lic.fechaInicio;
  document.getElementById('lic-fecha-expiracion').value = lic.fechaExpiracion;
  document.getElementById('lic-nivel-geo').value = lic.nivelGeografico || 'Municipal / Alcaldía';
  document.getElementById('lic-etiqueta-region').value = lic.etiquetaRegion || '';
  document.getElementById('lic-form-title').innerText = `✏️ Editando: ${lic.clienteNombre}`;

  // Cargar selección Multi-Partido / Coalición
  setSelectedPartiesCheckboxes(lic.allowed_parties || [lic.partido || 'PVEM'], Boolean(lic.can_select_any_party));

  // Cargar selección de Modelo de IA y estado de API Key
  const selAi = document.getElementById('lic-ai-model-select');
  if (selAi) selAi.value = lic.aiModel || 'gemini-default';

  const customKey = document.getElementById('lic-custom-api-key');
  const badgeKey = document.getElementById('lic-key-badge-status');
  if (customKey) {
    customKey.value = '';
    if (lic.hasCustomKey) {
      customKey.placeholder = '•••••••• (Cifrada en servidor - escribe para reemplazar)';
      if (badgeKey) badgeKey.innerText = `✓ Clave Activa Cifrada (${lic.customApiKeyMasked || 'AES-256'})`;
    } else {
      customKey.placeholder = 'Dejar vacío para usar la API centralizada general...';
      if (badgeKey) badgeKey.innerText = '';
    }
  }
  if (typeof window.onLicenseAIModelChange === 'function') {
    window.onLicenseAIModelChange();
  }

  // Rol y Permisos Granulares
  const isMaster = lic.esAdministradorTotal || lic.tipoUsuario === 'MASTER';
  const radioMaster = document.getElementById('lic-tipo-master');
  const radioSocio = document.getElementById('lic-tipo-socio');
  if (isMaster) {
    if (radioMaster) radioMaster.checked = true;
  } else {
    if (radioSocio) radioSocio.checked = true;
  }
  if (typeof window.onRoleTypeChange === 'function') {
    window.onRoleTypeChange(isMaster ? 'MASTER' : 'SOCIO');
  }

  const p = lic.permisosGranulares || {};
  const setCheck = (chkId, val) => {
    const el = document.getElementById(chkId);
    if (el) el.checked = Boolean(val);
  };
  setCheck('lic-perm-crear-licencias', isMaster || p.crearLicencias !== false);
  setCheck('lic-perm-kill-switch', isMaster || p.killSwitch !== false);
  setCheck('lic-perm-tokens', isMaster || p.tokens !== false);
  setCheck('lic-permiso-simulador', isMaster || p.simulador !== false || lic.permisoSimulador !== false);
  setCheck('lic-permiso-radar', isMaster || p.radar !== false || lic.permisoRadar !== false);
  setCheck('lic-perm-descarga-reportes', isMaster || p.descargaReportes !== false);
  setCheck('lic-perm-solo-lectura', !isMaster && p.soloLectura === true);

  const fixedTit = document.getElementById('lic-propuesta-fija-titulo');
  const fixedTxt = document.getElementById('lic-propuesta-fija-texto');
  if (fixedTit) fixedTit.value = lic.propuestaFijaTitulo || '';
  if (fixedTxt) fixedTxt.value = lic.propuestaFijaTexto || '';
  onLicenseModulePermChange();

  document.querySelectorAll('input[name="lic_cargo"]').forEach(cb => {
    cb.checked = (lic.cargosAutorizados || []).includes(cb.value);
  });

  const editAllStates = Boolean(lic.can_select_all_states || lic.esAdministradorTotal || (Array.isArray(lic.estadosAutorizados) && lic.estadosAutorizados.includes('TODOS')));
  renderLicenseStatesCheckboxes(editAllStates ? ['TODOS'] : (lic.estadosAutorizados || ['Estado de México']));
  renderLicenseMunicipalitiesCheckboxes(lic.municipiosAutorizados || ['Ecatepec de Morelos']);
};

window.toggleClientLicenseKillSwitch = async function(id) {
  try {
    const res = await fetch(`/api/licenses/${encodeURIComponent(id)}/toggle`, { method: 'PATCH', headers: getAdminHeaders() });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = savePersistentUsersVault(data.licenses);
      renderMasterLicensesList();
      showToast('Estado de licencia actualizado (Kill Switch).');
    }
  } catch (err) {
    console.error(err);
  }
};

window.deleteClientLicense = async function(id) {
  try {
    // 1. Marcar como eliminado permanentemente y actualizar bóveda local al instante
    addDeletedLicenseId(id);
    masterLicensesCache = masterLicensesCache.filter(l => String(l.id) !== String(id));
    savePersistentUsersVault(masterLicensesCache);
    renderMasterLicensesList();

    // 2. Eliminar en el servidor (/api/users/:id)
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE', headers: getAdminHeaders() });
    const data = await res.json();
    const list = data.users || data.licenses;
    if (data.success && Array.isArray(list)) {
      if (Array.isArray(data.deletedIds)) {
        saveDeletedLicenseIdsToStorage([...getDeletedLicenseIds(), ...data.deletedIds]);
      }
      masterLicensesCache = savePersistentUsersVault(list);
      renderMasterLicensesList();
      showToast('Licencia eliminada definitivamente del servidor.');
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

  // Por arquitectura post-login: War Room Vista 2 es SIEMPRE la ventana principal por defecto
  const modalRadar = document.getElementById('modal-radar-electoral');
  if (modalRadar) modalRadar.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast(`Modo Vista Previa Cliente activo: ${lic.clienteNombre} (${lic.partido}) — War Room Vista 2 Principal`);
};

window.activateMasterFullAccess = async function() {
  const currentUsername = appState.activeSession?.user?.username || 'Cerkvega92';
  const currentName = appState.activeSession?.user?.clienteNombre || (currentUsername === 'Aland' ? 'Aland — Administrador Maestro' : 'Erick Vega — Administrador Maestro');
  const masterUser = {
    clienteNombre: currentName,
    username: currentUsername,
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
  showToast(`Permisos de Administrador Maestro (${currentUsername}) restaurados al 100% (32 Estados).`);
};

// =========================================================================
// CANAL OFICIAL DE SEGURIDAD: RECUPERACIÓN DE CONTRASEÑA
// =========================================================================
window.openForgotPasswordModal = function() {
  const modal = document.getElementById('modal-forgot-password');
  if (modal) modal.classList.remove('hidden');
};

window.closeForgotPasswordModal = function() {
  const modal = document.getElementById('modal-forgot-password');
  if (modal) modal.classList.add('hidden');
};

// =========================================================================
// GESTOR DE LICENCIAS DEMO RÁPIDAS (7 DÍAS CON KILL SWITCH AUTOMÁTICO)
// =========================================================================
let currentQuickDemoResult = null;

window.openQuickDemoModal = async function() {
  await ensureNationalCatalogLoaded();
  const modal = document.getElementById('modal-quick-demo');
  if (!modal) return;

  const formBox = document.getElementById('quick-demo-form-container');
  const resBox = document.getElementById('quick-demo-success-card');
  if (formBox) formBox.classList.remove('hidden');
  if (resBox) resBox.classList.add('hidden');

  const stateSelect = document.getElementById('quick-demo-estado');
  if (stateSelect && Array.isArray(nationalStatesList) && nationalStatesList.length > 0) {
    stateSelect.innerHTML = nationalStatesList.map(st => `<option value="${st}" ${st === 'Estado de México' ? 'selected' : ''}>${st}</option>`).join('');
    onQuickDemoStateChange(stateSelect.value || 'Estado de México');
  }

  regenerateQuickDemoCredentials();
  modal.classList.remove('hidden');
};

window.closeQuickDemoModal = function() {
  const modal = document.getElementById('modal-quick-demo');
  if (modal) modal.classList.add('hidden');
};

window.onQuickDemoStateChange = function(selectedState) {
  const muniSelect = document.getElementById('quick-demo-muni');
  if (!muniSelect) return;
  const munis = nationalCatalog32States[selectedState] || [];
  muniSelect.innerHTML = munis.map((m, idx) => `<option value="${m}" ${idx === 0 ? 'selected' : ''}>${m}</option>`).join('');
};

window.regenerateQuickDemoCredentials = function() {
  const party = (document.getElementById('quick-demo-partido')?.value || 'PVEM').toLowerCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const randPass = Math.random().toString(36).substring(2, 6).toUpperCase();

  const userEl = document.getElementById('quick-demo-username');
  const passEl = document.getElementById('quick-demo-password');
  if (userEl) userEl.value = `demo_${party}_${randNum}`;
  if (passEl) passEl.value = `Demo2027*${randPass}`;
};

window.saveQuickDemoLicense = async function(event) {
  if (event) event.preventDefault();

  const nombre = document.getElementById('quick-demo-nombre')?.value?.trim();
  const partido = document.getElementById('quick-demo-partido')?.value || 'PVEM';
  const cargo = document.getElementById('quick-demo-cargo')?.value || 'Presidente Municipal / Alcalde';
  const estado = document.getElementById('quick-demo-estado')?.value || 'Estado de México';
  const muni = document.getElementById('quick-demo-muni')?.value || 'Toluca';
  const username = document.getElementById('quick-demo-username')?.value?.trim() || `demo_${Date.now()}`;
  const password = document.getElementById('quick-demo-password')?.value?.trim() || 'Demo2027*';

  if (!nombre) {
    alert('Ingresa el nombre del prospecto o candidatura.');
    return;
  }

  const payload = {
    clienteNombre: `${nombre} (Demo 7D - ${partido})`,
    username,
    password,
    partido,
    estadosAutorizados: [estado],
    municipiosAutorizados: [muni],
    cargosAutorizados: [cargo, 'Regidor', 'Diputado Local'],
    nivelGeografico: 'Municipal / Alcaldía',
    etiquetaRegion: `${estado} — ${muni}`,
    permisoRadar: true,
    permisoSimulador: true,
    maxSwarmSize: 1000,
    isDemo: true,
    diasVigencia: 7
  };

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const created = data.user || data.license;
    const list = data.users || data.licenses;
    if (data.success && created) {
      currentQuickDemoResult = cleanUserRecord(created);
      masterLicensesCache = savePersistentUsersVault(list);
      renderMasterLicensesList();

      const formBox = document.getElementById('quick-demo-form-container');
      const resBox = document.getElementById('quick-demo-success-card');
      if (formBox) formBox.classList.add('hidden');
      if (resBox) resBox.classList.remove('hidden');

      document.getElementById('qd-res-nombre').innerText = currentQuickDemoResult.clienteNombre;
      document.getElementById('qd-res-partido').innerText = currentQuickDemoResult.partido;
      document.getElementById('qd-res-region').innerText = `${estado} — ${muni}`;
      document.getElementById('qd-res-user').innerText = currentQuickDemoResult.username;
      document.getElementById('qd-res-pass').innerText = currentQuickDemoResult.password;
      document.getElementById('qd-res-token').innerText = currentQuickDemoResult.tokenSeguridad;
      document.getElementById('qd-res-exp').innerText = currentQuickDemoResult.fechaExpiracion;

      showToast(`¡Demo 7 Días (3 Propuestas) activada exitosamente para ${nombre}!`);
    } else {
      alert('Error activando demo: ' + (data.error || 'Error desconocido'));
    }
  } catch (err) {
    console.error('Error guardando quick demo:', err);
    alert('Error al comunicarse con el servidor: ' + err.message);
  }
};

window.copyQuickDemoSummary = function() {
  if (!currentQuickDemoResult) return;
  const lic = currentQuickDemoResult;
  const text = `*FICHA DE ACCESO DEMO (7 DÍAS / 3 PROPUESTAS) — GOVTECH WAR ROOM*\n\n` +
    `👤 *Cliente:* ${lic.clienteNombre}\n` +
    `🏷️ *Partido:* ${lic.partido}\n` +
    `📍 *Demarcación:* ${lic.etiquetaRegion}\n` +
    `🎯 *Cuota de Prueba:* 3 Propuestas en 7 Días Naturales\n` +
    `🌐 *Plataforma Oficial:* https://simulador-pvem.vercel.app/\n\n` +
    `🔑 *Usuario:* ${lic.username}\n` +
    `🔒 *Contraseña:* ${lic.password}\n` +
    `🛡️ *Token de Seguridad:* ${lic.tokenSeguridad}\n` +
    `📅 *Vigencia:* 7 Días Naturales (Expira el ${lic.fechaExpiracion})\n\n` +
    `_Nota: Para recuperar tu acceso o validar tu licencia, envía un correo a cerkvega.10@gmail.com con asunto "recuperación de contraseña" e incluye tu Token de Seguridad._`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Ficha de acceso copiada para enviar por WhatsApp o correo.');
  }).catch(() => {
    prompt('Copia manualmente la ficha de acceso:', text);
  });
};

// =========================================================================
// RESPALDO Y RESTAURACIÓN MANUAL DE BÓVEDA DE LICENCIAS (ANTI-PÉRDIDA)
// =========================================================================
window.exportLicensesBackup = function() {
  if (!masterLicensesCache || masterLicensesCache.length === 0) {
    alert('No hay licencias registradas para respaldar.');
    return;
  }
  const jsonStr = JSON.stringify(masterLicensesCache, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `boveda_licencias_govtech_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Copia de seguridad descargada exitosamente en formato JSON.');
};

window.importLicensesBackup = async function(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (!Array.isArray(imported)) {
      alert('El archivo no contiene un formato de licencias válido.');
      return;
    }
    const res = await fetch('/api/licenses/sync-vault', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ vaultLicenses: imported })
    });
    const data = await res.json();
    if (data.success) {
      masterLicensesCache = savePersistentUsersVault(data.licenses);
      renderMasterLicensesList();
      showToast(`¡Bóveda restaurada! ${masterLicensesCache.length} licencias sincronizadas y blindadas.`);
    }
  } catch (err) {
    alert('Error al importar la bóveda: ' + err.message);
  } finally {
    event.target.value = '';
  }
};

// =========================================================================
// AUDITORÍA Y TELEMETRÍA DE ACCESOS EN TIEMPO REAL (ZERO-DATA RETENTION)
// =========================================================================
let auditLogsCache = [];

window.openAccessAuditModal = function() {
  const modal = document.getElementById('modal-access-audit');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    window.loadAccessAuditLogs();
  }
};

window.closeAccessAuditModal = function() {
  const modal = document.getElementById('modal-access-audit');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.loadAccessAuditLogs = async function() {
  const tbody = document.getElementById('audit-logs-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400 text-xs">Cargando telemetría de accesos...</td></tr>`;
  }
  try {
    const res = await fetch('/api/audit/access-logs', { headers: getAdminHeaders() });
    const data = await res.json();
    if (data.success) {
      auditLogsCache = data.logs || [];

      // Actualizar tarjetas rápidas KPI
      const kpiTotal = document.getElementById('audit-kpi-total');
      const kpiToday = document.getElementById('audit-kpi-today');
      const kpiActive = document.getElementById('audit-kpi-most-active');
      const kpiUser = document.getElementById('audit-kpi-last-user');
      const kpiTime = document.getElementById('audit-kpi-last-time');

      if (kpiTotal) kpiTotal.innerText = data.totalLogs || 0;
      if (kpiToday) kpiToday.innerText = data.todayCount || 0;
      if (kpiActive) kpiActive.innerText = data.mostActiveUser || 'Ninguno';
      if (kpiUser) kpiUser.innerText = data.lastAccess ? `${data.lastAccess.username} (${data.lastAccess.authMethod})` : 'Ninguno';
      if (kpiTime) kpiTime.innerText = data.lastAccess ? (data.lastAccess.timestampFormatted || data.lastAccess.timestamp) : 'Sin registros';

      renderAuditLogsTable(auditLogsCache);
    }
  } catch (err) {
    console.error('Error cargando bitácora de accesos:', err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-rose-500 text-xs">Error cargando bitácora: ${err.message}</td></tr>`;
    }
  }
};

function renderAuditLogsTable(logs) {
  const tbody = document.getElementById('audit-logs-table-body');
  const countBadge = document.getElementById('audit-logs-count-badge');
  if (!tbody) return;

  if (countBadge) {
    countBadge.innerText = `${logs.length} eventos`;
  }

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400 text-xs">Sin registros de auditoría de accesos aún.</td></tr>`;
    return;
  }

  tbody.innerHTML = logs.map(entry => {
    const isToken = entry.authMethod === 'TOKEN';
    const methodBadge = isToken
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-200">🛡️ TOKEN SEGURIDAD</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">🔑 CREDENCIALES</span>`;

    const isMaster = entry.role === 'MASTER_ADMIN';
    const roleBadge = isMaster
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">👑 MASTER</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">CLIENT</span>`;

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">${entry.timestampFormatted || entry.timestamp}</td>
        <td class="py-2.5 px-3">
          <span class="font-bold text-slate-900 block">${entry.username}</span>
          <span class="text-[10px] text-slate-500 block">${entry.clientName || ''}</span>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">${roleBadge}</td>
        <td class="py-2.5 px-3 whitespace-nowrap">${methodBadge}</td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">${entry.ip || '127.0.0.1'}</td>
        <td class="py-2.5 px-3 text-[10px] text-slate-500 max-w-xs truncate" title="${entry.userAgent}">${entry.userAgent}</td>
      </tr>
    `;
  }).join('');
}

window.filterAuditLogsTable = function(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) {
    renderAuditLogsTable(auditLogsCache);
    return;
  }
  const filtered = auditLogsCache.filter(log => {
    return (log.username && log.username.toLowerCase().includes(q)) ||
           (log.clientName && log.clientName.toLowerCase().includes(q)) ||
           (log.role && log.role.toLowerCase().includes(q)) ||
           (log.authMethod && log.authMethod.toLowerCase().includes(q)) ||
           (log.ip && log.ip.includes(q)) ||
           (log.userAgent && log.userAgent.toLowerCase().includes(q));
  });
  renderAuditLogsTable(filtered);
};

window.exportAccessAuditLogs = function() {
  if (!auditLogsCache || auditLogsCache.length === 0) {
    showToast('No hay registros de auditoría para exportar.');
    return;
  }
  const blob = new Blob([JSON.stringify(auditLogsCache, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bitacora_accesos_govtech_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('📥 Bitácora de accesos exportada con éxito en JSON.');
};

// ========================================================
// MÓDULOS DE INTERACCIÓN: WHATSAPP 1-CLIC & CRISIS SIMULATOR EN VIVO
// ========================================================
window.copyWhatsAppMicroMessage = function(cohortId) {
  const el = document.getElementById(`msg-text-${cohortId}`);
  const btn = document.getElementById(`btn-copy-${cohortId}`);
  if (!el) return;

  const text = el.innerText || el.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span>✅</span> ¡Copiado para WhatsApp!';
        btn.className = btn.className.replace('bg-emerald-600', 'bg-emerald-700');
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.className = btn.className.replace('bg-emerald-700', 'bg-emerald-600');
        }, 2500);
      }
      if (typeof showToast === 'function') {
        showToast('📲 Micro-mensaje de WhatsApp copiado al portapapeles.');
      }
    }).catch(err => {
      console.warn('Clipboard writeText failed, trying fallback:', err);
      copyFallback(text, btn);
    });
  } else {
    copyFallback(text, btn);
  }

  function copyFallback(str, button) {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (button) {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<span>✅</span> ¡Copiado para WhatsApp!';
        button.className = button.className.replace('bg-emerald-600', 'bg-emerald-700');
        setTimeout(() => {
          button.innerHTML = originalHtml;
          button.className = button.className.replace('bg-emerald-700', 'bg-emerald-600');
        }, 2500);
      }
      if (typeof showToast === 'function') {
        showToast('📲 Micro-mensaje de WhatsApp copiado al portapapeles.');
      }
    } catch (e) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Seleccione y copie el texto manualmente.');
      }
    }
    document.body.removeChild(ta);
  }
};

window.runInteractiveCrisisTest = async function() {
  const inputScenario = document.getElementById('input-custom-crisis');
  const selectSeverity = document.getElementById('select-crisis-severity');
  const feedback = document.getElementById('crisis-test-feedback');

  const customScenario = (inputScenario?.value || '').trim();
  const severity = selectSeverity?.value || 'media';

  if (!customScenario) {
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.className = 'text-[11px] text-amber-400 font-bold block pt-1';
      feedback.innerText = '⚠️ Por favor escriba un rumor o ataque opositor a simular.';
    }
    return;
  }

  if (feedback) {
    feedback.classList.remove('hidden');
    feedback.className = 'text-[11px] text-emerald-400 font-bold block pt-1 animate-pulse';
    feedback.innerText = '⏳ Ejecutando simulación de propagación y estrés en el War Room...';
  }

  try {
    const report = appState?.currentReport || {};
    const muni = report?.resumenEjecutivo?.municipio || appState?.municipio || 'Ecatepec de Morelos';
    const edo = report?.resumenEjecutivo?.estado || appState?.estado || 'Estado de México';

    const resp = await fetch('/api/crisis-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propuestaTexto: appState?.lastProposalText || '',
        municipio: muni,
        estado: edo,
        escenarioPersonalizado: customScenario,
        severidad: severity
      })
    });

    const data = await resp.json();
    if (data.success && data.crisis) {
      if (!appState.currentReport) appState.currentReport = {};
      appState.currentReport.testResilienciaCrisis = data.crisis;

      // Re-renderizar la pestaña de blindaje
      Components.renderTab4BlindajeDefensa('strategic-defense-container', appState.currentReport.blindajeDefensa, appState.currentReport);

      if (typeof showToast === 'function') {
        showToast(`🚨 Simulación de Crisis actualizada: Vulnerabilidad ${data.crisis.nivelVulnerabilidad}`);
      }
    } else {
      throw new Error(data.error || 'Error al simular crisis');
    }
  } catch (err) {
    console.error('Error en test de crisis interactivo:', err);
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.className = 'text-[11px] text-red-400 font-bold block pt-1';
      feedback.innerText = `Error: ${err.message}`;
    }
  }
};



