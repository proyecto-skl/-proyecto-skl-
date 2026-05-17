/**
 * pages/news.js — News & Blog page module
 *
 * Renders news/blog posts from:
 *   data/news/posts.json
 *
 * HOW ADMINS ADD POSTS:
 *   1. Edit data/news/posts.json in the GitHub repository
 *   2. Add a new object at the TOP of the array (newest first)
 *   3. Commit & push — GitHub Pages auto-deploys in ~1 minute
 *
 * No login, no database, no server needed.
 * Only people with repo access can publish.
 */

import { fetchJSON, simpleMarkdown, formatDate } from '../js/app.js';

const DATA_URL = 'data/news/posts.json';

/* ── State ──────────────────────────────────────────────────── */
let allPosts   = [];
let activePost = null;

/* ── Main render function ───────────────────────────────────── */
export async function render(container) {
  try {
    allPosts = await fetchJSON(DATA_URL);
  } catch (err) {
    container.innerHTML = errorState('Could not load news data.', err.message);
    return;
  }

  container.innerHTML = buildHTML(allPosts);

  // Wire up card clicks
  container.querySelectorAll('.news-card').forEach((card, i) => {
    card.addEventListener('click', () => openPost(allPosts[i], container));
  });
}

/* ── Build posts grid ───────────────────────────────────────── */
function buildHTML(posts) {
  return `
    <div id="news-list-view">
      <div class="page-header">
        <div class="page-header-inner">
          <div>
            <h1 class="page-title">News & <span>Updates</span></h1>
            <p class="page-subtitle">Official announcements from the list team</p>
            <div class="page-title-bar"></div>
          </div>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat-pill">📰 <strong>${posts.length}</strong> posts</div>
        <div class="stat-pill">🕐 Latest: <strong>${formatDate(posts[0]?.date)}</strong></div>
      </div>

      <div class="news-grid">
        ${posts.map((post, i) => newsCard(post, i)).join('')}
      </div>
    </div>

    <!-- Post detail view (hidden initially) -->
    <div id="news-post-view" class="post-detail"></div>
  `;
}

/* ── News card template ─────────────────────────────────────── */
function newsCard(post, index) {
  const stagger = `stagger-${Math.min(index + 1, 5)}`;

  return `
    <article class="news-card ${stagger}" role="button" tabindex="0" aria-label="Read: ${escapeHTML(post.title)}">
      <div class="news-card-body">
        <span class="news-category-badge">${escapeHTML(post.category)}</span>
        <h2 class="news-card-title">${escapeHTML(post.title)}</h2>
        <p class="news-card-excerpt">${escapeHTML(post.excerpt)}</p>
        <div class="news-card-footer">
          <span>By ${escapeHTML(post.author)}</span>
          <span>${formatDate(post.date)}</span>
        </div>
      </div>
    </article>`;
}

/* ── Post detail view ───────────────────────────────────────── */
function openPost(post, container) {
  activePost = post;

  const listView = container.querySelector('#news-list-view');
  const postView = container.querySelector('#news-post-view');
  if (!listView || !postView) return;

  const tagsHTML = (post.tags ?? [])
    .map(t => `<span class="tag">${escapeHTML(t)}</span>`)
    .join(' ');

  postView.innerHTML = `
    <button class="post-back-btn" id="post-back-btn">
      ← Back to News
    </button>

    <div class="post-content-body">
      <span class="news-category-badge">${escapeHTML(post.category)}</span>
      <h1 class="page-title" style="margin-top:12px;margin-bottom:8px;">
        ${escapeHTML(post.title)}
      </h1>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
        <span style="font-family:var(--font-body);font-size:0.8rem;color:var(--text-muted);">
          By <strong style="color:var(--text-secondary)">${escapeHTML(post.author)}</strong>
          — ${formatDate(post.date)}
        </span>
        <div>${tagsHTML}</div>
      </div>

      <div class="post-article-content" style="
        border-top: 1px solid var(--border-subtle);
        padding-top: 24px;
      ">
        ${simpleMarkdown(post.content ?? '')}
      </div>
    </div>`;

  // Show post, hide list
  listView.style.display = 'none';
  postView.classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Back button
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
  postView.classList.remove('active');
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
    <div class="state-message">
      <div class="state-icon">😵</div>
      <p>${msg}</p>
      <p style="font-size:0.75rem;margin-top:8px;color:var(--text-muted)">${detail}</p>
    </div>`;
}
