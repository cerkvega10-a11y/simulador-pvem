# Simulador Predictivo de Impacto Social — Partido Verde Ecologista Estado de México
### Plataforma de Inteligencia Predictiva y Simulación Social por Enjambre Multi-Agente (Swarm AI)

Plataforma web de acceso público y abierto (**Zero-Auth / Sin login**) diseñada para evaluar propuestas de obra pública, iniciativas legislativas, proyectos sociales y programas ambientales mediante un **Enjambre de Agentes de Inteligencia Artificial (Swarm Intelligence)** configurable entre **100 y 1,000 agentes ciudadanos sintéticos**, contextualizados con investigación socio-demográfica del INEGI, CONEVAL y fuentes web en tiempo real del **Estado de México** y sus 125 municipios.

---

## 🏛️ Identidad y Propósito
Desarrollada bajo la identidad institucional del **Partido Verde Ecologista Estado de México** (tonos verde esmeralda `#008f39`, verde lima suave `#84cc16`, blanco y grises neutros de alta legibilidad).

> **Objetivo:** Anticipar con rigor científico y representatividad estadística la viabilidad, aceptación ciudadana, focos de conflicto social y oportunidades de mejora de cualquier proyecto comunitario antes de su ejecución en territorio mexiquense.

---

## 🤖 Arquitectura de los 7 Meta-Agentes Especializados

La plataforma opera mediante un pipeline orquestado de **7 agentes inteligentes**:

1. **Agente Orquestador Central (`orchestratorAgent.js`):**
   * Recibe y valida los inputs del usuario.
   * Coordina el flujo secuencial entre los 7 agentes.
   * Emite eventos en tiempo real vía **Server-Sent Events (SSE)** hacia la consola en vivo de la interfaz web.

2. **Agente Analista Multimodal (`multimodalAgent.js`):**
   * Procesa la redacción libre del usuario.
   * Extrae y analiza documentos técnicos adjuntos (`.pdf`, `.docx`, `.txt`) identificando ejes presupuestales, ambientales, de movilidad y seguridad.
   * Analiza imágenes (renders de obras, planos arquitectónicos, mapas y carteles) con visión computacional y OCR simulado, generando la tarjeta de **"Resumen Visual detectado por IA"**.

3. **Agente Investigador Web y Socio-Demográfico (`webResearchAgent.js`):**
   * Realiza rastreo en tiempo real y consulta bases de conocimiento demográficas del **INEGI y CONEVAL**.
   * Identifica las 5 principales problemáticas e intereses de la localidad seleccionada (ej. escasez de agua, tarifas y seguridad en combis, bacheo, contaminación, áreas verdes).
   * Genera la matriz de fricción/alineación entre la propuesta y las urgencias del municipio.

4. **Agente Generador de Perfiles Sintéticos (`personaBuilderAgent.js`):**
   * Parametriza dinámicamente de **100 a 1,000 agentes ciudadanos** con base en distribuciones censales verosímiles del municipio seleccionado:
     * **Edad:** Jóvenes (18-29), Adultos jóvenes (30-49), Adultos maduros (50-64) y Adultos mayores (65+).
     * **Género:** Paridad censal INEGI (~51% mujeres, ~48% hombres, ~1% no binario).
     * **NSE:** Distribución exacta por municipio (A/B, C+, C, D+, D/E).
     * **Ocupación:** Choferes de combi, tianguistas, obreros, amas de casa, profesionistas que viajan a CDMX, estudiantes de UAEMex/FES, etc.
     * **Territorio:** Asignación de colonias, barrios y delegaciones reales del municipio.
     * **Postura Cívica:** Escéptico pragmático, ecologista/verde, activista vecinal, protector de economía familiar, defensor animalista.

