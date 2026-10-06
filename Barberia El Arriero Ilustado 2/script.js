/* script.js - Barbería El Arriero Ilustrado
   Todo va dentro de una función para no ensuciar el ámbito global. */
(function () {
  "use strict";

  /* ---------- 1. Año automático en el pie ---------- */
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- 2. Menú responsive ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  menuBtn.addEventListener("click", function () {
    var abierto = menu.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", String(abierto)); // accesibilidad
  });
  // Cierra el menú al elegir un enlace o al pulsar Escape
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") cerrarMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarMenu();
  });
  function cerrarMenu() {
    menu.classList.remove("abierto");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  /* ---------- 3. Utilidades de seguridad ---------- */

  // Limpia el texto: quita caracteres de control, etiquetas y espacios sobrantes.
  // OJO: esto es una capa extra; el servidor SIEMPRE debe volver a validar y escapar.
  function limpiar(texto) {
    return String(texto)
      .replace(/[\u0000-\u001F\u007F]/g, " ")   // caracteres de control
      .replace(/[<>]/g, "")                      // evita etiquetas HTML
      .replace(/\s+/g, " ")
      .trim();
  }

  // Detecta patrones típicos de XSS o inyección (se rechazan, no se "arreglan")
  var PATRON_PELIGROSO = /(javascript:|data:text|on\w+\s*=|<\s*script|union\s+select|drop\s+table|--\s|;\s*delete)/i;

  /* ---------- 4. Reglas de validación por campo ---------- */
  var reglas = {
    nombre: function (v) {
      if (v.length < 3) return "Escribe tu nombre completo (mínimo 3 letras).";
      if (!/^[\p{L}\s'.-]{3,60}$/u.test(v)) return "El nombre solo puede tener letras y espacios.";
      return "";
    },
    telefono: function (v) {
      var digitos = v.replace(/[\s()+-]/g, "");
      if (!/^\d{7,15}$/.test(digitos)) return "Escribe un teléfono válido (7 a 15 dígitos).";
      return "";
    },
    email: function (v) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Escribe un correo válido, por ejemplo nombre@correo.com.";
      return "";
    },
    servicio: function (v) {
      if (["corte", "barba", "afeitado", "combo"].indexOf(v) === -1) return "Elige un servicio de la lista.";
      return "";
    },
    mensaje: function (v) {
      if (v.length > 300) return "El mensaje no puede pasar de 300 caracteres.";
      if (PATRON_PELIGROSO.test(v)) return "El mensaje contiene texto no permitido.";
      return "";
    }
  };

  /* ---------- 5. Formulario ---------- */
  var form = document.getElementById("formContacto");
  var boton = document.getElementById("enviar");
  var estado = document.getElementById("estado");
  var ultimoEnvio = 0; // para limitar envíos repetidos

  // Valida un campo y muestra su error con textContent (nunca innerHTML)
  function validarCampo(nombre) {
    var campo = form.elements[nombre];
    var valor = limpiar(campo.value);
    var msg = reglas[nombre](valor);
    document.getElementById("e-" + nombre).textContent = msg;
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
    campo.classList.toggle("valido", !msg && valor !== ""); // borde verde si está bien
    return msg === "";
  }

  // Validación en vivo al salir de cada campo
  Object.keys(reglas).forEach(function (nombre) {
    form.elements[nombre].addEventListener("blur", function () { validarCampo(nombre); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // evitamos recargar la página
    mostrar("", "");

    // Trampa para bots: si el campo oculto tiene algo, fingimos éxito y no enviamos
    if (form.elements["web"].value !== "") { form.reset(); return mostrar("Solicitud recibida.", "ok"); }

    // Límite simple: un envío cada 10 segundos
    if (Date.now() - ultimoEnvio < 10000) return mostrar("Espera unos segundos antes de enviar de nuevo.", "mal");

    // Validamos todos los campos (sin cortar en el primero con error)
    var todoOk = Object.keys(reglas).map(validarCampo).every(Boolean);
    if (!todoOk) return mostrar("Revisa los campos marcados.", "mal");

    // Armamos el paquete de datos ya limpio
    var datos = {};
    Object.keys(reglas).forEach(function (n) { datos[n] = limpiar(form.elements[n].value); });
    datos.csrf_token = form.elements["csrf_token"].value;

    enviarAlServidor(datos);
  });

  // Muestra mensajes de estado de forma segura
  function mostrar(texto, tipo) {
    estado.textContent = texto;
    estado.className = "estado" + (tipo ? " " + tipo : "");
  }

  /* ---------- 6. Punto de conexión con el back-end ----------
     Hoy simula la respuesta. Para conectar el servidor solo hay que
     cambiar SIMULAR a false: el resto del front-end no se toca. */
  var SIMULAR = true;

  function enviarAlServidor(datos) {
    boton.disabled = true;
    mostrar("Enviando...", "");
    ultimoEnvio = Date.now();

    var peticion = SIMULAR
      ? new Promise(function (ok) { setTimeout(function () { ok({ ok: true }); }, 800); })
      : fetch(form.dataset.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(datos)
        });

    peticion
      .then(function (r) { if (!r.ok) throw new Error("Error de servidor"); })
      .then(function () {
        form.reset();
        Object.keys(reglas).forEach(function (n) { form.elements[n].classList.remove("valido"); });
        mostrar("Listo, recibimos tu solicitud. Te llamaremos para confirmar.", "ok");
      })
      .catch(function () { mostrar("No pudimos enviar tu solicitud. Intenta de nuevo.", "mal"); })
      .finally(function () { boton.disabled = false; });
  }

  /* ---------- 7. Preferencia de movimiento reducido ---------- */
  var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 8. Animación al hacer scroll (scroll reveal) ---------- */
  var items = document.querySelectorAll(".seccion h2, .servicios li, .galeria li, .contacto > *");
  if ("IntersectionObserver" in window && !sinMovimiento) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove("oculto"); // aparece
          observador.unobserve(en.target);      // solo una vez
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) {
      el.classList.add("reveal");
      // Solo ocultamos lo que está fuera de la pantalla (evita parpadeos)
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add("oculto");
      observador.observe(el);
    });
  }

  /* ---------- 9. Galería con lightbox ---------- */
  var visor = document.getElementById("visor");
  var visorImg = document.getElementById("visorImg");
  var visorPie = document.getElementById("visorPie");
  var fotos = Array.prototype.slice.call(document.querySelectorAll(".galeria .foto img"));
  var actual = 0;

  function mostrarFoto(i) {
    actual = (i + fotos.length) % fotos.length;          // da la vuelta al llegar al final
    visorImg.src = fotos[actual].getAttribute("src");    // la ruta sale de nuestro propio HTML
    visorImg.alt = fotos[actual].alt;
    visorPie.textContent = fotos[actual].alt;            // textContent: seguro contra XSS
  }
  function abrirVisor(i) {
    if (typeof visor.showModal !== "function") return;   // navegador muy viejo: no hace nada
    mostrarFoto(i);
    visor.showModal();
    document.documentElement.classList.add("sin-scroll");
  }
  function cerrarVisor() { if (visor.open) visor.close(); }

  fotos.forEach(function (img, i) {
    img.closest("button").addEventListener("click", function () { abrirVisor(i); });
  });
  document.getElementById("visorCerrar").addEventListener("click", cerrarVisor);
  document.getElementById("visorAnt").addEventListener("click", function () { mostrarFoto(actual - 1); });
  document.getElementById("visorSig").addEventListener("click", function () { mostrarFoto(actual + 1); });
  visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); }); // clic en el fondo
  visor.addEventListener("close", function () { document.documentElement.classList.remove("sin-scroll"); });
  visor.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") mostrarFoto(actual - 1);
    if (e.key === "ArrowRight") mostrarFoto(actual + 1);
  });

  /* ---------- 10. Botón volver arriba ---------- */
  var arriba = document.getElementById("arriba");
  window.addEventListener("scroll", function () {
    arriba.classList.toggle("visible", window.scrollY > 500);
  }, { passive: true });
  arriba.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: sinMovimiento ? "auto" : "smooth" });
  });
})();
