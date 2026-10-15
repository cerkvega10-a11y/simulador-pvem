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
const presets = require('./src/data/presets');
const realAiVerificationAgent = require('./src/agents/realAiVerificationAgent');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de multer para manejo en memoria de archivos subidos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB máximo
});

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de salud / keep-alive 24/7 para evitar que el servidor se duerma en Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// --- RUTAS DE LA API ---

// 1. Obtener Estados de la República
app.get('/api/states', (req, res) => {
  res.json({ success: true, states: ESTADOS_MEXICO });
});

// 2. Obtener Municipios (con foco en Estado de México)
app.get('/api/municipalities', (req, res) => {
  const { estado } = req.query;
  if (!estado || estado === 'Estado de México') {
    const listado = LISTA_125_MUNICIPIOS_EDOMEX.map(m => ({
      nombre: m,
      tieneDetalleProfundo: !!MUNICIPIOS_EDOMEX_DETALLADOS[m]
    }));
    return res.json({ success: true, municipios: listado });
  }

  // Municipios representativos para otros estados
  const genericos = [
    { nombre: 'Municipio Capital / Cabecera', tieneDetalleProfundo: false },
    { nombre: 'Zona Metropolitana Norte', tieneDetalleProfundo: false },
    { nombre: 'Zona Metropolitana Sur', tieneDetalleProfundo: false },
    { nombre: 'Región Costa / Agrícola', tieneDetalleProfundo: false },
    { nombre: 'Región Industrial', tieneDetalleProfundo: false }
  ];
  return res.json({ success: true, municipios: genericos });
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

// 9. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Simulador Predictivo de Impacto Social - Partido Verde Ecologista Estado de México',
    version: '1.0.0',
    metaAgentes: 8,
    timestamp: new Date().toISOString()
  });
});

// Redireccionar todas las demás rutas al index.html (Express 5 safe)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🟢 SIMULADOR PREDICTIVO DE IMPACTO SOCIAL - PARTIDO VERDE EDOMEX`);
  console.log(`📡 Servidor activo y escuchando en http://localhost:${PORT}`);
  console.log(`🤖 8 Meta-Agentes listos para simulación de enjambre (100 - 1000)`);
  console.log(`================================================================`);
});
