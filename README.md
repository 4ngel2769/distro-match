# DistroMatch — The Definitive Linux Distribution Triangulator

An encyclopedic, precision Linux distribution picker and triangulation engine covering **116+ Linux distributions** across every architectural family, init system, package manager, and hardware setup. Built as a high-performance **Svelte** application.

---

## What's New in Version 2.0

1. **Migrated to Svelte & Vite**:
   - Replaced raw Go server with a modern reactive **Svelte 5** and **Vite** architecture.
   - Snappy state management, reactive filtering, and zero-runtime bloat.

2. **Revamped Triangulation & Real-Time Steering**:
   - Fixed flawed legacy matching that previously over-promoted niche distros like Calculate Linux.
   - **Distro Popularity & Tier Classification**:
     - **Flagships (Tier 1)**: Linux Mint, Ubuntu, Debian, Fedora, Arch, Pop!_OS, openSUSE, Zorin, EndeavourOS.
     - **Specialists (Tier 2)**: Bazzite, Nobara, CachyOS, SteamOS, Manjaro, KDE neon, NixOS, Void, Alpine, Tuxedo, Kali, Tails, Qubes, Proxmox, TrueNAS.
     - **Niche Systems (Tier 3)**: Calculate Linux, Gentoo, Slackware, Tiny Core, Devuan, Artix, Bedrock. Niche distros are now gated and will **never** be recommended to beginners or casual users unless explicitly unlocked.
   - **Interactive Real-Time Steering Dial**:
     - Adjust levers at any point (during questions, in intermissions, or on the final results page):
       - *Distro Scope*: Mainstream/Flagships vs Unrestricted (All).
       - *Family Bias*: Ubuntu, Debian, Arch, Fedora/RHEL, openSUSE, Independent.
       - *Gaming Boost*: Nobara, Bazzite, CachyOS, Pop!_OS.
       - *NVIDIA Prioritization*: Pre-configured proprietary drivers & turnkey ISOs.
       - *Packaging Stance*: Avoid Snaps, prefer Flatpak/native.

3. **Verified Local Logos & Screenshots**:
   - Every logo and screenshot is downloaded into `public/assets/` and matched to a specific distro before it ships — no hotlinks, no 429s, and no borrowing another distro's branding.
   - Logos come from Wikimedia Commons (SVG where possible); screenshots come from the distro's own DistroWatch page or Commons, with attribution shown on the profile.
   - Missing or unverifiable images fall back to a monogram tile / labelled placeholder instead of showing a wrong distro's logo.

4. **Clickable Distro Directory with Full Profiles**:
   - Every single distribution card in the Directory is now clickable and opens a real page at `/distro/<id>` (deep-linkable and back-button friendly).
   - Each profile shows a verified screenshot, DistroWatch rank, complete technical specs, hardware RAM requirements, pros & cons, related distros, and outbound download/wiki links.
   - Profiles with multiple verified screenshots (83 distros, 212 extra images) include a keyboard-accessible carousel with thumbnails and per-image credits.

5. **Enhanced Technical Comparison Tool**:
   - Two live searchable inputs with autocomplete dropdown suggestions (no more rigid dropdowns).
   - Sort suggestions by **DistroWatch Popularity**, **Distro Age**, **Last Update**, or **Alphabetical (A-Z)**.
   - Shareable comparison URLs in the form `/compare/<distro-id>+<distro-id>/`, with canonical redirects and duplicate handling.
   - Side-by-side comparison across 14 architectural and hardware dimensions.

6. **Refined Dark Mode & Smooth Transitions**:
   - Warm near-black surfaces with an orange → pink → blue gradient accent inspired by the Instagram logo, plus subtle pink traces.
   - Minimalist SVG Sun / Moon icon button with persisted theme preference.
   - Snappy thin top loading progress bar that animates across the viewport during page navigation.
   - Snappy, smooth fade transitions between views.

7. **Strict Utilitarian Minimalism**:
   - Maintained sharp corners (`border-radius: 0px`) throughout.
   - Gradient accents are limited to buttons, badges, the top loader, and navigation highlights; typography stays high-contrast and clean.

8. **GDPR Compliant & Zero Data Retention**:
   - 100% client-side in-browser execution.
   - Zero tracking cookies, zero analytics, zero server logs.
   - 1-click local browser storage purge button on the Privacy page.

---

## Development & Usage

### Prerequisites
- Node.js (v18+) or Bun

### Running Development Server
```bash
npm run dev
```
By default, Vite runs at `http://localhost:5173/`.

### Building for Production
```bash
npm run build
```
Builds the optimized production assets into `dist/`.

### Previewing Production Build
```bash
npm run preview
```

### Deep links / static hosting
The app uses the History API. Any host that serves `dist/index.html` for unknown
paths will work (`public/_redirects` covers Netlify and Cloudflare Pages; Vite's
preview server does this automatically). For a plain static host, configure an
SPA fallback to `index.html`.

### Routes
- `/` — welcome screen and quiz start.
- `/directory` — searchable directory of all distros.
- `/quiz` — the recommendation quiz.
- `/results` — quiz results and recommendation breakdown.
- `/distro/<id>` — full profile page (for example `/distro/linux-mint`).
- `/compare` — side-by-side comparison.
- `/compare/<a>+<b>/` — shareable comparison link (canonical form).
- Unknown paths — in-app 404 page.

### Refreshing the image library
```bash
node scripts/find-dw-slugs.mjs      # map distro ids to DistroWatch screenshot slugs
node scripts/verify-dw-slugs.mjs    # confirm each slug really is that distro
node scripts/discover-assets.mjs    # search Wikimedia Commons for logos/screenshots
node scripts/build-assets.mjs       # write scripts/asset-plan.json and review it
node scripts/build-assets.mjs --download
node scripts/build-facts.mjs        # refresh DistroWatch ranks, release dates, popularity years
node scripts/build-galleries.mjs    # refresh extra verified gallery screenshots
node scripts/validate-assets.mjs    # verify asset paths, credits, galleries, duplicates
```
Manual corrections live in `scripts/asset-overrides.json`. The download step
optimises images into `public/assets/` and regenerates `src/data/distroAssets.js`.
Missing or unverifiable images fall back to a monogram or a labelled placeholder
instead of borrowing another project's artwork.

### Trademarks and image credits
Distro names and logos are the trademarks of their respective projects and are
used here only to identify each distribution. Logos and screenshots are stored
locally with per-asset credits shown on each profile page. Sources include
Wikimedia Commons (under the licence named on the asset), DistroWatch, Simple
Icons (CC0), and official project websites/repositories. If you redistribute
this project, check the licence of each credited asset and remove any image whose
terms do not fit your use.
