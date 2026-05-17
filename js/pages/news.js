/**
 * pages/news.js — News & Blog page module
 * Adaptado para la carga por lotes individuales mediante un índice unificado
 */

import { fetchJSON, simpleMarkdown, formatDate } from '../js/app.js';

/* ── State ──────────────────────────────────────────────────── */
let allPosts   = [];
let activePost = null;

/* ── Main render function ───────────────────────────────────── */
export async function render(container) {
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando novedades...</p>
    </div>
  `;

  try {
    // 1. Buscamos el índice general de entradas distribuidas
    const listResponse = await fetch('data/news/_list.json');
    if (!listResponse.ok) {
      throw new Error('No se encontró el archivo de índice de noticias (_list.json)');
    }
    const postFiles = await listResponse.json();

    // 2. Mapeamos y resolvemos de forma paralela cada archivo individual
    const postPromises = postFiles.map(async (fileName) => {
      try {
        const res = await fetch(`data/news/${fileName.trim()}.json`);
        if (!res.ok) return null;
        return await res.json();
      } catch (err) {
        console.error(`Error cargando la noticia individual: ${fileName}`, err);
        return null;
      }
    });

    const posts = await Promise.all(postPromises);
    allPosts = posts.filter(p => p !== null);

    if (allPosts.length === 0) {
      container.innerHTML = `<p class="state-message">No hay noticias publicadas actualmente.</p>`;
      return;
    }

    // 3. Imprimimos el feed estructurado
    container.innerHTML = buildHTML(allPosts);

    // Adjuntamos escuchas de eventos de clic en las tarjetas generadas
    container.querySelectorAll('.news-card').forEach((card, i) => {
      card.addEventListener('click', () => openPost(allPosts[i], container));
    });

  } catch (err) {
    container.innerHTML = errorState('Could not load news data.', err.message);
  }
}

/* ── Build posts grid ───────────────────────────────────────── */
function buildHTML(posts) {
  const cardsHTML = posts.map((post, index) => {
    const tagsHTML = (post.tags || []).map(tag => `<span class="news-tag">#${escapeHTML(tag)}</span>`).join(' ');
    const stagger = `stagger-${Math.min(index + 1, 5)}`;
    
    return `
      <div class="news-card ${stagger}" style="cursor: pointer;">
        <div class="news-card-header">
          <span class="news-date">${formatDate(post.date)}</span>
          <span class="news-tag" style="text-transform: uppercase;">${escapeHTML(post.category || 'Update')}</span>
        </div>
        <h2 class="news-title">${escapeHTML(post.title)}</h2>
        <p class="news-body">${escapeHTML(post.excerpt || '')}</p>
        <div style="margin-top: 14px; display: flex; gap: 6px; flex-wrap: wrap;">
          ${tagsHTML}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div id=\"news-list-view\">
      <div class=\"page-header\">
        <div class=\"page-header-inner\">
          <div>
            <h1 class=\"page-title\"><span>Latest</span> News</h1>
            <p class=\"page-subtitle\">Official updates, community announcements and list logs</p>
            <div class=\"page-title-bar\"></div>
          </div>
        </div>
      </div>
      <div class=\"news-feed\">
        ${cardsHTML}
      </div>
    </div>
    <div id=\"news-post-view\" style="display: none;"></div>
  `;
}

/* ── Open single post article view ──────────────────────────── */
function openPost(post, container) {
  activePost = post;
  const listView = container.querySelector('#news-list-view');
  const postView = container.querySelector('#news-post-view');
  if (!listView || !postView) return;

  const tagsHTML = (post.tags || []).map(tag => `<span class="news-tag">#${escapeHTML(tag)}</span>`).join(' ');

  postView.innerHTML = `
    <div class="post-article" style="animation: cardIn 0.3s ease both;">
      <button id="post-back-btn" class="topbar-btn-cta" style="margin-bottom: 24px; height: 32px; padding: 0 12px; font-size: 0.75rem;">
        ← Volver a Noticias
      </button>
      
      <div class="page-header" style="margin-bottom: 16px;">
        <span class="news-date">${formatDate(post.date)}</span>
        <h1 class="page-title" style="margin-top: 8px; font-size: 2rem;">${escapeHTML(post.title)}</h1>
        <div class="page-title-bar"></div>
      </div>

      <div class="news-card-header" style="justify-content: flex-start; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--border-card); padding-bottom: 16px;">
        <span class="card-author" style="font-size: 0.9rem; color: var(--text-secondary);">
          Por <strong style="color: var(--text-primary);">${escapeHTML(post.author)}</strong>
        </span>
        <div style="display: flex; gap: 6px;">${tagsHTML}</div>
      </div>

      <div class="post-article-content" style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary);">
        ${simpleMarkdown(post.content ?? '')}
      </div>
    </div>`;

  // Controladores visuales de visualización mutua
  listView.style.display = 'none';
  postView.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  postView.querySelector('#post-back-btn')?.addEventListener('click', () => {
    closePost(container);
  });
}

/* ── Close view single post ─────────────────────────────────── */
function closePost(container) {
  activePost = null;
  const listView = container.querySelector('#news-list-view');
  const postView = container.querySelector('#news-post-view');
  if (!listView || !postView) return;

  listView.style.display = '';
  postView.style.display = 'none';
  postView.innerHTML = '';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Helpers ────────────────────────────────────────────────── */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function errorState(msg, detail = '') {
  return `
    <div class="state-message" style="color: #ff5533;">
      <p>⚠️ ${escapeHTML(msg)}</p>
      ${detail ? `<p style="font-size:0.85rem; color:var(--text-muted); margin-top:8px;">${escapeHTML(detail)}</p>` : ''}
    </div>
  `;
}
