const fs = require('fs');
const path = require('path');

function ensureEnvLoaded() {
  if (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY) return;
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
}
ensureEnvLoaded();

class FreeLLMService {
  constructor() {
    this.providers = {
      groq: {
        name: 'Groq Cloud (GPT-OSS 120B / Qwen 27B - Ultra Rápido)',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'openai/gpt-oss-120b',
        availableModels: ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'],
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

    if (provider === 'groq' && (!selectedModel || selectedModel.includes('llama'))) { selectedModel = 'openai/gpt-oss-120b'; }
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

    if (!res.ok && res.status === 429 && provider === 'groq') {
      const fallbackModel = selectedModel === 'openai/gpt-oss-120b' ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-20b';
      console.warn(`[Groq TPM Guard] 429 Rate limit en ${selectedModel}. Conmutando en caliente a ${fallbackModel}...`);
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
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || 'openai/gpt-oss-120b';
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
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || 'openai/gpt-oss-120b';
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
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || 'openai/gpt-oss-120b';
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
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || 'openai/gpt-oss-120b';
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
   * 4. Tendencias Digitales y Pulso de Redes Sociales con IA (Anti-Bots y Viralidad)
   */
  async generateDigitalTrendsWithLLM(params = {}) {
    const { propuestaTexto = '', municipio = 'Ecatepec de Morelos', estado = 'Estado de México', aiConfig = {} } = params;
    const { provider: effectiveProvider, apiKey: effectiveKey } = this.resolveProviderAndKey(aiConfig);
    if (!effectiveProvider || (!effectiveKey && effectiveProvider !== 'ollama')) return null;

    const systemPrompt = `Eres un experto en inteligencia de datos en redes sociales, algoritmos de viralidad y ciberseguridad política para ${municipio}, ${estado}.
Analiza la conversación digital real que detonaría esta propuesta en redes sociales (X/Twitter, TikTok, Facebook, WhatsApp vecinal).
Evalúa el porcentaje orgánico vs granjas de bots, calcula el sentimiento, genera los 5 hashtags virales más probables y el desglose de plataformas.

Devuelve estrictamente este JSON:
{
  "organicidad": {
    "porcentajeOrganico": 81,
    "porcentajeBots": 19,
    "cuentasAuditadas": 19850,
    "diagnostico": "Diagnóstico de legitimidad de la conversación digital..."
  },
  "sentimiento": {
    "positivo": 57,
    "neutro": 23,
    "negativo": 20
  },
  "topHashtags": [
    {
      "hashtag": "#EjemploViral",
      "descripcion": "Motivo de la tendencia en ${municipio}",
      "volumen": "16.4K",
      "sentimiento": "Positivo (74%)",
      "sentimientoPct": "Positivo (74%)",
      "organicidad": "88% Orgánico",
      "accionTactica": "Amplificar con brigadas digitales",
      "accionColor": "emerald"
    }
  ],
  "plataformas": {
    "xTwitter": { "sentimiento": "56% Favorable", "riesgoGuerraSucia": "Moderado", "narrativa": "Debate de líderes de opinión y medios locales." },
    "tikTok": { "sentimiento": "74% Viral Favorable", "riesgoGuerraSucia": "Bajo", "narrativa": "Jóvenes compartiendo videos sobre impacto verde." },
    "facebook": { "sentimiento": "62% Favorable", "riesgoGuerraSucia": "Moderado", "narrativa": "Grupos de vecinos debatiendo beneficios en su colonia." },
    "whatsApp": { "sentimiento": "Debate Activo", "riesgoGuerraSucia": "Alto (Cadenas de audio)", "narrativa": "Grupos vecinales y tianguistas compartiendo audios." }
  },
  "alertasCrisis": [
    { "nivel": "Media", "alerta": "Riesgo de campaña negra con bots de la oposición", "accionInmediata": "Publicar infografía oficial en los primeros 45 minutos." }
  ]
}`;

    try {
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || 'openai/gpt-oss-120b';
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Propuesta en ${municipio}: "${propuestaTexto}". Genera las tendencias digitales en JSON.` }
        ],
        temperature: 0.6,
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
      const selectedModel = aiConfig?.model || this.providers[effectiveProvider]?.defaultModel || 'openai/gpt-oss-120b';
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
}

module.exports = new FreeLLMService();

