# BITÁCORA DE SEGUIMIENTO DE PROYECTO / ETAPA PRODUCTIVA
### *Proceso Gestión de Formación Profesional Integral - Formato Guía GFPI-F-147*
**Institución:** Corporación Unificada de Educación Superior - CUN / Politécnico  
**Programa de Formación:** Ingeniería de Sistemas (2° Semestre)  
**Modalidad:** Proyecto Productivo de Software / Aplicación Comercial  
**Nombre del Aprendiz / Estudiante:** Johan Steven Ibarra Angulo  
**Nombre del Negocio / Entidad Receptora:** Barbería El Arriero Ilustrado  
**Ubicación:** Calle 7 # 5-32, Corregimiento de El Tiple, Candelaria, Valle del Cauca  
**Periodo General de Ejecución:** 2 de agosto de 2026 al 19 de octubre de 2026  

---

## Ficha de Información General

| Campo | Información Registrada |
| :--- | :--- |
| **Nombre de la Empresa / Proyecto** | Barbería El Arriero Ilustrado |
| **Identificación / NIT** | 1.144.123.456-7 (RUT Persona Natural / Establecimiento de Comercio) |
| **Responsable del Establecimiento** | Propietario / Maestro Barbero El Arriero |
| **Teléfono de Contacto Empresa** | +57 312 878 7128 |
| **Modalidad de Práctica / Proyecto** | [ X ] PROYECTO PRODUCTIVO / DESARROLLO DE SOFTWARE |
| **Nombre del Estudiante / Desarrollador** | Johan Steven Ibarra Angulo |
| **Correo Institucional / Personal** | stevenangulo911@gmail.com |
| **Firma del Estudiante** | *Johan Steven Ibarra Angulo* (Firma Digital Registrada) |

---

## Registro Quincenal de Bitácoras de Seguimiento

### BITÁCORA N° 01
* **Periodo de Ejecución:** 02 de agosto de 2026 al 15 de agosto de 2026
* **Horas Dedicadas:** 40 horas estimadas
* **Objetivo de la Quincena:** Levantamiento de requerimientos, entrevistas con el barbero y maquetación del primer prototipo estático básico (`Barbería El Arriero Ilustrado`).

| Actividad Desarrollada | Fecha Inicio | Fecha Fin | Evidencia de Cumplimiento | Observaciones, Dificultades y Soluciones |
| :--- | :---: | :---: | :--- | :--- |
| **1. Entrevista de Diagnóstico Comercial:** Levantamiento del catálogo de servicios, precios y horarios reales en el local de El Tiple. | 02/08/2026 | 06/08/2026 | Matriz de tarifas en cuaderno de campo y archivo de texto preliminar con servicios de hombre, damas y químicos. | Ninguna dificultad; excelente disposición del propietario para modernizar la atención de citas. |
| **2. Definición de Paleta e Identidad:** Selección de colores institucionales inspirados en cafetales y barbería tradicional. | 07/08/2026 | 10/08/2026 | Paleta en CSS: Verde oscuro `#1d3a33`, dorado latón `#b8923f` y fondos hueso `#f2f3ef`. | Se buscaba evitar la típica estética de neón azul y rojo de barberías genéricas para darle tono artesanal. |
| **3. Desarrollo del Prototipo v1:** Construcción de la primera versión en HTML/CSS/JS plano en carpeta local. | 11/08/2026 | 15/08/2026 | Carpeta `Barbería El Arriero Ilustrado` con `index.html` (6 KB), `style.css` (5.4 KB) y `script.js` (5.8 KB). | **Dificultad:** El primer formulario de reserva no calculaba horas ni duraciones; solo abría un enlace básico de WhatsApp sin validar datos. |

---

### BITÁCORA N° 02
* **Periodo de Ejecución:** 16 de agosto de 2026 al 31 de agosto de 2026
* **Horas Dedicadas:** 42 horas estimadas
* **Objetivo de la Quincena:** Exploración de plantillas de terceros (`kronos-barberia-may`), auditoría técnica de código y refinamiento en la Versión 2 (`Barberia El Arriero Ilustado 2`).

