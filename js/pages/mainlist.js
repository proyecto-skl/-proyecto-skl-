/**
 * mainlist.js — Lista Principal con Ventana Emergente (Info + Video + Récords)
 */

export async function render(container) {
  // Inyectamos también los estilos de la ventana emergente para que no tengas que tocar el CSS
  injectModalStyles();

  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando niveles y récords...</p>
    </div>
  `;

  try {
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/js\/pages\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');

    const listResponse = await fetch(`${rootUrl}/data/levels/_list.json`);
    if (!listResponse.ok) throw new Error(`Error ${listResponse.status}: No se encontró el archivo _list.json`);
    const levelFiles = await listResponse.json();

    const levelPromises = levelFiles.map(async (fileName, index) => {
      try {
        const res = await fetch(`${rootUrl}/data/levels/${fileName.trim()}.json`);
        if (!res.ok) return null;
        const oldData = await res.json();
        
        let videoId = 'dQw4w9WgXcQ'; 
        if (oldData.verification && oldData.verification.includes('v=')) {
          videoId = oldData.verification.split('v=')[1].split('&')[0];
        } else if (oldData.verification && oldData.verification.includes('youtu.be/')) {
          videoId = oldData.verification.split('youtu.be/')[1].split('?')[0];
        }

        // Mapeamos los datos preservando la lista de récords original
        return {
          rank: index + 1,
          name: oldData.name || 'Sin nombre',
          creator: oldData.author || (oldData.creators ? oldData.creators.join(', ') : 'Desconocido'),
          verifier: oldData.verifier || 'Desconocido',
          videoId: videoId,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          points: Math.max(100, 1000 - (index * 5)),
          description: `ID del nivel: ${oldData.id || 'N/A'}. Requiere un ${oldData.percentToQualify || '100'}% para clasificar.`,
          tags: oldData.password ? [`🔑 ${oldData.password}`] : [],
          records: oldData.records || [] // <-- Guardamos los récords acá
        };
      } catch (err) {
        console.error(`Error procesando el archivo: ${fileName}`, err);
        return null;
      }
    });

    const levels = await Promise.all(levelPromises);
    const activeLevels = levels.filter(l => l !== null);

    if (activeLevels.length === 0) {
      container.innerHTML = `<p class="state-message">No hay niveles disponibles en la lista.</p>`;
      return;
    }

    // Renderizamos la grilla de tarjetas. Añadimos un "data-index" para identificar cuál clickea el usuario
    container.innerHTML = `
      <div class="list-grid">
        ${activeLevels.map((level, idx) => `
          <div class="level-card" data-index="${idx}" style="cursor: pointer;">
            <div class="card-thumb-wrapper">
              <img src="${level.thumbnail}" alt="${level.name}" class="card-thumb" loading="lazy" />
              <span class="card-rank">#${level.rank}</span>
            </div>
            <div class="card-content">
              <h3 class="card-title">${level.name}</h3>
              <p class="card-author">Por <strong>${level.creator}</strong></p>
              <p class="card-description">${level.description}</p>
              <div class="card-footer">
                <span class="points-badge">${level.points} PTS</span>
                <div class="card-tags">
                  ${level.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // ⚡ Asignamos el evento click a cada tarjeta generada
    const cards = container.querySelectorAll('.level-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const index = card.getAttribute('data-index');
        openLevelModal(activeLevels[index]);
      });
    });

  } catch (error) {
    container.innerHTML = `
      <div class="state-message" style="color: var(--color-error, #f85149); padding: 20px;">
        <p>⚠️ Hubo un error al estructurar la lista: ${error.message}</p>
      </div>
    `;
  }
}

/**
 * Función encargada de construir y abrir la ventana emergente con los récords
 */
function openLevelModal(level) {
  // Creamos el contenedor del fondo oscuro (overlay)
  const overlay = document.createElement('div');
  overlay.className = 'gdl-modal-overlay';

  // Armamos las filas de la tabla de récords
  let recordsHTML = '';
  if (level.records && level.records.length > 0) {
    recordsHTML = `
      <div class="modal-records-section">
        <h4>🏆 Récords del Nivel (${level.records.length})</h4>
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
              ${level.records.map(r => `
                <tr>
                  <td class="player-name">${r.user}</td>
                  <td class="player-percent">${r.percent}%</td>
                  <td class="player-hz">${r.hz}Hz</td>
                  <td>
                    <a href="${r.link}" target="_blank" class="record-btn-link">Ver Video ↗</a>
                  </td>
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
        <p>🥇 ¡Nadie ha registrado un récord en este nivel todavía! Sé el primero en mandarlo.</p>
      </div>
    `;
  }

  // Estructura interna de la ventana flotante
  overlay.innerHTML = `
    <div class="gdl-modal-content animate-pop">
      <button class="gdl-modal-close" id="closeModalBtn">&times;</button>
      
      <h2 class="modal-level-title">#${level.rank} - ${level.name}</h2>
      <p class="modal-level-meta">Creado por <strong>${level.creator}</strong> | Verificado por: <span>${level.verifier}</span></p>
      
      <div class="modal-video-wrapper">
        <iframe 
          src="https://www.youtube.com/embed/${level.videoId}" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>

      <div class="modal-info-bar">
        <div class="info-item"><strong>Puntos otorgados:</strong> <span>${level.points} PTS</span></div>
        <div class="info-item"><strong>Detalles:</strong> <span>${level.description}</span></div>
      </div>

      ${recordsHTML}
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden'; // Bloqueamos el scroll de la página de fondo

  // Evento para cerrar la ventana con el botón de la cruz
  overlay.querySelector('#closeModalBtn').addEventListener('click', () => {
    closeModal(overlay);
  });

  // Evento para cerrar haciendo clic afuera en el fondo oscuro
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay);
    }
  });
}

function closeModal(modalElement) {
  modalElement.classList.add('animate-fade-out');
  setTimeout(() => {
    modalElement.remove();
    document.body.style.overflow = ''; // Devolvemos el scroll normal
  }, 200);
}

/**
 * Inyecta los estilos CSS necesarios de forma dinámica
 */
function injectModalStyles() {
  if (document.getElementById('gdl-modal-styles')) return;

  const style = document.createElement('style');
  style.id = 'gdl-modal-styles';
  style.innerHTML = `
    .gdl-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(10, 10, 12, 0.9);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 20px;
    }
    .gdl-modal-content {
      background: #16161a;
      border: 1px solid #2d2d34;
      border-radius: 12px;
      width: 100%; max-width: 720px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      padding: 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      color: #e2e8f0;
    }
    .gdl-modal-close {
      position: absolute; top: 15px; right: 20px;
      background: none; border: none;
      color: #a0aec0; font-size: 32px;
      cursor: pointer; transition: color 0.2s;
    }
    .gdl-modal-close:hover { color: #f56565; }
    
    .modal-level-title { margin: 0 0 5px 0; color: #fff; font-size: 28px; font-weight: 700; padding-right: 30px; }
    .modal-level-meta { margin: 0 0 20px 0; color: #718096; font-size: 14px; }
    .modal-level-meta strong { color: #cbd5e0; }
    .modal-level-meta span { color: #3182ce; }

    .modal-video-wrapper {
      position: relative; padding-bottom: 56.25%; height: 0;
      border-radius: 8px; overflow: hidden;
      margin-bottom: 20px; border: 1px solid #2d2d34;
    }
    .modal-video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

    .modal-info-bar {
      background: #1f1f24; border-radius: 8px;
      padding: 15px; margin-bottom: 25px;
      font-size: 14px; line-height: 1.5;
    }
    .info-item { margin-bottom: 5px; }
    .info-item:last-child { margin-bottom: 0; }
    .info-item strong { color: #a0aec0; }

    .modal-records-section h4 { margin: 0 0 12px 0; font-size: 18px; color: #fff; border-bottom: 1px solid #2d2d34; padding-bottom: 8px; }
    .table-container { overflow-x: auto; border-radius: 6px; border: 1px solid #2d2d34; }
    
    .modal-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .modal-table th { background: #1f1f24; color: #a0aec0; padding: 10px 15px; font-weight: 600; }
    .modal-table td { padding: 12px 15px; border-bottom: 1px solid #2d2d34; background: #16161a; }
    .modal-table tr:last-child td { border-bottom: none; }
    
    .player-name { font-weight: 600; color: #fff; }
    .player-percent { color: #48bb78; font-weight: 600; }
    .player-hz { color: #ed8936; }
    
    .record-btn-link {
      color: #3182ce; text-decoration: none; font-weight: 500;
      transition: color 0.2s;
    }
    .record-btn-link:hover { color: #63b3ed; text-decoration: underline; }
    
    .empty-records { background: #1f1f24; text-align: center; padding: 20px; border-radius: 8px; color: #a0aec0; font-size: 14px; }

    /* Animaciones */
    .animate-pop { animation: modalPop 0.25s ease-out forwards; }
    .animate-fade-out { animation: modalFadeOut 0.2s ease-in forwards; }
    
    @keyframes modalPop {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes modalFadeOut {
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(0.95); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
