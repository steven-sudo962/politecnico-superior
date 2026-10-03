/**
 * ==========================================================================
 * KRONOS BARBERÍA DE ALTA GAMA - INTERACTIVE ENGINE
 * --------------------------------------------------------------------------
 * Módulo JavaScript modular encargado de la interacción en tiempo real:
 * - Menú responsive táctil y de escritorio.
 * - Efecto dinámico de navegación al hacer scroll.
 * - Sistema de filtrado interactivo por categorías de servicios.
 * - Gestión modal de reservas con selección inteligente de servicio.
 * - Notificaciones estilo toast accesibles y asíncronas.
 * ==========================================================================
 */

'use strict';

/**
 * Inicialización principal al cargar el DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBookingForm();
});

/**
 * Configura los eventos del menú de navegación y del scroll.
 */
function initNavigation() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');

    // Alternar menú desplegable en dispositivos móviles
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            menuBtn.setAttribute('aria-expanded', (!isHidden).toString());
        });

        // Cerrar menú al hacer clic en un enlace de navegación
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Efecto visual de la barra superior con scroll activo
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-xl', 'bg-black/95');
            } else {
                navbar.classList.remove('shadow-xl', 'bg-black/95');
            }
        });
    }
}

/**
 * Filtra las tarjetas de servicios según la categoría seleccionada.
 * @param {string} category - Categoría a mostrar ('all', 'corte', 'barba', 'vip').
 */
function filterServices(category) {
    const cards = document.querySelectorAll('.service-card');
    const buttons = document.querySelectorAll('.service-filter-btn');

    // Actualiza el estado visual de los botones de filtro
    buttons.forEach(btn => {
        btn.classList.remove('bg-gold-500', 'text-black', 'shadow-md');
        btn.classList.add('bg-carddark', 'text-neutral-400', 'border', 'border-neutral-800');
    });

    const activeBtn = document.getElementById(`btn-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-carddark', 'text-neutral-400', 'border', 'border-neutral-800');
        activeBtn.classList.add('bg-gold-500', 'text-black', 'shadow-md');
    }

    // Muestra u oculta las tarjetas con transición fluida
    cards.forEach(card => {
        const matches = (category === 'all' || card.getAttribute('data-category') === category);
        card.style.display = matches ? 'flex' : 'none';
    });
}

/**
 * Abre el modal interactivo de reservas y preselecciona un servicio.
 * @param {string} [serviceName=''] - Nombre del servicio a preseleccionar.
 * @param {string} [price=''] - Precio orientativo del servicio.
 */
function openBookingModal(serviceName = '', price = '') {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    modal.classList.remove('hidden');

    if (serviceName) {
        const select = document.getElementById('modal-service');
        if (select) {
            const firstWord = serviceName.split(' ')[0].toLowerCase();
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text.toLowerCase().includes(firstWord)) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }
    }
}

/**
 * Cierra el modal de reservas.
 */
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Configura la validación y el envío del formulario de reservas.
 */
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
}

/**
 * Maneja el evento submit del formulario de reserva con notificación flotante.
 * @param {Event} event - Evento de envío del formulario.
 */
function handleBookingSubmit(event) {
    event.preventDefault();
    closeBookingModal();

    const notification = document.getElementById('notification-box');
    if (notification) {
        notification.classList.remove('translate-y-32', 'opacity-0');

        // Desaparece automáticamente tras 4 segundos
        setTimeout(() => {
            notification.classList.add('translate-y-32', 'opacity-0');
        }, 4000);
    }
}