5. **Motor de Enjambre Ciudadano (`swarmSimulationEngine.js`):**
   * Despliega la simulación masiva donde cada uno de los N agentes evalúa el proyecto desde su propia perspectiva personal y comunitaria.
   * Emite: **Voto** (A favor, En contra, Neutro), **Nivel de Entusiasmo** (0-100%) y **Argumento en primera persona** con jerga local.

6. **Agente de Deliberación y Contagio Social (`socialDynamicsAgent.js`):**
   * Modela el efecto red, deliberación en grupos de WhatsApp vecinales, asambleas de tianguistas y sindicatos de transporte.
   * Mide la volatilidad y el cambio de opinión post-debate (desplazamiento de indecisos/neutrales hacia a favor o en contra según vectores de contagio).

7. **Agente Sintetizador y Estratega Político (`politicalStrategistAgent.js`):**
   * Consolida métricas finales: Índice de Aceptación Global, Índice de Fricción Social (0-100), Nivel de Polarización.
   * Compila el **Mapa de Calor Demográfico** (quiénes apoyan vs quiénes se oponen).
   * Selecciona las **Voces del Enjambre** (muestra representativa de testimonios ciudadanos).
   * Genera el **Plan de Mitigación y Comunicación Política para el Partido Verde Edomex** (narrativas clave, mesas preventivas con gremios y eslogan de campaña).

---

## 🚀 Puesta en Marcha Rápida (Quickstart)

### Requisitos Previos
* Node.js v18+ o v24+
* Navegador moderno (Chrome, Edge, Firefox, Safari)

### Instalación y Ejecución
1. Clona o ubícate en la carpeta del proyecto:
   ```bash
   cd "c:\Users\52553\Desktop\PROPUESTA pv"
   ```

2. Instala las dependencias (si no se han instalado):
   ```bash
   npm install
   ```

3. Inicia el servidor:
   ```bash
   npm start
   # o bien:
   node server.js
   ```

4. Abre tu navegador en:
   ```
   http://localhost:3000
   ```

---

## 🖥️ Módulos de la Interfaz Web

1. **Sección Hero Institucional:**
   * Bloque de bienvenida con título oficial y descripción explicativa del sistema de simulación ciudadana.
   * Botones de un clic para precargar proyectos de prueba:
     * *Línea de Mexibús 100% Eléctrico en Vía Morelos (Ecatepec)*
     * *Programa "Agua para Todos" y Cosecha Pluvial en Toluca*
     * *Red de Clínicas Veterinarias Gratuitas en Naucalpan*
     * *Parque Solar y Reciclaje Metropolitano en Tlalnepantla*

2. **Módulo 1: Ingreso Multimodal:**
   * Campo de título y área de redacción libre amplia.
   * Dropzone de documentos (`.pdf`, `.docx`, `.txt`) con parseo automático en memoria.
   * Dropzone de imágenes (`.jpg`, `.png`, `.webp`) con recuadro interactivo de **"Resumen Visual detectado por IA"** (elementos detectados, score ambiental y aporte estético).

3. **Módulo 2: Segmentación Territorial:**
   * Selector de los 32 Estados (preseleccionado: Estado de México).
   * Selector dinámico con los **125 municipios del Estado de México** y perfiles profundos para los principales (Ecatepec, Toluca, Naucalpan, Nezahualcóyotl, Tlalnepantla, Chimalhuacán, Cuautitlán Izcalli, Texcoco, Metepec, Huixquilucan, etc.).
   * Campo para ingresar colonia o delegación específica.
   * Filtros demográficos opcionales (Edad, NSE, Ocupación).

4. **Módulo 3: Control del Enjambre:**
   * Slider continuo de **100 a 1,000 agentes** con saltos de 50 en 50 y botones directos (100, 250, 500, 750, 1000).
   * Indicador dinámico de profundidad y representatividad estadística (margen de error ±% e intervalo de confianza del 95%).
   * Toggle de investigación web activa (OSINT).

