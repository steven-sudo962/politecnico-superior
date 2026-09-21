// --- ESTADO GLOBAL DE LA APLICACIÓN ---
const state = {
  speed: 0,            // 0 a 5
  mode: null,          // 'smoothie', 'ice', 'soup', 'clean', null
  timer: 0,            // Temporizador
  isBlending: false,   // Estado de encendido
  liquidLevel: 0,      // 0 a 100%
  blendProgress: 0,    // 0 = entero, 1 = completamente homogeneizado
  color: { r: 255, g: 255, b: 255, a: 0 }, // Color de la mezcla
  ingredients: [],     // Lista de objetos agregados
  particles: []        // Partículas en pantalla
};

// Configuración de elementos del DOM
const canvas = document.getElementById('blendCanvas');
const ctx = canvas.getContext('2d');
const speedKnob = document.getElementById('speedKnob');
const speedReadout = document.getElementById('speedReadout');
const lcdStatus = document.getElementById('lcdStatus');
const lcdTimer = document.getElementById('lcdTimer');
const blenderWrapper = document.getElementById('blenderWrapper');
const blade1 = document.getElementById('blade1');
const blade2 = document.getElementById('blade2');
const btnPulse = document.getElementById('btnPulse');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');
const btnPour = document.getElementById('btnPour');
const glassFill = document.getElementById('glassFill');
const modeBtns = document.querySelectorAll('.btn-mode');

let bladeAngle = 0;
let timerInterval = null;
let modeInterval = null;

// --- SINTETIZADOR DE AUDIO CON WEB AUDIO API ---
let audioCtx = null;
let motorOsc = null;
let noiseNode = null;
let motorGain = null;
let noiseGain = null;

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  // Oscilador para el tono del motor
  motorOsc = audioCtx.createOscillator();
  motorOsc.type = 'sawtooth';
  motorOsc.frequency.setValueAtTime(40, audioCtx.currentTime);

  // Generador de ruido blanco para turbulencia/trituración
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  noiseNode.loop = true;

  // Filtro pasa-bajos para suavizar el ruido
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, audioCtx.currentTime);

  motorGain = audioCtx.createGain();
  noiseGain = audioCtx.createGain();

  motorGain.gain.setValueAtTime(0, audioCtx.currentTime);
  noiseGain.gain.setValueAtTime(0, audioCtx.currentTime);

  motorOsc.connect(motorGain);
  motorGain.connect(audioCtx.destination);

  noiseNode.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  motorOsc.start();
  noiseNode.start();
}

function updateAudio() {
  if (!audioCtx) return;
  
  if (state.speed === 0) {
    motorGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
  } else {
    // Escalar tono según velocidad (0 a 5)
    const baseFreq = 40 + state.speed * 25;
    motorOsc.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.1);
    
    const motorVol = 0.05 + (state.speed / 5) * 0.15;
    const noiseVol = (state.speed / 5) * 0.1;
    
    motorGain.gain.setTargetAtTime(motorVol, audioCtx.currentTime, 0.05);
    noiseGain.gain.setTargetAtTime(noiseVol, audioCtx.currentTime, 0.05);
  }
}

