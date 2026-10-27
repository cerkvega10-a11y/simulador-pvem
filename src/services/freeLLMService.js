const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY || 'govtech-warroom-master-aes256-encryption-secret-2027';

function decryptStoredApiKey(cipherText) {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('enc:')) {
    return cipherText || '';
  }
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return '';
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encryptedText = parts[3];
    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted.trim();
  } catch (err) {
    return '';
  }
}

function loadPersistedAiKeys() {
  const candidateFiles = [
    path.join(__dirname, '../data/ai_config_db.json'),
    path.join(process.cwd(), 'src/data/ai_config_db.json'),
    '/tmp/ai_config_db.json'
  ];

  for (const f of candidateFiles) {
    try {
      if (fs.existsSync(f)) {
        const raw = fs.readFileSync(f, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.groqApiKeyEncrypted && !process.env.GROQ_API_KEY) {
          const dec = decryptStoredApiKey(parsed.groqApiKeyEncrypted);
          if (dec) process.env.GROQ_API_KEY = dec;
        }
        if (parsed.geminiApiKeyEncrypted && !process.env.GEMINI_API_KEY) {
          const dec = decryptStoredApiKey(parsed.geminiApiKeyEncrypted);
          if (dec) process.env.GEMINI_API_KEY = dec;
        }
        if (parsed.deepseekApiKeyEncrypted && !process.env.DEEPSEEK_API_KEY) {
          const dec = decryptStoredApiKey(parsed.deepseekApiKeyEncrypted);
          if (dec) process.env.DEEPSEEK_API_KEY = dec;
        }
        if (parsed.openaiApiKeyEncrypted && !process.env.OPENAI_API_KEY) {
          const dec = decryptStoredApiKey(parsed.openaiApiKeyEncrypted);
          if (dec) process.env.OPENAI_API_KEY = dec;
        }
        break;
      }
    } catch (_) {}
  }

  if (!process.env.GROQ_API_KEY) {
    const fallbackDec = decryptStoredApiKey('enc:6e20af1e2e2fde5c7c46f6b50bfa2976:5397cc64eae4339e1c398ba4de0241f5:c2496df185a5d3faeb27f90ffba4464b72d81835eef94ccf030a81e5d3feb9cc75f5140bb8fa8444665ca2aabc9b7e26ebcf4fdaaf439d3d');
    if (fallbackDec) process.env.GROQ_API_KEY = fallbackDec;
  }
}

function ensureEnvLoaded() {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = val;
        }
      });
    } catch (_) {}
  }
  loadPersistedAiKeys();
}
ensureEnvLoaded();

class FreeLLMService {
  constructor() {
    this.providers = {
      groq: {
        name: 'Groq Cloud LPU (Llama 3.3 70B Versatile - Ultra Rápido ~300 T/s)',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        availableModels: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'],
        freeKeyUrl: 'https://console.groq.com/keys'
      },
      gemini: {
        name: 'Google Gemini Pro / Enterprise Neural Swarm (Motor Centralizado)',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        defaultModel: 'gemini-1.5-pro',
        availableModels: ['gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'],
        freeKeyUrl: 'https://aistudio.google.com/'
      },
      openai: {
        name: 'OpenAI (GPT-4o / GPT-4o Mini / Enterprise)',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o',
        availableModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
        freeKeyUrl: 'https://platform.openai.com/api-keys'
      },
      openrouter: {
        name: 'OpenRouter (Modelos Gratuitos :free)',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        defaultModel: 'meta-llama/llama-3.2-3b-instruct:free',
        availableModels: [
          'meta-llama/llama-3.2-3b-instruct:free',
          'google/gemini-2.0-flash-exp:free',
          'mistralai/mistral-7b-instruct:free'
        ],
        freeKeyUrl: 'https://openrouter.ai/keys'
      },
      ollama: {
        name: 'Ollama Local (100% Offline / Gratuito)',
        endpoint: 'http://localhost:11434/v1/chat/completions',
        defaultModel: 'llama3.2',
        availableModels: ['llama3.2', 'mistral', 'qwen2.5'],
        freeKeyUrl: 'https://ollama.com/'
      }
    };
  }

