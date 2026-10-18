/* script.js - Barbería El Arriero Ilustrado
   Todo va dentro de una función para no ensuciar el ámbito global.
   Los datos del negocio (WhatsApp, horario) están en config.js. */
(function () {
  "use strict";

  var CFG = window.ARRIERO || {};
  var WA = String(CFG.whatsapp || "");
  if (!/^\d{8,15}$/.test(WA) || WA === "573000000000") {
    console.warn("config.js: falta poner el número real de WhatsApp.");
  }

  function $(id) { return document.getElementById(id); }
  function crear(tag, clase, texto) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  /* ---------- 1. Año automático en el pie ---------- */
  var anio = $("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- 2. Menú responsive ---------- */
  var menuBtn = $("menuBtn");
  var menu = $("menu");
  menuBtn.addEventListener("click", function () {
    var abierto = menu.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", String(abierto));
  });
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

  /* ---------- 3. Utilidades ---------- */

  // Limpia el texto: quita caracteres de control, etiquetas y espacios sobrantes.
  // Es una capa extra; si algún día hay servidor, él SIEMPRE debe volver a validar y escapar.
  function limpiar(texto) {
    return String(texto)
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  var PATRON_PELIGROSO = /(javascript:|data:text|on\w+\s*=|<\s*script|union\s+select|drop\s+table|--\s|;\s*delete)/i;

  function dinero(n) { return "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function duracion(min) {
    var h = Math.floor(min / 60), m = min % 60, p = [];
    if (h) p.push(h + " h");
    if (m) p.push(m + " min");
    return p.join(" ") || "0 min";
  }
  function aMinutos(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmtHora(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return (h % 12 || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + (h >= 12 ? "p. m." : "a. m.");
  }
  function clave(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function sinPunto(s) { return s.replace(".", ""); }

  /* ---------- 4. Enlaces de WhatsApp, teléfono y mapa ---------- */
  function waURL(msg) {
    return "https://wa.me/" + WA + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-wa]"), function (a) {
    a.href = waURL(a.getAttribute("data-wa-msg") || "Hola, quisiera información.");
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-tel]"), function (a) {
    a.href = "tel:+" + WA;
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-direccion]"), function (el) {
    if (CFG.direccion) el.textContent = CFG.direccion;
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-mapa]"), function (a) {
    a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CFG.direccion || "");
  });

  /* ---------- 5. Mensaje libre por WhatsApp (sección contacto) ---------- */
  var formMensaje = $("formMensaje");
  formMensaje.addEventListener("submit", function (e) {
    e.preventDefault();
    var campo = $("msgLibre"), err = $("e-msgLibre");
    var texto = limpiar(campo.value);
    if (texto.length < 3) {
      err.textContent = "Escribe tu mensaje antes de enviarlo.";
      campo.setAttribute("aria-invalid", "true");
      return;
    }
    err.textContent = "";
    campo.setAttribute("aria-invalid", "false");
    window.open(waURL(texto), "_blank", "noopener");
  });

  /* ---------- 6. Filtro de productos ---------- */
  var chips = document.querySelectorAll(".chip");
  var productos = document.querySelectorAll("#listaProductos .producto");
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filtro");
      Array.prototype.forEach.call(chips, function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      Array.prototype.forEach.call(productos, function (li) {
        li.hidden = f !== "todos" && li.getAttribute("data-cat") !== f;
      });
    });
  });

  /* ---------- 7. RESERVA POR PASOS ----------
     Los servicios se leen del HTML (atributos data-*), así que si cambias un
     precio o agregas un servicio en index.html, la reserva se actualiza sola. */
  var servicios = Array.prototype.map.call(document.querySelectorAll("[data-servicio]"), function (li) {
    return {
      id: li.getAttribute("data-servicio"),
      cat: li.getAttribute("data-cat"),
      nombre: li.getAttribute("data-nombre"),
      precio: Number(li.getAttribute("data-precio")),
      min: Number(li.getAttribute("data-min")),
      desde: li.getAttribute("data-desde") === "1"
    };
  });
  var porId = {};
  servicios.forEach(function (s) { porId[s.id] = s; });

  var CATS = [["hombres", "Hombres"], ["damas", "Damas"], ["color", "Color y decoloración"]];
  var reserva = { sel: {}, fecha: null, hora: null, paso: 1 };
  var ultimoEnvio = 0;
  var ultimaURL = "";

  var elServicios = $("reservaServicios");
  var elBarra = $("reservaBarra");
  var elEstado = $("estado");
  var btnAtras = $("atras"), btnSig = $("siguiente"), btnConf = $("confirmar");
  var paneles = document.querySelectorAll("[data-panel]");
  var pasosLi = document.querySelectorAll("#pasos li");

  // --- Paso 1: lista de servicios agrupada
  CATS.forEach(function (c, i) {
    var det = crear("details");
    det.setAttribute("data-cat", c[0]);
    if (i === 0) det.open = true;
    det.appendChild(crear("summary", "", c[1]));
    var ul = crear("ul", "srv-lista");
    servicios.filter(function (s) { return s.cat === c[0]; }).forEach(function (s) {
      var li = crear("li");
      var lab = crear("label", "srv");
      var inp = crear("input");
      inp.type = "checkbox";
      inp.value = s.id;
      inp.id = "srv-" + s.id;
      inp.addEventListener("change", function () {
        if (inp.checked) reserva.sel[s.id] = true; else delete reserva.sel[s.id];
        reserva.fecha = null; reserva.hora = null; // la duración cambió: hay que elegir hora otra vez
        actualizarBarra();
      });
      var txt = crear("span");
      txt.appendChild(document.createTextNode(s.nombre));
      txt.appendChild(crear("span", "srv-meta", duracion(s.min) + " · " + (s.desde ? "desde " : "") + dinero(s.precio)));
      lab.appendChild(inp);
      lab.appendChild(txt);
      li.appendChild(lab);
      ul.appendChild(li);
    });
    det.appendChild(ul);
    elServicios.appendChild(det);
  });

  function elegidos() { return Object.keys(reserva.sel).map(function (id) { return porId[id]; }); }
  function totales() {
    var t = { n: 0, min: 0, precio: 0, desde: false };
    elegidos().forEach(function (s) { t.n++; t.min += s.min; t.precio += s.precio; if (s.desde) t.desde = true; });
    return t;
  }
  function actualizarBarra() {
    var t = totales();
    elBarra.textContent = t.n === 0
      ? "Aún no elegiste servicios."
      : t.n + (t.n === 1 ? " servicio" : " servicios") + " · " + duracion(t.min) + " · " + (t.desde ? "desde " : "") + dinero(t.precio);
  }

  // --- Navegación entre pasos
  function irPaso(n, enfocar) {
    reserva.paso = n;
    Array.prototype.forEach.call(paneles, function (p) {
      p.hidden = Number(p.getAttribute("data-panel")) !== n;
    });
    Array.prototype.forEach.call(pasosLi, function (li) {
      var k = Number(li.getAttribute("data-paso"));
      li.classList.toggle("actual", k === n);
      li.classList.toggle("hecho", k < n);
      if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    var exito = n === 5;
    btnAtras.hidden = n === 1 || exito;
    btnSig.hidden = n >= 4;
    btnConf.hidden = n !== 4;
    $("reservaNav").hidden = exito;
    elBarra.hidden = exito;
    elEstado.textContent = "";
    if (n === 2) prepararFechas();
    if (n === 4) armarResumen();
    if (enfocar !== false) {
      var h = document.querySelector('[data-panel="' + n + '"] h3');
      if (h) h.focus({ preventScroll: true });
      $("reservaCaja").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function error(msg) { elEstado.textContent = msg; }

  btnAtras.addEventListener("click", function () { irPaso(reserva.paso - 1); });
  btnSig.addEventListener("click", function () {
    error("");
    if (reserva.paso === 1) {
      if (totales().n === 0) return error("Elige al menos un servicio para continuar.");
    } else if (reserva.paso === 2) {
      if (!reserva.fecha) return error("Elige un día.");
      if (reserva.hora === null) return error("Elige una hora.");
    } else if (reserva.paso === 3) {
      if (!validarDatos()) return error("Revisa los campos marcados.");
    }
    irPaso(reserva.paso + 1);
  });

  // --- Paso 2: fechas y horas
  function ventana() {
    var ini = aMinutos(CFG.apertura || "09:00"), fin = aMinutos(CFG.cierre || "20:00");
    return { ini: ini, fin: fin, paso: CFG.pasoMinutos || 30 };
  }
  function horasPara(fecha, dur) {
    var v = ventana(), out = [];
    var minimo = Date.now() + (CFG.anticipacionMinutos || 0) * 60000;
    for (var t = v.ini; t + dur <= v.fin; t += v.paso) {
      var d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, t, 0, 0);
      if (d.getTime() >= minimo) out.push(t);
    }
    return out;
  }
  function diasDisponibles(dur) {
    var abiertos = CFG.diasAbierto || [1, 2, 3, 4, 5, 6];
    var cerrados = CFG.diasCerrados || [];
    var hoy = new Date(), out = [];
    for (var i = 0; i <= (CFG.diasAdelante || 21); i++) {
      var d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
      if (abiertos.indexOf(d.getDay()) === -1 || cerrados.indexOf(clave(d)) !== -1) continue;
      if (horasPara(d, dur).length) out.push(d);
    }
    return out;
  }

  var elDias = $("dias"), elHoras = $("horas"), elTituloHoras = $("tituloHoras");

  function prepararFechas() {
    var t = totales();
    $("duracionAyuda").textContent = "Tu cita dura aproximadamente " + duracion(t.min) + ".";
    elDias.textContent = ""; elHoras.textContent = "";
    elTituloHoras.hidden = true;
    var dias = diasDisponibles(t.min);
    if (!dias.length) {
      elDias.appendChild(crear("p", "sin-cupo", "Esta combinación de servicios no cabe en un día de atención. Quita algún servicio o escríbenos por WhatsApp."));
      return;
    }
    if (reserva.fecha && !dias.some(function (d) { return clave(d) === clave(reserva.fecha); })) {
      reserva.fecha = null; reserva.hora = null;
    }
    dias.forEach(function (d) {
      var b = crear("button", "dia");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(!!reserva.fecha && clave(d) === clave(reserva.fecha)));
      b.setAttribute("aria-label", d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }));
      b.appendChild(crear("span", "dia-sem", sinPunto(d.toLocaleDateString("es-CO", { weekday: "short" }))));
      b.appendChild(crear("span", "dia-num", String(d.getDate())));
      b.appendChild(crear("span", "dia-mes", sinPunto(d.toLocaleDateString("es-CO", { month: "short" }))));
      b.addEventListener("click", function () {
        reserva.fecha = d; reserva.hora = null;
        Array.prototype.forEach.call(elDias.children, function (x) { x.setAttribute("aria-checked", String(x === b)); });
        pintarHoras();
      });
      elDias.appendChild(b);
    });
    if (reserva.fecha) pintarHoras();
  }
  function pintarHoras() {
    elHoras.textContent = "";
    elTituloHoras.hidden = false;
    horasPara(reserva.fecha, totales().min).forEach(function (m) {
      var b = crear("button", "hora", fmtHora(m));
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(reserva.hora === m));
      b.addEventListener("click", function () {
        reserva.hora = m;
        Array.prototype.forEach.call(elHoras.children, function (x) { x.setAttribute("aria-checked", String(x === b)); });
      });
      elHoras.appendChild(b);
    });
  }

  // --- Paso 3: datos
  var formReserva = $("formReserva");
  var reglas = {
    nombre: function (v) {
      if (v.length < 3) return "Escribe tu nombre (mínimo 3 letras).";
      if (!/^[\p{L}\s'.-]{3,60}$/u.test(v)) return "El nombre solo puede tener letras y espacios.";
      return "";
    },
    telefono: function (v) {
      if (v === "") return "";
      if (!/^\d{7,15}$/.test(v.replace(/[\s()+-]/g, ""))) return "Escribe un teléfono válido (7 a 15 dígitos) o déjalo vacío.";
      return "";
    },
    mensaje: function (v) {
      if (v.length > 300) return "Las notas no pueden pasar de 300 caracteres.";
      if (PATRON_PELIGROSO.test(v)) return "Las notas contienen texto no permitido.";
      return "";
    }
  };
  function validarCampo(nombre) {
    var campo = formReserva.elements[nombre];
    var valor = limpiar(campo.value);
    var msg = reglas[nombre](valor);
    $("e-" + nombre).textContent = msg;
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
    campo.classList.toggle("valido", !msg && valor !== "");
    return msg === "";
  }
  function validarDatos() { return Object.keys(reglas).map(validarCampo).every(Boolean); }
  Object.keys(reglas).forEach(function (n) {
    formReserva.elements[n].addEventListener("blur", function () { validarCampo(n); });
  });

  // --- Paso 4: resumen y envío
  function textoFecha(d) {
    var t = d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function datosReserva() {
    var t = totales();
    return {
      servicios: elegidos(),
      totales: t,
      fecha: reserva.fecha,
      hora: reserva.hora,
      nombre: limpiar(formReserva.elements.nombre.value),
      telefono: limpiar(formReserva.elements.telefono.value),
      notas: limpiar(formReserva.elements.mensaje.value)
    };
  }
  function fila(dl, titulo, contenido, clase) {
    var div = crear("div", clase || "");
    div.appendChild(crear("dt", "", titulo));
    var dd = crear("dd");
    if (typeof contenido === "string") dd.textContent = contenido; else dd.appendChild(contenido);
    div.appendChild(dd);
    dl.appendChild(div);
  }
  function armarResumen() {
    var r = datosReserva(), dl = $("resumen");
    dl.textContent = "";
    var ul = crear("ul");
    r.servicios.forEach(function (s) { ul.appendChild(crear("li", "", s.nombre + " (" + (s.desde ? "desde " : "") + dinero(s.precio) + ")")); });
    fila(dl, "Servicios", ul);
    fila(dl, "Día", textoFecha(r.fecha));
    fila(dl, "Hora", fmtHora(r.hora));
    fila(dl, "Duración", "Aprox. " + duracion(r.totales.min));
    fila(dl, "A nombre de", r.nombre);
    if (r.notas) fila(dl, "Notas", r.notas);
    fila(dl, r.totales.desde ? "Total estimado" : "Total", (r.totales.desde ? "desde " : "") + dinero(r.totales.precio), "total");
  }
  function mensajeWA(r) {
    var l = ["Hola, quiero reservar un turno en El Arriero Ilustrado.", "", "*Servicios:*"];
    r.servicios.forEach(function (s) { l.push("- " + s.nombre + " (" + (s.desde ? "desde " : "") + dinero(s.precio) + ")"); });
    l.push("", "*Día:* " + textoFecha(r.fecha), "*Hora:* " + fmtHora(r.hora));
    l.push("*Duración aprox.:* " + duracion(r.totales.min));
    l.push("*" + (r.totales.desde ? "Total estimado" : "Total") + ":* " + (r.totales.desde ? "desde " : "") + dinero(r.totales.precio));
    l.push("*Nombre:* " + r.nombre);
    if (r.telefono) l.push("*Teléfono:* " + r.telefono);
    if (r.notas) l.push("*Notas:* " + r.notas);
    return l.join("\n");
  }

  btnConf.addEventListener("click", function () {
    // Trampa para bots: si el campo oculto tiene algo, fingimos éxito y no enviamos
    if (formReserva.elements.web.value !== "") { irPaso(5); return; }
    if (Date.now() - ultimoEnvio < 10000) return error("Espera unos segundos antes de enviar de nuevo.");
    if (!validarDatos() || totales().n === 0 || !reserva.fecha || reserva.hora === null) {
      return error("Falta información. Vuelve atrás y revisa los pasos.");
    }
    var r = datosReserva();
    ultimoEnvio = Date.now();
    ultimaURL = waURL(mensajeWA(r));
    window.open(ultimaURL, "_blank", "noopener"); // se abre directo desde el clic para que no lo bloqueen

    // Si algún día hay servidor, la reserva también viaja allí (config.js → endpoint)
    if (CFG.endpoint) {
      fetch(CFG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          servicios: r.servicios.map(function (s) { return s.id; }),
          dia: clave(r.fecha), minutoInicio: r.hora, duracionMin: r.totales.min,
          nombre: r.nombre, telefono: r.telefono, notas: r.notas
        })
      }).catch(function () { /* el mensaje de WhatsApp ya salió; no bloqueamos al cliente */ });
    }
    $("reabrirWa").href = ultimaURL;
    irPaso(5);
  });

  $("otraReserva").addEventListener("click", function () {
    reserva.sel = {}; reserva.fecha = null; reserva.hora = null;
    Array.prototype.forEach.call(elServicios.querySelectorAll("input"), function (i) { i.checked = false; });
    formReserva.reset();
    actualizarBarra();
    irPaso(1);
  });

  // Botones "Reservar" de cada servicio: lo marcan y llevan al formulario
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-reservar]") : null;
    if (!b) return;
    var id = b.getAttribute("data-reservar");
    var inp = $("srv-" + id);
    if (!inp) return;
    if (reserva.paso === 5) $("otraReserva").click();
    if (!inp.checked) { inp.checked = true; inp.dispatchEvent(new Event("change")); }
    var det = inp.closest("details");
    if (det) det.open = true;
    irPaso(1, false);
    $("reservar").scrollIntoView({ behavior: sinMovimiento() ? "auto" : "smooth", block: "start" });
  });

  irPaso(1, false);
  actualizarBarra();

  /* ---------- 8. Preferencia de movimiento reducido ---------- */
  function sinMovimiento() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- 9. Animación al hacer scroll (solo títulos de sección) ---------- */
  var items = document.querySelectorAll(".seccion h2, .galeria li");
  if ("IntersectionObserver" in window && !sinMovimiento()) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove("oculto");
          observador.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    Array.prototype.forEach.call(items, function (el) {
      el.classList.add("reveal");
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add("oculto");
      observador.observe(el);
    });
  }

  /* ---------- 10. Galería con lightbox ---------- */
  var visor = $("visor");
  var visorImg = $("visorImg");
  var visorPie = $("visorPie");
  var fotos = Array.prototype.slice.call(document.querySelectorAll(".galeria .foto img"));
  var actual = 0;

  // Si una foto no existe todavía, el recuadro muestra su título en vez de un icono roto
  fotos.forEach(function (img) {
    function marcar() { img.closest("button").classList.add("sin-foto"); }
    img.addEventListener("error", marcar);
    if (img.complete && img.naturalWidth === 0) marcar();
  });

  function mostrarFoto(i) {
    actual = (i + fotos.length) % fotos.length;
    visorImg.src = fotos[actual].getAttribute("src");
    visorImg.alt = fotos[actual].alt;
    visorPie.textContent = fotos[actual].alt;
  }
  function abrirVisor(i) {
    if (typeof visor.showModal !== "function") return;
    if (fotos[i].closest("button").classList.contains("sin-foto")) return;
    mostrarFoto(i);
    visor.showModal();
    document.documentElement.classList.add("sin-scroll");
  }
  function cerrarVisor() { if (visor.open) visor.close(); }

  fotos.forEach(function (img, i) {
    img.closest("button").addEventListener("click", function () { abrirVisor(i); });
  });
  $("visorCerrar").addEventListener("click", cerrarVisor);
  $("visorAnt").addEventListener("click", function () { mostrarFoto(actual - 1); });
  $("visorSig").addEventListener("click", function () { mostrarFoto(actual + 1); });
  visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
  visor.addEventListener("close", function () { document.documentElement.classList.remove("sin-scroll"); });
  visor.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") mostrarFoto(actual - 1);
    if (e.key === "ArrowRight") mostrarFoto(actual + 1);
  });

  /* ---------- 11. Botón volver arriba ---------- */
  var arriba = $("arriba");
  window.addEventListener("scroll", function () {
    arriba.classList.toggle("visible", window.scrollY > 500);
  }, { passive: true });
  arriba.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: sinMovimiento() ? "auto" : "smooth" });
  });
})();