| Actividad Desarrollada | Fecha Inicio | Fecha Fin | Evidencia de Cumplimiento | Observaciones, Dificultades y Soluciones |
| :--- | :---: | :---: | :--- | :--- |
| **1. Evaluación de Plantilla Kronos:** Pruebas de integración de la plantilla `kronos-barberia-may` basada en Tailwind CDN. | 16/08/2026 | 21/08/2026 | Archivo `kronos-proyecto.zip` descomprimido y probado en navegador local. | **Dificultad:** La plantilla venía con estilos rígidos en inglés, precios en dólares y dependencias innecesarias que hacían difícil adaptarla al negocio. |
| **2. Descarte de Plantilla:** Análisis de sobrecarga y decisión de no utilizar código prestado mal optimizado. | 22/08/2026 | 25/08/2026 | Acta de decisión técnica y archivo de reporte comparativo de rendimiento. | Se concluye que mantener una plantilla ajena incrementa la deuda técnica del estudiante. |
| **3. Desarrollo de Versión 2 (v2):** Creación de `Barberia El Arriero Ilustado 2`, ampliando la carta de cortes y barba. | 26/08/2026 | 31/08/2026 | Carpeta `Barberia El Arriero Ilustado 2` con `index.html` (7.6 KB), `style.css` (7 KB) y `script.js` (9.1 KB). | La interfaz visual mejoró notablemente, pero la selección de hora seguía permitiendo turnos fuera del horario comercial. |

---

### BITÁCORA N° 03
* **Periodo de Ejecución:** 01 de septiembre de 2026 al 15 de septiembre de 2026
* **Horas Dedicadas:** 48 horas estimadas
* **Objetivo de la Quincena:** Transición a arquitectura basada en componentes SPA con React 19, TypeScript, Vite y backend con Node.js / Express (`v3.1`).

| Actividad Desarrollada | Fecha Inicio | Fecha Fin | Evidencia de Cumplimiento | Observaciones, Dificultades y Soluciones |
| :--- | :---: | :---: | :--- | :--- |
| **1. Setup de Ecosistema React:** Inicialización de proyecto con Vite, TypeScript y Tailwind CSS v4. | 01/09/2026 | 08/09/2026 | Carpeta `Barbería El Arriero Ilustrado_v3.1` con `package.json`, `tsconfig.json` y dependencias instaladas. | Curva de aprendizaje al conectar React 19 con las nuevas directivas de Tailwind v4 y Vite. |
| **2. Implementación de Servidor Backend:** Creación de `server.js` con Express.js y dotEnv para procesar solicitudes. | 09/09/2026 | 15/09/2026 | Código fuente de Express con endpoints REST para recepción de JSON de reservas. | **Dificultad:** El servidor requería estar prendido permanentemente en la computadora o pagar un hosting de backend en la nube. |

---

### BITÁCORA N° 04
* **Periodo de Ejecución:** 16 de septiembre de 2026 al 30 de septiembre de 2026
* **Horas Dedicadas:** 45 horas estimadas
* **Objetivo de la Quincena:** Integración experimental de IA Generativa con Google Gemini API y auditoría de viabilidad operativa.

| Actividad Desarrollada | Fecha Inicio | Fecha Fin | Evidencia de Cumplimiento | Observaciones, Dificultades y Soluciones |
| :--- | :---: | :---: | :--- | :--- |
| **1. Conexión de Google Gemini API:** Integración del SDK oficial `@google/genai` (v2.4.0) en el backend de Express. | 16/09/2026 | 22/09/2026 | Módulo de chat inteligente para sugerir estilos de corte según la forma del rostro descrita por el usuario. | Funcionalmente impactante, pero técnicamente vulnerable a abusos de consumo de API por bots. |
| **2. Análisis Crítico de Arquitectura (RCA):** Evaluación de costos en plataformas cloud (Render, AWS, Vercel Pro) y cuellos de botella. | 23/09/2026 | 30/09/2026 | Informe de auditoría: 180 MB de `node_modules`, riesgo de caída por suspensión de servidor gratuito y costo inviable para el cliente. | **Momento decisivo:** Se concluye que el proyecto cayó en *sobreingeniería* (*overengineering*) innecesaria para una barbería local. |

