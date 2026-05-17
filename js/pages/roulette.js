/**
 * pages/roulette.js — Módulo de Ruleta Progresiva para la Main List
 */

/* ── State de la partida ────────────────────────────────────── */
let gameState = {
  active: false,
  currentPercent: 1,
  lives: 3,
  skips: 2,
  history: [],
  currentLevel: null,
  pool: [] // Niveles cargados de la Main List
};

/* ── Función Principal de Renderizado (Nombrada para app.js) ── */
export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Preparando los engranajes de la ruleta...</p>
    </div>
  `;

  try {
    // 1. Obtener de forma segura la lista de niveles desde la Main List
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/(js\/pages|pages)\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');
    
    const listResponse = await fetch(`${rootUrl}/data/mainlist/_list.json`);
    if (!listResponse.ok) throw new Error("No se pudo obtener el índice de la Main List.");
    const levelFiles = await listResponse.json();

    // Traemos todos los archivos JSON de los niveles en paralelo
    const levelPromises = levelFiles.map(async (file) => {
      try {
        const res = await fetch(`${rootUrl}/data/mainlist/${file.trim()}.json`);
        return res.ok ? await res.json() : null;
      } catch { return null; }
    });
    
    const loadedLevels = await Promise.all(levelPromises);
    // Filtramos nulos y ordenamos por posición real en la lista (del revés para arrancar por los "más fáciles")
    gameState.pool = loadedLevels.filter(l => l !== null).sort((a, b) => b.position - a.position);

    if (gameState.pool.length === 0) {
      container.innerHTML = `<div class="state-message"><p>No hay suficientes niveles en la Main List para jugar.</p></div>`;
      return;
    }

    // Intentar recuperar partida guardada en localStorage
    const saved = localStorage.getItem('gd_roulette_save');
    if (saved) {
      try { gameState = { ...gameState, ...JSON.parse(saved) }; } catch (e) { console.error(e); }
    }

    // 2. Pintar la interfaz base
    updateUI(container);

  } catch (err) {
    container.innerHTML = `
      <div class="state-message" style="color: #ff4545;">
        <p style="font-family: var(--font-ui); font-size: 1.2rem; font-weight: bold;">⚠️ Error al inicializar la ruleta</p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${err.message}</p>
      </div>`;
  }
}

/* ── Actualizar la interfaz gráfica ─────────────────────────── */
function updateUI(container) {
  if (!gameState.active) {
    // Pantalla de Inicio / Menú Principal
    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <h1 class="page-title"><span>Progressive</span> Roulette</h1>
        <p class="page-subtitle">¿Hasta qué porcentaje podés sobrevivir escalando la Main List?</p>
        <div class="page-title-bar"></div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 600px; margin: 40px auto; text-align: center;">
        <div style="background: var(--bg-surface); padding: 32px; border: 1px solid var(--border-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
          <span style="font-size: 3rem;">🎰</span>
          <h2 style="font-family: var(--font-ui); margin: 16px 0; color: var(--accent-primary);">Reglas del Desafío</h2>
          <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6; text-align: left; margin-bottom: 24px;">
            • Empezás en el nivel más bajo de la lista requiriendo un <strong>1%</strong>.<br>
            • Cada acierto te sube la dificultad y te pide <strong>1% más</strong> en el siguiente nivel aleatorio.<br>
            • Tenés <strong>3 vidas</strong> en total. Perder una vida te permite volver a tirar en ese mismo porcentaje.<br>
            • Disponés de <strong>2 Skips</strong> para pasar de un nivel que no te guste.
          </p>
          
          <button id="start-roulette-btn" class="topbar-btn-cta" style="width: 100%; height: 48px; font-size: 1.1rem; box-shadow: var(--shadow-accent);">
            ${gameState.currentPercent > 1 ? 'Continuar Partida Anterior' : 'Iniciar Desafío'}
          </button>
          
          ${gameState.currentPercent > 1 ? `
            <button id="reset-roulette-btn" style="background: rgba(255,69,69,0.1); border: 1px solid rgba(255,69,69,0.3); color: #ff4545; width: 100%; margin-top: 12px; padding: 10px; border-radius: var(--radius-md); font-family: var(--font-ui); font-size: 0.85rem;">
              Reiniciar Progreso
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.querySelector('#start-roulette-btn')?.addEventListener('click', () => {
      gameState.active = true;
      if (!gameState.currentLevel) nextRoll();
      saveGame();
      updateUI(container);
    });

    container.querySelector('#reset-roulette-btn')?.addEventListener('click', () => {
      if(confirm("¿Seguro que querés borrar tu progreso y empezar de cero?")) {
        localStorage.removeItem('gd_roulette_save');
        gameState.currentPercent = 1;
        gameState.lives = 3;
        gameState.skips = 2;
        gameState.history = [];
        gameState.currentLevel = null;
        updateUI(container);
      }
    });

  } else {
    // Interfaz de Juego Activo
    const lvl = gameState.currentLevel;
    const thumbnail = lvl.thumbnail || 'https://img.youtube.com/vi/placeholder/mqdefault.jpg';
    
    // Renderizamos los corazones visuales de vidas
    const hearts = Array(3).fill(0).map((_, i) => i < gameState.lives ? '❤️' : '🖤').join(' ');

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;" class="animate-fadeIn">
        
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-card); padding: 16px var(--space-lg); border-radius: var(--radius-lg); margin-bottom: 24px;">
          <div>
            <span style="color: var(--text-muted); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase;">Objetivo Actual</span>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: var(--accent-primary); text-shadow: 0 0 10px var(--accent-glow);">${gameState.currentPercent}%</div>
          </div>
          <div style="text-align: center;">
            <span style="color: var(--text-muted); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase;">Vidas</span>
            <div style="font-size: 1.2rem; margin-top: 4px;">${hearts}</div>
          </div>
          <div style="text-align: right;">
            <span style="color: var(--text-muted); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase;">Skips Libres</span>
            <div style="font-family: var(--font-ui); font-size: 1.1rem; color: var(--accent-blue); font-weight: bold;">${gameState.skips} / 2</div>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 2px solid var(--border-card); border-radius: var(--radius-lg); padding: 24px; text-align: center; box-shadow: var(--shadow-md); margin-bottom: 24px; position: relative;">
          <span style="position: absolute; top: 16px; left: 16px; background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: var(--radius-sm); font-family: var(--font-ui); font-size: 0.8rem; color: var(--text-secondary);">
            Top #${lvl.position}
          </span>
          
          <div style="width: 100%; max-width: 360px; aspect-ratio: 16/9; margin: 12px auto; border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);">
            <img src="${thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail">
          </div>

          <h2 style="font-family: var(--font-ui); font-size: 1.8rem; margin: 12px 0 4px; letter-spacing: 0.05em;">${escapeHTML(lvl.name)}</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 24px;">Por <strong>${escapeHTML(lvl.author)}</strong></p>
          
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button id="btn-pass" class="topbar-btn-cta" style="height: 42px; padding: 0 24px; font-size: 0.95rem; background: var(--accent-primary); color: #080b12;">
              ¡Lo Conseguí! (Pasa al ${gameState.currentPercent + 1}%)
            </button>
            
            <button id="btn-fail" style="background: rgba(255,69,69,0.15); border: 1px solid #ff4545; color: #ff4545; height: 42px; padding: 0 var(--space-md); border-radius: var(--radius-md); font-family: var(--font-ui); font-weight: bold; font-size: 0.85rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,69,69,0.25)'" onmouseout="this.style.background='rgba(255,69,69,0.15)'">
              Fallé / Morí
            </button>

            <button id="btn-skip" ${gameState.skips <= 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="background: rgba(59,130,246,0.15); border: 1px solid var(--accent-blue); color: var(--accent-blue); height: 42px; padding: 0 var(--space-md); border-radius: var(--radius-md); font-family: var(--font-ui); font-weight: bold; font-size: 0.85rem; transition: background 0.2s;" onmouseover="if(!this.disabled) this.style.background='rgba(59,130,246,0.25)'" onmouseout="if(!this.disabled) this.style.background='rgba(59,130,246,0.15)'">
              Usar Skip 🌀
            </button>
          </div>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-card); border-radius: var(--radius-lg); padding: 16px;">
          <h3 style="font-family: var(--font-ui); font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px;">Camino Recorrido</h3>
          <div id="roulette-history-box" style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto; padding-right: 4px;">
            ${gameState.history.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.9rem;">Acá se guardará tu historial de saltos y logros.</p>' : ''}
            ${gameState.history.map(item => `
              <div style="display: flex; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.88rem; border-left: 3px solid ${item.type === 'pass' ? 'var(--accent-primary)' : item.type === 'skip' ? 'var(--accent-blue)' : '#ff4545'}">
                <span><strong>${item.percent}%</strong> — ${escapeHTML(item.name)}</span>
                <span style="color: var(--text-muted); font-family: var(--font-ui); font-size: 0.75rem; text-transform: uppercase;">${item.type}</span>
              </div>
            `).reverse().join('')}
          </div>
        </div>

        <button id="btn-exit-roulette" style="margin-top: 20px; color: var(--text-muted); font-size: 0.85rem; background: none; border: none; cursor: pointer; text-decoration: underline;">
          ← Volver al menú de la ruleta (Guarda partida)
        </button>
      </div>
    `;

    // Asignación de triggers de control de juego
    container.querySelector('#btn-pass')?.addEventListener('click', () => {
      gameState.history.push({ percent: gameState.currentPercent, name: lvl.name, type: 'pass' });
      gameState.currentPercent++;
      if (gameState.currentPercent > 100) {
        alert("💥 ¡SOS DIOS! Completaste el desafío definitivo del 1% al 100%. Historial guardado.");
        resetGame();
      } else {
        nextRoll();
      }
      saveGame();
      updateUI(container);
    });

    container.querySelector('#btn-fail')?.addEventListener('click', () => {
      gameState.history.push({ percent: gameState.currentPercent, name: lvl.name, type: 'fail' });
      gameState.lives--;
      if (gameState.lives <= 0) {
        alert(`💀 ¡Game Over! Te quedaste sin vidas en el ${gameState.currentPercent}%. Buen intento.`);
        resetGame();
      } else {
        nextRoll(); // Cambia de nivel para el mismo porcentaje
      }
      saveGame();
      updateUI(container);
    });

    container.querySelector('#btn-skip')?.addEventListener('click', () => {
      if (gameState.skips > 0) {
        gameState.history.push({ percent: gameState.currentPercent, name: lvl.name, type: 'skip' });
        gameState.skips--;
        nextRoll();
        saveGame();
        updateUI(container);
      }
    });

    container.querySelector('#btn-exit-roulette')?.addEventListener('click', () => {
      gameState.active = false;
      saveGame();
      updateUI(container);
    });
  }
}

/* ── Buscar Siguiente Nivel Aleatorio Válido ────────────────── */
function nextRoll() {
  const unrolled = gameState.pool.filter(level => {
    return !gameState.history.some(h => h.name === level.name && h.percent === gameState.currentPercent);
  });

  const sources = unrolled.length > 0 ? unrolled : gameState.pool;
  const randomIndex = Math.floor(Math.random() * sources.length);
  gameState.currentLevel = sources[randomIndex];
}

/* ── Helpers del LocalStorage y Sanitizado ──────────────────── */
function saveGame() {
  localStorage.setItem('gd_roulette_save', JSON.stringify({
    currentPercent: gameState.currentPercent,
    lives: gameState.lives,
    skips: gameState.skips,
    history: gameState.history,
    currentLevel: gameState.currentLevel
  }));
}

/* ── Resetear Juego ─────────────────────────────────────────── */
function resetGame() {
  localStorage.removeItem('gd_roulette_save');
  gameState.active = false;
  gameState.currentPercent = 1;
  gameState.lives = 3;
  gameState.skips = 2;
  gameState.history = [];
  gameState.currentLevel = null;
}

/* ── Escape HTML Helper ─────────────────────────────────────── */
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
