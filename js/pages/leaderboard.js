/**
 * pages/leaderboard.js — Módulo de la Tabla de Posiciones Dinámica
 * Escanea en tiempo real los récords de niveles y desafíos.
 */

export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Calculando puntajes y escaneando récords en vivo...</p>
    </div>
  `;

  try {
    // 1. Buscamos de forma segura la raíz de la app en GitHub Pages / Local
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/js\/pages\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');

    // Objeto para agrupar a todos los jugadores de forma única
    const playerMap = {};

    // Helper para inicializar o registrar datos de un jugador
    function registerRecord(playerName, pointsGained, isCompletion, isVerification) {
      if (!playerName || playerName.trim() === '' || playerName.toLowerCase() === 'desconocido') return;
      
      const nameTrimmed = playerName.trim();
      const key = nameTrimmed.toLowerCase();

      if (!playerMap[key]) {
        playerMap[key] = {
          name: nameTrimmed,
          totalPoints: 0,
          completions: 0,
          verifications: 0,
          country: 'Argentina',
          countryFlag: '🇦🇷' // Bandera por defecto para tu comunidad
        };
      }

      playerMap[key].totalPoints += Math.round(pointsGained);
      if (isCompletion) playerMap[key].completions++;
      if (isVerification) playerMap[key].verifications++;
    }

    /* ── A. ESCANEO DE NIVELES PRINCIPALES (MAIN LIST) ── */
    try {
      const levelsListRes = await fetch(`${rootUrl}/data/levels/_list.json`);
      if (levelsListRes.ok) {
        const levelFiles = await levelsListRes.json();
        
        await Promise.all(levelFiles.map(async (fileName, index) => {
          try {
            const res = await fetch(`${rootUrl}/data/levels/${fileName.trim()}.json`);
            if (!res.ok) return;
            const levelData = await res.json();

            // Calculamos los puntos que otorga este nivel según su posición en la lista
            const levelPoints = Math.max(100, 1000 - (index * 5));

            // 1. Registrar al verificador del nivel
            const verifier = levelData.verifier || 'Desconocido';
            registerRecord(verifier, 0, false, true);

            // 2. Registrar los récords de los usuarios que se lo pasaron
            if (levelData.records && Array.isArray(levelData.records)) {
              levelData.records.forEach(rec => {
                const is100 = parseInt(rec.percent) === 100;
                // Si tiene el 100% gana los puntos completos, si no, proporcional
                const pointsGained = (parseInt(rec.percent) / 100) * levelPoints;
                registerRecord(rec.user, pointsGained, is100, false);
              });
            }
          } catch (e) {
            console.error(`Error procesando nivel para leaderboard: ${fileName}`, e);
          }
        }));
      }
    } catch (err) {
      console.warn("No se pudo escanear la carpeta de niveles principales:", err);
    }

    /* ── B. ESCANEO DE DESAFÍOS (CHALLENGES LIST) ── */
    try {
      const chalListRes = await fetch(`${rootUrl}/data/challenges/_list.json`);
      if (chalListRes.ok) {
        const challengeFiles = await chalListRes.json();

        await Promise.all(challengeFiles.map(async (fileName) => {
          try {
            const res = await fetch(`${rootUrl}/data/challenges/${fileName.trim()}.json`);
            if (!res.ok) return;
            const chalData = await res.json();

            // Puntos fijos definidos dentro del JSON del challenge (o 50 por defecto)
            const chalPoints = chalData.points || 50;

            if (chalData.records && Array.isArray(chalData.records)) {
              chalData.records.forEach(rec => {
                const is100 = parseInt(rec.percent) === 100;
                const pointsGained = (parseInt(rec.percent) / 100) * chalPoints;
                registerRecord(rec.user, pointsGained, is100, false);
              });
            }
          } catch (e) {
            console.error(`Error procesando challenge para leaderboard: ${fileName}`, e);
          }
        }));
      }
    } catch (err) {
      console.warn("No se pudo escanear la carpeta de challenges:", err);
    }

    // Convertimos el mapa a un Array y lo ordenamos de mayor a menor puntaje
    const sortedPlayers = Object.values(playerMap)
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Asignamos el rango/posición en el top
    sortedPlayers.forEach((player, idx) => {
      player.rank = idx + 1;
    });

    if (sortedPlayers.length === 0) {
      container.innerHTML = `<p class="state-message">No hay récords registrados para armar la Leaderboard.</p>`;
      return;
    }

    // 3. Renderizamos la estructura visual limpia usando las clases de tu CSS
    container.innerHTML = buildLeaderboardHTML(sortedPlayers);

  } catch (error) {
    container.innerHTML = `
      <div class="state-message" style="color: var(--color-error, #f85149); padding: 20px;">
        <p>⚠️ Error crítico al generar la Leaderboard: ${error.message}</p>
      </div>
    `;
  }
}

/**
 * Genera el contenedor HTML estructurado con el Podio y la Tabla
 */
function buildLeaderboardHTML(players) {
  const topPlayer = players[0];
  const podiumPlayers = players.slice(0, 3);
  const tablePlayers = players.slice(3);

  // Mapeo de posiciones para el podio clásico (2do a la izquierda, 1ro al centro, 3ro a la derecha)
  const podiumOrder = [];
  if (players[1]) podiumOrder.push({ p: players[1], index: 1, label: '2nd' });
  if (players[0]) podiumOrder.push({ p: players[0], index: 0, label: '1st' });
  if (players[2]) podiumOrder.push({ p: players[2], index: 2, label: '3rd' });

  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h1 class="page-title"><span>Leader</span>board</h1>
          <p class="page-subtitle">Jugadores ordenados por su puntaje total de récords en tiempo real</p>
          <div class="page-title-bar"></div>
        </div>
      </div>
    </div>

    <div class="stats-bar" style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
      <div class="stat-pill" style="background: #111827; padding: 10px 15px; border-radius: 8px; font-size: 14px; border: 1px solid #1f2937;">
        👥 <strong>${players.length}</strong> Jugadores clasificados
      </div>
      <div class="stat-pill" style="background: #111827; padding: 10px 15px; border-radius: 8px; font-size: 14px; border: 1px solid #1f2937;">
        🥇 Líder actual: <strong style="color: #f5a623;">${topPlayer?.name ?? '—'}</strong>
      </div>
      <div class="stat-pill" style="background: #111827; padding: 10px 15px; border-radius: 8px; font-size: 14px; border: 1px solid #1f2937;">
        ⭐ Récord de Score: <strong>${topPlayer?.totalPoints ?? 0} PTS</strong>
      </div>
    </div>

    <div class="podium" style="display: flex; justify-content: center; align-items: flex-end; gap: 20px; margin: 40px 0; padding-bottom: 20px; border-bottom: 1px solid #1f2937;">
      ${podiumOrder.map(item => `
        <div class="podium-card placement-${item.label.toLowerCase()}" style="
          background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 25px 15px; text-align: center; width: 100%; max-width: 180px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3); position: relative;
          ${item.index === 0 ? 'transform: translateY(-15px); border-color: #f5a623; min-height: 220px;' : 'min-height: 180px;'}
        ">
          <div class="podium-badge" style="
            position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
            background: ${item.index === 0 ? '#f5a623' : item.index === 1 ? '#cbd5e0' : '#ed8936'};
            color: #000; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 12px;
          ">
            ${item.label === '1st' ? '👑 TOP 1' : item.label === '2nd' ? '🥈 TOP 2' : '🥉 TOP 3'}
          </div>
          <h3 style="margin: 10px 0 5px 0; color: #fff; font-size: 18px;">${escapeHTML(item.p.name)}</h3>
          <span style="font-size: 22px;">${item.p.countryFlag}</span>
          <div style="font-size: 16px; font-weight: bold; color: #48bb78; margin-top: 8px;">${item.p.totalPoints} PTS</div>
          <div style="font-size: 11px; color: #718096; margin-top: 5px;">
            🏁 ${item.p.completions} listos · 🛠️ ${item.p.verifications} verif.
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
            <th style="padding: 15px;">Región</th>
            <th style="padding: 15px;">Puntaje Total</th>
            <th style="padding: 15px;">Niveles Pasados</th>
            <th style="padding: 15px;">Verificaciones</th>
          </tr>
        </thead>
        <tbody>
          ${players.map((p, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const isTop3 = index < 3;
            return `
              <tr class="lb-row" style="border-bottom: 1px solid #1f2937; background: ${isTop3 ? 'rgba(245, 166, 35, 0.02)' : 'none'}; transition: background 0.2s;">
                <td style="padding: 15px; font-weight: bold;">
                  <span class="lb-rank-num ${rankClass}" style="
                    padding: 4px 8px; border-radius: 4px;
                    ${index === 0 ? 'color: #f5a623;' : index === 1 ? 'color: #cbd5e0;' : index === 2 ? 'color: #ed8936;' : 'color: #718096;'}
                  ">#${p.rank}</span>
                </td>
                <td style="padding: 15px; font-weight: 600; color: #fff;" class="lb-player-name">${escapeHTML(p.name)}</td>
                <td style="padding: 15px; font-size: 18px;" class="lb-country" title="${p.country}">${p.countryFlag}</td>
                <td style="padding: 15px; font-weight: bold; color: #48bb78;" class="lb-points">${p.totalPoints} PTS</td>
                <td style="padding: 15px; color: #cbd5e0;" class="lb-completions">${p.completions} ✨</td>
                <td style="padding: 15px; color: #a0aec0;" class="lb-verifications">${p.verifications} 🛠️</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
