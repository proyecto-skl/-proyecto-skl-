/**
 * pages/mainlist.js — Main List page module
 *
 * Renders the ranked list of extreme demons from:
 *   data/levels/mainlist.json
 *
 * This module is ONLY responsible for the Main List.
 * It never reads from challengelist.json.
 */

import { fetchJSON, formatDate } from '../js/app.js';

/* ── Data path ──────────────────────────────────────────────── */
const DATA_URL = 'data/levels/mainlist.json';

/* ── Main render function ───────────────────────────────────── */
export async function render(container) {
  let levels;

  try {
    levels = await fetchJSON(DATA_URL);
  } catch (err) {
    container.innerHTML = errorState('Could not load Main List data.', err.message);
    return;
  }

  container.innerHTML = buildHTML(levels);

  // Wire up card click → detail panel
  container.querySelectorAll('.level-card').forEach((card, i) => {
    card.addEventListener('click', () => openDetail(levels[i]));
  });

  // Detail overlay close
  container.querySelector('.detail-overlay')?.addEventListener('click', e => {
    if (e.target.classList.contains('detail-overlay')) closeDetail();
  });

  container.querySelector('.detail-close')?.addEventListener('click', closeDetail);
}

/* ── Build page HTML ────────────────────────────────────────── */
function buildHTML(levels) {
  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h1 class="page-title">Main <span>List</span></h1>
          <p class="page-subtitle">The definitive ranking of the hardest Extreme Demons</p>
          <div class="page-title-bar"></div>
        </div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-pill">📋 <strong>${levels.length}</strong> levels ranked</div>
      <div class="stat-pill">🔥 Top rated: <strong>${levels[0]?.name ?? '—'}</strong></div>
      <div class="stat-pill">⭐ Max points: <strong>${levels[0]?.points ?? 0}</strong></div>
    </div>

    <div class="level-list" id="main-level-list">
      ${levels.map((lvl, i) => levelCard(lvl, i)).join('')}
    </div>

    <!-- Detail panel (hidden by default) -->
    <div class="detail-overlay" id="main-detail-overlay">
      <div class="detail-panel" id="main-detail-panel">
        <button class="detail-close" aria-label="Close">✕</button>
        <div id="main-detail-content"></div>
      </div>
    </div>
  `;
}

/* ── Level card template ────────────────────────────────────── */
function levelCard(lvl, index) {
  const isTop3 = lvl.rank <= 3;
  const rankClass = isTop3 ? 'level-rank top3' : 'level-rank';
  const stagger = `stagger-${Math.min(index + 1, 5)}`;
  const tagsHTML = (lvl.tags ?? [])
    .map(t => `<span class="tag ${t}">${t}</span>`)
    .join('');

  return `
    <div class="level-card ${stagger}" role="button" tabindex="0" aria-label="View ${lvl.name}">
      <div class="${rankClass}">#${lvl.rank}</div>
      <div class="level-info">
        <div class="level-name">${escapeHTML(lvl.name)}</div>
        <div class="level-meta">
          <span class="level-creator">By ${escapeHTML(lvl.creator)}</span>
          <span class="level-sep">·</span>
          <span class="level-verifier">Ver. ${escapeHTML(lvl.verifier)}</span>
        </div>
        <div class="level-tags">${tagsHTML}</div>
      </div>
      <div class="level-points">
        ${lvl.points}
        <small>points</small>
      </div>
    </div>`;
}

/* ── Detail panel ───────────────────────────────────────────── */
function openDetail(lvl) {
  const overlay  = document.getElementById('main-detail-overlay');
  const content  = document.getElementById('main-detail-content');
  if (!overlay || !content) return;

  const tagsHTML = (lvl.tags ?? [])
    .map(t => `<span class="tag ${t}">${t}</span>`)
    .join(' ');

  content.innerHTML = `
    <div class="detail-video">
      <iframe
        src="https://www.youtube.com/embed/${lvl.videoId}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy">
      </iframe>
    </div>
    <div class="detail-body">
      <div class="detail-rank-badge">Rank #${lvl.rank} — Main List</div>
      <h2 class="detail-name">${escapeHTML(lvl.name)}</h2>
      <div class="level-tags" style="margin-bottom:16px;">${tagsHTML}</div>
      <div class="detail-meta-grid">
        <div class="detail-meta-item">
          <label>Creator</label>
          <span>${escapeHTML(lvl.creator)}</span>
        </div>
        <div class="detail-meta-item">
          <label>Verifier</label>
          <span>${escapeHTML(lvl.verifier)}</span>
        </div>
        <div class="detail-meta-item">
          <label>Level ID</label>
          <span>${escapeHTML(lvl.id)}</span>
        </div>
        <div class="detail-meta-item">
          <label>Points</label>
          <span style="color:var(--accent-gold);font-family:var(--font-display)">${lvl.points}</span>
        </div>
        <div class="detail-meta-item">
          <label>Difficulty</label>
          <span>${escapeHTML(lvl.difficulty ?? 'Extreme Demon')}</span>
        </div>
        <div class="detail-meta-item">
          <label>Date Added</label>
          <span>${formatDate(lvl.dateAdded)}</span>
        </div>
      </div>
      <p class="detail-description">${escapeHTML(lvl.description ?? '')}</p>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('main-detail-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
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
