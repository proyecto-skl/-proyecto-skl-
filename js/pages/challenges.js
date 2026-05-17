/**
 * challenges.js — Módulo de Challenges con carga dividida
 */

export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando desafíos individuales...</p>
    </div>
  `;

  try {
    // Apuntamos al índice de la carpeta de challenges
    const listResponse = await fetch('data/challenges/_list.json');
    if (!listResponse.ok) throw new Error('No se pudo cargar el índice de challenges (_list.json)');
    const challengeFiles = await listResponse.json();

    const challengePromises = challengeFiles.map(async (fileName, index) => {
      try {
        const res = await fetch(`data/challenges/${fileName.trim()}.json`);
        if (!res.ok) return null;
        const challengeData = await res.json();
        return { ...challengeData, rank: index + 1 };
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
        ${activeChallenges.map(challenge => `
          <div class="level-card challenge-card">
            <div class="card-thumb-wrapper">
              <img src="${challenge.thumbnail || 'https://i.ytimg.com/vi/' + challenge.videoId + '/hqdefault.jpg'}" alt="${challenge.name}" class="card-thumb" loading="lazy" />
              <span class="card-rank">#${challenge.rank}</span>
            </div>
            <div class="card-content">
              <h3 class="card-title">${challenge.name}</h3>
              <p class="card-author">Por <strong>${challenge.creator}</strong></p>
              <p class="card-description">${challenge.description || ''}</p>
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

  } catch (error) {
    container.innerHTML = `
      <div class="state-message" style="color: var(--color-error);">
        <p>Error al cargar la lista de desafíos: ${error.message}</p>
      </div>
    `;
  }
}
