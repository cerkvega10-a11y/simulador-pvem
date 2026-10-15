// Catálogo Multipartidista de Propuestas y Proyectos de Muestra
// Soporta White-Label para PVEM, MORENA, PAN, PRI, MC y PT

module.exports = [
  // ==========================================
  // PARTIDO VERDE ECOLOGISTA (PVEM)
  // ==========================================
  {
    id: 'mexibus-electrico-ecatepec',
    partido: 'PVEM',
    partidoNombre: 'Partido Verde Ecologista de México',
    titulo: 'Línea de Mexibús 100% Eléctrico y Corredor Verde en Vía Morelos (Ecatepec)',
    estado: 'Estado de México',
    municipio: 'Ecatepec de Morelos',
    localidad: 'Vía Morelos (Tramo San Cristóbal - Xalostoc)',
    descripcion: `Proyecto de transformación integral de movilidad urbana sustentable impulsado con visión ecologista:
1. Sustitución de 320 microbuses y combis obsoletas a diésel por una flotilla de 65 autobuses articulados 100% eléctricos de alta capacidad y cero emisiones.
2. Construcción de un corredor verde central con 2,500 árboles nativos, jardines polinizadores y ciclovía confinada bidireccional de 12 kilómetros.
3. Instalación de 18 estaciones inteligentes dotadas de techos con paneles solares, iluminación LED con botón de pánico conectado al C5 y sistema de captación pluvial para riego de camellones.
4. Tarifa preferencial subsidiada de $7.00 pesos con integración electrónica y tarjeta única de movilidad Edomex.
5. Programa de reconversión laboral e inclusión para los choferes y concesionarios actuales mediante cooperativa de transporte público eléctrico.`,
    filtros: { rangoEdad: 'todos', nse: 'todos', ocupacion: 'todos' }
  },
  {
    id: 'cosecha-lluvia-toluca',
    partido: 'PVEM',
    partidoNombre: 'Partido Verde Ecologista de México',
    titulo: 'Programa "Agua para Todos": Red Masiva de Cosecha Pluvial y Pozos de Absorción Verde en Toluca',
    estado: 'Estado de México',
    municipio: 'Toluca',
    localidad: 'Delegaciones Norte y Periféricas (San Pablo Autopan, Totoltepec, El Seminario)',
    descripcion: `Iniciativa de resiliencia hídrica municipal orientada a frenar la sobreexplotación del acuífero y garantizar el derecho humano al agua:
1. Instalación gratuita de 15,000 sistemas domésticos de captación y purificación de agua pluvial en viviendas de zonas con tandeo crítico.
2. Construcción de 20 pozos de absorción e infiltración con humedales bio-filtrantes en parques y áreas públicas para recarga directa de los mantos freáticos.
3. Equipamiento de 120 escuelas públicas y centros comunitarios con cisternas pluviales de 10,000 litros y filtros potabilizadores para abastecer a estudiantes.
4. Creación de la Brigada Verde Vecinal para mantenimiento preventivo, detección de fugas en red primaria y vigilancia contra tomas clandestinas.
5. Inversión prioritaria financiada con bonos verdes estatales y presupuesto participativo municipal.`,
    filtros: { rangoEdad: 'todos', nse: 'bajos_medios', ocupacion: 'todos' }
  },
  {
    id: 'red-veterinarias-naucalpan',
    partido: 'PVEM',
    partidoNombre: 'Partido Verde Ecologista de México',
    titulo: 'Red de Clínicas Veterinarias Públicas y Hospital de Bienestar Animal Gratuito en Naucalpan',
    estado: 'Estado de México',
    municipio: 'Naucalpan de Juárez',
    localidad: 'San Bartolo Centro y El Molinito',
    descripcion: `Propuesta de salud pública integral y defensa de los derechos de los seres sintientes promovida por el Partido Verde:
1. Construcción de 2 Clínicas Veterinarias Municipales de primer contacto y 1 Hospital Veterinario Público de Alta Especialidad en Naucalpan.
2. Servicios 100% gratuitos de esterilización, vacunación antirrábica, desparasitación, consultas médicas generales y cirugías de emergencia para animales de compañía.
3. Unidad Móvil "Verde Animal" para realizar jornadas sabatinas itinerantes en colonias populares de las cañadas (Chimalpa, San Mateo, Las Huertas).
4. Programa de adopción responsable y registro biométrico municipal gratuito para abatir el abandono en vía pública.
5. Tipificación rigurosa y coordinación con la Fiscalía del Edomex para sancionar el maltrato animal.`,
    filtros: { rangoEdad: 'todos', nse: 'todos', ocupacion: 'todos' }
  },

  // ==========================================
  // MORENA
  // ==========================================
  {
    id: 'tren-ligero-chalco',
    partido: 'MORENA',
    partidoNombre: 'Movimiento Regeneración Nacional',
    titulo: 'Conexión Ferroviaria Masiva y Alimentación Eléctrica Chalco - Santa Martha',
    estado: 'Estado de México',
    municipio: 'Chalco',
    localidad: 'Corredor Autopista México-Puebla y Centro de Chalco',
    descripcion: `Proyecto de justicia social y movilidad metropolitana para la zona oriente:
1. Integración tarifaria directa al sistema Metro y Trolebús Elevado con tarifa plana social de $7.00 pesos.
2. Creación de 8 estaciones de transferencia modal con vigilancia militarizada de la Guardia Nacional y cámaras C5.
3. Sustitución de intermediarios en transporte concesionado mediante asambleas directas y créditos del Banco del Bienestar.
4. Conectividad universal para más de 300,000 trabajadores que viajan diario a la Ciudad de México.`,
    filtros: { rangoEdad: 'todos', nse: 'todos', ocupacion: 'todos' }
  },
  {
    id: 'universidad-rosario-neza',
    partido: 'MORENA',
    partidoNombre: 'Movimiento Regeneración Nacional',
    titulo: 'Campus Universidad Gratuita y Centro de Desarrollo Social en Nezahualcóyotl',
    estado: 'Estado de México',
    municipio: 'Nezahualcóyotl',
    localidad: 'Zona Norte / Cuauhtémoc',
    descripcion: `Iniciativa de cobertura educativa 100% pública y gratuita:
1. Apertura de un nuevo plantel de educación superior con capacidad para 6,000 jóvenes sin examen de admisión excluyente.
2. Carreras orientadas a Inteligencia Artificial, Enfermería Comunitaria, Derecho Agrario y Energías Sustentables.
3. Comedores universitarios con ración alimentaria completa a $11 pesos para estudiantes de escasos recursos.
4. Beca mensual Benito Juárez de manutención garantizada para el 100% de la matrícula inscrita.`,
    filtros: { rangoEdad: 'jovenes', nse: 'todos', ocupacion: 'estudiantes' }
  },

  // ==========================================
  // PARTIDO ACCIÓN NACIONAL (PAN)
  // ==========================================
  {
    id: 'escudo-c5i-huixquilucan',
    partido: 'PAN',
    partidoNombre: 'Partido Acción Nacional',
    titulo: 'Escudo Integral C5i con Drones Tácticos, Arcos Carreteros y Patrullaje Inteligente (Huixquilucan)',
    estado: 'Estado de México',
    municipio: 'Huixquilucan',
    localidad: 'Interlomas, Herradura y Zona Tradicional',
    descripcion: `Estrategia de seguridad ciudadana de vanguardia tecnológica y estado de derecho:
1. Despliegue de 40 torres fijas de videovigilancia 4K con reconocimiento de placas y lectores biométricos en accesos carreteros.
2. Escuadrón de vigilancia aérea con drones tácticos con visión térmica nocturna para prevención del delito en zonas de cañadas.
3. Aumento del 35% al sueldo base de policías municipales con certificación internacional CALEA y seguro de gastos médicos mayores.
4. Botón de alerta SOS conectado a teléfonos inteligentes vecinales con tiempo de respuesta certificado menor a 3 minutos.`,
    filtros: { rangoEdad: 'todos', nse: 'altos_medios', ocupacion: 'todos' }
  },
  {
    id: 'cero-impuestos-naucalpan',
    partido: 'PAN',
    partidoNombre: 'Partido Acción Nacional',
    titulo: 'Programa "Naucalpan Compite": Tasa Cero en Licencias y Ventanilla Única de Inversión Empresarial',
    estado: 'Estado de México',
    municipio: 'Naucalpan de Juárez',
    localidad: 'Parques Industriales Alce Blanco y Tlatilco',
    descripcion: `Política de reactivación económica, atracción de capitales y generación de empleos formales:
1. Exención del 100% en derechos de apertura de negocios y licencias de funcionamiento para empresas de tecnología y manufactura limpia.
2. Reducción del 50% en impuesto predial para corporativos que contraten al menos un 40% de jóvenes profesionistas naucalpenses.
3. Digitalización total de trámites municipales bajo esquema de afirmativa ficta en 48 horas sin discrecionalidad de inspectores.
4. Fondo de coinversión municipal para rehabilitación de vialidades y alumbrado en zonas industriales.`,
    filtros: { rangoEdad: 'adultos', nse: 'altos_medios', ocupacion: 'empresarios' }
  },

  // ==========================================
  // PARTIDO REVOLUCIONARIO INSTITUCIONAL (PRI)
  // ==========================================
  {
    id: 'salario-familiar-toluca',
    partido: 'PRI',
    partidoNombre: 'Partido Revolucionario Institucional',
    titulo: 'Tarjeta Salario Familiar Mexiquense y Canasta de Proteína Básica en Toluca',
    estado: 'Estado de México',
    municipio: 'Toluca',
    localidad: 'Zona Sur y Delegaciones Tradicionales',
    descripcion: `Estrategia de fortalecimiento a la economía del hogar y cohesión social:
1. Entrega bimestral de un apoyo monetario de $2,800 MXN para amas de casa jefas de familia en condiciones de vulnerabilidad.
2. Canasta básica de abasto de leche Liconsa, huevo y carnes frías subsidiada al 50% en centros de desarrollo comunitario.
3. Acceso a talleres de autoempleo, corte y confección, estilismo y panadería con entrega de kits de herramientas gratuitos.
4. Seguro de vida para jefas de familia que garantice los estudios de sus hijos en caso de fallecimiento.`,
    filtros: { rangoEdad: 'adultos', nse: 'bajos_medios', ocupacion: 'hogar' }
  },
  {
    id: 'rehabilitacion-vial-tlalne',
    partido: 'PRI',
    partidoNombre: 'Partido Revolucionario Institucional',
    titulo: 'Plan Emergente de Bacheo con Concreto Hidráulico y Pavimentación en Tlalnepantla',
    estado: 'Estado de México',
    municipio: 'Tlalnepantla de Baz',
    localidad: 'Gustavo Baz, Mario Colín y Colonias Populares Oriente',
    descripcion: `Rescate integral de la infraestructura vial metropolitana y conectividad industrial:
1. Reencarpetamiento con concreto hidráulico de alta durabilidad en más de 180,000 m² de avenidas primarias e industriales.
2. Sustitución de red de drenaje profundo pluvial para terminar con inundaciones históricas bajo puentes vehiculares.
3. Pintura termoplástica reflectiva y señalética vial horizontal en el 100% de los cruces peatonales.
4. Cuadrillas nocturnas 24/7 de atención inmediata a baches con garantía de reparación en 24 horas.`,
    filtros: { rangoEdad: 'todos', nse: 'todos', ocupacion: 'todos' }
  },

  // ==========================================
  // MOVIMIENTO CIUDADANO (MC)
  // ==========================================
  {
    id: 'movilidad-naranja-neza',
    partido: 'MC',
    partidoNombre: 'Movimiento Ciudadano',
    titulo: 'Red de Ciclovías Confinadas y Sistema de Bicis Públicas Eléctricas "BiciNeza"',
    estado: 'Estado de México',
    municipio: 'Nezahualcóyotl',
    localidad: 'Av. Pantitlán, Chimalhuacán y López Mateos',
    descripcion: `Movilidad activa, moderna y no contaminante para transformar el municipio:
1. Construcción de 35 km de ciclovías protegidas con bolardos de caucho reciclado y semaforización ciclista dedicada.
2. Sistema público de 1,200 bicicletas mecánicas y eléctricas con 80 estaciones inteligentes enlazadas al Metro y Mexibús.
3. Primeros 45 minutos gratuitos para estudiantes y personas trabajadoras registradas en la app municipal.
4. Talleres barriales de ciclomecánica comunitaria y educación vial para automovilistas y choferes de transporte.`,
    filtros: { rangoEdad: 'jovenes', nse: 'todos', ocupacion: 'estudiantes' }
  },
  {
    id: 'guarderias-nocturnas-ecatepec',
    partido: 'MC',
    partidoNombre: 'Movimiento Ciudadano',
    titulo: 'Red de Guarderías Infantiles Nocturnas 24/7 para Madres de Turno Mixto en Ecatepec',
    estado: 'Estado de México',
    municipio: 'Ecatepec de Morelos',
    localidad: 'Zona Industrial Xalostoc y Ciudad Cuauhtémoc',
    descripcion: `Sistema integral de cuidados y equidad de género:
1. Creación de 6 estancias infantiles modelo con horario ininterrumpido 24 horas, nutrición pediátrica y personal certificado.
2. Servicio preferencial gratuito para enfermeras, doctoras, obreras y trabajadoras de tiendas de autoservicio con turnos de noche.
3. Cámaras de circuito cerrado con transmisión encriptada para que las madres monitoreen a sus hijos desde su celular.
4. Apoyo pedagógico de estimulación temprana y atención médica preventiva constante.`,
    filtros: { rangoEdad: 'adultos_jovenes', nse: 'bajos_medios', ocupacion: 'obreros' }
  },

  // ==========================================
  // PARTIDO DEL TRABAJO (PT)
  // ==========================================
  {
    id: 'comedores-populares-chimalhuacan',
    partido: 'PT',
    partidoNombre: 'Partido del Trabajo',
    titulo: 'Red de Comedores Comunitarios Populares con Comida Completa a $10 Pesos (Chimalhuacán)',
    estado: 'Estado de México',
    municipio: 'Chimalhuacán',
    localidad: 'Barrios San Agustín, Acuitlapilco y Cabecera',
    descripcion: `Soberanía alimentaria y combate frontal a la pobreza extrema:
1. Apertura de 25 comedores populares administrados por asambleas de vecinas con raciones calóricas balanceadas a $10 pesos.
2. Comida 100% gratuita para adultos mayores, personas con discapacidad y menores de 12 años en desnutrición.
3. Compra directa de insumos (frutas, verduras, granos) a campesinos y ejidatarios mexiquenses sin coyotes ni intermediarios.
4. Huertos urbanos comunitarios en las azoteas de los comedores para autosuficiencia de hortalizas y legumbres.`,
    filtros: { rangoEdad: 'todos', nse: 'bajos', ocupacion: 'todos' }
  },
  {
    id: 'cendi-educacion-ecatepec',
    partido: 'PT',
    partidoNombre: 'Partido del Trabajo',
    titulo: 'Centros de Desarrollo Infantil (CENDI) Populares con Nutrición Temprana en Ecatepec',
    estado: 'Estado de México',
    municipio: 'Ecatepec de Morelos',
    localidad: 'Las Américas y Jardines de Morelos',
    descripcion: `Educación inicial de alta calidad para las hijas e hijos de la clase trabajadora:
1. Construcción de 4 CENDI con instalaciones de primer nivel, alberca terapéutica, salones lúdicos y comedores infantiles.
2. Modelo pedagógico de neurodesarrollo temprano, inglés formativo, arte y educación física desde los 45 días de nacidos.
3. Personal docente con licenciatura titulado y con plazas sindicalizadas dignas bajo el tabulador del magisterio.
4. Servicio 100% gratuito para familias obreras y comerciantes informales.`,
    filtros: { rangoEdad: 'adultos_jovenes', nse: 'bajos_medios', ocupacion: 'obreros' }
  }
];
