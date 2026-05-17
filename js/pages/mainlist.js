/**
 * mainlist.js — Módulo de la Lista Principal con carga de archivos individuales
 */

export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando niveles separados...</p>
    </div>
  `;

  try {
    // 1. Calculamos dinámicamente la raíz real de tu sitio web
    const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    
    // Si la URL termina en 'js/pages' o 'js', limpiamos la ruta para asegurar la raíz del proyecto
    const rootUrl = baseUrl.replace(/\/js\/pages$/, '').replace(/\/js$/, '');

    // 2. Traemos el archivo índice general (_list.json) usando la ruta absoluta calculada
    const listResponse = await fetch(`${rootUrl}/data/levels/_list.json`);
    if (!listResponse.ok) {
      throw new Error(`Error ${listResponse.status}: No se encontró el archivo _list.json en la ruta calculada.`);
    }
    const levelFiles = await listResponse.json();

    // 3. Mapeamos y cargamos cada archivo JSON de nivel de forma individual
    const levelPromises = levelFiles.map(async (fileName, index) => {
      try {
        const res = await fetch(`${rootUrl}/data/levels/${fileName.trim()}.json`);
        if (!res.ok) return null;
        const levelData = await res.json();
        
        // Asignamos el top/rank automáticamente según su posición en la lista
        return { ...levelData, rank: index + 1 };
      } catch (err) {
        console.error(`Error cargando el archivo del nivel: ${fileName}`, err);
        return null;
      }
    });

    const levels = await Promise.all(levelPromises);
    // Filtramos los niveles que hayan fallado para que no rompan la web
    const activeLevels = levels.filter(l => l !== null);

    if (activeLevels.length === 0) {
      container.innerHTML = `<p class="state-message">No hay niveles disponibles en la lista.</p>`;
      return;
    }

    // 4. Renderizamos las tarjetas con la estructura visual de la plantilla
    container.innerHTML = `
      <div class="list-grid">
        ${activeLevels.map(level => `
          <div class="level-card">
            <div class="card-thumb-wrapper">
              <img 
                src="${level.thumbnail || 'https://i.ytimg.com/vi/' + level.videoId + '/hqdefault.jpg'}" 
                alt="${level.name}" 
                class="card-thumb" 
                loading="lazy" 
              />
              <span class="card-rank">#${level.rank}</span>
            </div>
            <div class="card-content">
              <h3 class="card-title">${level.name}</h3>
              <p class="card-author">Por <strong>${level.creator}</strong></p>
              <p class="card-description">${level.description || 'Sin descripción disponible.'}</p>
              <div class="card-footer">
                <span class="points-badge">${level.points || 0} PTS</span>
                <div class="card-tags">
                  ${(level.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

  } catch (error) {
    container.innerHTML = `
      <div class="state-message" style="color: var(--color-error, #f85149); padding: 20px;">
        <p>⚠️ Hubo un error al estructurar la lista: ${error.message}</p>
        <p style="font-size: 12px; margin-top: 10px; opacity: 0.7;">
          Asegúrate de tener la carpeta <strong>data/levels/</strong> con su archivo <strong>_list.json</strong> dentro.
        </p>
      </div>
    `;
  }
}
