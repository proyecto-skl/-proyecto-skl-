/**
 * pages/roulette.js — Módulo de Ruleta Progresiva Avanzada
 */

/* ── State de la partida ────────────────────────────────────── */
let gameState = {
  active: false,
  currentPercent: 1,
  lives: 3,
  skips: 3, // Ajustado a 3 skips por petición del usuario
  history: [],
  currentLevel: null,
  pool: [],
  gameOver: false // Controla si se despliega el modal de fin de partida
};

/* ── FUNCIÓN PRINCIPAL DE RENDERIZADO ───────────────────────── */
export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Preparando los engranajes de la ruleta...</p>
    </div>
  `;

  try {
    // 1. Cargar niveles desde la carpeta local data/levels/
    const listResponse = await fetch('data/levels/_list.json');
    if (!listResponse.ok) throw new Error("No se pudo obtener el índice de niveles.");
    const levelFiles = await listResponse.json();

    const levelPromises = levelFiles.map(async (file) => {
      try {
        const res = await fetch(`data/levels/${file.trim()}.json`);
        return res.ok ? await res.json() : null;
      } catch { return null; }
    });
    
    const loadedLevels = await Promise.all(levelPromises);
    
    // Filtrar válidos y ordenar de menor a mayor dificultad percibida (posiciones más altas a más bajas)
    gameState.pool = loadedLevels
      .filter(l => l !== null)
      .sort((a, b) => b.position - a.position);

    if (gameState.pool.length === 0) {
      container.innerHTML = `<div class="state-message"><p>No hay niveles en data/levels/ para jugar.</p></div>`;
      return;
    }

    // Recuperar partida del LocalStorage
    const saved = localStorage.getItem('gd_roulette_save');
    if (saved) {
      try { gameState = { ...gameState, ...JSON.parse(saved) }; } catch (e) { console.error(e); }
    }

    // 2. Pintar interfaz
    updateUI(container);

  } catch (err) {
    container.innerHTML = `
      <div class="state-message" style="color: #ff4545;">
        <p style="font-family: var(--font-ui); font-size: 1.2rem; font-weight: bold;">⚠️ Error al inicializar la ruleta</p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${err.message}</p>
      </div>`;
  }
}

/* ── Renderizado y Lógica de Interfaz ────────────────────────── */
function updateUI(container) {
  if (!gameState.active) {
    // MENÚ PRINCIPAL DE LA RULETA
    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <h1 class="page-title"><span>Progressive</span> Roulette</h1>
        <p class="page-subtitle">Configurá tu porcentaje récord y escalá la lista</p>
        <div class="page-title-bar"></div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 600px; margin: 40px auto; text-align: center;">
        <div style="background: var(--bg-surface); padding: 32px; border: 1px solid var(--border-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
          <span style="font-size: 3rem;">🎰</span>
          <h2 style="font-family: var(--font-ui); margin: 16px 0; color: var(--accent-primary);">Reglas del Desafío</h2>
          <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6; text-align: left; margin-bottom: 24px;">
            • Arrancás necesitando al menos un <strong>1%</strong>.<br>
            • Si lográs un porcentaje mayor (ej: 12%), lo ingresás y avanzarás directamente al <strong>13%</strong> en el próximo nivel.<br>
            • Tenés <strong>3 vidas</strong> y disponés de <strong>3 Skips</strong> mágicos para esquivar niveles imposibles.
          </p>
          
          <button id="start-roulette-btn" class="topbar-btn-cta" style="width: 100%; height: 48px; font-size: 1.1rem; box-shadow: var(--shadow-accent);">
            ${gameState.currentPercent > 1 ? 'Continuar Desafío' : 'Iniciar Desafío'}
          </button>
          
          ${gameState.currentPercent > 1 ? `
            <button id="reset-roulette-btn" style="background: rgba(255,69,69,0.1); border: 1px solid rgba(255,69,69,0.3); color: #ff4545; width: 100%; margin-top: 12px; padding: 10px; border-radius: var(--radius-md); font-family: var(--font-ui); font-size: 0.85rem;">
              Reiniciar Todo el Progreso
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.querySelector('#start-roulette-btn')?.addEventListener('click', () => {
      gameState.active = true;
      gameState.gameOver = false;
      if (!gameState.currentLevel) nextRoll();
      saveGame();
      updateUI(container);
    });

    container.querySelector('#reset-roulette-btn')?.addEventListener('click', () => {
      if (confirm("¿Estás seguro de que querés borrar tu progreso actual?")) {
        resetGame();
        updateUI(container);
      }
    });

  } else {
    // INTERFAZ DE JUEGO ACTIVO
    const lvl = gameState.currentLevel;
    const thumbnail = lvl.thumbnail || 'https://img.youtube.com/vi/placeholder/mqdefault.jpg';
    const hearts = Array(3).fill(0).map((_, i) => i < gameState.lives ? '❤️' : '🖤').join(' ');

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; position: relative;" class="animate-fadeIn">
        
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-card); padding: 16px var(--space-lg); border-radius: var(--radius-lg); margin-bottom: 24px;">
          <div>
            <span style="color: var(--text-muted); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase;">Requisito Mínimo</span>
            <div style="font-family: var(--font-display); font-size: 1.8rem; color: var(--accent-primary); text-shadow: 0 0 10px var(--accent-glow);">${gameState.currentPercent}%</div>
          </div>
          <div style="text-align: center;">
            <span style="color: var(--text-muted); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase;">Vidas Restantes</span>
            <div style="font-size: 1.2rem; margin-top: 4px;">${hearts}</div>
          </div>
          <div style="text-align: right;">
            <span style="color: var(--text-muted); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase;">Skips Disponibles</span>
            <div style="font-family: var(--font-ui); font-size: 1.1rem; color: var(--accent-blue); font-weight: bold;">${gameState.skips} / 3</div>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 2px solid var(--border-card); border-radius: var(--radius-lg); padding: 24px; text-align: center; box-shadow: var(--shadow-md); margin-bottom: 24px; position: relative;">
          <span style="position: absolute; top: 16px; left: 16px; background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: var(--radius-sm); font-family: var(--font-ui); font-size: 0.8rem; color: var(--text-secondary);">
            Top #${lvl.position || '??'}
          </span>
          
          <div style="width: 100%; max-width: 360px; aspect-ratio: 16/9; margin: 12px auto; border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);">
            <img src="${thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail">
          </div>

          <h2 style="font-family: var(--font-ui); font-size: 1.8rem; margin: 12px 0 4px; letter-spacing: 0.05em;">${escapeHTML(lvl.name)}</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 24px;">Por <strong>${escapeHTML(lvl.author || lvl.publisher)}</strong></p>
          
          <div style="background: rgba(0,0,0,0.2); max-width: 420px; margin: 0 auto 24px; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
            <label for="custom-percent" style="display: block; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
              ¿Qué porcentaje lograste? (Mínimo requerido: ${gameState.currentPercent}%)
            </label>
            <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
              <input type="number" id="custom-percent" min="${gameState.currentPercent}" max="100" value="${gameState.currentPercent}" 
                     style="width: 80px; height: 40px; text-align: center; font-size: 1.2rem; font-weight: bold; background: var(--bg-base); color: var(--text-primary); border: 1px solid var(--border-card); border-radius: var(--radius-sm); font-family: var(--font-display);">
              <span style="font-size: 1.2rem; font-weight: bold; color: var(--text-muted);">%</span>
              <button id="btn-pass" class="topbar-btn-cta" style="height: 40px; padding: 0 16px; font-size: 0.9rem; margin-left: 8px;">
                Confirmar Marca
              </button>
            </div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="btn-fail" style="background: rgba(255,69,69,0.1); border: 1px solid #ff4545; color: #ff4545; height: 38px; padding: 0 16px; border-radius: var(--radius-md); font-family: var(--font-ui); font-weight: bold; font-size: 0.85rem; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,69,69,0.2)'" onmouseout="this.style.background='rgba(255,69,69,0.1)'">
              Morí sin llegar al objetivo 💀
            </button>

            <button id="btn-skip" ${gameState.skips <= 0 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : 'style="cursor:pointer;"'} style="background: rgba(59,130,246,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); height: 38px; padding: 0 16px; border-radius: var(--radius-md); font-family: var(--font-ui); font-weight: bold; font-size: 0.85rem; transition: background 0.2s;" onmouseover="if(!this.disabled) this.style.background='rgba(59,130,246,0.2)'" onmouseout="if(!this.disabled) this.style.background='rgba(59,130,246,0.1)'">
              Pasar Nivel (Skip 🌀)
            </button>
          </div>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-card); border-radius: var(--radius-lg); padding: 16px;">
          <h3 style="font-family: var(--font-ui); font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px;">Camino Recorrido</h3>
          <div id="roulette-history-box" style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto;">
            ${gameState.history.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.9rem; padding: 4px;">Acá se guardará tu progreso.</p>' : ''}
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

        ${gameState.gameOver ? `
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(8, 11, 18, 0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: var(--radius-lg); border: 2px solid #ff4545; z-index: 100;" class="animate-fadeIn">
            <span style="font-size: 4rem; margin-bottom: 8px;">💀</span>
            <h2 style="font-family: var(--font-ui); font-size: 2.2rem; color: #ff4545; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 2px;">¡Fin del Juego!</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 1.05rem;">Te quedaste sin vidas en el objetivo del <strong>${gameState.currentPercent}%</strong></p>
            
            <div style="display: flex; gap: 16px;">
              <button id="modal-reset-btn" class="topbar-btn-cta" style="background: #ff4545; border: 1px solid #ff4545; color: #000; padding: 12px 32px; font-size: 1rem; height: auto;">
                Intentar de Nuevo
              </button>
              <button id="modal-menu-btn" style="background: transparent; border: 1px solid var(--border-card); color: var(--text-primary); padding: 12px 24px; border-radius: var(--radius-md); font-family: var(--font-ui); cursor: pointer;">
                Salir al Menú
              </button>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    // ── GESTIÓN DE EVENTOS DE BOTONES ──

    // Evento: Confirmar Porcentaje Realizado (Custom)
    container.querySelector('#btn-pass')?.addEventListener('click', () => {
      const inputVal = parseInt(container.querySelector('#custom-percent')?.value || 0, 10);
      
      if (isNaN(inputVal) || inputVal < gameState.currentPercent || inputVal > 100) {
        alert(`Por favor, poné un número válido entre ${gameState.currentPercent}% y 100%`);
        return;
      }

      // Añadir marca al historial de saltos
      gameState.history.push({ percent: inputVal, name: lvl.name, type: 'pass' });
      
      // Siguiente objetivo es el porcentaje ingresado + 1
      gameState.currentPercent = inputVal + 1;

      if (gameState.currentPercent > 100) {
        alert("💥 ¡SOS UNA LEYENDA! Completaste el desafío definitivo llegando al 100%.");
        resetGame();
      } else {
        nextRoll();
      }
      saveGame();
      updateUI(container);
    });

    // Evento: Fallar intento (Pierde Vida)
    container.querySelector('#btn-fail')?.addEventListener('click', () => {
      gameState.history.push({ percent: gameState.currentPercent, name: lvl.name, type: 'fail' });
      gameState.lives--;

      if (gameState.lives <= 0) {
        gameState.gameOver = true; // Activa el modal personalizado en la UI
      } else {
        nextRoll(); // Cambia el nivel para volver a tirar en el mismo porcentaje
      }
      saveGame();
      updateUI(container);
    });

    // Evento: Saltar nivel actual (Skip)
    container.querySelector('#btn-skip')?.addEventListener('click', () => {
      if (gameState.skips > 0) {
        gameState.history.push({ percent: gameState.currentPercent, name: lvl.name, type: 'skip' });
        gameState.skips--;
        nextRoll();
        saveGame();
        updateUI(container);
      }
    });

    // Evento: Volver atrás temporalmente
    container.querySelector('#btn-exit-roulette')?.addEventListener('click', () => {
      gameState.active = false;
      saveGame();
      updateUI(container);
    });

    // Triggers del Modal de Game Over
    container.querySelector('#modal-reset-btn')?.addEventListener('click', () => {
      resetGame();
      gameState.active = true;
      nextRoll();
      saveGame();
      updateUI(container);
    });

    container.querySelector('#modal-menu-btn')?.addEventListener('click', () => {
      resetGame();
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

/* ── Métodos del LocalStorage e Inicialización ───────────────── */
function saveGame() {
  localStorage.setItem('gd_roulette_save', JSON.stringify({
    currentPercent: gameState.currentPercent,
    lives: gameState.lives,
    skips: gameState.skips,
    history: gameState.history,
    currentLevel: gameState.currentLevel,
    active: gameState.active,
    gameOver: gameState.gameOver
  }));
}

function resetGame() {
  localStorage.removeItem('gd_roulette_save');
  gameState.active = false;
  gameState.gameOver = false;
  gameState.currentPercent = 1;
  gameState.lives = 3;
  gameState.skips = 3; // Mantiene el límite reajustado a 3
  gameState.history = [];
  gameState.currentLevel = null;
}

/* ── Sanitizado de Strings ───────────────────────────────────── */
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
