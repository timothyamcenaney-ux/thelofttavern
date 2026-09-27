# The Loft Tavern — Project Handoff for Claude Code

## Who and What
Bar and restaurant at the base of Okemo Mountain, Ludlow VT. Owner: Tim McEnaney.
Live site: **https://www.thelofttavern.com**

---

## Deploy Workflow
**Everything deploys via git push.** No build step, no compile.

```bash
git add <files>
git commit -m "message"
git push
```

Cloudflare Pages detects the push and deploys automatically. Live in ~60 seconds.

- **GitHub repo:** `timothyamcenaney-ux/thelofttavern`
- **Branch:** `main`
- **Local path:** `/Users/timothymcenaney/Documents/The Loft/thelofttavern`
- **Cloudflare Pages** is the host (switched from Netlify to avoid credit costs)

---

## File Map

| File | Purpose |
|------|---------|
| `index.html` | Homepage — logo hero, 4 image/text panels, footer |
| `hours.html` | Hours page — hours grid, info cards, map, OG image |
| `food_menu.html` | Food menu — iMenuPro script embed |
| `drink_menu.html` | Drink menu — iMenuPro script embed |
| `style.css` | Shared stylesheet for all pages |
| `hours-status.js` | Dynamic open/closed status bar — loaded on every page |
| `_redirects` | Cloudflare redirect rules (`/food` → `food_menu.html`, etc.) |
| `head_foot_truth.html` | Reference template for nav + footer (not a live page) |
| `specials/index.html` | **Specials generator tool** — Firebase-powered, staff-facing |
| `salt/index.html` | Water softener salt level monitor — IoT sensor dashboard |
| `images/` | Site images including `oktoberfest-2026.png` (OG image for hours page) |

---

## Current Hours
Encoded in `hours-status.js` (`LOFT_HOURS` object) AND in the footer of every HTML page.
**Both places must be updated together when hours change.**

| Day | Hours |
|-----|-------|
| Mon – Wed | Closed |
| Thursday | 3 PM – 10 PM |
| Friday | 11:30 AM – 10 PM |
| Saturday | 11:30 AM – 10 PM |
| Sunday | 11:30 AM – 9 PM |

The status bar auto-shows open/closed, time until open, countdown, "closing in X min," etc.
It refreshes every 60 seconds via `setInterval`.

### Temporary closures
Add a date-gated override at the top of `getLoftStatus()` in `hours-status.js`:
```javascript
const reopenUTC = new Date('2026-MM-DDTHH:MM:00Z'); // reopen time in UTC
if (new Date() < reopenUTC) {
  return { open: false, label: 'Temporarily Closed', sub: closureCountdown(reopenUTC) };
}
```
Remove after reopening. The `closureCountdown()` function shows a live "Opens in X days, Y hr" ticker.

---

## External Services

### Cloudflare Pages
- Hosting provider. Tim's account. Auto-deploys on push to `main`.
- No login needed to deploy — git push handles it.

### GitHub
- Repo: `timothyamcenaney-ux/thelofttavern`
- Tim's account. Credentials stored locally via macOS git credential manager.

### Firebase (specials tool only)
- **Project:** `loftdb-15393`
- **Console:** https://console.firebase.google.com → project loftdb-15393
- **Services used:** Firestore + Anonymous Authentication
- **Config is embedded** in `specials/index.html` (the API key is intentionally public)
- **Firestore collections:** `specials_library` (menu items), `active_specials/current` (tonight's list)
- **Security rules:** deny-all default, allow authenticated reads/writes on those two collections
- **Free Spark tier** — no billing. Anonymous auth is enabled.

### iMenuPro
- Food menu embed: `<script id="1c2e-2j" src="https://imenupro.com/!1c2e-2j">` in `food_menu.html`
- Drink menu embed: `<script id="1c2e-1m" src="https://imenupro.com/!1c2e-1m">` in `drink_menu.html`
- Tim manages menus inside iMenuPro; the site just embeds them.

### Square
- Gift cards: external link to `https://app.squareup.com/gift/MLZ9HCJG33P9N/order`

### Chipply / Blanchette's
- Merch: external link in nav to `https://blanchettesportinggoods.chipply.com/lofttavern/`

---

## The Specials Tool (`/specials/`)
Staff-facing print tool for nightly specials cards. Not linked from the main nav.

- URL: `thelofttavern.com/specials/`
- Firebase-powered real-time sync — multiple devices see the same data instantly
- Anonymous auth (no login) — shared across devices via localStorage token
- Prints 4-up quarter-page cards on letter paper, designed for AirPrint from iPad
- **Primary device:** restaurant iPad at the wait station
- **Print tip for iPad:** Save to home screen (Share → Add to Home Screen) — opens as standalone app, prints without Safari URL headers/footers
- Has: menu library (Firestore), tonight's active list (max 5 items), announcement field, footer field, live preview
- `persistActive()` saves to Firestore on every change; `onSnapshot` syncs all connected devices

### iOS print quirks (already fixed)
- `beforeprint`/`afterprint` swap viewport to `width=816` so iOS scales 1:1 to paper
- `-webkit-text-size-adjust: 100%` prevents iOS from stretching line-height on bottom cards
- `apple-mobile-web-app-capable` meta enables home screen standalone mode

---

## Nav Structure (on every page)
Home · Food · Drinks · Hours · 👕 Merch · 🎁 Gift Cards

Each page sets `class="active"` on its own nav link. The nav and footer are copy-pasted across pages (not templated) — `head_foot_truth.html` is the reference copy.

---

## macOS / Environment Notes
- **Full Disk Access** must be granted to Terminal (or Claude Code) in System Settings → Privacy & Security → Full Disk Access. Without it, Bash tool file operations fail.
- If VS Code has files open from a previous session, run `git pull` before editing to avoid overwriting changes.
- `.DS_Store` is in `.gitignore` — ignore any commits that only touch it.

---

## OG / Social
- `hours.html` has a custom OG image: `images/oktoberfest-2026.png` (1672×941, fall season)
- Other pages use their hero images as OG images
- To force Facebook to refresh a cached preview: https://developers.facebook.com/tools/debug → paste URL → Scrape Again
- `fb:app_id` is missing but harmless — sharing works fine without it

---

## Things Tim Prefers
- Keep it simple — no unnecessary features, no build tools, no frameworks
- Single self-contained HTML files where possible
- Deploy by git push, not through dashboards
- The specials tool is mission-critical for the restaurant — cheap, fast, on-the-fly
- He uses VS Code and is comfortable with git basics (stage → commit → sync)
