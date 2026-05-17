/**
 * pages/leaderboard.js — Módulo de la Tabla de Posiciones Dinámica con Perfiles de Jugador
 * Escanea récords de niveles y desafíos, excluyendo creadores/verificadores.
 */

export async function render(container) {
  // Inyectamos los estilos visuales para la ventana de perfil del jugador
  injectPlayerModalStyles();

  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Escaneando récords y armando perfiles en tiempo real...</p>
    </div>
  `;

  try {
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/js\/pages\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');

    // Mapa global de jugadores
    const playerMap = {};

    // Helper para registrar un récord de forma limpia y agrupar por jugador
    function registerRecord(playerName, itemTitle, percent, pointsGained, isChallenge = false) {
      if (!playerName || playerName.trim() === '' || playerName.toLowerCase() === 'desconocido') return;
      
      const nameTrimmed = playerName.trim();
      const key = nameTrimmed.toLowerCase();

      if (!playerMap[key]) {
        playerMap[key] = {
          name: nameTrimmed,
          totalPoints: 0,
          completionsCount: 0,
          mainListRecords: [], // Para guardar qué niveles jugó
          challengeRecords: []  // Para guardar qué challenges jugó
        };
      }

      const player = playerMap[key];
      const pct = parseInt(percent) || 100;

      if (isChallenge) {
        player.totalPoints += Math.round(pointsGained);
        if (pct === 100) player.completionsCount++;
        player.challengeRecords.push({
          title: itemTitle,
          percent: pct,
          points: Math.round(pointsGained)
        });
      } else {
        player.totalPoints += Math.round(pointsGained);
        if (pct === 100) player.completionsCount++;
        player.mainListRecords.push({
          title: itemTitle,
          percent: pct,
          points: Math.round(pointsGained)
        });
      }
    }

    /* ── A. ESCANEO DE NIVELES PRINCIPALES ── */
    try {
      const levelsListRes = await fetch(`${rootUrl}/data/levels/_list.json`);
      if (levelsListRes.ok) {
        const levelFiles = await levelsListRes.json();
        
        await Promise.all(levelFiles.map(async (fileName, index) => {
          try {
            const res = await fetch(`${rootUrl}/data/levels/${fileName.trim()}.json`);
            if (!res.ok) return;
            const levelData = await res.json();

            // Puntos máximos del nivel según su puesto
            const levelPoints = Math.max(100, 1000 - (index * 5));
            const levelName = levelData.name || 'Sin nombre';

            // NO REGISTRAMOS VERIFICADORES NI CREADORES (Petición del usuario)
            if (levelData.records && Array.isArray(levelData.records)) {
              levelData.records.forEach(rec => {
                const pct = parseInt(rec.percent) || 0;
                if (pct <= 0) return;
                const pointsGained = (pct / 100) * levelPoints;
                registerRecord(rec.user, levelName, pct, pointsGained, false);
              });
            }
          } catch (e) {
            console.error(`Error procesando nivel: ${fileName}`, e);
          }
        }));
      }
    } catch (err) {
      console.warn("Error en carpeta de niveles:", err);
    }

    /* ── B. ESCANEO DE DESAFÍOS ── */
    try {
      const chalListRes = await fetch(`${rootUrl}/data/challenges/_list.json`);
      if (chalListRes.ok) {
        const challengeFiles = await chalListRes.json();

        await Promise.all(challengeFiles.map(async (fileName) => {
          try {
            const res = await fetch(`${rootUrl}/data/challenges/${fileName.trim()}.json`);
            if (!res.ok) return;
            const chalData = await res.json();

            const chalPoints = chalData.points || 50;
            const chalName = chalData.name || 'Challenge';

            // Solo registramos los récords de jugadores
            if (chalData.records && Array.isArray(chalData.records)) {
              chalData.records.forEach(rec => {
                const pct = parseInt(rec.percent) || 0;
                if (pct <= 0) return;
                const pointsGained = (pct / 100) * chalPoints;
                registerRecord(rec.user, chalName, pct, pointsGained, true);
              });
            }
          } catch (e) {
            console.error(`Error procesando challenge: ${fileName}`, e);
          }
        }));
      }
    } catch (err) {
      console.warn("Error en carpeta de challenges:", err);
    }

    // Ordenamos de mayor a menor puntaje
    const sortedPlayers = Object.values(playerMap).sort((a, b) => b.totalPoints - a.totalPoints);

    // Asignamos el puesto en el ranking
    sortedPlayers.forEach((player, idx) => {
      player.rank = idx + 1;
    });

    if (sortedPlayers.length === 0) {
      container.innerHTML = `<p class="state-message">No hay récords válidos de jugadores para mostrar.</p>`;
      return;
    }

    // Renderizamos la estructura visual sin las regiones
    container.innerHTML = buildLeaderboardHTML(sortedPlayers);

    // ⚡ Asignamos eventos de clic para abrir la ventana de perfil detallado
    // Clic en las tarjetas del podio
    const podiumCards = container.querySelectorAll('.podium-card');
    podiumCards.forEach(card => {
      card.addEventListener('click', () => {
        const pName = card.getAttribute('data-player-name');
        const playerObj = sortedPlayers.find(p => p.name === pName);
        if (playerObj) openPlayerModal(playerObj);
      });
    });

    // Clic en las filas de la tabla
    const tableRows = container.querySelectorAll('.lb-clickable-row');
    tableRows.forEach(row => {
      row.addEventListener('click', () => {
        const pName = row.getAttribute('data-player-name');
        const playerObj = sortedPlayers.find(p => p.name === pName);
        if (playerObj) openPlayerModal(playerObj);
      });
    });

  } catch (error) {
    container.innerHTML = `
      <div class="state-message" style="color: var(--color-error, #f85149); padding: 20px;">
        <p>⚠️ Error al generar la Leaderboard: ${error.message}</p>
      </div>
    `;
  }
}

/**
 * Construye el diseño sin la columna de región
 */
function buildLeaderboardHTML(players) {
  const topPlayer = players[0];
  const podiumOrder = [];
  if (players[1]) podiumOrder.push({ p: players[1], label: '2nd' });
  if (players[0]) podiumOrder.push({ p: players[0], label: '1st' });
  if (players[2]) podiumOrder.push({ p: players[2], label: '3rd' });

  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h1 class="page-title"><span>Leader</span>board</h1>
          <p class="page-subtitle">Ranking oficial de la comunidad basado en récords válidos</p>
          <div class="page-title-bar"></div>
        </div>
      </div>
    </div>

    <div class="stats-bar" style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
      <div class="stat-pill" style="background: #111827; padding: 10px 15px; border-radius: 8px; font-size: 14px; border: 1px solid #1f2937;">
        👥 <strong>${players.length}</strong> Jugadores en el ranking
      </div>
      <div class="stat-pill" style="background: #111827; padding: 10px 15px; border-radius: 8px; font-size: 14px; border: 1px solid #1f2937;">
        🥇 Top #1 Actual: <strong style="color: #f5a623;">${topPlayer?.name ?? '—'}</strong>
      </div>
    </div>

    <div class="podium" style="display: flex; justify-content: center; align-items: flex-end; gap: 20px; margin: 40px 0; padding-bottom: 20px; border-bottom: 1px solid #1f2937;">
      ${podiumOrder.map(item => `
        <div class="podium-card placement-${item.label.toLowerCase()}" data-player-name="${item.p.name}" style="
          background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 25px 15px; text-align: center; width: 100%; max-width: 180px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3); position: relative; cursor: pointer; transition: transform 0.2s, border-color 0.2s;
          ${item.label === '1st' ? 'transform: translateY(-15px); border-color: #f5a623; min-height: 200px;' : 'min-height: 170px;'}
        ">
          <div class="podium-badge" style="
            position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
            background: ${item.label === '1st' ? '#f5a623' : item.label === '2nd' ? '#cbd5e0' : '#ed8936'};
            color: #000; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 12px;
          ">
            ${item.label === '1st' ? '👑 TOP 1' : item.label === '2nd' ? '🥈 TOP 2' : '🥉 TOP 3'}
          </div>
          <h3 style="margin: 15px 0 5px 0; color: #fff; font-size: 18px;">${escapeHTML(item.p.name)}</h3>
          <div style="font-size: 18px; font-weight: bold; color: #48bb78; margin-top: 8px;">${item.p.totalPoints} PTS</div>
          <div style="font-size: 11px; color: #718096; margin-top: 5px;">
            🔍 Click para ver detalles
          </div>
        </div>
      `).join('')}
    </div>

    <div class="table-container" style="overflow-x: auto; background: #111827; border-radius: 8px; border: 1px solid #1f2937; margin-top: 20px;">
      <table class="lb-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; color: #e2e8f0;">
        <thead>
          <tr style="background: #1f2937; color: #9ca3af;">
            <th style="padding: 15px;">Puesto</th>
            <th style="padding: 15px;">Jugador</th>
            <th style="padding: 15px;">Puntaje Total</th>
            <th style="padding: 15px;">Récords Totales</th>
          </tr>
        </thead>
        <tbody>
          ${players.map((p, index) => {
            const isTop3 = index < 3;
            return `
              <tr class="lb-row lb-clickable-row" data-player-name="${p.name}" style="border-bottom: 1px solid #1f2937; cursor: pointer; background: ${isTop3 ? 'rgba(245, 166, 35, 0.01)' : 'none'}; transition: background 0.2s;">
                <td style="padding: 15px; font-weight: bold;">
                  <span style="${index === 0 ? 'color: #f5a623;' : index === 1 ? 'color: #cbd5e0;' : index === 2 ? 'color: #ed8936;' : 'color: #718096;'}">
                    #${p.rank}
                  </span>
                </td>
                <td style="padding: 15px; font-weight: 600; color: #fff;">
                  ${escapeHTML(p.name)} <span style="font-size:11px; color:#555; font-weight:normal; margin-left:8px;">(Ver Perfil)</span>
                </td>
                <td style="padding: 15px; font-weight: bold; color: #48bb78;">${p.totalPoints} PTS</td>
                <td style="padding: 15px; color: #cbd5e0;">${p.mainListRecords.length + p.challengeRecords.length} listados</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Abre la ventana modal con la info detallada de los niveles pasados y progresos de ese jugador
 */
