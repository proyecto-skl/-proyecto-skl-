/**
 * pages/leaderboard.js — Leaderboard page module
 *
 * Renders the player leaderboard from:
 *   data/leaderboard.json
 */

import { fetchJSON } from '../js/app.js';

const DATA_URL = 'data/leaderboard.json';

/* ── Main render function ───────────────────────────────────── */
export async function render(container) {
  let players;

  try {
    players = await fetchJSON(DATA_URL);
  } catch (err) {
    container.innerHTML = errorState('Could not load leaderboard data.', err.message);
    return;
  }

  container.innerHTML = buildHTML(players);
}

/* ── Build page HTML ────────────────────────────────────────── */
function buildHTML(players) {
  const topPlayer = players[0];

  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h1 class="page-title"><span>Leader</span>board</h1>
          <p class="page-subtitle">Top players ranked by total points across all completions</p>
          <div class="page-title-bar"></div>
        </div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-pill">👥 <strong>${players.length}</strong> players ranked</div>
      <div class="stat-pill">🥇 Leader: <strong>${topPlayer?.name ?? '—'}</strong></div>
      <div class="stat-pill">⭐ Top score: <strong>${topPlayer?.totalPoints ?? 0} pts</strong></div>
    </div>

    <!-- Podium (top 3) -->
    <div class="podium" style="display:flex;gap:12px;margin-bottom:32px;flex-wrap:wrap;">
      ${players.slice(0, 3).map(p => podiumCard(p)).join('')}
    </div>

    <!-- Full table -->
    <div style="overflow-x:auto;">
      <table class="leaderboard-table" aria-label="Leaderboard">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Country</th>
            <th>Points</th>
            <th>Completions</th>
            <th>Verifications</th>
          </tr>
        </thead>
        <tbody>
          ${players.map((p, i) => playerRow(p, i)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ── Podium card ────────────────────────────────────────────── */
function podiumCard(p) {
  const medals = ['🥇', '🥈', '🥉'];
  const colors  = ['var(--accent-gold)', '#a0aec0', '#c97d2f'];
  const idx     = p.rank - 1;

  return `
    <div class="podium-card" style="
      flex:1; min-width:200px;
      background:var(--bg-card);
      border:1px solid var(--border-card);
      border-radius:var(--radius-lg);
      padding:20px;
      text-align:center;
      animation: cardIn 0.4s ease ${idx * 0.1}s both;
    ">
      <div style="font-size:2rem;margin-bottom:8px;">${medals[idx]}</div>
      <div style="
        font-family:var(--font-display);
        font-size:1.1rem;
        font-weight:700;
        color:${colors[idx]};
        margin-bottom:4px;
      ">${escapeHTML(p.name)}</div>
      <div style="font-size:1.3rem;">${p.countryFlag}</div>
      <div style="
        font-family:var(--font-display);
        font-size:0.9rem;
        color:var(--accent-gold);
        margin-top:8px;
      ">${p.totalPoints} pts</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
        ${p.completions} completions · ${p.verifications} verifs
      </div>
    </div>`;
}

/* ── Player table row ───────────────────────────────────────── */
function playerRow(p, index) {
  const rankClass = ['gold', 'silver', 'bronze'][index] ?? '';
  const stagger = `stagger-${Math.min(index + 1, 5)}`;

  return `
    <tr class="lb-row ${stagger}">
      <td><span class="lb-rank-num ${rankClass}">#${p.rank}</span></td>
      <td><span class="lb-player-name">${escapeHTML(p.name)}</span></td>
      <td><span class="lb-country" title="${p.country}">${p.countryFlag}</span></td>
      <td><span class="lb-points">${p.totalPoints}</span></td>
      <td><span class="lb-completions">${p.completions}</span></td>
      <td><span class="lb-completions">${p.verifications}</span></td>
    </tr>`;
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
