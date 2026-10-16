// Servicio Unificado de Modelos de IA Gratuitos
// Soporta APIs gratuitas: Groq (Llama 3.3 70B, Llama 3.1 8B), Google Gemini (1.5 Flash), OpenRouter (:free models) y Ollama

class FreeLLMService {
  constructor() {
    this.providers = {
      groq: {
        name: 'Groq Cloud (Llama 3.3 70B / Ultra Rápido - Gratuito)',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'llama-3.3-70b-versatile',
        availableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
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
   * Ejecuta una llamada de inferencia a cualquiera de los proveedores gratuitos
   */
  async executeChatCompletion({ provider = 'groq', apiKey, model, messages, temperature = 0.5, jsonMode = false }) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Proveedor de IA desconocido: ${provider}`);
    }

    const selectedModel = model || providerConfig.defaultModel;

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
          body: JSON.stringify(bodyPayload)
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
      throw new Error(`Se requiere una API Key gratuita para ${provider}`);
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

    const payload = {
      model: selectedModel,
      messages,
      temperature,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    const res = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

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
    const isGemini = (!aiConfig?.provider || aiConfig?.provider === 'gemini');
    const { primaryKey, backupKey } = isGemini ? this.getGeminiKeys(aiConfig?.apiKey) : { primaryKey: '', backupKey: '' };
    const effectiveKey = aiConfig?.apiKey || primaryKey || backupKey;
    const effectiveProvider = (aiConfig?.provider && aiConfig.provider !== 'native') 
      ? aiConfig.provider 
      : (effectiveKey ? 'gemini' : null);

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
    "obreros": { "favor": number, "contra": number, "neutro": number, "motivo": string },
    "comerciantes": { "favor": number, "contra": number, "neutro": number, "motivo": string },
    "claseMedia": { "favor": number, "contra": number, "neutro": number, "motivo": string },
    "jovenes": { "favor": number, "contra": number, "neutro": number, "motivo": string },
    "adultosMayores": { "favor": number, "contra": number, "neutro": number, "motivo": string }
  }
}`;

    const userPrompt = `Propuesta a evaluar: "${propuestaTexto}" en ${municipio}, ${estado}.`;

    try {
      const rawResponse = await this.executeChatCompletion({
        provider: aiConfig.provider,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        jsonMode: true
      });

      // Extraer y parsear JSON
      const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn(`[FreeLLMService] Error evaluando con ${aiConfig.provider}:`, err.message);
      return null;
    }
  }

  /**
   * Genera hilos de debate inter-agentes vivos con IA
   */
  async generateDebatesWithLLM(propuestaTexto, tituloProyecto, municipio, estado, problematicasLocales, aiConfig) {
    const isGemini = (!aiConfig?.provider || aiConfig?.provider === 'gemini');
    const { primaryKey, backupKey } = isGemini ? this.getGeminiKeys(aiConfig?.apiKey) : { primaryKey: '', backupKey: '' };
    const effectiveKey = aiConfig?.apiKey || primaryKey || backupKey;
    const effectiveProvider = (aiConfig?.provider && aiConfig.provider !== 'native') 
      ? aiConfig.provider 
      : (effectiveKey ? 'gemini' : null);

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
      const raw = await this.executeChatCompletion({
        provider: effectiveProvider,
        apiKey: effectiveKey,
        model: aiConfig?.model || process.env.GEMINI_MODEL || 'gemini-1.5-pro',
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
}

module.exports = new FreeLLMService();
