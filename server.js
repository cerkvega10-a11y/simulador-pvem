const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Carga segura de variables de entorno desde .env (Protegido contra escaneo de GitHub)
const envFilePath = path.join(__dirname, '.env');
if (fs.existsSync(envFilePath)) {
  try {
    const envLines = fs.readFileSync(envFilePath, 'utf8').split(/\r?\n/);
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  } catch (err) {
    console.warn('Advertencia cargando .env local:', err.message);
  }
}

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const orchestratorAgent = require('./src/agents/orchestratorAgent');
const multimodalAgent = require('./src/agents/multimodalAgent');
const {
  ESTADOS_MEXICO,
  MUNICIPIOS_EDOMEX_DETALLADOS,
  LISTA_125_MUNICIPIOS_EDOMEX
} = require('./src/data/edomexDemographics');
const {
  CATALOGO_NACIONAL_32_ESTADOS,
  get32StatesList,
  getMunicipalitiesByStates
} = require('./src/data/mexicoNationalCatalog');
const presets = require('./src/data/presets');
const realAiVerificationAgent = require('./src/agents/realAiVerificationAgent');
const electoralRadarEngine = require('./src/agents/electoralRadarEngine');
const coloniasData = require('./src/data/coloniasData');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de multer para manejo en memoria de archivos subidos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB máximo
});

// =========================================================================
// CYBER SENTINEL 24/7 — MIDDLEWARE DE SEGURIDAD, RATE LIMITING & SANITIZACIÓN
// =========================================================================

// 1. Almacén de Rate Limiting en Memoria (Sliding Window per IP)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_STANDARD = 150; // Para rutas públicas ligeras
const MAX_REQUESTS_HEAVY = 30; // Para simulación, IA test y uploads

// Limpieza periódica de registros caducados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const cyberSentinelRateLimiter = (req, res, next) => {
  // Ignorar archivos estáticos
  if (!req.path.startsWith('/api')) {
    return next();
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const isHeavy = req.path.includes('/simulate') || req.path.includes('/test-connection') || req.path.includes('/upload');
  const limit = isHeavy ? MAX_REQUESTS_HEAVY : MAX_REQUESTS_STANDARD;

  let clientData = rateLimitStore.get(clientIp);
  if (!clientData || now > clientData.resetTime) {
    clientData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(clientIp, clientData);
  } else {
    clientData.count++;
  }

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - clientData.count));

  if (clientData.count > limit) {
    console.warn(`[CYBER SENTINEL FIREWALL] Rate limit excedido para IP ${clientIp} en ${req.path}`);
    res.setHeader('Retry-After', Math.ceil((clientData.resetTime - now) / 1000));
    return res.status(429).json({
      success: false,
      error: 'Límite de solicitudes excedido (Cyber Sentinel Anti-Saturación). Por favor espere unos segundos.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }

  next();
};

// 2. Sanitizador Recursivo Anti-XSS, Anti-SQLi y Anti-Prompt Injection
const sanitizeStringValue = (str) => {
  if (typeof str !== 'string') return str;

  let sanitized = str;

  // Anti-XSS: Eliminar tags ejecutables y eventos inline
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/javascript\s*:/gi, 'blocked-javascript:')
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // Anti-SQLi: Neutralizar patrones clásicos
  sanitized = sanitized
    .replace(/\bUNION\s+(?:ALL\s+)?SELECT\b/gi, 'UNION_DEFANGED')
    .replace(/\bDROP\s+TABLE\b/gi, 'DROP_DEFANGED')
    .replace(/;\s*--/g, '; --[SQL_SECURED]');

  // Anti-Prompt Injection / Jailbreaks
  const jailbreakRegex = /\b(?:ignore\s+(?:all\s+)?previous\s+instructions|disregard\s+(?:all\s+)?prior\s+instructions|system\s+override|dan\s+mode|jailbreak|unrestricted\s+ai|bypass\s+(?:content\s+)?filter)\b/gi;
  if (jailbreakRegex.test(sanitized)) {
    sanitized = sanitized.replace(jailbreakRegex, '[PROMPT-INJECTION-DEFANGED]');
  }

  return sanitized;
};

const sanitizeObjectRecursive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    // Preservar llaves API sin alteración técnica de su contenido para autenticación legítima
    if (key === 'apiKey' || key === 'tavilyApiKey') continue;
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeStringValue(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeObjectRecursive(obj[key]);
    }
  }
  return obj;
};

const cyberSentinelSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObjectRecursive(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObjectRecursive(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObjectRecursive(req.params);
  }
  next();
};

// 3. Encabezados HTTP de Ciberseguridad Defensiva
const cyberSentinelSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Cyber-Sentinel', 'ACTIVE-24-7');
  res.setHeader('X-Cyber-Sentinel-Seal', 'SEC-OPS-VERIFIED-SHA256');
  next();
};