// --- CLASE PARA INGREDIENTES / PARTÍCULAS EN CANVAS ---
class IngredientParticle {
  constructor(x, y, color, name) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name;
    this.size = name === 'Hielo' ? 18 : 14;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = Math.random() * 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.1;
  }

  update(speed, jarBottomY) {
    if (speed > 0) {
      // Movimiento rotatorio (Vórtice)
      const centerX = canvas.width / 2;
      const dx = this.x - centerX;
      const dist = Math.abs(dx);
      
      this.vx += (dx > 0 ? -1 : 1) * (speed * 0.2);
      this.vy = (Math.random() - 0.5) * speed * 2;
      
      // Elevación por el vórtice
      if (dist < 40) {
        this.vy -= speed * 0.8;
      }

      this.rotation += this.vRot * speed;
      
      // Desintegración
      if (state.blendProgress < 1) {
        this.size = Math.max(0, this.size - 0.005 * speed);
      }
    } else {
      // Gravedad si está apagada
      if (this.y < jarBottomY - this.size) {
        this.vy += 0.3;
      } else {
        this.vy = 0;
        this.vx *= 0.8;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Limites de las paredes de la jarra
    const margin = 20;
    if (this.x < margin) this.x = margin;
    if (this.x > canvas.width - margin) this.x = canvas.width - margin;
  }

  draw() {
    if (this.size <= 0.5) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    
    if (this.name === 'Hielo') {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- MÉTODOS DE LA MEZCLA ---
function addIngredient(colorHex, name) {
  if (state.liquidLevel >= 90) return;

  const rgb = hexToRgb(colorHex);
  
  // Recalcular color resultante
  if (state.ingredients.length === 0) {
    state.color = { ...rgb, a: 0.7 };
  } else {
    state.color.r = Math.round((state.color.r + rgb.r) / 2);
    state.color.g = Math.round((state.color.g + rgb.g) / 2);
    state.color.b = Math.round((state.color.b + rgb.b) / 2);
    state.color.a = Math.min(0.95, state.color.a + 0.05);
  }

  state.ingredients.push({ name, color: colorHex });
  state.liquidLevel = Math.min(90, state.liquidLevel + 12);

  // Crear partícula física en el Canvas
  const spawnX = canvas.width / 2 + (Math.random() - 0.5) * 60;
  state.particles.push(new IngredientParticle(spawnX, 50, colorHex, name));

  updateUI();
}

function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function setSpeed(spd) {
  state.speed = parseInt(spd);
  state.isBlending = state.speed > 0;
  
  // Cambiar clases de vibración
  blenderWrapper.className = 'blender-wrapper';
  if (state.speed > 0) {
    blenderWrapper.classList.add(`vibrating-${state.speed}`);
  }

  speedKnob.value = state.speed;
  speedReadout.innerText = state.speed === 0 ? 'OFF' : `Nivel ${state.speed}`;
  
  if (!state.mode) {
    lcdStatus.innerText = state.speed > 0 ? `MANUAL - L${state.speed}` : 'STANDBY';
  }

  initAudio();
  updateAudio();
}

function stopAll() {
  setSpeed(0);
  state.mode = null;
  clearInterval(timerInterval);
  clearInterval(modeInterval);
  modeBtns.forEach(btn => btn.classList.remove('active'));
  lcdStatus.innerText = 'STANDBY';
  lcdTimer.innerText = '00:00';
}

// --- PROGRAMAS AUTOMÁTICOS ---
function runMode(modeName) {
  stopAll();
  state.mode = modeName;
  
  const modeBtn = document.querySelector(`[data-mode="${modeName}"]`);
  if (modeBtn) modeBtn.classList.add('active');

  let duration = 10; // segundos por defecto
  
  if (modeName === 'smoothie') {
    lcdStatus.innerText = 'PROG: SMOOTHIE';
    duration = 15;
    runSmoothieRoutine();
  } else if (modeName === 'ice') {
    lcdStatus.innerText = 'PROG: HIELO';
    duration = 8;
    runIceRoutine();
  } else if (modeName === 'soup') {
    lcdStatus.innerText = 'PROG: SOPA';
    duration = 20;
    setSpeed(4);
  } else if (modeName === 'clean') {
    lcdStatus.innerText = 'PROG: LAVAR';
    duration = 6;
    setSpeed(3);
  }

  state.timer = duration;
  lcdTimer.innerText = `00:${duration < 10 ? '0' : ''}${duration}`;

  timerInterval = setInterval(() => {
    state.timer--;
    lcdTimer.innerText = `00:${state.timer < 10 ? '0' : ''}${state.timer}`;
    
    if (state.timer <= 0) {
      stopAll();
      lcdStatus.innerText = 'COMPLETADO';
    }
  }, 1000);
}

function runSmoothieRoutine() {
  let step = 0;
  setSpeed(2);
  modeInterval = setInterval(() => {
    step++;
    if (step === 3) setSpeed(4);
    if (step === 8) setSpeed(5);
    if (step === 12) setSpeed(2);
  }, 1000);
}

function runIceRoutine() {
  let pulseCount = 0;
  modeInterval = setInterval(() => {
    if (pulseCount % 2 === 0) setSpeed(5);
    else setSpeed(0);
    pulseCount++;
  }, 600);
}

// --- BUCLE DE RENDERIZADO Y FÍSICA (CANVAS) ---
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const jarBottom = canvas.height - 20;
  const maxLiquidHeight = 240;
  const currentLiquidHeight = (state.liquidLevel / 100) * maxLiquidHeight;
  const liquidTop = jarBottom - currentLiquidHeight;

  // 1. Dibujar Líquido Base
  if (state.liquidLevel > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, ${state.color.a})`;
    
    ctx.beginPath();
    ctx.moveTo(20, jarBottom);

    // Efecto de Vórtice / Turbulencia en la superficie
    if (state.speed > 0) {
      const vortexDepth = state.speed * 8;
      const center = canvas.width / 2;

      ctx.lineTo(20, liquidTop);
      ctx.quadraticCurveTo(center, liquidTop + vortexDepth, canvas.width - 20, liquidTop);
      ctx.lineTo(canvas.width - 20, jarBottom);
    } else {
      ctx.lineTo(20, liquidTop);
      ctx.lineTo(canvas.width - 20, liquidTop);
      ctx.lineTo(canvas.width - 20, jarBottom);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 2. Actualizar y Dibujar Partículas de Ingredientes
  state.particles.forEach(p => {
    p.update(state.speed, jarBottom);
    p.draw();
  });

  // 3. Progresar Homogeneización
  if (state.speed > 0 && state.ingredients.length > 0) {
    state.blendProgress = Math.min(1, state.blendProgress + 0.001 * state.speed);
  }

  // 4. Animación Visual de Cuchillas
  if (state.speed > 0) {
    bladeAngle += state.speed * 0.2;
    blade1.style.transform = `rotate(${bladeAngle}rad)`;
    blade2.style.transform = `rotate(${bladeAngle + Math.PI / 2}rad)`;
  }

  requestAnimationFrame(render);
}

// --- EVENTOS E INTERFAZ ---
function updateUI() {
  btnPour.disabled = state.liquidLevel === 0;
}

speedKnob.addEventListener('input', (e) => {
  state.mode = null;
  clearInterval(timerInterval);
  clearInterval(modeInterval);
  modeBtns.forEach(btn => btn.classList.remove('active'));
  setSpeed(e.target.value);
});

// Botón PULSE
btnPulse.addEventListener('mousedown', () => { setSpeed(5); lcdStatus.innerText = 'PULSE'; });
btnPulse.addEventListener('mouseup', () => setSpeed(0));
btnPulse.addEventListener('mouseleave', () => setSpeed(0));

btnStop.addEventListener('click', stopAll);

// Botones de Ingredientes
document.querySelectorAll('.ing-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    addIngredient(btn.dataset.color, btn.dataset.name);
  });
});

// Botones de Modos Automáticos
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    runMode(btn.dataset.mode);
  });
});

// Recetas Rápidas
document.getElementById('presetBerry').addEventListener('click', () => {
  stopAll();
  btnClear.click();
  addIngredient('#ff4757', 'Fresa');
  addIngredient('#8e44ad', 'Mora');
  addIngredient('#ffffff', 'Leche');
  addIngredient('#70a1ff', 'Hielo');
});

document.getElementById('presetGreen').addEventListener('click', () => {
  stopAll();
  btnClear.click();
  addIngredient('#2ed573', 'Espinaca');
  addIngredient('#ffa502', 'Naranja');
  addIngredient('#1e90ff', 'Agua');
  addIngredient('#70a1ff', 'Hielo');
});

// Vaciar Licuadora
btnClear.addEventListener('click', () => {
  stopAll();
  state.liquidLevel = 0;
  state.blendProgress = 0;
  state.ingredients = [];
  state.particles = [];
  glassFill.style.height = '0%';
  updateUI();
});

// Servir en Vaso
btnPour.addEventListener('click', () => {
  if (state.liquidLevel === 0) return;

  const currentFill = parseFloat(glassFill.style.height) || 0;
  const newFill = Math.min(100, currentFill + 40);
  
  glassFill.style.height = `${newFill}%`;
  glassFill.style.backgroundColor = `rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, 0.9)`;

  // Reducir nivel de la licuadora
  state.liquidLevel = Math.max(0, state.liquidLevel - 30);
  if (state.liquidLevel === 0) {
    state.particles = [];
  }
  updateUI();
});

// Iniciar bucle de renderizado
requestAnimationFrame(render);