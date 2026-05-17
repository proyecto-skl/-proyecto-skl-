/**
 * mainlist.js — Módulo de la Lista Principal optimizado para GitHub Pages
 */

export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando niveles separados...</p>
    </div>
  `;

  try {
    // 1. Buscamos de forma segura la raíz de la app sin romper los nombres de repositorios con guiones
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/js\/pages\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');

    // 2. Traemos el índice general de niveles usando la ruta absoluta limpia
    const listResponse = await fetch(`${rootUrl}/data/levels/_list.json`);
    if (!listResponse.ok) {
      throw new Error(`Error ${listResponse.status}: No se encontró el archivo _list.json en: ${rootUrl}/data/levels/_list.json`);
    }
    const levelFiles = await listResponse.json();

    // 3. Cargamos cada archivo JSON de nivel de forma individual en paralelo
    const levelPromises = levelFiles.map(async (fileName, index) => {
      try {
        const res = await fetch(`${rootUrl}/data/levels/${fileName.trim()}.json`);
        if (!res.ok) return null;
        const levelData = await res.json();
        
        // Asignamos el top/rank automáticamente según su orden en el array
        return { ...levelData, rank: index + 1 };
      } catch (err) {
        console.error(`Error cargando el archivo del nivel: ${fileName}`, err);
        return null;
      }
    });

    const levels = await Promise.all(levelPromises);
    // Filtramos los niveles que no se pudieron cargar (por si hay un 404 en alguno)
    const activeLevels = levels.filter(l => l !== null);

    if (activeLevels.length === 0) {
      container.innerHTML = `<p class="state-message">No hay niveles disponibles en la lista.</p>`;
      return;
    }

    // 4. Renderizamos las tarjetas con el diseño estético de tu plantilla
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
      <div class="state-message" style="color: var(--color-error, #f85149); padding: 20px; text-align: left;">
        <p>⚠️ Hubo un error al estructurar la lista: ${error.message}</p>
        <p style="font-size: 13px; margin-top: 10px; opacity: 0.8;">
          Asegurate de subir los cambios a tu repositorio de GitHub para que existan las carpetas correspondientes.
        </p>
      </div>
    `;
  }
}