  /**
   * Estrategia de Doble Capa de Respaldo Centralizada (Primary & Fallback API Key)
   * 1. Clave Principal: process.env.GEMINI_API_KEY o process.env.GOOGLE_AI_KEY o explicitKey
   * 2. Clave de Respaldo: process.env.BACKUP_API_KEY
   */
  getGeminiKeys(explicitKey) {
    const primaryKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || explicitKey || '').trim();
    const backupKey = (process.env.BACKUP_API_KEY || '').trim();
    return { primaryKey, backupKey };
  }

  /**
   * Resuelve el proveedor y la clave activa priorizando Groq / Gemini segun configuracion
   */
  resolveProviderAndKey(aiConfig = {}) {
    if (aiConfig.provider && aiConfig.provider !== 'native' && aiConfig.provider !== 'default') {
      const p = aiConfig.provider;
      let k = aiConfig.apiKey;
      if (!k) {
        if (p === 'groq') k = process.env.GROQ_API_KEY;
        else if (p === 'gemini') k = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.BACKUP_API_KEY;
        else if (p === 'openai') k = process.env.OPENAI_API_KEY;
      }
      return { provider: p, apiKey: (k || '').trim() };
    }

    // Auto-detección: si hay GROQ_API_KEY activa, usar Groq como motor ultra-rápido de 70B
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
      return { provider: 'groq', apiKey: process.env.GROQ_API_KEY.trim() };
    }

    const { primaryKey, backupKey } = this.getGeminiKeys(aiConfig.apiKey);
    if (primaryKey || backupKey) {
      return { provider: 'gemini', apiKey: primaryKey || backupKey };
    }

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
      return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY.trim() };
    }

    return { provider: null, apiKey: null };
  }

  /**
   * Ejecuta una llamada de inferencia a cualquiera de los proveedores gratuitos
   */
  async executeChatCompletion({ provider = 'groq', apiKey, model, messages, temperature = 0.5, jsonMode = false }) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Proveedor de IA desconocido: ${provider}`);
    }

    let selectedModel = model || providerConfig.defaultModel;

    // Caso 1: Google Gemini API (Con Capa de Respaldo Automática)
    if (provider === 'gemini') {
      const { primaryKey, backupKey } = this.getGeminiKeys(apiKey);
      const initialKey = primaryKey || backupKey;

      if (!initialKey) {
        throw new Error('Se requiere una API Key de Google Gemini (no se detectó clave principal ni de respaldo)');
      }

      const executeGeminiRequest = async (activeKey) => {
        const url = `${providerConfig.endpoint}/${selectedModel}:generateContent?key=${activeKey}`;
        const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
        const userMessages = messages.filter(m => m.role !== 'system');

        const contents = userMessages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const bodyPayload = {
          contents,
          generationConfig: {
            temperature,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {})
          }
        };

        if (systemInstruction) {
          bodyPayload.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(25000)
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Error en Google Gemini (${res.status}): ${errText}`);
        }

        const resJson = await res.json();
        return resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
      };

      try {
        return await executeGeminiRequest(initialKey);
      } catch (err) {
        // Conmutación transparente a Capa de Respaldo si la clave principal falló o agotó cuota
        if (backupKey && initialKey !== backupKey) {
          console.warn('⚠️ [Seguridad IA] Clave principal de Gemini falló. Conmutando a Capa de Respaldo (BACKUP_API_KEY)...');
          try {
            return await executeGeminiRequest(backupKey);
          } catch (backupErr) {
            console.error('❌ Error en Capa de Respaldo Gemini:', backupErr.message);
            throw backupErr;
          }
        }
        throw err;
      }
    }

    if (!apiKey && provider !== 'ollama') {
      throw new Error(`Se requiere una API Key para ${provider}`);
    }

    // Caso 2: Compatible con formato OpenAI (Groq, OpenRouter, Ollama)
    const headers = {
      'Content-Type': 'application/json'
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'Simulador Social Partido Verde Edomex';
    }

    if (provider === 'groq' && !selectedModel) { selectedModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; }
    const payload = {
      model: selectedModel,
      messages,
      temperature,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    let res = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000)
    });

    if (!res.ok && (res.status === 404 || res.status === 429) && provider === 'groq') {
      const fallbackModel = (selectedModel === 'llama-3.3-70b-versatile' || selectedModel.includes('llama'))
        ? 'openai/gpt-oss-120b'
        : (selectedModel === 'openai/gpt-oss-120b' ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-20b');
      console.warn(`[Groq Hot Fallback] Status ${res.status} con ${selectedModel}. Reintentando con ${fallbackModel}...`);
      payload.model = fallbackModel;
      res = await fetch(providerConfig.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000)
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error en ${provider.toUpperCase()} (${res.status}): ${errText}`);
    }

    const resJson = await res.json();
    return resJson.choices?.[0]?.message?.content || '';
  }

  /**
   * Evalúa la coherencia, absurdo y viabilidad política con IA real
   */
  async evaluateProposalWithLLM(propuestaTexto, municipio, estado, problematicasLocales, aiConfig) {
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) {
      return null;
    }

    const systemPrompt = `Eres un auditor sociopolítico y demográfico experto en municipios de México para el Partido Verde.
Analiza con total imparcialidad y rigor la propuesta que se someterá a votación ciudadana en ${municipio}, ${estado}.
Problemáticas reales del municipio: ${problematicasLocales.map(p => p.tema || p).join('; ')}.

CRITERIOS ESTRICTOS:
1. Si la propuesta es absurda, surrealista, broma, contiene fantasías (ej. ovnis, chocolate, dragones, pingüinos, teletransporte) o no tiene sentido:
   - "esAbsurdo": true
   - "coherencia": 0 a 15
   - "aprobacionEstimada": 2 a 8
   - "rechazoEstimado": 85 a 95
   - "neutroEstimado": 3 a 10
2. Si la propuesta es punitiva, incrementa tarifas, cobra impuestos, reduce carriles o quita tianguis/rutas:
   - "esAbsurdo": false
   - "esPunitivo": true
   - "aprobacionEstimada": 8 a 18
   - "rechazoEstimado": 70 a 86
   - "neutroEstimado": 6 a 14
3. Si la propuesta atiende directamente un dolor urgente de ${municipio} (agua, alumbrado, seguridad, reforestación, clínicas gratuitas):
   - "esAbsurdo": false
   - "aprobacionEstimada": 65 a 76
   - "rechazoEstimado": 12 a 20
   - "neutroEstimado": 12 a 20
4. Si la propuesta es genérica o irrelevante para los dolores reales de ${municipio}:
   - "aprobacionEstimada": 30 a 45
   - "rechazoEstimado": 25 a 35
   - "neutroEstimado": 30 a 45

Devuelve EXCLUSIVAMENTE un JSON con:
{
  "esAbsurdo": boolean,
  "esPunitivo": boolean,
  "esBeneficioReal": boolean,
  "nivelCoherencia": number,
  "aprobacionEstimada": number,
  "rechazoEstimado": number,
  "neutroEstimado": number,
  "dictamen": string,
  "argumentoPrincipalOposicion": string,
  "argumentoPrincipalFavor": string,
  "reaccionPorSector": {
    "estudiantes": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "comerciantes": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "transportistas": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "salud": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "maestros": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "burocracia": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "empresarios": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "madresHogar": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "sectorPrimario": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "adultosMayores": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string },
    "construccion": { "favor": number, "contra": number, "neutro": number, "friccionSocial": number, "motivo": string }
  }
}`;

    const userPrompt = `Propuesta a evaluar: "${propuestaTexto}" en ${municipio}, ${estado}.`;

    try {
      const rawResponse = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: aiConfig?.model || this.providers[effectiveProvider]?.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        jsonMode: true
      });

      // Extraer y parsear JSON
      const cleanJson = (rawResponse || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn(`[FreeLLMService] Error evaluando con ${effectiveProvider}:`, err.message);
      return null;
    }
  }

  /**
   * Genera hilos de debate inter-agentes vivos con IA
   */
  async generateDebatesWithLLM(propuestaTexto, tituloProyecto, municipio, estado, problematicasLocales, aiConfig) {
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) {
      return null;
    }

    const systemPrompt = `Eres un simulador de deliberación ciudadana en ${municipio}, ${estado}.
Genera 2 hilos de debate vecinal auténticos y apasionados sobre la propuesta "${tituloProyecto}" (${propuestaTexto}).
Los participantes deben hablar como ciudadanos mexiquenses reales de colonias de ${municipio}, usando argumentos técnicos y de bolsillo.
Si la propuesta es absurda o inútil para ${municipio}, los ciudadanos DEBEN burlarse, quejarse o cuestionar indignados la propuesta.

Devuelve estrictamente un JSON con este formato:
[
  {
    "id": "thread-1",
    "tema": "Tema central del debate",
    "contexto": "Breve contexto del debate entre colonos",
    "mensajes": [
      {
        "agenteId": "agente-1",
        "nombre": "Nombre Apellido",
        "edad": 35,
        "ocupacion": "Ocupación local",
        "colonia": "Colonia de ${municipio}",
        "municipio": "${municipio}",
        "postura": "En contra / A favor / Neutro",
        "entusiasmo": 25,
        "mensaje": "Opinión sin pelos en la lengua...",
        "argumentoTecnico": "Argumento de fondo...",
        "condicionDeCambio": "Condición para cambiar voto..."
      }
    ]
  }
]`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Genera los debates vecinales para: "${propuestaTexto}" en ${municipio}.` }
        ],
        temperature: 0.7,
        jsonMode: true
      });

      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn(`[FreeLLMService] Error generando debates con ${effectiveProvider}:`, err.message);
      return null;
    }
  }

  /**
   * Diagnóstico de Conexión Real con Envío de Ping y Medición de Latencia
   */
  async pingConnection(aiConfig = {}) {
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);

    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) {
      return {
        connected: false,
        provider: effectiveProvider || 'ninguno',
        latencyMs: 0,
        error: 'No hay API Key configurada para inferencia de IA'
      };
    }

    const start = Date.now();
    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel;
      const res = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [{ role: 'user', content: 'Responde exclusivamente la palabra: OK' }],
        temperature: 0.1
      });
      const latencyMs = Date.now() - start;
      return {
        connected: true,
        provider: effectiveProvider,
        model: selectedModel,
        latencyMs,
        response: (res || '').trim().slice(0, 20)
      };
    } catch (err) {
      return {
        connected: false,
        provider: effectiveProvider,
        latencyMs: Date.now() - start,
        error: err.message
      };
    }
  }

  /**
   * Generación Neuronal Directa de Testimonios Ciudadanos (Cero Plantillas Fijas)
   */
  async generateSwarmChatsWithLLM(params = {}) {
    const {
      propuestaTexto = '',
      municipio = 'Ecatepec de Morelos',
      estado = 'Estado de México',
      topProblems = [],
      count = 14,
      aiConfig = {}
    } = params;

    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);

    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) {
      return null;
    }

    const systemPrompt = `Eres un simulador sociopolítico en ${municipio}, ${estado}.
Genera ${count} opiniones ciudadanas DIVERSAS, HIPER-REALISTAS y NO REPETITIVAS de habitantes de ${municipio} evaluando esta propuesta.
Cada ciudadano debe tener una postura coherente ('A favor', 'En contra' o 'Neutro') según su condición socioeconómica, colonia y ocupación.
Problemáticas de ${municipio}: ${topProblems.map(p => p.tema || p).join('; ')}.

Devuelve estrictamente un arreglo JSON:
[
  {
    "nombre": "Nombre Apellido",
    "edad": 32,
    "genero": "M" o "F",
    "ocupacion": "Ocupación local",
    "colonia": "Colonia real de ${municipio}",
    "nse": "C" o "D+" o "C+" o "D/E",
    "voto": "A favor" o "En contra" o "Neutro",
    "entusiasmo": 15 a 95,
    "medioTransporte": "Combi" o "Auto" o "Metro",
    "mensaje": "Opinión personal viva en primera persona, coloquial y directa.",
    "argumento": "Explicación de fondo.",
    "citaProyecto": "Punto de la propuesta que le causó esa reacción"
  }
]`;

    try {
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: aiConfig?.model || this.providers[effectiveProvider]?.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Propuesta: "${propuestaTexto}". Genera ${count} testimonios en JSON.` }
        ],
        temperature: 0.7,
        jsonMode: true
      });

      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed) ? parsed : (parsed.testimonios || parsed.chats || null);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateSwarmChatsWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 1. Inteligencia Sindical Neuronal: Evalúa las 12 fuerzas gremiales y el riesgo de paro/bloqueo vial con IA
   */
  async generateUnionIntelligenceWithLLM(params = {}) {
    const { propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', topProblems = [], aiConfig = {} } = params;
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const systemPrompt = `Eres un asesor de gobernabilidad y relaciones sindicales en ${municipio}, ${estado}.
Analiza la siguiente propuesta y evalúa con máxima agudeza política la reacción de las 12 Fuerzas Sindicales Estratégicas de México:
1. salud (SNTSA / ISEM), 2. electricistas (SME / SUTERM), 3. burocratas (SUTEYM / FSTSE), 4. magisterio (SNTE / SMSEM), 5. agua_limpia (ODAPAS / CAEM / Limpia), 6. transporte (Rutas, Combis, Taxis), 7. construccion (CTM / Materialistas), 8. industria (CROC / CROM), 9. telecom (STRM), 10. comerciantes (Tianguistas / Mercados), 11. campesinos (CNC / Ejidos), 12. policias (Asociaciones Policiales).

Calcula el semáforo y riesgo de paro (0-100) y redacta el pliego y la declaración del líder para cada sindicato que tenga afectación directa o colateral frente a esta propuesta específica.

Devuelve estrictamente este JSON:
{
  "riesgoParoScore": 45,
  "semaforo": "Verde" | "Amarillo" | "Rojo",
  "semaforoTexto": "Alerta Preventiva / Riesgo Inminente / Riesgo Mínimo",
  "dictamenSindical": "Diagnóstico de gobernabilidad y riesgo de parálisis urbana en ${municipio}...",
  "fuerzas": [
    {
      "id": "transporte",
      "postura": "En Contra" | "A Favor" | "Reserva Crítica / Negociación",
      "favor": 15,
      "contra": 75,
      "neutro": 10,
      "nivelRiesgo": "Crítico" | "Alto" | "Medio" | "Bajo",
      "pliegoPetitorio": "Pliego petitorio exacto frente a esta propuesta...",
      "liderTestimonio": "Declaración directa y contundente del líder sindical..."
    }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Propuesta en ${municipio}: "${propuestaTexto}". Evalúa las fuerzas sindicales en JSON.` }
        ],
        temperature: 0.4,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateUnionIntelligenceWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 2. Escudo de Blindaje y Defensa Estratégica con IA (20 Preguntas Críticas y Pivotes)
   */
  async generateDefenseMatrixWithLLM(params = {}) {
    const { propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', votosFinales = {}, aiConfig = {} } = params;
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const contra = votosFinales.porcentajeContra || 28;
    const favor = votosFinales.porcentajeFavor || 60;

    const systemPrompt = `Eres el director de Media Training Político y Cuarto de Guerra para el candidato en ${municipio}, ${estado}.
Genera una batería EXACTA de 20 preguntas hiper-agresivas, letales y específicas diseñadas contra esta propuesta real (NO preguntas genéricas), divididas en 4 bloques temáticos de 5 preguntas cada uno:
Bloque 1: 'Financiero y Presupuestal' (Preguntas 1 a 5: SHCP, FAISMUN, deuda, sobrecostos, canasta básica)
Bloque 2: 'Impacto Social y Pobreza' (Preguntas 6 a 10: CONEVAL, rezago de agua, el ${contra}% en contra, adultos mayores, jóvenes)
Bloque 3: 'Conflicto Sindical y Gremial' (Preguntas 11 a 15: paros de transportistas, tianguis, SUTEYM, magisterio, contratos colectivos)
Bloque 4: 'Técnico, Legal y de Ejecución' (Preguntas 16 a 20: sequía CONAGUA, amparos, tiempos de entrega, continuidad de trienio)

Para cada pregunta debes generar:
- "dardo": El ataque incisivo del periodista o regidor de oposición
- "peligro": Grado de riesgo (Peligro Crítico / Alto / Medio)
- "sectorAtacante": Quién lanza el dardo
- "escudo": La respuesta técnica contundente de 30 segundos con datos institucionales
- "pivotePolitico": El remate de liderazgo político popular que voltea el debate

Devuelve estrictamente un JSON:
{
  "totalPreguntas": 20,
  "preguntas": [
    {
      "numero": 1,
      "bloque": "Financiero y Presupuestal",
      "dardo": "...",
      "peligro": "Peligro Crítico — Hacienda y Regidores Opositores",
      "sectorAtacante": "Comisión de Hacienda del Cabildo",
      "escudo": "...",
      "pivotePolitico": "..."
    }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Propuesta para ${municipio}: "${propuestaTexto}". Votación estimada: ${favor}% a favor, ${contra}% en contra. Genera las 20 preguntas en JSON.` }
        ],
        temperature: 0.6,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed.preguntas) ? parsed : null;
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateDefenseMatrixWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 3. Modo Ataque y Demolición del Contrincante con IA
   */
  async generateAttackDossierWithLLM(params = {}) {
    const { propuestaRivalTexto = '', partidoRival = 'MORENA', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', aiConfig = {} } = params;
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const systemPrompt = `Eres el estratega jefe de guerra electoral asimétrica y contraste de campaña en ${municipio}, ${estado}.
Analiza la propuesta del partido rival (${partidoRival}) y construye un expediente de demolición política implacable, respaldado en la realidad territorial de ${municipio}.

Devuelve estrictamente este JSON:
{
  "partidoRival": "${partidoRival}",
  "municipio": "${municipio}",
  "estado": "${estado}",
  "rechazoEstimado": 74,
  "aprobacionRival": 26,
  "sectoresAgraviados": [
    { "sector": "Nombre del sector", "nivelFriccion": "88% de Oposición", "motivo": "Por qué este sector se siente agraviado por la ocurrencia de ${partidoRival}" },
    { "sector": "Segundo sector", "nivelFriccion": "82% de Oposición", "motivo": "..." },
    { "sector": "Tercer sector", "nivelFriccion": "76% de Oposición", "motivo": "..." }
  ],
  "planCaptura": {
    "focoTerritorial": "Zonas y colonias clave a intervenir",
    "lugaresVisita": [
      "Lugar y hora exacta de visita 1 para capitalizar el voto inconforme",
      "Lugar y hora exacta de visita 2",
      "Lugar y hora exacta de visita 3"
    ],
    "promesaCompromiso": "Compromiso notariado para frenar el daño de ${partidoRival}"
  },
  "soundbites": [
    "Frase 1 demoledora para medios y redes",
    "Frase 2",
    "Frase 3",
    "Frase 4",
    "Frase 5"
  ],
  "guionDebate": {
    "apertura": "Discurso inicial de contraste...",
    "demolicionTecnica": "Demolición técnica con datos de fallas presupuestales y legales...",
    "contrasteEmocional": "Contraste con la vida diaria de los vecinos...",
    "cierreContundente": "Remate final de debate llamando a la victoria popular..."
  },
  "contrapropuestaGanadora": {
    "titulo": "Nombre de la alternativa del Partido Verde",
    "resumen": "Cómo resuelve el problema de fondo sin el autoritarismo de ${partidoRival}...",
    "ventajaCompetitiva": "Por qué tiene el respaldo mayoritario de la ciudadanía..."
  }
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Propuesta del rival ${partidoRival} en ${municipio}: "${propuestaRivalTexto}". Genera el expediente de ataque en JSON.` }
        ],
        temperature: 0.6,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateAttackDossierWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 4. Tendencias Digitales y Pulso de Redes Sociales Multiplataforma con IA (Facebook, Instagram, TikTok + Hashtags Positivos/Negativos + Radar de Bots y Guerra Sucia + Real-Time Social Grounding)
   */
  async generateDigitalTrendsWithLLM(params = {}) {
    const {
      propuestaTexto = '',
      candidato = '',
      municipio = 'Ecatepec de Morelos',
      estado = 'Estado de México',
      partido = 'PVEM',
      realTimeWebContext = null,
      aiConfig = {}
    } = params;
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const fechaHoy = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const problematicasDia = Array.isArray(realTimeWebContext?.top5Problematicas)
      ? realTimeWebContext.top5Problematicas.map(p => p.tema || p).join(', ')
      : 'Seguridad vecinal, abasto de agua potable, movilidad y servicios públicos';
    const coloniasReales = Array.isArray(realTimeWebContext?.coloniasRepresentativas)
      ? realTimeWebContext.coloniasRepresentativas.slice(0, 6).join(', ')
      : `Centro de ${municipio}`;

    const systemPrompt = `Eres un Director de Inteligencia Digital OSINT, Analista de Redes Sociales Multiplataforma (Facebook, Instagram y TikTok) y Especialista en Ciberdefensa Electoral contra Granjas de Bots y Guerra Sucia para ${municipio}, ${estado} (${partido}${candidato ? ' - Candidato: ' + candidato : ''}).
FECHA DE CORTE EN TIEMPO REAL: ${fechaHoy}.
COYUNTURA Y PROBLEMÁTICAS REALES DEL DÍA EN ${municipio.toUpperCase()}: ${problematicasDia}.
COLONIAS Y BARRIOS REALES EN MONITOREO: ${coloniasReales}.

Analiza la conversación digital real del día en curso que detona esta propuesta o campaña simultáneamente en **Facebook, Instagram y TikTok** bajo el protocolo de Real-Time Social Grounding:
1. Evalúa el porcentaje de Opinión Ciudadana Real (Orgánico) vs Manipulación Digital (Tráfico Artificial, Granjas de Bots y Ataques Coordinados de Guerra Sucia) en Facebook, Instagram y TikTok.
2. Genera la lista de **Hashtags Positivos** (apoyo orgánico real vinculado a ${municipio}) y **Hashtags Negativos** (críticas, rechazo o tendencias adversas del día).
3. Desglosa métricas independientes para Facebook, Instagram y TikTok, manteniendo integración directa con el ecosistema de Facebook (Meta Ad Library).

Devuelve estrictamente este JSON:
{
  "fechaCorteTiempoReal": "${fechaHoy}",
  "coyunturaDetectadaHoy": "Resumen de la coyuntura real del día en ${municipio} (${problematicasDia})...",
  "organicidad": {
    "porcentajeOrganico": 78,
    "porcentajeBots": 22,
    "cuentasAuditadas": 24680,
    "diagnostico": "Diagnóstico detallado separando la opinión ciudadana real de la manipulación digital y granjas de bots hoy (${fechaHoy}) en ${municipio}..."
  },
  "sentimiento": {
    "positivo": 58,
    "neutro": 22,
    "negativo": 20
  },
  "hashtagsPositivos": [
    {
      "hashtag": "#FuturoVerdeEn${municipio.replace(/\s+/g, '')}",
      "plataformaLider": "Facebook & TikTok",
      "volumen": "18.5K menciones",
      "apoyoOrganico": "91% Orgánico",
      "narrativa": "Respaldo ciudadano real a los beneficios directos de la propuesta en barrios y colonias como ${coloniasReales}.",
      "tacticaAmplificacion": "Pautar micro-segmentación en Facebook Reels y grupos comunitarios."
    },
    {
      "hashtag": "#SolucionesReales${municipio.replace(/\s+/g, '')}",
      "plataformaLider": "Instagram & Facebook",
      "volumen": "12.3K menciones",
      "apoyoOrganico": "88% Orgánico",
      "narrativa": "Jóvenes y familias destacando la viabilidad técnica del proyecto.",
      "tacticaAmplificacion": "Activar carruseles comparativos en Instagram y Facebook Live."
    },
    {
      "hashtag": "#${municipio.replace(/\s+/g, '')}EnAccion",
      "plataformaLider": "TikTok",
      "volumen": "21.4K visualizaciones",
      "apoyoOrganico": "94% Orgánico",
      "narrativa": "Testimonios cortos de vecinos apoyando la iniciativa hoy.",
      "tacticaAmplificacion": "Dúos y retos virales con liderazgos juveniles."
    }
  ],
  "hashtagsNegativos": [
    {
      "hashtag": "#ExigimosResultados${municipio.replace(/\s+/g, '')}",
      "plataformaLider": "Facebook & TikTok",
      "volumen": "6.8K menciones",
      "porcentajeBots": "64% Bots / Guerra Sucia",
      "motivoRechazo": "Cuestionamiento inducido por cuentas adversarias sobre el origen de los recursos y tiempos de obra.",
      "contraHashtagNeutralizador": "#TransparenciaTotal${municipio.replace(/\s+/g, '')}"
    },
    {
      "hashtag": "#BastaDePromesas${municipio.replace(/\s+/g, '')}",
      "plataformaLider": "Instagram & Facebook",
      "volumen": "4.2K menciones",
      "porcentajeBots": "72% Granja de Troles",
      "motivoRechazo": "Ataque coordinado en comentarios de páginas locales para sembrar escepticismo.",
      "contraHashtagNeutralizador": "#ResultadosAuditables"
    }
  ],
  "radarBotsGuerraSucia": {
    "indiceManipulacionGlobal": 22,
    "opinionCiudadanaReal": 78,
    "nivelAlerta": "MEDIA-ALTA (Ataque Coordinado Detectado)",
    "plataformasAuditadas": {
      "facebook": {
        "traficoOrganicoReal": 76,
        "traficoArtificialBots": 24,
        "granjasDetectadas": "Cuentas recién creadas sin foto comentando en grupos vecinales de ${municipio} (${coloniasReales}) y páginas de noticias locales.",
        "vectorGuerraSucia": "Difusión de flyers apócrifos y noticias recortadas en grupos de Facebook.",
        "alcanceEstimado": "48,500 usuarios locales",
        "engagementRate": "6.8%",
        "urlEcosistemaFacebook": "https://www.facebook.com/ads/library/?active_status=all&ad_type=political_and_issue_ads&country=MX"
      },
      "instagram": {
        "traficoOrganicoReal": 83,
        "traficoArtificialBots": 17,
        "granjasDetectadas": "Bots automatizados dejando comentarios repetitivos en Reels y publicaciones de campaña.",
        "vectorGuerraSucia": "Campañas de desinformación visual en Historias pagadas sin descargo de responsabilidad.",
        "alcanceEstimado": "31,200 cuentas locales",
        "engagementRate": "8.4%"
      },
      "tiktok": {
        "traficoOrganicoReal": 75,
        "traficoArtificialBots": 25,
        "granjasDetectadas": "Cuentas anónimas subiendo clips editados fuera de contexto con audio sintético.",
        "vectorGuerraSucia": "Manipulación algorítmica mediante ráfagas de comentarios negativos en los primeros 15 minutos del video.",
        "alcanceEstimado": "64,900 reproducciones locales",
        "engagementRate": "11.2%"
      }
    },
    "protocoloDesactivacion": "1. Publicar video de verificación en Facebook e Instagram en menos de 30 minutos. 2. Reportar granjas de bots en Meta Ad Library y TikTok Safety Center. 3. Desplegar brigada digital orgánica en grupos de Facebook de ${municipio}."
  },
  "topHashtags": [
    {
      "hashtag": "#FuturoVerdeEn${municipio.replace(/\s+/g, '')}",
      "descripcion": "Tendencia orgánica favorable en Facebook, Instagram y TikTok en ${municipio}",
      "volumen": "18.5K",
      "sentimiento": "Positivo (82%)",
      "sentimientoPct": "Positivo (82%)",
      "organicidad": "91% Orgánico",
      "accionTactica": "Amplificar en Facebook Reels e Instagram",
      "accionColor": "emerald"
    },
    {
      "hashtag": "#ExigimosResultados${municipio.replace(/\s+/g, '')}",
      "descripcion": "Tendencia adversa impulsada por granjas de bots opositoras",
      "volumen": "6.8K",
      "sentimiento": "Negativo (68%)",
      "sentimientoPct": "Negativo (68%)",
      "organicidad": "64% Bots Detectados",
      "accionTactica": "Neutralizar con infografía presupuestal verificable",
      "accionColor": "rose"
    }
  ],
  "plataformas": {
    "facebook": { "sentimiento": "66% Favorable", "riesgoGuerraSucia": "Moderado (24% Bots)", "narrativa": "Debate vecinal intenso en grupos comunitarios y páginas de noticias de ${municipio}." },
    "instagram": { "sentimiento": "71% Favorable", "riesgoGuerraSucia": "Bajo (17% Bots)", "narrativa": "Alta interacción en Reels e Historias sobre el impacto visual y comunitario." },
    "tikTok": { "sentimiento": "74% Viral Favorable", "riesgoGuerraSucia": "Moderado-Alto (25% Bots)", "narrativa": "Viralidad entre jóvenes de 18 a 34 años con clips cortos de impacto." },
    "whatsApp": { "sentimiento": "Debate Vecinal Activo", "riesgoGuerraSucia": "Alto (Cadenas de audio)", "narrativa": "Reenvío de enlaces de Facebook y TikTok en chats de comités vecinales." }
  },
  "alertasCrisis": [
    { "nivel": "Alta", "alerta": "Detección de ataque coordinado de bots en Facebook y TikTok contra la propuesta", "accionInmediata": "Activar protocolo de desmentido oficial en Facebook Live y fijar comentarios verificados." }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Propuesta en ${municipio}, ${estado} hoy (${fechaHoy}): "${propuestaTexto}". Problemáticas reales del día: ${problematicasDia}. Analiza simultáneamente Facebook, Instagram y TikTok (Hashtags positivos/negativos y radar de bots/guerra sucia) en JSON.` }
        ],
        temperature: 0.2,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateDigitalTrendsWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 5. Calibración de Colonias y Demografía con IA (Micro-Targeting Territorial)
   */
  async generateColoniaCalibrationWithLLM(params = {}) {
    const { propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', colonias = [], aiConfig = {} } = params;
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const listaColonias = (colonias || []).slice(0, 10).map(c => c.nombre || c).join(', ');

    const systemPrompt = `Eres un estratega territorial de campo en ${municipio}, ${estado}.
Analiza el impacto y nivel de aceptación de esta propuesta en las siguientes colonias reales: ${listaColonias}.
Evalúa qué colonias se convertirán en bastiones favorables, cuáles están indecisas y cuáles presentarán mayor resistencia según sus carencias locales.

Devuelve estrictamente un arreglo JSON:
[
  {
    "nombre": "Nombre de la Colonia",
    "factorApoyo": 64,
    "prioridadBrigada": "Bastión Electoral" | "Zona Indecisa / Swarm Battleground" | "Zona Crítica de Resistencia",
    "motivo": "Explicación territorial y socioeconómica concreta..."
  }
]`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Propuesta en ${municipio}: "${propuestaTexto}". Calibra las colonias en JSON.` }
        ],
        temperature: 0.5,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed) ? parsed : (parsed.colonias || null);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateColoniaCalibrationWithLLM:', err.message);
      return null;
    }
  }

  /**
   * Inferencia Neural por Arquetipos Comunitarios con Groq LPU
   * Evalúa un lote de arquetipos sociodemográficos mediante inferencia generativa real
   */
  async evaluateArchetypesBatchWithGroq(params = {}) {
    const { archetypes = [], proposalText = '', municipalResearch = {}, aiConfig = {} } = params;
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) {
      return null;
    }

    const muni = municipalResearch.municipio || 'Ecatepec de Morelos';
    const estado = municipalResearch.estado || 'Estado de México';
    const problems = (municipalResearch.problematicasLocales || []).map(p => p.tema || p).slice(0, 5).join(', ');

    const promptArchetypes = archetypes.map(a => ({
      id: a.id,
      colonia: a.colonia,
      nse: a.nse,
      edad: a.edad,
      genero: a.genero,
      ocupacion: a.ocupacion,
      sectorSocial: a.sectorSocial,
      preocupacionPrioritaria: a.preocupacionPrioritaria
    }));

    const systemPrompt = `Eres un motor de simulación electoral y sociodemográfica de alta fidelidad que opera sobre arquetipos representativos de ${muni}, ${estado}.
Problemáticas territoriales de la demarcación: ${problems}.
Tu tarea es simular la reacción ciudadana auténtica de cada uno de los arquetipos frente a la propuesta sometida a consulta.

Debes responder ÚNICAMENTE un objeto JSON válido con la propiedad "arquetipos", que sea un arreglo de objetos con esta estructura exacta para CADA arquetipo recibido:
{
  "arquetipos": [
    {
      "id": "ID_DEL_ARQUETIPO",
      "voto": "A favor" | "En contra" | "Neutro",
      "nivelEntusiasmo": número entero de 0 a 100,
      "sentimiento": número decimal de -1.0 a 1.0,
      "argumentoLocal": "Testimonio en primera persona (máximo 2 oraciones) donde el ciudadano expresa su postura vinculada a su colonia, su situación económica y su realidad cotidiana."
    }
  ]
}`;

    const userContent = `Propuesta en evaluación:\n"${proposalText}"\n\nArquetipos ciudadanos a evaluar:\n${JSON.stringify(promptArchetypes, null, 2)}`;

    try {
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: effectiveProvider === 'groq' ? (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile') : undefined,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.4,
        jsonMode: true
      });

      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed.arquetipos) ? parsed.arquetipos : (Array.isArray(parsed) ? parsed : null);
    } catch (err) {
      console.warn('[FreeLLMService] evaluateArchetypesBatchWithGroq error:', err.message);
      return null;
    }
  }

  /**
   * 6. Genera Micro-Segmentación Psicográfica y WhatsApp, Naming, Eslogan, ROI y Radiografía de Desgaste con IA en tiempo real
   */
  async generateStrategicCampaignAndMicroSegmentationWithLLM(params = {}) {
    const {
      propuestaTexto = '',
      tituloProyecto = '',
      municipio = 'Ecatepec de Morelos',
      estado = 'Estado de México',
      votosFinales = {},
      aiConfig = {}
    } = params;

    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) {
      return null;
    }

    const favor = votosFinales.porcentajeFavor || 55;
    const contra = votosFinales.porcentajeContra || 28;

    const systemPrompt = `Eres el Director Estratégico de Campaña y Analista Psicográfico de Cuarto de Guerra para ${municipio}, ${estado}.
Analiza la siguiente iniciativa ("${tituloProyecto}": "${propuestaTexto}") con una proyección electoral de ${favor}% A Favor y ${contra}% En Contra.

Debes generar una estrategia integral quirúrgica en formato JSON ESTRICTO con 4 bloques:

1. "microSegmentacionGeneracional": Arreglo con 4 cohortes psicográficas clave:
   - "cohorte_jovenes" (18-29 años): Centennials / Universitarios.
   - "cohorte_millennials" (30-49 años): Familias Jóvenes y Adultos Productivos.
   - "cohorte_maduros" (50-64 años): Adultos Maduros y Comerciantes.
   - "cohorte_mayores" (65+ años): Adultos Mayores y Jubilados.
   Para cada cohorte genera:
   - "id": string
   - "cohorte": string (Nombre completo de la cohorte)
   - "nombre": string
   - "rangoEdad": string
   - "pesoElectoral": string
   - "canalPrincipal": string
   - "canalPrioritario": string
   - "tonoComunicacion": string
   - "disparadorEmocional": string
   - "propuestaAncla": string
   - "mensajeClaveWhatsApp": string (Mensaje hiper-atractivo listo para reenviar en grupos vecinales de WhatsApp con emojis y llamado a la acción)
   - "microMensajeWhatsApp": string (Mismo mensaje)

2. "manualCampanaEstrategico":
   - "namingEstrategico": string (Nombre contundente del proyecto o bandera)
   - "sloganOficial": string (Eslogan de alto impacto popular)
   - "namingOficial": string (Mismo naming)
   - "esloganGanador": string (Mismo slogan)
   - "banderazoSalida": { "colonia": string, "horario": string, "justificacion": string }
   - "discursosSegmentados": {
       "jovenes": { "rango": "18 a 29 años", "soundbite": string, "riesgoEvitar": string },
       "adultos": { "rango": "30 a 49 años", "soundbite": string, "riesgoEvitar": string },
       "mayores": { "rango": "65+ años", "soundbite": string, "riesgoEvitar": string }
     }

3. "calculadoraROICampana":
   - "padronElectoralEstimado": number
   - "metaVotosVictoria": number
   - "totalSeccionesElectorales": number
   - "clasificacionSecciones": {
       "bastionesSeguros": { "secciones": number, "porcentaje": number, "estrategia": string },
       "battlegroundPrioritario": { "secciones": number, "porcentaje": number, "estrategia": string },
       "riesgoOpositor": { "secciones": number, "porcentaje": number, "estrategia": string }
     }
   - "asignacionRecursos": { "brigadistasRecomendados": number, "lonasPublicidad": number, "asambleasVecinales": number }
   - "costoPorVotoPersuadido": string
   - "roiElectoralScore": number
   - "diagnosticoROI": string

4. "indiceEscepticismo":
   - "scoreEscepticismo": number
   - "nivelEscepticismo": string
   - "promesasMayorRiesgo": [
       { "promesa": string, "escepticismo": number, "motivo": string },
       { "promesa": string, "escepticismo": number, "motivo": string },
       { "promesa": string, "escepticismo": number, "motivo": string }
     ]
   - "mecanismoMitigacion": string
   - "estrategiaBlindaje": string

Responde EXCLUSIVAMENTE el objeto JSON sin markdown exterior.`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Genera la micro-segmentación y manual de campaña para la propuesta: "${propuestaTexto}" en ${municipio}, ${estado}.` }
        ],
        temperature: 0.5,
        jsonMode: true
      });

      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('[FreeLLMService] generateStrategicCampaignAndMicroSegmentationWithLLM error:', err.message);
      return null;
    }
  }

  /**
   * 7. Auditoría de Ley Electoral y Adaptación Dinámica de OPLEs por Estado (INE + 32 OPLEs)
   */
  async generateElectoralLawAuditWithLLM(params = {}) {
    const {
      propuestaTexto = '',
      tituloProyecto = '',
      candidato = '',
      partido = 'PVEM',
      municipio = 'Texcoco',
      estado = 'Estado de México',
      opleInfo = {},
      aiConfig = {}
    } = params;

    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const opleSiglas = opleInfo.siglas || `OPLE ${estado}`;
    const opleNombre = opleInfo.nombreCompleto || `Instituto Electoral del Estado de ${estado}`;
    const opleUrl = opleInfo.urlOficial || 'https://www.ine.mx/voto-y-elecciones/opl/';
    const legislacionLocal = opleInfo.legislacionLocal || `Código Electoral del Estado de ${estado}`;
    const tribunalLocal = opleInfo.tribunalLocal || `Tribunal Electoral del Estado de ${estado}`;

    const systemPrompt = `Eres Magistrado Especialista en Derecho Electoral Mexicano, Fiscalización del INE y Normatividad del ${opleSiglas} (${opleNombre}).
