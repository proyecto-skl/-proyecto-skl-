/**
 * pages/news.js — News & Blog page module con carga dinámica dividida
 */

import { simpleMarkdown, formatDate } from '../app.js';

/* ── State ──────────────────────────────────────────────────── */
let allPosts   = [];
let activePost = null;

/* ── Main render function ───────────────────────────────────── */
export async function render(container) {
  // Estado de carga inicial limpio sin caracteres de escape rotos
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;">Cargando noticias y anuncios...</p>
    </div>
  `;

  try {
    // 1. Buscamos de forma segura la raíz de la aplicación para evitar fallos de red en GitHub Pages
    const loc = window.location;
    const rootUrl = loc.protocol + '//' + loc.host + loc.pathname.replace(/\/(js\/pages|pages)\/.*$/, '').replace(/\/index\.html$/, '').replace(/\/$/, '');

    // 2. Traemos el índice general de posteos de noticias (_list.json)
    const listResponse = await fetch(`${rootUrl}/data/news/_list.json`);
    if (!listResponse.ok) {
      throw new Error(`Error ${listResponse.status}: No se encontró el archivo _list.json en data/news/`);
    }
    const postFiles = await listResponse.json();

    // 3. Resolvemos concurrentemente las llamadas a cada JSON individual
    const postPromises = postFiles.map(async (fileName) => {
      try {
        const res = await fetch(`${rootUrl}/data/news/${fileName.trim()}.json`);
        if (!res.ok) return null;
        return await res.json();
      } catch (err) {
        console.error(`Error cargando la noticia: ${fileName}`, err);
        return null;
      }
    });

    const posts = await Promise.all(postPromises);
    // Filtramos posibles entradas rotas o nulas
    allPosts = posts.filter(p => p !== null);

    if (allPosts.length === 0) {
      container.innerHTML = `<div class="state-message"><p>No hay noticias publicadas en este momento.</p></div>`;
      return;
    }

    // 4. Inyectamos la estructura visual una vez que los datos están listos
    container.innerHTML = buildHTML(allPosts);

    // Conectamos los manejadores de eventos click a las tarjetas
    container.querySelectorAll('.news-card').forEach((card) => {
      card.addEventListener('click', () => {
        const postId = card.getAttribute('data-id');
        const selectedPost = allPosts.find(p => p.id === postId);
        if (selectedPost) openPost(selectedPost, container);
      });
    });

  } catch (err) {
    container.innerHTML = errorState('Could not load news data.', err.message);
  }
}

/* ── Build posts grid ───────────────────────────────────────── */
function buildHTML(posts) {
  const cardsHTML = posts.map((post, index) => {
    const dateStr = formatDate(post.date);
    const stagger = `stagger-${Math.min(index + 1, 5)}`;
    
    return `
      <div class="news-card ${stagger}" data-id="${post.id}" style="cursor: pointer;">
        <div class="news-card-header">
          <span class="news-date">${dateStr}</span>
          <span class="news-tag">${escapeHTML(post.category ?? 'update')}</span>
        </div>
        <h2 class="news-title">${escapeHTML(post.title)}</h2>
        <p class="news-body">${escapeHTML(post.excerpt ?? '')}</p>
      </div>`;
  }).join('\n');

  return `
    <div id="news-list-view">
      <div class="page-header">
        <div class="page-header-inner">
          <div>
            <h1 class="page-title"><span>News</span> & Updates</h1>
            <p class="page-subtitle">Official announcements, list updates, and community logs</p>
            <div class="page-title-bar"></div>
          </div>
        </div>
      </div>

      <div class="news-feed">
        ${cardsHTML}
      </div>
    </div>
    <div id="news-post-view" class="post-article-view" style="display: none;"></div>
  `;
}

/* ── Open single post view ──────────────────────────────────── */
function openPost(post, container) {
  activePost = post;
  const listView = container.querySelector('#news-list-view');
  const postView = container.querySelector('#news-post-view');
  if (!listView || !postView) return;

  const tagsHTML = (post.tags ?? []).map(t => `<span class="news-tag" style="margin-right:6px;">#${escapeHTML(t)}</span>`).join('');

  postView.innerHTML = `
    <div class="post-article-card animate-fadeIn">
      <button id="post-back-btn" class="topbar-btn-cta" style="margin-bottom: 24px; height: 32px; padding: 0 12px; font-size: 0.8rem;">
        ← Volver a noticias
      </button>

      <div class="post-article-header" style="margin-bottom: 20px;">
        <h1 class="page-title" style="font-size: 2rem; margin-bottom: 8px;">${escapeHTML(post.title)}</h1>
        <span class="news-date" style="display:block; margin-bottom:12px;">
          Por <strong style="color:var(--text-secondary)">${escapeHTML(post.author)}</strong> — ${formatDate(post.date)}
        </span>
        <div>${tagsHTML}</div>
      </div>

      <div class="post-article-content" style="border-top: 1px solid var(--border-card); padding-top: 24px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary);">
        ${simpleMarkdown(post.content ?? '')}
      </div>
    </div>`;

  // Ocultamos la lista y mostramos el artículo
  listView.style.display = 'none';
  postView.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Evento para el botón de regreso
  postView.querySelector('#post-back-btn')?.addEventListener('click', () => {
    closePost(container);
  });
}

function closePost(container) {
  activePost = null;
  const listView = container.querySelector('#news-list-view');
  const postView = container.querySelector('#news-post-view');
  if (!listView || !postView) return;

  listView.style.display = '';
  postView.style.display = 'none';
  postView.innerHTML = '';
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
    <div class="state-message" style="color: #ff4545; padding: 40px var(--space-md);">
      <p style="font-family: var(--font-ui); font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">⚠️ ${escapeHTML(msg)}</p>
      ${detail ? `<p style="font-size: 0.85rem; color: var(--text-muted); font-family: monospace;">${escapeHTML(detail)}</p>` : ''}
    </div>`;
}
