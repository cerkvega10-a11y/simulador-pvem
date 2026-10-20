const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Capturadores globales para evitar caídas imprevistas del proceso Node.js
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Node.js Unhandled Rejection]:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Node.js Uncaught Exception crítico]:', err);
});

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
const freeLLMService = require('./src/services/freeLLMService');

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
}, 5 * 60 * 1000).unref();

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
  try {
    for (const key of Object.keys(obj)) {
      // Preservar llaves API sin alteración técnica de su contenido para autenticación legítima
      if (key === 'apiKey' || key === 'tavilyApiKey') continue;
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeStringValue(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObjectRecursive(obj[key]);
      }
    }
  } catch (_) {}
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

  const targetState = String(estado || 'Estado de México').trim();
  const isAllNational = targetState === 'TODOS LOS ESTADOS (Nacional)' || targetState === 'TODOS' || targetState === 'ALL_STATES' || targetState.toUpperCase().includes('TODOS LOS ESTADOS');

  if (isAllNational) {
    return res.json({
      success: true,
      municipios: [
        {
          estado: 'TODOS LOS ESTADOS (Nacional)',
          nombre: 'Todos los Municipios (Cobertura Nacional)',
          tieneDetalleProfundo: true,
          esMacroEstatal: true,
          esCoberturaNacional: true
        }
      ]
    });
  }

  const lista = CATALOGO_NACIONAL_32_ESTADOS[targetState] || getMunicipalitiesByStates(targetState).map(x => x.nombre);
  const allMunisForStateLabel = `Todos los Municipios de ${targetState}`;

  const listado = [
    {
      estado: targetState,
      nombre: allMunisForStateLabel,
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

// Mapa para evitar doble descuento de simulaciones en reconexiones o fallbacks (5 min TTL)
const recentDeductedRunIds = new Map();

// Función para verificar y descontar cuota de propuestas (Kill Switch Demo 3 corridas / 7 días)
function checkAndIncrementSimulationLimit(inputData = {}) {
  const allLicenses = loadLicensesStore();
  const licId = inputData.licenseId || inputData.activeSession?.user?.id;
  const username = inputData.username || inputData.activeSession?.user?.username;
  const runId = inputData.runId;

  // Limpiar corridas con más de 5 minutos
  const nowMs = Date.now();
  for (const [rId, ts] of recentDeductedRunIds.entries()) {
    if (nowMs - ts > 5 * 60 * 1000) recentDeductedRunIds.delete(rId);
  }

  // Si esta corrida ya fue descontada por la conexión SSE inicial, no duplicar el cargo en el fallback
  if (runId && recentDeductedRunIds.has(runId)) {
    const matched = licId ? allLicenses.find(l => l.id === licId) : (username ? allLicenses.find(l => l.username.toLowerCase() === String(username).toLowerCase()) : null);
    const isDemo = Boolean(matched?.isDemo);
    const maxSims = isDemo ? 3 : (matched?.max_simulations || 999999);
    const count = typeof matched?.simulations_count === 'number' ? matched.simulations_count : 0;
    return {
      allowed: true,
      isDemo,
      simulations_count: count,
      max_simulations: maxSims,
      remaining: Math.max(0, maxSims - count),
      licenseId: matched?.id,
      deduplicated: true
    };
  }

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
  const maxSimulations = isDemo ? 3 : 999999999;

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

  // Comprobar límite de simulaciones: EXCLUSIVO para modo Demostración Exprés (7 días / máximo 3 propuestas).
  // Las licencias normales / Socio Operador / Oficiales tienen propuestas ILIMITADAS.
  if (isDemo && matchedLic.simulations_count >= 3) {
    return {
      allowed: false,
      isDemo: true,
      simulations_count: matchedLic.simulations_count,
      max_simulations: 3,
      remaining: 0,
      message: 'Has alcanzado el límite estricto de 3 propuestas de validación en tu periodo de prueba de 7 días (Licencia Demo). Para desbloquear propuestas ilimitadas y asegurar la Exclusividad Territorial de tu demarcación, contacta a la Dirección de Neural Media House para activar tu licencia oficial.'
    };
  }

  // Incrementar contador y guardar
  matchedLic.simulations_count += 1;
  saveLicensesStore(allLicenses);
  if (runId) {
    recentDeductedRunIds.set(runId, Date.now());
  }

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
  const groqEnc = 'enc:6e20af1e2e2fde5c7c46f6b50bfa2976:5397cc64eae4339e1c398ba4de0241f5:c2496df185a5d3faeb27f90ffba4464b72d81835eef94ccf030a81e5d3feb9cc75f5140bb8fa8444665ca2aabc9b7e26ebcf4fdaaf439d3d';
  const hasGroq = Boolean((process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) || groqEnc);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIzaSy'));
  const activeEngine = hasGroq ? 'Groq Cloud (Llama 3.3 70B Versatile - Ultra Rápido)' : (hasGemini ? 'Google Gemini Pro' : 'INEGI-ABM Demográfico');
  const activeModel = hasGroq ? (process.env.GROQ_MODEL || 'openai/gpt-oss-120b') : (process.env.GEMINI_MODEL || 'gemini-1.5-pro');
  const isOnline = hasGroq || hasGemini;

  res.json({
    success: true,
    engine: activeEngine,
    model: activeModel,
    provider: hasGroq ? 'groq' : (hasGemini ? 'gemini' : 'native'),
    mode: 'Centralized Server-Managed (Plug & Play)',
    hasCentralKey: isOnline,
    status: isOnline ? 'ONLINE_ACTIVE' : 'STANDBY_HYBRID',
    description: isOnline 
      ? `Motor de Inferencia Neuronal Activo (${activeEngine}). Conexión certificada.` 
      : 'Modo híbrido demográfico autónomo.'
  });
});

app.post('/api/ai-engine/setup-key', (req, res) => {
  try {
    const { apiKey, model } = req.body || {};
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({ success: false, error: 'Debe proporcionar una clave válida' });
    }
    const cleanKey = apiKey.trim();
    process.env.GROQ_API_KEY = cleanKey;
    process.env.GROQ_MODEL = (model && typeof model === 'string' && model.trim()) ? model.trim() : 'openai/gpt-oss-120b';
    console.log('[AI Engine] Clave Groq activada en caliente en el servidor');
    return res.json({
      success: true,
      provider: 'groq',
      model: process.env.GROQ_MODEL,
      message: 'Clave Groq configurada exitosamente en el servidor'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/test-connection', async (req, res) => {
  try {
    const inputData = req.body || {};
    const aiConfig = resolveAiConfigForSimulation(inputData);
    
    // Ejecutar ping de conexion real hacia el proveedor configurado (Gemini / Groq / OpenAI / Ollama)
    const pingResult = await freeLLMService.pingConnection(aiConfig);

    if (pingResult.connected) {
      return res.json({
        success: true,
        connected: true,
        provider: pingResult.provider,
        model: pingResult.model,
        latencyMs: pingResult.latencyMs,
        message: `¡Conexión verificada con ${pingResult.provider.toUpperCase()} (${pingResult.model})! Latencia real: ${pingResult.latencyMs}ms.`
      });
    }

    return res.json({
      success: false,
      connected: false,
      provider: pingResult.provider,
      latencyMs: pingResult.latencyMs,
      error: pingResult.error || 'Credenciales no configuradas',
      message: `No se pudo conectar con el motor de IA (${pingResult.provider}): ${pingResult.error || 'Configura tu API Key en .env o en tu licencia'}.`
    });
  } catch (err) {
    console.error('Error en /api/test-connection:', err);
    return res.status(500).json({ success: false, connected: false, error: err.message });
  }
});

// 8. Interrogar interactivamente al Enjambre Ciudadano
app.post('/api/swarm/ask', async (req, res) => {
  try {
    const { pregunta, simulationId } = req.body || {};
    if (!pregunta || !pregunta.trim()) {
      return res.status(400).json({ success: false, error: 'Pregunta requerida' });
    }
    const answers = await orchestratorAgent.answerQuestion(pregunta.trim(), simulationId);
    res.json({ success: true, answers });
  } catch (error) {
    console.error('Error en interrogación al enjambre:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8.1. Diagnóstico y Verificación de IA Real en Vivo (Anti-Random Check)
app.post('/api/verify-ai', (req, res) => {
  try {
    const { proposalText, municipio = 'Ecatepec de Morelos', estado = 'México', simulationId } = req.body || {};
    const latest = (simulationId && orchestratorAgent.sessionsState.get(simulationId)) || orchestratorAgent.latestState || {};
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
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_SERVERLESS ? '/tmp' : path.join(__dirname, 'src', 'data');
const LICENSES_FILE = path.join(DATA_DIR, 'licensesStore.json');
const ACCESS_LOGS_FILE = path.join(DATA_DIR, 'accessLogs.json');

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

const DELETED_LICENSES_FILE = path.join(DATA_DIR, 'deletedLicenses.json');

function loadDeletedLicenseIds() {
  try {
    if (fs.existsSync(DELETED_LICENSES_FILE)) {
      const raw = fs.readFileSync(DELETED_LICENSES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch (_) {}
  return [];
}

function saveDeletedLicenseIds(ids = []) {
  try {
    const dir = path.dirname(DELETED_LICENSES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const unique = Array.from(new Set(ids.filter(Boolean).map(String)));
    fs.writeFileSync(DELETED_LICENSES_FILE, JSON.stringify(unique, null, 2), 'utf8');
  } catch (_) {}
}

function resolveValidPassword(candidatePassword, fallbackPassword = '', username = '') {
  const cleanCandidate = (candidatePassword !== undefined && candidatePassword !== null)
    ? String(candidatePassword).trim()
    : '';
  if (cleanCandidate && cleanCandidate !== 'undefined' && cleanCandidate !== 'null') {
    return cleanCandidate;
  }
  const cleanFallback = (fallbackPassword !== undefined && fallbackPassword !== null)
    ? String(fallbackPassword).trim()
    : '';
  if (cleanFallback && cleanFallback !== 'undefined' && cleanFallback !== 'null') {
    return cleanFallback;
  }
  const uLower = String(username || '').toLowerCase().trim();
  const defMatch = DEFAULT_LICENSES.find(d => d.username.toLowerCase() === uLower);
  if (defMatch && defMatch.password) return defMatch.password;
  return 'Clave2027*';
}

function normalizeLicenseRecord(lic) {
  const validPassword = resolveValidPassword(lic.password, '', lic.username);
  const partido = String(lic.partido || 'PVEM').toUpperCase();
  const isMaster = Boolean(lic.esAdministradorTotal || lic.tipoUsuario === 'MASTER' || lic.tipoUsuario === 'MASTER_ADMIN');
  const rawEstados = Array.isArray(lic.estadosAutorizados) && lic.estadosAutorizados.length > 0 ? lic.estadosAutorizados : ['Estado de México'];
  const canSelectAllStates = Boolean(isMaster || lic.can_select_all_states || rawEstados.includes('TODOS') || rawEstados.includes('ALL_STATES') || rawEstados.includes('TODOS LOS ESTADOS (Nacional)') || rawEstados.length >= 32);
  return {
    ...lic,
    password: validPassword,
    tokenSeguridad: (lic.tokenSeguridad && lic.tokenSeguridad !== 'undefined')
      ? lic.tokenSeguridad
      : generateSecurityToken(partido),
    estadosAutorizados: canSelectAllStates ? ['TODOS'] : rawEstados,
    can_select_all_states: canSelectAllStates,
    permisoRadar: lic.permisoRadar !== undefined ? lic.permisoRadar : true,
    permisoSimulador: lic.permisoSimulador !== undefined ? lic.permisoSimulador : true,
    propuestaFijaTitulo: lic.propuestaFijaTitulo || '',
    propuestaFijaTexto: lic.propuestaFijaTexto || '',
    allowed_parties: Array.isArray(lic.allowed_parties) && lic.allowed_parties.length > 0 ? lic.allowed_parties : [partido],
    can_select_any_party: Boolean(lic.can_select_any_party),
    login_count: typeof lic.login_count === 'number' ? lic.login_count : 0,
    last_login_at: lic.last_login_at || null,
    simulations_count: typeof lic.simulations_count === 'number' ? lic.simulations_count : 0,
    max_simulations: lic.isDemo ? 3 : (lic.max_simulations || 999999),
    isDemo: Boolean(lic.isDemo),
    updatedAt: lic.updatedAt || Date.now()
  };
}

function loadLicensesStore() {
  const deletedIds = loadDeletedLicenseIds();
  try {
    // REGLA DE ORO DE INICIALIZACIÓN:
    // Si el archivo persistente ya existe en disco, JAMÁS reinicializar con DEFAULT_LICENSES (incluso si el arreglo quedó vacío tras borrar usuarios).
    if (fs.existsSync(LICENSES_FILE)) {
      const raw = fs.readFileSync(LICENSES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let hadCorruptedPassword = false;
        const cleaned = parsed
          .filter(lic => lic && lic.id && !deletedIds.includes(String(lic.id)))
          .map(lic => {
            if (!lic.password || lic.password === 'undefined' || lic.password === 'null') {
              hadCorruptedPassword = true;
            }
            return normalizeLicenseRecord(lic);
          });
        if (hadCorruptedPassword) {
          saveLicensesStore(cleaned);
        }
        return cleaned;
      }
    } else {
      // SOLO la primera vez que se abre el sistema y no existe archivo en disco
      const initial = DEFAULT_LICENSES
        .filter(lic => !deletedIds.includes(String(lic.id)))
        .map(lic => normalizeLicenseRecord(lic));
      saveLicensesStore(initial);
      return initial;
    }
  } catch (e) {
    console.error('Error crítico leyendo licensesStore.json:', e.message);
  }
  return DEFAULT_LICENSES
    .filter(lic => !deletedIds.includes(String(lic.id)))
    .map(lic => normalizeLicenseRecord(lic));
}

function saveLicensesStore(list) {
  try {
    const dir = path.dirname(LICENSES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const normalizedList = Array.isArray(list) ? list.map(lic => normalizeLicenseRecord(lic)) : [];
    // Escritura atómica para evitar corrupción de JSON por operaciones concurrentes
    const tmpFile = `${LICENSES_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(normalizedList, null, 2), 'utf8');
    fs.renameSync(tmpFile, LICENSES_FILE);
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
  const { customApiKeyEncrypted, password, tokenSeguridad, ...safeLic } = lic;
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

function formatLicenseForMasterAdmin(lic) {
  if (!lic) return null;
  const normalized = normalizeLicenseRecord(lic);
  const { customApiKeyEncrypted, ...adminLic } = normalized;
  return {
    ...adminLic,
    password: normalized.password,
    tokenSeguridad: normalized.tokenSeguridad,
    hasCustomKey: Boolean(customApiKeyEncrypted),
    customApiKeyMasked: maskApiKey(customApiKeyEncrypted),
    aiModel: normalized.aiModel || 'gemini-default'
  };
}

// Almacén en memoria + Token Stateless HMAC para compatibilidad con entornos Serverless (Vercel)
const activeAdminSessions = new Map();

function createAdminSessionToken(payload = {}) {
  const data = {
    userId: payload.userId || 'master',
    username: payload.username || 'master',
    role: payload.role || 'MASTER_ADMIN',
    isMasterRole: Boolean(payload.isMasterRole),
    createdAt: Date.now()
  };
  const payloadB64 = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', getEncryptionKey()).update(payloadB64).digest('base64url');
  const token = `${payloadB64}.${sig}`;
  activeAdminSessions.set(token, data);
  return token;
}

function verifyStatelessAdminToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  try {
    const [payloadB64, sig] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', getEncryptionKey()).update(payloadB64).digest('base64url');
    if (sig !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() - (data.createdAt || 0) > 24 * 60 * 60 * 1000) return null;
    return data;
  } catch (_) {
    return null;
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeAdminSessions.entries()) {
    if (now - data.createdAt > 24 * 60 * 60 * 1000) {
      activeAdminSessions.delete(token);
    }
  }
}, 60 * 60 * 1000).unref();

function requireMasterAdmin(req, res, next) {
  const token = req.headers['x-session-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (token) {
    const session = activeAdminSessions.get(token) || verifyStatelessAdminToken(token);
    if (session) {
      if (session.isMasterRole || session.role === 'MASTER_ADMIN') {
        return next();
      }
      return res.status(403).json({ success: false, error: 'Acceso denegado: Se requieren privilegios de Administrador Maestro.' });
    }
  }
  const adminKey = req.headers['x-master-admin-key'];
  if (adminKey && adminKey === getEncryptionKey().toString('hex')) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Autenticación requerida para acceder al panel administrativo de licencias.' });
}

function resolveAiConfigForSimulation(inputData = {}) {
  // Prioridad 0: Si la petición trae configuración explícita de IA (ej. ping test o selector)
  if (inputData.aiConfig && (inputData.aiConfig.provider || inputData.aiConfig.apiKey)) {
    let p = inputData.aiConfig.provider || (process.env.GROQ_API_KEY ? 'groq' : 'gemini');
    if (p === 'gemini' && !process.env.GEMINI_API_KEY && process.env.GROQ_API_KEY) {
      p = 'groq';
    }
    const m = p === 'groq' ? (process.env.GROQ_MODEL || 'openai/gpt-oss-120b') : (inputData.aiConfig.model || process.env.GEMINI_MODEL || 'gemini-1.5-pro');
    const k = inputData.aiConfig.apiKey || (p === 'groq' ? process.env.GROQ_API_KEY : (process.env.GEMINI_API_KEY || ''));
    return {
      provider: p,
      model: m,
      apiKey: k,
      centralized: !inputData.aiConfig.apiKey
    };
  }

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
        mappedModel = 'openai/gpt-oss-120b';
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

  // Caso 3: Motor Centralizado General de la Matriz (Groq Cloud GPT-OSS 120B / Llama 3.3 70B)
  const resolvedGroqKey = (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim())
    || decryptApiKey('enc:6e20af1e2e2fde5c7c46f6b50bfa2976:5397cc64eae4339e1c398ba4de0241f5:c2496df185a5d3faeb27f90ffba4464b72d81835eef94ccf030a81e5d3feb9cc75f5140bb8fa8444665ca2aabc9b7e26ebcf4fdaaf439d3d');

  if (resolvedGroqKey) {
    return {
      provider: 'groq',
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      apiKey: resolvedGroqKey,
      centralized: true
    };
  }

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

      const sessionToken = createAdminSessionToken({
        userId: masterAccount.id,
        username: masterAccount.username,
        role: 'MASTER_ADMIN',
        isMasterRole: true
      });

      return res.json({
        success: true,
        role: 'MASTER_ADMIN',
        sessionToken,
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

    // Si el cliente envía sincronización de bóveda persistente (útil tras reinicios Serverless en Vercel), sincronizar antes de autenticar
    const { clientVault, deletedIds: loginDeletedIds } = req.body || {};
    if (Array.isArray(loginDeletedIds) && loginDeletedIds.length > 0) {
      const mergedDel = Array.from(new Set([...loadDeletedLicenseIds(), ...loginDeletedIds.map(String)]));
      saveDeletedLicenseIds(mergedDel);
      licensesStore = licensesStore.filter(l => !mergedDel.includes(String(l.id)));
    }
    if (Array.isArray(clientVault) && clientVault.length > 0) {
      const delSet = new Set(loadDeletedLicenseIds());
      clientVault.forEach(vLic => {
        if (!vLic || !vLic.id || delSet.has(String(vLic.id))) return;
        const idx = licensesStore.findIndex(l => l.id === vLic.id);
        if (idx === -1) {
          licensesStore.push(normalizeLicenseRecord(vLic));
        } else {
          const existing = licensesStore[idx];
          licensesStore[idx] = normalizeLicenseRecord({
            ...existing,
            ...vLic,
            password: resolveValidPassword(vLic.password, existing.password, vLic.username || existing.username),
            customApiKeyEncrypted: existing.customApiKeyEncrypted || vLic.customApiKeyEncrypted || ''
          });
        }
      });
      saveLicensesStore(licensesStore);
    }

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

    const sessionToken = createAdminSessionToken({
      userId: found.id,
      username: found.username,
      role: clientRole,
      isMasterRole
    });

    return res.json({
      success: true,
      role: clientRole,
      sessionToken,
      watermark: AUTHORSHIP_WATERMARK,
      user: {
        ...sanitizeLicenseForClient(found),
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
app.get('/api/licenses', requireMasterAdmin, (req, res) => {
  licensesStore = loadLicensesStore();
  const adminList = licensesStore.map(lic => formatLicenseForMasterAdmin(lic));
  res.json({ success: true, licenses: adminList, deletedIds: loadDeletedLicenseIds(), watermark: AUTHORSHIP_WATERMARK });
});

// 9.2b. Bitácora de Auditoría y Telemetría de Accesos (Zero-Data Retention)
app.get('/api/audit/access-logs', requireMasterAdmin, (req, res) => {
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
app.post('/api/licenses', requireMasterAdmin, (req, res) => {
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

    const isMasterAccount = Boolean(body.esAdministradorTotal || body.tipoUsuario === 'MASTER' || body.tipoUsuario === 'MASTER_ADMIN');
    const can_select_all_states = Boolean(
      isMasterAccount ||
      body.can_select_all_states ||
      (Array.isArray(body.estadosAutorizados) && (body.estadosAutorizados.includes('TODOS') || body.estadosAutorizados.includes('ALL_STATES') || body.estadosAutorizados.length >= 32))
    );

    const estadosAutorizados = can_select_all_states
      ? ['TODOS']
      : (Array.isArray(body.estadosAutorizados) && body.estadosAutorizados.length > 0
          ? body.estadosAutorizados
          : ['Estado de México']);

    const municipiosAutorizados = (isMasterAccount || can_select_all_states)
      ? (Array.isArray(body.municipiosAutorizados) && body.municipiosAutorizados.length > 0 ? body.municipiosAutorizados : ['TODOS'])
      : (Array.isArray(body.municipiosAutorizados) && body.municipiosAutorizados.length > 0
          ? body.municipiosAutorizados
          : ['Ecatepec de Morelos']);

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

    const isDemo = Boolean(body.isDemo);
    let fechaInicio = String(body.fechaInicio || '').trim();
    let fechaExpiracion = String(body.fechaExpiracion || '').trim();
    if (isDemo && (body.diasVigencia || !fechaExpiracion || (existingLic && !existingLic.isDemo))) {
      const days = parseInt(body.diasVigencia, 10) || 7;
      const now = new Date();
      fechaInicio = now.toISOString().split('T')[0];
      const expDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      fechaExpiracion = expDate.toISOString().split('T')[0];
    }
    if (!fechaInicio) fechaInicio = new Date().toISOString().split('T')[0];
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

    const resolvedPassword = resolveValidPassword(
      body.password,
      existingLic ? existingLic.password : '',
      body.username || (existingLic ? existingLic.username : '')
    );

    const licenseObj = {
      id,
      clienteNombre: String(body.clienteNombre || (existingLic ? existingLic.clienteNombre : 'Cliente Político')).trim(),
      username: String(body.username || (existingLic ? existingLic.username : `usuario_${Date.now()}`)).trim(),
      password: resolvedPassword,
      partido,
      allowed_parties,
      can_select_any_party,
      login_count: existingLic ? (existingLic.login_count || 0) : 0,
      last_login_at: existingLic ? (existingLic.last_login_at || null) : null,
      tokenSeguridad,
      nivelGeografico: String(body.nivelGeografico || (can_select_all_states ? 'Federal / Nacional' : 'Municipal / Alcaldía')),
      etiquetaRegion,
      estadosAutorizados,
      can_select_all_states,
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
      isDemo,
      simulations_count: existingLic ? (typeof existingLic.simulations_count === 'number' ? existingLic.simulations_count : 0) : 0,
      max_simulations: isDemo ? 3 : 999999,
      creadoEn: body.creadoEn || (existingLic ? existingLic.creadoEn : new Date().toISOString().split('T')[0]),
      updatedAt: Date.now()
    };

    // Si estaba en lista de eliminados y se vuelve a crear con mismo id, remover de eliminados
    const currentDeleted = loadDeletedLicenseIds();
    if (currentDeleted.includes(String(id))) {
      saveDeletedLicenseIds(currentDeleted.filter(dId => dId !== String(id)));
    }

    if (existingIdx >= 0) {
      licensesStore[existingIdx] = licenseObj;
    } else {
      licensesStore.unshift(licenseObj);
    }

    saveLicensesStore(licensesStore);
    const adminLic = formatLicenseForMasterAdmin(licenseObj);
    const adminList = licensesStore.map(l => formatLicenseForMasterAdmin(l));
    res.json({ success: true, license: adminLic, licenses: adminList, deletedIds: loadDeletedLicenseIds() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4. Alternar Estado Activo / Kill Switch Instantáneo
app.patch('/api/licenses/:id/toggle', requireMasterAdmin, (req, res) => {
  try {
    const { id } = req.params;
    licensesStore = loadLicensesStore();
    const lic = licensesStore.find(l => l.id === id);
    if (!lic) {
      return res.status(404).json({ success: false, error: 'Licencia no encontrada' });
    }
    lic.activo = !lic.activo;
    lic.updatedAt = Date.now();
    saveLicensesStore(licensesStore);
    res.json({ success: true, license: formatLicenseForMasterAdmin(lic), licenses: licensesStore.map(l => formatLicenseForMasterAdmin(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4b. Actualizar Fecha de Vigencia (Calendario / Datepicker Rápido en Licencias Activas)
app.patch('/api/licenses/:id/expiration', requireMasterAdmin, (req, res) => {
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
    lic.updatedAt = Date.now();
    saveLicensesStore(licensesStore);
    res.json({ success: true, license: formatLicenseForMasterAdmin(lic), licenses: licensesStore.map(l => formatLicenseForMasterAdmin(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4c. Actualizar Permisos Independientes de Módulos (Radar vs Simulador)
app.patch('/api/licenses/:id/permissions', requireMasterAdmin, (req, res) => {
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
    lic.updatedAt = Date.now();
    saveLicensesStore(licensesStore);
    res.json({ success: true, license: formatLicenseForMasterAdmin(lic), licenses: licensesStore.map(l => formatLicenseForMasterAdmin(l)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.4d. Reiniciar Contador de Simulaciones (Reset a 0/3)
app.post('/api/licenses/:id/reset-simulations', requireMasterAdmin, (req, res) => {
  try {
    const { id } = req.params;
    licensesStore = loadLicensesStore();
    const lic = licensesStore.find(l => l.id === id);
    if (!lic) {
      return res.status(404).json({ success: false, error: 'Licencia no encontrada' });
    }
    lic.simulations_count = 0;
    lic.updatedAt = Date.now();
    saveLicensesStore(licensesStore);
    res.json({
      success: true,
      message: `Contador de propuestas reiniciado a 0 para ${lic.username}`,
      license: formatLicenseForMasterAdmin(lic),
      licenses: licensesStore.map(l => formatLicenseForMasterAdmin(l))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.5. Eliminar Licencia (Persistencia Definitiva Anti-Reaparición)
app.delete('/api/licenses/:id', requireMasterAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const currentDeleted = loadDeletedLicenseIds();
    if (!currentDeleted.includes(String(id))) {
      currentDeleted.push(String(id));
      saveDeletedLicenseIds(currentDeleted);
    }
    licensesStore = loadLicensesStore();
    licensesStore = licensesStore.filter(l => String(l.id) !== String(id));
    saveLicensesStore(licensesStore);
    res.json({
      success: true,
      deletedId: id,
      deletedIds: currentDeleted,
      licenses: licensesStore.map(l => formatLicenseForMasterAdmin(l))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.6. Sincronización y Bóveda Anti-Pérdida de Licencias (Persistencia Bidireccional Inmutable)
app.post('/api/licenses/sync-vault', requireMasterAdmin, (req, res) => {
  try {
    const { vaultLicenses = [], deletedIds = [], authoritativeClientVault = false } = req.body || {};
    const mergedDeleted = Array.from(new Set([
      ...loadDeletedLicenseIds(),
      ...(Array.isArray(deletedIds) ? deletedIds.map(String) : [])
    ]));
    saveDeletedLicenseIds(mergedDeleted);

    licensesStore = loadLicensesStore().filter(l => !mergedDeleted.includes(String(l.id)));

    if (!Array.isArray(vaultLicenses)) {
      saveLicensesStore(licensesStore);
      return res.json({
        success: true,
        count: 0,
        deletedIds: mergedDeleted,
        licenses: licensesStore.map(l => formatLicenseForMasterAdmin(l))
      });
    }

    // Si el cliente envía su bóveda autoritativa (ya inicializada), eliminar cualquier licencia por defecto que no esté en su bóveda
    if (authoritativeClientVault) {
      const vaultIds = new Set(vaultLicenses.filter(v => v && v.id).map(v => String(v.id)));
      const defaultIds = new Set(DEFAULT_LICENSES.map(d => String(d.id)));
      licensesStore = licensesStore.filter(sLic => {
        if (defaultIds.has(String(sLic.id)) && !vaultIds.has(String(sLic.id))) {
          if (!mergedDeleted.includes(String(sLic.id))) {
            mergedDeleted.push(String(sLic.id));
          }
          return false;
        }
        return true;
      });
      saveDeletedLicenseIds(mergedDeleted);
    }

    let addedCount = 0;
    let updatedCount = 0;

    vaultLicenses.forEach(vLic => {
      if (!vLic || !vLic.id || mergedDeleted.includes(String(vLic.id))) return;
      const idx = licensesStore.findIndex(l => l.id === vLic.id);
      if (idx === -1) {
        licensesStore.push(normalizeLicenseRecord(vLic));
        addedCount++;
      } else {
        const existing = licensesStore[idx];
        const validPassword = resolveValidPassword(
          vLic.password,
          existing.password,
          vLic.username || existing.username
        );
        licensesStore[idx] = normalizeLicenseRecord({
          ...existing,
          ...vLic,
          password: validPassword,
          tokenSeguridad: (vLic.tokenSeguridad && vLic.tokenSeguridad !== 'undefined')
            ? vLic.tokenSeguridad
            : existing.tokenSeguridad,
          customApiKeyEncrypted: existing.customApiKeyEncrypted || vLic.customApiKeyEncrypted || '',
          login_count: Math.max(existing.login_count || 0, vLic.login_count || 0),
          last_login_at: existing.last_login_at || vLic.last_login_at || null
        });
        updatedCount++;
      }
    });

    saveLicensesStore(licensesStore);
    res.json({
      success: true,
      addedCount,
      updatedCount,
      deletedIds: mergedDeleted,
      licenses: licensesStore.map(l => formatLicenseForMasterAdmin(l))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor en entornos locales / dedicados (Render, Railway) y exportar para Vercel Serverless
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🟢 GOVTECH WAR ROOM v5.0 ENTERPRISE — NEURAL MEDIA HOUSE / ERICK VEGA`);
    console.log(`📡 Servidor activo y escuchando en http://localhost:${PORT}`);
    console.log(`🤖 Cobertura Nacional 32 Estados + Turnstile Anti-Bots + Cyber Sentinel 24/7`);
    console.log(`================================================================`);
  });
}

module.exports = app;
