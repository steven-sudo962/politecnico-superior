/* config.js — LO ÚNICO QUE NECESITAS EDITAR para cambiar tus datos.
   Los servicios y precios se editan directamente en index.html. */
window.ARRIERO = {
  // WhatsApp del negocio: código de país + número, solo dígitos (sin +, espacios ni guiones).
  // Ejemplo Colombia: 573001234567
  whatsapp: "573128787128",
  telefonoVisible: "+57 312 878 7128", // Número para el enlace de llamada.

  direccion: "calle 7#5-32 corregimiento de EL TIPLE", // Completa con la dirección real para mostrarla y activar el mapa.

  // Horario de reservas
  diasAbierto: [1, 2, 3, 4, 5, 6],   // 0 = domingo, 1 = lunes ... 6 = sábado
  apertura: "09:00",
  cierre: "20:00",
  pasoMinutos: 30,                   // intervalo entre horas ofrecidas
  anticipacionMinutos: 60,           // no se puede reservar con menos de 1 hora de anticipación
  diasAdelante: 21,                  // cuántos días hacia adelante se puede reservar
  diasCerrados: [],                  // festivos o cierres, formato "2026-12-25"

  // Opcional: si algún día tienes un servidor, pon aquí la dirección y cada reserva también se enviará allí.
  endpoint: ""
};
