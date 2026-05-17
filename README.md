# 🔥 Demon List — Geometry Dash Community Rankings

A modern, open-source community ranking site for Geometry Dash Extreme Demons and Challenges. Designed for GitHub Pages with zero server requirements.

---

## 📁 Project Structure

```
demonlist/
│
├── index.html                  # Entry point — single HTML shell for the whole app
│
├── css/
│   └── main.css                # Global design system (variables, layout, components)
│
├── js/
│   ├── app.js                  # Core: router, navigation, shared utilities
│   └── pages/
│       ├── mainlist.js         # Main List page — loads data/levels/mainlist.json
│       ├── challenges.js       # Challenge List page — loads data/challenges/challengelist.json
│       ├── leaderboard.js      # Leaderboard page — loads data/leaderboard.json
│       └── news.js             # News/Blog page — loads data/news/posts.json
│
├── data/
│   ├── levels/
│   │   └── mainlist.json       # ← EDIT THIS to add/remove Main List levels
│   ├── challenges/
│   │   └── challengelist.json  # ← EDIT THIS to add/remove Challenges
│   ├── news/
│   │   └── posts.json          # ← EDIT THIS to publish news posts (admins only)
│   └── leaderboard.json        # ← EDIT THIS to update player rankings
│
└── README.md                   # This file
```

---

## 🚀 Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root folder**
4. Your site will be live at `https://yourusername.github.io/repositoryname`

> No build steps. No dependencies. Pure HTML/CSS/JS.

---

## 📝 Adding Content (Admins Only)

Since the site runs entirely from JSON files, only people with **write access to the GitHub repository** can publish content. No login panel needed.

### ➕ Add a level to the Main List

Edit `data/levels/mainlist.json`. Add a new object to the array:

```json
{
  "rank": 6,
  "name": "Your Level Name",
  "id": "12345678",
  "creator": "CreatorName",
  "verifier": "VerifierName",
  "videoId": "YOUTUBE_VIDEO_ID",
  "thumbnail": "",
  "difficulty": "Extreme Demon",
  "points": 940,
  "tags": ["extreme", "deco"],
  "description": "Short description of the level.",
  "dateAdded": "2024-04-01"
}
```

**Tags available:** `extreme`, `classic`, `deco`, `buffed`, `skill`, `silent`, `collab`, `mega-collab`, `technical`

> ⚠️ The Main List (`data/levels/mainlist.json`) and Challenge List (`data/challenges/challengelist.json`) are **completely separate**. Editing one never affects the other.

---

### ➕ Add a Challenge

Edit `data/challenges/challengelist.json`. Same structure as above, with `"type": "challenge"`.

> Challenges have their own JSON file and their own page. They are never auto-synced with the Main List.

---

### 📰 Publish a News Post

Edit `data/news/posts.json`. Add a new object at the **top** of the array (newest first):

```json
{
  "id": "news-004",
  "title": "Your Post Title",
  "slug": "your-post-slug",
  "author": "Admin",
  "date": "2024-04-01",
  "category": "announcement",
  "tags": ["update"],
  "thumbnail": "",
  "excerpt": "Short preview shown on the news grid.",
  "content": "Full post content here.\n\nSupports **bold**, ## Headings, and - list items."
}
```

**Categories:** `announcement`, `list-update`, `rules`, `community`, `event`

**Content supports basic Markdown:**
- `## Heading` → H2
- `**bold**` → bold
- `- item` → list item
- Double newline → paragraph break

---

### 🏆 Update the Leaderboard

Edit `data/leaderboard.json`. Each player object:

```json
{
  "rank": 1,
  "name": "PlayerName",
  "country": "US",
  "countryFlag": "🇺🇸",
  "totalPoints": 5000,
  "completions": 15,
  "verifications": 4,
  "avatar": "",
  "socials": {
    "youtube": "https://youtube.com/...",
    "twitch": ""
  }
}
```

---

## 🎨 Customization

### Colors & Branding

All colors are CSS Custom Properties in `css/main.css` under `:root`. Change:

```css
--accent-primary:   #e8412a;   /* Main red accent */
--accent-secondary: #ff6b35;   /* Hover/secondary */
--bg-base:          #080b12;   /* Page background */
```

### Adding a New Page

1. Create `js/pages/yourpage.js` — export a `render(container)` function
2. Add a route in `js/app.js` ROUTES object: `'yourpage': () => loadPage('yourpage')`
3. Add a nav link in `index.html`:
   ```html
   <a href="#yourpage" class="nav-link" data-page="yourpage">
     <span class="nav-icon">🆕</span>
     Your Page
   </a>
   ```

---

## 🔒 Security Model

- **No user authentication** — no login, no sessions, no cookies
- **Admin access = GitHub write access** — whoever can commit to the repo can update content
- **No backend** — all data is static JSON, served by GitHub Pages CDN
- **XSS prevention** — all user-facing data is HTML-escaped before rendering

---

## 🛠 Technology

| Layer       | Technology            |
|-------------|----------------------|
| Hosting     | GitHub Pages (free)  |
| Markup      | HTML5                |
| Styling     | CSS3 (custom props)  |
| Scripting   | Vanilla JS (ES2020)  |
| Data        | Static JSON files    |
| Fonts       | Google Fonts (CDN)   |
| Build tool  | None                 |
| Dependencies| None                 |

---

## 📄 License

MIT — Free to use, fork, and modify.
