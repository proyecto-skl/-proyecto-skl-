/**
 * pages/about.js — Módulo de la sección "Sobre Nosotros" (Versión Final con Historia de la Comunidad)
 */

export async function render(container) {
  container.innerHTML = `
    <div class="page-header animate-fadeIn">
      <h1 class="page-title"><span>Sobre</span> Nosotros</h1>
      <p class="page-subtitle">Conocé la historia detrás de la lista, el equipo de trabajo y nuestra comunidad</p>
      <div class="page-title-bar"></div>
    </div>

    <div style="max-width: 1000px; margin: 40px auto; display: flex; flex-direction: column; gap: 32px;" class="animate-fadeIn">
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        
        <div style="background: var(--bg-surface); border: 1px solid var(--border-card); padding: 24px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-sm); border-top: 3px solid #ff4545; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 3rem; margin-bottom: 12px;">🎥</div>
            <h2 style="font-family: var(--font-ui); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 4px;">-Shiku08-</h2>
            <p style="color: #ff4545; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 16px;">Streamer & Dueño de Comunidad</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
              La cara visible en directo y líder de la comunidad. Encargado de hostear las transmisiones, organizar los eventos en vivo, debatir posiciones con el chat y testear los niveles en tiempo real.
            </p>
          </div>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: auto;">
            <a href="https://twitch.tv/#" target="_blank" style="color: #a970ff; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(169,112,255,0.1); padding: 6px 12px; border-radius: var(--radius-sm);">Twitch</a>
            <a href="https://youtube.com/#" target="_blank" style="color: #ff0000; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(255,0,0,0.1); padding: 6px 12px; border-radius: var(--radius-sm);">YouTube</a>
          </div>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-card); padding: 24px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-sm); border-top: 3px solid var(--accent-primary); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 3rem; margin-bottom: 12px;">👑</div>
            <h2 style="font-family: var(--font-ui); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 4px;">Gabri</h2>
            <p style="color: var(--accent-primary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 16px;">Creador & Dueño de la Página</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
              Fundador ideológico y dueño del sitio. Quien ideó la estructura original del proyecto y coordina las directrices generales junto con el streamer para expandir los límites de nuestra lista.
            </p>
          </div>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: auto;">
            <a href="https://twitter.com/#" target="_blank" style="color: #1da1f2; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(29,161,242,0.1); padding: 6px 12px; border-radius: var(--radius-sm);">Twitter</a>
            <a href="https://discord.com/users/#" target="_blank" style="color: #5865f2; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(88,101,242,0.1); padding: 6px 12px; border-radius: var(--radius-sm);">Discord</a>
          </div>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-card); padding: 24px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-sm); border-top: 3px solid #3b82f6; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 3rem; margin-bottom: 12px;">🛠️</div>
            <h2 style="font-family: var(--font-ui); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 4px;">Sevas</h2>
            <p style="color: #3b82f6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 16px;">Editor de la Lista & Dev</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
              La mente detrás del código y las actualizaciones. Encargado de pulir los scripts, corregir errores técnicos de diseño, estructurar los JSON y añadir manualmente los nuevos niveles aceptados a las listas.
            </p>
          </div>
          <div style="display: flex; justify-content: center; margin-top: auto;">
            <a href="https://discord.com/users/#" target="_blank" style="color: #5865f2; text-decoration: none; font-size: 0.85rem; font-weight: bold; background: rgba(88,101,242,0.1); padding: 6px 24px; border-radius: var(--radius-sm);">Discord</a>
          </div>
        </div>

      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-card); padding: 32px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
        <h3 style="font-family: var(--font-ui); color: var(--accent-primary); font-size: 1.3rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          📖 El Nacimiento del Proyecto
        </h3>
        <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 16px;">
          Esta página nació con el objetivo de recopilar y preservar los récords de la comunidad de Shiku, creando un espacio donde los jugadores puedan compartir sus logros, desafíos y momentos más destacados dentro de la comunidad. La idea principal no habría sido posible sin los aportes y comentarios de <strong>Kepta</strong> y <strong>Krinsi</strong>, cuyas ideas sirvieron como inspiración para darle forma a este proyecto de la mejor manera posible.
        </p>
        <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 16px;">
          Además de la lista principal de récords, la página también cuenta con un apartado dedicado a los Challenges, un espacio único donde los miembros de la comunidad pueden crear, compartir y subir sus propios retos para que otros jugadores puedan intentarlos. Con el tiempo, el proyecto fue creciendo e incorporando nuevos apartados y funciones pensadas para la comunidad.
        </p>
        <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 16px;">
          La primera versión de la página fue, de hecho, un overlay editable extraído de un repositorio público de GitHub perteneciente a <em>The Shitty List</em>, el cual utilizamos como base inicial para comenzar el proyecto y aprender durante el proceso:
        </p>
        
        <ul style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 24px; padding-left: 20px;">
          <li style="margin-bottom: 6px;">Repositorio original: <a href="https://github.com/TheShittyList/GDListTemplate" target="_blank" style="color: var(--accent-primary); text-decoration: underline;">The Shitty List Template</a></li>
          <li style="margin-bottom: 6px;">Página original de TSL: <a href="https://tsl.pages.dev/#/" target="_blank" style="color: var(--accent-primary); text-decoration: underline;">The Shitty List</a></li>
        </ul>

        <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 24px;">
          La versión anterior de nuestra página seguirá disponible como recuerdo de nuestros inicios y de cómo comenzó todo este pequeño proyecto comunitario:<br>
          🚀 <a href="https://proyecto-skl.github.io/#/" target="_blank" style="color: var(--accent-primary); font-weight: bold; text-decoration: underline;">Proyecto SKL (versión antigua)</a>
        </p>

        <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; font-style: italic; margin-bottom: 0; border-left: 2px solid var(--accent-primary); padding-left: 12px;">
          Nada de esto fue hecho con la intención de ser algo serio o competitivo; simplemente nació como un proyecto por diversión, creatividad y pasión por la comunidad.
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
