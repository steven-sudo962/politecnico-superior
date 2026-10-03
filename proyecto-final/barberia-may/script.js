/**
 * KRONOS Barbería + May AI Assistant - Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

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

    // Initialize May Virtual Assistant
    initMayAssistant();
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

/* ==========================================================================
   May Virtual Assistant Implementation
   ========================================================================== */

const MAY_BACKEND_URL = '/api/may';
const MAY_DEMO_MODE = true;

let mayPanel, mayMessages, mayForm, mayInput, mayMicBtn, mayStatus;
let mayGreeted = false;
let recognition = null;
let listening = false;
let cachedVoices = [];

function initMayAssistant() {
    mayPanel = document.getElementById('may-panel');
    mayMessages = document.getElementById('may-messages');
    mayForm = document.getElementById('may-form');
    mayInput = document.getElementById('may-input');
    mayMicBtn = document.getElementById('may-mic-btn');
    mayStatus = document.getElementById('may-status');

    if (mayForm) {
        mayForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const text = mayInput.value.trim();
            if (!text) return;
            mayInput.value = '';
            handleUserMessage(text);
        });
    }

    if (mayMicBtn) {
        mayMicBtn.addEventListener('click', toggleMicListening);
    }

    initSpeechRecognition();
    initSpeechSynthesis();
}

function toggleMayPanel() {
    if (!mayPanel) return;
    mayPanel.classList.toggle('hidden');
    if (!mayPanel.classList.contains('hidden') && !mayGreeted) {
        mayGreeted = true;
        const greetingText = '¡Hola! Soy May, la asistente virtual de KRONOS. Puedo darte información sobre servicios, horarios o ayudarte a agendar una cita. Escríbeme o pulsa el micrófono.';
        addMayMessage('ai', greetingText);
        speakAsMay('¡Hola! Soy May, la asistente virtual de KRONOS. ¿En qué puedo ayudarte?');
    }
}

function addMayMessage(sender, text) {
    if (!mayMessages) return;
    const bubble = document.createElement('div');
    bubble.className = `may-bubble ${sender === 'user' ? 'may-bubble-user' : 'may-bubble-ai'}`;
    bubble.textContent = text;
    mayMessages.appendChild(bubble);
    mayMessages.scrollTop = mayMessages.scrollHeight;
}

async function handleUserMessage(text) {
    addMayMessage('user', text);
    if (mayStatus) mayStatus.textContent = 'Escribiendo...';

    const reply = await askMay(text);

    if (mayStatus) mayStatus.textContent = 'Asistente de KRONOS';
    addMayMessage('ai', reply);
    speakAsMay(reply);
}

async function askMay(text) {
    if (MAY_DEMO_MODE) {
        return getDemoReply(text);
    }
    try {
        const response = await fetch(MAY_BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }),
        });
        if (!response.ok) throw new Error('Respuesta no válida del servidor');
        const data = await response.json();
        return data.reply || 'No obtuve una respuesta clara, ¿puede repetirlo?';
    } catch (err) {
        console.error('Error consultando a May:', err);
        return 'No logro conectarme a mi servidor en este momento. Inténtelo de nuevo en un momento.';
    }
}

function getDemoReply(text) {
    const lower = text.toLowerCase();
    if (lower.includes('horario')) {
        return 'Atendemos de lunes a viernes de 9:00 a.m. a 8:00 p.m., y sábados de 10:00 a.m. a 7:00 p.m. Los domingos permanecemos cerrados.';
    }
    if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuánto')) {
        return 'Nuestros servicios varían según el tipo de corte o tratamiento. Puede ver el detalle completo en la sección de Servicios, o decirme cuál le interesa.';
    }
    if (lower.includes('cita') || lower.includes('reserva') || lower.includes('agendar')) {
        return 'Con gusto. Puede usar el botón "Reservar Cita" en la parte superior, o decirme qué día y servicio prefiere y lo anoto por usted.';
    }
    if (lower.includes('ubicaci') || lower.includes('dirección') || lower.includes('dónde')) {
        return 'Estamos en la Av. Diagonal de los Caballeros #452, Distrito Financiero. ¿Le gustaría que le comparta el enlace de ubicación?';
    }
    return `(Modo demo, sin servidor conectado) Recibí: "${text}". Cuando conectemos el backend con Gemini, responderé con inteligencia real.`;
}

/* --- Speech Recognition --- */
function initSpeechRecognition() {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
        recognition = new SpeechRecognitionAPI();
        recognition.lang = 'es-CO';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            listening = true;
            if (mayMicBtn) mayMicBtn.classList.add('listening');
            if (mayStatus) mayStatus.textContent = 'Escuchando...';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleUserMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Error de reconocimiento de voz:', event.error);
            if (mayStatus) mayStatus.textContent = 'No pude escuchar bien, intente de nuevo.';
        };

        recognition.onend = () => {
            listening = false;
            if (mayMicBtn) mayMicBtn.classList.remove('listening');
            if (mayStatus && mayStatus.textContent === 'Escuchando...') {
                mayStatus.textContent = 'Asistente de KRONOS';
            }
        };
    } else if (mayMicBtn) {
        mayMicBtn.disabled = true;
        mayMicBtn.title = 'Tu navegador no soporta reconocimiento de voz';
    }
}

function toggleMicListening() {
    if (!recognition || listening) return;
    try {
        recognition.start();
    } catch (err) {
        console.error('No se pudo iniciar el micrófono:', err);
    }
}

/* --- Speech Synthesis --- */
function loadVoices() {
    if ('speechSynthesis' in window) {
        cachedVoices = window.speechSynthesis.getVoices();
    }
}

function initSpeechSynthesis() {
    loadVoices();
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

const FEMALE_VOICE_HINTS = [
    'google español', 'sabina', 'helena', 'paulina', 'mónica', 'monica',
    'lucia', 'lucía', 'elvira', 'esperanza', 'female', 'mujer', 'femenina'
];

function pickFemaleSpanishVoice() {
    const spanishVoices = cachedVoices.filter(v => v.lang.toLowerCase().startsWith('es'));
    if (spanishVoices.length === 0) return null;

    const byHint = spanishVoices.find(v =>
        FEMALE_VOICE_HINTS.some(hint => v.name.toLowerCase().includes(hint))
    );
    if (byHint) return byHint;

    const MALE_VOICE_HINTS = ['jorge', 'diego', 'raul', 'raúl', 'pablo', 'male', 'hombre'];
    const notMale = spanishVoices.find(v =>
        !MALE_VOICE_HINTS.some(hint => v.name.toLowerCase().includes(hint))
    );
    return notMale || spanishVoices[0];
}

function speakAsMay(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CO';
    utterance.rate = 1;
    utterance.pitch = 1.1;

    const spanishVoice = pickFemaleSpanishVoice();
    if (spanishVoice) utterance.voice = spanishVoice;

    window.speechSynthesis.speak(utterance);
}
