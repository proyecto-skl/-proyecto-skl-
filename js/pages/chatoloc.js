/**
 * pages/chatoloc.js — Galería "Chat Out of Context"
 *
 * Lee data/imag/_list.json y muestra las imágenes
 * en una galería estilo Google Images.
 * Al hacer click abre un popup con la imagen ampliada,
 * el nombre formateado y la fecha extraída del nombre del archivo.
 */

export async function render(container) {
  injectStyles();

  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando imágenes...</p>
    </div>
  `;

  try {
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host +
      loc.pathname
        .replace(/\/(js\/pages|pages)\/.*$/, '')
        .replace(/\/index\.html$/, '')
        .replace(/\/$/, '');

    const listRes = await fetch(`${rootUrl}/data/imag/_list.json`);
    if (!listRes.ok) throw new Error(`Error ${listRes.status}: No se encontró _list.json en data/imag/`);
    const files = await listRes.json();

    if (!files || files.length === 0) {
      container.innerHTML = `
        <div class="state-message">
          <p style="font-size:1.1rem;">📭 No hay imágenes publicadas todavía.</p>
        </div>`;
      return;
    }

    // Construimos los objetos de cada imagen parseando el nombre de archivo
    const images = files.map(filename => parseImageFile(filename, rootUrl));

    container.innerHTML = `
      <div class="ooc-page">
        <div class="ooc-header">
          <h1 class="ooc-title">Chat <span>Out of Context</span></h1>
          <p class="ooc-subtitle">${images.length} imágene${images.length !== 1 ? 's' : ''} publicada${images.length !== 1 ? 's' : ''}</p>
          <div class="page-title-bar"></div>
        </div>
        <div class="ooc-gallery">
          ${images.map((img, i) => `
            <div class="ooc-item stagger-${Math.min(i + 1, 5)}" data-index="${i}" tabindex="0" role="button" aria-label="Ver ${img.displayName}">
              <div class="ooc-img-wrapper">
                <img src="${img.src}" alt="${img.displayName}" loading="lazy" class="ooc-img" />
                <div class="ooc-overlay">
                  <span class="ooc-overlay-icon">🔍</span>
                </div>
              </div>
              <div class="ooc-caption">
                <span class="ooc-caption-name">${img.displayName}</span>
                <span class="ooc-caption-date">${img.displayDate}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Eventos de click y teclado para cada item
    container.querySelectorAll('.ooc-item').forEach(item => {
      const open = () => {
        const idx = parseInt(item.getAttribute('data-index'));
        openImageModal(images[idx]);
      };
      item.addEventListener('click', open);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
    });

  } catch (err) {
    container.innerHTML = `
      <div class="state-message" style="color:#f85149; padding:40px var(--space-md);">
        <p style="font-family:var(--font-ui);font-size:1.1rem;font-weight:bold;margin-bottom:8px;">⚠️ Error al cargar la galería</p>
        <p style="font-size:0.8rem;color:var(--text-muted);font-family:monospace;">${err.message}</p>
      </div>`;
    console.error('[ChatOOC]', err);
  }
}

/* ── Parseo del nombre de archivo ───────────────────────────── */

/**
 * Dado un nombre como "palo_en_el_qlo_2026-05-07.png"
 * devuelve:
 *   displayName  → "palo en el qlo"
 *   displayDate  → "2026 · 05 · 07"
 *   src          → URL completa a la imagen
 */
function parseImageFile(filename, rootUrl) {
  // Quitamos la extensión
  const noExt = filename.replace(/\.png$/i, '');

  // Intentamos detectar la fecha al final: _YYYY-MM-DD
  const datePattern = /_(\d{4}-\d{2}-\d{2})$/;
  const match = noExt.match(datePattern);

  let rawName = noExt;
  let displayDate = '';

  if (match) {
    rawName = noExt.slice(0, noExt.length - match[0].length); // parte antes de la fecha
    const [year, month, day] = match[1].split('-');
    displayDate = `${year} · ${month} · ${day}`;
  }

  // Reemplazamos guiones bajos y guiones por espacios para mostrar el nombre limpio
  const displayName = rawName.replace(/[_-]/g, ' ').trim();

  return {
    filename,
    src: `${rootUrl}/data/imag/${filename}`,
    displayName,
    displayDate,
  };
}

/* ── Modal / Popup ──────────────────────────────────────────── */

function openImageModal(img) {
  const overlay = document.createElement('div');
  overlay.className = 'ooc-modal-overlay';

  overlay.innerHTML = `
    <div class="ooc-modal-box animate-pop">
      <button class="ooc-modal-close" aria-label="Cerrar">&times;</button>
      <div class="ooc-modal-img-container">
        <img src="${img.src}" alt="${img.displayName}" class="ooc-modal-img" />
      </div>
      <div class="ooc-modal-info">
        <p class="ooc-modal-name">${img.displayName}</p>
        ${img.displayDate ? `<p class="ooc-modal-date">📅 ${img.displayDate}</p>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    overlay.classList.add('animate-fade-out');
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 200);
  };

  overlay.querySelector('.ooc-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
}

/* ── Estilos ────────────────────────────────────────────────── */

function injectStyles() {
  if (document.getElementById('ooc-styles')) return;
  const style = document.createElement('style');
  style.id = 'ooc-styles';
  style.innerHTML = `
    /* ── Página ── */
    .ooc-page {
      padding: var(--space-lg) var(--space-lg) var(--space-xl);
    }

    .ooc-header {
      margin-bottom: var(--space-xl);
    }

    .ooc-title {
      font-family: var(--font-ui);
      font-size: 2rem;
      font-weight: 900;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }

    .ooc-title span {
      color: var(--accent-primary);
      text-shadow: 0 0 12px var(--accent-glow);
    }

    .ooc-subtitle {
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .page-title-bar {
      height: 2px;
      width: 48px;
      background: var(--accent-primary);
      border-radius: 2px;
      box-shadow: 0 0 8px var(--accent-glow);
    }

    /* ── Galería ── */
    .ooc-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .ooc-item {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
      animation: cardIn 0.4s ease both;
      outline: none;
    }

    .ooc-item:hover,
    .ooc-item:focus {
      border-color: var(--accent-primary);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(255, 183, 0, 0.15);
    }

    .ooc-img-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      background: var(--bg-elevated);
    }

    .ooc-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform var(--transition-med);
    }

    .ooc-item:hover .ooc-img {
      transform: scale(1.05);
    }

    .ooc-overlay {
      position: absolute;
      inset: 0;
      background: rgba(8, 11, 18, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }

    .ooc-item:hover .ooc-overlay,
    .ooc-item:focus .ooc-overlay {
      opacity: 1;
    }

    .ooc-overlay-icon {
      font-size: 2rem;
      filter: drop-shadow(0 0 6px rgba(255,183,0,0.6));
    }

    .ooc-caption {
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ooc-caption-name {
      font-family: var(--font-body);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: capitalize;
    }

    .ooc-caption-date {
      font-family: var(--font-body);
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    /* ── Modal ── */
    .ooc-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(8, 11, 18, 0.92);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }

    .ooc-modal-box {
      background: #16161a;
      border: 1px solid #2d2d34;
      border-radius: var(--radius-lg);
      max-width: 860px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(255,183,0,0.06);
      display: flex;
      flex-direction: column;
    }

    .ooc-modal-close {
      position: absolute;
      top: 12px;
      right: 16px;
      font-size: 28px;
      color: var(--text-muted);
      background: none;
      border: none;
      cursor: pointer;
      line-height: 1;
      transition: color var(--transition-fast);
      z-index: 1;
    }

    .ooc-modal-close:hover { color: #f85149; }

    .ooc-modal-img-container {
      width: 100%;
      background: #0e0e12;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .ooc-modal-img {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
      display: block;
    }

    .ooc-modal-info {
      padding: 16px 20px 20px;
      border-top: 1px solid #2d2d34;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ooc-modal-name {
      font-family: var(--font-ui);
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: capitalize;
      letter-spacing: 0.03em;
    }

    .ooc-modal-date {
      font-family: var(--font-body);
      font-size: 0.85rem;
      color: var(--accent-primary);
    }

    /* ── Animaciones del modal ── */
    .animate-pop {
      animation: modalPop 0.25s ease-out forwards;
    }

    .animate-fade-out {
      animation: modalFadeOut 0.2s ease-in forwards;
    }

    @keyframes modalPop {
      from { transform: scale(0.95); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }

    @keyframes modalFadeOut {
      from { transform: scale(1);    opacity: 1; }
      to   { transform: scale(0.95); opacity: 0; }
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .ooc-gallery {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }
      .ooc-title { font-size: 1.4rem; }
    }
  `;
  document.head.appendChild(style);
}
