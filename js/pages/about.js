/**
 * pages/about.js — Módulo de la sección "Sobre Nosotros"
 */

export async function render(container) {
  container.innerHTML = `
    <div class="page-header animate-fadeIn">
      <h1 class="page-title"><span>Sobre</span> Nosotros</h1>
      <p class="page-subtitle">Conocé la historia detrás de la lista, el staff y nuestra comunidad</p>
      <div class="page-title-bar"></div>
    </div>

    <div style="max-width: 900px; margin: 40px auto; display: flex; flex-direction: column; gap: 32px;" class="animate-fadeIn">
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        
        <div style="background: var(--bg-surface); border: 1px solid var(--border-card); padding: 24px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-sm); border-top: 3px solid var(--accent-primary);">
          <div style="font-size: 3rem; margin-bottom: 12px;">👑</div>
          <h2 style="font-family: var(--font-ui); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 4px;">[Nombre del Streamer]</h2>
          <p style="color: var(--accent-primary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 16px;">Dueño & Streamer</p>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
            Creador del canal y propulsor principal de este proyecto. Encargado de los streams, la organización general y de manquear niveles en vivo.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <a href="https://twitch.tv/#" target="_blank" style="color: #a970ff; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(169,112,255,0.1); padding: 6px 12px; border-radius: var(--radius-sm);">Twitch</a>
            <a href="https://youtube.com/#" target="_blank" style="color: #ff0000; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(255,0,0,0.1); padding: 6px 12px; border-radius: var(--radius-sm);">YouTube</a>
          </div>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-card); padding: 24px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-sm); border-top: 3px solid var(--accent-blue);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🛠️</div>
          <h2 style="font-family: var(--font-ui); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 4px;">[Nombre del Editor]</h2>
          <p style="color: var(--accent-blue); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 16px;">Editor de la Lista & Dev</p>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
            Mente técnica detrás del código, el diseño visual de la página y la constante actualización y verificación de los datos de los niveles.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <a href="https://github.com/#" target="_blank" style="color: var(--text-primary); text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: var(--radius-sm);">GitHub</a>
            <a href="https://twitter.com/#" target="_blank" style="color: #1da1f2; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(29,161,242,0.1); padding: 6px 12px; border-radius: var(--radius-sm);">Twitter</a>
          </div>
        </div>

      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-card); padding: 32px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
        <h3 style="font-family: var(--font-ui); color: var(--accent-primary); font-size: 1.3rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          📖 El Nacimiento del Proyecto
        </h3>
        <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 24px;">
          Esta página nació bajo la premisa de crear un espacio centralizado y personalizado para traquear el progreso de nuestra propia comunidad. Nos inspiramos fuertemente en las listas competitivas globales de Geometry Dash como la <em>Pointercrate Demon List</em> y la <em>Challenge List</em> oficial, pero adaptando las posiciones de los niveles y los requerimientos a las vivencias, récords y opiniones discutidas minuciosamente por los jugadores de nuestro ecosistema.
        </p>

        <h3 style="font-family: var(--font-ui); color: var(--accent-primary); font-size: 1.3rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          📊 ¿Cómo evaluamos los Ranks?
        </h3>
        <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 0;">
          Para colocar un nivel en una posición específica de la <strong>Main List</strong> o la sección de <strong>Challenges</strong>, tomamos en consideración la dificultad percibida por la comunidad, las opiniones de los jugadores que lograron completar el nivel (*victors*) y los análisis técnicos de tasas de clicks y precisión. Cada actualización se debate en comunidad para garantizar que la lista refleje fielmente el desafío que representa cada mapa.
        </p>
      </div>

      <div style="background: linear-gradient(135deg, rgba(255,183,0,0.05) 0%, rgba(14,20,32,1) 100%); border: 1px solid rgba(255,183,0,0.2); padding: 32px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-md);">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 8px;">🌐</span>
        <h3 style="font-family: var(--font-ui); color: var(--text-primary); font-size: 1.4rem; margin-bottom: 12px;">¡Sumate a la Comunidad en Vivo!</h3>
        <p style="color: var(--text-secondary); max-width: 650px; margin: 0 auto 24px; line-height: 1.6; font-size: 0.95rem;">
          Gran parte de los niveles añadidos y de los récords cargados en la Leaderboard son verificados en tiempo real durante los streams. ¡No te pierdas las jornadas de debate, las votaciones de dificultad y el gameplay en directo!
        </p>
        <a href="https://discord.gg/UvYs4NgDF4" target="_blank" class="topbar-btn-cta" style="display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 28px; font-size: 1rem; text-decoration: none; box-shadow: var(--shadow-accent);">
          Unirse al Discord Oficial
        </a>
      </div>

    </div>
  `;
}