---

### BITÁCORA N° 05
* **Periodo de Ejecución:** 01 de octubre de 2026 al 12 de octubre de 2026
* **Horas Dedicadas:** 42 horas estimadas
* **Objetivo de la Quincena:** Retiro de backend Express (`v5_simplificado`), simplificación de interfaz y formulación del retorno a Vanilla puro.

| Actividad Desarrollada | Fecha Inicio | Fecha Fin | Evidencia de Cumplimiento | Observaciones, Dificultades y Soluciones |
| :--- | :---: | :---: | :--- | :--- |
| **1. Desarrollo de `v5_simplificado`:** Desacoplamiento del servidor Node; la web se convierte en SPA React estática conectada a WhatsApp. | 01/10/2026 | 06/10/2026 | Carpeta `Barberia_El_Arriero_v5_simplificado` en Descargas con `barberData.ts` y compilación en `dist/`. | Cero costos de backend logrados, pero aún existía la barrera de que para editar un texto se requería `npm run build`. |
| **2. Concepción de la Solución Pragmática Definitiva:** Diseño del modelo Vanilla desacoplado donde la configuración viva en un archivo accesible (`config.js`). | 07/10/2026 | 12/10/2026 | Diagrama de bloques y especificación del motor de tiempo acumulado sin frameworks. | Decisión respaldada por el principio KISS (*Keep It Simple, Stupid*) y máxima mantenibilidad. |

---

### BITÁCORA N° 06
* **Periodo de Ejecución:** 13 de octubre de 2026 al 19 de octubre de 2026
* **Horas Dedicadas:** 38 horas estimadas
* **Objetivo de la Quincena:** Construcción de `Barberia_El_Arriero_v3`, desarrollo del algoritmo de citas por franjas, accesibilidad WAI-ARIA, seguridad CSP, sincronización en GitHub y cierre de fase.

| Actividad Desarrollada | Fecha Inicio | Fecha Fin | Evidencia de Cumplimiento | Observaciones, Dificultades y Soluciones |
| :--- | :---: | :---: | :--- | :--- |
| **1. Construcción de `Barberia_El_Arriero_v3`:** Maquetación final con CSS moderno (`clamp()`, variables), HTML semántico y `config.js` independiente. | 13/10/2026 | 15/10/2026 | Archivos `index.html` (58 KB, 712 líneas), `style.css` (16.5 KB, 250 líneas) y `config.js` (1.1 KB). | Interfaz de alto impacto visual, ligera y sin necesidad de instalación de Node. |
| **2. Algoritmo de Turnos Acumulativos:** Programación en `script.js` del cálculo de suma de minutos y filtro de horarios disponibles. | 16/10/2026 | 17/10/2026 | Funciones `totales()`, `diasDisponibles()` y `horasPara()` validadas con servicios de hasta 4 horas (balayage). | Se resolvió definitivamente el problema de citas agendadas fuera del horario laboral. |
| **3. Accesibilidad y Visor Modal:** Implementación de `<dialog>` con foco atrapado y atributos `aria-*` en todo el asistente. | 18/10/2026 | 18/10/2026 | Navegación 100% por teclado probada con la tecla Escape y flechas en galería. | El lightbox funciona de forma fluida y sin librerías externas pesadas. |
| **4. Seguridad, Git y Despliegue:** Inclusión de directivas CSP en HTML, honeypot anti-spam, autenticación en GitHub (`gh auth login`) y push final al repositorio. | 19/10/2026 | 19/10/2026 | Commit `09faa82` sincronizado en `https://github.com/steven-sudo962/politecnico-superior.git`. | Resuelto el error 403 de permisos y consolidada la documentación formal en Normas APA v7. |

---

## Resumen de Aprobación y Cierre de Etapa

* **Total de Horas Registradas:** 255 horas cronológicas de investigación, desarrollo, refactorización y pruebas.
* **Resultado del Proyecto:** Plataforma web en producción, funcional, accesible, segura, sin costos fijos de mantenimiento y con código fuente versionado en repositorio Git.
* **Calificación Sugerida:** Aprobado Sobresaliente.
