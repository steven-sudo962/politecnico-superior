/**
 * KRONOS Barbería - Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Navbar Scroll Shadow Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-xl', 'bg-black/95');
            } else {
                navbar.classList.remove('shadow-xl', 'bg-black/95');
            }
        });
    }

    // Booking Form Submission Handler
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
});

/**
 * Filter services grid by category
 * @param {string} category - Category slug ('all', 'corte', 'barba', 'vip')
 */
function filterServices(category) {
    const cards = document.querySelectorAll('.service-card');
    const buttons = document.querySelectorAll('.service-filter-btn');

    buttons.forEach(btn => {
        btn.classList.remove('bg-gold-500', 'text-black', 'shadow-md');
        btn.classList.add('bg-carddark', 'text-neutral-400', 'border', 'border-neutral-800');
    });

    const activeBtn = document.getElementById(`btn-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-carddark', 'text-neutral-400', 'border', 'border-neutral-800');
        activeBtn.classList.add('bg-gold-500', 'text-black', 'shadow-md');
    }

    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Open Booking Modal and select relevant service if provided
 * @param {string} [serviceName='']
 * @param {string} [price='']
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
 * Close Booking Modal
 */
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Handle booking form submission
 * @param {Event} event
 */
function handleBookingSubmit(event) {
    event.preventDefault();
    closeBookingModal();

    const notification = document.getElementById('notification-box');
    if (notification) {
        notification.classList.remove('translate-y-32', 'opacity-0');

        setTimeout(() => {
            notification.classList.add('translate-y-32', 'opacity-0');
        }, 4000);
    }
}