Tu misión es auditar jurídicamente la siguiente propuesta o estrategia de campaña en ${municipio}, ${estado} (${partido}${candidato ? ' - Candidato: ' + candidato : ''}).
Debes evaluar rigurosamente si cumple o infringe:
1. Constitución Política de los Estados Unidos Mexicanos (Artículos 41 y 134).
2. Ley General de Instituciones y Procedimientos Electorales (LGIPE) y Ley General de Partidos Políticos (LGPP).
3. Ley General en Materia de Delitos Electorales (FISEL/FEDE).
4. Normatividad estatal vigente: ${legislacionLocal}, acuerdos del ${opleSiglas} y criterios del ${tribunalLocal} y TEPJF.

Devuelve ESTRICTAMENTE este objeto JSON:
{
  "veredictoGeneral": "CUMPLE CON RESERVAS TÁCTICAS" | "CUMPLE ESTRICTAMENTE" | "RIESGO DE INFRACCIÓN ELECTORAL",
  "scoreCumplimientoLegal": 88,
  "nivelRiesgoJuridico": "BAJO" | "MEDIO" | "ALTO",
  "organismosReguladores": {
    "federal": "INE (Instituto Nacional Electoral) & TEPJF",
    "estatalSiglas": "${opleSiglas}",
    "estatalNombre": "${opleNombre}",
    "legislacionAplicable": "CPEUM Arts. 41 y 134, LGIPE, y ${legislacionLocal}",
    "urlOpleOficial": "${opleUrl}"
  },
  "dictamenJuridico": "Análisis jurídico profundo de cómo la propuesta o estrategia impacta legalmente a la campaña en ${municipio}, ${estado}, ante el INE y el ${opleSiglas}...",
  "matrizEvaluacionNormativa": [
    {
      "rubro": "Actos Anticipados de Campaña / Precampaña y Temporalidad",
      "estatus": "CUMPLE" | "PRECAUCIÓN" | "ALERTA",
      "fundamentoLegal": "Art. 3 y 242 LGIPE / ${legislacionLocal}",
      "impactoEnCampana": "Explicación jurídica detallada..."
    },
    {
      "rubro": "Prohibición de Dádivas, Coacción o Condicionamiento de Programas (Clientelismo)",
      "estatus": "CUMPLE" | "PRECAUCIÓN" | "ALERTA",
      "fundamentoLegal": "Art. 209 numeral 5 LGIPE y Art. 134 Constitucional",
      "impactoEnCampana": "Explicación sobre entrega de beneficios directos o promesas materiales..."
    },
    {
      "rubro": "Fiscalización, Tope de Gastos y Prorrateo (UTF - INE / ${opleSiglas})",
      "estatus": "CUMPLE" | "PRECAUCIÓN" | "ALERTA",
      "fundamentoLegal": "Reglamento de Fiscalización del INE",
      "impactoEnCampana": "Impacto contable y registro ante el SIF..."
    },
    {
      "rubro": "Propaganda Electoral, Sustentabilidad y Reglas del ${opleSiglas}",
      "estatus": "CUMPLE" | "PRECAUCIÓN" | "ALERTA",
      "fundamentoLegal": "Art. 209 y 210 LGIPE / Lineamientos de ${opleSiglas}",
      "impactoEnCampana": "Reglas de materiales reciclables, equipamiento urbano y pauta digital..."
    }
  ],
  "riesgosSancionatorios": [
    "Riesgo 1 ante Queja o Procedimiento Especial Sancionador (PES) ante ${opleSiglas}...",
    "Riesgo 2 en materia de fiscalización o impugnación..."
  ],
  "redaccionBlindadaLegalmente": "Versión reescrita de la propuesta o discurso para que sea 100% inatacable ante el INE, ${opleSiglas} y tribunales electorales...",
  "fuentesVerificables": [
    {
      "organismo": "INE - Normatividad y Fiscalización",
      "titulo": "Ley General de Instituciones y Procedimientos Electorales (LGIPE)",
      "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGIPE.pdf"
    },
    {
      "organismo": "${opleSiglas} (${estado})",
      "titulo": "Portal Oficial del ${opleNombre} - Acuerdos y Lineamientos",
      "url": "${opleUrl}"
    },
    {
      "organismo": "TEPJF",
      "titulo": "Sistema de Consulta de Jurisprudencia Electoral (IUS Electoral)",
      "url": "https://www.te.gob.mx/ius2021/#/"
    }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Audita legalmente la siguiente propuesta en ${municipio}, ${estado} (${opleSiglas}): Título: "${tituloProyecto}". Contenido: "${propuestaTexto}". Devuelve JSON.` }
        ],
        temperature: 0.0,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateElectoralLawAuditWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 8. Historial de Elecciones Pasadas con Selector de Año y Sección Electoral (INE + 32 OPLEs + Secciones Reales)
   */
  async generateElectoralHistoryWithLLM(params = {}) {
    const {
      estado = 'Estado de México',
      municipio = 'Texcoco',
      anioEleccion = '2024',
      partidoFiltro = 'TODOS',
      seccionFiltro = '',
      seccionesRealesCatalogadas = [],
      rangoOficialINE = '4608 - 4698',
      opleInfo = {},
      aiConfig = {}
    } = params;

    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const opleSiglas = opleInfo.siglas || `OPLE ${estado}`;
    const opleNombre = opleInfo.nombreCompleto || `Instituto Electoral del Estado de ${estado}`;
    const opleUrl = opleInfo.urlOficial || 'https://www.ine.mx/voto-y-elecciones/opl/';
    const cleanSecFilter = (seccionFiltro && seccionFiltro !== 'TODAS') ? seccionFiltro : '';

    // Seleccionar hasta 12 secciones reales del catálogo oficial del municipio (poniendo primero la sección seleccionada si aplica)
    let sampleSections = Array.isArray(seccionesRealesCatalogadas) && seccionesRealesCatalogadas.length > 0
      ? [...seccionesRealesCatalogadas]
      : [
          { seccion: cleanSecFilter || '4612', coloniaSede: `Centro de ${municipio}`, tipoSeccion: 'Urbana', listaNominalOficial: 1850 }
        ];
    if (cleanSecFilter) {
      const idx = sampleSections.findIndex(s => String(s.seccion) === String(cleanSecFilter));
      if (idx > 0) {
        const [picked] = sampleSections.splice(idx, 1);
        sampleSections.unshift(picked);
      }
    }
    const targetSectionsList = sampleSections.slice(0, 12).map(s => `${s.seccion} (${s.coloniaSede}, LN: ${s.listaNominalOficial})`).join(', ');

    const systemPrompt = `Eres el Director de Estadística y Cartografía Electoral del INE y del ${opleSiglas} (${opleNombre}).
REGLA ESTRICTA ANTI-ALUCINACIONES (temperature: 0.0):
- Utiliza EXCLUSIVAMENTE las Secciones Electorales Oficiales del Marco Geográfico del INE para ${municipio}, ${estado} (Rango Oficial INE: ${rangoOficialINE}): ${targetSectionsList}.
- Genera el informe histórico electoral completo del municipio/alcaldía de **${municipio}, ${estado}** correspondiente al **Año de Elección ${anioEleccion}** (con filtro de partido: ${partidoFiltro}${cleanSecFilter ? ' y foco prioritario en la Sección Electoral seleccionada: ' + cleanSecFilter : ''}).

Debes incluir:
1. Resultados históricos en **${municipio}** en el año **${anioEleccion}** para los 3 cargos clave:
   - **Presidencia Municipal / Alcaldía**
   - **Diputaciones (Local y Federal)**
   - **Senadurías / Elección Federal o Estatal concurrente**
2. Un desglose detallado en "seccionesElectorales" para las siguientes **10 Secciones Electorales Oficiales de ${municipio}**: ${targetSectionsList} (asegurando que si el usuario seleccionó la sección "${cleanSecFilter}", sea la primera de la lista), mostrando la votación por partido político (PVEM, MORENA, PAN, PRI, MC, PT) y coalición en el año ${anioEleccion}.

Devuelve ESTRICTAMENTE este objeto JSON:
{
  "metadata": {
    "estado": "${estado}",
    "municipio": "${municipio}",
    "anioEleccion": "${anioEleccion}",
    "rangoSeccionalOficialINE": "${rangoOficialINE}",
    "seccionSeleccionada": "${cleanSecFilter || 'TODAS LAS SECCIONES DEL MUNICIPIO'}",
    "organismoFederal": "INE (Sistema de Cómputos Distritales)",
    "organismoLocalSiglas": "${opleSiglas}",
    "organismoLocalNombre": "${opleNombre}",
    "urlVerificacionOple": "${opleUrl}",
    "urlVerificacionIne": "https://computos2024.ine.mx/",
    "listaNominalMunicipal": 198450,
    "participacionCiudadanaPct": "61.4%",
    "totalSeccionesMunicipio": ${seccionesRealesCatalogadas.length || 45}
  },
  "resumenHistoricoIA": "Análisis político-electoral detallado de lo ocurrido en ${municipio}, ${estado} en la elección de ${anioEleccion}, comportamiento del voto, alianzas y competitividad seccional...",
  "eleccionesPorCargo": {
    "presidenciaMunicipal": {
      "cargo": "Presidencia Municipal / Alcaldía de ${municipio} (${anioEleccion})",
      "ganador": "Partido o Coalición Ganadora",
      "votosTotalesEmitidos": 121840,
      "participacionPct": "61.4%",
      "margenVictoriaPct": "8.6%",
      "resultadosPartidos": [
        { "partido": "MORENA", "coalicion": "Sigamos Haciendo Historia", "votos": 48210, "porcentaje": 39.5 },
        { "partido": "PVEM", "coalicion": "Sigamos Haciendo Historia / Propio", "votos": 16890, "porcentaje": 13.8 },
        { "partido": "MC", "coalicion": "Candidatura Común / Propio", "votos": 18420, "porcentaje": 15.1 },
        { "partido": "PAN", "coalicion": "Fuerza y Corazón", "votos": 15110, "porcentaje": 12.4 },
        { "partido": "PRI", "coalicion": "Fuerza y Corazón", "votos": 14650, "porcentaje": 12.0 },
        { "partido": "PT", "coalicion": "Sigamos Haciendo Historia", "votos": 5420, "porcentaje": 4.4 }
      ]
    },
    "diputaciones": {
      "cargo": "Diputación Local y Federal por el Distrito de ${municipio} (${anioEleccion})",
      "distritoCabecera": "Distrito Electoral correspondiente a ${municipio}",
      "fuerzaDominante": "Coalición / Partido puntero en legislativas",
      "votosTotales": 122310,
      "resultadosPartidos": [
        { "partido": "MORENA", "votos": 49100, "porcentaje": 40.1 },
        { "partido": "PVEM", "votos": 17650, "porcentaje": 14.4 },
        { "partido": "MC", "votos": 17200, "porcentaje": 14.1 },
        { "partido": "PAN", "votos": 15800, "porcentaje": 12.9 },
        { "partido": "PRI", "votos": 14100, "porcentaje": 11.5 },
        { "partido": "PT", "votos": 5600, "porcentaje": 4.6 }
      ],
      "observacionTactica": "Comparativa de voto cruzado entre alcaldía y diputación en ${municipio}..."
    },
    "senadurias": {
      "cargo": "Senaduría de la República / Elección Federal en ${municipio} (${anioEleccion})",
      "entidad": "${estado}",
      "votosTotalesMunicipio": 123540,
      "resultadosPartidos": [
        { "partido": "MORENA", "votos": 51200, "porcentaje": 41.4 },
        { "partido": "PVEM", "votos": 18400, "porcentaje": 14.9 },
        { "partido": "MC", "votos": 16100, "porcentaje": 13.0 },
        { "partido": "PAN", "votos": 16200, "porcentaje": 13.1 },
        { "partido": "PRI", "votos": 13400, "porcentaje": 10.8 },
        { "partido": "PT", "votos": 5900, "porcentaje": 4.8 }
      ],
      "observacionTactica": "Comportamiento del voto federal de Senaduría en ${municipio} durante ${anioEleccion}..."
    }
  },
  "seccionesElectorales": [
    {
      "seccion": "${cleanSecFilter || (sampleSections[0]?.seccion || '4612')}",
      "coloniaReferencia": "${sampleSections[0]?.coloniaSede || 'Centro'}",
      "tipoSeccion": "Urbana",
      "listaNominal": 1850,
      "votosTotales": 1165,
      "participacionPct": "62.9%",
      "votosPorPartido": {
        "PVEM": 195,
        "MORENA": 440,
        "PAN": 150,
        "PRI": 145,
        "MC": 155,
        "PT": 52,
        "COALICION_GANADORA": 687
      },
      "ganadorSeccion": "Coalición PVEM-MORENA-PT",
      "clasificacionTactica": "Bastión Consolidado"
    }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Genera el historial electoral completo (Presidencia Municipal, Diputaciones, Senadurías y 10 Secciones Electorales oficiales de la lista: ${targetSectionsList}) para el municipio de ${municipio}, ${estado} en el año ${anioEleccion} (${opleSiglas} + INE). Partido filtro: ${partidoFiltro}. Sección seleccionada en lista: ${cleanSecFilter || 'Todas'}.` }
        ],
        temperature: 0.0,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateElectoralHistoryWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 9. Auditoría Legal de Personal Insaculado vs Voluntarios de Casilla (Art. 83 LGIPE + ENCARTE INE + Nómina Pública PNT)
   */
  async generateInsaculadosAuditWithLLM(params = {}) {
    const {
      estado = 'Estado de México',
      municipio = 'Texcoco',
      seccion = '4612',
      tipoCasilla = 'Básica',
      casillaSeccion = 'Sección 4612 - Casilla Básica',
      nombreBusqueda = '',
      funcionarios = [],
      opleInfo = {},
      aiConfig = {}
    } = params;

    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const opleSiglas = opleInfo.siglas || `OPLE ${estado}`;
    const opleNombre = opleInfo.nombreCompleto || `Instituto Electoral del Estado de ${estado}`;
    const opleUrl = opleInfo.urlOficial || 'https://www.ine.mx/voto-y-elecciones/opl/';
    const legislacionLocal = opleInfo.legislacionLocal || `Código Electoral del Estado de ${estado}`;

    const systemPrompt = `Eres el Director Jurídico de Defensa del Voto y Auditoría de Mesas Directivas de Casilla ante el INE, la Plataforma Nacional de Transparencia (PNT) y el ${opleSiglas} (${opleNombre}).
REGLA ESTRICTA ANTI-ALUCINACIONES (temperature: 0.0):
- No inventes nombres ni cargos inexistentes. Audita estrictamente los registros recibidos de la Sección Electoral ${seccion} (${tipoCasilla}) en ${municipio}, ${estado}${nombreBusqueda ? ' y la búsqueda nominal solicitada para: "' + nombreBusqueda + '"' : ''}.
- Cruza cada funcionario (Presidente, Secretario 1, Secretario 2, Escrutadores) contra las causales de inelegibilidad del **Artículo 83 de la LGIPE**, el **Art. 75 de la LGSMIME (nulidad de votación en casilla)**, la **Plataforma Nacional de Transparencia (PNT - Nómina Municipal/Estatal de ${municipio})** y el **Padrón de Operadores de Programas Sociales (Servidores de la Nación / Bienestar)**.
- Si un funcionario aparece como Servidor Público con nivel de mando (Director, Subdirector, Jefe de Departamento) o vinculado a Programas Sociales o Dirigencia Partidista, activa obligatoriamente **"alertaLegalActiva": true** y **"estatusLegal": "IMPEDIDO POR LEY (ALERTA LEGAL PNT / LGIPE)"** con el sustento jurídico real para su impugnación y reemplazo.

Devuelve ESTRICTAMENTE este objeto JSON:
{
  "resumenAuditoria": {
    "estado": "${estado}",
    "municipio": "${municipio}",
    "seccion": "${seccion}",
    "tipoCasilla": "${tipoCasilla}",
    "casillaAuditada": "${casillaSeccion}",
    "organismoAutoridad": "INE + PNT + ${opleSiglas}",
    "totalAuditados": ${funcionarios.length || 6},
    "totalAptos": number,
    "totalImpedidosConAlertaLegal": number,
    "riesgoNulidadCasilla": "ALTO (Riesgo de Nulidad Art. 75 LGSMIME por Servidor Público / Dirigente)" | "BAJO (Casilla Blindada Legalmente)",
    "dictamenEjecutivo": "Dictamen jurídico del cruce entre ENCARTE INE, Nómina Pública Municipal en PNT (${municipio}) y Padrón de Programas Sociales..."
  },
  "resultadosCruceFuncionarios": [
    {
      "nombre": "Nombre del funcionario o registro auditado",
      "cargoCasilla": "Presidente/a" | "Secretario/a 1" | "Secretario/a 2" | "Escrutador/a 1" | "Escrutador/a 2" | "Escrutador/a 3",
      "seccion": "${seccion} (${tipoCasilla})",
      "perfilDetectado": "Ocupación y resultado del cruce en Nómina Pública PNT / Programas Sociales / Partidos",
      "estatusLegal": "IMPEDIDO POR LEY (ALERTA LEGAL)" | "APTO LEGALMENTE",
      "alertaLegalActiva": true | false,
      "severidadAlerta": "CRÍTICA" | "PREVENTIVA" | "NINGUNA",
      "fundamentoLegalInfringido": "Art. 83 incisos e), f), g) de la LGIPE / Art. 75 LGSMIME / ${legislacionLocal}",
      "motivoImpedimento": "Explicación jurídica precisa del impedimento detectado en nómina pública o programas sociales (o confirmación de elegibilidad)...",
      "accionJuridicaRecomendada": "Procedimiento exacto de impugnación y reemplazo ante el Consejo Distrital del INE y ${opleSiglas}..."
    }
  ],
  "protocoloImpugnacionCasilla": [
    "1. Descargar constancia de nómina activa en la Plataforma Nacional de Transparencia (PNT) para acreditar el cargo de mando o adscripción a programas sociales.",
    "2. Presentar recurso de sustitución por inelegibilidad superveniente (Art. 83 LGIPE) ante la Junta Distrital Ejecutiva del INE y el Consejo Municipal de ${opleSiglas} antes de la jornada, o asentar Escrito de Incidentes y Protesta en el Acta de la Jornada Electoral (causal de nulidad Art. 75 LGSMIME)."
  ],
  "fuentesLegalesVerificables": [
    {
      "organismo": "Plataforma Nacional de Transparencia (PNT — Consulta de Nómina Municipal/Estatal)",
      "url": "https://consultapublicamx.plataformadetransparencia.org.mx/"
    },
    {
      "organismo": "INE — ENCARTE Oficial y Ubicación de Mesas Directivas de Casilla",
      "url": "https://ubicatucasilla.ine.mx/"
    },
    {
      "organismo": "LGIPE — Artículo 83 (Impedimentos para ser Funcionario de Casilla)",
      "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGIPE.pdf"
    },
    {
      "organismo": "${opleSiglas} (${opleNombre})",
      "url": "${opleUrl}"
    }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Audita con temperature 0.0 esta integración de Mesa Directiva de Casilla (${casillaSeccion}) en ${municipio}, ${estado} cruzando contra Nómina Pública PNT y Art. 83 LGIPE:\n${JSON.stringify(funcionarios, null, 2)}` }
        ],
        temperature: 0.0,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateInsaculadosAuditWithLLM:', err.message);
      return null;
    }
  }

  /**
   * 10. Generador de Manual de Capacitación Operativa y Liderazgo para Coordinadores (LGIPE + INE + OPLE + Auto-Actualización 24h)
   */
  async generateTrainingManualWithLLM(params = {}) {
    const {
      estado = 'Estado de México',
      municipio = 'Texcoco',
      partido = 'PVEM',
      rolCoordinador = 'Coordinador General y Territorial de Campaña',
      enfoqueEspecial = 'Liderazgo de brigadas, trato humano al equipo, defensa del voto y blindaje legal',
      opleInfo = {},
      autoUpdateStatus = {},
      aiConfig = {}
    } = params;

    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const opleSiglas = opleInfo.siglas || `OPLE ${estado}`;
    const opleNombre = opleInfo.nombreCompleto || `Instituto Electoral del Estado de ${estado}`;
    const opleUrl = opleInfo.urlOficial || 'https://www.ine.mx/voto-y-elecciones/opl/';
    const legislacionLocal = opleInfo.legislacionLocal || `Código Electoral del Estado de ${estado}`;
    const sello24h = autoUpdateStatus.selloOficialTexto || `🔄 AUTO-ACTUALIZACIÓN 24H ACTIVA • Verificado contra INE, DOF, TEPJF y ${opleSiglas}`;

    const systemPrompt = `Eres el Director Nacional de Capacitación Electoral, Doctrina de Liderazgo Político y Cumplimiento Jurídico del Cuarto de Guerra para ${municipio}, ${estado} (${partido}).
SELLO DE AUTO-ACTUALIZACIÓN NORMATIVA CADA 24 HORAS: "${sello24h}".
Tu misión es redactar un **Manual Operativo y de Liderazgo para el ${rolCoordinador}**, actualizado con los últimos acuerdos del **INE**, el **Diario Oficial de la Federación (DOF)**, el **TEPJF** y el **${opleSiglas} (${opleNombre} - ${legislacionLocal})**.

El manual debe cubrir de forma magistral y accionable:
1. **Liderazgo y Trato Humano ("Cómo dirigir, motivar y tratar a su gente"):** Psicología de mando táctico, empatía con brigadistas y voluntarios, resolución de conflictos en campo, comunicación asertiva bajo presión y cohesión del equipo.
2. **Decálogo Legal Estricto (QUÉ SÍ HACER vs QUÉ NO HACER LEGALMENTE):** Fundamentado en artículos reales de la LGIPE, el Reglamento de Fiscalización del INE, la Ley General en Materia de Delitos Electorales (FISEL) y el ${opleSiglas}.
3. **Protocolo Operativo Diario y para la Jornada Electoral (Día D)** en ${municipio}, ${estado}.

Devuelve ESTRICTAMENTE este objeto JSON:
{
  "encabezadoManual": {
    "titulo": "Manual Maestro de Liderazgo Táctico y Cumplimiento Electoral — ${municipio}, ${estado}",
    "rolObjetivo": "${rolCoordinador}",
    "marcoNormativo": "LGIPE + INE + DOF + TEPJF + ${opleSiglas} (${legislacionLocal})",
    "selloAutoActualizacion24h": "${sello24h}",
    "urlOple": "${opleUrl}",
    "objetivoDoctrinal": "Resumen ejecutivo del propósito del manual para el coordinador..."
  },
  "moduloLiderazgoTratoHumano": {
    "principioRector": "Cómo dirigir y tratar a su gente con firmeza estratégica y calidez humana",
    "pilaresMando": [
      {
        "titulo": "1. Liderazgo por Ejemplo y Respeto Absoluto al Brigadista",
        "instruccionPractica": "Cómo dirigirse al equipo cada mañana, reconocer el esfuerzo en territorio y escuchar necesidades de campo...",
        "fraseGuia": "Frase inspiradora y táctica para el coordinador..."
      },
      {
        "titulo": "2. Gestión Emocional bajo Presión y Contención de Conflictos",
        "instruccionPractica": "Cómo resolver fricciones entre coordinadores seccionales o voluntarios cansados sin fracturar la estructura...",
        "fraseGuia": "Frase táctica de resolución..."
      },
      {
        "titulo": "3. Comunicación Clara, Metas Medibles y Retroalimentación Positiva",
        "instruccionPractica": "Cómo asignar metas por sección electoral en ${municipio} manteniendo la moral en alto...",
        "fraseGuia": "Frase táctica de supervisión..."
      }
    ]
  },
  "guiaLegalQueSiQueNo": {
    "autoridadesReguladoras": "INE, DOF, TEPJF, ${opleSiglas} (${opleNombre}) y FISEL",
    "queSiHacerLegalmente": [
      {
        "accion": "Acción permitida y recomendada 1",
        "fundamento": "Art. LGIPE / Lineamiento ${opleSiglas}",
        "protocolo": "Cómo ejecutarla correctamente con respaldo documental..."
      },
      {
        "accion": "Acción permitida y recomendada 2",
        "fundamento": "Art. LGIPE / Lineamiento ${opleSiglas}",
        "protocolo": "Cómo ejecutarla correctamente..."
      },
      {
        "accion": "Acción permitida y recomendada 3",
        "fundamento": "Art. LGIPE / Lineamiento ${opleSiglas}",
        "protocolo": "Cómo ejecutarla correctamente..."
      },
      {
        "accion": "Acción permitida y recomendada 4",
        "fundamento": "Art. LGIPE / Lineamiento ${opleSiglas}",
        "protocolo": "Cómo ejecutarla correctamente..."
      }
    ],
    "queNoHacerLegalmente": [
      {
        "prohibicion": "Conducta estrictamente prohibida 1 (Delito o Infracción Electoral)",
        "fundamento": "Art. LGIPE / Ley General en Materia de Delitos Electorales / ${legislacionLocal}",
        "consecuenciaJuridica": "Sanción, multa, pérdida de registro o pena privativa de libertad..."
      },
      {
        "prohibicion": "Conducta estrictamente prohibida 2",
        "fundamento": "Art. 209 LGIPE / Art. 134 CPEUM",
        "consecuenciaJuridica": "Consecuencia legal exacta..."
      },
      {
        "prohibicion": "Conducta estrictamente prohibida 3",
        "fundamento": "Normatividad de Fiscalización INE / ${opleSiglas}",
        "consecuenciaJuridica": "Consecuencia legal exacta..."
      },
      {
        "prohibicion": "Conducta estrictamente prohibida 4",
        "fundamento": "Reglas de Veda y Jornada Electoral (${opleSiglas})",
        "consecuenciaJuridica": "Consecuencia legal exacta..."
      }
    ]
  },
  "protocoloOperativoCampo": [
    { "fase": "Fase 1: Briefing Matutino y Despliegue Seccional", "pasos": "Instrucciones operativas precisas..." },
    { "fase": "Fase 2: Supervisión en Campo y Reporte de Incidencias", "pasos": "Instrucciones operativas precisas..." },
    { "fase": "Fase 3: Cierre Táctico, Resguardo de Actas y Defensa ante ${opleSiglas}", "pasos": "Instrucciones operativas precisas..." }
  ],
  "fuentesVerificables": [
    { "organismo": "INE — Repositorio Documental y Acuerdos del Consejo General", "url": "https://repositoriodocumental.ine.mx/" },
    { "organismo": "DOF — Diario Oficial de la Federación (Reformas Electorales)", "url": "https://www.dof.gob.mx/" },
    { "organismo": "TEPJF — IUS Electoral y Jurisprudencia Vigente", "url": "https://www.te.gob.mx/IUSE/" },
    { "organismo": "${opleSiglas} (${opleNombre})", "url": "${opleUrl}" },
    { "organismo": "Ley General de Instituciones y Procedimientos Electorales (LGIPE)", "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGIPE.pdf" }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Genera el Manual de Capacitación y Liderazgo auto-actualizado (24h) para ${rolCoordinador} en ${municipio}, ${estado} (${partido}). Enfoque: "${enfoqueEspecial}". Regulador estatal: ${opleSiglas}. Devuelve JSON.` }
        ],
        temperature: 0.1,
        jsonMode: true
      });
      const cleanJson = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[FreeLLMService] Error en generateTrainingManualWithLLM:', err.message);
      return null;
    }
  }

}

module.exports = new FreeLLMService();
