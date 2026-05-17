/**
 * pages/challenges.js — Challenges page module
 *
 * Renders the challenge list from:
 *   data/challenges/challengelist.json
 *
 * ⚠️ IMPORTANT: This module is 100% independent from mainlist.js.
 * It loads its OWN data file. No data is shared between them.
 */

import { fetchJSON, formatDate } from '../js/app.js';

/* ── Data path ──────────────────────────────────────────────── */
const DATA_URL = 'data/challenges/challengelist.json';
// NOTE: This is intentionally different from data/levels/mainlist.json

/* ── Main render function ───────────────────────────────────── */
export async function render(container) {
  let challenges;

  try {
    challenges = await fetchJSON(DATA_URL);
  } catch (err) {
    container.innerHTML = errorState('Could not load Challenge List data.', err.message);
    return;
  }

  container.innerHTML = buildHTML(challenges);

  // Wire up card click → detail panel
  container.querySelectorAll('.level-card').forEach((card, i) => {
    card.addEventListener('click', () => openDetail(challenges[i]));
  });

  container.querySelector('.detail-overlay')?.addEventListener('click', e => {
    if (e.target.classList.contains('detail-overlay')) closeDetail();
  });

  container.querySelector('.detail-close')?.addEventListener('click', closeDetail);
}

/* ── Build page HTML ────────────────────────────────────────── */
function buildHTML(challenges) {
  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h1 class="page-title">Challenge <span>List</span></h1>
          <p class="page-subtitle">Dedicated rankings for skill-based GD challenges</p>
          <div class="page-title-bar"></div>
        </div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-pill">⚔️ <strong>${challenges.length}</strong> challenges ranked</div>
      <div class="stat-pill">🏆 Top challenge: <strong>${challenges[0]?.name ?? '—'}</strong></div>
      <div class="stat-pill">💠 Max points: <strong>${challenges[0]?.points ?? 0}</strong></div>
    </div>

    <div class="level-list" id="challenge-level-list">
      ${challenges.map((ch, i) => challengeCard(ch, i)).join('')}
    </div>

    <!-- Detail panel (hidden by default) -->
    <div class="detail-overlay" id="challenge-detail-overlay">
      <div class="detail-panel" id="challenge-detail-panel">
        <button class="detail-close" aria-label="Close">✕</button>
        <div id="challenge-detail-content"></div>
      </div>
    </div>
  `;
}

/* ── Challenge card template ────────────────────────────────── */
function challengeCard(ch, index) {
  const isTop3 = ch.rank <= 3;
  const rankClass = isTop3 ? 'level-rank top3' : 'level-rank';
  const stagger = `stagger-${Math.min(index + 1, 5)}`;
  const tagsHTML = (ch.tags ?? [])
    .map(t => `<span class="tag ${t}">${t}</span>`)
    .join('');

  return `
    <div class="level-card ${stagger}" role="button" tabindex="0" aria-label="View ${ch.name}">
      <div class="${rankClass}">#${ch.rank}</div>
      <div class="level-info">
        <div class="level-name">${escapeHTML(ch.name)}</div>
        <div class="level-meta">
          <span class="level-creator">By ${escapeHTML(ch.creator)}</span>
          <span class="level-sep">·</span>
          <span class="level-verifier">Ver. ${escapeHTML(ch.verifier)}</span>
        </div>
        <div class="level-tags">${tagsHTML}</div>
      </div>
      <div class="level-points">
        ${ch.points}
        <small>points</small>
      </div>
    </div>`;
}

/* ── Detail panel ───────────────────────────────────────────── */
function openDetail(ch) {
  const overlay = document.getElementById('challenge-detail-overlay');
  const content = document.getElementById('challenge-detail-content');
  if (!overlay || !content) return;

  const tagsHTML = (ch.tags ?? [])
    .map(t => `<span class="tag ${t}">${t}</span>`)
    .join(' ');

  content.innerHTML = `
    <div class="detail-video">
      <iframe
        src="https://www.youtube.com/embed/${ch.videoId}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy">
      </iframe>
    </div>
    <div class="detail-body">
      <div class="detail-rank-badge">Rank #${ch.rank} — Challenge List</div>
      <h2 class="detail-name">${escapeHTML(ch.name)}</h2>
      <div class="level-tags" style="margin-bottom:16px;">${tagsHTML}</div>
      <div class="detail-meta-grid">
        <div class="detail-meta-item">
          <label>Creator</label>
          <span>${escapeHTML(ch.creator)}</span>
        </div>
        <div class="detail-meta-item">
          <label>Verifier</label>
          <span>${escapeHTML(ch.verifier)}</span>
        </div>
        <div class="detail-meta-item">
          <label>Level ID</label>
          <span>${escapeHTML(ch.id)}</span>
        </div>
        <div class="detail-meta-item">
          <label>Points</label>
          <span style="color:var(--accent-gold);font-family:var(--font-display)">${ch.points}</span>
        </div>
        <div class="detail-meta-item">
          <label>Type</label>
          <span style="text-transform:capitalize">${escapeHTML(ch.type ?? 'challenge')}</span>
        </div>
        <div class="detail-meta-item">
          <label>Date Added</label>
          <span>${formatDate(ch.dateAdded)}</span>
        </div>
      </div>
      <p class="detail-description">${escapeHTML(ch.description ?? '')}</p>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('challenge-detail-overlay')?.classList.remove('open');
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
