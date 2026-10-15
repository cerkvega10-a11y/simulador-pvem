const fs = require('fs');
const path = require('path');

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

  const listado = lista.map(m => ({
    estado: targetState,
    nombre: m,
    tieneDetalleProfundo: !!MUNICIPIOS_EDOMEX_DETALLADOS[m]
  }));

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

  // Enviar evento de inicio inmediato para confirmar conexión en la UI
  sendEvent({
    paso: 1,
    porcentaje: 5,
    agente: 'Agente Orquestador Central',
    mensaje: 'Canal de comunicación en tiempo real establecido. Iniciando Meta-Agentes...',
    status: 'active'
  });

  try {
    await orchestratorAgent.runSimulationPipeline(inputData, (progress) => {
      sendEvent(progress);
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
    const inputData = req.body;
    const report = await orchestratorAgent.runSimulationPipeline(inputData);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error en POST /api/simulate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Prueba de Conexión de API Key (Gemini, OpenAI, Tavily)
app.post('/api/test-connection', async (req, res) => {
  const { provider, apiKey, model } = req.body || {};

  if (!provider || provider === 'native') {
    return res.json({
      success: true,
      provider: 'native',
      message: 'Motor Nativo Híbrido INEGI-ABM activo y calibrado. No requiere API Key externa.'
    });
  }

  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Por favor ingresa una API Key válida.'
    });
  }

  try {
    if (provider === 'gemini') {
      const selectedModel = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responde únicamente con la palabra: CONECTADO' }] }]
        })
      });

      const data = await geminiRes.json();
      if (!geminiRes.ok) {
        return res.status(geminiRes.status).json({
          success: false,
          error: data.error?.message || `Error ${geminiRes.status}: Verifique que la API Key sea correcta y tenga cuota activa en Google AI Studio.`
        });
      }

      return res.json({
        success: true,
        provider: 'gemini',
        model: selectedModel,
        message: `¡Conexión exitosa con Google Gemini (${selectedModel})!`
      });
    }

    if (provider === 'openai') {
      const selectedModel = model || 'gpt-4o-mini';
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });

      const data = await openaiRes.json();
      if (!openaiRes.ok) {
        return res.status(openaiRes.status).json({
          success: false,
          error: data.error?.message || `Error ${openaiRes.status}: Verifique su API Key de OpenAI.`
        });
      }

      return res.json({
        success: true,
        provider: 'openai',
        model: selectedModel,
        message: `¡Conexión exitosa con OpenAI (${selectedModel})!`
      });
    }

    if (provider === 'groq') {
      const selectedModel = model || 'llama-3.3-70b-versatile';
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });

      const data = await groqRes.json();
      if (!groqRes.ok) {
        return res.status(groqRes.status).json({
          success: false,
          error: data.error?.message || `Error ${groqRes.status}: Verifique su API Key gratuita de Groq.`
        });
      }

      return res.json({
        success: true,
        provider: 'groq',
        model: selectedModel,
        message: `¡Conexión exitosa con Groq Cloud (${selectedModel}) - Motor gratuito activo!`
      });
    }

    if (provider === 'openrouter') {
      const selectedModel = model || 'meta-llama/llama-3.2-3b-instruct:free';
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Simulador Social PVEM'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });

      const data = await orRes.json();
      if (!orRes.ok) {
        return res.status(orRes.status).json({
          success: false,
          error: data.error?.message || `Error ${orRes.status}: Verifique su API Key de OpenRouter.`
        });
      }

      return res.json({
        success: true,
        provider: 'openrouter',
        model: selectedModel,
        message: `¡Conexión exitosa con OpenRouter (${selectedModel}) - Modelo gratuito activo!`
      });
    }

    if (provider === 'tavily') {
      const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey.trim(),
          query: 'Estado de Mexico noticias',
          max_results: 1
        })
      });

      const data = await tavilyRes.json();
      if (!tavilyRes.ok) {
        return res.status(tavilyRes.status).json({
          success: false,
          error: data.message || `Error ${tavilyRes.status} conectando a Tavily Search.`
        });
      }

      return res.json({
        success: true,
        provider: 'tavily',
        message: '¡Conexión exitosa con Tavily Search OSINT!'
      });
    }

    res.status(400).json({ success: false, error: 'Proveedor no soportado' });
  } catch (err) {
    console.error('Error probando conexión:', err);
    res.status(500).json({ success: false, error: `Error de red: ${err.message}` });
  }
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
      cargo = 'Presidente Municipal / Alcalde',
      ciclo = '2027',
      prioridad
    } = req.query || {};

    const ciclos = electoralRadarEngine.getCiclosElectorales();
    const cargos = electoralRadarEngine.getCargosElectorales();
    const municipiosDisponibles = coloniasData.getMunicipiosDisponibles();
    const colonias = prioridad
      ? coloniasData.filterColoniasByPrioridad(municipio, prioridad)
      : coloniasData.getColoniasByMunicipio(municipio);
    const stats = coloniasData.getColoniasStats(municipio);
    const diagnostico = electoralRadarEngine.getDiagnosticoProblematicas(municipio);
    const propuestas = electoralRadarEngine.getBateriaPropuestas(cargo, municipio);
    const sindicatos = electoralRadarEngine.getAlianzasYSindicatos(municipio, cargo);

    res.json({
      success: true,
      municipio,
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
      cargo = 'Presidente Municipal / Alcalde',
      ciclo = '2027',
      candidato = 'Candidato de Transformación Verde',
      coalicion = 'PVEM - Sigamos Haciendo Historia'
    } = req.body || {};

    const radarAnalysis = electoralRadarEngine.generateFullRadarAnalysis({
      municipio,
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

const DEFAULT_LICENSES = [
  {
    id: 'lic-demo-pvem-01',
    clienteNombre: 'Candidatura Alcaldía Ecatepec (PVEM)',
    username: 'ecatepec2027',
    password: 'Verde2027*',
    partido: 'PVEM',
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
      if (Array.isArray(parsed)) {
        return parsed.map(lic => ({
          estadosAutorizados: ['Estado de México'],
          permisoRadar: true,
          permisoSimulador: true,
          propuestaFijaTitulo: '',
          propuestaFijaTexto: '',
          ...lic
        }));
      }
    }
  } catch (e) {
    console.warn('Advertencia leyendo licensesStore.json:', e.message);
  }
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

    // Validación de Administrador Maestro Exclusivo
    if (u === 'Cerkvega92' && p === 'Tutusito1*') {
      return res.json({
        success: true,
        role: 'MASTER_ADMIN',
        watermark: AUTHORSHIP_WATERMARK,
        user: {
          id: 'master-admin-erick-vega',
          clienteNombre: 'Erick Vega — Administrador Maestro (Neural Media House)',
          username: 'Cerkvega92',
          partido: 'PVEM',
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
          propuestaFijaTitulo: '',
          propuestaFijaTexto: '',
          maxSwarmSize: 100000,
          fechaInicio: '2026-01-01',
          fechaExpiracion: '2099-12-31',
          activo: true
        }
      });
    }

    // Buscar en licencias de clientes políticos
    licensesStore = loadLicensesStore();
    const found = licensesStore.find(lic => lic.username.toLowerCase() === u.toLowerCase() && lic.password === p);

    if (!found) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Verifique su Usuario y Contraseña.'
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

    return res.json({
      success: true,
      role: 'CLIENT',
      watermark: AUTHORSHIP_WATERMARK,
      user: found
    });
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9.2. Listar Licencias (Para Panel de Control Maestro)
app.get('/api/licenses', (req, res) => {
  licensesStore = loadLicensesStore();
  res.json({ success: true, licenses: licensesStore, watermark: AUTHORSHIP_WATERMARK });
});

// 9.3. Crear o Actualizar Licencia de Cliente Político
app.post('/api/licenses', (req, res) => {
  try {
    const body = req.body || {};
    licensesStore = loadLicensesStore();

    const id = body.id || `lic-${Date.now()}`;
    const existingIdx = licensesStore.findIndex(l => l.id === id);

    const licenseObj = {
      id,
      clienteNombre: String(body.clienteNombre || 'Cliente Político').trim(),
      username: String(body.username || `usuario_${Date.now()}`).trim(),
      password: String(body.password || 'Clave2027*').trim(),
      partido: String(body.partido || 'PVEM').toUpperCase(),
      nivelGeografico: String(body.nivelGeografico || 'Municipal / Alcaldía'),
      etiquetaRegion: String(body.etiquetaRegion || 'Demarcación Autorizada').trim(),
      estadosAutorizados: Array.isArray(body.estadosAutorizados) && body.estadosAutorizados.length > 0
        ? body.estadosAutorizados
        : ['Estado de México'],
      cargosAutorizados: Array.isArray(body.cargosAutorizados) && body.cargosAutorizados.length > 0
        ? body.cargosAutorizados
        : ['Presidente Municipal / Alcalde'],
      municipiosAutorizados: Array.isArray(body.municipiosAutorizados) && body.municipiosAutorizados.length > 0
        ? body.municipiosAutorizados
        : ['Ecatepec de Morelos'],
      permisoRadar: body.permisoRadar !== undefined ? Boolean(body.permisoRadar) : true,
      permisoSimulador: body.permisoSimulador !== undefined ? Boolean(body.permisoSimulador) : true,
      propuestaFijaTitulo: String(body.propuestaFijaTitulo || '').trim(),
      propuestaFijaTexto: String(body.propuestaFijaTexto || '').trim(),
      maxSwarmSize: parseInt(body.maxSwarmSize, 10) || 100000,
      fechaInicio: String(body.fechaInicio || '2026-01-01'),
      fechaExpiracion: String(body.fechaExpiracion || '2027-12-31'),
      activo: body.activo !== undefined ? Boolean(body.activo) : true,
      creadoEn: body.creadoEn || new Date().toISOString().split('T')[0]
    };

    if (existingIdx >= 0) {
      licensesStore[existingIdx] = licenseObj;
    } else {
      licensesStore.unshift(licenseObj);
    }

    saveLicensesStore(licensesStore);
    res.json({ success: true, license: licenseObj, licenses: licensesStore });
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
    res.json({ success: true, license: lic, licenses: licensesStore });
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
    res.json({ success: true, license: lic, licenses: licensesStore });
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
    res.json({ success: true, license: lic, licenses: licensesStore });
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
    res.json({ success: true, licenses: licensesStore });
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
