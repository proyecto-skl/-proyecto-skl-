/**
 * challenges.js — Lista de Desafíos con Ventana Emergente (Info + Video + Récords)
 */

export async function render(container) {
  // Compartimos los mismos estilos de la ventana modal
  if (typeof injectModalStyles === 'undefined') {
    const styleCheck = document.getElementById('gdl-modal-styles');
    if (!styleCheck) {
      // Si no se renderizó la mainlist antes, inyectamos los estilos acá también
      const loc = window.location;
      // Reutiliza la misma lógica estética
    }
  }

  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando desafíos y récords...</p>
    </div>
  `;

  try {
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/js\/pages\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');

    const listResponse = await fetch(`${rootUrl}/data/challenges/_list.json`);
    if (!listResponse.ok) throw new Error('No se pudo cargar el índice de challenges (_list.json)');
    const challengeFiles = await listResponse.json();

    const challengePromises = challengeFiles.map(async (fileName, index) => {
      try {
        const res = await fetch(`${rootUrl}/data/challenges/${fileName.trim()}.json`);
        if (!res.ok) return null;
        const challengeData = await res.json();
        
        let videoId = challengeData.videoId || 'dQw4w9WgXcQ';
        if (challengeData.verification && challengeData.verification.includes('v=')) {
          videoId = challengeData.verification.split('v=')[1].split('&')[0];
        }

        return { 
          ...challengeData, 
          rank: index + 1,
          videoId: videoId,
          thumbnail: challengeData.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          records: challengeData.records || []
        };
      } catch (err) {
        console.error(`Error cargando el challenge: ${fileName}`, err);
        return null;
      }
    });

    const challenges = await Promise.all(challengePromises);
    const activeChallenges = challenges.filter(c => c !== null);

    if (activeChallenges.length === 0) {
      container.innerHTML = `<p class="state-message">No hay challenges disponibles.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="list-grid">
        ${activeChallenges.map((challenge, idx) => `
          <div class="level-card challenge-card" data-index="${idx}" style="cursor: pointer;">
            <div class="card-thumb-wrapper">
              <img src="${challenge.thumbnail}" alt="${challenge.name}" class="card-thumb" loading="lazy" />
              <span class="card-rank">#${challenge.rank}</span>
            </div>
            <div class="card-content">
              <h3 class="card-title">${challenge.name}</h3>
              <p class="card-author">Por <strong>${challenge.author || challenge.creator || 'Desconocido'}</strong></p>
              <p class="card-description">${challenge.description || 'Sin descripción disponible.'}</p>
              <div class="card-footer">
                <span class="points-badge" style="background: #ff4545;">${challenge.points || 0} CPS</span>
                <div class="card-tags">
                  ${(challenge.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Eventos de clic para abrir los Modales de los Challenges
    const cards = container.querySelectorAll('.level-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const index = card.getAttribute('data-index');
        // Usamos la misma función flotante definida en mainlist (o la duplicamos de forma segura si es necesario)
        openChallengeModal(activeChallenges[index]);
      });
    });

  } catch (error) {
    container.innerHTML = `
      <div class="state-message" style="color: var(--color-error);">
        <p>Error al cargar la lista de desafíos: ${error.message}</p>
      </div>
    `;
  }
}

function openChallengeModal(challenge) {
  const overlay = document.createElement('div');
  overlay.className = 'gdl-modal-overlay';

  let recordsHTML = '';
  if (challenge.records && challenge.records.length > 0) {
    recordsHTML = `
      <div class="modal-records-section">
        <h4>🏆 Récords del Desafío (${challenge.records.length})</h4>
        <div class="table-container">
          <table class="modal-table">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Porcentaje</th>
                <th>Hertzios</th>
                <th>Prueba</th>
              </tr>
            </thead>
            <tbody>
              ${challenge.records.map(r => `
                <tr>
                  <td class="player-name">${r.user}</td>
                  <td class="player-percent">${r.percent}%</td>
                  <td class="player-hz">${r.hz}Hz</td>
                  <td><a href="${r.link}" target="_blank" class="record-btn-link">Ver Video ↗</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else {
    recordsHTML = `
      <div class="modal-records-section empty-records">
        <p>🥇 ¡Nadie superó este desafío todavía!</p>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="gdl-modal-content animate-pop">
      <button class="gdl-modal-close" id="closeModalBtn">&times;</button>
      <h2 class="modal-level-title" style="border-left: 4px solid #ff4545; padding-left: 10px;">#${challenge.rank} - ${challenge.name}</h2>
      <p class="modal-level-meta">Creado por <strong>${challenge.author || challenge.creator || 'Desconocido'}</strong></p>
      
      <div class="modal-video-wrapper">
        <iframe src="https://www.youtube.com/embed/${challenge.videoId}" frameborder="0" allowfullscreen></iframe>
      </div>

      <div class="modal-info-bar">
        <div class="info-item"><strong>Puntos Otorgados:</strong> <span>${challenge.points || 0} CPS</span></div>
        <div class="info-item"><strong>Descripción:</strong> <span>${challenge.description || 'Sin descripción.'}</span></div>
      </div>

      ${recordsHTML}
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  overlay.querySelector('#closeModalBtn').addEventListener('click', () => { overlay.remove(); document.body.style.overflow = ''; });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); document.body.style.overflow = ''; } });
}
