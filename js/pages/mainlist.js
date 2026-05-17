export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando niveles separados...</p>
    </div>
  `;

  try {
    // Usamos ./ para asegurar que parta desde la raíz de tu proyecto
    const listResponse = await fetch('./data/levels/_list.json');
    if (!listResponse.ok) throw new Error(`Error ${listResponse.status}: No se encontró _list.json`);
    const levelFiles = await listResponse.json();

    // ... (el resto del código sigue exactamente igual)

    // 3. Mapeamos y cargamos cada archivo JSON por separado al mismo tiempo
    const levelPromises = levelFiles.map(async (fileName, index) => {
      try {
        const res = await fetch(`data/levels/${fileName.trim()}.json`);
        if (!res.ok) return null;
        const levelData = await res.json();
        
        // Le asignamos el top/rank automáticamente según su orden en la lista
        return { ...levelData, rank: index + 1 };
      } catch (err) {
        console.error(`Error cargando el archivo de nivel: ${fileName}`, err);
        return null;
      }
    });

    const levels = await Promise.all(levelPromises);
    // Filtramos por si algún archivo falló o tiró 404 para que no rompa la web
    const activeLevels = levels.filter(l => l !== null);

    if (activeLevels.length === 0) {
      container.innerHTML = `<p class="state-message">No hay niveles disponibles en la lista.</p>`;
      return;
    }

    // 4. Renderizamos las tarjetas con el diseño estético de la nueva plantilla
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
      <div class="state-message" style="color: var(--color-error, #f85149);">
        <p>Hubo un error al estructurar la lista: ${error.message}</p>
      </div>
    `;
  }
}