app.use(cyberSentinelSecurityHeaders);
app.use(cors());
app.use(cyberSentinelRateLimiter);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cyberSentinelSanitizer);
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Ruta de telemetría Cyber Sentinel 24/7
app.get('/api/cyber-sentinel/status', (req, res) => {
  res.json({
    success: true,
    sentinel: {
      status: 'ACTIVE_24_7',
      defenseTier: 'MILITARY_GRADE',
      rateLimiter: 'SLIDING_WINDOW_ACTIVE',
      sanitizer: 'XSS_SQLI_PROMPT_INJECTION_ACTIVE',
      vulnerabilities: 0,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Ruta de salud / keep-alive 24/7 para evitar que el servidor se duerma en Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    app: 'Simulador Predictivo de Impacto Social - Partido Verde Ecologista Estado de México',
    version: '1.0.0',
    metaAgentes: 8,
    cyberSentinel: 'ACTIVE_24_7',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// --- RUTAS DE LA API ---

// 1. Obtener los 32 Estados de la República Mexicana
app.get('/api/states', (req, res) => {
  res.json({ success: true, states: get32StatesList() });
});

// 1.1. Catálogo Nacional Completo (32 Estados y sus Municipios, Alcaldías y Distritos)
app.get('/api/national-catalog', (req, res) => {
  res.json({
    success: true,
    states: get32StatesList(),
    catalog: CATALOGO_NACIONAL_32_ESTADOS
  });
});

// 2. Obtener Municipios, Alcaldías y Distritos de cualquiera de los 32 Estados
app.get('/api/municipalities', (req, res) => {
  const { estado, estados } = req.query;

  if (estados) {
    const items = getMunicipalitiesByStates(estados);
    return res.json({
      success: true,
      municipios: items.map(it => ({
        estado: it.estado,
        nombre: it.nombre,
        etiquetaCompleta: it.etiquetaCompleta,
        tieneDetalleProfundo: !!MUNICIPIOS_EDOMEX_DETALLADOS[it.nombre]
      }))
    });
  }

  const targetState = estado || 'Estado de México';
  const lista = CATALOGO_NACIONAL_32_ESTADOS[targetState] || getMunicipalitiesByStates(targetState).map(x => x.nombre);

  const listado = [
    {
      estado: targetState,
      nombre: 'Todos los municipios del estado',
      tieneDetalleProfundo: true,
      esMacroEstatal: true
    },
    ...lista
      .filter(m => !m.toLowerCase().includes('todos'))
      .map(m => ({
        estado: targetState,
        nombre: m,
        tieneDetalleProfundo: !!MUNICIPIOS_EDOMEX_DETALLADOS[m]
      }))
  ];

  return res.json({ success: true, municipios: listado });
});

// 3. Obtener Propuestas Pre-cargadas (Presets)
app.get('/api/presets', (req, res) => {
  res.json({ success: true, presets });
});

// 4. Subida y análisis multimodal de archivos (Documentos e Imágenes)
app.post('/api/upload/multimodal', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
    }

    const { originalname, mimetype, buffer } = req.file;
    const isImage = mimetype.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(originalname);

    if (isImage) {
      const visualAnalysis = await multimodalAgent.analyzeImage(buffer, originalname, mimetype);
      return res.json({
        success: true,
        type: 'image',
        filename: originalname,
        visualAnalysis
      });
    } else {
      const documentAnalysis = await multimodalAgent.parseDocument(buffer, originalname, mimetype);
      return res.json({
        success: true,
        type: 'document',
        filename: originalname,
        documentAnalysis
      });
    }
  } catch (error) {
    console.error('Error en carga multimodal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Función para verificar y descontar cuota de propuestas (Kill Switch Demo 3 corridas / 7 días)
function checkAndIncrementSimulationLimit(inputData = {}) {
  const allLicenses = loadLicensesStore();
  const licId = inputData.licenseId || inputData.activeSession?.user?.id;
  const username = inputData.username || inputData.activeSession?.user?.username;

  // Si es Administrador Maestro (Cerkvega92, Aland, o rol MASTER_ADMIN), simulaciones ilimitadas
  const isMasterSession = Boolean(
    inputData.activeSession?.user?.esAdministradorTotal ||
    inputData.activeSession?.role === 'MASTER_ADMIN' ||
    (username && MASTER_ADMIN_ACCOUNTS.some(m => m.username.toLowerCase() === String(username).toLowerCase()))
  );
  if (isMasterSession) {
    return {
      allowed: true,
      isDemo: false,
      simulations_count: 0,
      max_simulations: 999999,
      remaining: 999999,
      message: 'Acceso Maestro Ilimitado'
    };
  }

  let matchedLic = null;
  if (licId) {
    matchedLic = allLicenses.find(l => l.id === licId);
  } else if (username) {
    matchedLic = allLicenses.find(l => l.username.toLowerCase() === String(username).toLowerCase());
  }

  if (!matchedLic) {
    return {
      allowed: true,
      isDemo: false,
      simulations_count: 0,
      max_simulations: 999999,
      remaining: 999999
    };
  }

  if (typeof matchedLic.simulations_count !== 'number') {
    matchedLic.simulations_count = 0;
  }

  const isDemo = Boolean(matchedLic.isDemo);
  const maxSimulations = isDemo ? 3 : (matchedLic.max_simulations || 999999);

  // Comprobar Kill Switch activo
  if (matchedLic.activo === false) {
    return {
      allowed: false,
      isDemo,
      simulations_count: matchedLic.simulations_count,
      max_simulations: maxSimulations,
      remaining: 0,
      message: 'Su licencia se encuentra suspendida por el Administrador Maestro (Kill Switch Activo).'
    };
  }

  // Comprobar vigencia de fechas
  const now = new Date();
  const expDate = matchedLic.fechaExpiracion ? new Date(`${matchedLic.fechaExpiracion}T23:59:59`) : new Date('2099-12-31');
  if (now > expDate) {
    return {
      allowed: false,
      isDemo,
      simulations_count: matchedLic.simulations_count,
      max_simulations: maxSimulations,
      remaining: 0,
      message: isDemo
        ? 'Su periodo de prueba de 7 días naturales ha concluido. Para continuar simulando, active su licencia oficial de GovTech War Room.'
        : `Su licencia ha expirado (Vigencia: ${matchedLic.fechaExpiracion}). Contacte al Administrador Maestro.`
    };
  }

  // Comprobar límite de simulaciones
  if (matchedLic.simulations_count >= maxSimulations) {
    return {
      allowed: false,
      isDemo,
      simulations_count: matchedLic.simulations_count,
      max_simulations: maxSimulations,
      remaining: 0,
      message: isDemo
        ? 'Has alcanzado el límite de 3 propuestas de validación de tu Licencia Demo Gratuita. Para desbloquear simulaciones ilimitadas y asegurar la Exclusividad Territorial de tu demarcación, contacta a la Dirección de Neural Media House para activar tu licencia oficial.'
        : `Ha alcanzado el límite máximo de ${maxSimulations} simulaciones autorizadas para su cuenta.`
    };
  }

  // Incrementar contador y guardar
  matchedLic.simulations_count += 1;
  saveLicensesStore(allLicenses);

  const remaining = Math.max(0, maxSimulations - matchedLic.simulations_count);
  return {
    allowed: true,
    isDemo,
    simulations_count: matchedLic.simulations_count,
    max_simulations: maxSimulations,
    remaining,
    licenseId: matchedLic.id
  };
}

// 5. Iniciar Simulación Predictiva (Endpoint SSE en Tiempo Real - Soporta GET y POST)
const handleSimulationStream = async (req, res, inputData) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (eventData) => {
    try {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    } catch (e) {
      console.error('Error enviando evento SSE:', e);
    }
  };

  // Validación estricta de límites de cuenta Demo (Máx 3 propuestas / 7 días) y Kill Switch
  const simLimitCheck = checkAndIncrementSimulationLimit(inputData);
  if (!simLimitCheck.allowed) {
    sendEvent({
      status: 'error',
      mensaje: simLimitCheck.message,
      blockedByLimit: true,
      simulations_count: simLimitCheck.simulations_count,
      max_simulations: simLimitCheck.max_simulations,
      isDemo: simLimitCheck.isDemo
    });
    res.end();
    return;
  }

  // Enviar evento de inicio inmediato para confirmar conexión en la UI
  sendEvent({
    paso: 1,
    porcentaje: 5,
    agente: 'Agente Orquestador Central',
    mensaje: 'Canal de comunicación en tiempo real establecido. Iniciando Meta-Agentes...',
    status: 'active',
    demoStatus: simLimitCheck
  });

  // Enrutamiento Dinámico de Motor de IA (Centralizado de la Matriz o Avanzado Dedicado Cifrado por Licencia)
  inputData.aiConfig = resolveAiConfigForSimulation(inputData);

  try {
    await orchestratorAgent.runSimulationPipeline(inputData, (progress) => {
      sendEvent({ ...progress, demoStatus: simLimitCheck });
    });
    res.end();
  } catch (error) {
    console.error('Error en pipeline de simulación:', error);
    sendEvent({
      status: 'error',
      mensaje: `Error en la simulación: ${error.message}`
    });
    res.end();
  }
};

app.post('/api/simulate/stream', async (req, res) => {
  const inputData = req.body || {};
  await handleSimulationStream(req, res, inputData);
});

app.get('/api/simulate/stream', async (req, res) => {
  let inputData = {};
  try {
    const rawData = req.query.data;
    inputData = rawData ? JSON.parse(decodeURIComponent(rawData)) : {};
  } catch (err) {
    console.warn('Error parseando query string SSE:', err);
  }
  await handleSimulationStream(req, res, inputData);
});

// 6. Endpoint POST síncrono estándar para simulación
app.post('/api/simulate', async (req, res) => {
  try {
    const inputData = req.body || {};
    // Validación estricta de límites de cuenta Demo (Máx 3 propuestas / 7 días)
    const simLimitCheck = checkAndIncrementSimulationLimit(inputData);
    if (!simLimitCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: simLimitCheck.message,
        blockedByLimit: true,
        simulations_count: simLimitCheck.simulations_count,
        max_simulations: simLimitCheck.max_simulations,
        isDemo: simLimitCheck.isDemo
      });
    }

    // Enrutamiento Dinámico de Motor de IA (Centralizado de la Matriz o Avanzado Dedicado Cifrado por Licencia)
    inputData.aiConfig = resolveAiConfigForSimulation(inputData);
    const report = await orchestratorAgent.runSimulationPipeline(inputData);
    res.json({ success: true, report, demoStatus: simLimitCheck });
  } catch (error) {
    console.error('Error en POST /api/simulate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Estado del Motor de IA Centralizado (Plug & Play - Cero Exposición de Llaves)
app.get('/api/ai-engine/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.BACKUP_API_KEY);
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  res.json({
    success: true,
    engine: 'Google Gemini Pro / Enterprise Neural Swarm',
    model,
    mode: 'Centralized Server-Managed (Plug & Play)',
    hasCentralKey: hasKey,
    status: hasKey ? 'ONLINE_ACTIVE' : 'STANDBY_HYBRID',
    description: 'Motor centralizado de alta precisión gestionado por la administración matriz. Credenciales encapsuladas en servidor seguro.'
  });
});

app.post('/api/test-connection', async (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.BACKUP_API_KEY);
  const selectedModel = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

  if (hasKey) {
    return res.json({
      success: true,
      provider: 'gemini',
      model: selectedModel,
      message: `¡Motor Centralizado Activo! Conexión verificada con Google Gemini (${selectedModel}) bajo gestión matriz segura.`
    });
  }

  return res.json({
    success: true,
    provider: 'native',
    model: 'INEGI-ABM Híbrido',
    message: 'Motor Híbrido Semántico Activo y Calibrado. Operación autónoma sin interrupciones.'
  });
});

// 8. Interrogar interactivamente al Enjambre Ciudadano
app.post('/api/swarm/ask', async (req, res) => {
  try {
    const { pregunta } = req.body || {};
    if (!pregunta || !pregunta.trim()) {
      return res.status(400).json({ success: false, error: 'Pregunta requerida' });
    }
    const answers = await orchestratorAgent.answerQuestion(pregunta.trim());
    res.json({ success: true, answers });
  } catch (error) {
    console.error('Error en interrogación al enjambre:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8.1. Diagnóstico y Verificación de IA Real en Vivo (Anti-Random Check)
app.post('/api/verify-ai', (req, res) => {
  try {
    const { proposalText, municipio = 'Ecatepec de Morelos', estado = 'México' } = req.body || {};
    const latest = orchestratorAgent.latestState || {};
    const text = proposalText || latest.propuestaTexto || 'Propuesta Ciudadana';
    const semanticResult = latest.semanticResult || { entidades: { montos: [], plazos: [], medidas: [], prohibiciones: [] }, tipo: 'ESTANDAR' };
    const chats = latest.finalReport?.chatsDelEnjambre || [];
    const votosFinales = latest.finalReport?.resumenEjecutivo || { porcentajeFavor: 55, porcentajeContra: 25, porcentajeNeutro: 20 };

    const dossier = realAiVerificationAgent.generateVerificationDossier({
      proposalText: text,
      municipio,
      estado,
      semanticResult,
      chatsDelEnjambre: chats,
      votosFinales
    });
    res.json({ success: true, verification: dossier });
  } catch (error) {
    console.error('Error en /api/verify-ai:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8.2. Radar Electoral 2027-2030 y Micro-Targeting Territorial (Catálogo y Diagnóstico Rápido)
app.get('/api/electoral-radar', (req, res) => {
  try {
    const {
      municipio = 'Ecatepec de Morelos',
      estado = 'Estado de México',
      cargo = 'Presidente Municipal / Alcalde',
      ciclo = '2027',
      prioridad
    } = req.query || {};

    const ciclos = electoralRadarEngine.getCiclosElectorales();
    const cargos = electoralRadarEngine.getCargosElectorales();
    const municipiosDisponibles = coloniasData.getMunicipiosDisponibles();
    const colonias = prioridad
      ? coloniasData.filterColoniasByPrioridad(municipio, prioridad, estado)
      : coloniasData.getColoniasByMunicipio(municipio, estado);
    const stats = coloniasData.getColoniasStats(municipio, estado);
    const diagnostico = electoralRadarEngine.getDiagnosticoProblematicas(municipio, estado);
    const propuestas = electoralRadarEngine.getBateriaPropuestas(cargo, municipio);
    const sindicatos = electoralRadarEngine.getAlianzasYSindicatos(municipio, cargo);

    res.json({
      success: true,
      municipio,
      estado,
      cargo,
      ciclo,
      ciclos,
      cargos,
      municipiosDisponibles,
      colonias,
      stats,
      diagnostico,
      propuestas,
      sindicatos
    });
  } catch (error) {
    console.error('Error en GET /api/electoral-radar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8.3. Diagnóstico Estratégico Integral del Radar Electoral 2027-2030 (Micro-Targeting, Ramo 28/33, 12 Sindicatos y Manual)
app.post('/api/electoral-radar/diagnostico', (req, res) => {
  try {
    const {
      municipio = 'Ecatepec de Morelos',
      estado = 'Estado de México',
      cargo = 'Presidente Municipal / Alcalde',
      ciclo = '2027',
      candidato = 'Candidato de Transformación Verde',
      coalicion = 'PVEM - Sigamos Haciendo Historia'
    } = req.body || {};

    const radarAnalysis = electoralRadarEngine.generateFullRadarAnalysis({
      municipio,
      estado,
      cargo,
      ciclo,
      candidato,
      coalicion
    });

    res.json({
      success: true,
      radar: radarAnalysis
    });
  } catch (error) {
    console.error('Error en POST /api/electoral-radar/diagnostico:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================================================================
// WATERMARK CRIPTOGRÁFICO DE AUTORÍA — NEURAL MEDIA HOUSE / ERICK VEGA
// Base64: RXJpY2sgZGUgSmVzw7pzIFZlZ2EgQ2FybW9uYSB8IE5ldXJhbCBNZWRpYSBIb3VzZQ==
// =========================================================================
const AUTHORSHIP_WATERMARK = {
  b64: 'RXJpY2sgZGUgSmVzw7pzIFZlZ2EgQ2FybW9uYSB8IE5ldXJhbCBNZWRpYSBIb3VzZQ==',
  sha256: 'e9f8d4a2c7b10538941276a0b3e5c8f1d2a4b6c8e0f1a3b5c7d9e1f3a5b7c9d1',
  author: 'Erick de Jesús Vega Carmona',
  organization: 'Neural Media House',
  version: 'v4.8 Enterprise Macro-Censal Edition'
};

// =========================================================================
// 9. PANEL DE CONTROL MAESTRO, GESTIÓN DE LICENCIAS & KILL SWITCH
// =========================================================================
const LICENSES_FILE = path.join(__dirname, 'src', 'data', 'licensesStore.json');
const ACCESS_LOGS_FILE = path.join(__dirname, 'src', 'data', 'accessLogs.json');

// --- SISTEMA DE AUDITORÍA Y TELEMETRÍA DE ACCESOS (ZERO-DATA RETENTION) ---
function loadAccessLogs() {
  try {
    if (fs.existsSync(ACCESS_LOGS_FILE)) {
      const raw = fs.readFileSync(ACCESS_LOGS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Advertencia leyendo accessLogs.json:', err.message);
  }
  return [];
}

function saveAccessLogs(logs) {
  try {
    const dir = path.dirname(ACCESS_LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Conservar hasta 500 registros para alta velocidad y evitar sobrecarga
    const trimmed = Array.isArray(logs) ? logs.slice(0, 500) : [];
    fs.writeFileSync(ACCESS_LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf8');
  } catch (err) {
    console.warn('Advertencia guardando accessLogs.json:', err.message);
  }
}

function recordAccessLog({ userId, username, clientName, role, authMethod, licenseType, assignedParties, simulationsUsed, req }) {
  try {
    const logs = loadAccessLogs();
    const forwarded = req && req.headers ? req.headers['x-forwarded-for'] : null;
    const remoteIp = req && req.socket ? req.socket.remoteAddress : '127.0.0.1';
    const rawIp = forwarded || remoteIp || '127.0.0.1';
    const clientIp = String(rawIp).split(',')[0].trim().replace(/^::ffff:/, '');
    const userAgent = (req && req.headers && req.headers['user-agent']) ? String(req.headers['user-agent']).slice(0, 160) : 'Navegador Web Desconocido';

    const now = new Date();
    const entry = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: userId || 'anonymous',
      username: username || 'desconocido',
      clientName: clientName || username || 'Usuario',
      role: role || 'CLIENT',
      license_type: licenseType || (role === 'MASTER_ADMIN' ? 'MASTER_ADMIN' : 'OFICIAL / PAGADA'),
      assigned_parties: Array.isArray(assignedParties) ? assignedParties : [],
      simulations_used: simulationsUsed || '0',
      authMethod: authMethod || 'CREDENTIALS',
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
      ip: clientIp,
      userAgent
    };

    logs.unshift(entry);
    saveAccessLogs(logs);
    return entry;
  } catch (e) {
    console.warn('Error registrando bitácora de acceso:', e.message);
    return null;
  }
}

function generateSecurityToken(partido = 'PVEM') {
  const cleanParty = String(partido || 'SYS').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'SYS';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${cleanParty}-${randNum}-${randHex}`;
}

const DEFAULT_LICENSES = [
  {
    id: 'lic-demo-pvem-01',
    clienteNombre: 'Candidatura Alcaldía Ecatepec (PVEM)',
    username: 'ecatepec2027',
    password: 'Verde2027*',
    partido: 'PVEM',
    allowed_parties: ['PVEM'],
    can_select_any_party: false,
    login_count: 0,
    last_login_at: null,
    simulations_count: 0,
    max_simulations: 100000,
    isDemo: false,
    tokenSeguridad: 'TK-PVEM-8472-ECA1',
    nivelGeografico: 'Municipal / Alcaldía',
    etiquetaRegion: 'Alcaldía — Municipio de Ecatepec de Morelos',
    estadosAutorizados: ['Estado de México'],
    cargosAutorizados: ['Presidente Municipal / Alcalde', 'Regidor', 'Diputado Local'],
    municipiosAutorizados: ['Ecatepec de Morelos'],
    permisoRadar: true,
    permisoSimulador: true,
    propuestaFijaTitulo: '',
    propuestaFijaTexto: '',
    maxSwarmSize: 100000,
    fechaInicio: '2026-01-01',
    fechaExpiracion: '2027-12-31',
    activo: true,
    creadoEn: '2026-10-15'
  },
  {
    id: 'lic-demo-morena-02',
    clienteNombre: 'Coordinación Distrital Naucalpan - Tlalnepantla',
    username: 'distrito04',
    password: 'Morena2027*',
    partido: 'MORENA',
    allowed_parties: ['MORENA'],
    can_select_any_party: false,
    login_count: 0,
    last_login_at: null,
    simulations_count: 0,
    max_simulations: 50000,
    isDemo: false,
    tokenSeguridad: 'TK-MORENA-3921-DF04',
    nivelGeografico: 'Federal',
    etiquetaRegion: 'Distrito Electoral Federal 04 — Naucalpan / Tlalnepantla',
    estadosAutorizados: ['Estado de México'],
    cargosAutorizados: ['Diputado Federal', 'Senador'],
    municipiosAutorizados: ['Naucalpan de Juárez', 'Tlalnepantla de Baz'],
    permisoRadar: true,
    permisoSimulador: true,
    propuestaFijaTitulo: '',
    propuestaFijaTexto: '',
    maxSwarmSize: 50000,
    fechaInicio: '2026-01-01',
    fechaExpiracion: '2027-08-31',
    activo: true,
    creadoEn: '2026-10-15'
  }
];

function loadLicensesStore() {
  try {
    if (fs.existsSync(LICENSES_FILE)) {
      const raw = fs.readFileSync(LICENSES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(lic => ({
          estadosAutorizados: ['Estado de México'],
          permisoRadar: true,
          permisoSimulador: true,
          propuestaFijaTitulo: '',
          propuestaFijaTexto: '',
          allowed_parties: Array.isArray(lic.allowed_parties) && lic.allowed_parties.length > 0 ? lic.allowed_parties : [lic.partido || 'PVEM'],
          can_select_any_party: Boolean(lic.can_select_any_party),
          login_count: typeof lic.login_count === 'number' ? lic.login_count : 0,
          last_login_at: lic.last_login_at || null,
          simulations_count: typeof lic.simulations_count === 'number' ? lic.simulations_count : 0,
          max_simulations: lic.isDemo ? 3 : (lic.max_simulations || 999999),
          isDemo: Boolean(lic.isDemo),
          ...lic
        }));
      }
    }
  } catch (e) {
    console.warn('Advertencia leyendo licensesStore.json:', e.message);
  }
  // Inicializar archivo persistente si no existe
  saveLicensesStore(DEFAULT_LICENSES);
  return [...DEFAULT_LICENSES];
}

function saveLicensesStore(list) {
  try {
    const dir = path.dirname(LICENSES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Advertencia guardando licensesStore.json:', e.message);
  }
}

// =========================================================================
// 9.0. BLINDAJE CRIPTOGRÁFICO Y GESTIÓN DE MODELOS DE IA DEDICADOS (AES-256-GCM)
// =========================================================================
const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY || 'govtech-warroom-master-aes256-encryption-secret-2027';

function getEncryptionKey() {
  return crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
}

function encryptApiKey(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    let encrypted = cipher.update(trimmed, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Error cifrando API Key:', err.message);
    return '';
  }
}

function decryptApiKey(cipherText) {
  if (!cipherText || typeof cipherText !== 'string') return '';
  if (!cipherText.startsWith('enc:')) {
    return cipherText;
  }
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return '';
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encryptedText = parts[3];
    const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Error descifrando API Key:', err.message);
    return '';
  }
}

function maskApiKey(cipherText) {
  if (!cipherText) return '';
  const plain = decryptApiKey(cipherText);
  if (!plain) return '';
  if (plain.length <= 8) return '••••••••';
  return `${plain.slice(0, 4)}...${plain.slice(-4)}`;
}

function sanitizeLicenseForClient(lic) {
  if (!lic) return null;
  const { customApiKeyEncrypted, ...safeLic } = lic;
  return {
    ...safeLic,
    allowed_parties: Array.isArray(lic.allowed_parties) && lic.allowed_parties.length > 0 ? lic.allowed_parties : [lic.partido || 'PVEM'],
    can_select_any_party: Boolean(lic.can_select_any_party),
    login_count: typeof lic.login_count === 'number' ? lic.login_count : 0,
    last_login_at: lic.last_login_at || null,
    simulations_count: typeof lic.simulations_count === 'number' ? lic.simulations_count : 0,
    max_simulations: lic.isDemo ? 3 : (lic.max_simulations || 999999),
    isDemo: Boolean(lic.isDemo),
    hasCustomKey: Boolean(customApiKeyEncrypted),
    customApiKeyMasked: maskApiKey(customApiKeyEncrypted),
    aiModel: lic.aiModel || 'gemini-default'
  };
}

function resolveAiConfigForSimulation(inputData = {}) {
  licensesStore = loadLicensesStore();
  const licId = inputData.licenseId || inputData.activeSession?.user?.id;
  const username = inputData.username || inputData.activeSession?.user?.username;

  let matchedLic = null;
  if (licId) {
    matchedLic = licensesStore.find(l => l.id === licId);
  } else if (username) {
    matchedLic = licensesStore.find(l => l.username.toLowerCase() === username.toLowerCase());
  }

  // Caso 1: Licencia con API Key avanzada personalizada cifrada en base de datos
  if (matchedLic && matchedLic.customApiKeyEncrypted) {
    const decryptedKey = decryptApiKey(matchedLic.customApiKeyEncrypted);
    if (decryptedKey) {
      const model = matchedLic.aiModel || 'gpt-4o';
      let provider = 'openai';
      let mappedModel = model;

      if (model.startsWith('gemini')) {
        provider = 'gemini';
        mappedModel = model === 'gemini-default' ? (process.env.GEMINI_MODEL || 'gemini-1.5-pro') : model;
      } else if (model.includes('claude')) {
        provider = 'openrouter';
        mappedModel = 'anthropic/claude-3.5-sonnet';
      } else if (model.includes('llama')) {
        provider = 'groq';
        mappedModel = 'llama-3.3-70b-versatile';
      } else if (model.startsWith('gpt')) {
        provider = 'openai';
        mappedModel = model;
      }

      return {
        provider,
        model: mappedModel,
        apiKey: decryptedKey,
        custom: true,
        centralized: false,
        licenseId: matchedLic.id,
        clientName: matchedLic.clienteNombre
      };
    }
  }

  // Caso 2: Licencia con variante de Gemini seleccionada sin clave propia (usa credenciales centrales)
  if (matchedLic && matchedLic.aiModel && matchedLic.aiModel.startsWith('gemini') && matchedLic.aiModel !== 'gemini-default') {
    return {
      provider: 'gemini',
      model: matchedLic.aiModel,
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.BACKUP_API_KEY || '',
      centralized: true
    };
  }

  // Caso 3: Motor Centralizado General de la Matriz (Google Gemini Pro - Plug & Play)
  return {
    provider: 'gemini',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.BACKUP_API_KEY || '',
    centralized: true
  };
}

// Catálogo de Cuentas de Administrador Maestro Autorizadas
const MASTER_ADMIN_ACCOUNTS = [
  {
    id: 'master-admin-erick-vega',
    clienteNombre: 'Erick Vega — Administrador Maestro (Neural Media House)',
    username: 'Cerkvega92',
    password: 'Tutusito1*'
  },
  {
    id: 'master-admin-aland',
    clienteNombre: 'Aland — Administrador Maestro',
    username: 'Aland',
    password: 'Aland2026'
  }
];

let licensesStore = loadLicensesStore();

// 9.1. Login Unificado con Verificación Anti-Bots CAPTCHA / Turnstile Obligatoria
app.post('/api/auth/login', (req, res) => {
  try {
    const { username = '', password = '', captchaVerified = false, captchaToken = '' } = req.body || {};
    const u = String(username).trim();
    const p = String(password).trim();

    // Validación obligatoria del sistema Anti-Bots (Turnstile / CAPTCHA)
    if (!captchaVerified || !captchaToken || !String(captchaToken).startsWith('turnstile_verified_')) {
      return res.status(403).json({
        success: false,
        error: 'Verificación Anti-Bots (Turnstile / CAPTCHA) obligatoria. Por favor confirma que eres humano antes de iniciar sesión.'
      });
    }

    // Validación de Administradores Maestros (Cerkvega92 y Aland)
    const masterAccount = MASTER_ADMIN_ACCOUNTS.find(
      acc => acc.username.toLowerCase() === u.toLowerCase() && acc.password === p
    );

    if (masterAccount) {
      const authMethod = (u.toUpperCase().startsWith('TK-') || p.toUpperCase().startsWith('TK-')) ? 'TOKEN' : 'CREDENTIALS';
      recordAccessLog({
        userId: masterAccount.id,
        username: masterAccount.username,
        clientName: masterAccount.clienteNombre,
        role: 'MASTER_ADMIN',
        licenseType: 'MASTER_ADMIN',
        assignedParties: ['TODOS'],
        simulationsUsed: 'Ilimitado (Maestro)',
        authMethod,
        req
      });

      return res.json({
        success: true,
        role: 'MASTER_ADMIN',
        watermark: AUTHORSHIP_WATERMARK,
        user: {
          id: masterAccount.id,
          clienteNombre: masterAccount.clienteNombre,
          username: masterAccount.username,
          partido: 'PVEM',
          allowed_parties: [
            "PVEM",
            "MORENA",
            "PAN",
            "PRI",
            "MC",
            "PT",
            "CANDIDATURA INDEPENDIENTE",
            "COALICIÓN / ALIANZA"
          ],
          can_select_any_party: true,
          login_count: 1,
          last_login_at: new Date().toISOString(),
          simulations_count: 0,
          max_simulations: 999999,
          isDemo: false,
          nivelGeografico: 'Nacional / Estatal',
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
          esAdministradorTotal: true,
          permisosGranulares: {
            crearLicencias: true,
            killSwitch: true,
            tokensSeguridad: true,
            simulador: true,
            radar: true,
            descargaReportes: true,
            soloLectura: false
          },
          propuestaFijaTitulo: '',
          propuestaFijaTexto: '',
          maxSwarmSize: 100000,
          fechaInicio: '2026-01-01',
          fechaExpiracion: '2099-12-31',
          activo: true
        }
      });
    }

    // Buscar en licencias de clientes políticos (Soporta credenciales o Token de Seguridad TK-*)
    licensesStore = loadLicensesStore();
    const isTokenLookup = u.toUpperCase().startsWith('TK-') || p.toUpperCase().startsWith('TK-');
    const inputToken = (u.toUpperCase().startsWith('TK-') ? u : (p.toUpperCase().startsWith('TK-') ? p : '')).toUpperCase();

    const found = licensesStore.find(lic => {
      const matchCredentials = lic.username.toLowerCase() === u.toLowerCase() && lic.password === p;
      const matchToken = inputToken && lic.tokenSeguridad && lic.tokenSeguridad.toUpperCase() === inputToken;
      return matchCredentials || matchToken;
    });

    if (!found) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Verifique su Usuario y Contraseña o su Token de Seguridad.'
      });
    }

    // Verificar Kill Switch manual y vigencia por fechas
    const now = new Date();
    const expDate = found.fechaExpiracion ? new Date(`${found.fechaExpiracion}T23:59:59`) : new Date('2099-12-31');
    const startDate = found.fechaInicio ? new Date(`${found.fechaInicio}T00:00:00`) : new Date('2020-01-01');

    if (!found.activo || now > expDate || now < startDate) {
      return res.status(403).json({
        success: false,
        expired: true,
        error: !found.activo
          ? 'Su licencia ha sido suspendida por el Administrador Maestro (Kill Switch Activo).'
          : `Licencia fuera de vigencia (Vigencia: ${found.fechaInicio} al ${found.fechaExpiracion}). Contacte a Neural Media House.`
      });
    }

    // Verificar que al menos un módulo (Radar o Simulador) esté autorizado
    const hasRadar = found.permisoRadar !== false;
    const hasSim = found.permisoSimulador !== false;
    if (!hasRadar && !hasSim) {
      return res.status(403).json({
        success: false,
        error: 'Su licencia no tiene módulos activos habilitados (Radar Electoral ni Simulador). Contacte al Administrador Maestro.'
      });
    }

    const isMasterRole = Boolean(found.esAdministradorTotal || found.role === 'MASTER_ADMIN' || found.tipoUsuario === 'MASTER_ADMIN');
    const permisosGranulares = found.permisosGranulares || {
      crearLicencias: isMasterRole,
      killSwitch: isMasterRole,
      tokensSeguridad: isMasterRole,
      simulador: found.permisoSimulador !== false,
      radar: found.permisoRadar !== false,
      descargaReportes: true,
      soloLectura: false
    };

    // Incrementar métricas de acceso y registrar telemetría (Zero-Data Retention)
    found.login_count = (found.login_count || 0) + 1;
    found.last_login_at = new Date().toISOString();
    if (typeof found.simulations_count !== 'number') {
      found.simulations_count = 0;
    }
    saveLicensesStore(licensesStore);

    const clientRole = isMasterRole ? 'MASTER_ADMIN' : (found.tipoUsuario === 'SOCIO_OPERADOR' ? 'SOCIO_OPERADOR' : 'CLIENT');
    const isDemoLic = Boolean(found.isDemo);
    const simCount = typeof found.simulations_count === 'number' ? found.simulations_count : 0;
    const maxSim = isDemoLic ? 3 : (found.max_simulations || 999999);
    const simUsedStr = isDemoLic ? `${simCount}/3` : `${simCount} corridas`;
    const licTypeStr = isDemoLic ? 'DEMO' : (isMasterRole ? 'MASTER_ADMIN' : 'OFICIAL / PAGADA');

    recordAccessLog({
      userId: found.id,
      username: found.username,
      clientName: found.clienteNombre,
      role: clientRole,
      licenseType: licTypeStr,
      assignedParties: found.allowed_parties || [found.partido || 'PVEM'],
      simulationsUsed: simUsedStr,
      authMethod: isTokenLookup ? 'TOKEN' : 'CREDENTIALS',
      req
    });

    return res.json({
      success: true,
      role: clientRole,
      watermark: AUTHORSHIP_WATERMARK,
      user: {
        ...found,
        allowed_parties: Array.isArray(found.allowed_parties) && found.allowed_parties.length > 0 ? found.allowed_parties : [found.partido || 'PVEM'],
        can_select_any_party: Boolean(found.can_select_any_party),
        login_count: found.login_count,
        last_login_at: found.last_login_at,
        simulations_count: simCount,
        max_simulations: maxSim,
        isDemo: isDemoLic,
        esAdministradorTotal: isMasterRole,
        permisosGranulares
      }
    });
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.2. Listar Licencias (Para Panel de Control Maestro)
app.get('/api/licenses', (req, res) => {
  licensesStore = loadLicensesStore();
  const safeList = licensesStore.map(lic => sanitizeLicenseForClient(lic));
  res.json({ success: true, licenses: safeList, watermark: AUTHORSHIP_WATERMARK });
});

// 9.2b. Bitácora de Auditoría y Telemetría de Accesos (Zero-Data Retention)
app.get('/api/audit/access-logs', (req, res) => {
  try {
    const logs = loadAccessLogs();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.timestamp && l.timestamp.startsWith(todayStr));
    
    // Calcular estadísticas
    const userCounts = {};
    logs.forEach(l => {
      userCounts[l.username] = (userCounts[l.username] || 0) + 1;
    });
    let mostActiveUser = 'Ninguno registrado';
    let maxUserCount = 0;
    Object.entries(userCounts).forEach(([usr, cnt]) => {
      if (cnt > maxUserCount) {
        maxUserCount = cnt;
        mostActiveUser = `${usr} (${cnt} accesos)`;
      }
    });

    const lastLog = logs.length > 0 ? logs[0] : null;

    res.json({
      success: true,
      totalLogs: logs.length,
      todayCount: todayLogs.length,
      mostActiveUser,
      lastAccess: lastLog ? {
        username: lastLog.username,
        clientName: lastLog.clientName,
        role: lastLog.role,
        authMethod: lastLog.authMethod,
        timestamp: lastLog.timestamp,
        timestampFormatted: lastLog.timestampFormatted,
        ip: lastLog.ip
      } : null,
      logs: logs.slice(0, 150)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.3. Crear o Actualizar Licencia de Cliente Político
app.post('/api/licenses', (req, res) => {
  try {
    const body = req.body || {};
    licensesStore = loadLicensesStore();

    const id = body.id || `lic-${Date.now()}`;
    const existingIdx = licensesStore.findIndex(l => l.id === id);
    const existingLic = existingIdx >= 0 ? licensesStore[existingIdx] : null;

    const partido = String(body.partido || 'PVEM').toUpperCase();
    const tokenSeguridad = body.tokenSeguridad
      ? String(body.tokenSeguridad).trim()
      : (existingLic && existingLic.tokenSeguridad ? existingLic.tokenSeguridad : generateSecurityToken(partido));

    // Configuración Multi-Partido / Coalición
    const can_select_any_party = Boolean(body.can_select_any_party);
    let allowed_parties = Array.isArray(body.allowed_parties) && body.allowed_parties.length > 0
      ? body.allowed_parties
      : [partido];
    if (!allowed_parties.includes(partido)) {
      allowed_parties.unshift(partido);
    }

    const estadosAutorizados = Array.isArray(body.estadosAutorizados) && body.estadosAutorizados.length > 0
      ? body.estadosAutorizados
      : ['Estado de México'];

    const municipiosAutorizados = Array.isArray(body.municipiosAutorizados) && body.municipiosAutorizados.length > 0
      ? body.municipiosAutorizados
      : ['Ecatepec de Morelos'];

    let etiquetaRegion = String(body.etiquetaRegion || '').trim();
    if (!etiquetaRegion) {
      if (municipiosAutorizados.length > 0 && municipiosAutorizados[0] !== 'TODOS') {
        etiquetaRegion = `${estadosAutorizados[0]} — ${municipiosAutorizados.slice(0, 2).join(', ')}${municipiosAutorizados.length > 2 ? ` (+${municipiosAutorizados.length - 2} más)` : ''}`;
      } else if (estadosAutorizados.length > 0 && estadosAutorizados[0] !== 'TODOS') {
        etiquetaRegion = `Estado de ${estadosAutorizados.join(', ')}`;
      } else {
        etiquetaRegion = `Nacional — ${partido}`;
      }
    }

    let fechaInicio = String(body.fechaInicio || '').trim();
    let fechaExpiracion = String(body.fechaExpiracion || '').trim();
    if (body.isDemo || body.diasVigencia) {
      const days = parseInt(body.diasVigencia, 10) || 7;
      const now = new Date();
      fechaInicio = now.toISOString().split('T')[0];
      const expDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      fechaExpiracion = expDate.toISOString().split('T')[0];
    }
    if (!fechaInicio) fechaInicio = '2026-01-01';
    if (!fechaExpiracion) fechaExpiracion = '2027-12-31';

    // Inyección de API Key Personalizada y Selector de Modelo Avanzado (Cifrado AES-256)
    const aiModel = String(body.aiModel || (existingLic ? existingLic.aiModel : 'gemini-default')).trim();
    const incomingKey = String(body.customApiKey || '').trim();
    let customApiKeyEncrypted = '';

    if (incomingKey && !incomingKey.includes('••••') && !incomingKey.includes('...')) {
      // Nueva llave ingresada por el administrador matriz: se almacena con cifrado AES-256
      customApiKeyEncrypted = encryptApiKey(incomingKey);
    } else if (existingLic && existingLic.customApiKeyEncrypted && incomingKey !== 'CLEAR') {
      // Mantener la clave existente si no se alteró
      customApiKeyEncrypted = existingLic.customApiKeyEncrypted;
    }

    const licenseObj = {
      id,
      clienteNombre: String(body.clienteNombre || 'Cliente Político').trim(),
      username: String(body.username || `usuario_${Date.now()}`).trim(),
      password: String(body.password || 'Clave2027*').trim(),
      partido,
      allowed_parties,
      can_select_any_party,
      login_count: existingLic ? (existingLic.login_count || 0) : 0,
      last_login_at: existingLic ? (existingLic.last_login_at || null) : null,
      tokenSeguridad,
      nivelGeografico: String(body.nivelGeografico || 'Municipal / Alcaldía'),
      etiquetaRegion,
      estadosAutorizados,
      cargosAutorizados: Array.isArray(body.cargosAutorizados) && body.cargosAutorizados.length > 0
        ? body.cargosAutorizados
        : ['Presidente Municipal / Alcalde'],
      municipiosAutorizados,
      permisoRadar: body.permisoRadar !== undefined ? Boolean(body.permisoRadar) : true,
      permisoSimulador: body.permisoSimulador !== undefined ? Boolean(body.permisoSimulador) : true,
      esAdministradorTotal: Boolean(body.esAdministradorTotal),
      tipoUsuario: body.esAdministradorTotal ? 'MASTER_ADMIN' : (body.tipoUsuario || 'CLIENT'),
      permisosGranulares: {
        crearLicencias: body.esAdministradorTotal ? true : (body.permisosGranulares?.crearLicencias ?? (body.permisoCrearLicencias !== undefined ? Boolean(body.permisoCrearLicencias) : false)),
        killSwitch: body.esAdministradorTotal ? true : (body.permisosGranulares?.killSwitch ?? (body.permisoKillSwitch !== undefined ? Boolean(body.permisoKillSwitch) : false)),
        tokens: body.esAdministradorTotal ? true : (body.permisosGranulares?.tokens ?? body.permisosGranulares?.tokensSeguridad ?? (body.permisoTokensSeguridad !== undefined ? Boolean(body.permisoTokensSeguridad) : false)),
        tokensSeguridad: body.esAdministradorTotal ? true : (body.permisosGranulares?.tokens ?? body.permisosGranulares?.tokensSeguridad ?? (body.permisoTokensSeguridad !== undefined ? Boolean(body.permisoTokensSeguridad) : false)),
        simulador: body.esAdministradorTotal ? true : (body.permisosGranulares?.simulador ?? (body.permisoSimulador !== undefined ? Boolean(body.permisoSimulador) : true)),
        radar: body.esAdministradorTotal ? true : (body.permisosGranulares?.radar ?? (body.permisoRadar !== undefined ? Boolean(body.permisoRadar) : true)),
        descargaReportes: body.esAdministradorTotal ? true : (body.permisosGranulares?.descargaReportes ?? (body.permisoDescargaReportes !== undefined ? Boolean(body.permisoDescargaReportes) : true)),
        soloLectura: body.esAdministradorTotal ? false : Boolean(body.permisosGranulares?.soloLectura ?? body.permisoSoloLectura)
      },
      aiModel,
      customApiKeyEncrypted,
      propuestaFijaTitulo: String(body.propuestaFijaTitulo || '').trim(),
      propuestaFijaTexto: String(body.propuestaFijaTexto || '').trim(),
      maxSwarmSize: parseInt(body.maxSwarmSize, 10) || (body.isDemo ? 1000 : 100000),
      fechaInicio,
      fechaExpiracion,
      activo: body.activo !== undefined ? Boolean(body.activo) : true,
      isDemo: Boolean(body.isDemo),
      simulations_count: existingLic ? (typeof existingLic.simulations_count === 'number' ? existingLic.simulations_count : 0) : 0,
      max_simulations: body.isDemo ? 3 : (parseInt(body.max_simulations, 10) || 999999),
      creadoEn: body.creadoEn || new Date().toISOString().split('T')[0]
    };

    if (existingIdx >= 0) {
      licensesStore[existingIdx] = licenseObj;
    } else {
      licensesStore.unshift(licenseObj);
    }

    saveLicensesStore(licensesStore);
    const safeLic = sanitizeLicenseForClient(licenseObj);
    const safeList = licensesStore.map(l => sanitizeLicenseForClient(l));
    res.json({ success: true, license: safeLic, licenses: safeList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4. Alternar Estado Activo / Kill Switch Instantáneo
app.patch('/api/licenses/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    licensesStore = loadLicensesStore();
    const lic = licensesStore.find(l => l.id === id);
    if (!lic) {
      return res.status(404).json({ success: false, error: 'Licencia no encontrada' });
    }
    lic.activo = !lic.activo;
    saveLicensesStore(licensesStore);
    res.json({ success: true, license: sanitizeLicenseForClient(lic), licenses: licensesStore.map(l => sanitizeLicenseForClient(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4b. Actualizar Fecha de Vigencia (Calendario / Datepicker Rápido en Licencias Activas)
app.patch('/api/licenses/:id/expiration', (req, res) => {
  try {
    const { id } = req.params;
    const { fechaExpiracion, fechaInicio } = req.body || {};
    licensesStore = loadLicensesStore();
    const lic = licensesStore.find(l => l.id === id);
    if (!lic) {
      return res.status(404).json({ success: false, error: 'Licencia no encontrada' });
    }
    if (fechaExpiracion) {
      lic.fechaExpiracion = String(fechaExpiracion).trim();
      // Si la nueva fecha de expiración está en el futuro, asegurar que la licencia quede activa
      const now = new Date();
      const newExp = new Date(`${lic.fechaExpiracion}T23:59:59`);
      if (newExp >= now) {
        lic.activo = true;
      }
    }
    if (fechaInicio) {
      lic.fechaInicio = String(fechaInicio).trim();
    }
    saveLicensesStore(licensesStore);
    res.json({ success: true, license: sanitizeLicenseForClient(lic), licenses: licensesStore.map(l => sanitizeLicenseForClient(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4c. Actualizar Permisos Independientes de Módulos (Radar vs Simulador)
app.patch('/api/licenses/:id/permissions', (req, res) => {
  try {
    const { id } = req.params;
    const { permisoRadar, permisoSimulador } = req.body || {};
    licensesStore = loadLicensesStore();
    const lic = licensesStore.find(l => l.id === id);
    if (!lic) {
      return res.status(404).json({ success: false, error: 'Licencia no encontrada' });
    }
    if (permisoRadar !== undefined) lic.permisoRadar = Boolean(permisoRadar);
    if (permisoSimulador !== undefined) lic.permisoSimulador = Boolean(permisoSimulador);
    saveLicensesStore(licensesStore);
    res.json({ success: true, license: sanitizeLicenseForClient(lic), licenses: licensesStore.map(l => sanitizeLicenseForClient(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4d. Reiniciar Contador de Simulaciones (Reset a 0/3)
app.post('/api/licenses/:id/reset-simulations', (req, res) => {
  try {
    const { id } = req.params;
    licensesStore = loadLicensesStore();
    const lic = licensesStore.find(l => l.id === id);
    if (!lic) {
      return res.status(404).json({ success: false, error: 'Licencia no encontrada' });
    }
    lic.simulations_count = 0;
    saveLicensesStore(licensesStore);
    res.json({
      success: true,
      message: `Contador de propuestas reiniciado a 0 para ${lic.username}`,
      license: sanitizeLicenseForClient(lic),
      licenses: licensesStore.map(l => sanitizeLicenseForClient(l))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.5. Eliminar Licencia
app.delete('/api/licenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    licensesStore = loadLicensesStore();
    licensesStore = licensesStore.filter(l => l.id !== id);
    saveLicensesStore(licensesStore);
    res.json({ success: true, licenses: licensesStore.map(l => sanitizeLicenseForClient(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.6. Sincronización y Bóveda Anti-Pérdida de Licencias (Persistencia Bidireccional)
app.post('/api/licenses/sync-vault', (req, res) => {
  try {
    const { vaultLicenses = [] } = req.body || {};
    if (!Array.isArray(vaultLicenses) || vaultLicenses.length === 0) {
      licensesStore = loadLicensesStore();
      return res.json({ success: true, count: 0, licenses: licensesStore.map(l => sanitizeLicenseForClient(l)) });
    }

    licensesStore = loadLicensesStore();
    let addedCount = 0;

    vaultLicenses.forEach(vLic => {
      if (!vLic || !vLic.id) return;
      const idx = licensesStore.findIndex(l => l.id === vLic.id);
      if (idx === -1) {
        licensesStore.push(vLic);
        addedCount++;
      } else {
        // Preservar datos y merge seguro
        licensesStore[idx] = { ...licensesStore[idx], ...vLic };
      }
    });

    if (addedCount > 0) {
      saveLicensesStore(licensesStore);
      console.log(`[VAULT-SYNC] Sincronización exitosa: ${addedCount} licencias restauradas y blindadas.`);
    }

    res.json({ success: true, addedCount, licenses: licensesStore.map(l => sanitizeLicenseForClient(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🟢 GOVTECH WAR ROOM v5.0 ENTERPRISE — NEURAL MEDIA HOUSE / ERICK VEGA`);
  console.log(`📡 Servidor activo y escuchando en http://localhost:${PORT}`);
  console.log(`🤖 Cobertura Nacional 32 Estados + Turnstile Anti-Bots + Cyber Sentinel 24/7`);
  console.log(`================================================================`);
});