function openPlayerModal(player) {
  const overlay = document.createElement('div');
  overlay.className = 'gdl-player-overlay';

  // Separamos completaciones de progresos en Main List
  const mainCompletions = player.mainListRecords.filter(r => r.percent === 100);
  const mainProgress = player.mainListRecords.filter(r => r.percent < 100);
  const challenges = player.challengeRecords;

  let mainCompletionsHTML = mainCompletions.length > 0 
    ? mainCompletions.map(r => `
        <div class="modal-record-item">
          <span class="record-item-name">🥇 ${escapeHTML(r.title)}</span>
          <span class="record-item-points">+${r.points} PTS</span>
        </div>
      `).join('')
    : '<p class="empty-subtext">Ningún nivel principal completado al 100% todavía.</p>';

  let mainProgressHTML = mainProgress.length > 0
    ? mainProgress.map(r => `
        <div class="modal-record-item progress-type">
          <span class="record-item-name">📈 ${escapeHTML(r.title)} <small>(${r.percent}%)</small></span>
          <span class="record-item-points">+${r.points} PTS</span>
        </div>
      `).join('')
    : '<p class="empty-subtext">Sin progresos intermedios registrados.</p>';

  let challengesHTML = challenges.length > 0
    ? challenges.map(r => `
        <div class="modal-record-item challenge-type">
          <span class="record-item-name">🎯 ${escapeHTML(r.title)} ${r.percent < 100 ? `<small>(${r.percent}%)</small>` : ''}</span>
          <span class="record-item-points">+${r.points} PTS</span>
        </div>
      `).join('')
    : '<p class="empty-subtext">Ningún desafío superado todavía.</p>';

  overlay.innerHTML = `
    <div class="gdl-player-content animate-pop">
      <button class="gdl-player-close" id="closePlayerModalBtn">&times;</button>
      
      <div class="player-modal-header">
        <h2 class="player-modal-title">Perfil de ${escapeHTML(player.name)}</h2>
        <div class="player-modal-rank-badge">RANK #${player.rank}</div>
      </div>

      <div class="player-modal-score-card">
        <div class="score-box">
          <span class="score-label">PUNTAJE GLOBAL</span>
          <span class="score-value">${player.totalPoints} PTS</span>
        </div>
      </div>

      <div class="player-modal-body">
        <div class="profile-section">
          <h4>🏆 Niveles Completados (${mainCompletions.length})</h4>
          <div class="records-list-wrapper">${mainCompletionsHTML}</div>
        </div>

        <div class="profile-section">
          <h4>📊 Progresos en la Lista (${mainProgress.length})</h4>
          <div class="records-list-wrapper">${mainProgressHTML}</div>
        </div>

        <div class="profile-section">
          <h4>⚔️ Desafíos / Challenges (${challenges.length})</h4>
          <div class="records-list-wrapper">${challengesHTML}</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const closeBtn = overlay.querySelector('#closePlayerModalBtn');
  closeBtn.addEventListener('click', () => { closeModal(overlay); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });
}

function closeModal(modalElement) {
  modalElement.classList.add('animate-fade-out');
  setTimeout(() => {
    modalElement.remove();
    document.body.style.overflow = '';
  }, 200);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Inyecta los estilos visuales oscuros para el modal de perfil
 */
function injectPlayerModalStyles() {
  if (document.getElementById('gdl-player-styles')) return;

  const style = document.createElement('style');
  style.id = 'gdl-player-styles';
  style.innerHTML = `
    .gdl-player-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(8, 11, 18, 0.95);
      display: flex; align-items: center; justify-content: center;
      z-index: 10000; padding: 20px;
    }
    .gdl-player-content {
      background: #0e1420; border: 1px solid #1f2937; border-radius: 12px;
      width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto;
      position: relative; padding: 25px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      color: #f0f4ff;
    }
    .gdl-player-close {
      position: absolute; top: 15px; right: 20px;
      background: none; border: none; color: #9ca3af; font-size: 30px; cursor: pointer;
    }
    .gdl-player-close:hover { color: #ef4444; }
    
    .player-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #1f2937; padding-bottom: 15px; }
    .player-modal-title { margin: 0; font-size: 24px; color: #fff; font-family: 'Orbitron', sans-serif; }
    .player-modal-rank-badge { background: #1f2937; color: #cbd5e0; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; border: 1px solid #374151; }
    
    .player-modal-score-card { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 25px; border: 1px solid #374151; }
    .score-label { display: block; font-size: 11px; color: #9ca3af; letter-spacing: 1px; margin-bottom: 4px; }
    .score-value { font-size: 26px; font-weight: bold; color: #48bb78; font-family: 'Orbitron', sans-serif; }

    .profile-section { margin-bottom: 20px; }
    .profile-section h4 { margin: 0 0 10px 0; font-size: 15px; color: #fff; border-bottom: 1px solid #1f2937; padding-bottom: 6px; font-family: 'Rajdhani', sans-serif; letter-spacing: 0.5px; }
    
    .records-list-wrapper { display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; padding-right: 5px; }
    .modal-record-item { background: #111827; padding: 10px 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #1f2937; font-size: 13.5px; }
    .modal-record-item.progress-type { border-left: 3px solid #ed8936; }
    .modal-record-item.challenge-type { border-left: 3px solid #ef4444; }
    
    .record-item-name { color: #e2e8f0; font-weight: 500; }
    .record-item-name small { color: #718096; margin-left: 5px; }
    .record-item-points { font-weight: bold; color: #48bb78; font-size: 13px; }
    
    .empty-subtext { font-size: 12px; color: #4b5563; margin: 0; font-style: italic; }
    .lb-clickable-row:hover { background: #1a2438 !important; }
    .podium-card:hover { border-color: #e8412a !important; transform: scale(1.03) !important; }
  `;
  document.head.appendChild(style);
}
