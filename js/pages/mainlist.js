/**
 * mainlist.js — Módulo de la Lista Principal adaptado a la jerarquía de tus JSON
 */

export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando niveles separados...</p>
    </div>
  `;

  try {
    // 1. Buscamos de forma segura la raíz de la app en GitHub Pages / Local
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/js\/pages\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');

    // 2. Traemos el índice general de niveles (_list.json)
    const listResponse = await fetch(`${rootUrl}/data/levels/_list.json`);
    if (!listResponse.ok) {
      throw new Error(`Error ${listResponse.status}: No se encontró el archivo _list.json`);
    }
    const levelFiles = await listResponse.json();

    // 3. Cargamos cada archivo JSON adaptando su estructura internamente
    const levelPromises = levelFiles.map(async (fileName, index) => {
      try {
        const res = await fetch(`${rootUrl}/data/levels/${fileName.trim()}.json`);
        if (!res.ok) return null;
        const oldData = await res.json();
        
        // Extraemos el ID del video de YouTube desde el link de verificación viejo
        let videoId = 'dQw4w9WgXcQ'; // Video por defecto si no hay
        if (oldData.verification && oldData.verification.includes('v=')) {
          videoId = oldData.verification.split('v=')[1].split('&')[0];
        } else if (oldData.verification && oldData.verification.includes('youtu.be/')) {
          videoId = oldData.verification.split('youtu.be/')[1].split('?')[0];
        }

        // Traducimos los datos viejos al formato que requiere la nueva plantilla
        return {
          rank: index + 1,
          name: oldData.name || 'Sin nombre',
          creator: oldData.author || (oldData.creators ? oldData.creators.join(', ') : 'Desconocido'),
          verifier: oldData.verifier || 'Desconocido',
          videoId: videoId,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          points: Math.max(100, 1000 - (index * 5)), // Cálculo automático de puntos por posición
          description: `ID del nivel: ${oldData.id || 'N/A'}. Requiere un ${oldData.percentToQualify || '100'}% para clasificar.`,
          tags: oldData.password ? [`🔑 ${oldData.password}`] : []
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

    // 4. Renderizamos las tarjetas con el diseño estético usando los datos mapeados
    container.innerHTML = `
      <div class="list-grid">
        ${activeLevels.map(level => `
          <div class="level-card">
            <div class="card-thumb-wrapper">
              <img 
                src="${level.thumbnail}" 
                alt="${level.name}" 
                class="card-thumb" 
                loading="lazy" 
              />
              <span class="card-rank">#${level.rank}</span>
            </div>
            <div class="card-content">
              <h3 class="card-title">${level.name}</h3>
              <p class="card-author">Por <strong>${level.creator}</strong> | Verificado por: <em>${level.verifier}</em></p>
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

  } catch (error) {
    container.innerHTML = `
      <div class="state-message" style="color: var(--color-error, #f85149); padding: 20px;">
        <p>⚠️ Hubo un error al estructurar la lista: ${error.message}</p>
      </div>
    `;
  }
}
