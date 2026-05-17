/**
 * app.js — Core application logic
 *
 * Responsibilities:
 *  - Client-side routing (hash-based navigation)
 *  - Sidebar toggle for mobile
 *  - Shared utility functions used by all page modules
 *  - Initial app boot (calls router on load + hash change)
 */

/* ── 1. Router ──────────────────────────────────────────────── */

/**
 * ROUTES maps a hash string to the module that renders that page.
 * To add a new page: add a route here and create its JS module.
 */
const ROUTES = {
  ''           : () => loadPage('mainlist'),
  'mainlist'   : () => loadPage('mainlist'),
  'challenges' : () => loadPage('challenges'),
  'leaderboard': () => loadPage('leaderboard'),
  'news'       : () => loadPage('news'),
  'roulette'   : () => loadPage('roulette'),
  'about'      : () => loadPage('about'),
};

/**
 * loadPage(name) — dynamically imports the page module and calls render().
 * The module must export a default function render(container).
 */
async function loadPage(name) {
  const container = document.getElementById('page-outlet');
  if (!container) return;

  // Show loading spinner while module loads
  container.innerHTML = `
    <div class="state-message">
      <div class="spinner"></div>
      <p style="margin-top:16px;font-size:0.85rem;">Loading...</p>
    </div>`;

  try {
    const module = await import(`./pages/${name}.js`);
    await module.render(container);
  } catch (err) {
    container.innerHTML = `
      <div class="state-message">
        <div class="state-icon">⚠️</div>
        <p>Failed to load page: ${name}</p>
        <p style="font-size:0.75rem;margin-top:8px;color:var(--text-muted)">${err.message}</p>
      </div>`;
    console.error('[Router] Failed to load page:', name, err);
  }
}

/**
 * handleRoute() — reads current hash, updates nav, fires route handler.
 */
function handleRoute() {
  const hash = window.location.hash.replace('#', '').split('/')[0];
  const handler = ROUTES[hash] ?? ROUTES[''];
  handler();
  updateActiveNav(hash || 'mainlist');
  closeSidebar();
}

/* ── 2. Navigation highlight ────────────────────────────────── */

function updateActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const target = link.dataset.page;
    link.classList.toggle('active', target === page);
  });

  // Update topbar title
  const titles = {
    mainlist:    'Main List',
    challenges:  'Challenges',
    leaderboard: 'Leaderboard',
    news:        'News & Updates',
  };
  const el = document.getElementById('topbar-title');
  if (el) el.textContent = titles[page] ?? 'Demon List';
}

/* ── 3. Sidebar (mobile) ────────────────────────────────────── */

function toggleSidebar() {
  document.querySelector('.sidebar')?.classList.toggle('open');
}

function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
}

/* ── 4. Search filter ───────────────────────────────────────── */

/**
 * filterCards(query, selector) — hides cards that don't match.
 * Called by individual page modules when search input changes.
 */
function filterCards(query, cardSelector = '.level-card') {
  const q = query.toLowerCase().trim();
  document.querySelectorAll(cardSelector).forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = q === '' || text.includes(q) ? '' : 'none';
  });
}

/* ── 5. Data fetcher ────────────────────────────────────────── */

/**
 * fetchJSON(path) — fetches a JSON file relative to the site root.
 * Throws if the response is not OK.
 */
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  return res.json();
}

/* ── 6. Markdown → HTML (minimal) ──────────────────────────── */

/**
 * simpleMarkdown(text) — converts a small subset of Markdown to HTML.
 * Supports: ## headings, **bold**, newlines → <br>, ordered/unordered lists.
 * This keeps the project dependency-free.
 */
function simpleMarkdown(text) {
  return text
    // Headings
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .split(/\n\n+/)
    .map(block => {
      if (block.startsWith('<h') || block.startsWith('<li')) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

/* ── 7. Date formatter ──────────────────────────────────────── */

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ── 8. Boot ────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Wire up nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.location.hash = link.dataset.page;
    });
  });

  // Mobile menu toggle
  document.querySelector('.menu-toggle')?.addEventListener('click', toggleSidebar);

  // Close sidebar when clicking outside (mobile)
  document.querySelector('.main-content')?.addEventListener('click', closeSidebar);

  // Search bar (delegates to active page)
  document.getElementById('global-search')?.addEventListener('input', e => {
    filterCards(e.target.value);
  });

  // Initial route + listen for changes
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
});

/* ── 9. Exports (used by page modules) ──────────────────────── */
export { fetchJSON, simpleMarkdown, formatDate, filterCards };