5. **Consola en Vivo del Enjambre:**
   * Barra de progreso porcentual fluida.
   * 4 tarjetas de fases del pipeline con checks de estado (*Analizando documentos -> Investigando contexto web -> Desplegando enjambre -> Deliberación social*).
   * Terminal en tiempo real con prefijos de color para cada uno de los 7 agentes.

6. **Dashboard de Resultados:**
   * **Índice de Aceptación Global:** Donut chart interactivo (Aprobación, Rechazo, Indiferencia) + Gráfico comparativo Pre vs Post deliberación (Chart.js).
   * **Tarjetas KPI:** % Aprobación Final, % Rechazo Social, % Indiferencia, Nivel de Entusiasmo e Índice de Fricción Social (0-100).
   * **Contexto Local Web:** Las 5 problemáticas reales detectadas con semáforo de alineación y análisis de cruce.
   * **Mapa de Calor Demográfico:** Matrices interactivas segmentadas por Grupos de Edad, Nivel Socioeconómico y Gremios Ocupacionales (aliados vs opositores).
   * **Voces del Enjambre:** Tarjetas con avatar generado, nombre, edad, colonia real, ocupación, voto, entusiasmo y testimonio con jerga mexiquense (filtrables por Todos, A favor, En contra, Neutros).
   * **Estrategia Política PVEM:** Eslogan oficial recomendado, pilares de narrativa de campaña, plan de mitigación preventiva de conflictos vecinales y alianzas territoriales sugeridas.
   * **Exportación a PDF:** Botón que genera una versión formal imprimible y descargable con membrete institucional del Partido Verde Ecologista Estado de México.

---

## 📁 Estructura del Proyecto

```
PROPUESTA pv/
├── package.json                   # Dependencias (express, cors, multer, pdf-parse) y scripts
├── server.js                      # Servidor Express, API REST, SSE Streaming y Multimodal
├── README.md                      # Documentación arquitectónica completa
├── src/
│   ├── agents/
│   │   ├── orchestratorAgent.js        # Agente 1: Master Router & Coordinador de Pipeline
│   │   ├── multimodalAgent.js          # Agente 2: Parseo de Docs & Computer Vision IA
│   │   ├── webResearchAgent.js         # Agente 3: OSINT, INEGI y Problemáticas Web Locales
│   │   ├── personaBuilderAgent.js      # Agente 4: Generador de 100 a 1,000 Agentes Sintéticos
│   │   ├── swarmSimulationEngine.js    # Agente 5: Motor de Evaluación y Voto Masivo
│   │   ├── socialDynamicsAgent.js      # Agente 6: Dinámicas de Deliberación y Contagio Social
│   │   └── politicalStrategistAgent.js # Agente 7: Compilador de Métricas y Estrategia PVEM
│   └── data/
│       ├── edomexDemographics.js       # Base territorial: 125 municipios, colonias, NSE y jergas
│       └── presets.js                  # Propuestas precargadas de demostración
└── public/
    ├── index.html                 # Interfaz visual Zero-Auth (TailwindCSS, Chart.js)
    ├── css/
    │   └── styles.css             # Paleta Partido Verde, glassmorphism, terminal y estilos print
    ├── js/
    │   ├── app.js                 # Manejo reactivo, dropzones, SSE listener y eventos
    │   ├── components.js          # Renderers de Chart.js, mapa de calor, voces y estrategia
    │   └── pdfExport.js           # Generador de reportes formales en PDF
    └── assets/
        └── logo-pvem.svg          # Emblema oficial en vector del PVEM Estado de México
```

---

## 🔒 Acceso y Privacidad
* **Zero-Auth:** La plataforma es de acceso directo e inmediato sin muros de inicio de sesión ni registro de contraseñas.
* **Procesamiento de Archivos en Memoria:** Todos los documentos e imágenes son procesados en memoria mediante buffers eficientes y destruidos tras la sesión.

---
**Partido Verde Ecologista Estado de México • Secretaría de Estrategia Digital e Innovación Política**
